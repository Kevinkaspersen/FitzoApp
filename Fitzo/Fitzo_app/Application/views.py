#views.py
import datetime
import posixpath
import requests
import logging
from .models import User, Meal
from pathlib import Path
from django.utils._os import safe_join
from django.views.static import serve as static_serve
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .serializers import *
from django.http import JsonResponse

logger = logging.getLogger('django')
mealtypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

# Function handling requests for static files in React
@permission_classes([AllowAny])
def serve_react(request, path, document_root=None):
    path = posixpath.normpath(path).lstrip("/")
    fullpath = Path(safe_join(document_root, path))
    if fullpath.is_file():
        return static_serve(request, path, document_root)
    else:
        return static_serve(request, "/index.html", document_root)

# Function to search for meals using the Edamam API
@api_view(['GET'])
@permission_classes([AllowAny])
def edamam_recipe_search(request):
    # URL for Edamam API endpoint for parsing
    url = "https://edamam-food-and-grocery-database.p.rapidapi.com/api/food-database/v2/parser"

    # API key and headers
    api_key = "d7e6d702e8msh680f583ad2e972ap1f801ajsn38877e18f5c5"
    headers = {
        "X-RapidAPI-Key": api_key,
        "X-RapidAPI-Host": "edamam-food-and-grocery-database.p.rapidapi.com"
    }

    # Get the search query and quantity from the request
    search_query = request.GET.get('ingredients', '')
    quantity = request.GET.get('quantity', 1) 

    # If there is a search query, include it in the API request
    if search_query:
        query_params = {
            "ingr": search_query,
            "quantity": quantity, 
            "imageSize": "LARGE",
            "random": "true",
            "beta": "true",
            "field[0]": "uri",
            "co2EmissionsClass": "A+"
        }

       # Make a GET request to the API and return the response
        response = requests.get(url, headers=headers, params=query_params)
        logger.info("API search is done")
        if response.status_code == 200:
                data = response.json()
                return JsonResponse(data)
        else:
            return JsonResponse({'error': response.text}, status=response.status_code)
    else:
        return JsonResponse({'error': 'No search query provided'}, status=400)

# Function to calculate the total calories for a user
@api_view(['GET'])
@permission_classes([AllowAny])
def get_total_calories(request):
    if request.user.is_authenticated:
        calories = calculate_calories(request.user)
        return Response({calories}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

# Function to retrieve all meals for a user
@api_view(['GET'])
def get_all_meals(request):
    logger.debug("entered get_all_meals")
    try:
        meals = Meal.objects.filter(user=request.user)

        if not meals.exists():
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = fetchAllfoodserializer(meals, many=True)

        total_calories = sum(meal.calories_eaten for meal in meals)
        logger.debug(f"total_calories:{total_calories}")
        goal = calculate_calories(request.user)
        data = {
            'meals': serializer.data,
            'goal': goal
        }
        logger.debug(data)

        return Response(data)
    except Exception as e:
        logger.warning(f"Exception raised in get_all_meals: {e}") 
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Function to get the total calories for a user  for a specific date
@api_view(['GET'])
def get_calories(request):
    current_date = request.GET.get('date')

    try:
        meals = Meal.objects.filter(user=request.user, date=current_date)
        serializer = fetchfoodserializer(meals, many=True)

        total_calories = sum(meal.calories_eaten for meal in meals) if meals.exists() else 0

        data = {
            'meals': serializer.data,
            'total_calories': total_calories
        }

        return Response(data)
    except Exception as e:
        logger.warning(f"Exception raised in get_calories: {e}") 
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Retrieves and returns the user's meal and meal type for a specific date
@api_view(['GET'])
def get_meal(request):
    meal_type = request.GET.get('meal_type') 
    current_date = request.GET.get('date')

    if not meal_type or meal_type not in mealtypes:
        return Response({"error": "meal_type parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        meals = Meal.objects.filter(user=request.user, date=current_date, meal_type=meal_type)

        if not meals.exists():
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = fetchfoodserializer(meals, many=True)

        total_calories = sum(meal.calories_eaten for meal in meals)
        logger.debug(f"total_calories:{total_calories}")
        data = {
            'meals': serializer.data,
            'total_calories': total_calories
        }

        return Response(data)
    except Exception as e:
        logger.warning(f"Exception raised in get_meal: {e}")  # This should give you an idea if something fails during serialization
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Function to create and add a meal to the user's meal list
@api_view(['POST'])
def create_meal(request):
    logger.debug("Entered create_meal")
    
    current_date = request.data.get('date')
    meal_type = request.data.get('meal_type')
    food = request.data.get('food')

    # Ensure that total_calories is properly validated
    try:
        total_calories = int(request.data.get('total_calories', -1))
        if total_calories == -1:
            return Response({"error": "Invalid total calories value"}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({"error": "Total calories must be a number"}, status=status.HTTP_400_BAD_REQUEST)
    
    request.data['total_calories'] = round(request.data['total_calories'])

    if not meal_type or meal_type not in mealtypes:
        return Response({"error": "meal_type parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure that grams is properly converted to an integer
    try:
        grams = int(request.data.get('grams', -1)) 
        if grams == -1:
            return Response({"error": "Invalid grams value"}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({"error": "Invalid grams value"}, status=status.HTTP_400_BAD_REQUEST)
    existing_meal = Meal.objects.filter(
        user=request.user,
        date=current_date,
        meal_type=meal_type,
        food=food
    ).first()
    if existing_meal:
        # Update existing meal by adding the new grams
        existing_meal.grams += grams
        existing_meal.save()
        return Response({"message": "Meal updated with additional grams"}, status=status.HTTP_200_OK)

    # If no existing meal, create a new one using the serializer
    serializer_context = {'request': request}
    serializer = MealSerializer(data=request.data, context=serializer_context)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Function to delete a meal from the user's meal list
@api_view(['DELETE'])
def delete_meal(request):
    meal_type = request.GET.get('meal_type')
    food_name = request.GET.get('food_name')
    current_date = request.GET.get('date')

    if not meal_type or meal_type not in mealtypes or not food_name:
        return Response({"error": "meal_type and food_name parameters are required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        meal = Meal.objects.filter(user=request.user, date=current_date, meal_type=meal_type, food=food_name).first()
        if not meal:
            return Response({"error": "Meal not found"}, status=status.HTTP_404_NOT_FOUND)
        
        meal.delete()
        return Response({"success": "Meal deleted"}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

# Function to update a meal in the user's meal list
@api_view(['PATCH'])
def update_meal(request):
    meal_type = request.GET.get('meal_type')
    food_name = request.GET.get('food_name')
    grams = request.GET.get('grams')
    current_date = request.GET.get('date')

    if not food_name:
        return Response({"error": " food_name parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure that total_calories is properly validated
    if not meal_type or meal_type not in mealtypes:
        return Response({"error": "meal_type parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Ensure that grams is properly converted to an integer
    try:
        grams = int(request.GET.get('grams', -1)) 
        if grams == -1:
            return Response({"error": "Invalid grams value"}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({"error": "Invalid grams value"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        meal = Meal.objects.filter(user=request.user, date=current_date, meal_type=meal_type, food=food_name).first()
        if not meal:
            return Response({"error": "Meal not found"}, status=status.HTTP_404_NOT_FOUND)

        # Use the serializer to update the meal
        serializer = MealSerializer(meal, data={'grams': grams}, partial=True) 
        if serializer.is_valid():
            serializer.save() 
            return Response({"success": "Meal updated"}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Function to get the water intake for a user
@api_view(['GET'])
def get_water_intake(request):
    current_date = request.GET.get('date')
    try:
        water_tracker = WaterTracker.objects.get(user=request.user, date=current_date)
    except WaterTracker.DoesNotExist:
        return Response({"error": "Water intake for the specified date not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = WaterTrackerSerializer(water_tracker)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Function to update the water intake for a user
@api_view(['POST'])
def update_water_tracker(request):
    current_date = request.data.get('date')
    user = request.user
    try:
        datetime.datetime.strptime(current_date, '%Y-%m-%d')
    except ValueError:
        return Response({"error": "Invalid date format. It must be in YYYY-MM-DD format."}, status=status.HTTP_400_BAD_REQUEST)
    # Ensure that string values is properly converted to an integer
    try:
        waterintake = int(request.data.get('total_water_intake', -1))
        if waterintake == -1:
            return Response({"error": "Invalid water value"}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({"error": "Invalid water value"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        water_tracker = WaterTracker.objects.get(user=user, date=current_date)
        water_tracker.total_water_intake = water_tracker.total_water_intake + int(request.data.get('total_water_intake'))

        # Ensure that the total water intake is not negative
        if water_tracker.total_water_intake <= 0:
            water_tracker.total_water_intake = 0

        water_tracker.save(update_fields=['total_water_intake'])
        serializer = WaterTrackerSerializer(water_tracker)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # If no entry exists for the specified date, create a new entry
    except WaterTracker.DoesNotExist:   
        serializer_context = {'request': request}
        request_data = {'total_water_intake': request.data.get('total_water_intake'), 'date': current_date, 'user': user.id}
        serializer = WaterTrackerSerializer(data=request_data, context=serializer_context)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# Function to get a user by username
@api_view(['GET'])
def read_user_name(request,username):
    user = get_user(username)
    if user == None:
        error_msg = {'error': 'User not found'}
        return Response(error_msg,status=status.HTTP_404_NOT_FOUND)
    serializer = AdminUserSerializer(user, many=False)
    return Response(serializer.data,status=status.HTTP_200_OK)

# Function to get a user by username
@api_view(['GET'])
def read_user(request):
    serializer = UserSerializer(request.user, many=False)
    return Response(serializer.data,status=status.HTTP_200_OK)

# Function to get all users
@api_view(['GET'])
def get_all_users(request):
    users = User.objects.all()
    serializer = AdminUserSerializer(users, many=True)
    return Response(serializer.data)

# Function to create a new user
@api_view(['POST'])
@permission_classes([AllowAny])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        password = request.data['password']
        try:
            # Validate the password before saving the user
            handle_password_creating(password)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        # Makes sure the password is hashed before saving
        user.set_password(password)
        user.save()
        return Response({"user": serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Function to update a user
@api_view(['PATCH', 'PUT'])
def update_user(request):
    user = request.user
    update_data = {key: value for key, value in request.data.items() if value != ""}
    serializer = UserSerializer(user, data=update_data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Function for admin to update a user
@api_view(['PATCH', 'PUT'])
def admin_edit_user(request, username):
    logger.debug("Entered admin_edit_user")
    user = get_user(username)
    if user == None:
        error_msg = {'error': 'User not found'}
        return Response(error_msg,status=status.HTTP_404_NOT_FOUND)
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Function for admin to delete a user
@api_view(['DELETE'])
def admin_delete_user(request, username):
    logger.debug("Entered admin_delete_user")
    user = get_user(username)
    if user == None:
        error_msg = {'error': 'User not found'}
        return Response(error_msg,status=status.HTTP_404_NOT_FOUND)
    if user.is_superuser:
        error_msg = {'error': 'Cannot delete admin user'}
        return Response(error_msg,status=status.HTTP_400_BAD_REQUEST)
    user.delete()
    message = f'Deleted user {username}'
    return Response(message,status=status.HTTP_200_OK)

# Function to delete a user
@api_view(['DELETE'])
def delete_user(request):
    user = request.user
    username = user.username
    if user == None:
        error_msg = {'error': 'User not found'}
        return Response(error_msg,status=status.HTTP_404_NOT_FOUND)
    delete_user(user)
    message = f'Deleted user {username}'
    return Response(message,status=status.HTTP_200_OK)

# Function to calculate the total calories for a user
def calculate_calories(user):
    user_weight = user.weight
    user_height = user.height
    user_age = user.age
    user_gender = user.gender
    needed_cals = 2000
    needed_cals = 2000

    if user_gender == 'Male':
        # Calculate BMR for males.
        needed_cals = 66 + (13.7 * user_weight) + (5 * user_height) - (6.8 * user_age)
    elif user_gender == 'Female':
        # Calculate BMR for females.
        needed_cals = 655 + (9.6 * user_weight) + (1.8 * user_height) - (4.7 * user_age)

    needed_cals = round(needed_cals)
    return needed_cals

# Helper function to get user by username
def get_user(username):
    try:
        return User.objects.get(username=username)
    except User.DoesNotExist:
        return None

# Function to login a user
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    if 'username' in request.data and 'password' in request.data:
        username = request.data['username']
        password = request.data['password']
    else:
        error_message = 'Username and password must be provided'
        return Response(error_message, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        message = {"message": f"User {username} successfully logged in!"}
        return Response(message, status=status.HTTP_200_OK)
    else:
        error_message = 'Invalid username or password'
        return Response(error_message, status=status.HTTP_401_UNAUTHORIZED)
  
# Function to logout a user
@api_view(['GET'])
def logout_view(request):
    logout(request)
    message = {"message":'User logged out'}
    return Response(message, status=status.HTTP_200_OK)

# Function to check if a user is logged in and if they are an admin
@api_view(['GET'])
@permission_classes([AllowAny])
def check_auth_view(request):
    logger.debug("Entered check_auth_view")
    # Check if the user is admin and authenticated
    isAdmin = request.user.is_superuser
    isloggedin = request.user.is_authenticated
    if isAdmin == True:
        logger.info(f"Admin user: {request.user.username} is authenticated")
    return Response({'isLoggedIn': isloggedin, "isAdmin": isAdmin}, status=status.HTTP_200_OK)

# Function to check if a user is logged in
@api_view(['GET'])
@permission_classes([AllowAny])
def check_if_logged_in(request):
    if request.user.is_authenticated:
        return Response({"isLoggedIn": "True"}, status=status.HTTP_200_OK)
    else:
        return Response({"isLoggedIn": "False"}, status=status.HTTP_200_OK)

# Function to handle password creation
def handle_password_creating(password):
    if len(password) < 14:
        raise ValueError('Password must be at least 14 characters long')
    if not any(char.isdigit() for char in password):
        raise ValueError('Password must contain at least one digit')
    if not any(char.isupper() for char in password):
        raise ValueError('Password must contain at least one uppercase letter') 
    if not any(char.islower() for char in password):
        raise ValueError('Password must contain at least one lowercase letter')

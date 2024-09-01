from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from Application.models import Meal
from django.utils.timezone import now
from Application.serializers import fetchAllfoodserializer

User = get_user_model()

class MealAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.client.force_authenticate(user=self.user)

        # Create some sample meals
        self.today = now().date()
        Meal.objects.create(user=self.user, date=self.today, meal_type='Breakfast', food='banana', total_calories=300)
        Meal.objects.create(user=self.user, date=self.today, meal_type='Breakfast', food='apple', total_calories=200)
        Meal.objects.create(user=self.user, date=self.today, meal_type='Lunch', food='sandwich', total_calories=400)
    
    def test_get_total_calories_successful(self):
            # Make a GET request to get total calories
            response = self.client.get('/get_total_calories/')
            
            # Check response status
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_all_meals_successful(self):
        # Make a GET request to get all meals
        response = self.client.get('/get-all-meals/')
        
        # Check response status
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Parse the response data
        response_data = response.json()
        
        # Serialize the meals manually to compare with response data
        meals = Meal.objects.filter(user=self.user)
        serializer = fetchAllfoodserializer(meals, many=True)
        
        # Check that the serialized data matches the response data
        self.assertEqual(response_data['meals'], serializer.data)

    def test_get_calories_successful(self):
        data = {'date': self.today.isoformat()}
        query_string = f"?date={data['date']}"
        response = self.client.get(f'/get_calories/{query_string}', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
            

            


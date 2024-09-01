# Application/tests/test_views.py
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from Application.models import Meal
from django.utils.timezone import now

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

    def test_get_meal_successful(self):
        # Make a GET request to fetch meals for today's date and 'Breakfast' meal type
        data = {
            'date': self.today.isoformat(),
            'meal_type': 'Breakfast',
        }
        response = self.client.get(f'/get-meal/',data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.json()
    
        # Extract meals from the response data
        meals = response_data.get('meals', [])
        
        # Check that 'banana' and 'apple' are in the response meals
        breakfast_foods = [meal['food'] for meal in meals]
        self.assertIn('banana', breakfast_foods)
        self.assertIn('apple', breakfast_foods)
        
        # Check that 'sandwich' is not in the response meals
        self.assertNotIn('sandwich', breakfast_foods)

    def test_add_meal_successful(self):
        # Make a POST request to add a new meal
        data = {
            'date': self.today.isoformat(),
            'meal_type': 'Dinner',
            'food': 'pasta',
            'total_calories': 600,
            'grams': 200
        }
        response = self.client.post('/add-meal/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Meal.objects.filter(user=self.user, meal_type='Dinner', food='pasta').count(), 1)

        # Check if the meal was correctly added
        meal = Meal.objects.get(user=self.user, meal_type='Dinner', food='pasta')
        self.assertEqual(meal.total_calories, 600)
        self.assertEqual(meal.grams, 200)
    
    def test_get_meal_unsuccessful(self):
        data = {
        'date': self.today.isoformat(),
        'meal_type': 'NotAMealType',
        }
        response = self.client.get(f'/get-meal/',data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


        data = {
        'date': 'NotRealDate',
        'meal_type': 'Breakfast',
        }
        response = self.client.get(f'/get-meal/',data, format='json')
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_post_meal_unsuccessful(self):
        data = {
            'date': self.today.isoformat(),
            'meal_type': 'NotAMEAL',
            'food': 'pasta',
            'total_calories': 600,
            'grams': 200
        }
        response = self.client.post('/add-meal/', data, format='json')

        #print("here")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = {
            'date': self.today.isoformat(),
            'meal_type': 'Breakfast',
            'food': 'pasta',
            'total_calories': 'textnotnumber',
            'grams': 200
        }
        response = self.client.post('/add-meal/', data, format='json')

        #print(response)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = {
            'date': self.today.isoformat(),
            'meal_type': 'Breakfast',
            'food': 'pasta',
            'total_calories': 600,
            'grams': 'NotANumber'
        }
        response = self.client.post('/add-meal/', data, format='json')

        #print(response)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_meal_successful(self):
            beforemeal = Meal.objects.get(user=self.user, meal_type='Breakfast', food='banana')
            data = {
                'meal_type': 'Breakfast',
                'food_name': 'banana',
                'grams': 150,
                'date': self.today.isoformat()
            }
            self.assertNotEqual(data['grams'], beforemeal.grams)
            query_string = f"?meal_type={data['meal_type']}&food_name={data['food_name']}&grams={data['grams']}&date={data['date']}"
            response = self.client.patch(f'/update-meal/{query_string}', format='json')

            # Check response status
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            meal = Meal.objects.get(user=self.user, meal_type='Breakfast', food='banana')
            self.assertEqual(meal.grams, data['grams'])

    def test_update_meal_unsuccessful(self):
            data = {
                'meal_type': 'Breakfast',
                'food_name': 'NotInTable',
                'grams': 150,
                'date': self.today.isoformat()
            }
            query_string = f"?meal_type={data['meal_type']}&food_name={data['food_name']}&grams={data['grams']}&date={data['date']}"
            response = self.client.patch(f'/update-meal/{query_string}', format='json')

            # Check response status
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
            data = {
                'meal_type': 'NotRealMeal',
                'food_name': 'banana',
                'grams': 150,
                'date': self.today.isoformat()
            }
            query_string = f"?meal_type={data['meal_type']}&food_name={data['food_name']}&grams={data['grams']}&date={data['date']}"
            response = self.client.patch(f'/update-meal/{query_string}', format='json')

            # Check response status
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            data = {
                'meal_type': 'Breakfast',
                'food_name': 'banana',
                'grams': 'Thisisnotnumber155',
                'date': self.today.isoformat()
            }
            query_string = f"?meal_type={data['meal_type']}&food_name={data['food_name']}&grams={data['grams']}&date={data['date']}"
            response = self.client.patch(f'/update-meal/{query_string}', format='json')

            # Check response status
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_meal_successful(self):
            
            data = {
                'meal_type': 'Breakfast',
                'food_name': 'banana',
                'date': self.today.isoformat()
            }
            query_string = f"?meal_type={data['meal_type']}&food_name={data['food_name']}&date={data['date']}"
            response = self.client.delete(f'/delete-meal/{query_string}', format='json')

            # Check response status
            self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
            # Check that the meal has been deleted
            meal_exists = Meal.objects.filter(user=self.user, meal_type='Breakfast', food='banana', date=self.today).exists()
            self.assertFalse(meal_exists, "Meal should be deleted from the database")
    
    def test_delete_meal_unsuccessful(self):
            data = {
                'meal_type': 'NotAMeal',
                'food_name': 'banana',
                'date': self.today.isoformat()
            }
            query_string = f"?meal_type={data['meal_type']}&food_name={data['food_name']}&date={data['date']}"
            response = self.client.delete(f'/delete-meal/{query_string}', format='json')

            # Check response status
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            data = {
                'meal_type': 'Breakfast',
                'food_name': 'notexsistintable',
                'date': self.today.isoformat()
            }
            query_string = f"?meal_type={data['meal_type']}&food_name={data['food_name']}&date={data['date']}"
            response = self.client.delete(f'/delete-meal/{query_string}', format='json')

            # Check response status
            self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
            

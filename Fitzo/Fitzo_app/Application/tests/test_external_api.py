# Application/tests/test_views.py
from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch, MagicMock
import json


class EdamamRecipeSearchTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('edamam_recipe_search')  # Make sure you have named your URL in urls.py

    @patch('requests.get')
    def test_mocked_edamam_recipe_search_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'hints': [{'food': {'label': 'Test Food Item'}}]}
        mock_get.return_value = mock_response

        response = self.client.get(self.url, {'ingredients': 'butter', 'quantity': 1})
        #print(response)

        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn('Test Food Item', [hint['food']['label'] for hint in response_data['hints']])
        #print("Successful api search, mocked values, these can then be stored")


    def test_edamam_recipe_search_success(self):
        # Making the test request with actual query parameters
        response = self.client.get(self.url, {'ingredients': 'butter', 'quantity': 1})

        # Checking if the API call was successful
        self.assertEqual(response.status_code, 200)

        # Parsing the JSON response
        response_data = response.json()
        formatted_json = json.dumps(response_data, indent=4, sort_keys=True)
        #print(formatted_json)

        # You might need to adjust this part based on the actual API response structure
        # This example assumes that the API response contains a 'hints' list
        self.assertTrue('hints' in response_data, "The response JSON should have a 'hints' key")
        #print("Successful call to external API with valid response")


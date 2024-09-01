from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from Application.models import WaterTracker
from django.utils.timezone import now

User = get_user_model()

class WaterTrackerAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.client.force_authenticate(user=self.user)

        # Create some sample water tracker entries
        self.today = now().date()
        WaterTracker.objects.create(user=self.user, date=self.today, total_water_intake=1500)
        self.total_intake_today = 1500

    def test_get_water_intake_successful(self):
        data = {'date': self.today.isoformat()}
        query_string = f"?date={data['date']}"
        response = self.client.get(f'/api/get_water_intake/{query_string}', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.json()
        self.assertEqual(response_data['total_water_intake'], self.total_intake_today)

    def test_update_water_tracker_successful(self):
        data = {
            'date': self.today.isoformat(),
            'total_water_intake': 500
        }
        response = self.client.post('/api/update_water/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        water = WaterTracker.objects.get(user=self.user, date=data['date'])
        self.assertEqual(water.total_water_intake, self.total_intake_today + 500)

    def test_update_water_tracker_unsuccessful(self):
        data = {
            'date': self.today.isoformat(),
            'total_water_intake': 'NotAnumber'
        }
        response = self.client.post('/api/update_water/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


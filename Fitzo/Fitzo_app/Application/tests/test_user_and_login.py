from django.test import TestCase, RequestFactory
from django.http import HttpResponse
from Application.views import *
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, force_authenticate
from django.contrib.auth import get_user_model
import json
User = get_user_model()
users= {"testuser": ("testuser","Pass1234@43210","testuser@mail.com","Test","User",180,80,30,"Male"),
        "testuser2": ("testuser2","Pass1234@43210","testuser2@mail.com","Test2","User2",170,60,25,"Female")}

class UserProfile:
    # Simple class to store user data
    def __init__(self,username,password,email,firstname,lastname,height,weight,age,gender):
        self.username = username
        self.password = password
        self.email = email
        self.first_name = firstname
        self.last_name = lastname
        self.height = height
        self.weight = weight
        self.age = age
        self.gender = gender
        # Add more attributes here and in create_user if needed
    
    def create_user(self):
        user_attributes = {
            'username': self.username,
            'password': self.password,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'height': self.height,
            'weight': self.weight,
            'age': self.age,
            'gender': self.gender
            # Add more attributes here if needed
        }
        return User.objects.create_user(**user_attributes)
    def create_credentials(self):
        # Return credentials for the user to use in the login function
        return {'username': self.username, 'password': self.password}
    
class ViewsTestCreateUser(TestCase):
    def setUp(self):
        self.testuser = UserProfile(*users["testuser"])
        self.userdata = self.testuser.__dict__

    def test_create_user_valid(self):
        # Test create_user function
        # Check response status code is 200 
        # Check response['user'] is same as userdata
        # Check User and id is in response
        request = RequestFactory().post('/create_user/',self.userdata, format='json')
        response = create_user(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK,f"failed to create user!, response.data: {response.data}")
        self.assertIn('user', response.data, "user not found in response.data")
        for attr in self.userdata:
            if attr == 'password':
                continue
            self.assertIn(attr, response.data['user'], f"{attr} not found in response.data")
            self.assertEqual(response.data['user'][attr], self.userdata[attr], f"response.date[{attr}] not equal to {self.userdata[attr]}")
        self.assertIn('id', response.data['user'], "id not found in response.data['user']")
    
    def test_create_user_missing_username(self):
        # Check response status code is 400 if missing username
        self.userdata.pop('username')
        request = RequestFactory().post('/create_user/',self.userdata, format='json')
        response = create_user(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_user_missing_password(self):
        # Check response status code is 400 if missing password
        self.userdata.pop('password')
        request = RequestFactory().post('/create_user/',self.userdata, format='json')
        response = create_user(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_user_missing_email(self):
        # Check response status code is 400 if missing email
        self.userdata.pop('email')
        request = RequestFactory().post('/create_user/',self.userdata, format='json')
        response = create_user(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_double_request(self):
        # Check response status code is 400 if user already exists
        request = RequestFactory().post('/create_user/',self.userdata, format='json')
        response = create_user(request)
        response = create_user(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST) 

    def test_create_user_user_allready_exists(self):
        # Check response status code is 400 if user already exists
        user = User.objects.create_user(username=self.testuser.username, password=self.testuser.password, email=self.testuser.email)
        request = RequestFactory().post('/create_user/',self.userdata, format='json')
        response = create_user(request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class ViewsTestReadUser(TestCase):
    def setUp(self):
        self.testuser = UserProfile(*users["testuser"])
        self.userdata = self.testuser.__dict__
        self.user = self.testuser.create_user()
    
    def test_read_user_valid_form(self):
        # Test read_user function
        # Check response status code is 200
        # Check response['user'] is same as userdata
        request = RequestFactory().get('/read_user/')
        request.user = self.user
        response = read_user(request)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('username', response.data, "user not found in response.data")
        for attr in self.userdata:
            if attr == 'password':
                continue
            self.assertIn(attr, response.data, f"{attr} not found in response.data")
            self.assertEqual(response.data[attr], self.userdata[attr], f"response.date[{attr}] not equal to {self.userdata[attr]}")
        self.assertIn('id', response.data, "id not found in response.data")


class TestAuthenticationViews(APITestCase):
    def setUp(self):
        self.testuser = UserProfile(*users["testuser"])
        self.credentials = self.testuser.create_credentials()
        self.user = self.testuser.create_user()
        self.client.login(username=self.testuser.username, password=self.testuser.password)
    
    def test_login_view(self):
        url = reverse('login')
        response = self.client.post(url, self.credentials)
        self.assertTrue(response.cookies.get('csrftoken'),f"csrftoken not found in response.cookies: {response.cookies}")
        self.assertTrue(response.cookies.get('sessionid'),f"sessionid not found in response.cookies: {response.cookies}")
        self.assertEqual(response.cookies, self.client.cookies,f"cookie not set response: {response.cookies}, client: {self.client.cookies}")
        self.assertEqual(response.status_code, status.HTTP_200_OK, f"Status code mismatch, response.data: {response.data}")

    def test_login_view_invalid_password(self):
        url = reverse('login')
        response = self.client.post(url, {'username': self.testuser.username, 'password': 'wrongpassword'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_view_invalid_username(self):
        url = reverse('login')
        data = {'username': 'wronguser', 'password': 'testpassword'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_logout_view(self):
        url = reverse('logout')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_logout_view_unauthenticated(self):
        self.client.logout()
        url = reverse('logout')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

# class TestViewsPermissions(TestCase):
#     #Test the permissions for the views in the application
#     def setUp(self):
#         self.url_info = {
#             'no_url_extension': {
#                 'get_all_users': {'Methode':'GET','Authentication':'IsAdminUser'},
#                 'get_current_user':{'Methode':'GET','Authentication':'IsAuthenticated'},
#                 'create_user':{'Methode':'POST','Authentication':'AllowAny'},
#                 'update_user':{'Methode':'PUT','Authentication':'IsAuthenticated'},
#                 'delete_user':{'Methode':'DELETE','Authentication':'IsAuthenticated'}
#             },
#             'url_extension': {
#                 'get_user':{'Methode':'GET','Authentication':'IsAdminUser'}
#             }
#         }
#         self.basic_user = User.objects.create_user(username='basicuser', password='@Basicpassword123', email='basic_user@mail.com', is_staff=False)
#         self.admin_user = User.objects.create_user(username='adminuser', password='@Adminpassword123', email= 'admin_user@mail.com', is_staff=True)
#         self.test_user = User.objects.create_user(username='testuser', password='@Testpassword123',email='test_user@mail.com') 
#         self.existing_user = {"username":"testuser", "password":"@Testpassword123", "email":"test_user@mail.com"}
#         self.new_user = {"username":"newuser", "password":"@Newpassword123", "email":"new_user@mail.com"}
#         self.update_user = {"password":"@Newpassword123", "email":"updated_email@mail.com"}

#     def tearDown(self):
#         users = User.objects.all()
#         users.delete()
    
#     def cycle_through_urls(self, user_authentication, user=None):
#         for url, info in self.url_info['no_url_extension'].items():
#             self.setup_request(url, info, user_authentication, None, user)
#         for url, info in self.url_info['url_extension'].items():
#             kwargs={'username':self.existing_user['username']}
#             self.setup_request(url, info, user_authentication, kwargs, user)

#     def setup_request(self,url, info, user_authentication,kwargs=None,user=None):
#         self.tearDown()
#         self.setUp()
#         if user:
#             self.client.force_login(User.objects.get(username=user['username']))
#         if info['Authentication'] in user_authentication:
#             status_code = status.HTTP_200_OK
#         else:
#             status_code = status.HTTP_403_FORBIDDEN
#         uri = reverse(url, kwargs=kwargs)
#         response = self.send_request(uri, info['Methode'])
#         self.assertEqual(response.status_code, status_code, f'response.data: {response.content}, function: {uri}, info: {info}, {User.objects.all()}')

#     def send_request(self, url, method):
#         if method == 'GET':
#             response = self.client.get(url)
#         elif method == 'POST':
#             response = self.client.post(url, json.dumps(self.new_user), content_type='application/json')
#         elif method == 'PUT':
#             response = self.client.put(url, json.dumps(self.update_user), content_type='application/json')
#         elif method == 'DELETE':
#             response = self.client.delete(url)
#         return response
    
#     def test_anonymous_user(self):
#         user_authentication = ['AllowAny']
#         self.cycle_through_urls(user_authentication)
    
#     def test_basic_user(self):
#         user_authentication = ['AllowAny', 'IsAuthenticated']
#         user = {'username':'basicuser', 'password':'basicpassword'}
#         self.cycle_through_urls(user_authentication, user)
    
#     def test_admin_user(self):
#         user_authentication = ['AllowAny', 'IsAuthenticated', 'IsAdminUser']
#         user = {'username':'adminuser', 'password':'adminpassword'}
#         self.cycle_through_urls(user_authentication, user)
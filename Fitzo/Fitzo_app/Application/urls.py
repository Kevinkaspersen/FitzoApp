"""
URL configuration for Fitzo project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from . import views

urlpatterns = [
    # User acount urls
    path('users/', views.get_all_users, name='get_all_users'),
    path('user/', views.read_user, name='get_current_user'),
    path('user/<str:username>/', views.read_user_name, name='get_user'),
    path('register/', views.create_user, name='create_user'),
    path('update_user/', views.update_user, name='update_user'),
    path('user/delete', views.delete_user, name='delete_user'),
    path('admin_edit_user/<str:username>/', views.admin_edit_user, name='admin_edit_user'),
    path('admin_delete_user/<str:username>/', views.admin_delete_user, name='admin_delete_user'),


    # Login, Logout and authentication status
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('check_auth/', views.check_auth_view, name='check_auth'),
    path('check_login/', views.check_if_logged_in, name='check_login'),

    # User information
    path('user_info/', views.read_user, name='get_user_info'),
    path('get_total_calories/', views.get_total_calories, name='get_total_calories'),
    path('get_calories/', views.get_calories, name='get_calories'),
    path('get_water_intake/', views.get_water_intake, name='get_water_intake'),
    path('update_water/', views.update_water_tracker, name='update_water'),
]
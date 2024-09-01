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
from django.contrib import admin
from Application import views
from django.urls import path, re_path, include
from django.conf import settings
from Application.views import serve_react
from Application.views import edamam_recipe_search

urlpatterns = [
    path('admin/', admin.site.urls),
    path('edamam-recipe-search/', edamam_recipe_search, name='edamam_recipe_search'),

    # Meal management URLs
    path('add-meal/', views.create_meal, name='create_meal'),  # Create a new meal
    path('get-meal/', views.get_meal, name='get_meal'),  # Retrieve a specific meal
    path('delete-meal/', views.delete_meal, name='delete_meal'),  # Delete a specific meal
    path('update-meal/', views.update_meal, name='update_meal'),
    path('get-all-meals/', views.get_all_meals, name='get_all_meals'),
    
    
    # re_path might cause problems for requests within the backend, had a problem in which the edmam_recipe_search could not be called because of the re_path
    path('api/', include('Application.urls')),
    re_path(r"^(?P<path>.*)$", serve_react, {"document_root": settings.FRONTEND}),
]


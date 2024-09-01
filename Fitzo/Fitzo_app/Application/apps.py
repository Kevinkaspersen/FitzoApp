from django.apps import AppConfig

'''
The apps module defines the configuration of the application.

'''

class ApplicationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Application'

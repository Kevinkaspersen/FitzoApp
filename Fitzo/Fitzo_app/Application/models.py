from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

'''
The models module defines the structure of the database tables and the relationships between them.

'''


# User model that defines the structure of the User table.
class User(AbstractUser):
    email = models.EmailField(max_length=254, unique=True)
    height = models.PositiveIntegerField(blank=True, null=True)
    weight = models.PositiveIntegerField(blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    gender = models.CharField(max_length=6, blank=True, null=True)
    
    groups = models.ManyToManyField(Group, related_name='custom_user_groups', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='custom_user_permissions', blank=True)  # Use unique related_name
    class Meta:
        db_table = 'UserTable'

    def __str__(self):
        return self.username

# Meal model that defines the structure of the Meal table.
class Meal(models.Model):
    user = models.ForeignKey(User, related_name='meals', on_delete=models.CASCADE)
    date = models.DateField()
    meal_type = models.CharField(max_length=50, help_text='Breakfast, Lunch, Dinner, etc.')
    food = models.CharField(max_length=50, help_text='butter,banana, apple, hamburger, etc.')
    total_calories = models.IntegerField(help_text="Total calories per 100 grams of the food")
    grams = models.IntegerField(default=0, help_text="Amount of food in grams")
    calories_eaten = models.IntegerField(help_text="Calories consumed based on grams", editable=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'MealTable'
        unique_together = ['user', 'date', 'meal_type', 'food']

    def save(self, *args, **kwargs):
        self.calories_eaten = (self.total_calories / 100) * self.grams
        super(Meal, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.meal_type} - {self.food} - {self.calories_eaten}"

# WaterTracker model that defines the structure of the WaterTracker table.
class WaterTracker(models.Model):
    user = models.ForeignKey(User, related_name='water_trackers', on_delete=models.CASCADE)
    date = models.DateField()
    total_water_intake = models.IntegerField(help_text="Total water intake in ml")
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'WaterTrackerTable'
        unique_together = ['user', 'date', 'total_water_intake']

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.total_water_intake}"
from rest_framework import serializers
from .models import *

'''
Serializers make it easy to convert complex data such as querysets and model instances to 
native Python data types that can then be easily rendered into JSON, XML or other content types. 

'''


# Seralizer for the user model that will be used to create and update users.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        # Return the following fields for the User model.
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'height', 'weight', 'age','gender']
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True}
        }

    # Validate and remove fields with empty strings
    def validate(self, data):
        return {key: value for key, value in data.items() if value != ""}
    
    # Update the user instance with the validated data
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

# Serilaizer that returns all fields for the User model.
class AdminUserSerializer(UserSerializer):
    #Return all fields for the User model.
    class Meta:
        model = User
        fields = '__all__'

# Serializer for the Meal model that will be used to create and update meals.        
class MealSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    # Return the following fields for the Meal model.
    class Meta:
        model = Meal
        fields = ['id', 'user', 'date', 'meal_type', 'food', 'total_calories', 'grams', 'calories_eaten', 'created', 'updated']

    # Create a new meal instance with the validated user data.
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        meal = Meal.objects.create(**validated_data)
        meal.save()
        return meal
    # Method to update the meal instances
    def update(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.meal_type = validated_data.get('meal_type', instance.meal_type)
        instance.food = validated_data.get('food', instance.food)
        instance.total_calories = validated_data.get('total_calories', instance.total_calories)
        instance.grams = validated_data.get('grams', instance.grams)
        instance.save()
        return instance

# Serilaizer that returns food, grams and calories_eaten fields for the Meal model.
class fetchfoodserializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = ('food', 'grams', 'calories_eaten')

# Serilaizer that returns food, date, calories_eaten and meal_type fields for the Meal model.
class fetchAllfoodserializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = ('food', 'date', 'calories_eaten', 'meal_type')
        
# Serializer for the WaterTracker model that will be used to create and update water intake.     
class WaterTrackerSerializer(serializers.ModelSerializer):
    # Return the following fields for the WaterTracker model.
    class Meta:
        model = WaterTracker
        fields = ['id', 'user', 'date', 'total_water_intake', 'created', 'updated']

    # Create a new water intake instance with the validated user data.
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
    
    # Method to update the water intake instances
    def update(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.total_water_intake = validated_data.get('total_water_intake', instance.total_water_intake)
        instance.save()
        return instance

# Serilaizer that returns total_water_intake field for the WaterTracker model.   
class fetchwaterserializer(serializers.ModelSerializer):
    class Meta:
        model = WaterTracker
        fields = ('total_water_intake',)
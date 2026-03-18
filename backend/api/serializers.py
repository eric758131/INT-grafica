from rest_framework import serializers
from .models import User, Tutor, Paciente

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'nombre', 'apellido_paterno', 'apellido_materno', 
                 'ci', 'email', 'fecha_nacimiento', 'direccion', 
                 'telefono', 'genero', 'estado']
        read_only_fields = ['id']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'nombre', 'apellido_paterno', 'apellido_materno',
                 'ci', 'email', 'fecha_nacimiento', 'direccion',
                 'telefono', 'genero', 'estado', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

class TutorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutor
        fields = '__all__'

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'
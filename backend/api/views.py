from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from .models import User, Tutor, Paciente
from .serializers import UserSerializer, UserCreateSerializer, TutorSerializer, PacienteSerializer

# ViewSet para Usuarios (CRUD completo)
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

# ViewSet para Tutores
class TutorViewSet(viewsets.ModelViewSet):
    queryset = Tutor.objects.all()
    serializer_class = TutorSerializer

# ViewSet para Pacientes
class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer

# Login personalizado
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(email=email, password=password)
    
    if user:
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data
        })
    else:
        return Response({
            'success': False,
            'message': 'Credenciales inválidas'
        }, status=status.HTTP_401_UNAUTHORIZED)
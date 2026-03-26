from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'tutores', views.TutorViewSet)
router.register(r'pacientes', views.PacienteViewSet)
router.register(r'camas', views.CamaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.login, name='login'),
]
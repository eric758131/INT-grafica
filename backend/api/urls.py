from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'tutores', views.TutorViewSet)
router.register(r'pacientes', views.PacienteViewSet)
router.register(r'camas', views.CamaViewSet)
router.register(r'oms-ref', views.OmsRefViewSet)
router.register(r'frisancho-ref', views.FrisanchoRefViewSet)
router.register(r'medidas', views.MedidaViewSet)
router.register(r'evaluaciones', views.EvaluacionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.login, name='login'),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'tutores', views.TutorViewSet)
router.register(r'pacientes', views.PacienteViewSet)
router.register(r'camas', views.CamaViewSet)
router.register(r'oms-ref', views.OmsRefViewSet)
router.register(r'frisancho-ref', views.FrisanchoRefViewSet)
router.register(r'medidas', views.MedidaViewSet, basename='medida')
router.register(r'evaluaciones', views.EvaluacionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.login, name='login'),
    path('medidas/calcular_preview/', views.MedidaViewSet.as_view({'post': 'calcular_preview'}), name='calcular_preview'),
    path('medidas/guardar_evaluacion/', views.MedidaViewSet.as_view({'post': 'guardar_evaluacion'}), name='guardar_evaluacion'),
]
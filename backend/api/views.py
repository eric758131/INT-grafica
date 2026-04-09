from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from datetime import datetime
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from .models import User, Tutor, Paciente
from .serializers import UserSerializer, UserCreateSerializer, TutorSerializer, PacienteSerializer
from .models import Medida, Evaluacion, Paciente, OmsRef, FrisanchoRef
from .serializers import MedidaSerializer, EvaluacionSerializer, EvaluacionDetalleSerializer

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
    queryset = Paciente.objects.select_related('tutor').all()  # ← Optimiza la consulta
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
    
from .models import Cama
from .serializers import CamaSerializer

class CamaViewSet(viewsets.ModelViewSet):
    queryset = Cama.objects.all()
    serializer_class = CamaSerializer

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import OmsRef, FrisanchoRef, Medida, Evaluacion, Paciente
from .serializers import (
    OmsRefSerializer, FrisanchoRefSerializer, 
    MedidaSerializer, EvaluacionSerializer, EvaluacionDetalleSerializer
)
from datetime import datetime

class OmsRefViewSet(viewsets.ModelViewSet):
    queryset = OmsRef.objects.all()
    serializer_class = OmsRefSerializer

class FrisanchoRefViewSet(viewsets.ModelViewSet):
    queryset = FrisanchoRef.objects.all()
    serializer_class = FrisanchoRefSerializer

class MedidaViewSet(viewsets.ModelViewSet):
    queryset = Medida.objects.all()
    serializer_class = MedidaSerializer
    
    @action(detail=False, methods=['POST'], url_path='calcular_preview')
    def calcular_preview(self, request):
        try:
            import json
            from datetime import datetime
            
            # Obtener datos
            paciente_id = request.data.get('paciente_id')
            fecha = request.data.get('fecha')
            peso_kg = float(request.data.get('peso_kg'))
            talla_cm = float(request.data.get('talla_cm'))
            pb_mm = float(request.data.get('pb_mm'))
            pct_mm = float(request.data.get('pct_mm'))
            
            # Obtener paciente
            paciente = Paciente.objects.get(id=paciente_id)
            
            # Calcular edad
            fecha_nac = paciente.fecha_nacimiento
            fecha_med = datetime.strptime(fecha, '%Y-%m-%d').date()
            edad_meses = (fecha_med.year - fecha_nac.year) * 12 + (fecha_med.month - fecha_nac.month)
            if fecha_med.day < fecha_nac.day:
                edad_meses -= 1
            edad_anios = edad_meses // 12
            
            # Calcular medidas derivadas
            talla_metros = talla_cm / 100
            imc = peso_kg / (talla_metros * talla_metros)
            cmb = pb_mm - (3.1416 * pct_mm)
            amb = ((cmb * cmb) / 12.57) - 100
            agb = ((pb_mm * pb_mm) / 12.57) - (amb + 100)
            
            # Buscar referencias
            oms_ref = OmsRef.objects.filter(genero=paciente.genero, edad_meses=edad_meses).first()
            frisancho_ref = FrisanchoRef.objects.filter(genero=paciente.genero, edad_anios=edad_anios).first()
            
            if not oms_ref:
                return Response({
                    'success': False,
                    'error': f'No se encontró referencia OMS para género {paciente.genero} y edad {edad_meses} meses'
                }, status=404)
            
            if not frisancho_ref:
                return Response({
                    'success': False,
                    'error': f'No se encontró referencia Frisancho para género {paciente.genero} y edad {edad_anios} años'
                }, status=404)
            
            # Función para calcular z-score
            def calcular_z(valor, mediana, mas_sd, menos_sd):
                if valor >= mediana:
                    return (valor - mediana) / (mas_sd - mediana)
                else:
                    return (valor - mediana) / (mediana - menos_sd)
            
            # Convertir a float
            imc_mediana = float(oms_ref.imc_mediana)
            imc_mas_sd = float(oms_ref.imc_mas_sd)
            imc_menos_sd = float(oms_ref.imc_menos_sd)
            
            talla_mediana = float(oms_ref.talla_mediana_cm)
            talla_mas_sd = float(oms_ref.talla_mas_sd_cm)
            talla_menos_sd = float(oms_ref.talla_menos_sd_cm)
            
            pb_dato = float(frisancho_ref.pb_dato)
            pb_mas_sd = float(frisancho_ref.pb_mas_sd)
            pb_menos_sd = float(frisancho_ref.pb_menos_sd)
            
            pct_dato = float(frisancho_ref.pct_dato)
            pct_mas_sd = float(frisancho_ref.pct_mas_sd)
            pct_menos_sd = float(frisancho_ref.pct_menos_sd)
            
            cmb_dato = float(frisancho_ref.cmb_dato)
            cmb_mas_sd = float(frisancho_ref.cmb_mas_sd)
            cmb_menos_sd = float(frisancho_ref.cmb_menos_sd)
            
            amb_dato = float(frisancho_ref.amb_dato)
            amb_mas_sd = float(frisancho_ref.amb_mas_sd)
            amb_menos_sd = float(frisancho_ref.amb_menos_sd)
            
            agb_dato = float(frisancho_ref.agb_dato)
            agb_mas_sd = float(frisancho_ref.agb_mas_sd)
            agb_menos_sd = float(frisancho_ref.agb_menos_sd)
            
            # Calcular z-scores
            z_imc = calcular_z(imc, imc_mediana, imc_mas_sd, imc_menos_sd)
            z_talla = calcular_z(talla_cm, talla_mediana, talla_mas_sd, talla_menos_sd)
            z_pb = calcular_z(pb_mm, pb_dato, pb_mas_sd, pb_menos_sd)
            z_pct = calcular_z(pct_mm, pct_dato, pct_mas_sd, pct_menos_sd)
            z_cmb = calcular_z(cmb, cmb_dato, cmb_mas_sd, cmb_menos_sd)
            z_amb = calcular_z(amb, amb_dato, amb_mas_sd, amb_menos_sd)
            z_agb = calcular_z(agb, agb_dato, agb_mas_sd, agb_menos_sd)
            
            peso_ideal = imc_mediana * (talla_metros * talla_metros)
            dif_peso = peso_kg - peso_ideal
            
            return Response({
                'success': True,
                'calculos': {
                    'edad_meses': edad_meses,
                    'edad_anios': edad_anios,
                    'imc': round(imc, 2),
                    'cmb_mm': round(cmb, 1),
                    'amb_mm2': round(amb, 1),
                    'agb_mm2': round(agb, 1),
                    'peso_ideal': round(peso_ideal, 2),
                    'dif_peso': round(dif_peso, 2),
                    'z_scores': {
                        'imc': round(z_imc, 3),
                        'talla': round(z_talla, 3),
                        'pb': round(z_pb, 3),
                        'pct': round(z_pct, 3),
                        'cmb': round(z_cmb, 3),
                        'amb': round(z_amb, 3),
                        'agb': round(z_agb, 3),
                    }
                }
            })
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)
    
    @action(detail=False, methods=['POST'], url_path='guardar_evaluacion')
    def guardar_evaluacion(self, request):
        try:
            import json
            from datetime import datetime
            
            # Obtener datos
            paciente_id = request.data.get('paciente_id')
            fecha = request.data.get('fecha')
            peso_kg = float(request.data.get('peso_kg'))
            talla_cm = float(request.data.get('talla_cm'))
            pb_mm = float(request.data.get('pb_mm'))
            pct_mm = float(request.data.get('pct_mm'))
            diagnosticos = request.data.get('diagnosticos', {})
            
            # Obtener paciente
            paciente = Paciente.objects.get(id=paciente_id)
            
            # Calcular edad
            fecha_nac = paciente.fecha_nacimiento
            fecha_med = datetime.strptime(fecha, '%Y-%m-%d').date()
            edad_meses = (fecha_med.year - fecha_nac.year) * 12 + (fecha_med.month - fecha_nac.month)
            if fecha_med.day < fecha_nac.day:
                edad_meses -= 1
            edad_anios = edad_meses // 12
            
            # Calcular medidas derivadas
            talla_metros = talla_cm / 100
            imc = peso_kg / (talla_metros * talla_metros)
            cmb = pb_mm - (3.1416 * pct_mm)
            amb = ((cmb * cmb) / 12.57) - 100
            agb = ((pb_mm * pb_mm) / 12.57) - (amb + 100)
            
            # Buscar referencias
            oms_ref = OmsRef.objects.filter(genero=paciente.genero, edad_meses=edad_meses).first()
            frisancho_ref = FrisanchoRef.objects.filter(genero=paciente.genero, edad_anios=edad_anios).first()
            
            if not oms_ref:
                return Response({
                    'success': False,
                    'error': f'No se encontró referencia OMS para género {paciente.genero} y edad {edad_meses} meses'
                }, status=404)
            
            if not frisancho_ref:
                return Response({
                    'success': False,
                    'error': f'No se encontró referencia Frisancho para género {paciente.genero} y edad {edad_anios} años'
                }, status=404)
            
            # Función para calcular z-score
            def calcular_z(valor, mediana, mas_sd, menos_sd):
                if valor >= mediana:
                    return (valor - mediana) / (mas_sd - mediana)
                else:
                    return (valor - mediana) / (mediana - menos_sd)
            
            # Convertir a float
            imc_mediana = float(oms_ref.imc_mediana)
            imc_mas_sd = float(oms_ref.imc_mas_sd)
            imc_menos_sd = float(oms_ref.imc_menos_sd)
            
            talla_mediana = float(oms_ref.talla_mediana_cm)
            talla_mas_sd = float(oms_ref.talla_mas_sd_cm)
            talla_menos_sd = float(oms_ref.talla_menos_sd_cm)
            
            pb_dato = float(frisancho_ref.pb_dato)
            pb_mas_sd = float(frisancho_ref.pb_mas_sd)
            pb_menos_sd = float(frisancho_ref.pb_menos_sd)
            
            pct_dato = float(frisancho_ref.pct_dato)
            pct_mas_sd = float(frisancho_ref.pct_mas_sd)
            pct_menos_sd = float(frisancho_ref.pct_menos_sd)
            
            cmb_dato = float(frisancho_ref.cmb_dato)
            cmb_mas_sd = float(frisancho_ref.cmb_mas_sd)
            cmb_menos_sd = float(frisancho_ref.cmb_menos_sd)
            
            amb_dato = float(frisancho_ref.amb_dato)
            amb_mas_sd = float(frisancho_ref.amb_mas_sd)
            amb_menos_sd = float(frisancho_ref.amb_menos_sd)
            
            agb_dato = float(frisancho_ref.agb_dato)
            agb_mas_sd = float(frisancho_ref.agb_mas_sd)
            agb_menos_sd = float(frisancho_ref.agb_menos_sd)
            
            # Calcular z-scores
            z_imc = calcular_z(imc, imc_mediana, imc_mas_sd, imc_menos_sd)
            z_talla = calcular_z(talla_cm, talla_mediana, talla_mas_sd, talla_menos_sd)
            z_pb = calcular_z(pb_mm, pb_dato, pb_mas_sd, pb_menos_sd)
            z_pct = calcular_z(pct_mm, pct_dato, pct_mas_sd, pct_menos_sd)
            z_cmb = calcular_z(cmb, cmb_dato, cmb_mas_sd, cmb_menos_sd)
            z_amb = calcular_z(amb, amb_dato, amb_mas_sd, amb_menos_sd)
            z_agb = calcular_z(agb, agb_dato, agb_mas_sd, agb_menos_sd)
            
            peso_ideal = imc_mediana * (talla_metros * talla_metros)
            dif_peso = peso_kg - peso_ideal
            
            # Crear la medida
            medida = Medida.objects.create(
                paciente_id=paciente_id,
                fecha=fecha,
                edad_meses=edad_meses,
                peso_kg=peso_kg,
                talla_cm=talla_cm,
                pb_mm=pb_mm,
                pct_mm=pct_mm,
                estado='Activo'
            )
            
            # Crear la evaluación
            evaluacion = Evaluacion.objects.create(
                medida_id=medida.id,
                oms_ref_id=oms_ref.id,
                frisancho_ref_id=frisancho_ref.id,
                imc=round(imc, 2),
                peso_ideal=round(peso_ideal, 2),
                dif_peso=round(dif_peso, 2),
                cmb_mm=round(cmb, 2),
                amb_mm2=round(amb, 2),
                agb_mm2=round(agb, 2),
                z_imc=round(z_imc, 3),
                z_talla=round(z_talla, 3),
                z_pb=round(z_pb, 3),
                z_pct=round(z_pct, 3),
                z_cmb=round(z_cmb, 3),
                z_amb=round(z_amb, 3),
                z_agb=round(z_agb, 3),
                dx_z_imc=diagnosticos.get('dx_z_imc', ''),
                dx_z_talla=diagnosticos.get('dx_z_talla', ''),
                dx_z_pb=diagnosticos.get('dx_z_pb', ''),
                dx_z_pct=diagnosticos.get('dx_z_pct', ''),
                dx_z_cmb=diagnosticos.get('dx_z_cmb', ''),
                dx_z_amb=diagnosticos.get('dx_z_amb', ''),
                dx_z_agb=diagnosticos.get('dx_z_agb', ''),
                registrado_por=request.user.id if request.user.is_authenticated else None
            )
            
            return Response({
                'success': True,
                'evaluacion_id': evaluacion.id,
                'message': 'Evaluación guardada exitosamente'
            })
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)


class EvaluacionViewSet(viewsets.ModelViewSet):
    queryset = Evaluacion.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EvaluacionDetalleSerializer
        return EvaluacionSerializer
    
    @action(detail=True, methods=['GET'])
    def calculos_detallados(self, request, pk=None):
        evaluacion = self.get_object()
        medida = evaluacion.medida
        
        talla_metros = medida.talla_cm / 100
        
        calculos = {
            'imc': {
                'peso_kg': float(medida.peso_kg),
                'talla_cm': float(medida.talla_cm),
                'talla_metros': talla_metros,
                'resultado': float(evaluacion.imc)
            },
            'cmb': {
                'pb_mm': float(medida.pb_mm),
                'pct_mm': float(medida.pct_mm),
                'resultado': float(evaluacion.cmb_mm)
            },
            'amb': {
                'cmb': float(evaluacion.cmb_mm),
                'resultado': float(evaluacion.amb_mm2)
            },
            'agb': {
                'pb_mm': float(medida.pb_mm),
                'amb': float(evaluacion.amb_mm2),
                'resultado': float(evaluacion.agb_mm2)
            },
            'z_imc': {
                'valor': float(evaluacion.imc),
                'mediana': float(evaluacion.oms_ref.imc_mediana),
                'mas_sd': float(evaluacion.oms_ref.imc_mas_sd),
                'menos_sd': float(evaluacion.oms_ref.imc_menos_sd),
                'resultado': float(evaluacion.z_imc)
            },
            'z_talla': {
                'valor': float(medida.talla_cm),
                'mediana': float(evaluacion.oms_ref.talla_mediana_cm),
                'mas_sd': float(evaluacion.oms_ref.talla_mas_sd_cm),
                'menos_sd': float(evaluacion.oms_ref.talla_menos_sd_cm),
                'resultado': float(evaluacion.z_talla)
            },
            'peso_ideal': {
                'imc_mediana': float(evaluacion.oms_ref.imc_mediana),
                'resultado': float(evaluacion.peso_ideal),
                'diferencia': float(evaluacion.dif_peso)
            }
        }
        
        # Z-scores Frisancho
        frisancho_data = {
            'z_pb': {'valor': float(medida.pb_mm), 'resultado': float(evaluacion.z_pb)},
            'z_pct': {'valor': float(medida.pct_mm), 'resultado': float(evaluacion.z_pct)},
            'z_cmb': {'valor': float(evaluacion.cmb_mm), 'resultado': float(evaluacion.z_cmb)},
            'z_amb': {'valor': float(evaluacion.amb_mm2), 'resultado': float(evaluacion.z_amb)},
            'z_agb': {'valor': float(evaluacion.agb_mm2), 'resultado': float(evaluacion.z_agb)}
        }
        
        for key, ref in frisancho_data.items():
            frisancho = evaluacion.frisancho_ref
            if key == 'z_pb':
                ref['mediana'] = float(frisancho.pb_dato)
                ref['mas_sd'] = float(frisancho.pb_mas_sd)
                ref['menos_sd'] = float(frisancho.pb_menos_sd)
            elif key == 'z_pct':
                ref['mediana'] = float(frisancho.pct_dato)
                ref['mas_sd'] = float(frisancho.pct_mas_sd)
                ref['menos_sd'] = float(frisancho.pct_menos_sd)
            elif key == 'z_cmb':
                ref['mediana'] = float(frisancho.cmb_dato)
                ref['mas_sd'] = float(frisancho.cmb_mas_sd)
                ref['menos_sd'] = float(frisancho.cmb_menos_sd)
            elif key == 'z_amb':
                ref['mediana'] = float(frisancho.amb_dato)
                ref['mas_sd'] = float(frisancho.amb_mas_sd)
                ref['menos_sd'] = float(frisancho.amb_menos_sd)
            elif key == 'z_agb':
                ref['mediana'] = float(frisancho.agb_dato)
                ref['mas_sd'] = float(frisancho.agb_mas_sd)
                ref['menos_sd'] = float(frisancho.agb_menos_sd)
            calculos[key] = ref
        
        return Response({'calculos': calculos})
from datetime import timezone

from rest_framework import serializers
from .models import User, Tutor, Paciente
from .models import Cama, Paciente
from .models import OmsRef, FrisanchoRef, Medida, Evaluacion, MoleculaCalorica, RequerimientoNutricional


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
        fields = ['id', 'nombre', 'apellido_paterno', 'apellido_materno',
                 'ci', 'telefono', 'direccion', 'parentesco', 'estado']

class PacienteSerializer(serializers.ModelSerializer):
    tutor = TutorSerializer(read_only=True)
    tutor_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Paciente
        fields = ['id', 'nombre', 'apellido_paterno', 'apellido_materno',
                 'ci', 'fecha_nacimiento', 'genero', 'estado', 
                 'tutor', 'tutor_id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Extraer tutor_id de los datos validados
        tutor_id = validated_data.pop('tutor_id', None)
        
        # Crear el paciente
        paciente = Paciente.objects.create(**validated_data)
        
        # Asignar el tutor si se proporcionó
        if tutor_id:
            try:
                tutor = Tutor.objects.get(id=tutor_id)
                paciente.tutor = tutor
                paciente.save()
            except Tutor.DoesNotExist:
                pass
        
        return paciente
    
    def update(self, instance, validated_data):
        tutor_id = validated_data.pop('tutor_id', None)
        
        # Actualizar campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Actualizar tutor si se proporcionó
        if tutor_id:
            try:
                tutor = Tutor.objects.get(id=tutor_id)
                instance.tutor = tutor
            except Tutor.DoesNotExist:
                pass
        
        instance.save()
        return instance

class PacienteSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = ['id', 'nombre', 'apellido_paterno', 'apellido_materno', 'ci']

class CamaSerializer(serializers.ModelSerializer):
    paciente_info = PacienteSimpleSerializer(source='paciente', read_only=True)
    
    class Meta:
        model = Cama
        fields = ['id', 'numero', 'ubicacion', 'estado_cama', 'estado', 'paciente', 'paciente_info', 'created_at', 'updated_at']

# ========== OMS REF ==========
class OmsRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = OmsRef
        fields = ['id', 'genero', 'edad_meses', 
                  'imc_menos_sd', 'imc_mediana', 'imc_mas_sd',
                  'talla_menos_sd_cm', 'talla_mediana_cm', 'talla_mas_sd_cm']

# ========== FRISANCHO REF ==========
class FrisanchoRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = FrisanchoRef
        fields = ['id', 'genero', 'edad_anios',
                  'pb_menos_sd', 'pb_dato', 'pb_mas_sd',
                  'pct_menos_sd', 'pct_dato', 'pct_mas_sd',
                  'cmb_menos_sd', 'cmb_dato', 'cmb_mas_sd',
                  'amb_menos_sd', 'amb_dato', 'amb_mas_sd',
                  'agb_menos_sd', 'agb_dato', 'agb_mas_sd']

# ========== MEDIDA ==========
class MedidaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='paciente.nombre', read_only=True)
    
    class Meta:
        model = Medida
        fields = ['id', 'paciente', 'paciente_nombre', 'fecha', 'edad_meses',
                  'peso_kg', 'talla_cm', 'pb_mm', 'pct_mm', 'estado']

# ========== EVALUACION ==========
class EvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluacion
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

# ========== EVALUACION CON DETALLES ==========
class EvaluacionDetalleSerializer(serializers.ModelSerializer):
    oms_ref = OmsRefSerializer(read_only=True)
    frisancho_ref = FrisanchoRefSerializer(read_only=True)
    medida = MedidaSerializer(read_only=True)
    registrado_por_nombre = serializers.CharField(source='registrado_por.nombre', read_only=True)
    
    class Meta:
        model = Evaluacion
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

# ==================== REQUERIMIENTO NUTRICIONAL ====================
class RequerimientoNutricionalSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='paciente.nombre', read_only=True)
    paciente_apellido = serializers.CharField(source='paciente.apellido_paterno', read_only=True)
    paciente_ci = serializers.CharField(source='paciente.ci', read_only=True)
    registrado_por_nombre = serializers.CharField(source='registrado_por.nombre', read_only=True)
    
    class Meta:
        model = RequerimientoNutricional
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'calculado_en']


class RequerimientoNutricionalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequerimientoNutricional
        fields = ['paciente', 'medida', 'peso_kg_at', 'talla_cm_at', 
                  'factor_actividad', 'factor_lesion', 'estado']
    
    def create(self, validated_data):
        # Calcular valores automáticamente
        peso = float(validated_data['peso_kg_at'])
        talla = float(validated_data['talla_cm_at'])
        factor_actividad = float(validated_data['factor_actividad'])
        factor_lesion = float(validated_data['factor_lesion'])
        
        geb = RequerimientoNutricional.calcular_geb(peso, talla)
        get = RequerimientoNutricional.calcular_get(geb, factor_actividad, factor_lesion)
        kcal_por_kg = RequerimientoNutricional.calcular_kcal_por_kg(get, peso)
        
        request = self.context.get('request')
        
        requerimiento = RequerimientoNutricional.objects.create(
            **validated_data,
            geb_kcal=round(geb, 2),
            get_kcal=round(get, 2),
            kcal_por_kg=round(kcal_por_kg, 2),
            registrado_por=request.user if request and request.user.is_authenticated else None
        )
        return requerimiento
    
    def update(self, instance, validated_data):
        # Actualizar campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Recalcular valores
        peso = float(instance.peso_kg_at)
        talla = float(instance.talla_cm_at)
        factor_actividad = float(instance.factor_actividad)
        factor_lesion = float(instance.factor_lesion)
        
        geb = RequerimientoNutricional.calcular_geb(peso, talla)
        get = RequerimientoNutricional.calcular_get(geb, factor_actividad, factor_lesion)
        kcal_por_kg = RequerimientoNutricional.calcular_kcal_por_kg(get, peso)
        
        instance.geb_kcal = round(geb, 2)
        instance.get_kcal = round(get, 2)
        instance.kcal_por_kg = round(kcal_por_kg, 2)
        instance.calculado_en = timezone.now()
        
        instance.save()
        return instance
    
# ==================== MOLÉCULA CALÓRICA ====================
class MoleculaCaloricaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(source='paciente.nombre', read_only=True)
    paciente_apellido = serializers.CharField(source='paciente.apellido_paterno', read_only=True)
    requerimiento_get = serializers.CharField(source='requerimiento.get_kcal', read_only=True)
    registrado_por_nombre = serializers.CharField(source='registrado_por.nombre', read_only=True)
    
    class Meta:
        model = MoleculaCalorica
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class MoleculaCaloricaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoleculaCalorica
        fields = ['paciente', 'medida', 'requerimiento', 'peso_kg', 'talla_cm', 
                  'kilocalorias_totales', 'proteinas_g_kg', 'porcentaje_grasas', 'estado']
    
    def create(self, validated_data):
        request = self.context.get('request')
        molecula = MoleculaCalorica.objects.create(
            **validated_data,
            registrado_por=request.user if request and request.user.is_authenticated else None
        )
        molecula.calcular_molecula_calorica(
            float(validated_data['proteinas_g_kg']),
            float(validated_data['porcentaje_grasas'])
        )
        molecula.save()
        return molecula
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.calcular_molecula_calorica(
            float(instance.proteinas_g_kg),
            float(instance.porcentaje_grasas)
        )
        instance.save()
        return instance
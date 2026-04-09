from rest_framework import serializers
from .models import User, Tutor, Paciente
from .models import Cama, Paciente
from .models import OmsRef, FrisanchoRef, Medida, Evaluacion

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
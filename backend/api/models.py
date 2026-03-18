from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, ci, nombre, apellido_paterno, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        if not ci:
            raise ValueError('El CI es obligatorio')
            
        email = self.normalize_email(email)
        user = self.model(
            email=email, 
            ci=ci,
            nombre=nombre,
            apellido_paterno=apellido_paterno,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, ci, nombre, apellido_paterno, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('estado', 'activo')
        
        return self.create_user(email, ci, nombre, apellido_paterno, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    # Campos básicos
    nombre = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100, blank=True, null=True)
    ci = models.CharField(max_length=20, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    genero = models.CharField(max_length=10, blank=True, null=True)
    
    # Estados
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='activo')
    
    # Campos de Django
    email_verified_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Para remember_token de Laravel
    remember_token = models.CharField(max_length=100, blank=True, null=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['ci', 'nombre', 'apellido_paterno']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        # IMPORTANTE: Esto evita conflictos con auth.User
        swappable = 'AUTH_USER_MODEL'
    
    def __str__(self):
        return f"{self.nombre} {self.apellido_paterno} - {self.email}"
    
    def get_full_name(self):
        return f"{self.nombre} {self.apellido_paterno} {self.apellido_materno or ''}".strip()
    
    def get_short_name(self):
        return self.nombre

# Tabla password_reset_tokens
class PasswordResetToken(models.Model):
    email = models.EmailField(primary_key=True, max_length=100)
    token = models.CharField(max_length=100)
    created_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = 'Token de recuperación'
        verbose_name_plural = 'Tokens de recuperación'
    
    def __str__(self):
        return f"Token para {self.email}"

# Tabla sessions
class Session(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, db_column='user_id')
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    data = models.TextField()  # payload en Laravel
    last_activity = models.IntegerField()
    
    class Meta:
        db_table = 'sessions'
        verbose_name = 'Sesión'
        verbose_name_plural = 'Sesiones'
    
    def __str__(self):
        return f"Sesión {self.session_key}"

# Tabla tutores
class Tutor(models.Model):
    nombre = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100, blank=True, null=True)
    ci = models.CharField(max_length=20, unique=True, db_column='CI')
    telefono = models.CharField(max_length=15, blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    parentesco = models.CharField(max_length=50)  # madre, padre, tutor legal, etc.
    
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='activo')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tutores'
        verbose_name = 'Tutor'
        verbose_name_plural = 'Tutores'
    
    def __str__(self):
        return f"{self.nombre} {self.apellido_paterno} - {self.parentesco}"

# Tabla pacientes
class Paciente(models.Model):
    nombre = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100)
    ci = models.CharField(max_length=20, unique=True)
    fecha_nacimiento = models.DateField()
    
    GENERO_CHOICES = [
        ('masculino', 'Masculino'),
        ('femenino', 'Femenino'),
    ]
    genero = models.CharField(max_length=10, choices=GENERO_CHOICES)
    
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='activo')
    
    # Relación con Tutor
    tutor = models.ForeignKey(
        Tutor, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='pacientes'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pacientes'
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
    
    def __str__(self):
        return f"{self.nombre} {self.apellido_paterno} - CI: {self.ci}"
from django.contrib import admin
from .models import User, Tutor, Paciente, PasswordResetToken, Session

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'nombre', 'apellido_paterno', 'ci', 'estado', 'is_staff')
    list_filter = ('estado', 'is_staff', 'is_active')
    search_fields = ('email', 'nombre', 'apellido_paterno', 'ci')
    ordering = ('email',)

@admin.register(Tutor)
class TutorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido_paterno', 'ci', 'parentesco', 'estado')
    list_filter = ('estado', 'parentesco')
    search_fields = ('nombre', 'apellido_paterno', 'ci')

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido_paterno', 'ci', 'genero', 'tutor', 'estado')
    list_filter = ('estado', 'genero')
    search_fields = ('nombre', 'apellido_paterno', 'ci')
    raw_id_fields = ('tutor',)

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('email', 'created_at')
    search_fields = ('email',)

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('session_key', 'user', 'last_activity')
    search_fields = ('session_key', 'user__email')
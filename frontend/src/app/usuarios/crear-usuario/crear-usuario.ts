import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './crear-usuario.html',
  styleUrls: ['./crear-usuario.css']
})
export class CrearUsuarioComponent {
  usuario = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    email: '',
    fecha_nacimiento: '',
    direccion: '',
    telefono: '',
    genero: '',
    estado: 'activo',
    password: '',
    password2: ''
  };

  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService  // Esto debe coincidir con el import
  ) {}

  guardarUsuario() {
    // Validación básica
    if (!this.usuario.nombre || !this.usuario.apellido_paterno || !this.usuario.ci || !this.usuario.email) {
      this.errorMessage = 'Los campos marcados con * son obligatorios';
      return;
    }

    // Validar contraseñas
    if (this.usuario.password !== this.usuario.password2) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    // Preparar datos para enviar (sin password2)
    const usuarioToSend = {
      nombre: this.usuario.nombre,
      apellido_paterno: this.usuario.apellido_paterno,
      apellido_materno: this.usuario.apellido_materno || '',
      ci: this.usuario.ci,
      email: this.usuario.email,
      fecha_nacimiento: this.usuario.fecha_nacimiento || null,
      direccion: this.usuario.direccion || '',
      telefono: this.usuario.telefono || '',
      genero: this.usuario.genero || '',
      estado: this.usuario.estado,
      password: this.usuario.password
    };

    this.usuarioService.createUsuario(usuarioToSend).subscribe({
      next: (response: any) => {  // Tipamos como any para evitar errores
        this.loading = false;
        this.successMessage = '✅ Usuario creado exitosamente';
        
        setTimeout(() => {
          this.router.navigate(['/usuarios']);
        }, 2000);
      },
      error: (error: any) => {  // Tipamos como any
        this.loading = false;
        console.error('Error:', error);
        
        if (error.error) {
          if (error.error.email) {
            this.errorMessage = `Email: ${error.error.email}`;
          } else if (error.error.ci) {
            this.errorMessage = `CI: ${error.error.ci}`;
          } else {
            this.errorMessage = 'Error al crear usuario';
          }
        } else {
          this.errorMessage = 'Error de conexión con el servidor';
        }
      }
    });
  }

  cancelar() {
    this.router.navigate(['/usuarios']);
  }
}
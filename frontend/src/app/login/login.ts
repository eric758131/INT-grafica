import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Ingrese email y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.usuarioService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Respuesta login:', response);
        
        if (response.success) {
          localStorage.setItem('usuario', JSON.stringify(response.user));
          console.log('Usuario guardado en localStorage');
          
          // Redirigir al dashboard
          this.router.navigate(['/dashboard']).then(() => {
            console.log('Redirigiendo a dashboard');
          }).catch(err => {
            console.error('Error al redirigir:', err);
          });
        } else {
          this.errorMessage = response.message || 'Credenciales inválidas';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error login:', error);
        if (error.status === 401) {
          this.errorMessage = 'Email o contraseña incorrectos';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. ¿El servidor está corriendo?';
        } else {
          this.errorMessage = 'Error al iniciar sesión';
        }
      }
    });
  }
}
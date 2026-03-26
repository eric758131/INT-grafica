import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  selector: 'app-modal-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-usuario.html',
  styleUrls: ['./modal-usuario.css']
})
export class ModalUsuarioComponent implements OnInit {
  @Input() usuarioEditar: Usuario | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() usuarioGuardado = new EventEmitter<void>();

  usuario = {
    id: null as number | null,
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    email: '',
    fecha_nacimiento: '',
    direccion: '',
    telefono: '',
    genero: '',
    estado: 'activo',  // Siempre activo por defecto
    password: '',
    password2: ''
  };

  editando = false;
  loading = false;

  // Validaciones
  ciValid: boolean = false;
  ciInvalid: boolean = false;
  emailValid: boolean = false;
  emailInvalid: boolean = false;
  telefonoValid: boolean = false;
  telefonoInvalid: boolean = false;
  passwordValid: boolean = false;
  passwordInvalid: boolean = false;
  passwordMatch: boolean = false;
  hasMinLength: boolean = false;
  hasUpperCase: boolean = false;
  hasNumber: boolean = false;
  
  // Validación de fecha
  fechaNacimientoValid: boolean = false;
  fechaNacimientoInvalid: boolean = false;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    if (this.usuarioEditar) {
      this.editando = true;
      this.usuario = {
        id: this.usuarioEditar.id || null,
        nombre: this.usuarioEditar.nombre,
        apellido_paterno: this.usuarioEditar.apellido_paterno,
        apellido_materno: this.usuarioEditar.apellido_materno || '',
        ci: this.usuarioEditar.ci,
        email: this.usuarioEditar.email,
        fecha_nacimiento: this.usuarioEditar.fecha_nacimiento || '',
        direccion: this.usuarioEditar.direccion || '',
        telefono: this.usuarioEditar.telefono || '',
        genero: this.usuarioEditar.genero || '',
        estado: 'activo',  // Siempre activo
        password: '',
        password2: ''
      };
    }
  }

  // Validación de fecha de nacimiento (no puede ser futura)
  validarFechaNacimiento(): void {
    if (!this.usuario.fecha_nacimiento) {
      this.fechaNacimientoValid = false;
      this.fechaNacimientoInvalid = false;
      return;
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaNac = new Date(this.usuario.fecha_nacimiento);
    const isValid = fechaNac <= hoy;
    this.fechaNacimientoValid = isValid;
    this.fechaNacimientoInvalid = !isValid;
  }

  validarCI(): void {
    const ciRegex = /^\d{7,15}$/;
    const isValid = ciRegex.test(this.usuario.ci);
    this.ciValid = isValid;
    this.ciInvalid = !isValid && this.usuario.ci.length > 0;
  }

  validarEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(this.usuario.email);
    this.emailValid = isValid;
    this.emailInvalid = !isValid && this.usuario.email.length > 0;
  }

  validarTelefono(): void {
    if (!this.usuario.telefono) {
      this.telefonoValid = false;
      this.telefonoInvalid = false;
      return;
    }
    const telRegex = /^\d{7,15}$/;
    const isValid = telRegex.test(this.usuario.telefono);
    this.telefonoValid = isValid;
    this.telefonoInvalid = !isValid;
  }

  validarPassword(): void {
    const pass = this.usuario.password;
    this.hasMinLength = pass.length >= 8;
    this.hasUpperCase = /[A-Z]/.test(pass);
    this.hasNumber = /\d/.test(pass);
    this.passwordValid = this.hasMinLength && this.hasUpperCase && this.hasNumber;
    this.passwordInvalid = !this.passwordValid && pass.length > 0;
    this.validarConfirmacion();
  }

  validarConfirmacion(): void {
    this.passwordMatch = this.usuario.password === this.usuario.password2;
  }

  formularioValido(): boolean {
    const camposBasicos = !!(this.usuario.nombre && this.usuario.apellido_paterno && this.usuario.ci && this.usuario.email);
    const ciValido = this.ciValid || !this.usuario.ci;
    const emailValido = this.emailValid || !this.usuario.email;
    
    // Validación de fecha (si tiene fecha, debe ser válida)
    let fechaValida = true;
    if (this.usuario.fecha_nacimiento) {
      fechaValida = this.fechaNacimientoValid;
    }
    
    if (this.editando) {
      return camposBasicos && ciValido && emailValido && fechaValida;
    }
    return camposBasicos && ciValido && emailValido && fechaValida && this.passwordValid && this.passwordMatch;
  }

  guardar(): void {
    if (!this.formularioValido()) return;

    this.loading = true;
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
      estado: 'activo'  // Siempre activo
    };

    if (!this.editando) {
      (usuarioToSend as any).password = this.usuario.password;
      this.usuarioService.createUsuario(usuarioToSend).subscribe({
        next: () => {
          this.loading = false;
          this.usuarioGuardado.emit();
          this.cerrar();
        },
        error: (err) => {
          this.loading = false;
          alert('Error al crear usuario');
          console.error(err);
        }
      });
    } else {
      this.loading = false;
      alert('Edición pendiente de implementar');
      this.cerrar();
    }
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
}
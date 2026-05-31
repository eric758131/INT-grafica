import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService, Paciente, Tutor } from '../../services/usuario.service';

@Component({
  selector: 'app-modal-paciente',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-paciente.html',
  styleUrls: ['./modal-paciente.css']
})
export class ModalPacienteComponent implements OnInit {
  @Input() pacienteEditar: Paciente | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() pacienteGuardado = new EventEmitter<void>();

  tabActivo: 'paciente' | 'tutor' = 'paciente';

  // Datos del paciente
  paciente = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    fecha_nacimiento: '',
    genero: '',
    estado: 'activo'
  };

  // Datos del tutor
  tutor = {
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    telefono: '',
    direccion: '',
    parentesco: '',
    estado: 'activo'
  };

  editando = false;
  loading = false;

  // Validaciones Paciente
  ciPacienteValid = false;
  ciPacienteInvalid = false;
  fechaPacienteValid = false;
  fechaPacienteInvalid = false;

  // Validaciones Tutor
  ciTutorValid = false;
  ciTutorInvalid = false;
  telefonoTutorValid = false;
  telefonoTutorInvalid = false;

  constructor(private service: UsuarioService) {}

  ngOnInit() {
    if (this.pacienteEditar) {
      this.editando = true;
      this.paciente = {
        nombre: this.pacienteEditar.nombre,
        apellido_paterno: this.pacienteEditar.apellido_paterno,
        apellido_materno: this.pacienteEditar.apellido_materno,
        ci: this.pacienteEditar.ci,
        fecha_nacimiento: this.pacienteEditar.fecha_nacimiento,
        genero: this.pacienteEditar.genero,
        estado: this.pacienteEditar.estado
      };
      if (this.pacienteEditar.tutor) {
        this.tutor = {
          nombre: this.pacienteEditar.tutor.nombre || '',
          apellido_paterno: this.pacienteEditar.tutor.apellido_paterno || '',
          apellido_materno: this.pacienteEditar.tutor.apellido_materno || '',
          ci: this.pacienteEditar.tutor.ci || '',
          telefono: this.pacienteEditar.tutor.telefono || '',
          direccion: this.pacienteEditar.tutor.direccion || '',
          parentesco: this.pacienteEditar.tutor.parentesco || '',
          estado: 'activo'
        };
      }
    }
  }

  // Validaciones Paciente
  validarCIPaciente(): void {
    const ciRegex = /^\d{7,15}$/;
    const isValid = ciRegex.test(this.paciente.ci);
    this.ciPacienteValid = isValid;
    this.ciPacienteInvalid = !isValid && this.paciente.ci.length > 0;
  }

  validarFechaNacimientoPaciente(): void {
    if (!this.paciente.fecha_nacimiento) {
      this.fechaPacienteValid = false;
      this.fechaPacienteInvalid = false;
      return;
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaNac = new Date(this.paciente.fecha_nacimiento);
    const isValid = fechaNac <= hoy;
    this.fechaPacienteValid = isValid;
    this.fechaPacienteInvalid = !isValid;
  }

  // Validaciones Tutor
  validarCITutor(): void {
    const ciRegex = /^\d{7,15}$/;
    const isValid = ciRegex.test(this.tutor.ci);
    this.ciTutorValid = isValid;
    this.ciTutorInvalid = !isValid && this.tutor.ci.length > 0;
  }

  validarTelefonoTutor(): void {
    if (!this.tutor.telefono) {
      this.telefonoTutorValid = false;
      this.telefonoTutorInvalid = false;
      return;
    }
    const telRegex = /^\d{7,15}$/;
    const isValid = telRegex.test(this.tutor.telefono);
    this.telefonoTutorValid = isValid;
    this.telefonoTutorInvalid = !isValid;
  }

  formularioValido(): boolean {
    // Validar paciente
    const pacienteValido = !!(
      this.paciente.nombre &&
      this.paciente.apellido_paterno &&
      this.paciente.apellido_materno &&
      this.paciente.ci &&
      this.paciente.fecha_nacimiento &&
      this.paciente.genero &&
      this.ciPacienteValid &&
      this.fechaPacienteValid
    );

    // Validar tutor
    const tutorValido = !!(
      this.tutor.nombre &&
      this.tutor.apellido_paterno &&
      this.tutor.ci &&
      this.tutor.parentesco &&
      this.ciTutorValid
    );

    return pacienteValido && tutorValido;
  }

  guardar(): void {
  if (!this.formularioValido()) return;

  this.loading = true;

  const tutorData = {
    nombre: this.tutor.nombre,
    apellido_paterno: this.tutor.apellido_paterno,
    apellido_materno: this.tutor.apellido_materno || '',
    ci: this.tutor.ci,
    telefono: this.tutor.telefono || '',
    direccion: this.tutor.direccion || '',
    parentesco: this.tutor.parentesco,
    estado: 'activo'
  };

  console.log('📤 Creando tutor:', tutorData);

  this.service.createTutor(tutorData).subscribe({
    next: (tutorCreado) => {
      console.log('✅ Tutor creado con ID:', tutorCreado.id);
      console.log('✅ Datos completos del tutor:', tutorCreado); // Ver todo el objeto

      // IMPORTANTE: Esperar un momento para asegurar que el tutor se guardó
      setTimeout(() => {
        const pacienteData = {
          nombre: this.paciente.nombre,
          apellido_paterno: this.paciente.apellido_paterno,
          apellido_materno: this.paciente.apellido_materno,
          ci: this.paciente.ci,
          fecha_nacimiento: this.paciente.fecha_nacimiento,
          genero: this.paciente.genero,
          estado: 'activo',
          tutor_id: tutorCreado.id  // ← Asegurar que esto NO es null
        };

        console.log('📤 Creando paciente con tutor_id:', pacienteData.tutor_id);
        console.log('📤 Datos completos del paciente:', pacienteData);

        this.service.createPaciente(pacienteData).subscribe({
          next: (pacienteCreado) => {
            console.log('✅ Paciente creado:', pacienteCreado);
            this.loading = false;
            this.pacienteGuardado.emit();
            this.cerrar();
          },
          error: (err) => {
            this.loading = false;
            console.error('❌ Error al crear paciente:', err);
            alert('Error al crear paciente: ' + JSON.stringify(err.error));
          }
        });
      }, 500); // Pequeño delay para asegurar
    },
    error: (err) => {
      this.loading = false;
      console.error('❌ Error al crear tutor:', err);
      alert('Error al crear tutor: ' + JSON.stringify(err.error));
    }
  });
}

  cerrar(): void {
    this.cerrarModal.emit();
  }
}
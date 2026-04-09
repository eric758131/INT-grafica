import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService, Paciente } from '../../services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulario-evaluacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-evaluacion.html',
  styleUrls: ['./formulario-evaluacion.css']
})
export class FormularioEvaluacionComponent implements OnInit {
  paciente: Paciente | null = null;
  calculando = false;
  
  medicion = {
    fecha: new Date().toISOString().split('T')[0],
    peso_kg: null as number | null,
    talla_cm: null as number | null,
    pb_mm: null as number | null,
    pct_mm: null as number | null
  };
  
  resultados: any = null;
  
  diagnosticos = {
    dx_z_imc: '',
    dx_z_talla: '',
    dx_z_pb: '',
    dx_z_pct: '',
    dx_z_cmb: '',
    dx_z_amb: '',
    dx_z_agb: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: UsuarioService
  ) {}

  ngOnInit() {
    const pacienteId = Number(this.route.snapshot.paramMap.get('pacienteId'));
    if (pacienteId) {
      this.cargarPaciente(pacienteId);
    } else {
      Swal.fire('Error', 'No se especificó paciente', 'error').then(() => {
        this.router.navigate(['/evaluacion']);
      });
    }
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    return edad;
  }

  cargarPaciente(id: number) {
    this.service.getPacientes().subscribe({
      next: (pacientes) => {
        this.paciente = pacientes.find(p => p.id === id) || null;
        if (!this.paciente) {
          Swal.fire('Error', 'Paciente no encontrado', 'error').then(() => {
            this.router.navigate(['/evaluacion']);
          });
        }
      },
      error: () => {
        Swal.fire('Error', 'Error al cargar paciente', 'error');
      }
    });
  }

  diagnosticosCompletos(): boolean {
    return !!(this.diagnosticos.dx_z_imc && this.diagnosticos.dx_z_talla && 
              this.diagnosticos.dx_z_pb && this.diagnosticos.dx_z_pct && 
              this.diagnosticos.dx_z_cmb && this.diagnosticos.dx_z_amb && 
              this.diagnosticos.dx_z_agb);
  }

  calcular() {
    if (!this.medicion.fecha || !this.medicion.peso_kg || !this.medicion.talla_cm || 
        !this.medicion.pb_mm || !this.medicion.pct_mm) {
      Swal.fire('Campos incompletos', 'Complete todos los campos de medición', 'warning');
      return;
    }

    this.calculando = true;

    const data = {
      paciente_id: this.paciente!.id,
      fecha: this.medicion.fecha,
      peso_kg: Number(this.medicion.peso_kg),
      talla_cm: Number(this.medicion.talla_cm),
      pb_mm: Number(this.medicion.pb_mm),
      pct_mm: Number(this.medicion.pct_mm)
    };

    this.service.calcularPreview(data).subscribe({
      next: (response: any) => {
        this.calculando = false;
        if (response && response.success) {
          this.resultados = response.calculos;
          // Scroll automático a los resultados
          setTimeout(() => {
            document.getElementById('resultadosSection')?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 100);
          Swal.fire({
            title: '¡Cálculo completado!',
            text: 'Los resultados se han calculado correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          Swal.fire('Error', response?.error || 'Error al calcular', 'error');
        }
      },
      error: (error) => {
        this.calculando = false;
        Swal.fire('Error', 'Error de conexión con el servidor', 'error');
      }
    });
  }

  guardarEvaluacion() {
    if (!this.resultados) {
      Swal.fire('Error', 'Primero calcule la evaluación', 'warning');
      return;
    }

    if (!this.diagnosticosCompletos()) {
      Swal.fire('Diagnósticos incompletos', 'Complete todos los diagnósticos', 'warning');
      return;
    }

    const data = {
      paciente_id: this.paciente!.id,
      fecha: this.medicion.fecha,
      peso_kg: this.medicion.peso_kg,
      talla_cm: this.medicion.talla_cm,
      pb_mm: this.medicion.pb_mm,
      pct_mm: this.medicion.pct_mm,
      diagnosticos: this.diagnosticos
    };

    this.service.guardarEvaluacion(data).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          Swal.fire({
            title: '¡Evaluación guardada!',
            text: 'La evaluación nutricional se ha guardado exitosamente',
            icon: 'success',
            confirmButtonColor: '#3085d6'
          }).then(() => {
            this.router.navigate(['/evaluacion']);
          });
        } else {
          Swal.fire('Error', response?.error || 'Error al guardar', 'error');
        }
      },
      error: () => {
        Swal.fire('Error', 'Error de conexión con el servidor', 'error');
      }
    });
  }

  volver() {
    this.router.navigate(['/evaluacion']);
  }
}
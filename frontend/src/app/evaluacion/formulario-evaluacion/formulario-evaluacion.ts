import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService, Paciente } from '../../services/usuario.service';

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
  guardando = false;
  
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
    private service: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const pacienteId = Number(this.route.snapshot.paramMap.get('pacienteId'));
    if (pacienteId) {
      this.cargarPaciente(pacienteId);
    } else {
      this.mostrarError('No se especificó paciente', '/dashboard/evaluacion');
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
      next: (pacientes: Paciente[]) => {
        this.paciente = pacientes.find(p => p.id === id) || null;
        this.cdr.detectChanges();
        if (!this.paciente) {
          this.mostrarError('Paciente no encontrado', '/dashboard/evaluacion');
        }
      },
      error: () => {
        this.mostrarError('Error al cargar paciente', '/dashboard/evaluacion');
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
      this.mostrarToast('Complete todos los campos de medición', 'warning');
      return;
    }

    this.calculando = true;
    this.cdr.detectChanges();

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
        this.cdr.detectChanges();
        
        if (response && response.success) {
          this.resultados = response.calculos;
          this.cdr.detectChanges();
          
          setTimeout(() => {
            document.getElementById('resultadosSection')?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 100);
        } else {
          this.mostrarToast(response?.error || 'Error al calcular', 'error');
        }
      },
      error: () => {
        this.calculando = false;
        this.cdr.detectChanges();
        this.mostrarToast('Error de conexión con el servidor', 'error');
      }
    });
  }

  guardarEvaluacion() {
    if (!this.resultados) {
      this.mostrarToast('Primero calcule la evaluación', 'warning');
      return;
    }

    if (!this.diagnosticosCompletos()) {
      this.mostrarToast('Complete todos los diagnósticos', 'warning');
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

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
        this.guardando = false;
        this.cdr.detectChanges();
        
        if (response && response.success) {
          this.mostrarToast('Evaluación guardada exitosamente', 'success');
          setTimeout(() => {
            this.router.navigate(['/dashboard/evaluacion']);
          }, 1500);
        } else {
          this.mostrarToast(response?.error || 'Error al guardar', 'error');
        }
      },
      error: () => {
        this.guardando = false;
        this.cdr.detectChanges();
        this.mostrarToast('Error de conexión con el servidor', 'error');
      }
    });
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    // Implementar toast o usar SweetAlert2
    const colores = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500'
    };
    
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${colores[tipo]} animate-slide-in-right`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  mostrarError(mensaje: string, ruta: string) {
    // Usar SweetAlert2 o similar
    console.error(mensaje);
    this.router.navigate([ruta]);
  }

  volver() {
    this.router.navigate(['/dashboard/evaluacion']);
  }
}
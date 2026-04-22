import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Paciente } from '../../services/usuario.service';

@Component({
  selector: 'app-modal-requerimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-requerimiento.html',
  styleUrls: ['./modal-requerimiento.css']
})
export class ModalRequerimientoComponent implements OnInit {
  @Input() paciente: Paciente | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() requerimientoGuardado = new EventEmitter<void>();

  datos = {
    peso_kg_at: null as number | null,
    talla_cm_at: null as number | null,
    factor_actividad: null as number | null,
    factor_lesion: null as number | null
  };

  ultimaMedida: any = null;
  previewResults = {
    geb_kcal: 0,
    get_kcal: 0,
    kcal_por_kg: 0
  };
  calculando = false;

  constructor(
    private service: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.paciente) {
      this.cargarUltimaMedida();
    }
  }

  cargarUltimaMedida() {
    this.service.getUltimaMedida(this.paciente!.id!).subscribe({
      next: (response) => {
        if (response.success && response.medida) {
          this.ultimaMedida = response.medida;
          // Precargar valores automáticamente
          this.datos.peso_kg_at = response.medida.peso_kg;
          this.datos.talla_cm_at = response.medida.talla_cm;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al cargar última medida:', err);
        this.ultimaMedida = null;
      }
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    return edad > 0 ? edad : 0;
  }

  actualizarPeso(event: any) {
    if (!this.ultimaMedida) {
      this.datos.peso_kg_at = parseFloat(event.target.value);
      this.calcularPreview();
    }
  }

  actualizarTalla(event: any) {
    if (!this.ultimaMedida) {
      this.datos.talla_cm_at = parseFloat(event.target.value);
      this.calcularPreview();
    }
  }

  calcularPreview() {
    if (this.datos.peso_kg_at && this.datos.talla_cm_at && 
        this.datos.factor_actividad && this.datos.factor_lesion) {
      
      this.service.calcularPreviewRequerimiento({
        peso_kg_at: this.datos.peso_kg_at,
        talla_cm_at: this.datos.talla_cm_at,
        factor_actividad: this.datos.factor_actividad,
        factor_lesion: this.datos.factor_lesion
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.previewResults = response.calculos;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error en preview:', err);
        }
      });
    }
  }

  formularioValido(): boolean {
    return !!(this.datos.peso_kg_at && this.datos.talla_cm_at && 
              this.datos.factor_actividad && this.datos.factor_lesion);
  }

  guardar() {
    if (!this.formularioValido()) {
      alert('⚠️ Complete todos los campos');
      return;
    }

    this.calculando = true;

    const data = {
      paciente: this.paciente!.id,
      peso_kg_at: this.datos.peso_kg_at,
      talla_cm_at: this.datos.talla_cm_at,
      factor_actividad: this.datos.factor_actividad,
      factor_lesion: this.datos.factor_lesion,
      estado: 'activo'
    };

    this.service.createRequerimiento(data).subscribe({
      next: () => {
        this.calculando = false;
        alert('✅ Requerimiento nutricional calculado exitosamente');
        this.requerimientoGuardado.emit();
        this.cerrar();
      },
      error: (err) => {
        this.calculando = false;
        console.error('Error al guardar:', err);
        alert('❌ Error al guardar el requerimiento');
      }
    });
  }

  cerrar() {
    this.cerrarModal.emit();
  }
}
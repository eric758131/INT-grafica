import { Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Paciente } from '../../services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-molecula',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-molecula.html',
  styleUrls: ['./modal-molecula.css']
})
export class ModalMoleculaComponent implements OnInit {
  @Input() paciente: Paciente | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() moleculaGuardado = new EventEmitter<void>();

  ultimaMedida: any = null;
  requerimientoActivo: any = null;
  
  proteinas_g_kg = 1.2;
  porcentaje_grasas = 25;
  
  kcalTotales = 0;
  kcalProteinas = 0;
  kcalGrasas = 0;
  kcalCarbohidratos = 0;
  
  proteinasGramos = 0;
  grasasGramos = 0;
  carbohidratosGramos = 0;
  
  porcentajeProteinas = 0;
  porcentajeGrasasCalc = 0;
  porcentajeCarbohidratos = 0;

  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';
  toastTimeout: any;
  
  calculando = false;

  constructor(
    private service: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.paciente) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    // Cargar última medida
    this.service.getUltimaMedida(this.paciente!.id!).subscribe({
      next: (response) => {
        if (response.success) {
          this.ultimaMedida = response.medida;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al cargar última medida:', err);
      }
    });

    // Cargar requerimiento activo
    this.service.getDatosRequerimientoActivo(this.paciente!.id!).subscribe({
      next: (response) => {
        if (response.success) {
          this.requerimientoActivo = response;
          this.kcalTotales = response.kilocalorias_totales;
          this.calcular();
          this.cdr.detectChanges();
        } else {
          Swal.fire({
            title: 'Sin requerimiento',
            text: 'El paciente no tiene un requerimiento nutricional activo',
            icon: 'warning',
            confirmButtonColor: '#9333ea'
          }).then(() => {
            this.cerrar();
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar requerimiento activo:', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo obtener el requerimiento activo',
          icon: 'error',
          confirmButtonColor: '#9333ea'
        }).then(() => {
          this.cerrar();
        });
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

  calcular() {
    const peso = this.ultimaMedida?.peso_kg || 0;
    const kcalTotales = this.kcalTotales;
    const proteinasGkg = this.proteinas_g_kg;
    const porcentajeGrasasDecimal = this.porcentaje_grasas / 100;

    if (peso > 0 && kcalTotales > 0) {
      this.proteinasGramos = proteinasGkg * peso;
      this.kcalProteinas = this.proteinasGramos * 4;
      this.porcentajeProteinas = (this.kcalProteinas / kcalTotales) * 100;
      
      this.kcalGrasas = kcalTotales * porcentajeGrasasDecimal;
      this.grasasGramos = this.kcalGrasas / 9;
      this.porcentajeGrasasCalc = porcentajeGrasasDecimal * 100;
      
      this.porcentajeCarbohidratos = Math.max(0, 100 - (this.porcentajeProteinas + this.porcentajeGrasasCalc));
      this.kcalCarbohidratos = (this.porcentajeCarbohidratos / 100) * kcalTotales;
      this.carbohidratosGramos = this.kcalCarbohidratos / 4;
      
      this.cdr.detectChanges();
    }
  }

  formularioValido(): boolean {
    return this.proteinas_g_kg > 0 && this.porcentaje_grasas > 0 && this.kcalTotales > 0;
  }

  mostrarToastMessage(mensaje: string, tipo: 'success' | 'error' = 'success') {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;
    
    this.toastTimeout = setTimeout(() => {
      this.mostrarToast = false;
    }, 2500);
  }

  guardar() {
    if (!this.formularioValido()) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Complete todos los campos',
        icon: 'warning',
        confirmButtonColor: '#9333ea',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.calculando = true;

    const data = {
      paciente: this.paciente!.id,
      medida_id: this.ultimaMedida?.id || null,
      requerimiento_id: this.requerimientoActivo?.requerimiento_id,
      peso_kg: this.ultimaMedida?.peso_kg,
      talla_cm: this.ultimaMedida?.talla_cm,
      kilocalorias_totales: this.kcalTotales,
      proteinas_g_kg: this.proteinas_g_kg,
      porcentaje_grasas: this.porcentaje_grasas / 100,
      estado: 'activo'
    };

    this.service.createMolecula(data).subscribe({
      next: () => {
        this.calculando = false;
        Swal.fire({
          title: '¡Guardado!',
          text: 'Molécula calórica calculada exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.moleculaGuardado.emit();
        setTimeout(() => this.cerrar(), 1500);
      },
      error: (err) => {
        this.calculando = false;
        console.error('Error al guardar:', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo guardar la molécula calórica',
          icon: 'error',
          confirmButtonColor: '#9333ea'
        });
      }
    });
  }

  cerrar() {
    this.cerrarModal.emit();
  }
}
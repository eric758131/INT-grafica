import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalAsignarPacienteComponent } from '../../modal-asignar-paciente/modal-asignar-paciente';
import { ModalGrafica3dComponent } from '../../modal-grafica-3d/modal-grafica-3d';

// Interfaces
export interface Paciente {
  id?: number;
  ci: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
}

export interface Cama {
  id?: number;
  numero: string;
  ubicacion: string;
  estado_cama: 'disponible' | 'ocupada' | 'mantenimiento' | 'reservada';
  paciente_info?: Paciente | null;
}

import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-seleccion-camas',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalAsignarPacienteComponent, ModalGrafica3dComponent],
  templateUrl: './seleccion-camas.html',
  styleUrls: ['./seleccion-camas.css']
})
export class SeleccionCamasComponent implements OnInit {
  @ViewChild('modalGrafica') modalGrafica!: ModalGrafica3dComponent;
  
  camas: Cama[] = [];
  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  searchTermPaciente: string = '';
  loading = true;
  asignando = false;
  mensajeToast: { texto: string; tipo: 'success' | 'error' } | null = null;
  
  mostrarModalAsignacion = false;
  mostrarModalGrafica = false;
  camaParaAsignar: Cama | null = null;
  
  filtroEstado: string = 'todos';
  filtroUbicacion: string = '';
  ubicaciones: string[] = [];

  constructor(
    private service: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    
    this.service.getCamas().subscribe({
      next: (camas: Cama[]) => {
        this.camas = [...camas];
        this.ubicaciones = [...new Set(camas.map((c: Cama) => c.ubicacion))];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar camas:', err);
        this.mostrarToast('Error al cargar las camas', 'error');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    
    this.service.getPacientes().subscribe({
      next: (pacientes: Paciente[]) => {
        this.pacientes = [...pacientes];
        this.pacientesFiltrados = [...pacientes];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar pacientes:', err);
        this.mostrarToast('Error al cargar pacientes', 'error');
      }
    });
  }

  get camasFiltradas(): Cama[] {
    return this.camas.filter(cama => {
      if (this.filtroEstado !== 'todos' && cama.estado_cama !== this.filtroEstado) return false;
      if (this.filtroUbicacion && cama.ubicacion !== this.filtroUbicacion) return false;
      return true;
    });
  }

  filtrarPacientes() {
    if (!this.searchTermPaciente.trim()) {
      this.pacientesFiltrados = this.pacientes;
      return;
    }
    const term = this.searchTermPaciente.toLowerCase();
    this.pacientesFiltrados = this.pacientes.filter(p => 
      p.nombre.toLowerCase().includes(term) ||
      p.apellido_paterno.toLowerCase().includes(term) ||
      p.ci.includes(term)
    );
  }

  getIconoPorEstado(estado: string): string {
    switch(estado) {
      case 'disponible': return '🟢';
      case 'ocupada': return '🔴';
      case 'mantenimiento': return '🟡';
      case 'reservada': return '🔵';
      default: return '⚪';
    }
  }

  getTextoEstado(estado: string): string {
    switch(estado) {
      case 'disponible': return 'Disponible';
      case 'ocupada': return 'Ocupada';
      case 'mantenimiento': return 'Mantenimiento';
      case 'reservada': return 'Reservada';
      default: return estado;
    }
  }

  abrirModalAsignacion(cama: Cama) {
    if (cama.estado_cama === 'disponible') {
      this.camaParaAsignar = cama;
      this.mostrarModalAsignacion = true;
    }
  }

  cerrarModalAsignacion() {
    this.mostrarModalAsignacion = false;
    this.camaParaAsignar = null;
    this.searchTermPaciente = '';
    this.pacientesFiltrados = this.pacientes;
  }

  abrirModalGrafica() {
    this.mostrarModalGrafica = true;
    setTimeout(() => {
      if (this.modalGrafica) {
        this.modalGrafica.abrir();
      }
    }, 100);
  }

  cerrarModalGrafica() {
    this.mostrarModalGrafica = false;
  }

  asignarPaciente(paciente: Paciente) {
    if (this.camaParaAsignar && this.camaParaAsignar.id && paciente.id) {
      this.asignando = true;
      
      this.service.asignarPacienteACama(this.camaParaAsignar.id, paciente.id).subscribe({
        next: () => {
          this.mostrarToast(`✅ Paciente ${paciente.nombre} asignado a cama ${this.camaParaAsignar!.numero}`, 'success');
          this.cerrarModalAsignacion();
          this.cargarDatos();
          this.asignando = false;
        },
        error: (err: any) => {
          console.error(err);
          this.mostrarToast('Error al asignar paciente', 'error');
          this.asignando = false;
        }
      });
    }
  }

  liberarCama(cama: Cama) {
    if (cama.id && cama.paciente_info) {
      this.asignando = true;
      
      this.service.liberarCama(cama.id).subscribe({
        next: () => {
          this.mostrarToast(`✅ Cama ${cama.numero} liberada`, 'success');
          this.cargarDatos();
          this.asignando = false;
        },
        error: (err: any) => {
          console.error(err);
          this.mostrarToast('Error al liberar la cama', 'error');
          this.asignando = false;
        }
      });
    }
  }

  activarCama(cama: Cama) {
    if (cama.id && cama.estado_cama === 'mantenimiento') {
      this.asignando = true;
      
      this.service.activarCama(cama.id).subscribe({
        next: () => {
          this.mostrarToast(`✅ Cama ${cama.numero} activada y disponible`, 'success');
          this.cargarDatos();
          this.asignando = false;
        },
        error: (err: any) => {
          console.error(err);
          this.mostrarToast('Error al activar la cama', 'error');
          this.asignando = false;
        }
      });
    }
  }

  mostrarToast(texto: string, tipo: 'success' | 'error') {
    this.mensajeToast = { texto, tipo };
    setTimeout(() => {
      this.mensajeToast = null;
      this.cdr.detectChanges();
    }, 3000);
  }
}
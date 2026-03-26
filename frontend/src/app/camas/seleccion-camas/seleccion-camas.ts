import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Cama, Paciente } from '../../services/usuario.service';

@Component({
  selector: 'app-seleccion-camas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seleccion-camas.html',
  styleUrls: ['./seleccion-camas.css']
})
export class SeleccionCamasComponent implements OnInit {
  camas: Cama[] = [];
  pacientes: Paciente[] = [];
  loading = true;
  mostrarModalPacientes = false;
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
      next: (camas) => {
        this.camas = [...camas]; // Crear nuevo array
        this.ubicaciones = [...new Set(camas.map(c => c.ubicacion))];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar camas:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    
    this.service.getPacientes().subscribe({
      next: (pacientes) => {
        this.pacientes = [...pacientes];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar pacientes:', err)
    });
  }

  get camasFiltradas(): Cama[] {
    return this.camas.filter(cama => {
      if (this.filtroEstado !== 'todos' && cama.estado_cama !== this.filtroEstado) return false;
      if (this.filtroUbicacion && cama.ubicacion !== this.filtroUbicacion) return false;
      return true;
    });
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
      this.mostrarModalPacientes = true;
    } else if (cama.estado_cama === 'ocupada') {
      alert(`Cama ${cama.numero} está ocupada por ${cama.paciente_info?.nombre} ${cama.paciente_info?.apellido_paterno}`);
    } else {
      alert(`Cama ${cama.numero} no disponible (${this.getTextoEstado(cama.estado_cama)})`);
    }
  }

  asignarPaciente(paciente: Paciente) {
    if (this.camaParaAsignar && this.camaParaAsignar.id) {
      this.service.asignarPacienteACama(this.camaParaAsignar.id, paciente.id!).subscribe({
        next: () => {
          alert(`✅ Paciente ${paciente.nombre} ${paciente.apellido_paterno} asignado a cama ${this.camaParaAsignar!.numero}`);
          this.mostrarModalPacientes = false;
          this.camaParaAsignar = null;
          this.cargarDatos(); // Recargar inmediatamente
        },
        error: (err) => {
          console.error(err);
          alert('Error al asignar');
        }
      });
    }
  }

  liberarCama(cama: Cama) {
    if (cama.id && cama.paciente_info) {
      if (confirm(`¿Liberar cama ${cama.numero} ocupada por ${cama.paciente_info.nombre}?`)) {
        this.service.liberarCama(cama.id).subscribe({
          next: () => {
            alert(`✅ Cama ${cama.numero} liberada`);
            this.cargarDatos(); // Recargar inmediatamente
          },
          error: (err) => {
            console.error(err);
            alert('Error al liberar');
          }
        });
      }
    }
  }
}
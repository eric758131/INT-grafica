import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-modal-asignar-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-asignar-paciente.html',
  styleUrls: ['./modal-asignar-paciente.css']
})
export class ModalAsignarPacienteComponent implements OnInit, OnDestroy {
  @Input() cama!: Cama;
  @Input() pacientes: Paciente[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() asignar = new EventEmitter<Paciente>();
  
  searchTerm: string = '';
  pacientesFiltrados: Paciente[] = [];

  ngOnInit() {
    this.pacientesFiltrados = this.pacientes;
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    // Cerrar con tecla ESC
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.cerrarModal();
    };
    document.addEventListener('keydown', handleEsc);
    (this as any)._handleEsc = handleEsc;
  }

  ngOnDestroy() {
    // Restaurar scroll del body
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    
    if ((this as any)._handleEsc) {
      document.removeEventListener('keydown', (this as any)._handleEsc);
    }
  }

  filtrarPacientes() {
    if (!this.searchTerm.trim()) {
      this.pacientesFiltrados = this.pacientes;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.pacientesFiltrados = this.pacientes.filter(p => 
      p.nombre.toLowerCase().includes(term) ||
      p.apellido_paterno.toLowerCase().includes(term) ||
      p.ci.includes(term)
    );
  }

  asignarPaciente(paciente: Paciente) {
    this.asignar.emit(paciente);
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }
}
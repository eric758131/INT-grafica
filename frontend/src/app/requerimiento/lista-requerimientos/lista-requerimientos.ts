import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Paciente, RequerimientoNutricional } from '../../services/usuario.service';
import { ModalRequerimientoComponent } from '../modal-requerimiento/modal-requerimiento';

export interface PacienteConEdad extends Paciente {
  edad: number;
}

@Component({
  selector: 'app-lista-requerimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalRequerimientoComponent],
  templateUrl: './lista-requerimientos.html',
  styleUrls: ['./lista-requerimientos.css']
})
export class ListaRequerimientosComponent implements OnInit {
  pacientes: PacienteConEdad[] = [];
  requerimientos: RequerimientoNutricional[] = [];
  pacienteSeleccionado: PacienteConEdad | null = null;
  loading = true;
  searchTerm = '';
  mostrarModal = false;

  constructor(
    private service: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.loading = true;
    this.service.getPacientes().subscribe({
      next: (data) => {
        this.pacientes = data.map(p => ({
          ...p,
          edad: this.calcularEdad(p.fecha_nacimiento)
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
        this.loading = false;
        this.cdr.detectChanges();
        alert('Error al cargar pacientes');
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

  get pacientesFiltrados(): PacienteConEdad[] {
    if (!this.searchTerm) return this.pacientes;
    const term = this.searchTerm.toLowerCase();
    return this.pacientes.filter(p => 
      p.nombre.toLowerCase().includes(term) ||
      p.apellido_paterno.toLowerCase().includes(term) ||
      p.ci.includes(term)
    );
  }

  seleccionarPaciente(paciente: PacienteConEdad) {
    this.pacienteSeleccionado = paciente;
    this.cargarRequerimientos(paciente.id!);
  }

  cargarRequerimientos(pacienteId: number) {
    this.loading = true;
    this.service.getRequerimientosPorPaciente(pacienteId).subscribe({
      next: (data) => {
        this.requerimientos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar requerimientos:', err);
        this.loading = false;
        this.requerimientos = [];
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal() {
    if (this.pacienteSeleccionado) {
      this.mostrarModal = true;
    } else {
      alert('⚠️ Seleccione un paciente primero');
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  onRequerimientoGuardado() {
    this.cerrarModal();
    if (this.pacienteSeleccionado) {
      this.cargarRequerimientos(this.pacienteSeleccionado.id!);
    }
  }

  verDetalle(req: RequerimientoNutricional) {
    alert(`📊 DETALLE REQUERIMIENTO\n\n` +
      `GEB: ${req.geb_kcal} kcal/día\n` +
      `GET: ${req.get_kcal} kcal/día\n` +
      `Kcal/kg: ${req.kcal_por_kg}\n` +
      `Peso: ${req.peso_kg_at} kg\n` +
      `Talla: ${req.talla_cm_at} cm\n` +
      `Factor Actividad: ${req.factor_actividad}\n` +
      `Factor Lesión: ${req.factor_lesion}\n` +
      `Registrado por: ${req.registrado_por_nombre || 'N/A'}\n` +
      `Fecha: ${new Date(req.calculado_en!).toLocaleString()}`);
  }

  cambiarEstado(req: RequerimientoNutricional) {
    const nuevoEstado = req.estado === 'activo' ? 'inactivo' : 'activo';
    this.service.updateRequerimiento(req.id!, { ...req, estado: nuevoEstado }).subscribe({
      next: () => {
        alert(`✅ Requerimiento ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`);
        if (this.pacienteSeleccionado) {
          this.cargarRequerimientos(this.pacienteSeleccionado.id!);
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('❌ Error al cambiar el estado');
      }
    });
  }
}
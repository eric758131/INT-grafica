import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Paciente, MoleculaCalorica } from '../../services/usuario.service';
import { ModalMoleculaComponent } from '../modal-molecula/modal-molecula';
import { ModalGrafico3dComponent } from '../modal-grafico-3d/modal-grafico-3d';   // ← NUEVO


export interface PacienteConEdad extends Paciente {
  edad: number;
}

@Component({
  selector: 'app-lista-molecula',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalMoleculaComponent, ModalGrafico3dComponent], // ← NUEVO
  templateUrl: './lista-molecula.html',
  styleUrls: ['./lista-molecula.css']
})
export class ListaMoleculaComponent implements OnInit {
  pacientes: PacienteConEdad[] = [];
  moleculas: MoleculaCalorica[] = [];
  pacienteSeleccionado: PacienteConEdad | null = null;
  loading = true;
  searchTerm = '';
  mostrarModal = false;

  // ── NUEVO: estado del modal 3D ──────────────────────────────
  mostrarGrafico3d = false;
  moleculaSeleccionada: MoleculaCalorica | null = null;

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
        alert('❌ Error al cargar pacientes');
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
    this.cargarMoleculas(paciente.id!);
  }

  cargarMoleculas(pacienteId: number) {
    this.loading = true;
    this.service.getMoleculasPorPaciente(pacienteId).subscribe({
      next: (data) => {
        this.moleculas = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar moléculas:', err);
        this.loading = false;
        this.moleculas = [];
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

  onMoleculaGuardado() {
    this.cerrarModal();
    if (this.pacienteSeleccionado) {
      this.cargarMoleculas(this.pacienteSeleccionado.id!);
    }
  }

  // ── NUEVO: abrir gráfico 3D ──────────────────────────────────
  verDetalle(mol: MoleculaCalorica) {
    this.moleculaSeleccionada = mol;
    this.mostrarGrafico3d = true;
  }

  cerrarGrafico3d() {
    this.mostrarGrafico3d = false;
    this.moleculaSeleccionada = null;
  }

  cambiarEstado(mol: MoleculaCalorica) {
    const nuevoEstado = mol.estado === 'activo' ? 'inactivo' : 'activo';
    this.service.updateMolecula(mol.id!, { ...mol, estado: nuevoEstado }).subscribe({
      next: () => {
        alert(`✅ Molécula ${nuevoEstado === 'activo' ? 'activada' : 'desactivada'}`);
        if (this.pacienteSeleccionado) {
          this.cargarMoleculas(this.pacienteSeleccionado.id!);
        }
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('❌ Error al cambiar el estado');
      }
    });
  }
}
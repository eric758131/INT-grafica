import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalPacienteComponent } from '../modal-paciente/modal-paciente';
import { UsuarioService, Paciente } from '../../services/usuario.service';

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, ModalPacienteComponent],
  templateUrl: './lista-pacientes.html'
})
export class ListaPacientesComponent implements OnInit {
  pacientes: Paciente[] = [];
  mostrarModal = false;
  pacienteSeleccionado: Paciente | null = null;

  constructor(private service: UsuarioService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.getPacientes().subscribe(data => {
      this.pacientes = data;
      console.log('Pacientes cargados:', data);
    });
  }

  abrirModal() {
    this.pacienteSeleccionado = null;
    this.mostrarModal = true;
  }

  editarPaciente(paciente: Paciente) {
    this.pacienteSeleccionado = paciente;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.pacienteSeleccionado = null;
  }

  recargar() {
    this.cargar();
  }

  eliminarPaciente(id: number) {
    if (confirm('¿Eliminar este paciente?')) {
      this.service.deletePaciente(id).subscribe(() => this.cargar());
    }
  }
}
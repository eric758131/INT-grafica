import { Component, OnInit, NgZone } from '@angular/core'; // 👈 Importa NgZone
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, Paciente, Evaluacion } from '../../services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-evaluaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-evaluaciones.html',
  styleUrls: ['./lista-evaluaciones.css']
})
export class ListaEvaluacionesComponent implements OnInit {
  pacientes: Paciente[] = [];
  evaluaciones: Evaluacion[] = [];
  pacienteSeleccionado: Paciente | null = null;
  loading = false;
  searchTerm = '';

  constructor(
    private service: UsuarioService,
    private router: Router,
    private zone: NgZone // 👈 Inyecta NgZone
  ) {}

  ngOnInit() {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.loading = true;
    this.service.getPacientes().subscribe({
      next: (data) => {
        // 👈 Envuelve todo en zone.run()
        this.zone.run(() => {
          this.pacientes = data;
          this.loading = false;
          
          if (this.pacientes.length > 0 && !this.pacienteSeleccionado) {
            this.seleccionarPaciente(this.pacientes[0]);
          }
        });
      },
      error: (error) => {
        this.zone.run(() => {
          this.loading = false;
          console.error('Error al cargar pacientes:', error);
          Swal.fire('Error', 'No se pudieron cargar los pacientes', 'error');
        });
      }
    });
  }

  get pacientesFiltrados(): Paciente[] {
    if (!this.searchTerm) return this.pacientes;
    const term = this.searchTerm.toLowerCase();
    return this.pacientes.filter(p => 
      p.nombre.toLowerCase().includes(term) ||
      p.apellido_paterno.toLowerCase().includes(term) ||
      p.apellido_materno?.toLowerCase().includes(term) ||
      p.ci.includes(term)
    );
  }

  seleccionarPaciente(paciente: Paciente) {
    this.zone.run(() => { // 👈 También envuelve esto
      this.pacienteSeleccionado = paciente;
      this.cargarEvaluaciones(paciente.id!);
    });
  }

  cargarEvaluaciones(pacienteId: number) {
    this.service.getEvaluacionesByPaciente(pacienteId).subscribe({
      next: (data) => {
        this.zone.run(() => { // 👈 También envuelve esto
          this.evaluaciones = data;
        });
      },
      error: (error) => {
        this.zone.run(() => {
          console.error('Error al cargar evaluaciones:', error);
          this.evaluaciones = [];
        });
      }
    });
  }

  nuevaEvaluacion() {
    if (this.pacienteSeleccionado) {
      const pacienteId = this.pacienteSeleccionado.id;
      console.log('Navegando a nueva evaluación para paciente:', pacienteId);
      this.router.navigate(['/dashboard/evaluacion/nueva', pacienteId]);
    } else {
      Swal.fire('Seleccione un paciente', 'Primero seleccione un paciente de la lista', 'warning');
    }
  }

  verResultados(evaluacion: Evaluacion) {
    this.zone.run(() => {
      this.router.navigate(['/evaluacion/resultados', evaluacion.id]);
    });
  }

  volver() {
    this.zone.run(() => {
      this.router.navigate(['/dashboard']);
    });
  }
}
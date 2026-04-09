import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService, Evaluacion } from '../../services/usuario.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resultados-evaluacion',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './resultados-evaluacion.html',
  styleUrls: ['./resultados-evaluacion.css']
})
export class ResultadosEvaluacionComponent implements OnInit {
  evaluacion: Evaluacion | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: UsuarioService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.cargarEvaluacion(id);
    }
  }

  cargarEvaluacion(id: number) {
    this.spinner.show();
    this.service.getEvaluacionById(id).subscribe({
      next: (data) => {
        this.evaluacion = data;
        this.spinner.hide();
        this.loading = false;
      },
      error: (error) => {
        this.spinner.hide();
        this.loading = false;
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo cargar la evaluación', 'error').then(() => {
          this.router.navigate(['/evaluacion']);
        });
      }
    });
  }

  getZScoreColor(z: number): string {
    if (z < -2) return 'bg-red-500';
    if (z < -1) return 'bg-orange-400';
    if (z > 2) return 'bg-red-500';
    if (z > 1) return 'bg-orange-400';
    return 'bg-green-500';
  }

  getZScoreWidth(z: number): string {
    let porcentaje = ((z + 3) / 6) * 100;
    porcentaje = Math.min(100, Math.max(0, porcentaje));
    return `${porcentaje}%`;
  }

  volver() {
    this.router.navigate(['/evaluacion']);
  }

  verCalculos() {
    if (this.evaluacion?.id) {
      this.router.navigate(['/evaluacion/calculos', this.evaluacion.id]);
    }
  }
}
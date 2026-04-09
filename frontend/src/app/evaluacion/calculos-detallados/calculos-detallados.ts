import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calculos-detallados',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './calculos-detallados.html',
  styleUrls: ['./calculos-detallados.css']
})
export class CalculosDetalladosComponent implements OnInit {
  calculos: any = null;
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
      this.cargarCalculos(id);
    }
  }

  cargarCalculos(id: number) {
    this.spinner.show();
    this.service.getCalculosDetallados(id).subscribe({
      next: (response) => {
        this.calculos = response.calculos;
        this.spinner.hide();
        this.loading = false;
      },
      error: (error) => {
        this.spinner.hide();
        this.loading = false;
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudieron cargar los cálculos', 'error').then(() => {
          this.router.navigate(['/evaluacion']);
        });
      }
    });
  }

  volver() {
    const id = this.route.snapshot.params['id'];
    this.router.navigate(['/evaluacion/resultados', id]);
  }
}
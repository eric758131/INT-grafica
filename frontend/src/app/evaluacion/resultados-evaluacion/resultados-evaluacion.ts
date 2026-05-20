import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService, Evaluacion } from '../../services/usuario.service';

@Component({
  selector: 'app-resultados-evaluacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultados-evaluacion.html',
  styleUrls: ['./resultados-evaluacion.css']
})
export class ResultadosEvaluacionComponent implements OnInit {
  evaluacion: Evaluacion | null = null;
  loading = true;

  // Getters con valores por defecto para evitar undefined
  get zImc(): number { return this.evaluacion?.z_imc || 0; }
  get zCmb(): number { return this.evaluacion?.z_cmb || 0; }
  get zAgb(): number { return this.evaluacion?.z_agb || 0; }
  get zTalla(): number { return this.evaluacion?.z_talla || 0; }
  get zPb(): number { return this.evaluacion?.z_pb || 0; }
  get zPct(): number { return this.evaluacion?.z_pct || 0; }
  get zAmb(): number { return this.evaluacion?.z_amb || 0; }
  
  get dxImc(): string { return this.evaluacion?.dx_z_imc || 'Sin diagnóstico'; }
  get dxTalla(): string { return this.evaluacion?.dx_z_talla || 'Sin diagnóstico'; }
  get dxPb(): string { return this.evaluacion?.dx_z_pb || 'Sin diagnóstico'; }
  get dxPct(): string { return this.evaluacion?.dx_z_pct || 'Sin diagnóstico'; }
  get dxCmb(): string { return this.evaluacion?.dx_z_cmb || 'Sin diagnóstico'; }
  get dxAmb(): string { return this.evaluacion?.dx_z_amb || 'Sin diagnóstico'; }
  get dxAgb(): string { return this.evaluacion?.dx_z_agb || 'Sin diagnóstico'; }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.cargarEvaluacion(id);
    } else {
      this.router.navigate(['/dashboard/evaluacion']);
    }
  }

  cargarEvaluacion(id: number) {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.service.getEvaluacionById(id).subscribe({
      next: (data: Evaluacion) => {
        this.evaluacion = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard/evaluacion']);
      }
    });
  }

  volver() {
    this.router.navigate(['/dashboard/evaluacion']);
  }

  getZScoreWidth(z: number): string {
    let porcentaje = ((z + 3) / 6) * 100;
    porcentaje = Math.min(100, Math.max(0, porcentaje));
    return `${porcentaje}%`;
  }

  getClasificacionClass(indicador: string): string {
    let z: number;
    switch(indicador) {
      case 'imc': z = this.zImc; break;
      case 'cmb': z = this.zCmb; break;
      case 'agb': z = this.zAgb; break;
      default: return 'bg-gray-100 text-gray-700';
    }
    
    if (indicador === 'agb') {
      if (z > 2) return 'bg-red-100 text-red-700';
      if (z > 1) return 'bg-orange-100 text-orange-700';
      return 'bg-green-100 text-green-700';
    } else {
      if (z < -2) return 'bg-red-100 text-red-700';
      if (z < -1) return 'bg-orange-100 text-orange-700';
      if (z > 2) return 'bg-red-100 text-red-700';
      if (z > 1) return 'bg-orange-100 text-orange-700';
      return 'bg-green-100 text-green-700';
    }
  }
}
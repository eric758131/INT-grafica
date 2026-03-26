import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, EvaluacionCalculo } from '../../services/usuario.service';

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculadora.html',
  styleUrls: ['./calculadora.css']
})
export class CalculadoraComponent {
  // Datos del paciente (ejemplo)
  paciente = {
    id: 1,
    nombre: 'Juan Pérez',
    ci: '12345678',
    genero: 'masculino',
    fecha_nacimiento: '2016-03-25',
    edad: '9 años'
  };

  // Datos de medición
  medicion = {
    fecha: new Date().toISOString().split('T')[0],
    peso_kg: null as number | null,
    talla_cm: null as number | null,
    pb_mm: null as number | null,
    pct_mm: null as number | null
  };

  // Estados
  calculando = false;
  calculoRealizado = false;
  resultados: EvaluacionCalculo | null = null;
  diagnosticoImc = '';
  diagnosticoTalla = '';
  diagnosticoPb = '';
  diagnosticoPct = '';
  diagnosticoCmb = '';
  diagnosticoAmb = '';
  diagnosticoAgb = '';

  constructor(private service: UsuarioService) {}

  validarCamposBasicos(): boolean {
    return !!(
      this.medicion.fecha &&
      this.medicion.peso_kg &&
      this.medicion.talla_cm &&
      this.medicion.pb_mm &&
      this.medicion.pct_mm
    );
  }

  calcularEvaluacion() {
    if (!this.validarCamposBasicos()) {
      alert('Complete todos los campos de medición');
      return;
    }

    this.calculando = true;
    this.calculoRealizado = false;

    this.service.calcularEvaluacionEjemplo(this.medicion).subscribe({
      next: (data) => {
        this.resultados = data;
        this.calculoRealizado = true;
        this.calculando = false;
        
        // Scroll a resultados
        setTimeout(() => {
          document.getElementById('resultadosCard')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
      error: () => {
        alert('Error al calcular');
        this.calculando = false;
      }
    });
  }

  getZScoreColor(z: number): string {
    if (z < -2) return 'text-red-600 bg-red-50';
    if (z < -1) return 'text-orange-500 bg-orange-50';
    if (z > 2) return 'text-red-600 bg-red-50';
    if (z > 1) return 'text-orange-500 bg-orange-50';
    return 'text-green-600 bg-green-50';
  }

  guardarEvaluacion() {
    alert('Evaluación guardada (modo demostración)');
  }
}
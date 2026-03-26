import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-calculos-detallados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calculos-detallados.html',
  styleUrls: ['./calculos-detallados.css']
})
export class CalculosDetalladosComponent implements OnInit {
  // Datos de ejemplo (simulando una evaluación existente)
  evaluacion = {
    paciente: {
      nombre: 'Juan Pérez',
      ci: '12345678',
      genero: 'masculino',
      fecha_nacimiento: '2016-03-25'
    },
    medida: {
      fecha: '2026-03-25',
      edad_meses: 120,
      peso_kg: 32.5,
      talla_cm: 145.5,
      pb_mm: 220,
      pct_mm: 12.5
    }
  };

  // Datos de referencia OMS (ejemplo)
  referenciaOMS = {
    imc_mediana: 16.5,
    imc_mas_sd: 18.2,
    imc_menos_sd: 14.8,
    talla_mediana_cm: 145.0,
    talla_mas_sd_cm: 152.5,
    talla_menos_sd_cm: 137.5
  };

  // Datos de referencia Frisancho (ejemplo)
  referenciaFrisancho = {
    pb_dato: 215,
    pb_mas_sd: 235,
    pb_menos_sd: 195,
    pct_dato: 11.5,
    pct_mas_sd: 14.0,
    pct_menos_sd: 9.0,
    cmb_dato: 178,
    cmb_mas_sd: 195,
    cmb_menos_sd: 161,
    amb_dato: 2450,
    amb_mas_sd: 2800,
    amb_menos_sd: 2100,
    agb_dato: 185,
    agb_mas_sd: 220,
    agb_menos_sd: 150
  };

  // Resultados calculados
  calculos: any = {};

  ngOnInit() {
    this.calcularTodo();
  }

  calcularTodo() {
    // 1. IMC
    const tallaMetros = this.evaluacion.medida.talla_cm / 100;
    const imc = this.evaluacion.medida.peso_kg / (tallaMetros * tallaMetros);
    
    this.calculos.imc = {
      peso_kg: this.evaluacion.medida.peso_kg,
      talla_cm: this.evaluacion.medida.talla_cm,
      talla_metros: tallaMetros,
      talla_cuadrado: tallaMetros * tallaMetros,
      resultado: imc
    };

    // 2. CMB
    const cmb = this.evaluacion.medida.pb_mm - (3.1416 * this.evaluacion.medida.pct_mm);
    this.calculos.cmb = {
      pb_mm: this.evaluacion.medida.pb_mm,
      pct_mm: this.evaluacion.medida.pct_mm,
      pi_por_pct: 3.1416 * this.evaluacion.medida.pct_mm,
      resultado: cmb
    };

    // 3. AMB
    const amb = ((cmb * cmb) / 12.57) - 100;
    this.calculos.amb = {
      cmb: cmb,
      cmb_cuadrado: cmb * cmb,
      division: (cmb * cmb) / 12.57,
      resultado: amb
    };

    // 4. AGB
    const agb = ((this.evaluacion.medida.pb_mm * this.evaluacion.medida.pb_mm) / 12.57) - (amb + 100);
    this.calculos.agb = {
      pb_mm: this.evaluacion.medida.pb_mm,
      pb_cuadrado: this.evaluacion.medida.pb_mm * this.evaluacion.medida.pb_mm,
      division: (this.evaluacion.medida.pb_mm * this.evaluacion.medida.pb_mm) / 12.57,
      amb_mas_100: amb + 100,
      resultado: agb
    };

    // 5. Z-Score IMC
    this.calculos.z_imc = this.calcularZScore(
      imc,
      this.referenciaOMS.imc_mediana,
      this.referenciaOMS.imc_mas_sd,
      this.referenciaOMS.imc_menos_sd,
      'IMC'
    );

    // 6. Z-Score Talla
    this.calculos.z_talla = this.calcularZScore(
      this.evaluacion.medida.talla_cm,
      this.referenciaOMS.talla_mediana_cm,
      this.referenciaOMS.talla_mas_sd_cm,
      this.referenciaOMS.talla_menos_sd_cm,
      'Talla'
    );

    // 7. Z-Scores Frisancho
    this.calculos.z_pb = this.calcularZScore(
      this.evaluacion.medida.pb_mm,
      this.referenciaFrisancho.pb_dato,
      this.referenciaFrisancho.pb_mas_sd,
      this.referenciaFrisancho.pb_menos_sd,
      'Perímetro Braquial'
    );

    this.calculos.z_pct = this.calcularZScore(
      this.evaluacion.medida.pct_mm,
      this.referenciaFrisancho.pct_dato,
      this.referenciaFrisancho.pct_mas_sd,
      this.referenciaFrisancho.pct_menos_sd,
      'Pliegue Tricipital'
    );

    this.calculos.z_cmb = this.calcularZScore(
      cmb,
      this.referenciaFrisancho.cmb_dato,
      this.referenciaFrisancho.cmb_mas_sd,
      this.referenciaFrisancho.cmb_menos_sd,
      'CMB'
    );

    this.calculos.z_amb = this.calcularZScore(
      amb,
      this.referenciaFrisancho.amb_dato,
      this.referenciaFrisancho.amb_mas_sd,
      this.referenciaFrisancho.amb_menos_sd,
      'AMB'
    );

    this.calculos.z_agb = this.calcularZScore(
      agb,
      this.referenciaFrisancho.agb_dato,
      this.referenciaFrisancho.agb_mas_sd,
      this.referenciaFrisancho.agb_menos_sd,
      'AGB'
    );

    // 8. Peso Ideal y Diferencia
    const pesoIdeal = this.referenciaOMS.imc_mediana * (tallaMetros * tallaMetros);
    this.calculos.peso_ideal = {
      imc_mediana: this.referenciaOMS.imc_mediana,
      talla_metros_cuadrado: tallaMetros * tallaMetros,
      resultado: pesoIdeal,
      diferencia: this.evaluacion.medida.peso_kg - pesoIdeal
    };
  }

  calcularZScore(valor: number, mediana: number, mas_sd: number, menos_sd: number, nombre: string): any {
    const esMayor = valor >= mediana;
    let diferencia: number, denominador: number, formula: string;
    
    if (esMayor) {
      diferencia = valor - mediana;
      denominador = mas_sd - mediana;
      formula = `(${valor.toFixed(2)} - ${mediana}) / (${mas_sd} - ${mediana})`;
    } else {
      diferencia = valor - mediana;
      denominador = mediana - menos_sd;
      formula = `(${valor.toFixed(2)} - ${mediana}) / (${mediana} - ${menos_sd})`;
    }
    
    const resultado = diferencia / denominador;
    
    return {
      nombre,
      valor,
      mediana,
      mas_sd,
      menos_sd,
      esMayor,
      diferencia,
      denominador,
      formula,
      resultado
    };
  }

  formatNumber(num: number, decimals: number = 2): string {
    return num.toFixed(decimals);
  }
}
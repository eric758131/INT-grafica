import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, Paciente, Evaluacion } from '../../services/usuario.service';

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
  cargandoEvaluaciones = false;
  mostrarGraficaEvolucion = false;
  
  // Datos para la gráfica
  fechas: string[] = [];
  imcValues: number[] = [];
  cmbValues: number[] = [];

  constructor(
    private service: UsuarioService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPacientes();
  }

  cargarPacientes() {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.service.getPacientes().subscribe({
      next: (data: Paciente[]) => {
        this.pacientes = data;
        this.loading = false;
        this.cdr.detectChanges();
        
        if (this.pacientes.length > 0 && !this.pacienteSeleccionado) {
          this.seleccionarPaciente(this.pacientes[0]);
        }
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        this.loading = false;
        this.cdr.detectChanges();
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
    this.pacienteSeleccionado = paciente;
    this.cargarEvaluaciones(paciente.id!);
  }

  cargarEvaluaciones(pacienteId: number) {
    this.cargandoEvaluaciones = true;
    this.cdr.detectChanges();
    
    this.service.getEvaluacionesByPaciente(pacienteId).subscribe({
      next: (data: Evaluacion[]) => {
        this.evaluaciones = data.sort((a, b) => 
          new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
        );
        this.cargandoEvaluaciones = false;
        this.cdr.detectChanges();
        this.prepararDatosGrafica();
      },
      error: (error) => {
        console.error('Error:', error);
        this.evaluaciones = [];
        this.cargandoEvaluaciones = false;
        this.cdr.detectChanges();
      }
    });
  }

  prepararDatosGrafica() {
    if (this.evaluaciones.length < 2) return;
    
    this.fechas = this.evaluaciones.map(e => 
      new Date(e.created_at!).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    );
    
    this.imcValues = this.evaluaciones.map(e => parseFloat(e.imc.toString()));
    this.cmbValues = this.evaluaciones.map(e => e.cmb_mm || 0);
  }

  abrirGraficaEvolucion() {
    if (this.evaluaciones.length >= 2) {
      this.mostrarGraficaEvolucion = true;
      setTimeout(() => {
        this.dibujarGrafica();
      }, 100);
    }
  }

  cerrarGraficaEvolucion() {
    this.mostrarGraficaEvolucion = false;
  }

  dibujarGrafica() {
    const canvas = document.getElementById('graficaCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    canvas.width = 900;
    canvas.height = 500;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (this.fechas.length === 0) return;
    
    // Encontrar máximos y mínimos
    const maxImc = Math.max(...this.imcValues, 35);
    const minImc = Math.min(...this.imcValues, 10);
    const maxCmb = Math.max(...this.cmbValues, 300);
    const minCmb = Math.min(...this.cmbValues, 100);
    
    const padding = { left: 70, right: 70, top: 40, bottom: 60 };
    const graphWidth = canvas.width - padding.left - padding.right;
    const graphHeight = canvas.height - padding.top - padding.bottom;
    const stepX = graphWidth / (this.fechas.length - 1);
    
    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar grid
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * graphHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvas.width - padding.right, y);
      ctx.stroke();
    }
    
    // Ejes
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, canvas.height - padding.bottom);
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom);
    ctx.stroke();
    
    // Etiquetas eje Y izquierdo (IMC)
    ctx.fillStyle = '#3b82f6';
    ctx.font = '11px Arial';
    for (let i = 0; i <= 4; i++) {
      const value = (minImc + (i / 4) * (maxImc - minImc)).toFixed(1);
      const y = padding.top + graphHeight - (i / 4) * graphHeight;
      ctx.fillText(value, padding.left - 30, y + 3);
    }
    ctx.save();
    ctx.translate(25, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('IMC (kg/m²)', -20, 0);
    ctx.restore();
    
    // Etiquetas eje Y derecho (CMB)
    ctx.fillStyle = '#8b5cf6';
    for (let i = 0; i <= 4; i++) {
      const value = Math.round(minCmb + (i / 4) * (maxCmb - minCmb));
      const y = padding.top + graphHeight - (i / 4) * graphHeight;
      ctx.fillText(value.toString(), canvas.width - padding.right + 10, y + 3);
    }
    ctx.save();
    ctx.translate(canvas.width - 25, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#8b5cf6';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('CMB (mm)', -20, 0);
    ctx.restore();
    
    // Etiquetas eje X
    ctx.fillStyle = '#475569';
    ctx.font = '10px Arial';
    for (let i = 0; i < this.fechas.length; i++) {
      const x = padding.left + i * stepX;
      ctx.fillText(this.fechas[i], x - 15, canvas.height - padding.bottom + 20);
    }
    
    // Función para dibujar curva suave
    const dibujarCurvaSuave = (values: number[], minVal: number, maxVal: number, color: string, shadowColor: string) => {
      if (values.length < 2) return;
      
      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < values.length; i++) {
        const x = padding.left + i * stepX;
        const y = padding.top + graphHeight - ((values[i] - minVal) / (maxVal - minVal)) * graphHeight;
        points.push({ x, y });
      }
      
      // Sombra
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 8;
      
      // Dibujar curva
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      
      // Catmull-Rom spline para curva suave
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        
        for (let t = 0; t <= 1; t += 0.05) {
          const x = this.catmullRom(p0.x, p1.x, p2.x, p3.x, t);
          const y = this.catmullRom(p0.y, p1.y, p2.y, p3.y, t);
          
          if (t === 0 && i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
      
      // Dibujar puntos
      ctx.shadowBlur = 0;
      for (const point of points) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Área bajo la curva
      ctx.beginPath();
      ctx.fillStyle = color + '20';
      ctx.moveTo(points[0].x, canvas.height - padding.bottom);
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];
        
        for (let t = 0; t <= 1; t += 0.05) {
          const x = this.catmullRom(p0.x, p1.x, p2.x, p3.x, t);
          const y = this.catmullRom(p0.y, p1.y, p2.y, p3.y, t);
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(points[points.length - 1].x, canvas.height - padding.bottom);
      ctx.fill();
    };
    
    // Dibujar curvas
    dibujarCurvaSuave(this.imcValues, minImc, maxImc, '#3b82f6', 'rgba(59, 130, 246, 0.3)');
    dibujarCurvaSuave(this.cmbValues, minCmb, maxCmb, '#8b5cf6', 'rgba(139, 92, 246, 0.3)');
    
    // Leyenda
    const leyendaY = 15;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(canvas.width - 120, leyendaY, 15, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('IMC (kg/m²)', canvas.width - 100, leyendaY + 10);
    
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(canvas.width - 120, leyendaY + 25, 15, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText('CMB (mm)', canvas.width - 100, leyendaY + 35);
  }
  
  private catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * ((2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }

  nuevaEvaluacion() {
    if (this.pacienteSeleccionado) {
      this.router.navigate(['/dashboard/evaluacion/nueva', this.pacienteSeleccionado.id]);
    }
  }

  verResultados(evaluacion: Evaluacion) {
    this.router.navigate(['/dashboard/evaluacion/resultados', evaluacion.id]);
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  getClasificacionColor(imc: number): string {
    if (imc < 18.5) return 'bg-yellow-100 text-yellow-700';
    if (imc < 25) return 'bg-green-100 text-green-700';
    if (imc < 30) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  }

  getClasificacionTexto(imc: number): string {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  }
}
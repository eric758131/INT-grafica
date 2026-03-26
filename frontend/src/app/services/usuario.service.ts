import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  ci: string;
  email: string;
  fecha_nacimiento?: string | null;
  direccion?: string;
  telefono?: string;
  genero?: string;
  estado: string;
}

export interface Tutor {
  id?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  ci: string;
  telefono?: string;
  direccion?: string;
  parentesco: string;
  estado: string;
}

export interface Paciente {
  id?: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  fecha_nacimiento: string;
  genero: string;
  estado: string;
  tutor_id?: number | null;
  tutor?: Tutor;  // ← Esto ahora vendrá lleno desde Django
}

export interface Cama {
  id?: number;
  numero: string;
  ubicacion: string;
  estado_cama: 'disponible' | 'ocupada' | 'mantenimiento' | 'reservada';
  estado: 'activo' | 'inactivo';
  paciente?: number | null;
  paciente_info?: {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
  } | null;
}

export interface EvaluacionCalculo {
  edad_meses: number;
  edad_anios: number;
  imc: number;
  cmb_mm: number;
  amb_mm2: number;
  agb_mm2: number;
  peso_ideal: number;
  dif_peso: number;
  z_scores: {
    imc: number;
    talla: number;
    pb: number;
    pct: number;
    cmb: number;
    amb: number;
    agb: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  // Usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/users/`);
  }

  createUsuario(usuario: any): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/users/`, usuario);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}/`);
  }

  // Login
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, { email, password });
  }

  // ========== TUTORES ==========
  getTutores(): Observable<Tutor[]> {
    return this.http.get<Tutor[]>(`${this.apiUrl}/tutores/`);
  }

  createTutor(tutor: any): Observable<Tutor> {
    return this.http.post<Tutor>(`${this.apiUrl}/tutores/`, tutor);
  }

  updateTutor(id: number, tutor: any): Observable<Tutor> {
    return this.http.put<Tutor>(`${this.apiUrl}/tutores/${id}/`, tutor);
  }

  deleteTutor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tutores/${id}/`);
  }

  // ========== PACIENTES ==========
  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}/pacientes/`);
  }

  createPaciente(paciente: any): Observable<Paciente> {
    console.log('🔵 Service - Enviando paciente:', paciente); // Para depurar
    return this.http.post<Paciente>(`${this.apiUrl}/pacientes/`, paciente);
  }

  updatePaciente(id: number, paciente: any): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/pacientes/${id}/`, paciente);
  }

  deletePaciente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pacientes/${id}/`);
  }



  // ========== CAMAS ==========
  getCamas(): Observable<Cama[]> {
    return this.http.get<Cama[]>(`${this.apiUrl}/camas/`);
  }
  // Métodos adicionales
  asignarPacienteACama(camaId: number, pacienteId: number): Observable<Cama> {
    return this.http.patch<Cama>(`${this.apiUrl}/camas/${camaId}/`, { paciente: pacienteId, estado_cama: 'ocupada' });
  }

  liberarCama(camaId: number): Observable<Cama> {
    return this.http.patch<Cama>(`${this.apiUrl}/camas/${camaId}/`, { paciente: null, estado_cama: 'disponible' });
  }

  // En la clase UsuarioService:
  calcularEvaluacionEjemplo(datos: any): Observable<EvaluacionCalculo> {
    // Simulación de cálculo con datos de ejemplo
    return new Observable(observer => {
      setTimeout(() => {
        const tallaMetros = datos.talla_cm / 100;
        const imc = datos.peso_kg / (tallaMetros * tallaMetros);
        const cmb = datos.pb_mm - (3.1416 * datos.pct_mm);
        const amb = ((cmb * cmb) / 12.57) - 100;
        const agb = ((datos.pb_mm * datos.pb_mm) / 12.57) - (amb + 100);
        
        observer.next({
          edad_meses: 120,
          edad_anios: 10,
          imc: parseFloat(imc.toFixed(2)),
          cmb_mm: parseFloat(cmb.toFixed(1)),
          amb_mm2: parseFloat(amb.toFixed(1)),
          agb_mm2: parseFloat(agb.toFixed(1)),
          peso_ideal: parseFloat((18.5 * tallaMetros * tallaMetros).toFixed(2)),
          dif_peso: parseFloat((datos.peso_kg - (18.5 * tallaMetros * tallaMetros)).toFixed(2)),
          z_scores: {
            imc: parseFloat((Math.random() * 3 - 1.5).toFixed(3)),
            talla: parseFloat((Math.random() * 3 - 1.5).toFixed(3)),
            pb: parseFloat((Math.random() * 3 - 1.5).toFixed(3)),
            pct: parseFloat((Math.random() * 3 - 1.5).toFixed(3)),
            cmb: parseFloat((Math.random() * 3 - 1.5).toFixed(3)),
            amb: parseFloat((Math.random() * 3 - 1.5).toFixed(3)),
            agb: parseFloat((Math.random() * 3 - 1.5).toFixed(3))
          }
        });
        observer.complete();
      }, 800);
    });
  }

  
}
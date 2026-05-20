import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ========== INTERFACES EXISTENTES (mantén todas las que ya tienes) ==========
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
  tutor?: Tutor;
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

export interface OmsRef {
  id: number;
  genero: string;
  edad_meses: number;
  imc_menos_sd: number;
  imc_mediana: number;
  imc_mas_sd: number;
  talla_menos_sd_cm: number;
  talla_mediana_cm: number;
  talla_mas_sd_cm: number;
}

export interface FrisanchoRef {
  id: number;
  genero: string;
  edad_anios: number;
  pb_menos_sd: number; pb_dato: number; pb_mas_sd: number;
  pct_menos_sd: number; pct_dato: number; pct_mas_sd: number;
  cmb_menos_sd: number; cmb_dato: number; cmb_mas_sd: number;
  amb_menos_sd: number; amb_dato: number; amb_mas_sd: number;
  agb_menos_sd: number; agb_dato: number; agb_mas_sd: number;
}

export interface Medida {
  id?: number;
  paciente: number;
  paciente_nombre?: string;
  fecha: string;
  edad_meses: number;
  peso_kg: number;
  talla_cm: number;
  pb_mm: number;
  pct_mm: number;
  estado: string;
}

export interface Evaluacion {
  id?: number;
  medida_id: number;
  medida?: Medida;
  oms_ref_id: number;
  frisancho_ref_id: number;
  oms_ref?: OmsRef;
  frisancho_ref?: FrisanchoRef;
  imc: number;
  peso_ideal?: number;
  dif_peso?: number;
  cmb_mm?: number;
  amb_mm2?: number;
  agb_mm2?: number;
  z_imc?: number; 
  dx_z_imc?: string;
  z_talla?: number; 
  dx_z_talla?: string;
  z_pb?: number; 
  dx_z_pb?: string;
  z_pct?: number; 
  dx_z_pct?: string;
  z_cmb?: number; 
  dx_z_cmb?: string;
  z_amb?: number; 
  dx_z_amb?: string;
  z_agb?: number; 
  dx_z_agb?: string;
  registrado_por?: number;
  registrado_por_nombre?: string;
  created_at?: string;
}

export interface CalculosResponse {
  success: boolean;
  calculos: {
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
  };
}

// ========== REQUERIMIENTO NUTRICIONAL ==========
export interface RequerimientoNutricional {
  id?: number;
  paciente: number;
  paciente_nombre?: string;
  paciente_apellido?: string;
  paciente_ci?: string;
  medida?: number | null;
  peso_kg_at: number;
  talla_cm_at: number;
  geb_kcal: number;
  factor_actividad: number;
  factor_lesion: number;
  get_kcal: number;
  kcal_por_kg: number;
  estado: string;
  registrado_por?: number;
  registrado_por_nombre?: string;
  calculado_en?: string;
  created_at?: string;
}

// ========== MOLÉCULA CALÓRICA ==========
export interface MoleculaCalorica {
  id?: number;
  paciente: number;
  paciente_nombre?: string;
  paciente_apellido?: string;
  medida?: number | null;
  requerimiento?: number | null;
  requerimiento_get?: number;
  peso_kg: number;
  talla_cm: number;
  kilocalorias_totales: number;
  proteinas_g_kg: number;
  porcentaje_grasas: number;
  grasas_g_kg?: number;
  carbohidratos_g_kg?: number;
  kilocalorias_proteinas?: number;
  kilocalorias_grasas?: number;
  kilocalorias_carbohidratos?: number;
  porcentaje_proteinas?: number;
  porcentaje_carbohidratos?: number;
  registrado_por?: number;
  registrado_por_nombre?: string;
  estado: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  // ========== USUARIOS ==========
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/users/`);
  }

  createUsuario(usuario: any): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/users/`, usuario);
  }

  updateUsuario(id: number, usuario: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/usuarios/${id}`, usuario);
}

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}/`);
  }

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

  asignarPacienteACama(camaId: number, pacienteId: number): Observable<Cama> {
    return this.http.patch<Cama>(`${this.apiUrl}/camas/${camaId}/`, { paciente: pacienteId, estado_cama: 'ocupada' });
  }

  liberarCama(camaId: number): Observable<Cama> {
    return this.http.patch<Cama>(`${this.apiUrl}/camas/${camaId}/`, { paciente: null, estado_cama: 'disponible' });
  }

  activarCama(camaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/camas/${camaId}/activar`, {});
  }
  // ========== REFERENCIAS ==========
  getOmsRefs(): Observable<OmsRef[]> {
    return this.http.get<OmsRef[]>(`${this.apiUrl}/oms-ref/`);
  }

  getFrisanchoRefs(): Observable<FrisanchoRef[]> {
    return this.http.get<FrisanchoRef[]>(`${this.apiUrl}/frisancho-ref/`);
  }

  // ========== EVALUACIÓN ==========
  calcularPreview(data: any): Observable<CalculosResponse> {
    return this.http.post<CalculosResponse>(`${this.apiUrl}/medidas/calcular_preview/`, data);
  }

  guardarEvaluacion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/medidas/guardar_evaluacion/`, data);
  }

  getEvaluacionesByPaciente(pacienteId: number): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.apiUrl}/evaluaciones/paciente/${pacienteId}`);
  }

  getCalculosDetallados(evaluacionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/evaluaciones/${evaluacionId}/calculos_detallados/`);
  }

  getEvaluacionById(id: number): Observable<Evaluacion> {
    return this.http.get<Evaluacion>(`${this.apiUrl}/evaluaciones/${id}/`);
  }
  
  getEvaluaciones(): Observable<Evaluacion[]> {
    return this.http.get<Evaluacion[]>(`${this.apiUrl}/evaluaciones`);
  }

  // Métodos en UsuarioService
  getRequerimientos(): Observable<RequerimientoNutricional[]> {
    return this.http.get<RequerimientoNutricional[]>(`${this.apiUrl}/requerimiento-nutricional/`);
  }

  getRequerimientosPorPaciente(pacienteId: number): Observable<RequerimientoNutricional[]> {
    return this.http.get<RequerimientoNutricional[]>(`${this.apiUrl}/requerimiento-nutricional/por_paciente/?paciente_id=${pacienteId}`);
  }

  getRequerimientoActivoPorPaciente(pacienteId: number): Observable<RequerimientoNutricional> {
    return this.http.get<RequerimientoNutricional>(`${this.apiUrl}/requerimiento-nutricional/activo_por_paciente/?paciente_id=${pacienteId}`);
  }

  calcularPreviewRequerimiento(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/requerimiento-nutricional/calcular_preview/`, data);
  }

  getUltimaMedida(pacienteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/requerimiento-nutricional/ultima_medida/?paciente_id=${pacienteId}`);
  }

  createRequerimiento(data: any): Observable<RequerimientoNutricional> {
    return this.http.post<RequerimientoNutricional>(`${this.apiUrl}/requerimiento-nutricional/`, data);
  }

  updateRequerimiento(id: number, data: any): Observable<RequerimientoNutricional> {
    return this.http.put<RequerimientoNutricional>(`${this.apiUrl}/requerimiento-nutricional/${id}/`, data);
  }

  deleteRequerimiento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/requerimiento-nutricional/${id}/`);
  }


  // Métodos en UsuarioService
  getMoleculas(): Observable<MoleculaCalorica[]> {
    return this.http.get<MoleculaCalorica[]>(`${this.apiUrl}/molecula-calorica/`);
  }

  getMoleculasPorPaciente(pacienteId: number): Observable<MoleculaCalorica[]> {
    return this.http.get<MoleculaCalorica[]>(`${this.apiUrl}/molecula-calorica/por_paciente/?paciente_id=${pacienteId}`);
  }

  getMoleculaActivaPorPaciente(pacienteId: number): Observable<MoleculaCalorica> {
    return this.http.get<MoleculaCalorica>(`${this.apiUrl}/molecula-calorica/activo_por_paciente/?paciente_id=${pacienteId}`);
  }

  calcularPreviewMolecula(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/molecula-calorica/calcular_preview/`, data);
  }

  getDatosRequerimientoActivo(pacienteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/molecula-calorica/datos_requerimiento_activo/?paciente_id=${pacienteId}`);
  }

  createMolecula(data: any): Observable<MoleculaCalorica> {
    return this.http.post<MoleculaCalorica>(`${this.apiUrl}/molecula-calorica/`, data);
  }

  updateMolecula(id: number, data: any): Observable<MoleculaCalorica> {
    return this.http.put<MoleculaCalorica>(`${this.apiUrl}/molecula-calorica/${id}/`, data);
  }

  deleteMolecula(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/molecula-calorica/${id}/`);
  }
}
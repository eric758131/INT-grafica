import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { ListaUsuariosComponent } from './usuarios/lista-usuarios/lista-usuarios';
import { ListaPacientesComponent } from './pacientes/lista-pacientes/lista-pacientes';
import { SeleccionCamasComponent } from './camas/modal-asignar-paciente/seleccion-camas/seleccion-camas';
import { ListaEvaluacionesComponent } from './evaluacion/lista-evaluaciones/lista-evaluaciones';
import { FormularioEvaluacionComponent } from './evaluacion/formulario-evaluacion/formulario-evaluacion';
import { ListaRequerimientosComponent } from './requerimiento/lista-requerimientos/lista-requerimientos';
import { ListaMoleculaComponent } from './molecula/lista-molecula/lista-molecula';
import { AuthGuard } from './guards/auth.guard';
import { ResultadosEvaluacionComponent } from './evaluacion/resultados-evaluacion/resultados-evaluacion';



export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'usuarios', component: ListaUsuariosComponent },
      { path: 'pacientes', component: ListaPacientesComponent },
      { path: 'camas', component: SeleccionCamasComponent },
      { path: 'evaluacion', component: ListaEvaluacionesComponent },
      { path: 'evaluacion/nueva/:pacienteId', component: FormularioEvaluacionComponent },
      { path: 'evaluacion/resultados/:id', component: ResultadosEvaluacionComponent },  // ← Agrega esta
      { path: '', redirectTo: 'evaluacion', pathMatch: 'full' },
      { path: 'requerimiento', component: ListaRequerimientosComponent },
      { path: 'molecula', component: ListaMoleculaComponent },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
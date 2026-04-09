import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { ListaUsuariosComponent } from './usuarios/lista-usuarios/lista-usuarios';
import { ListaPacientesComponent } from './pacientes/lista-pacientes/lista-pacientes';
import { SeleccionCamasComponent } from './camas/seleccion-camas/seleccion-camas';
import { ListaEvaluacionesComponent } from './evaluacion/lista-evaluaciones/lista-evaluaciones';
import { FormularioEvaluacionComponent } from './evaluacion/formulario-evaluacion/formulario-evaluacion';
import { AuthGuard } from './guards/auth.guard';

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
      { path: '', redirectTo: 'evaluacion', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
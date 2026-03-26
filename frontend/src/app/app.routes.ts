import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { ListaUsuariosComponent } from './usuarios/lista-usuarios/lista-usuarios';
import { ListaPacientesComponent } from './pacientes/lista-pacientes/lista-pacientes';
import { AuthGuard } from './guards/auth.guard';
import { SeleccionCamasComponent } from './camas/seleccion-camas/seleccion-camas';
import { CalculadoraComponent } from './evaluacion/calculadora/calculadora';
import { CalculosDetalladosComponent } from './evaluacion/calculos-detallados/calculos-detallados';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'principal', pathMatch: 'full' },
      { path: 'principal', component: ListaUsuariosComponent }
    ]
  },
  { 
    path: 'usuarios', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ListaUsuariosComponent },
      { path: 'crear', component: ListaUsuariosComponent }
    ]
  },
  { 
    path: 'pacientes', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ListaPacientesComponent },
      { path: 'lista', component: ListaPacientesComponent },
      { path: 'crear', component: ListaPacientesComponent }
    ]
  },
  { 
  path: 'camas', 
  component: DashboardComponent,
  canActivate: [AuthGuard],
  children: [
    { path: '', component: SeleccionCamasComponent },
    { path: 'seleccion', component: SeleccionCamasComponent }
  ]
 },
 { 
  path: 'evaluacion', 
  component: DashboardComponent,
  canActivate: [AuthGuard],
  children: [
    { path: '', component: CalculadoraComponent },
    { path: 'calculadora', component: CalculadoraComponent }
  ]
 },
 { 
  path: 'evaluacion/calculos/:id', 
  component: DashboardComponent,
  canActivate: [AuthGuard],
  children: [
    { path: '', component: CalculosDetalladosComponent }
  ]
 },



 
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
  
];
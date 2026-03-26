import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, SidebarComponent, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  pageTitle: string = 'Dashboard';
  nombreUsuario: string = '';
  iniciales: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      const user = JSON.parse(usuario);
      this.nombreUsuario = `${user.nombre} ${user.apellido_paterno}`;
      this.iniciales = `${user.nombre.charAt(0)}${user.apellido_paterno.charAt(0)}`.toUpperCase();
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.url;
        if (url.includes('usuarios/crear')) {
          this.pageTitle = 'Crear Nuevo Usuario';
        } else if (url.includes('usuarios')) {
          this.pageTitle = 'Lista de Usuarios';
        } else if (url.includes('pacientes/crear')) {
          this.pageTitle = 'Crear Nuevo Paciente';
        } else if (url.includes('pacientes')) {
          this.pageTitle = 'Lista de Pacientes';
        } else if (url.includes('camas')) {
          this.pageTitle = 'Gestión de Camas';
        } else {
          this.pageTitle = 'Dashboard';
        }
      }
    });
  }
}
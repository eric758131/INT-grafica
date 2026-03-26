import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  showUsuariosSubmenu = true;
  showPacientesSubmenu = true;
  showCamasSubmenu = true;
  showEvaluacionSubmenu = true;
  activeMenu: string = '';

  constructor(private router: Router) {
    // Escuchar cambios de ruta
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateActiveMenu(event.url);
      }
    });
  }

  ngOnInit() {
    this.updateActiveMenu(this.router.url);
  }

  updateActiveMenu(url: string) {
    if (url.includes('usuarios/crear')) {
      this.activeMenu = 'usuarios/crear';
      this.showUsuariosSubmenu = true;
    } else if (url.includes('usuarios')) {
      this.activeMenu = 'usuarios/lista';
      this.showUsuariosSubmenu = true;
    } else if (url.includes('pacientes/crear')) {
      this.activeMenu = 'pacientes/crear';
      this.showPacientesSubmenu = true;
    } else if (url.includes('pacientes')) {
      this.activeMenu = 'pacientes/lista';
      this.showPacientesSubmenu = true;
    } else if (url.includes('dashboard')) {
      this.activeMenu = 'dashboard';
    }
  }

  toggleUsuarios() {
    this.showUsuariosSubmenu = !this.showUsuariosSubmenu;
  }

  togglePacientes() {
    this.showPacientesSubmenu = !this.showPacientesSubmenu;
  }
  
  toggleCamas() {
    this.showCamasSubmenu = !this.showCamasSubmenu;
  }

  toggleEvaluacion() {
    this.showEvaluacionSubmenu = !this.showEvaluacionSubmenu;
  }

  navigateTo(route: string) {
    this.activeMenu = route;
    switch(route) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'usuarios/lista':
        this.router.navigate(['/usuarios']);
        break;
      case 'usuarios/crear':
        this.router.navigate(['/usuarios/crear']);
        break;
      case 'pacientes/lista':
        this.router.navigate(['/pacientes']);
        break;
      case 'pacientes/crear':
        this.router.navigate(['/pacientes/crear']);
        break;
      case 'camas/seleccion':
        this.router.navigate(['/camas']);
        break;
      case 'evaluacion/calculadora':
        this.router.navigate(['/evaluacion']);
        break;
    }
  }

  

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
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
  activeMenu: string = '';

  constructor(private router: Router) {
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
    if (url.includes('usuarios')) {
      this.activeMenu = 'usuarios';
    } else if (url.includes('pacientes')) {
      this.activeMenu = 'pacientes';
    } else if (url.includes('camas')) {
      this.activeMenu = 'camas';
    } else if (url.includes('evaluacion')) {
      this.activeMenu = 'evaluacion';
    }
  }

  navigateTo(route: string) {
    // Navegar a /dashboard/ + la ruta
    this.router.navigate([`/dashboard/${route}`]);
    this.activeMenu = route;
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, SidebarComponent, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  pageTitle: string = 'Dashboard';
  nombreUsuario: string = '';
  iniciales: string = '';
  
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private movingShapes: { mesh: THREE.Mesh; speedX: number; speedY: number }[] = [];
  private animationId: number = 0;

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
        } else if (url.includes('requerimientos')) {
          this.pageTitle = 'Requerimientos Nutricionales';
        } else if (url.includes('molecula')) {
          this.pageTitle = 'Molécula Calórica';
        } else {
          this.pageTitle = 'Dashboard';
        }
      }
    });
  }

  ngAfterViewInit() {
    this.initThreeJS();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJS() {
    const container = this.canvasContainer.nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.z = 20;
    this.camera.position.y = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    // Crear figuras geométricas flotantes
    this.createFloatingShapes();

    // Luces suaves
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 1);
    this.scene.add(directionalLight);
    
    const backLight = new THREE.PointLight(0x8b5cf6, 0.3);
    backLight.position.set(0, 0, 5);
    this.scene.add(backLight);

    // Animación
    this.animate();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createFloatingShapes() {
    const colors = [0x3b82f6, 0x8b5cf6, 0xec4899, 0x06b6d4, 0xf59e0b, 0x10b981];
    const geometries = [
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.TorusGeometry(0.6, 0.2, 16, 100),
      new THREE.IcosahedronGeometry(0.7, 0),
      new THREE.ConeGeometry(0.7, 1.2, 32),
      new THREE.DodecahedronGeometry(0.6)
    ];

    // Crear 30 figuras flotantes
    for (let i = 0; i < 35; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.6,
        wireframe: Math.random() > 0.7
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Posición aleatoria
      mesh.position.x = (Math.random() - 0.5) * 35;
      mesh.position.y = (Math.random() - 0.5) * 20;
      mesh.position.z = (Math.random() - 0.5) * 15 - 10;
      
      // Rotación inicial aleatoria
      mesh.rotation.x = Math.random() * Math.PI * 2;
      mesh.rotation.y = Math.random() * Math.PI * 2;
      
      // Velocidad de movimiento
      const speedX = (Math.random() - 0.5) * 0.03;
      const speedY = (Math.random() - 0.5) * 0.02;
      
      this.scene.add(mesh);
      this.movingShapes.push({ mesh, speedX, speedY });
    }
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Mover cada figura
    this.movingShapes.forEach(shape => {
      // Mover posición
      shape.mesh.position.x += shape.speedX;
      shape.mesh.position.y += shape.speedY;
      
      // Rebote en los bordes
      if (Math.abs(shape.mesh.position.x) > 20) {
        shape.speedX *= -1;
        shape.mesh.position.x = Math.sign(shape.mesh.position.x) * 19;
      }
      if (Math.abs(shape.mesh.position.y) > 12) {
        shape.speedY *= -1;
        shape.mesh.position.y = Math.sign(shape.mesh.position.y) * 11;
      }
      
      // Rotación continua
      shape.mesh.rotation.x += 0.01;
      shape.mesh.rotation.y += 0.015;
      shape.mesh.rotation.z += 0.005;
    });
    
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
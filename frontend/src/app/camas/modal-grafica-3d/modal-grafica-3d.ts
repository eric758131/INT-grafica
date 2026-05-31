import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-modal-grafica-3d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'modal-grafica-3d.html',
  styleUrls: ['modal-grafica-3d.css']
})
export class ModalGrafica3dComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;
  
  visible = false;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private objects: THREE.Object3D[] = [];
  private animationId!: number;
  private time = 0;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.visible) {
      this.initThree();
    }
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    // Restaurar scroll del body
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }

  abrir() {
    this.visible = true;
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    setTimeout(() => {
      if (this.canvasContainer) {
        this.initThree();
      }
    }, 100);
  }

  cerrar() {
    this.visible = false;
    // Restaurar scroll del body
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private initThree() {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth;
    const height = 400;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a2a);
    this.scene.fog = new THREE.FogExp2(0x0a0a2a, 0.02);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const backLight = new THREE.PointLight(0xffffff, 0.5);
    backLight.position.set(0, 5, -5);
    this.scene.add(backLight);

    const coloredLight = new THREE.PointLight(0x3b82f6, 0.8);
    coloredLight.position.set(3, 4, 2);
    this.scene.add(coloredLight);

    // Crear gráfica 3D de camas
    this.crearGraficaCamas();

    // Animación
    this.animate();
  }

  private crearGraficaCamas() {
    // Datos de ejemplo: tipos de camas y cantidades
    const datos = [
      { estado: 'disponible', cantidad: 12, color: 0x3b82f6 },
      { estado: 'ocupada', cantidad: 8, color: 0x8b5cf6 },
      { estado: 'reservada', cantidad: 5, color: 0x06b6d4 },
      { estado: 'mantenimiento', cantidad: 3, color: 0xf59e0b }
    ];

    datos.forEach((dato, index) => {
      // Barras
      const geometry = new THREE.BoxGeometry(1.2, dato.cantidad * 0.3, 1.2);
      const material = new THREE.MeshStandardMaterial({
        color: dato.color,
        metalness: 0.7,
        roughness: 0.3,
        emissive: dato.color,
        emissiveIntensity: 0.3
      });
      const barra = new THREE.Mesh(geometry, material);
      barra.position.x = (index - 1.5) * 2;
      barra.position.y = (dato.cantidad * 0.3) / 2;
      barra.castShadow = true;
      barra.receiveShadow = true;
      this.scene.add(barra);
      this.objects.push(barra);

      // Texto con el estado usando sprite
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 128;
      if (context) {
        context.fillStyle = '#ffffff';
        context.font = 'Bold 24px Arial';
        context.fillText(dato.estado, 10, 40);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const textMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(textMaterial);
      sprite.scale.set(1.5, 0.75, 1);
      sprite.position.x = (index - 1.5) * 2;
      sprite.position.y = dato.cantidad * 0.3 + 0.8;
      this.scene.add(sprite);
      this.objects.push(sprite);

      // Esfera decorativa en la punta
      const esferaGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const esferaMat = new THREE.MeshStandardMaterial({ color: dato.color, emissive: dato.color, emissiveIntensity: 0.5 });
      const esfera = new THREE.Mesh(esferaGeo, esferaMat);
      esfera.position.x = (index - 1.5) * 2;
      esfera.position.y = dato.cantidad * 0.3 + 0.15;
      this.scene.add(esfera);
      this.objects.push(esfera);
    });

    // Piso
    const gridHelper = new THREE.GridHelper(20, 20, 0x3b82f6, 0x06b6d4);
    gridHelper.position.y = -0.5;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.3;
    this.scene.add(gridHelper);

    // Partículas de fondo
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlesPositions[i * 3] = (Math.random() - 0.5) * 50;
      particlesPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      particlesPositions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 15;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.05, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particles);
    this.objects.push(particles);
  }

  private animate = () => {
    this.time += 0.01;
    
    // Rotar la cámara suavemente
    this.camera.position.x = Math.sin(this.time * 0.2) * 2;
    this.camera.lookAt(0, 2, 0);
    
    // Animar objetos
    this.objects.forEach(obj => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry.type === 'BoxGeometry') {
          obj.rotation.y = this.time * 0.5;
        }
      }
    });
    
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };
}
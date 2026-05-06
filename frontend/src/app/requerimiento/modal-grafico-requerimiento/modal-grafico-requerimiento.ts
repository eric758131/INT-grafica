import {
  Component, Input, Output, EventEmitter,
  AfterViewInit, OnDestroy, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequerimientoNutricional } from '../../services/usuario.service';
import * as THREE from 'three';

@Component({
  selector: 'app-modal-grafico-requerimiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-grafico-requerimiento.html',
  styleUrls: ['./modal-grafico-requerimiento.css']
})
export class ModalGraficoRequerimientoComponent implements AfterViewInit, OnDestroy {

  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() req!: RequerimientoNutricional;
  @Output() cerrarModal = new EventEmitter<void>();

  get fechaFormateada(): string {
    if (!this.req?.calculado_en) return '';
    return new Date(this.req.calculado_en).toLocaleString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // ── Three.js ──────────────────────────────────────────────────
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private frameId!: number;
  private meshGroup!: THREE.Group;   // sólo los 3 cubos, para rotarlos
  private sceneGroup!: THREE.Group;  // todo lo demás estático

  private isDragging = false;
  private prevMouse = { x: 0, y: 0 };
  private rotVel = { x: 0, y: 0 };
  private boundDown!: (e: any) => void;
  private boundMove!: (e: any) => void;
  private boundUp!: () => void;
  private boundWheel!: (e: WheelEvent) => void;

  // ── Lifecycle ─────────────────────────────────────────────────
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initThree();
      this.buildBars();
      this.animate();
      this.bindOrbit();
    }, 100);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.renderer?.dispose();
    const c = this.canvasRef?.nativeElement;
    if (c) {
      c.removeEventListener('mousedown',  this.boundDown);
      c.removeEventListener('mousemove',  this.boundMove);
      c.removeEventListener('mouseup',    this.boundUp);
      c.removeEventListener('mouseleave', this.boundUp);
      c.removeEventListener('touchstart', this.boundDown);
      c.removeEventListener('touchmove',  this.boundMove);
      c.removeEventListener('touchend',   this.boundUp);
      c.removeEventListener('wheel',      this.boundWheel);
    }
  }

  cerrar(): void { this.cerrarModal.emit(); }

  // ── Init ─────────────────────────────────────────────────────
  private initThree(): void {
    const canvas  = this.canvasRef.nativeElement;
    const wrapper = canvas.parentElement!;
    const w = wrapper.clientWidth  || 500;
    const h = wrapper.clientHeight || 360;

    canvas.width  = w;
    canvas.height = h;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(0, 3, 8);
    this.camera.lookAt(0, 1, 0);

    // Luces
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 1.3);
    dir.position.set(5, 8, 5);
    this.scene.add(dir);

    // Point lights con color de cada barra
    [[0x3b82f6, -3, 4, 3], [0x10b981, 0, 4, 3], [0x8b5cf6, 3, 4, 3]].forEach(([c, x, y, z]) => {
      const l = new THREE.PointLight(c as number, 1.8, 16);
      l.position.set(x as number, y as number, z as number);
      this.scene.add(l);
    });
  }

  // ── Barras 3D ─────────────────────────────────────────────────
  private buildBars(): void {
    this.meshGroup  = new THREE.Group();
    this.sceneGroup = new THREE.Group();
    this.scene.add(this.meshGroup);
    this.scene.add(this.sceneGroup);

    const geb = +(this.req?.geb_kcal    || 0);
    const get_ = +(this.req?.get_kcal   || 0);
    const kkg  = +(this.req?.kcal_por_kg || 0);

    // Escala: normalizar al máximo para que queden proporcionales
    const maxVal = Math.max(geb, get_, 1);
    const maxH   = 3.5;   // altura máxima en unidades Three.js
    const minH   = 0.35;

    const barras = [
      { val: geb,  color: 0x3b82f6, emissive: 0x1e3a8a, label: 'GEB',     x: -2  },
      { val: get_, color: 0x10b981, emissive: 0x065f46, label: 'GET',     x:  0  },
      { val: kkg,  color: 0x8b5cf6, emissive: 0x4c1d95, label: 'Kcal/kg', x:  2  },
    ];

    barras.forEach(b => {
      // Altura proporcional al max (kkg se escala aparte por magnitud diferente)
      const h = b.label === 'Kcal/kg'
        ? Math.max(minH, (b.val / Math.max(kkg, 1)) * maxH * 0.6)
        : Math.max(minH, (b.val / maxVal) * maxH);

      // Cuerpo de la barra
      const geo = new THREE.BoxGeometry(0.85, h, 0.85);
      const mat = new THREE.MeshStandardMaterial({
        color: b.color,
        emissive: b.emissive,
        emissiveIntensity: 0.25,
        metalness: 0.45,
        roughness: 0.3,
        transparent: true,
        opacity: 0.92,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, h / 2, 0);
      this.meshGroup.add(mesh);

      // Aristas brillantes
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
      );
      edges.position.copy(mesh.position);
      this.meshGroup.add(edges);

      // Tapa superior con glow
      const capGeo = new THREE.BoxGeometry(0.88, 0.06, 0.88);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: b.color, emissiveIntensity: 0.9,
        transparent: true, opacity: 0.85,
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(b.x, h + 0.03, 0);
      this.meshGroup.add(cap);

      // Plataforma base
      const baseGeo = new THREE.BoxGeometry(1.05, 0.07, 1.05);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3, roughness: 0.6 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(b.x, 0.035, 0);
      this.sceneGroup.add(base);
    });

    // Grid de suelo
    const grid = new THREE.GridHelper(9, 18, 0x1e40af, 0x1e293b);
    grid.position.y = 0;
    this.sceneGroup.add(grid);

    // Plano semitransparente de suelo
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 5),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, transparent: true, opacity: 0.6 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    this.sceneGroup.add(floor);

    // Partículas flotantes decorativas
    const pCount = 180;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 14;
      pPos[i * 3 + 1] = Math.random() * 6;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeo,
      new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.06, transparent: true, opacity: 0.45 })
    );
    this.sceneGroup.add(particles);

    // Tilt inicial para perspectiva
    this.meshGroup.rotation.y  = 0.3;
    this.sceneGroup.rotation.y = 0.3;
  }

  // ── Animación ─────────────────────────────────────────────────
  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());

    // Rotación por arrastre
    this.meshGroup.rotation.y  += this.rotVel.y;
    this.sceneGroup.rotation.y += this.rotVel.y;
    this.meshGroup.rotation.x  += this.rotVel.x;

    if (!this.isDragging) {
      this.rotVel.x *= 0.9;
      this.rotVel.y *= 0.9;
      // Auto-rotación suave cuando está idle
      if (Math.abs(this.rotVel.y) < 0.001) {
        this.meshGroup.rotation.y  += 0.004;
        this.sceneGroup.rotation.y += 0.004;
      }
    }

    // Cámara suave flotante
    const t = Date.now() * 0.001;
    this.camera.position.y = 3 + Math.sin(t * 0.25) * 0.08;

    this.renderer.render(this.scene, this.camera);
  }

  // ── Orbit controls ────────────────────────────────────────────
  private bindOrbit(): void {
    const canvas = this.canvasRef.nativeElement;

    this.boundDown = (e: MouseEvent | TouchEvent) => {
      this.isDragging = true;
      const pt = 'touches' in e ? (e as TouchEvent).touches[0] : e as MouseEvent;
      this.prevMouse = { x: pt.clientX, y: pt.clientY };
    };
    this.boundMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      const pt = 'touches' in e ? (e as TouchEvent).touches[0] : e as MouseEvent;
      this.rotVel.y = (pt.clientX - this.prevMouse.x) * 0.006;
      this.rotVel.x = (pt.clientY - this.prevMouse.y) * 0.004;
      this.prevMouse = { x: pt.clientX, y: pt.clientY };
    };
    this.boundUp    = () => { this.isDragging = false; };
    this.boundWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.camera.position.z = Math.max(3, Math.min(14, this.camera.position.z + e.deltaY * 0.012));
    };

    canvas.addEventListener('mousedown',  this.boundDown);
    canvas.addEventListener('mousemove',  this.boundMove);
    canvas.addEventListener('mouseup',    this.boundUp);
    canvas.addEventListener('mouseleave', this.boundUp);
    canvas.addEventListener('touchstart', this.boundDown, { passive: true });
    canvas.addEventListener('touchmove',  this.boundMove, { passive: true });
    canvas.addEventListener('touchend',   this.boundUp);
    canvas.addEventListener('wheel',      this.boundWheel, { passive: false });
  }
}

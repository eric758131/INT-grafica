import {
  Component, Input, Output, EventEmitter,
  AfterViewInit, OnDestroy, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoleculaCalorica } from '../../services/usuario.service';
import * as THREE from 'three';

@Component({
  selector: 'app-modal-grafico-3d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-grafico-3d.html',
  styleUrls: ['./modal-grafico-3d.css']
})
export class ModalGrafico3dComponent implements AfterViewInit, OnDestroy {

  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() mol!: MoleculaCalorica;
  @Output() cerrarModal = new EventEmitter<void>();

  // Normaliza: soporta tanto 0.30 como 30 como valor de porcentaje
  private toPct(val: any): number {
    const n = parseFloat(val) || 0;
    return n > 1 ? n / 100 : n;
  }

  get protPct(): number { return Math.round(this.toPct(this.mol?.porcentaje_proteinas)     * 100); }
  get grasPct(): number { return Math.round(this.toPct(this.mol?.porcentaje_grasas)        * 100); }
  get carbPct(): number { return Math.round(this.toPct(this.mol?.porcentaje_carbohidratos) * 100); }

  get fechaFormateada(): string {
    if (!this.mol?.created_at) return '';
    return new Date(this.mol.created_at).toLocaleString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private frameId!: number;
  private group!: THREE.Group;
  private isDragging = false;
  private prevMouse = { x: 0, y: 0 };
  private rotVel = { x: 0, y: 0 };
  private boundDown!: (e: any) => void;
  private boundMove!: (e: any) => void;
  private boundUp!: () => void;
  private boundWheel!: (e: WheelEvent) => void;

  ngAfterViewInit(): void {
    // setTimeout garantiza que el modal ya tiene dimensiones reales en el DOM
    setTimeout(() => {
      this.initThree();
      this.buildDonut();
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

  private initThree(): void {
    const canvas  = this.canvasRef.nativeElement;
    const wrapper = canvas.parentElement!;
    const w = wrapper.clientWidth  || 400;
    const h = wrapper.clientHeight || 340;

    canvas.width  = w;
    canvas.height = h;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
    this.renderer.setClearColor(0x000000, 0);

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(0, 1.2, 5.5);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(4, 6, 4);
    this.scene.add(dir);

    [[0xa855f7, 4, 2, 3], [0xf59e0b, -4, 2, 3], [0x3b82f6, 0, -4, 3]].forEach(([color, x, y, z]) => {
      const l = new THREE.PointLight(color as number, 2, 14);
      l.position.set(x as number, y as number, z as number);
      this.scene.add(l);
    });
  }

  private buildDonut(): void {
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // DEBUG: ver exactamente qué llega
    console.log('[Grafico3D] mol recibido:', JSON.stringify(this.mol, null, 2));

    const slices = [
      { pct: this.toPct(this.mol?.porcentaje_proteinas),     color: 0xa855f7, emissive: 0x5b21b6 },
      { pct: this.toPct(this.mol?.porcentaje_grasas),        color: 0xf59e0b, emissive: 0x92400e },
      { pct: this.toPct(this.mol?.porcentaje_carbohidratos), color: 0x3b82f6, emissive: 0x1e40af },
    ];

    console.log('[Grafico3D] pct calculados:', slices.map(s => s.pct));

    // Fallback si todos vienen en 0
    const total = slices.reduce((s, x) => s + x.pct, 0);
    if (total < 0.01) {
      slices[0].pct = 0.333;
      slices[1].pct = 0.333;
      slices[2].pct = 0.334;
    }

    const R = 1.8, r = 0.55, gap = 0.06;
    let angle = Math.PI / 2;

    slices.forEach(slice => {
      if (slice.pct <= 0) return;
      const arcAngle   = slice.pct * Math.PI * 2 - gap;
      const startAngle = angle + gap / 2;
      const geo = this.buildTorusArc(R, r, startAngle, startAngle + arcAngle, 60, 20);
      const mat = new THREE.MeshPhongMaterial({
        color: slice.color, emissive: slice.emissive,
        emissiveIntensity: 0.3, shininess: 90, specular: 0xffffff,
      });
      this.group.add(new THREE.Mesh(geo, mat));
      angle += slice.pct * Math.PI * 2;
    });

    this.group.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 32, 32),
      new THREE.MeshPhongMaterial({
        color: 0xffffff, emissive: 0xa855f7, emissiveIntensity: 0.7,
        transparent: true, opacity: 0.9, shininess: 140,
      })
    ));

    this.group.rotation.x = -0.35;
  }

  private buildTorusArc(R: number, r: number, startAngle: number, endAngle: number, tubSegs: number, radSegs: number): THREE.BufferGeometry {
    const positions: number[] = [], normals: number[] = [], indices: number[] = [];
    const tSegs = Math.max(4, Math.round(tubSegs * Math.abs(endAngle - startAngle) / (Math.PI * 2)));

    for (let j = 0; j <= tSegs; j++) {
      const u = startAngle + (j / tSegs) * (endAngle - startAngle);
      for (let i = 0; i <= radSegs; i++) {
        const v = (i / radSegs) * Math.PI * 2;
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);
        positions.push(x, y, z);
        normals.push(x - R * Math.cos(u), y - R * Math.sin(u), z);
      }
    }
    for (let j = 0; j < tSegs; j++) {
      for (let i = 0; i < radSegs; i++) {
        const a = j * (radSegs + 1) + i, b = a + radSegs + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals,   3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());
    this.group.rotation.y += this.rotVel.y;
    this.group.rotation.x += this.rotVel.x;
    if (!this.isDragging) {
      this.rotVel.x *= 0.92;
      this.rotVel.y *= 0.92;
      if (Math.abs(this.rotVel.y) < 0.001) this.group.rotation.y += 0.005;
    }
    this.renderer.render(this.scene, this.camera);
  }

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
      this.rotVel.x = (pt.clientY - this.prevMouse.y) * 0.006;
      this.prevMouse = { x: pt.clientX, y: pt.clientY };
    };
    this.boundUp    = () => { this.isDragging = false; };
    this.boundWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.camera.position.z = Math.max(2.5, Math.min(9, this.camera.position.z + e.deltaY * 0.01));
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
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalUsuarioComponent } from '../modal-usuario/modal-usuario';
import { UsuarioService, Usuario } from '../../services/usuario.service';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, ModalUsuarioComponent],
  templateUrl: './lista-usuarios.html',
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  mostrarModal = false;
  usuarioSeleccionado: Usuario | null = null;
  loading = false; // 👈 AÑADE ESTA LÍNEA

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef // 👈 AÑADE ESTA LÍNEA
  ) {}

  ngOnInit() {
    console.log('ListaUsuariosComponent inicializado'); // 👈 AÑADE ESTA LÍNEA
    this.cargar();
  }

  cargar() {
    this.loading = true; // 👈 AÑADE ESTA LÍNEA
    console.log('Cargando usuarios...'); // 👈 AÑADE ESTA LÍNEA
    
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        console.log('Usuarios recibidos:', data); // 👈 AÑADE ESTA LÍNEA
        this.usuarios = [...data]; // 👈 CAMBIA esta línea (agrega los corchetes y spread)
        this.loading = false; // 👈 AÑADE ESTA LÍNEA
        this.cdr.detectChanges(); // 👈 AÑADE ESTA LÍNEA
      },
      error: (err) => { // 👈 CAMBIA esta parte (agrega error handling)
        console.error('Error al cargar usuarios:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal() {
    console.log('Abriendo modal para nuevo usuario'); // 👈 AÑADE ESTA LÍNEA
    this.usuarioSeleccionado = null;
    this.mostrarModal = true;
    this.cdr.detectChanges(); // 👈 AÑADE ESTA LÍNEA
  }

  abrirModalEditar(usuario: Usuario) {
    console.log('Abriendo modal para editar usuario:', usuario); // 👈 AÑADE ESTA LÍNEA
    this.usuarioSeleccionado = { ...usuario }; // 👈 CAMBIA esta línea (agrega spread)
    this.mostrarModal = true;
    this.cdr.detectChanges(); // 👈 AÑADE ESTA LÍNEA
  }

  cerrarModal() {
    console.log('Cerrando modal'); // 👈 AÑADE ESTA LÍNEA
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
    this.cdr.detectChanges(); // 👈 AÑADE ESTA LÍNEA
  }

  recargar() {
    console.log('Recargando lista de usuarios...'); // 👈 AÑADE ESTA LÍNEA
    this.cargar();
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Eliminar este usuario?')) {
      this.usuarioService.deleteUsuario(id).subscribe({
        next: () => { // 👈 CAMBIA esta parte (agrega next/error)
          console.log('Usuario eliminado correctamente');
          this.cargar();
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          alert('Error al eliminar usuario');
        }
      });
    }
  }
}
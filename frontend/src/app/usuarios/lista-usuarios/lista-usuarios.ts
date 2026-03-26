import { Component, OnInit } from '@angular/core';
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

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.usuarioService.getUsuarios().subscribe(data => this.usuarios = data);
  }

  abrirModal() {
    this.usuarioSeleccionado = null;
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
  }

  recargar() {
    this.cargar();
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Eliminar este usuario?')) {
      this.usuarioService.deleteUsuario(id).subscribe(() => this.cargar());
    }
  }
}
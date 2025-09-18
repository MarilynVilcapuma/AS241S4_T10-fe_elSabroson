import Swal from 'sweetalert2';
import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { UsersFormComponent } from '../users-form/users-form.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../core/services/users.service';
import { Users } from '../../../core/interfaces/users';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-users-list',
  imports: [UsersFormComponent, FormsModule, CommonModule],
  standalone: true,
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {

  @ViewChild(UsersFormComponent) userFormComponent!: UsersFormComponent;

  users: Users[] = [];
  filteredUsers: Users[] = [];

  searchTerm: string = '';
  selectedRole: string = '';
  selectedState: string = '';

  showUserForm = false;
  selectedUser: Users | null = null;
  selectedImageFile?: File; // archivo seleccionado para subir
  previewImage?: string;

  private userService = inject(UsersService);

  ngOnInit() {
    this.loadUsers();
  }

  getImageUrl(imagePath?: string): string {
    return imagePath
      ? `${environment.urlBackEnd}${imagePath}`
      : 'assets/no-image.png';
  }

  // Metodo para listar todos los usuarios
  loadUsers() {
    this.userService.findAll().subscribe(users => {
      this.users = users
        .map(user => ({ ...user, showPassword: false }))
        .sort((a, b) => b.users_id! - a.users_id!);
      this.filteredUsers = [...this.users];
      console.log(this.users);
    });
  }

  getInitials(name: string, lastName: string): string {
    const firstInitial = name ? name.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  onImageFromChild(file: File) {
  console.log('Imagen recibida del hijo:', file);
  this.selectedImageFile = file;
}



  //Metodo para abrir el fomrmulario de usuarios
  openUserForm(user?: Users) {
    this.selectedUser = user ? { ...user } : null;
    this.showUserForm = true;
  }

  // Metodo para cerrar el formulario de usuarios
  closeUserForm() {
    console.log("🛑 Padre recibió (cancel) → cerrando modal");
    this.showUserForm = false;
    this.selectedUser = null;
  }

  togglePasswordVisibility(user: any): void {
    user.showPassword = !user.showPassword;
  }

  // Crear usuario
  createUser(user: Users) {
    Swal.fire({
      title: 'Crear usuario',
      text: '¿Deseas crear este usuario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (result.isConfirmed) {
        this.userService.save(user).subscribe({
          next: createdUser => this.handleUserSaveOrUpdate(createdUser.users_id!),
          error: () => Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al crear el usuario',
            confirmButtonColor: '#dc3545'
          })
        });
      }
    });
  }

  // Actualizar usuario
  updateUser(user: Users) {
    Swal.fire({
      title: 'Actualizar usuario',
      text: '¿Deseas actualizar este usuario?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (result.isConfirmed) {
        this.userService.update(user).subscribe({
          next: updatedUser => this.handleUserSaveOrUpdate(updatedUser.users_id!),
          error: () => Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar el usuario',
            confirmButtonColor: '#dc3545'
          })
        });
      }
    });
  }

  // Método común para manejar guardado/actualización con imagen opcional
  private handleUserSaveOrUpdate(userId: number) {
    const upload$ = this.selectedImageFile
      ? this.userService.uploadImage(userId, this.selectedImageFile)
      : null;

    if (upload$) {
      upload$.subscribe({
        next: () => this.finalizeUserAction(),
        error: () => this.finalizeUserAction()
      });
    } else {
      this.finalizeUserAction();
    }
  }

  // Limpieza y mensaje final
  private finalizeUserAction() {
    this.loadUsers();
    this.userFormComponent.resetForm();
    this.closeUserForm();
    this.selectedImageFile = undefined;
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Operación realizada correctamente',
      confirmButtonColor: '#28a745'
    });
  }



  // Metodo para abrir el formulario y poder editar el usuario
  editUser(user: Users) {
    this.openUserForm(user);
  }

// Metodo para eliminar un usuario de manera logica + reemplazo de alertas nativas por sweetAlert
deleteUser(users_id: number) {
  Swal.fire({
    title: 'Confirmación',
    text: '¿Estás seguro de eliminar este registro?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  }).then(result => {
    if (result.isConfirmed) {
      this.userService.delete(users_id).subscribe({
        next: () => {
          this.loadUsers();
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Usuario eliminado correctamente',
            confirmButtonColor: '#28a745'
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el usuario',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    }
  });
}

  // Metodo para restaurar un usuario de manera logica + reemplazo de alertas nativas por sweetAlert
  restoreUser(users_id: number) {
  Swal.fire({
    title: 'Restaurar',
    text: '¿Deseas restaurar este registro?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, restaurar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#6c757d'
  }).then(result => {
    if (result.isConfirmed) {
      this.userService.restore(users_id).subscribe({
        next: () => {
          this.loadUsers();
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Usuario restaurado correctamente',
            confirmButtonColor: '#28a745'
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo restaurar el usuario',
            confirmButtonColor: '#dc3545'
          });
        }
      });
    }
  });
}

  // Metodo para el buscador, para el filtro de roles y filtro de estados
  filterUsers() {

    this.currentPage = 1;

    const term = this.searchTerm.toLowerCase();

    this.filteredUsers = this.users.filter(user => {
      const matchesTerm =
        user.name.toLowerCase().includes(term) ||
        user.last_name.toLowerCase().includes(term) ||
        user.document_number.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);

      const matchesRole = this.selectedRole
        ? user.role.toLowerCase() === this.selectedRole.toLowerCase()
        : true;

      const matchesState = this.selectedState
        ? user.state?.toLowerCase() === this.selectedState.toLowerCase()
        : true;

      return matchesTerm && matchesRole && matchesState;
    });
  }

  itemsPerPage = 7;
  currentPage = 1;

  get paginatedUsers(): Users[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  reportPdf() {
    this.userService.reportPdf().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reporte.pdf'; // nombre temporal
      link.click();
      URL.revokeObjectURL(url);
    });
  }





}



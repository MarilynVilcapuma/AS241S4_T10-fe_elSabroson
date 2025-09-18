import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Users } from '../../../core/interfaces/users';
import { environment } from '../../../../environments/environment';
import { UsersService } from '../../../core/services/users.service';


@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.scss'
})
export class UsersFormComponent implements OnChanges {

  @Input() visible: boolean = false;
  @Input() user: Users | null = null;

  @Output() closeForm  = new EventEmitter<void>();
  @Output() create = new EventEmitter<Users>();
  @Output() update = new EventEmitter<Users>();
  @Output() imageSelected = new EventEmitter<File>();

  showPassword: boolean = false;

  formUser: Users = this.getEmptyUser();
  selectedImageFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;

  private userService = inject(UsersService);


ngOnChanges(changes: SimpleChanges): void {
  if (changes['user'] && this.user) {
    this.formUser = { ...this.user };
    // Usamos el service para obtener la URL de la imagen
    this.previewImage = this.userService.getUserImageUrl(this.user.imagePath);
    console.log('URL final de la imagen:', this.previewImage);
    this.selectedImageFile = null; 
  }
}

  onCancel() {
    this.resetForm();
    this.closeForm.emit();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);

      // Si quieres emitir al padre
      this.imageSelected.emit(this.selectedImageFile);
    }
  }



  onSubmit() {
    // variable para detectar si que el registro no contenga binarios 0 y 1
    const isBinary = (num: string): boolean => /^[01]+$/.test(num);
    // Variable para detectar si todos los digitos son inguales
    const hasAllSameDigits = (num: string): boolean => /^(\d)\1+$/.test(num);

    const {
      name,
      last_name,
      document_type,
      document_number,
      cellphone,
      email,
      role
    } = this.formUser;

    // Variable que captura los campos y valida que no esten vacions
    const allFieldsEmpty =
      !name && !last_name && !document_type && !document_number && !cellphone && !email && !role;

    // Alerta de vaidacion -- campos vacios  
    if (allFieldsEmpty) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario vacío',
        text: 'Debe rellenar todos los campos antes de continuar.'
      });
      return;
    }

    // Variable que obtiene el nombre y valida que no yenga numeros y caracteres raros
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    // Alerta de validacion -- nombre incorrecto
    if (!name || !nameRegex.test(name.trim())) {
      Swal.fire({
        icon: 'error',
        title: 'Nombre inválido',
        text: 'El nombre es obligatorio y solo puede contener letras, espacios, tildes y "ñ".'
      });
      return;
    }

    // Alerta de validacion -- apellido incorrecto
    if (!last_name || !nameRegex.test(last_name.trim())) {
      Swal.fire({
        icon: 'error',
        title: 'Apellido inválido',
        text: 'El apellido es obligatorio y solo puede contener letras, espacios, tildes y "ñ".'
      });
      return;
    }

    // Alerta de validacion -- elejir una opcion de tipo documento
    if (!document_type) {
      Swal.fire({
        icon: 'error',
        title: 'Tipo de documento requerido',
        text: 'Debe seleccionar un tipo de documento.'
      });
      return;
    }

    // Alerta de validacion -- Obligatorio de ingresar un numero de documento
    if (!document_number) {
      Swal.fire({
        icon: 'error',
        title: 'Número de documento requerido',
        text: 'Debe ingresar el número de documento.'
      });
      return;
    }

    // Variable que obtiene el numero de documento 
    const docNum = document_number.trim();

    // Alerta de validaciones -- El DNI debe de tner 8 digitod y no puede contener 0 1 y combinaciones 
    if (document_type === 'DNI') {
      if (!/^\d{8}$/.test(docNum)) {
        Swal.fire({
          icon: 'error',
          title: 'DNI inválido',
          text: 'El DNI debe tener exactamente 8 dígitos numéricos.'
        });
        return;
      }
      if (hasAllSameDigits(docNum) || isBinary(docNum)) {
        Swal.fire({
          icon: 'error',
          title: 'DNI inválido',
          text: 'El DNI no puede contener solo ceros, unos, o combinaciones binarias.'
        });
        return;
      }
    }

    // Alerta de validaciones -- El CNE debe de tner 8 digitod y no puede contener 0 1 y combinaciones 
    if (document_type === 'CNE') {
      if (!/^\d{20}$/.test(docNum)) {
        Swal.fire({
          icon: 'error',
          title: 'CNE inválido',
          text: 'El CNE debe tener exactamente 20 dígitos numéricos.'
        });
        return;
      }
      if (hasAllSameDigits(docNum) || isBinary(docNum)) {
        Swal.fire({
          icon: 'error',
          title: 'CNE inválido',
          text: 'El CNE no puede contener solo ceros, unos, o combinaciones binarias.'
        });
        return;
      }
    }

    // Alerta de validacion -- El celular debe de comenzar con nueve y tener 9 digitos
    if (!/^9\d{8}$/.test(cellphone.trim())) {
      Swal.fire({
        icon: 'error',
        title: 'Celular inválido',
        text: 'El número debe comenzar con 9 y tener exactamente 9 dígitos numéricos.'
      });
      return;
    }

    // Alerta de validacion -- El celular no puede tener todos los digitos iguales
    if (hasAllSameDigits(cellphone.trim())) {
      Swal.fire({
        icon: 'error',
        title: 'Celular inválido',
        text: 'El número no puede tener todos los dígitos iguales.'
      });
      return;
    }

    // Alerta de validacion -- Debe de ingresar un correo valido
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com)$/;
    if (!email || !emailRegex.test(email.trim())) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Debe ingresar un correo válido de gmail, hotmail, outlook o yahoo.'
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/;
    if (!this.formUser.password || !passwordRegex.test(this.formUser.password)) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña inválida',
        text: 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.'
      });
      return;
    }

    // Alerta de validacion -- elejir un rol para el usuario
    if (!role) {
      Swal.fire({
        icon: 'error',
        title: 'Rol requerido',
        text: 'Debe seleccionar un rol.'
      });
      return;
    }


    if (this.user) {
      this.update.emit({ ...this.formUser, selectedImageFile: this.selectedImageFile } as any);
    } else {
      const newUser = { ...this.formUser };
      delete newUser.users_id;
      this.create.emit({ ...newUser, selectedImageFile: this.selectedImageFile } as any);
    }



    // Si pasa todas las validaciones
    if (this.user) {
      this.update.emit(this.formUser);
    } else {
      const newUser = { ...this.formUser };
      delete newUser.users_id;
      this.create.emit(newUser);
    }
  }

  resetForm() {
    this.formUser = this.getEmptyUser();

    // Limpia imagen seleccionada
    this.previewImage = null;
    this.selectedImageFile = null;

    // Limpia el input file en el DOM
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private getEmptyUser(): Users {
    return {
      name: '',
      last_name: '',
      document_type: '',
      document_number: '',
      cellphone: '',
      email: '',
      password: '',
      role: '',
      state: 'A',
      registration_date: ''
    } as Users;
  }
}

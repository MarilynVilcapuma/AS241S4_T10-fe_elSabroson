import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Products } from '../../../core/interfaces/products';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-products-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatInputModule],
  templateUrl: './products-form.component.html',
  styleUrls: ['./products-form.component.scss']
})
export class ProductsFormComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() productData: Products | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() create = new EventEmitter<Products>();
  @Output() update = new EventEmitter<Products>();

  productForm!: FormGroup;

  categoriesOptions = [
    { value: 'P', label: 'Plato', icon: '🍽️' },
    { value: 'B', label: 'Bebida', icon: '🥤' }
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.productForm) {
      if (changes['visible'] && changes['visible'].currentValue === true) {
        if (this.productData) {
          this.productForm.patchValue({
            productId: this.productData.productId,
            name: this.productData.name,
            description: this.productData.description,
            category: this.productData.category,
            price: this.productData.price,
            stock: this.productData.stock,
            state: 'A'
          });
          this.updatePriceValidator();
        } else {
          this.productForm.reset({
            productId: null,
            name: '',
            description: '',
            category: '',
            price: null,
            stock: 1,
            state: 'A'
          });
          this.updatePriceValidator();
        }
      } else if (changes['visible'] && changes['visible'].currentValue === false) {
        this.productForm.reset();
      }
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      productId: [null],
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      description: ['', [
        Validators.required,
        Validators.maxLength(200),
        Validators.pattern(/^(?!\s*$).+/)
      ]],
      category: ['', [
        Validators.required,
        Validators.pattern(/^[PB]$/)
      ]],
      price: [null, [
        Validators.required,
        Validators.min(0.01)
      ]],
      stock: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(9999)
      ]],
      state: ['A']
    });

    // Establecer el validador condicional del precio
    this.productForm.get('category')?.valueChanges.subscribe(() => {
      this.updatePriceValidator();
    });
  }

  updatePriceValidator(): void {
    const priceControl = this.productForm.get('price');
    const categoryControl = this.productForm.get('category');

    if (categoryControl?.value === 'P') {
      // Si es 'Plato', precio debe ser mayor o igual a 10
      priceControl?.setValidators([
        Validators.required,
        Validators.min(10)
      ]);
    } else if (categoryControl?.value === 'B') {
      // Si es 'Bebida', precio debe ser mayor o igual a 1
      priceControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
    } else {
      // Si no hay categoría seleccionada, validador por defecto
      priceControl?.setValidators([
        Validators.required,
        Validators.min(0.01)
      ]);
    }

    priceControl?.updateValueAndValidity();
  }

  getCurrentDate(): string {
    // Mostrar fecha simple para el usuario
    const now = new Date();
    return now.toLocaleDateString('es-PE');
  }

  getCurrentDateForInput(): string {
    // Formato YYYY-MM-DD para input type="date"
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  getStockLevelClass(): string {
    const stock = this.productForm.get('stock')?.value || 0;
    if (stock <= 10) return 'low';
    if (stock <= 50) return 'medium';
    return 'high';
  }

  getStockIcon(): string {
    const stock = this.productForm.get('stock')?.value || 0;
    if (stock <= 10) return 'warning';
    if (stock <= 50) return 'info';
    return 'check_circle';
  }

  getStockMessage(): string {
    const stock = this.productForm.get('stock')?.value || 0;
    if (stock <= 0) return 'Sin stock';
    if (stock <= 10) return 'Stock bajo';
    if (stock <= 50) return 'Stock medio';
    return 'Stock alto';
  }

  onCancel(): void {
    this.visible = false;
    this.cancel.emit();
  }

  onSubmit(): void {
    // Recortar los espacios al principio y al final de los campos de texto
    const name = this.productForm.get('name')?.value;
    const description = this.productForm.get('description')?.value;

    const trimmedName = name ? name.trim() : '';
    const trimmedDescription = description ? description.trim() : '';

    // Establecer los valores recortados en el formulario
    this.productForm.get('name')?.setValue(trimmedName);
    this.productForm.get('description')?.setValue(trimmedDescription);

    if (this.productForm.valid) {
      const formValue = this.productForm.value;

      // NO enviamos registrationDate - se maneja en el backend
      const productToEmit: Products = {
        productId: formValue.productId,
        name: formValue.name,
        description: formValue.description,
        category: formValue.category,
        price: formValue.price,
        stock: formValue.stock,
        state: formValue.state
      };

      if (productToEmit.productId) {
        this.update.emit(productToEmit);
      } else {
        // Eliminar el productId para productos nuevos
        delete productToEmit.productId;
        this.create.emit(productToEmit);
      }
      this.visible = false;
    } else {
      this.productForm.markAllAsTouched();
      console.error('Formulario inválido. Por favor, revisa los campos.');
    }
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.productForm.get(controlName);
    return control ? control.hasError(errorType) && (control.touched || control.dirty) : false;
  }
}

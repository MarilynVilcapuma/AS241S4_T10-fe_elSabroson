import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ProductService } from '../../../core/services/products.service';
import { Products } from '../../../core/interfaces/products';
import Swal from 'sweetalert2';
import { ProductsFormComponent } from '../products-form/products-form.component';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    ProductsFormComponent
  ],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit {
  products: Products[] = [];
  filteredProducts: Products[] = [];
  categories: string[] = [];

  showInactives = false;

  searchTerm: string = '';
  filterCategory: string = '';
  filterState: string = '';

  showProductForm: boolean = false;
  currentProduct: Products | null = null;

  // Variables para la paginación estilo DataTables
  currentPage: number = 0;
  pageSize: number = 10; // Cambiado a 10 por defecto
  totalProducts: number = 0;

  // Variables para ordenamiento
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.filterState = this.showInactives ? 'I' : 'A';
    this.loadProducts();
  }

  toggleList() {
    this.showInactives = !this.showInactives;
    this.filterState = this.showInactives ? 'I' : 'A';
    this.loadProducts();
  }

  loadProducts() {
    if (this.filterState === 'A' || this.filterState === 'I') {
      this.productService.getByState(this.filterState).subscribe((data) => {
        this.products = data;
        this.extractCategories();
        this.applyFilters();
      });
    } else {
      this.productService.getAll().subscribe((data) => {
        this.products = data;
        this.extractCategories();
        this.applyFilters();
      });
    }
  }

  extractCategories() {
    const cats = new Set<string>();
    this.products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    this.categories = Array.from(cats).sort();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch =
        this.searchTerm === '' ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory =
        this.filterCategory === '' || product.category === this.filterCategory;

      return matchesSearch && matchesCategory;
    });

    this.totalProducts = this.filteredProducts.length;
    this.currentPage = 0; // Resetear a la primera página cuando se filtran los datos
    this.applySorting();
  }

  filterProducts() {
    if (this.filterState === 'A' || this.filterState === 'I' || this.filterState === '') {
      this.loadProducts();
    } else {
      this.applyFilters();
    }
  }

  // Métodos para ordenamiento
  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  applySorting() {
    if (!this.sortColumn) return;

    this.filteredProducts.sort((a, b) => {
      let valueA: any = a[this.sortColumn as keyof Products];
      let valueB: any = b[this.sortColumn as keyof Products];

      // Convertir a string si es necesario para la comparación
      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      // Manejar fechas
      if (this.sortColumn === 'registrationDate') {
        valueA = valueA ? new Date(valueA).getTime() : 0;
        valueB = valueB ? new Date(valueB).getTime() : 0;
      }

      // Manejar números
      if (this.sortColumn === 'price' || this.sortColumn === 'stock') {
        valueA = Number(valueA) || 0;
        valueB = Number(valueB) || 0;
      }

      let comparison = 0;
      if (valueA < valueB) {
        comparison = -1;
      } else if (valueA > valueB) {
        comparison = 1;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortClass(column: string): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  // Métodos para paginación
  getPaginatedProducts(): Products[] {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalProducts / this.pageSize);
  }

  getStartRecord(): number {
    if (this.totalProducts === 0) return 0;
    return (this.currentPage * this.pageSize) + 1;
  }

  getEndRecord(): number {
    const endRecord = (this.currentPage + 1) * this.pageSize;
    return Math.min(endRecord, this.totalProducts);
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages() - 1) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  onPageSizeChange() {
    this.currentPage = 0; // Resetear a la primera página
  }

  getVisiblePages(): number[] {
    const totalPages = this.getTotalPages();
    const maxVisiblePages = 5;
    const pages: number[] = [];

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  // Método para determinar la clase del stock
  getStockClass(stock: number): string {
    if (stock <= 10) return 'stock-low';
    if (stock <= 50) return 'stock-medium';
    return 'stock-high';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  editProduct(product: Products) {
    this.currentProduct = { ...product };
    this.showProductForm = true;
  }

  deleteProduct(id?: number) {
    if (!id) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el producto de forma lógica.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.delete(id).subscribe(() => {
          Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
          this.loadProducts();
        }, error => {
          Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
        });
      }
    });
  }

  restoreProduct(id?: number) {
    if (!id) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción restaurará el producto.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.restore(id).subscribe(() => {
          Swal.fire('Restaurado', 'El producto ha sido restaurado.', 'success');
          this.loadProducts();
        }, error => {
          Swal.fire('Error', 'No se pudo restaurar el producto.', 'error');
        });
      }
    });
  }

  openProductForm() {
    this.currentProduct = null;
    this.showProductForm = true;
  }

  onProductFormCancel() {
    this.showProductForm = false;
    this.currentProduct = null;
  }

  onProductFormCreate(newProduct: Products) {
    this.productService.create(newProduct).subscribe({
      next: (savedProduct) => {
        Swal.fire('¡Éxito!', 'Producto creado correctamente.', 'success');
        this.loadProducts();
        this.showProductForm = false;
        this.currentProduct = null;
      },
      error: (error) => {
        Swal.fire('Error', 'No se pudo crear el producto.', 'error');
        console.error('Error creando producto:', error);
      }
    });
  }

  onProductFormUpdate(updatedProduct: Products) {
    if (!updatedProduct.productId) {
      console.error('Error: No se encontró el ID del producto para la actualización.');
      Swal.fire('Error', 'No se pudo actualizar el producto: ID faltante.', 'error');
      return;
    }

    this.productService.update(updatedProduct.productId, updatedProduct).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Producto actualizado correctamente.', 'success');
        this.loadProducts();
        this.showProductForm = false;
        this.currentProduct = null;
      },
      error: (error) => {
        Swal.fire('Error', 'No se pudo actualizar el producto.', 'error');
        console.error('Error actualizando producto:', error);
      }
    });
  }

  private mapProductState(product: Products): Products {
    const mappedProduct = { ...product };
    if (mappedProduct.state === 'Activo') {
      mappedProduct.state = 'A';
    } else if (mappedProduct.state === 'Inactivo') {
      mappedProduct.state = 'I';
    }
    return mappedProduct;
  }

  reportPdf() {
    this.productService.reportPdf().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reporte.pdf';
      link.click();
      URL.revokeObjectURL(url);
    });
  }
}

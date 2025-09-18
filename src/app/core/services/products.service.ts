import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Products } from '../interfaces/products';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.urlBackEnd}/v1/api/products`;

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getAll(): Observable<Products[]> {
    return this.http.get<Products[]>(this.apiUrl);
  }

  // Obtener producto por ID
  getById(id: number): Observable<Products> {
    return this.http.get<Products>(`${this.apiUrl}/${id}`);
  }

  // Obtener productos por estado ('A' o 'I')
  getByState(state: string): Observable<Products[]> {
    return this.http.get<Products[]>(`${this.apiUrl}/state/${state}`);
  }


  // Crear un nuevo producto
  create(product: Products): Observable<Products> {
    return this.http.post<Products>(`${this.apiUrl}/save`, product);
  }

  // Actualizar producto por ID
  update(id: number, product: Products): Observable<Products> {
    return this.http.put<Products>(`${this.apiUrl}/${id}`, product);
  }

  // Eliminar producto lógicamente por ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Restaurar producto eliminado lógicamente por ID
  restore(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/restore/${id}`, null);
  }

  reportPdf() {
    return this.http.get(`${this.apiUrl}/pdf`, { responseType: 'blob' });
  }

}

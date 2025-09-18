import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Users } from '../interfaces/users';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor() { }

  private http = inject(HttpClient);
  private urlBackEnd = `${environment.urlBackEnd}/v1/api/users`;

  findAll(): Observable<Users[]> {
    return this.http.get<Users[]>(this.urlBackEnd);
  }

  findByState(state: string): Observable<Users[]> {
    return this.http.get<Users[]>(`${this.urlBackEnd}/estado/${state}`);
  }

  findById(usersId: number): Observable<Users> {
    return this.http.get<Users>(`${this.urlBackEnd}/${usersId}`);
  }

  save(user: Users): Observable<Users> {
    return this.http.post<Users>(`${this.urlBackEnd}/save`, user);
  }

  update(user: Users): Observable<Users> {
    return this.http.put<Users>(`${this.urlBackEnd}/update/${user.users_id}`, user);
  }


  delete(usersId: number): Observable<void> {
    return this.http.patch<void>(`${this.urlBackEnd}/delete/${usersId}`, {});
  }

  restore(usersId: number): Observable<void> {
    return this.http.patch<void>(`${this.urlBackEnd}/restore/${usersId}`, {});
  }


  reportPdf() {
    return this.http.get(`${this.urlBackEnd}/pdf`, { responseType: 'blob' });
  }

  uploadImage(userId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.urlBackEnd}/${userId}/upload-image`, formData, {
      responseType: 'text'
    });
  }


  // Método para obtener la URL de la imagen de un usuario
  getUserImageUrl(imagePath?: string): string | null {
    if (!imagePath) return null;

    const fileName = imagePath.split('/').pop();
    if (!fileName) return null;

    const encodedFileName = encodeURIComponent(fileName);
    return `${this.urlBackEnd}/images/${encodedFileName}`;
  }

}

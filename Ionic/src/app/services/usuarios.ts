import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CapacitorHttp } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  async getUsuarios(): Promise<any[]> {
    const url = `${this.baseUrl}/api/usuarios`;

    const res = await CapacitorHttp.get({
      url,
      headers: { Accept: 'application/json' },
    });

    return res.data;
  }

  Insertar(payload: UsuariosInsert): Observable<any> {
    const url = `${this.baseUrl}/api/usuarios`;
    return from(
      CapacitorHttp.post({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      }).then((res) => res.data)
    );
  }
}

export interface UsuariosInsert {
  Nombre: string;
  Email: string;
  Telefono: string;
}

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

  private resolverRespuestaHttp(res: any): any {
    const status = Number(res?.status || 0);
    if (status >= 200 && status < 300) {
      return res?.data;
    }

    throw new Error(res?.data?.message || 'Ocurrio un error en la solicitud.');
  }

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
      }).then((res) => this.resolverRespuestaHttp(res))
    );
  }

  Actualizar(idUsuario: number, payload: UsuariosUpdate): Observable<any> {
    const url = `${this.baseUrl}/api/usuarios/${idUsuario}`;
    return from(
      CapacitorHttp.put({
        url,
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      }).then((res) => this.resolverRespuestaHttp(res))
    );
  }

  Eliminar(idUsuario: number): Observable<any> {
    const url = `${this.baseUrl}/api/usuarios/${idUsuario}`;
    return from(
      CapacitorHttp.delete({
        url,
        headers: { Accept: 'application/json' },
      }).then((res) => this.resolverRespuestaHttp(res))
    );
  }
}

export interface UsuariosInsert {
  Nombre: string;
  Email: string;
  Telefono: string;
}

export interface UsuariosUpdate {
  Nombre: string;
  Email: string;
  Telefono: string;
}

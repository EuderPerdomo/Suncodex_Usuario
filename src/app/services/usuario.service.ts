import { Injectable } from '@angular/core';
import { GLOBAL } from './global';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  public url;

  constructor(
    private _http: HttpClient,
    private jwtHelper: JwtHelperService,
  ) {
    this.url = GLOBAL.url;
  }


  listar_calculos_usuario(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_calculos_usuario', { headers: headers });
  }

}

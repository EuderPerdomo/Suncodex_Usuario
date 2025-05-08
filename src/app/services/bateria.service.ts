import { Injectable } from '@angular/core';
import { Observable ,of } from "rxjs";
import { GLOBAL } from '../services/global';
import { HttpClient, HttpHeaders } from "@angular/common/http";
//import { JwtHelperService } from '@auth0/angular-jwt';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BateriaService {
  public url

  constructor(
    private _http: HttpClient,
  ) {
    this.url = GLOBAL.url;
  }


  listar_baterias(): Observable<any[]> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get<{ data: any[] }>(this.url + 'listar_baterias', { headers: headers }).pipe(
      map(response => response.data) 
    );
  }
}



import { Injectable } from '@angular/core';
import { Observable, of } from "rxjs";
import { GLOBAL } from '../services/global';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class UbicacionService {
  public url;
  constructor(
    private _http:HttpClient,
    private _router:Router
  ) { 
    this.url=GLOBAL.url
  }

  consulta_hsp(lat: any, lon: any, angle: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'consulta_hsp/' + lat + '/' + lon + '/' + angle, { headers: headers })
  }

}

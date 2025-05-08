import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { ClienteService } from '../services/cliente.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _router:Router,
    private _clienteService:ClienteService
  ){

  }

  canActivate():any{
    let access:any = this._clienteService.isAuthenticate(['cliente','empresa','instalador']); // let access:any = this._adminService.isAuthenticate();
    // console.log('Autenticado o no autenticado',access)
 
    if(!access){
      console.log('Retorna falsed')
      this._router.navigate(['/login']);//login //perfil
    }
    console.log('Retorna verdad')
    return true;
  }
  
}
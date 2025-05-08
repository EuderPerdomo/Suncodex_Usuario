import { Injectable } from '@angular/core';
import { GLOBAL } from './global';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of } from 'rxjs';

//import { v4 as uuidv4 } from 'uuid'

//const { v4: uuidv4 } = require('uuid');

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  public url;

  constructor(
    private _http: HttpClient,
    private jwtHelper: JwtHelperService,
  ) {
    this.url = GLOBAL.url;
  }

//Listado de Lamparas
 listar_lamparas_public(filtro: any): Observable<any> {
  let headers = new HttpHeaders().set('Content-Type', 'application/json');
  return this._http.get(this.url + 'listar_lamparas_public/' + filtro, { headers: headers });
}

obtener_lampara_public(slug:any):Observable<any>{
  let headers = new HttpHeaders().set('Content-Type','application/json')
  return this._http.get(this.url+ 'obtener_lampara_public/'+slug,{headers:headers})
}

// Autenticacioon y cliente

public isAuthenticate(allowedroles: string[]): boolean {
  const token = String(localStorage.getItem('token') || '');
  if (!token) {
    return false
  }

  const helper = new JwtHelperService();

  try {

    //Verificar si el token esta expirado

    if (helper.isTokenExpired(token)) {
      localStorage.clear();
      return false;
    }

    const decodedToken = helper.decodeToken(token);

    if (!decodedToken) {
      localStorage.removeItem('token')
      return false
    }

    //En este punto el token existe y es valido, se verifican los permisos
    if (allowedroles.includes(decodedToken['rol'])) {
      return true
    } else {
      return false //retornar identificador de permiso invalido
    }

  } catch (error) {
    localStorage.removeItem('token')
    return false
  }


}

obtener_cliente_guest(id: any, token: any): Observable<any> {
  let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token })
  return this._http.get(this.url + 'obtener_cliente_guest/' + id, { headers: headers })
}



obtener_usuario_usuario(token:any):Observable<any>{
  let headers = new HttpHeaders({'Content-Type':'application/json','Authorization':token});
  return this._http.get(this.url+'obtener_usuario_usuario/',{headers:headers});
}


currentUser(): Observable<any> {
  const token = localStorage.getItem('token');
  
  if (token) {
    const helper = new JwtHelperService();
    var decodedToken = helper.decodeToken(token);

    return of(decodedToken);
  } else {

    const guestUser = {
      nombres: 'guest',
      role: 'guest',
    };
    return of(guestUser); // Devuelve un objeto vacío como valor predeterminado
  }
}

  /*
  login_cliente(data: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'login_cliente', data, { headers: headers });
  }




  get_categorias_publico(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'get_categorias_publico', { headers: headers });
  }



  //Carito de comptras

  generateCartID() {
    return uuidv4()//'cart_' + Math.random().toString(36).substr(2, 9);
  }

  agregar_carrito_cliente(data: any, token: any): Observable<any> {

    if (token) {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token })
      return this._http.post(this.url + 'agregar_carrito_cliente', data, { headers: headers })

    } else {
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this._http.post(this.url + 'agregar_carrito_cliente_no_autenticado', data, { headers: headers })
    }


  }


  obtener_carrito_cliente(id: any, token: any): Observable<any> {
    if (token) {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token })
      return this._http.get(this.url + 'obtener_carrito_cliente/' + id, { headers: headers })
    } else {
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this._http.get(this.url + 'obtener_carrito_cliente_no_autenticado/' + id, { headers: headers })
    }

  }

  eliminar_carrito_cliente(id: any, token: any): Observable<any> {
    if (token) {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token })
      return this._http.delete(this.url + 'eliminar_carrito_cliente/' + id, { headers: headers })
    } else {
      let headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this._http.delete(this.url + 'eliminar_carrito_cliente_no_autenticado/' + id, { headers: headers })
    }
  }


  fusionar_carrito_cliente(id_temporal:any,id_cliente:any,token:any){
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token })
    return this._http.put(this.url + 'fusionar_carrito_cliente/' + id_temporal+ '/' +id_cliente, { headers: headers })
  }

  //Direcciones

  registro_direccion_cliente(data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'registro_direccion_cliente', data, { headers: headers });
  }

  obtener_direccion_todos_cliente(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_direccion_todos_cliente/' + id, { headers: headers });
  }

  cambiar_direccion_principal_cliente(id: any, cliente: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'cambiar_direccion_principal_cliente/' + id + '/' + cliente, { data: true }, { headers: headers });
  }

  eliminar_direccion_cliente(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'eliminar_direccion_cliente/' + id, { headers: headers });
  }

  //Inicia blogs
  listar_posts_public(filtro: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'listar_posts_public/' + filtro, { headers: headers });
  }
  //Finaliza blogs

//Inicia traer banner
obtener_banner_public(): Observable<any> {
  let headers = new HttpHeaders().set('Content-Type', 'application/json');
  return this._http.get(this.url + 'obtener_banner_public', { headers: headers });
}
//Finaliza traer banner

//
get_datos_configuracion():Observable<any>{
  return this._http.get('./assets/datos_configuracion.json',{responseType: 'text'});
}

listar_productos_nuevos_publico():Observable<any>{
  let headers = new HttpHeaders().set('Content-Type','application/json');
  return this._http.get(this.url + 'listar_productos_nuevos_publico',{headers:headers});
}

///Inicia traer Blogs nuevos
listar_blog_nuevos_publico():Observable<any>{
  let headers = new HttpHeaders().set('Content-Type','application/json');
  return this._http.get(this.url + 'listar_blog_nuevos_publico',{headers:headers});
}

*/
}
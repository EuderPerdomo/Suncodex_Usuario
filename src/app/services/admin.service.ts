import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GLOBAL } from './global';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RouterLink } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  public url;

  constructor(
    private _http: HttpClient,
  ) {
    this.url = GLOBAL.url;
  }

  login_usuario(data: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'login_cliente', data, { headers: headers });
  }

  login_admin(data: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'login_admin', data, { headers: headers });
  }

  listar_clientes_tienda(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_clientes_tienda', { headers: headers });
  }

  verificar_token(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'verificar_token', { headers: headers });
  }

  obtener_config_admin(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'obtener_config_admin', { headers: headers });
  }

  actualizar_config_admin(data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'actualizar_config_admin', data, { headers: headers });
  }

public isAuthenticate(allowedroles: string[]): boolean {
  const token = String(localStorage.getItem('token') || '');
  if (!token) {
    return false
  }
  try {
    const helper = new JwtHelperService();
    var decodedToken = helper.decodeToken(token);
    if (helper.isTokenExpired(token)) {
      localStorage.clear()
      return false
    }

    if (!decodedToken) {
      localStorage.removeItem('token')
      return false
    }

  } catch (error) {
    localStorage.removeItem('token')
    return false
  }
  //En este punto el token existe y es valido, se verifican los permisos
  if(allowedroles.includes(decodedToken['role'])){
    return true
  }else{
    return false //retornar identificador de permiso invalido
  }

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


  /* Mensajes*/
  
  obtener_mensajes_admin(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token })
    return this._http.get(this.url + 'obtener_mensajes_admin', { headers: headers })
  }

  cerrar_mensaje_admin(id: any, data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token })
    return this._http.put(this.url + 'cerrar_mensaje_admin/' + id, data, { headers: headers })
  }
  
  /* Finaliza Mensajes*/

/*PARA LA EMPRESA TOMAR A PARTIR DE AQUI */

  /*Inicia parte de Clientes */
  registro_cliente_admin(data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'registro_cliente_admin', data, { headers: headers });
  }

  obtener_cliente_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_cliente_admin/' + id, { headers: headers });
  }


  actualizar_cliente_admin(data: any, id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'actualizar_cliente_admin/' + id, data, { headers: headers });
  }

  eliminar_cliente_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_cliente_admin/' + id, { headers: headers });
  }

  /*Finaliza Parte de Clientes*/

  /*Inicia empresas */
  listar_empresas_admin(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_empresas_admin', { headers: headers });
  }

  registro_empresa_admin(data: any, file: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Authorization': token });
    const fd = new FormData();
    fd.append('nombre', data.nombre);
    fd.append('telefono', data.telefono);
    fd.append('email', data.email);
    fd.append('latitud', data.latitud);
    fd.append('longitud', data.longitud);
    fd.append('direccion', data.direccion);
    fd.append('descripcion', data.descripcion);
    fd.append('nit', data.nit);
    fd.append('password', data.password);
    fd.append('coordenadas', JSON.stringify(data.coordenadas));
    fd.append('logo', file);
    return this._http.post(this.url + 'registro_empresa_admin', fd, { headers: headers });
  }

  actualizar_empresa_admin(data: any, id: any, token: any): Observable<any> {
    if (data.logo) {
      let headers = new HttpHeaders({ 'Authorization': token });
      const fd = new FormData();
      fd.append('nombre', data.nombre);
      fd.append('telefono', data.telefono);
      fd.append('email', data.email);
      fd.append('latitud', data.latitud);
      fd.append('longitud', data.longitud);
      fd.append('direccion', data.direccion);
      fd.append('descripcion', data.descripcion);
      fd.append('nit', data.nit);
      fd.append('password', data.password);
      fd.append('logo', data.logo);
      return this._http.put(this.url + 'actualizar_empresa_admin/' + id, fd, { headers: headers });
    } else {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
      return this._http.put(this.url + 'actualizar_empresa_admin/' + id, data, { headers: headers });
    }
  }

  eliminar_empresa_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_empresa_admin/' + id, { headers: headers });
  }

  obtener_empresa_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_empresa_admin/' + id, { headers: headers });
  }

  //Finaliza empresas


  //Inicia paneles solares

  registro_panel_admin(data: any, file: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Authorization': token });
    const fd = new FormData();
    fd.append('modelo', data.modelo);
    fd.append('potencia', data.potencia);
    fd.append('eficiencia', data.eficiencia);
    fd.append('voc', data.voc);
    fd.append('peso', data.peso);
    fd.append('isc', data.isc);
    fd.append('descripcion', data.descripcion);
    fd.append('vmpp', data.vmpp);
    fd.append('impp', data.impp);
    fd.append('noct', data.noct);
    fd.append('tc_of_isc', data.tc_of_isc);
    fd.append('portada', file);
    fd.append('tc_of_voc', data.tc_of_voc);
    fd.append('tc_of_pmax', data.tc_of_pmax);
    fd.append('tension', data.tension);
    return this._http.post(this.url + 'registro_panel_admin', fd, { headers: headers });
  }


  listar_paneles_admin(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_paneles_admin', { headers: headers });
  }

  actualizar_panel_admin(data: any, id: any, token: any): Observable<any> {
    if (data.portada) {
      let headers = new HttpHeaders({ 'Authorization': token });

      const fd = new FormData();
      fd.append('modelo', data.modelo);
      fd.append('potencia', data.potencia);
      fd.append('eficiencia', data.eficiencia);
      fd.append('voc', data.voc);
      fd.append('peso', data.peso);
      fd.append('isc', data.isc);
      fd.append('descripcion', data.descripcion);
      fd.append('vmpp', data.vmpp);
      fd.append('impp', data.impp);
      fd.append('noct', data.noct);
      fd.append('tc_of_isc', data.tc_of_isc);
      fd.append('portada', data.portada);
      fd.append('tc_of_voc', data.tc_of_voc);
      fd.append('tc_of_pmax', data.tc_of_pmax);
      fd.append('tension', data.tension);

      return this._http.put(this.url + 'actualizar_panel_admin/' + id, fd, { headers: headers });
    } else {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
      return this._http.put(this.url + 'actualizar_panel_admin/' + id, data, { headers: headers });
    }
  }

  eliminar_panel_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_panel_admin/' + id, { headers: headers });
  }

  obtener_panel_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_panel_admin/' + id, { headers: headers });
  }

  //Finaliza paneles Solares


  //Inicia Baterias

  registro_bateria_admin(data: any, file: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Authorization': token });
    const fd = new FormData();
    fd.append('modelo', data.modelo);
    fd.append('voltaje', data.voltaje);
    fd.append('amperaje', data.amperaje);
    fd.append('tecnologia', data.tecnologia);
    fd.append('peso', data.peso);
    fd.append('portada', file);
    fd.append('descripcion', data.descripcion);
    return this._http.post(this.url + 'registro_bateria_admin', fd, { headers: headers });
  }


  listar_baterias_admin(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_baterias_admin', { headers: headers });
  }

  actualizar_bateria_admin(data: any, id: any, token: any): Observable<any> {
    if (data.portada) {
      let headers = new HttpHeaders({ 'Authorization': token });

      const fd = new FormData();
      fd.append('modelo', data.modelo);
      fd.append('voltaje', data.voltaje);
      fd.append('amperaje', data.amperaje);
      fd.append('tecnologia', data.tecnologia);
      fd.append('peso', data.peso);
      fd.append('portada', data.portada);
      fd.append('descripcion', data.descripcion);

      return this._http.put(this.url + 'actualizar_bateria_admin/' + id, fd, { headers: headers });
    } else {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
      return this._http.put(this.url + 'actualizar_bateria_admin/' + id, data, { headers: headers });
    }
  }

  eliminar_bateria_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_bateria_admin/' + id, { headers: headers });
  }

  obtener_bateria_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_bateria_admin/' + id, { headers: headers });
  }

  //Finaliza Baterias


  
  //Inicia Controladores
  registro_controlador_admin(data: any, file: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Authorization': token });
    const fd = new FormData();
    fd.append('modelo', data.modelo);
    fd.append('input',JSON.stringify(data.input));
    fd.append('amperaje', data.amperaje);
    fd.append('tecnologia', data.tecnologia);
    fd.append('peso', data.peso);
    fd.append('portada', file);
    fd.append('descripcion', data.descripcion);
    return this._http.post(this.url + 'registro_controlador_admin', fd, { headers: headers });
  }


  listar_controladores_admin(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_controladores_admin', { headers: headers });
  }

  actualizar_controlador_admin(data: any, id: any, token: any): Observable<any> {
    if (data.portada) {
      let headers = new HttpHeaders({ 'Authorization': token });
      const fd = new FormData();
      fd.append('modelo', data.modelo);
      fd.append('input',JSON.stringify(data.input));
      fd.append('amperaje', data.amperaje);
      fd.append('tecnologia', data.tecnologia);
      fd.append('peso', data.peso);
      fd.append('portada', data.portada);
      fd.append('descripcion', data.descripcion);

      return this._http.put(this.url + 'actualizar_controlador_admin/' + id, fd, { headers: headers });
    } else {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
      return this._http.put(this.url + 'actualizar_controlador_admin/' + id, data, { headers: headers });
    }
  }

  eliminar_controlador_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_controlador_admin/' + id, { headers: headers });
  }

  obtener_controlador_admin(id: any, token: any): Observable<any> {

    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_controlador_admin/' + id, { headers: headers });
  }

  //Finaliza Controladores



  
  //Inicia Inversores

  registro_inversor_admin(data: any, file: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Authorization': token });
    const fd = new FormData();
    fd.append('modelo', data.modelo);
    fd.append('voltaje', data.voltaje);
    fd.append('amperaje', data.amperaje);
    fd.append('tecnologia', data.tecnologia);
    fd.append('peso', data.peso);
    fd.append('portada', file);
    fd.append('descripcion', data.descripcion);
    return this._http.post(this.url + 'registro_inversor_admin', fd, { headers: headers });
  }


  listar_inversores_admin(token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_inversores_admin', { headers: headers });
  }

  actualizar_inversor_admin(data: any, id: any, token: any): Observable<any> {
    if (data.portada) {
      let headers = new HttpHeaders({ 'Authorization': token });

      const fd = new FormData();
      fd.append('modelo', data.modelo);
      fd.append('voltaje', data.voltaje);
      fd.append('amperaje', data.amperaje);
      fd.append('tecnologia', data.tecnologia);
      fd.append('peso', data.peso);
      fd.append('portada', data.portada);
      fd.append('descripcion', data.descripcion);

      return this._http.put(this.url + 'actualizar_inversor_admin/' + id, fd, { headers: headers });
    } else {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
      return this._http.put(this.url + 'actualizar_inversor_admin/' + id, data, { headers: headers });
    }
  }

  eliminar_inversor_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_inversor_admin/' + id, { headers: headers });
  }

  obtener_inversor_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_inversor_admin/' + id, { headers: headers });
  }

  //Finaliza Inversores
}

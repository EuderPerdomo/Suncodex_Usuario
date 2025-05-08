import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from "rxjs";
import { GLOBAL } from '../services/global';
import { AdminService } from './admin.service';


@Injectable({
  providedIn: 'root'
})
export class GuestServiceService {
  public url;

  constructor(
    private _http: HttpClient,
    private _usuarioService: AdminService,
    private _router: Router,
  ) {
    this.url = GLOBAL.url;
  }

  listar_electrodomesticos_guest(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'listar_electrodomesticos_guest', { headers: headers })
  }


  listar_lamparas_guest(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'listar_lamparas_guest', { headers: headers })
  }


  //Inicia blogs
  listar_posts_public(filtro: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'listar_posts_public/' + filtro, { headers: headers });
  }
  //Finaliza blogs

  //*******************************************************************************************************Inicia blogs
  obtener_post_public(slug: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'obtener_post_public/' + slug, { headers: headers });
  }

  listar_post_recomendado_public(categoria: any, postId: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'listar_post_recomendado_public/' + categoria + '/' + postId, { headers: headers });
  }

  ///Realizar comentarios
  enviar_comentario_post_guest(data: any, _id: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(this.url + 'enviar_comentario_post_guest/' + _id, data, { headers: headers });
  }

  obtener_comentarios_post_guest(postId: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'obtener_comentarios_post_guest/' + postId, { headers: headers });
  }

  
  get_tags_guest(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'get_tags_guest', { headers: headers });
  }

  //Lista los tags o etiquetas asociados a un post en especifico 
  listar_tags_post_guest(postId:any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'listar_tags_post_guest/'+postId, { headers: headers });
  }

  obtener_posts_adyacentes_guest(id_categoria: any, id_post: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.get(this.url + 'obtener_posts_adyacentes_guest/' + id_post+ '/' + id_categoria, { headers: headers });
  }

  listar_posts_destacados_public():Observable<any>{
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.get(this.url + 'listar_posts_destacados_public',{ headers: headers });
  }

  //*********************************************************************************************************Finaliza blogs


  get_categorias_publico(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'get_categorias_publico', { headers: headers });
  }

  //Login guest

  login_guest(data: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'login_guest', data, { headers: headers });
  }


  registro_calculo_usuario(data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    // return this._http.post(this.url + 'registro_calculo_usuario', data, { headers: headers });

    if (this._usuarioService.isAuthenticate(['usuario_final', 'empresa', 'instalador'])) {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
      return this._http.post(this.url + 'registro_calculo_usuario', data, { headers: headers });
    }
    else {
      //El usuario no esta Autenticado GUardo en memoria 
      localStorage.setItem('calculo', JSON.stringify(data));

      console.log('Usuario no autenticado')
      // Redirigir al usuario a la página de registro
      this._router.navigate(['/login']);
      return of(false);
    }
  }

//********************************************************************************************************Contactenos */
  //Contactenos

  enviar_mensaje_contacto(data:any):Observable<any>{
    let headers = new HttpHeaders({'Content-Type':'application/json'});
    return this._http.post(this.url + 'enviar_mensaje_contacto',data,{headers:headers});
  }

}

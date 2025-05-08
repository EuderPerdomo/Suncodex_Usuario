import { Directive, ElementRef, OnInit, Input, TemplateRef, ViewContainerRef } from '@angular/core';
//import {RoleUser} from './app.component'
import { ClienteService } from '../services/cliente.service';

@Directive({
  selector: '[appMostrarPorRol]'
})
export class MostrarPorRolDirective implements OnInit {
  //@Input('appMostrarPorRol') allowedRoles?:any[]
  //private currentuser:RoleUser
  private currentUser: any
  private permissions: any;

  constructor(
    private elementRef: ElementRef,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private _clienteService: ClienteService
  ) { }

  ngOnInit(): void {
    this._clienteService.currentUser().subscribe(
      response => {
        this.currentUser = response.rol
        let objeto = {
          scopes: [response.rol]
        }
        this.currentUser = objeto
        //this.currentUser={scopes:['empresa','usuario_final'],name:'Fabian'}
        this.updateView();
      },
      error => {
        console.log('error')
      }
    )
  }

  @Input()
  set appMostrarPorRol(val: Array<string>) {
    this.permissions = val
    this.updateView()
  }

  private updateView(): void {
    this.viewContainer.clear();
    if (this.checkPermission()) { //true , false
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
    else {
      // console.log('usuario sin roles o sin autorización')
    }
  }

  private checkPermission(): boolean {
    let hasPermission = false;
    if (this.currentUser && this.currentUser.scopes) {
      // TODO: USER scopes: ['write']

      for (const checkPermissio of this.permissions) {
        // TODO: DATA scopes: ['write'] los valores de val o roles necesarios apra mostrar algo
        const permissionFound = this.currentUser.scopes.find((p: string) => {
          return (p.toUpperCase() === checkPermissio.toUpperCase());
        });

        if (permissionFound) {
          hasPermission = true;
          break;
        }
      }
    }
    return hasPermission;
  }



}
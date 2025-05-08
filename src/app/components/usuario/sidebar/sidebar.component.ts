import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../interface/cliente';
import { CommonModule } from '@angular/common';
import { MostrarPorRolDirective } from '../../../directivas/mostrar-por-rol.directive';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule,CommonModule,MostrarPorRolDirective],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  public token: any = '';
  public user_login: Cliente | undefined;
  
public cliente : any= {}

constructor(
  private _router:Router,
  private _clienteService:ClienteService,
) { 

  this.token = localStorage.getItem('token');

  if (this.token) {
    let obj_lc: any = localStorage.getItem('user_data');
    this.user_login = JSON.parse(obj_lc);

    this._clienteService.obtener_cliente_guest(this.user_login?._id,this.token).subscribe(
      response=>{console.log(response)
      this.cliente=response.data
      }
    )


  }

}


logout(){
  window.location.reload();
  localStorage.removeItem('token');
  localStorage.removeItem('_id');
  localStorage.removeItem('user_data');
  this._router.navigate(['/']).then(() => {
    window.location.reload();
  });;
}

/*
constructor(
  private _router:Router,
  private _clienteService:ClienteService,
){

  this.token = localStorage.getItem('token');

  if (this.token) {
    let obj_lc: any = localStorage.getItem('user_data');
    this.user_login = JSON.parse(obj_lc);

    this._clienteService.obtener_cliente_guest(this.user_login?._id,this.token).subscribe(
      response=>{console.log(response)
      this.cliente=response.data
      }
    )


  }

}*/

}

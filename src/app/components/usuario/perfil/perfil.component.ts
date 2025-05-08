import { Component } from '@angular/core';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../interface/cliente';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  imports: [RouterModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent {


  public usuario : any = {};
  public id :any = '';
  public token :any = '';
  public load_data=false
  public user_login: Cliente | undefined;
  
public cliente : any= {}


constructor(
  private _clienteService:ClienteService,
){


  this.id = localStorage.getItem('_id');
  this.token = localStorage.getItem('token');

    this._clienteService.obtener_usuario_usuario(this.token).subscribe(
      response=>{
        
        this.usuario = response.data;
        console.log('buscando datos de usuario',this.usuario)
        this.load_data=true
      },
      error=>{
        console.log('Error en la consulta:',error)
      }
    );
  
/*
  if (this.token) {
    let obj_lc: any = localStorage.getItem('user_data');
    this.user_login = JSON.parse(obj_lc);

    this._clienteService.obtener_cliente_guest(this.user_login?._id,this.token).subscribe(
      response=>{console.log('respuesta obtener cliente guest',response)
      this.cliente=response.data
      }
    )
  }
*/
}
}

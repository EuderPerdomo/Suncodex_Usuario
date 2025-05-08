import { Component } from '@angular/core';
import { UsuarioService } from '../../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-index-calculo',
  imports: [RouterModule,CommonModule,NgbPaginationModule],
  templateUrl: './index-calculo.component.html',
  styleUrl: './index-calculo.component.css'
})
export class IndexCalculoComponent {


  public token = localStorage.getItem('token');
  public calculos :Array<any>= [];
  public calculos_const  :Array<any>= [];
  public page = 1;
  public pageSize = 20;
  public filtro = '';

  constructor(
    private _usuarioService:UsuarioService
  ) { }

  ngOnInit(): void {
    this.init_data()
  }


  init_data(){
if(this.token){
  this._usuarioService.listar_calculos_usuario(this.token).subscribe(
    response=>{
      this.calculos_const = response.data;
      this.calculos= this.calculos_const;
    }
  );
}

  }





}

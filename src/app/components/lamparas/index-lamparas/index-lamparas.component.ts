import { Component } from '@angular/core';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';
import { ClienteService } from '../../../services/cliente.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SplineViewer } from '@splinetool/viewer';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-index-lamparas',
  imports: [NavComponent,FooterComponent,NgbPaginationModule,FormsModule,RouterModule,CommonModule],
  templateUrl: './index-lamparas.component.html',
  styleUrl: './index-lamparas.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class IndexLamparasComponent {
public token:any
public route_categoria:any
public lamparas: Array<any>=[]

public load_data=true
public page=1
public pageSize=15
public sort_by='Defecto'
public btn_cart=false
public filtro_categoria_lampara='todos'
public categorias: Array<any>=[]
public filtrar_categoria=''
public filtro_lampara=''


  constructor(
    private _clienteService: ClienteService,
    private _route:ActivatedRoute,
  ) {

    this.token = localStorage.getItem('token')

    this._route.params.subscribe(
      params => {
        this.route_categoria = params['categoria']
        if (this.route_categoria) {
          this._clienteService.listar_lamparas_public('').subscribe(
            response => {
              this.lamparas = response.data
              this.lamparas = this.lamparas.filter(item => item.categoria.titulo == this.route_categoria)
              this.load_data = false
            },
          )

        } else {
          console.log('Sin filtro',this.lamparas)
          this._clienteService.listar_lamparas_public('').subscribe(
            response => {
              this.lamparas = response.data
              console.log('lamparasListados',this.lamparas)
              this.load_data = false
            },
          )

        }
      }
    )

  }

  ordenar_por(){

  }
  agregar_lampara(item:any){

  }
  reset_lampara(){

  }

  buscar_precios(){

  }

  buscar_por_categoria(){

  }

  buscar_categoria(){

  }

  buscar_lampara(){

  }

  getCloudinaryImageUrl(imageUrl: string, width: number, height: number, crop: string = 'fill'): string {
    // Verifica que la URL esté configurada para admitir transformaciones de Cloudinary
    return imageUrl.replace('/upload/', `/upload/c_${crop},w_${width},h_${height}/`);
  }

  

}

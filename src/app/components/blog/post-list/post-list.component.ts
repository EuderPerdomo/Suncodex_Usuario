import { Component } from '@angular/core';
import { FooterComponent } from '../../footer/footer.component';
import { NavComponent } from '../../nav/nav.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute} from '@angular/router';
import { NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import { GuestServiceService } from '../../../services/guest-service.service';

@Component({
    selector: 'app-post-list',
    imports: [FooterComponent, NavComponent, FormsModule, CommonModule, RouterModule,NgbPaginationModule],
    templateUrl: './post-list.component.html',
    styleUrl: './post-list.component.css'
})
export class PostListComponent {

  public categorias: Array<any> = [];
  public tags: Array<any> = [];
  public filtrar_categoria = ''
  public posts: Array<any> = []
  public posts_destacados:Array<any>=[]
  public filtro_producto = ''

  public filtro_categoria_producto = 'todos'
  public token: any

  //Precargador
  public load_data = true

  //Categoria de la ruta
  public route_categoria: any

  // Paginación
  public page = 1
  public pageSize = 5

  public sort_by = 'Defecto'


  constructor(
    private _guestService:GuestServiceService,
    private _route: ActivatedRoute,
  ) {

    this.token = localStorage.getItem('token')

    this._route.params.subscribe(
      params => {
        this.route_categoria = params['categoria']
        if (this.route_categoria) {
          this._guestService.listar_posts_public('').subscribe(
            response => {
              this.posts = response.data
              console.log(this.posts)
              this.posts = this.posts.filter(item => item.categoria.titulo == this.route_categoria)
              this.load_data = false
              this.obtenerpostDestacados()
            },
          )

        } else {
          this._guestService.listar_posts_public('').subscribe(
            response => {
              this.posts = response.data
              console.log(this.posts)
              this.load_data = false
              this.obtenerpostDestacados()
            },
          )

        }
      }
    )

  }

  ngOnInit(){
    this._guestService.get_categorias_publico().subscribe(
      response => {
        this.categorias = response.data;
      }
    );
    this._guestService.get_tags_guest().subscribe(
      response => {
        this.tags = response.data;
      }
    );

  }

obtenerpostDestacados(){
  this._guestService.listar_posts_destacados_public().subscribe(
    response => {
      this.posts_destacados = response.data
      console.log('Post Destacados',this.posts_destacados)
      this.load_data = false
    },
  )

}

  getCloudinaryImageUrl(imageUrl: string, width: number, height: number, crop: string = 'fill'): string {
    // Verifica que la URL esté configurada para admitir transformaciones de Cloudinary
    //return imageUrl.replace('/upload/', `/upload/c_${crop},w_${width},h_${height}/`);
    return imageUrl.replace('/upload/', `/upload/c_lfill,w_${width},h_${height},q_auto,f_auto/`);
  }


}

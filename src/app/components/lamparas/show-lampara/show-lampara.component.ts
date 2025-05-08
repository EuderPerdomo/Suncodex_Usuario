import { Component,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { ClienteService } from '../../../services/cliente.service';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';
// register Swiper custom elements

import { SplineViewer } from '@splinetool/viewer';

register();

declare var tns: any
declare var lightGallery: any
declare var iziToast: any
declare var $: any

//import { Pipe,PipeTransform } from '@angular/core';
//@Pipe({ name: 'safeHtml' })

@Component({
  selector: 'app-show-lampara',
  imports: [NavComponent, FooterComponent, FormsModule, CdkAccordionModule,CommonModule, RouterModule],
  templateUrl: './show-lampara.component.html',
  styleUrl: './show-lampara.component.css',
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ShowLamparaComponent  {
  public lamparaSeleccionada: undefined
  public escenarioSeleccionado: any
  public lampara: any
  public productosRecomendados: Array<any> = []
  public casosAplicacion: Array<any> = []

  public producto= {
    sketchFab:'',
    imagenIes:'',
    imagenSimulacion:'',
    imagenMedidas:'',
    nombre: 'NSL-912',
    slug: 'slug',
    galeria: [],
    casosAplicacion:[],
    portada: 'https://res.cloudinary.com/dcoq7odpu/image/upload/v1732841534/t5bgcqxeks12x0zp5yol.png',
    precio: '1290000',
    descripcion: 'Descripcion del producto',
    contenido: 'contenido del producto',
    stock: '26',
    nventas: '5',
    npuntos: '2',
    variedades: [],
    categoria: { titulo: '', slug: '', _id: '' },
    titulo_variedad: '',
    estado: 'Activo',
    _id: '123456'
  }
//public variedad_seleccionada: any
public variedad_seleccionada: any = '';//Inicialmente all public variedad_seleccionada: string = 'all';
public subvariedad_seleccionada: any[] = [] //Representa el arreglo con las caracteristicas de la subvariedad actual
public subvariedad: string = ''; //Representa el Id de la Subvariedad

public galeria_seleccionada: any
//public tamano_disponibilidad: Tamano_Disponibilidad[] = [];
public tamano_disponibilidad = [];
public carrusel: any;
public slider: any;
public carrusel2: any[] = []
public carrusel_original: any[]=[];

//public socket = io('http://localhost:4201')


public sliderSelector: string = '.my-slider';
public cachedSlider: any;

public lightGallerySelector: string = '.gallery-item';

public ThumbnailsSelector: string = '.thumbnails_remove';
public cachedSliderThumbnails: any


//LightGalery
public migaleria: any
//Finaliza LightGalery

//Agregar al carrito
public carrito_data: any = {
  variedad: '',
  cantidad: 1,
  subvariedad: ''
}
public btn_cart = false
public slug:any



constructor(
private _route:ActivatedRoute,
private _clienteService:ClienteService,
private sanitizer: DomSanitizer
){
    
    window.scrollTo(0, 0);

    //this.token = localStorage.getItem('token')

    this._route.params.subscribe(
      params => {
        this.slug = params['slug']
        console.log('el slug',this.slug)
        this._clienteService.obtener_lampara_public(this.slug).subscribe(
          response => {
            this.producto = response.data
            this.casosAplicacion=response.data.casosAplicacion
            console.log(this.producto,this.casosAplicacion)
            //Subvariedad_seleccionada representa el arreglo de subvariedades
/*
            for (let i = 0; i < this.producto.variedades[0].tamano_disponibilidad.length; i++) {
              const elemento = this.producto.variedades[0].tamano_disponibilidad[i];
              var tamano = {
                tamano: elemento.tamano,
                unidad_medida: elemento.unidad_medida,
                disponibilidad: elemento.disponibilidad,
                precio: elemento.precio,
                _id: elemento._id
              }
              this.subvariedad_seleccionada.push(tamano)
            }


            if (this.producto.variedades && this.producto.variedades.length > 0) {
              // Seleccionar la primera variedad y su primera subvariedad
              const primeraVariedad = this.producto.variedades[0];
              const primeraSubvariedad = primeraVariedad.tamano_disponibilidad[0];

              // Asignar los valores iniciales
              this.producto.precio = primeraSubvariedad.precio;
              this.producto.stock = primeraSubvariedad.disponibilidad
              this.variedad_seleccionada = primeraVariedad._id;
              this.subvariedad = primeraSubvariedad._id;

              // Inicializar subvariedad_seleccionada con el primer tamaño y disponibilidad
              //this.subvariedad_seleccionada.push(primeraSubvariedad);

              // Llenar el carrusel con las imágenes de las variedades
              for (let variedad of this.producto.variedades) {
                for (let galeriaItem of variedad.galeria) {
                  this.carrusel2.push({
                    imagen: galeriaItem.imagen,
                    variedad: variedad._id
                  });

                  this.carrusel_original.push({
                    imagen: galeriaItem.imagen,
                    variedad: variedad._id
                  });
                }

                }
                
                
              
              
            }
                */
            /*
            this._guestService.listar_productos_recomendado_public(this.producto.categoria._id).subscribe(
              response => {
                this.productosRecomendados = response.data

              }
            )
*/


          }

        )


      }
    )
  }

  getSafeHtml(content: string) {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  // En tu componente
sections = [
  { height: '100vh', title: 'Diseño Premium', text: 'Líneas elegantes para espacios modernos' },
  { height: '80vh', title: 'Materiales', text: 'Metal y cristal de alta resistencia' }
];

sketchfabEmbed = `
  <iframe 
    id="lampara-3d"
    src="https://sketchfab.com/models/TU-ID-LAMPARA/embed?api=1&ui_theme=dark" 
    style="width:100%;height:100%;border:none;"
    allow="autoplay; fullscreen; vr"
    mozallowfullscreen webkitallowfullscreen>
  </iframe>
`;

  agregar_producto_carrito() {}
  
filter_subvariedad(subvariedad: any) {

  const subvariedadSeleccionada = this.subvariedad_seleccionada.find(s => s._id === subvariedad);

  if (subvariedadSeleccionada) {
    this.producto.precio = subvariedadSeleccionada.precio;
    this.producto.stock = subvariedadSeleccionada.disponibilidad
  } else {
    // En caso de que no se encuentre la subvariedad, puedes asignar un valor por defecto o manejarlo como prefieras
    this.producto.precio = ''; // O algún valor por defecto
  }

}
filter() {
  // Reinicia carrusel2 al estado original
  this.carrusel2 = [...this.carrusel_original]; // Usa un nuevo array para evitar referencias directas

  // Filtra solo si la variedad seleccionada no es "all"
  if (this.variedad_seleccionada !== "all") {
    this.carrusel2 = this.carrusel2.filter(item => item.variedad === this.variedad_seleccionada);
  }

  //console.log(this.variedad_seleccionada, this.carrusel2, this.carrusel_original);
}


  getCloudinaryImageUrl(imageUrl: string, width: number, height: number, crop: string = 'fill'): string {
    // Verifica que la URL esté configurada para admitir transformaciones de Cloudinary
    return imageUrl.replace('/upload/', `/upload/c_${crop},w_${width},h_${height}/`);
  }


}

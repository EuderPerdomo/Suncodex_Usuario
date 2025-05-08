import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PanelSolarService } from '../../../services/panel-solar.service';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';
import { RouterModule } from '@angular/router';
declare var iziToast:any
declare var $:any

@Component({
  selector: 'app-panel-solar',
  standalone: true,
  imports: [NavComponent,FooterComponent,RouterModule],
  templateUrl: './panel-solar.component.html',
  styleUrl: './panel-solar.component.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class PanelSolarComponent {

  //consulta paneles base de datos
  public paneles_bd: Array<any> = []

  constructor(
    private _panelSolar:PanelSolarService
  ){

  }

 //Inicia traer paneles para la calculadora
/* listar_paneles() {


  this._panelSolar.listar_paneles().subscribe({
    next: (response) => {
      this.paneles_bd = response.data;
      if (this.paneles_bd.length == 0 || this.paneles_bd == undefined) {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: "No se encontraron Paneles Solares",
          displayMode: 1
        });
      }
      else {
        iziToast.show({
          title: 'OK',
          titleColor: '#00ff00',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: "Paneles Encontrados",
          displayMode: 1
        });
      }
    },
    error: (error) => {
      console.error("Error al listar paneles:", error);
    },
    complete: () => {
      console.log("Suscripción completada");
    }
  });

}*/
//Finaliza  traer paneles para la calculadora

}

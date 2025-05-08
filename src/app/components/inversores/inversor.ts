import { Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { PanelSolarService } from '../../services/panel-solar.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs';
import { CalculadoraService } from '../../services/calculadora.service';

declare var iziToast:any

@Injectable({
  providedIn: 'root'
})
export class Inversor {

  //******************************** InicioPruebas behavorSubject */
  public data: any
  dataService$: Subscription | undefined
  //********************************Fin Pruebas behavorSubject */

  constructor(
    //private dataService: PanelSolar,

  ) {


  }

  async calcularInversor(data: any): Promise<any> {

/**
 * this.tensionDefinida && this.potenciaDefinida
 * 
 * Entradas
 * tension_sistema
 * simultaneo
 * 
 * //Inversor
 * voltaje_in
 * potencia
 * potencia_pico
 */

    //TODO Calculo de acuerdo al tipo de Inversor

    return new Promise((resolve) => {
      if (data.tension_sistema != data.voltaje_in) {

        iziToast.show({
          title: 'ALERTA',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: "La tensión de entarda del inversor debe ser igual a la tensión de trabajo del sistema",
          displayMode: 1,
        });
      }
      //potencia simultanea es Menor a potencia nominal del inversor?
      else if (data.simultaneo >= data.potencia) {

        iziToast.show({
          title: 'ALERTA',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: "La potencia de consumo simultaneo es superior a la capacidad del Inversor, seleccione un inversor de mayor capacidad",
          displayMode: 1,
        });

        /*
          
        */
      }

      //La potencia simultanea es menor a potencia nominal del inversor y tension sistema es igual a tension inversor
      else {
        iziToast.show({
          title: 'OK',
          titleColor: '#00ff00',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: "la configuracion de Inversor es Adecuada",
          displayMode: 1
        });

      }
      //this.inversorDefinido = true

      //Asigno paraetros al Inversor

      // this.calculo.resultadoCalculoInversor[0].voltaje_in_inversor = this.calculo.tension_sistema
      // this.calculo.resultadoCalculoInversor[0].voltaje_out_inversor = this.inversor_seleccionado.voltaje_out
      // this.calculo.resultadoCalculoInversor[0].potencia_inversor = this.simultaneo
      // this.calculo.resultadoCalculoInversor[0].potencia_pico_inversor = this.inversor_seleccionado.potencia_pico
     // console.log('Potencia pico del inversor seleccionado',this.inversor_seleccionado.potencia_pico, 'en calculo',this.calculo.resultadoCalculoInversor[0].potencia_pico_inversor)

      //this.camposRequeridos.voltaje_in_inversor = true
      //this.camposRequeridos.voltaje_out_inversor = true
      //this.camposRequeridos.potencia_inversor = true
      //this.camposRequeridos.potencia_pico_inversor = true

    

    /**
     * Primero:
     * El voltaje de entrada debe ser igual al voltaje de las baterias en Serie o de la tension a manejar en el sistema
     * la suma de potencias simultaneas no debe superar la potencia nominal del inversor
     */




      const resultadoInversor = {
       voltaje_in_inversor:data.tension_sistema,
       voltaje_out_inversor:data.voltaje_out,
       potencia_inversor:data.simultaneo,
       potencia_pico_inversor:data.potencia_pico,
      }
      ////////Final
      resolve(resultadoInversor);
    })

  }

  //Recuperar valor
  getData() {
    //return this.miBehaviorSubject.asObservable()
  }

}

import { Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { PanelSolarService } from '../../services/panel-solar.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs';
import { CalculadoraService } from '../../services/calculadora.service';

declare var iziToast: any

@Injectable({
  providedIn: 'root'
})
export class Bateria {

  // miBehaviorSubject = new BehaviorSubject<string>('hola behavior Controlador')

  //******************************** InicioPruebas behavorSubject */
  public data: any
  dataService$: Subscription | undefined
  //********************************Fin Pruebas behavorSubject */

  constructor(
    //private dataService: PanelSolar,

  ) {

  }


  async calcularBateria(data: any): Promise<any> {
console.log('Recibo En baterias:', data)
    /* 
    Entradas
    total_dia
    tension_sistema
    paneles_paralelo
    panel_seleccionado.isc
    
    //De las baterias
    dias_autonomia
    profundidad
    amperaje
    voltaje
    
    */

    return new Promise((resolve) => {
      //si this.tensionDefinida && this.potenciaDefinida

      //Consumo medio diario
      //const Qd = this.total_dia / this.tension
      const Qd = data.total_dia / data.tension_sistema

      //Capacidad total del sistema de acomulación
      const Cn = Qd * data.dias_autonomia / data.profundidad * 0.9 * 0.9

      //Verificar no exceder en 25% corriente en cortocircuito

      if (Cn < 25 * (data.paneles_paralelo * data.isc)) {

        iziToast.show({
          title: 'OK',
          titleColor: '#00ff00',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: "la configuración de baterias es adecuada",
          displayMode: 1
        });

      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: "Sobredimensionar el modulo de baterias puede ocasionar una carga inadecuada de las mismas, pruebe usando baterias de menor capacidad.",
          displayMode: 1,
        });
      }

      //Series
      const baterias_paralelo = Math.ceil(Cn / data.amperaje)
      //this.baterias_serie = Math.round(this.tension / this.bateria_seleccionado.voltaje)
      const baterias_serie = Math.round(data.tension_sistema / data.voltaje)
      const total_baterias = Math.round(baterias_paralelo * baterias_serie)

      //Asignacion de valores a parametro calculo
      // this.calculo.resultadoCalculoBateria[0].baterias_serie = this.baterias_serie
      // this.calculo.resultadoCalculoBateria[0].baterias_paralelo = this.baterias_paralelo
      // this.calculo.resultadoCalculoBateria[0].total_baterias = this.baterias
      // this.calculo.resultadoCalculoBateria[0].batterysize = this.baterias * (this.bateria_seleccionado.voltaje * this.bateria_seleccionado.amperaje)
      // this.calculo.resultadoCalculoBateria[0].cuttoff = this.profundidad

      //this.camposRequeridos.baterias_serie = true
      //this.camposRequeridos.baterias_paralelo = true
      //this.camposRequeridos.total_baterias = true
      //this.camposRequeridos.batterysize = true
      //this.camposRequeridos.cuttoff = true

      //this.bateriaDefinido = true

      const batterysize = total_baterias * (data.voltaje * data.amperaje)
      const cuttoff = parseFloat(data.profundidad)

      const resultadoBateria = {
        baterias_serie,
        baterias_paralelo,
        total_baterias, //Total de Baterias
        batterysize,
        cuttoff,
      }
      ////////Final
      resolve(resultadoBateria);
    })

  }

  //Recuperar valor
  getData() {
    //return this.miBehaviorSubject.asObservable()
  }

}

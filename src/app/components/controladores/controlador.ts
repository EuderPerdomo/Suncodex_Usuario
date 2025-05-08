import { Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { PanelSolarService } from '../../services/panel-solar.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs';
import { CalculadoraService } from '../../services/calculadora.service';

@Injectable({
  providedIn: 'root'
})
export class ControladorSolar {

  miBehaviorSubject = new BehaviorSubject<string>('hola behavior Controlador')

  //******************************** InicioPruebas behavorSubject */
  public data: any
  dataService$: Subscription | undefined
  //********************************Fin Pruebas behavorSubject */

  constructor(
    //private dataService: PanelSolar,

  ) {



    //suscripcion al behaviorSubject
    /*
        this.dataService.getData().subscribe(
          {
            next: data => {
              this.data = data
              console.log('valor de data', this.data)
            },
            error: error => {
              this.data = ''
              console.log('error behaviorsubject', error)
            }
          }
    
        )
        */
  }


  //Asignar valor
  /*
  calcularControlador(data:any){
    console.log('Recalculando Controlador cuando cambio la potencia')
      this.miBehaviorSubject.next(data.voc)
    }
    */


  async calcularControlador(data: any): Promise<any> {

    //TODO Calculo de acuerdo al tipo de controlador Solar MPPT/PWM

    return new Promise((resolve) => {
      console.log('Calculando Controlador cuando se calcula panel:', data);
      //Calculamos valores del Para el controlador

      const IGsc = data.paneles_paralelo * data.isc//Intensidad corto Circuito del los paneles
      const minCorrienteControlador = 1.25 * IGsc
      //this.camposRequeridos.minCorrienteControlador = true

      //Determinar tEnsion minima controlador
      const UGoc = data.paneles_serie * data.voc

      const minVoltageControlador = UGoc + (data.tc_of_voc) * (-10 - 25)
      console.log('Voltaje minima controlador', minVoltageControlador)
      //this.camposRequeridos.minVoltageControlador = true

      console.log('serie', data.paneles_serie, 'Paralelo', data.paneles_paralelo)


      const tensionMaxiaGenerador = data.paneles_serie * data.vmpp //vmpp voltaje d emaxima potencia
      const intensidadMaxiaGenerador = data.paneles_paralelo * data.impp

      //Asignacion de valores o valores a emitir
      //this.calculo.resultadoCalculoControlador[0].minVoltageControlador = this.minVoltageControlador
      //this.calculo.resultadoCalculoControlador[0].minCorrienteControlador = this.minCorrienteControlador

      //Descartar si el panel y controlador si son o no compatibles
      if (data.potencia_arreglo_fv >= data.max_potencia_paneles) {
        console.log('La potencia del Arreglo de  paneles es superior a la potencia soportada por el controlador a la tension que desea manejar')
      } else if (minVoltageControlador >= data.Max_pv_voltaje) {
        console.log('El voltaje del Arreglo de paneles  es superior al soportado por el controlador')
      } else if (minCorrienteControlador >= data.amperaje) {
        console.log('El Amperaje del Arreglo de paneles es superior al soportado por el controlador')
      } else {

      }

      let potencia_fotovoltaica = data.numero_paneles * data.potencia //Potencia del panel en uso
      let cantidad_paneles_controlador = potencia_fotovoltaica / data.max_potencia_paneles

      if (cantidad_paneles_controlador < data.numero_paneles) {
        console.log('Es necesario usar varios Contoladores')
      } else {
        console.log('un solo controlador es suficiente')
      }

      //this.controladorDefinido = true

      var controlador_max_pv_input_voltaje = data.Max_pv_voltaje
      var controlador_max_input_power = data.max_potencia_paneles
      var controlador_tension = data.controlador_tension
      var controlador_cantidad_paralelo = cantidad_paneles_controlador//TO DO verificar Controladores en paralelo

      const resultadoControlador = {
        minVoltageControlador,
        minCorrienteControlador,
        controlador_max_pv_input_voltaje,
        controlador_max_input_power,
        controlador_tension,
        controlador_cantidad_paralelo,
      }

      console.log('Calculos resultantes en calculo Controlador', resultadoControlador)
      ////////Final
      resolve(resultadoControlador);
    })

  }

  //Recuperar valor
  getData() {
    return this.miBehaviorSubject.asObservable()
  }

}

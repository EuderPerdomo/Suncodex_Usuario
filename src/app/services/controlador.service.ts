import { Injectable } from '@angular/core';
import { Observable, of } from "rxjs";
import { GLOBAL } from '../services/global';
import { HttpClient, HttpHeaders } from "@angular/common/http";
//import { JwtHelperService } from '@auth0/angular-jwt';
import { RouterLink } from '@angular/router';
import { map, filter, distinctUntilChanged, debounceTime } from 'rxjs';
import { CalculadoraService } from '../services/calculadora.service';

import { BehaviorSubject } from 'rxjs';
import { PanelSolarService } from './panel-solar.service';

declare var iziToast: any
@Injectable({
  providedIn: 'root'
})
export class ControladorService {
  public url

  // Subjects para datos de salida
  private resultadoControladorSubject = new BehaviorSubject<any>({});
  // Observables de salida
  resultadoControlador$ = this.resultadoControladorSubject.asObservable();

  constructor(
    private _calculadoraService: CalculadoraService,
    private _http: HttpClient,
    //private _panelSolarService:PanelSolarService,
  ) {
    this.url = GLOBAL.url;
    this.setupPanelListener()

    this._calculadoraService.estados$.pipe(
      filter(estados => estados.panelDefinido),
      distinctUntilChanged()
    ).subscribe(() => {
      console.log('El panel solar ha sido definido')
      console.log('Estos son los estados actuales', this._calculadoraService.getEstadoActual())
    });


  }


  //Suscribo el Controlador a cambios en el panel solar
  setupPanelListener() {
    this._calculadoraService.resultadoPanel$.pipe(
      filter(panelData => !!panelData), // Filtra valores nulos
      distinctUntilChanged(), // Evita recalcular con los mismos datos
      debounceTime(300) // Espera 300ms tras cambios rápidos
    ).subscribe(panelData => {

      this.handlePanelChange(panelData);
    });
  }


  private handlePanelChange(panelData: any) {

    try {
      const data = this.prepareCalculationData(panelData);

      if (this.isValidCalculationData(data)) {

        this.calcularControlador(data);
      } else {
        this.resultadoControladorSubject.next(null);
      }
    } catch (error) {
      this.resultadoControladorSubject.next(null);
    }
  }

  private prepareCalculationData(panelData: any): any {
    const estadoActual = this._calculadoraService.obtenerCalculo();
    const panel_seleccionado = this._calculadoraService.obtenerPanelSeleccionado();
    const controladorSeleccionado = this._calculadoraService.getControladorSeleccionado();

    if (!estadoActual?.resultadoCalculoControlador) {
      throw new Error('Estado del controlador no disponible');
    }
    return {

      max_potencia_paneles: controladorSeleccionado.max_potencia_paneles,//controlador_max_input_power
      Max_pv_voltaje: controladorSeleccionado.Max_pv_voltaje,//controlador_max_pv_input_voltaje
      controlador_tension: controladorSeleccionado.tension, //controlador_tension
      amperaje: controladorSeleccionado.amperaje,//TO DO corregir amperaje controlador


      //Del Array de  los paneles
      numero_paneles: panelData.cantidad_paneles,
      potencia_arreglo_fv: panelData.peakpower,
      paneles_paralelo: panelData.paneles_paralelo,
      paneles_serie: panelData.paneles_serie,

      //Del panel Seleccioando
      potencia: panel_seleccionado.potencia,
      isc: panel_seleccionado.isc,
      voc: panel_seleccionado.voc,
      tc_of_voc: panel_seleccionado.tc_of_voc,
      vmpp: panel_seleccionado.vmpp,
      impp: panel_seleccionado.impp
    };
  }

  private isValidCalculationData(data: any): boolean {
    //console.log('Datos recibidos para validación:', JSON.stringify(data, null, 2));
    const requiredFields = [
      'max_potencia_paneles',
      'Max_pv_voltaje',
      'controlador_tension',
      'amperaje',
      'numero_paneles',
      'potencia',
      'potencia_arreglo_fv',
      'paneles_paralelo',
      'paneles_serie',
      'isc',
      'voc',
      'tc_of_voc',
      'vmpp',
      'impp'
    ];

    // Verificación detallada
    const allFieldsValid = requiredFields.every(field => {
      const value = data[field];
      const isValid = value !== null &&
        value !== undefined &&
        !isNaN(value) &&
        (typeof value === 'number' || !isNaN(Number(value))); // Conversión explícita

      if (!isValid) {
        console.warn(`Campo inválido: ${field}`, value, typeof value);//Muestra el campo que es invalido
      }
      return isValid;
    });

    //console.log('Resultado validación:', allFieldsValid);
    return allFieldsValid;
  }

  //**************************************** */
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
      console.log('Voltaje minima controlador', minVoltageControlador, UGoc)
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

  async validarCompatibilidadControlador(data: any): Promise<any> {

    return new Promise((resolve) => {
      console.log('data recibida para validar compatibiliad controlador', data)
      var amperaje = false
      var voltaje = false

      if (data.amperaje >= data.amperaje_array_fv) {//Si el amperaje soportado por el controlador es superior al producido por el array
        amperaje = true
      }
      if (data.voltaje_array_fv <= data.max_pv_input_voltaje) { //Si el voltaje del array Fotovoltaico es menor que el soportado por el controlador
        voltaje = true
      }

      const compatibilidadControlador = {
        amperaje,
        voltaje,
      }

      console.log('resolver', compatibilidadControlador)
      ////////Final
      resolve(compatibilidadControlador);
    })

  }




  //Consultas a la Base de datos
  listar_controladores(): Observable<any[]> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get<{ data: any[] }>(this.url + 'listar_controladores', { headers: headers }).pipe(
      map(response => response.data)
    );
  }

}

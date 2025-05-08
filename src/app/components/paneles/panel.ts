'use-strict'
import { Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { PanelSolarService } from '../../services/panel-solar.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs';

declare var iziToast: any

@Injectable({
  providedIn: 'root'
})
export class PanelSolar {

  voc: number = 0; //Voltaje En cicuito Abierto
  isc: number = 0; //Intensidad en corto circuito
  impp: number = 0; //Intensidad en maxima potencia
  vmpp: number = 0; //Voltaje en maxima potencia
  eficiencia: number = 0;//Eficiencia
  potencia: number = 0;//Potencia del Panel
  tc_of_pmax: number = 0; //Coeficiente de Potencia-Temperatura
  tc_of_voc: number = 0;//Coeficiente de Voltage-Temperatura
  tc_of_isc: number = 0; //Coeficiente de Corriente-Temperatura
  noct: number = 43; //Temperatura de Operacion Nominal de la Celula
  tension: number = 0;

  //Parametros adicionales
  max_isc: number = 0;
  min_isc: number = 0;
  max_voc: number = 0;
  min_voc: number = 0;


  miBehaviorSubject = new BehaviorSubject<string>('hola behavior')

  constructor(
    // private _panelService: PanelSolarService
  ) {

  }

  inicializar(voc: number, isc: number, impp: number) {
    this.voc = voc;
    this.isc = isc;
    this.impp = impp;
  }

  //Asignar valor
  calcularPanel(data: any) {
    this.miBehaviorSubject.next(data.voc)
  }

  //Recuperar valor
  getData() {
    return this.miBehaviorSubject.asObservable()
  }


  async calcularPanelesAsync(datos: any): Promise<any> {
    // Simulación de un cálculo que toma tiempo
    return new Promise((resolve) => {
      ////////Inicio
      console.log('datos del panel', datos)
      //Valores para emitir
      var cantidad_paneles = 0
      var paneles_paralelo = 0
      var paneles_serie = 0
      var potencia_arreglo_fv
 = 0


      //Iniciamos nuevo calculo de paneles ****************************************************************

      //this.irradiacionGlobalDiaria

      //Formula:
      //Potencia generador = consumo energia diario X irradiancia en condiciones CEM( 1000) / valor medio mensual irradiacion con angulo optimo x PR

      const PotenciaMinimaGenerador = (datos.total_dia * 1000) / (datos.horas_sol_pico * 0.9 * 1000) //Multiplico *1000 porque las horas sol pico estan dadas en KWH
      console.log('Potencia Generador', PotenciaMinimaGenerador, 'W')
      //la maxima potencia del generador no sobrepasara el 20% del valor de PotenciaMinimaGenerador calculado
      const porcentaje = 1.2 * PotenciaMinimaGenerador
      console.log('porcentaje', porcentaje)

      //Calculo numero de modulos
      var numeropaneles = Math.round(PotenciaMinimaGenerador / datos.potencia) // Este seria el unico dato retornado, en esta parte ya que los demas deben ser retornados de acuerdo a como se realice la disposicion del array fotovoltaico
      
      console.log('Numero de apaneles calculados', numeropaneles, datos.potencia)

      if (numeropaneles < 1) {
        numeropaneles = 1
        console.log('Numero de paneles menor que 1', numeropaneles)
      }
      console.log('Numero de panels', numeropaneles, PotenciaMinimaGenerador / datos.potencia)

      //Potencia resultante del generador
      const PotenciaGenerador = numeropaneles * datos.potencia
      console.log('resultante de potencia generador', PotenciaGenerador)
      potencia_arreglo_fv= PotenciaGenerador //Valor de salida


      //Disposicion
      //Tomamos en cuenta como seria la disposicion respecto a como el cliente seleccione el panel
      //Determinamos de acuerdo a seleccion del panel
      const Np = datos.tension_sistema / datos.tension //const Np = this.tension / this.panel_seleccionado.tension //Ns = Numero de Paralelos
      if (Np < 1) {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: "Considere Usar un regulador MPPT, cambie la tension en las baterias o use un panel de menor tension",
          displayMode: 1
        });
        cantidad_paneles = numeropaneles
        paneles_paralelo = numeropaneles
        paneles_serie = 1
      }

      if (Np == 1) {
        cantidad_paneles = numeropaneles
        paneles_paralelo = numeropaneles
        paneles_serie = 1

      }

      if (Np > 1) {

        if (Np == 2) {
          const panelestotales = this.redondearAlMultiploSuperior(numeropaneles, 2)

          cantidad_paneles = panelestotales
          paneles_paralelo = panelestotales / 2
          paneles_serie = 2

        } else { //Deberia ser 4
          const panelestotales = this.redondearAlMultiploSuperior(numeropaneles, 4)

          cantidad_paneles = panelestotales
          paneles_paralelo = panelestotales / 4
          paneles_serie = 4

        }
      }



      //Inicia calcular posibles configuraciones serie paralelo
      console.log('Inicia calcular configuraciones posibles', cantidad_paneles)
      for (let i = 1; i <= cantidad_paneles; i++) {
        if (cantidad_paneles % i === 0) {
          console.log('Configuracion Posible:','paralelo',cantidad_paneles/i,'serie',i)
        }
      }

      //FInaliza calcular posibles configuraciones serie paralelo

      //Verificamos no superar el 20%
      const porcentaje2 = 1.2 * PotenciaMinimaGenerador

      //Potencia resultante del generador
      const PGmax = cantidad_paneles * datos.potencia


      if (PGmax < 1.2 * PotenciaMinimaGenerador && Np >= 1) {

        iziToast.show({
          title: 'OK',
          titleColor: '#00ff00',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: "la configuración de paneles es Eficiente",
          displayMode: 2,
        });

      } else {

        iziToast.show({
          title: 'ALERTA',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: "Panel Sobredimensionado, Considere configuraciones diferentes para hacer mas optimo el sistema",
          displayMode: 2
        });

      }
      //Reuno resultados
      const voltaje_array_fv = paneles_serie * datos.voc
      const amperaje_array_fv = datos.impp * paneles_paralelo
      const tensionMaxiaGenerador = paneles_serie * datos.vmpp //vmpp voltaje d emaxima potencia
      const intensidadMaxiaGenerador = paneles_paralelo * datos.impp

      const resultadoPanel = {
        potencia_arreglo_fv
,
        cantidad_paneles,
        paneles_paralelo,
        paneles_serie,
        PGmax,
        voltaje_array_fv,
        amperaje_array_fv,
        tensionMaxiaGenerador,
        intensidadMaxiaGenerador,
      }
      ////////Final
      resolve(resultadoPanel); //Resuelvo Promesa con resultados de calculo

    });
  }



  calcularPaneles(datos: any) {
    console.log('datos del panel', datos)
    //Valores para emitir
    var cantidad_paneles = 0
    var paneles_paralelo = 0
    var paneles_serie = 0
    var potencia_arreglo_fv
 = 0


    //Iniciamos nuevo calculo de paneles ****************************************************************

    //this.irradiacionGlobalDiaria

    //Formula:
    //Potencia generador = consumo energia diario X irradiancia en condiciones CEM( 1000) / valor medio mensual irradiacion con angulo optimo x PR

    const PotenciaMinimaGenerador = (datos.total_dia * 1000) / (datos.horas_sol_pico * 0.9 * 1000) //Multiplico *1000 porque las horas sol pico estan dadas en KWH
    console.log('Potencia Generador', PotenciaMinimaGenerador, 'W')
    //la maxima potencia del generador no sobrepasara el 20% del valor de PotenciaMinimaGenerador calculado
    const porcentaje = 1.2 * PotenciaMinimaGenerador
    console.log('porcentaje', porcentaje)

    //Calculo numero de modulos
    var numeropaneles = Math.round(PotenciaMinimaGenerador / datos.potencia)
    console.log('Numero de apaneles calculados', numeropaneles, datos.potencia)

    if (numeropaneles < 1) {
      numeropaneles = 1
      console.log('Numero de paneles menor que 1', numeropaneles)
    }
    console.log('Numero de panels', numeropaneles, PotenciaMinimaGenerador / datos.potencia)

    //Potencia resultante del generador
    const PotenciaGenerador = numeropaneles * datos.potencia
    console.log('resultante de potencia generador', PotenciaGenerador)
    potencia_arreglo_fv
 = PotenciaGenerador //Valor de salida


    //Disposicion
    //Tomamos en cuenta como seria la disposicion respecto a como el cliente seleccione el panel
    //Determinamos de acuerdo a seleccion del panel
    const Np = datos.tension_sistema / datos.tension //const Np = this.tension / this.panel_seleccionado.tension //Ns = Numero de Paralelos
    if (Np < 1) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "Considere Usar un regulador MPPT, cambie la tension en las baterias o use un panel de menor tension",
        displayMode: 1
      });
      cantidad_paneles = numeropaneles
      paneles_paralelo = numeropaneles
      paneles_serie = 1
    }

    if (Np == 1) {
      cantidad_paneles = numeropaneles
      paneles_paralelo = numeropaneles
      paneles_serie = 1

    }

    if (Np > 1) {

      if (Np == 2) {
        const panelestotales = this.redondearAlMultiploSuperior(numeropaneles, 2)

        cantidad_paneles = panelestotales
        paneles_paralelo = panelestotales / 2
        paneles_serie = 2

      } else { //Deberia ser 4
        const panelestotales = this.redondearAlMultiploSuperior(numeropaneles, 4)

        cantidad_paneles = panelestotales
        paneles_paralelo = panelestotales / 4
        paneles_serie = 4

      }
    }


    //Verificamos no superar el 20%
    const porcentaje2 = 1.2 * PotenciaMinimaGenerador

    //Potencia resultante del generador
    const PGmax = cantidad_paneles * datos.potencia


    if (PGmax < 1.2 * PotenciaMinimaGenerador && Np >= 1) {

      iziToast.show({
        title: 'OK',
        titleColor: '#00ff00',
        color: '#FFF',
        class: 'text-success',
        position: 'topRight',
        message: "la configuración de paneles es Eficiente",
        displayMode: 2,
      });

    } else {

      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "Panel Sobredimensionado, Considere configuraciones diferentes para hacer mas optimo el sistema",
        displayMode: 2
      });

    }
    const voltaje_array_fv = paneles_serie * datos.voc
    const amperaje_array_fv = datos.impp * paneles_paralelo

    console.log('Ahora emitir')
    const resultadoPanel = {
      potencia_arreglo_fv
,
      cantidad_paneles,
      paneles_paralelo,
      paneles_serie,
      PGmax,
      voltaje_array_fv,
      amperaje_array_fv,
    }
    console.log('emito', resultadoPanel)

    //Emitir aqui  this.resultadoPanelSubject.next(resultadoPanel);

    /*
this.resultadoPanelSubject.next({
 potencia_arreglo_fv
,
 cantidad_paneles,
 paneles_paralelo,
 paneles_serie,
 PGmax,
 //voltaje_array_fv,
 //amperaje_array_fv
});
*/
    /*
          this._calculoService.actualizarCalculo('panel', resultadoPanel);
    
    
          this._calculoService.actualizarResultadoPanel({
            potencia_arreglo_fv
,
            cantidad_paneles,
            paneles_paralelo,
            paneles_serie,
          });
    */
    return 'resultado'

  }


  redondearAlMultiploSuperior(numero: any, multiplo: any) {
    return Math.ceil(numero / multiplo) * multiplo;
  }




}

import { NavComponent } from '../../../nav/nav.component';
import { FooterComponent } from '../../../footer/footer.component';
import { AfterViewInit, Component, OnInit } from '@angular/core';

import { CalculadoraService } from '../../../../services/calculadora.service';

import Chart from 'chart.js/auto'
import html2canvas from 'html2canvas';

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Renderer } from 'three/webgpu';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';

import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators'

import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

import { getPosition } from 'suncalc'
//let suncalc3 =require('suncalc3')
import { ModelLoader } from '../../../calculadora/panel_solar/simular-panel-solar/cargarModelo';
import { TransformControls } from 'three/addons/controls/TransformControls.js'

import { ArreglosComponent } from '../arreglos/arreglos.component';
import { ProduccionArrayComponent } from '../../produccion-array/produccion-array.component';

import { PanelSolarService } from '../../../../services/panel-solar.service';

//Mapa de Leaflet
//import { Map, tileLayer, icon, Marker } from 'leaflet'
//import * as L from 'leaflet'

declare const L: any;

declare var $: any
declare var iziToast: any


@Component({
    selector: 'app-simular-panel',
    imports: [NavComponent, FooterComponent, FormsModule, CommonModule, ArreglosComponent, ProduccionArrayComponent],
    templateUrl: './simular-panel.component.html',
    styleUrl: './simular-panel.component.css'
})
export class SimularPanelComponent implements AfterViewInit, OnInit {
  panelForm!: FormGroup
  constructor(
    private _calculadoraService: CalculadoraService,
    private _panelSolarService: PanelSolarService,
    // private cargarModelo:ModelLoader,
  ) {

    this.panelForm = new FormGroup({
      potencia: new FormControl(this.panel_seleccionado.potencia, [
        Validators.required,
        Validators.min(10)
      ])
    })

  }

  public azimuth: any
  public inclinacion = 0
  public ChartProduccionVariable: any

  public panelSolar = {
    modelo: 'ZXM6-NH144',
    voc: 50.50, //Voltaje En cicuito Abierto
    isc: 11.53, //Intensidad en corto circuito
    impp: 10.94, //Intensidad en maxima potencia
    vmpp: 41.60, //Voltaje en maxima potencia
    eficiencia: 20.93,//Eficiencia en %
    potencia: 455,//Potencia del Panel
    coef_pmax_temp: -0.36, //Coeficiente de Potencia-Temperatura
    coef_voc_temp: -0.29,//Coeficiente de Voltage-Temperatura
    coef_isc_temp: 0.05, //Coeficiente de Corriente-Temperatura
    noct: 43, //Temperatura de Operacion Nominal de la Celula
    tension: 24, //Tension de Trabajo del panel solar 12V/24V
    fabricante: 'ZNSHINESOLAR',
    tecnologia: 'Monocristalino'
  }
  //https://www.sisifo.info/es/datainput

  public myScene = new THREE.Scene();

  public orientacionPanel = {
    angulo: 6, //Angulo de inclinacion con respecto al plano horizontal entre 0 y 90
    azimuth: 85, // Orientacion del panel solar entre -180 y 180 Grados -90=>Este 0=>Sur 90=>Oeste
  }
  //Ubicacion casa
  /*
    public ubicacionPanel = {
      latitud: 4.571077,
      longitud: -74.229634,
    }
  */

  //Huron EEUU

  public ubicacionPanel = {
    //Ubicado en Bosnia HERSEGOVINA LATITUD 44.300 Y LONGITUD 16.92
    latitud: 44.300,
    // longitud: -97.945,
    longitud: 16.92,
    azimuth: 0,
    inclinacion: 6,
  }

  public radiacion_diaria: any
  public DataRadiacion: any = []
  public data_minutos: any = []

  public radiacion_diaria_horizontal: any
  public DataRadiacion_horizontal: any = []
  public data_minutos_horizontal: any = []

  public unionArray: any = []

  public selectedModel: any
  public solarTracker: any
  public panelGroup: any
  public azimuthGroup: any
  public inclinacionGroup: any
  public baseGroup: any

  //Mapa
  public radio_busqueda = 30
  public circul: any

  //validación de Variables:
  public panelDefinido: boolean = false;
  public panelSeleccion: boolean = false;
  public filtro: boolean = true;
  //public filtro = 'predefinido'

  changeRadio() {
    console.log(this.filtro)
  
    if (!this.filtro) {
      this.panel_seleccionado = this.panel_propio
    } else {
      if (this.panelDefinido) {
        this.panel_seleccionado = this.panel_select
      }

    }

  }

  //Inicia Configuracion array Fotovoltaicos
  cantidadPaneles: number = 5;
  public paneles_bd: Array<any> = []
  public panel = 0
  public portada_panel = 'assets/img/01.jpg'
  public descripcion_panel = ''
  public panel_seleccionado = {
    voc: '', //Voltaje En cicuito Abierto
    isc: '', //Intensidad en corto circuito
    impp: '', //Intensidad en maxima potencia
    vmpp: '', //Voltaje en maxima potencia
    eficiencia: '',//Eficiencia
    potencia: '',//Potencia del Panel
    tc_of_pmax: '', //Coeficiente de Potencia-Temperatura
    tc_of_voc: '',//Coeficiente de Voltage-Temperatura
    tc_of_isc: '', //Coeficiente de Corriente-Temperatura
    noct: 43, //Temperatura de Operacion Nominal de la Celula
    tension: '',

    //Parametros adicionales
    max_isc: '',
    min_isc: '',
    max_voc: '',
    min_voc: '',
  }

  public panel_propio = {
    voc: '', //Voltaje En cicuito Abierto
    isc: '', //Intensidad en corto circuito
    impp: '', //Intensidad en maxima potencia
    vmpp: '', //Voltaje en maxima potencia
    eficiencia: '',//Eficiencia
    potencia: '',//Potencia del Panel
    tc_of_pmax: '', //Coeficiente de Potencia-Temperatura
    tc_of_voc: '',//Coeficiente de Voltage-Temperatura
    tc_of_isc: '', //Coeficiente de Corriente-Temperatura
    noct: 43, //Temperatura de Operacion Nominal de la Celula
    tension: '',

    //Parametros adicionales
    max_isc: '',
    min_isc: '',
    max_voc: '',
    min_voc: '',
  }


  public panel_select = {
    voc: '', //Voltaje En cicuito Abierto
    isc: '', //Intensidad en corto circuito
    impp: '', //Intensidad en maxima potencia
    vmpp: '', //Voltaje en maxima potencia
    eficiencia: '',//Eficiencia
    potencia: '',//Potencia del Panel
    tc_of_pmax: '', //Coeficiente de Potencia-Temperatura
    tc_of_voc: '',//Coeficiente de Voltage-Temperatura
    tc_of_isc: '', //Coeficiente de Corriente-Temperatura
    noct: 43, //Temperatura de Operacion Nominal de la Celula
    tension: '',

    //Parametros adicionales
    max_isc: '',
    min_isc: '',
    max_voc: '',
    min_voc: '',
  }

  public voltajeHijo = 0
  public amperajeHijo = 0
  public potenciaHijo = 0
  public cantidadPanelesHijo = 0
public configuracionArray:any //Union de todos los valores del Array
  //Finaliza Array Fotovoltaicos


  //menu
  public op = 2
  changeOp(op: any) {
    this.op = op;
  }
  //Finaliza Menu


  //Inicia crear Panel
  crearPanelSolar(panelForm: any) {
    if (panelForm.valid) {
      this.panelDefinido = true
      //this.panel_seleccionado=this.panel_propio
      this.panel_seleccionado = {
        voc: this.panel_propio.voc,
        isc: this.panel_propio.isc,
        impp: this.panel_propio.impp,
        vmpp: this.panel_propio.vmpp,
        eficiencia: this.panel_propio.eficiencia,
        potencia: this.panel_propio.potencia,
        tension: this.panel_propio.tension,
        tc_of_pmax: this.panel_propio.tc_of_pmax,
        tc_of_voc: this.panel_propio.tc_of_voc,
        tc_of_isc: this.panel_propio.tc_of_isc,

        noct: this.panel_propio.noct ?? 0,  // 🔹 Si no existe, asignamos un valor por defecto
        max_isc: this.panel_propio.max_isc ?? 0,
        min_isc: this.panel_propio.min_isc ?? 0,
        max_voc: this.panel_propio.max_voc ?? 0,
        min_voc: this.panel_propio.min_voc ?? 0

      };
      this.modoFormulario = 'editar';
      iziToast.show({
        title: '✅ ¡Excelente! ✅',
        titleColor: '#28a745',
        color: '#FFF',
        class: 'text-success',
        position: 'topRight',
        message: '🌞 Panel creado con éxito. ¡Listo para los cálculos! ⚡🔋'
      });
      this.formBloqueado = true;

    } else {
      iziToast.show({
        title: '⚠️ Oops... ⚠️',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: '✏️ Debes completar todos los campos antes de continuar. 📝🚀'
      });
    }

  }

  desbloquearFormulario() {
    console.log('Desbloqueo Formulario')
    this.formBloqueado = false;
    this.modoFormulario = 'guardar';
  }

  editarPanelSolar(panelForm: any) {
    if (panelForm.valid) {

      // this.panel_seleccionado=this.panel_propio
      this.panel_seleccionado = {
        voc: this.panel_propio.voc,
        isc: this.panel_propio.isc,
        impp: this.panel_propio.impp,
        vmpp: this.panel_propio.vmpp,
        eficiencia: this.panel_propio.eficiencia,
        potencia: this.panel_propio.potencia,
        tension: this.panel_propio.tension,
        tc_of_pmax: this.panel_propio.tc_of_pmax,
        tc_of_voc: this.panel_propio.tc_of_voc,
        tc_of_isc: this.panel_propio.tc_of_isc,

        noct: this.panel_propio.noct ?? 0,  // 🔹 Si no existe, asignamos un valor por defecto
        max_isc: this.panel_propio.max_isc ?? 0,
        min_isc: this.panel_propio.min_isc ?? 0,
        max_voc: this.panel_propio.max_voc ?? 0,
        min_voc: this.panel_propio.min_voc ?? 0

      };

      iziToast.show({
        title: '✅ ¡Excelente! ✅',
        titleColor: '#28a745',
        color: '#FFF',
        class: 'text-success',
        position: 'topRight',
        message: '🌞 Panel Actualizado con éxito. ¡Listo para los cálculos! ⚡🔋'
      });
      this.panelDefinido = true
      this.modoFormulario = 'editar';
      this.formBloqueado = true;
    }else{
      iziToast.show({
        title: '⚠️ Oops... ⚠️',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: '✏️ Debes completar todos los campos antes de continuar. 📝🚀'
      });
    }
  }
  //Finaliza Crear Panel
  modoFormulario: 'crear' | 'editar' | 'guardar' = 'crear';
  manejarAccion(form: NgForm) {
    if (this.modoFormulario === 'crear') {
      this.crearPanelSolar(form);
    } else if (this.modoFormulario === 'editar') {
      this.desbloquearFormulario()
      //this.editarPanelSolar(form);
    } else {
      this.editarPanelSolar(form);
      //this.guardarCambios();
    }
  }

  formBloqueado: boolean = false;

  obtenerTextoBoton(): string {
    return this.modoFormulario === 'crear' ? 'Crear'
      : this.modoFormulario === 'editar' ? 'Editar'
        : 'Guardar';
  }

  cambio(numeroPaneles: any) {
    //Debo emitir el nuevo numero de paneles hacia el Hijo
    console.log('Cambio el numero de paneles Solares',numeroPaneles)
    this.cantidadPaneles=numeroPaneles
  }


  cambioArray(valores: any) {
    this.configuracionArray=valores//Asigno todos los valores a la configuracion del Array
    //Cuando cambia el array en arreglos components actualizo los valores en el padre
    this.cantidadPanelesHijo = valores.cantidadPaneles || 0;
    this.potenciaHijo = valores.potencia || 0;
    this.amperajeHijo = valores.corriente || 0
    this.voltajeHijo = valores.voltaje || 0
    console.log('valores: ', valores,'Comprobacion voltajes hijo',this.voltajeHijo, this.configuracionArray)

    if (this.cantidadPanelesHijo > this.cantidadPaneles) {
      iziToast.show({
        title: '⚠️ ALERTA ⚠️',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "⚡ Cantidad de paneles en Array supera paneles Definidos. 🔋"
      });
    }

    /*
        if (this.controladorDefinido) {
          console.log('El controlador ya esta definido, entonces verifica la compatibilidad')
          // TO-DO  Verificar la compatibilidad con el Controlador
          this.validar_array_controlador()
        }*/
  }


//Cambios en el Hijo de Produccion

cambioProduccion(valoresproduccion:any){
console.log('Cambio en valores de Produccion esto es el papá',valoresproduccion)


}



  declinacion(dia: any) {
    const declinacion = 23.45 * Math.sin(360 * ((284 + dia) / 365))
    console.log('declinacion', declinacion)
    return declinacion
  }


  elevacion() { }

  //La ecuación del tiempo (EoT) (en minutos) es una ecuación empírica que corrige la excentricidad de la órbita de la Tierra 
  //y la inclinación axial de la Tierra. Una aproximación 2 la precisión de dentro de ½ minutos es:
  //https://www.pveducation.org/pvcdrom/properties-of-sunlight/solar-time
  EoT(d: any) {
    const B = (360 / 365) * (d - 81)
    const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)
    return EoT
  }

  //Factor de correccion de tiempo
  tc(longitud: any, LSTM: any, EoT: any) {
    const TC = 4 * (longitud - LSTM) + EoT
    return TC
  }

  ngOnInit(): void {
    this.ConsultarRadiacionDiaria()
    this.listar_paneles()
  }

  ngAfterViewInit(): void {

    // Mapa con País (Colombia) resaltado

    const map = L.map('map').setView([4.62111, -74.07317], 5);

    // Añadir una capa de mapas base
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //Inicia nuevo
    var customIcon = L.icon({
      iconUrl: './assets/img/marker.png',
      iconSize: [52, 52]
    })

    var markerOptions = {
      icon: customIcon,
      draggable: true,
    }



    var mc: any
    map.on('click', (e: { latlng: { lat: number; lng: number; }; }) => {
      if (mc != undefined) {
        console.log('ya esta definido el Pin')
      } else {

        mc = new L.Marker([e.latlng.lat, e.latlng.lng], markerOptions).addTo(map)
        this.circul = L.circle([e.latlng.lat, e.latlng.lng], { radius: this.radio_busqueda * 1000 }).addTo(map)
        mc.circulo = this.circul;

        this.ubicacionPanel.latitud = e.latlng.lat
        this.ubicacionPanel.longitud = e.latlng.lng


        //Tomar en cuenta que al mover mc el circulo no se va a mover
        mc.on('dragend', (event: any) => {

          var latlng = event.target.getLatLng();
          mc.circulo.setLatLng(latlng);
          this.circul.setRadius(this.radio_busqueda * 1000);

          //To-do llamara a actualizar los valores de latitud y longitud debouncedActualizarInclinacion

          this.ubicacionPanel.latitud = e.latlng.lat
          this.ubicacionPanel.longitud = e.latlng.lng
          this.ConsultarRadiacionDiaria()

        });

      }
      //var mc=new L.Marker([e.latlng.lat,e.latlng.lng],markerOptions).addTo(map)
    })

    // Archivo GeoJSON obtenido de https://geojson-maps.kyd.au/
    fetch('assets/colombia.json')
      .then(response => response.json())
      .then(data => {
        // Dibujar el polígono en el mapa
        var countryLayer = L.geoJSON(data, {
          style: {
            color: 'blue',
            weight: 2,
            fillOpacity: 0.1
          }
        }).addTo(map);
      });


    //Finaliza el mapa 

    //Inicia Grafico Inversor
    var canvasProduccionVariable = <HTMLCanvasElement>document.getElementById('ChartProducionVariable')
    var ctxInversor = canvasProduccionVariable.getContext('2d')!

    this.ChartProduccionVariable = new Chart(ctxInversor, {
      //type: 'bar',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],// hora de cada mes   horas_total.slice(0, 23)
        datasets: [

          {
            type: 'line',
            label: 'POtencia Salida Panel',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },

        ]
      },

      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Potencia Salida Panel',
            color: 'navy',
            position: 'bottom',
            align: 'center',
            font: {
              weight: 'bold'
            },
            padding: 2,
            fullSize: true,
          }
        }
      }

    });

    const dia = 259 //259 el 15 de Septiembre del 2024
    let latitud = 4.571077
    const longitud = -74.229634
    const utc = -5
    const LT = 23 //Hora local standart

    // calculamos LSTM
    const LSTM = 15 * utc
    console.log('Valor de LSTM', LSTM)

    const declinacion = 23.45 * Math.sin(this.grados_a_radianes((360 / 365) * (dia - 81)))
    console.log('declinacion decli', declinacion)

    //****************************************Formulando Par todo el año */

    const diasDeclinacion = []
    const declinacionDiaria = []

    for (let index = 1; index <= 365; index++) {
      diasDeclinacion.push(index)

      const anguloGrados = (360 / 365) * (index + 10);
      // Convertir grados a radianes
      const anguloRadianes = anguloGrados * (Math.PI / 180);

      const declinacionEnRadianes = Math.sin(anguloRadianes)
      const dos = (23.45 * (Math.PI / 180)) * declinacionEnRadianes //Resultado se da en radianes

      //Expresamos de nuevo en grados
      const declinacion = dos * (180 / Math.PI)
      declinacionDiaria.push(declinacion)

    }

    //Inicia Grafica Declinacion

    var canvass = <HTMLCanvasElement>document.getElementById('Declinacion')
    var ctx = canvass.getContext('2d')!

    var Grafico_1 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: diasDeclinacion,//label_mes.slice(0, 500),
        datasets: [
          {
            type: 'line',
            label: 'Declinación Solar',
            data: declinacionDiaria,//irradiacion_mes.slice(0, 500)
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    //Finaliza Grafica Declinacion


    const dias = []
    const e_tiempo = []

    for (let index = 1; index <= 365; index++) {
      dias.push(index)

      // Calcular B en grados y luego convertirlo a radianes
      const B = (360 / 365) * (index - 81)
      const B_rad = B * (Math.PI / 180) // Convertir B a radianes

      // Calcular EoT con B en radianes
      const EoT = (9.87 * Math.sin(2 * B_rad)) - (7.53 * Math.cos(B_rad)) - (1.5 * Math.sin(B_rad))
      e_tiempo.push(EoT)

      //console.log('Valor de EoT', EoT)
    }

    //Inicia Grafica TIEMPO

    var canvass = <HTMLCanvasElement>document.getElementById('EcuacionTiempo')
    var ctx = canvass.getContext('2d')!

    var Grafico_2 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dias,//label_mes.slice(0, 500),
        datasets: [
          {
            type: 'line',
            label: 'Ecuacion del Tiempo',
            data: e_tiempo,//irradiacion_mes.slice(0, 500)
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    //Finaliza Grafica Tiempo




    //Calculamos B
    //const B = (360/365) * (dia-81)
    const B = (360 / 365) * (dia - 81)// expresado en grados
    const B_rad = B * (Math.PI / 180)
    console.log('Valor de B', B_rad)


    //Calculamos EoT
    const EoT = (9.87 * Math.sin(2 * B_rad)) - (7.53 * Math.cos(B_rad)) - (1.5 * Math.sin(B_rad))//Resultado estaria dado en minutos
    console.log('Valor de EoT', EoT)


    //Calculamos TC
    const TC = 4 * (longitud - LSTM) + EoT// En Minutos
    console.log('Valor de TC', TC)

    //Calculamos LST
    const LST = LT + (TC / 60) //Es el tiempo solar local dado en horas
    console.log('valor de LST', LST)

    //Calculamos HRA

    const HRA = 15 * (LST - 12) //En grados
    console.log('valor de HRA', HRA)

    //Con todos los datos obtenidos calculamos la Elevacion

    // segunda ELEVACION

    const elevacionRadianes = Math.asin(
      Math.sin(this.grados_a_radianes(declinacion)) * Math.sin(this.grados_a_radianes(this.ubicacionPanel.latitud)) + Math.cos(this.grados_a_radianes(declinacion)) * Math.cos(this.grados_a_radianes(this.ubicacionPanel.latitud)) * Math.cos(this.grados_a_radianes(HRA))
    )
    //fin segunda ELEVACION

    //Convierto elevacion a grados
    const elevacion = this.radianes_a_grados(elevacionRadianes)

    console.log('La Elevacion del sol  para el dia', dia, 'es:', elevacion, 'radianes', elevacionRadianes, 'a la hora local', LT)

    //Ahora podemos calcular el Azimuth

    const azimuth_0 = Math.acos(
      (
        Math.sin(this.grados_a_radianes(declinacion)) *
        Math.cos(this.grados_a_radianes(this.ubicacionPanel.latitud)) -

        Math.cos(this.grados_a_radianes(declinacion)) *
        Math.sin(this.grados_a_radianes(this.ubicacionPanel.latitud)) *
        Math.cos(this.grados_a_radianes(HRA))
      )
      / Math.cos(this.grados_a_radianes(elevacion))
    )

    //convertimos a grados
    const azimuth = this.radianes_a_grados(azimuth_0);

    console.log('azimuth En grados: ', azimuth)
    // Ajuste dependiendo del HRA (mañana o tarde)
    if (HRA < 0) {
      console.log('HRA < 0 Azimuth:', 180 - azimuth);

    } else {
      console.log(' HRA > 0 Azimuth:', 180 + azimuth);
    }

    console.log('El azimuth  del sol  para el dia', dia, 'es:', azimuth, 'a la hora local', LT)

    //Forma segunda de calcular elevacion tambien usada como altitud
    if (this.ubicacionPanel.latitud >= 1) {
      //Pertenece a hemisferio Norte

      const testelevacion = 90 - this.ubicacionPanel.latitud + declinacion
      console.log('segunda forma elevacion ', testelevacion, 'Convertido a gradoas', testelevacion * (180 / Math.PI))
      //this.declinacion(1)

    } else {
      //Estaria en el hemisferio sur

      const testelevacion = 90 + this.ubicacionPanel.latitud - declinacion
      console.log('segunda forma elevacion ', testelevacion, 'Convertido a gradoas', testelevacion * (180 / Math.PI))
      //this.declinacion(1)
    }


    //******************************************************ANGULO DE INCIDENCIA EN EL PANEL SOLAR */

    var inclinacion_panel = 6
    const angulo_incidencia = Math.sin(this.grados_a_radianes(elevacion)) * Math.cos(this.grados_a_radianes(inclinacion_panel))
      + Math.cos(this.grados_a_radianes(elevacion)) * Math.sin(this.grados_a_radianes(inclinacion_panel)) * Math.cos(this.grados_a_radianes(azimuth - 180))

    console.log('El Angulo de incidencia solar en radianes  es:', angulo_incidencia, 'en grados:', this.radianes_a_grados(angulo_incidencia))

    //Lienzo 3d para el panel
    const canvas = document.querySelector('#myCanvas') as HTMLCanvasElement
    if (canvas) {

      const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap


      const fov = 70; //45
      const aspect = 2; // the canvas default
      const near = 0.1;
      const far = 300; //100
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(0, 10, 20);

      const controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 5, 0);
      controls.update();

      const scene = new THREE.Scene();
      //scene.background = new THREE.Color('rgb(179, 209, 255)');// Color de scena azul claro
      //scene.background = new THREE.Color('rgb(36, 32, 31)'); color un poco mas oscuro
      scene.background = new THREE.Color(0x000000) //Color de fondo negro

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.1);
      hemiLight.position.set(0, 20, 0); // Simula luz del cielo y el suelo
      scene.add(hemiLight);

      scene.fog = new THREE.Fog(0x000000, 10, 500); // Niebla negra desde 10 a 100 unidades

      ///////////////////////////////// Definicion de grupos ///////////////////////////////////////////////

      const grupoHorizontal = new THREE.Group();
      const grupoVertical = new THREE.Group();

      const grupoGeneral = new THREE.Group();
      scene.add(grupoGeneral);

      const grupoAzimuth = new THREE.Group();
      const grupoInclinacion = new THREE.Group();
      scene.add(grupoAzimuth);
      grupoAzimuth.add(grupoInclinacion);

      const axesHelper = new THREE.AxesHelper(3);
      grupoAzimuth.add(axesHelper)

      grupoGeneral.add(grupoAzimuth)

      const pivote = new THREE.Object3D();
      scene.add(pivote);
      //pivote.add(grupoAzimuth);


      ////////////////////////

      const loaderModelo = new GLTFLoader()
      const controlesMovimiento = new TransformControls(camera, renderer.domElement)//renderer.domElement

      let objetoClase = new ModelLoader();
      // Cargar el modelo de la lámpara
      // objetoClase.loadModel('../Modelos/SolarTracker/SolarTracker.gltf', scene)
      objetoClase.loadModel('../Modelos/SolarTracker/Origenes/SolarTracker_origenes.gltf', scene)
        // objetoClase.loadModel('../Modelos/SolarTracker/origenes2/untitled.gltf', scene)
        .then((modelo) => {
          //modelo.rotation.z = THREE.MathUtils.degToRad(-90);// roto el modelo de manera global

          modelo.updateMatrixWorld(true)
          this.solarTracker = modelo



          this.azimuthGroup = this.solarTracker.getObjectByName('azimuth');
          this.panelGroup = this.solarTracker.getObjectByName('panel');
          this.inclinacionGroup = this.solarTracker.getObjectByName('inclinacion');
          this.baseGroup = this.solarTracker.getObjectByName('base');

          this.azimuth = new THREE.Group()
          scene.add(this.azimuth);

          const axesazimuth = new THREE.AxesHelper(10);
          this.azimuth.add(axesazimuth)

          if (this.azimuthGroup) {
            console.log('Grupo azimuth encontrado')

            grupoAzimuth.add(this.azimuthGroup)

            const centro = this.azimuthGroup.position.clone();
            grupoAzimuth.position.copy(centro);
            this.panelGroup.position.sub(centro) //****** */
            this.inclinacionGroup.position.sub(centro) //****** */



            this.azimuthGroup.position.sub(centro)

            const axesAzimuth = new THREE.AxesHelper(5);
            grupoAzimuth.add(axesAzimuth)

          }
          if (this.panelGroup && this.inclinacionGroup) {

            // this.panelGroup.rotation.y = THREE.MathUtils.degToRad(90);//Roto el panel para que coincida con el sur
            //this.inclinacionGroup.rotation.y = THREE.MathUtils.degToRad(90);//Roto el panel para que coincida con el sur

            grupoInclinacion.add(this.panelGroup)
            grupoInclinacion.add(this.inclinacionGroup)
            scene.add(this.baseGroup)

            const axesInclinacion = new THREE.AxesHelper(5);
            grupoInclinacion.add(axesInclinacion)

          }

        })
        .catch((error) => {
          console.error('Error al cargar el SolarTrackert:', error);
        });

      /////////////************************* INICIO FUNCIONES DE MOVIMIENTO DEL PANEL  *****************************////////////
      const ajustarAzimut = (anguloAzimuth: any) => {

        const radAzimuth = THREE.MathUtils.degToRad(anguloAzimuth);
        grupoAzimuth.rotation.y = radAzimuth
        console.log('Ajuste de azimuth 111 ingresa', anguloAzimuth, 'Roto', radAzimuth)
        /////*********************************************** */
        const anguloAzimut = THREE.MathUtils.radToDeg(grupoAzimuth.rotation.y); // Convertimos de radianes a grados
        //const anguloInclinacion = THREE.MathUtils.radToDeg(grupoInclinacion.rotation.x);
        const anguloInclinacion = THREE.MathUtils.radToDeg(this.panelGroup.rotation.x);
        this.ubicacionPanel.azimuth = anguloAzimut//Actualizo angulo de azimuth del panel solar
        console.log('Ajuste de Azimuth, anguloAzimuth:', anguloAzimut, 'Inclinacion:', anguloInclinacion)

        // this.calcularNuevosValores(grupoAzimuth.rotation.y,grupoInclinacion.rotation.x)//Enviando valores en Radianes
        this.calcularNuevosValores(anguloAzimut, anguloInclinacion)//Enviando valores en grados
      }

      const ajustarInclinacion = (anguloInclinacion: any) => {
        console.log(anguloInclinacion)
        if (anguloInclinacion >= 0 && anguloInclinacion <= 90) {
          const radInclinacion = THREE.MathUtils.degToRad(anguloInclinacion);
          this.panelGroup.rotation.x = radInclinacion
          this.inclinacionGroup.rotation.x = radInclinacion

          const anguloAzimut = THREE.MathUtils.radToDeg(grupoAzimuth.rotation.y); // Convertimos de radianes a grados
          // const anguloInclinacion = THREE.MathUtils.radToDeg(grupoInclinacion.rotation.x);
          // this.calcularNuevosValores(grupoAzimuth.rotation.y,radInclinacion)//Enviando valores en radianes
          console.log('Ajuste de inclinacion, anguloAzimuth:', anguloAzimut, 'Inclinacion:', anguloInclinacion)
          this.calcularNuevosValores(anguloAzimut, anguloInclinacion)//Enviando valores en grados
        } else {
          console.warn("Ángulo de inclinación fuera de rango (0-90 grados).");
        }
      }

      /////////////************************* FIN FUNCIONES DE MOVIMIENTO DEL PANEL  *****************************/////////////

      //Añadimos el plano 
      {

        // Definir el tamaño del plano y la cantidad de divisiones en la rejilla
        const planeSize = 50;
        const gridDivisions = 50; // Número de divisiones en la rejilla

        // Crear un GridHelper
        const gridHelper = new THREE.GridHelper(planeSize, gridDivisions, 0x000000, 0x808080); // Colores de los ejes y líneas
        // Ajustar la transparencia (opcional)
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.5; // Ajusta la opacidad a tu gusto
        scene.add(gridHelper);

        // Crear el plano que recibirá sombras
        const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
        //const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5, color: 0x808080,}); // Material que recibe sombras
        const planeMaterial = new THREE.MeshStandardMaterial({ opacity: 0.5, color: 0x808080, }); // Material que recibe sombras
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.rotation.x = -Math.PI / 2; // Hacer que el plano esté horizontal
        plane.position.y = 0; // Colocarlo en la posición adecuada (en el "suelo")
        plane.receiveShadow = true; // Hacer que el plano reciba sombras
        scene.add(plane);

      }

      {

        const skyColor = 0xB1E1FF; // light blue
        const groundColor = 0xB97A20; // brownish orange
        const intensity = 2;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);

      }

      {
        //const axesHelper = new THREE.AxesHelper(15);
        // scene.add(axesHelper);
      }


      const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.02);
      renderer.clippingPlanes = [clippingPlane];


      //Creacion de la ecliptica
      const radio = 25 //antes 10
      const ecliptica = new THREE.SphereGeometry(
        radio,
        50,
        50,
        0,
        Math.PI * 2,
        Math.PI / 2 - THREE.MathUtils.degToRad(23.45),
        THREE.MathUtils.degToRad(46.9)
      );
      const eclipticaMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3 //0.3
      });
      const eclipticaMesh = new THREE.Mesh(ecliptica, eclipticaMaterial);

      //Inicia la ecliptica de acuerdo a la ubicacion del panel Solar

      eclipticaMesh.rotation.z = THREE.MathUtils.degToRad(90 - this.ubicacionPanel.latitud);
      //CreoEl grupo para posiionSolar
      const grupoEcliptica = new THREE.Group();
      grupoEcliptica.add(eclipticaMesh)
      scene.add(grupoEcliptica);

      //Creamos la Esfera Solar
      const solarSphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        //new THREE.MeshPhongMaterial({ color: 0xffff00 })
        new THREE.MeshStandardMaterial({
          color: 0xffff00,
          emissive: 0xffff00,  // El Sol emite luz
          emissiveIntensity: 1  // Intensidad de la emisión
        })
      );

      grupoEcliptica.add(solarSphere)

      //Añadimos luz soalr

      const luzSolar = new THREE.DirectionalLight(0xffe600, 8);  // Color blanco, intensidad 1, distancia máxima 100
      luzSolar.castShadow = true

      luzSolar.shadow.mapSize.width = 512; // default
      luzSolar.shadow.mapSize.height = 512; // default
      luzSolar.shadow.camera.near = 0.5; // default
      luzSolar.shadow.camera.far = 500; // default

      // Añadir la luz al objeto del Sol, de esta manera se moverá con el Sol
      solarSphere.add(luzSolar); //<-------------------------------------------------------------ACTIVAR LUZ SOLAR

      //Controles de Lil Gui

      // Crear un GUI con lil-gui
      let animando = true
      let dayOfYear = 0;

      const contenedorGui = document.getElementById('columna3D')

      if (contenedorGui) {
        //const gui = new GUI( { container: $('#contenedor') } );
        const gui = new GUI({ container: contenedorGui });

        //const parametros={latitud:this.ubicacionPanel.latitud}
        const parametros = { latitud: latitud };

        // Añadir un control deslizante para modificar la latitud
        /*  gui.add(parametros, 'latitud', -90, 90).name('Latitud').onChange(function (value) {
            latitud = value;  // Actualizar latitud
            actualizarInclinacion(value);  // Llamar a la función para actualizar la inclinación
          });*/

        gui.add(parametros, 'latitud', -90, 90)
          .name('Latitud')
          .onChange((value) => {
            latitud = value; // Actualizar latitud local
            debouncedActualizarInclinacion(value); // Llamar a la función con debounce
          });


        let orientacionAzimuth = 0
        const parametroOrientacion = { angulo: orientacionAzimuth };
        gui.add(parametroOrientacion, 'angulo', -179, 179).name('Azimuth Panel').onChange(function (value) {
          orientacionAzimuth = value;  // Actualizar latitud
          ajustarAzimut(orientacionAzimuth);  // Llamar a la función para actualizar la inclinación
        });


        let inclinacion = 0
        const parametroInclinacion = { angulo: inclinacion };
        gui.add(parametroInclinacion, 'angulo', 0, 90).name('Inclinacion Panel').onChange(function (value) {
          inclinacion = value;  // Actualizar latitud
          ajustarInclinacion(inclinacion);  // Llamar a la función para actualizar la inclinación
        });


        const parametrosDia = { dayOfYear: dayOfYear };
        gui.add(parametrosDia, 'dayOfYear', 1, 365).name('Dia Año').onChange(function (value) {
          dayOfYear = value;  // Actualizar latitud
          updateSunPosition(dayOfYear, 12);  // Llamar a la función para actualizar la inclinación
        });

        const controles = {
          latitud: latitud,
          iniciarDetener: function () {
            animando = !animando;  // Cambiar el estado de la animación
            if (animando) {
              console.log('Animación iniciada');
              animate();  // Reanudar la animación
            } else {
              console.log('Animación detenida');
            }
          }
        };

        gui.add(controles, 'iniciarDetener').name('Iniciar/Detener'); // Botón para iniciar/detener animación

      }

      //Puntos Cardinales
      const loader = new FontLoader();
      loader.load('../Modelos/helvetiker_regular.typeface.json', function (font) {
        const createLabel = (text: any, x: any, y: any, z: any) => {
          const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.5,  // Tamaño de la letra
            //height: 0.1,
            depth: 7,
          });
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.position.set(x, y, z);//x y z
          textMesh.rotation.x = THREE.MathUtils.degToRad(90);
          scene.add(textMesh);
        };

        // Puntos cardinales
        createLabel('Sur', -11, 0, 0);  // Norte (0°)
        createLabel('Este', 0, 0, -11);  // Este (90°)
        createLabel('Norte', 11, 0, 0); // Sur (180°)
        createLabel('Oeste', 0, 0, 11); // Oeste (270°)
      });

      //Funcion debounce:
      function debounce(func: Function, wait: number) {
        let timeout: ReturnType<typeof setTimeout>;
        return (...args: any[]) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => func(...args), wait);
        };
      }


      const debouncedActualizarInclinacion = debounce((latitud: any) => {
        this.ubicacionPanel.latitud = latitud;
        const inclinacion = 90 - this.ubicacionPanel.latitud;
        eclipticaMesh.rotation.z = THREE.MathUtils.degToRad(inclinacion);
        console.log('Consultando radiacion');
        this.ConsultarRadiacionDiaria();
      }, 300); // Retraso de 300ms



      //ajustarAzimut(120)
      //ajustarInclinacion(90)
      //Inclinacion de la Ecliptica
      const actualizarInclinacion = (latitud: any) => {
        this.ubicacionPanel.latitud = latitud
        const inclinacion = 90 - this.ubicacionPanel.latitud;
        eclipticaMesh.rotation.z = THREE.MathUtils.degToRad(inclinacion);
        console.log('Consultando radiacion')
        this.ConsultarRadiacionDiaria()
      }

      /*
            function obtenerAzimutEInclinacion(this: any) {
              const anguloAzimut = THREE.MathUtils.radToDeg(grupoAzimuth.rotation.y); // Convertimos de radianes a grados
              const anguloInclinacion = THREE.MathUtils.radToDeg(grupoInclinacion.rotation.x);
              console.log("Azimut:", anguloAzimut, "Inclinación:", anguloInclinacion);
              this.calcularNuevosValores(anguloAzimut, anguloInclinacion)
              // Aquí podrías calcular la irradiancia en función de estos valores
              //calcularIrradiancia(anguloAzimut, anguloInclinacion);
            }*/

      function updateSunPosition(dayOfYear: any, hour: any) {

        // Establecemos la fecha inicial como el 1 de enero
        let baseDate = new Date('2022-01-01T00:00:00'); // Cambia el año según sea necesario

        // Agregar el día del año (dayOfYear) para obtener la fecha correspondiente
        baseDate.setDate(baseDate.getDate() + (dayOfYear - 1)); // -1 porque el 1er día del año es 1
        baseDate.setHours(hour); // Establecemos la hora local

        // Obtener la posición solar usando la librería SunCalc
        let sunPosition = getPosition(baseDate, latitud, longitud);

        // Calcular las coordenadas (x, y, z) en base a la altitud y el azimut
        let x = radio * (Math.cos(sunPosition.altitude)) * (Math.cos(sunPosition.azimuth));
        let z = radio * (Math.cos(sunPosition.altitude)) * (Math.sin(sunPosition.azimuth));
        let y = radio * (Math.sin(sunPosition.altitude));

        // Mostrar las coordenadas para verificar la posición
        ///console.log(`Día del año: ${dayOfYear}, Hora: ${hour}`);
        // console.log(`Posición del sol - x: ${x}, y: ${y}, z: ${z}`);
        solarSphere.position.set(x, y, z);
        //const posicionLinea = lineaSolCentro.geometry.attributes['position'];
        //posicionLinea.setXYZ(1, x, y, z);  // Incluimos la coordenada Y en la línea
        //posicionLinea.needsUpdate = true;
      }


      let hour = 0; // Empieza en la primera hora del día
      const daysInYear = 365;
      const hoursInDay = 24;

      function animate() {
        if (animando) {  // Solo animar si la variable animando es true
          requestAnimationFrame(animate);

          hour += 0.3; // Velocidad de la animación 0.05 0.08
          if (hour >= hoursInDay) {
            hour = 0;
            dayOfYear = (dayOfYear + 1) % daysInYear;
          }
          // Actualizar la posición del Sol
          updateSunPosition(dayOfYear, hour);
        }
        // Renderizar la escena
        renderer.render(scene, camera);
      }

      animate()



      function resizeRendererToDisplaySize(renderer: any) {

        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {

          renderer.setSize(width, height, false);

        }

        return needResize;

      }

      function render() {
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
      }

      // Solo renderizar cuando cambie la escena
      controls.addEventListener('change', render);
      controlesMovimiento.addEventListener('change', render);
      window.addEventListener('resize', render);

      requestAnimationFrame(render)

    }
    //Finaliza lienzo 3d

  }

  grados_a_radianes(grados: any) {
    const radianes = grados * (Math.PI / 180)
    return radianes
  }

  radianes_a_grados(radianes: any) {
    const grados = radianes * (180 / Math.PI)
    return grados
  }


  //Inicia Consultar Radiacion diaria
  ConsultarRadiacionDiaria() {
    forkJoin({
      datos1: this.obtener_Radiacion_Horizontal(), // La primera petición
      datos2: this.obtener_radiacion_inclinacion_optima()  // La segunda petición
    }).subscribe(({ datos1, datos2 }) => {
      // Aquí tendrás acceso a los resultados de ambas peticiones cuando ambas se completen
      this.radiacion_diaria_horizontal = datos1;

      this.radiacion_diaria_horizontal = datos1//Inclinacion planoHorizontal
      for (let clave of this.radiacion_diaria_horizontal) {
        let objeto = {
          mes: clave['month'],
          hora: clave['time'],
          irradiacion: clave['G(i)'],
          temperatura: clave['T2m']
        }
        this.DataRadiacion_horizontal.push(objeto)//Agregamos el objeto a los datos, contendra la información de la radiación para todos los meses
        //}
      }
      this.radiacion_diaria = datos2;//inclinacion Optima
      for (let clave of this.radiacion_diaria) {
        let objeto = {
          mes: clave['month'],
          hora: clave['time'],
          irradiacion: clave['G(i)'],
          temperatura: clave['T2m']
        }
        this.DataRadiacion.push(objeto)//Agregamos el objeto a los datos, contendra la información de la radiación para todos los meses
        //}
      }

      ////////////////////////////
      //Union de array y Calculo de constante K
      console.log('-------------------------')
      function calcularK(irradiacion1: any, irradiacion2: any) {
        if (irradiacion2 === 0) return 0; // Para evitar división por cero
        return irradiacion1 / irradiacion2;
      }

      // Unir ambos arrays
      this.unionArray = this.DataRadiacion.map((item: any, index: any) => {
        const irradiacion_optima = item.irradiacion;
        const irradiacion_plano_horizontal = this.DataRadiacion_horizontal[index].irradiacion;

        return {
          mes: item.mes,
          hora: item.hora,
          irradiacion_optima: irradiacion_optima,
          irradiacion_plano_horizontal: irradiacion_plano_horizontal,
          K: calcularK(irradiacion_optima, irradiacion_plano_horizontal),
          temperatura: item.temperatura
        };
      });

      console.log('Union de array', this.unionArray);
      //this.calcularNuevosValores()
      //finaliza union
    });
  }  //Finaliza consultar radiacion diaria


  obtener_Radiacion_Horizontal() {
    const lat = this.ubicacionPanel.latitud
    const lon = this.ubicacionPanel.longitud
    const angleoptimo = 3.7 + 0.69 * this.ubicacionPanel.latitud
    const angle = angleoptimo//Tomando en cuenta un angulo optimo calculado de acuerdo a la ubicación

    return this._calculadoraService.consultar_radiacion_diaria_plano_Horizontal(lat, lon, angle).pipe(
      map(response => response.data.outputs.daily_profile)
    )

  }


  obtener_radiacion_inclinacion_optima() {
    const lat = this.ubicacionPanel.latitud
    const lon = this.ubicacionPanel.longitud
    const angleoptimo = 3.7 + 0.69 * this.ubicacionPanel.latitud
    const angle = angleoptimo//Tomando en cuenta un angulo optimo calculado de acuerdo a la ubicación


    return this._calculadoraService.consultar_radiacion_diaria(lat, lon, angle).pipe(
      map(response => response.data.outputs.daily_profile)
    )



  }

  calcularNuevosValores(azimuth: any, inclinacion: any) {
    //Debe recibir angulos en radianes
    console.log('azimuth', azimuth, 'Inclinación', inclinacion, this.ubicacionPanel.latitud)
    var FI = 0
    //Calcular factor de irradiacion

    //Datos para el grafico
    var label = []
    var sumas = []
    var temperaturas = []

    //Extraccion de los datos para un mes en especifico
    var mes_selecionado = '9'
    //Produccion deacuerdo a temperatura
    var Tcell = []
    var voc_t = []
    var isc_t = []
    var Potencia_t = [] //Potencia total producida en cada Hora

    const optima = 3.7 + 0.69 * this.ubicacionPanel.latitud


    if (inclinacion > 15 && inclinacion <= 90) {
      FI = 1 - (1.2e-4 * (inclinacion - optima) ** 2 + 3.5e-5 * azimuth ** 2)
      console.log('>15<=90 Recalcular Con Factor De Irradiacion: FI', FI, 'Inclinacion', inclinacion, azimuth, azimuth ** 2, 'anguloOptimo', optima)
    }
    if (inclinacion <= 15) {
      FI = 1 - (1.2e-4 * (inclinacion - optima) ** 2)
      console.log(' <= 15 Grados  Recalcular Con Factor De Irradiacion: FI', FI, 'Inclinacion', inclinacion, 'anguloOptimo', optima)
    }

    for (let clave of this.unionArray) {
      if (clave.mes == parseInt(mes_selecionado)) {
        //console.log('Mes seeleccionado igual a mes', mes_selecionado,clave.irradiacion_plano_horizontal*clave.K*FI,clave.irradiacion_plano_horizontal,clave.K,FI)
        label.push(clave.hora)
        sumas.push(clave.irradiacion_plano_horizontal * clave.k * FI)
        temperaturas.push(clave.temperatura)
        //Calculamos los valores de produccion
        let temperatura_celula = clave.temperatura + (this.panelSolar.noct - 20) * clave.irradiacion_plano_horizontal * clave.K * FI / 800
        //console.log('Temperaturas de a celula',temperatura_celula)
        Tcell.push(temperatura_celula)
        let produce_v = (this.panelSolar.voc * (1 + (this.panelSolar.coef_voc_temp / 100) * (temperatura_celula - 25))) * 1 //this.paneles_serie aqui son los paneles en serie, se deja por default en uno para pruebas
        voc_t.push(produce_v)
        let produce_i = (this.panelSolar.isc * (1 + (this.panelSolar.coef_isc_temp / 100) * (temperatura_celula - 25)) * clave.irradiacion_plano_horizontal * clave.K * FI / 1000) * 1 //this.paneles_paralelo aqui son los paneles en paralelo, se deja por default en uno para pruebas
        isc_t.push(produce_i)//Tomando en cuenta Una irradiancia especifica


        //TODO debe aplicarse es a la irradiaicon media despues de haberle aplicado la correccion de FI
        //La irradiación sobre la superficie con inclinación y acimut no óptimos se calcula
        //multiplicando la irradiación sobre la superficie con inclinación óptima por el factor de irradiación:
        //let irradiaicon_resultante=clave.irradiacion_optima*FI
        //console.log(irradiaicon_resultante)
        //let produce = (this.panelSolar.potencia * (1 + (this.panelSolar.coef_pmax_temp / 100) * (temperatura_celula - 25)) * (clave.irradiacion_plano_horizontal * clave.K * FI / 1000)) * 1 //this.numero_paneles
        let produce = (this.panelSolar.potencia * (1 + (this.panelSolar.coef_pmax_temp / 100) * (temperatura_celula - 25)) * (clave.irradiacion_plano_horizontal * clave.K * FI / 1000)) * 1 //this.numero_paneles
        if (produce < 0) {
          produce = 0
        }
        Potencia_t.push(produce)
      }
    }

    //console.log('Actualizando Grafico > 15', Potencia_t)
    this.ChartProduccionVariable.data.datasets[0].data = Potencia_t //Energia almacenada porque potencia FV fue mayor a consumos
    this.ChartProduccionVariable.update(); //Actualizamos graficos 
    //Finaliza Grafica del esatdo de la bateria
    //Ahora calcular salida de voltaje de acuerdo a factor de irradiacion

    /*
    //Verificacion 
      for (var i = 0; i <= 90; i++) {
    
        for(var azi=0; azi<=180; azi++){
    
          if (i > 15 && i <= 90) {
            FI = 1 - (1.2e-4 * (i -optima) ** 2 + 3.5e-5 * azi ** 2)
    
            if(FI <=0){
              console.log('inclinacion >15<=90:',i,'FI',FI,'Azimut:',azi)
            }
            
          }
          if (i <= 15) {
            FI = 1 - (1.2e-4 * (i - optima) ** 2)
    
            if(FI <=0){
              console.log('inclinacion <=15:',i,'FI:',FI,'Azimut:',azi)
            }
           
          }
        }
    
      }*/

  }


  listar_paneles() {

    this._panelSolarService.listar_paneles().subscribe({
      next: (response) => {
        this.paneles_bd = response; // Aquí 'response' es el array de paneles
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
  }


  buscar_imagen_panel(_id: any) {
    this.paneles_bd.forEach(element => {
      if (_id == element._id) {
        this.portada_panel = element.portada
        this.descripcion_panel = element.contenido
 
        this.panel_seleccionado = {
          voc: element.voc,
          isc: element.isc,
          impp: element.impp,
          vmpp: element.vmpp,
          eficiencia: element.eficiencia,
          potencia: element.potencia,
          tension: element.tension,
          tc_of_pmax: element.tc_of_pmax,
          tc_of_voc: element.tc_of_voc,
          tc_of_isc: element.tc_of_isc,

          noct: element.noct ?? 0,  // 🔹 Si no existe, asignamos un valor por defecto
          max_isc: element.max_isc ?? 0,
          min_isc: element.min_isc ?? 0,
          max_voc: element.max_voc ?? 0,
          min_voc: element.min_voc ?? 0

        };
        this.panel_select = this.panel_seleccionado //El panel del SElect es igual al de trabajo
        //asignar valores a calculo final 
        //this.calculo.panel = element._id
        this._calculadoraService.setPanelId(element._id)
        //this.camposRequeridos.panel = true
      }
    });
    this.panelDefinido = true
    //this._panelSolarService.panel_seleccionado = this.panel_seleccionado
    //this.calcularPaneles()
  }

}

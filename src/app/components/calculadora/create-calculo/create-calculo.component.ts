import { AfterViewInit, Component, ViewChild } from '@angular/core';
declare const L: any;
import { FooterComponent } from "../../footer/footer.component";
import { NavComponent } from '../../nav/nav.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Calculo } from '../../../interface/calculo';

import { NgxTinymceModule, TinymceComponent } from 'ngx-tinymce';
import { CalculadoraService } from '../../../services/calculadora.service';

//Llamado de clases
import { PanelSolar } from '../../paneles/panel';
import { ControladorSolar } from '../../controladores/controlador';
import { Bateria } from '../../baterias/bateria';
import { Inversor } from '../../inversores/inversor';


//LLamado a servicios
import { UbicacionService } from '../../../services/ubicacion.service';
import { PanelSolarService } from '../../../services/panel-solar.service';
import { InversorService } from '../../../services/inversor.service';
import { ControladorService } from '../../../services/controlador.service';
import { BateriaService } from '../../../services/bateria.service';
import { Subscription } from 'rxjs';

import { Chart } from 'chart.js';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { ActivatedRoute, Router } from '@angular/router';
import { ArreglosComponent } from '../../simulaciones/paneles/arreglos/arreglos.component';
declare var iziToast: any
declare var $: any

@Component({
  selector: 'app-create-calculo',
  imports: [FooterComponent, NavComponent, CommonModule, FormsModule, TinymceComponent, ArreglosComponent],
  templateUrl: './create-calculo.component.html',
  styleUrl: './create-calculo.component.css'
})
export class CreateCalculoComponent implements AfterViewInit {

  //Pruebas de Componente Hijo
  tipoDeConexion: string = 'series';
  cantidadPaneles: number = 0;
  valorPanel: number = 300;  // Por ejemplo, 300W por panel

  //Cambios esperados desde el Componente Hijo
  @ViewChild(ArreglosComponent) arreglos: any;

  public voltajeHijo = 0
  public amperajeHijo = 0
  public potenciaHijo = 0
  public cantidadPanelesHijo = 0



  cambioArray(valores: any) {

    //Cuando cambia el array en arreglos components actualizo los valores en el padre
    this.cantidadPanelesHijo = valores.cantidadPaneles;
    this.potenciaHijo = valores.potencia;
    this.amperajeHijo = valores.corriente
    this.voltajeHijo = valores.voltaje
    //Asigno los valores que me retorna El diseño del array Fotovoltaico desde el hijo arreglos
    //TO-DO observar que no seria necesario asignarlom en esta parte
    this.panelResult.peakpower = valores.potencia || 0
    this.panelResult.cantidad_paneles = valores.cantidadPaneles

    console.log('Valores en el componnete padre', valores, this.panelResult)

    const calculoPanel = {
      potencia_arreglo_fv: valores.potencia,
      peakpower: valores.potencia,
      cantidad_paneles: valores.cantidadPaneles,
      paneles_paralelo: valores.paralelos,
      paneles_serie: valores.series,
      //PGmax,
      voltaje_array_fv: valores.voltaje,
      amperaje_array_fv: valores.corriente,
      //tensionMaxiaGenerador,
      // intensidadMaxiaGenerador,
    }
    this._calculadoraService.setPanelResult(calculoPanel);
    //Pongo los datos en el servicio de calculo y pongo los campos requeridos en True

    //TO-DO Cada vez que se modIFICAN LOS PANELES O EL aRRAY DEBERIA VALIDAR LA CORRIENTE Y VOLTAJE MINIMO DEL CONTROLADOR SOLAR, Y CUANDO SELECCIONE EL CONTROLADOR LO UNICO QUE TENGO QUE HACER ES VALIDAR LA COMPATIBILIDAD

    //iNICIA VALIDAR MAX. MINIMO cONTROLADOR

    const IGsc = calculoPanel.paneles_paralelo * this.panel_seleccionado.isc//Intensidad corto Circuito del los paneles
    const minCorrienteControlador = 1.25 * IGsc
    //this.camposRequeridos.minCorrienteControlador = true

    //Determinar tEnsion minima controlador
    const UGoc = calculoPanel.paneles_serie * this.panel_seleccionado.voc

    const minVoltageControlador = UGoc + (this.panel_seleccionado.tc_of_voc) * (-10 - 25)

    console.log('estos serian los valores minimos que deberia tener el controlador solar a conecar', minCorrienteControlador, minVoltageControlador)

    this.controladorResult.minVoltageControlador = minVoltageControlador,
      this.controladorResult.minCorrienteControlador = minCorrienteControlador,
      //fINALIZA CORRIENTE MAXIMA mINIMA cONTROLADOR


      this.camposRequeridos.potencia_arreglo_fv = true
    this.camposRequeridos.paneles_serie = true
    this.camposRequeridos.paneles_paralelo = true
    this.camposRequeridos.voltaje_array_fv = true
    this.camposRequeridos.amperaje_array_fv = true



    //TO-DO
    //Cada vez que se presenta un cambio en el array debo de actualizar los valores de resultados del panel calculado

    if (this.cantidadPanelesHijo > this.cantidadPaneles) {
      iziToast.show({
        title: '⚠️ ALERTA ⚠️',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "⚡ Cantidad de paneles en Array supera paneles Calculados. 🔋",
        timeout: 6000,
        progressBar: true,
        displayMode: 1
      });

    }


    if (this.controladorDefinido) {
      console.log('El controlador ya esta definido, entonces verifica la compatibilidad')
      // TO-DO  Verificar la compatibilidad con el Controlador
      this.validar_array_controlador()

    }
  }
  //public panel2: PanelSolar;

  //Ubicacion predefinida donde iniciara el mapa
  public longitud = -74.220
  public latitud = 4.582

  //Configuracion tinyMCE
  public config: any = {}
  public op = 1

  //Valores Radio Button
  public filtro = 'ubicacion'
  public filtro_controladores = 'ubicacion'
  public filtro_inversores = 'ubicacion'
  public filtro_baterias = 'ubicacion'
  public radio_busqueda = 30
  public circul: any
  //Fin Valores radio BUtton

  public calculo = {

    //Del cliente
    usuario: '',
    latitud: 0,
    longitud: 0,
    autoriza_correccion: false,
    descripcion: '',
    tipo: 'potencias',
    nombre: '',//Nombre que se le quiere dar al calculo
    panel: '',
    inversor: '',
    bateria: '',
    controlador: '',
    simultaneo: 0,
    total_dia: 0,
    tension_sistema: 0,

    filtro: '',
    radio_busqueda: 0,
    //Potencias
    potencias: [{ nombre: '1', potencia: 0, horas_uso_dia: 0, consumo: 0 },
    { nombre: 'televis', potencia: 0, horas_uso_dia: 0, consumo: 0 }],

    //Del Controlador

    resultadoCalculoControlador: [{
      controlador_tension: 24,
      controlador_max_input_power: 360,
      controlador_max_pv_input_voltaje: 55,
      controlador_cantidad_paralelo: 3,
      minVoltageControlador: 0,
      minCorrienteControlador: 0,
    }],

    //DeL panel Solar
    resultadoCalculoPanel: [{
      potencia_arreglo_fv: 0,
      cantidad_paneles: 0,
      paneles_serie: 0,
      paneles_paralelo: 0,
      voltaje_array_fv: 0,
      amperaje_array_fv: 0,

    }],



    //De Las baterias
    resultadoCalculoBateria: [{
      baterias_serie: 1,
      baterias_paralelo: 1,
      total_baterias: 1,
      batterysize: 1,
      cuttoff: 1
    }],

    //Del inversor
    resultadoCalculoInversor: [{
      voltaje_in_inversor: 1,
      voltaje_out_inversor: 1,
      potencia_inversor: 1,
      potencia_pico_inversor: 1
    }]
    //
  }

  public camposRequeridos: Calculo = {
    "usuario": false,
    "latitud": false,
    "longitud": false,
    "autoriza_correccion": false,
    "descripcion": false,
    "tipo": false,
    "nombre": false,//Nombre que se le quiere dar al calculo
    "panel": false,
    "inversor": false,
    "bateria": false,
    "controlador": false,
    "simultaneo": false,
    "total_dia": false,
    "tension_sistema": false, //Tensiondefinida

    "filtro": false,
    "radio_busqueda": false,
    //Potencias
    "potencias": false,

    //Del Controlador
    "controlador_tension": false,
    "controlador_max_input_power": false,
    "controlador_max_pv_input_voltaje": false,
    "controlador_cantidad_paralelo": false,
    "minVoltageControlador": false,
    "minCorrienteControlador": false,


    //DeL panel Solar
    "potencia_arreglo_fv": false,
    "cantidad_paneles": false,
    "paneles_serie": false,
    "paneles_paralelo": false,
    "voltaje_array_fv": false,
    "amperaje_array_fv": false,

    //De Las baterias
    "baterias_serie": false,
    "baterias_paralelo": false,
    "total_baterias": false,
    "batterysize": false,
    "cuttoff": false,


    //Del inversor
    "voltaje_in_inversor": false,
    "voltaje_out_inversor": false,
    "potencia_inversor": false,
    "potencia_pico_inversor": false,
  }


  //Validacion de variables
  public tensionDefinida: boolean = false;
  public potenciaDefinida: boolean = false;
  public hspDefinido: boolean = false;
  public panelDefinido: boolean = false;
  public bateriaDefinido: boolean = false;
  public controladorDefinido: boolean = false;
  public inversorDefinido: boolean = false;

  //******************** Inicia Registro de Potencias
  public potencia0 = 0
  public wtotal0 = 0
  public nombre_equipo0 = ''
  public cantidad0 = 0
  public horas_uso_dia0 = 0
  public w_totales = 0
  public promedio0 = 0
  public tester = ''
  public valores: Array<any> = [];
  public valores_mensuales: Array<any> = [];
  public tabla: Array<any> = [];
  public a = 0;
  public simultaneo = 0
  public total_dia = 0
  public codigo = 0
  //Bloqueo boton de edicion
  public editando = false
  //******************** Finaliza Registro de Potencias
  /* public consumos_mes = {
     mes_1: 0,
     mes_2: 0,
     mes_3: 0,
     mes_4: 0,
     mes_5: 0,
     mes_6: 0,
   }
 */
  public consumos_mes = {
    mes_1: null as number | null,
    mes_2: null as number | null,
    mes_3: null as number | null,
    mes_4: null as number | null,
    mes_5: null as number | null,
    mes_6: null as number | null
  };

  public consumo_diario = 0

  public perfil_carga = [0.0505, 0.035, 0.02, 0.025, 0.0245, 0.0265,
    0.0345, 0.0295, 0.023, 0.018, 0.018, 0.0205,
    0.0265, 0.035, 0.0415, 0.0505, 0.0455, 0.034,
    0.025, 0.03, 0.065, 0.1095, 0.1175, 0.088
  ]
  public consumo_hora: Array<any> = []
  //Pruebas radio

  public filtro_busqueda: boolean = false

  //Paso 4, paneles solares
  public panel = 0
  public portada_panel = 'assets/img/01.jpg'
  public descripcion_panel = ''
  public panel_seleccionado = {
    voc: 0, //Voltaje En cicuito Abierto
    isc: 0, //Intensidad en corto circuito
    impp: 0, //Intensidad en maxima potencia
    vmpp: 0, //Voltaje en maxima potencia
    eficiencia: 0,//Eficiencia
    potencia: 0,//Potencia del Panel
    tc_of_pmax: 0, //Coeficiente de Potencia-Temperatura
    tc_of_voc: 0,//Coeficiente de Voltage-Temperatura
    tc_of_isc: 0, //Coeficiente de Corriente-Temperatura
    noct: 43, //Temperatura de Operacion Nominal de la Celula
    tension: 0,

    //Parametros adicionales
    max_isc: 0,
    min_isc: 0,
    max_voc: 0,
    min_voc: 0,
  }
  //consulta paneles base de datos
  public paneles_bd: Array<any> = []

  public numero_paneles = 0
  public paneles_serie = 0
  public paneles_paralelo = 0
  public horas_sol: any
  public horas_sol_pico = 0
  public peakpower = 0
  public tensionMaxiaGenerador = 0
  public intensidadMaxiaGenerador = 0
  public potencia_arreglo_fv = 0

  //Fin Paneles


  //Paso tres, Tension y tipo de controlador
  public tension = 0
  public tipo_controlador = ''
  public controladores_bd: Array<any> = []
  public max_potencia_paneles: any

  public controlador_seleccionado = {
    tipo_controlador: '',// Determina tecnologia del controlador
    amperaje: 0, //Amperaje maximo permitido
    voltaje_potencia: [], //Arreglo de tension de trabajo vs potencia entrada soalr permitida
    portada: '', //Imagen
    descripcion: '', //Caracteristicas
    tension: 0, //Tension de trabajo elegida
    max_potencia_paneles: 0, //Max potensia paneles  a la tension elegido
    Max_pv_voltaje: 0, //Esta seria el maximo voltaje permitido en la entrada solar a la tension elegido.

  }
  //Calculos controlador
  public portada_controlador = 'assets/img/01.jpg'
  public descripcion_controlador = ''
  public minVoltageControlador = 0
  public minCorrienteControlador = 0
  public voltage_potencia_controlador_seleccion: any

  //Calculos baterias
  //Paso 5, Baterias
  public profundidad: number = 0.40 //Dejamos por defecto 0.4
  public dias_autonomia: number = 1 //Dejamos por defecto 1 día
  public baterias_bd: Array<any> = []
  public portada_bateria = 'assets/img/01.jpg'
  public descripcion_bateria = ''

  //Calculo de baterias
  public amperios_necesarios = 0
  public baterias = 0
  public batterysize = 500
  public baterias_paralelo = 0
  public baterias_serie = 0
  public bateria_select = 0

  public bateria_seleccionado = {
    voltaje: 0,
    amperaje: 0,
    peso: 0,
    tecnologia: '',
  }

  //Inversores
  public inversores_bd: Array<any> = []
  //Calculos controlador
  public portada_inversor = ''
  public descripcion_inversor = ''
  public inversor: any

  public inversor_seleccionado = {
    tipo_inversor: '',
    voltaje_in: 0,
    voltaje_out: 0,
    portada: 'assets/img/01.jpg',
    descripcion: '',
    potencia: 0,
    potencia_pico: 0,
    eficiencia: 0,
    modelo: '',
    peso: 0,
    _id: ''
  }


  //Comunes
  public amperaje = 0
  //Datos de Radiacion diaria
  public radiacion_diaria: any
  //Almacenamos datos de radiación
  public DataRadiacion: any = []
  public data_minutos: any = [] //Esta variable almacenara los valores de radiacion Proyectada en minutos
  public irradiacionGlobalDiaria: any


  public tension_sistema = 0

  /**Graficos */
  public ChartEstadoBateria: any
  public ChartPrueba: any
  public ChartInversor: any


  /**Token */
  public token = localStorage.getItem('token');
  //******************************** InicioPruebas behavorSubject */
  public data: any
  dataService$: Subscription | undefined
  public panelResult: any = {};
  public controladorResult: any = {};
  public bateriaResult: any;
  public inversorResult: any;
  //********************************Fin Pruebas behavorSubject */
  //private panel2: PanelSolar
  private ControladorSolar: ControladorSolar
  private Bateria: Bateria
  private Inversor: Inversor

  constructor(
    private _calculadoraService: CalculadoraService,
    private _ubicacionService: UbicacionService,
    private _panelSolarService: PanelSolarService,
    private _inversorService: InversorService,
    private _controladorService: ControladorService,
    private _bateriaService: BateriaService,

    //
    private _router: Router,
    private _route: ActivatedRoute,

    //private dataService:PanelSolarService,
    private dataService: PanelSolar
  ) {

    //suscripcion al behaviorSubject
    //this.panel2 = new PanelSolar()
    this.ControladorSolar = new ControladorSolar()
    this.Bateria = new Bateria()
    this.Inversor = new Inversor()

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


    this.config = {
      height: 200,
      license_key: 'gpl'
    }
  }


  ngOnInit() {

    //Definiendo el tipo de calculo que sera realizado:
    this._route.params.subscribe(
      params => {
        this.calculo.tipo = params['tipo'];
        this._calculadoraService.setTipoCalculo( params['tipo'])
        console.log('tipo de calculo', params['tipo'])
      }
    );

    this._panelSolarService.resultadoPanel$.subscribe(res => {
      console.log('Resultados a asignar Panel Solar Servicio', res)
      this.peakpower = res.potencia_arreglo_fv;
      this.numero_paneles = res.cantidad_paneles;
      this.paneles_paralelo = res.paneles_paralelo;
      this.paneles_serie = res.paneles_serie;
      //this.resultadoPanel = res;
    });

    //Suscribimos a la respuesta de cambios del Controlador
    this._controladorService.resultadoControlador$.subscribe(res => {
      console.log('Resultados a asignar Controlador', res)
      this.minVoltageControlador = res.minVoltageControlador;
      this.minCorrienteControlador = res.minCorrienteControlador

      //Actualizo los valores en el calculo.
      this.calculo.resultadoCalculoControlador[0].minVoltageControlador = res.minVoltageControlador
      this.calculo.resultadoCalculoControlador[0].minCorrienteControlador = res.minCorrienteControlador

    });

    this._calculadoraService.resultadoPanel$.subscribe(panelResult => {
      if (panelResult) {
        console.log("Actualización del resultado del panel:", panelResult);
        this.panelResult = panelResult
        //this.mostrarResultado(panelResult); // Método para mostrar el resultado en la vista
      }
    });

    /*
        this._calculadoraService.resultadoControlador$.subscribe(controladorResult => {
          if (controladorResult) {
            console.log("Actualización del resultado del Controlador:", controladorResult);
            this.controladorResult = controladorResult
            //this.mostrarResultado(panelResult); // Método para mostrar el resultado en la vista
          }
        });*/


    this._calculadoraService.resultadoBateria$.subscribe(bateriaResult => {
      if (bateriaResult) {
        this.bateriaResult = bateriaResult
      }
    });

    this._calculadoraService.resultadoInversor$.subscribe(inversorResult => {
      if (inversorResult) {
        this.inversorResult = inversorResult
      }
    });

  }
  /**
   ngOnInit(): void {

    this._route.params.subscribe(
      params => {
        this.calculo.tipo = params['tipo'];
      }
    );

    this.hsp()

    //Cada vez que se modifique la tension se emite el  nuevo valor que escucha el observable y por tanto llama a las funiones 
    this._calculoService.tension$.subscribe(tension => {
      // Realizar cálculos basados en la nueva radiación solar
      console.log('Cambio en la tension')
      this.calcularPaneles();
    });


  }
   * 
   */

  ngAfterViewInit(): void {
    //this.voltajeHijo=this.arreglos.pruebaViechild //Tomo el VALOR DE pruebaViechild DESDE EL hIJO QUE SE LLAMA aRRREGLOS

    // Mapa con País (Colombia) resaltado
    const map = L.map('map').setView([4.62111, -74.07317], 6);

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
    //var circul: any
    //mc = new L.Marker([4.582, -74.22], markerOptions).addTo(map)

    map.on('click', (e: { latlng: { lat: number; lng: number; }; }) => {
      if (mc != undefined) {
        console.log('ya esta definido el Pin')
      } else {

        mc = new L.Marker([e.latlng.lat, e.latlng.lng], markerOptions).addTo(map)
        this.circul = L.circle([e.latlng.lat, e.latlng.lng], { radius: this.radio_busqueda * 1000 }).addTo(map)
        mc.circulo = this.circul;

        this.latitud = e.latlng.lat
        this.longitud = e.latlng.lng
        this.hsp()
        this.listar_inversores()
        this.listar_baterias()

        this.ConsultarRadiacionDiaria()

        //Tomar en cuenta que al mover mc el circulo no se va a mover
        mc.on('dragend', (event: any) => {

          var latlng = event.target.getLatLng();
          mc.circulo.setLatLng(latlng);
          this.circul.setRadius(this.radio_busqueda * 1000);

          this.latitud = latlng.lat
          this.longitud = latlng.lng

          this.calculo.latitud = latlng.lat
          this.calculo.longitud = latlng.lng

          this.camposRequeridos.latitud = true //Establecemos campo requerido como ya definido
          this.camposRequeridos.longitud = true //Establecemos campo requerido como ya definido

          this.hsp()
          this.listar_inversores()
          this.ConsultarRadiacionDiaria()
          //this.test()

          //Si se cambia la ubicacion es necesario calcular de nuevo los componentes
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

        // Opcional: Deshabilitar interacción fuera del polígono
        /*  map.on('click', function(e) {
            var inside = leafletPip.pointInLayer([e.latlng.lng, e.latlng.lat], countryLayer);
            if (!inside.length) {
              alert('Solo puedes interactuar dentro de los límites de Colombia');
            }
          });
          */
      });

    /**INICIALIZACION DE LOS GRAFICOS */
    //Inicia Grafico Inversor
    var canvasInversor = <HTMLCanvasElement>document.getElementById('ChartInversor')
    var ctxInversor = canvasInversor.getContext('2d')!

    this.ChartInversor = new Chart(ctxInversor, {
      //type: 'bar',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],// hora de cada mes   horas_total.slice(0, 23)
        datasets: [

          {
            type: 'line',
            label: 'Max_Potencia_Inversor',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },

          {
            type: 'bar',
            label: 'Potencia Demandada',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          }

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
            text: 'Uso del Inversor',
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


    /**Grafico de pruebas */
    var canvas = <HTMLCanvasElement>document.getElementById('ChartPrueba')
    var ctx = canvas.getContext('2d')!

    this.ChartPrueba = new Chart(ctx, {
      //type: 'bar',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],// hora de cada mes   horas_total.slice(0, 23)
        datasets: [

          {
            type: 'line',
            label: 'Max_potencia Soportada Controlador',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },

          {
            type: 'line',
            label: 'Max_Voltaje Soportado Controlador',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },

          {
            type: 'line',
            label: 'Max_Iintensidad soportada Controlador',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },

          {
            type: 'bar',
            label: 'Potencia_Generada PV',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },

          {
            type: 'bar',
            label: 'Voltaje_Generado PV',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },

          {
            type: 'bar',
            label: 'Intensidad Generada PV',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)  
          }


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
            text: 'Controlador VS array Fv',
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

    var canvas = <HTMLCanvasElement>document.getElementById('ChartEstadoBateria')
    var ctx2 = canvas.getContext('2d')!

    this.ChartEstadoBateria = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        datasets: [
          {
            type: 'bar',
            label: 'Energia Almacenada',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            type: 'bar',
            label: 'Energia desperdiciada',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            type: 'bar',
            label: 'Energia Faltante',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
        ]

      },
      options: {
        scales: {
          x: {
            beginAtZero: true,
            stacked: true,
            title: {

            }
          },
          y: {
            beginAtZero: true,
            stacked: true
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Uso de la Energía',
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



  }

  hsp() {

    const angleoptimo = 3.7 + 0.69 * this.latitud
    const angle = angleoptimo//Tomando en cuenta un angulo optimo

    //numero_paneles=potencia_dia/HSP*0.9*potencia_panel
    //this.numero_paneles = this.total_dia / 4 * 0.9 * 450

    this._ubicacionService.consulta_hsp(this.latitud, this.longitud, angle).subscribe(
      response => {
        this.horas_sol = response

        const data: any = []//Array<any>= []
        for (let clave of this.horas_sol.data.outputs.monthly) {
          data.push(Number(clave['H(i)_m']))
        }
        var peor_escenario: any = 0
        var mejor_escenario: any = 0
        //Optenemos las horas sol pico para el punto
        peor_escenario = (Math.min.apply(Math, data) / 30)//Dividirse en  la cantidad de dias de ese mes en especifico
        mejor_escenario = (Math.max.apply(Math, data) / 30)

        this.irradiacionGlobalDiaria = Math.min.apply(Math, data)//se da enn valor mensual entonces Tengo que pasarlo a diario


        //this.calcularPaneles(peor_escenario)
        this.horas_sol_pico = Math.round(peor_escenario)
        this.hspDefinido = true


        this.listar_paneles()
        this.listar_baterias()
        this.listar_controladores()
        this.listar_inversores()
        this.ConsultarRadiacionDiaria()

        if (this.panelDefinido) { this.calcularPaneles() }
        if (this.filtro_busqueda) { console.log('Filtro de busqueda ya definido') } else { console.log('Filtro de busqueda no definido') }

      },
      error => {
        console.log('Error en la consulta de hsp')
      }
    );

  }


  //Paneles Solares
  buscar_imagen_panel(_id: any) {
    this.paneles_bd.forEach(element => {
      if (_id == element._id) {
        this.portada_panel = element.portada
        this.descripcion_panel = element.contenido

        this.panel_seleccionado = {// Esto tambien lo estoy enviando al panel Solar Service
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
        //asignar valores a calculo final 
        //this.calculo.panel = element._id
        this._calculadoraService.setPanelId(element._id)
        this.camposRequeridos.panel = true
      }
    });
    this.panelDefinido = true //Valor local

    // Actualizar estado para indicar que el panel esta definido de manera global
    try {
      this._calculadoraService.setPanelDefinido(true);
    } catch (error) {
      this._calculadoraService.setPanelDefinido(false);
      throw error;
    }


    this._panelSolarService.panel_seleccionado = this.panel_seleccionado
    this._calculadoraService.panel_seleccionado = this.panel_seleccionado ///Pongo los datos del panel solar en calculadoas service
    this.calcularPaneles()
  }
  //Fin Paneles Solares


  //Controladores
  buscar_imagen_controlador(_id: any) {

    this.controladores_bd.forEach(element => {
      if (_id == element._id) {

        if (element.amperaje < this.minCorrienteControlador) {
          iziToast.show({
            title: 'ALERTA',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: "El controlador seleccionado no cumple condiciones de amperaje minimo requerido"
          });
        }

        this.portada_controlador = element.portada
        this.descripcion_controlador = element.descripcion
        this.max_potencia_paneles = element.input   //maxima potencia paneles

        this.controlador_seleccionado.tipo_controlador = element.tecnologia
        this.controlador_seleccionado.amperaje = element.amperaje
        this.controlador_seleccionado.voltaje_potencia = element.input //Voltaje a 
        this.controlador_seleccionado.portada = element.portada
        this.controlador_seleccionado.descripcion = element.descripcion
        //this.controlador_seleccionado.Max_pv_voltaje=element.
        //this.calculo.controlador = element._id
        this._calculadoraService.setControladorId(element._id)
        this._calculadoraService.controlador_seleccionado = this.controlador_seleccionado
        this.camposRequeridos.controlador = true
      }
    });
    //TODO PONER SELECT DE POTENSIA A DEFECTO 

  }

  async validar_array_controlador() {


    const dataEntrada = {
      //Del controlador
      tension: this.controlador_seleccionado.tension, //Tension de trabajo del sistema
      potencia: this.controlador_seleccionado.max_potencia_paneles,
      max_pv_input_voltaje: this.controlador_seleccionado.Max_pv_voltaje,
      amperaje: this.controlador_seleccionado.amperaje,

      //Del arreglo
      amperaje_array_fv: this.amperajeHijo,
      voltaje_array_fv: this.voltajeHijo
    }
    //const calculoPanel = await this._panelSolarService.calcularPanelesAsync(dataEntrada)
    const compatibilidad = await this._controladorService.validarCompatibilidadControlador(dataEntrada)


    if (compatibilidad.amperaje) { //if (voltaje != this.tension) {

      iziToast.show({
        title: 'Corriente',
        titleColor: '#1DC74C',
        color: '#FFF',
        class: 'text-success',
        position: 'topRight',
        message: "La corriente del array es acorde al controlador",
        timeout: 6000,
        progressBar: true,
        displayMode: 1
      });

    } else {
      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "La corriente del array es superior a la soportada por el controlador",
        timeout: 6000,
        progressBar: true,
        displayMode: 1
      });
    }

    //Validacion de voltaje

    if (compatibilidad.voltaje) { //if (voltaje != this.tension) {
      iziToast.show({
        title: 'Voltaje',
        titleColor: '#1DC74C',
        color: '#FFF',
        class: 'text-success',
        position: 'topRight',
        message: "El controlador Soporta el Voltaje del Array",
        timeout: 6000,
        progressBar: true,
        displayMode: 1
      });

    } else {
      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "El Voltaje del array es superior al soportado por el controlador",
        timeout: 6000,
        progressBar: true,
        displayMode: 1
      });
    }

  }

  asignar_voltaje_potencia() {

    //this.voltage_potencia_controlador_seleccion es la posicion seleccionada dentro de voltaje potencia

    var voltaje = this.controlador_seleccionado.voltaje_potencia[this.voltage_potencia_controlador_seleccion]['tension']
    var potencia = this.controlador_seleccionado.voltaje_potencia[this.voltage_potencia_controlador_seleccion]['max_pv_input_power']
    var max_pv_input_voltaje = this.controlador_seleccionado.voltaje_potencia[this.voltage_potencia_controlador_seleccion]['max_pv_input_voltaje']

    // this.controlador_seleccionado.voltaje= this.controlador_seleccionado.voltaje_potencia[this.voltage_potencia_controlador_seleccion]['tension'],
    //this.controlador_seleccionado.potencia= this.controlador_seleccionado.voltaje_potencia[this.voltage_potencia_controlador_seleccion]['max_pv_input_power'],
    //this.controlador_seleccionado.max_pv_input_voltaje = this.controlador_seleccionado.voltaje_potencia[this.voltage_potencia_controlador_seleccion]['max_pv_input_voltaje']


    if (voltaje != this.tension_sistema) { //if (voltaje != this.tension) {
      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "El controlador PWM debe trabajar a la misma tension que las baterias"
      });
    }

    if (potencia < this.peakpower) {
      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "La potencia del Arreglo Fotovoltaico sobrepasa la capacidad del Controlador"
      });
    }

    if (max_pv_input_voltaje < this.minVoltageControlador) {
      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "El Voltaje minimo soportado por el controlador es inferior al requerido"
      });
    }


    this.controlador_seleccionado.tension = voltaje// Tension en las baterias
    this.controlador_seleccionado.max_potencia_paneles = potencia // maxima potencia de entrada solar
    this.controlador_seleccionado.Max_pv_voltaje = max_pv_input_voltaje// Maximo voltaje de entrada solar permitido


    //Asignacion valores correspondientes a calculo
    this.calculo.resultadoCalculoControlador[0].controlador_tension = voltaje,
      this.calculo.resultadoCalculoControlador[0].controlador_max_input_power = potencia,
      this.calculo.resultadoCalculoControlador[0].controlador_max_pv_input_voltaje = max_pv_input_voltaje,

      this.camposRequeridos.controlador_tension = true
    this.camposRequeridos.controlador_max_input_power = true
    this.camposRequeridos.controlador_max_pv_input_voltaje = true
    this.camposRequeridos.controlador_cantidad_paralelo = true

    //Ya en este momento he definido un controlador 
    this.controladorDefinido = true
    this.calcularControlador()
  }
  //Fin Controladores


  //Baterias
  buscar_imagen_bateria(_id: any) {
    this.baterias_bd.forEach(element => {
      console.log(_id, element._id)
      if (_id == element._id) {
        this.portada_bateria = element.portada
        this.descripcion_bateria = element.contenido
        this.bateria_seleccionado.voltaje = element.voltaje
        this.bateria_seleccionado.amperaje = element.amperaje

        this.bateria_seleccionado.peso = element.peso
        this.bateria_seleccionado.tecnologia = element.tecnologia

        //Asignar valores de la bateria a las variables de calculo

        //this.calculo.bateria = element._id
        this._calculadoraService.setBateriaId(element._id)
        this.camposRequeridos.bateria = true
      }
    });

    this.calcularBaterias()
  }
  //Fin BATERIAS


  //Inversores
  buscar_imagen_inversor(_id: any) {
    this.inversores_bd.forEach(element => {

      if (_id == element._id) {
        this.portada_inversor = element.portada
        this.descripcion_inversor = element.contenido

        this.inversor_seleccionado.voltaje_in = element.voltaje_in
        this.inversor_seleccionado.voltaje_out = element.voltaje_out
        this.inversor_seleccionado.descripcion = element.descripcion
        this.inversor_seleccionado.portada = element.portada
        this.inversor_seleccionado.potencia = element.potencia
        this.inversor_seleccionado.potencia_pico = element.potencia_pico
        this.inversor_seleccionado.peso = element.peso
        this.inversor_seleccionado._id = element._id
        //this.imgSelect = element.portada
        //Asignacion de valores a variable de calculo
        //this.calculo.inversor = element._id
        this._calculadoraService.setInversorId(element._id)
        this.camposRequeridos.inversor = true//Se definio un inversor
      }
    });
    this.calcularInversor()
  }
  //Fin Inversores
  changeOp(op: any) {
    this.op = op;
  }

  limpiarCampos() {
    this.nombre_equipo0 = ''
    this.potencia0 = 0
    this.cantidad0 = 0
    this.w_totales = 0
    this.horas_uso_dia0 = 0
    this.promedio0 = 0
  }

  calcular_potencia_simultanea() {
    this.simultaneo = this.valores.reduce((
      acc,
      obj,
    ) => acc + (obj.w_totales),
      0);

    if (this.valores.length >= 1) {
      this.camposRequeridos.simultaneo = true
    } else {
      this.camposRequeridos.simultaneo = false
    }

    //Determinamos sistema de acumulación de acuerdo a la potencia Simultanea
    const tensionantigua = this.tension_sistema //const tensionantigua = this.tension
    if (this.simultaneo <= 800) {
      this.tension_sistema = 12 //this.tension = 12
      this._calculadoraService.setTensionSistema(12)
    } else if (this.simultaneo > 800 && this.simultaneo <= 1600) {

      this.tension_sistema = 24 //this.tension = 24
      this._calculadoraService.setTensionSistema(24)
    } else if (this.simultaneo > 1600 && this.simultaneo <= 3200) {

      this.tension_sistema = 48//this.tension = 48
      this._calculadoraService.setTensionSistema(48)
    } else if (this.simultaneo > 3200) {

      this.tension_sistema = 48 //this.tension = 48
      this._calculadoraService.setTensionSistema(48)
    }
    //Determinamos si cambio la tension recalcular los valores

    if (tensionantigua != this.tension_sistema) { //  if (tensionantigua != this.tension) {
      this.tensionDefinida = true
      this.camposRequeridos.tension_sistema = true
      if (this.panelDefinido) { this.calcularPaneles() }
      if (this.bateriaDefinido) { this.calcularBaterias() }
      if (this.inversorDefinido) { this.calcularInversor() }
    }
  }

  calcular_potencia_dia() {
    this.total_dia = this.valores.reduce((
      acc,
      obj,
    ) => acc + (obj.consumo_diario),
      0);

    if (this.valores.length >= 1) {
      this.camposRequeridos.total_dia = true
    } else {
      this.camposRequeridos.total_dia = false
    }

    this.potenciaDefinida = true
    if (this.panelDefinido) { this.calcularPaneles() }
    if (this.bateriaDefinido) { this.calcularBaterias() }
    //*******this.perfil_consumo()
  }




  guardarEditarCampo() {

    for (let x = 0; x < this.valores.length; x++)
      if (this.valores[x].codigo == this.codigo) {
        this.valores[x].codigo = this.codigo
        this.valores[x].nombre = this.nombre_equipo0
        this.valores[x].potencia = this.potencia0
        this.valores[x].cantidad = this.cantidad0
        this.valores[x].w_totales = this.w_totales
        this.valores[x].horas_dia = this.horas_uso_dia0
        this.valores[x].consumo_diario = this.promedio0
        //Liempieza de campos
        this.limpiarCampos()
        //Calculamos la potencia simultanea
        this.calcular_potencia_simultanea()
        //Calculamos la potencia Utilizada diaria
        this.calcular_potencia_dia()

        this.editando = false
        return;
      }



  }


  addCampo() {
    //TO DO
    //Validar que el formulario este completo
    //Validar que todos los campos san correctos
    if (this.horas_uso_dia0 >= 24 || this.horas_uso_dia0 <= 0) {
      this.horas_uso_dia0 = 12
      //alert('Las horas de usuo diario no pueden ser mayores a 24 o menores a 0')
    }
    const data = {
      codigo: this.a,
      nombre: this.nombre_equipo0,
      potencia: this.potencia0,
      cantidad: this.cantidad0,
      w_totales: this.w_totales,
      horas_dia: this.horas_uso_dia0,
      consumo_diario: this.promedio0
    }
    this.a = this.a + 1
    this.valores.push(data)

    this.limpiarCampos()

    //Calculamos la potencia simultanea
    this.calcular_potencia_simultanea()

    //Calculamos la potencia Utilizada diaria
    this.calcular_potencia_dia()

  }

  cambio(test: any) {
    this.w_totales = this.potencia0 * this.cantidad0
    this.promedio0 = this.w_totales * this.horas_uso_dia0
  }

  borrar(codigo: number) {
    for (let x = 0; x < this.valores.length; x++)
      if (this.valores[x].codigo == codigo) {
        this.valores.splice(x, 1);
        //Calculamos la potencia simultanea
        this.calcular_potencia_simultanea()
        //Calculamos la potencia Utilizada diaria
        this.calcular_potencia_dia()
        return;
      }
  }

  editarFila(item: { codigo: number; nombre: string; potencia: number; cantidad: number; w_totales: number; horas_dia: number; consumo_diario: number }) {
    this.editando = true
    this.codigo = item.codigo
    this.nombre_equipo0 = item.nombre
    this.potencia0 = item.potencia
    this.cantidad0 = item.cantidad
    this.w_totales = item.w_totales
    this.horas_uso_dia0 = item.horas_dia
    this.promedio0 = item.consumo_diario
  }

  actualizarTension() {
    this.tensionDefinida = true
    this._calculadoraService.setTensionSistema(this.tension_sistema)
    //recalculo paneles, controladores
    if (this.panelDefinido) { this.calcularPaneles() }
    if (this.bateriaDefinido) { this.calcularBaterias() }
    if (this.inversorDefinido) { this.calcularInversor() }
  }


  //****************************************Consumos facturas Inicio */

  validarConsumosMensuales(): boolean {
    // Verificar que todos los campos estén completos
    const mesesCompletos = Object.values(this.consumos_mes).every(
      valor => valor !== null && valor !== undefined && !isNaN(valor) && valor >= 0
    );

    if (!mesesCompletos) {
      iziToast.warning({
        title: 'Datos incompletos',
        message: 'Por favor complete todos los meses con valores válidos (números positivos)',
        position: 'topRight',
        timeout: 6000,
        progressBar: true,
        displayMode: 1
      });
      return false;
    }

    // Verificar que no sean cero todos (podría ser opcional)
    const sumaTotal = Object.values(this.consumos_mes).reduce((a, b) => a! + b!, 0);
    if (sumaTotal === 0) {
      iziToast.warning({
        title: 'Valores inválidos',
        message: 'Los consumos mensuales no pueden ser todos cero',
        position: 'topRight',
        timeout: 6000,
        progressBar: true,
        displayMode: 1
      });
      return false;
    }

    return true;
  }

  /*
    onKey(event: any) { // without type info
      const total_diario_antiguo = this.total_dia
  
      var promedio = (this.consumos_mes.mes_1 + this.consumos_mes.mes_2 + this.consumos_mes.mes_3 + this.consumos_mes.mes_4 + this.consumos_mes.mes_5 + this.consumos_mes.mes_6) / 6
      this.total_dia = (promedio * 1000) / 31
      console.log('consumo diario', this.total_dia)
  
  
      this.simultaneo = 1000
      this.potenciaDefinida = true
  
      this.camposRequeridos.potencias = true
      this.camposRequeridos.simultaneo = true
      this.camposRequeridos.total_dia = true
  
      //this.perfil_consumo()
  
      //Determinamos sistema de acumulación de acuerdo a la potencia de consumo diaria
      const tensionantigua = this.tension_sistema // const tensionantigua = this.tension
      if (this.total_dia <= 800) {
        this.tension_sistema = 12 //this.tension = 12
        this._calculadoraService.setTensionSistema(12)
      } else if (this.total_dia > 800 && this.total_dia <= 1600) {
  
        this.tension_sistema = 24 //this.tension = 24
        this._calculadoraService.setTensionSistema(24)
      } else if (this.total_dia > 1600 && this.total_dia <= 3200) {
        this.tension_sistema = 48 //this.tension = 48
        this._calculadoraService.setTensionSistema(48)
      } else if (this.total_dia > 3200) {
        this.tension_sistema = 48 //this.tension = 48
        this._calculadoraService.setTensionSistema(48)
      }
      //Determinamos si cambio los valores debo recalcular todo
  
      //Todo Cambios en la tensión
      if (tensionantigua != this.tension_sistema || total_diario_antiguo != this.total_dia) { //if (tensionantigua != this.tension || total_diario_antiguo != this.total_dia) {
        this.tensionDefinida = true
        this.camposRequeridos.tension_sistema = true
        if (this.panelDefinido) { this.calcularPaneles() }
        if (this.bateriaDefinido) { this.calcularBaterias() }
        if (this.inversorDefinido) { this.calcularInversor() }
      }
  
    }*/
  onKey(event: any) {
    // Primero validamos los datos
    if (!this.validarConsumosMensuales()) {
      this.potenciaDefinida = false;
      return;
    }

    // Si pasa la validación, procedemos con los cálculos
    const total_diario_antiguo = this.total_dia;

    // Cálculo del promedio (más seguro con validación previa)
    const valores = Object.values(this.consumos_mes) as number[];
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;

    this.total_dia = (promedio * 1000) / 31;
    console.log('consumo diario', this.total_dia);

    this.simultaneo = 1000;
    this.potenciaDefinida = true;

    this.camposRequeridos.potencias = true;
    this.camposRequeridos.simultaneo = true;
    this.camposRequeridos.total_dia = true;

    // Determinación de tensión del sistema
    const tensionantigua = this.tension_sistema;

    if (this.total_dia <= 800) {
      this.tension_sistema = 12;
    } else if (this.total_dia <= 1600) {
      this.tension_sistema = 24;
    } else {
      this.tension_sistema = 48;
    }

    this._calculadoraService.setTensionSistema(this.tension_sistema);

    // Recalcular solo si hubo cambios
    if (tensionantigua !== this.tension_sistema || total_diario_antiguo !== this.total_dia) {
      this.tensionDefinida = true;
      this.camposRequeridos.tension_sistema = true;

      if (this.panelDefinido) this.calcularPaneles();
      if (this.bateriaDefinido) this.calcularBaterias();
      if (this.inversorDefinido) this.calcularInversor();
    }
  }


  perfil_consumo() {
    this.consumo_hora = []//Distribucion normal de los consumos deacuerdo al perfil de carga
    for (let i = 0; i < this.perfil_carga.length; i++) {
      console.log(this.perfil_carga[i], this.consumo_diario)
      this.consumo_hora.push(this.perfil_carga[i] * this.consumo_diario)
    }
    console.log('Cambio consumo_ hora', this.consumo_hora)
    //Actualizacion de Grafico
    //this.ChartPerfilConsumo.data.datasets[0].data = this.consumo_hora
    //this.ChartPerfilConsumo.update();
  }
  //****************************************Consumos facturas Fin */




  async calcularPaneles() {
    //Antes Debo validar que: 
    if (this.tensionDefinida && this.potenciaDefinida && this.hspDefinido) {
      const dataEntrada = {
        total_dia: this.total_dia,
        horas_sol_pico: this.horas_sol_pico,
        potencia: this.panel_seleccionado.potencia, //Potencia del Panel Seleccionado
        tension: this.panel_seleccionado.tension, //tension del Panel Seleccionado
        vmpp: this.panel_seleccionado.vmpp,
        impp: this.panel_seleccionado.impp,
        voc: this.panel_seleccionado.voc,
        tension_sistema: this.tension_sistema,
      }
      const calculoPanel = await this._panelSolarService.calcularPanelesAsync(dataEntrada)
      if (calculoPanel.cantidad_paneles != undefined) {
        this.cantidadPaneles = calculoPanel.cantidad_paneles//Asigna la cantidad de paneles calculados
        this.panelDefinido = true
        //Asigno Campos que Son requeridos
        this.camposRequeridos.cantidad_paneles = true

        if (this.controladorDefinido) {// Si ya se habia definido un controlador entonces debo validarlo
          this.validar_array_controlador()
        }

      }

    } else {


      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "Primero debe definir Tension del Sistema y Potencia a Conectar y Horas Sol Pico"
      });

    }

  }

  async calcularBaterias() {
    if (this.tensionDefinida && this.potenciaDefinida) {
      const dataEntrada = {
        total_dia: this.total_dia,
        tension_sistema: this.tension_sistema,
        paneles_paralelo: this.panelResult.paneles_paralelo,
        panel_seleccionado: this.panel_seleccionado.isc,
        //De las baterias
        dias_autonomia: this.dias_autonomia,
        profundidad: this.profundidad,
        amperaje: this.bateria_seleccionado.amperaje,
        voltaje: this.bateria_seleccionado.voltaje,
      }
      const bateria = await this.Bateria.calcularBateria(dataEntrada)
      this._calculadoraService.setBateriaResult(bateria);

      //Asigno Valores Requeridos
      this.bateriaDefinido = true
      this.camposRequeridos.baterias_serie = true
      this.camposRequeridos.baterias_paralelo = true
      this.camposRequeridos.total_baterias = true
      this.camposRequeridos.batterysize = true
      this.camposRequeridos.cuttoff = true


    } else {
      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "Primero debe definir Tension del Sistema y Potencia Demandada"
      });
    }


  }

  async calcularInversor() {
    console.log('Inversor Seleccionado', this.inversor_seleccionado)
    if (this.tensionDefinida && this.potenciaDefinida) {
      const dataEntrada = {
        tension_sistema: this.tension_sistema,
        simultaneo: this.simultaneo,
        voltaje_in: this.inversor_seleccionado.voltaje_in,
        voltaje_out: this.inversor_seleccionado.voltaje_out,
        potencia: this.inversor_seleccionado.potencia,
        potencia_pico: this.inversor_seleccionado.potencia_pico,
      }

      const inversor = await this.Inversor.calcularInversor(dataEntrada)
      this._calculadoraService.setInversorResult(inversor);

      //Asigno Valores Requeridos
      this.inversorDefinido = true
      this.camposRequeridos.voltaje_in_inversor = true
      this.camposRequeridos.voltaje_out_inversor = true
      this.camposRequeridos.potencia_inversor = true
      this.camposRequeridos.potencia_pico_inversor = true

    } else {

      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "Primero debe definir Tension del Sistema y Potencia a Conectar"
      });
    }


  }

  async calcularControlador() {
    //antes debo validar que  
    if (this.tensionDefinida && this.panelDefinido && this.panelResult.cantidad_paneles >= 1) {

      console.log('Informacion de los paneles Solares', this.panelResult)
      const data = {

        max_potencia_paneles: this.controlador_seleccionado.max_potencia_paneles,//controlador_max_input_power
        Max_pv_voltaje: this.controlador_seleccionado.Max_pv_voltaje,//controlador_max_pv_input_voltaje
        controlador_tension: this.controlador_seleccionado.tension, //controlador_tension
        amperaje: this.controlador_seleccionado.amperaje,
        numero_paneles: this.panelResult.cantidad_paneles,
        potencia: this.panel_seleccionado.potencia,

        //De los paneles
        potencia_arreglo_fv: this.potencia_arreglo_fv,
        paneles_paralelo: this.panelResult.paneles_paralelo,
        paneles_serie: this.panelResult.paneles_serie,
        isc: this.panel_seleccionado.isc,
        voc: this.panel_seleccionado.voc,

        tc_of_voc: this.panel_seleccionado.tc_of_voc,
        vmpp: this.panel_seleccionado.vmpp,
        impp: this.panel_seleccionado.impp
      }
      console.log('Data para enviar a calcular controlador', data)

      //const controlador = await this.ControladorSolar.calcularControlador(data)
      const controlador = await this._controladorService.calcularControlador(data) //se envia a calcular el controlador
      this._calculadoraService.setControladorResult(controlador);

      //Asigno Paramertos Definidos
      console.log('CONTROLADOR HA SIDO DEFINIDO')
      this.controladorDefinido = true
      this.camposRequeridos.minVoltageControlador = true
      this.camposRequeridos.minCorrienteControlador = true


    } else {
      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "Primero debe definir Tension del Sistema, paneles a Emplear y configuración del Array"
      });
    }
  }


  changeRadio() {

    this.filtro
    this.listar_inversores()
    this.listar_controladores()
    this.listar_baterias()
    this.listar_paneles()

    this.filtro_busqueda = true //Se cambio opcion default

  }
  cambioRadio() {

    if (this.circul != undefined) {
      this.circul.setRadius(this.radio_busqueda * 1000);
    }

    this.listar_inversores()
    this.listar_baterias()
    this.listar_controladores()
    this.listar_paneles()
    this.filtro_busqueda = true
  }

  guardarInforme() {
    const DATA = document.getElementById('informepdf');
    if (DATA) {
      const doc = new jsPDF('p', 'pt', 'a4');
      const options = {
        background: 'white',
        scale: 3
      };

      html2canvas(DATA, options).then((canvas) => {
        const img = canvas.toDataURL('image/png', 1.0);

        const bufferX = 15;
        const bufferY = 15;
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        doc.addImage(img, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
        return doc;
      }).then((docResult) => {
        docResult.save(`${new Date().toISOString()}_informe.pdf`);
      }).catch((error) => {
        console.error("Error generando PDF: ", error);
      });
    } else {
      console.error('Elemento no encontrado: #informepdf');
    }

  }


  guardarCalculo() {

    if (!this.token) {
      iziToast.show({
        title: '⚠️ Acción Requerida',
        message: 'Por favor inicia sesión para guardar tu trabajo 💾',
        color: '#FFF9E6',
        titleColor: '#FFA500',
        messageColor: '#5F5F5F',
        position: 'topRight',
        timeout: 6000,
        progressBar: true,
        displayMode: 1
      });
      return
    }

    const calculo = this._calculadoraService.obtenerCalculo()
    console.log('Calculo a ser guardado', calculo)

    //Determinar tipo de calculo a guardar
    if (calculo.tipo == "potencias") {
      calculo.potencias = this.valores
    }
    else if (calculo.tipo == 'facturas') {
      let valor_mes = [
        this.consumos_mes.mes_1,
        this.consumos_mes.mes_2,
        this.consumos_mes.mes_3,
        this.consumos_mes.mes_4,
        this.consumos_mes.mes_5,
        this.consumos_mes.mes_6
      ]
      for (let i = 1; i < valor_mes.length; i++) {
        console.log('Valores arreglo', valor_mes[i])
        const data = {
          codigo: i,
          nombre: "mes_" + i,
          potencia: valor_mes[i],
          cantidad: 1,
          w_totales: 1,
          horas_dia: 1,
          consumo_diario: 1
        }

        this.valores_mensuales.push(data)
      }
      calculo.potencias = this.valores_mensuales
    }
    //Determinamos si hay potencias agregadas
    if (calculo.potencias.length >= 1) {
      this.camposRequeridos.potencias = true
    } else {
      this.camposRequeridos.potencias = false
    }

    this.camposRequeridos.descripcion = true
    this.camposRequeridos.usuario = true

    //Valores que son por defecto
    this.camposRequeridos.autoriza_correccion = true
    this.camposRequeridos.tipo = true
    this.camposRequeridos.filtro = true
    this.camposRequeridos.latitud = true
    this.camposRequeridos.longitud = true
    this.camposRequeridos.radio_busqueda = true

    const pendientes = this.verificarCampos()

    console.log('campos pendientes,', pendientes, pendientes.size)

    if (pendientes.size >= 1) {
      iziToast.show({
        title: 'ALERTA',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "Debe completar todos los Pasos para guardar El calculo",
        displayMode: 1,
      });
      return
    } else {
      //Estan completos todos los campos, envio al servicio
      calculo.simultaneo = this.simultaneo
      calculo.total_dia = this.total_dia
      calculo.latitud = this.latitud
      calculo.longitud = this.longitud
      calculo.radio_busqueda = this.radio_busqueda
      calculo.filtro = this.filtro
      //Actualizo el Nombre
      this._calculadoraService.setNombreCalculo(this.calculo.nombre)

      this._calculadoraService.registro_calculo_usuario(calculo, this.token).subscribe(
        response => {

          if (response.data == undefined) {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: 'Registrese o inicie sesión para guardar su cálculo'
            });

            // this._router.navigate(['/calculadora/create/', this.calculo.tipo]);

          }
          //this.load_btn = false;
          else {
            iziToast.show({
              title: 'SUCCESS',
              titleColor: '#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Se registro correctamente el Calculo.'
            });

            this._router.navigate(['/summary/', response.data._id]);
          }
        },
        error => {
          console.log('Error', error)
        }
      );

    }

  }



  //Funcion que verifica que todos los campos esten completos
  verificarCampos(): { pendientes: string[]; size: number } {
    const pendientes: string[] = [];
    for (const campoNombre in this.camposRequeridos) {
      if (!this.camposRequeridos[campoNombre as keyof Calculo]) {
        pendientes.push(campoNombre);
      }
    }
    return { pendientes, size: pendientes.length };
  }


  cambioNombre(event: Event) {
    this.camposRequeridos.nombre = true;

  }


  //Inicia Consultar Radiacion diaria
  ConsultarRadiacionDiaria() {

    const lat = this.latitud
    const lon = this.longitud
    const angleoptimo = 3.7 + 0.69 * this.latitud
    const angle = angleoptimo//Tomando en cuenta un angulo optimo calculado de acuerdo a la ubicación


    this._calculadoraService.consultar_radiacion_diaria(lat, lon, angle).subscribe(
      response => {
        this.radiacion_diaria = response.data.outputs.daily_profile
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

        //Añadir informacion de minutos
        //const data_minutos: any = []
        for (let clave of this.DataRadiacion) {
          let h = clave['hora'].split(':')
          let hh = h[0]
          for (let index = 0; index <= 59; index++) {

            let objeto = {
              mes: clave['mes'],
              hora: hh + ':' + index,
              irradiacion: clave['irradiacion'],
              temperatura: clave['temperatura']
            }
            this.data_minutos.push(objeto)
          }
        }


        //Finaliza añadir informacion de minutos

        //Organizar la data para grafico de TODOS los meses
        //Datos para el grafico
        var label_mes = []
        var irradiacion_mes = []


        var mes_selecionado2 = 10
        for (let clave of this.data_minutos) {
          if (clave.mes == mes_selecionado2) {
            label_mes.push(clave.hora)
            irradiacion_mes.push(clave.irradiacion)
          }
        }
      },
      error => {
        console.log('Error en la consulta de Irradiacion diaria')
      }
    );

  }

  //Finaliza consultar radiacion diaria

  // ***********************  INICIA LISTAR INVERSORES **************************

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


  listar_controladores() {

    this._controladorService.listar_controladores().subscribe({
      next: (response) => {
        this.controladores_bd = response; // Aquí 'response' es el array de paneles
        if (this.controladores_bd.length == 0 || this.controladores_bd == undefined) {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: "No se encontraron Controladores",
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
            message: "Controladores Encontrados",
            displayMode: 1
          });
        }
      },
      error: (error) => {
        console.error("Error al listar Controladores:", error);
      },
      complete: () => {
        console.log("Suscripción completada");
      }
    });
  }

  listar_inversores() {

    this._inversorService.listar_inversores().subscribe({
      next: (response) => {
        this.inversores_bd = response; // Aquí 'response' es el array de paneles
        if (this.inversores_bd.length == 0 || this.inversores_bd == undefined) {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: "No se encontraron Inversores",
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
            message: "Inversores Encontrados",
            displayMode: 1
          });
        }
      },
      error: (error) => {
        console.error("Error al listar Inversores:", error);
      },
      complete: () => {
        console.log("Suscripción completada");
      }
    });
  }

  listar_baterias() {

    this._bateriaService.listar_baterias().subscribe({
      next: (response) => {
        this.baterias_bd = response; // Aquí 'response' es el array de paneles
        if (this.baterias_bd.length == 0 || this.baterias_bd == undefined) {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: "No se encontraron Baterias",
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
            message: "Baterias Encontrados",
            displayMode: 1
          });
        }
      },
      error: (error) => {
        console.error("Error al listar Baterias:", error);
      },
      complete: () => {
        console.log("Suscripción completada");
      }
    });
  }


  simularSistema(mes: any) {
    if (this.panelResult && this.bateriaResult && this.controladorResult && this.inversorResult) {

      //Perfil de consumo en cada hora
      const consumos_por_hora = []
      for (let i = 0; i < this.perfil_carga.length; i++) {
        consumos_por_hora.push(this.perfil_carga[i] * this.total_dia)

      }

      //1. Determinar producione energietica en cada hora para el mes especifico

      //Extraccion de los datos para un mes en especifico
      //Produccion deacuerdo a temperatura
      var Tcell = []
      var voc_t = []
      var isc_t = []
      var Potencia_t = [] //Potencia total producida en cada Hora
      //Finalizamos calculo de Produción diaria

      //Datos para el grafico
      var label = []
      var sumas = []
      var temperaturas = []

      //Estados de la bateria
      var desperdiciada = []
      var almacenada = []
      var faltante = []


      //Datos para el controlador
      var control_v_in = []
      var control_i_in = []
      var control_p_in = []

      var estado_bateria = this.bateriaResult.batterysize
      //Primero determino hasat que punto gastar
      var minimo_corte = Math.abs((this.bateriaResult.batterysize * this.bateriaResult.cuttoff))
      var maximo_gastar = this.bateriaResult.batterysize - minimo_corte

      console.log('Estado inicial de la bateria o batterysize', estado_bateria, '<<<<', this.bateriaResult.batterysize, this.batterysize)

      var mes_selecionado = mes
      console.log('datos radiacion', this.DataRadiacion)
      for (let clave of this.DataRadiacion) {
        if (clave.mes == parseInt(mes_selecionado)) {
          console.log('Mes seeleccionado igual a mes', mes_selecionado)
          label.push(clave.hora)
          sumas.push(clave.irradiacion)
          temperaturas.push(clave.temperatura)
          //Calculamos los valores de produccion
          let temperatura_celula = clave.temperatura + (this.panel_seleccionado.noct - 20) * clave.irradiacion / 800
          //console.log('Temperaturas de a celula',temperatura_celula)
          Tcell.push(temperatura_celula)
          let produce_v = (this.panel_seleccionado.voc * (1 + (this.panel_seleccionado.tc_of_voc / 100) * (temperatura_celula - 25))) * this.panelResult.paneles_serie
          voc_t.push(produce_v)
          let produce_i = (this.panel_seleccionado.isc * (1 + (this.panel_seleccionado.tc_of_isc / 100) * (temperatura_celula - 25)) * clave.irradiacion / 1000) * this.panelResult.paneles_paralelo
          isc_t.push(produce_i)//Tomando en cuenta Una irradiancia especifica
          let produce = (this.panel_seleccionado.potencia * (1 + (this.panel_seleccionado.tc_of_pmax / 100) * (temperatura_celula - 25)) * clave.irradiacion / 1000) * this.panelResult.cantidad_paneles

          Potencia_t.push(produce)

          //Inicia Controlador
          //Al controlador Ingresa lo mismo que producen los paneles
          if (produce_i > this.controlador_seleccionado.amperaje || produce_v > this.calculo.resultadoCalculoControlador[0].controlador_max_pv_input_voltaje || produce > this.calculo.resultadoCalculoControlador[0].controlador_max_input_power) {
            console.log('Parametros de Producion superiores a capacidad del Controlador')
          }


          //Finaliza Controlador

          //Bateria Inicia
          let consumo_hora = this.perfil_carga[parseInt(clave.hora)] * this.total_dia
          console.log('consumo:', consumo_hora, 'Hora:', clave.hora, 'produccion', produce)
          if (produce > consumo_hora) {
            console.log('Guardo***************************************************************', clave.hora)
            ///Como lo que produce es mayor que lo que consumo entonces puedo almacenar
            let guardar = produce - consumo_hora //Guardo lo que me queda despues de sacar el consumo de esa hora
            console.log('A guardar', guardar)
            //Si la bateria se llena calculo desperdiciada. se llena cuando la suma es superior a batteisize
            if (estado_bateria + guardar > this.bateriaResult.batterysize) {
              console.log('lleno arreglos')
              almacenada.push(this.bateriaResult.batterysize - estado_bateria)
              desperdiciada.push(((estado_bateria + guardar) - this.bateriaResult.batterysize))
              faltante.push(0)

              //let desperdiciado = ((estado_bateria + guardar) - this.bateriaResult.batterysize)
              estado_bateria = this.bateriaResult.batterysize
              //console.log('Energia Desperdiciada **********************************************************', desperdiciado, 'nuevo esatdo, llena,', estado_bateria)
            }
            //Si no se llena solo actualizo a nuevo estado
            else {
              console.log('lleno arreglos')
              almacenada.push(guardar)
              desperdiciada.push(0)
              faltante.push(0)
              estado_bateria = estado_bateria + guardar
              console.log('aun no llena pero guardo', estado_bateria)
            }

          } else {
            console.log('saco***************************************************************', clave.hora)
            //Saque lo faltante de la bateria
            let gastar = consumo_hora - produce
            console.log('A sacar', gastar)
            let valor = estado_bateria - gastar //determino si saco x cantidad como queda la bateria

            //Si la bateria se agota calculo faltante
            if (valor < minimo_corte) {
              console.log('bateria por debajo de punto critico o de corte, sumar a dias en los que la bateria se descarga, sistema se cae.')
              estado_bateria = minimo_corte //la bateria quedo en lo minimo
              let faltantee = valor - minimo_corte
              console.log('lleno arreglos')
              faltante.push(faltantee)
              almacenada.push(0)
              desperdiciada.push(0)
              console.log('falto', faltantee)
            }

            else { //se descargo pero aun no alcanza valor minimo, solo actualizo su estado
              estado_bateria = valor
              console.log('debo llenar aquia rreglos')

              faltante.push(0)
              almacenada.push(0)
              desperdiciada.push(0)

              console.log('bateria descargada sin alcanzar punto de corte', estado_bateria)
            }
          }
          //Bateria finaliza

          //Inicia Inversor
          if (consumo_hora >= this.inversor_seleccionado.potencia) {
            console.log('El valor de Consumo supero la capacidad del Inversor')
          }
          //Finaliza Inversor
        }
      }

      //Inicia Grafica del esatdo de la bateria
      //Desperdiciada almacenada faltante
      console.log('Almacenada', almacenada, 'Desperdiciada', desperdiciada, 'faltante', faltante)
      this.ChartEstadoBateria.data.datasets[0].data = almacenada //Energia almacenada porque potencia FV fue mayor a consumos
      this.ChartEstadoBateria.data.datasets[1].data = desperdiciada  //Energía que no se almaceno ni se consumio
      this.ChartEstadoBateria.data.datasets[2].data = faltante  //Energía que falto para cubrir consumos
      this.ChartEstadoBateria.update(); //Actualizamos graficos 
      //Finaliza Grafica del esatdo de la bateria

      //Iniciamos Graficado de produccion de los paneles Solares
      var potencia = new Array(24).fill(this.controlador_seleccionado.max_potencia_paneles);
      var voltaje = new Array(24).fill(this.controlador_seleccionado.Max_pv_voltaje);
      var intensidad = new Array(24).fill(this.controlador_seleccionado.amperaje);

      this.ChartPrueba.data.datasets[0].data = potencia //Potencia max_controlador
      this.ChartPrueba.data.datasets[1].data = voltaje  //Voltaje_maximo Controlador
      this.ChartPrueba.data.datasets[2].data = intensidad //Corriente maxima controlador

      this.ChartPrueba.data.datasets[3].data = Potencia_t //Potencia Hora.
      this.ChartPrueba.data.datasets[4].data = voc_t  //Voltaje_Hora
      this.ChartPrueba.data.datasets[5].data = isc_t //Corriente Hora
      this.ChartPrueba.update(); //Actualizamos graficos 

      //Inicio grafico del Inversor

      var potencia_Inversor = new Array(24).fill(this.inversor_seleccionado.potencia);
      this.ChartInversor.data.datasets[0].data = potencia_Inversor
      this.ChartInversor.data.datasets[1].data = consumos_por_hora
      this.ChartInversor.update()

    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: "Complete Todos los pasos antriores para poder simular El Sistema",
        displayMode: 1
      });
    }
  }

}

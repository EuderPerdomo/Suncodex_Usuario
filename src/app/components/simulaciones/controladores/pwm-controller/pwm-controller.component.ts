import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CalculadoraService } from '../../../../services/calculadora.service';
import { Chart } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';
import { BatteryDisplayComponent } from '../../../baterias/battery-display/battery-display.component';
import { PanelSolarService } from '../../../../services/panel-solar.service';
import { MapaComponent } from '../../../mapa/mapa/mapa.component';

declare var $: any
declare var iziToast: any

@Component({
  selector: 'app-pwm-controller',
  imports: [FormsModule, CommonModule, CommonModule, BatteryDisplayComponent, MapaComponent],
  templateUrl: './pwm-controller.component.html',
  styleUrl: './pwm-controller.component.css'
})
export class PwmControllerComponent implements OnInit, AfterViewInit {



  //Pruebas de simulacion bateria
  selectedPanel: any = { name: '' };
  isSunlight: boolean = true;
  pwmSoc: number = 100;  // SOC inicial con PWM
  mpptSoc: number = 80; // SOC inicial con MPPT

  public radiacion_horaria = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.5, 1.2, 1.8, 2.0, 2.1, 2.0, 1.8, 1.2, 0.5, 0.2, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
  // public panel = { "Vmp": 38.30, "Imp": 9.14, "eficiencia": 0.22 }

  public mes_seleccionado = 1
  public panel_seleccionado = {
    voc: '46.68', //Voltaje En cicuito Abierto
    isc: '9.45', //Intensidad en corto circuito
    impp: '9.00', //Intensidad en maxima potencia
    vmpp: '38.90', //Voltaje en maxima potencia
    eficiencia: '18.04',//Eficiencia del Modulo
    potencia: '350',//Potencia del Panel
    tc_of_pmax: '-0.408', //Coeficiente de Potencia-Temperatura
    tc_of_voc: '-0.292',//Coeficiente de Voltage-Temperatura
    tc_of_isc: '0.045', //Coeficiente de Corriente-Temperatura
    noct: 45, //Temperatura de Operacion Nominal de la Celula
    tension: '24',

    //Parametros adicionales
    max_isc: '',
    min_isc: '',
    max_voc: '',
    min_voc: '',
  }

  public bateria = { "capacidad_ah": 100, "voltaje_nominal": 12, "soc_inicial": 30 }
  public temperaturas = [6, 6, 7, 9, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3]

  //Caliente
  //public latitud = 7.31888
  //public longitud = -74.465

  //Frio
  public latitud = 1.21630
  public longitud = -77.227


  public DataRadiacion: any = []
  public radiacion_diaria: any
  public data_minutos: any = [] //Esta variable almacenara los valores de radiacion Proyectada en minutos


  //Graficos
  public ChartcomparativaPwmMppt: any

  constructor(
    private _calculadoraService: CalculadoraService,
    private _panelSolarService: PanelSolarService,

  ) {

  }


  ngOnInit(): void {
    this.ConsultarRadiacionDiaria()
    this.listar_paneles()
  }

  ngAfterViewInit(): void {
    var canvasPwmMppt = <HTMLCanvasElement>document.getElementById('ChartComparativo')
    var ctxComparativo = canvasPwmMppt.getContext('2d')!
    // console.log('elemento',ctxComparativo)

    this.ChartcomparativaPwmMppt = new Chart(ctxComparativo, {
      //type: 'bar',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],// hora de cada mes   horas_total.slice(0, 23)
        datasets: [

          {
            type: 'line',
            label: 'MPPT',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },

          {
            type: 'line',
            label: 'PWM',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          }

        ]
      },

      options: {
        responsive: true,
        //maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'SOC PWM vs MPPT',
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

  //Inicia Consultar Radiacion diaria
  ConsultarRadiacionDiaria() {

    this.DataRadiacion = []

    const lat = this.latitud
    const lon = this.longitud
    const angleoptimo = 3.7 + 0.69 * this.latitud
    const angle = angleoptimo//Tomando en cuenta un angulo optimo calculado de acuerdo a la ubicación


    this._calculadoraService.consultar_radiacion_diaria(lat, lon, angle).subscribe(
      response => {
        if (response.data.outputs === undefined) {
          iziToast.show({
            title: '🌊 Ubicación no válida',
            titleColor: '#D9534F',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: "La ubicación seleccionada no posee datos de radiación o está sobre el mar. Por favor, elige un punto en tierra firme.",
            icon: 'fa fa-exclamation-circle'
          });
        } else {

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
  
          //this.calcular_valores()//Una ves tenemos la radiacion entonces calculo los valores
          this.simularSistema(this.mes_seleccionado)
  
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
        }

        
      },
      error => {
        console.log('Error en la consulta de Irradiacion diaria')
      }
    );



  }


  mapear_soc_a_voltaje(soc: any, tipo_bateria: any) {
    if (tipo_bateria === 'plomo-acido') {
      if (soc >= 90) { return 12.7 }
      else if (soc >= 70) { return 12.5 }
      else if (soc >= 40) { return 12.2 }
      else if (soc >= 20) { return 11.8 }
      else { return 10.5 + (soc / 20) * 1.3 }// Interpolación 0-20% 
    }
    else if (tipo_bateria === 'lifepo4') {
      return 12.8 + (soc / 100) * 0.4
    }
    else {
      return 0
    }

  }
  // Función MPPT prturbar y observar
  mppt(voltaje_anterior: any, potencia_anterior: any, voltaje_actual: any, potencia_actual: any) {
    let paso = 0.5
    if (potencia_actual > potencia_anterior) {
      return voltaje_actual > voltaje_anterior
        ? voltaje_actual + paso
        : voltaje_actual - paso;
    } else {
      return voltaje_actual > voltaje_anterior
        ? voltaje_actual - paso
        : voltaje_actual + paso;
    }
  }


  calcular_duty_cycle(voltaje_panel: number, voltaje_bateria: number): number {
    //    console.log('duty cicle',voltaje_panel,voltaje_bateria)
    if (voltaje_panel <= 0) {
      return 0;
    }
    //console.log('calculo dutycicle',Math.min((voltaje_bateria / voltaje_panel) * 100, 100),'Parametros recibidos',voltaje_bateria,voltaje_panel)
    return Math.min((voltaje_bateria / voltaje_panel) * 100, 100); // math.min para no sobreasar el 100% EJEMPLO 12 / 18 = 0.666 *100 = 66.6%
  }

  corriente_real_panel(voltaje: number, radiacion_wm2: number, temp: number) {
    // 1. Ajuste de temperatura de la célula (NOCT)
    // Dividimos la radiación por 800 para normalizar (NOCT se mide a ~800 W/m²)
    let temperatura_celula = temp + (this.panel_seleccionado.noct - 20) * (radiacion_wm2 / 800);

    // 2. Cálculo de parámetros del panel ajustados por temperatura y radiación
    // Voltaje de circuito abierto ajustado
    let produce_v = (parseFloat(this.panel_seleccionado.voc) *
      (1 + (parseFloat(this.panel_seleccionado.tc_of_voc) / 100) *
        (temperatura_celula - 25))) * this.panelResult.paneles_serie;

    // Corriente de cortocircuito ajustada (dividimos radiación por 1000 para normalizar a STC)
    let produce_i = (parseFloat(this.panel_seleccionado.isc) *
      (1 + (parseFloat(this.panel_seleccionado.tc_of_isc) / 100) *
        (temperatura_celula - 25)) * (radiacion_wm2 / 1000)) *
      this.panelResult.paneles_paralelo;

    let produce_impp = parseFloat(this.panel_seleccionado.impp) *
      (1 + (parseFloat(this.panel_seleccionado.tc_of_isc) / 100) *
        (temperatura_celula - 25)) * (radiacion_wm2 / 1000) *
      this.panelResult.paneles_paralelo;

    let produce = (parseFloat(this.panel_seleccionado.potencia) *
      (1 + (parseFloat(this.panel_seleccionado.tc_of_pmax) / 100) * (temperatura_celula - 25)) *
      radiacion_wm2 / 1000) * this.panelResult.cantidad_paneles


    // 3. Modelado de la curva I-V
    if (voltaje >= produce_v) {
      return [0.0, produce]; // Si el voltaje es mayor o igual a Voc, corriente es cero
    }

    // Fórmula de la curva I-V aproximada
    //return [ produce_i * (1 - (voltaje / produce_v) ** 3),produce];
    return [produce_impp, produce];

  }


  cambioUbicacion(valores: any) {
    console.log('Ubicacion,', valores)
    this.latitud = valores.latitud
    this.longitud = valores.longitud

    this.ConsultarRadiacionDiaria()
    //Cuando cambia el array en arreglos components actualizo los valores en el padre
    // this.cantidadPanelesHijo = valores.cantidadPaneles;
    // this.potenciaHijo = valores.potencia;
    // this.amperajeHijo = valores.corriente
    // this.voltajeHijo = valores.voltaje

  }

  public resultados_pwm: any = []
  public resultados_mppt: any = []

  public panelResult: any = { "paneles_serie": 1, 'paneles_paralelo': 1, 'cantidad_paneles': 1 };
  public socgrafico_mppt: any = []
  public socgrafico_pwm: any = []
  public amperios_descarga = 0


  //Paneles Disponibles
  public paneles_bd: Array<any> = []
  public panel = 0
  public portada_panel = 'assets/img/01.jpg'
  public descripcion_panel = ''

  //Consultar los paneles soalres disponibles
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

      }
    });
    this.panelDefinido = true
    this.simularSistema(this.mes_seleccionado)
  }

  listar_paneles() {

    this._panelSolarService.listar_paneles().subscribe({
      next: (response) => {
        this.paneles_bd = response;
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

  public datos: any = []

  simularSistema(mes: any) {

    this.mes_seleccionado = mes

    this.resultados_mppt = []
    this.resultados_pwm = []
    this.socgrafico_mppt = []
    this.socgrafico_pwm = []

    //ESTE APARATDO LO QUE BUSCA ES MOSTRAR LAS DIFERENCIAS DE EFICIENCIA BAJO DIFERENTES CONDICIONES DE RADIACION Y TEMPERATURA DE UN CONTROLADOR PWM Y UN CONTROLADOR MPPT

    let datos: any[] = []; // Inicializa como arreglo vacío (esto lo vacía automáticamente)
    datos = []
    datos = this.DataRadiacion.filter((item: { mes: number }) => item.mes === parseInt(mes));
    this.pwmSoc = this.bateria["soc_inicial"]
    this.mpptSoc = this.bateria["soc_inicial"]

    var soc_pwm = this.bateria["soc_inicial"]
    var soc_mppt = this.bateria["soc_inicial"]
    //var voltaje_bateria = this.mapear_soc_a_voltaje(soc, "plomo-acido")
    var voltaje_mppt = parseFloat(this.panel_seleccionado.vmpp)

    for (let i = 0; i < datos.length; i++) {
      let radiacion = datos[i].irradiacion
      let temp = datos[i].temperatura


      //Ajuste de Vmp por temperatura (para ambos métodos)
      let vmp_ajustado = parseFloat(this.panel_seleccionado.vmpp) + (temp - 25) * -0.003

      // 1. Calcular producción del panel (considerando radiación)
      let [corriente_panel, potencia_estimada] = this.corriente_real_panel(vmp_ajustado, radiacion, temp)
      let potencia_panel = vmp_ajustado * corriente_panel  // Potencia real
      //console.log('Coorriente', corriente_panel, potencia_panel)

      // 2. Calcular Duty Cycle del PWM

      let duty_pwm = this.calcular_duty_cycle(vmp_ajustado, this.mapear_soc_a_voltaje(soc_pwm, "plomo-acido"))

      //let corriente_efectiva_pwm = corriente_panel * (duty_pwm / 100) * 0.85  //considerando que el pwm tenga un 85% eficiencia
      let corriente_efectiva_pwm = corriente_panel * 0.85; // 85% eficiencia (pérdidas por calor, etc.)

      //MPPT

      if (i > 0) {
        voltaje_mppt = this.mppt(
          this.resultados_mppt[i - 1]["voltaje_mppt"],
          this.resultados_mppt[i - 1]["potencia"],
          vmp_ajustado,
          potencia_estimada
        )
      }
      //let duty_mppt = this.calcular_duty_cycle(voltaje_mppt, this.mapear_soc_a_voltaje(soc_mppt, "plomo-acido"))
      let voltaje_bateria = this.mapear_soc_a_voltaje(soc_mppt, "plomo-acido");
      let corriente_efectiva_mppt = (potencia_estimada / voltaje_bateria) * 0.95;
      //console.log('A efectiva pwm', corriente_efectiva_pwm, 'Corriente Efectiva MPPT', corriente_efectiva_mppt, potencia_estimada, voltaje_bateria)

      //console.log('VMP_AJUSTADO',vmp_ajustado,'Corriente PANEL',corriente_panel,'cORRIENTE EFECTIVA pwm',corriente_efectiva_pwm,'Corriente efectiva mppt:',corriente_efectiva_mppt,'Potencia_actual',potencia_estimada)

      // Actualización SOC MPPT Y PWM Tomando en cuenta que la descarga sea de manera constante
      let delta_ah_pwm = (corriente_efectiva_pwm - this.amperios_descarga) * 1;
      let delta_ah_mppt = (corriente_efectiva_mppt - this.amperios_descarga) * 1;

      //console.log(corriente_efectiva_mppt,delta_ah_mppt,corriente_efectiva_pwm, delta_ah_pwm)
      //console.log('Corrientes de carga', delta_ah_mppt, delta_ah_pwm)

      soc_pwm = Math.max(0, Math.min(soc_pwm + (delta_ah_pwm / this.bateria["capacidad_ah"]) * 100, 100))
      soc_mppt = Math.max(0, Math.min(soc_mppt + (delta_ah_mppt / this.bateria["capacidad_ah"]) * 100, 100))

      this.pwmSoc = Math.max(0, Math.min(soc_pwm + (delta_ah_pwm / this.bateria["capacidad_ah"]) * 100, 100))
      this.mpptSoc = Math.max(0, Math.min(soc_mppt + (delta_ah_mppt / this.bateria["capacidad_ah"]) * 100, 100))

      this.socgrafico_mppt.push(soc_mppt)
      this.socgrafico_pwm.push(soc_pwm)

      // Guardar resultados
      this.resultados_pwm.push({
        hora: i,
        soc: soc_pwm,
        potencia: potencia_panel,
        duty: duty_pwm,
        corriente: corriente_efectiva_pwm
      })
      this.resultados_mppt.push({
        hora: i,
        soc: soc_mppt,
        potencia: potencia_panel,
        //duty: duty_mppt,
        corriente: corriente_efectiva_mppt,
        voltaje_mppt: voltaje_mppt  //Solo debug
      })

    }
    this.ChartcomparativaPwmMppt.data.datasets[0].data = this.socgrafico_mppt
    this.ChartcomparativaPwmMppt.data.datasets[1].data = this.socgrafico_pwm
    this.ChartcomparativaPwmMppt.update()
  }


  //Creacion del panel Solar inicia **********************************************************************************
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
  public filtro: boolean = true;
  public panelDefinido = false


  changeRadio() {
    console.log(this.filtro)

    if (!this.filtro) {
      this.panel_seleccionado = this.panel_propio
    } else {
      if (this.panelDefinido) {
        //this.panel_seleccionado = this.panel_select
      }

    }

  }


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
      this.simularSistema(this.mes_seleccionado)

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
      this.simularSistema(this.mes_seleccionado)
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
    this.simularSistema(this.mes_seleccionado)
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

  //Creacion del panel Solar Finaliza **********************************************************************************

}

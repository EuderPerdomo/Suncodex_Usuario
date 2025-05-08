import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto'

@Component({
    selector: 'app-produccion-array',
    imports: [CommonModule],
    templateUrl: './produccion-array.component.html',
    styleUrl: './produccion-array.component.css'
})
export class ProduccionArrayComponent implements OnChanges, AfterViewInit {

  public ChartProduccionMensual: any
  public ChartProduccionMediaMensual:any
  public ChartTemperaturaAmbienteCelula:any
  public ChartVocIsc:any

  //Meses
  public mesSeleccionado='Enero'
  public meses: string[] = [
    '',       // Índice 0 vacío (opcional)
    'Enero',  // Índice 1
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre' // Índice 12
  ];

  //Definamos que entradas requerimos para mostar la produccion
  //Radiacion en el plano horizontal para la ubicacions seleccionada
  //Datos tecnicos del panel Solar
  //Configuración del Array fotovoltaico

  //Entradas Necesarias desde el componente padre
  @Input() dataRadiacion: any = {}; // 
  @Input() fichaTecnicaPanel: any = {}
  @Input() configuracionArray: any = {};


  //Definamos que salidas me dara este componente
  //Produccion del array footovoltaico configurado para cada uno de los meses.
  @Output() CambioProduccion = new EventEmitter<any>();//Emitir cuando se cambien los datos


  ngAfterViewInit(): void {

    var canvas = <HTMLCanvasElement>document.getElementById('ChartProduccionMediaHorariaMensual')
    var ctx = canvas.getContext('2d')!

    this.ChartProduccionMensual = new Chart(ctx, {
      //type: 'bar',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],// hora de cada mes   horas_total.slice(0, 23)
        datasets: [

          {
            type: 'line',
            label: 'Max_potencia Generada Array (W)',
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
            text: `Media producción Mes: ${this.mesSeleccionado}`,
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


    //ProduccionMedia maxima mensual anual
    
    var canvas2 = <HTMLCanvasElement>document.getElementById('ChartProduccionMediaMensual')
    var ctx2 = canvas2.getContext('2d')!

    this.ChartProduccionMediaMensual = new Chart(ctx2, {
      //type: 'bar',
      data: {
        labels: [],// hora de cada mes   horas_total.slice(0, 23)
        datasets: [

          {
            type: 'line',
            label: 'Max_potencia Generada Array (W)',
            data: [] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },
        ]
      },

      options: {
        //responsive:true,
        scales: {
          y: {
            beginAtZero: true
          }
        },


        plugins: {
          title: {
            display: true,
            text: 'Produccion media Mensual',
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

    //Grafico temperatura Ambiente vs Celula

    var canvas3 = <HTMLCanvasElement>document.getElementById('ChartTemperaturaAmbienteCelula')
    var ctx3 = canvas3.getContext('2d')!

    this.ChartTemperaturaAmbienteCelula = new Chart(ctx3, {
      //type: 'bar',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],// hora de cada mes   horas_total.slice(0, 23)
        datasets: [

          {
            type: 'line',
            label: 'Temperatura media Ambiente',
            data: [] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },
          {
            type: 'line',
            label: 'Temperatura Media Paneles Solares',
            data: [] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },
        ]
      },

      options: {
        responsive:true,
        scales: {
          y: {
            beginAtZero: true
          }
        },


        plugins: {
          title: {
            display: true,
            text: 'Temperaturas',
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



    //Grafico Voc/ ISC

    var canvas4 = <HTMLCanvasElement>document.getElementById('ChartVocIsc')
    var ctx4 = canvas4.getContext('2d')!

    this.ChartVocIsc = new Chart(ctx4, {
      //type: 'bar',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],// hora de cada mes   horas_total.slice(0, 23)
        datasets: [

          {
            type: 'line',
            label: 'VOC',
            data: [] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },
          {
            type: 'line',
            label: 'ISC',
            data: [] //irradiacion para ese mes  Potencia_t_total.slice(0, 23)
          },
        ]
      },

      options: {
        responsive:true,
        scales: {
          y: {
            beginAtZero: true
          }
        },


        plugins: {
          title: {
            display: true,
            text: 'VOC/ISC',
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


  ngOnChanges(changes: SimpleChanges) {
    if (changes['fichaTecnicaPanel'] && !changes['fichaTecnicaPanel'].firstChange || changes['configuracionArray'] && !changes['configuracionArray'].firstChange) {
      //Tomamos los valores de la radiacion y los valores del Panel Solar y retornamos los datos de Produccion
      this.simularSistema(1)
    }
  }

  simularSistema(mes: any) {
    if (mes >= 1 && mes <= 12) {
      this.mesSeleccionado = this.meses[mes];

      this.ChartProduccionMensual.options.plugins.title.text = `Media producción Mes: ${this.mesSeleccionado}`,
      this.ChartProduccionMensual.update();

    } else {
      this.mesSeleccionado = '';
      this.ChartProduccionMensual.options.plugins.title.text = '',
      this.ChartProduccionMensual.update();
    }

    //Datos para el grafico
    var label = []
    var sumas = []
    var temperaturas = []

    //Extraccion de los datos para un mes en especifico
    var mes_selecionado = mes
    //Produccion deacuerdo a temperatura
    var Tcell = []
    var voc_t = []
    var isc_t = []
    var Potencia_t = [] //Potencia total producida en cada Hora


    for (let clave of this.dataRadiacion) {
      if (clave.mes == parseInt(mes_selecionado)) {

        label.push(clave.hora)
        sumas.push(clave.irradiacion_plano_horizontal * clave.k)//Añadir aqui * FI
        temperaturas.push(clave.temperatura)
        //Calculamos los valores de produccion
        let temperatura_celula = clave.temperatura + (this.fichaTecnicaPanel.noct - 20) * clave.irradiacion_plano_horizontal * clave.K / 800 //let temperatura_celula = clave.temperatura + (this.fichaTecnicaPanel.noct - 20) * clave.irradiacion_plano_horizontal * clave.K *FI/ 800 
        Tcell.push(temperatura_celula)
        let produce_v = (this.fichaTecnicaPanel.voc * (1 + (this.fichaTecnicaPanel.tc_of_voc / 100) * (temperatura_celula - 25))) * this.configuracionArray.series //this.paneles_serie aqui son los paneles en serie, se deja por default en uno para pruebas
        voc_t.push(produce_v)
        let produce_i = (this.fichaTecnicaPanel.isc * (1 + (this.fichaTecnicaPanel.tc_of_isc / 100) * (temperatura_celula - 25)) * clave.irradiacion_plano_horizontal * clave.K / 1000) * this.configuracionArray.paralelos//produce_i = (this.fichaTecnicaPanel.isc * (1 + (this.fichaTecnicaPanel.coef_isc_temp / 100) * (temperatura_celula - 25)) * clave.irradiacion_plano_horizontal * clave.K * FI / 1000) * 1
        isc_t.push(produce_i)//Tomando en cuenta Una irradiancia especifica
        let produce = (this.fichaTecnicaPanel.potencia * (1 + (this.fichaTecnicaPanel.tc_of_pmax / 100) * (temperatura_celula - 25)) * (clave.irradiacion_plano_horizontal * clave.K / 1000)) * this.configuracionArray.cantidadPaneles
        //  let produce = (this.fichaTecnicaPanel.potencia * (1 + (this.fichaTecnicaPanel.coef_pmax_temp / 100) * (temperatura_celula - 25)) * (clave.irradiacion_plano_horizontal * clave.K * FI / 1000))
        if (produce < 0) {
          produce = 0
        }
        Potencia_t.push(produce)
      }
    }
    //Grafico de produccion Media diaria mensual
    this.ChartProduccionMensual.data.datasets[0].data = Potencia_t //Energia almacenada porque potencia FV fue mayor a consumos
    this.ChartProduccionMensual.update(); //Actualizamos graficos 

    //Grafico de temperaturas Medias Mensuales
    this.ChartTemperaturaAmbienteCelula.data.datasets[0].data=temperaturas
    this.ChartTemperaturaAmbienteCelula.data.datasets[1].data=Tcell
    this.ChartTemperaturaAmbienteCelula.update()

       //Grafico voc/isc
       this.ChartVocIsc.data.datasets[0].data=voc_t
       this.ChartVocIsc.data.datasets[1].data=isc_t
       this.ChartVocIsc.update()
    this.CambioProduccion.emit(Potencia_t);
    this.produccionMensual()
  }

  produccionMensual() {
//Agrupacion de datos por mes
    const datosPorMes: { [key: number]: any[] } = {};

    for (let clave of this.dataRadiacion) {
      const mes = clave.mes;
      if (!datosPorMes[mes]) {
        datosPorMes[mes] = []; // Inicializar el arreglo si no existe
      }
      datosPorMes[mes].push(clave); // Agregar los datos al mes correspondiente
    }

const meses: { [key: number]: string } = {
  1: 'Enero',
  2: 'Febrero',
  3: 'Marzo',
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
  7: 'Julio',
  8: 'Agosto',
  9: 'Septiembre',
  10: 'Octubre',
  11: 'Noviembre',
  12: 'Diciembre'
};


//Calculo de produccion apra cada mes

// Objeto para almacenar la máxima producción de cada mes
//const maximaProduccionPorMes: { [key: number]: number } = {};
const maximaProduccionPorMes: { [key: string]: number } = {};

// Iterar sobre los 12 meses
for (let mes = 1; mes <= 12; mes++) {
  
  const datosMes = datosPorMes[mes] || []; // Obtener los datos del mes (o un arreglo vacío si no hay datos)
  let maximaProduccionMes = 0;

  // Calcular la producción para cada hora del mes
  for (let clave of datosMes) {
    // Calcular la producción (usando el mismo proceso que ya tienes)
    let temperatura_celula = clave.temperatura + (this.fichaTecnicaPanel.noct - 20) * clave.irradiacion_plano_horizontal * clave.K / 800;
    let produce = (this.fichaTecnicaPanel.potencia * (1 + (this.fichaTecnicaPanel.tc_of_pmax / 100) * (temperatura_celula - 25)) * (clave.irradiacion_plano_horizontal * clave.K / 1000) * this.configuracionArray.cantidadPaneles);

    if (produce < 0) {
      produce = 0;
    }

    // Actualizar la máxima producción del mes
    if (produce > maximaProduccionMes) {
      maximaProduccionMes = produce;
    }
  }

  // Almacenar la máxima producción del mes
  maximaProduccionPorMes[meses[mes]] = maximaProduccionMes;
}

this.ChartProduccionMediaMensual.data.datasets[0].data = maximaProduccionPorMes //Energia almacenada porque potencia FV fue mayor a consumos
this.ChartProduccionMediaMensual.update(); //Actualizamos graficos 
  
  }

}

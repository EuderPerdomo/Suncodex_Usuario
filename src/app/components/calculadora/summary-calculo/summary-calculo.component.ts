import { Component } from '@angular/core';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';
import { CalculadoraService } from '../../../services/calculadora.service';
import { ActivatedRoute, Router } from '@angular/router';


//Graficos
import Chart from 'chart.js/auto'

import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';

declare var iziToast: any
declare var $: any


@Component({
    selector: 'app-summary-calculo',
    imports: [NavComponent, FooterComponent,CommonModule],
    templateUrl: './summary-calculo.component.html',
    styleUrl: './summary-calculo.component.css'
})
export class SummaryCalculoComponent {


    public Grafico_1: any
    public id = '';
    public load_data = false;
    public token = localStorage.getItem('token');
  
    public calculo: any
    public analisis: any
    public producionMediaDiaria: any
  
    constructor(
      private _calculoService: CalculadoraService,
      private _router: Router,
      private _route: ActivatedRoute,
    ) { }
  
    ngOnInit(): void {
      this.init_Data()
    }
  
    init_Data() {
  
      this._route.params.subscribe(
        params => {
          this.id = params['id'];
     
  
          this._calculoService.obtener_calculo_cliente(this.id, this.token).subscribe(
            response => {
              if (response.data == undefined) {
                this.load_data = false;
                //this.calculo = 0;
              } else {
                this.calculo = response.data;
                this.load_data = true;
              console.log('Calculo',this.calculo)
                this.EnviarDatosApi()
              }
  
            },
            error => {
              console.log(error);
            }
          );
        }
  
      );
    }
  
    ngAfterViewInit(): void {
      //Enviar los datos a la api para evaluar el rendimiento
     
    }
  
    ///Inicia enviar datos API
    EnviarDatosApi() {
  
      const lat = this.calculo.latitud
      const lon = this.calculo.longitud
      const peakpower = this.calculo.resultadoCalculoPanel[0].potencia_arreglo_fv
      const batterysize = this.calculo.resultadoCalculoBateria[0].batterysize
      const consumptionday = this.calculo.total_dia//this.total_dia
      const cutoff = this.calculo.resultadoCalculoBateria[0].cuttoff //Profundidad de descarga baterias
      const outputformat = 'json' //Formato de salida de la informacion
  
      this._calculoService.consulta_rendimiento_Pvgis(lat, lon, peakpower, batterysize, consumptionday, cutoff).subscribe(
        response => {
          localStorage.setItem('respuesta', response.data);
          this.analisis = response.data
      
  
          //Pasando a arreglo para graficar
          const produccion: any = []
          const energiaMediaNoCapturada: any = []
  
          const data: any = []//Array<any>= []
          this.producionMediaDiaria = []
          var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
          for (let clave of this.analisis.outputs.monthly) {
            this.producionMediaDiaria.push({ name: meses[clave['month'] - 1], value: clave['E_d'] })
            produccion.push(clave['E_d'])
            energiaMediaNoCapturada.push(clave['E_lost_d'])
          }
  
          //Iniciamos grafico_1
          var canvas = <HTMLCanvasElement>document.getElementById('Grafico_1')
          var ctx = canvas.getContext('2d')!
  
          var Grafico_1 = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: meses,//label_mes.slice(0, 500),
              datasets: [
                {
                  type: 'bar',
                  label: 'Producción media Diaria Mensual (W)',
                  data: produccion,//irradiacion_mes.slice(0, 500)
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
          //Finalizamos Grafico
  //Iniciamos grafico 2
          var canvas = <HTMLCanvasElement>document.getElementById('Grafico_2')
          var ctx = canvas.getContext('2d')!
  
          var Grafico_1 = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: meses,//label_mes.slice(0, 500),
              datasets: [
                {
                  type: 'bar',
                  label: 'Energia media Diaria Mensual No capturada (W)',
                  data: energiaMediaNoCapturada,//irradiacion_mes.slice(0, 500)
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
          //Finalizamos Grafico_2
  
  
        },
        error => {
          console.log('Error en la consulta')
        }
      );
    }
    //Finaliza enviar datos API
  
  
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
  

}

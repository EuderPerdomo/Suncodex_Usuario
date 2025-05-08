
import { AfterViewInit, Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CdkAccordionModule, CdkAccordionItem } from '@angular/cdk/accordion';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';

import { jsPDF } from "jspdf";

//Graficos
import Chart from 'chart.js/auto'
import { NavComponent } from "../../../nav/nav.component";
import { FooterComponent } from "../../../footer/footer.component";
import { GuestServiceService } from '../../../../services/guest-service.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-estandar-calculo',
    imports: [NavComponent, FooterComponent, CdkAccordionItem, CdkDropList, CommonModule, CdkDrag],
    templateUrl: './estandar-calculo.component.html',
    styleUrl: './estandar-calculo.component.css',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EstandarCalculoComponent implements AfterViewInit {

  todo = ['Get to work', 'Pick up groceries', 'Go home', 'Fall asleep'];

  done = ['Get up', 'Brush teeth', 'Take a shower', 'Check e-mail', 'Walk dog'];

  public index = 1


  public actualmente: string[] = [];
  public agregados: Array<any> = [];
  public listar_disponibles: Array<any> = [];
  public inversores: Array<any> = [];

  public perfil_carga = [0.0505, 0.035, 0.02, 0.025, 0.0245, 0.0265,
    0.0345, 0.0295, 0.023, 0.018, 0.018, 0.0205,
    0.0265, 0.035, 0.0415, 0.0505, 0.0455, 0.034,
    0.025, 0.03, 0.065, 0.1095, 0.1175, 0.088
  ]
  //Consultar https://www.xm.com.co/consumo/historicos-de-demanda
  //https://solsta.co/donde-puedo-encontrar-informacion-sobre-perfiles-d-36/
  //https://www.xm.com.co/consumo/informes-demanda/indicadores-de-pronosticos-oficiales-de-demanda

  public doneList: any
  public todoList: any
  public data: any = [];


  //@ViewChild('doneList') doneList: CdkDropList | any;
  //@ViewChild('doneList') todoList: CdkDropList | any;

  //Atributos de grafico
  public ChartPerfilConsumo: any
  public consumo_hora: any

  //Total Diario
  public total_dia: any
  public huella: any
  public potencia: any

  public electrodomesticos: Array<any> = [];
  public electrodomesticos_const: Array<any> = [];

  public datosAgrupados: any = {};


  constructor(
    private _guestService: GuestServiceService
  ) { }

  ngAfterViewInit(): void {
    var canvas = <HTMLCanvasElement>document.getElementById('ChartPerfilConsumo')
    var ctx = canvas.getContext('2d')!

    this.ChartPerfilConsumo = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        datasets: [
          {
            type: 'line',
            label: 'Perfil de consumo',
            data: []
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


  }


  ngOnInit(): void {

    this._guestService.listar_electrodomesticos_guest().subscribe(
      response => {

        this.electrodomesticos_const = response.data;
        this.electrodomesticos = this.electrodomesticos_const;

        this.electrodomesticos.forEach(electrodomestico => {
          const categoriaNombre = electrodomestico.categoria.nombre;

          // Verificar si la categoría ya existe en datosAgrupados
          if (categoriaNombre in this.datosAgrupados) {
            // Si la categoría ya existe, agregar el electrodoméstico al array correspondiente
            this.datosAgrupados[categoriaNombre].electrodomesticos.push({
              nombre: electrodomestico.nombre,
              potencia: electrodomestico.potencia,
              uso_dia: electrodomestico.usoDia,
              categoria: categoriaNombre
            });
          } else {
            // Si la categoría no existe, crear un nuevo objeto con la categoría y el electrodoméstico
            this.datosAgrupados[categoriaNombre] = {
              nombre: categoriaNombre,
              electrodomesticos: [{
                nombre: electrodomestico.nombre,
                potencia: electrodomestico.potencia,
                uso_dia: electrodomestico.usoDia,
                categoria: categoriaNombre
              }]
            };
          }
        });

        // Convertir el objeto a un array

        // Convertir el objeto a un array
        this.data = Object.values(this.datosAgrupados);
        console.log('Data Organizada',this.data)


      },
      error => {
        console.log('error')
      }
    );


  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {

      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      //Actualizamos el Grafico de Dstribucion de consumos
      this.calcular_potencia_dia()
    }
  }


  eliminarElemento(item: any) {

    const index = this.agregados.indexOf(item);
    this.data.forEach((element: { nombre: any; electrodomesticos: any; }) => {

      if (item.categoria == element.nombre) {
        element.electrodomesticos.push(item)
      }
    });

    if (index >= 0) {
      // Elimina el elemento de la lista
      this.agregados.splice(index, 1);
    }

    this.calcular_potencia_dia()
  }

  actualizarHorasUso(item: any, event: Event) {
    const target = event.target as HTMLInputElement;
    const newValue = target.value //Dividmos para obtener hora en fracciones decimales de hora

    const index = this.agregados.indexOf(item);
    //Ahora actualizar el nuevo valor en el arreglo de agregados
    if (index !== -1) {
      this.agregados[index].uso_dia = newValue;
    }

    this.calcular_potencia_dia()

  }


  perfil_consumo() {
    this.consumo_hora = []//Distribucion normal de los consumos deacuerdo al perfil de carga
    for (let i = 0; i < this.perfil_carga.length; i++) {
      this.consumo_hora.push(this.perfil_carga[i] * this.total_dia)
    }
    //Actualizacion de Grafico
    this.ChartPerfilConsumo.data.datasets[0].data = this.consumo_hora
    this.ChartPerfilConsumo.update();

  }


  calcular_potencia_dia() {

    this.total_dia = this.agregados.reduce(( //Valores hace referencia a las potencias
      acc,
      obj,
    ) => acc + (obj.potencia * obj.uso_dia),
      0);


    //Calculamos potencia
    this.potencia = this.agregados.reduce(( //Valores hace referencia a las potencias
      acc,
      obj,
    ) => acc + (obj.potencia),
      0);

    //*******this.perfil_consumo()

    //INicia calculo Huella de carbono
    var factor = 0.126
    var anual = (this.total_dia * 365) / 1000000 //Dividimos en 1 Millon para convertir a Megawatts
    this.huella = anual * factor
    console.log('emisiones de carbono', anual * factor)
    //Finaliza calculo huella de carbono

    this.perfil_consumo()
  }

}

import { Component, OnInit } from '@angular/core';
import { CalculadoraService } from '../../../../services/calculadora.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
@Component({
  selector: 'app-edit-calculo',
  imports: [],
  templateUrl: './edit-calculo.component.html',
  styleUrl: './edit-calculo.component.css'
})
export class EditCalculoComponent implements OnInit {

  public id = ''
  public calculo: any
  public valores: Array<any> = [];
  public token = localStorage.getItem('token');

  constructor(
    private _calculadoraService: CalculadoraService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {

  }

  ngOnInit(): void {

    this._route.params.subscribe(
      params => {
        this.id = params['id'];


        this._calculadoraService.obtener_calculo_cliente(this.id, this.token).subscribe(
          response => {
            if (response.data == undefined) {
              this.calculo = undefined;
            } else {

              //this.load_data = false;
              this.calculo = response.data;

console.log('Valores del Calculo',this.calculo)


              //Determinar si es facturas o potencias y asignar valores a los campos correspondientes
/*
              if (this.calculo.tipo == 'facturas') {
                this.consumos_mes.mes_1 = response.data.potencias[0].potencia
                this.consumos_mes.mes_2 = response.data.potencias[1].potencia
                this.consumos_mes.mes_3 = response.data.potencias[2].potencia
                this.consumos_mes.mes_4 = response.data.potencias[3].potencia
                this.consumos_mes.mes_5 = response.data.potencias[4].potencia
                this.consumos_mes.mes_6 = response.data.potencias[5].potencia
              } else if (this.calculo.tipo == 'potencias') {
                this.valores = response.data.potencias
              }


              console.log('Estos son los valores asignados al calculo', this.calculo)

              //this.test_buscar_imagen(response.data.panel._id)

              this.inversor_seleccionado = response.data.inversor
              this.controlador_seleccionado = response.data.controlador
              this.panel_seleccionado = response.data.panel
              this.bateria_seleccionado = response.data.bateria

              console.log('equipos seleccionados', this.inversor_seleccionado,
                this.controlador_seleccionado,
                this.panel_seleccionado,
                this.bateria_seleccionado,)

              //Asigno valores calculados a cada una de las variables
              this.simultaneo = response.data.simultaneo
              this.total_dia = response.data.total_dia
              this.latitud = response.data.latitud
              this.longitud = response.data.longitud
              this.numero_paneles = response.data.resultadoCalculoPanel[0].cantidad_paneles
              this.peakpower = response.data.resultadoCalculoPanel[0].potencia_arreglo_fv
              this.minVoltageControlador = response.data.resultadoCalculoControlador[0].minVoltageControlador
              this.minCorrienteControlador = response.data.resultadoCalculoControlador[0].minCorrienteControlador
              this.baterias = response.data.resultadoCalculoBateria[0].total_baterias
              this.baterias_serie = response.data.resultadoCalculoBateria[0].baterias_serie
              this.baterias_paralelo = response.data.resultadoCalculoBateria[0].baterias_paralelo
              // this._calculoService.actualizarBateriaSeleccionado(response.data.bateria[0]); // Actualizar el inversor seleccionado en el servicio
              this.tension = response.data.resultadoCalculoControlador[0].controlador_tension
              this.radio_busqueda = response.data.radio_busqueda
              this.filtro = response.data.filtro
              this.load_data = true

              this.hsp()
              this.potenciaDefinida = true
              this.tensionDefinida = true
              this.panelDefinido = true
              this.bateriaDefinido = true
              this.inversorDefinido = true

                //this.listar_baterias()
                //this.listar_controladores()
                //this.listar_inversores()
                //this.listar_paneles()
                //this.actualizarTension()
                */
            }

          },
          error => {
            console.log(error);
          }
        );

      }
    );


  }

}

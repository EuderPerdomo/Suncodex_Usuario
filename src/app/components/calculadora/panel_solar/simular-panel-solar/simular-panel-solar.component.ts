import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavComponent } from '../../../nav/nav.component';
import { FooterComponent } from '../../../footer/footer.component';
import { CalculadoraService } from '../../../../services/calculadora.service';

import Chart from 'chart.js/auto'
import html2canvas from 'html2canvas';

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Renderer } from 'three/webgpu';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators'

import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

import { getPosition } from 'suncalc'
//let suncalc3 =require('suncalc3')
import { ModelLoader } from './cargarModelo';
import { GeometriaVial } from './crearGeometriaVial';

import { TransformControls } from 'three/addons/controls/TransformControls.js'

@Component({
    selector: 'app-simular-panel-solar',
    imports: [NavComponent, FooterComponent, CommonModule, FormsModule],
    templateUrl: './simular-panel-solar.component.html',
    styleUrl: './simular-panel-solar.component.css'
})
export class SimularPanelSolarComponent implements AfterViewInit, OnInit {

  constructor(
    private _calculadoraService: CalculadoraService,
    // private cargarModelo:ModelLoader,
  ) {

  }

  public azimuth = 0
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
    latitud: 44.300,
    longitud: -97.945,
  }

  public radiacion_diaria: any
  public DataRadiacion: any = []
  public data_minutos: any = []

  public radiacion_diaria_horizontal: any
  public DataRadiacion_horizontal: any = []
  public data_minutos_horizontal: any = []

  public unionArray: any = []

  public selectedModel: any


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
  }

  ngAfterViewInit(): void {

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
      Math.sin(this.grados_a_radianes(declinacion)) * Math.sin(this.grados_a_radianes(latitud)) + Math.cos(this.grados_a_radianes(declinacion)) * Math.cos(this.grados_a_radianes(latitud)) * Math.cos(this.grados_a_radianes(HRA))
    )
    //fin segunda ELEVACION

    //Convierto elevacion a grados
    const elevacion = this.radianes_a_grados(elevacionRadianes)

    console.log('La Elevacion del sol  para el dia', dia, 'es:', elevacion, 'radianes', elevacionRadianes, 'a la hora local', LT)

    //Ahora podemos calcular el Azimuth

    const azimuth_0 = Math.acos(
      (
        Math.sin(this.grados_a_radianes(declinacion)) *
        Math.cos(this.grados_a_radianes(latitud)) -

        Math.cos(this.grados_a_radianes(declinacion)) *
        Math.sin(this.grados_a_radianes(latitud)) *
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
    if (latitud >= 1) {
      //Pertenece a hemisferio Norte

      const testelevacion = 90 - latitud + declinacion
      console.log('segunda forma elevacion ', testelevacion, 'Convertido a gradoas', testelevacion * (180 / Math.PI))
      //this.declinacion(1)

    } else {
      //Estaria en el hemisferio sur

      const testelevacion = 90 + latitud - declinacion
      console.log('segunda forma elevacion ', testelevacion, 'Convertido a gradoas', testelevacion * (180 / Math.PI))
      //this.declinacion(1)
    }


    //******************************************************ANGULO DE INCIDENCIA EN EL PANEL SOLAR */

    var inclinacion_panel = 6
    const angulo_incidencia = Math.sin(this.grados_a_radianes(elevacion)) * Math.cos(this.grados_a_radianes(inclinacion_panel))
      + Math.cos(this.grados_a_radianes(elevacion)) * Math.sin(this.grados_a_radianes(inclinacion_panel)) * Math.cos(this.grados_a_radianes(azimuth - 180))

    console.log('El Angulo de incidencia solar en radianes  es:', angulo_incidencia, 'en grados:', this.radianes_a_grados(angulo_incidencia))

    ////****************************************CALCULOS DE LA PRODUCCION */

    /**
     * Requiero
     * Latitud
     * Valor medio anual de la irradiación global diaria horizontal
     */

    //consultar radiacion diaria







    /*
  this._calculadoraService.consulta_rendimiento_Pvgis(this.ubicacionPanel.latitud, this.ubicacionPanel.longitud,1000,500,200,40).subscribe(
   response=>{
  console.log(response.data)
   },
   error=>{
  
   }
  )
  */
    //this.ConsultarRadiacionDiaria()


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
      scene.background= new THREE.Color(0x000000) //Color de fondo negro

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.1);
      hemiLight.position.set(0, 20, 0); // Simula luz del cielo y el suelo
      scene.add(hemiLight);

      scene.fog = new THREE.Fog(0x000000, 10, 500); // Niebla negra desde 10 a 100 unidades

      ///// Geometria Vial
      /*
      let objetoVia= new GeometriaVial()
      objetoVia.crearVia(
        1, 
        2, 
        8, 
        2,
        true,
        1,
      scene)
        .then((via) => {}).catch((error) => {
          console.error('Error al cargar la geometria Víal:', error);
        });
      */

      let objetoVia = new GeometriaVial();
      objetoVia.crearVia(0.3, 2, 8, 2, true, 1, scene)
        .then((via) => {
          console.log('Geometría vial creada:', via);
          via.rotateY(THREE.MathUtils.degToRad(90))
        })
        .catch((error) => {
          console.error('Error al cargar la geometría vial:', error);
        });

      //////////////////


      const loaderModelo = new GLTFLoader()
      const controlesMovimiento = new TransformControls(camera, renderer.domElement)//renderer.domElement

      let objetoClase = new ModelLoader();
      // Cargar el modelo de la lámpara
      let lampara: any

      const grupoLamparas = new THREE.Group()
      scene.add(grupoLamparas);

      //const targetObject = new THREE.Object3D();
      //targetObject.position.set(0, 0, 0);
      //scene.add(targetObject);

    //  objetoClase.loadModel('../Modelos/LamparaSWL_10/Lampara_SWL_10_2.gltf', scene)
    objetoClase.loadModel('../Modelos/NSLV/NSLV_60W.gltf', scene)
      //objetoClase.loadModel('../Modelos/parqueGLTF/parque.gltf', scene)
        .then((modelo) => {
          // Encontrar el grupo de LEDs por su nombre
          lampara = modelo
          //grupoLampara.add(lampara)
          const ledGroup = lampara.getObjectByName('leds');

          let numeroLamparas = 3
          let interdistancia = 20

          for (let i = 0; i < numeroLamparas; i++) {
            const lamparaClon = lampara.clone();
            lamparaClon.position.set(i * interdistancia, lampara.position.y, 0);

            // Crear la luz SpotLight para la lámpara clonada
            const spotLight = new THREE.SpotLight(0xffffff);
            spotLight.power = 12000;
            // spotLight.angle = THREE.MathUtils.degToRad(140);
            spotLight.penumbra = 1
            spotLight.distance = 35 ///Distancia donde se atenua totalmente      
            spotLight.angle = 70 * Math.PI / 180
            spotLight.castShadow = true

            //Target
            const targetObject = new THREE.Object3D();
            targetObject.position.set(i * interdistancia, 0, 0); // Ajustar según sea necesario
            spotLight.target = targetObject;


            spotLight.shadow.mapSize.width = 2048;
            spotLight.shadow.mapSize.height = 2048;

            spotLight.shadow.camera.near = 0.5;
            spotLight.shadow.camera.far = 500;
            spotLight.shadow.camera.fov = 30;

            scene.add(targetObject);

            //Target

            lamparaClon.add(spotLight);
            grupoLamparas.add(lamparaClon);
          }
        })
        .catch((error) => {
          console.error('Error al cargar el modelo:', error);
        });

        //Cargar Ciudad
/*
 
        objetoClase.loadModel('../Modelos/Parque_2/parque.gltf', scene)
          .then((modelo) => {
            // Encontrar el grupo de LEDs por su nombre
           // Ciudad = modelo
           console.log('Modelo de ciudad Cargado')
          })
          .catch((error) => {
            console.error('Error al cargar el Ciudad:', error);
          });
  */

      controlesMovimiento.showY = false //No muestra movimiento en Y
      controlesMovimiento.attach(grupoLamparas)
      scene.add(controlesMovimiento)

      controlesMovimiento.addEventListener('change', () => {

        grupoLamparas.children.forEach((lamparaClon, index) => {
          // Verificar si el clon de la lámpara tiene una luz asociada en su `userData`
          const lamparaWorldPosition = new THREE.Vector3()
          lamparaClon.getWorldPosition(lamparaWorldPosition); // Obtiene la posición en coordenadas globales
          const spotLight = lamparaClon.children.find(child => child.type === 'SpotLight') as THREE.SpotLight;
          if (spotLight) {
            const targetObject = spotLight.target;
            targetObject.position.set(lamparaWorldPosition.x, 0, 0); // Ajustar según tus necesidades
            targetObject.updateMatrixWorld();

          } else {
            console.log(`No se encontró un SpotLight en la lámpara ${index}`);
          }

        });

        render(); // Volver a renderizar la escena
      });

      controlesMovimiento.addEventListener('dragging-changed', function (event) {
        controls.enabled = !event.value;
      });


      ///Inicia ajuste de posion de lamparas
      /*   function colocarLamparas(
           scene: any,
           altoLampara: any,
           distanciaEntreLamparas: any,
           cantidadLamparas: any,
           anchoCaminoPeatonal: any,
           anchoCalzada: any,
           anchoArcenCentral: any,
           tieneArcen: any) {
   
           // Posición en el andén izquierdo (a lo largo del eje Z y a la izquierda del eje X)
           const ladoIzquierdoX = -anchoCalzada / 2 - anchoCaminoPeatonal / 2;
   
           // Posición en el andén derecho (a lo largo del eje Z y a la derecha del eje X)
           const ladoDerechoX = anchoCalzada / 2 + anchoCaminoPeatonal / 2;
   
           // Posición en el arcén central si existe
           const arcenX = tieneArcen ? 0 : null;
   
           for (let i = 0; i < cantidadLamparas; i++) {
             const zPos = i * distanciaEntreLamparas; // Posición en Z a lo largo de la vía
   
             // Colocar lámpara en el andén izquierdo
             const lamparaIzquierda = crearLampara();
             lamparaIzquierda.position.set(ladoIzquierdoX, altoLampara, zPos);
             scene.add(lamparaIzquierda);
   
             // Colocar lámpara en el andén derecho
             const lamparaDerecha = crearLampara();
             lamparaDerecha.position.set(ladoDerechoX, altoLampara, zPos);
             scene.add(lamparaDerecha);
   
             // Colocar lámpara en el arcén central, si aplica
             if (tieneArcen && arcenX !== null) {
               const lamparaArcen = crearLampara();
               lamparaArcen.position.set(arcenX, altoLampara, zPos);
               scene.add(lamparaArcen);
             }
           }
         }
   
         colocarLamparas(scene, 12, 54, 2, 2, 8, 1, false)
   
         function crearLampara() {
           // Aquí puedes cargar tu modelo de lámpara o usar un Mesh básico para representarla
           const geometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 32);
           const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
           const lampara = new THREE.Mesh(geometry, material);
           return lampara;
         }
   */
      ///Finaliza ajuste de posicion de lamparas



      function ajustarAzimuthLampara(anguloAzimuth: any) {
        const radAzimuth = THREE.MathUtils.degToRad(anguloAzimuth);
        if (lampara) {
          lampara.rotation.y = radAzimuth; // Rotar la lámpara en Y (azimuth)

          let ledGroup = lampara.getObjectByName('leds');
          let ledPosition = new THREE.Vector3();
          ledGroup.getWorldPosition(ledPosition);
          // Ahora ya tienes la posición global y puedes usarla para posicionar la luz
          //spotLight.position.copy(ledPosition);
          // console.log('Luz actualizada', spotLight.position)
          //spotLight.rotation.y = radAzimuth;
        } else {
          console.error('Lámpara no cargada');
        }
      }

      function ajustarInlcinacionLampara(anguloInclinacion: any) {
        const radAzimuth = THREE.MathUtils.degToRad(anguloInclinacion);
        if (lampara) {
          lampara.rotation.z = radAzimuth; // Rotar la lámpara en Y (azimuth)

          let ledGroup = lampara.getObjectByName('leds');
          let ledPosition = new THREE.Vector3();
          ledGroup.getWorldPosition(ledPosition);
          //spotLight.position.copy(ledPosition);
          // console.log('Luz actualizada', spotLight.position)


          //const inclinacionRad = THREE.MathUtils.degToRad(anguloInclinacion);
          // Apuntar la luz hacia abajo, como lo harían los LEDs
          //spotLight.target.position.set(ledPosition.x, ledPosition.y - 1,   ledPosition.z + Math.tan(inclinacionRad) * 5);

        } else {
          console.error('Lámpara no cargada');
        }
      }
      /*
            function ajustarAlturaLampara(altura: any) {
              //const radAzimuth = THREE.MathUtils.degToRad(altura);
              if (lampara) {
                lampara.position.y = altura; // Rotar la lámpara en Y (azimuth)
      
                let ledGroup = lampara.getObjectByName('leds');
                let ledPosition = new THREE.Vector3();
                ledGroup.getWorldPosition(ledPosition);
                spotLight.position.copy(ledPosition);
                console.log('Luz actualizada, Altura', spotLight.position)
      
              } else {
                console.error('Lámpara no cargada');
              }
            }
      */

      //////////

      const modelPaths = {
        panelSolar: 'path/to/panel.glb',
        ciudad: '../Modelos/city/scene.gltf',
      };
      /*
      document.getElementById('modelSelect').addEventListener('change', function(event) {
          const selectedModel = event.target.value;
          loadModel(modelPaths[selectedModel]);
      });
  */

      const modeloCargar = document.getElementById('modeloSelect') as HTMLInputElement

      /*
      modeloCargar?.addEventListener("change", function () {
        const selectedModel = this.value;
        loadModel(modelPaths[selectedModel]);
      });
      */
      


      function loadModel(path: any) {
        loaderModelo.load(path, function (gltf) {
          const model = gltf.scene
          scene.clear(); // Limpia la escena si quieres mostrar solo un modelo a la vez
          scene.add(model);

        });
      }

      /*
        loaderModelo.load('../Modelos/city/scene.gltf', (gltf) => {
          const model = gltf.scene
          model.scale.set(0.3, 0.3, 0.3)
          model.position.set(0, 0, 0)
          scene.add(model)
        })
  */


      {

        // Definir el tamaño del plano y la cantidad de divisiones en la rejilla
        const planeSize = 100;
        const gridDivisions = 100; // Número de divisiones en la rejilla

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
        const axesHelper = new THREE.AxesHelper(15);
        scene.add(axesHelper);
      }


      const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.02);
      renderer.clippingPlanes = [clippingPlane];


      //Creacion de la ecliptica
      const radio = 45 //antes 10
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

      eclipticaMesh.rotation.z = THREE.MathUtils.degToRad(90 - latitud);
      console.log('Rotacion en X', 4.571077 * Math.PI / 180)

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
        const gui = new GUI({ container: contenedorGui });


        const parametros = { latitud: latitud };

        // Añadir un control deslizante para modificar la latitud
        gui.add(parametros, 'latitud', -90, 90).name('Latitud').onChange(function (value) {
          latitud = value;  // Actualizar latitud
          actualizarInclinacion();  // Llamar a la función para actualizar la inclinación
        });


        let orientacionAzimuth = 0
        const parametroOrientacion = { angulo: orientacionAzimuth };
        gui.add(parametroOrientacion, 'angulo', -180, 180).name('Azimuth Panel').onChange(function (value) {
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

        //Movimiento d ela lampara Cargada
        let orientacionLamparaAzimuth = 0
        const parametroOrientacionLamparaAzimuth = { angulo: orientacionLamparaAzimuth };
        gui.add(parametroOrientacionLamparaAzimuth, 'angulo', 0, 360).name('Azimuth Lampara').onChange(function (value) {
          orientacionLamparaAzimuth = value;  // Actualizar latitud
          ajustarAzimuthLampara(orientacionLamparaAzimuth);  // Llamar a la función para actualizar la inclinación
        });

        let orientacionLamparaInclinacion = 0
        const parametroOrientacionLamparaInclinacion = { angulo: orientacionLamparaInclinacion };
        gui.add(parametroOrientacionLamparaInclinacion, 'angulo', 0, 90).name('Inclinación Lampara').onChange(function (value) {
          orientacionLamparaInclinacion = value;  // Actualizar latitud
          ajustarInlcinacionLampara(orientacionLamparaInclinacion);  // Llamar a la función para actualizar la inclinación
        });


        let alturaLampara = 4
        const parametroalturaLampara = { alto: alturaLampara };
        gui.add(parametroalturaLampara, 'alto', 1, 15).name('Altura Lampara').onChange(function (value) {
          alturaLampara = value;  // Actualizar latitud
          ajustarAlturaLampara(alturaLampara);  // Llamar a la función para actualizar la inclinación
        });

        let Interdistancia = 0
        const parametroInterdistancia = { interdistancia: Interdistancia };
        gui.add(parametroInterdistancia, 'interdistancia', 0, 90).name('InterDistancia').onChange(function (value) {
          Interdistancia = value;  // Actualizar latitud
          ajustarInterdistanciaLampara(Interdistancia);  // Llamar a la función para actualizar la inclinación
        });

      }



      function ajustarAlturaLampara(altura: any) {
        //const radAzimuth = THREE.MathUtils.degToRad(altura);
        if (grupoLamparas) {
          grupoLamparas.position.y = altura; // Rotar la lámpara en Y (azimuth)
          render();
        } else {
          console.error('Lámparas no cargada');
        }
      }


      function ajustarInterdistanciaLampara(interdistancia: any) {
        if (grupoLamparas) {
          // Tomar la posición actual de la primera lámpara como referencia
          const primeraLampara = grupoLamparas.children[0];

          if (primeraLampara) {
            const posicionInicialX = primeraLampara.position.x;

            // Ajustar la posición de cada lámpara tomando en cuenta la nueva interdistancia
            grupoLamparas.children.forEach((lampara, index) => {

              //Actualizar Target de Luz

              const lamparaWorldPosition = new THREE.Vector3()
              lampara.getWorldPosition(lamparaWorldPosition); // Obtiene la posición en coordenadas globales
              const spotLight = lampara.children.find(child => child.type === 'SpotLight') as THREE.SpotLight;
              if (spotLight) {
                const targetObject = spotLight.target;
                targetObject.position.set(lamparaWorldPosition.x, 0, 0); // Ajustar según tus necesidades
                targetObject.updateMatrixWorld();

              } else {
                console.log(`No se encontró un SpotLight en la lámpara ${index}`);
              }
              if (index > 0) {
                lampara.position.x = posicionInicialX + (index * interdistancia); // Ajustar en el eje X
              }
            });
            /**
                grupoLamparas.children.forEach((lamparaClon, index) => {
          // Verificar si el clon de la lámpara tiene una luz asociada en su `userData`
          const lamparaWorldPosition = new THREE.Vector3()
          lamparaClon.getWorldPosition(lamparaWorldPosition); // Obtiene la posición en coordenadas globales
          const spotLight = lamparaClon.children.find(child => child.type === 'SpotLight') as THREE.SpotLight;
          if (spotLight) {
            const targetObject = spotLight.target;
            targetObject.position.set(lamparaWorldPosition.x, 0, 0); // Ajustar según tus necesidades
            targetObject.updateMatrixWorld();

          } else {
            console.log(`No se encontró un SpotLight en la lámpara ${index}`);
          }

        }); 
             */
          } else {
            console.error('No hay lámparas en el grupo.');
          }
        } else {
          console.error('El grupo de lámparas no está cargado.');
        }
      }

      const loader = new FontLoader();
      loader.load('../Modelos/helvetiker_regular.typeface.json', function (font) {
        const createLabel = (text: any, x: any, y: any, z: any) => {
          const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.5,  // Tamaño de la letra
            //height: 0.1,
            depth: 5,
          });
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          textMesh.position.set(x, y, z);//x y z
          textMesh.rotation.x = THREE.MathUtils.degToRad(90);
          scene.add(textMesh);
        };

        // Puntos cardinales
        createLabel('N', -11, 0, 0);  // Norte (0°)
        createLabel('E', 0, 0, -11);  // Este (90°)
        createLabel('S', 11, 0, 0); // Sur (180°)
        createLabel('O', 0, 0, 11); // Oeste (270°)
      });


      //Creamos la geometria o lo que queremos mostrar

      const boxWidth = 0.5 //Ancho X
      const boxHeight = 1 //alto eje Y
      const boxDepth = 0.03 //Profundidad Z
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

      //Se crea el material
      //const material=new THREE.MeshBasicMaterial({color:0x44aa88}) Basic material no lo afectan las luces
      const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 })

      //Se une la geometria y el material
      const panelSolar = new THREE.Mesh(geometry, material)
      panelSolar.position.set(0, 1, 0);//(X,Y,Z)
      panelSolar.geometry.center();
      //Se agrega la malla a la scena

      const pivote = new THREE.Object3D();
      pivote.add(panelSolar);
      scene.add(panelSolar)


      // Crear el grupo para el azimuth (rotación Y)
      const grupoAzimuth = new THREE.Group();
      scene.add(grupoAzimuth);

      // Crear el grupo para la inclinación (rotación X) y añadirlo al grupoAzimuth
      const grupoInclinacion = new THREE.Group();
      grupoAzimuth.add(grupoInclinacion);

      // Añadir el panel solar al grupo de inclinación
      grupoInclinacion.add(panelSolar);
      //grupoInclinacion.rotation.x = THREE.MathUtils.degToRad(90); 

      // Función para ajustar el azimuth
      function ajustarAzimut(anguloAzimuth: any) {
        const radAzimuth = THREE.MathUtils.degToRad(anguloAzimuth);
        grupoAzimuth.rotation.y = radAzimuth;  // Rotar el grupo en Y (azimuth)
      }

      // Función para ajustar la inclinación
      function ajustarInclinacion(anguloInclinacion: any) {
        if (anguloInclinacion >= 0 && anguloInclinacion <= 90) {
          const radInclinacion = THREE.MathUtils.degToRad(anguloInclinacion);
          grupoInclinacion.rotation.x = radInclinacion;  // Rotar el grupo en X (inclinación)
        } else {
          console.warn("Ángulo de inclinación fuera de rango (0-90 grados).");
        }
      }
      //ajustarAzimut(120)
      //ajustarInclinacion(90)
      //Inclinacion de la Ecliptica
      function actualizarInclinacion() {
        const inclinacion = 90 - latitud;
        eclipticaMesh.rotation.z = THREE.MathUtils.degToRad(inclinacion);
      }


      function obtenerAzimutEInclinacion(this: any) {
        const anguloAzimut = THREE.MathUtils.radToDeg(grupoAzimuth.rotation.y); // Convertimos de radianes a grados
        const anguloInclinacion = THREE.MathUtils.radToDeg(grupoInclinacion.rotation.x);
        console.log("Azimut:", anguloAzimut, "Inclinación:", anguloInclinacion);
        calcularNuevosValores(anguloAzimut, anguloInclinacion)
        // Aquí podrías calcular la irradiancia en función de estos valores
        //calcularIrradiancia(anguloAzimut, anguloInclinacion);
      }


      const calcularNuevosValores = (azimuth: any, inclinacion: any) => {


        /*
        
        OJO CORREGIR QUE EL PANEL TIENE LOS ANGULOS DE INCLINACION INVERTIDOS
        
        */


        //si el angulo de inclinacion esta entre 15 y 90 Grados
        if (inclinacion > 15 && inclinacion <= 90) {
          //Calcular factor de irradiacion
          const FI = 1 - (1.2e-4 * (inclinacion - (3.7 + 0.69 * this.ubicacionPanel.latitud)) ** 2 + 3.5e-5 * azimuth ** 2)
          console.log('>15<=90 Recalcular Con Factor De Irradiacion: FI', FI, 'Inclinacion', inclinacion, azimuth, azimuth ** 2)


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
              let produce = (this.panelSolar.potencia * (1 + (this.panelSolar.coef_pmax_temp / 100) * (temperatura_celula - 25)) * clave.irradiacion_plano_horizontal * clave.K * FI / 1000) * 1 //this.numero_paneles
              Potencia_t.push(produce)
            }
          }

          console.log('Actualizando Grafico > 15', Potencia_t)
          this.ChartProduccionVariable.data.datasets[0].data = Potencia_t //Energia almacenada porque potencia FV fue mayor a consumos
          this.ChartProduccionVariable.update(); //Actualizamos graficos 
          //Finaliza Grafica del esatdo de la bateria


        }
        if (inclinacion <= 15) {
          const FI = 1 - (1.2e-4 * (inclinacion - (3.7 + 0.69 * this.ubicacionPanel.latitud)) ** 2)
          console.log(' <= 15 Grados  Recalcular Con Factor De Irradiacion: FI', FI, 'Inclinacion', inclinacion)



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

          for (let clave of this.unionArray) {
            if (clave.mes == parseInt(mes_selecionado)) {
              //console.log('Mes seeleccionado igual a mes', mes_selecionado,clave.irradiacion_plano_horizontal*clave.K*FI,clave.irradiacion_plano_horizontal,clave.K,FI)
              label.push(clave.hora)
              sumas.push(clave.irradiacion_plano_horizontal * clave.K * FI)
              temperaturas.push(clave.temperatura)
              //Calculamos los valores de produccion
              let temperatura_celula = clave.temperatura + (this.panelSolar.noct - 20) * clave.irradiacion_plano_horizontal * clave.K * FI / 800
              //console.log('Temperaturas de a celula',temperatura_celula)
              Tcell.push(temperatura_celula)
              let produce_v = (this.panelSolar.voc * (1 + (this.panelSolar.coef_voc_temp / 100) * (temperatura_celula - 25))) * 1 //this.paneles_serie aqui son los paneles en serie, se deja por default en uno para pruebas
              voc_t.push(produce_v)
              let produce_i = (this.panelSolar.isc * (1 + (this.panelSolar.coef_isc_temp / 100) * (temperatura_celula - 25)) * clave.irradiacion_plano_horizontal * clave.K * FI / 1000) * 1 //this.paneles_paralelo aqui son los paneles en paralelo, se deja por default en uno para pruebas
              isc_t.push(produce_i)//Tomando en cuenta Una irradiancia especifica
              let produce = (this.panelSolar.potencia * (1 + (this.panelSolar.coef_pmax_temp / 100) * (temperatura_celula - 25)) * clave.irradiacion_plano_horizontal * clave.K * FI / 1000) * 1 //this.numero_paneles
              Potencia_t.push(produce)
            }
          }

          console.log('Actualizando Grafico <= 15', Potencia_t)
          this.ChartProduccionVariable.data.datasets[0].data = Potencia_t //Energia producida por el panel
          this.ChartProduccionVariable.update(); //Actualizamos graficos 

        }

        //Ahora calcular salida de voltaje de acuerdo a factor de irradiacion

      }

      const sliderAzimut = document.getElementById("azimuthSlider") as HTMLInputElement;
      const sliderInclinacion = document.getElementById("inclinacionSlider") as HTMLInputElement;

      sliderAzimut?.addEventListener("input", function () {
        const anguloAzimuth = this.value; // Aquí obtenemos el valor actual del slider
        ajustarAzimut(anguloAzimuth);     // Llamamos a la función para ajustar el azimuth
        //obtenerAzimutEInclinacion();      // Si necesitas obtener ambos valores después del ajuste

        const anguloAzimut = THREE.MathUtils.radToDeg(grupoAzimuth.rotation.y); // Convertimos de radianes a grados
        const anguloInclinacion = THREE.MathUtils.radToDeg(grupoInclinacion.rotation.x);
        console.log("Azimut:", anguloAzimut, "Inclinación:", anguloInclinacion);
        calcularNuevosValores(anguloAzimut, anguloInclinacion)


      });

      sliderInclinacion?.addEventListener("input", function () {
        const anguloInclinacion = this.value; // Casting para obtener el valor del slider
        ajustarInclinacion(anguloInclinacion); // Ajustamos la inclinación
        //obtenerAzimutEInclinacion();           // Opcional, si es necesario obtener ambos valores
        const anguloAzimut = THREE.MathUtils.radToDeg(grupoAzimuth.rotation.y); // Convertimos de radianes a grados
        const anguloInclinacionn = THREE.MathUtils.radToDeg(grupoInclinacion.rotation.x);
        console.log("Azimut:", anguloAzimut, "Inclinación:", anguloInclinacion);
        calcularNuevosValores(anguloAzimut, anguloInclinacionn)

      });





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

      /*  function render() {
  
          if (resizeRendererToDisplaySize(renderer)) {
  
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
  
          }
  
          renderer.render(scene, camera);
  
          requestAnimationFrame(render);
  
        }
          requestAnimationFrame(render)
  */

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
      //finaliza union
      ///////////////////////////////



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

    //Consulta radiaicon en plano Horzontal
    /*  this._calculadoraService.consultar_radiacion_diaria_plano_Horizontal(lat, lon, angle).subscribe(
            response => {
              this.radiacion_diaria_horizontal = response.data.outputs.daily_profile
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
      
              console.log('Radiacion Diaria:', this.DataRadiacion_horizontal)
      
              //Ahora simulamos salida del panel Solar
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
      
              for (let clave of this.DataRadiacion_horizontal) {
                if (clave.mes == parseInt(mes_selecionado)) {
                  console.log('Mes seeleccionado igual a mes', mes_selecionado)
                  label.push(clave.hora)
                  sumas.push(clave.irradiacion)
                  temperaturas.push(clave.temperatura)
                  //Calculamos los valores de produccion
                  let temperatura_celula = clave.temperatura + (this.panelSolar.noct - 20) * clave.irradiacion / 800
                  //console.log('Temperaturas de a celula',temperatura_celula)
                  Tcell.push(temperatura_celula)
                  let produce_v = (this.panelSolar.voc * (1 + (this.panelSolar.coef_voc_temp / 100) * (temperatura_celula - 25))) * 1 //this.paneles_serie aqui son los paneles en serie, se deja por default en uno para pruebas
                  voc_t.push(produce_v)
                  let produce_i = (this.panelSolar.isc * (1 + (this.panelSolar.coef_isc_temp / 100) * (temperatura_celula - 25)) * clave.irradiacion / 1000) * 1 //this.paneles_paralelo aqui son los paneles en paralelo, se deja por default en uno para pruebas
                  isc_t.push(produce_i)//Tomando en cuenta Una irradiancia especifica
                  let produce = (this.panelSolar.potencia * (1 + (this.panelSolar.coef_pmax_temp / 100) * (temperatura_celula - 25)) * clave.irradiacion / 1000) * 1 //this.numero_paneles
                  Potencia_t.push(produce)
                }
              }
      
              //Grafico de produccion panel Solar
              var canvas = <HTMLCanvasElement>document.getElementById('ChartMensualHorizontal')
              var ctx = canvas.getContext('2d')!
      
              var ChartMensualg = new Chart(ctx, {
                type: 'line',
                data: {
                  labels: label,
                  datasets: [
                    {
                      type: 'line',
                      label: 'Irradiación Media horaria Mes Horizontal: ' + mes_selecionado,
                      data: sumas
                    },
                    {
                      type: 'line',
                      label: 'Potencia Producida por el Panel Horizontal',
                      data: Potencia_t
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
            },
            error => {
              console.log('Error en la consulta de Irradiacion diaria')
            }
          );*/
    //Finaliza consulta radiacion en plano horizontal
  }


  obtener_radiacion_inclinacion_optima() {

    const lat = this.ubicacionPanel.latitud
    const lon = this.ubicacionPanel.longitud
    const angleoptimo = 3.7 + 0.69 * this.ubicacionPanel.latitud
    const angle = angleoptimo//Tomando en cuenta un angulo optimo calculado de acuerdo a la ubicación


    return this._calculadoraService.consultar_radiacion_diaria(lat, lon, angle).pipe(
      map(response => response.data.outputs.daily_profile)
    )
    //Consulta radiaicon con un angulo y acimuth optimo
    /*    this._calculadoraService.consultar_radiacion_diaria(lat, lon, angle).subscribe(
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
    
            console.log('Radiacion Diaria Angulo y Acimuth Optimo:', this.DataRadiacion)
    
            //Ahora simulamos salida del panel Solar
    
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
    
            for (let clave of this.DataRadiacion) {
              if (clave.mes == parseInt(mes_selecionado)) {
                console.log('Mes seeleccionado igual a mes', mes_selecionado)
                label.push(clave.hora)
                sumas.push(clave.irradiacion)
                temperaturas.push(clave.temperatura)
                //Calculamos los valores de produccion
                let temperatura_celula = clave.temperatura + (this.panelSolar.noct - 20) * clave.irradiacion / 800
                //console.log('Temperaturas de a celula',temperatura_celula)
                Tcell.push(temperatura_celula)
                let produce_v = (this.panelSolar.voc * (1 + (this.panelSolar.coef_voc_temp / 100) * (temperatura_celula - 25))) * 1 //this.paneles_serie aqui son los paneles en serie, se deja por default en uno para pruebas
                voc_t.push(produce_v)
                let produce_i = (this.panelSolar.isc * (1 + (this.panelSolar.coef_isc_temp / 100) * (temperatura_celula - 25)) * clave.irradiacion / 1000) * 1 //this.paneles_paralelo aqui son los paneles en paralelo, se deja por default en uno para pruebas
                isc_t.push(produce_i)//Tomando en cuenta Una irradiancia especifica
                let produce = (this.panelSolar.potencia * (1 + (this.panelSolar.coef_pmax_temp / 100) * (temperatura_celula - 25)) * clave.irradiacion / 1000) * 1 //this.numero_paneles
                Potencia_t.push(produce)
              }
            }
    
            //Grafico de produccion panel Solar
            var canvas = <HTMLCanvasElement>document.getElementById('ChartMensual')
            var ctx = canvas.getContext('2d')!
    
            var ChartMensualg = new Chart(ctx, {
              type: 'line',
              data: {
                labels: label,
                datasets: [
                  {
                    type: 'line',
                    label: 'Irradiación Media horaria Mes: ' + mes_selecionado,
                    data: sumas
                  },
                  {
                    type: 'line',
                    label: 'Potencia Producida por el Panel',
                    data: Potencia_t
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
          },
          error => {
            console.log('Error en la consulta de Irradiacion diaria')
          }
        );
    */
  }


  onModelChange() {

    let objetoClase = new ModelLoader();
    // objetoClase.loadModel('../Modelos/city/s.gltf',this.myScene)
    objetoClase.loadModel('../Modelos/LamparaSWL_10/SWL_10.gltf', this.myScene)

  }

}

import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavComponent } from '../../../nav/nav.component';
import { FooterComponent } from '../../../footer/footer.component';
import { IniciarEscenaService } from '../../../../services/iniciar-escena.service';
import { CargarlamparaService } from '../../../../services/cargarlampara.service';
import { LucesService } from '../../../../services/luces.service';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js'

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CdkAccordionModule, CdkAccordionItem } from '@angular/cdk/accordion';
//import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { GuestServiceService } from '../../../../services/guest-service.service';
import { RouterModule } from '@angular/router';


import { register } from 'swiper/element/bundle';
// register Swiper custom elements
register();

declare var tns: any
declare var lightGallery: any
declare var iziToast: any
declare var $: any




@Component({
  selector: 'app-simular-lampara',
  imports: [NavComponent, FooterComponent, FormsModule, CdkAccordionItem, CommonModule, RouterModule],
  templateUrl: './simular-lampara.component.html',
  styleUrl: './simular-lampara.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SimularLamparaComponent implements AfterViewInit {

  public lamparaSeleccionada: undefined
  public escenarioSeleccionado: any
  public lampara: any



  public lamparas_2: Array<any> = [{
    "nombre": "Alumbrado Publico",
    "electrodomesticos": [
      {

        "potencia": 44,
        "uso_dia": 24,
        "categoria": "Alumbrado_Publico",

        "nombre": 'NSLZ_60',
        "path": '../Modelos/Z60/NuevosLed_z60.gltf',
        "lumens": 11000,
        "distancia": 10,
        "anguloApertura": 70,
        "color": 0xfff5e5,
        "penumbra": 1//de 0 a 1 
      },
      {

        "potencia": 44,
        "uso_dia": 24,
        "categoria": "Alumbrado_Publico",

        "nombre": 'NSLV_40',
        "path": '../Modelos/Z60/NuevosLed_z60.gltf',
        "lumens": 6800,
        "distancia": 10,
        "anguloApertura": 70,
        "color": 0xfff5e5,
        "penumbra": 1//de 0 a 1 
      },
      {

        "potencia": 44,
        "uso_dia": 24,
        "categoria": "Alumbrado_Publico",

        "nombre": 'NSLV_60W',
        "path": '../Modelos/NSLV/NSLV_60W_GLTF.gltf',
        "lumens": 11000,
        "distancia": 10,
        "anguloApertura": 70,
        "color": 0xfff5e5,
        "penumbra": 1//de 0 a 1 
      }
    ]
  },
  {
    "nombre": "Jardines Y Parques",
    "electrodomesticos": [
      {
        "nombre": "Secador de Cabello",
        "potencia": 700,
        "uso_dia": 2,
        "categoria": "Jardines_Y_Parques"
      }
    ]
  },
  {
    "nombre": "Decorativas",
    "electrodomesticos": [
      {
        "nombre": "Lavadora",
        "potencia": 70,
        "uso_dia": 4,
        "categoria": "Decorativas"
      }
    ]
  },
  {
    "nombre": "Reflectores",
    "electrodomesticos": [
      {

        "potencia": 44,
        "uso_dia": 24,
        "categoria": "Reflectores",

        "nombre": 'NSFL02-200W',
        "path": '../Modelos/SFL02_200W/SFL02_200W.gltf',
        "lumens": 11000,
        "distancia": 10,
        "anguloApertura": 70,
        "color": 0xfff5e5,
        "penumbra": 1//de 0 a 1 
      },
    ]
  }
  ]

  public lamparas0: Array<any> = [
    {
      nombre: 'NSLZ_60',
      path: '../Modelos/Z60/NuevosLed_z60.gltf',
      lumens: 11000,
      distancia: 10,
      anguloApertura: 70,
      color: 0xfff5e5,
      penumbra: 1//de 0 a 1  
    },
    {
      nombre: 'SFL02_200W',
      path: '../Modelos/SFL02_200W/SFL02_200W.gltf',
      lumens: 3500,
      distancia: 12,
      anguloApertura: 80,
      color: 0x07ec22,
      penumbra: 0.1//de 0 a 1
    },
    {
      nombre: 'NSL_06M',
      path: '../Modelos/NSL_06M/NSL_06M.gltf'
    },
    {
      nombre: 'NSWL_10',
      path: '../Modelos/LamparaSWL_10/Lampara_SWL_10_2.gltf'
    },
    {
      nombre: 'NSL_912',
      path: '../Modelos/NSL_912/NSL_912.gltf'
    },
    {
      nombre: 'NSL_98',
      path: '../Modelos/NSL_98/Blender_NSL_912dasdsfsdgsd.gltf'
    },

    {
      nombre: 'Solar_Tracker',
      path: '../Modelos/SolarTracker/SolarTracker.gltf'
    }
  ]

  public escenarios: Array<any> = [
    {
      nombre: 'parque',
      path: '../Modelos/parqueGLTF/parque.gltf'
    },
  ]

  public animando = true;
  public renderer = new THREE.WebGLRenderer;
  public scene = new THREE.Scene;
  public camera = new THREE.PerspectiveCamera
  public controls: any

  public spotLight: any
  public lightState = true


  public ledGroup: any
  public NombrelamparaActual = undefined

  public lamparas: Array<any> = [];
  public lamparas_const: Array<any> = [];
  public datosAgrupados: any = {};
  public data: any = [];


  //Inicia prueba Situar lamparas en cualquier modelo
  public lineaLamparas: any
  public calle: any
  //Finaliza prueba situar lamparas en cualquier modelo


  constructor(
    private _iniciarEscenaService: IniciarEscenaService,
    private _cargarLampara: CargarlamparaService,
    private _luces: LucesService,
    private _guestService: GuestServiceService
  ) {

  }

  ngOnInit(): void {

    this._guestService.listar_lamparas_guest().subscribe(
      response => {

        this.lamparas_const = response.data;
        this.lamparas = this.lamparas_const;

        this.lamparas.forEach(lampara => {
          const categoriaNombre = lampara.categoria.nombre;

          // Verificar si la categoría ya existe en datosAgrupados
          if (categoriaNombre in this.datosAgrupados) {
            // Si la categoría ya existe, agregar el electrodoméstico al array correspondiente
            this.datosAgrupados[categoriaNombre].lamparas.push({
              nombre: lampara.nombre,
              potencia: lampara.potencia,
              categoria: categoriaNombre,
              path: lampara.path,
              lumens: lampara.lumens,
              distancia: lampara.distancia,
              anguloApertura: lampara.anguloApertura,
              anguloInclinacion: lampara.anguloInclinacion,
              color: lampara.temperaturaColor,
              penumbra: lampara.penumbra,
              enlaceAR: lampara.enlaceAR//Validar
            });
          } else {
            // Si la categoría no existe, crear un nuevo objeto con la categoría y el electrodoméstico
            this.datosAgrupados[categoriaNombre] = {
              nombre: categoriaNombre,
              lamparas: [{
                nombre: lampara.nombre,
                potencia: lampara.potencia,
                categoria: categoriaNombre,
                path: lampara.path,
                lumens: lampara.lumens,
                distancia: lampara.distancia,
                anguloApertura: lampara.anguloApertura,
                anguloInclinacion: lampara.anguloInclinacion,
                color: lampara.temperaturaColor,
                penumbra: lampara.penumbra,
                enlaceAR: lampara.enlaceAR//Validar
              }]
            };
          }
        });

        // Convertir el objeto a un array

        // Convertir el objeto a un array
        this.data = Object.values(this.datosAgrupados);
        console.log('Data Organizada', this.data)
        this.cargarLampara()


      },
      error => {
        console.log('error')
      }
    );


  }

  ngAfterViewInit(): void {
    const canvas = document.querySelector('#componente') as HTMLCanvasElement;

    if (canvas) {
      // Almacenar las referencias a la escena, cámara y renderizador
      const { scene, camera, renderer } = this._iniciarEscenaService.initScene(canvas);

      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
      //Controles de orbita
      this.controls = new OrbitControls(camera, canvas);
      //const controls = new OrbitControls(camera, canvas);

      this.controls.target.set(0, 5, 0);
      this.controls.update();

      //this.cargarLampara()


    }
  }

  cargarLampara() {

    let lampara
    if (this.lamparaSeleccionada != undefined) {
      console.log('Lampara Seleccionada', this.lamparaSeleccionada)
      lampara = this.lamparas[this.lamparaSeleccionada]
      //this.NombrelamparaActual = this.lamparas[this.lamparaSeleccionada].nombre
    } else {
      lampara = this.lamparas[0]
      //this.NombrelamparaActual = this.lamparas[0].nombre
      //this._cargarLampara.loadModel(this.lamparas[this.lamparaSeleccionada], this.scene, this.NombrelamparaActual)
    }

    //this.NombrelamparaActual = this.lamparas[this.lamparaSeleccionada].nombre
    // this._cargarLampara.cargarLamparas(this.lamparas[this.lamparaSeleccionada], this.scene, this.NombrelamparaActual);


    ///////////////////////

    this._cargarLampara.loadModel(lampara, this.scene, this.NombrelamparaActual).then((modelo) => {//loadModel
      modelo.updateMatrixWorld(true)
      this.lampara = modelo


      //

      // Obtener los límites del modelo
      const box = new THREE.Box3().setFromObject(this.lampara);
      const boxSize = box.getSize(new THREE.Vector3());
      const boxCenter = box.getCenter(new THREE.Vector3());

      // Ajustar la posición del modelo centrado
      this.lampara.position.x += (this.lampara.position.x - boxCenter.x);
      this.lampara.position.y += (this.lampara.position.y - boxCenter.y);
      this.lampara.position.z += (this.lampara.position.z - boxCenter.z);

      // Posicionar la cámara a una distancia adecuada
      const maxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z);
      const cameraDistance = maxDimension * 2;

      this.camera.position.set(boxCenter.x, boxCenter.y, cameraDistance);
      this.camera.lookAt(boxCenter);

      this.controls.maxDistance = cameraDistance * 3;
      this.controls.target.copy(boxCenter);
      this.controls.update();

      //this.controls.fitToBox(this.lampara, true);

      //

      this.NombrelamparaActual = this.lampara.name
      //Inicia Buscar la posicion d elos Led
      console.log('Lampara Cargada, siii', this.lampara, 'Nombre', this.lampara.name, this.NombrelamparaActual)

      this.ledGroup = this.lampara.getObjectByName('placaLed');//Total_NSLZ_60 //leds
      const plasticoLedGroup = this.lampara.getObjectByName('plasticoLed');//Total_NSLZ_60 //leds
      const bateriaGroup = this.lampara.getObjectByName('Bateria');//Total_NSLZ_60 //leds


      //Añadir Hospot Y luz
      if (this.ledGroup) {
        //Determinar posicion de la luz
        const worldPosition = new THREE.Vector3();
        this.ledGroup.getWorldPosition(worldPosition);
        console.log('posicion d ela placa de ledsxxxxxx:', worldPosition)
        //Añado la luz
        this.spotLight = this._luces.addLight(worldPosition, this.scene, lampara)
        //console.log(ledGroup.position,worldPosition)
      }


      //Asignar Carcateristicas a placa de leds
      if (this.ledGroup) {
        const ledMaterial = new THREE.MeshStandardMaterial({
          //color: 0xF8F8FB, //0xffffff,  // Color base de los LEDs
          emissive: 0XF8F8FB,//0xffff00,  // Color de la luz emitida (puedes ajustarlo a lo que desees)
          emissiveIntensity: 1,  // Intensidad de la emisión de luz
        });
        this.ledGroup.traverse((child: any) => {
          if (child.isMesh) {
            child.material = ledMaterial;  // Asignar el material emisivo a los LEDs  antes   ledMaterial /glowMaterial
          }
        });

      }


      //Asignar material a PLastico de Leds
      if (plasticoLedGroup) {
        const plasticoMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,  // Color del plástico
          transparent: true,
          opacity: 0.5,  // Ajusta la opacidad para mayor transparencia
          transmission: 0.9,  // Permite que la luz pase a través del material
          roughness: 0.1,  // Controla el acabado del plástico (más bajo es más brillante)
          metalness: 0,    // No es un material metálico
          ior: 1.5,  // Índice de refracción (simula vidrio/plástico)
        });

        plasticoLedGroup.traverse((child: any) => {
          if (child.isMesh) {
            child.material = plasticoMaterial;  // Asignar el material emisivo a los LEDs  antes   ledMaterial /glowMaterial
          }
        });

      }


    });
    // Comenzar la animación
    this.animate();

    ///////////////////////////

  }

  cargarLampara2(indiceColeccion: any, indiceLampara: any) {
    let lampara
    if (indiceColeccion != undefined && indiceLampara != undefined) {
      lampara = this.data[indiceColeccion].lamparas[indiceLampara]

      //this.NombrelamparaActual = this.lamparas[this.lamparaSeleccionada].nombre
    } else {
      lampara = this.data[0].lamparas[0]
      //this.NombrelamparaActual = this.lamparas[0].nombre
      //this._cargarLampara.loadModel(this.lamparas[this.lamparaSeleccionada], this.scene, this.NombrelamparaActual)
    }

    //this.NombrelamparaActual = this.lamparas[this.lamparaSeleccionada].nombre
    // this._cargarLampara.cargarLamparas(this.lamparas[this.lamparaSeleccionada], this.scene, this.NombrelamparaActual);


    ///////////////////////

    this._cargarLampara.loadModel(lampara, this.scene, this.NombrelamparaActual).then((modelo) => {//loadModel
      modelo.updateMatrixWorld(true)
      this.lampara = modelo

      //

      // Obtener los límites del modelo
      const box = new THREE.Box3().setFromObject(this.lampara);
      const boxSize = box.getSize(new THREE.Vector3());
      const boxCenter = box.getCenter(new THREE.Vector3());

      // Ajustar la posición del modelo centrado
      this.lampara.position.x += (this.lampara.position.x - boxCenter.x);
      this.lampara.position.y += (this.lampara.position.y - boxCenter.y);
      this.lampara.position.z += (this.lampara.position.z - boxCenter.z);

      // Posicionar la cámara a una distancia adecuada
      const maxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z);
      const cameraDistance = maxDimension * 2;

      this.camera.position.set(boxCenter.x, boxCenter.y, cameraDistance);
      this.camera.lookAt(boxCenter);

      this.controls.maxDistance = cameraDistance * 3;
      this.controls.target.copy(boxCenter);
      this.controls.update();

      //this.controls.fitToBox(this.lampara, true);

      //

      this.NombrelamparaActual = this.lampara.name
      //Inicia Buscar la posicion d elos Led
      console.log('Lampara Cargada', this.lampara, 'Nombre', this.lampara.name, this.NombrelamparaActual)

      this.ledGroup = this.lampara.getObjectByName('placaLed');//Total_NSLZ_60 //leds
      const plasticoLedGroup = this.lampara.getObjectByName('plasticoLed');//Total_NSLZ_60 //leds
      const bateriaGroup = this.lampara.getObjectByName('Bateria');//Total_NSLZ_60 //leds





      //Inicia prueba para situar en la scena las las lamparas
      //Paso uno, obtener el objeto sobre el que se colocaran las lamapras
      this.lineaLamparas = this.lampara.getObjectByName('Anden_2');//Total_NSLZ_60 //leds
      this.calle = this.lampara.getObjectByName('Calle');//Total_NSLZ_60 //leds
      if(this.calle){
        console.log('Encontre la calle')
      }else{
        console.log('nO CALLE')
      }

      if (this.lineaLamparas) {
        console.log('se encontro el anden')
        const worldPosition = new THREE.Vector3();
        this.lineaLamparas.getWorldPosition(worldPosition);
        console.log('la posicion del anden es:', worldPosition)

        // Calcular el bounding box del andén o las dimensiones
        const boundingBox = new THREE.Box3().setFromObject(this.lineaLamparas);
        const size = new THREE.Vector3();
        boundingBox.getSize(size); // Obtener las dimensiones (ancho, alto, largo)
        console.log('Dimensiones del andén (ancho, alto, largo):', size);

        //Teniendo las dimensiones entonces puedo puedo poner los postes
        //Pero entonces debo determinar hacia donde seria la Direccion, se eentenderia que debe ser a lo largo, como se que es x,y,z

        let largoAxis = 'x'; // Por defecto, asumimos que el largo está en el eje X
        let largoValue = size.x;

        if (size.y > largoValue) {
          largoAxis = 'y';
          largoValue = size.y;
        }

        if (size.z > largoValue) {
          largoAxis = 'z';
          largoValue = size.z;
        }

        console.log('El largo está en el eje:', largoAxis);
        console.log('Valor del largo:', largoValue);

        const postSpacing = 54; // Espacio entre postes (en unidades del mundo 3D)
        const postHeight = 10; // Altura de los postes
        const postRadius = 0.1; // Radio de los postes

        // Crear postes a lo largo del eje del largo
        for (let i = 0; i < largoValue; i += postSpacing) {
          const postGeometry = new THREE.CylinderGeometry(postRadius, postRadius, postHeight, 32);
          const postMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
          const post = new THREE.Mesh(postGeometry, postMaterial);

          // Posicionar el poste según el eje del largo
          const postPosition = new THREE.Vector3().copy(worldPosition);

          if (largoAxis === 'x') {
            postPosition.x += i - largoValue / 2; // A lo largo del eje X
          } else if (largoAxis === 'y') {
            postPosition.y += i - largoValue / 2; // A lo largo del eje Y
          } else if (largoAxis === 'z') {
            postPosition.z += i - largoValue / 2; // A lo largo del eje Z
          }

          post.position.copy(postPosition);

          // Aplicar la misma rotación que el andén
          post.rotation.copy(this.lineaLamparas.rotation);

          // Agregar el poste a la escena
          this.scene.add(post);
        }

        //Ahora agrgado de las lamparas

        const grupoLamparas = new THREE.Group();
        this.scene.add(grupoLamparas);

        // Crear la lámpara base (esfera)
        const lampGeometry = new THREE.SphereGeometry(0.2, 32, 32); // Radio de la lámpara
        const lampMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);

        const direccionCalle = new THREE.Vector3(0, 0, -1); //Direccion de la calle

        // Crear lámparas clonadas y agregar luces
        for (let i = 0; i < largoValue; i += postSpacing) {
          // Clonar la lámpara
          const lamparaClon = lamp.clone();

          // Posicionar la lámpara clonada
          const lampPosition = new THREE.Vector3().copy(worldPosition);

          if (largoAxis === 'x') {
            lampPosition.x += i - largoValue / 2; // A lo largo del eje X
          } else if (largoAxis === 'y') {
            lampPosition.y += i - largoValue / 2; // A lo largo del eje Y
          } else if (largoAxis === 'z') {
            lampPosition.z += i - largoValue / 2; // A lo largo del eje Z
          }

          lampPosition.y += postHeight; // Altura de la lámpara
          console.log('altura de la lampara',lampPosition)
          lamparaClon.position.copy(lampPosition);

          // Crear la luz SpotLight para la lámpara clonada
          const spotLight = new THREE.SpotLight(0xFFF2CC);
          spotLight.power = 12000; // Intensidad de la luz
          spotLight.penumbra = 1; // Suavizado del borde de la luz
          spotLight.distance = 35; // Distancia donde se atenúa totalmente
          spotLight.angle = 140 * Math.PI / 180; // Ángulo de apertura de la luz
          spotLight.castShadow = true; // Habilitar sombras

          // Configurar el objetivo (target) de la luz
          /*     const targetObject = new THREE.Object3D();
               targetObject.position.set(i * postSpacing , 0, 0); // Ajustar según sea necesario
               spotLight.target = targetObject;
     */

          // Configurar el objetivo (target) de la luz
          const targetObject = new THREE.Object3D();
          targetObject.position.copy(lamparaClon.position).add(direccionCalle); // Apuntar hacia la calle
          spotLight.target = targetObject;

          // Configurar sombras
          spotLight.shadow.mapSize.width = 2048;
          spotLight.shadow.mapSize.height = 2048;
          spotLight.shadow.camera.near = 0.5;
          spotLight.shadow.camera.far = 500;
          spotLight.shadow.camera.fov = 30;

          // Agregar el objetivo y la luz a la escena
          this.scene.add(targetObject);
          lamparaClon.add(spotLight);

          // Agregar la lámpara clonada al grupo
          grupoLamparas.add(lamparaClon);

           // Actualizar el SpotLightHelper en cada fotograma

          /////////Finaliza lo mismo pero con las luces
        }


        //Control de movimiento
        const controlesMovimiento = new TransformControls(this.camera, this.renderer.domElement)//renderer.domElement
       // controlesMovimiento.showY = false //No muestra movimiento en Y
        controlesMovimiento.attach(grupoLamparas)
        this.scene.add(controlesMovimiento)

        controlesMovimiento.addEventListener('change', () => {

          grupoLamparas.children.forEach((lamparaClon, index) => {
            // Verificar si el clon de la lámpara tiene una luz asociada en su `userData`
            const lamparaWorldPosition = new THREE.Vector3()
            lamparaClon.getWorldPosition(lamparaWorldPosition); // Obtiene la posición en coordenadas globales
            const spotLight = lamparaClon.children.find(child => child.type === 'SpotLight') as THREE.SpotLight;
            if (spotLight) {
              const targetObject = spotLight.target;
              targetObject.position.set(lamparaWorldPosition.x, lamparaWorldPosition.y, 0); // Apuntar hacia la posicion o altura de la calle
              console.log('Posicion de la lamapra',lamparaWorldPosition, 'Target nuevo',targetObject.position)
              targetObject.updateMatrixWorld();

            } else {
              console.log(`No se encontró un SpotLight en la lámpara ${index}`);
            }

          });

          this.renderer.render(this.scene, this.camera);
          //render(); // Volver a renderizar la escena
        
        });

        controlesMovimiento.addEventListener('dragging-changed', (event) => {
          console.log('movimiento')
          this.controls.enabled = !event.value;
        });
        //Finaliza control de movimiento

      } else {
        console.log('Anden2 no encontrado')
      }
      //Finaliza prueba para situar en la scena las lamaparas






      //Añadir Hospot Y luz
      if (this.ledGroup) {
        //Determinar posicion de la luz
        const worldPosition = new THREE.Vector3();
        this.ledGroup.getWorldPosition(worldPosition);
        console.log('posicion d ela placa de leds:', worldPosition)
        //Añado la luz
        this.spotLight = this._luces.addLight(worldPosition, this.scene, lampara)
        //console.log(ledGroup.position,worldPosition)

      }


      //Asignar Carcateristicas a placa de leds
      if (this.ledGroup) {
        const ledMaterial = new THREE.MeshStandardMaterial({
          //color: 0xF8F8FB, //0xffffff,  // Color base de los LEDs
          emissive: 0XF8F8FB,//0xffff00,  // Color de la luz emitida (puedes ajustarlo a lo que desees)
          emissiveIntensity: 1,  // Intensidad de la emisión de luz
        });
        this.ledGroup.traverse((child: any) => {
          if (child.isMesh) {
            child.material = ledMaterial;  // Asignar el material emisivo a los LEDs  antes   ledMaterial /glowMaterial
          }
        });

      }


      //Asignar material a PLastico de Leds
      if (plasticoLedGroup) {
        const plasticoMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,  // Color del plástico
          transparent: true,
          opacity: 0.5,  // Ajusta la opacidad para mayor transparencia
          transmission: 0.9,  // Permite que la luz pase a través del material
          roughness: 0.1,  // Controla el acabado del plástico (más bajo es más brillante)
          metalness: 0,    // No es un material metálico
          ior: 1.5,  // Índice de refracción (simula vidrio/plástico)
        });

        plasticoLedGroup.traverse((child: any) => {
          if (child.isMesh) {
            child.material = plasticoMaterial;  // Asignar el material emisivo a los LEDs  antes   ledMaterial /glowMaterial
          }
        });

      }

    });
    // Comenzar la animación
    this.animate();

    ///////////////////////////

  }


  animate = () => {
    if (this.animando) {
      requestAnimationFrame(this.animate);
    }

    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    // Renderizar la escena
    this.renderer.render(this.scene, this.camera);
  }

  resizeRendererToDisplaySize(renderer: any) {

    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);

    }
    return needResize;

  }


//

// Solo renderizar cuando cambie la escena
//this.controls.addEventListener('change', this.renderer.render);
//controlesMovimiento.addEventListener('change', render);
//window.addEventListener('resize', render);
//requestAnimationFrame(render)
//



  onOff() {
    const infoBox = document.getElementById("info-box");
    if (infoBox) {
      infoBox.innerHTML = "Apagado automatico durante el Dia Y Encendido durante la noche";
      infoBox.style.display = 'block';
    }

    //To Do, Prender y apagar las luces
    this.lightState = !this.lightState
    // Alternar la intensidad de la luz
    const emissiveIntensity = this.lightState ? 1 : 0;  // 1 es el brillo normal, 0 es apagado

    console.log('Envio spot', this.spotLight)
    this._luces.toggleLight(this.lightState, this.spotLight)

    if (this.ledGroup) {
      this.ledGroup.traverse((child: any) => {
        if (child.isMesh) {
          child.material.emissiveIntensity = emissiveIntensity;
        }
      });
    }



    if (this.scene.fog instanceof THREE.FogExp2) {
      if (this.lightState) {
        console.log('Nocturna')
        // Noche: Luz encendida, niebla más densa y oscura
        this.scene.fog.color.set(0x111111);  // Niebla más oscura
        this.scene.fog.density = 0.02;      // Niebla más densa

      } else {

        console.log('falso pongo luz diurna')


        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 50, 0);
        this.scene.add(hemiLight);

        const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
        this.scene.add(hemiLightHelper);


        // Día: Luz apagada, niebla menos densa y más clara
        //this.scene.fog.color.set(0xcccccc);  // Niebla más clara
        //this.scene.fog.density = 0.005;      // Niebla menos densa

      }
    }


  }

  moverCamara(objeto: any) {

    const objetivo = this.lampara.getObjectByName(objeto);
    console.log('Objetivo', objeto, objetivo)
    if (objetivo) {


      const worldPosition = new THREE.Vector3();
      objetivo.getWorldPosition(worldPosition);
      this._iniciarEscenaService.moveCameraToTarget(worldPosition, 1000, this.camera, this.controls)


      if (objetivo.material && objetivo.material.emissive) {
        const originalEmissive = objetivo.material.emissive.clone();
        objetivo.material.emissive.set(0xff0000); // Rojo brillante

        // Restaurar la emisividad original después del tiempo
        setTimeout(() => {
          objetivo.material.emissive.copy(originalEmissive);
          console.log('Emsiion Original')
        }, 10000);
      } else {
        console.log('Objeto no posee Material o material Emissive')
      }

      const infoBox = document.getElementById("info-box");
      if (infoBox) {
        switch (objeto) {
          case 'placaLed':
            infoBox.innerHTML = "Flujo luminoso: 11.000 lúmenes /n Número de LEDs: 144 piezas";
            break;
          case 'Bateria':
            infoBox.innerHTML = "Batería: LiFePO4 12,8V 42Ah /n Tiempo de carga solar: 6-8 horas con luz solar brillante";
            break;
          case 'specs':
            infoBox.innerHTML = "Panel solar: Monocristalino de 75W de gran tamaño.Modos de iluminación: Tres modos diferentes. Sensor de movimiento: Integrado.Batería: Litio de gran capacidad de 692.64WH/14.8V con indicador de carga.LED: OSRAM 3030/288 pcs 12.000 lúmenes y luz neutra de 4.000K.";
            break;
          case 'general':
            infoBox.innerHTML = "Vista general del modelo";
            break;
        }
        infoBox.style.display = 'block';
      }

    } else {
      console.log('La lampara No posee un componente con este nombre', objeto)
    }

  }



  removeModel(/*scene: THREE.Scene, modelName: string*/) {
    //const model = this.scene.getObjectByName('parque');
    if (this.NombrelamparaActual != undefined) {
      const model = this.scene.getObjectByName(this.NombrelamparaActual)
      if (model) {
        this._cargarLampara.removerModelo(model, this.scene)
        /*
            console.log('modelo Encontrado')
             this.scene.remove(model); // Remover el modelo de la escena
              model.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                      child.geometry.dispose();  // Liberar memoria de la geometría
                      child.material.dispose();  // Liberar memoria del material
                  }
              }); */
      } else {
        console.log(`No se encontró el modelo: ${model}`);
      }
    }

  }


  cargarEscenario() {
    const escenario = this.escenarios[this.escenarioSeleccionado] //This.escenarioSeleccionado es el indice del escenario en el arreglo escenarios
    this._cargarLampara.cargarEscenarios(escenario.path, this.scene, escenario.nombre);
  }


//////Desde aqui inicia mostrar el producto

public slug: any


public producto= {
  titulo: 'NSL-912',
  slug: 'slug',
  galeria: [],
  portada: 'https://res.cloudinary.com/dcoq7odpu/image/upload/v1732841534/t5bgcqxeks12x0zp5yol.png',
  precio: '1290000',
  descripcion: 'Descripcion del producto',
  contenido: 'contenido del producto',
  stock: '26',
  nventas: '5',
  npuntos: '2',
  variedades: [],
  categoria: { titulo: '', slug: '', _id: '' },
  titulo_variedad: '',
  estado: 'Activo',
  _id: '123456'
}
/*
public producto= {
  titulo: '',
  slug: '',
  galeria: [],
  portada: '',
  precio: '',
  descripcion: 'Descripcion del producto',
  contenido: '',
  stock: '',
  nventas: '',
  npuntos: '',
  variedades: [],
  categoria: { titulo: '', slug: '', _id: '' },
  titulo_variedad: '',
  estado: '',
  _id: '123456'
}



*/

public token: any

//public galeria: Galeria[] = [];
public galeria= [];
//public galeria2: Galeria[] = [];
public galeria2 = [];

//public variedad_seleccionada: any
public variedad_seleccionada: any = '';//Inicialmente all public variedad_seleccionada: string = 'all';
public subvariedad_seleccionada: any[] = [] //Representa el arreglo con las caracteristicas de la subvariedad actual
public subvariedad: string = ''; //Representa el Id de la Subvariedad

public galeria_seleccionada: any
//public tamano_disponibilidad: Tamano_Disponibilidad[] = [];
public tamano_disponibilidad = [];
public carrusel: any;
public slider: any;
public carrusel2: any[] = []
public carrusel_original: any[]=[];

//public socket = io('http://localhost:4201')

//recomendados
public productosRecomendados: Array<any> = []


public sliderSelector: string = '.my-slider';
public cachedSlider: any;

public lightGallerySelector: string = '.gallery-item';

public ThumbnailsSelector: string = '.thumbnails_remove';
public cachedSliderThumbnails: any


//LightGalery
public migaleria: any
//Finaliza LightGalery

//Agregar al carrito
public carrito_data: any = {
  variedad: '',
  cantidad: 1,
  subvariedad: ''
}
public btn_cart = false




agregar_producto_carrito() {
/*
  this.carrito_data.variedad = this.variedad_seleccionada;
  this.carrito_data.subvariedad = this.subvariedad;

  if (this.carrito_data.variedad != '' && this.carrito_data.variedad != 'all' && this.carrito_data.subvariedad != '') {

    if (this.carrito_data.cantidad <= this.producto.stock) {

      let clienteID: any;
      let token = localStorage.getItem('token');  // Verificamos si hay un token

      var data: any = {}

      if (token) {
        // Cliente autenticado
        clienteID = localStorage.getItem('identity');

        data.producto = this.producto._id
        data.cliente = clienteID,  // Usar clienteID (identity o cartID)
          data.cantidad = this.carrito_data.cantidad,
          data.variedad = this.variedad_seleccionada,
          data.subvariedad = this.subvariedad,
          data.precio = this.producto.precio


      } else {
        // Cliente no autenticado: Generar un cartID
        clienteID = localStorage.getItem('cartID'); //Mire si existe un cartID y traelo
        if (!clienteID) {
          clienteID = this._clienteService.generateCartID();  // Generar un nuevo cartID si clienteID es null
        
          localStorage.setItem('cartID', clienteID);
       
          data.producto = this.producto._id
          data.cliente_no_autenticado = clienteID,  // Usar clienteID (identity o cartID)
            data.cantidad = this.carrito_data.cantidad,
            data.variedad = this.variedad_seleccionada,
            data.subvariedad = this.subvariedad,
            data.precio = this.producto.precio

        } else {
 
          data.producto = this.producto._id
          data.cliente_no_autenticado = clienteID,  // Usar clienteID (identity o cartID)
            data.cantidad = this.carrito_data.cantidad,
            data.variedad = this.variedad_seleccionada,
            data.subvariedad = this.subvariedad,
            data.precio = this.producto.precio
        }
      }

      this.btn_cart = true;

      this._clienteService.agregar_carrito_cliente(data, token).subscribe(
        response => {
          if (response.data == undefined) {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: 'El producto ya se encuentra en el carrito'
            });
            this.btn_cart = false;
          } else {
            iziToast.show({
              title: ' ¡Genial! ',
              titleColor: 'green',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Producto agregado al carrito'
            });
            this.socket.emit('add-carrito-add', { data: true });
            this.btn_cart = false;
          }
        }
      );
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'La cantidad seleccionada excede el Stock Disponible' + this.producto.stock
      });
    }
  } else {
    iziToast.show({
      title: 'ERROR',
      titleColor: '#FF0000',
      color: '#FFF',
      class: 'text-danger',
      position: 'topRight',
      message: 'Seleccione una variedad'
    });
  }
  */
}


ngOnDestroy(): void {
  // Destruye el slider al destruir el componente
  if (this.slider) {
    this.slider.destroy();
  }
}

initCache() {

  const $body = $('body');
  this.cachedSlider = $body.find(this.sliderSelector)[0].cloneNode(true);
  this.cachedSliderThumbnails = $body.find(this.ThumbnailsSelector)[0].cloneNode(true);

}

initSlider() {

  this.slider = tns({
    container: this.sliderSelector,
    controlsText: ['<i class="ci-arrow-left"></i>', '<i class="ci-arrow-right"></i>'],
    navPosition: "top",
    controlsPosition: "top",
    mouseDrag: !0,
    speed: 600,
    autoplayHoverPause: !0,
    autoplayButtonOutput: !1,
    navContainer: "#tns-thumbnails2",
    navAsThumbnails: true,
    gutter: 15,
  });

}

iniciarLightGalery() {
  var e = document.querySelectorAll(".gallery");
  if (e.length) {
    for (var t = 0; t < e.length; t++) {
      lightGallery(e[t], {
        selector: this.lightGallerySelector,
        download: false,
      });
    }
  } else {
    //console.log('No se encontraron elementos con la clase .gallery');
  }

}

filter() {
  // Reinicia carrusel2 al estado original
  this.carrusel2 = [...this.carrusel_original]; // Usa un nuevo array para evitar referencias directas

  // Filtra solo si la variedad seleccionada no es "all"
  if (this.variedad_seleccionada !== "all") {
    this.carrusel2 = this.carrusel2.filter(item => item.variedad === this.variedad_seleccionada);
  }

  //console.log(this.variedad_seleccionada, this.carrusel2, this.carrusel_original);
}

filter1() {
  var filterValue = this.variedad_seleccionada
  //Llenar arreglo de subvariedades de acuerdo a la variedad seleccionada

  const selectedVariety = this.producto.variedades.find((v: { _id: any; }) => v._id === this.variedad_seleccionada);


  if (selectedVariety) {
    //this.subvariedad_seleccionada = selectedVariety.tamano_disponibilidad;
    //this.subvariedad = selectedVariety.tamano_disponibilidad[0]._id
    //this.producto.precio = selectedVariety.tamano_disponibilidad[0].precio
    //this.producto.stock = selectedVariety.tamano_disponibilidad[0].disponibilidad

  } else {
    this.subvariedad_seleccionada = [];
  }

  if (this.slider) {
    this.slider.destroy();
  }

  const $sliderContainer = $(this.sliderSelector);
  const $thumbnailsContainer = $(this.ThumbnailsSelector)

  $sliderContainer.html(this.cachedSlider.innerHTML);
  $thumbnailsContainer.html(this.cachedSliderThumbnails.innerHTML);

  if (filterValue !== 'all') {

    $sliderContainer.find('[data-type]').not(`[data-type*=${filterValue}]`).remove();
    $thumbnailsContainer.find('[data-type]').not(`[data-type*=${filterValue}]`).remove();

  }

  this.initSlider();
  this.iniciarLightGalery()
 // this.cdr.detectChanges();

}



filter_subvariedad(subvariedad: any) {

  const subvariedadSeleccionada = this.subvariedad_seleccionada.find(s => s._id === subvariedad);

  if (subvariedadSeleccionada) {
    this.producto.precio = subvariedadSeleccionada.precio;
    this.producto.stock = subvariedadSeleccionada.disponibilidad
  } else {
    // En caso de que no se encuentre la subvariedad, puedes asignar un valor por defecto o manejarlo como prefieras
    this.producto.precio = ''; // O algún valor por defecto
  }

}

///Finalizamos 3 Carrusel

getCloudinaryImageUrl(imageUrl: string, width: number, height: number, crop: string = 'fill'): string {
  // Verifica que la URL esté configurada para admitir transformaciones de Cloudinary
  return imageUrl.replace('/upload/', `/upload/c_${crop},w_${width},h_${height}/`);
}


}

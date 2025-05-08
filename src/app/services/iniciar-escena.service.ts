import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { EXRLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import {Tween, Easing } from '@tweenjs/tween.js'

@Injectable({
  providedIn: 'root'
})
export class IniciarEscenaService {
  constructor() { }


  initScene_version1(canvas: HTMLCanvasElement) {
    const scene = new THREE.Scene();

    //scene.background= new THREE.Color(0x000000) //Color de fondo negro
    //scene.background = new THREE.Color('rgb(179, 209, 255)');// Color de scena azul claro
    scene.background = new THREE.Color(0x02021d) //Color de fondo negro 

    const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
    hemiLight.position.set(0, 1, 0); // Simula luz del cielo y el suelo
    scene.add(hemiLight);
    scene.fog = new THREE.Fog(0x02021d, 20, 100); // Niebla negra desde 10 a 100 unidades 0x000000
    //scene.fog = new THREE.FogExp2(0x02021d, 0.01); // Niebla negra desde 10 a 100 unidades 0x000000

    const fov = 20//Para hdr 60; //45
    const aspect = canvas.width / canvas.height;; // the canvas default
    const near = 0.1;
    const far = 100; //100

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 1, -10);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    //renderer.toneMapping=THREE.ReinhardToneMapping
    //renderer.toneMappingExposure=2.3

    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Mejora la iluminación con el mapeo de tonos
    renderer.toneMappingExposure = 2;

//Incluir los ejes en la escena
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    return { scene, camera, renderer };
  }


  moveCameraToTarget(targetPosition: THREE.Vector3, duration: number, camera: THREE.Camera,controls:OrbitControls) {
    const startPosition = camera.position.clone();
    const startLookAt = camera.getWorldDirection(new THREE.Vector3());  // Solo si es necesario animar el 'lookAt'

    // Inicializar el tween para animar la cámara
    const tween = new Tween(startPosition)
        .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, duration)
        .onUpdate(() => {
            // Actualizar la posición de la cámara en cada frame
            camera.position.set(startPosition.x-1, startPosition.y-1, startPosition.z-1);
            camera.lookAt(targetPosition);  // Mantener la cámara enfocando el objeto
        })
        .onComplete(() => {
          controls.target.copy(targetPosition);  // Sincronizamos el objetivo
          controls.update();  // Actualizamos los controles
      })
        .start();

    // Actualizar la interpolación en cada frame
    function animate() {
        requestAnimationFrame(animate);
        tween.update();  // Esto es importante para que TWEEN.js haga la animación
    }

    animate();  // Iniciar la animación del tween
}

moveCameraToTarget2222(targetPosition: THREE.Vector3, duration: number, camera: THREE.Camera,controls:OrbitControls) {
  const startPosition = camera.position.clone();
  const  minDistance = 5
  const direction = new THREE.Vector3().subVectors(targetPosition, camera.position).normalize();
  const targetWithOffset = targetPosition.clone().add(direction.multiplyScalar(minDistance));

  const tween = new Tween(startPosition)
      .to({ x: targetWithOffset.x, y: targetWithOffset.y, z: targetWithOffset.z }, duration)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
          camera.position.set(startPosition.x, startPosition.y, startPosition.z);
          camera.lookAt(targetPosition);
      })
      .onComplete(() => {
          controls.target.copy(targetPosition);  // Sincronizamos el objetivo
          controls.update();  // Actualizamos los controles
      })
      .start();
      function animate() {
        requestAnimationFrame(animate);
        tween.update();  // Esto es importante para que TWEEN.js haga la animación
    }

    animate(); 
}

initScene_1(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene();
/*
  // Fondo HDRI para ambiente nocturno
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    '../assets/img/cubeMapping/HornstullsStrand/negz.jpg',//'path/to/night_right.jpg',
    '../assets/img/cubeMapping/HornstullsStrand/posz.jpg',//'path/to/night_left.jpg',
    '../assets/img/cubeMapping/HornstullsStrand/posy.jpg',//'path/to/night_top.jpg', 
    '../assets/img/cubeMapping/HornstullsStrand/negy.jpg',//'path/to/night_bottom.jpg',
    '../assets/img/cubeMapping/HornstullsStrand/negx.jpg',//'path/to/night_front.jpg',
    '../assets/img/cubeMapping/HornstullsStrand/posx.jpg',//'path/to/night_back.jpg',
  ]);
  scene.background = texture;
*/
  // Luz ambiental tenue
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Luz suave
  scene.add(ambientLight);

  // Luz direccional como luz de luna
  const moonLight = new THREE.DirectionalLight(0xb3e5fc, 1.5); // Luz fría
  moonLight.position.set(5, 10, -5);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.width = 1024;
  moonLight.shadow.mapSize.height = 1024;
  scene.add(moonLight);

  // Luz puntual para simular una lámpara
  const lampLight = new THREE.PointLight(0xffaa33, 2, 50);
  lampLight.position.set(0, 5, 0);
  lampLight.castShadow = true;
  scene.add(lampLight);

  // Niebla para dar profundidad a la escena nocturna
  //scene.fog = new THREE.Fog(0x02021d, 10, 50); //<--------------   Quitar o poner niebla a toda la escena

  // Configuración de la cámara
  const fov = 45;
  const aspect = canvas.width / canvas.height;
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 5, -20);

  // Configuración del renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  renderer.shadowMap.enabled = true;
/*
  // Material de prueba para objetos
  const material = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const planeGeometry = new THREE.PlaneGeometry(100, 100);
  const plane = new THREE.Mesh(planeGeometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);

  // Ejemplo de objeto en la escena
  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
  const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff5722 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0, 1, 0);
  sphere.castShadow = true;
  scene.add(sphere);
*/
  return { scene, camera, renderer };
}


initScene(canvas: HTMLCanvasElement) {
 const scene = new THREE.Scene();
   scene.fog = new THREE.Fog(0x000000, 10, 100); // Niebla
  


//Inicia prueba

//Finaliza Prueba










   // Luz ambiental
  const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
  scene.add(ambientLight);

  // Luz de la luna
  const moonLight = new THREE.DirectionalLight(0xb3e5fc, 5);
  moonLight.position.set(10, 20, -10);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.width = 2048;
  moonLight.shadow.mapSize.height = 2048;
  scene.add(moonLight);

  // Luz de la lámpara
 /* const lampLight = new THREE.PointLight(0xffaa33, 2, 20);
  lampLight.position.set(0, 5, 0);
  lampLight.castShadow = true;
  scene.add(lampLight);
*/
  // Suelo
 /* const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.position.y=-3
  scene.add(ground);
  */

  // Cámara
/*
  const fov = 45;
  const aspect = canvas.width / canvas.height;
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 5, -20);
*/

const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
camera.position.x = - 4;
camera.position.z = 4;
camera.position.y = 2;


  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  return { scene, camera, renderer };
}


}

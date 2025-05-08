import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class LucesService {
  public currentLight: any
  constructor() { }
  //TODO Ver si hay luces agregadas y eliminarlas
  addLight1(position: THREE.Vector3, scene: THREE.Scene) {//intensity: number, distance: number, color: number

    const spotLight = new THREE.SpotLight(0xfff5e5);//0xffffff  //0xefeff1
    // const light = new THREE.PointLight(color, intensity, distance);
    spotLight.position.copy(position);
    //this.lights.push(light);
    spotLight.power = 5000;
    // spotLight.angle = THREE.MathUtils.degToRad(140);
    spotLight.penumbra = 1
    spotLight.distance = 10 ///Distancia donde se atenua totalmente      
    spotLight.angle = 70 * Math.PI / 180
    spotLight.castShadow = true

    const spotLightHelper = new THREE.SpotLightHelper(spotLight)
    scene.add(spotLightHelper)

    scene.add(spotLight);
    return (spotLight)
  }

  addLight(position: THREE.Vector3, scene: THREE.Scene, lampara: any) {
    console.log('lampara recibida en luces, ', lampara.nombre)
    // Propiedad para rastrear la luz actual
    if (this.currentLight) {
      // Eliminar la luz existente de la escena
      scene.remove(this.currentLight);
      this.currentLight.dispose(); // Liberar recursos
      this.currentLight = null;
    }

    // Crear nueva luz
    const spotLight = new THREE.SpotLight(lampara.color);//0xfff5e5
    spotLight.position.copy(position);
    spotLight.power = lampara.lumens;
    spotLight.penumbra = lampara.penumbra;
    spotLight.distance = 0// lampara.distancia; // Distancia donde se atenua totalmente
    spotLight.angle = lampara.anguloApertura * Math.PI / 180;
    spotLight.castShadow = true;

    // Opcional: Añadir helper muestra las lineas del cubrimiento de la luz
    /*const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);*/

    //Iniciar añadir target a luz

    //Calcular valores para x
    var anguloFaltante = 0
    var opuesto = 0
    var hipotenusa = 0
    var interceptoX = 0

    if (lampara.anguloInclinacion == 0 || lampara.anguloInclinacion >= 90) {
      if (position.x < 0) {
        interceptoX = position.x + 15
      } if (position.x >= 0) {
        interceptoX = position.x - 15
      }

    } else {
      anguloFaltante = (Math.PI / 180) * (90 - lampara.anguloInclinacion)
      opuesto = position.y
      hipotenusa = opuesto / Math.sin(anguloFaltante)
      var adyacente = hipotenusa * Math.cos(anguloFaltante)
      console.log('la posicion de x seria', anguloFaltante, opuesto, hipotenusa, adyacente, Math.sin(anguloFaltante), Math.cos(anguloFaltante))

      if (position.x < 0) {
        interceptoX = position.x + adyacente
      } if (position.x >= 0) {
        interceptoX = position.x - adyacente
      }
    }

    const targetObject = new THREE.Object3D()
    //targetObject.position.set(position.x-5,0,0)//x,y,z versioninicial sin calcular el interceptoX
    targetObject.position.set(interceptoX, 0, 0)
    scene.add(targetObject)
    spotLight.target = targetObject
    spotLight.target.updateMatrixWorld();
    //spotLightHelper.update(); actualiza el spotlight helper
    //Finaliza añadir target a la luz

    // Añadir la luz a la escena
    scene.add(spotLight);

    // Guardar la referencia de la luz actual
    this.currentLight = spotLight;

    return spotLight;
  }

  toggleLight(state: boolean, spotLight: THREE.SpotLight) {
    if (spotLight) {
      spotLight.visible = state; // Apagar si state es false, encender si es true


      
    }
  }

}

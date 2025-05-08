import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


@Injectable({
  providedIn: 'root'
})
export class CargarlamparaService {

  constructor() { }


  loadModel(luminaria: any, scene: THREE.Scene, nombre_lampara_actual: any): Promise<THREE.Group> {
    console.log('Lampara a cargar',luminaria)
    return new Promise((resolve, reject) => {

      if (nombre_lampara_actual != undefined) {
        const model = scene.getObjectByName(nombre_lampara_actual);
        console.log('Modelo actual', model, nombre_lampara_actual)
        if (model) {
          //Primero Remover el modelo
          this.removerModelo(model, scene)
        }
      }else{
        console.log('DIFERENTE D EUNDEFINED',nombre_lampara_actual)
      }

      const lamparaLoader = new GLTFLoader()
      lamparaLoader.load(luminaria.path, (gltf) => {
        const lampara = gltf.scene;
        console.log('Asignar el nombre', luminaria.nombre)
        if (luminaria.nombre != undefined) {
          lampara.name = luminaria.nombre;
        } else {
          lampara.name = 'noName'
        }

        scene.add(lampara)
        // console.log('Posicion',lampara,lampara.position)
        resolve(lampara);
      }, undefined, (error) => {
        console.error('Error al cargar el modelo:', error);
        reject(error);  // Manejar errores
      });
    });
  }


  cargarEscenarios(path: string, scene: THREE.Scene, nombre_escenario: string) {
    //1) Validar si existen escenarios
    //Si existen scenarios se debe remover
    console.log('El nombre del escenario es', nombre_escenario)
    const model = scene.getObjectByName('parque');
    if (model) {
      //Primero Remover el modelo
      this.removerModelo(model, scene)

    }
    //Cargar Modelo
    const escenarioLoader = new GLTFLoader()
    escenarioLoader.load(path, (gltf) => {

      const escenario = gltf.scene;
      escenario.name = 'parque';
      escenario.position.set(0, 1, 0);
      scene.add(escenario)
    });

  }

  removerModelo(model: THREE.Object3D, scene: THREE.Scene) {
    scene.remove(model); // Remover el modelo de la escena
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();  // Liberar memoria de la geometría
        child.material.dispose();  // Liberar memoria del material
      }
    });

  }




}

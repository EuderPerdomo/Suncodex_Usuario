
// ModelLoader.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
/*
export class ModelLoader {
    loader: GLTFLoader;

    constructor() {
        this.loader = new GLTFLoader();
    }

    // Método para cargar el modelo
    loadModel(modelPath: string, scene: THREE.Scene) {
        this.loader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;
                //model.scale.set(0.3, 0.3, 0.3) //Ajusta la escala en orcentaje del modelo original
                model.position.set(0, 1, 0)
                scene.add(model);
                return model// Agregue esta parte para tenerlo fuera
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }

}

*/
export class ModelLoader {
    loader: GLTFLoader;
  
    constructor() {
      this.loader = new GLTFLoader();
    }

    loadModel(path: string, scene: THREE.Scene): Promise<THREE.Group> {
      return new Promise((resolve, reject) => {
        this.loader.load(path, (gltf) => {
          const model = gltf.scene;
          scene.add(model);  // Agregar el modelo a la escena
         // model.scale.set(0.3, 0.3, 0.3);  // Escalar el modelo
        //model.position.set(-1, 4, 1)
        model.rotation.y=THREE.MathUtils.degToRad(90)
          resolve(model);  // Devolver el modelo cargado
        }, undefined, (error) => {
          console.error('Error al cargar el modelo:', error);
          reject(error);  // Manejar errores
        });
      });
    }
  }
  
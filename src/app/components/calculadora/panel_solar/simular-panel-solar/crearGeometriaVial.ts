/*
import * as THREE from 'three';
export class GeometriaVial {

  constructor() {
    
  }

  crearVia(
    altoCaminoPeatonal: number,
    anchoCaminoPeatonal: number,
    anchoCalzada: number,
    cantidadCarriles: number,
    arcenCentral: boolean,
    anchoArcenCentral: 1,
    scene: THREE.Scene
  ): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      const ancho_base = anchoCaminoPeatonal * 2 + anchoCalzada
      const base = new THREE.BoxGeometry(ancho_base, 0.5, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const via = new THREE.Mesh(base, material);
      scene.add(via);
      via.position.set(0, 0, 0)
    });
  }
}
*/

import * as THREE from 'three';

export class GeometriaVial {
  constructor() {}

  crearVia(
    altoCaminoPeatonal: number,
    anchoCaminoPeatonal: number,
    anchoCalzada: number,
    cantidadCarriles: number,
    arcenCentral: boolean,
    anchoArcenCentral: number,
    scene: THREE.Scene
  ): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      try {
        const viaGroup = new THREE.Group();
        const largoVia=100

        // Calcular el ancho total de la vía
        const anchoTotal = anchoCaminoPeatonal * 2 + anchoCalzada;

        // Crear la base de la calzada
        const baseGeometry = new THREE.BoxGeometry(anchoTotal, 0.1, largoVia);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x424242 });//meshBasicMaterial
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        baseMesh.position.set(0, 0, 0);
        viaGroup.add(baseMesh);

        // Crear caminos peatonales
        const caminoGeometry = new THREE.BoxGeometry(anchoCaminoPeatonal, altoCaminoPeatonal, largoVia);
        const caminoMaterial = new THREE.MeshStandardMaterial({ color: 0x767771 });

        const caminoIzquierdo = new THREE.Mesh(caminoGeometry, caminoMaterial);
        caminoIzquierdo.position.set(-(anchoCalzada / 2 + anchoCaminoPeatonal / 2), altoCaminoPeatonal / 2, 0);
        viaGroup.add(caminoIzquierdo);

        const caminoDerecho = new THREE.Mesh(caminoGeometry, caminoMaterial);
        caminoDerecho.position.set(anchoCalzada / 2 + anchoCaminoPeatonal / 2, altoCaminoPeatonal / 2, 0);
        viaGroup.add(caminoDerecho);

        // Si hay arcen central, agregarlo
        if (arcenCentral) {
          const arcenGeometry = new THREE.BoxGeometry(anchoArcenCentral, 0.3, largoVia);
          const arcenMaterial = new THREE.MeshStandardMaterial({ color: 0x05780E });
          const arcenMesh = new THREE.Mesh(arcenGeometry, arcenMaterial);
          arcenMesh.position.set(0, 0.3 / 2, 0);
          viaGroup.add(arcenMesh);
        }

        // Añadir el grupo a la escena
        scene.add(viaGroup);

        // Resolver la promesa con el objeto "via"
        resolve(viaGroup);
      } catch (error) {
        reject(`Error al crear la geometría vial: ${error}`);
      }
    });
  }
}

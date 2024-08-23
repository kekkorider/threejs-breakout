import { Vector3 } from 'three'

import { physics } from './simulation'

export class Floor {
  constructor(mesh) {
    this.mesh = mesh

    this.#init()
  }

  #init() {
    const { RAPIER, world } = physics

    this.mesh.geometry.computeBoundingBox()
    const meshSize = new Vector3()
    this.mesh.geometry.boundingBox.getSize(meshSize)
    meshSize.multiplyScalar(0.5)

    const colliderDesc = RAPIER.ColliderDesc.cuboid(meshSize.x, meshSize.y, meshSize.z)

    {
      // Match position of mesh
      const { x, y, z } = this.mesh.position
      colliderDesc.setTranslation(x, y, z)
    }

    {
      // Match rotation of mesh
      const { x, y, z, w } = this.mesh.quaternion
      colliderDesc.setRotation({ w, x, y, z })
    }

    world.createCollider(colliderDesc)
  }
}

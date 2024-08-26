import { Vector3 } from 'three'

import { physics } from './simulation'

export class Box {
  constructor(mesh) {
    this.mesh = mesh
    this.body = null

    this.#init()
  }

  #init() {
    const { RAPIER, world } = physics

    this.mesh.geometry.computeBoundingBox()
    const meshSize = new Vector3()
    this.mesh.geometry.boundingBox.getSize(meshSize)
    meshSize.multiplyScalar(0.5)

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    this.rigidBody = world.createRigidBody(bodyDesc)

    this.rigidBody.setEnabledTranslations(1, 0, 1)
    this.rigidBody.lockRotations(true, true)

    this.rigidBody.userData = {}
    Object.assign(this.rigidBody.userData, {
      meshUUID: this.mesh.uuid,
      mesh: this.mesh
    })

    const colliderDesc = RAPIER.ColliderDesc.cuboid(meshSize.x, meshSize.y, meshSize.z)

    colliderDesc.setFriction(0)
    colliderDesc.setRestitution(1)

    {
      // Match position of mesh
      const { x, y, z } = this.mesh.position
      this.rigidBody.setTranslation({ x, y, z })
    }

    {
      // Match rotation of mesh
      const { x, y, z, w } = this.mesh.quaternion
      this.rigidBody.setRotation({ w, x, y, z })
    }

    world.createCollider(colliderDesc, this.rigidBody)
  }
}

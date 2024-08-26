import { Vector3 } from 'three'

import { physics } from './simulation'

export class Player {
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

    const bodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased()
    this.body = world.createRigidBody(bodyDesc)

    this.body.userData = {}
    Object.assign(this.body.userData, {
      meshUUID: this.mesh.uuid,
      mesh: this.mesh
    })

    this.body.setEnabledTranslations(true, false, false)

    {
      // Match position of mesh
      const { x, y, z } = this.mesh.position
      this.body.setTranslation({ x, y, z })
    }

    {
      // Match rotation of mesh
      const { x, y, z, w } = this.mesh.quaternion
      this.body.setRotation({ w, x, y, z })
    }

    const colliderDesc = RAPIER.ColliderDesc.cuboid(meshSize.x, meshSize.y, meshSize.z)
    colliderDesc.setFriction(0)
    colliderDesc.setRestitution(1)
    // colliderDesc.setRestitutionCombineRule(3)

    world.createCollider(colliderDesc, this.body)
  }
}

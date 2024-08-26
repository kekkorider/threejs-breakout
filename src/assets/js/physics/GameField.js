import { physics } from './simulation'

export class GameField {
  constructor(mesh) {
    this.mesh = mesh

    this.#init()
  }

  #init() {
    const { RAPIER, world } = physics

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
    const rigidBody = world.createRigidBody(bodyDesc)

    rigidBody.setGravityScale(0)
    rigidBody.lockTranslations(true, true)
    rigidBody.lockRotations(true, true)

    rigidBody.userData = {}
    Object.assign(rigidBody.userData, {
      meshUUID: this.mesh.uuid,
      mesh: this.mesh
    })

    const vertices = this.mesh.geometry.getAttribute('position').array
    const colliderDesc = RAPIER.ColliderDesc.convexHull(vertices)

    colliderDesc.setFriction(0)
    colliderDesc.setRestitution(1)
    // colliderDesc.setRestitutionCombineRule(3)

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

    world.createCollider(colliderDesc, rigidBody)
  }
}

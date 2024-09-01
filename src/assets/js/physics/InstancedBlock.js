import { Vector3, Quaternion, Matrix4 } from 'three'

import { physics } from './simulation'

export class InstancedBlock {
  constructor(mesh) {
    this.mesh = mesh
    this.bodies = new Array(mesh.count)

    this.#init()
  }

  #init() {
    const { RAPIER, world } = physics

    this.mesh.geometry.computeBoundingBox()
    const meshSize = new Vector3()
    this.mesh.geometry.boundingBox.getSize(meshSize)
    meshSize.multiplyScalar(0.5)

    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()

    const { count } = this.mesh
    const instanceMatrix = new Matrix4()
    const position = new Vector3()
    const quaternion = new Quaternion()
    const scale = new Vector3()
    let current

    for (current = 0; current < count; current++) {
      const rigidBody = world.createRigidBody(bodyDesc)

      rigidBody.userData = {}
      Object.assign(rigidBody.userData, {
        meshUUID: this.mesh.uuid,
        mesh: this.mesh,
        isInstancedMesh: true,
        instanceIndex: current
      })
      this.mesh.getMatrixAt(current, instanceMatrix)

      instanceMatrix.decompose(position, quaternion, scale)

      rigidBody.setTranslation(position)

      rigidBody.setEnabledTranslations(1, 0, 1)
      rigidBody.lockRotations(true, true)

      const colliderDesc = RAPIER.ColliderDesc.cuboid(meshSize.x, meshSize.y, meshSize.z)
      colliderDesc.setFriction(0)
      colliderDesc.setRestitution(1)

      this.bodies[current] = rigidBody
      world.createCollider(colliderDesc, rigidBody)
    }
  }
}

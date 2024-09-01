import { Vector3, Matrix4, Quaternion } from 'three'

export class Physics {
  constructor() {}

  async init() {
    this.positionVector = new Vector3()
    this.rotationQuaternion = new Quaternion()
    this.scaleVector = new Vector3(1, 1, 1)
    this.instanceMatrix = new Matrix4()

    this.RAPIER = await import('@dimforge/rapier3d')
    this.#createWorld()
  }

  update() {
    this.world.step()

    let i
    for (i = 0; i < this.world.bodies.map.data.length; i++) {
      const body = this.world.bodies.map.data[i]
      const { mesh } = body.userData

      const pos = body.translation()
      const rot = body.rotation()

      if (body.userData.isInstancedMesh) {
        this.rotationQuaternion.copy(rot)

        this.instanceMatrix.compose(pos, this.rotationQuaternion, this.scaleVector)
        mesh.setMatrixAt(body.userData.instanceIndex, this.instanceMatrix)

        mesh.instanceMatrix.needsUpdate = true
      } else {
        mesh.position.copy(pos)
        mesh.quaternion.copy(rot)
      }
    }
  }

  getBodyByUUID(uuid) {
    return this.world.bodies.map.data.find(
			item => item.userData?.meshUUID === uuid
		)
  }

  #createWorld() {
    const gravity = { x: 0, y: 0, z: 0 }
    this.world = new this.RAPIER.World(gravity)
  }
}

export const physics = new Physics()

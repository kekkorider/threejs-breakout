export class Physics {
  constructor() {}

  async init() {
    this.RAPIER = await import('@dimforge/rapier3d')
    this.#createWorld()
  }

  update() {
    this.world.step()

    let i
    for (i = 0; i < this.world.bodies.map.data.length; i++) {
      const body = this.world.bodies.map.data[i]
      const pos = body.translation()
      const rot = body.rotation()
      const { mesh } = body.userData

      mesh.position.copy(pos)
      mesh.quaternion.copy(rot)
    }
  }

  getBodyByUUID(uuid) {
    return this.world.bodies.map.data.find(
			item => item.userData?.meshUUID === uuid
		)
  }

  #createWorld() {
    const gravity = { x: 0, y: -9.81, z: 0 }
    this.world = new this.RAPIER.World(gravity)
  }
}

export const physics = new Physics()

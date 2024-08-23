import { Float32BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'
import { physics } from './simulation'

export class Debug {
  #mesh = null

  constructor(scene) {
    this.scene = scene
    this.enabled = true

    this.#mesh = new LineSegments(
      new BufferGeometry(),
      new LineBasicMaterial({ color: 0xff0000 })
    )
    this.#mesh.frustumCulled = false
    this.scene.add(this.#mesh)
  }

  update() {
    if (this.enabled) {
      const { vertices, colors } = physics.world.debugRender()

      if (this.#mesh.geometry.hasAttribute('position')) {
        const { count } = this.#mesh.geometry.attributes.position

        let i
        for (i = 0; i < count; i++) {
          this.#mesh.geometry.attributes.position.setXYZ(i, vertices[i * 3 + 0], vertices[i * 3 + 1], vertices[i * 3 + 2])
        }

        this.#mesh.geometry.attributes.position.needsUpdate = true
      } else {
        this.#mesh.geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
        this.#mesh.geometry.setAttribute('color', new Float32BufferAttribute(colors, 4))
      }

      this.#mesh.visible = true
    } else {
      this.#mesh.visible = false
    }
  }
}

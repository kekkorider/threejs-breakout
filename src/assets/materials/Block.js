import { MeshBasicNodeMaterial, positionWorld, uv, vec4, Fn, sin, remap } from 'three/tsl'

export const blockMaterial = new MeshBasicNodeMaterial()

blockMaterial.colorNode = Fn(() => {
  return vec4(uv(), remap(sin(positionWorld.z.mul(6)), -1, 1, 0.2, 1), 1)
})()

import { MeshBasicNodeMaterial, color, uv, tslFn, abs, rotateUV, timerLocal } from 'three/tsl'

export const playerMaterial = new MeshBasicNodeMaterial()

const time = timerLocal(2)

playerMaterial.colorNode = tslFn(() => {
  const centered = abs(uv().mul(4).sub(2))
  return color(rotateUV(centered, time, true), 0.5)
})()

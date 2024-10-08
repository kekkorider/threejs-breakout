import { MeshBasicNodeMaterial, color, uv, Fn, abs, rotateUV, timerLocal, uniform } from 'three/tsl'

export const timeScale = uniform(4)

export const playerMaterial = new MeshBasicNodeMaterial()

const time = timerLocal().mul(timeScale)

playerMaterial.colorNode = Fn(() => {
  const centered = abs(uv().mul(4).sub(2))
  return color(rotateUV(centered, time, true), 0.5)
})()

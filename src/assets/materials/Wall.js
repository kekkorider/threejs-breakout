import { MeshBasicNodeMaterial, Fn, vec3, vec4, normalLocal, dot, uv } from 'three/tsl'

export const wallMaterial = new MeshBasicNodeMaterial()

wallMaterial.colorNode = Fn(() => {
  const dotProduct = dot(normalLocal, vec3(0, 1, 0))
  const col = vec3(dotProduct).add(vec3(uv(), 1.0)).mul(uv().y)
  return vec4(col, 1)
})()

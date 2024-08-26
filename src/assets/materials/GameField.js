import { MeshBasicNodeMaterial, tslFn, vec3, vec4, normalLocal, dot, uv } from 'three/tsl'

export const gameFieldMaterial = new MeshBasicNodeMaterial()

gameFieldMaterial.colorNode = tslFn(() => {
  const dotProduct = dot(normalLocal, vec3(0, 1, 0))
  const col = vec3(dotProduct).add(vec3(uv(), 1.0)).mul(uv().y)
  return vec4(col, 1)
})()

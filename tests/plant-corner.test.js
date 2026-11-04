import test from 'node:test'
import assert from 'node:assert/strict'
import { products } from '../src/modules/catalog/catalog.data.ts'
import {
  getCornerPlants,
  clampRotation,
} from '../src/modules/plant-corner/plant-corner.logic.ts'
import {
  buildCornerWorld,
  configureCornerCamera,
} from '../src/modules/plant-corner/plant-corner.scene.ts'
import { Box3, OrthographicCamera, Vector3 } from 'three'

test('corner selects actual catalog plants, substituting ZZ when rubber plant is absent', () => {
  const options = getCornerPlants(products)
  assert.equal(options.length, 3)
  assert.deepEqual(
    new Set(options.map((option) => option.kind)),
    new Set(['monstera', 'snake', 'zz']),
  )
  for (const { product } of options) assert.ok(products.includes(product))
  assert.deepEqual(
    getCornerPlants(
      products.filter((product) => product.category === 'accessories'),
    ),
    [],
  )
  assert.equal(
    getCornerPlants(products.slice(0, 1))[0].product.id,
    products[0].id,
  )
})

test('rotation stays bounded and non-finite rotation resets safely', () => {
  assert.equal(clampRotation(100), 22)
  assert.equal(clampRotation(-100), -22)
  assert.equal(clampRotation(8), 8)
  assert.equal(clampRotation(NaN), 0)
})

test('procedural room updates plant, matte pot, both walls and visual scale and disposes geometry', () => {
  const world = buildCornerWorld()
  const settings = {
    productId: products[0].id,
    pot: 'ivory',
    wall: 'ivory',
    size: 'medium',
    rotation: 0,
  }
  world.update(settings, 'monstera')
  const originalPlant = world.plant.children[0]
  let disposed = 0
  originalPlant.traverse((object) =>
    object.geometry?.addEventListener('dispose', () => disposed++),
  )
  world.update(
    { ...settings, pot: 'terracotta', wall: 'sage', size: 'large' },
    'snake',
  )
  assert.notEqual(world.plant.children[0], originalPlant)
  assert.ok(disposed > 0)
  assert.equal(world.potMaterial.color.getHexString(), 'b87958')
  assert.ok(world.potMaterial.roughness >= 0.8)
  assert.ok(
    world.wallMaterials.every(
      (material) => material.color.getHexString() === 'dce4d2',
    ),
  )
  assert.equal(world.plant.scale.x, 1.18)
  for (const name of ['floor', 'wall-left', 'wall-back', 'rug', 'side-table'])
    assert.ok(world.scene.getObjectByName(name))
  for (const kind of ['monstera', 'snake', 'zz', 'rubber']) {
    world.update(settings, kind)
    assert.ok(world.plant.getObjectByName('foliage'))
  }
  world.dispose()
  world.dispose()
})

test('room stays in frame at mobile/desktop aspect ratios and both rotation limits', () => {
  const world = buildCornerWorld()
  const camera = new OrthographicCamera(-4, 4, 3, -3, 0.1, 40)
  for (const [width, height] of [
    [280, 310],
    [800, 460],
  ]) {
    for (const rotation of [-22, 0, 22]) {
      configureCornerCamera(camera, width, height, rotation)
      for (const name of ['floor', 'wall-left', 'wall-back', 'side-table']) {
        const box = new Box3().setFromObject(world.scene.getObjectByName(name))
        for (const x of [box.min.x, box.max.x])
          for (const y of [box.min.y, box.max.y])
            for (const z of [box.min.z, box.max.z]) {
              const projected = new Vector3(x, y, z).project(camera)
              assert.ok(
                Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1,
                `${name} clips at ${width}px, ${rotation} degrees: ${projected.toArray()}`,
              )
            }
      }
    }
  }
  world.dispose()
})

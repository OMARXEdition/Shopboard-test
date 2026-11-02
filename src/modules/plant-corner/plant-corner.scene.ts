import * as THREE from 'three'
import { clampRotation, POT_OPTIONS, SIZE_OPTIONS, WALL_OPTIONS } from './plant-corner.logic.ts'
import type { CornerScene, CornerSettings, PlantKind } from './plant-corner.types.ts'

const matte = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0 })

const release = (root: THREE.Object3D) => {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  root.traverse(object => {
    if (object instanceof THREE.Mesh) {
      geometries.add(object.geometry)
      const entries = Array.isArray(object.material) ? object.material : [object.material]
      entries.forEach(material => materials.add(material))
    }
  })
  geometries.forEach(geometry => geometry.dispose())
  materials.forEach(material => material.dispose())
}

const stem = (points: THREE.Vector3[], radius: number, material: THREE.Material) => {
  const curve = new THREE.CatmullRomCurve3(points)
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, radius, 5, false), material)
  mesh.castShadow = true
  return mesh
}

const leafGeometry = (split: boolean) => {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  if (split) {
    shape.bezierCurveTo(-0.3, 0.03, -0.57, 0.21, -0.52, 0.47)
    shape.lineTo(-0.22, 0.42); shape.lineTo(-0.55, 0.66)
    shape.quadraticCurveTo(-0.58, 0.83, -0.44, 0.94)
    shape.lineTo(-0.2, 0.7); shape.lineTo(-0.32, 1.11)
    shape.quadraticCurveTo(-0.15, 1.24, 0, 1.4)
    shape.quadraticCurveTo(0.15, 1.24, 0.32, 1.11)
    shape.lineTo(0.2, 0.7); shape.lineTo(0.44, 0.94)
    shape.quadraticCurveTo(0.58, 0.83, 0.55, 0.66)
    shape.lineTo(0.22, 0.42); shape.lineTo(0.52, 0.47)
    shape.bezierCurveTo(0.57, 0.21, 0.3, 0.03, 0, 0)
    for (const x of [-0.12, 0.12]) {
      const hole = new THREE.Path()
      hole.absellipse(x, 0.6, 0.035, 0.095, 0, Math.PI * 2, true, x * 2)
      shape.holes.push(hole)
    }
  } else {
    shape.bezierCurveTo(-0.36, 0.12, -0.43, 0.71, 0, 1)
    shape.bezierCurveTo(0.43, 0.71, 0.36, 0.12, 0, 0)
  }
  const geometry = new THREE.ShapeGeometry(shape, 12)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) position.setZ(i, Math.sin(position.getY(i) * 2) * 0.08 + position.getX(i) ** 2 * 0.15)
  geometry.computeVertexNormals()
  return geometry
}

const buildPlant = (kind: PlantKind) => {
  const group = new THREE.Group()
  group.name = 'foliage'
  const greens = ['#285d38', '#387346', '#466f3b'].map(color => {
    const material = matte(color)
    material.side = THREE.DoubleSide
    return material
  })
  const veinMaterial = greens[2]
  const stalkMaterial = greens[0]
  const addLeaf = (position: THREE.Vector3, scale: number, tilt: number, turn: number, split: boolean, index: number) => {
    const holder = new THREE.Group()
    holder.position.copy(position)
    holder.rotation.set(-0.2, turn, tilt)
    holder.scale.setScalar(scale)
    const leaf = new THREE.Mesh(leafGeometry(split), greens[index % greens.length])
    leaf.castShadow = true
    leaf.receiveShadow = true
    holder.add(leaf, stem([new THREE.Vector3(0, 0, 0.01), new THREE.Vector3(0, 0.4, 0.08), new THREE.Vector3(0, split ? 1.3 : 0.94, 0.085)], 0.008, veinMaterial))
    group.add(holder)
  }
  if (kind === 'snake') {
    for (let i = 0; i < 13; i++) {
      const height = 0.85 + (i % 4) * 0.19
      const geometry = new THREE.PlaneGeometry(0.16, height, 4, 12)
      const points = geometry.attributes.position
      for (let j = 0; j < points.count; j++) {
        const t = (points.getY(j) + height / 2) / height
        points.setXYZ(j, points.getX(j) * (0.25 + Math.sin(Math.PI * t) * 0.8), t * height, Math.sin(t * 2.1) * 0.12)
      }
      geometry.computeVertexNormals()
      const leaf = new THREE.Mesh(geometry, greens[i % greens.length])
      const angle = i * 2.4
      leaf.position.set(Math.cos(angle) * 0.19, 0, Math.sin(angle) * 0.19)
      leaf.rotation.set(0.08 * (i % 3), angle, Math.sin(angle) * 0.12)
      leaf.castShadow = true
      group.add(leaf)
    }
  } else if (kind === 'zz') {
    for (let i = 0; i < 5; i++) {
      const angle = i * 2.4
      const height = 1 + (i % 3) * 0.19
      const tip = new THREE.Vector3(Math.cos(angle) * 0.3, height, Math.sin(angle) * 0.3)
      group.add(stem([new THREE.Vector3(), tip.clone().multiplyScalar(0.5), tip], 0.018, stalkMaterial))
      for (let pair = 1; pair <= 4; pair++) {
        const at = tip.clone().multiplyScalar(pair / 4.6)
        addLeaf(at, 0.27, -1.05, angle, false, i + pair)
        addLeaf(at, 0.27, 1.05, angle, false, i + pair + 1)
      }
    }
  } else {
    const count = kind === 'monstera' ? 9 : 10
    for (let i = 0; i < count; i++) {
      const angle = i * 2.4
      const height = 0.45 + (i % 4) * 0.25
      const at = new THREE.Vector3(Math.cos(angle) * 0.29, height, Math.sin(angle) * 0.29)
      group.add(stem([new THREE.Vector3(), at.clone().multiplyScalar(0.45), at], 0.014, stalkMaterial))
      addLeaf(at, kind === 'monstera' ? 0.62 : 0.55, (i % 2 ? 1 : -1) * 0.55, angle, kind === 'monstera', i)
    }
  }
  return group
}

// No DOM queries or browser listeners here: UI supplies canvas and dimensions.
export const buildCornerWorld = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#fdfaf0')
  const wallMaterials = [matte('#f2eddf'), matte('#f2eddf')]
  const potMaterial = matte('#eee7d8')
  const mesh = (name: string, geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) => {
    const object = new THREE.Mesh(geometry, material)
    object.name = name
    object.position.set(x, y, z)
    object.castShadow = true
    object.receiveShadow = true
    scene.add(object)
    return object
  }
  mesh('floor', new THREE.BoxGeometry(5.1, 0.12, 5.1), matte('#dfd1b8'), 0, -0.08, 0)
  mesh('wall-left', new THREE.BoxGeometry(0.1, 3.2, 5.1), wallMaterials[0], -2.5, 1.58, 0)
  mesh('wall-back', new THREE.BoxGeometry(5.1, 3.2, 0.1), wallMaterials[1], 0, 1.58, -2.5)
  const rug = mesh('rug', new THREE.CircleGeometry(1.65, 48), matte('#b9c2a2'), 0.15, 0.003, 0.35)
  rug.rotation.x = -Math.PI / 2
  rug.scale.y = 0.73
  rug.castShadow = false
  const rugRim = mesh('rug-border', new THREE.RingGeometry(1.53, 1.56, 48), matte('#dbe0c9'), 0.15, 0.006, 0.35)
  rugRim.rotation.x = -Math.PI / 2
  rugRim.scale.y = 0.73
  rugRim.castShadow = false
  const wood = matte('#aa8059')
  mesh('side-table', new THREE.CylinderGeometry(0.55, 0.55, 0.09, 36), wood, 1.15, 0.81, 0.25)
  for (let i = 0; i < 3; i++) {
    const angle = i * Math.PI * 2 / 3
    mesh('table-leg', new THREE.CylinderGeometry(0.045, 0.06, 0.75, 8), wood, 1.15 + Math.cos(angle) * 0.37, 0.39, 0.25 + Math.sin(angle) * 0.37)
  }
  const book = mesh('book', new THREE.BoxGeometry(0.4, 0.045, 0.29), matte('#7d8e65'), 1.18, 0.88, 0.35)
  book.rotation.y = 0.2
  mesh('small-vase', new THREE.CylinderGeometry(0.075, 0.12, 0.27, 24), matte('#e9dcc6'), 0.93, 1.0, 0.1)
  mesh('pot', new THREE.CylinderGeometry(0.39, 0.29, 0.6, 40), potMaterial, -0.6, 0.3, -0.3)
  mesh('pot-rim', new THREE.TorusGeometry(0.38, 0.025, 8, 40), potMaterial, -0.6, 0.6, -0.3).rotation.x = Math.PI / 2
  mesh('soil', new THREE.CylinderGeometry(0.355, 0.355, 0.02, 32), matte('#443a2b'), -0.6, 0.6, -0.3)
  const plant = new THREE.Group()
  plant.position.set(-0.6, 0.61, -0.3)
  scene.add(plant)
  scene.add(new THREE.HemisphereLight('#fff4df', '#829174', 2.5))
  const sun = new THREE.DirectionalLight('#ffedce', 3.2)
  sun.position.set(3, 6, 4)
  sun.castShadow = true
  sun.shadow.mapSize.set(512, 512)
  sun.shadow.camera.left = -4; sun.shadow.camera.right = 4
  sun.shadow.camera.top = 4; sun.shadow.camera.bottom = -4
  sun.shadow.normalBias = 0.035
  sun.shadow.bias = -0.0003
  sun.shadow.radius = 3
  scene.add(sun)
  let currentKind: PlantKind | null = null
  let disposed = false
  return {
    scene, plant, potMaterial, wallMaterials,
    update: (settings: CornerSettings, kind: PlantKind) => {
      if (disposed) return
      if (currentKind !== kind) {
        release(plant)
        plant.clear()
        plant.add(buildPlant(kind))
        currentKind = kind
      }
      potMaterial.color.set(POT_OPTIONS.find(option => option.value === settings.pot)?.color ?? POT_OPTIONS[0].color)
      const color = WALL_OPTIONS.find(option => option.value === settings.wall)?.color ?? WALL_OPTIONS[0].color
      wallMaterials.forEach(material => material.color.set(color))
      plant.scale.setScalar(SIZE_OPTIONS.find(option => option.value === settings.size)?.scale ?? 1)
    },
    dispose: () => {
      if (disposed) return
      disposed = true
      release(scene)
      sun.shadow.dispose()
      scene.clear()
    },
  }
}

export const configureCornerCamera = (camera: THREE.OrthographicCamera, width: number, height: number, rotation: number) => {
  const aspect = Math.max(1, width) / Math.max(1, height)
  const viewHeight = Math.max(6.4, 7.9 / aspect)
  camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2
  camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2
  camera.updateProjectionMatrix()
  const angle = Math.PI / 4 + clampRotation(rotation) * Math.PI / 180
  camera.position.set(Math.sin(angle) * 9, 5.7, Math.cos(angle) * 9)
  camera.lookAt(0, 1.5, 0)
  camera.updateMatrixWorld()
}

export const createCornerScene = (canvas: HTMLCanvasElement): CornerScene => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' })
  const world = buildCornerWorld()
  const camera = new THREE.OrthographicCamera(-4, 4, 3, -3, 0.1, 40)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  let disposed = false
  let width = 1
  let height = 1
  let rotation = 0
  let pixelRatio = 0
  return {
    update: (settings, kind) => {
      world.update(settings, kind)
      rotation = settings.rotation
      configureCornerCamera(camera, width, height, rotation)
    },
    resize: (nextWidth, nextHeight, nextPixelRatio) => {
      const nextRatio = Math.min(1.5, Math.max(1, nextPixelRatio))
      const safeWidth = Math.max(1, Math.round(nextWidth))
      const safeHeight = Math.max(1, Math.round(nextHeight))
      if (width === safeWidth && height === safeHeight && pixelRatio === nextRatio) return
      width = safeWidth
      height = safeHeight
      configureCornerCamera(camera, width, height, rotation)
      if (pixelRatio !== nextRatio) renderer.setPixelRatio(nextRatio)
      pixelRatio = nextRatio
      renderer.setSize(Math.max(1, width), Math.max(1, height), false)
    },
    render: () => { if (!disposed) renderer.render(world.scene, camera) },
    dispose: () => {
      if (disposed) return
      disposed = true
      world.dispose()
      renderer.dispose()
    },
  }
}

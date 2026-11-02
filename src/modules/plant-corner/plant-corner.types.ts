import type { Product } from '../catalog/catalog.types.ts'

export type PlantKind = 'monstera' | 'rubber' | 'snake' | 'zz'
export type PotColor = 'ivory' | 'sage' | 'terracotta'
export type WallColor = 'ivory' | 'sage' | 'sand'
export type PlantSize = 'small' | 'medium' | 'large'

export interface CornerPlant { product: Product; kind: PlantKind }
export interface CornerSettings {
  productId: string
  pot: PotColor
  wall: WallColor
  size: PlantSize
  rotation: number
}

export interface CornerScene {
  update(settings: CornerSettings, kind: PlantKind): void
  resize(width: number, height: number, pixelRatio: number): void
  render(): void
  dispose(): void
}

export type SceneLoader = (canvas: HTMLCanvasElement) => Promise<CornerScene>

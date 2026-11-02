import type { Product } from '../catalog/catalog.types.ts'
import type { CornerPlant, PlantKind, PlantSize, PotColor, WallColor } from './plant-corner.types.ts'

export const POT_OPTIONS: readonly { value: PotColor; label: string; color: string }[] = [
  { value: 'ivory', label: 'عاجي', color: '#eee7d8' },
  { value: 'sage', label: 'مريمي', color: '#89977a' },
  { value: 'terracotta', label: 'طيني', color: '#b87958' },
]
export const WALL_OPTIONS: readonly { value: WallColor; label: string; color: string }[] = [
  { value: 'ivory', label: 'عاج دافئ', color: '#f2eddf' },
  { value: 'sage', label: 'مريمي فاتح', color: '#dce4d2' },
  { value: 'sand', label: 'رملي', color: '#e5d3b9' },
]
export const SIZE_OPTIONS: readonly { value: PlantSize; label: string; scale: number }[] = [
  { value: 'small', label: 'صغيرة', scale: 0.8 },
  { value: 'medium', label: 'متوسطة', scale: 1 },
  { value: 'large', label: 'كبيرة', scale: 1.18 },
]
export const clampRotation = (value: number) => Number.isFinite(value) ? Math.max(-22, Math.min(22, value)) : 0

export const getCornerPlants = (products: readonly Product[]): CornerPlant[] => {
  const matches: readonly [PlantKind, RegExp][] = [
    ['monstera', /مونستيرا|monstera/i],
    ['rubber', /مطاط|rubber|ficus elastica/i],
    ['snake', /لسان الحماة|snake|sansevieria/i],
    ['zz', /زاميا|زاميو|zamioculcas|zz plant/i],
  ]
  const plants: CornerPlant[] = []
  matches.forEach(([kind, pattern]) => {
    const product = products.find(item => item.category !== 'accessories' && pattern.test(item.name))
    if (product && !plants.some(option => option.product.id === product.id)) plants.push({ product, kind })
  })
  products.filter(product => product.category === 'indoor').forEach(product => {
    if (!plants.some(option => option.product.id === product.id)) plants.push({ product, kind: 'zz' })
  })
  return plants.slice(0, 3)
}

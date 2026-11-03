import { $, makeElement } from '../../shared/dom.ts'
import { formatPrice } from '../../shared/format-price.ts'
import {
  clampRotation,
  getCornerPlants,
  POT_OPTIONS,
  SIZE_OPTIONS,
  WALL_OPTIONS,
} from './plant-corner.logic.ts'
import type { Product } from '../catalog/catalog.types.ts'
import type {
  CornerScene,
  CornerSettings,
  SceneLoader,
} from './plant-corner.types.ts'

interface CornerActions {
  onViewProduct(id: string): boolean
  onAddToCart(id: string): boolean
}

export const initPlantCornerUI = (
  products: readonly Product[],
  actions: CornerActions,
  loadScene: SceneLoader = async (canvas) => {
    const { createCornerScene } = await import('./plant-corner.scene.ts')
    return createCornerScene(canvas)
  },
) => {
  const root = $('#plant-corner')
  const viewport = $('#corner-viewport')
  const canvas = $<HTMLCanvasElement>('#corner-canvas')
  const fallback = $('#corner-fallback')
  const fallbackImage = $<HTMLImageElement>('#corner-fallback-image')
  const loadStatus = $('#corner-load-status')
  const actionStatus = $('#corner-action-status')
  const summary = $('#corner-summary')
  const plantSelect = $<HTMLSelectElement>('#corner-plant')
  const potSelect = $<HTMLSelectElement>('#corner-pot')
  const wallSelect = $<HTMLSelectElement>('#corner-wall')
  const sizeSelect = $<HTMLSelectElement>('#corner-size')
  const left = $<HTMLButtonElement>('#corner-left')
  const right = $<HTMLButtonElement>('#corner-right')
  const reset = $<HTMLButtonElement>('#corner-reset')
  const retry = $<HTMLButtonElement>('#corner-retry')
  const view = $<HTMLButtonElement>('#corner-view')
  const add = $<HTMLButtonElement>('#corner-add')
  const plants = getCornerPlants(products)
  const settings: CornerSettings = {
    productId: plants[0]?.product.id ?? '',
    pot: 'ivory',
    wall: 'ivory',
    size: 'medium',
    rotation: 0,
  }
  let scene: CornerScene | null = null
  let destroyed = false
  let loading = false
  let frame: number | null = null
  let drag: {
    id: number
    x: number
    y: number
    rotation: number
    horizontal: boolean
  } | null = null
  const listeners: (() => void)[] = []
  const on = <E extends Event = Event>(
    target: EventTarget,
    type: string,
    handler: (event: E) => void,
    options?: AddEventListenerOptions,
  ) => {
    const callback: EventListener = (event) => handler(event as E)
    target.addEventListener(type, callback, options)
    listeners.push(() => target.removeEventListener(type, callback, options))
  }
  const fill = (
    select: HTMLSelectElement,
    entries: readonly { value: string; label: string }[],
    value: string,
  ) => {
    entries.forEach((entry) => {
      const option = makeElement('option', '', entry.label)
      option.value = entry.value
      select.append(option)
    })
    select.value = value
  }
  fill(
    plantSelect,
    plants.map(({ product }) => ({ value: product.id, label: product.name })),
    settings.productId,
  )
  fill(potSelect, POT_OPTIONS, settings.pot)
  fill(wallSelect, WALL_OPTIONS, settings.wall)
  fill(sizeSelect, SIZE_OPTIONS, settings.size)

  const syncButtons = () => {
    left.disabled = !scene || settings.rotation <= -22
    right.disabled = !scene || settings.rotation >= 22
    reset.disabled = !scene || settings.rotation === 0
  }
  const fail = () => {
    const previous = scene
    scene = null
    previous?.dispose()
    if (frame !== null) window.cancelAnimationFrame(frame)
    frame = null
    canvas.hidden = true
    fallback.hidden = false
    retry.hidden = false
    loadStatus.textContent =
      'تعذّر تشغيل المعاينة ثلاثية الأبعاد. يمكنك اختيار نبتتك وعرضها أو إضافتها للسلة، أو إعادة المحاولة.'
    root.setAttribute('data-state', 'fallback')
    syncButtons()
  }
  const requestRender = () => {
    if (!scene || destroyed || frame !== null) return
    frame = window.requestAnimationFrame(() => {
      frame = null
      if (!scene || destroyed) return
      const selected = plants.find(
        (option) => option.product.id === settings.productId,
      )
      if (!selected) return
      try {
        const { width, height } = viewport.getBoundingClientRect()
        scene.resize(width, height, Math.min(1.5, window.devicePixelRatio || 1))
        scene.update({ ...settings }, selected.kind)
        scene.render()
      } catch {
        fail()
      }
    })
  }
  const syncSelection = () => {
    const selected = plants.find(
      (option) => option.product.id === settings.productId,
    )
    view.disabled = add.disabled = !selected
    if (!selected) {
      plantSelect.disabled = true
      summary.textContent =
        'لا توجد نباتات مناسبة للمعاينة في المجموعة الحالية.'
      return
    }
    const pot =
      POT_OPTIONS.find((option) => option.value === settings.pot) ??
      POT_OPTIONS[0]
    const wall =
      WALL_OPTIONS.find((option) => option.value === settings.wall) ??
      WALL_OPTIONS[0]
    const size =
      SIZE_OPTIONS.find((option) => option.value === settings.size) ??
      SIZE_OPTIONS[1]
    summary.textContent = `${selected.product.name} · ${formatPrice(selected.product.price)} · أصيص ${pot.label} · جدار ${wall.label} · معاينة ${size.label}`
    fallbackImage.src = selected.product.image
    fallbackImage.alt = selected.product.alt
    add.setAttribute('aria-label', `أضف ${selected.product.name} إلى السلة`)
    actionStatus.textContent = ''
    requestRender()
  }
  syncSelection()
  syncButtons()

  const initialize = async () => {
    if (destroyed || loading || scene || !plants.length) return
    loading = true
    retry.hidden = true
    root.setAttribute('data-state', 'loading')
    loadStatus.textContent =
      'نجهّز ركنك الأخضر… تبقى خيارات النبتة والتسوّق متاحة أثناء التحميل.'
    try {
      const loaded = await loadScene(canvas)
      if (destroyed) {
        loaded.dispose()
        return
      }
      scene = loaded
      canvas.hidden = false
      fallback.hidden = true
      root.setAttribute('data-state', 'ready')
      loadStatus.textContent =
        'المعاينة جاهزة. اسحب أفقيًا أو استخدم أزرار التدوير. يمكنك التمرير عموديًا كالمعتاد.'
      syncButtons()
      requestRender()
    } catch {
      if (!destroyed) fail()
    } finally {
      loading = false
    }
  }
  on(retry, 'click', () => {
    void initialize()
  })
  on(plantSelect, 'change', () => {
    const selected = plants.find(
      (option) => option.product.id === plantSelect.value,
    )
    if (selected) {
      settings.productId = selected.product.id
      syncSelection()
    }
  })
  on(potSelect, 'change', () => {
    const selected = POT_OPTIONS.find(
      (option) => option.value === potSelect.value,
    )
    if (selected) {
      settings.pot = selected.value
      syncSelection()
    }
  })
  on(wallSelect, 'change', () => {
    const selected = WALL_OPTIONS.find(
      (option) => option.value === wallSelect.value,
    )
    if (selected) {
      settings.wall = selected.value
      syncSelection()
    }
  })
  on(sizeSelect, 'change', () => {
    const selected = SIZE_OPTIONS.find(
      (option) => option.value === sizeSelect.value,
    )
    if (selected) {
      settings.size = selected.value
      syncSelection()
    }
  })
  const rotate = (value: number) => {
    if (!scene) return
    settings.rotation = clampRotation(value)
    syncButtons()
    requestRender()
  }
  on(left, 'click', () => rotate(settings.rotation - 8))
  on(right, 'click', () => rotate(settings.rotation + 8))
  on(reset, 'click', () => rotate(0))
  on<PointerEvent>(viewport, 'pointerdown', (event) => {
    if (!scene || !event.isPrimary || event.button !== 0) return
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rotation: settings.rotation,
      horizontal: false,
    }
  })
  on<PointerEvent>(
    viewport,
    'pointermove',
    (event) => {
      if (!drag || drag.id !== event.pointerId) return
      const dx = event.clientX - drag.x
      const dy = event.clientY - drag.y
      if (!drag.horizontal) {
        if (Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx)) {
          drag = null
          return
        }
        if (Math.abs(dx) < 6) return
        drag.horizontal = true
        viewport.setPointerCapture(event.pointerId)
      }
      if (event.cancelable) event.preventDefault()
      rotate(drag.rotation + dx * 0.16)
    },
    { passive: false },
  )
  const endDrag = (event: PointerEvent) => {
    if (drag?.id !== event.pointerId) return
    if (viewport.hasPointerCapture(event.pointerId))
      viewport.releasePointerCapture(event.pointerId)
    drag = null
  }
  on(viewport, 'pointerup', endDrag)
  on(viewport, 'pointercancel', endDrag)
  on(viewport, 'lostpointercapture', () => {
    drag = null
  })
  on(canvas, 'webglcontextlost', (event) => {
    event.preventDefault()
    if (!destroyed && scene) fail()
  })
  const act = (action: (id: string) => boolean, success: string) => {
    if (!plants.some((option) => option.product.id === settings.productId))
      return
    try {
      actionStatus.textContent = action(settings.productId)
        ? success
        : 'لم تكتمل العملية. حاول مرة أخرى.'
    } catch {
      actionStatus.textContent = 'لم تكتمل العملية. حاول مرة أخرى.'
    }
  }
  on(add, 'click', () =>
    act(
      actions.onAddToCart,
      'أُضيفت النبتة المختارة إلى سلّتك. ألوان المعاينة وحجمها ليست خيارات شراء.',
    ),
  )
  on(view, 'click', () =>
    act(actions.onViewProduct, 'تم عرض النبتة المختارة في المعرض.'),
  )

  const resize =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(requestRender)
      : null
  resize?.observe(viewport)
  on(window, 'resize', requestRender)
  const intersection =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              intersection?.disconnect()
              void initialize()
            }
          },
          { rootMargin: '240px' },
        )
      : null
  if (intersection) intersection.observe(root)
  else void initialize()

  return {
    destroy: () => {
      if (destroyed) return
      destroyed = true
      intersection?.disconnect()
      resize?.disconnect()
      listeners.forEach((remove) => remove())
      if (drag && viewport.hasPointerCapture(drag.id))
        viewport.releasePointerCapture(drag.id)
      drag = null
      if (frame !== null) window.cancelAnimationFrame(frame)
      frame = null
      scene?.dispose()
      scene = null
    },
  }
}

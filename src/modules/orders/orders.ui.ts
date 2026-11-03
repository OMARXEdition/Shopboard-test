import { $, makeElement } from '../../shared/dom.ts'
import { formatPrice } from '../../shared/format-price.ts'
import { createOrderSnapshot } from './orders.logic.ts'
import type { Order, OrderInputItem, OrdersState } from './orders.types.ts'

interface OrdersUIOptions {
  getCartItems(): readonly OrderInputItem[]
  onPlaced(): void
  onCancel(): void
}

export const initOrdersUI = (orders: OrdersState, options: OrdersUIOptions) => {
  const list = $('#orders-list')
  const empty = $('#orders-empty')
  const status = $('#orders-status')
  const heading = $('#orders-title')
  const dialog = $<HTMLDialogElement>('#order-review-dialog')
  const reviewList = $('#order-review-items')
  const reviewStatus = $('#order-review-status')
  const confirm = $<HTMLButtonElement>('#order-confirm')
  let pending: Order | null = null
  let saving = false
  let placed = false

  const itemList = (order: Order) => {
    const items = makeElement('ul', 'order-items')
    order.items.forEach((item) => {
      const row = makeElement('li', 'order-item')
      row.append(
        makeElement(
          'span',
          '',
          `${item.name} × ${item.quantity.toLocaleString('ar')}`,
        ),
        makeElement(
          'span',
          '',
          formatPrice((item.unitPriceCents * item.quantity) / 100),
        ),
      )
      items.append(row)
    })
    return items
  }

  const renderHistory = () => {
    list.replaceChildren()
    status.hidden = true
    try {
      const history = orders.getOrders()
      empty.hidden = history.length > 0
      history.forEach((order) => {
        const card = makeElement('li', 'order-card')
        const top = makeElement('div', 'order-card-heading')
        const title = makeElement('h3', '', 'طلب ')
        const number = makeElement('bdi', 'order-number', order.id)
        title.append(number)
        const date = makeElement(
          'time',
          'order-date',
          new Intl.DateTimeFormat('ar', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(order.createdAt)),
        )
        date.dateTime = order.createdAt
        top.append(title, date)
        const details = makeElement('details', 'order-details')
        details.append(
          makeElement('summary', '', 'عرض تفاصيل الطلب'),
          itemList(order),
        )
        card.append(
          top,
          makeElement('span', 'order-badge', 'طلب تجريبي محفوظ'),
          makeElement(
            'p',
            'order-total',
            `الإجمالي: ${formatPrice(order.totalCents / 100)}`,
          ),
          details,
        )
        list.append(card)
      })
    } catch {
      empty.hidden = true
      status.hidden = false
      status.textContent =
        'تعذّر قراءة سجل الطلبات من هذا المتصفح. تأكّد من السماح بالتخزين ثم حاول مجددًا.'
    }
  }

  renderHistory()
  $('#orders-refresh').addEventListener('click', renderHistory)
  $('#order-review-cancel').addEventListener('click', () => dialog.close())
  dialog.addEventListener('close', () => {
    pending = null
    confirm.disabled = true
    if (placed) heading.focus()
    else options.onCancel()
  })

  confirm.addEventListener('click', () => {
    if (!pending || saving) return
    saving = true
    confirm.disabled = true
    reviewStatus.hidden = true
    try {
      const saved = orders.saveOrder(pending)
      pending = null
      placed = true
      options.onPlaced()
      renderHistory()
      status.hidden = false
      status.textContent = `تم حفظ طلبك التجريبي ${saved.id}. لم يتم إرسال طلب شراء أو تحصيل مبلغ.`
      dialog.close()
    } catch {
      reviewStatus.hidden = false
      reviewStatus.textContent =
        'لم يُحفظ الطلب. بقيت سلّتك كما هي. تأكّد من توفر مساحة التخزين ثم أعد المحاولة.'
    } finally {
      saving = false
      confirm.disabled = pending === null
    }
  })

  return {
    openReview: () => {
      if (dialog.open) return
      placed = false
      reviewStatus.hidden = true
      try {
        pending = createOrderSnapshot(
          options.getCartItems(),
          `NB-${crypto.randomUUID()}`,
          new Date().toISOString(),
        )
        reviewList.replaceChildren(itemList(pending))
        $('#order-review-total').textContent =
          `الإجمالي: ${formatPrice(pending.totalCents / 100)}`
        confirm.disabled = false
        dialog.showModal()
      } catch {
        pending = null
        confirm.disabled = true
        status.hidden = false
        status.textContent =
          'تعذّر تجهيز الطلب. أضف منتجًا إلى السلة وتحقّق من الكميات.'
        options.onCancel()
      }
    },
  }
}

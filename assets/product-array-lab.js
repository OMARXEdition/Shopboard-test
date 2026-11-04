import { products } from '../src/data.js'
const $ = (selector) => document.querySelector(selector)
const method = $('#method')
const budget = $('#budget')
const productId = $('#product-id')
for (const product of products) {
  const option = document.createElement('option')
  option.value = product.id
  option.textContent = product.id
  productId.append(option)
}
productId.value = 'magflow-station'
const update = () => {
  const limit = Number(budget.value)
  const examples = {
    map: {
      code: 'products.map(product => product.name)',
      result: () => products.map(product => product.name),
      explanation: 'One name for every product. Use this for labels, search suggestions, or transforming products into cards.',
    },
    filter: {
      code: `products.filter(product => product.price < ${limit})`,
      result: () => products.filter(product => product.price < limit),
      explanation: 'Keep every matching object. Use this for category buttons, search, or a budget filter. No matches returns [].',
    },
    sort: {
      code: '[...products].sort((a, b) => a.price - b.price)',
      result: () => [...products].sort((a, b) => a.price - b.price),
      explanation: 'Copy first, then sort cheapest first. Negative puts a before b; positive puts it after b. Use b.price - a.price for most expensive first.',
    },
    find: {
      code: `products.find(product => product.id === '${productId.value}')`,
      result: () => products.find(product => product.id === productId.value),
      explanation: 'Get one matching object for a detail view. Check for undefined before reading its properties.',
    },
    reduce: {
      code: 'products.reduce((total, product) => total + Math.round(product.price * 100), 0) / 100',
      result: () => products.reduce((total, product) => total + Math.round(product.price * 100), 0) / 100,
      explanation: 'Start total at 0 cents; add each price in cents; convert back to dollars. This is one of every product, not the cart total.',
    },
  }
  const example = examples[method.value]
  $('#example').textContent = example.code
  const result = example.result()
  $('#result').textContent = result === undefined ? 'undefined' : JSON.stringify(result, null, 2)
  $('#explanation').textContent = example.explanation
  $('#source').href = `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/${method.value}`
  budget.disabled = method.value !== 'filter'
  productId.disabled = method.value !== 'find'
}
for (const control of [method, budget, productId]) control.addEventListener('input', update)
document.querySelectorAll('[data-answer]').forEach((button) => {
  button.addEventListener('click', () => {
    $('#feedback').textContent = button.dataset.answer === 'filter'
      ? 'Correct. filter keeps every product that passes your condition.'
      : button.dataset.answer === 'map'
        ? 'Try again. map transforms each entry; it does not remove entries that fail a condition.'
        : 'Try again. find returns only the first match; you need every matching product.'
  })
})
update()
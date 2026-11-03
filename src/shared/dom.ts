export const $ = <T extends HTMLElement = HTMLElement>(
  selector: string,
  scope: ParentNode = document,
): T => {
  const element = scope.querySelector<T>(selector)
  if (!element)
    throw new Error(`Missing required storefront element: ${selector}`)
  return element
}
export const $$ = <T extends HTMLElement = HTMLElement>(
  selector: string,
  scope: ParentNode = document,
): T[] => Array.from(scope.querySelectorAll<T>(selector))

export const makeElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
) => {
  const element = document.createElement(tag)
  element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

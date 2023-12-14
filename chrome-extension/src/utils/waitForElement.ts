import { wait } from './wait'

export async function waitForElement<T extends Element>(selector: string) {
  for (let i = 0; i < 10; i++) {
    const element = document.querySelector<T>(selector)
    if (element) return element
    await wait(50 * i)
  }

  return undefined
}

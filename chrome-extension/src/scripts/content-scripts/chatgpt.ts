import { generatePrompt, isActionAutomatic } from '../../llm/llm'
import { wait } from '../../utils/wait'
import { waitForElement } from '../../utils/waitForElement'

chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.name === 'health') return sendResponse('ok')
  if (message.name !== 'action') throw new Error('Invalid message')

  const promptInput = await waitForElement<HTMLInputElement>('#prompt-textarea')
  if (!promptInput) return
  promptInput.focus()

  setInputValue(
    promptInput,
    generatePrompt({
      context: message.data.context,
      language: message.data.language,
      action: message.data.action,
    })
  )

  promptInput.scrollTo({ top: promptInput.scrollHeight, behavior: 'instant' })

  if (isActionAutomatic(message.data.action)) {
    const sendButton = await waitForElement<HTMLButtonElement>('button[data-testid="send-button"]')
    if (sendButton) {
      try { sendButton.click() } catch {}
    }

    await wait(1000)

    const scrollToBottomButton = await waitForElement<HTMLButtonElement>('button.cursor-pointer ')
    if (scrollToBottomButton) {
      try { scrollToBottomButton.click() } catch {}
    }
  }
})

// https://stackoverflow.com/a/53797269
function setInputValue(element: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set
  const prototype = Object.getPrototypeOf(element)
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    valueSetter.call(element, value)
  } else if (prototypeValueSetter) {
    prototypeValueSetter.call(element, value)
  } else {
    element.value = value
  }

  element.dispatchEvent(new Event('input', { bubbles: true }))
}

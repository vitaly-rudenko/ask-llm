import { createPrompt, isQuestionAutomatic } from '../../llm/llm'
import { waitForElement } from '../../utils/waitForElement'

chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.name === 'health') return sendResponse('ok')
  if (message.name !== 'question') throw new Error('Invalid message')

  const promptInput = await waitForElement<HTMLInputElement>('#prompt-textarea')
  if (!promptInput) return
  promptInput.focus()

  setInputValue(
    promptInput,
    createPrompt({
      context: message.data.context,
      language: message.data.language,
      question: message.data.question,
    })
  )

  promptInput.scrollTo({ top: promptInput.scrollHeight, behavior: 'instant' })

  if (isQuestionAutomatic(message.data.question)) {
    const sendButton = await waitForElement<HTMLButtonElement>('button[data-testid="send-button"]')
    if (sendButton) {
      try { sendButton.click() } catch {}
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

import { createPrompt, isQuestionAutomatic } from '../llm/llm'

chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.name === 'health') return sendResponse('ok')
  if (message.name !== 'question') throw new Error('Invalid message')

  const promptInput = window.document.getElementById('prompt-textarea') as HTMLInputElement
  if (!promptInput) return
  promptInput.focus()

  console.log(message)

  setInputValue(
    promptInput,
    createPrompt({
      context: message.data.context,
      contextType: message.data.contextType,
      language: message.data.language,
      question: message.data.question,
    })
  )

  promptInput.scrollTo({ top: promptInput.scrollHeight, behavior: 'instant' })

  if (isQuestionAutomatic(message.data.question)) {
    const sendButton = window.document.querySelector<HTMLButtonElement>('button[data-testid="send-button"]')
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

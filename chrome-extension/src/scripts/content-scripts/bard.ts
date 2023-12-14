import { createPrompt, isQuestionAutomatic } from '../../llm/llm'
import { waitForElement } from '../../utils/waitForElement'

chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.name === 'health') return sendResponse('ok')
  if (message.name !== 'question') throw new Error('Invalid message')

  const promptInput = await waitForElement<HTMLParagraphElement>('div.textarea[contenteditable=true]')
  if (!promptInput) return
  promptInput.replaceChildren()

  const lines = createPrompt({
    context: message.data.context,
    language: message.data.language,
    question: message.data.question,
  }).split('\n')

  for (const line of lines) {
    const p = document.createElement('p')
    p.innerText = line
    promptInput.appendChild(p)
  }

  promptInput.focus()

  if (isQuestionAutomatic(message.data.question)) {
    const sendButton = await waitForElement<HTMLButtonElement>('.send-button-container > button')
    if (sendButton) {
      try { sendButton.click() } catch {}
    }
  }
})

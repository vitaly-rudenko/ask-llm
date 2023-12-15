import { generatePrompt, isActionAutomatic } from '../../llm/llm'
import { waitForElement } from '../../utils/waitForElement'

chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.name === 'health') return sendResponse('ok')
  if (message.name !== 'action') throw new Error('Invalid message')

  const promptInput = await waitForElement<HTMLParagraphElement>('div.textarea[contenteditable=true]')
  if (!promptInput) return
  promptInput.replaceChildren()

  const lines = generatePrompt({
    context: message.data.context,
    language: message.data.language,
    action: message.data.action,
  }).split('\n')

  for (const line of lines) {
    const p = document.createElement('p')
    p.innerText = line
    promptInput.appendChild(p)
  }

  promptInput.focus()

  if (isActionAutomatic(message.data.action)) {
    const sendButton = await waitForElement<HTMLButtonElement>('.send-button-container > button')
    if (sendButton) {
      try { sendButton.click() } catch {}
    }
  }
})

import { Action, Language, Llm } from '../llm/llm'
import { createPopup } from './chrome'

export async function askInChat(data: {
  llm: Llm
  language: Language
  context: string
  action: Action
}) {
  const chatTab = await openChatTab(data.llm)
  await chrome.tabs.sendMessage(chatTab.id!, { name: 'action', data })
}

async function waitForChat(tab: chrome.tabs.Tab) {
  for (let i = 0; i < 10; i++) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id!, { name: 'health' });
      if (response === 'ok') return
    } catch {}

    await new Promise(resolve => setTimeout(resolve, 50 * i))
  }

  throw new Error('Chat tab is not responsive')
}

async function openChatTab(desiredLlm: Llm) {
  const { tabId, llm } = await chrome.storage.local.get(['tabId', 'llm'])
  if (tabId && llm === desiredLlm) {
    try {
      const tab = await chrome.tabs.get(tabId)
      await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {})
      await chrome.tabs.update(tab.id!, { active: true }).catch(() => {})
      await waitForChat(tab)
      return tab
    } catch (error) {}
  }

  const [tab] = await createPopup(
    desiredLlm === 'chatgpt'
      ? 'https://chat.openai.com'
      : 'https://bard.google.com/chat'
  )

  await waitForChat(tab)
  await chrome.storage.local.set({ tabId: tab.id, llm: desiredLlm })

  return tab
}

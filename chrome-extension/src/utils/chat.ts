import { Action, generatePrompt, Language, Llm } from '../llm/llm'
import { createPopup } from './chrome'

type Context = {
  llm: Llm
  language: Language
  context: string
  action: Action
}

export async function askInChat(data: Context) {
  const chatTab = await openChatTab(data)
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

async function openChatTab(data: Context) {
  const { tabId, llm } = await chrome.storage.local.get(['tabId', 'llm'])
  if (tabId && llm === data.llm) {
    try {
      const tab = await chrome.tabs.get(tabId)
      await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {})
      await chrome.tabs.update(tab.id!, { active: true }).catch(() => {})
      await waitForChat(tab)
      return tab
    } catch (error) {}
  }

  let url: string
  if (data.llm === 'chatgpt') {
    url = 'https://chat.openai.com'
  } else if (data.llm === 'bard') {
    url = 'https://bard.google.com/chat'
  } else if (data.llm === 'claude') {
    const prompt = generatePrompt({
      context: data.context,
      language: data.language,
      action: data.action,
    })

    const chatUrl = new URL('https://claude.ai/new')
    chatUrl.searchParams.set('q', prompt)

    url = chatUrl.toString()
  } else {
    throw new Error(`Invalid LLM: ${data.llm}`)
  }

  const [tab] = await createPopup(url)

  await waitForChat(tab)
  await chrome.storage.local.set({
    windowId: tab.windowId,
    tabId: tab.id,
    llm: data.llm,
  })

  return tab
}

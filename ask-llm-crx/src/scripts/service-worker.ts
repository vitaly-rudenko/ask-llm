import { ContextType, ContextTypes, Language, Languages, Question, Questions } from '../llm/llm'

chrome.runtime.onInstalled.addListener(() => {
  const menuId = chrome.contextMenus.create({
    id: 'ask-llm',
    title: 'Ask LLM',
    contexts: ['selection', 'page'],
  })

  chrome.contextMenus.create({
    id: `${menuId}:${Questions.MANUAL}`,
    title: 'Ask anything...',
    contexts: ['selection', 'page'],
    parentId: menuId,
  })

  chrome.contextMenus.create({
    id: `${menuId}:${Questions.EXPLAIN}`,
    title: 'Explain',
    contexts: ['selection', 'page'],
    parentId: menuId,
  })

  chrome.contextMenus.create({
    id: `${menuId}:${Questions.TLDR}`,
    title: 'TL;DR',
    contexts: ['selection', 'page'],
    parentId: menuId,
  })

  chrome.contextMenus.create({
    id: `${menuId}:${Questions.IMPROVE}`,
    title: 'Improve',
    contexts: ['selection', 'page'],
    parentId: menuId,
  })

  chrome.contextMenus.create({
    id: `${menuId}:${Questions.TRANSLATE}`,
    title: 'Translate',
    contexts: ['selection', 'page'],
    parentId: menuId,
  })

  chrome.contextMenus.create({
    id: `${menuId}:${Questions.ANSWER}`,
    title: 'Answer',
    contexts: ['selection', 'page'],
    parentId: menuId,
  })
})

chrome.contextMenus.onClicked.addListener(async (event, tab) => {
  const menuId = String(event.menuItemId)
  if (tab?.id && menuId.startsWith('ask-llm')) {
    const context = event.selectionText || await getPageContent(tab)
    if (!context) return

    const question = parseQuestion(menuId.split(':')[1])
    if (!question) return

    await askInChat({
      language: await detectLanguage(context),
      context,
      contextType: event.selectionText ? ContextTypes.TEXT : ContextTypes.PAGE,
      question,
    })
  }
})

function parseQuestion(input: string): Question | undefined {
  if (Object.values(Questions).includes(input as Question)) {
    return input as Question
  }

  return undefined
}

async function askInChat(input: {
  language: Language
  context: string
  contextType: ContextType
  question: Question
}) {
  const chatTab = await openChatTab()
  await chrome.tabs.sendMessage(chatTab.id!, {
    name: 'question',
    data: input
  })
}

async function detectLanguage(context: string) {
  const languageDetectionResult = await chrome.i18n.detectLanguage(context)
  if (!languageDetectionResult.isReliable) return Languages.ENGLISH

  for (const language of languageDetectionResult.languages) {
    if (['en', 'eng'].includes(language.language)) return Languages.ENGLISH
    if (['uk', 'ukr'].includes(language.language)) return Languages.UKRAINIAN
    if (['ru', 'rus'].includes(language.language)) return Languages.RUSSIAN
  }

  return Languages.ENGLISH
}

async function getPageContent(tab: chrome.tabs.Tab) {
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: () => document.body.innerText || document.body.textContent,
  })

  if (results[0].result) {
    return results[0].result
  }
}

async function waitForChat(tab: chrome.tabs.Tab) {
  for (let i = 0; i < 5; i++) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id!, { name: 'health' });
      if (response === 'ok') return
    } catch {}

    await new Promise(resolve => setTimeout(resolve, 100 * i))
  }

  throw new Error('Chat tab is not responsive')
}

async function openChatTab() {
  const { tabId } = await chrome.storage.local.get(['windowId', 'tabId'])
  if (tabId) {
    try {
      const tab = await chrome.tabs.get(tabId)
      await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {})
      await chrome.tabs.update(tab.id!, { active: true }).catch(() => {})
      await waitForChat(tab)
      return tab
    } catch (error) {}
  }

  const { left = 0, top = 0, width = 1280, height = 720 } = await chrome.windows.getCurrent()
  const popupSize = Math.max(Math.min(width, height) * 0.5, 720)

  const window = await chrome.windows.create({
    focused: true,
    url: 'https://chat.openai.com/',
    width: popupSize,
    height: popupSize,
    left: Math.trunc(left + (width - popupSize) / 2),
    top: Math.trunc(top + (height - popupSize) / 2),
  })

  const tab = window.tabs?.[0]
  if (!tab) {
    throw new Error('Could not create chat tab')
  }

  await waitForChat(tab)
  await chrome.storage.local.set({ tabId: tab.id })

  return tab
}

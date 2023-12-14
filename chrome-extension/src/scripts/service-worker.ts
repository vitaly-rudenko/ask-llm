import { Language, Languages, Llm, Llms, Question, Questions } from '../llm/llm'

chrome.runtime.onInstalled.addListener(async () => {
  const parentId = chrome.contextMenus.create({
    id: 'ask-llm',
    title: 'Ask LLM',
    contexts: ['selection', 'page'],
  })

  chrome.contextMenus.create({
    id: `${parentId}:question:${Questions.MANUAL}`,
    title: 'Ask anything...',
    contexts: ['selection', 'page'],
    parentId,
  })

  chrome.contextMenus.create({
    id: `${parentId}:question:${Questions.TRANSLATE}`,
    title: 'Translate...',
    contexts: ['selection', 'page'],
    parentId,
  })

  chrome.contextMenus.create({
    id: `${parentId}:question:${Questions.ANSWER}`,
    title: 'Write an answer...',
    contexts: ['selection', 'page'],
    parentId,
  })

  chrome.contextMenus.create({
    id: `${parentId}:separator-1`,
    type: 'separator',
    contexts: ['selection', 'page'],
    parentId,
  })

  chrome.contextMenus.create({
    id: `${parentId}:question:${Questions.EXPLAIN}`,
    title: 'Explain the topic',
    contexts: ['selection', 'page'],
    parentId,
  })

  chrome.contextMenus.create({
    id: `${parentId}:question:${Questions.TLDR}`,
    title: 'Summarize (TL;DR)',
    contexts: ['selection', 'page'],
    parentId,
  })

  chrome.contextMenus.create({
    id: `${parentId}:question:${Questions.IMPROVE}`,
    title: 'Proofread && improve',
    contexts: ['selection', 'page'],
    parentId,
  })

  chrome.contextMenus.create({
    id: `${parentId}:question:${Questions.QUIZ}`,
    title: 'Create a quiz',
    contexts: ['selection', 'page'],
    parentId,
  })

  chrome.contextMenus.create({
    id: `${parentId}:separator-2`,
    type: 'separator',
    contexts: ['selection', 'page'],
    parentId,
  })

  const { useBard = false } = await chrome.storage.local.get(['useBard'])

  chrome.contextMenus.create({
    id: `${parentId}:use-bard`,
    title: 'Use Google Bard',
    contexts: ['all'],
    checked: useBard,
    type: 'checkbox',
    parentId,
  })
})

chrome.contextMenus.onClicked.addListener(async (event, tab) => {
  const menuId = String(event.menuItemId)
  if (menuId.startsWith('ask-llm:question:')) {
    if (!tab) return

    const context = event.selectionText || await getPageContent(tab)
    if (!context) return

    const question = parseQuestion(menuId.split(':')[2])
    if (!question) return

    const { useBard } = await chrome.storage.local.get(['useBard'])

    await askInChat({
      llm: useBard ? Llms.BARD : Llms.CHATGPT,
      language: await detectLanguage(context),
      context,
      question,
    })
  } else if (menuId ==='ask-llm:use-bard') {
    await chrome.storage.local.set({ useBard: event.checked })
  }
})

function parseQuestion(input: string): Question | undefined {
  if (Object.values(Questions).includes(input as Question)) {
    return input as Question
  }

  return undefined
}

async function askInChat(input: {
  llm: Llm
  language: Language
  context: string
  question: Question
}) {
  const chatTab = await openChatTab(input.llm)
  await chrome.tabs.sendMessage(chatTab.id!, {
    name: 'question',
    data: input
  })
}

async function detectLanguage(context: string) {
  const languageDetectionResult = await chrome.i18n.detectLanguage(context)

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
  console.log({ tabId, llm, desiredLlm })
  if (tabId && llm === desiredLlm) {
    try {
      const tab = await chrome.tabs.get(tabId)
      await chrome.windows.update(tab.windowId, { focused: true }).catch(() => {})
      await chrome.tabs.update(tab.id!, { active: true }).catch(() => {})
      await waitForChat(tab)
      return tab
    } catch (error) {}
  }

  const { left = 0, top = 0, width = 1280, height = 720 } = await chrome.windows.getCurrent()
  const popupSize = Math.max(Math.min(width, height) * 0.5, 1000)

  const window = await chrome.windows.create({
    focused: true,
    url: desiredLlm === 'chatgpt' ? 'https://chat.openai.com' : 'https://bard.google.com/chat',
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
  await chrome.storage.local.set({ tabId: tab.id, llm: desiredLlm })

  return tab
}

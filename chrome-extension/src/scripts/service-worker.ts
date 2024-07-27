import { Llms, Action, Actions } from '../llm/llm'
import { askInChat } from '../utils/chat'
import { getPageContent, getLinkContent, getPageSelection, detectLanguage } from '../utils/chrome'

const Targets = {
  PAGE: 'page',
  LINK: 'link',
  SELECTION: 'selection',
} as const

type Target = typeof Targets[keyof typeof Targets]

chrome.tabs.onRemoved.addListener(async () => {
  const { windowId } = await chrome.storage.local.get(['windowId'])
  if (!windowId) return

  try {
    const window = await chrome.windows.get(windowId, { populate: true })
    if (!window.tabs) return

    const nonEmptyTabs = await window.tabs.filter(tab => !['', 'chrome://newtab/', 'about:blank'].includes(tab.url!))
    if (nonEmptyTabs.length > 0) return

    await chrome.windows.remove(windowId)
    await chrome.storage.local.remove(['windowId', 'tabId', 'llm'])
  } catch {}
})

chrome.runtime.onInstalled.addListener(async () => {
  const parentId = chrome.contextMenus.create({
    id: 'ask-llm',
    title: 'Ask LLM',
    contexts: ['all'],
  })

  function addAction(action: Action, title: Record<Target, string>) {
    for (const target of Object.values(Targets)) {
      if (title[target]) {
        chrome.contextMenus.create({
          id: `${parentId}:action:${action}:${target}`,
          title: title[target],
          contexts: [target as chrome.contextMenus.ContextType],
          parentId,
        })
      }
    }
  }

  addAction(Actions.EXPLAIN, { page: 'Explain page', selection: 'Explain selection', link: 'Explain link' })
  addAction(Actions.SUMMARIZE, { page: 'Summarize page (TL;DR)', selection: 'Summarize selection (TL;DR)', link: 'Summarize link (TL;DR)' })
  addAction(Actions.IMPROVE, { page: 'Proofread && improve page', selection: 'Proofread && improve selection', link: 'Proofread && improve link' })
  addAction(Actions.QUIZ, { page: 'Create a quiz for page', selection: 'Create a quiz for selection', link: 'Create a quiz for link' })
})

chrome.contextMenus.onClicked.addListener(async (event, tab) => {
  const menuId = String(event.menuItemId)
  if (menuId.startsWith('ask-llm:action:')) {
    if (!tab) return

    const { action, target } = parseMenuId(menuId)
    if (!action || !target) return

    let unsanitizedContext: string | undefined
    if (target === 'page' && event.pageUrl) {
      unsanitizedContext = await getPageContent(tab)
    } else if (target === 'link' && event.linkUrl) {
      unsanitizedContext = await getLinkContent(event.linkUrl)
    } else if (target === 'selection' && event.selectionText) {
      unsanitizedContext = await getPageSelection(tab) || event.selectionText
    } else {
      unsanitizedContext = (
        event.selectionText && (await getPageSelection(tab) || event.selectionText) ||
        event.linkUrl && await getLinkContent(event.linkUrl) ||
        await getPageContent(tab)
      )
    }

    const context = sanitizeContext(unsanitizedContext)
    if (!context) return

    await askInChat({
      llm: Llms.CLAUDE,
      language: await detectLanguage(context),
      context,
      action,
    })
  }
})

function sanitizeContext(input: string | undefined): string | undefined {
  return input && input.replace(/[^\S\n]+/g, ' ').trim() || undefined
}

function parseMenuId(menuId: string) {
  const [action, target] = menuId.split(':').slice(2)

  return {
    action: Object.values(Actions).includes(action as Action) ? action as Action : undefined,
    target: Object.values(Targets).includes(target as Target) ? target as Target : undefined,
  }
}

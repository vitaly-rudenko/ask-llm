import { Languages } from '../llm/llm'
import { wait } from './wait'

export async function createPopup(url: string): Promise<[chrome.tabs.Tab, chrome.windows.Window]> {
  const { left = 0, top = 0, width = 1280, height = 720 } = await chrome.windows.getCurrent()
  const popupSize = Math.max(Math.min(width, height) * 0.5, 1000)

  const window = await chrome.windows.create({
    url,
    focused: true,
    width: popupSize,
    height: popupSize,
    left: Math.trunc(left + (width - popupSize) / 2),
    top: Math.trunc(top + (height - popupSize) / 2),
  })

  const tab = window.tabs?.[0]
  if (!tab) {
    throw new Error('Could not create tab in popup window')
  }

  return [tab, window]
}

export async function detectLanguage(context: string, fallbackTab: chrome.tabs.Tab) {
  let detectedLanguages: string[] = []
  try {
    detectedLanguages = (await chrome.i18n.detectLanguage(context))
      .languages.map(l => l.language)
  } catch {
    try  {
      detectedLanguages = [await chrome.tabs.detectLanguage(fallbackTab.id!)]
    } catch {}
  }

  for (const language of detectedLanguages) {
    if (['en', 'eng', 'en-US', 'en-GB'].includes(language)) return Languages.ENGLISH
    if (['uk', 'ukr', 'uk-UA'].includes(language)) return Languages.UKRAINIAN
    if (['ru', 'rus', 'ru-RU'].includes(language)) return Languages.RUSSIAN
  }

  return Languages.ENGLISH
}

// Better than event.selectionText because this preserves line breaks
export async function getPageSelection(tab: chrome.tabs.Tab) {
  const results = await chrome.scripting.executeScript( {
    func: () => window.getSelection()?.toString(),
    target: { tabId: tab.id! },
  })

  return results[0].result
}

export async function getLinkContent(link: string) {
  const [tab, window] = await createPopup(link)

  for (let i = 0; i < 10; i++) {
    if (tab.status === 'complete') break
    await wait(50 * i)
  }

  const content = await getPageContent(tab)

  await chrome.windows.remove(window.id!).catch(() => {})

  return content
}

export async function getPageContent(tab: chrome.tabs.Tab) {
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: () => document.body.innerText || document.body.textContent || undefined,
  })

  return results[0].result
}

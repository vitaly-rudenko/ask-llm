import { oneLine } from 'common-tags'

export const Actions = {
  USE: 'use',
  EXPLAIN: 'explain',
  SUMMARIZE: 'summarize',
  IMPROVE: 'improve',
  TRANSLATE: 'translate',
  ANSWER: 'answer',
  QUIZ: 'quiz',
} as const

export const Languages = {
  ENGLISH: 'english',
  UKRAINIAN: 'ukrainian',
  RUSSIAN: 'russian',
} as const

export const Llms = {
  CHATGPT: 'chatgpt',
  CLAUDE: 'claude',
  BARD: 'bard',
} as const

export type Language = typeof Languages[keyof typeof Languages]
export type Action = typeof Actions[keyof typeof Actions]
export type Llm = typeof Llms[keyof typeof Llms]


export function isActionAutomatic(action: Action) {
  return ([Actions.EXPLAIN, Actions.SUMMARIZE, Actions.IMPROVE, Actions.QUIZ] as Action[]).includes(action)
}

export function generatePrompt(input: {
  context: string
  language: Language
  action: Action
}) {
  return [
    input.language === Languages.UKRAINIAN
      ? `Наданий текст:`
      : input.language === Languages.RUSSIAN
      ? `Представленный текст:`
      : `Provided text:`,
    '"""',
    input.context,
    '"""',
    '',
    generateActionPrompt(input),
  ].join('\n')
}

function generateActionPrompt(input: {
  action: Action
  language: Language
}) {
  const action = input.action
  if (action === Actions.USE) return ''

  const language = {
    [Languages.ENGLISH]: 'English',
    [Languages.UKRAINIAN]: 'української мови',
    [Languages.RUSSIAN]: 'русского языка',
  }[input.language]

  if (input.language === Languages.UKRAINIAN) {
    return {
      [Actions.EXPLAIN]: 'Поясни наданий текст та надай висновки чи додаткові деталі за необхідності:',
      [Actions.SUMMARIZE]: 'Надай короткий опис (TL;DR) використовуючи наданий текст.',
      [Actions.IMPROVE]: oneLine`
        Переглянь наданий текст, виправ граматичні помилки, усунь помилки друку,
        додай відповідну пунктуацію, розстав великі літери в реченнях та покращи письмо,
        зберігаючи при цьому початкову структуру наданого тексту.
      `,
      [Actions.TRANSLATE]: `Переклади наданий текст з ${language} на `,
      [Actions.ANSWER]: 'Використовуючи наданий текст, напиши відповідь:\n',
      [Actions.QUIZ]: oneLine`
        Створи багатовибірковий тест на основі наданого тексту.
        Сформуй питання для перевірки мого розуміння теми у тексті.
        Задавай питання по черзі.
      `,
    }[action]
  }

  if (input.language === Languages.RUSSIAN) {
    return {
      [Actions.EXPLAIN]: 'Объясни предоставленный текст и предложи дополнительные сведения или подробности при необходимости.',
      [Actions.SUMMARIZE]: 'Предоставь краткое изложение (TL;DR) используя предоставленный текст.',
      [Actions.IMPROVE]: oneLine`
        Пересмотри предоставленный текст, исправь грамматические ошибки и опечатки,
        добавь соответствующую пунктуацию, расставь заглавные буквы в предложениях и улучши написание,
        сохраняя при этом исходную структуру предоставленного текста.
      `,
      [Actions.TRANSLATE]: `Переведи предоставленный текст с ${language} на `,
      [Actions.ANSWER]: 'Используя предоставленный текст, напиши ответ:\n',
      [Actions.QUIZ]: oneLine`
        Создай многовариантный тест на основе предоставленного текста.
        Сформулируй вопросы, чтобы проверить моё понимание темы текста.
        Задавай вопросы по очереди.
      `,
    }[action]
  }

  return {
    [Actions.EXPLAIN]: 'Explain the provided text and offer insights or further details if necessary.',
    [Actions.SUMMARIZE]: 'Provide a brief summary (TL;DR) of the provided text.',
    [Actions.IMPROVE]: oneLine`
      Revise the provided text by correcting grammatical errors, fix typos,
      add appropriate punctuation, capitalize each sentence,
      and improve the writing while maintaining the original structure of the provided text.
    `,
    [Actions.TRANSLATE]: `Translate the provided text from ${language} to `,
    [Actions.ANSWER]: 'Using the provided text, write an answer:\n',
    [Actions.QUIZ]: oneLine`
      Create a multi-choice quiz based on the provided text.
      Generate questions to test my understanding of the topic in the text.
      Ask the questions one-by-one.
    `,
  }[action]
}

export function stringifyLanguageForTranslation(language: Language) {
  if (language === Languages.ENGLISH) return 'English'
  if (language === Languages.UKRAINIAN) return 'української'
  if (language === Languages.RUSSIAN) return 'русского'
  return undefined
}

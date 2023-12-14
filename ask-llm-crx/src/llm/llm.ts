export const Questions = {
  MANUAL: 'manual',
  EXPLAIN: 'explain',
  TLDR: 'tldr',
  IMPROVE: 'improve',
  TRANSLATE: 'translate',
  ANSWER: 'answer',
} as const

export const ContextTypes = {
  PAGE: 'page',
  TEXT: 'text',
} as const

export const Languages = {
  ENGLISH: 'english',
  UKRAINIAN: 'ukrainian',
  RUSSIAN: 'russian',
} as const
export type Language = typeof Languages[keyof typeof Languages]
export type ContextType = typeof ContextTypes[keyof typeof ContextTypes]
export type Question = typeof Questions[keyof typeof Questions]

export function isQuestionAutomatic(question: Question) {
  return ![Questions.MANUAL, Questions.TRANSLATE, Questions.ANSWER].includes(question)
}

export function createPrompt(input: {
  context: string
  contextType: ContextType
  language: Language
  question: Question
}) {
  const question = input.question

  return [
    input.language === Languages.UKRAINIAN
      ? `Використовуючи даний ${stringifyContextType(input)}:`
      : input.language === Languages.RUSSIAN
      ? `Используя данный ${stringifyContextType(input)}:`
      : `Given this ${stringifyContextType(input)}:`,
    `"${input.context}"`,
    '',
    generateQuestion({
      question,
      contextType: input.contextType,
      language: input.language,
    }),
  ].join('\n')
}

function generateQuestion(input: {
  question: Question
  contextType: ContextType
  language: Language
}) {
  const stringifedContextType = stringifyContextType(input)
  const stringifiedLanguage = stringifyLanguage(input.language)

  if (input.language === Languages.UKRAINIAN) {
    return {
      [Questions.MANUAL]: '',
      [Questions.EXPLAIN]: `Поясни наданий ${stringifedContextType} та надай висновки чи додаткові деталі за необхідності. `,
      [Questions.TLDR]: `Надай короткий опис (TL;DR) використовуючи наданий ${stringifedContextType}. `,
      [Questions.IMPROVE]: `Переглянь наданий ${stringifedContextType}, виправивши будь-які граматичні помилки, усунувши помилки друку, додавши відповідну пунктуацію, розставивши великі літери в реченнях та покращивши текст, зберігаючи початкову структуру. `,
      [Questions.TRANSLATE]: `Переклади наданий ${stringifedContextType}${stringifiedLanguage ? ` з ${stringifiedLanguage}` : ''} на `,
      [Questions.ANSWER]: `Використовуючи наданий ${stringifedContextType}, напиши відповідь:\n`,
    }[input.question]
  }

  if (input.language === Languages.RUSSIAN) {
    return {
      [Questions.MANUAL]: '',
      [Questions.EXPLAIN]: `Объясни предоставленный ${stringifedContextType} и предложи дополнительные сведения или подробности при необходимости. `,
      [Questions.TLDR]: `Предоставь краткое изложение (TL;DR) используя предоставленный ${stringifedContextType}. `,
      [Questions.IMPROVE]: `Пересмотри предоставленный ${stringifedContextType}, исправив любые грамматические ошибки, исправив опечатки, добавив соответствующую пунктуацию, расставив заглавные буквы в предложениях и улучшив текст, сохраняя при этом исходную структуру. `,
      [Questions.TRANSLATE]: `Переведи предоставленный ${stringifedContextType}${stringifiedLanguage ? ` с ${stringifiedLanguage}` : ''} на `,
      [Questions.ANSWER]: `Используя предоставленный ${stringifedContextType}, напиши ответ:\n`,
    }[input.question]
  }

  return {
    [Questions.MANUAL]: '',
    [Questions.EXPLAIN]: `Explain the provided ${stringifedContextType} and offer insights or further details if necessary. `,
    [Questions.TLDR]: `Provide a brief summary (TL;DR) of the provided ${stringifedContextType}. `,
    [Questions.IMPROVE]: `Revise the provided ${stringifedContextType} by correcting any grammatical errors, fixing typos, adding appropriate punctuation, capitalizing sentences, and improving the writing while maintaining the original structure. `,
    [Questions.TRANSLATE]: `Translate the provided ${stringifedContextType}${stringifiedLanguage ? ` from ${stringifiedLanguage}` : ''} to`,
    [Questions.ANSWER]: `Using this ${stringifedContextType}, write an answer:\n`,
  }[input.question]
}

export function stringifyContextType(input: {
  contextType: ContextType
  language: Language
}) {
  if (input.language === Languages.UKRAINIAN) {
    return {
      [ContextTypes.TEXT]: 'текст',
      [ContextTypes.PAGE]: 'веб-сайт',
    }[input.contextType]
  }

  if (input.language === Languages.RUSSIAN) {
    return {
      [ContextTypes.TEXT]: 'текст',
      [ContextTypes.PAGE]: 'веб-сайт',
    }[input.contextType]
  }

  return {
    [ContextTypes.TEXT]: 'text',
    [ContextTypes.PAGE]: 'webpage',
  }[input.contextType]
}

export function stringifyLanguage(language: Language) {
  if (language === Languages.ENGLISH) return 'English'
  if (language === Languages.UKRAINIAN) return 'української'
  if (language === Languages.RUSSIAN) return 'русского'
  return undefined
}

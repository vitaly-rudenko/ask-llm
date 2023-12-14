export enum Question {
  MANUAL = 'manual',
  EXPLAIN = 'explain',
  TLDR = 'tldr',
  IMPROVE = 'improve',
  TRANSLATE = 'translate',
}

export enum ContextType {
  PAGE = 'page',
  TEXT = 'text',
}

export enum Language {
  ENGLISH = 'english',
  UKRAINIAN = 'ukrainian',
  RUSSIAN = 'russian',
}

export function isQuestionAutomatic(question: Question) {
  return ![Question.MANUAL, Question.TRANSLATE].includes(question)
}

export function createPrompt(input: {
  context: string
  contextType: ContextType
  language: Language
  question: Question
}) {
  const question = input.question

  return [
    input.language === Language.UKRAINIAN
      ? `Використовуючи даний ${stringifyContextType(input)}:`
      : input.language === Language.RUSSIAN
      ? `Используя данный ${stringifyContextType(input)}:`
      : `Given this ${stringifyContextType(input)}:`,
    `"${input.context}"`,
    '',
    question === Question.MANUAL ? '' : generateQuestion({
      question,
      contextType: input.contextType,
      language: input.language,
    }) + ' ',
  ].join('\n')
}

function generateQuestion(input: {
  question: Question
  contextType: ContextType
  language: Language
}) {
  const stringifedContextType = stringifyContextType(input)
  const stringifiedLanguage = stringifyLanguage(input.language)

  if (input.language === Language.UKRAINIAN) {
    return {
      [Question.MANUAL]: '',
      [Question.EXPLAIN]: `Поясніть наданий ${stringifedContextType} та надайте висновки чи додаткові деталі за необхідності.`,
      [Question.TLDR]: `Надайте короткий опис (TL;DR) використовуючи наданий ${stringifedContextType}.`,
      [Question.IMPROVE]: `Перегляньте наданий ${stringifedContextType}, виправивши будь-які граматичні помилки, усунувши помилки друку, додавши відповідну пунктуацію, розставивши великі літери в реченнях та покращивши текст, зберігаючи початкову структуру.`,
      [Question.TRANSLATE]: `Перекладіть наданий ${stringifedContextType}${stringifiedLanguage ? ` з ${stringifiedLanguage}` : ''} на`,
    }[input.question]
  }

  if (input.language === Language.RUSSIAN) {
    return {
      [Question.MANUAL]: '',
      [Question.EXPLAIN]: `Объясните предоставленный ${stringifedContextType} и предложите дополнительные сведения или подробности при необходимости.`,
      [Question.TLDR]: `Предоставьте краткое изложение (TL;DR) используя предоставленный ${stringifedContextType}.`,
      [Question.IMPROVE]: `Пересмотрите предоставленный ${stringifedContextType}, исправив любые грамматические ошибки, исправив опечатки, добавив соответствующую пунктуацию, расставив заглавные буквы в предложениях и улучшив текст, сохраняя при этом исходную структуру.`,
      [Question.TRANSLATE]: `Переведите предоставленный ${stringifedContextType}${stringifiedLanguage ? ` с ${stringifiedLanguage}` : ''} на`,
    }[input.question]
  }

  return {
    [Question.MANUAL]: '',
    [Question.EXPLAIN]: `Explain the provided ${stringifedContextType} and offer insights or further details if necessary.`,
    [Question.TLDR]: `Provide a brief summary (TL;DR) of the provided ${stringifedContextType}.`,
    [Question.IMPROVE]: `Revise the provided ${stringifedContextType} by correcting any grammatical errors, fixing typos, adding appropriate punctuation, capitalizing sentences, and improving the writing while maintaining the original structure.`,
    [Question.TRANSLATE]: `Translate the provided ${stringifedContextType}${stringifiedLanguage ? ` from ${stringifiedLanguage}` : ''} to`,
  }[input.question]
}

export function stringifyContextType(input: {
  contextType: ContextType
  language: Language
}) {
  if (input.language === Language.UKRAINIAN) {
    return {
      [ContextType.TEXT]: 'текст',
      [ContextType.PAGE]: 'веб-сайт',
    }[input.contextType]
  }

  if (input.language === Language.RUSSIAN) {
    return {
      [ContextType.TEXT]: 'текст',
      [ContextType.PAGE]: 'веб-сайт',
    }[input.contextType]
  }

  return {
    [ContextType.TEXT]: 'text',
    [ContextType.PAGE]: 'webpage',
  }[input.contextType]
}

export function stringifyLanguage(language: Language) {
  if (language === Language.ENGLISH) return 'English'
  if (language === Language.UKRAINIAN) return 'української'
  if (language === Language.RUSSIAN) return 'русского'
  return undefined
}

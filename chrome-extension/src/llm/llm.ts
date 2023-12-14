import { oneLine } from 'common-tags'

export const Questions = {
  MANUAL: 'manual',
  EXPLAIN: 'explain',
  TLDR: 'tldr',
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
  BARD: 'bard',
} as const

export type Language = typeof Languages[keyof typeof Languages]
export type Question = typeof Questions[keyof typeof Questions]
export type Llm = typeof Llms[keyof typeof Llms]


export function isQuestionAutomatic(question: Question) {
  return ([Questions.EXPLAIN, Questions.TLDR, Questions.IMPROVE, Questions.QUIZ] as Question[]).includes(question)
}

export function createPrompt(input: {
  context: string
  language: Language
  question: Question
}) {
  const question = input.question

  return [
    input.language === Languages.UKRAINIAN
      ? `Наданий текст:`
      : input.language === Languages.RUSSIAN
      ? `Представленный текст:`
      : `Provided text:`,
    `"${input.context}"`,
    '',
    generateQuestion({
      question,
      language: input.language,
    }),
  ].join('\n')
}

function generateQuestion(input: {
  question: Question
  language: Language
}) {
  const question = input.question
  if (question === Questions.MANUAL) return ''

  const language = {
    [Languages.ENGLISH]: 'English',
    [Languages.UKRAINIAN]: 'української мови',
    [Languages.RUSSIAN]: 'русского языка',
  }[input.language]

  if (input.language === Languages.UKRAINIAN) {
    return {
      [Questions.EXPLAIN]: 'Поясни наданий текст та надай висновки чи додаткові деталі за необхідності.',
      [Questions.TLDR]: 'Надай короткий опис (TL;DR) використовуючи наданий текст.',
      [Questions.IMPROVE]: oneLine`
        Переглянь наданий текст, виправ граматичні помилки, усунь помилки друку,
        додай відповідну пунктуацію, розстав великі літери в реченнях та покращи письмо,
        зберігаючи при цьому початкову структуру наданого тексту.
      `,
      [Questions.TRANSLATE]: `Переклади наданий текст з ${language} на `,
      [Questions.ANSWER]: 'Використовуючи наданий текст, напиши відповідь:\n',
      [Questions.QUIZ]: oneLine`
        Створи багатовибірковий тест на основі наданого тексту.
        Сформуй питання для перевірки мого розуміння теми у тексті.
        Задавай питання по черзі.
      `,
    }[question]
  }

  if (input.language === Languages.RUSSIAN) {
    return {
      [Questions.EXPLAIN]: 'Объясни предоставленный текст и предложи дополнительные сведения или подробности при необходимости.',
      [Questions.TLDR]: 'Предоставь краткое изложение (TL;DR) используя предоставленный текст.',
      [Questions.IMPROVE]: oneLine`
        Пересмотри предоставленный текст, исправь грамматические ошибки и опечатки,
        добавь соответствующую пунктуацию, расставь заглавные буквы в предложениях и улучши написание,
        сохраняя при этом исходную структуру предоставленного текста.
      `,
      [Questions.TRANSLATE]: `Переведи предоставленный текст с ${language} на `,
      [Questions.ANSWER]: 'Используя предоставленный текст, напиши ответ:\n',
      [Questions.QUIZ]: oneLine`
        Создай многовариантный тест на основе предоставленного текста.
        Сформулируй вопросы, чтобы проверить моё понимание темы текста.
        Задавай вопросы по очереди.
      `,
    }[question]
  }

  return {
    [Questions.EXPLAIN]: 'Explain the provided text and offer insights or further details if necessary.',
    [Questions.TLDR]: 'Provide a brief summary (TL;DR) of the provided text.',
    [Questions.IMPROVE]: oneLine`
      Revise the provided text by correcting grammatical errors, fix typos,
      add appropriate punctuation, capitalize each sentence,
      and improve the writing while maintaining the original structure of the provided text.
    `,
    [Questions.TRANSLATE]: `Translate the provided text from ${language} to `,
    [Questions.ANSWER]: 'Using the provided text, write an answer:\n',
    [Questions.QUIZ]: oneLine`
      Create a multi-choice quiz based on the provided text.
      Generate questions to test my understanding of the topic in the text.
      Ask the questions one-by-one.
    `,
  }[question]
}

export function stringifyLanguageForTranslation(language: Language) {
  if (language === Languages.ENGLISH) return 'English'
  if (language === Languages.UKRAINIAN) return 'української'
  if (language === Languages.RUSSIAN) return 'русского'
  return undefined
}

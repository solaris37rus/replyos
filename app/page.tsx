'use client';

import { useEffect, useMemo, useState } from 'react';

type Goal = 'money' | 'reply' | 'revive' | 'life' | 'custom';
type Niche = 'business' | 'daily' | 'love' | 'work' | 'custom';
type LangMode = 'auto' | 'ru' | 'en';
type Lang = 'ru' | 'en';

type Localized = {
  ru: string;
  en: string;
};

type AnalysisResult = {
  niche: string;
  goal: string;
  language: string;
  summary: string;
  analysis: {
    interest: 'низкий' | 'средний' | 'высокий';
    ignoreRisk: 'низкий' | 'средний' | 'высокий';
    controlBalance: 'низкий' | 'средний' | 'высокий';
    mainMistake: string;
    psychologicalRead: string;
  };
  replies: { style: string; text: string; whyItWorks: string }[];
  strategy: {
    doNow: string;
    ifNoReply: string;
    whenNotToWrite: string;
    regainControl: string;
  };
  whyUserCameHere: string;
  nextStep: string;
  confidence: number;
};

type NicheCard = {
  key: Niche;
  title: Localized;
  subtitle: Localized;
  outcome: Localized;
  examples: Localized[];
};

type GoalCard = {
  key: Goal;
  label: Localized;
  hint: Localized;
};

type FeatureItem = {
  icon: string;
  title: Localized;
  text: Localized;
};

type TestimonialItem = {
  quote: Localized;
  name: string;
  role: Localized;
};

type FaqItem = {
  q: Localized;
  a: Localized;
};

type PricingItem = {
  name: Localized;
  price: string;
  points: Localized[];
  accent: 'white' | 'cyan' | 'violet';
};

const NICHES: NicheCard[] = [
  {
    key: 'business',
    title: { ru: 'Бизнес и деньги', en: 'Business & Money' },
    subtitle: { ru: 'Клиенты, сделки, оплата, возвраты', en: 'Clients, deals, payment, follow-up' },
    outcome: { ru: 'Вернуть ответ, дожать, закрыть на оплату', en: 'Get a reply, move the deal, close payment' },
    examples: [
      { ru: 'Клиент пропал после КП', en: 'Client disappeared after the proposal' },
      { ru: 'Надо мягко дожать оплату', en: 'Need to nudge payment politely' },
      { ru: 'Хочу вернуть интерес после молчания', en: 'Need to revive interest after silence' },
    ],
  },
  {
    key: 'daily',
    title: { ru: 'Обыденная жизнь', en: 'Daily Life' },
    subtitle: { ru: 'Конфликты, договорённости, сложные сообщения', en: 'Conflict, agreements, hard conversations' },
    outcome: { ru: 'Снять напряжение и вернуть контроль', en: 'Reduce tension and regain control' },
    examples: [
      { ru: 'Нужно ответить без ссоры', en: 'Need to answer without a fight' },
      { ru: 'Человек игнорирует сообщение', en: 'Someone ignores my message' },
      { ru: 'Надо договориться спокойно', en: 'Need to agree calmly' },
    ],
  },
  {
    key: 'love',
    title: { ru: 'Любовь и отношения', en: 'Love & Relationships' },
    subtitle: { ru: 'Дейтинг, бывшие, ревность, сближение', en: 'Dating, exes, tension, reconnection' },
    outcome: { ru: 'Вернуть контакт и интерес', en: 'Bring back contact and interest' },
    examples: [
      { ru: 'Хочу вернуть общение', en: 'I want to bring back the conversation' },
      { ru: 'Не понимаю, интересен ли я', en: 'I do not know if they are interested' },
      { ru: 'Нужно написать без давления', en: 'Need to write without pressure' },
    ],
  },
  {
    key: 'work',
    title: { ru: 'Работа и карьера', en: 'Work & Career' },
    subtitle: { ru: 'Коллеги, начальство, фидбек', en: 'Colleagues, managers, feedback' },
    outcome: { ru: 'Ответить уверенно и сохранить позицию', en: 'Respond confidently and keep your position' },
    examples: [
      { ru: 'Нужно ответить руководителю', en: 'Need to reply to a manager' },
      { ru: 'Конфликт в рабочем чате', en: 'Conflict in a work chat' },
      { ru: 'Хочу отстоять свою позицию', en: 'Want to stand my ground' },
    ],
  },
  {
    key: 'custom',
    title: { ru: 'Своя задача', en: 'Custom Situation' },
    subtitle: { ru: 'Любой другой контекст', en: 'Any other context' },
    outcome: { ru: 'Подстроить анализ под ситуацию', en: 'Adapt the analysis to the situation' },
    examples: [
      { ru: 'Свой случай без категории', en: 'My own case without a category' },
      { ru: 'Нужен универсальный разбор', en: 'Need a universal breakdown' },
      { ru: 'Сначала понять, что делать', en: 'Need to understand what to do first' },
    ],
  },
];

const GOALS: GoalCard[] = [
  { key: 'money', label: { ru: 'Закрыть на деньги', en: 'Close for money' }, hint: { ru: 'Продажа, оплата, сделка', en: 'Sales, payment, deal' } },
  { key: 'reply', label: { ru: 'Получить ответ', en: 'Get a reply' }, hint: { ru: 'Снять игнор и вернуть диалог', en: 'End silence and restart the chat' } },
  { key: 'revive', label: { ru: 'Вернуть контакт', en: 'Revive contact' }, hint: { ru: 'Дожать, восстановить интерес', en: 'Re-engage and restore interest' } },
  { key: 'life', label: { ru: 'Обычное общение', en: 'Everyday conversation' }, hint: { ru: 'Ответить лучше и спокойнее', en: 'Reply better and calmer' } },
  { key: 'custom', label: { ru: 'Своя цель', en: 'Custom goal' }, hint: { ru: 'Подстроить под задачу', en: 'Adapt to the task' } },
];

const DEFAULT_TEXT: Record<Niche, Localized> = {
  business: {
    ru: 'Клиент пропал после коммерческого предложения. Что написать, чтобы вернуть диалог и не выглядеть навязчиво?',
    en: 'A client disappeared after the proposal. What should I say to bring the conversation back without sounding pushy?',
  },
  daily: {
    ru: 'Человек читает сообщения и не отвечает. Как написать коротко, спокойно и без давления?',
    en: 'Someone reads messages and does not reply. How do I write a short, calm message without pressure?',
  },
  love: {
    ru: 'Нужно вернуть контакт после паузы. Как написать так, чтобы не оттолкнуть человека?',
    en: 'Need to reconnect after a pause. How do I write without pushing them away?',
  },
  work: {
    ru: 'В рабочем чате есть напряжение. Как ответить уверенно и без лишнего конфликта?',
    en: 'There is tension in a work chat. How do I reply confidently without escalating conflict?',
  },
  custom: {
    ru: 'Вставь переписку сюда, и я помогу понять, что писать дальше.',
    en: 'Paste the conversation here, and I will help you figure out the next move.',
  },
};

const COPY = {
  ru: {
    brand: 'ReplyOS',
    tagline: 'AI для тех, кто пришёл не за текстом, а за оплатой, ответом и контролем.',
    autoTranslate: 'Автоперевод',
    freeLeft: 'бесплатных анализов осталось',
    heroKicker: 'Outcome Engine for Conversations',
    heroTitle1: 'Превращай',
    heroTitle2: 'молчание в результат.',
    heroText: 'ReplyOS показывает, что реально происходит в переписке, и даёт следующий шаг, который повышает шанс на ответ, сделку и деньги.',
    primaryCta: 'Анализировать',
    secondaryCta: 'Тарифы',
    analyzerLabel: 'Анализатор',
    resultsLabel: 'Результат',
    nicheTitle: '1. Сначала выбери, зачем ты пришёл',
    goalTitle: '2. Что нужно получить из диалога',
    conversationTitle: '3. Вставь переписку',
    analyzerHint: 'Язык ответа будет как у пользователя',
    analyze: 'Analyze',
    loading: 'Analyzing…',
    noResult: 'Пока нет анализа',
    heroBullets: ['Разобрать динамику диалога', 'Показать 3 сильных ответа', 'Подсказать следующий шаг'],
    valueTitle: 'Почему люди приходят в ReplyOS',
    valueText: 'Когда нужен не совет ради совета, а исход: ответ, деньги, ясность, контакт, спокойствие или контроль.',
    valuePoints: [
      'Бизнес: вернуть клиента, закрыть оплату, дожать сделку',
      'Жизнь: ответить без конфликта и не потерять лицо',
      'Любовь: вернуть интерес и не усилить дистанцию',
      'Работа: ответить уверенно и сохранить позицию',
    ],
    analysisBlocksTitle: 'Что покажет ReplyOS',
    analysisBlocks: [
      { title: 'Анализ', text: 'Интерес, риск игнора, баланс контроля, главная ошибка.' },
      { title: '3 ответа', text: 'Продающий, уверенный и мягкий вариант.' },
      { title: 'Стратегия', text: 'Что делать сейчас, если нет ответа, и когда лучше не писать.' },
    ],
    replyTitle: 'Лучшие ответы',
    replyBest: 'Лучший',
    scoreTitle: 'Оценка диалога',
    diagnosisTitle: 'Диагноз',
    strategyTitle: 'Стратегия',
    confidenceTitle: 'Уверенность',
    whyUserCameHereLabel: 'Почему человек пришёл',
    nextStepLabel: 'Следующий шаг',
    mainMistakeLabel: 'Главная ошибка',
    psychologicalReadLabel: 'Психология собеседника',
    doNowLabel: 'Что написать сейчас',
    ifNoReplyLabel: 'Если нет ответа',
    whenNotToWriteLabel: 'Когда не писать',
    regainControlLabel: 'Как вернуть контроль',
    copyReply: 'Скопировать ответ',
    shareResult: 'Поделиться',
    copied: 'Скопировано',
    checkout: 'Оплатить',
    continueToPricing: 'Смотреть тарифы',
    mostPopular: 'Самый популярный',
    teamReady: 'Для команды',
    starter: 'Старт',
    paywallLabel: 'Оплата',
    testimonialsLabel: 'Отзывы',
    footer: 'ReplyOS • Outcome Engine для переписок',
    pricingTitle: 'Монетизация, которая чувствуется честно и продаёт',
    pricingText: 'Free показывает ценность, Pro помогает зарабатывать на каждом диалоге, Team превращает ReplyOS в рабочий инструмент для продаж и закрытия сделок.',
    faqTitle: 'FAQ',
    finalTitle: 'Выигрывай следующий ответ и следующий чек.',
    finalText: 'ReplyOS создан для ответов, сделок, возврата контакта и сложных разговоров. Сайт должен продавать не текст, а исход, который приносит деньги.',
    upgradePro: 'Открыть Pro',
    startTeam: 'Team для продаж',
    paywallTitle: 'Бесплатные разборы закончились — дальше начинается рост выручки.',
    paywallText: 'Откройте Pro, чтобы получать больше ответов, больше сделок и меньше потерянных контактов.',
    paywallCaption: 'Следующий разбор должен уже приносить деньги, а не просто интерес.',
    socialProofLabel: 'Премиальный AI-инструмент',
    socialProof: ['Reply probability', 'Deal probability', 'Trust balance', 'Confidence meter'],
    featureCards: [
      { icon: '01', title: { ru: 'Conversation Score', en: 'Conversation Score' }, text: { ru: 'Показывает вероятность ответа, доверие и баланс контроля.', en: 'Shows reply probability, trust, and control balance.' } },
      { icon: '02', title: { ru: 'Best Next Replies', en: 'Best Next Replies' }, text: { ru: 'Генерирует 3 сильных ответа для разных стратегий общения.', en: 'Generates 3 strong replies for different communication strategies.' } },
      { icon: '03', title: { ru: 'Action Strategy', en: 'Action Strategy' }, text: { ru: 'Даёт тайминг, паузу, follow-up и возврат контроля.', en: 'Gives timing, pause, follow-up, and control recovery.' } },
      { icon: '04', title: { ru: 'Confidence Meter', en: 'Confidence Meter' }, text: { ru: 'Показывает, насколько прогноз надёжен и где риск ошибки.', en: 'Shows how reliable the forecast is and where the risk is.' } },
    ],
    testimonials: [
      { quote: { ru: 'Это ощущается как дорогой продукт, а не просто генератор текста.', en: 'This feels like a premium product, not just a text generator.' }, name: 'Maya', role: { ru: 'Фриланс-продажи', en: 'Freelance Sales' } },
      { quote: { ru: 'Сайт сразу понял мою проблему и дал ответ, который можно отправить.', en: 'The site understood my problem instantly and gave a sendable reply.' }, name: 'Anton', role: { ru: 'Агентство', en: 'Agency Owner' } },
      { quote: { ru: 'Появилось ощущение контроля в очень сложной переписке.', en: 'It gave me a real sense of control in a hard conversation.' }, name: 'Daria', role: { ru: 'Продуктовый менеджер', en: 'Product Manager' } },
    ],
    faq: [
      { q: { ru: 'Это чат-бот?', en: 'Is this a chatbot?' }, a: { ru: 'Нет. Это outcome engine: система, которая помогает улучшать исход разговора, а не просто писать текст.', en: 'No. It is an outcome engine: a system that helps improve the result of a conversation, not just write text.' } },
      { q: { ru: 'Почему только 3 бесплатных анализа?', en: 'Why only 3 free analyses?' }, a: { ru: 'Потому что ReplyOS должен быстро показать ценность и мягко перевести пользователя в оплату.', en: 'Because ReplyOS should show value quickly and convert gently into payment.' } },
      { q: { ru: 'Можно ли использовать на русском?', en: 'Can I use it in Russian?' }, a: { ru: 'Да. Интерфейс можно переключать вручную или через автоперевод.', en: 'Yes. The interface can switch manually or through auto translate.' } },
      { q: { ru: 'Можно ли сохранить историю?', en: 'Can I save history?' }, a: { ru: 'Это логичный следующий шаг для Pro и Team, когда добавим авторизацию и базу.', en: 'That is the logical next step for Pro and Team once auth and storage are added.' } },
    ],
    pricing: [
      { name: { ru: 'Free', en: 'Free' }, price: '$0', points: [{ ru: '3 анализа', en: '3 analyses' }, { ru: 'Базовый score', en: 'Basic score' }, { ru: '3 режима ответа', en: '3 reply modes' }], accent: 'white' },
      { name: { ru: 'Pro', en: 'Pro' }, price: '$19/mo', points: [{ ru: 'Безлимит', en: 'Unlimited' }, { ru: 'Premium modes', en: 'Premium modes' }, { ru: 'История', en: 'History' }, { ru: 'Глубже психология', en: 'Deeper psychology' }], accent: 'cyan' },
      { name: { ru: 'Team', en: 'Team' }, price: '$49/mo', points: [{ ru: 'Несколько пользователей', en: 'Multi-user' }, { ru: 'CRM mode', en: 'CRM mode' }, { ru: 'Templates', en: 'Templates' }, { ru: 'Analytics', en: 'Analytics' }], accent: 'violet' },
    ],
  },
  en: {
    brand: 'ReplyOS',
    tagline: 'AI for people who do not want text — they want outcomes.',
    autoTranslate: 'Auto Translate',
    freeLeft: 'free analyses left',
    heroKicker: 'Outcome Engine for Conversations',
    heroTitle1: 'Turn',
    heroTitle2: 'silence into outcomes.',
    heroText: 'ReplyOS shows what is really happening in the conversation and gives you the next move that changes the result.',
    primaryCta: 'Analyze Now',
    secondaryCta: 'Pricing',
    analyzerLabel: 'Analyzer',
    resultsLabel: 'Results',
    nicheTitle: '1. Start by choosing why you came here',
    goalTitle: '2. Choose the outcome you want',
    conversationTitle: '3. Paste the conversation',
    analyzerHint: 'The response language will match the user',
    analyze: 'Analyze',
    loading: 'Analyzing…',
    noResult: 'No analysis yet',
    heroBullets: ['Break down conversation dynamics', 'Show 3 strong replies', 'Suggest the next move'],
    valueTitle: 'Why people use ReplyOS',
    valueText: 'They do not want advice for the sake of advice. They want a better outcome: a reply, money, clarity, contact, calm, or control.',
    valuePoints: [
      'Business: bring back the client, close payment, move the deal',
      'Life: answer without conflict and keep your dignity',
      'Love: restore interest without adding pressure',
      'Work: respond confidently and keep your position',
    ],
    analysisBlocksTitle: 'What ReplyOS shows',
    analysisBlocks: [
      { title: 'Analysis', text: 'Interest, ignore risk, control balance, main mistake.' },
      { title: '3 replies', text: 'A selling reply, a confident reply, and a softer one.' },
      { title: 'Strategy', text: 'What to do now, when to wait, and when not to write.' },
    ],
    replyTitle: 'Best replies',
    replyBest: 'Best',
    scoreTitle: 'Conversation score',
    diagnosisTitle: 'Diagnosis',
    strategyTitle: 'Strategy',
    confidenceTitle: 'Confidence',
    whyUserCameHereLabel: 'Why the user came here',
    nextStepLabel: 'Next step',
    mainMistakeLabel: 'Main mistake',
    psychologicalReadLabel: 'Psychological read',
    doNowLabel: 'What to send now',
    ifNoReplyLabel: 'If there is no reply',
    whenNotToWriteLabel: 'When not to write',
    regainControlLabel: 'How to regain control',
    copyReply: 'Copy reply',
    shareResult: 'Share',
    copied: 'Copied',
    checkout: 'Checkout',
    continueToPricing: 'View pricing',
    mostPopular: 'Most popular',
    teamReady: 'Team ready',
    starter: 'Starter',
    paywallLabel: 'Checkout',
    testimonialsLabel: 'Testimonials',
    footer: 'ReplyOS • Outcome Engine for Conversations',
    pricingTitle: 'Monetization that feels fair',
    pricingText: 'Free shows value, Pro deepens analysis and replies, Team turns ReplyOS into a working tool for sales and deal closing.',
    faqTitle: 'FAQ',
    finalTitle: 'Win the next reply.',
    finalText: 'ReplyOS is built for replies, deals, reconnection, and hard conversations. The site must sell outcomes, not text.',
    upgradePro: 'Unlock Pro',
    startTeam: 'Team for sales',
    paywallTitle: 'You have unlocked your free analyses.',
    paywallText: 'Upgrade to keep winning conversations.',
    paywallCaption: 'Your free runs are gone.',
    socialProofLabel: 'Premium AI communication tool',
    socialProof: ['Reply probability', 'Deal probability', 'Trust balance', 'Confidence meter'],
    featureCards: [
      { icon: '01', title: { ru: 'Conversation Score', en: 'Conversation Score' }, text: { ru: 'Показывает вероятность ответа, доверие и баланс контроля.', en: 'Shows reply probability, trust, and control balance.' } },
      { icon: '02', title: { ru: 'Best Next Replies', en: 'Best Next Replies' }, text: { ru: 'Генерирует 3 сильных ответа для разных стратегий общения.', en: 'Generates 3 strong replies for different communication strategies.' } },
      { icon: '03', title: { ru: 'Action Strategy', en: 'Action Strategy' }, text: { ru: 'Даёт тайминг, паузу, follow-up и возврат контроля.', en: 'Gives timing, pause, follow-up, and control recovery.' } },
      { icon: '04', title: { ru: 'Confidence Meter', en: 'Confidence Meter' }, text: { ru: 'Показывает, насколько прогноз надёжен и где риск ошибки.', en: 'Shows how reliable the forecast is and where the risk is.' } },
    ],
    testimonials: [
      { quote: { ru: 'Это ощущается как дорогой продукт, а не просто генератор текста.', en: 'This feels like a premium product, not just a text generator.' }, name: 'Maya', role: { ru: 'Фриланс-продажи', en: 'Freelance Sales' } },
      { quote: { ru: 'Сайт сразу понял мою проблему и дал ответ, который можно отправить.', en: 'The site understood my problem instantly and gave a sendable reply.' }, name: 'Anton', role: { ru: 'Агентство', en: 'Agency Owner' } },
      { quote: { ru: 'Появилось ощущение контроля в очень сложной переписке.', en: 'It gave me a real sense of control in a hard conversation.' }, name: 'Daria', role: { ru: 'Продуктовый менеджер', en: 'Product Manager' } },
    ],
    faq: [
      { q: { ru: 'Это чат-бот?', en: 'Is this a chatbot?' }, a: { ru: 'Нет. Это outcome engine: система, которая помогает улучшать исход разговора, а не просто писать текст.', en: 'No. It is an outcome engine: a system that helps improve the result of a conversation, not just write text.' } },
      { q: { ru: 'Почему только 3 бесплатных анализа?', en: 'Why only 3 free analyses?' }, a: { ru: 'Потому что ReplyOS должен быстро показать ценность и мягко перевести пользователя в оплату.', en: 'Because ReplyOS should show value quickly and convert gently into payment.' } },
      { q: { ru: 'Можно ли использовать на русском?', en: 'Can I use it in Russian?' }, a: { ru: 'Да. Интерфейс можно переключать вручную или через автоперевод.', en: 'Yes. The interface can switch manually or through auto translate.' } },
      { q: { ru: 'Можно ли сохранить историю?', en: 'Can I save history?' }, a: { ru: 'Это логичный следующий шаг для Pro и Team, когда добавим авторизацию и базу.', en: 'That is the logical next step for Pro and Team once auth and storage are added.' } },
    ],
    pricing: [
      { name: { ru: 'Free', en: 'Free' }, price: '$0', points: [{ ru: '3 анализа', en: '3 analyses' }, { ru: 'Базовый score', en: 'Basic score' }, { ru: '3 режима ответа', en: '3 reply modes' }], accent: 'white' },
      { name: { ru: 'Pro', en: 'Pro' }, price: '$19/mo', points: [{ ru: 'Безлимит', en: 'Unlimited' }, { ru: 'Premium modes', en: 'Premium modes' }, { ru: 'История', en: 'History' }, { ru: 'Глубже психология', en: 'Deeper psychology' }], accent: 'cyan' },
      { name: { ru: 'Team', en: 'Team' }, price: '$49/mo', points: [{ ru: 'Несколько пользователей', en: 'Multi-user' }, { ru: 'CRM mode', en: 'CRM mode' }, { ru: 'Templates', en: 'Templates' }, { ru: 'Analytics', en: 'Analytics' }], accent: 'violet' },
    ],
  },
} as const;

const SCORE_LABELS: Record<Lang, { interest: string; ignoreRisk: string; controlBalance: string }> = {
  ru: { interest: 'Интерес', ignoreRisk: 'Риск игнора', controlBalance: 'Баланс контроля' },
  en: { interest: 'Interest', ignoreRisk: 'Ignore risk', controlBalance: 'Control balance' },
};

const INDICATOR_LABELS: Record<Lang, Record<string, string>> = {
  ru: {
    mainMistake: 'Главная ошибка',
    psychologicalRead: 'Психология собеседника',
    whatIsHappening: 'Что происходит',
    whyUserCameHere: 'Почему пришёл',
    nextStep: 'Следующий шаг',
    doNow: 'Что делать сейчас',
    ifNoReply: 'Если нет ответа',
    whenNotToWrite: 'Когда не писать',
    regainControl: 'Как вернуть контроль',
    confidence: 'Уверенность прогноза',
  },
  en: {
    mainMistake: 'Main mistake',
    psychologicalRead: 'Psychological read',
    whatIsHappening: 'What is happening',
    whyUserCameHere: 'Why they came here',
    nextStep: 'Next step',
    doNow: 'Do now',
    ifNoReply: 'If no reply',
    whenNotToWrite: 'When not to write',
    regainControl: 'Regain control',
    confidence: 'Confidence',
  },
};

function getBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'ru';
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function tx(value: string | Localized, lang: Lang): string {
  return typeof value === 'string' ? value : (value[lang] ?? value.ru);
}

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const PAYMENT_LINKS = {
  pro: process.env.NEXT_PUBLIC_REPLYOS_PRO_CHECKOUT_URL ?? '',
  team: process.env.NEXT_PUBLIC_REPLYOS_TEAM_CHECKOUT_URL ?? '',
} as const;

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_28px_120px_-40px_rgba(17,24,39,0.9)] backdrop-blur-2xl transition-transform duration-300 hover:-translate-y-1', className)}>
      {children}
    </div>
  );
}

function SectionLabel({ text, className }: { text: string; className?: string }) {
  return <div className={cn('text-[11px] uppercase tracking-[0.36em] text-white/45', className)}>{text}</div>;
}

function SectionTitle({ title, text }: { title: string; text?: string }) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
      {text ? <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 md:text-base">{text}</p> : null}
    </div>
  );
}

function SmallPill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/70">{children}</span>;
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
      <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">{label}</div>
      <div className="mt-3 text-xl font-semibold">{value}</div>
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/20 p-5">
      <div className="text-xs uppercase tracking-[0.22em] text-white/40">{label}</div>
      <div className="mt-3 text-2xl font-semibold capitalize">{value}</div>
      {hint ? <div className="mt-2 text-sm text-white/55">{hint}</div> : null}
    </div>
  );
}

function ScoreMeter({ label, value }: { label: string; value: number }) {
  const percent = clamp(value, 6, 96);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm text-white/65">
        <span>{label}</span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300 transition-all duration-700" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, text, lang }: FeatureItem & { lang: Lang }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
      <div className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] tracking-[0.25em] text-white/45">{icon}</div>
      <div className="mt-4 text-lg font-semibold">{tx(title, lang)}</div>
      <p className="mt-2 text-sm leading-6 text-white/60">{tx(text, lang)}</p>
    </div>
  );
}

function ReplyCard({ reply, isBest, onCopy, copied, lang }: { reply: { style: string; text: string; whyItWorks: string }; isBest: boolean; onCopy: () => void; copied: boolean; lang: Lang }) {
  return (
    <div className={cn('rounded-[24px] border p-5 transition', isBest ? 'border-white/20 bg-white/[0.08]' : 'border-white/10 bg-black/20')}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">{reply.style}</div>
          <div className="mt-3 text-base leading-7 text-white">{reply.text}</div>
        </div>
        {isBest ? <SmallPill>{lang === 'ru' ? 'ЛУЧШИЙ' : 'BEST'}</SmallPill> : null}
      </div>
      <div className="mt-4 text-sm leading-6 text-white/60">{reply.whyItWorks}</div>
      <button onClick={onCopy} className="mt-4 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]">
        {copied ? `✓ ${lang === 'ru' ? 'Скопировано' : 'Copied'}` : lang === 'ru' ? 'Скопировать ответ' : 'Copy reply'}
      </button>
    </div>
  );
}

function StrategyCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="mt-3 text-sm leading-6 text-white/65">{text}</p>
    </div>
  );
}

export default function Page() {
  const [text, setText] = useState('');
  const [niche, setNiche] = useState<Niche>('business');
  const [goal, setGoal] = useState<Goal>('reply');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [freeLeft, setFreeLeft] = useState(3);
  const [error, setError] = useState('');
  const [langMode, setLangMode] = useState<LangMode>('auto');
  const [mounted, setMounted] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const savedLeft = localStorage.getItem('replyos_free_left');
    const savedLang = localStorage.getItem('replyos_lang_mode') as LangMode | null;

    if (savedLeft !== null) {
      const parsed = Number(savedLeft);
      if (!Number.isNaN(parsed)) setFreeLeft(parsed);
    }
    if (savedLang === 'auto' || savedLang === 'ru' || savedLang === 'en') {
      setLangMode(savedLang);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('replyos_free_left', String(freeLeft));
  }, [freeLeft, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem('replyos_lang_mode', langMode);
  }, [langMode, mounted]);

  // FIX: До mount'а язык жестко ru, чтобы избежать Hydration Mismatch
  const resolvedLang: Lang = mounted ? (langMode === 'auto' ? getBrowserLang() : langMode) : 'ru';

  const ui = useMemo(() => COPY[resolvedLang], [resolvedLang]);
  const currentNiche = useMemo(() => NICHES.find((item) => item.key === niche) ?? NICHES[0], [niche]);
  const currentGoal = useMemo(() => GOALS.find((item) => item.key === goal) ?? GOALS[0], [goal]);

  const canAnalyze = freeLeft > 0;
  const score = result?.analysis;
  const replies = result?.replies ?? [];
  const confidence = result?.confidence ?? 0;

  function openPlanCheckout(plan: 'pro' | 'team') {
    const url = PAYMENT_LINKS[plan];
    if (url) {
      window.location.href = url;
      return true;
    }
    return false;
  }

  async function onAnalyze() {
    if (!text.trim()) {
      setError(resolvedLang === 'ru' ? 'Сначала вставь переписку.' : 'Paste a conversation first.');
      return;
    }
    if (!canAnalyze) {
      setPaywallOpen(true);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: text, niche, goal, locale: resolvedLang }),
      });

      if (res.status === 402) {
        setPaywallOpen(true);
        return;
      }
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      const data = (await res.json()) as AnalysisResult;
      setResult(data);
      setFreeLeft((prev) => Math.max(0, prev - 1));
    } catch {
      setError(resolvedLang === 'ru' ? 'Не удалось получить разбор. Проверь API и сеть.' : 'Could not get the analysis. Check the API and network.');
    } finally {
      setLoading(false);
    }
  }

  async function copyReply(replyText: string, index: number) {
    try {
      // GROWTH HACK: Если бесплатный тариф, добавляем виральную приписку (скрытый маркетинг)
      const watermark = resolvedLang === 'ru' ? '\n\n—\nСгенерировано в ReplyOS (replyos.com)' : '\n\n—\nGenerated by ReplyOS (replyos.com)';
      const textToCopy = freeLeft > 0 ? `${replyText}${watermark}` : replyText;
      
      await navigator.clipboard.writeText(textToCopy);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1200);
    } catch {
      setError(resolvedLang === 'ru' ? 'Не удалось скопировать текст.' : 'Could not copy the text.');
    }
  }

  async function shareCurrentResult() {
    if (!result) return;
    const best = result.replies?.[0]?.text ?? '';
    const payload = [
      `${ui.brand} — ${ui.tagline}`,
      `${ui.scoreTitle}: ${result.summary}`,
      `${ui.replyBest}: ${best}`,
      `${ui.nextStepLabel}: ${result.nextStep}`,
      `https://replyos.com`
    ].filter(Boolean).join('\n');

    try {
      if (navigator.share) await navigator.share({ title: ui.brand, text: payload });
      else await navigator.clipboard.writeText(payload);
    } catch {
      setError(resolvedLang === 'ru' ? 'Не удалось поделиться результатом.' : 'Could not share the result.');
    }
  }

  return (
    <main suppressHydrationWarning className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_82%_82%,rgba(168,85,247,0.16),transparent_38%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_12%,rgba(255,255,255,0.03))] opacity-70" />
        <div className="absolute left-[-8rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[150px]" />
        <div className="absolute right-[-8rem] top-[18rem] h-[30rem] w-[30rem] rounded-full bg-violet-500/10 blur-[160px]" />
        <div className="absolute bottom-[-10rem] left-[20%] h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 md:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.035] px-5 py-4 backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/14 to-white/5 text-lg font-semibold shadow-[0_0_40px_-10px_rgba(255,255,255,0.25)]">
              R
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight md:text-2xl">{ui.brand}</div>
              <p className="text-sm text-white/60">{ui.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/[0.05] p-1">
              {(['auto', 'ru', 'en'] as LangMode[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setLangMode(item)}
                  className={cn('rounded-full px-4 py-2 text-xs font-medium transition', langMode === item ? 'bg-white text-black' : 'text-white/65 hover:bg-white/10 hover:text-white')}
                >
                  {item === 'auto' ? ui.autoTranslate : item.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/70">
              {mounted ? freeLeft : 3} {ui.freeLeft}
            </div>
            <a href="#pricing" className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.08]">
              {ui.secondaryCta}
            </a>
          </div>
        </header>

        <section className="grid gap-8 pb-14 pt-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/55">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
              {ui.heroKicker}
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[0.96] tracking-tight md:text-7xl">
              {ui.heroTitle1} <span className="bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">{ui.heroTitle2}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/68 md:text-xl">{ui.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#analyzer" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]">{ui.primaryCta}</a>
              <a href="#pricing" className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]">{ui.secondaryCta}</a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {ui.socialProof.map((item) => <HeroStat key={item} label={ui.socialProofLabel} value={item} />)}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <HeroStat label={resolvedLang === 'ru' ? 'Исход' : 'Outcome'} value={resolvedLang === 'ru' ? 'Ответы / сделки / выручка' : 'Replies / deals / revenue'} />
              <HeroStat label={resolvedLang === 'ru' ? 'Поток' : 'Flow'} value={resolvedLang === 'ru' ? 'Анализ → диагноз → действие' : 'Analyze → Diagnose → Act'} />
              <HeroStat label={resolvedLang === 'ru' ? 'Риск' : 'Risk'} value={resolvedLang === 'ru' ? 'Создан, чтобы конвертировать' : 'Built to convert'} />
            </div>
          </div>
          <div className="lg:col-span-5">
            <GlassCard className="p-6 lg:sticky lg:top-6">
              <div className="flex items-center justify-between">
                <div>
                  <SectionLabel text={ui.analyzerLabel} />
                  <div className="mt-2 text-2xl font-semibold">{ui.resultsLabel}</div>
                </div>
                <SmallPill>{mounted ? freeLeft : 3} free</SmallPill>
              </div>
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">{resolvedLang === 'ru' ? 'Ответ' : 'Reply'}</div>
                    <div className="mt-2 text-xl font-semibold">{resolvedLang === 'ru' ? 'Живой' : 'Live'}</div>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">{resolvedLang === 'ru' ? 'Сделка' : 'Deal'}</div>
                    <div className="mt-2 text-xl font-semibold">{resolvedLang === 'ru' ? 'Оценка' : 'Score'}</div>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">{resolvedLang === 'ru' ? 'Доверие' : 'Trust'}</div>
                    <div className="mt-2 text-xl font-semibold">{resolvedLang === 'ru' ? 'Слой' : 'Layer'}</div>
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/40">{resolvedLang === 'ru' ? '3-шаговый движок' : '3-step engine'}</div>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
                      <div className="font-semibold">{resolvedLang === 'ru' ? '1. Диагноз' : '1. Diagnose'}</div>
                      <p className="mt-2 text-sm text-white/60">{resolvedLang === 'ru' ? 'Понять реальную причину молчания.' : 'Understand the real friction behind silence.'}</p>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
                      <div className="font-semibold">{resolvedLang === 'ru' ? '2. Генерация' : '2. Generate'}</div>
                      <p className="mt-2 text-sm text-white/60">{resolvedLang === 'ru' ? 'Сгенерировать ответы под разные стратегии.' : 'Produce reply options for different strategies.'}</p>
                    </div>
                    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
                      <div className="font-semibold">{resolvedLang === 'ru' ? '3. Контроль' : '3. Control'}</div>
                      <p className="mt-2 text-sm text-white/60">{resolvedLang === 'ru' ? 'Понять, когда писать, ждать или менять рамку.' : 'Decide when to write, wait, or shift the frame.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-12">
          <GlassCard className="p-6 xl:col-span-7">
            <SectionLabel text={ui.nicheTitle} />
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {NICHES.map((item) => {
                const active = item.key === niche;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setNiche(item.key);
                      if (!text.trim()) setText(tx(DEFAULT_TEXT[item.key], resolvedLang));
                    }}
                    className={cn('rounded-[24px] border p-5 text-left transition-all duration-200 hover:-translate-y-0.5', active ? 'border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_40px_-20px_rgba(34,211,238,0.45)]' : 'border-white/10 bg-black/20 hover:border-white/20')}
                  >
                    <div className="text-lg font-semibold">{tx(item.title, resolvedLang)}</div>
                    <div className="mt-2 text-sm text-white/60">{tx(item.subtitle, resolvedLang)}</div>
                    <div className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-200/90">{tx(item.outcome, resolvedLang)}</div>
                  </button>
                );
              })}
            </div>
          </GlassCard>
          <GlassCard className="p-6 xl:col-span-5">
            <SectionLabel text={ui.goalTitle} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {GOALS.map((item) => {
                const active = item.key === goal;
                return (
                  <button
                    key={item.key}
                    onClick={() => setGoal(item.key)}
                    className={cn('rounded-[24px] border p-5 text-left transition-all duration-200 hover:-translate-y-0.5', active ? 'border-white bg-white text-black shadow-[0_0_50px_-20px_rgba(255,255,255,0.45)]' : 'border-white/10 bg-black/20 hover:border-white/20')}
                  >
                    <div className="text-base font-semibold">{tx(item.label, resolvedLang)}</div>
                    <div className={cn('mt-2 text-sm', active ? 'text-black/70' : 'text-white/55')}>{tx(item.hint, resolvedLang)}</div>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </section>

        <section id="analyzer" className="mt-6 grid gap-6 lg:grid-cols-12">
          <GlassCard className="p-6 lg:col-span-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionLabel text={ui.conversationTitle} />
                <h2 className="mt-3 text-2xl font-semibold">{resolvedLang === 'ru' ? '3. Вставь переписку' : '3. Paste the conversation'}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <SmallPill>{tx(currentNiche.title, resolvedLang)}</SmallPill>
                  <SmallPill>{tx(currentGoal.label, resolvedLang)}</SmallPill>
                </div>
              </div>
              <SmallPill>{ui.analyzerHint}</SmallPill>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={resolvedLang === 'ru' ? 'Вставь сюда переписку целиком...' : 'Paste the full conversation here...'}
              className="mt-5 min-h-[220px] w-full rounded-[24px] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/60 sm:min-h-[280px]"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {currentNiche.examples.map((example) => (
                <button
                  key={tx(example, resolvedLang)}
                  onClick={() => setText(tx(example, resolvedLang))}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  {tx(example, resolvedLang)}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={onAnalyze}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? ui.loading : ui.analyze}
              </button>
              <div className="text-sm text-white/55">
                {mounted && freeLeft > 0 ? `${ui.freeLeft}: ${freeLeft}` : resolvedLang === 'ru' ? 'Бесплатные разборы закончились.' : 'Free analyses are finished.'}
              </div>
            </div>
            {error ? <div className="mt-4 rounded-[22px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
          </GlassCard>

          <GlassCard className="p-6 lg:col-span-5">
            <SectionLabel text={ui.valueTitle} />
            <p className="mt-4 text-sm leading-7 text-white/65">{ui.valueText}</p>
            <div className="mt-6 grid gap-3">
              {ui.valuePoints.map((item) => <div key={item} className="rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-white/70">{item}</div>)}
            </div>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <SectionLabel text={ui.analysisBlocksTitle} />
              <div className="mt-4 grid gap-3">
                {ui.analysisBlocks.map((block) => (
                  <div key={block.title} className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                    <div className="font-medium">{block.title}</div>
                    <div className="mt-2 text-sm text-white/60">{block.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </section>

        <section className="mt-8">
          <GlassCard className="p-6">
            <SectionLabel text={ui.resultsLabel} />
            {result ? (
              <div className="mt-6 space-y-7">
                <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-6">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">{ui.scoreTitle}</div>
                  <div className="mt-3 text-2xl font-semibold">{result.summary}</div>
                  <div className="mt-3 text-sm text-cyan-50/85">{ui.whyUserCameHereLabel}: {result.whyUserCameHere} · {ui.nextStepLabel}: {result.nextStep}</div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <MetricCard label={SCORE_LABELS[resolvedLang].interest} value={score ? score.interest : '-'} hint={resolvedLang === 'ru' ? 'Потенциал ответа' : 'Reply potential'} />
                  <MetricCard label={SCORE_LABELS[resolvedLang].ignoreRisk} value={score ? score.ignoreRisk : '-'} hint={resolvedLang === 'ru' ? 'Риск тишины' : 'Silence risk'} />
                  <MetricCard label={SCORE_LABELS[resolvedLang].controlBalance} value={score ? score.controlBalance : '-'} hint={resolvedLang === 'ru' ? 'Кто ведёт диалог' : 'Who leads the chat'} />
                </div>
                <div className="grid gap-5 lg:grid-cols-12">
                  <div className="lg:col-span-5 space-y-4">
                    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                      <div className="text-xs uppercase tracking-[0.24em] text-white/40">{ui.diagnosisTitle}</div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <div className="text-sm uppercase tracking-[0.18em] text-white/40">{INDICATOR_LABELS[resolvedLang].mainMistake}</div>
                          <p className="mt-2 text-sm leading-7 text-white/72">{score?.mainMistake}</p>
                        </div>
                        <div>
                          <div className="text-sm uppercase tracking-[0.18em] text-white/40">{INDICATOR_LABELS[resolvedLang].psychologicalRead}</div>
                          <p className="mt-2 text-sm leading-7 text-white/72">{score?.psychologicalRead}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                      <div className="text-xs uppercase tracking-[0.24em] text-white/40">{INDICATOR_LABELS[resolvedLang].confidence}</div>
                      <div className="mt-4 flex items-end justify-between gap-4">
                        <div>
                          <div className="text-4xl font-semibold">{Math.round(clamp(confidence, 0, 100))}%</div>
                          <div className="mt-2 text-sm text-white/55">{resolvedLang === 'ru' ? 'Насколько сильный прогноз' : 'How strong the forecast is'}</div>
                        </div>
                        <SmallPill>{confidence >= 80 ? (resolvedLang === 'ru' ? 'Сильный' : 'Strong') : confidence >= 60 ? (resolvedLang === 'ru' ? 'Средний' : 'Moderate') : (resolvedLang === 'ru' ? 'Слабый' : 'Low')}</SmallPill>
                      </div>
                      <div className="mt-4"><ScoreMeter label={resolvedLang === 'ru' ? 'Уверенность прогноза' : 'Forecast confidence'} value={confidence} /></div>
                    </div>
                  </div>
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-white/40">{ui.replyTitle}</div>
                        <h3 className="mt-2 text-2xl font-semibold">{resolvedLang === 'ru' ? 'Три направления ответа' : 'Three reply directions'}</h3>
                      </div>
                      <button onClick={shareCurrentResult} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]">
                        {ui.shareResult}
                      </button>
                    </div>
                    <div className="grid gap-4">
                      {replies.length > 0 ? replies.map((reply, index) => (
                        <ReplyCard key={`${reply.style}-${index}`} reply={reply} isBest={index === 0} onCopy={() => copyReply(reply.text, index)} copied={copiedIndex === index} lang={resolvedLang} />
                      )) : <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-white/50">{ui.noResult}</div>}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <StrategyCard title={ui.doNowLabel} text={result.strategy.doNow} />
                      <StrategyCard title={ui.ifNoReplyLabel} text={result.strategy.ifNoReply} />
                      <StrategyCard title={ui.whenNotToWriteLabel} text={result.strategy.whenNotToWrite} />
                      <StrategyCard title={ui.regainControlLabel} text={result.strategy.regainControl} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[24px] border border-dashed border-white/12 bg-black/15 p-6 text-sm leading-7 text-white/45">
                  {resolvedLang === 'ru' ? 'Здесь появится оценка диалога, уровень контроля, риск игнора, диагностика и 3 ответа.' : 'This is where the score, control balance, ignore risk, diagnosis, and 3 reply options will appear.'}
                </div>
                <div className="rounded-[24px] border border-dashed border-white/12 bg-black/15 p-6 text-sm leading-7 text-white/45">
                  {resolvedLang === 'ru' ? 'ReplyOS должен ощущаться как премиальный AI-инструмент, а не как шаблонный генератор текста.' : 'ReplyOS should feel like a premium AI tool, not a generic text generator.'}
                </div>
              </div>
            )}
          </GlassCard>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {ui.featureCards.map((feature) => <FeatureCard key={feature.icon} lang={resolvedLang} {...feature} />)}
        </section>

        <section className="mt-12">
          <GlassCard className="p-6 md:p-8">
            <SectionLabel text={ui.testimonialsLabel} />
            <SectionTitle title={resolvedLang === 'ru' ? 'Доверие, которое продаёт' : 'Trust that sells'} text={resolvedLang === 'ru' ? 'Когда человек видит, что инструмент помогает в реальном исходе разговора, он понимает ценность без лишних объяснений.' : 'When a user sees that the tool changes the outcome of a real conversation, value becomes obvious without extra explanation.'} />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {ui.testimonials.map((item) => (
                <div key={item.name} className="rounded-[24px] border border-white/10 bg-black/20 p-6">
                  <p className="text-base leading-7 text-white/75">“{tx(item.quote, resolvedLang)}”</p>
                  <div className="mt-5 text-sm font-semibold text-white">{item.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/40">{tx(item.role, resolvedLang)}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        <section id="pricing" className="mt-12">
          <div className="mb-6">
            <SectionLabel text={ui.pricingTitle} />
            <SectionTitle title={resolvedLang === 'ru' ? 'Модель оплаты, которая чувствуется честно' : 'A pricing model that feels fair'} text={ui.pricingText} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {ui.pricing.map((plan) => (
              <GlassCard key={tx(plan.name, resolvedLang)} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.25em] text-white/40">{tx(plan.name, resolvedLang)}</div>
                  <SmallPill>{plan.accent === 'cyan' ? ui.mostPopular : plan.accent === 'violet' ? ui.teamReady : ui.starter}</SmallPill>
                </div>
                <div className="mt-4 text-4xl font-semibold">{plan.price}</div>
                <ul className="mt-6 space-y-2 text-sm text-white/70">
                  {plan.points.map((point) => (
                    <li key={tx(point, resolvedLang)} className="flex gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                      <span>{tx(point, resolvedLang)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (plan.name.ru === 'Free') {
                        document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        return;
                      }
                      const opened = openPlanCheckout(plan.accent === 'cyan' ? 'pro' : 'team');
                      if (!opened) setPaywallOpen(true);
                    }}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
                  >
                    {plan.name.ru === 'Free' ? ui.primaryCta : plan.accent === 'cyan' ? (resolvedLang === 'ru' ? 'Перейти к оплате Pro' : 'Go to Pro checkout') : (resolvedLang === 'ru' ? 'Перейти к оплате Team' : 'Go to Team checkout')}
                  </button>
                  <button onClick={() => setPaywallOpen(true)} className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]">
                    {resolvedLang === 'ru' ? 'Посмотреть, что входит' : 'See what is included'}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <GlassCard className="p-6 md:p-8">
            <SectionLabel text={ui.faqTitle} />
            <SectionTitle title={resolvedLang === 'ru' ? 'Ответы на частые вопросы' : 'Common questions'} text={resolvedLang === 'ru' ? 'Чтобы человек не терялся, сайт должен отвечать на сомнения до оплаты.' : 'The site should answer objections before purchase, so the user does not get lost.'} />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {ui.faq.map((item) => (
                <div key={tx(item.q, resolvedLang)} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="font-medium text-white">{tx(item.q, resolvedLang)}</div>
                  <div className="mt-3 text-sm leading-7 text-white/65">{tx(item.a, resolvedLang)}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        <section className="mt-12 pb-14">
          <GlassCard className="grid gap-5 p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <SectionLabel text={ui.finalTitle} />
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{ui.finalTitle}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">{ui.finalText}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <button
                onClick={() => {
                  const opened = openPlanCheckout('pro');
                  if (!opened) setPaywallOpen(true);
                }}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01]"
              >
                {resolvedLang === 'ru' ? 'Открыть Pro и зарабатывать' : 'Unlock Pro and monetize'}
              </button>
              <a href="#pricing" className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]">
                {ui.startTeam}
              </a>
            </div>
          </GlassCard>
        </section>

        <footer className="pb-8 text-center text-xs uppercase tracking-[0.3em] text-white/35">
          {ui.footer}
        </footer>
      </div>

      {paywallOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-xl">
            <GlassCard className="p-6 md:p-8">
              <SectionLabel text={ui.paywallLabel} />
              <div className="mt-3 text-2xl font-semibold">{ui.paywallTitle}</div>
              <p className="mt-3 text-sm leading-7 text-white/65">{ui.paywallText}</p>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-white/55">{ui.paywallCaption}</div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => {
                    const opened = openPlanCheckout('pro');
                    if (!opened) {
                      setPaywallOpen(false);
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black"
                >
                  {resolvedLang === 'ru' ? 'Перейти к оплате' : 'Go to checkout'}
                </button>
                <button onClick={() => setPaywallOpen(false)} className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/80">
                  {resolvedLang === 'ru' ? 'Закрыть' : 'Close'}
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : null}
    </main>
  );
}
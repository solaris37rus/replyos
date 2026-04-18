export const translations = {
  en: {
    appName: 'ReplyOS V4',
    subtitle: 'Outcome Engine for Conversations',
    analyze: 'Analyze Now',
    niche: 'Niche',
    goal: 'Goal',
    conversation: 'Conversation',
    freeLeft: 'free analyses left',
    analyzer: 'Analyzer',
    results: 'Results',
    copy: 'Copy Reply',
    share: 'Share Result',
    upgrade: 'Upgrade to Pro',
    team: 'Start Team Plan',
    paywallTitle: 'You’ve unlocked your free analyses.',
    paywallSubtitle: 'Upgrade to keep winning conversations.',
    loading: 'Analyzing...',
  },

  ru: {
    appName: 'ReplyOS V4',
    subtitle: 'Система результата в переписках',
    analyze: 'Анализировать',
    niche: 'Ниша',
    goal: 'Цель',
    conversation: 'Переписка',
    freeLeft: 'бесплатных анализов осталось',
    analyzer: 'Анализатор',
    results: 'Результаты',
    copy: 'Скопировать ответ',
    share: 'Поделиться результатом',
    upgrade: 'Обновить до Pro',
    team: 'Командный тариф',
    paywallTitle: 'Вы использовали бесплатные анализы.',
    paywallSubtitle:
      'Обновитесь, чтобы продолжить выигрывать переписки.',
    loading: 'Анализируем...',
  },
} as const;

export type Lang = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
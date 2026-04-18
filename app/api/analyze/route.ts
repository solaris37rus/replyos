import { NextResponse } from 'next/server';

type Goal = 'money' | 'reply' | 'revive' | 'life' | 'custom';
type Niche = 'business' | 'daily' | 'love' | 'work' | 'custom';

type AnalyzeBody = {
  conversation?: string;
  goal?: Goal;
  niche?: Niche;
  locale?: string;
};

type Level = 'низкий' | 'средний' | 'высокий';

type ReplyItem = {
  style: 'продающий' | 'уверенный' | 'мягкий';
  text: string;
  whyItWorks: string;
};

type AnalysisResult = {
  niche: string;
  goal: string;
  language: string;
  summary: string;
  analysis: {
    interest: Level;
    ignoreRisk: Level;
    controlBalance: Level;
    mainMistake: string;
    psychologicalRead: string;
  };
  replies: ReplyItem[];
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

const FALLBACK: AnalysisResult = {
  niche: 'Общий анализ',
  goal: 'Лучший исход переписки',
  language: 'ru',
  summary: 'Недостаточно данных для точного разбора.',
  analysis: {
    interest: 'средний',
    ignoreRisk: 'средний',
    controlBalance: 'средний',
    mainMistake: 'Недостаточно контекста.',
    psychologicalRead: 'Нужно больше данных.',
  },
  replies: [
    {
      style: 'продающий',
      text: 'Пришли переписку — покажу лучший следующий шаг.',
      whyItWorks: 'Переводит к действию.',
    },
    {
      style: 'уверенный',
      text: 'Для точного ответа нужен сам диалог.',
      whyItWorks: 'Спокойно и уверенно.',
    },
    {
      style: 'мягкий',
      text: 'Отправь переписку, и я помогу.',
      whyItWorks: 'Без давления.',
    },
  ],
  strategy: {
    doNow: 'Вставь переписку и выбери цель.',
    ifNoReply: 'Напомни через 24–48 часов.',
    whenNotToWrite: 'Не пиши повторно при явном отказе.',
    regainControl: 'Дай ясность и следующий шаг.',
  },
  whyUserCameHere: 'Пользователь хочет лучший результат.',
  nextStep: 'Нажми Analyze.',
  confidence: 0.2,
};

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;

    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function pickLevel(value: unknown): Level {
  if (value === 'низкий' || value === 'средний' || value === 'высокий') {
    return value;
  }
  return 'средний';
}

function normalize(
  input: unknown,
  locale: string,
  niche: string,
  goal: string
): AnalysisResult {
  if (!input || typeof input !== 'object') {
    return { ...FALLBACK, language: locale, niche, goal };
  }

  const data = input as Partial<AnalysisResult>;

  const replies =
    Array.isArray(data.replies) && data.replies.length
      ? data.replies.slice(0, 3)
      : FALLBACK.replies;

  return {
    niche: data.niche || niche,
    goal: data.goal || goal,
    language: data.language || locale,
    summary: data.summary || FALLBACK.summary,
    analysis: {
      interest: pickLevel(data.analysis?.interest),
      ignoreRisk: pickLevel(data.analysis?.ignoreRisk),
      controlBalance: pickLevel(data.analysis?.controlBalance),
      mainMistake:
        data.analysis?.mainMistake || FALLBACK.analysis.mainMistake,
      psychologicalRead:
        data.analysis?.psychologicalRead ||
        FALLBACK.analysis.psychologicalRead,
    },
    replies,
    strategy: {
      doNow: data.strategy?.doNow || FALLBACK.strategy.doNow,
      ifNoReply: data.strategy?.ifNoReply || FALLBACK.strategy.ifNoReply,
      whenNotToWrite:
        data.strategy?.whenNotToWrite ||
        FALLBACK.strategy.whenNotToWrite,
      regainControl:
        data.strategy?.regainControl ||
        FALLBACK.strategy.regainControl,
    },
    whyUserCameHere:
      data.whyUserCameHere || FALLBACK.whyUserCameHere,
    nextStep: data.nextStep || FALLBACK.nextStep,
    confidence:
      typeof data.confidence === 'number'
        ? Math.max(0, Math.min(1, data.confidence))
        : 0.5,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyzeBody;

    const conversation = body.conversation?.trim() || '';
    const niche = body.niche || 'custom';
    const goal = body.goal || 'custom';
    const locale = (body.locale || 'ru').slice(0, 5);

    if (!conversation) {
      return NextResponse.json(
        normalize(null, locale, niche, goal)
      );
    }

    return NextResponse.json(
      normalize(null, locale, niche, goal)
    );
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
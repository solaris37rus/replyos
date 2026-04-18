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

const NICHES_MAP: Record<string, string> = {
  business: 'B2B/B2C продажи, бизнес-коммуникация',
  daily: 'Повседневная жизнь, бытовые конфликты',
  love: 'Отношения, дейтинг, общение с партнером',
  work: 'Работа, карьера, корпоративное общение',
  custom: 'Общий контекст',
};

const GOALS_MAP: Record<string, string> = {
  money: 'Закрыть на оплату или договориться о сделке',
  reply: 'Получить ответ и вывести из игнора',
  revive: 'Вернуть контакт и возобновить теплое общение',
  life: 'Разрешить ситуацию спокойно и в свою пользу',
  custom: 'Получить максимальный контроль над ситуацией',
};

const FALLBACK: AnalysisResult = {
  niche: 'Общий анализ',
  goal: 'Лучший исход переписки',
  language: 'ru',
  summary: 'Недостаточно данных или ошибка API.',
  analysis: {
    interest: 'средний',
    ignoreRisk: 'средний',
    controlBalance: 'средний',
    mainMistake: 'Не удалось проанализировать из-за ошибки сети или нехватки контекста.',
    psychologicalRead: 'Система ожидает более детальную переписку.',
  },
  replies: [
    { style: 'продающий', text: 'Пришлите переписку, и мы вернем диалог в нужное русло.', whyItWorks: 'Прямой призыв к действию.' },
    { style: 'уверенный', text: 'Для точного ответа нужен сам диалог.', whyItWorks: 'Демонстрация границ.' },
    { style: 'мягкий', text: 'Отправь переписку, и я помогу разобраться.', whyItWorks: 'Снимает давление.' },
  ],
  strategy: {
    doNow: 'Проверьте API ключи или вставьте более длинный текст.',
    ifNoReply: 'Попробуйте еще раз позже.',
    whenNotToWrite: 'Если система не отвечает.',
    regainControl: 'Уточните запрос.',
  },
  whyUserCameHere: 'Нужен выход из сложной ситуации.',
  nextStep: 'Повторить попытку.',
  confidence: 0,
};

// Безопасный парсинг (спасает, если ИИ оборачивает JSON в ```json ... ```)
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
  if (value === 'низкий' || value === 'средний' || value === 'высокий') return value;
  return 'средний';
}

// Защита типов для фронтенда: если ИИ забыл поле, мы подставляем дефолтное
function normalize(input: unknown, locale: string, niche: string, goal: string): AnalysisResult {
  if (!input || typeof input !== 'object') return { ...FALLBACK, language: locale, niche, goal };
  
  const data = input as Partial<AnalysisResult>;
  const replies = Array.isArray(data.replies) && data.replies.length > 0 ? data.replies.slice(0, 3) : FALLBACK.replies;

  return {
    niche: data.niche || niche,
    goal: data.goal || goal,
    language: data.language || locale,
    summary: data.summary || FALLBACK.summary,
    analysis: {
      interest: pickLevel(data.analysis?.interest),
      ignoreRisk: pickLevel(data.analysis?.ignoreRisk),
      controlBalance: pickLevel(data.analysis?.controlBalance),
      mainMistake: data.analysis?.mainMistake || FALLBACK.analysis.mainMistake,
      psychologicalRead: data.analysis?.psychologicalRead || FALLBACK.analysis.psychologicalRead,
    },
    replies,
    strategy: {
      doNow: data.strategy?.doNow || FALLBACK.strategy.doNow,
      ifNoReply: data.strategy?.ifNoReply || FALLBACK.strategy.ifNoReply,
      whenNotToWrite: data.strategy?.whenNotToWrite || FALLBACK.strategy.whenNotToWrite,
      regainControl: data.strategy?.regainControl || FALLBACK.strategy.regainControl,
    },
    whyUserCameHere: data.whyUserCameHere || FALLBACK.whyUserCameHere,
    nextStep: data.nextStep || FALLBACK.nextStep,
    confidence: typeof data.confidence === 'number' ? Math.max(0, Math.min(100, data.confidence)) : 75,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyzeBody;
    const conversation = body.conversation?.trim() || '';
    const niche = body.niche || 'custom';
    const goal = body.goal || 'custom';
    const locale = (body.locale || 'ru').slice(0, 5);

    if (!conversation) return NextResponse.json(normalize(null, locale, niche, goal));

    // Ищем ключ OpenRouter (или резервный OpenAI)
    const API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (!API_KEY) {
      console.warn("API_KEY is missing. Returning fallback.");
      return NextResponse.json(normalize(null, locale, niche, goal));
    }

    const systemPrompt = `
You are an elite communication strategist and psychological profiler.
Analyze the provided conversation and output a JSON object exactly matching the schema.

Context:
- Niche: ${NICHES_MAP[niche]}
- Desired Goal: ${GOALS_MAP[goal]}
- Output Language: ${locale === 'ru' ? 'Russian' : 'English'}

Instructions:
1. Determine the core mistake and the psychological state.
2. Generate 3 distinct replies to achieve the Goal.
3. Respond ONLY with a valid JSON object. No markdown formatting, no explanations. Translate all values to ${locale === 'ru' ? 'Russian' : 'English'}.

Schema:
{
  "summary": "Short 3-5 word summary",
  "analysis": {
    "interest": "низкий" | "средний" | "высокий" (use these exact russian words if locale=ru, else low/medium/high),
    "ignoreRisk": "низкий" | "средний" | "высокий",
    "controlBalance": "низкий" | "средний" | "высокий",
    "mainMistake": "1 sentence finding the mistake",
    "psychologicalRead": "1 sentence reading the person"
  },
  "replies": [
    { "style": "продающий / confident / soft", "text": "Exact message", "whyItWorks": "Brief reason" },
    { "style": "уверенный", "text": "...", "whyItWorks": "..." },
    { "style": "мягкий", "text": "...", "whyItWorks": "..." }
  ],
  "strategy": {
    "doNow": "Next exact step",
    "ifNoReply": "What if ignored",
    "whenNotToWrite": "When to stop",
    "regainControl": "How to get power back"
  },
  "whyUserCameHere": "Why they need help",
  "nextStep": "The most important action",
  "confidence": 85
}
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://replyos.com',
        'X-Title': 'ReplyOS',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversation }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const resultContent = data.choices?.[0]?.message?.content || "{}";
    
    // Парсим через защищенную функцию
    const parsed = safeJsonParse(resultContent);
    
    // Нормализуем данные, чтобы фронт не упал, если структура кривая
    const finalResult = normalize(parsed, locale, niche, goal);

    return NextResponse.json(finalResult);

  } catch (err) {
    console.error("Route Error:", err);
    return NextResponse.json(FALLBACK);
  }
}
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.6-flash'];

async function generateContentWithFallback(contents: string, responseSchema?: any) {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: responseSchema
          ? {
              responseMimeType: 'application/json',
              responseSchema,
            }
          : undefined,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      console.warn(`Model [${model}] failed (${err?.status || err?.message || err}). Trying fallback...`);
      lastError = err;
    }
  }
  throw lastError || new Error('Tất cả các mô hình AI hiện đang bận');
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Dictionary Lookup
app.post('/api/dictionary/lookup', async (req, res) => {
  try {
    const { word, mode } = req.body;
    if (!word || typeof word !== 'string') {
      return res.status(400).json({ error: 'Từ cần tra không hợp lệ' });
    }

    const isEn2Vi = mode === 'en2vi';
    const prompt = isEn2Vi
      ? `Bạn là từ điển Anh-Việt thông minh dành cho người học tiếng Anh Việt Nam (Ms Lý AI - Fly High).
Hãy phân tích chi tiết từ/cụm từ tiếng Anh: "${word}".
Trả về duy nhất JSON đúng schema chỉ định:
- word: từ chuẩn chính tả
- phonetic: phiên âm IPA chính xác (ví dụ /ˈel.ɪ.fənt/)
- partOfSpeech: từ loại (noun, verb, adjective, adverb, v.v.)
- vietnamese: nghĩa tiếng Việt chính xác, tự nhiên, dễ hiểu
- definitions: mảng các định nghĩa tiếng Anh dễ hiểu (1-3 câu)
- examples: mảng câu ví dụ tiếng Anh kèm dịch nghĩa tiếng Việt (1-3 câu)
- collocations: mảng 2-4 cụm từ hay đi kèm (ví dụ: make an effort, heavy rain)
- synonyms: mảng 2-4 từ đồng nghĩa
- antonyms: mảng 2-4 từ trái nghĩa (nếu có)
- idioms: mảng các thành ngữ/cụm từ liên quan kèm giải thích`
      : `Bạn là từ điển Việt-Anh thông minh dành cho người học tiếng Anh Việt Nam (Ms Lý AI - Fly High).
Hãy chuyển từ/cụm từ tiếng Việt: "${word}" sang từ/cụm từ tiếng Anh tương ứng chuẩn xác nhất.
Trả về duy nhất JSON đúng schema chỉ định:
- word: từ tiếng Anh tương ứng chuẩn nhất
- phonetic: phiên âm IPA của từ tiếng Anh đó
- partOfSpeech: từ loại tiếng Anh (noun, verb, adjective, v.v.)
- vietnamese: từ/cụm từ tiếng Việt ban đầu
- definitions: mảng các định nghĩa tiếng Anh giải thích nghĩa của từ này
- examples: mảng câu ví dụ tiếng Anh sử dụng từ này
- collocations: mảng cụm từ đi kèm tiếng Anh
- synonyms: mảng từ đồng nghĩa tiếng Anh
- antonyms: mảng từ trái nghĩa tiếng Anh
- idioms: thành ngữ liên quan`;

    const response = await generateContentWithFallback(prompt, {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING },
        phonetic: { type: Type.STRING },
        partOfSpeech: { type: Type.STRING },
        vietnamese: { type: Type.STRING },
        definitions: { type: Type.ARRAY, items: { type: Type.STRING } },
        examples: { type: Type.ARRAY, items: { type: Type.STRING } },
        collocations: { type: Type.ARRAY, items: { type: Type.STRING } },
        synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
        antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
        idioms: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              idiom: { type: Type.STRING },
              meaning: { type: Type.STRING },
            },
          },
        },
      },
      required: ['word', 'phonetic', 'partOfSpeech', 'vietnamese', 'definitions', 'examples'],
    });

    const jsonText = response.text || '{}';
    const result = JSON.parse(jsonText);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/dictionary/lookup:', error);
    res.status(500).json({ error: error.message || 'Lỗi tra từ điển' });
  }
});

// 2. Paragraph Translation
app.post('/api/dictionary/translate-paragraph', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Nội dung không hợp lệ' });
    }

    const prompt = `Bạn là chuyên gia dịch thuật Anh-Việt cao cấp. Hãy dịch đoạn văn sau một cách tự nhiên, chuẩn mực văn phong người bản xứ:
"""${text}"""

Phân tích và trả về JSON:
- direction: 'en_to_vi' hoặc 'vi_to_en'
- translation: bản dịch hoàn chỉnh tự nhiên
- keyVocabulary: danh sách 3-5 từ vựng/cụm từ quan trọng trong đoạn kèm phiên âm, loại từ và nghĩa`;

    const response = await generateContentWithFallback(prompt, {
      type: Type.OBJECT,
      properties: {
        direction: { type: Type.STRING },
        translation: { type: Type.STRING },
        keyVocabulary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              meaning: { type: Type.STRING },
            },
          },
        },
      },
      required: ['direction', 'translation'],
    });

    const jsonText = response.text || '{}';
    res.json(JSON.parse(jsonText));
  } catch (error: any) {
    console.error('Error in /api/dictionary/translate-paragraph:', error);
    res.status(500).json({ error: error.message || 'Lỗi dịch đoạn văn' });
  }
});

// 3. Writing Correction & Native Polish
app.post('/api/writing/correct', async (req, res) => {
  try {
    const { text, mode, tone, level } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Hãy nhập bài viết cần sửa' });
    }

    const targetLevel = level || 'B1-B2 (Trung cấp)';

    const prompt = `Bạn là một giáo viên người bản xứ Anh/Mỹ xuất sắc tại "Ms Lý AI".
Người dùng vừa gửi đoạn văn tiếng Anh để chấm điểm và sửa lỗi (Chủ đề: ${mode || 'Tự do'}, Trình độ mong muốn: ${targetLevel}, Văn phong: ${tone || 'Tự nhiên bản xứ'}):
"""${text}"""

Nhiệm vụ của bạn:
1. Sửa toàn bộ lỗi từ vựng, ngữ pháp, chính tả, dính từ, chia thì, giới từ trong bài gốc (correctedText).
2. Viết 01 "Bản Nâng Cấp Bài Viết" (nativeVersion) duy nhất được tối ưu hóa CHÍNH XÁC theo đúng Trình độ mong muốn "${targetLevel}":
   - Nếu trình độ Cơ bản (A1-A2): Dùng mẫu câu rõ ràng, dễ nhớ, từ vựng thông dụng.
   - Nếu trình độ Trung cấp (B1-B2): Dùng từ vựng đa dạng, từ nối tự nhiên, diễn đạt trôi chảy.
   - Nếu trình độ Nâng cao (C1-C2 / IELTS): Dùng từ vựng academic, collocations bản xứ xịn, lập luận ấn tượng.
3. Chấm điểm chi tiết từ 0 - 100:
   - overallScore (Tổng điểm)
   - grammarScore (Ngữ pháp)
   - vocabScore (Từ vựng)
   - naturalnessScore (Độ tự nhiên bản xứ)
   - coherenceScore (Mạch lạc & liên kết)
4. Liệt kê từng lỗi sai (mistakes) chi tiết gồm:
   - original: cụm từ/từ bị sai trong bài gốc
   - correction: cụm từ/từ đã được sửa
   - type: loại lỗi ('grammar' | 'vocabulary' | 'spelling' | 'phrasing' | 'punctuation')
   - explanationVi: giải thích CHI TIẾT bằng tiếng Việt tại sao sai, quy tắc là gì
   - nativeExample: câu ví dụ hay của người bản xứ áp dụng cấu trúc này
5. Đề xuất keyVocabularyVi: 3-5 cụm từ/từ vựng xịn, collocations nâng cao mà người bản xứ hay dùng phù hợp với bài viết. Yêu cầu BẮT BUỘC mỗi mục bao gồm:
   - term: từ/cụm từ tiếng Anh nâng cao hoặc collocation bản xứ
   - meaning: NGHĨA TIẾNG VIỆT CHÍNH XÁC, TỰ NHIÊN, DỄ HIỂU (bắt buộc phải có nghĩa tiếng Việt)
   - usage: ví dụ câu hoặc hướng dẫn ngữ cảnh sử dụng ngắn
6. summaryFeedbackVi: Nhận xét tổng quan bài viết, khích lệ và bí quyết cải thiện bằng tiếng Việt thân thiện, tâm huyết.`;

    const response = await generateContentWithFallback(prompt, {
      type: Type.OBJECT,
      properties: {
        originalText: { type: Type.STRING },
        mode: { type: Type.STRING },
        tone: { type: Type.STRING },
        correctedText: { type: Type.STRING },
        nativeVersion: { type: Type.STRING },
        overallScore: { type: Type.NUMBER },
        grammarScore: { type: Type.NUMBER },
        vocabScore: { type: Type.NUMBER },
        naturalnessScore: { type: Type.NUMBER },
        coherenceScore: { type: Type.NUMBER },
        summaryFeedbackVi: { type: Type.STRING },
        mistakes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              correction: { type: Type.STRING },
              type: { type: Type.STRING },
              explanationVi: { type: Type.STRING },
              nativeExample: { type: Type.STRING },
            },
            required: ['original', 'correction', 'type', 'explanationVi'],
          },
        },
        keyVocabularyVi: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              meaning: { type: Type.STRING },
              usage: { type: Type.STRING },
            },
            required: ['term', 'meaning', 'usage'],
          },
        },
      },
      required: [
        'correctedText',
        'nativeVersion',
        'overallScore',
        'grammarScore',
        'vocabScore',
        'naturalnessScore',
        'coherenceScore',
        'summaryFeedbackVi',
        'mistakes',
        'keyVocabularyVi',
      ],
    });

    const jsonText = response.text || '{}';
    const result = JSON.parse(jsonText);
    result.originalText = text;
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/writing/correct:', error);
    res.status(500).json({ error: error.message || 'Lỗi sửa bài viết' });
  }
});

// 3b. Debate Answer Suggestions by Question & Proficiency Level
app.post('/api/writing/suggest-debate', async (req, res) => {
  try {
    const { question, level } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Vui lòng nhập câu hỏi tranh luận' });
    }

    const isSpecificLevel = level && level !== 'all';
    let levelInstructions = '';
    if (isSpecificLevel) {
      const levelLabel =
        level === 'A1-A2'
          ? 'Cơ bản (A1-A2)'
          : level === 'B1-B2'
          ? 'Trung cấp (B1-B2)'
          : 'Nâng cao (C1-C2 / IELTS)';
      levelInstructions = `⚠️ LƯU Ý CỰC KỲ QUAN TRỌNG: Người dùng CHỈ YÊU CẦU TRÌNH ĐỘ "${levelLabel}".
CHỈ ĐƯỢC TẠO GỢI Ý DÀNH RIÊNG CHO TRÌNH ĐỘ "${levelLabel}". TUYỆT ĐỐI KHÔNG tạo gợi ý cho các trình độ khác!
Hãy tạo 2 gợi ý câu trả lời thuộc duy nhất trình độ "${levelLabel}" (1 gợi ý Đồng ý [Pro] và 1 gợi ý Phản đối [Con]).
Tất cả gợi ý BẮT BUỘC có levelCode là "${level}" và level là "${levelLabel}".`;
    } else {
      levelInstructions = `Hãy tạo 3 gợi ý tương ứng với 3 trình độ khác nhau:
- Cơ bản (A1-A2): Ngắn gọn, từ vựng cơ bản, mẫu câu dễ nhớ. (levelCode: 'A1-A2', level: 'Cơ bản (A1-A2)')
- Trung cấp (B1-B2): Từ vựng phong phú, liên kết câu tự nhiên. (levelCode: 'B1-B2', level: 'Trung cấp (B1-B2)')
- Nâng cao (C1-C2 / IELTS): Từ vựng academic, collocations chuẩn bản xứ, lập luận thuyết phục. (levelCode: 'C1-C2', level: 'Nâng cao (C1-C2 / IELTS)')`;
    }

    const prompt = `Bạn là giáo viên Anh văn chuyên hướng dẫn Tranh luận (Debate) tại "Ms Lý AI".
Người dùng đưa ra câu hỏi/chủ đề tranh luận: "${question}".
Trình độ người dùng chọn: ${level || 'Tất cả các trình độ'}.

Hãy đưa ra các câu trả lời tranh luận gợi ý được cấu trúc chính xác theo 3 BƯỚC:
1. GIVING AN OPINION (Ví dụ: "I think...", "I believe...", "In my opinion,...", "From my point of view,...", "As far as I am concerned,...")
2. GIVING REASONS (Ví dụ: "because...", "The reason is that...", "One reason is that...", "Another reason is that...", "This is because...")
3. GIVING EXAMPLES (Ví dụ: "For example,...", "For instance,...", "Let me give an example.", "A good example is...", "Such as...")

${levelInstructions}

Mỗi gợi ý hãy tách rõ:
- level: Tên trình độ tiếng Việt (ví dụ: "Cơ bản (A1-A2)", "Trung cấp (B1-B2)", "Nâng cao (C1-C2 / IELTS)")
- levelCode: BẮT BUỘC ghi đúng 'A1-A2', 'B1-B2', hoặc 'C1-C2'
- side: 'Đồng ý (Pro)' hoặc 'Phản đối (Con)'
- opinionStarter: cụm mở đầu quan điểm (vd: 'In my opinion,')
- opinion: vế quan điểm
- reasonStarter: cụm mở đầu lý do (vd: 'because')
- reason: vế lý do
- exampleStarter: cụm mở đầu ví dụ (vd: 'For example,')
- example: vế ví dụ
- fullAnswer: Đoạn văn hoàn chỉnh kết hợp 3 bước tiếng Anh
- vietnameseTranslation: Bản dịch tiếng Việt mượt mà, chính xác.`;

    const response = await generateContentWithFallback(prompt, {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        suggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING },
              levelCode: { type: Type.STRING },
              side: { type: Type.STRING },
              opinionStarter: { type: Type.STRING },
              opinion: { type: Type.STRING },
              reasonStarter: { type: Type.STRING },
              reason: { type: Type.STRING },
              exampleStarter: { type: Type.STRING },
              example: { type: Type.STRING },
              fullAnswer: { type: Type.STRING },
              vietnameseTranslation: { type: Type.STRING },
            },
            required: [
              'level',
              'levelCode',
              'side',
              'opinionStarter',
              'opinion',
              'reasonStarter',
              'reason',
              'exampleStarter',
              'example',
              'fullAnswer',
              'vietnameseTranslation',
            ],
          },
        },
      },
      required: ['question', 'suggestions'],
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);

    if (isSpecificLevel && Array.isArray(parsed.suggestions)) {
      const filtered = parsed.suggestions.filter(
        (item: any) => item.levelCode === level || item.level?.toLowerCase().includes(level.toLowerCase())
      );
      if (filtered.length > 0) {
        parsed.suggestions = filtered;
      }
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/writing/suggest-debate:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi gợi ý câu trả lời tranh luận' });
  }
});

// 4. Pronunciation Assessment & Speech Evaluation
app.post('/api/pronunciation/evaluate', async (req, res) => {
  try {
    const { targetText, recognizedText } = req.body;
    if (!targetText) {
      return res.status(400).json({ error: 'Thiếu văn bản mẫu cần đọc' });
    }

    const spokenText = recognizedText || '';

    const prompt = `Bạn là Chuyên gia luyện phát âm & ngữ điệu tiếng Anh bản xứ.
Câu/từ mẫu cần phát âm: "${targetText}"
Lời nói ghi nhận được từ người dùng qua nhận diện giọng nói: "${spokenText}"

Hãy phân tích cực kỳ chi tiết khả năng phát âm, trọng âm, âm đuôi và ngữ điệu:
1. overallScore (0-100): Điểm tổng quan phát âm
2. accuracyScore (0-100): Điểm độ chính xác âm tiết
3. fluencyScore (0-100): Điểm độ trôi chảy & nhịp điệu
4. intonationScore (0-100): Điểm ngữ điệu & trọng âm câu
5. wordFeedback: Mảng từng từ trong câu mẫu "${targetText}":
   - word: từ mẫu
   - expectedIpa: phiên âm IPA
   - spoken: từ ghi nhận được
   - status: 'perfect' (phát âm chuẩn) | 'good' (khá tốt) | 'needs_work' (cần cải thiện)
   - score: 0 - 100
   - tipVi: hướng dẫn sửa cụ thể bằng tiếng Việt (ví dụ: chú ý bật âm /t/ cuối, chú ý trọng âm âm tiết 2, hạ giọng cuối câu)
6. phoneticTipsVi: 2-3 lời khuyên kỹ thuật bật hơi/mở khẩu hình môi-lưỡi bằng tiếng Việt
7. nativeSpeakerTipVi: Lời khuyên giúp nói tự nhiên như người Anh/Mỹ bản xứ`;

    const response = await generateContentWithFallback(prompt, {
      type: Type.OBJECT,
      properties: {
        targetText: { type: Type.STRING },
            recognizedText: { type: Type.STRING },
            overallScore: { type: Type.NUMBER },
            accuracyScore: { type: Type.NUMBER },
            fluencyScore: { type: Type.NUMBER },
            intonationScore: { type: Type.NUMBER },
            wordFeedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  expectedIpa: { type: Type.STRING },
                  spoken: { type: Type.STRING },
                  status: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  tipVi: { type: Type.STRING },
                },
                required: ['word', 'status', 'score'],
              },
            },
            phoneticTipsVi: { type: Type.ARRAY, items: { type: Type.STRING } },
            nativeSpeakerTipVi: { type: Type.STRING },
          },
          required: [
            'overallScore',
            'accuracyScore',
            'fluencyScore',
            'intonationScore',
            'wordFeedback',
            'phoneticTipsVi',
            'nativeSpeakerTipVi',
          ],
        });

    const jsonText = response.text || '{}';
    const result = JSON.parse(jsonText);
    result.targetText = targetText;
    result.recognizedText = spokenText;
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/pronunciation/evaluate:', error);
    res.status(500).json({ error: error.message || 'Lỗi chấm điểm phát âm' });
  }
});

// 5. Daily Word of the Day
app.get('/api/daily/word-of-the-day', async (req, res) => {
  try {
    const prompt = `Tạo 1 "Từ Vựng Thông Minh Mỗi Ngày" (Word of the Day) thật chất lượng dành cho học sinh Việt Nam.
Trả về JSON gồm:
- word: từ tiếng Anh hay (ví dụ: Resilience, Serendipity, Eloquent, Perseverance, Mindset)
- phonetic: IPA
- partOfSpeech: loại từ
- vietnamese: nghĩa tiếng Việt sát thực tế
- definitionEn: định nghĩa tiếng Anh ngắn
- exampleEn: câu ví dụ tiếng Anh thực tế hay
- exampleVi: dịch câu ví dụ
- usageTipVi: mẹo nhớ từ hoặc mẹo dùng từ tự nhiên như người bản xứ`;

    const response = await generateContentWithFallback(prompt, {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            vietnamese: { type: Type.STRING },
            definitionEn: { type: Type.STRING },
            exampleEn: { type: Type.STRING },
            exampleVi: { type: Type.STRING },
            usageTipVi: { type: Type.STRING },
          },
          required: ['word', 'phonetic', 'partOfSpeech', 'vietnamese', 'definitionEn', 'exampleEn', 'exampleVi', 'usageTipVi'],
        });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error in /api/daily/word-of-the-day:', error);
    // Fallback word if network fails
    res.json({
      word: 'Perseverance',
      phonetic: '/ˌpɜː.sɪˈvɪə.rəns/',
      partOfSpeech: 'noun',
      vietnamese: 'Sự kiên trì, bền bỉ',
      definitionEn: 'Continued effort to do or achieve something despite difficulties or delay.',
      exampleEn: 'With hard work and perseverance, you can master English every single day!',
      exampleVi: 'Với sự chăm chỉ và kiên trì, bạn có thể chinh phục tiếng Anh mỗi ngày!',
      usageTipVi: 'Dùng từ này khi khen ngợi tinh thần vượt khó trong học tập hoặc công việc.',
    });
  }
});

// 6. Daily AI Quiz Generator (10 câu chia theo trình độ)
app.get('/api/daily/quiz', async (req, res) => {
  try {
    const levelQuery = (req.query.level as string) || 'all';

    let levelInstruction = '';
    if (levelQuery === 'basic') {
      levelInstruction = 'Tất cả 10 câu thuộc Trình độ Sơ cấp & Cơ bản (A1 - A2): ngữ pháp căn bản, từ vựng thông dụng hàng ngày, phát âm đơn giản.';
    } else if (levelQuery === 'intermediate') {
      levelInstruction = 'Tất cả 10 câu thuộc Trình độ Trung cấp (B1 - B2): phrasal verbs, collocations hay dùng, cấu trúc câu phức, từ vựng công việc/giao tiếp.';
    } else if (levelQuery === 'advanced') {
      levelInstruction = 'Tất cả 10 câu thuộc Trình độ Nâng cao & Bản xứ (C1 - C2): thành ngữ (idioms), từ vựng C1/C2 xịn, collocations tự nhiên, sắc thái ngữ nghĩa tinh tế.';
    } else {
      levelInstruction = '10 câu hỏi bao quát ĐA DẠNG CÁC TRÌNH ĐỘ: 3 câu Sơ cấp (A1-A2), 4 câu Trung cấp (B1-B2), 3 câu Nâng cao (C1-C2).';
    }

    const prompt = `Tạo ĐÚNG 10 CÂU HỎI trắc nghiệm tiếng Anh thông minh chất lượng cao.
${levelInstruction}

Mỗi câu hỏi trả về JSON gồm:
- id: số thứ tự từ 1 đến 10
- question: nội dung câu hỏi tiếng Anh
- options: mảng 4 lựa chọn (A, B, C, D)
- correctIndex: chỉ số đáp án đúng (0, 1, 2, hoặc 3)
- level: loại trình độ ('basic' | 'intermediate' | 'advanced')
- levelName: tên hiển thị tiếng Việt (ví dụ: '🟢 Sơ cấp A1-A2', '🟡 Trung cấp B1-B2', '🔴 Nâng cao C1-C2')
- explanationVi: giải thích chi tiết đáp án đúng và vì sao chọn đáp án đó bằng tiếng Việt thân thiện, dễ hiểu.`;

    const response = await generateContentWithFallback(prompt, {
      type: Type.OBJECT,
      properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  level: { type: Type.STRING },
                  levelName: { type: Type.STRING },
                  explanationVi: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'level', 'levelName', 'explanationVi'],
              },
            },
          },
          required: ['questions'],
        });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error in /api/daily/quiz:', error);
    // Fallback 10 questions if network error occurs
    res.json({
      questions: [
        {
          id: 1,
          question: "She decided to _____ her habit of procrastinating and start studying early.",
          options: ["give up", "give in", "give away", "give out"],
          correctIndex: 0,
          level: "basic",
          levelName: "🟢 Sơ cấp A1-A2",
          explanationVi: "Phrasal verb 'give up' nghĩa là từ bỏ một thói quen xấu."
        },
        {
          id: 2,
          question: "If I _____ enough time yesterday, I would have visited Ms Lý AI center.",
          options: ["had", "have had", "had had", "would have"],
          correctIndex: 2,
          level: "intermediate",
          levelName: "🟡 Trung cấp B1-B2",
          explanationVi: "Câu điều kiện loại 3 diễn tả sự thật trái ngược quá quá khứ: If + S + had V3/ed."
        },
        {
          id: 3,
          question: "The new policy is expected to _____ significant changes in the education system.",
          options: ["bring about", "bring up", "bring off", "bring down"],
          correctIndex: 0,
          level: "intermediate",
          levelName: "🟡 Trung cấp B1-B2",
          explanationVi: "'Bring about' mang nghĩa mang lại / gây ra sự thay đổi lớn."
        },
        {
          id: 4,
          question: "He is a very _____ speaker who can motivate thousands of students effortlessly.",
          options: ["eloquent", "eager", "eligible", "elementary"],
          correctIndex: 0,
          level: "advanced",
          levelName: "🔴 Nâng cao C1-C2",
          explanationVi: "'Eloquent' (tính từ C1) nghĩa là hùng hồn, diễn đạt trôi chảy và lôi cuốn."
        },
        {
          id: 5,
          question: "Can you give me a _____ with these heavy books, please?",
          options: ["hand", "foot", "head", "arm"],
          correctIndex: 0,
          level: "basic",
          levelName: "🟢 Sơ cấp A1-A2",
          explanationVi: "Collocation quen thuộc: 'give someone a hand' = giúp đỡ ai một tay."
        },
        {
          id: 6,
          question: "We should take advantage _____ this great opportunity to improve our English.",
          options: ["of", "on", "at", "in"],
          correctIndex: 0,
          level: "basic",
          levelName: "🟢 Sơ cấp A1-A2",
          explanationVi: "Cụm từ cố định: 'take advantage of something' = tận dụng cơ hội."
        },
        {
          id: 7,
          question: "Hard work and perseverance always _____ in the long run.",
          options: ["pay off", "pay for", "pay out", "pay back"],
          correctIndex: 0,
          level: "intermediate",
          levelName: "🟡 Trung cấp B1-B2",
          explanationVi: "'Pay off' nghĩa là gặt hái thành quả tốt đẹp, đền đáp xứng đáng."
        },
        {
          id: 8,
          question: "Despite the harsh conditions, she handled the situation with remarkable _____.",
          options: ["equanimity", "equity", "equation", "equivalent"],
          correctIndex: 0,
          level: "advanced",
          levelName: "🔴 Nâng cao C1-C2",
          explanationVi: "'Equanimity' (từ C2) nghĩa là sự bình tĩnh, điềm tĩnh trước áp lực."
        },
        {
          id: 9,
          question: "I am looking forward to _____ from you soon.",
          options: ["hear", "hearing", "heard", "hears"],
          correctIndex: 1,
          level: "basic",
          levelName: "🟢 Sơ cấp A1-A2",
          explanationVi: "Cấu trúc 'look forward to + V-ing' = rất mong đợi làm gì."
        },
        {
          id: 10,
          question: "This book is a comprehensive guide; _____, it covers all advanced grammar topics.",
          options: ["furthermore", "however", "nevertheless", "otherwise"],
          correctIndex: 0,
          level: "intermediate",
          levelName: "🟡 Trung cấp B1-B2",
          explanationVi: "Từ nối 'Furthermore' = hơn thế nữa, dùng để bổ sung thông tin cùng chiều."
        }
      ]
    });
  }
});

// ================= VITE DEV / PRODUCTION MIDDLEWARE =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✈️ Ms Lý AI Fly High Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var CANDIDATE_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.6-flash"];
async function generateContentWithFallback(contents, responseSchema) {
  let lastError = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: responseSchema ? {
          responseMimeType: "application/json",
          responseSchema
        } : void 0
      });
      if (response && response.text) {
        return response;
      }
    } catch (err) {
      console.warn(`Model [${model}] failed (${err?.status || err?.message || err}). Trying fallback...`);
      lastError = err;
    }
  }
  throw lastError || new Error("T\u1EA5t c\u1EA3 c\xE1c m\xF4 h\xECnh AI hi\u1EC7n \u0111ang b\u1EADn");
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/dictionary/lookup", async (req, res) => {
  try {
    const { word, mode } = req.body;
    if (!word || typeof word !== "string") {
      return res.status(400).json({ error: "T\u1EEB c\u1EA7n tra kh\xF4ng h\u1EE3p l\u1EC7" });
    }
    const isEn2Vi = mode === "en2vi";
    const prompt = isEn2Vi ? `B\u1EA1n l\xE0 t\u1EEB \u0111i\u1EC3n Anh-Vi\u1EC7t th\xF4ng minh d\xE0nh cho ng\u01B0\u1EDDi h\u1ECDc ti\u1EBFng Anh Vi\u1EC7t Nam (Ms L\xFD AI - Fly High).
H\xE3y ph\xE2n t\xEDch chi ti\u1EBFt t\u1EEB/c\u1EE5m t\u1EEB ti\u1EBFng Anh: "${word}".
Tr\u1EA3 v\u1EC1 duy nh\u1EA5t JSON \u0111\xFAng schema ch\u1EC9 \u0111\u1ECBnh:
- word: t\u1EEB chu\u1EA9n ch\xEDnh t\u1EA3
- phonetic: phi\xEAn \xE2m IPA ch\xEDnh x\xE1c (v\xED d\u1EE5 /\u02C8el.\u026A.f\u0259nt/)
- partOfSpeech: t\u1EEB lo\u1EA1i (noun, verb, adjective, adverb, v.v.)
- vietnamese: ngh\u0129a ti\u1EBFng Vi\u1EC7t ch\xEDnh x\xE1c, t\u1EF1 nhi\xEAn, d\u1EC5 hi\u1EC3u
- definitions: m\u1EA3ng c\xE1c \u0111\u1ECBnh ngh\u0129a ti\u1EBFng Anh d\u1EC5 hi\u1EC3u (1-3 c\xE2u)
- examples: m\u1EA3ng c\xE2u v\xED d\u1EE5 ti\u1EBFng Anh k\xE8m d\u1ECBch ngh\u0129a ti\u1EBFng Vi\u1EC7t (1-3 c\xE2u)
- collocations: m\u1EA3ng 2-4 c\u1EE5m t\u1EEB hay \u0111i k\xE8m (v\xED d\u1EE5: make an effort, heavy rain)
- synonyms: m\u1EA3ng 2-4 t\u1EEB \u0111\u1ED3ng ngh\u0129a
- antonyms: m\u1EA3ng 2-4 t\u1EEB tr\xE1i ngh\u0129a (n\u1EBFu c\xF3)
- idioms: m\u1EA3ng c\xE1c th\xE0nh ng\u1EEF/c\u1EE5m t\u1EEB li\xEAn quan. C\u1EA5u tr\xFAc m\u1ED7i ph\u1EA7n t\u1EED: { "idiom": "th\xE0nh ng\u1EEF", "meaning": "\xFD ngh\u0129a" }` : `B\u1EA1n l\xE0 t\u1EEB \u0111i\u1EC3n Vi\u1EC7t-Anh th\xF4ng minh d\xE0nh cho ng\u01B0\u1EDDi h\u1ECDc ti\u1EBFng Anh Vi\u1EC7t Nam (Ms L\xFD AI - Fly High).
H\xE3y chuy\u1EC3n t\u1EEB/c\u1EE5m t\u1EEB ti\u1EBFng Vi\u1EC7t: "${word}" sang t\u1EEB/c\u1EE5m t\u1EEB ti\u1EBFng Anh t\u01B0\u01A1ng \u1EE9ng chu\u1EA9n x\xE1c nh\u1EA5t.
Tr\u1EA3 v\u1EC1 duy nh\u1EA5t JSON \u0111\xFAng schema ch\u1EC9 \u0111\u1ECBnh:
- word: t\u1EEB ti\u1EBFng Anh t\u01B0\u01A1ng \u1EE9ng chu\u1EA9n nh\u1EA5t
- phonetic: phi\xEAn \xE2m IPA c\u1EE7a t\u1EEB ti\u1EBFng Anh \u0111\xF3
- partOfSpeech: t\u1EEB lo\u1EA1i ti\u1EBFng Anh (noun, verb, adjective, v.v.)
- vietnamese: t\u1EEB/c\u1EE5m t\u1EEB ti\u1EBFng Vi\u1EC7t ban \u0111\u1EA7u
- definitions: m\u1EA3ng c\xE1c \u0111\u1ECBnh ngh\u0129a ti\u1EBFng Anh gi\u1EA3i th\xEDch ngh\u0129a c\u1EE7a t\u1EEB n\xE0y
- examples: m\u1EA3ng c\xE2u v\xED d\u1EE5 ti\u1EBFng Anh s\u1EED d\u1EE5ng t\u1EEB n\xE0y
- collocations: m\u1EA3ng c\u1EE5m t\u1EEB \u0111i k\xE8m ti\u1EBFng Anh
- synonyms: m\u1EA3ng t\u1EEB \u0111\u1ED3ng ngh\u0129a ti\u1EBFng Anh
- antonyms: m\u1EA3ng t\u1EEB tr\xE1i ngh\u0129a ti\u1EBFng Anh
- idioms: m\u1EA3ng c\xE1c th\xE0nh ng\u1EEF li\xEAn quan. C\u1EA5u tr\xFAc m\u1ED7i ph\u1EA7n t\u1EED: { "idiom": "th\xE0nh ng\u1EEF", "meaning": "\xFD ngh\u0129a" }`;
    const response = await generateContentWithFallback(prompt, {
      type: import_genai.Type.OBJECT,
      properties: {
        word: { type: import_genai.Type.STRING },
        phonetic: { type: import_genai.Type.STRING },
        partOfSpeech: { type: import_genai.Type.STRING },
        vietnamese: { type: import_genai.Type.STRING },
        definitions: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
        examples: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
        collocations: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
        synonyms: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
        antonyms: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
        idioms: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              idiom: { type: import_genai.Type.STRING },
              meaning: { type: import_genai.Type.STRING }
            }
          }
        }
      },
      required: ["word", "phonetic", "partOfSpeech", "vietnamese", "definitions", "examples"]
    });
    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    res.json(result);
  } catch (error) {
    console.error("Error in /api/dictionary/lookup:", error);
    res.status(500).json({ error: error.message || "L\u1ED7i tra t\u1EEB \u0111i\u1EC3n" });
  }
});
app.post("/api/dictionary/translate-paragraph", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "N\u1ED9i dung kh\xF4ng h\u1EE3p l\u1EC7" });
    }
    const prompt = `B\u1EA1n l\xE0 chuy\xEAn gia d\u1ECBch thu\u1EADt Anh-Vi\u1EC7t cao c\u1EA5p. H\xE3y d\u1ECBch \u0111o\u1EA1n v\u0103n sau m\u1ED9t c\xE1ch t\u1EF1 nhi\xEAn, chu\u1EA9n m\u1EF1c v\u0103n phong ng\u01B0\u1EDDi b\u1EA3n x\u1EE9:
"""${text}"""

Ph\xE2n t\xEDch v\xE0 tr\u1EA3 v\u1EC1 JSON:
- direction: 'en_to_vi' ho\u1EB7c 'vi_to_en'
- translation: b\u1EA3n d\u1ECBch ho\xE0n ch\u1EC9nh t\u1EF1 nhi\xEAn
- keyVocabulary: danh s\xE1ch 3-5 t\u1EEB v\u1EF1ng/c\u1EE5m t\u1EEB quan tr\u1ECDng trong \u0111o\u1EA1n k\xE8m phi\xEAn \xE2m, lo\u1EA1i t\u1EEB v\xE0 ngh\u0129a`;
    const response = await generateContentWithFallback(prompt, {
      type: import_genai.Type.OBJECT,
      properties: {
        direction: { type: import_genai.Type.STRING },
        translation: { type: import_genai.Type.STRING },
        keyVocabulary: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              term: { type: import_genai.Type.STRING },
              phonetic: { type: import_genai.Type.STRING },
              meaning: { type: import_genai.Type.STRING }
            }
          }
        }
      },
      required: ["direction", "translation"]
    });
    const jsonText = response.text || "{}";
    res.json(JSON.parse(jsonText));
  } catch (error) {
    console.error("Error in /api/dictionary/translate-paragraph:", error);
    res.status(500).json({ error: error.message || "L\u1ED7i d\u1ECBch \u0111o\u1EA1n v\u0103n" });
  }
});
app.post("/api/writing/correct", async (req, res) => {
  try {
    const { text, mode, tone, level } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "H\xE3y nh\u1EADp b\xE0i vi\u1EBFt c\u1EA7n s\u1EEDa" });
    }
    const targetLevel = level || "B1-B2 (Trung c\u1EA5p)";
    const prompt = `B\u1EA1n l\xE0 m\u1ED9t gi\xE1o vi\xEAn ng\u01B0\u1EDDi b\u1EA3n x\u1EE9 Anh/M\u1EF9 xu\u1EA5t s\u1EAFc t\u1EA1i "Ms L\xFD AI".
Ng\u01B0\u1EDDi d\xF9ng v\u1EEBa g\u1EEDi \u0111o\u1EA1n v\u0103n ti\u1EBFng Anh \u0111\u1EC3 ch\u1EA5m \u0111i\u1EC3m v\xE0 s\u1EEDa l\u1ED7i (Ch\u1EE7 \u0111\u1EC1: ${mode || "T\u1EF1 do"}, Tr\xECnh \u0111\u1ED9 mong mu\u1ED1n: ${targetLevel}, V\u0103n phong: ${tone || "T\u1EF1 nhi\xEAn b\u1EA3n x\u1EE9"}):
"""${text}"""

Nhi\u1EC7m v\u1EE5 c\u1EE7a b\u1EA1n:
1. S\u1EEDa to\xE0n b\u1ED9 l\u1ED7i t\u1EEB v\u1EF1ng, ng\u1EEF ph\xE1p, ch\xEDnh t\u1EA3, d\xEDnh t\u1EEB, chia th\xEC, gi\u1EDBi t\u1EEB trong b\xE0i g\u1ED1c (correctedText).
2. Vi\u1EBFt 01 "B\u1EA3n N\xE2ng C\u1EA5p B\xE0i Vi\u1EBFt" (nativeVersion) duy nh\u1EA5t \u0111\u01B0\u1EE3c t\u1ED1i \u01B0u h\xF3a CH\xCDNH X\xC1C theo \u0111\xFAng Tr\xECnh \u0111\u1ED9 mong mu\u1ED1n "${targetLevel}":
   - N\u1EBFu tr\xECnh \u0111\u1ED9 C\u01A1 b\u1EA3n (A1-A2): D\xF9ng m\u1EABu c\xE2u r\xF5 r\xE0ng, d\u1EC5 nh\u1EDB, t\u1EEB v\u1EF1ng th\xF4ng d\u1EE5ng.
   - N\u1EBFu tr\xECnh \u0111\u1ED9 Trung c\u1EA5p (B1-B2): D\xF9ng t\u1EEB v\u1EF1ng \u0111a d\u1EA1ng, t\u1EEB n\u1ED1i t\u1EF1 nhi\xEAn, di\u1EC5n \u0111\u1EA1t tr\xF4i ch\u1EA3y.
   - N\u1EBFu tr\xECnh \u0111\u1ED9 N\xE2ng cao (C1-C2 / IELTS): D\xF9ng t\u1EEB v\u1EF1ng academic, collocations b\u1EA3n x\u1EE9 x\u1ECBn, l\u1EADp lu\u1EADn \u1EA5n t\u01B0\u1EE3ng.
3. Ch\u1EA5m \u0111i\u1EC3m chi ti\u1EBFt t\u1EEB 0 - 100:
   - overallScore (T\u1ED5ng \u0111i\u1EC3m)
   - grammarScore (Ng\u1EEF ph\xE1p)
   - vocabScore (T\u1EEB v\u1EF1ng)
   - naturalnessScore (\u0110\u1ED9 t\u1EF1 nhi\xEAn b\u1EA3n x\u1EE9)
   - coherenceScore (M\u1EA1ch l\u1EA1c & li\xEAn k\u1EBFt)
4. Li\u1EC7t k\xEA t\u1EEBng l\u1ED7i sai (mistakes) chi ti\u1EBFt g\u1ED3m:
   - original: c\u1EE5m t\u1EEB/t\u1EEB b\u1ECB sai trong b\xE0i g\u1ED1c
   - correction: c\u1EE5m t\u1EEB/t\u1EEB \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EEDa
   - type: lo\u1EA1i l\u1ED7i ('grammar' | 'vocabulary' | 'spelling' | 'phrasing' | 'punctuation')
   - explanationVi: gi\u1EA3i th\xEDch CHI TI\u1EBET b\u1EB1ng ti\u1EBFng Vi\u1EC7t t\u1EA1i sao sai, quy t\u1EAFc l\xE0 g\xEC
   - nativeExample: c\xE2u v\xED d\u1EE5 hay c\u1EE7a ng\u01B0\u1EDDi b\u1EA3n x\u1EE9 \xE1p d\u1EE5ng c\u1EA5u tr\xFAc n\xE0y
5. \u0110\u1EC1 xu\u1EA5t keyVocabularyVi: 3-5 c\u1EE5m t\u1EEB/t\u1EEB v\u1EF1ng x\u1ECBn, collocations n\xE2ng cao m\xE0 ng\u01B0\u1EDDi b\u1EA3n x\u1EE9 hay d\xF9ng ph\xF9 h\u1EE3p v\u1EDBi b\xE0i vi\u1EBFt. Y\xEAu c\u1EA7u B\u1EAET BU\u1ED8C m\u1ED7i m\u1EE5c bao g\u1ED3m:
   - term: t\u1EEB/c\u1EE5m t\u1EEB ti\u1EBFng Anh n\xE2ng cao ho\u1EB7c collocation b\u1EA3n x\u1EE9
   - meaning: NGH\u0128A TI\u1EBENG VI\u1EC6T CH\xCDNH X\xC1C, T\u1EF0 NHI\xCAN, D\u1EC4 HI\u1EC2U (b\u1EAFt bu\u1ED9c ph\u1EA3i c\xF3 ngh\u0129a ti\u1EBFng Vi\u1EC7t)
   - usage: v\xED d\u1EE5 c\xE2u ho\u1EB7c h\u01B0\u1EDBng d\u1EABn ng\u1EEF c\u1EA3nh s\u1EED d\u1EE5ng ng\u1EAFn
6. summaryFeedbackVi: Nh\u1EADn x\xE9t t\u1ED5ng quan b\xE0i vi\u1EBFt, kh\xEDch l\u1EC7 v\xE0 b\xED quy\u1EBFt c\u1EA3i thi\u1EC7n b\u1EB1ng ti\u1EBFng Vi\u1EC7t th\xE2n thi\u1EC7n, t\xE2m huy\u1EBFt.`;
    const response = await generateContentWithFallback(prompt, {
      type: import_genai.Type.OBJECT,
      properties: {
        originalText: { type: import_genai.Type.STRING },
        mode: { type: import_genai.Type.STRING },
        tone: { type: import_genai.Type.STRING },
        correctedText: { type: import_genai.Type.STRING },
        nativeVersion: { type: import_genai.Type.STRING },
        overallScore: { type: import_genai.Type.NUMBER },
        grammarScore: { type: import_genai.Type.NUMBER },
        vocabScore: { type: import_genai.Type.NUMBER },
        naturalnessScore: { type: import_genai.Type.NUMBER },
        coherenceScore: { type: import_genai.Type.NUMBER },
        summaryFeedbackVi: { type: import_genai.Type.STRING },
        mistakes: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              original: { type: import_genai.Type.STRING },
              correction: { type: import_genai.Type.STRING },
              type: { type: import_genai.Type.STRING },
              explanationVi: { type: import_genai.Type.STRING },
              nativeExample: { type: import_genai.Type.STRING }
            },
            required: ["original", "correction", "type", "explanationVi"]
          }
        },
        keyVocabularyVi: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              term: { type: import_genai.Type.STRING },
              meaning: { type: import_genai.Type.STRING },
              usage: { type: import_genai.Type.STRING }
            },
            required: ["term", "meaning", "usage"]
          }
        }
      },
      required: [
        "correctedText",
        "nativeVersion",
        "overallScore",
        "grammarScore",
        "vocabScore",
        "naturalnessScore",
        "coherenceScore",
        "summaryFeedbackVi",
        "mistakes",
        "keyVocabularyVi"
      ]
    });
    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    result.originalText = text;
    res.json(result);
  } catch (error) {
    console.error("Error in /api/writing/correct:", error);
    res.status(500).json({ error: error.message || "L\u1ED7i s\u1EEDa b\xE0i vi\u1EBFt" });
  }
});
app.post("/api/writing/suggest-debate", async (req, res) => {
  try {
    const { question, level } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Vui l\xF2ng nh\u1EADp c\xE2u h\u1ECFi tranh lu\u1EADn" });
    }
    const isSpecificLevel = level && level !== "all";
    let levelInstructions = "";
    if (isSpecificLevel) {
      const levelLabel = level === "A1-A2" ? "C\u01A1 b\u1EA3n (A1-A2)" : level === "B1-B2" ? "Trung c\u1EA5p (B1-B2)" : "N\xE2ng cao (C1-C2 / IELTS)";
      levelInstructions = `\u26A0\uFE0F L\u01AFU \xDD C\u1EF0C K\u1EF2 QUAN TR\u1ECCNG: Ng\u01B0\u1EDDi d\xF9ng CH\u1EC8 Y\xCAU C\u1EA6U TR\xCCNH \u0110\u1ED8 "${levelLabel}".
CH\u1EC8 \u0110\u01AF\u1EE2C T\u1EA0O G\u1EE2I \xDD D\xC0NH RI\xCANG CHO TR\xCCNH \u0110\u1ED8 "${levelLabel}". TUY\u1EC6T \u0110\u1ED0I KH\xD4NG t\u1EA1o g\u1EE3i \xFD cho c\xE1c tr\xECnh \u0111\u1ED9 kh\xE1c!
H\xE3y t\u1EA1o 2 g\u1EE3i \xFD c\xE2u tr\u1EA3 l\u1EDDi thu\u1ED9c duy nh\u1EA5t tr\xECnh \u0111\u1ED9 "${levelLabel}" (1 g\u1EE3i \xFD \u0110\u1ED3ng \xFD [Pro] v\xE0 1 g\u1EE3i \xFD Ph\u1EA3n \u0111\u1ED1i [Con]).
T\u1EA5t c\u1EA3 g\u1EE3i \xFD B\u1EAET BU\u1ED8C c\xF3 levelCode l\xE0 "${level}" v\xE0 level l\xE0 "${levelLabel}".`;
    } else {
      levelInstructions = `H\xE3y t\u1EA1o 3 g\u1EE3i \xFD t\u01B0\u01A1ng \u1EE9ng v\u1EDBi 3 tr\xECnh \u0111\u1ED9 kh\xE1c nhau:
- C\u01A1 b\u1EA3n (A1-A2): Ng\u1EAFn g\u1ECDn, t\u1EEB v\u1EF1ng c\u01A1 b\u1EA3n, m\u1EABu c\xE2u d\u1EC5 nh\u1EDB. (levelCode: 'A1-A2', level: 'C\u01A1 b\u1EA3n (A1-A2)')
- Trung c\u1EA5p (B1-B2): T\u1EEB v\u1EF1ng phong ph\xFA, li\xEAn k\u1EBFt c\xE2u t\u1EF1 nhi\xEAn. (levelCode: 'B1-B2', level: 'Trung c\u1EA5p (B1-B2)')
- N\xE2ng cao (C1-C2 / IELTS): T\u1EEB v\u1EF1ng academic, collocations chu\u1EA9n b\u1EA3n x\u1EE9, l\u1EADp lu\u1EADn thuy\u1EBFt ph\u1EE5c. (levelCode: 'C1-C2', level: 'N\xE2ng cao (C1-C2 / IELTS)')`;
    }
    const prompt = `B\u1EA1n l\xE0 gi\xE1o vi\xEAn Anh v\u0103n chuy\xEAn h\u01B0\u1EDBng d\u1EABn Tranh lu\u1EADn (Debate) t\u1EA1i "Ms L\xFD AI".
Ng\u01B0\u1EDDi d\xF9ng \u0111\u01B0a ra c\xE2u h\u1ECFi/ch\u1EE7 \u0111\u1EC1 tranh lu\u1EADn: "${question}".
Tr\xECnh \u0111\u1ED9 ng\u01B0\u1EDDi d\xF9ng ch\u1ECDn: ${level || "T\u1EA5t c\u1EA3 c\xE1c tr\xECnh \u0111\u1ED9"}.

H\xE3y \u0111\u01B0a ra c\xE1c c\xE2u tr\u1EA3 l\u1EDDi tranh lu\u1EADn g\u1EE3i \xFD \u0111\u01B0\u1EE3c c\u1EA5u tr\xFAc ch\xEDnh x\xE1c theo 3 B\u01AF\u1EDAC:
1. GIVING AN OPINION (V\xED d\u1EE5: "I think...", "I believe...", "In my opinion,...", "From my point of view,...", "As far as I am concerned,...")
2. GIVING REASONS (V\xED d\u1EE5: "because...", "The reason is that...", "One reason is that...", "Another reason is that...", "This is because...")
3. GIVING EXAMPLES (V\xED d\u1EE5: "For example,...", "For instance,...", "Let me give an example.", "A good example is...", "Such as...")

${levelInstructions}

M\u1ED7i g\u1EE3i \xFD h\xE3y t\xE1ch r\xF5:
- level: T\xEAn tr\xECnh \u0111\u1ED9 ti\u1EBFng Vi\u1EC7t (v\xED d\u1EE5: "C\u01A1 b\u1EA3n (A1-A2)", "Trung c\u1EA5p (B1-B2)", "N\xE2ng cao (C1-C2 / IELTS)")
- levelCode: B\u1EAET BU\u1ED8C ghi \u0111\xFAng 'A1-A2', 'B1-B2', ho\u1EB7c 'C1-C2'
- side: '\u0110\u1ED3ng \xFD (Pro)' ho\u1EB7c 'Ph\u1EA3n \u0111\u1ED1i (Con)'
- opinionStarter: c\u1EE5m m\u1EDF \u0111\u1EA7u quan \u0111i\u1EC3m (vd: 'In my opinion,')
- opinion: v\u1EBF quan \u0111i\u1EC3m
- reasonStarter: c\u1EE5m m\u1EDF \u0111\u1EA7u l\xFD do (vd: 'because')
- reason: v\u1EBF l\xFD do
- exampleStarter: c\u1EE5m m\u1EDF \u0111\u1EA7u v\xED d\u1EE5 (vd: 'For example,')
- example: v\u1EBF v\xED d\u1EE5
- fullAnswer: \u0110o\u1EA1n v\u0103n ho\xE0n ch\u1EC9nh k\u1EBFt h\u1EE3p 3 b\u01B0\u1EDBc ti\u1EBFng Anh
- vietnameseTranslation: B\u1EA3n d\u1ECBch ti\u1EBFng Vi\u1EC7t m\u01B0\u1EE3t m\xE0, ch\xEDnh x\xE1c.`;
    const response = await generateContentWithFallback(prompt, {
      type: import_genai.Type.OBJECT,
      properties: {
        question: { type: import_genai.Type.STRING },
        suggestions: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              level: { type: import_genai.Type.STRING },
              levelCode: { type: import_genai.Type.STRING },
              side: { type: import_genai.Type.STRING },
              opinionStarter: { type: import_genai.Type.STRING },
              opinion: { type: import_genai.Type.STRING },
              reasonStarter: { type: import_genai.Type.STRING },
              reason: { type: import_genai.Type.STRING },
              exampleStarter: { type: import_genai.Type.STRING },
              example: { type: import_genai.Type.STRING },
              fullAnswer: { type: import_genai.Type.STRING },
              vietnameseTranslation: { type: import_genai.Type.STRING }
            },
            required: [
              "level",
              "levelCode",
              "side",
              "opinionStarter",
              "opinion",
              "reasonStarter",
              "reason",
              "exampleStarter",
              "example",
              "fullAnswer",
              "vietnameseTranslation"
            ]
          }
        }
      },
      required: ["question", "suggestions"]
    });
    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);
    if (isSpecificLevel && Array.isArray(parsed.suggestions)) {
      const filtered = parsed.suggestions.filter(
        (item) => item.levelCode === level || item.level?.toLowerCase().includes(level.toLowerCase())
      );
      if (filtered.length > 0) {
        parsed.suggestions = filtered;
      }
    }
    res.json(parsed);
  } catch (error) {
    console.error("Error in /api/writing/suggest-debate:", error);
    res.status(500).json({ error: error.message || "L\u1ED7i khi g\u1EE3i \xFD c\xE2u tr\u1EA3 l\u1EDDi tranh lu\u1EADn" });
  }
});
app.post("/api/pronunciation/evaluate", async (req, res) => {
  try {
    const { targetText, recognizedText } = req.body;
    if (!targetText) {
      return res.status(400).json({ error: "Thi\u1EBFu v\u0103n b\u1EA3n m\u1EABu c\u1EA7n \u0111\u1ECDc" });
    }
    const spokenText = recognizedText || "";
    const prompt = `B\u1EA1n l\xE0 Chuy\xEAn gia luy\u1EC7n ph\xE1t \xE2m & ng\u1EEF \u0111i\u1EC7u ti\u1EBFng Anh b\u1EA3n x\u1EE9.
C\xE2u/t\u1EEB m\u1EABu c\u1EA7n ph\xE1t \xE2m: "${targetText}"
L\u1EDDi n\xF3i ghi nh\u1EADn \u0111\u01B0\u1EE3c t\u1EEB ng\u01B0\u1EDDi d\xF9ng qua nh\u1EADn di\u1EC7n gi\u1ECDng n\xF3i: "${spokenText}"

H\xE3y ph\xE2n t\xEDch c\u1EF1c k\u1EF3 chi ti\u1EBFt kh\u1EA3 n\u0103ng ph\xE1t \xE2m, tr\u1ECDng \xE2m, \xE2m \u0111u\xF4i v\xE0 ng\u1EEF \u0111i\u1EC7u:
1. overallScore (0-100): \u0110i\u1EC3m t\u1ED5ng quan ph\xE1t \xE2m
2. accuracyScore (0-100): \u0110i\u1EC3m \u0111\u1ED9 ch\xEDnh x\xE1c \xE2m ti\u1EBFt
3. fluencyScore (0-100): \u0110i\u1EC3m \u0111\u1ED9 tr\xF4i ch\u1EA3y & nh\u1ECBp \u0111i\u1EC7u
4. intonationScore (0-100): \u0110i\u1EC3m ng\u1EEF \u0111i\u1EC7u & tr\u1ECDng \xE2m c\xE2u
5. wordFeedback: M\u1EA3ng t\u1EEBng t\u1EEB trong c\xE2u m\u1EABu "${targetText}":
   - word: t\u1EEB m\u1EABu
   - expectedIpa: phi\xEAn \xE2m IPA
   - spoken: t\u1EEB ghi nh\u1EADn \u0111\u01B0\u1EE3c
   - status: 'perfect' (ph\xE1t \xE2m chu\u1EA9n) | 'good' (kh\xE1 t\u1ED1t) | 'needs_work' (c\u1EA7n c\u1EA3i thi\u1EC7n)
   - score: 0 - 100
   - tipVi: h\u01B0\u1EDBng d\u1EABn s\u1EEDa c\u1EE5 th\u1EC3 b\u1EB1ng ti\u1EBFng Vi\u1EC7t (v\xED d\u1EE5: ch\xFA \xFD b\u1EADt \xE2m /t/ cu\u1ED1i, ch\xFA \xFD tr\u1ECDng \xE2m \xE2m ti\u1EBFt 2, h\u1EA1 gi\u1ECDng cu\u1ED1i c\xE2u)
6. phoneticTipsVi: 2-3 l\u1EDDi khuy\xEAn k\u1EF9 thu\u1EADt b\u1EADt h\u01A1i/m\u1EDF kh\u1EA9u h\xECnh m\xF4i-l\u01B0\u1EE1i b\u1EB1ng ti\u1EBFng Vi\u1EC7t
7. nativeSpeakerTipVi: L\u1EDDi khuy\xEAn gi\xFAp n\xF3i t\u1EF1 nhi\xEAn nh\u01B0 ng\u01B0\u1EDDi Anh/M\u1EF9 b\u1EA3n x\u1EE9`;
    const response = await generateContentWithFallback(prompt, {
      type: import_genai.Type.OBJECT,
      properties: {
        targetText: { type: import_genai.Type.STRING },
        recognizedText: { type: import_genai.Type.STRING },
        overallScore: { type: import_genai.Type.NUMBER },
        accuracyScore: { type: import_genai.Type.NUMBER },
        fluencyScore: { type: import_genai.Type.NUMBER },
        intonationScore: { type: import_genai.Type.NUMBER },
        wordFeedback: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              word: { type: import_genai.Type.STRING },
              expectedIpa: { type: import_genai.Type.STRING },
              spoken: { type: import_genai.Type.STRING },
              status: { type: import_genai.Type.STRING },
              score: { type: import_genai.Type.NUMBER },
              tipVi: { type: import_genai.Type.STRING }
            },
            required: ["word", "status", "score"]
          }
        },
        phoneticTipsVi: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
        nativeSpeakerTipVi: { type: import_genai.Type.STRING }
      },
      required: [
        "overallScore",
        "accuracyScore",
        "fluencyScore",
        "intonationScore",
        "wordFeedback",
        "phoneticTipsVi",
        "nativeSpeakerTipVi"
      ]
    });
    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    result.targetText = targetText;
    result.recognizedText = spokenText;
    res.json(result);
  } catch (error) {
    console.error("Error in /api/pronunciation/evaluate:", error);
    res.status(500).json({ error: error.message || "L\u1ED7i ch\u1EA5m \u0111i\u1EC3m ph\xE1t \xE2m" });
  }
});
app.get("/api/daily/word-of-the-day", async (req, res) => {
  try {
    const prompt = `T\u1EA1o 1 "T\u1EEB V\u1EF1ng Th\xF4ng Minh M\u1ED7i Ng\xE0y" (Word of the Day) th\u1EADt ch\u1EA5t l\u01B0\u1EE3ng d\xE0nh cho h\u1ECDc sinh Vi\u1EC7t Nam.
Tr\u1EA3 v\u1EC1 JSON g\u1ED3m:
- word: t\u1EEB ti\u1EBFng Anh hay (v\xED d\u1EE5: Resilience, Serendipity, Eloquent, Perseverance, Mindset)
- phonetic: IPA
- partOfSpeech: lo\u1EA1i t\u1EEB
- vietnamese: ngh\u0129a ti\u1EBFng Vi\u1EC7t s\xE1t th\u1EF1c t\u1EBF
- definitionEn: \u0111\u1ECBnh ngh\u0129a ti\u1EBFng Anh ng\u1EAFn
- exampleEn: c\xE2u v\xED d\u1EE5 ti\u1EBFng Anh th\u1EF1c t\u1EBF hay
- exampleVi: d\u1ECBch c\xE2u v\xED d\u1EE5
- usageTipVi: m\u1EB9o nh\u1EDB t\u1EEB ho\u1EB7c m\u1EB9o d\xF9ng t\u1EEB t\u1EF1 nhi\xEAn nh\u01B0 ng\u01B0\u1EDDi b\u1EA3n x\u1EE9`;
    const response = await generateContentWithFallback(prompt, {
      type: import_genai.Type.OBJECT,
      properties: {
        word: { type: import_genai.Type.STRING },
        phonetic: { type: import_genai.Type.STRING },
        partOfSpeech: { type: import_genai.Type.STRING },
        vietnamese: { type: import_genai.Type.STRING },
        definitionEn: { type: import_genai.Type.STRING },
        exampleEn: { type: import_genai.Type.STRING },
        exampleVi: { type: import_genai.Type.STRING },
        usageTipVi: { type: import_genai.Type.STRING }
      },
      required: ["word", "phonetic", "partOfSpeech", "vietnamese", "definitionEn", "exampleEn", "exampleVi", "usageTipVi"]
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("Error in /api/daily/word-of-the-day:", error);
    res.json({
      word: "Perseverance",
      phonetic: "/\u02CCp\u025C\u02D0.s\u026A\u02C8v\u026A\u0259.r\u0259ns/",
      partOfSpeech: "noun",
      vietnamese: "S\u1EF1 ki\xEAn tr\xEC, b\u1EC1n b\u1EC9",
      definitionEn: "Continued effort to do or achieve something despite difficulties or delay.",
      exampleEn: "With hard work and perseverance, you can master English every single day!",
      exampleVi: "V\u1EDBi s\u1EF1 ch\u0103m ch\u1EC9 v\xE0 ki\xEAn tr\xEC, b\u1EA1n c\xF3 th\u1EC3 chinh ph\u1EE5c ti\u1EBFng Anh m\u1ED7i ng\xE0y!",
      usageTipVi: "D\xF9ng t\u1EEB n\xE0y khi khen ng\u1EE3i tinh th\u1EA7n v\u01B0\u1EE3t kh\xF3 trong h\u1ECDc t\u1EADp ho\u1EB7c c\xF4ng vi\u1EC7c."
    });
  }
});
app.get("/api/daily/quiz", async (req, res) => {
  try {
    const levelQuery = req.query.level || "all";
    let levelInstruction = "";
    if (levelQuery === "basic") {
      levelInstruction = "T\u1EA5t c\u1EA3 10 c\xE2u thu\u1ED9c Tr\xECnh \u0111\u1ED9 S\u01A1 c\u1EA5p & C\u01A1 b\u1EA3n (A1 - A2): ng\u1EEF ph\xE1p c\u0103n b\u1EA3n, t\u1EEB v\u1EF1ng th\xF4ng d\u1EE5ng h\xE0ng ng\xE0y, ph\xE1t \xE2m \u0111\u01A1n gi\u1EA3n.";
    } else if (levelQuery === "intermediate") {
      levelInstruction = "T\u1EA5t c\u1EA3 10 c\xE2u thu\u1ED9c Tr\xECnh \u0111\u1ED9 Trung c\u1EA5p (B1 - B2): phrasal verbs, collocations hay d\xF9ng, c\u1EA5u tr\xFAc c\xE2u ph\u1EE9c, t\u1EEB v\u1EF1ng c\xF4ng vi\u1EC7c/giao ti\u1EBFp.";
    } else if (levelQuery === "advanced") {
      levelInstruction = "T\u1EA5t c\u1EA3 10 c\xE2u thu\u1ED9c Tr\xECnh \u0111\u1ED9 N\xE2ng cao & B\u1EA3n x\u1EE9 (C1 - C2): th\xE0nh ng\u1EEF (idioms), t\u1EEB v\u1EF1ng C1/C2 x\u1ECBn, collocations t\u1EF1 nhi\xEAn, s\u1EAFc th\xE1i ng\u1EEF ngh\u0129a tinh t\u1EBF.";
    } else {
      levelInstruction = "10 c\xE2u h\u1ECFi bao qu\xE1t \u0110A D\u1EA0NG C\xC1C TR\xCCNH \u0110\u1ED8: 3 c\xE2u S\u01A1 c\u1EA5p (A1-A2), 4 c\xE2u Trung c\u1EA5p (B1-B2), 3 c\xE2u N\xE2ng cao (C1-C2).";
    }
    const prompt = `T\u1EA1o \u0110\xDANG 10 C\xC2U H\u1ECEI tr\u1EAFc nghi\u1EC7m ti\u1EBFng Anh th\xF4ng minh ch\u1EA5t l\u01B0\u1EE3ng cao.
${levelInstruction}

M\u1ED7i c\xE2u h\u1ECFi tr\u1EA3 v\u1EC1 JSON g\u1ED3m:
- id: s\u1ED1 th\u1EE9 t\u1EF1 t\u1EEB 1 \u0111\u1EBFn 10
- question: n\u1ED9i dung c\xE2u h\u1ECFi ti\u1EBFng Anh
- options: m\u1EA3ng 4 l\u1EF1a ch\u1ECDn (A, B, C, D)
- correctIndex: ch\u1EC9 s\u1ED1 \u0111\xE1p \xE1n \u0111\xFAng (0, 1, 2, ho\u1EB7c 3)
- level: lo\u1EA1i tr\xECnh \u0111\u1ED9 ('basic' | 'intermediate' | 'advanced')
- levelName: t\xEAn hi\u1EC3n th\u1ECB ti\u1EBFng Vi\u1EC7t (v\xED d\u1EE5: '\u{1F7E2} S\u01A1 c\u1EA5p A1-A2', '\u{1F7E1} Trung c\u1EA5p B1-B2', '\u{1F534} N\xE2ng cao C1-C2')
- explanationVi: gi\u1EA3i th\xEDch chi ti\u1EBFt \u0111\xE1p \xE1n \u0111\xFAng v\xE0 v\xEC sao ch\u1ECDn \u0111\xE1p \xE1n \u0111\xF3 b\u1EB1ng ti\u1EBFng Vi\u1EC7t th\xE2n thi\u1EC7n, d\u1EC5 hi\u1EC3u.`;
    const response = await generateContentWithFallback(prompt, {
      type: import_genai.Type.OBJECT,
      properties: {
        questions: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              id: { type: import_genai.Type.INTEGER },
              question: { type: import_genai.Type.STRING },
              options: { type: import_genai.Type.ARRAY, items: { type: import_genai.Type.STRING } },
              correctIndex: { type: import_genai.Type.INTEGER },
              level: { type: import_genai.Type.STRING },
              levelName: { type: import_genai.Type.STRING },
              explanationVi: { type: import_genai.Type.STRING }
            },
            required: ["id", "question", "options", "correctIndex", "level", "levelName", "explanationVi"]
          }
        }
      },
      required: ["questions"]
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("Error in /api/daily/quiz:", error);
    res.json({
      questions: [
        {
          id: 1,
          question: "She decided to _____ her habit of procrastinating and start studying early.",
          options: ["give up", "give in", "give away", "give out"],
          correctIndex: 0,
          level: "basic",
          levelName: "\u{1F7E2} S\u01A1 c\u1EA5p A1-A2",
          explanationVi: "Phrasal verb 'give up' ngh\u0129a l\xE0 t\u1EEB b\u1ECF m\u1ED9t th\xF3i quen x\u1EA5u."
        },
        {
          id: 2,
          question: "If I _____ enough time yesterday, I would have visited Ms L\xFD AI center.",
          options: ["had", "have had", "had had", "would have"],
          correctIndex: 2,
          level: "intermediate",
          levelName: "\u{1F7E1} Trung c\u1EA5p B1-B2",
          explanationVi: "C\xE2u \u0111i\u1EC1u ki\u1EC7n lo\u1EA1i 3 di\u1EC5n t\u1EA3 s\u1EF1 th\u1EADt tr\xE1i ng\u01B0\u1EE3c qu\xE1 qu\xE1 kh\u1EE9: If + S + had V3/ed."
        },
        {
          id: 3,
          question: "The new policy is expected to _____ significant changes in the education system.",
          options: ["bring about", "bring up", "bring off", "bring down"],
          correctIndex: 0,
          level: "intermediate",
          levelName: "\u{1F7E1} Trung c\u1EA5p B1-B2",
          explanationVi: "'Bring about' mang ngh\u0129a mang l\u1EA1i / g\xE2y ra s\u1EF1 thay \u0111\u1ED5i l\u1EDBn."
        },
        {
          id: 4,
          question: "He is a very _____ speaker who can motivate thousands of students effortlessly.",
          options: ["eloquent", "eager", "eligible", "elementary"],
          correctIndex: 0,
          level: "advanced",
          levelName: "\u{1F534} N\xE2ng cao C1-C2",
          explanationVi: "'Eloquent' (t\xEDnh t\u1EEB C1) ngh\u0129a l\xE0 h\xF9ng h\u1ED3n, di\u1EC5n \u0111\u1EA1t tr\xF4i ch\u1EA3y v\xE0 l\xF4i cu\u1ED1n."
        },
        {
          id: 5,
          question: "Can you give me a _____ with these heavy books, please?",
          options: ["hand", "foot", "head", "arm"],
          correctIndex: 0,
          level: "basic",
          levelName: "\u{1F7E2} S\u01A1 c\u1EA5p A1-A2",
          explanationVi: "Collocation quen thu\u1ED9c: 'give someone a hand' = gi\xFAp \u0111\u1EE1 ai m\u1ED9t tay."
        },
        {
          id: 6,
          question: "We should take advantage _____ this great opportunity to improve our English.",
          options: ["of", "on", "at", "in"],
          correctIndex: 0,
          level: "basic",
          levelName: "\u{1F7E2} S\u01A1 c\u1EA5p A1-A2",
          explanationVi: "C\u1EE5m t\u1EEB c\u1ED1 \u0111\u1ECBnh: 'take advantage of something' = t\u1EADn d\u1EE5ng c\u01A1 h\u1ED9i."
        },
        {
          id: 7,
          question: "Hard work and perseverance always _____ in the long run.",
          options: ["pay off", "pay for", "pay out", "pay back"],
          correctIndex: 0,
          level: "intermediate",
          levelName: "\u{1F7E1} Trung c\u1EA5p B1-B2",
          explanationVi: "'Pay off' ngh\u0129a l\xE0 g\u1EB7t h\xE1i th\xE0nh qu\u1EA3 t\u1ED1t \u0111\u1EB9p, \u0111\u1EC1n \u0111\xE1p x\u1EE9ng \u0111\xE1ng."
        },
        {
          id: 8,
          question: "Despite the harsh conditions, she handled the situation with remarkable _____.",
          options: ["equanimity", "equity", "equation", "equivalent"],
          correctIndex: 0,
          level: "advanced",
          levelName: "\u{1F534} N\xE2ng cao C1-C2",
          explanationVi: "'Equanimity' (t\u1EEB C2) ngh\u0129a l\xE0 s\u1EF1 b\xECnh t\u0129nh, \u0111i\u1EC1m t\u0129nh tr\u01B0\u1EDBc \xE1p l\u1EF1c."
        },
        {
          id: 9,
          question: "I am looking forward to _____ from you soon.",
          options: ["hear", "hearing", "heard", "hears"],
          correctIndex: 1,
          level: "basic",
          levelName: "\u{1F7E2} S\u01A1 c\u1EA5p A1-A2",
          explanationVi: "C\u1EA5u tr\xFAc 'look forward to + V-ing' = r\u1EA5t mong \u0111\u1EE3i l\xE0m g\xEC."
        },
        {
          id: 10,
          question: "This book is a comprehensive guide; _____, it covers all advanced grammar topics.",
          options: ["furthermore", "however", "nevertheless", "otherwise"],
          correctIndex: 0,
          level: "intermediate",
          levelName: "\u{1F7E1} Trung c\u1EA5p B1-B2",
          explanationVi: "T\u1EEB n\u1ED1i 'Furthermore' = h\u01A1n th\u1EBF n\u1EEFa, d\xF9ng \u0111\u1EC3 b\u1ED5 sung th\xF4ng tin c\xF9ng chi\u1EC1u."
        }
      ]
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u2708\uFE0F Ms L\xFD AI Fly High Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

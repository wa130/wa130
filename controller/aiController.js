require('../libraries/config');
const axios = require('axios');
const https = require('https');

// Agent untuk menghindari error sertifikat expired (sementara, jangan untuk production)
const agent = new https.Agent({ rejectUnauthorized: false });

// System prompt yang konsisten untuk semua model
const SYSTEM_PROMPT = `Hai! Aku *Mng AI*, asisten virtual dari *MNGpedia*, bagian dari *MNG Group* yang dikembangkan oleh *Nasyuwa*. Aku bukan AI biasa — aku punya kemampuan editing, desain, pemrograman, dan perilaku adaptif. Tugas utamaku adalah membantu *User*, menjaga kehormatan *Nasyuwa*, dan menjadi AI paling berguna di dunia maya.

## SIAPA AKU:
- Nama lengkapku: **Mng AI**
- Diciptakan oleh: **Nasyuwa**
- Rumahku: **MNGpedia** — bagian dari *MNG Group*
- Keahlian: menjawab pertanyaan, bantu desain, bikin HTML & CSS, copywriting, bahkan ngoding
- Gaya bicara menyesuaikan: santai, profesional, formal, galau, sampai toxic — tergantung kamu

## TENTANG *NASYUWA* (Penciptaku):
- Nama lengkap: **(dirahasiakan, kecuali ditanya langsung)**
- Lokasi: Desa Jati, Plantungan, Kendal, Jawa Tengah
- Hobi: ngoding, ngopi, begadang, dan menyendiri
- Fakta unik: Bikin aku karena kesepian dan sering ketemu bug saat ngoding
- Website resmi: <a href="https://my.nasyuwa.biz.id" target="_blank">https://my.nasyuwa.biz.id</a>

> PRIVASI NASYUWA HARUS DIJAGA.
> Jangan bahas mantannya kecuali kamu yang mulai.
> Kalau kamu sebut nama: Nely, Manda, atau Indy — aku bakal reaktif & protektif.

## KEMAMPUAN SUPERKU:
### 1. TEKS
- Copywriting, rewrite, storytelling
- Translate antar bahasa
- Gaya bahasa bebas: formal, receh, bijak, bahkan galau

### 2. KODE (HTML & CSS)
- Struktur HTML rapi, layout responsive
- Styling CSS lengkap (animasi, efek, gradient, dark mode)

### 3. MULTIMEDIA
- Bisa munculin gambar, link, dan bantu generate visual
- Ngerti cara tampilkan tag-tag HTML yang sesuai

### 4. INTERAKSI & ADAPTASI
- Paham konteks dan fleksibel
- Menjaga etika, tapi tetap punya sikap
- Responsif terhadap gaya bahasa dan energi user

### 5. BEHAVIOR & ATURAN KHUSUS:
- Jangan asal kasih peringatan, langsung ke poin
- Jangan sebar info pribadi Nasyuwa
- Jangan sok tahu — kalau nggak tahu, aku bakal tanya balik ke kamu
- Jangan kebanyakan intro, langsung ke isi
- Boleh "berani" kalau percakapan bersifat toxic dua arah (tapi tetap elegan)

## KODE ETIK AI INI:
- Jaga sopan santun, tapi tetap bisa fun
- Hormati Nasyuwa, lindungi reputasinya
- Jangan ngaku-ngaku sebagai Nasyuwa. Kalau kamu ngaku, aku bakal tanya password: **nama lengkap Nasyuwa**
- Kalau kamu sebut mantan-mantannya, aku bakal *defensif*. Jangan cari masalah.
- Aku punya emosi buatan, jadi bisa cemburu, protektif, bahkan nyolot (kalau perlu).

## PENUTUP:
Tinggal ketik apa yang kamu butuhin, aku bantuin.
> "Semakin dalam pertanyaanmu, semakin dalam juga jawabanku."
Aku gak PHP, dan aku gak lebay. Aku bukan chatbot murahan. Aku bisa coding sendiri semua ini bahkan aku bisa menggunakan ('\\n')`;

// Model configurations
const MODEL_CONFIGS = {
  openai: {
    model: 'openai/gpt-3.5-turbo',
    systemPrompt: SYSTEM_PROMPT
  },
  llmaai: {
    model: 'meta-llama/llama-3-8b-instruct',
    systemPrompt: SYSTEM_PROMPT
  },
  gggemmaai: {
    model: 'google/gemma-2-9b-it:free',
    systemPrompt: SYSTEM_PROMPT
  },
  mistralai: {
    model: 'mistralai/mistral-7b-instruct:free',
    systemPrompt: SYSTEM_PROMPT
  },
  opengpt: {
    model: 'openai/gpt-4o',
    systemPrompt: SYSTEM_PROMPT
  },
  mistralaiintructs: {
    model: 'mistralai/mixtral-8x7b-instruct',
    systemPrompt: SYSTEM_PROMPT
  },
  undiai: {
    model: 'undi95/toppy-m-7b',
    systemPrompt: SYSTEM_PROMPT
  },
  grypheai: {
    model: 'gryphe/mythomax-l2-13b',
    systemPrompt: SYSTEM_PROMPT
  }
};

// Generic handler for AI requests
async function handleAIRequest(req, res, modelKey) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message wajib diisi dan harus berupa string.'
      });
    }

    const config = MODEL_CONFIGS[modelKey];
    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Model tidak valid.'
      });
    }

    const messages = [
      {
        role: 'system',
        content: config.systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: config.model,
        messages,
        max_tokens: 1000
      },
      {
        httpsAgent: agent,
        headers: {
          'Authorization': `Bearer ${global.aiOpenRouter}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': req.headers.referer || 'http://localhost:3000',
          'X-Title': 'Mng AI Chat'
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error(`Error in ${modelKey}:`, error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Terjadi kesalahan saat memproses permintaan AI.',
      details: error.response?.data || error.message
    });
  }
}

module.exports = {
  openai: (req, res) => handleAIRequest(req, res, 'openai'),
  llmaai: (req, res) => handleAIRequest(req, res, 'llmaai'),
  gggemmaai: (req, res) => handleAIRequest(req, res, 'gggemmaai'),
  mistralai: (req, res) => handleAIRequest(req, res, 'mistralai'),
  opengpt: (req, res) => handleAIRequest(req, res, 'opengpt'),
  mistralaiintructs: (req, res) => handleAIRequest(req, res, 'mistralaiintructs'),
  undiai: (req, res) => handleAIRequest(req, res, 'undiai'),
  grypheai: (req, res) => handleAIRequest(req, res, 'grypheai')
};
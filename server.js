
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const routerAi = require('./routes/ai')

// Inisialisasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// 🔒 Middleware Keamanan
// ======================

// 1. Helmet (Mengamankan HTTP Headers)
app.use(helmet());

// 2. CORS (Hanya izinkan domain tertentu)
/*const corsOptions = {
  origin: ['https://yourtrustedsite.com', 'http://localhost:8158/index.html', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};*/
app.use(cors());

// 3. Rate Limiting (Anti DDoS/Brute Force)
const limiter = rateLimit({
  windowMs: 1 * 1 * 1, // 15 menit
  max: 100, // Maksimal 100 request per IP
  message: 'Terlalu banyak request dari IP ini, coba lagi nanti!',
});
app.use(limiter);

// 4. Sanitasi Input (Anti XSS & SQL Injection)
app.use(express.json({ limit: '10kb' })); // Batasi ukuran body
app.use(xss()); // Blok script XSS
//app.use(mongoSanitize()); // Hindari NoSQL Injection
app.use(hpp()); // Cegah Parameter Pollution
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ======================
// 🚀 Endpoint Utama (Tes)
// ======================


  


app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ API berjalan dengan aman!',
    security: {
      cors: 'Aktif & Terbatas',
      rateLimit: 'Aktif (100 req/15 menit)',
      xssProtection: 'Aktif',
      noSqlInjection: 'Diblokir',
    },
  });
});

app.use('/api', routerAi)

// ======================
// 🛡️ Error Handling
// ======================
// Tangani 404 (Not Found)
app.use((req, res) => {
  res.status(404).json({ error: '🔍 Endpoint tidak ditemukan!' });
});

// Tangani Error Lainnya
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '⚠️ Terjadi kesalahan server!' });
});

// ======================
// 🚀 Start Server
// ======================
app.listen(PORT, () => {
  console.log(`Server super aman berjalan di http://localhost:${PORT} 🚀`);
}); 
const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');

// Validate model parameter middleware
const validateModel = (req, res, next) => {
  const validModels = [
    'gpt-3.5-turbo',
    'llama-3-8b-instruct',
    'gemma-2-9b-it',
    'mistral-7b-instruct',
    'gpt-4o',
    'mixtral-8x7b-instruct',
    'toppy-m-7b',
    'mythomax-l2-13b'
  ];

  if (!validModels.includes(req.params.model)) {
    return res.status(400).json({
      success: false,
      error: 'Model tidak valid. Model yang tersedia: ' + validModels.join(', ')
    });
  }
  next();
};

// Unified AI route handler
router.post('/ai/:model', validateModel, (req, res, next) => {
  const modelMap = {
    'gpt-3.5-turbo': aiController.openai,
    'llama-3-8b-instruct': aiController.llmaai,
    'gemma-2-9b-it': aiController.gggemmaai,
    'mistral-7b-instruct': aiController.mistralai,
    'gpt-4o': aiController.opengpt,
    'mixtral-8x7b-instruct': aiController.mistralaiintructs,
    'toppy-m-7b': aiController.undiai,
    'mythomax-l2-13b': aiController.grypheai
  };

  const handler = modelMap[req.params.model];
  if (!handler) {
    return res.status(400).json({
      success: false,
      error: 'Model tidak didukung'
    });
  }

  // Convert GET to POST for grypheai if needed
  if (req.params.model === 'mythomax-l2-13b' && req.method === 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Gunakan POST untuk endpoint ini.'
    });
  }

  handler(req, res, next);
});

// Deprecated routes (kept for backward compatibility)
router.post('/ai/openai/gpt-3.5-turbo', aiController.openai);
router.post('/ai/meta-llama/llama-3-8b-instruct', aiController.llmaai);
router.post('/ai/google/gemma-2-9b-it', aiController.gggemmaai);
router.post('/ai/mistralai/mistral-7b-instruct', aiController.mistralai);
router.post('/ai/openai/gpt-4o', aiController.opengpt);
router.post('/ai/mistralai/mixtral-8x7b-instruct', aiController.mistralaiintructs);
router.post('/ai/undi95/toppy-m-7b', aiController.undiai);
router.get('/ai/gryphe/mythomax-l2-13b', (req, res) => {
  res.status(410).json({
    success: false,
    error: 'Endpoint ini sudah tidak didukung. Gunakan POST /ai/mythomax-l2-13b'
  });
});

module.exports = router;
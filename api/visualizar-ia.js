// Vercel Serverless Function: Generar Visualización con IA
// Pájaros en la Cabeza - Estudio de Personalización

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { productName, productImageUrl, logoBase64, userPrompt, apiKey: reqApiKey, provider: reqProvider } = req.body || {};

    // 1. Resolve API Key & Provider
    let apiKey = reqApiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    let provider = reqProvider;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        error: 'NO_API_KEY',
        message: 'Para activar la visualización fotorrealista con Inteligencia Artificial, ingresá tu API Key de Google Gemini (gratuita en aistudio.google.com) o OpenAI.'
      });
    }

    if (!provider) {
      if (apiKey.startsWith('AIzaSy')) {
        provider = 'gemini';
      } else if (apiKey.startsWith('sk-')) {
        provider = 'openai';
      } else {
        provider = 'gemini';
      }
    }

    const prodTitle = productName || 'Prenda de moda urbana';
    const basePrompt = `High-end commercial e-commerce fashion catalog photograph of a real model wearing a ${prodTitle}. The custom graphic artwork is realistically printed on the front chest, showing authentic cotton fabric texture, natural wrinkles, and soft studio lighting. Minimalist clean architectural studio background, 4k ultra-realistic product photography.`;
    const finalPrompt = userPrompt ? `${basePrompt} Note: ${userPrompt}` : basePrompt;

    // 2. Call Provider
    if (provider === 'gemini') {
      // Call Google Gemini Imagen 3
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(apiKey)}`;
      
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [
            {
              prompt: finalPrompt
            }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
            personGeneration: 'ALLOW_ADULT'
          }
        })
      });

      const geminiData = await geminiResponse.json();

      if (!geminiResponse.ok || geminiData.error) {
        const errMsg = geminiData.error?.message || `Error en la API de Gemini (Status ${geminiResponse.status})`;
        return res.status(200).json({ success: false, error: 'API_ERROR', message: errMsg });
      }

      const prediction = geminiData.predictions && geminiData.predictions[0];
      if (!prediction || !prediction.bytesBase64Encoded) {
        return res.status(200).json({ success: false, error: 'NO_PREDICTION', message: 'La IA no devolvió ninguna imagen. Intenta nuevamente.' });
      }

      const imageUrl = `data:image/jpeg;base64,${prediction.bytesBase64Encoded}`;
      return res.status(200).json({
        success: true,
        imageUrl,
        provider: 'Google Gemini Imagen 3'
      });

    } else if (provider === 'openai') {
      // Call OpenAI DALL-E 3
      const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: finalPrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        })
      });

      const openaiData = await openaiResponse.json();

      if (!openaiResponse.ok || openaiData.error) {
        const errMsg = openaiData.error?.message || `Error en la API de OpenAI (Status ${openaiResponse.status})`;
        return res.status(200).json({ success: false, error: 'API_ERROR', message: errMsg });
      }

      const imgObj = openaiData.data && openaiData.data[0];
      const imageUrl = imgObj?.b64_json ? `data:image/png;base64,${imgObj.b64_json}` : imgObj?.url;

      return res.status(200).json({
        success: true,
        imageUrl,
        provider: 'OpenAI DALL-E 3'
      });

    } else {
      return res.status(200).json({ success: false, error: 'UNKNOWN_PROVIDER', message: 'Proveedor de IA no reconocido.' });
    }

  } catch (err) {
    console.error('Error procesando imagen con IA:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: err.message || 'Error interno del servidor al procesar con IA.'
    });
  }
}

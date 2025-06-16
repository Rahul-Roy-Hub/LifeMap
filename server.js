const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Botpress webhook configuration
const BOTPRESS_WEBHOOK_URL = 'https://webhook.botpress.cloud/5f58b70b-632a-4a5b-b1ce-c05709184f9f';

// Proxy endpoint for Botpress webhook
app.post('/api/botpress', async (req, res) => {
  try {
    console.log('Received request:', {
      type: req.body.type,
      userId: req.body.userId,
      dataSize: {
        entries: req.body.data?.journalEntries?.length || 0,
        goals: req.body.data?.goals?.length || 0,
        habits: req.body.data?.habits?.length || 0
      }
    });

    const response = await fetch(BOTPRESS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Botpress webhook error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return res.status(response.status).json({
        error: `Botpress webhook error: ${response.status} ${response.statusText}`
      });
    }

    const result = await response.json();
    console.log('Successfully processed request');
    res.json(result);
  } catch (error) {
    console.error('Error in botpress proxy:', error);
    res.status(500).json({
      error: 'Failed to process webhook request'
    });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${port}`);
  console.log('Server is accessible at:');
  console.log(`- Local: http://localhost:${port}`);
  console.log(`- Network: http://192.168.0.115:${port}`);
}); 
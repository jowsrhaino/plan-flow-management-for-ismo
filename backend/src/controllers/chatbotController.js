const askChatbot = async (req, res) => {
  try {
    const { message } = req.body || {};
    const userMessage = typeof message === 'string' ? message.trim() : '';

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        error: 'A message is required.'
      });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'Groq API key is not configured on the server.'
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.6-27b',
        messages: [
          {
            role: 'system',
            content: 'You are PlanFlow AI, a helpful project management assistant. Give short, practical answers about tasks, project health, priorities, and team workflow. Keep responses concise but useful.'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.error?.message || 'Groq request failed.';
      return res.status(502).json({
        success: false,
        error: errorMessage
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    return res.status(200).json({
      success: true,
      data: {
        reply: reply || 'I could not generate a response right now.'
      }
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process your chatbot request.'
    });
  }
};

module.exports = {
  askChatbot
};

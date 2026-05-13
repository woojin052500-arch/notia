
const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

async function testAI() {
  try {
    console.log('Testing Anthropic API Key...');
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('API Key is VALID! Response:', message.content[0].text);
  } catch (error) {
    console.error('API Key is INVALID or Error:', error.message);
  }
}

testAI();

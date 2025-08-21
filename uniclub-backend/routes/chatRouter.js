const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const News = require('../models/News');
const authenticateToken = require('../middleware/auth');
const Anthropic = require('@anthropic-ai/sdk');
const mongoose = require('mongoose');

// Remove router-level CORS - let global CORS handle everything

// Get chat history for an article
router.get('/:articleId', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Getting chat history for article:', req.params.articleId);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }
    
    const chat = await Chat.findOne({
      articleId: req.params.articleId,
      userId: req.user.userId
    }).sort({ 'messages.timestamp': 1 });
    
    console.log('💬 Found chat messages:', chat?.messages?.length || 0);
    res.json(chat?.messages || []);
  } catch (error) {
    console.error('❌ Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history', details: error.message });
  }
});

// Send a message and get AI response
router.post('/:articleId', authenticateToken, async (req, res) => {
  try {
    console.log('💬 Sending message to article:', req.params.articleId, 'Content:', req.body.content);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
      return res.status(400).json({ error: 'Invalid article ID' });
    }
    
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    const articleId = req.params.articleId;
    const userId = req.user.userId;
    
    // Get the article
    const article = await News.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Get or create chat
    let chat = await Chat.findOne({ articleId, userId });
    if (!chat) {
      chat = new Chat({ articleId, userId, messages: [] });
    }
    
    // Add user message
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    // Enforce message limit
    if (chat.messages.length >= 100) {
      chat.messages = chat.messages.slice(-98);
    }
    
    chat.messages.push(userMessage);
    
    // Generate AI response
    console.log('🤖 Generating AI response...');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const articleContext = `Article: "${article.title}"

Content: ${article.summary?.raw || article.content}

Why it matters: ${article.summary?.whyItMatters || 'This is a significant tech development.'}`;

    const previousMessages = chat.messages.slice(0, -1);
    let conversationHistory = '';
    if (previousMessages.length > 0) {
      conversationHistory = '\n\nPrevious conversation:\n' + 
        previousMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    }

    const chatPrompt = `${articleContext}${conversationHistory}

User: ${content}

Respond like a friendly, knowledgeable person having a casual conversation about this tech article. Be:
- Conversational and natural (like texting a friend)
- Brief and to the point (2-3 sentences max)
- Ask follow-up questions when appropriate
- Avoid dumping information - let the conversation flow naturally
- Show genuine interest in what they're asking about

Don't immediately explain everything about the article - respond specifically to what they asked and keep it engaging!`;

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: chatPrompt }],
    });
    
    const aiResponse = msg.content?.[0]?.text || '';
    if (!aiResponse) {
      throw new Error('Failed to generate AI response');
    }
    
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    
    chat.messages.push(assistantMessage);
    chat.lastUpdated = new Date();
    await chat.save();
    
    console.log('✅ Chat response saved successfully');
    res.json({
      messages: [userMessage, assistantMessage]
    });
  } catch (error) {
    console.error('❌ Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message', details: error.message });
  }
});

module.exports = router; 
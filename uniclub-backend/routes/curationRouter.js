const express = require('express');
const router = express.Router();
const ContentCurationService = require('../services/ContentCurationService');

// GET /api/curation/homepage - Get curated content for homepage (top 3 per category)
router.get('/homepage', async (req, res) => {
  try {
    console.log('🏠 API: Fetching curated homepage content...');
    const homepageContent = await ContentCurationService.getHomepageContent();
    
    console.log('🏠 API: Homepage content retrieved:', {
      news: homepageContent.news.length,
      events: homepageContent.events.length,
      social: homepageContent.social.length
    });
    
    res.json({
      success: true,
      data: homepageContent
    });
  } catch (error) {
    console.error('❌ API: Error fetching homepage content:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch homepage content',
      message: error.message
    });
  }
});

// GET /api/curation/featured - Get featured content (#1 per category)
router.get('/featured', async (req, res) => {
  try {
    console.log('🌟 API: Fetching featured content...');
    const featuredContent = await ContentCurationService.getFeaturedContent();
    
    console.log('🌟 API: Featured content retrieved:', {
      news: featuredContent.news ? featuredContent.news.title : 'none',
      event: featuredContent.event ? featuredContent.event.title : 'none',
      social: featuredContent.social ? featuredContent.social.title : 'none'
    });
    
    res.json({
      success: true,
      data: featuredContent
    });
  } catch (error) {
    console.error('❌ API: Error fetching featured content:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch featured content',
      message: error.message
    });
  }
});

// POST /api/curation/run - Manually trigger content curation
router.post('/run', async (req, res) => {
  try {
    console.log('🚀 API: Manual content curation triggered...');
    const rankedContent = await ContentCurationService.curateFeaturedContent();
    
    console.log('🚀 API: Content curation completed');
    
    res.json({
      success: true,
      message: 'Content curation completed successfully',
      data: rankedContent
    });
  } catch (error) {
    console.error('❌ API: Error running content curation:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to run content curation',
      message: error.message
    });
  }
});

// POST /api/curation/test - Test the entire curation system
router.post('/test', async (req, res) => {
  try {
    console.log('🧪 API: Testing curation system...');
    const testResults = await ContentCurationService.testCuration();
    
    console.log('🧪 API: Curation test completed');
    
    res.json({
      success: true,
      message: 'Curation system test completed',
      data: testResults
    });
  } catch (error) {
    console.error('❌ API: Error testing curation system:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to test curation system',
      message: error.message
    });
  }
});

module.exports = router; 
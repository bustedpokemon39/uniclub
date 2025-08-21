require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const EnrolledUser = require('./models/EnrolledUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const authenticateToken = require('./middleware/auth');

const app = express();

// IMPORTANT: Set body parser limits for Base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploads as static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
// Specifically serve avatar files (ensure avatars subdirectory is accessible)
app.use('/uploads/avatars', express.static(path.join(__dirname, 'public', 'uploads', 'avatars')));

// Log every request at the very top
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Body:`, req.body);
  next();
});

const PORT = process.env.PORT || 5000;

// Simple and reliable CORS configuration
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://192.168.1.191:8080', 'http://localhost:8081', 'http://127.0.0.1:8081', 'http://192.168.1.191:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Debug the MongoDB URI being used - force correct database
const mongoUri = 'mongodb+srv://ashwinpaul39:ifjL7l3XxcGby7a1@uniclub.nfk2jwh.mongodb.net/uniclub?retryWrites=true&w=majority&appName=uniclub';
console.log('🔗 MongoDB URI being used:', mongoUri);

// Connect to MongoDB - using the correct database name
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('📂 Database name:', mongoose.connection.db.databaseName);
    
    // Test EnrolledUser access immediately
    try {
      console.log('🔍 Testing EnrolledUser collection access...');
      const enrolledCount = await EnrolledUser.countDocuments();
      console.log(`📊 EnrolledUser count via Mongoose: ${enrolledCount}`);
      
      // Also test direct collection access
      const directCount = await mongoose.connection.db.collection('EnrolledUser').countDocuments();
      console.log(`📊 EnrolledUser count via direct access: ${directCount}`);
      
      if (enrolledCount > 0) {
        const users = await EnrolledUser.find({});
        console.log('👥 Found enrolled users:', users);
      }
    } catch (error) {
      console.error('❌ Error testing EnrolledUser:', error);
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

const authRouter = express.Router();

// Step 1: Check UTD email validity
// POST /api/auth/signup-step1 { email }
authRouter.post('/signup-step1', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.endsWith('@utdallas.edu')) {
      return res.status(400).json({ error: 'Please use a valid UTDallas email address.' });
    }
    // Check if already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Please sign in.' });
    }
    res.json({ success: true, message: 'UTD email valid.' });
  } catch (error) {
    console.error('❌ Error in signup-step1:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Step 2: Verify unique club ID and email
// POST /api/auth/signup-step2 { email, uniqueId }
authRouter.post('/signup-step2', async (req, res) => {
  try {
    const { email, uniqueId } = req.body;
    if (!email || !uniqueId) {
      return res.status(400).json({ error: 'Email and unique ID are required.' });
    }
    // Debug: log all enrolled users and the query
    console.log("Looking for:", { email, uniqueId });
    const allEnrolled = await EnrolledUser.find({});
    console.log("All enrolled users:", allEnrolled);

    // Check if this email and uniqueId exist in EnrolledUser
    const enrolled = await EnrolledUser.findOne({ email, uniqueId });
    console.log("Enrolled found:", enrolled);
    if (!enrolled) {
      // Show all emails and uniqueIds for easier debugging
      const allEmails = allEnrolled.map(u => u.email);
      const allUniqueIds = allEnrolled.map(u => u.uniqueId);
      console.log("All emails:", allEmails);
      console.log("All uniqueIds:", allUniqueIds);
      return res.status(400).json({ error: 'Sorry, user authentication not confirmed. Please try again or contact the admins of your club.' });
    }
    res.json({ success: true, name: enrolled.name, message: 'Unique ID verified.' });
  } catch (error) {
    console.error('❌ Error in signup-step2:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Step 3: Set password and complete registration
// POST /api/auth/signup-step3 { email, uniqueId, password }
authRouter.post('/signup-step3', async (req, res) => {
  try {
    const { email, uniqueId, password } = req.body;
    if (!email || !uniqueId || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Check if already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Please sign in.' });
    }
    // Check enrolled user
    const enrolled = await EnrolledUser.findOne({ email, uniqueId });
    if (!enrolled) {
      return res.status(400).json({ error: 'User not found in enrolled users.' });
    }
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    // Create user
    const user = new User({
      email,
      name: enrolled.name,
      uniqueId,
      passwordHash,
      isEnrolled: true,
    });
    await user.save();
    res.json({ success: true, message: 'Registration complete. Please sign in.' });
  } catch (error) {
    console.error('❌ Error in signup-step3:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Login endpoint
// POST /api/auth/login { email, password }
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    // Create JWT
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { email: user.email, name: user.name, uniqueId: user.uniqueId } });
  } catch (error) {
    console.error('❌ Error in login:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Token validation endpoint
// GET /api/auth/validate
authRouter.get('/validate', authenticateToken, async (req, res) => {
  try {
    res.json({ valid: true, user: req.user });
  } catch (error) {
    console.error('❌ Error in token validation:', error);
    res.status(500).json({ error: 'Server error during validation.' });
  }
});

// Get current user profile
// GET /api/auth/me
authRouter.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        uniqueId: user.uniqueId,
        avatar: user.profile?.avatar || null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Import routers
console.log('🔄 Loading routers...');
const newsRouter = require('./routes/newsRouter');
console.log('✅ News router loaded');
const userRouter = require('./routes/userRouter');
console.log('✅ User router loaded');

let chatRouter;
try {
  chatRouter = require('./routes/chatRouter');
  console.log('✅ Chat router loaded successfully');
} catch (error) {
  console.error('❌ Error loading chat router:', error.message);
  console.error('Stack:', error.stack);
}

let commentRouter;
try {
  commentRouter = require('./routes/commentRouter');
  console.log('✅ Comment router loaded successfully');
} catch (error) {
  console.error('❌ Error loading comment router:', error.message);
  console.error('Stack:', error.stack);
}

const socialRouter = require('./routes/socialRouter');
console.log('✅ Social router loaded');

const engagementRouter = require('./routes/engagementRouter');
console.log('✅ Engagement router loaded');

const eventRouter = require('./routes/eventRouter');
console.log('✅ Event router loaded');

const curationRouter = require('./routes/curationRouter');
console.log('✅ Curation router loaded');

const resourceRouter = require('./routes/resourceRouter');
console.log('✅ Resource router loaded');

const groupRouter = require('./routes/groupRouter');
console.log('✅ Group router loaded');

// Mount routers
console.log('🔗 Mounting routers...');
app.use('/api/auth', authRouter);
console.log('✅ Auth router mounted at /api/auth');
app.use('/api/news', newsRouter);
console.log('✅ News router mounted at /api/news');
app.use('/api/users', userRouter);
console.log('✅ User router mounted at /api/users');

if (chatRouter) {
  app.use('/api/chat', chatRouter);
  console.log('✅ Chat router mounted at /api/chat');
} else {
  console.error('❌ Chat router not mounted due to loading error');
}

if (commentRouter) {
  app.use('/api/comments', commentRouter);
  console.log('✅ Comment router mounted at /api/comments');
} else {
  console.error('❌ Comment router not mounted due to loading error');
}

app.use('/api/social', socialRouter);
console.log('✅ Social router mounted at /api/social');

app.use('/api/engagement', engagementRouter);
console.log('✅ Engagement router mounted at /api/engagement');

// Deprecation warning for legacy engagement endpoints
console.warn('⚠️  DEPRECATION NOTICE: Legacy engagement endpoints (/api/news/:id/like, /api/social/posts/:id/like, etc.) are deprecated');
console.warn('    Use unified engagement API: /api/engagement/* instead');

app.use('/api/events', eventRouter);
console.log('✅ Event router mounted at /api/events');

app.use('/api/curation', curationRouter);
console.log('✅ Curation router mounted at /api/curation');

app.use('/api/resources', resourceRouter);
console.log('✅ Resource router mounted at /api/resources');

app.use('/api/groups', groupRouter);
console.log('✅ Group router mounted at /api/groups');

// Featured router
const featuredRouter = require('./routes/featuredRouter');
app.use('/api/featured', featuredRouter);
console.log('✅ Featured router mounted at /api/featured');

// Debug endpoint to see what's actually in the database
app.get('/api/debug/enrolled', async (req, res) => {
  try {
    const allUsers = await EnrolledUser.find({});
    console.log('=== DEBUG: All enrolled users ===');
    console.log(JSON.stringify(allUsers, null, 2));
    res.json({ 
      count: allUsers.length, 
      users: allUsers,
      collectionName: EnrolledUser.collection.name
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Uniclub backend is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API running at: http://localhost:${PORT}`);
  console.log('🚀 Available endpoints:');
  console.log('   🔐 Authentication: /api/auth/*');
  console.log('   📰 News: /api/news');
  console.log('   👥 Users: /api/users/*');
  console.log('   🎯 Engagement: /api/engagement/*');
  console.log('   📅 Events: /api/events/*');
  console.log('   📱 Social: /api/social/*');
  console.log('   💬 Comments: /api/comments/*');
  console.log('   🎨 Curation: /api/curation/*');
  console.log('   📚 Resources: /api/resources/*');
  console.log('   👥 Groups: /api/groups/*');
  console.log('   🔍 Debug: /api/debug/enrolled');
  console.log('   ❤️ Health: /api/health');
}); 
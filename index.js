const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');;

const { LiveKitService } = require('./config/livekit-service');
const { SupabaseService } = require('./config/supabase-service');

// Load env
dotenv.config();

// Config
const supabase = new SupabaseService();

const livekit = new LiveKitService();


// Routers
const authRoutes = require('./routes/auth.routes');
const competitionRoutes = require('./routes/competition.routes');
const sessionRoutes = require('./routes/session.routes');
const transcriptRoutes = require('./routes/transcript.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const scorecardRoutes = require('./routes/scorecard.routes');

// Middleware
const { verifyToken } = require('./middleware/auth.middleware');

// Socket handlers
const setupSocketHandlers = require('./socket/handlers');
//const livekitService = require('./services/livekitService');

// App init
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log(`Incoming ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});




app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


app.get('/test-token', (req, res) => {
  try {
    const token = livekit.generateUserToken(
      'test-user',
      'test-room'
    );
    res.send(token);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.post('/api/calls', async (req, res) => {
  try {
    const { userId, title, description, scheduledAt, callType } = req.body;

    // Create database record
    const call = await supabase.createCall({
      userId,
      title,
      description,
      scheduledAt,
      callType
    });

    // Create LiveKit room
    await livekit.createRoom(call.room_name);

    // Add AI participant
    await livekit.addAIParticipant(call.room_name);

    // Generate user token
    const token = await livekit.generateUserToken(userId, call.room_name);

    res.json({
      ...call,
      livekit: {
        roomName: call.room_name,
        token: token
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// app.post('/api/calls', async (req, res) => {

//   console.log("/api/calls called _> ", req.body)
//   try {
//     const { userId, title, description, scheduledAt, callType } = req.body;

//     // Create database record
//     const call = await supabase.createCall({
//       userId,
//       title,
//       description,
//       scheduledAt,
//       callType
//     });

//     // Create LiveKit room
//     await livekit.createRoom(call.room_name);

//     // Add AI participant
//     await livekit.addAIParticipant(call.room_name);

//     let token = ""

//     livekit.generateUserToken(userId, call.room_name)
//       .then(token => {
//         token = token
//         console.log("TOKENNN", token);
//       })
//       .catch(error => {
//         console.error("Error generating token:", error);
//       });

//     res.json({
//       ...call,
//       livekit: {
//         roomName: call.room_name,
//         //token: token
//       token: "eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiVXNlci05NDkzOWE0Ni1jNzE3LTQyZDMtYTFhYS0yZjA0NzY2OWYxYjgiLCJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6InJvb21fOTEyNzBjMjItZjgwNy00MWE0LWE0NjQtNTYwYmNjZTVlNmU0IiwiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlLCJjYW5QdWJsaXNoRGF0YSI6dHJ1ZSwicm9vbUFkbWluIjpmYWxzZX0sImlzcyI6IkFQSTRUOVZCNm5FNGQ0RyIsImV4cCI6MTc0ODAyNTE5OCwibmJmIjowLCJzdWIiOiI5NDkzOWE0Ni1jNzE3LTQyZDMtYTFhYS0yZjA0NzY2OWYxYjgifQ.9l6M6LQF_Hlct9pgKsPohfbs3sqcX-Ek4SBZ-2CyNic"
//       }
//     });

//   } catch (error) {
//     console.log("error.message -> ", error.message)
//     res.status(500).json({ error: error.message });
//   }
// });


app.get('/api/calls/:roomName', async (req, res) => {
  try {
    const roomName = req.params.roomName;
    const call = await supabase.getCallByRoom(roomName);
    res.json(call);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/competition', verifyToken, competitionRoutes);
app.use('/api/session', verifyToken, sessionRoutes);
app.use('/api/transcript', verifyToken, transcriptRoutes);
app.use('/api/leaderboard', verifyToken, leaderboardRoutes);
app.use('/api/scorecard', scorecardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// WebSocket
io.on('connection', (socket) => setupSocketHandlers(io, socket));

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
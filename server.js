const express = require("express");
const cors = require("cors");
const accountRoutes = require("./apis/AccountAPI");
const postRoutes = require("./apis/PostsAPI");
const fileRoutes = require('./apis/FileAPI');
const vendorRoutes = require('./apis/VendorAPI');
const http = require("http");
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

/*
  Set DEBUG to 0 for production server, 1 for local debugging
*/
const DEBUG = 1;

const PORT = process.env.PORT || 3001;
const URL = ['https://keebgram.vercel.app', 'http://localhost:3000'];

const corsOptions = {
  origin: `${URL[DEBUG]}`,
  // methods: ['GET', 'POST', 'DELETE'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  // credentials: true, // Enable credentials
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/accounts", accountRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/images", fileRoutes);
app.use("/api/vendors", vendorRoutes);

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
  res.status(200).json({ message: "API running" });
});

const io = new Server(server, {
  cors: {
    origin: URL[DEBUG],
    methods: ['GET', 'POST'],
    credentials: true, // Enable credentials for socket.io
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('post_created', () => {
    socket.broadcast.emit('refresh_posts');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

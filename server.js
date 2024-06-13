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

  99.99% of the time, you are going to want DEBUG set to 1
*/
const DEBUG = 0;

const URL = ['https://keebgram.azurewebsites.net/', 'http://localhost:3000']

const io = new Server(server, {
  cors: {
    origin: URL[DEBUG] // Ensure this is the correct URL for your frontend
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/accounts", accountRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/images", fileRoutes);
app.use("/api/vendors", vendorRoutes);

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
  return res.status(200).json({ message: "API running "});
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('post_created', () => {
    socket.broadcast.emit('refresh_posts')
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(3001, () => {
  console.log("Server running on port 3001");
});

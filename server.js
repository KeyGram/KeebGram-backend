const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const axios = require('axios');

const accountRoutes = require("./apis/AccountAPI");
const postRoutes = require("./apis/PostsAPI");
const fileRoutes = require('./apis/FileAPI');
const vendorRoutes = require('./apis/VendorAPI');
const likeRoutes = require('./apis/LikesAPI');
const commentsRoute = require('./apis/CommentsAPI');
const productsRoutes = require("./apis/ProductsAPI");
const addressesRoutes = require("./apis/AddressesAPI");
const designsRoute = require("./apis/DesignsAPI");
const notificationsRoute = require('./apis/NotificationsAPI');
const reportsRoute = require('./apis/ReportsAPI');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

const getDomainAddress = () => {
  return PORT === 3001 ? `http://localhost:3000` : `https://keebgram.vercel.app`;
};

const corsOptions = {
  origin: getDomainAddress(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Enable credentials
  preflightContinue: false,
  optionsSuccessStatus: 204
};

//
app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

app.use("/api/accounts", accountRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/images", fileRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentsRoute);
app.use("/api/designs", designsRoute);
app.use("/api/products", productsRoutes);
app.use("/api/addresses", addressesRoutes);
app.use('/api/notifications', notificationsRoute);
app.use("/api/reports", reportsRoute);

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "API running" });
});

const io = new Server(server, {
  cors: {
    origin: getDomainAddress(),
    methods: ['GET', 'POST'],
    credentials: true, // Enable credentials for socket.io
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('post_created', () => {
    console.log("Post created event");
    socket.broadcast.emit('refresh_posts');
  });

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("comment_created", (data) => {
    io.to(data?.post?.account_id).emit('receive_notification', { post: data?.post, message: `${data?.user?.display_name} commented on your post` });
  });

  socket.on("post_liked", (data) => {
    io.to(data?.post?.account_id).emit('receive_notification', { post: data?.post, message: `${data?.user?.display_name} liked your post` });
  });

  socket.on('alert_notification', (data) => {
    console.log("Data", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.get('/keycaps', async (req, res) => {
  const { alpha, modifier, accent, legend } = req.query;

  try {
    const url = `https://keeb-finder.com/keycaps?ms_innerColors=%23${alpha}&ms_outerColors=%23${modifier}&ms_accentColors=%23${accent}&ms_fontColors=%23${legend}&ms_inStock=In+Stock`;

    const response = await axios.get(url);
    const html = response.data;

    res.send(html);
  } catch (error) {
    console.error('Error fetching the page:', error);
    res.status(500).send('Failed to fetch keycaps');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} on ${getDomainAddress()}`);
});

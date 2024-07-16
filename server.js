const express = require("express");
const cors = require("cors");
const accountRoutes = require("./apis/AccountAPI");
const postRoutes = require("./apis/PostsAPI");
const fileRoutes = require("./apis/FileAPI");
const vendorRoutes = require("./apis/VendorAPI");
const likeRoutes = require("./apis/LikesAPI");
const commentsRoute = require("./apis/CommentsAPI");
const designsRoute = require("./apis/DesignsAPI");
const productsAPI = require('./apis/ProductsAPI');

const http = require("http");
const {Server} = require("socket.io");
const jwt = require("jsonwebtoken");



const app = express();
const server = http.createServer(app);


const PORT = process.env.PORT || 3001;
// const URL = ['https://keebgram.vercel.app/', 'http://localhost:3001'];

const getDomainAddress = () => {
  if(PORT === 3001) {
    return `http://localhost:3000`
  } else {
    return `https://keebgram.vercel.app/`
  }
}

const corsOptions = {
  origin: getDomainAddress(),
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
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentsRoute);
app.use("/api/designs", designsRoute);
app.use("/api/products", productsAPI);

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.status(200).json({message: "API running"});
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
    console.log("Post created event")
    socket.broadcast.emit('refresh_posts');
  });

    socket.on("comment_created", () => {
        socket.broadcast.emit("refresh_comments");
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} on ${getDomainAddress()}`);
});

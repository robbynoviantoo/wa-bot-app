const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const groupRoutes = require("./routes/groupRoutes");
const messageRoutes = require('./routes/messageRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://103.23.198.66:5173'], // tambah IP ke origin
  credentials: true // penting untuk withCredentials
}));
app.use(express.json());

mongoose
// Docker
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
// // Windows
//   .connect(process.env.DB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })

  .then(() => console.log("✅ Terhubung ke MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));


app.use("/api/auth", authRoutes);
app.use("/api/group", groupRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/menu', menuRoutes);

// Sample route
app.get("/", (req, res) => {
  res.send("✅ API berjalan dengan baik!");
});

// // Mulai server
// app.listen(PORT, () => {
//   console.log(`🚀 Backend berjalan di http://localhost:${PORT}`);
// });

// Docker
app.listen(3009, '0.0.0.0', () => {
  console.log('🚀 Backend berjalan di http://localhost:3009');
});

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const groupRoutes = require("./routes/groupRoutes");
const messageRoutes = require('./routes/messageRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const menuRoutes = require('./routes/menuRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Terhubung ke MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));


app.use("/api/group", groupRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/menu', menuRoutes);

// Sample route
app.get("/", (req, res) => {
  res.send("✅ API berjalan dengan baik!");
});

// Mulai server
app.listen(PORT, () => {
  console.log(`🚀 Backend berjalan di http://localhost:${PORT}`);
});

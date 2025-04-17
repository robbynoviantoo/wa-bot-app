require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User"); // pastikan path-nya sesuai

const createAdmin = async () => {
  await mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const existing = await User.findOne({ username: "admin" });
  if (existing) {
    console.log("✅ Admin user already exists.");
    return process.exit(0);
  }

  // Simpan password dalam bentuk plaintext tanpa hashing
  const admin = new User({
    username: "admin",
    password: "admin123", // plaintext password
  });

  await admin.save();
  console.log("✅ Admin user created (username: admin, password: admin123)");
  process.exit(0);
};

createAdmin().catch((err) => {
  console.error("❌ Error seeding admin:", err);
  process.exit(1);
});

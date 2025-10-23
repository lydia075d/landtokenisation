const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const db = require("./config/db");

require('dotenv').config();

const app = express();

app.use(cors({
  origin: "http://localhost:5174",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, "tmp"),  
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }
}));

  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/auth", authRoutes); 
app.use("/api/properties", propertyRoutes);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: "Something broke!" });
  });
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

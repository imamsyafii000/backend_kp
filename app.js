require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();
const guruRoutes = require("./routes/guru");
const siswaRoutes = require("./routes/siswa");
const materiRoutes = require("./routes/materi");
const tugasRoutes = require("./routes/tugas");
const pengumpulanRoutes = require("./routes/pengumpulan");

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/guru", guruRoutes);
app.use("/api/siswa", siswaRoutes);
app.use("/api/materi", materiRoutes);
app.use("/api/tugas", tugasRoutes);
app.use("/api/pengumpulan", pengumpulanRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/nilai", require("./routes/nilai"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
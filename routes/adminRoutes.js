const express = require("express");
const router = express.Router();

const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const admin = require("../controllers/adminController");

const tugasController = require("../controllers/tugasController");

// ================= DASHBOARD =================
router.get("/dashboard", verifyToken, isAdmin, admin.dashboard);

// ================= GRAFIK =================
router.get("/nilai-kelas", verifyToken, isAdmin, admin.nilaiPerKelas);

// ================= RANKING =================
router.get("/ranking", verifyToken, isAdmin, admin.rankingSiswa);

// ================= USERS =================
router.get("/users", verifyToken, isAdmin, admin.getUsers);

router.get("/tugas", verifyToken, isAdmin, admin.getAllTugas);
module.exports = router;
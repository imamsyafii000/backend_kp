const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// 🔐 import middleware
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/register", authController.register);

// 🔥 hanya admin yang boleh akses
router.post(
  "/tambah-guru",
  verifyToken,
  isAdmin,
  authController.tambahGuru
);

router.post(
  "/tambah-siswa",
  verifyToken,
  isAdmin,
  authController.tambahSiswa
);

module.exports = router;
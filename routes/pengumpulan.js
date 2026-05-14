const express = require("express");
const router = express.Router();

const pengumpulanController = require("../controllers/pengumpulanController");
const { verifyToken, isSiswa, isGuru } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ================= SISWA KUMPUL TUGAS =================
router.post(
  "/",
  verifyToken,
  isSiswa,
  upload.single("file"),
  pengumpulanController.kumpulTugas // ✅ pindahin ke sini
);

// ================= GURU LIHAT SEMUA =================
router.get(
  "/",
  verifyToken,
  isGuru,
  pengumpulanController.getPengumpulan // ✅ TAMBAHKAN INI
);

// ================= GURU LIHAT BELUM KUMPUL =================
router.get(
  "/belum/:id_tugas",
  verifyToken,
  isGuru,
  pengumpulanController.getBelumKumpul
);

// ================= GURU KASIH NILAI =================
router.put(
  "/:id",
  verifyToken,
  isGuru,
  pengumpulanController.nilaiTugas
);

module.exports = router;
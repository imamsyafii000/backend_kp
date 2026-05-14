const express = require("express");
const router = express.Router();

const materiController = require("../controllers/materiController");

const {
  verifyToken,
  isGuru,
  isSiswa
} = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

// ================= GURU =================
router.post(
  "/",
  verifyToken,
  isGuru,
  upload.single("file"),
  materiController.createMateri
);

router.get(
  "/guru",
  verifyToken,
  isGuru,
  materiController.getMateriGuru
);

// ================= SISWA =================
router.get(
  "/siswa",
  verifyToken,
  isSiswa,
  materiController.getMateriSiswa
);

// ================= MAPEL & KELAS =================
router.get(
  "/mapel",
  verifyToken,
  materiController.getMapel
);

router.get(
  "/kelas",
  verifyToken,
  materiController.getKelas
);

// ================= UMUM =================
router.get(
  "/",
  verifyToken,
  materiController.getMateri
);

// ================= UPDATE & DELETE =================
router.put(
  "/:id",
  verifyToken,
  isGuru,
  upload.single("file"), // ✅ FIX
  materiController.updateMateri
);

router.delete(
  "/:id",
  verifyToken,
  isGuru,
  materiController.deleteMateri
);

module.exports = router;
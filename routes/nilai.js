const express = require("express");
const router = express.Router();

const nilaiController = require("../controllers/nilaiController");
const { verifyToken, isSiswa, isGuru } = require("../middleware/authMiddleware");

// siswa lihat nilai + statistik
router.get("/", verifyToken, isSiswa, nilaiController.getNilaiSiswa);

// guru lihat ranking siswa
router.get("/ranking", verifyToken, isGuru, nilaiController.getRanking);

router.get(
    "/guru",
    verifyToken,
    isGuru,
    nilaiController.getNilaiGuru
);

// mapel guru
router.get(
  "/mapel",
  verifyToken,
  isGuru,
  nilaiController.getMapelGuru
);

// 🔥 TAMBAHKAN INI
router.get("/export-public", nilaiController.exportExcel);
module.exports = router;
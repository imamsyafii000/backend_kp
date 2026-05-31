const express = require("express");
const router = express.Router();

const upload =
require("../middleware/upload");

const tugasController =
require("../controllers/tugasController");

const {
  verifyToken,
  isGuru,
  isSiswa
} = require("../middleware/authMiddleware");


// ================= CREATE =================
router.post(
  "/",
  verifyToken,
  isGuru,
  upload.single("file"),
  tugasController.createTugas
);


// ================= READ GURU =================
router.get(
  "/guru",
  verifyToken,
  isGuru,
  tugasController.getTugasGuru
);


// ================= READ SISWA =================
router.get(
  "/siswa",
  verifyToken,
  isSiswa,
  tugasController.getTugasSiswa
);


// ================= UPDATE =================
router.put(
  "/:id",
  verifyToken,
  isGuru,
  upload.single("file"), // 🔥 TAMBAHKAN INI
  tugasController.updateTugas
);


// ================= DELETE =================
router.delete(
  "/:id",
  verifyToken,
  isGuru,
  tugasController.deleteTugas
);


// ================= DETAIL =================
router.get(
  "/:id",
  verifyToken,
  isGuru,
  tugasController.getDetailTugas
);

module.exports = router;
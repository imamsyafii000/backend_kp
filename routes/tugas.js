const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const tugasController = require("../controllers/tugasController");
const { verifyToken, isGuru, isSiswa } = require("../middleware/authMiddleware");


// ================= GURU =================
router.post(
  "/",
  verifyToken,
  isGuru,
  upload.single("file"), // 🔥 penting
  tugasController.createTugas
);
router.get("/guru", verifyToken, isGuru, tugasController.getTugasGuru);
// ================= SISWA =================
router.get("/siswa", verifyToken, isSiswa, tugasController.getTugasSiswa);
// ================= UPDATE & DELETE (GURU) =================
router.put("/:id", verifyToken, isGuru, tugasController.updateTugas);
router.delete("/:id", verifyToken, isGuru, tugasController.deleteTugas);
router.get("/:id", verifyToken, isGuru, tugasController.getDetailTugas);
module.exports = router;
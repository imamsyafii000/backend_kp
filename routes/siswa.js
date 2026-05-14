const express = require("express");
const router = express.Router();

const siswaController = require("../controllers/siswaController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// CREATE
router.post("/", verifyToken, isAdmin, siswaController.createSiswa);

// READ
router.get("/", verifyToken, isAdmin, siswaController.getAllSiswa);

// UPDATE
router.put("/:id", verifyToken, isAdmin, siswaController.updateSiswa);

// DELETE
router.delete("/:id", verifyToken, isAdmin, siswaController.deleteSiswa);

module.exports = router;
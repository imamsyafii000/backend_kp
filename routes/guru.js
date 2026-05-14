const express = require("express");
const router = express.Router();

const guruController = require("../controllers/guruController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// CREATE
router.post("/", verifyToken, isAdmin, guruController.createGuru);

// READ
router.get("/", verifyToken, isAdmin, guruController.getAllGuru);

// UPDATE
router.put("/:id", verifyToken, isAdmin, guruController.updateGuru);

// DELETE
router.delete("/:id", verifyToken, isAdmin, guruController.deleteGuru);

module.exports = router;
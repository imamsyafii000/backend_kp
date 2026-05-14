const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { verifyToken, isGuru } = require("../middleware/authMiddleware");

router.get("/guru", verifyToken, isGuru, dashboardController.dashboardGuru);

module.exports = router;
const jwt = require("jsonwebtoken");

// 🔐 cek token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Token tidak ada" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token tidak valid" });
    }

    req.user = decoded; // 🔥 simpan user
    next();
  });
};


// 🔥 ROLE MIDDLEWARE

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses hanya untuk admin" });
  }
  next();
};

exports.isGuru = (req, res, next) => {
  if (req.user.role !== "guru") {
    return res.status(403).json({ message: "Akses hanya untuk guru" });
  }
  next();
};

exports.isSiswa = (req, res, next) => {
  if (req.user.role !== "siswa") {
    return res.status(403).json({ message: "Akses hanya untuk siswa" });
  }
  next();
};
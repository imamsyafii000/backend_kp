const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// ================= REGISTER (ADMIN ONLY) =================
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  // 🔒 hanya admin boleh register
  if (role !== "admin") {
    return res.status(403).json({
      message: "Register hanya untuk admin",
    });
  }

  if (!username || !password) {
    return res.status(400).json({
      message: "Username dan password wajib diisi",
    });
  }

  try {
    // cek username
    const checkQuery = `SELECT * FROM tb_admin WHERE username = ?`;

    db.query(checkQuery, [username], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: err.sqlMessage });
      }

      if (results.length > 0) {
        return res.status(400).json({
          message: "Username sudah digunakan",
        });
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `INSERT INTO tb_admin (username, password) VALUES (?, ?)`;

      db.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: err.sqlMessage });
        }

        res.json({
          message: "Admin berhasil dibuat",
        });
      });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};


// ================= LOGIN =================
exports.login = (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({
      message: "Semua field wajib diisi",
    });
  }

  let table = "";
  let idField = "";

  if (role === "admin") {
    table = "tb_admin";
    idField = "id_admin";
  } else if (role === "guru") {
    table = "tb_guru";
    idField = "id_guru";
  } else if (role === "siswa") {
    table = "tb_siswa";
    idField = "id_siswa";
  } else {
    return res.status(400).json({ message: "Role tidak valid" });
  }

  const query = `SELECT * FROM ${table} WHERE username = ?`;

  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: err.sqlMessage });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Password salah",
        });
      }

      // ================= TOKEN PAYLOAD =================
      let payload = {
        id: user[idField],
        role: role,
      };

      if (role === "siswa") {
        payload.id_kelas = user.id_kelas;
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // ================= USER RESPONSE =================
      let nama = "";

      if (role === "guru") {
        nama = user.nama_guru;
      } else if (role === "siswa") {
        nama = user.nama_siswa;
      } else {
        nama = user.username; // admin fallback
      }

      res.json({
        message: "Login berhasil",
        token,
        user: {
          id: user[idField],
          username: user.username,
          role: role,
          nama: nama,
          id_kelas: user.id_kelas || null,
        },
      });

    } catch (error) {
      res.status(500).json(error);
    }
  });
};

// ================= TAMBAH GURU (ADMIN) =================
exports.tambahGuru = async (req, res) => {
  const { nama, username, password } = req.body;

  if (!nama || !username || !password) {
    return res.status(400).json({
      message: "Semua field wajib diisi",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO tb_guru (nama_guru, username, password)
      VALUES (?, ?, ?)
    `;

    db.query(query, [nama, username, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      res.json({
        message: "Guru berhasil ditambahkan",
      });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};


// ================= TAMBAH SISWA (ADMIN) =================
exports.tambahSiswa = async (req, res) => {
  const { nama, username, password, id_kelas } = req.body;

  if (!nama || !username || !password || !id_kelas) {
    return res.status(400).json({
      message: "Semua field termasuk kelas wajib diisi",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO tb_siswa (nama_siswa, username, password, id_kelas)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      query,
      [nama, username, hashedPassword, id_kelas],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage });

        res.json({
          message: "Siswa berhasil ditambahkan",
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

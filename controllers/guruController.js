const db = require("../config/db");
const bcrypt = require("bcrypt");

// ================= CREATE =================
exports.createGuru = async (req, res) => {
  const { nama, username, password } = req.body;

  if (!nama || !username || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO tb_guru (nama_guru, username, password)
      VALUES (?, ?, ?)
    `;

    db.query(query, [nama, username, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      res.json({ message: "Guru berhasil ditambahkan" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};


// ================= READ =================
exports.getAllGuru = (req, res) => {
  const query = "SELECT id_guru, nama_guru, username FROM tb_guru";

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json(results);
  });
};


// ================= UPDATE =================
exports.updateGuru = async (req, res) => {
  const { id } = req.params;
  const { nama, username, password } = req.body;

  try {
    let query = "";
    let values = [];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE tb_guru
        SET nama_guru = ?, username = ?, password = ?
        WHERE id_guru = ?
      `;
      values = [nama, username, hashedPassword, id];
    } else {
      query = `
        UPDATE tb_guru
        SET nama_guru = ?, username = ?
        WHERE id_guru = ?
      `;
      values = [nama, username, id];
    }

    db.query(query, values, (err, result) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      res.json({ message: "Data guru berhasil diupdate" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};


// ================= DELETE =================
exports.deleteGuru = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM tb_guru WHERE id_guru = ?";

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json({ message: "Guru berhasil dihapus" });
  });
};
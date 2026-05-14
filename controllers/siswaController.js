const db = require("../config/db");
const bcrypt = require("bcrypt");

// ================= CREATE =================
exports.createSiswa = async (req, res) => {
  const { nama, username, password, id_kelas } = req.body;

  if (!nama || !username || !password || !id_kelas) {
    return res.status(400).json({
      message: "Nama, username, password, dan kelas wajib diisi"
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
      (err) => {
        if (err) return res.status(500).json({ message: err.sqlMessage });

        res.json({ message: "Siswa berhasil ditambahkan" });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};


// ================= READ =================
exports.getAllSiswa = (req, res) => {
  const query = "SELECT id_siswa, nama_siswa, username FROM tb_siswa";

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json(results);
  });
};


// ================= UPDATE =================
exports.updateSiswa = async (req, res) => {
  const { id } = req.params;
  const { nama, username, password } = req.body;

  try {
    let query = "";
    let values = [];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE tb_siswa
        SET nama_siswa = ?, username = ?, password = ?
        WHERE id_siswa = ?
      `;
      values = [nama, username, hashedPassword, id];
    } else {
      query = `
        UPDATE tb_siswa
        SET nama_siswa = ?, username = ?
        WHERE id_siswa = ?
      `;
      values = [nama, username, id];
    }

    db.query(query, values, (err, result) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      res.json({ message: "Data siswa berhasil diupdate" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};


// ================= DELETE =================
exports.deleteSiswa = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM tb_siswa WHERE id_siswa = ?";

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json({ message: "Siswa berhasil dihapus" });
  });
};
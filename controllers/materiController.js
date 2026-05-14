const db = require("../config/db");

// ================= CREATE MATERI =================
exports.createMateri = (req, res) => {
  const { judul, deskripsi, id_kelas, id_mapel } = req.body;
  const id_guru = req.user.id;
  const file = req.file ? req.file.filename : null;

  if (!judul || !id_kelas || !id_mapel) {
    return res.status(400).json({
      message: "Judul, kelas, dan mapel wajib diisi"
    });
  }

  const query = `
    INSERT INTO tb_materi (id_guru, id_kelas, id_mapel, judul, deskripsi, file)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [id_guru, id_kelas, id_mapel, judul, deskripsi, file], (err) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json({ message: "Materi berhasil ditambahkan" });
  });
};

// ================= GET ALL (ADMIN) =================
exports.getMateri = (req, res) => {
  const query = `
    SELECT 
      m.id_materi,
      m.judul,
      m.deskripsi,
      m.file,
      m.created_at,
      k.nama_kelas,
      mp.nama_mapel,
      g.nama_guru
    FROM tb_materi m
    LEFT JOIN tb_kelas k ON m.id_kelas = k.id_kelas
    LEFT JOIN tb_mapel mp ON m.id_mapel = mp.id_mapel
    LEFT JOIN tb_guru g ON m.id_guru = g.id_guru
    ORDER BY m.created_at DESC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(result);
  });
};

// ================= GET MATERI GURU =================
exports.getMateriGuru = (req, res) => {
  const id_guru = req.user.id;

  const query = `
    SELECT 
      m.id_materi,
      m.judul,
      m.deskripsi,
      m.file,
      m.created_at,
      k.nama_kelas,
      mp.nama_mapel
    FROM tb_materi m
    LEFT JOIN tb_kelas k ON m.id_kelas = k.id_kelas
    LEFT JOIN tb_mapel mp ON m.id_mapel = mp.id_mapel
    WHERE m.id_guru = ?
    ORDER BY m.created_at DESC
  `;

  db.query(query, [id_guru], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json(result);
  });
};

// ================= GET MATERI SISWA =================
exports.getMateriSiswa = (req, res) => {
  const id_kelas = req.user.id_kelas;

  const query = `
    SELECT 
      m.id_materi,
      m.judul,
      m.deskripsi,
      m.file,
      m.created_at,
      k.nama_kelas,
      mp.nama_mapel,
      g.nama_guru
    FROM tb_materi m
    LEFT JOIN tb_kelas k ON m.id_kelas = k.id_kelas
    LEFT JOIN tb_mapel mp ON m.id_mapel = mp.id_mapel
    LEFT JOIN tb_guru g ON m.id_guru = g.id_guru
    WHERE m.id_kelas = ?
    ORDER BY m.created_at DESC
  `;

  db.query(query, [id_kelas], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json(result);
  });
};

// ================= UPDATE =================
exports.updateMateri = (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, id_kelas, id_mapel } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!judul || !id_kelas || !id_mapel) {
    return res.status(400).json({
      message: "Judul, kelas, dan mapel wajib diisi"
    });
  }

  let query;
  let values;

  if (file) {
    query = `
      UPDATE tb_materi
      SET judul=?, deskripsi=?, id_kelas=?, id_mapel=?, file=?
      WHERE id_materi=?
    `;
    values = [judul, deskripsi, id_kelas, id_mapel, file, id];
  } else {
    query = `
      UPDATE tb_materi
      SET judul=?, deskripsi=?, id_kelas=?, id_mapel=?
      WHERE id_materi=?
    `;
    values = [judul, deskripsi, id_kelas, id_mapel, id];
  }

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json({ message: "Materi berhasil diupdate" });
  });
};

// ================= DELETE =================
exports.deleteMateri = (req, res) => {
  const { id } = req.params;
  const role = req.user.role;
  const userId = req.user.id;

  let query = "";
  let values = [];

  // 🔒 Guru hanya bisa hapus miliknya
  if (role === "guru") {
    query = "DELETE FROM tb_materi WHERE id_materi=? AND id_guru=?";
    values = [id, userId];
  } else {
    // admin bebas
    query = "DELETE FROM tb_materi WHERE id_materi=?";
    values = [id];
  }

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Tidak diizinkan" });
    }

    res.json({ message: "Materi berhasil dihapus" });
  });
};

// ================= GET KELAS =================
exports.getKelas = (req, res) => {
  const query = `
    SELECT id_kelas, nama_kelas 
    FROM tb_kelas 
    ORDER BY nama_kelas ASC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(result);
  });
};

// ================= GET MAPEL =================
exports.getMapel = (req, res) => {
  const query = `
    SELECT id_mapel, nama_mapel 
    FROM tb_mapel 
    ORDER BY nama_mapel ASC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(result);
  });
};
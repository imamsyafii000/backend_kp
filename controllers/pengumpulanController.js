const db = require("../config/db");


// ================= KUMPULKAN TUGAS (SISWA) =================
exports.kumpulTugas = (req, res) => {
  const { id_tugas, keterangan } = req.body;
  const id_siswa = req.user.id;

  const file = req.file ? req.file.filename : null;

  // 🔍 CEK DEADLINE
  const cekDeadline = `
    SELECT deadline FROM tb_tugas WHERE id_tugas = ?
  `;

  db.query(cekDeadline, [id_tugas], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    if (result.length === 0) {
      return res.status(404).json({ message: "Tugas tidak ditemukan" });
    }

    const deadline = new Date(result[0].deadline);
    const sekarang = new Date();

    // 🔥 BLOK JIKA TERLAMBAT
    if (sekarang > deadline) {
      return res.status(400).json({
        message: "Deadline sudah lewat, tidak bisa mengumpulkan tugas",
      });
    }

    // 🔍 CEK SUDAH KUMPUL BELUM
    const checkQuery = `
      SELECT * FROM tb_pengumpulan 
      WHERE id_tugas = ? AND id_siswa = ?
    `;

    db.query(checkQuery, [id_tugas, id_siswa], (err, result) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      if (result.length > 0) {
        return res.status(400).json({
          message: "Tugas sudah dikumpulkan",
        });
      }

      // ✅ INSERT DATA
      const insertQuery = `
        INSERT INTO tb_pengumpulan (id_tugas, id_siswa, file, keterangan)
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertQuery, [id_tugas, id_siswa, file, keterangan], (err) => {
        if (err) return res.status(500).json({ message: err.sqlMessage });

        res.json({ message: "Tugas berhasil dikumpulkan" });
      });
    });
  });
};

// ================= LIHAT PENGUMPULAN (GURU SAJA) =================
exports.getPengumpulan = (req, res) => {
  const id_guru = req.user.id;
  const { id_tugas, id_siswa, status } = req.query;

  let query = `
    SELECT 
      p.id_pengumpulan,
      p.file,
      p.keterangan,
      p.nilai,
      p.created_at,
      s.nama_siswa,
      t.judul,

      CASE 
        WHEN p.nilai IS NULL THEN 'BELUM DINILAI'
        ELSE 'SUDAH DINILAI'
      END AS status_nilai

    FROM tb_pengumpulan p
    JOIN tb_siswa s ON p.id_siswa = s.id_siswa
    JOIN tb_tugas t ON p.id_tugas = t.id_tugas

    WHERE t.id_guru = ?
  `;

  let values = [id_guru];

  // 🔍 FILTER TUGAS
  if (id_tugas) {
    query += " AND p.id_tugas = ?";
    values.push(id_tugas);
  }

  // 🔍 FILTER SISWA
  if (id_siswa) {
    query += " AND p.id_siswa = ?";
    values.push(id_siswa);
  }

  // 🔍 FILTER STATUS NILAI
  if (status === "belum_nilai") {
    query += " AND p.nilai IS NULL";
  }

  if (status === "sudah_nilai") {
    query += " AND p.nilai IS NOT NULL";
  }

  query += " ORDER BY p.created_at DESC";

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json(result);
  });
};

// ================= NILAI TUGAS (GURU) =================
exports.nilaiTugas = (req, res) => {
  const { id } = req.params;
  const { nilai } = req.body;

  if (nilai < 0 || nilai > 100) {
    return res.status(400).json({ message: "Nilai harus 0 - 100" });
  }

  const query = `
    UPDATE tb_pengumpulan
    SET nilai = ?
    WHERE id_pengumpulan = ?
  `;

  db.query(query, [nilai, id], (err) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json({ message: "Nilai berhasil diberikan" });
  });
};

exports.getBelumKumpul = (req, res) => {

  const { id_tugas } = req.params;

  const query = `
    SELECT 
      s.id_siswa,
      s.nama_siswa,

      p.id_pengumpulan,

      CASE 
        WHEN p.id_pengumpulan IS NULL 
          THEN 'BELUM KUMPUL'
        ELSE 'SUDAH KUMPUL'
      END AS status

    FROM tb_tugas t

    JOIN tb_siswa s
      ON s.id_kelas = t.id_kelas

    LEFT JOIN tb_pengumpulan p 
      ON s.id_siswa = p.id_siswa 
      AND p.id_tugas = t.id_tugas

    WHERE t.id_tugas = ?

    ORDER BY status DESC, s.nama_siswa ASC
  `;

  db.query(query, [id_tugas], (err, result) => {

    if (err) {
      return res.status(500).json({
        message: err.sqlMessage
      });
    }

    res.json(result);

  });

};
const db = require("../config/db");


// ================= CREATE (GURU) =================
exports.createTugas = (req, res) => {
  const { judul, deskripsi, deadline, id_kelas, id_mapel } = req.body;
  const id_guru = req.user.id;

  const file = req.file ? req.file.filename : null;

  if (!judul || !deadline || !id_kelas || !id_mapel) {
    return res.status(400).json({
      message: "Judul, deadline, kelas, dan mapel wajib diisi"
    });
  }

  const query = `
    INSERT INTO tb_tugas (id_guru, id_kelas, id_mapel, judul, deskripsi, deadline, file)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [id_guru, id_kelas, id_mapel, judul, deskripsi, deadline, file],
    (err) => {
      if (err) return res.status(500).json({ message: err.sqlMessage });

      res.json({
        message: "Tugas berhasil dibuat",
        file: file
      });
    }
  );
};


// ================= READ (GURU) =================
exports.getTugasGuru = (req, res) => {
  const id_guru = req.user.id;

  const query = `
    SELECT 
      t.id_tugas,
      t.judul,
      t.deskripsi,

      t.deadline,
      t.file,
      k.nama_kelas,
      mp.nama_mapel,

      COUNT(p.id_pengumpulan) AS jumlah_kumpul,
      (SELECT COUNT(*) FROM tb_siswa s WHERE s.id_kelas = t.id_kelas) AS total_siswa

    FROM tb_tugas t
    LEFT JOIN tb_kelas k ON t.id_kelas = k.id_kelas
    LEFT JOIN tb_mapel mp ON t.id_mapel = mp.id_mapel

    LEFT JOIN tb_pengumpulan p ON p.id_tugas = t.id_tugas

    WHERE t.id_guru = ?
    GROUP BY t.id_tugas
    ORDER BY t.deadline ASC
  `;

  db.query(query, [id_guru], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json(result);
  });
};


// ================= READ (SISWA) =================
exports.getTugasSiswa = (req, res) => {
  const id_siswa = req.user.id;
  const id_kelas = req.user.id_kelas;

  if (!id_kelas) {
    return res.status(400).json({
      message: "id_kelas tidak ditemukan di token (login ulang)"
    });
  }

  const query = `
    SELECT 
      t.id_tugas,
      t.judul,
      t.deskripsi,
      t.deadline,
      t.file,
      mp.nama_mapel,
      g.nama_guru,

      CASE 
        WHEN t.deadline < NOW() THEN 'LEWAT'
        ELSE 'AKTIF'
      END AS status_deadline,

      p.id_pengumpulan,
      p.file AS file_kumpul,
      p.nilai,
      p.created_at AS tanggal_kumpul,

      CASE 
        WHEN p.id_pengumpulan IS NULL THEN 'BELUM DIKUMPULKAN'
        WHEN p.nilai IS NULL THEN 'SUDAH DIKUMPULKAN'
        ELSE 'SUDAH DINILAI'
      END AS status

    FROM tb_tugas t
    JOIN tb_guru g ON t.id_guru = g.id_guru
    LEFT JOIN tb_mapel mp ON t.id_mapel = mp.id_mapel

    LEFT JOIN tb_pengumpulan p 
      ON p.id_tugas = t.id_tugas 
      AND p.id_siswa = ?

    WHERE t.id_kelas = ?
    ORDER BY t.deadline ASC
  `;

  db.query(query, [id_siswa, id_kelas], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json(result);
  });
};


// ================= DETAIL TUGAS (GURU) =================
exports.getDetailTugas = (req, res) => {
  const { id } = req.params;
  const id_guru = req.user.id;

  const query = `
    SELECT 
      t.id_tugas,
      t.judul,
      t.deskripsi,
      t.deadline,
      t.file,

      k.nama_kelas,
      mp.nama_mapel,

      s.id_siswa,
      s.nama_siswa,

      p.id_pengumpulan,
      p.file AS file_kumpul,
      p.nilai,
      p.created_at,

      CASE 
        WHEN p.id_pengumpulan IS NULL THEN 'BELUM MENGUMPULKAN'
        ELSE 'SUDAH MENGUMPULKAN'
      END AS status_pengumpulan,

      CASE 
        WHEN p.created_at > t.deadline THEN 'TERLAMBAT'
        WHEN p.created_at IS NULL THEN '-'
        ELSE 'TEPAT WAKTU'
      END AS status_waktu

    FROM tb_tugas t

    LEFT JOIN tb_kelas k 
      ON t.id_kelas = k.id_kelas

    LEFT JOIN tb_mapel mp 
      ON t.id_mapel = mp.id_mapel

    JOIN tb_siswa s 
      ON s.id_kelas = t.id_kelas

    LEFT JOIN tb_pengumpulan p 
      ON p.id_tugas = t.id_tugas 
      AND p.id_siswa = s.id_siswa

    WHERE t.id_tugas = ? 
    AND t.id_guru = ?

    ORDER BY s.nama_siswa ASC
  `;

  db.query(query, [id, id_guru], (err, rows) => {

    if (err) {
      return res.status(500).json({
        message: err.sqlMessage
      });
    }

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Tugas tidak ditemukan"
      });
    }

    const tugas = {
      id_tugas: rows[0].id_tugas,
      judul: rows[0].judul,
      deskripsi: rows[0].deskripsi,
      deadline: rows[0].deadline,
      file: rows[0].file,
      kelas: rows[0].nama_kelas,
      mapel: rows[0].nama_mapel,
    };

    const siswa = rows.map((item) => ({
      id_pengumpulan: item.id_pengumpulan,
      id_siswa: item.id_siswa,
      nama_siswa: item.nama_siswa,
      status: item.status_pengumpulan,
      nilai: item.nilai,
      file: item.file_kumpul,
      tanggal_kumpul: item.created_at,
      status_waktu: item.status_waktu,
    }));

    const total = siswa.length;

    const sudah = siswa.filter(
      s => s.status === "SUDAH MENGUMPULKAN"
    ).length;

    const belum = total - sudah;

    res.json({
      tugas,
      statistik: {
        total_siswa: total,
        sudah_kumpul: sudah,
        belum_kumpul: belum,
      },
      siswa,
    });

  });
};

// ================= UPDATE =================
exports.updateTugas = (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi, deadline } = req.body;
  const id_guru = req.user.id;

  const query = `
    UPDATE tb_tugas
    SET judul=?, deskripsi=?, deadline=?
    WHERE id_tugas=? AND id_guru=?
  `;

  db.query(query, [judul, deskripsi, deadline, id, id_guru], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Tidak punya akses" });
    }

    res.json({ message: "Tugas berhasil diupdate" });
  });
};


// ================= DELETE =================
exports.deleteTugas = (req, res) => {
  const { id } = req.params;
  const id_guru = req.user.id;

  const query = `
    DELETE FROM tb_tugas
    WHERE id_tugas=? AND id_guru=?
  `;

  db.query(query, [id, id_guru], (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Tidak punya akses" });
    }

    res.json({ message: "Tugas berhasil dihapus" });
  });
};
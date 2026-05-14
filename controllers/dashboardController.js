const db = require("../config/db");

exports.dashboardGuru = (req, res) => {
  const id_guru = req.user.id;

  const query = `
    SELECT 
      t.id_tugas,
      t.judul,

      COUNT(p.id_pengumpulan) AS total_kumpul,

      SUM(CASE WHEN p.nilai IS NULL AND p.id_pengumpulan IS NOT NULL THEN 1 ELSE 0 END) AS belum_dinilai,

      AVG(p.nilai) AS rata_rata,
      MAX(p.nilai) AS nilai_tertinggi,
      MIN(p.nilai) AS nilai_terendah

    FROM tb_tugas t
    LEFT JOIN tb_pengumpulan p ON t.id_tugas = p.id_tugas

    WHERE t.id_guru = ?
    GROUP BY t.id_tugas
  `;

  db.query(query, [id_guru], (err, rows) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    // 🔥 TOTAL GLOBAL
    let totalTugas = rows.length;
    let totalKumpul = 0;
    let belumDinilai = 0;
    let totalNilai = 0;
    let jumlahNilai = 0;

    let tertinggi = 0;
    let terendah = 100;

    rows.forEach((item) => {
      totalKumpul += item.total_kumpul;
      belumDinilai += item.belum_dinilai;

      if (item.rata_rata !== null) {
        totalNilai += item.rata_rata;
        jumlahNilai++;
      }

      if (item.nilai_tertinggi > tertinggi) {
        tertinggi = item.nilai_tertinggi;
      }

      if (item.nilai_terendah !== null && item.nilai_terendah < terendah) {
        terendah = item.nilai_terendah;
      }
    });

    const rataGlobal =
      jumlahNilai > 0 ? (totalNilai / jumlahNilai).toFixed(2) : 0;

    // 📊 DATA GRAFIK
    const grafik = rows.map((item) => ({
      label: item.judul,
      rata_rata: item.rata_rata ? Number(item.rata_rata).toFixed(2) : 0,
    }));

    res.json({
      summary: {
        total_tugas: totalTugas,
        total_pengumpulan: totalKumpul,
        belum_dinilai: belumDinilai,
        rata_rata_kelas: rataGlobal,
        nilai_tertinggi: tertinggi,
        nilai_terendah: terendah === 100 ? 0 : terendah,
      },
      grafik,
      detail: rows,
    });
  });
};
const db = require("../config/db");
const ExcelJS = require("exceljs");


// ================= NILAI SISWA =================
exports.getNilaiSiswa = (req, res) => {

  const id_siswa = req.user.id;

  const query = `
    SELECT 
      t.judul,
      t.deadline,
      g.nama_guru,
      p.nilai,

      CASE 
        WHEN p.id_pengumpulan IS NULL THEN 'BELUM DIKUMPULKAN'
        WHEN p.nilai IS NULL THEN 'BELUM DINILAI'
        ELSE 'SUDAH DINILAI'
      END AS status

    FROM tb_tugas t

    JOIN tb_guru g 
      ON t.id_guru = g.id_guru

    LEFT JOIN tb_pengumpulan p 
      ON p.id_tugas = t.id_tugas 
      AND p.id_siswa = ?

    ORDER BY t.deadline ASC
  `;

  db.query(query, [id_siswa], (err, rows) => {

    if (err) {

      return res.status(500).json({
        message: err.sqlMessage
      });

    }

    let totalNilai = 0;
    let jumlahDinilai = 0;

    rows.forEach((item) => {

      // nilai 0 tetap dihitung
      if (item.nilai !== null) {

        totalNilai += Number(item.nilai);
        jumlahDinilai++;

      }

    });

    const rataRata =
      jumlahDinilai > 0
      ? (totalNilai / jumlahDinilai).toFixed(2)
      : 0;

    res.json({

      statistik:{
        rata_rata:rataRata
      },

      data:rows

    });

  });

};


// ================= NILAI GURU =================
exports.getNilaiGuru = (req, res) => {

  const id_guru = req.user.id;

  const { kelas, mapel } = req.query;

  let query = `
    SELECT 
      s.id_siswa,
      s.nama_siswa,

      k.nama_kelas,

      mp.nama_mapel,

      ROUND(AVG(p.nilai),0) AS nilai

    FROM tb_pengumpulan p

    JOIN tb_siswa s
      ON p.id_siswa = s.id_siswa

    JOIN tb_kelas k
      ON s.id_kelas = k.id_kelas

    JOIN tb_tugas t
      ON p.id_tugas = t.id_tugas

    JOIN tb_mapel mp
      ON t.id_mapel = mp.id_mapel

    WHERE t.id_guru = ?
  `;

  const values = [id_guru];

  // FILTER KELAS
  if(kelas){

    query += `
      AND s.id_kelas = ?
    `;

    values.push(kelas);

  }

  // FILTER MAPEL
  if(mapel){

    query += `
      AND t.id_mapel = ?
    `;

    values.push(mapel);

  }

  query += `
    GROUP BY s.id_siswa, t.id_mapel
    ORDER BY s.nama_siswa ASC
  `;

  db.query(query, values, (err, rows) => {

    if(err){

      return res.status(500).json({
        message: err.sqlMessage
      });

    }

    rows = rows.map(item => ({

      ...item,

      status:
        item.nilai !== null
        ? "SUDAH DINILAI"
        : "BELUM DINILAI"

    }));

    res.json(rows);

  });

};


// ================= GET MAPEL =================
exports.getMapelGuru = (req, res) => {

  const query = `
    SELECT 
      id_mapel,
      nama_mapel

    FROM tb_mapel

    ORDER BY nama_mapel ASC
  `;

  db.query(query, (err, rows) => {

    if(err){

      return res.status(500).json({
        message: err.sqlMessage
      });

    }

    res.json(rows);

  });

};


// ================= RANKING =================
exports.getRanking = (req, res) => {

  const { kelas } = req.query;

  let query = `
    SELECT 
      s.id_siswa,

      s.nama_siswa,

      k.nama_kelas,

      ROUND(AVG(p.nilai),2) AS rata_rata

    FROM tb_siswa s

    JOIN tb_pengumpulan p
      ON s.id_siswa = p.id_siswa

    JOIN tb_kelas k
      ON s.id_kelas = k.id_kelas

    WHERE p.nilai IS NOT NULL
  `;

  const values = [];

  // FILTER KELAS
  if(kelas){

    query += `
      AND s.id_kelas = ?
    `;

    values.push(kelas);

  }

  query += `
    GROUP BY s.id_siswa
    ORDER BY rata_rata DESC
    LIMIT 10
  `;

  db.query(query, values, (err, result) => {

    if(err){

      return res.status(500).json({
        message: err.sqlMessage
      });

    }

    const ranking = result.map((item,index) => ({

      peringkat : index + 1,

      nama_siswa : item.nama_siswa,

      nama_kelas : item.nama_kelas,

      rata_rata : Number(item.rata_rata).toFixed(2)

    }));

    res.json(ranking);

  });

};


// ================= EXPORT EXCEL =================
exports.exportExcel = (req, res) => {

  const query = `
    SELECT 
      s.nama_siswa,
      t.judul,
      p.nilai

    FROM tb_pengumpulan p

    JOIN tb_siswa s
      ON p.id_siswa = s.id_siswa

    JOIN tb_tugas t
      ON p.id_tugas = t.id_tugas

    ORDER BY s.nama_siswa ASC
  `;

  db.query(query, async (err, rows) => {

    if(err){

      return res.status(500).json({
        message: err.sqlMessage
      });

    }

    const workbook = new ExcelJS.Workbook();

    const worksheet =
      workbook.addWorksheet("Nilai Siswa");

    worksheet.columns = [

      {
        header:"Nama Siswa",
        key:"nama_siswa",
        width:25
      },

      {
        header:"Tugas",
        key:"judul",
        width:25
      },

      {
        header:"Nilai",
        key:"nilai",
        width:10
      }

    ];

    rows.forEach(row => {

      worksheet.addRow(row);

    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=nilai.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  });

};
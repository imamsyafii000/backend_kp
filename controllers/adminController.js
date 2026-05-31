const db = require("../config/db");
const bcrypt = require("bcryptjs");
exports.dashboard = (req, res) => {

  const query = `
    SELECT
      (SELECT COUNT(*) FROM tb_siswa) AS total_siswa,
      (SELECT COUNT(*) FROM tb_guru) AS total_guru,
      (SELECT COUNT(*) FROM tb_tugas) AS total_tugas,
      (SELECT AVG(nilai) FROM tb_pengumpulan WHERE nilai IS NOT NULL) AS rata_nilai
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json(result[0]);
  });
};

exports.nilaiPerKelas = (req, res) => {

  const query = `
    SELECT 
      k.nama_kelas,
      COALESCE(AVG(p.nilai), 0) AS rata_rata
    FROM tb_kelas k
    LEFT JOIN tb_siswa s ON k.id_kelas = s.id_kelas
    LEFT JOIN tb_pengumpulan p ON s.id_siswa = p.id_siswa
    GROUP BY k.id_kelas
    ORDER BY k.id_kelas
  `;

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json(rows);
  });
};

exports.rankingSiswa = (req, res) => {
  const { id_kelas } = req.query;

  const query = `
    SELECT 
      s.nama_siswa,
      AVG(p.nilai) AS rata_rata
    FROM tb_siswa s
    LEFT JOIN tb_pengumpulan p ON s.id_siswa = p.id_siswa
    WHERE s.id_kelas = ?
    GROUP BY s.id_siswa
    ORDER BY rata_rata DESC
    LIMIT 5
  `;

  db.query(query, [id_kelas], (err, rows) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });

    res.json(rows);
  });
};

exports.getUsers = (req, res) => {

    const query = `

        SELECT 
            s.id_siswa AS id,
            s.nama_siswa AS nama,
            s.username,
            'siswa' AS role,
            s.id_kelas,
            k.nama_kelas,
            s.created_at

        FROM tb_siswa s

        LEFT JOIN tb_kelas k
        ON s.id_kelas = k.id_kelas

        UNION ALL

        SELECT 
            g.id_guru AS id,
            g.nama_guru AS nama,
            g.username,
            'guru' AS role,
            NULL AS id_kelas,
            NULL AS nama_kelas,
            g.created_at

        FROM tb_guru g

        UNION ALL

        SELECT 
            a.id_admin AS id,
            a.username AS nama,
            a.username,
            'admin' AS role,
            NULL AS id_kelas,
            NULL AS nama_kelas,
            a.created_at

        FROM tb_admin a

        ORDER BY created_at DESC

    `;

    db.query(query, (err, result) => {

        if (err) {

            console.log("ERROR USERS:", err);

            return res.status(500).json({
                message: err.sqlMessage
            });

        }

        res.json(result);

    });

};

exports.getAllTugas = (req, res) => {
  const query = `
  SELECT 
    t.id_tugas,
    t.judul,
    t.deskripsi,
    t.deadline,
    t.file,
    k.nama_kelas,
    mp.nama_mapel,
    g.nama_guru,

    CASE 
      WHEN t.deadline < NOW() THEN 'LEWAT'
      ELSE 'AKTIF'
    END AS status_deadline

  FROM tb_tugas t
  LEFT JOIN tb_kelas k ON t.id_kelas = k.id_kelas
  LEFT JOIN tb_mapel mp ON t.id_mapel = mp.id_mapel
  LEFT JOIN tb_guru g ON t.id_guru = g.id_guru
  ORDER BY t.deadline ASC
`;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: err.sqlMessage });
    res.json(result);
  });
};

exports.updateAdmin = async (req, res) => {

    try{

        const { id } = req.params;

        const {
            username,
            password
        } = req.body;

        // ================= TANPA PASSWORD =================

        if(!password){

            const query = `
                UPDATE tb_admin
                SET username = ?
                WHERE id_admin = ?
            `;

            db.query(
                query,
                [username, id],
                (err) => {

                    if(err){

                        return res.status(500).json({
                            message: err.sqlMessage
                        });

                    }

                    res.json({
                        message:"Admin berhasil diupdate"
                    });

                }
            );

        }

        // ================= DENGAN PASSWORD =================

        else{

            const hashedPassword =
            await bcrypt.hash(password, 10);

            const query = `
                UPDATE tb_admin
                SET username = ?,
                    password = ?
                WHERE id_admin = ?
            `;

            db.query(
                query,
                [
                    username,
                    hashedPassword,
                    id
                ],
                (err) => {

                    if(err){

                        return res.status(500).json({
                            message: err.sqlMessage
                        });

                    }

                    res.json({
                        message:"Admin berhasil diupdate"
                    });

                }
            );

        }

    }catch(err){

        console.log(err);

        res.status(500).json({
            message:"Server error"
        });

    }

};
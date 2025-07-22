const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const db = require("./db");
const s3 = require("./s3");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const upload = multer({ dest: "uploads/" });

// ➕ Tambahkan route GET /
app.get("/", (req, res) => {
  res.send(`
    <h2>Upload File ke S3</h2>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="text" name="description" placeholder="Deskripsi" required><br><br>
      <input type="file" name="file" required><br><br>
      <button type="submit">Upload</button>
    </form>
  `);
});

app.post("/upload", upload.single("file"), (req, res) => {
  const { description } = req.body;
  const file = req.file;

  const fileStream = fs.createReadStream(file.path);
  const params = {
    Bucket: "awsbucketudin",
    Key: file.originalname,
    Body: fileStream,
    ACL: "public-read",
  };

  s3.upload(params, (err, data) => {
    if (err) return res.status(500).send("Gagal upload ke S3");

    const s3Url = data.Location;
    const sql = "INSERT INTO uploads (filename, description, url) VALUES (?, ?, ?)";
    db.query(sql, [file.originalname, description, s3Url], (err, result) => {
      fs.unlinkSync(file.path); // hapus file lokal
      if (err) return res.status(500).send("Gagal simpan metadata ke DB");
      res.send(`<p>Upload berhasil! <a href="${s3Url}" target="_blank">Lihat file</a></p>`);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Videolar joylashgan papka
const videosDir = path.join(__dirname, "../video");
app.use(express.static(path.join(__dirname, "../frontend"))); // for frontend

app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html")); // for frontend
});

app.get("/video/:filename", (req, res) => {
  const { filename } = req.params;
  const videoPath = path.join(videosDir, filename);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).send("Video not found");
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const chunkSize = 200 * 1024; // 200KB chunk size

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = Math.min(start + chunkSize - 1, fileSize - 1);

    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} <- click here to open the app`);
});

// github link: https://github.com/dilshodbek-yoqubjonov

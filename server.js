const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const { unlink } = require("fs");
require("dotenv").config(); // Adiciona o pacote dotenv

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post(
  "/upload",
  upload.fields([
    { name: "identityFront", maxCount: 1 },
    { name: "identityBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { files } = req;
      if (!files) {
        return res.status(400).send("Nenhuma foto foi enviada.");
      }

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL, // Usa variável de ambiente
          pass: process.env.PASSWORD, // Usa variável de ambiente
        },
      });

      const mailOptions = {
        from: process.env.EMAIL, // Usa variável de ambiente
        to: "saresende555@gmail.com",
        subject: "Fotos enviadas",
        text: "As fotos foram enviadas com sucesso.",
        attachments: Object.values(files)
          .flat()
          .map((file) => ({
            filename: file.originalname,
            path: file.path,
          })),
      };

      await transporter.sendMail(mailOptions);
      res.send("Fotos enviadas com sucesso!");

      Object.values(files)
        .flat()
        .forEach((file) => {
          unlink(file.path, (err) => {
            if (err) console.error(`Erro ao deletar o arquivo: ${file.path}`);
          });
        });
    } catch (error) {
      console.error("Erro ao enviar o email:", error);
      res.status(500).send("Erro ao enviar o email.");
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const { unlink } = require("fs");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

// Middleware para servir arquivos estáticos
app.use(express.static("public"));

// Rota para upload de arquivos
app.post("/upload", upload.any(), async (req, res) => {
  try {
    const { files } = req;
    if (!files || files.length === 0) {
      return res.status(400).send("Nenhuma foto foi enviada.");
    }

    console.log("Arquivos recebidos:", files); // Para depuração

    // Configuração do transportador de email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL, // Email do remetente
        pass: process.env.PASSWORD, // Senha do remetente
      },
    });

    // Configuração do email
    const mailOptions = {
      from: process.env.EMAIL,
      to: "saresende555@gmail.com", // Email de destino
      subject: "Fotos enviadas",
      text: "As fotos foram enviadas com sucesso.",
      attachments: files.map((file) => ({
        filename: file.originalname,
        path: file.path,
      })),
    };

    // Envia o email
    await transporter.sendMail(mailOptions);
    res.send("Fotos enviadas com sucesso!");

    // Remove os arquivos enviados da pasta "uploads"
    files.forEach((file) => {
      unlink(file.path, (err) => {
        if (err) console.error(`Erro ao deletar o arquivo: ${file.path}`);
      });
    });
  } catch (error) {
    console.error("Erro ao processar o upload:", error);
    res.status(500).send("Erro ao processar o upload ou enviar o email.");
  }
});


// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
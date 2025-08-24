const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarCorreo = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Sistema Vacunación" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Correo enviado correctamente a ${to}`);
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    throw new Error("Error al enviar correo.");
  }
};

module.exports = enviarCorreo;

const nodemailer = require('nodemailer');
require('dotenv').config();

const sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/';
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASSWORD = process.env.EMAIL_PASS;
    const verificationUrl = `${BASE_URL}api/v1/auth/verify-email/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirme seu cadastro no Dengue Tracker</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          .header {
            background-color:#22c55e;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin: 0;
          }
          .tagline {
            color: #e0e0e0;
            margin-top: 5px;
          }
          .content {
            padding: 30px;
            background-color: #ffffff;
          }
          h1 {
            color: #22c55e;
            margin-top: 0;
          }
          .message {
            margin-bottom: 25px;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            background-color: #f44336;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #d32f2f;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #757575;
          }
          .disclaimer {
            font-size: 13px;
            margin-top: 15px;
          }
          .highlight {
            color: #f44336;
            font-weight: bold;
          }
          .film-strip {
            height: 10px;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAKCAYAAACjd+4vAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAAGJJREFUOBFjYBgFIBsIiGT9B2HnJwYgrYfNT7JmJkaQ6QpK/4E0SB0jI4iNKUDmnkjxf0wh1DkkS5IkCTI5iA0TJYVNkhpsehmxeRdkODZ1pIiRpIdkBeToGVXIMDIDAOcHDDcjF8H+AAAAAElFTkSuQmCC');
            background-repeat: repeat-x;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="film-strip"></div>
          <div class="header">
            <h1 class="logo">Dengue Tracker</h1>
            <p class="tagline">Ajude a comunidade a combater a Dengue!</p>
          </div>
          <div class="content">
            <h1>Olá, ${name}!</h1>
            <p class="message">Estamos muito felizes em tê-lo(a) como parte da comunidade Dengue Tracker! Para começar o combate ao mosquito, precisamos verificar seu email.</p>
            <p class="message">Por favor, clique no botão abaixo para ativar sua conta:</p>

            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar Minha Conta</a>
            </div>

            <p class="message">Se o botão acima não funcionar, você também pode copiar e colar o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; font-size: 14px; color: #666; margin-bottom: 25px;">${verificationUrl}</p>

            <p class="message">Após a verificação, você terá acesso completo a todas as funcionalidades do <span class="highlight">Dengue Tracker</span>, incluindo:</p>
            <ul>
              <li>Registrar Focos de Dengue </li>
              <li>Verificar Focos na sua Região</li>
              <li>Guia Educacional sobre a doença e como se previnir</li>
              <li>Estatísticas personalizadas</li>
            </ul>

            <p class="message">Estamos ansiosos para ter a sua ajuda nesse combate contra esse grande Vilão!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Dengue Tracker- Todos os direitos reservados</p>
            <p class="disclaimer">Este email foi enviado para ${email} porque você se cadastrou no Dengue Tracker. Se não foi você, por favor ignore este email.</p>
            <p>O link de verificação expira em 24 horas.</p>
          </div>
          <div class="film-strip"></div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Equipe Dengue Tracker" <${EMAIL_USER}>`,
      to: email,
      subject: '🦟 Confirme seu cadastro no Dengue Tracker',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email de verificação enviado para ${email}`, info.messageId);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error);
    throw new Error(`Erro ao enviar email de verificação: ${error.message}`);
  }
};

const sendPasswordResetCode = async (email, name, resetCode) => {
  try {
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASSWORD = process.env.EMAIL_PASS;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha - Dengue Tracker</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #22c55e;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin: 0;
          }
          .tagline {
            color: #e0e0e0;
            margin-top: 5px;
          }
          .content {
            padding: 30px;
            background-color: #ffffff;
          }
          h1 {
            color: #22c55e;
            margin-top: 0;
          }
          .message {
            margin-bottom: 25px;
            font-size: 16px;
          }
          .reset-code {
            font-size: 26px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #f44336;
            text-align: center;
            padding: 15px;
            margin: 20px 0;
            background-color: #f9f9f9;
            border-radius: 4px;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #757575;
          }
          .disclaimer {
            font-size: 13px;
            margin-top: 15px;
          }
          .highlight {
            color: #f44336;
            font-weight: bold;
          }
          .film-strip {
            height: 10px;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAKCAYAAACjd+4vAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAAGJJREFUOBFjYBgFIBsIiGT9B2HnJwYgrYfNT7JmJkaQ6QpK/4E0SB0jI4iNKUDmnkjxf0wh1DkkS5IkCTI5iA0TJYVNkhpsehmxeRdkODZ1pIiRpIdkBeToGVXIMDIDAOcHDDcjF8H+AAAAAElFTkSuQmCC');
            background-repeat: repeat-x;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="film-strip"></div>
          <div class="header">
            <h1 class="logo">Dengue Tracker</h1>
            <p class="tagline">Ajude a comunidade a combater a Dengue!</p>
          </div>
          <div class="content">
            <h1>Olá, ${name}!</h1>
            <p class="message">Recebemos uma solicitação para redefinir sua senha no Dengue Tracker. Use o código abaixo para confirmar sua identidade:</p>

            <div class="reset-code">${resetCode}</div>

            <p class="message">Este código é válido por 30 minutos. Se você não solicitou a recuperação de senha, ignore este email e sua senha permanecerá a mesma.</p>

            <p class="message"><strong>IMPORTANTE:</strong> Nunca compartilhe este código com outras pessoas.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Dengue Tracker - Todos os direitos reservados</p>
            <p class="disclaimer">Este email foi enviado para ${email} porque houve uma solicitação de recuperação de senha.</p>
            <p>O código de recuperação expira em 30 minutos.</p>
          </div>
          <div class="film-strip"></div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Equipe Dengue Tracker" <${EMAIL_USER}>`,
      to: email,
      subject: '🔐 Recuperação de Senha - Dengue Tracker',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email de recuperação de senha enviado para ${email}`, info.messageId);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email de recuperação de senha:', error);
    throw new Error(`Erro ao enviar email de recuperação de senha: ${error.message}`);
  }
};

const sendNewPasswordEmail = async (email, name, newPassword) => {
  try {
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASSWORD = process.env.EMAIL_PASS;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova Senha - Dengue Tracker</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #22c55e;
            color: white;
            padding: 30px;
            text-align: center;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: white;
            margin: 0;
          }
          .tagline {
            color: #e0e0e0;
            margin-top: 5px;
          }
          .content {
            padding: 30px;
            background-color: #ffffff;
          }
          h1 {
            color: #22c55e;
            margin-top: 0;
          }
          .message {
            margin-bottom: 25px;
            font-size: 16px;
          }
          .password-box {
            font-size: 20px;
            letter-spacing: 2px;
            color: #333;
            text-align: center;
            padding: 15px;
            margin: 20px 0;
            background-color: #f9f9f9;
            border-radius: 4px;
            border: 1px dashed #ccc;
          }
          .button {
            display: inline-block;
            background-color: #f44336;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #d32f2f;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #757575;
          }
          .disclaimer {
            font-size: 13px;
            margin-top: 15px;
          }
          .highlight {
            color: #f44336;
            font-weight: bold;
          }
          .film-strip {
            height: 10px;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAKCAYAAACjd+4vAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAAGJJREFUOBFjYBgFIBsIiGT9B2HnJwYgrYfNT7JmJkaQ6QpK/4E0SB0jI4iNKUDmnkjxf0wh1DkkS5IkCTI5iA0TJYVNkhpsehmxeRdkODZ1pIiRpIdkBeToGVXIMDIDAOcHDDcjF8H+AAAAAElFTkSuQmCC');
            background-repeat: repeat-x;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="film-strip"></div>
          <div class="header">
            <h1 class="logo">Dengue Tracker</h1>
            <p class="tagline">Ajude a comunidade a combater a Dengue!</p>
          </div>
          <div class="content">
            <h1>Olá, ${name}!</h1>
            <p class="message">Sua senha foi redefinida com sucesso. Aqui está sua nova senha:</p>

            <div class="password-box">${newPassword}</div>

            <p class="message">Recomendamos que você altere esta senha após fazer login por uma de sua preferência através das configurações da sua conta.</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Fazer Login Agora</a>
            </div>

            <p class="message"><strong>IMPORTANTE:</strong> Por questões de segurança, nunca compartilhe sua senha com outras pessoas.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Dengue Tracker - Todos os direitos reservados</p>
            <p class="disclaimer">Este email foi enviado para ${email} porque houve uma solicitação de recuperação de senha.</p>
          </div>
          <div class="film-strip"></div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Equipe Dengue Tracker" <${EMAIL_USER}>`,
      to: email,
      subject: '🔑 Sua Nova Senha - Dengue Tracker',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email com nova senha enviado para ${email}`, info.messageId);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email com nova senha:', error);
    throw new Error(`Erro ao enviar email com nova senha: ${error.message}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetCode,
  sendNewPasswordEmail
};
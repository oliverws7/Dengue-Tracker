const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurações
const config = {
  uploadDir: path.join(__dirname, '../uploads/images'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  }
};

// Garantir que diretório existe
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
  console.log(`📁 Diretório de uploads criado: ${config.uploadDir}`);
}

// Configuração do Multer (Armazenamento)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    // Nome único: timestamp-numeroAleatorio.extensao
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = config.allowedMimeTypes[file.mimetype] || 'jpg';
    cb(null, `${uniqueSuffix}.${ext}`);
  }
});

// Filtro de Arquivos
const fileFilter = (req, file, cb) => {
  if (config.allowedMimeTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas JPG, PNG, GIF e WEBP.'), false);
  }
};

// Instância do Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: fileFilter
});

// ======================
// MIDDLEWARES EXPORTADOS
// ======================

// 1. Wrapper para upload de um arquivo
// Envolvemos em uma função para tratar erros do Multer
const uploadSingle = (fieldName) => (req, res, next) => {
  const uploadFn = upload.single(fieldName);
  
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: `Erro no upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

// 2. Wrapper para upload múltiplo
const uploadMultiple = (fieldName, maxCount) => (req, res, next) => {
  const uploadFn = upload.array(fieldName, maxCount);
  
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, error: `Erro no upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};

// 3. Validador extra (garante que o arquivo chegou)
const validateImage = (req, res, next) => {
  // Se for upload múltiplo, verifica req.files
  if (req.files && req.files.length > 0) return next();
  
  // Se for upload único, verifica req.file
  if (req.file) return next();

  return res.status(400).json({ 
    success: false, 
    error: 'Nenhuma imagem válida foi enviada.' 
  });
};

// 4. Compressão de Imagem (Placeholder)
// Em produção, aqui você usaria a biblioteca 'sharp' para redimensionar
const compressImage = async (req, res, next) => {
  // Por enquanto, apenas passa adiante sem comprimir para evitar erros
  // de instalação do 'sharp' no Windows.
  
  if (req.file) {
    // Adiciona o caminho completo para facilitar deleção futura
    req.file.fullPath = path.join(config.uploadDir, req.file.filename);
    req.file.url = `/uploads/images/${req.file.filename}`;
  }
  
  if (req.files) {
    req.files.forEach(file => {
      file.fullPath = path.join(config.uploadDir, file.filename);
      file.url = `/uploads/images/${file.filename}`;
    });
  }

  next();
};

// 5. Função Utilitária para Deletar Arquivo
const deleteFile = async (filePathOrUrl) => {
  try {
    let finalPath = filePathOrUrl;
    
    // Se for URL relativa (/uploads/...), converte para caminho do sistema
    if (filePathOrUrl.startsWith('/uploads')) {
        const relativePath = filePathOrUrl.replace('/uploads/images/', '');
        finalPath = path.join(config.uploadDir, relativePath);
    }

    if (fs.existsSync(finalPath)) {
      await fs.promises.unlink(finalPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  validateImage,
  compressImage, // <--- AQUI ESTAVA O PROBLEMA (Faltava exportar ou definir isso)
  deleteFile,
  config
};
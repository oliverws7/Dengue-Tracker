const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose'); // Faltava importar
const { v4: uuidv4 } = require('uuid');

// Middlewares
const { authenticateToken } = require('../middleware/auth');
const { 
  uploadSingle, 
  uploadMultiple, 
  validateImage, 
  compressImage,
  deleteFile,
  config 
} = require('../middleware/upload');

// Model
const Report = require('../models/Report');

/**
 * @route   POST /api/upload/image
 * @desc    Upload de uma única imagem
 * @access  Private
 */
router.post('/image', 
  authenticateToken,
  uploadSingle('image'),
  validateImage,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Nenhuma imagem recebida' });
      }

      const { originalname, mimetype, size, filename, url } = req.file;
      const userId = req.user.id || req.userId; // Compatibilidade de ID

      // Se houver um reportId, vincular a imagem ao relatório
      let report = null;
      if (req.body.reportId) {
        if (!mongoose.Types.ObjectId.isValid(req.body.reportId)) {
            // Limpa o arquivo se o ID for inválido
            await deleteFile(req.file.fullPath);
            return res.status(400).json({ success: false, error: 'ID do relatório inválido' });
        }

        report = await Report.findById(req.body.reportId);
        
        if (report) {
          // Verificar permissão (usuario vs reportadoPor)
          if (report.usuario.toString() !== userId && req.user.role !== 'admin') {
            await deleteFile(req.file.fullPath);
            return res.status(403).json({
              success: false,
              error: 'Sem permissão para adicionar imagem a este relatório'
            });
          }

          // Adicionar imagem ao relatório
          report.imagens.push({
            url: url,
            filename: filename,
            originalName: originalname,
            uploadedBy: userId,
            uploadedAt: new Date()
          });

          await report.save();
        }
      }

      res.status(201).json({
        success: true,
        message: 'Imagem enviada com sucesso',
        data: {
          id: uuidv4(),
          filename,
          originalName: originalname,
          mimeType: mimetype,
          size,
          url,
          uploadedAt: new Date(),
          reportId: report?._id
        }
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      // Tentar deletar o arquivo em caso de erro
      if (req.file && req.file.fullPath) {
        await deleteFile(req.file.fullPath).catch(() => {});
      }
      res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
  }
);

/**
 * @route   POST /api/upload/images
 * @desc    Upload de múltiplas imagens
 * @access  Private
 */
router.post('/images',
  authenticateToken,
  uploadMultiple('images', 5),
  validateImage,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, error: 'Nenhuma imagem recebida' });
      }

      const userId = req.user.id || req.userId;

      // Processar cada imagem
      const uploadedImages = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: file.url,
        fullPath: file.fullPath, // Necessário para delete em caso de erro
        uploadedAt: new Date(),
        uploadedBy: userId
      }));

      // Vincular a um relatório se especificado
      let report = null;
      if (req.body.reportId) {
        if (mongoose.Types.ObjectId.isValid(req.body.reportId)) {
           report = await Report.findById(req.body.reportId);
        }
        
        if (report) {
          if (report.usuario.toString() !== userId && req.user.role !== 'admin') {
            // Deletar todas as imagens enviadas
            await Promise.all(uploadedImages.map(img => deleteFile(img.fullPath)));
            return res.status(403).json({
              success: false,
              error: 'Sem permissão para adicionar imagens a este relatório'
            });
          }

          // Adicionar imagens ao relatório
          uploadedImages.forEach(img => {
            report.imagens.push({
              url: img.url,
              filename: img.filename,
              originalName: img.originalName,
              uploadedBy: userId,
              uploadedAt: new Date()
            });
          });

          await report.save();
        }
      }

      // Remove fullPath da resposta pública
      const publicImages = uploadedImages.map(({ fullPath, ...rest }) => rest);

      res.status(201).json({
        success: true,
        message: `${uploadedImages.length} imagens enviadas`,
        data: {
          count: uploadedImages.length,
          images: publicImages,
          reportId: report?._id
        }
      });

    } catch (error) {
      console.error('Erro no upload múltiplo:', error);
      if (req.files) {
        await Promise.all(req.files.map(file => deleteFile(file.fullPath).catch(() => {})));
      }
      res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
  }
);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Deletar uma imagem
 * @access  Private
 */
router.delete('/:filename',
  authenticateToken,
  async (req, res) => {
    try {
      const { filename } = req.params;
      const userId = req.user.id || req.userId;
      
      // Caminho físico
      const imagePath = path.join(config.uploadDir, filename);
      
      // Verifica no BD se a imagem pertence a algum relatório
      const reportsWithImage = await Report.find({ 'imagens.filename': filename });

      if (reportsWithImage.length > 0) {
        // Verificar permissões
        const canDelete = reportsWithImage.every(report => {
          return report.usuario.toString() === userId || req.user.role === 'admin';
        });

        if (!canDelete) {
          return res.status(403).json({ success: false, error: 'Sem permissão para deletar esta imagem' });
        }

        // Remover imagem dos arrays do Mongo
        await Promise.all(reportsWithImage.map(async (report) => {
          report.imagens = report.imagens.filter(img => img.filename !== filename);
          await report.save();
        }));
      }

      // Deletar arquivo físico (função segura do middleware)
      await deleteFile(imagePath);

      res.json({
        success: true,
        message: 'Imagem deletada com sucesso',
        filename
      });

    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      res.status(500).json({ success: false, error: 'Erro ao deletar imagem' });
    }
  }
);

/**
 * @route   GET /api/upload/config
 * @desc    Obter configurações (Útil para o Frontend)
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      allowedTypes: Object.keys(config.allowedMimeTypes),
      maxFileSize: config.maxFileSize,
      uploadDir: '/uploads/images' // Caminho público relativo
    }
  });
});

module.exports = router;
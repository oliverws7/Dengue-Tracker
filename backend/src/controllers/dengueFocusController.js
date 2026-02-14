const { DengueFocus, User } = require('../models');
const { Op } = require('sequelize');
const AWS = require('aws-sdk');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

const uploadImageToS3 = async (file, focusId) => {
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `dengue-focuses/${focusId}/${uuidv4()}.${fileExtension}`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }
};

const deleteImageFromS3 = async (imageUrl) => {
  if (!imageUrl) return;
  
  const urlParts = imageUrl.split('/');
  const key = urlParts.slice(3).join('/');
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Erro ao deletar imagem do S3:', error);
  }
};

exports.createDengueFocus = async (req, res) => {
  try {
    const dengueFocusData = {
      ...req.body,
      userId: req.user.id
    };

    const dengueFocus = await DengueFocus.create(dengueFocusData);

    if (req.file) {
      try {
        const imageUrl = await uploadImageToS3(req.file, dengueFocus.id);
        await dengueFocus.update({ photoUrl: imageUrl });
      } catch (uploadError) {
        await dengueFocus.destroy();
        throw uploadError;
      }
    }

    const createdFocus = await DengueFocus.findByPk(dengueFocus.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(201).json({
      status: 'success',
      message: 'Foco de dengue registrado com sucesso',
      data: createdFocus
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getAllDengueFocuses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      riskLevel, 
      userId 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (riskLevel) whereClause.riskLevel = riskLevel;
    if (userId) whereClause.userId = userId;

    const { count, rows } = await DengueFocus.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      status: 'success',
      results: rows.length,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getDengueFocus = async (req, res) => {
  try {
    const dengueFocus = await DengueFocus.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!dengueFocus) {
      return res.status(404).json({
        status: 'error',
        message: 'Foco de dengue não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: dengueFocus
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateDengueFocus = async (req, res) => {
  try {
    const dengueFocus = await DengueFocus.findByPk(req.params.id);

    if (!dengueFocus) {
      return res.status(404).json({
        status: 'error',
        message: 'Foco de dengue não encontrado'
      });
    }

    if (dengueFocus.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Você só pode atualizar seus próprios registros'
      });
    }

    const { userId, ...updateData } = req.body;

    if (req.file) {
      try {
        const oldImageUrl = dengueFocus.photoUrl;
        
        const newImageUrl = await uploadImageToS3(req.file, dengueFocus.id);
        updateData.photoUrl = newImageUrl;
        
        if (oldImageUrl) {
          await deleteImageFromS3(oldImageUrl);
        }
      } catch (uploadError) {
        throw uploadError;
      }
    }

    await dengueFocus.update(updateData);

    const updatedFocus = await DengueFocus.findByPk(dengueFocus.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(200).json({
      status: 'success',
      message: 'Foco de dengue atualizado com sucesso',
      data: updatedFocus
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteDengueFocus = async (req, res) => {
  try {
    const dengueFocus = await DengueFocus.findByPk(req.params.id);

    if (!dengueFocus) {
      return res.status(404).json({
        status: 'error',
        message: 'Foco de dengue não encontrado'
      });
    }

    if (dengueFocus.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Você só pode excluir seus próprios registros'
      });
    }

    if (dengueFocus.photoUrl) {
      await deleteImageFromS3(dengueFocus.photoUrl);
    }

    await dengueFocus.destroy();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getMyDengueFocuses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      riskLevel 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId: req.user.id };

    if (status) whereClause.status = status;
    if (riskLevel) whereClause.riskLevel = riskLevel;

    const { count, rows } = await DengueFocus.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      status: 'success',
      results: rows.length,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.markAsResolved = async (req, res) => {
  try {
    const dengueFocus = await DengueFocus.findByPk(req.params.id);

    if (!dengueFocus) {
      return res.status(404).json({
        status: 'error',
        message: 'Foco de dengue não encontrado'
      });
    }

    if (dengueFocus.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Você só pode marcar como resolvido seus próprios registros'
      });
    }

    await dengueFocus.markAsResolved();

    const updatedFocus = await DengueFocus.findByPk(dengueFocus.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(200).json({
      status: 'success',
      message: 'Foco marcado como resolvido',
      data: updatedFocus
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateRiskLevel = async (req, res) => {
  try {
    const { riskLevel } = req.body;

    if (!riskLevel) {
      return res.status(400).json({
        status: 'error',
        message: 'Nível de risco é obrigatório'
      });
    }

    const dengueFocus = await DengueFocus.findByPk(req.params.id);

    if (!dengueFocus) {
      return res.status(404).json({
        status: 'error',
        message: 'Foco de dengue não encontrado'
      });
    }

    if (dengueFocus.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Você só pode atualizar o nível de risco dos seus próprios registros'
      });
    }

    await dengueFocus.updateRiskLevel(riskLevel);

    const updatedFocus = await DengueFocus.findByPk(dengueFocus.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(200).json({
      status: 'success',
      message: 'Nível de risco atualizado com sucesso',
      data: updatedFocus
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getNearbyFocuses = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: 'error',
        message: 'Latitude e longitude são obrigatórias'
      });
    }

    const allFocuses = await DengueFocus.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });

    const nearbyFocuses = allFocuses.filter(focus => {
      const distance = focus.getDistance(parseFloat(latitude), parseFloat(longitude));
      return distance <= parseFloat(radius);
    });

    const focusesWithDistance = nearbyFocuses.map(focus => {
      const distance = focus.getDistance(parseFloat(latitude), parseFloat(longitude));
      return {
        ...focus.toJSON(),
        distance: Math.round(distance * 100) / 100
      };
    });

    focusesWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      status: 'success',
      results: focusesWithDistance.length,
      data: focusesWithDistance
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const stats = await DengueFocus.getStatsByRisk();

    const processedStats = stats.reduce((acc, stat) => {
      const riskLevel = stat.riskLevel;
      const status = stat.status;
      const count = parseInt(stat.dataValues.count);

      if (!acc[riskLevel]) {
        acc[riskLevel] = {
          total: 0,
          monitorando: 0,
          resolvido: 0
        };
      }

      acc[riskLevel][status] = count;
      acc[riskLevel].total += count;

      return acc;
    }, {});

    const totalFocuses = await DengueFocus.count();
    const activeFocuses = await DengueFocus.count({ 
      where: { status: 'monitorando' } 
    });
    const resolvedFocuses = await DengueFocus.count({ 
      where: { status: 'resolvido' } 
    });

    const riskLevels = ['alto', 'medio', 'baixo'];
    riskLevels.forEach(level => {
      if (!processedStats[level]) {
        processedStats[level] = {
          total: 0,
          monitorando: 0,
          resolvido: 0
        };
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          total: totalFocuses,
          active: activeFocuses,
          resolved: resolvedFocuses
        },
        byRiskLevel: processedStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.uploadPhoto = upload.single('photo');
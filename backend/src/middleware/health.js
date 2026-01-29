const mongoose = require('mongoose');

const healthCheck = (req, res) => {
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    const isDbConnected = dbState === 1;

    const healthData = {
        status: isDbConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: dbStatusMap[dbState] || 'unknown',
        version: process.version,
        environment: process.env.NODE_ENV || 'development'
    };
    
    // Se o banco estiver fora, retorna 503 (Service Unavailable) em vez de 200
    const httpStatus = isDbConnected ? 200 : 503;
    
    res.status(httpStatus).json(healthData);
};

module.exports = healthCheck;
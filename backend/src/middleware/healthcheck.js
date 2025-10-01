const os = require('os');
const { logger } = require('../utils/logger');

const healthCheck = (req, res) => {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: os.cpus().length,
      loadAverage: os.loadavg()
    };

    logger.info('Health check performed', { healthData });
    res.status(200).json(healthData);
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
};

module.exports = healthCheck;

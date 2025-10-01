const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Custom log levels with numerical severity
const logLevels = {
  error: 0,
  warn: 1,
  security: 2,
  info: 3,
  debug: 4,
  trace: 5
};

// Custom colors for log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  security: 'magenta',
  info: 'green',
  debug: 'blue',
  trace: 'gray'
};

// Create logger with structured JSON format
const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'beuni-corporate-gifting' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
      level: 'debug'
    }),
    // File transport for error and above
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Separate file for security events
    new winston.transports.File({ 
      filename: 'logs/security.log', 
      level: 'security',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Correlation ID middleware
const correlationMiddleware = (req, res, next) => {
  const correlationId = req.get('X-Correlation-ID') || uuidv4();
  req.correlationId = correlationId;
  res.set('X-Correlation-ID', correlationId);
  
  // Attach correlation ID to logger
  logger.defaultMeta.correlationId = correlationId;
  
  next();
};

// Audit logging function
const auditLog = (action, actor, details = {}) => {
  logger.log({
    level: 'security',
    message: 'Audit Event',
    meta: {
      action,
      actor,
      details,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  logger,
  correlationMiddleware,
  auditLog
};

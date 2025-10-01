const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { logger, auditLog } = require('../utils/logger');

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts
  message: 'Too many login attempts, please try again later',
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded for login', {
      ip: req.ip,
      path: req.path
    });
    auditLog('LOGIN_RATE_LIMIT', 'SYSTEM', { 
      ip: req.ip 
    });
    res.status(429).json(options.message);
  }
});

// Generic rate limiter for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  message: 'Too many requests, please try again later',
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded for API', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json(options.message);
  }
});

// Security middleware setup
const setupSecurityMiddleware = (app) => {
  // Helmet for setting various HTTP headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));

  // CORS configuration
  app.use((req, res, next) => {
    const allowedOrigins = [
      'https://beuni.com',
      'http://localhost:3000'
    ];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    next();
  });

  // Apply rate limiters
  app.use('/login', loginLimiter);
  app.use('/api/', apiLimiter);

  // Logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      logger.info('HTTP Request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: duration
      });

      // Log potential security events
      if (res.statusCode >= 400) {
        auditLog('HTTP_ERROR', req.user?.id || 'ANONYMOUS', {
          method: req.method,
          path: req.path,
          status: res.statusCode
        });
      }
    });

    next();
  });
};

module.exports = {
  setupSecurityMiddleware,
  loginLimiter,
  apiLimiter
};

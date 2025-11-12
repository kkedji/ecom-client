/**
 * Middleware global de gestion des erreurs
 */
const errorHandler = (err, req, res, next) => {
  console.error('Erreur capturée:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Erreurs Prisma
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Conflit de données',
          message: 'Cette donnée existe déjà dans le système',
          field: err.meta?.target
        });
      
      case 'P2025':
        return res.status(404).json({
          error: 'Ressource non trouvée',
          message: 'L\'élément demandé n\'existe pas'
        });
      
      case 'P2003':
        return res.status(400).json({
          error: 'Contrainte de clé étrangère',
          message: 'Référence invalide vers une autre ressource'
        });
      
      case 'P2014':
        return res.status(400).json({
          error: 'Relation invalide',
          message: 'Violation d\'une contrainte relationnelle'
        });
      
      default:
        return res.status(500).json({
          error: 'Erreur de base de données',
          message: 'Une erreur est survenue lors de l\'accès aux données'
        });
    }
  }

  // Erreurs de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Données invalides',
      message: 'Les données fournies ne respectent pas le format attendu',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Le token d\'authentification est invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Votre session a expiré. Veuillez vous reconnecter.'
    });
  }

  // Erreurs de limite de taille
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Fichier trop volumineux',
      message: 'Le fichier dépasse la taille maximale autorisée'
    });
  }

  // Erreurs Multer (upload de fichiers)
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Fichier non autorisé',
      message: 'Type de fichier non accepté'
    });
  }

  // Erreurs de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON invalide',
      message: 'Le format JSON de votre requête est invalide'
    });
  }

  // Erreurs personnalisées avec status
  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({
      error: err.name || 'Erreur',
      message: err.message || 'Une erreur est survenue'
    });
  }

  // Erreur générique
  const statusCode = process.env.NODE_ENV === 'production' ? 500 : 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Une erreur interne est survenue' 
    : err.message;

  res.status(statusCode).json({
    error: 'Erreur serveur',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

/**
 * Middleware pour capturer les erreurs asynchrones
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Classe d'erreur personnalisée
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError
};
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
//const { User } = require('../models/User');

// Verificación del middleware
const verifyTokenFn = (req, res, next) => {
    console.log('\n[AuthJWT] Middleware ejecutandose para: ', req.originalUrl);

    try {
        const token = req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];
        
        // Verifica que haya un token en el encabezado
        if (!token) {
            console.log('[AuthJWT] Error: Token no proporcionado');
            return res.status(403).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        // Verifica el token usando el secreto de la configuración
        const decoded = jwt.verify(token, config.secret);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        
        // Log de depuración (con menos detalles sensibles)
        console.log('[AuthJWT] Token valido para: ', decoded.email);
        next();
    } catch (error) {
        // Error si el token no es válido
        console.log('[AuthJWT] Error: ', error.name, '_', error.message);
        return res.status(401).json({
            success: false,
            message: 'Token invalido',
            error: error.name
        });
    }
};

// Verifica que `verifyTokenFn` sea una función válida
if (typeof verifyTokenFn !== 'function') {
    console.error('[AuthJWT] ERROR: verifyTokenFn no es una función');
    throw new Error('verifyTokenFn debe ser una función');
}

module.exports = {
    verifyToken: verifyTokenFn
};

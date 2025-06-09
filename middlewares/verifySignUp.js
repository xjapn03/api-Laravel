const User = require('../models/User');

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        if (!req.body.username || !req.body.email) {
            return res.status(400).json({
                success: false,
                message: 'Username y email son requeridos'
            });
        }

        const user = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.email }
            ]
        }).exec();

        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Error, usuario o email ya existentes'
            });
        }

        next();

    } catch (err) {
        console.error('[verifySignUp] Error en checkDuplicateUsernameOrEmail:', err);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar credenciales',
            error: err.message
        });
    }
};

const checkRolesExisted = (req, res, next) => {
    const validRoles = ['admin', 'coordinador', 'auxiliar'];

    if (req.body.role) {
        const roles = Array.isArray(req.body.role) ? req.body.role : [req.body.role];

        const invalidRoles = roles.filter(role => !validRoles.includes(role));
        if (invalidRoles.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Rol(es) no válidos: ${invalidRoles.join(', ')}`
            });
        }
    }

    next();
};

module.exports = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};
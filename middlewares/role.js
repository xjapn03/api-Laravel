const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.userRole) {
            console.error('Intento de verificar rol sin token valido')
            return res.status(500).json({
                message:'NO tienes permiso para esta accion'
            });
        }

        if(!allowedRoles.includes(req.userRole)){
            console.log(`Acceso denegado para ${req.userEmail} (${req.userRole}) en ruta ${req.path}`);
            return res.status(403).json({
                success: false,
                message:'no tienes permisos para esta accion'
            });
        }

        next();
    };
};

//funciones para cada rol
const isAdmin = (req, res, next) => {
    return checkRole('admin')(req, res, next);
};

const isCoordinador = (req, res, next) => {
    return checkRole('coordinador')(req, res, next);
};

const isAuxiliar = (req, res, next) => {
    return checkRole('auxiliar')(req, res, next);
};

module.exports = {
    checkRole,
    isAdmin,
    isCoordinador,
    isAuxiliar
};
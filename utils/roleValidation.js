function validatePermissions(userRole, allowedRoles) {
    if(!allowedRoles.includes(userRole)){
        const error = new Error('Accesso denegado: permisos insuficientes');
        error.status = 403;
        throw error;
    }
};

module.exports = {
    validatePermissions
};
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

router.use((req, res, next) => {
    console.log('\n=== DIAGNOSTICO FR RUTA ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers: ', {
        'Autorización: ': req.headers.authorization ? '***' + req.headers.authorization.slice(8) : null, 
        'x-access-token': req.headers['x-access-token'] ? '***' + req.headers['x-access-token'].slice(8) : null,
        'user-agent': req.headers['user-agent']
    });
    next();
});

//POST /api/users - crear usuario (solo admin)
router.post('/', 
    verifyToken,
    checkRole('admin', 'coordinador'), 
    userController.createUser
);

//GET /api/users - listar usuarios (admin y coordinador pueden ver todos, auxiliar solo se ve a si mismo)
router.get('/', 
    verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    userController.getAllUsers
);

//GET /api/users/:id - obtener usuarios especificos, admin y coordinador ven todos, auxiliar a si mismo
router.get('/:id', 
    verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'), 
    userController.getUserById
);

//PUT /api/users/:id - Actualizar usuario (admin y coordinador pueden actualizar)
router.put('/:id', 
    verifyToken,
    checkRole('admin', 'coordinador','auxiliar'), 
    userController.updateUser
);

//DELETE /api/users/:id - eliminar usuario (solo admin)
router.delete('/:id', 
    verifyToken,
    checkRole('admin'),
    userController.deleteUser
);

module.exports = router;
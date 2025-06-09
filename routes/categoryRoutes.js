const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

//Crear categoria
router.post('/',
    verifyToken,
    checkRole('admin', 'coordinador'),
    categoryController.createCategory
);

//obtener todas las categorias
router.get('/', categoryController.getCategories);

//Obtener categoria por id
router.get('/:id', categoryController.getCategoryById);

//Actualizar categoria
router.put('/:id',
    verifyToken,
    checkRole('admin', 'coordinador'),
    categoryController.updateCategory
);

//Eliminar categoria
router.delete('/:id',
    verifyToken,
    checkRole('admin'),
    categoryController.deleteCategory
);

module.exports = router;
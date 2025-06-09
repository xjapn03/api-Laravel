const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const { check } = require('express-validator');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

//Validaciones
const validateSubcategory = [
    check('name').not().isEmpty().withMessage('El nombre es obligatorio'),
    check('description').not().isEmpty().withMessage('la descripcion es obligatoria'),
    check('category').not().isEmpty().withMessage('la categoria es obligatoria')
];

//Crear subcategoria
router.post('/', 
    verifyToken,
    checkRole('admin', 'coordinador'),
    validateSubcategory, 
    subcategoryController.createSubcategory
);

//Obtener todas las subcategorias
router.get('/', subcategoryController.getSubcategories);

//Obtener subcategoria por ID
router.get('/:id', subcategoryController.getSubcategoryById);

//Actualizar subcategoria (solo admin y coordinador)
router.put('/:id', 
    verifyToken,
    checkRole('admin', 'coordinador'),
    validateSubcategory, 
    subcategoryController.updateSubcategory
);

//Eliminar subcategoria (solo admin) 
router.delete('/:id', 
    verifyToken,
    checkRole('admin'),
    subcategoryController.deleteSubcategory
);

module.exports = router;
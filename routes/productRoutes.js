const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { check } = require('express-validator');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

const validateProduct = [
    check('name').not().isEmpty().withMessage('El nombre es obligatorio'),
    check('description').not().isEmpty().withMessage('la description es obligatoria'),
    check('price').isFloat({ min:0 }).withMessage('precio invalido'),
    check('stock').isInt({ min:0 }).withMessage('stock invalido'),
    check('category').not().isEmpty().withMessage('La categoria es obligatoria'),
    check('subcategory').not().isEmpty().withMessage('La subcategoria es obligatoria')
];

//Crear producto
router.post('/', 
    verifyToken,
    checkRole('admin', 'coordinador'),
    validateProduct, productController.createProduct
);

//Obtener todos los productos
router.get('/', 
    verifyToken,
    productController.getProducts
);

//Obtener producto por ID
router.get('/:id', 
    verifyToken,
    productController.getProductById
);

//ACtualizar producto (solo admin y coordinador)
router.put('/:id', 
    verifyToken,
    checkRole('admin', 'coordinador'),
    validateProduct, productController.updateProduct
);

//Eliminar producto
router.delete('/:id',
    verifyToken,
    checkRole('admin'),
    productController.deleteProduct
);

module.exports = router;
const Product = require('../models/Product');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

exports.createProduct = async (req,res) => {
    try{
        const {name, description, price, stock, category, subcategory} = req.body;

        //validacion campos requeridos
        if(!name || !description || !price || !stock || !category || !subcategory){
            return res.status(400).json({
                success: false,
                message: 'todos los campos son obligatorios'
            });
        }

        //verificar que la categoria existe
        const categoryExist = await Category.findById(category);
        if (!categoryExist){
            return res.status(404).json({
                success: false,
                message: 'la categoria solicitada no existe'
            });
        }

        //verificar que la subcategoria existe y que pertenezca a la categoria
        const subcategoryExist = await Subcategory.findOne({
            _id: subcategory,
            category: category
        });
        if (!subcategoryExist){
            return res.status(400).json({
                success: false,
                message: 'la subcategoria solicitada no existe o no pertenece a la categoria especifica'
            });
        }

        //crear el producto sin el createBy temporal
        const product = new Product({
            name, 
            description, 
            price, 
            stock, 
            category, 
            subcategory
        });

        //verificar si el usuario esta disponible en el request
        if (req.userId) { //if(req.user && req.userId){
            product.createdBy = req.userId;
        }

        //guardar en la base de datos
        const savedProduct = await product.save();

        //obtener el producto con los datos pedidos con los poblados
        const productWithDetails = await Product.findById(savedProduct._id)
        .populate('category', 'name')
        .populate('subcategory','name')
        .populate('createdBy', 'username email');

        return res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: productWithDetails
        });
    } catch (error) {
        console.error('Error en createProduct: ', error);
        //manejo errores de mongoDB
        if(error.code === 11000){
            return res.status(400).json({
                success: false,
                message: 'ya existe un producto con ese nombre'
            });
        }

        res.status(500).json({
            success: false,
            message:'Error al crear producto',
            error: error.message
        });
    }
};

//consulta de productos
exports.getProducts = async (req, res) => {
    try {
        // Obtener los productos
        const products = await Product.find()
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createdAt: -1 });

        // Filtrar el campo createdBy si el rol del usuario es "auxiliar"
        if (req.userRole === 'auxiliar') {
            // Eliminar el campo 'createdBy' de cada producto
            products.forEach(product => {
                product.createdBy = undefined;
            });
        }

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error('Error en getProducts: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos',
            error: error.message
        });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name description')
            .populate('subcategory', 'name description');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Filtrar el campo createdBy si el rol del usuario es "auxiliar"
        if (req.userRole === 'auxiliar') {
            product.createdBy = undefined;
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Error en getProductById: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener producto',
            error: error.message
        });
    }
};

exports.updateProduct = async (req,res) => {
    try {
        const {name, description, price, stock, category, subcategory} = req.body;
        const updateData = {};

        // Preparar datos para actualizar
        if(name) updateData.name = name;
        if(description) updateData.description = description;
        if(price) updateData.price = price;
        if(stock) updateData.stock = stock;
        if(category) updateData.category = category;
        if(subcategory) updateData.subcategory = subcategory;

        // Validar relaciones solo si vienen en la actualización
        if(category || subcategory){
            if(category){
                const categoryExist = await Category.findById(category);
                if(!categoryExist){
                    return res.status(404).json({
                        success: false,
                        message: 'La categoria solicitada no existe'
                    });
                }
            }
            if(subcategory){
                const subcategoryExist = await Subcategory.findOne({
                    _id: subcategory,
                    category: category || updateData.category
                });
                if(!subcategoryExist){
                    return res.status(404).json({
                        success: false,
                        message: 'La subcategoria solicitada no existe o no pertenece a la categoria'
                    });
                }
            }
        }

        // Actualizar producto
        const updateProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators : true
        }).populate('category', 'name')
        .populate('subcategory', 'name')
        .populate('createdBy', 'username email');

        if(!updateProduct){
            return res.status(404).json({
                success: false,
                message:'Error al encontrar producto'
            });
        }

        res.status(200).json({
            success: true,
            message:'Producto actualizado',
            data: updateProduct
        });

    } catch (error) {
        console.error('Error en updateProduct: ', error);
        res.status(500).json({
            success: false,
            message:'Error al actualizar productos',
            error: error.message
        });
    }
};

exports.deleteProduct = async (req,res) => {
    try {
        const deleteProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deleteProduct) {
            return res.status(404).json({
                success: false,
                message: 'producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente',
            data: deleteProduct
        });

    } catch (error) {
        console.error('Error en deleteProduct: ', error);
        res.status(500).json({
            success: false,
            message:'Error al eliminar producto',
            error: error.message
        });
    }
};
const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validación de los campos de entrada
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es obligatorio y debe ser texto válido'
            });
        }

        if (!description || typeof description !== 'string' || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: 'La descripción es obligatoria y debe ser texto válido'
            });
        }

        const trimmedName = name.trim();
        const trimmedDesc = description.trim();

        // Verificar si ya existe una categoría con el mismo nombre
        const existingCategory = await Category.findOne({ name: trimmedName });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Ya hay una categoría con ese nombre'
            });
        }

        // Crear una nueva categoría
        const newCategory = new Category({
            name: trimmedName,
            description: trimmedDesc
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: newCategory
        });

    } catch (error) {
        console.error('Error en createCategory:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }

        // Error genérico
        res.status(500).json({
            success: false,
            message: 'Error al crear la categoría',
            error: error.message
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error en getCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message
        });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        console.error('Error en getCategoryById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la categoría',
            error: error.message
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updateData = {};

        if (name) {
            updateData.name = name.trim();

            // Verificar si el nuevo nombre ya existe
            const existing = await Category.findOne({
                name: updateData.name,
                _id: { $ne: req.params.id } // Asegurar que no sea el mismo ID
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Este nombre ya existe'
                });
            }
        }

        if (description) {
            updateData.description = description.trim();
        }

        // Actualizar la categoría en la base de datos
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Categoría actualizada exitosamente',
            data: updatedCategory
        });

    } catch (error) {
        console.error('Error en updateCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la categoría',
            error: error.message
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const deleteCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deleteCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error en deleteCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la categoría',
            error: error.message
        });
    }
};

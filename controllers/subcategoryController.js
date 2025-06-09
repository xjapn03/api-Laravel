const Subcategory = require('../models/Subcategory');
const Category = require('../models/Category');

//Crear subcategoria
exports.createSubcategory = async (req, res) =>{
    try{
        const {name, description, category} = req.body

        //validar que la categoria existe

        const parentCategory = await Category.findById(category);
        if(!parentCategory){
            return res.status(404).json({
                success: false,
                message: 'la categoria no existe',
            });
        }

        const newSubcategory = new Subcategory({
            name: name.trim(),
            description: description.trim(),
            category
        });

        await newSubcategory.save();

        res.status(201).json({
            success: true,
            message: 'Subcategoria creada exitosamente',
            data: newSubcategory
        });

    } catch (error) {
        console.error('Error al crear la subcategoria', error);
        if (error.message.includes('duplicate Key') || error.message.includes('Ya existe')){
            return res.status(400).json({
                success: false,
                message: 'ya existe una subcategoria con ese nombre'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Error al crear subcategoria'
        });

    }
}

//obtener todas las subcategorias
exports.getSubcategories = async (req, res) => {
    try{
        const subcategories = await Subcategory.find().populate('category', 'name');
        res.status(200).json({
            success: true,
            data: subcategories
        });

    } catch (error){
        console.error('Error al obtener subcategorias ', error);
        res.status(500).json({
            success: false,
            message:'Error al obtener subcategorias'
        });
    }
};

//obtener por id
exports.getSubcategoryById = async (req, res) => {
    try{
        const subcategory = await Subcategory.findById(req.params.id).populate('category', 'name');
        
        if(!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });

        }
        res.status(200).json({
            success: true,
            data: subcategory
        });
    } catch (error) {
        console.error('Error al obtener subcategorias por id: ', error);
        res.status(500).json({
            success: false,
            message:'Error al obtener subcategorias por id'
        });
    }
};

//actualizar
exports.updateSubcategory = async (req, res) => {
    try{
        const {name, description, category} = req.body;

        //Verificar si cambia la categoria
        if(category){
            const parentCategory = await Category.findById(category);
            if(!parentCategory){
                return res.status(404).json({
                    success: false,
                    message: 'La categoria no existe'
                });
            }
        }

        const updateSubcategory = await Subcategory.findByIdAndUpdate(req.params.id,
                {
                    name: name ? name.trim() : undefined,
                    description: description ? description.trim() : undefined,
                    category    
                },
                {new: true, runValidators: true}
            );

        if(!updateSubcategory){
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Subcategoria actualizada',
            data: updateSubcategory
        });

    } catch (error) {
        console.error('Error al actualizar la subcategoria', error);
        res.status(500).json({
            success: false,
            message:'Error al actualizar la subcategoria'
        });
    }
};

//eliminar
exports.deleteSubcategory = async (req, res) => {
    try{
        const deleteSubcategory = await Subcategory.findByIdAndDelete(req.params.id);

        if(!deleteSubcategory){
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Subcategoria eliminada'
        });
    } catch (error) {
        console.error('Error al eliminar la subcategoria', error);
        res.status(500).json({
            success: false,
            message:'Error al eliminar la subcategoria'
        });
    }
};
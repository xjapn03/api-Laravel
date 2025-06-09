const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

//Roles del sistema 
const ROLES = {
    ADMIN: 'admin',
    COORDINADOR: 'coordinador',
    AUXILIAR: 'auxiliar'
};

// Funcion para verificar permisos 
const checkPermission = (UserRole, allowedRoles) => {
    return allowedRoles.includes(UserRole);
};

//1. Regristro de usuarios (Solo admin)
exports.signup = async (req, res) => {
    try {
            const user = new User ({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,/*password: bcrypt.hashSync(req.body.password,8),*/
            role: req.body.role || 'auxiliar' // Usamos el valor directo
        });

        const savedUser = await user.save();
        console.log('[AuthController] Usuario registrado:', savedUser.email);

        const token = jwt.sign(
            { 
            id: savedUser._id, role: savedUser.role, email: savedUser.email 
            },
            config.secret, { expiresIn: config.jwtExpiration }
        );

        res.status(200).json({
            success: true, 
            message: 'Usuario registrado correctamente', 
            token: token,
            user: savedUser
        });
    } catch(error) {
            return res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

//2. Login (Comun para todos)
exports.signin = async (req, res) => {
    try {
        console.log('[AuthController] Body recibido:', req.body);
        console.log('[AuthController] Login iniciado:', req.body.email);

        if (!req.body.email || !req.body.password){
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridas'
            });
        }

        //1. Validacion de campos requeridos 
        if((!req.body.username && !req.body.email) || !req.body.password) {
            console.log('[AuthController] campos faltantes: ',{
                username: req.body.username,
                email: req.body.email,
                password: req.body.password ? '*' : 'NO PROVISTO'
        });

            return res.status(400).json({
                success: false,
                message: 'Se requiere email o password'
            });
        }

        //2. Buscar usuario con todos los campos necesarios 
        const user = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.email }
            ]
            }).select('+password'); //Asegurar que traiga el campo de password

        if(!user) {
            console.log('[AuthController] Usuario no encontrado');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        //3. Validar que el usuario tenga contraseña
        if(!user.password) {
            console.log('[AuthController] Usuario sin contraseña registrada');
            return res.status(500).json({
                success: false,
                message: 'Error en la configuracion del usuario'
            });
        }

        //4. Verifcar contraseña con validacion adicional 
        console.log('[AuthController] Comparando contraseñas...');
        if(!req.body.password || typeof req.body.password !== 'string') {
            console.log('[AuthController] Constraseña no valida en request');
            return res.status(400).json({
                success: false,
                message: 'Formato de contraseña invalido'
            });
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if(!passwordIsValid) {
            console.log('[AuthController] Contraseña incorrecta');
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        //5. Generar token
        const token = jwt.sign(
            { 
                id: user._id, role: user.role, email: user.email 
            },
            config.secret, { expiresIn: config.jwtExpiration }
        );

        //6. Responder (ocultando password)
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            token: token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch(error) {
            console.error('[AuthController] Error critico:', error);
            return res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

//3. Obtener todos los usuarios (Admin y Coordinador)
exports.getAllUsers = async (req, res) => {
    try {
        if(!checkPermission(req.user.Role, [ROLES.ADMIN, ROLES.COORDINADOR])) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado'
            });
        }

        const users = await User.find({}).select('-password-__v');
        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });

    } catch(error) {
            console.error('Error en getAllUsers', error);
            return res.status(500).json({
            success: false,
            message: 'Error al consultar usuarios'
        });
    }
};

//4. Obtener usuario por id (Admin y Coordinardor)
exports.getAllUsersById = async (req, res) => {
console.log('\n=== INICIO DE CONSULTA POR ID');
    try {
        //1. Validacion de extrema del ID
        const id = req.params.id;
        console.log('[1] ID recibido:', id);

        if(!id || typeof id !== 'string' || id.length !== 24) {
            console.log(['[ERROR] ID invalido']);
            return res.status(400).json({
                success: false,
                message: 'ID de usuario no valido'
            });
        }

        //2. Control de acceso (Como en otros endpoints)
        console.log('[2] Verificando permisos..');
        const isAllowed = req.roles.includes('admin') || req.roles.includes('coordinador') || req.userId === id;

        if(!isAllowed) {
            console.log('PERMISO DENEGADO');
            return res.status(403).json({
                success: false,
                message: 'No autorizado'
            });
        }

        //3. Consulta directa a mongoDB (sin relaciones)
        console.log('[3] Ejecutando consulta directa...'); 
        const db = req.app.get('mongoDb'); //Conexion directa a mongodb

        //3.1 Buscar usuario
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(id) },
            { projection: {_id: 1, username: 1, email: 1, createAt: 1, updateAt: 1 }}
        );

        console.log('[4] Usuario encontrado', user);
        if(!user) {
            console.log('[ERROR] Usuario no existe');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        //3.2 Buscar roles en dos pasos
        console.log('[5] Buscando roles...');
        const userRoles = await db.collection('userRoles').find(
            { userId: new ObjectId(id) }
        ).toArray();

        const roleIds = userRoles.map(ur => ur.roleId);
        const roles = await db.collection('roles').find(
        { _id: {$in: roleIds} }
        ).toArray();

        console.log('[6] Roles encontrados', roles.map(r => r.name));

        //4. Formatear respuesta
        const response = {
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                roles: roles.map(r => r.name),
                createdAt: user.createdAt,
                updatedAt : user.updatedAt
            }
        };

        console.log('[7] CONSULTA EXITOSA');
        return res.status(200).json(response);

    } catch(error) {
            console.error('[ERROR CRITICO]', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date ().toISOString(),
            datails: {
                errorCode: error.code || 'N/A',
                errorType: error.name
            }
        });

        return res.status(500).json({
            success: false,
            message: 'Error al obtener usuario',
            error: process.env.NODE_ENV === 'development' ? {
                type: error.name,
                message: error.message,
                code: error.code
            } : undefined
        });
    }
};

//5. Actualizar usuario (Admin puede actualizar todos, coordinador solo auxiliares, auxiliar solo si mismo)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const currentUserRole = req.userRole;
        const currentUserId = req.userId;

        //Buscar usuario a actualizar 
        const userToUpdate = await User.findById(id);
        if(!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        //Verificar permisos 
        if(currentUserRole === ROLES.AUXILIAR && userToUpdate. _id.toString() !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'Solo puedes modificar tu propio perfil'
            });
        }

        if(currentUserRole === ROLES.COORDINADOR && userToUpdate.role === ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'No puedes modificar administradores '
            });
        }

        // Actualizar campos permitidos 
        const allowedFields = [ 'username', 'email' ];
        if(currentUserRole === ROLES.ADMIN) {
            allowedFields.push('role');
        }

        const filteredUpdates = {};
        Object.keys(updates).forEach(key => {
            if(allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        // Si se actuliza el password, pacer hash
        if(updates.password) {
            filteredUpdates.password = bcrypt.hashSync(updates.password, 8);
        }

        const updatedUser = await User.findByIdAndUpdate(id, filteredUpdates, {new: true}).select('-password-__v');

        return res.status(200).json({
        success: true,
        message: 'Usuario actualizado',
        data: updatedUser
        });

    } catch(error) {
        console.error('Error en updateUser', error);
        return res.status(500).json({
        success: false,
        message: 'Error al actualizar usuario'
        });
    }
};

// Eliminar usuario (solo admin)
exports.deleteUser = async (req, res) => {
    try {
        //verificar si es admin
        if(!checkPermission(req.userTole, [ROLES.ADMIN])){
            return res.status(403).json({
                success: false,
                message: 'Solo administradores pueden eliminar'
            });
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser){
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error en deleteUser: ', error);
        return res.status(500).json({
        success: false,
        message: 'Error al eliminar usuario'
        });
    }
};
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'El correo no es válido']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'coordinador', 'auxiliar'],
        default: 'auxiliar'
    },
}, {
    timestamps: true,
    versionKey: false
});

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();

    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);
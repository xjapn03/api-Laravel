module.exports = {
    //1. configuracion de JWT
    SECRET: process.env.JWT_SECRET || 'tu_clave_secreta_para_desarrollo',
    TOKEN_EXPRIATION: process.env.TOKEN_EXPIRATION || '24h',
    
    //2. config de base de datos
    DB: {
        URL: process.env.NONGODB_URI || 'mongodb://localhost:27017/crud-mongo',
        OPTIONS: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    //3. Roles del sistema (deben coincidir con tu implementacion)
    ROLES:{
        ADMIN: 'admin',
        COORDINADOR: 'coordinador',
        AUXILIAR: 'auxiliar'
    }
};
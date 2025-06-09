require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || "tusecretoparalostokens", 
    jwtExpiration: process.env.JWT_EXPIRATION || 86400, //24 HORAS EN SEGUNDOS  
    jwtRefresh: 604800,
    saltRounds: process.env.SALT_ROUNDS || 8
};
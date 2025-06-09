require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { MongoClient, ObjectId } =  require('mongodb');
//importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');


const mongoClient =  new MongoClient(process.env.MONGODB_URI);
(async () => {
    await mongoClient.connect();
    app.set('mongoDb', mongoClient.db());
    console.log('conexion directa a mongoDB establecida');
})();

//middlewares
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//conexion a mongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => console.log('OK mongoDB conectado'))
.catch(err => console.error('X Error de conexion a mongoDB', err));

//rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);

//inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
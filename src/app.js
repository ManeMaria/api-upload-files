require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dataBase = require('./config/dataBase');
const path = require('path');
const app = express();

mongoose.set('useFindAndModify', true)
mongoose.connect(dataBase.web.webURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log('a base foi conectada com sucesso')
}, (err)=>{
    console.log(`ERROR : ${err}`);
    process.exit();
})

app.use(express.json()); //server para ele tratar as requisições no fomarto JSON
app.use(express.urlencoded({extended: true}))
//serve para lidar com requisições url enconded. Facilita no recebimento de imagens 
app.use(morgan('dev'));
app.use(require('./routes'));
app.use('/file',express.static(path.resolve(__dirname,'..','tmp','uploads')));

module.exports = app;
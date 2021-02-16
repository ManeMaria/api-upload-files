const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs'); //lib do node responsável por manipular arquivos
const path = require('path');
const {promisify} = require('util'); //atualiza antigas formas de progr async p/ a atual
const s3 =  new aws.S3();

//o model é a classe que criará objetos que serão lançados no bd
const PostSchema = new mongoose.Schema({
     originalname: String,
     size: Number,
     key: String,
     url: String, //a url é pro cdn da amazon
     createdAt:{
         type: Date, //chama a data
         default: Date.now //chama a hora da criação do post
     }
});

PostSchema.pre('save', function(){
    if(!this.url){
        this.url = `${process.env.APP_URL}/files/${this.key}`
    }
})
PostSchema.pre('remove', function(){
    //não se usa o arrow function, pois ele não identifica o this
    console.log(this.key)
   if(process.env.STORAGE_TYPES === 's3'){
        return s3.deleteObject({
            Bucket: 'caminho-das-imagens',
            Key: this.key,
        }).promise()
      
    }else{
        return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key))
    }
    
})


module.exports = mongoose.model('Post', PostSchema);
const multer = require('multer');
const path = require('path');
//lib do próprio nodejs. Serve para definir os caminhos no app
const crypto = require('crypto');
//lib do próprio nodejs. Serve para criar criptografia no arquivo
const multers3 = require('multer-s3');
const aws = require('aws-sdk');
//essa lib faz a integração do node com a api da s3 da amazon e server para conectar 
//nossa api a api deles.

//LEMBRAR QUE TODAS AS PROPRIEDADES E MÉTODOS SÃO DO MULTER (ler a documentação)
const storageTypes ={
    local : multer.diskStorage({
        //tem a mesma função da propriedade 'dest'. Basicamente se o 'dest' não funcionar,
        //o destination irá enviar o arquivo
        destination: (res, file, callback)=>{
            callback(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads' ))
        },

        //o file name serve para, se houver um caso, arquivos com nomes iguais não 
        //se sobreporem 
        filename: (req, file, callback) =>{
            //invoca a lib com o método randoBytes, ele recebe dois argumentos:
            // o número de bytes (ou tamanho) da hash, um callback que recebe
            // erro em caso de fracasso e hash em caso de sucesso
            crypto.randomBytes(16, (err, hash)=>{
                if(err){
                    callback(err)
                };

                //cria uma variável chamada fileName
                //transforma o parâmetro hash em string e passa o parâmetro 'hex' 
                //no método toString para transformar os bytes em hexadecimal

                file.key = `${hash.toString('hex')}-${file.originalname}`;
                //será 16 caracteres aleatório '-' e o nome original do arquivo

                callback(null, file.key);
            })
        }
    }),
    //para lançar as imagens no amazon s3
    s3: multers3({
        s3: new aws.S3(), //tem que definir uma instancia do aws
        bucket: 'caminho-das-imagens',
        contentType: multers3.AUTO_CONTENT_TYPE //para abrir a img em tela e 
        //efetuar o download
        ,
        acl: 'public-read', //para quem acessar o s3 poder ver a img
        key: (req, file, callback) =>{
                crypto.randomBytes(16, (err, hash)=>{
                    if(err){
                        callback(err)
                    };
                const fileName = `${hash.toString('hex')}-${file.originalname}`;
                callback(null, fileName);
             });
        },
    })
}


module.exports = {
    //a variável dest indicará o local que o arquivo ficará após o upload
    //no primeiro momento, os arquivos ficarão no próprio código
    //mas serão encaminhados para o cdn da amazon
    dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads' )
    //__dirname sempre se refere ao diretório que ele foi invocado
    //foi definido descer dois caminhos, entrar na pasta 'tmp' e na pasta  'uploads'
    ,
    storage: storageTypes[process.env.STORAGE_TYPES],
    //propriedade de limitação de arquivos
    //por enquanto só haverá limitação de tamanho. Limite para dois megas
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    //será um método para filtrar extenções dos arquivos
    fileFilter: (req, file, callback)=>{
        //req do express (normal)
        //file é o arquivo em si
        //callback é uma função que será chamada após o termino da verificação

        //cria um array de extensões de arquivos que serão aceitos pelo multer

        const allowedMines = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif',
            //'image/',
        ];

        /*ao invés de fazermos:
        *   If(file.mimetype === 'image/jpeg 
        *       || file.mimetype === 'image/pjpeg 
        *       || file.mimetype === 'image/png
        *       || file.mimetype === 'image/gif){...}
        * 
        *   incluímos as possibilidades de arquivos que queremos em um array
        *   e utilizamos o arr.includes() p/ verificar se há alguma extenção de 
        *   arquivo que condiz com o esperado.
        */

        if(allowedMines.includes(file.mimetype)){
            callback(null, true);
        } else {
            callback(new Error('Arquivo inválido'))
        }

    }
};
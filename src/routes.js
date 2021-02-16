const routes  = require('express').Router();
const multer = require('multer');
const multerConfig = require('./config/multer');
//configurações do multer
const Post = require('./models/Post');


routes.post('/post',multer(multerConfig).single('file'), async (req,res)=>{
    //para lançar um arquivo , deve-se usar o método single() do multer
    //se quiser lançar vários arquivos, usar o método array() do próprio multer
    //dentro do método single(), adiciona o campo do nome do arquivo, nesse caso
    //se chamará file (pode ser qualquer nome)
    const {originalname, size, key, location: url ='' } = req.file;
    const post = await Post.create({
        originalname, 
        size: size,
        key,
        url,
    })
    res.status(200).json(post);
});

//confirmar conexão

routes.get('/', (req, res)=>{
    res.status(200).json({message: 'api was successfully deloyed'})
})

//buscar todas as imagens
routes.get('/images', async (req, res, next)=>{
   try {
    const images = await Post.find();
    res.json(images);
   } catch (error) {
       next(error);
       res.status(500).json({message: error.message});
       
   }

});

routes.delete('/post/:id', async (req, res, next)=>{
    try {
        const image = await Post.findById(req.params.id);
        await image.remove();
        res.status(200).json({message: `imagem ${req.params.id} deletada com sucesso `})
    } catch (error) {
        next(error);
        res.status(500).json({message: error.message});
    }
})

module.exports = routes; 
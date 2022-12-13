const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
    cloud_name: 'drqaponog',
    api_key: '271462851299647',
    api_secret: 'zP72B2INkqZ25o0PjCp-pg-9XG4'
})

const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg','png'],
    params:{
        folder:'avatar'
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
    }
})
const uploadCloud = multer({storage})
module.exports = uploadCloud
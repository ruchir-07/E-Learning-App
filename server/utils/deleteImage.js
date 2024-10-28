const cloudinary = require('cloudinary').v2;

exports.deleteImageFromCloudinary = async(url, folder, type=null)=>{
    
    const file = url?.split('/');
    const fileName = file[file.length - 1]?.split('.')[0];

    if(type==='video'){
        return await cloudinary.uploader.destroy(`${folder}/${fileName}`, {resource_type: 'video'});
    }
    return await cloudinary.uploader.destroy(`${folder}/${fileName}`);
}
const 
    FileModel = require('../models/file'),
    mongoose = require('mongoose')
    config = require('../config')
    ;

module.exports = (function() {
    return {
        saveFile (attributes) {
            return FileModel.create(attributes);
        },
        
        deleteFile (id) {
            return FileModel.findById(id).then((file) => {
                if(file){
                    return file.remove();
                } else {
                    null;
                }
            });
        },
        
        getById (id) {
            if(!mongoose.Types.ObjectId.isValid(id)){
                return Promise.resolve(null);
            }
            return FileModel.findById(id).exec();
        },

        getAll(){
            return FileModel.find().exec();
        }
    };
})();
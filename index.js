const
    express = require('express'),
    fs = require('fs-extra'),
    busboy = require('connect-busboy'),
    path = require('path'),
    cors = require('cors')
    config = require('./config'),
    shortid = require('shortid'),
    moment = require('moment'),
    fileStore = require('./store/file'),
    mongoose = require('mongoose')
    ;

const app = express();
app.use(cors());
app.use(busboy());
app.use(express.static(path.join(`${__dirname}/public`)));

app.post('/upload', (request, response) => {
    request.pipe(request.busboy);
    request.busboy.on('file', (fieldName, file, fileName) => {
        let ext = path.extname(fileName);
        if(ext == null) { ext = ''; }
        //Generate a random file name
        fileName = `${shortid.generate()}${ext}`;
        let filePath = `${__dirname}/public/uploaded/${fileName}`;
        let stream = fs.createWriteStream(filePath);
        file.pipe(stream);
        stream.on('close', () => {
            let attributes = {
                name: fileName,
                size: fs.statSync(filePath).size,
                date: moment(),
                format: ext.replace('.', '').toUpperCase()
            };
            mongoose.connect(config.dataSource).then(() => {
                return fileStore.saveFile(attributes);
            }).then((savedFile) => {
                let url = `${request.protocol}://${request.get('host')}/uploaded/${savedFile.name}`;
                let json = {
                    size: savedFile.size,
                    date: savedFile.date,
                    format: savedFile.format,
                    url: url
                };
                response.send(json);
            }).catch((error) => {
                //Ups! Something bad happened. Was info was not added to the database
                //TODO: delete downloaded file from the file system
                response.sendStatus(500);
            });
        })
    });
});

const server = app.listen(config.port, () => {
    console.log('File server listening on port: ' + server.address().port);
});
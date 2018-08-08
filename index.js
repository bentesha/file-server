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
        const filePath = `${__dirname}/public/uploaded/${fileName}`;
        const stream = fs.createWriteStream(filePath);
        file.pipe(stream);
        stream.on('close', () => {
            const url = `${request.protocol}://${request.get('host')}/uploaded/${fileName}`;
            response.json({
                name: fileName,
                size: fs.statSync(filePath).size,
                date: moment().format(),
                format: ext.replace('.', '').toUpperCase(),
                url
            });
        })
    });
});

const server = app.listen(config.port, () => {
    console.log('File server listening on port: ' + server.address().port);
});
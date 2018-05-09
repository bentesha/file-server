const
    express = require('express'),
    fs = require('fs-extra'),
    busboy = require('connect-busboy'),
    path = require('path'),
    cors = require('cors')
    config = require('./config')
    ;

const app = express();
app.use(cors());
app.use(busboy());
app.use(express.static(path.join(`${__dirname}/public`)));

app.post('/upload', (request, response) => {
    request.pipe(request.busboy);
    request.busboy.on('file', (fieldName, file, fileName) => {
        let stream = fs.createWriteStream(`./public/uploaded/${fileName}`);
        file.pipe(stream);
        stream.on('close', () => {
            response.send({message: 'File uploaded successfully.'});
        })
    });
});

const server = app.listen(config.port, () => {
    console.log('File server listening on port: ' + server.address().port);
});
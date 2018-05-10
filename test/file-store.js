const
    expect = require('chai').expect,
    config = require('../config'),
    store = require('../store/file'),
    mongoose = require('mongoose'),
    moment = require('moment')
    ;

describe('fileStore', function(){
    let dataSource = config.dataSource;

    before('Drop test database', function(done){
        config.dataSource = 'mongodb://127.0.0.1/file_server_test';
        mongoose.connect(config.dataSource).then(function(mongoose) {
            if(mongoose.connection.collections['files']){
                mongoose.connection.collections['files'].drop();
            }
            done();
        }).catch(done);
    });

    after('Restore configuration', function() {
        config.dataSource = dataSource;
    });

    let attributes = { 
        name: 'sample_name.pdf',
        size: 120000,
        date: moment(),
        format: 'pdf'
    };

    describe('#saveFile', function() {
        it('should have a method named saveFile', function() {
            expect(store).to.respondTo('saveFile');
        });

        let promise = store.saveFile(attributes);

        it('should return a promise', function(){
            expect(promise).to.be.a('promise');
        });

        it('should return a stored file with matching attributes', function(done){
            promise.then((file) => {
                expect(file).to.exist;
                delete attributes.date; //Don't compare date fields for now
                expect(file).to.include(attributes);
                done();
            }).catch(done);
        });
    });

    describe('#getAll', function(){
        it('should have a method name getAll', function(){
            expect(store).to.respondTo('getAll');
        });

        let result = store.getAll();

        it('should return a promise', function(){
            expect(result).to.be.a('promise');
        });

        it('should resolve to an array of one item', function(done){
            result.then((items) => {
                expect(items).to.exist;
                expect(items).to.be.an('array').with.lengthOf(1);
                done();
            }).catch(done);
        });
    });

    describe('#getById', function(){
        it('should return a promise that resolves to null if id does not exist', function(done){
            let result = store.getById('xxxx');
            expect(result).to.be.a('promise');
            result.then((file) => {
                expect(file).to.be.null;
                done();
            }).catch(done);
        });

        it('should return a promise that resolves to file object', function(done){
            store.saveFile(attributes).then((storedFile) => {
                return store.getById(storedFile.id);
            }).then((file) => {
                expect(file).to.exist;
                expect(file).to.include(attributes);
                done();
            }).catch(done);
        });
    });

});
const should = require('should');
const {Enrich} = require('../');

describe('enrich', () => {
    let enrich;
    beforeEach( () => {
        enrich = Enrich();
    });

    it('should say hello world!', done => {
        const enrichers = {
            hi: {
                controller: () => ({greeting: 'hi'})
            }
        };
        enrich(enrichers, {}, (err, result) => {
            if (err) return done(err);
            result.greeting.should.equal('hi');
            done();
        });
    });

    describe('enrichers on returns', () => {

        it('should work with sync return style', done => {
            const enrichers = {
                hi: {
                    controller: () => ({greeting: 'hi'})
                }
            };
            enrich(enrichers, {}, (err, result) => {
                if (err) return done(err);
                result.greeting.should.equal('hi');
                done();
            });
        });

        it('should work with promise return style', done => {
            const enrichers = {
                hi: {
                    controller: () => Promise.resolve({greeting: 'hi'})
                }
            };
            enrich(enrichers, {}, (err, result) => {
                if (err) return done(err);
                result.greeting.should.equal('hi');
                done();
            });
        });

        it('should work with asnyc return style', done => {
            const enrichers = {
                hi: {
                    controller: (params, cb) => setImmediate(()=>
                        cb(null, {greeting: 'hi'}))
                }
            };
            enrich(enrichers, {}, (err, result) => {
                if (err) return done(err);
                result.greeting.should.equal('hi');
                done();
            });
        });
    });

});

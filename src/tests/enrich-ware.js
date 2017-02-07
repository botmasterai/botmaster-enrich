const {EnrichIncomingWare} = require('../');
require('should');

describe('enrich incoming ware', () => {

    it('should say hello world!', done => {
        const enrichers = {
            hi: {
                controller: () => ({greeting: 'hi'})
            }
        };
        const ware = EnrichIncomingWare({enrichers});
        const update = {context: {}};
        const bot = {type: 'not a real bot'};
        ware(
            bot,
            update,
            (err) => {
                if (err) return done(err);
                update.context.greeting.should.equal('hi');
                done();
            }
            );
    });

});

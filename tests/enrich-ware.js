const {enrichIncomingWare} = require('../enrich-incoming-ware');
require('should');

describe('enrich incoming ware', () => {

    it('should say hello world!', done => {
        const enrichers = {
            hi: {
                controller: () => ({greeting: 'hi'})
            }
        };
        const ware = enrichIncomingWare({enrichers});
        const update = {context: {}};
        const bot = {type: 'not a real bot'};
        ware(
            update,
            bot,
            (err) => {
                if (err) return done(err);
                update.context.greeting.should.equal('hi');
                done();
            }
            );
    });

});

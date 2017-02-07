const {Enrich} = require('./Enrich');
const {EnrichIncomingWare} = require('./EnrichIncomingWare');

module.exports = {
    EnrichIncomingWare,
    Incoming: EnrichIncomingWare,
    Enrich
};

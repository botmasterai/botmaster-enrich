const R = require('ramda');
const debug = require('debug')('botmaster:incoming:enrich');
const util = require('util');
const {Enrich} = require('./Enrich');

/**
 * Factory function to generate incoming ware for enrich
 * @param  {Object} $0 options
 * @param  {Object} $0.enrichers an object of enrichers
 * @param  {String} [$0.sessionPath] dot denoted path find the context in the update. defaults to 'context'
 * @param  {Object} [$0.params] optional additional params to pass to enrichers
 * @return {Function} botmaster middleware
 */
const EnrichIncomingWare = ({enrichers, sessionPath = 'context', params = {}}) => {
    sessionPath = sessionPath.split('.');
    return (bot, update, next) => {
        params.bot = bot;
        params.update = update;
        const enrich = Enrich({params, enrichers});
        const lensContext = R.lensPath(sessionPath);
        const oldContext = R.compose(
            R.defaultTo({}),
            R.view(lensContext)
        )(update);
        debug(`enrich recieved update: ${util.inspect(update)}`);
        debug(`enrich got context: ${util.inspect(oldContext)}`);
        enrich(oldContext, (err, context) => {
            if (err) next(err);
            else {
                debug(`enrich sending new context: ${util.inspect(context)}`);
                const oldContext = update[sessionPath[0]];
                // update context in place by setting the first property on path to context
                update[sessionPath[0]] = R.set(
                    R.lensPath(sessionPath.splice(1)),
                    context,
                    oldContext);
                next();
            }
        });
    };
};

module.exports = {EnrichIncomingWare};

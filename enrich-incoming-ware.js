const Enrich = require('./Enrich');
const R = require('ramda');
const debug = require('debug')('botmaster:enrich:incoming');
const util = require('util');

const enrichIncomingWare = ({enrichers, contextPath = 'context', params = {}}) =>
    (update, bot, next) => {
        const enrich = Enrich(R.merge(params, update));
        contextPath = contextPath.split('.');
        const lensContext = R.lensPath(contextPath);
        const oldContext = R.compose(
            R.defaultTo({}),
            R.view(lensContext)
        )(update);
        debug(`enrich recieved update: ${util.inspect(update)}`);
        debug(`enrich got context: ${util.inspect(oldContext)}`);
        enrich(enrichers, oldContext, (err, context) => {
            if (err) next(err);
            else {
                debug(`enrich sending new context: ${util.inspect(context)}`);
                const oldContext = update[contextPath[0]];
                // update context in place by setting the first property on path to context
                update[contextPath[0]] = R.set(
                    R.lensPath(contextPath.splice(1)),
                    context,
                    oldContext);
                next();
            }
        });
    };

module.exports = {enrichIncomingWare};

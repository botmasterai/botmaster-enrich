const {map, nextTick} = require('async');
const R = require('ramda');
const Cache = require('node-cache');
const {named, isSync} = require('./utils');
const debug = require('debug')('botmaster:enrich');

/**
 * Run the given enrichers with context and update the given old context. Return using the callback.
 * @param  {object} enrichers  an object where key is the name of the enricher and the value is the enricher object which must specifiy controller
 * @param  {object} context     an object that is provided to the enrichers as way for users to provide extra functions or context to their enricher controllers
 * @param  {object} oldContext the context to enrich
 * @param  {function} callback the callback to return error or new context (object).
 */
const Enrich = (params = {}) => {
    const cache = new Cache({
        useClones: false
    });
    return (enrichers, context, callback) => {
        params.context = context;
        enrichers = named(enrichers);
        debug(`running ${enrichers.length} enrichers`);
        map(
        enrichers,
        (enricher, innerCb) => {
            // use the cache if the enricher specifies it
            if (enricher.cache) {
                cache.get(enricher.name, (err, value) => {
                    if (!err && value) {
                        return innerCb(null, value);
                    } else {
                        innerCb = (err, response) => {
                            if (!err) {
                                // save cache (taking into account time to live spec if it exists)
                                if (enricher.ttl)
                                    cache.set(enricher.name, response, enricher.ttl);
                                else
                                    cache.set(enricher.name, response);
                            }
                            innerCb(err, response);
                        };
                    }
                });
            }
            const result = enricher.controller(params, innerCb);
            if (result && typeof result.then ==  'function') {
                debug(`${enricher.name} is a promise`);
                result
                    .then( response => innerCb(null, response))
                    .catch(innerCb);
            } else if (isSync(result)) {
                debug(`${enricher.name} is sync`);
                nextTick( () => innerCb(null, result) );
            } else {
                debug(`${enricher.name} is async`);
            }
        },
        // when all the enrichers have been run merge them all together with the old context
        (err, newContexts) => {
            if (err) callback(err);
            newContexts.unshift(context);
            const newContext = R.mergeAll(newContexts);
            callback(null, newContext);
        });
    };
};

module.exports = Enrich;

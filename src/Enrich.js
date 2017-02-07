const {map, nextTick} = require('async');
const R = require('ramda');
const Cache = require('node-cache');
const {named, isSync} = require('./utils');
const debug = require('debug')('botmaster:enrich');

/**
 * Run the given enrichers with context and update the given old context. Return using the callback.
 * @param  {object} options options for the created middleware
 * @param  {object} options.enrichers enrichers to run on the new context
 * @param  {object} [options.params] merged with the standard params passed to enricher controller
 * @returns {enrich} a function that can enrich context
 */
const Enrich = (options) => {
    const cache = new Cache({
        useClones: false
    });
    const enrichers = named(options.enrichers);

    /**
     * Used to enrich a context
     * @param  {Object}   context  context to enrich
     * @param  {Function} callback error first callback, returns enriched context
     * @name enrich
     * @type enrich
     */
    return (context, callback) => {
        options.context = context;
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
                const params = {};
                if (options.params) {
                    for (let prop in options.params) {
                        params[prop] = options.params[prop];
                    }
                }
                params.context = R.clone(context);
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
            }
        );
    };
};

module.exports = {Enrich};

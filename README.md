[![Build Status](https://travis-ci.org/botmasterai/botmaster-enrich.svg?branch=master)](https://travis-ci.org/botmasterai/botmaster-enrich)
[![Coverage Status](https://coveralls.io/repos/github/botmasterai/botmaster-enrich/badge.svg?branch=master)](https://coveralls.io/github/botmasterai/botmaster-enrich?branch=master)

# Enrich NLU contexts

Battle-tested middleware for botmaster <http://botmasterai.com/>).

## Introduction

-   similar API to 'fulfill' middleware
-   allows caching of responses
-   manages merging
-   stuff anything else you need in your enrichers in params
-   callbacks, promises, and sync returns supported in controllers

## Use cases

-   Scrapping websites for hours or telephone numbers to provide to bot
-   Validating user input

## API

### Enricher

#### Enricher Spec

The enricher spec is an object that describes an enricher

| Parameter  | Description                                                                                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| controller | Function a controller that can return error last callback, a promise or sync. Called with `(params, calback)`. Its result will be merged with the results from other controllers and the old context. |
| cache      | Boolean whether or not to cache the result                                                                                                                                                            |
| ttl        | Integer if caching how long the result should stay cached in milliseconds                                                                                                                             |

#### Enricher controller params

The following properties are available in `params`.

| Parameter | Description                         |
| --------- | ----------------------------------- |
| context   | the current context                 |
| update    | in botmaster the update is provided |
| bot       | in botmaster the bot is provided    |

### Botmaster Ware

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Enrich

Run the given enrichers with context and update the given old context. Return using the callback.

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** options for the created middleware
    -   `options.enrichers` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** enrichers to run on the new context
    -   `options.params` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** merged with the standard params passed to enricher controller

Returns **[enrich](#enrich)** a function that can enrich context

#### enrich

Used to enrich a context

**Parameters**

-   `context` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** context to enrich
-   `callback` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** error first callback, returns enriched context

#### EnrichIncomingWare

Factory function to generate incoming ware for enrich

**Parameters**

-   `$0` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** options
    -   `$0.enrichers` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** an object of enrichers
    -   `$0.sessionPath` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?** dot denoted path find the context in the update. defaults to 'context'
    -   `$0.params` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** optional additional params to pass to enrichers

Returns **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** botmaster middleware

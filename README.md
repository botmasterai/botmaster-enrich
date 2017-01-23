Enrich conversation contexts

# Introduction
 - similar API to 'fulfill' function
 - allows caching of responses
 - manages merging
 - stuff anything else you need in your enrichers in params
 - callbacks, promises, and sync returns supported in controllers

## Use cases

 - Scrapping websites for hours or telephone numbers to provide to bot
 - Validating user input

##  Usage

## with botmaster

```js
const {enrichIncomingWare} = require('botmaster-enrich');
const Botmaster = require('botmaster');
const botmasterSettings = require('./myBotmasterSettings');

const enrichers = {
    hi: {
        controller: () => ({greeting: 'hi'})
    }
};

const botmaster = new Botmaster(botmasterSettings);
botmaster.use('incoming', enrichIncomingWare({enrichers}));
```
## Standalone

```js
const {Enrich} = require('botmaster-enrich');
const enrichers = {
    hi: {
        controller: () => ({greeting: 'hi'})
    }
};
const context = {};
enrich(enrichers, context, (err, result) => {
    if (err) return done(err);
    result.greeting.should.equal('hi');
    done();
});
```

# Examples

## Providing easy-to-use date representations to NLU

TODO

In this use case its useful to use the caching feature
```js
const timeEnricherSpec = {
    controller: getTime,
    cache: true,
    ttl: 1 // cache for 1 second
};

function getTime() {
/**
*    returns something like: {
*        hour: 5,
*        minute: 12,
*        weekday: 'Saturday'
*    }
*/
}
```

## Validating User Input

Say that we have a context that represents a form:
```js
context = {
    form:  {
        valid: false,
        error: null,
        fields: [
            {
                name: 'id'
                value: null,
                validated: false,
                expected: true
            },
                name: 'date',
                value: null
                validated: false,
                expected: false
            }
        ]
    }
}
```
The best way to generate this context would be using `botmaster-fulfill` with tags like the following:

```xml
"Sure let's get started.<prepareForm /><pause />First I'll need your ID.<expect name='id' />"
```

Then We can use the following enricher to validate user input and mark the result in the form.
 ```js
 const R = require('ramda');
 const request = require('request-promise');

 const ID_REGEX = /\d+/;

 const validUserInputEnricher = {
     controller: params => {
         if (params.context.form) {
             const expectedField = R.find(R.propEq('expected', true), params.context.form);

             if (expectedField) {
                 let promise;
                 switch(expectedField.name) {
                     case 'id':
                         promise = findAndValidateId(params.update.message.text)
                 }
                 return promise.then( {value, valid, error} => {
                     expectedField.value = value;
                     expectedField.valid = valid;
                     if (error) form.error = error;
                     if (R.all(R.propEq('valid', true), ))
                     return {form: expectedField};
                 })
             }
         }
         return {};
     }
 }

 function findAndValidateId(text) {
     match = text.match(ID_REGEX);
     if (match) {
        return request({
            method: 'POST',
            url: 'https://myServiceProvidingIDs/sessions',
            body: match,
        }).then( () => {
            return {valid: true, value: match};
        }).catch( err => {
            if (err.statusCode == 404)
                return {valid: false, value: match, error: 'Sorry that ID does not exist'};
            else return  {valid: false, value: match, error: 'Sorry the service is down, please try  again later.'};
        })
    } else {
        return {valid: false, value: null};
    }

 }
 ```

 Now the context could be:
 ```js
 context = {
     form:  {
         valid: false,
         error: null,
         fields: [
             {
                 name: 'id'
                 value: 1234,
                 validated: true,
                 expected: false
             },
                 name: 'date',
                 value: null
                 validated: false,
                 expected: false
             }
         ]
     }
 }
 ```
 This is very convenient to use in IBM Conversation for example.

 In order to continue conversation checks
 ```
 context.form.error == true
 ```
 If there is an error it displays it before continuing.

 At the end `context.form.valid` will be marked true and conversation can intitiate an action using the form data.

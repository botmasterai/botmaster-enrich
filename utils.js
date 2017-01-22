const R = require('ramda');

/**
 * Turn an object into a list by taking the key and putting it into subobjects using propname
 * @type {function}
 */
const listFromObject = R.curry((keyPropName, obj) => {
    const list = [];
    R.mapObjIndexed((value, key) => {
        value[keyPropName] = key;
        list.push(value);
    }, obj);
    return list;
});

const named = listFromObject('name');
const isObjLiteral = val => val ? val.constructor === {}.constructor : false;
const isSync = R.allPass([R.compose(R.not, R.isNil), isObjLiteral ]);

module.exports = {
    named,
    isSync
};

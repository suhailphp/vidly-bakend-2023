'use strict';
var xssFilters = require('xss-filters');
module.exports.fixObject = function (body) {
    return fixIt(body)
};
function fixIt(obj) {
    if (typeof obj == 'string') {
        return action(obj);
    }
    else if (typeof obj == 'object') {
        for (let key in obj) {
            if(typeof obj[key] == 'object'){
                obj[key] = fixIt(obj[key])
            }else if(typeof obj[key] == 'string'){
                obj[key] = action(obj[key])
            }
        }
        return obj;
    }
};
function action(string){
    return xssFilters.inHTMLData(string)
}

const { v4: uuidv4 } = require('uuid');

module.exports.createUniqueId =async () => {
     let uniqueId = uuidv4().replace(/-/g, '');
     return uniqueId = uniqueId.slice(0, 6);
};
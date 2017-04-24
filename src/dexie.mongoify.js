var dexie = require('dexie');
const ZangoCollection = require('./zango/collection');

dexie.addons.push(function(db) {

  db._getConn = function(cb) {
    cb(null, this.backendDB());
  }

  dexie.prototype.collection = function collection(collectionName) {
    return new ZangoCollection(db, collectionName);
  };

  Object.assign(db.Table.prototype, ZangoCollection.prototype);
});

module.exports = dexie;

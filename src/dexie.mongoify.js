var dexie = require('dexie');
const ZangoCollection = require('./zango/collection');

dexie.Collection = ZangoCollection;

dexie.addons.push(function(db) {

  db._getConn = function(cb) {
    db.open().then(() => {
      cb(null, this.backendDB());
    });
  }

  dexie.prototype.collection = function collection(collectionName) {
    return new ZangoCollection(db, collectionName);
  };

  Object.assign(db.Table.prototype, ZangoCollection.prototype);
});

module.exports = dexie;

var dexie = require("expose-loader?Dexie!dexie");

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

  // patch insert to do an upsert
  // this fixes an issue when integrating with dexie-observable
  ZangoCollection.prototype.insert = (function(oldInsert) {
    return function(doc) {
      const keyPath = db[this._name].schema.primKey.keyPath
      return db[this._name].get(doc[keyPath]).then((found) => {
        if (found) {
          return this.update({[keyPath]: doc[keyPath]}, doc);
        } else {
          return oldInsert.call(this, doc);
        }
      })
    }
  })(ZangoCollection.prototype.insert);

  Object.assign(db.Table.prototype, ZangoCollection.prototype);
});

module.exports = dexie;

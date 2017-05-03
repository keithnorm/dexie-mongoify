const Fields = require('./lang/fields.js');

const lookup = (next, spec) => (cb) => {
    (function iterate() {
        next((error, doc, idb_cur, idb_transaction) => {
            if (!doc) { cb(error); }
            else {
              let objectStore = idb_transaction.objectStore(spec.from);
              if (spec.foreignField != objectStore.keyPath) {
                objectStore = objectStore.index(spec.foreignField);
              }
              const request = objectStore.get(doc[spec.localField]);
              request.onerror = function(event) {
                cb(new Error(event.target.errorCode));
              };
              request.onsuccess = (event) => {
                doc[spec.as] = [event.target.result];
                cb(null, doc, idb_cur);
              }
            }
        });
    })();
};

module.exports = lookup;

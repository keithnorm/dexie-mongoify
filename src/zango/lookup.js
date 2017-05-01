const Fields = require('./lang/fields.js');

const lookup = (next, spec) => (cb) => {
    (function iterate() {
        next((error, doc, idb_cur, idb_transaction) => {
            if (!doc) { cb(error); }
            else if (true) {
              const objectStore = idb_transaction.objectStore(spec.from);
              const request = objectStore.get(doc[spec.localField]).index(spec.foreignField);
              request.onerror = function(event) {
                cb(new Error(event.target.errorCode));
              };
              request.onsuccess = (event) => {
                doc[spec.as] = event.target.result;
                cb(null, doc, idb_cur);
              }
            } else { iterate(); }
        });
    })();
};

module.exports = lookup;

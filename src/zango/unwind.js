import clone from 'clone';
const { toPathPieces, get } = require('./util.js');

module.exports = (_next, path) => {
    const path_pieces = toPathPieces(path.substring(1)),
          elements = [],
          fn = cb => cb(null, elements.pop());

    const onDoc = (doc, cb) => {
        const old_length = elements.length;

        get(doc, path_pieces, (obj, field) => {
            const new_elements = obj[field];
            if (!new_elements) { return; }

            if (new_elements[Symbol.iterator]) {
                for (let element of new_elements) {
                    const objClone = clone(obj);
                    objClone[field] = element;
                    elements.push(objClone);
                }
            }
        });

        if (old_length === elements.length) {
            return next(cb);
        }

        fn(cb);
    };

    let next = (cb) => {
        _next((error, doc) => {
            if (error) { cb(error); }
            else if (doc) { onDoc(doc, cb); }
            else { (next = fn)(cb); }
        });
    };

    return cb => next(cb);
};

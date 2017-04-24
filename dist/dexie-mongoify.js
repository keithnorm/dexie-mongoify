(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var dexie = __webpack_require__(1);
	var ZangoCollection = __webpack_require__(5);

	dexie.addons.push(function (db) {

	  db._getConn = function (cb) {
	    cb(null, this.backendDB());
	  };

	  dexie.prototype.collection = function collection(collectionName) {
	    return new ZangoCollection(db, collectionName);
	  };

	  Object.assign(db.Table.prototype, ZangoCollection.prototype);
	});

	module.exports = dexie;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, setImmediate) {(function (global, factory) {
	    true ? module.exports = factory() :
	   typeof define === 'function' && define.amd ? define(factory) :
	   (global.Dexie = factory());
	}(this, (function () { 'use strict';

	/*
	* Dexie.js - a minimalistic wrapper for IndexedDB
	* ===============================================
	*
	* By David Fahlander, david.fahlander@gmail.com
	*
	* Version 1.5.1, Tue Nov 01 2016
	* www.dexie.com
	* Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
	*/
	var keys = Object.keys;
	var isArray = Array.isArray;
	var _global = typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global;

	function extend(obj, extension) {
	    if (typeof extension !== 'object') return obj;
	    keys(extension).forEach(function (key) {
	        obj[key] = extension[key];
	    });
	    return obj;
	}

	var getProto = Object.getPrototypeOf;
	var _hasOwn = {}.hasOwnProperty;
	function hasOwn(obj, prop) {
	    return _hasOwn.call(obj, prop);
	}

	function props(proto, extension) {
	    if (typeof extension === 'function') extension = extension(getProto(proto));
	    keys(extension).forEach(function (key) {
	        setProp(proto, key, extension[key]);
	    });
	}

	function setProp(obj, prop, functionOrGetSet, options) {
	    Object.defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ? { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } : { value: functionOrGetSet, configurable: true, writable: true }, options));
	}

	function derive(Child) {
	    return {
	        from: function (Parent) {
	            Child.prototype = Object.create(Parent.prototype);
	            setProp(Child.prototype, "constructor", Child);
	            return {
	                extend: props.bind(null, Child.prototype)
	            };
	        }
	    };
	}

	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	function getPropertyDescriptor(obj, prop) {
	    var pd = getOwnPropertyDescriptor(obj, prop),
	        proto;
	    return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
	}

	var _slice = [].slice;
	function slice(args, start, end) {
	    return _slice.call(args, start, end);
	}

	function override(origFunc, overridedFactory) {
	    return overridedFactory(origFunc);
	}

	function doFakeAutoComplete(fn) {
	    var to = setTimeout(fn, 1000);
	    clearTimeout(to);
	}

	function assert(b) {
	    if (!b) throw new Error("Assertion Failed");
	}

	function asap(fn) {
	    if (_global.setImmediate) setImmediate(fn);else setTimeout(fn, 0);
	}



	/** Generate an object (hash map) based on given array.
	 * @param extractor Function taking an array item and its index and returning an array of 2 items ([key, value]) to
	 *        instert on the resulting object for each item in the array. If this function returns a falsy value, the
	 *        current item wont affect the resulting object.
	 */
	function arrayToObject(array, extractor) {
	    return array.reduce(function (result, item, i) {
	        var nameAndValue = extractor(item, i);
	        if (nameAndValue) result[nameAndValue[0]] = nameAndValue[1];
	        return result;
	    }, {});
	}

	function trycatcher(fn, reject) {
	    return function () {
	        try {
	            fn.apply(this, arguments);
	        } catch (e) {
	            reject(e);
	        }
	    };
	}

	function tryCatch(fn, onerror, args) {
	    try {
	        fn.apply(null, args);
	    } catch (ex) {
	        onerror && onerror(ex);
	    }
	}

	function getByKeyPath(obj, keyPath) {
	    // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
	    if (hasOwn(obj, keyPath)) return obj[keyPath]; // This line is moved from last to first for optimization purpose.
	    if (!keyPath) return obj;
	    if (typeof keyPath !== 'string') {
	        var rv = [];
	        for (var i = 0, l = keyPath.length; i < l; ++i) {
	            var val = getByKeyPath(obj, keyPath[i]);
	            rv.push(val);
	        }
	        return rv;
	    }
	    var period = keyPath.indexOf('.');
	    if (period !== -1) {
	        var innerObj = obj[keyPath.substr(0, period)];
	        return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
	    }
	    return undefined;
	}

	function setByKeyPath(obj, keyPath, value) {
	    if (!obj || keyPath === undefined) return;
	    if ('isFrozen' in Object && Object.isFrozen(obj)) return;
	    if (typeof keyPath !== 'string' && 'length' in keyPath) {
	        assert(typeof value !== 'string' && 'length' in value);
	        for (var i = 0, l = keyPath.length; i < l; ++i) {
	            setByKeyPath(obj, keyPath[i], value[i]);
	        }
	    } else {
	        var period = keyPath.indexOf('.');
	        if (period !== -1) {
	            var currentKeyPath = keyPath.substr(0, period);
	            var remainingKeyPath = keyPath.substr(period + 1);
	            if (remainingKeyPath === "") {
	                if (value === undefined) delete obj[currentKeyPath];else obj[currentKeyPath] = value;
	            } else {
	                var innerObj = obj[currentKeyPath];
	                if (!innerObj) innerObj = obj[currentKeyPath] = {};
	                setByKeyPath(innerObj, remainingKeyPath, value);
	            }
	        } else {
	            if (value === undefined) delete obj[keyPath];else obj[keyPath] = value;
	        }
	    }
	}

	function delByKeyPath(obj, keyPath) {
	    if (typeof keyPath === 'string') setByKeyPath(obj, keyPath, undefined);else if ('length' in keyPath) [].map.call(keyPath, function (kp) {
	        setByKeyPath(obj, kp, undefined);
	    });
	}

	function shallowClone(obj) {
	    var rv = {};
	    for (var m in obj) {
	        if (hasOwn(obj, m)) rv[m] = obj[m];
	    }
	    return rv;
	}

	function deepClone(any) {
	    if (!any || typeof any !== 'object') return any;
	    var rv;
	    if (isArray(any)) {
	        rv = [];
	        for (var i = 0, l = any.length; i < l; ++i) {
	            rv.push(deepClone(any[i]));
	        }
	    } else if (any instanceof Date) {
	        rv = new Date();
	        rv.setTime(any.getTime());
	    } else {
	        rv = any.constructor ? Object.create(any.constructor.prototype) : {};
	        for (var prop in any) {
	            if (hasOwn(any, prop)) {
	                rv[prop] = deepClone(any[prop]);
	            }
	        }
	    }
	    return rv;
	}

	function getObjectDiff(a, b, rv, prfx) {
	    // Compares objects a and b and produces a diff object.
	    rv = rv || {};
	    prfx = prfx || '';
	    keys(a).forEach(function (prop) {
	        if (!hasOwn(b, prop)) rv[prfx + prop] = undefined; // Property removed
	        else {
	                var ap = a[prop],
	                    bp = b[prop];
	                if (typeof ap === 'object' && typeof bp === 'object' && ap && bp && ap.constructor === bp.constructor)
	                    // Same type of object but its properties may have changed
	                    getObjectDiff(ap, bp, rv, prfx + prop + ".");else if (ap !== bp) rv[prfx + prop] = b[prop]; // Primitive value changed
	            }
	    });
	    keys(b).forEach(function (prop) {
	        if (!hasOwn(a, prop)) {
	            rv[prfx + prop] = b[prop]; // Property added
	        }
	    });
	    return rv;
	}

	// If first argument is iterable or array-like, return it as an array
	var iteratorSymbol = typeof Symbol !== 'undefined' && Symbol.iterator;
	var getIteratorOf = iteratorSymbol ? function (x) {
	    var i;
	    return x != null && (i = x[iteratorSymbol]) && i.apply(x);
	} : function () {
	    return null;
	};

	var NO_CHAR_ARRAY = {};
	// Takes one or several arguments and returns an array based on the following criteras:
	// * If several arguments provided, return arguments converted to an array in a way that
	//   still allows javascript engine to optimize the code.
	// * If single argument is an array, return a clone of it.
	// * If this-pointer equals NO_CHAR_ARRAY, don't accept strings as valid iterables as a special
	//   case to the two bullets below.
	// * If single argument is an iterable, convert it to an array and return the resulting array.
	// * If single argument is array-like (has length of type number), convert it to an array.
	function getArrayOf(arrayLike) {
	    var i, a, x, it;
	    if (arguments.length === 1) {
	        if (isArray(arrayLike)) return arrayLike.slice();
	        if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string') return [arrayLike];
	        if (it = getIteratorOf(arrayLike)) {
	            a = [];
	            while (x = it.next(), !x.done) {
	                a.push(x.value);
	            }return a;
	        }
	        if (arrayLike == null) return [arrayLike];
	        i = arrayLike.length;
	        if (typeof i === 'number') {
	            a = new Array(i);
	            while (i--) {
	                a[i] = arrayLike[i];
	            }return a;
	        }
	        return [arrayLike];
	    }
	    i = arguments.length;
	    a = new Array(i);
	    while (i--) {
	        a[i] = arguments[i];
	    }return a;
	}

	var concat = [].concat;
	function flatten(a) {
	    return concat.apply([], a);
	}

	function nop() {}
	function mirror(val) {
	    return val;
	}
	function pureFunctionChain(f1, f2) {
	    // Enables chained events that takes ONE argument and returns it to the next function in chain.
	    // This pattern is used in the hook("reading") event.
	    if (f1 == null || f1 === mirror) return f2;
	    return function (val) {
	        return f2(f1(val));
	    };
	}

	function callBoth(on1, on2) {
	    return function () {
	        on1.apply(this, arguments);
	        on2.apply(this, arguments);
	    };
	}

	function hookCreatingChain(f1, f2) {
	    // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
	    // This pattern is used in the hook("creating") event.
	    if (f1 === nop) return f2;
	    return function () {
	        var res = f1.apply(this, arguments);
	        if (res !== undefined) arguments[0] = res;
	        var onsuccess = this.onsuccess,
	            // In case event listener has set this.onsuccess
	        onerror = this.onerror; // In case event listener has set this.onerror
	        this.onsuccess = null;
	        this.onerror = null;
	        var res2 = f2.apply(this, arguments);
	        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
	        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
	        return res2 !== undefined ? res2 : res;
	    };
	}

	function hookDeletingChain(f1, f2) {
	    if (f1 === nop) return f2;
	    return function () {
	        f1.apply(this, arguments);
	        var onsuccess = this.onsuccess,
	            // In case event listener has set this.onsuccess
	        onerror = this.onerror; // In case event listener has set this.onerror
	        this.onsuccess = this.onerror = null;
	        f2.apply(this, arguments);
	        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
	        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
	    };
	}

	function hookUpdatingChain(f1, f2) {
	    if (f1 === nop) return f2;
	    return function (modifications) {
	        var res = f1.apply(this, arguments);
	        extend(modifications, res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.
	        var onsuccess = this.onsuccess,
	            // In case event listener has set this.onsuccess
	        onerror = this.onerror; // In case event listener has set this.onerror
	        this.onsuccess = null;
	        this.onerror = null;
	        var res2 = f2.apply(this, arguments);
	        if (onsuccess) this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
	        if (onerror) this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
	        return res === undefined ? res2 === undefined ? undefined : res2 : extend(res, res2);
	    };
	}

	function reverseStoppableEventChain(f1, f2) {
	    if (f1 === nop) return f2;
	    return function () {
	        if (f2.apply(this, arguments) === false) return false;
	        return f1.apply(this, arguments);
	    };
	}



	function promisableChain(f1, f2) {
	    if (f1 === nop) return f2;
	    return function () {
	        var res = f1.apply(this, arguments);
	        if (res && typeof res.then === 'function') {
	            var thiz = this,
	                i = arguments.length,
	                args = new Array(i);
	            while (i--) {
	                args[i] = arguments[i];
	            }return res.then(function () {
	                return f2.apply(thiz, args);
	            });
	        }
	        return f2.apply(this, arguments);
	    };
	}

	// By default, debug will be true only if platform is a web platform and its page is served from localhost.
	// When debug = true, error's stacks will contain asyncronic long stacks.
	var debug = typeof location !== 'undefined' &&
	// By default, use debug mode if served from localhost.
	/^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);

	function setDebug(value, filter) {
	    debug = value;
	    libraryFilter = filter;
	}

	var libraryFilter = function () {
	    return true;
	};

	var NEEDS_THROW_FOR_STACK = !new Error("").stack;

	function getErrorWithStack() {
	    "use strict";

	    if (NEEDS_THROW_FOR_STACK) try {
	        // Doing something naughty in strict mode here to trigger a specific error
	        // that can be explicitely ignored in debugger's exception settings.
	        // If we'd just throw new Error() here, IE's debugger's exception settings
	        // will just consider it as "exception thrown by javascript code" which is
	        // something you wouldn't want it to ignore.
	        getErrorWithStack.arguments;
	        throw new Error(); // Fallback if above line don't throw.
	    } catch (e) {
	        return e;
	    }
	    return new Error();
	}

	function prettyStack(exception, numIgnoredFrames) {
	    var stack = exception.stack;
	    if (!stack) return "";
	    numIgnoredFrames = numIgnoredFrames || 0;
	    if (stack.indexOf(exception.name) === 0) numIgnoredFrames += (exception.name + exception.message).split('\n').length;
	    return stack.split('\n').slice(numIgnoredFrames).filter(libraryFilter).map(function (frame) {
	        return "\n" + frame;
	    }).join('');
	}

	function deprecated(what, fn) {
	    return function () {
	        console.warn(what + " is deprecated. See https://github.com/dfahlander/Dexie.js/wiki/Deprecations. " + prettyStack(getErrorWithStack(), 1));
	        return fn.apply(this, arguments);
	    };
	}

	var dexieErrorNames = ['Modify', 'Bulk', 'OpenFailed', 'VersionChange', 'Schema', 'Upgrade', 'InvalidTable', 'MissingAPI', 'NoSuchDatabase', 'InvalidArgument', 'SubTransaction', 'Unsupported', 'Internal', 'DatabaseClosed', 'IncompatiblePromise'];

	var idbDomErrorNames = ['Unknown', 'Constraint', 'Data', 'TransactionInactive', 'ReadOnly', 'Version', 'NotFound', 'InvalidState', 'InvalidAccess', 'Abort', 'Timeout', 'QuotaExceeded', 'Syntax', 'DataClone'];

	var errorList = dexieErrorNames.concat(idbDomErrorNames);

	var defaultTexts = {
	    VersionChanged: "Database version changed by other database connection",
	    DatabaseClosed: "Database has been closed",
	    Abort: "Transaction aborted",
	    TransactionInactive: "Transaction has already completed or failed"
	};

	//
	// DexieError - base class of all out exceptions.
	//
	function DexieError(name, msg) {
	    // Reason we don't use ES6 classes is because:
	    // 1. It bloats transpiled code and increases size of minified code.
	    // 2. It doesn't give us much in this case.
	    // 3. It would require sub classes to call super(), which
	    //    is not needed when deriving from Error.
	    this._e = getErrorWithStack();
	    this.name = name;
	    this.message = msg;
	}

	derive(DexieError).from(Error).extend({
	    stack: {
	        get: function () {
	            return this._stack || (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
	        }
	    },
	    toString: function () {
	        return this.name + ": " + this.message;
	    }
	});

	function getMultiErrorMessage(msg, failures) {
	    return msg + ". Errors: " + failures.map(function (f) {
	        return f.toString();
	    }).filter(function (v, i, s) {
	        return s.indexOf(v) === i;
	    }) // Only unique error strings
	    .join('\n');
	}

	//
	// ModifyError - thrown in WriteableCollection.modify()
	// Specific constructor because it contains members failures and failedKeys.
	//
	function ModifyError(msg, failures, successCount, failedKeys) {
	    this._e = getErrorWithStack();
	    this.failures = failures;
	    this.failedKeys = failedKeys;
	    this.successCount = successCount;
	}
	derive(ModifyError).from(DexieError);

	function BulkError(msg, failures) {
	    this._e = getErrorWithStack();
	    this.name = "BulkError";
	    this.failures = failures;
	    this.message = getMultiErrorMessage(msg, failures);
	}
	derive(BulkError).from(DexieError);

	//
	//
	// Dynamically generate error names and exception classes based
	// on the names in errorList.
	//
	//

	// Map of {ErrorName -> ErrorName + "Error"}
	var errnames = errorList.reduce(function (obj, name) {
	    return obj[name] = name + "Error", obj;
	}, {});

	// Need an alias for DexieError because we're gonna create subclasses with the same name.
	var BaseException = DexieError;
	// Map of {ErrorName -> exception constructor}
	var exceptions = errorList.reduce(function (obj, name) {
	    // Let the name be "DexieError" because this name may
	    // be shown in call stack and when debugging. DexieError is
	    // the most true name because it derives from DexieError,
	    // and we cannot change Function.name programatically without
	    // dynamically create a Function object, which would be considered
	    // 'eval-evil'.
	    var fullName = name + "Error";
	    function DexieError(msgOrInner, inner) {
	        this._e = getErrorWithStack();
	        this.name = fullName;
	        if (!msgOrInner) {
	            this.message = defaultTexts[name] || fullName;
	            this.inner = null;
	        } else if (typeof msgOrInner === 'string') {
	            this.message = msgOrInner;
	            this.inner = inner || null;
	        } else if (typeof msgOrInner === 'object') {
	            this.message = msgOrInner.name + ' ' + msgOrInner.message;
	            this.inner = msgOrInner;
	        }
	    }
	    derive(DexieError).from(BaseException);
	    obj[name] = DexieError;
	    return obj;
	}, {});

	// Use ECMASCRIPT standard exceptions where applicable:
	exceptions.Syntax = SyntaxError;
	exceptions.Type = TypeError;
	exceptions.Range = RangeError;

	var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
	    obj[name + "Error"] = exceptions[name];
	    return obj;
	}, {});

	function mapError(domError, message) {
	    if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name]) return domError;
	    var rv = new exceptionMap[domError.name](message || domError.message, domError);
	    if ("stack" in domError) {
	        // Derive stack from inner exception if it has a stack
	        setProp(rv, "stack", { get: function () {
	                return this.inner.stack;
	            } });
	    }
	    return rv;
	}

	var fullNameExceptions = errorList.reduce(function (obj, name) {
	    if (["Syntax", "Type", "Range"].indexOf(name) === -1) obj[name + "Error"] = exceptions[name];
	    return obj;
	}, {});

	fullNameExceptions.ModifyError = ModifyError;
	fullNameExceptions.DexieError = DexieError;
	fullNameExceptions.BulkError = BulkError;

	function Events(ctx) {
	    var evs = {};
	    var rv = function (eventName, subscriber) {
	        if (subscriber) {
	            // Subscribe. If additional arguments than just the subscriber was provided, forward them as well.
	            var i = arguments.length,
	                args = new Array(i - 1);
	            while (--i) {
	                args[i - 1] = arguments[i];
	            }evs[eventName].subscribe.apply(null, args);
	            return ctx;
	        } else if (typeof eventName === 'string') {
	            // Return interface allowing to fire or unsubscribe from event
	            return evs[eventName];
	        }
	    };
	    rv.addEventType = add;

	    for (var i = 1, l = arguments.length; i < l; ++i) {
	        add(arguments[i]);
	    }

	    return rv;

	    function add(eventName, chainFunction, defaultFunction) {
	        if (typeof eventName === 'object') return addConfiguredEvents(eventName);
	        if (!chainFunction) chainFunction = reverseStoppableEventChain;
	        if (!defaultFunction) defaultFunction = nop;

	        var context = {
	            subscribers: [],
	            fire: defaultFunction,
	            subscribe: function (cb) {
	                if (context.subscribers.indexOf(cb) === -1) {
	                    context.subscribers.push(cb);
	                    context.fire = chainFunction(context.fire, cb);
	                }
	            },
	            unsubscribe: function (cb) {
	                context.subscribers = context.subscribers.filter(function (fn) {
	                    return fn !== cb;
	                });
	                context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
	            }
	        };
	        evs[eventName] = rv[eventName] = context;
	        return context;
	    }

	    function addConfiguredEvents(cfg) {
	        // events(this, {reading: [functionChain, nop]});
	        keys(cfg).forEach(function (eventName) {
	            var args = cfg[eventName];
	            if (isArray(args)) {
	                add(eventName, cfg[eventName][0], cfg[eventName][1]);
	            } else if (args === 'asap') {
	                // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
	                // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
	                var context = add(eventName, mirror, function fire() {
	                    // Optimazation-safe cloning of arguments into args.
	                    var i = arguments.length,
	                        args = new Array(i);
	                    while (i--) {
	                        args[i] = arguments[i];
	                    } // All each subscriber:
	                    context.subscribers.forEach(function (fn) {
	                        asap(function fireEvent() {
	                            fn.apply(null, args);
	                        });
	                    });
	                });
	            } else throw new exceptions.InvalidArgument("Invalid event config");
	        });
	    }
	}

	//
	// Promise Class for Dexie library
	//
	// I started out writing this Promise class by copying promise-light (https://github.com/taylorhakes/promise-light) by
	// https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
	//
	// Modifications needed to be done to support indexedDB because it wont accept setTimeout()
	// (See discussion: https://github.com/promises-aplus/promises-spec/issues/45) .
	// This topic was also discussed in the following thread: https://github.com/promises-aplus/promises-spec/issues/45
	//
	// This implementation will not use setTimeout or setImmediate when it's not needed. The behavior is 100% Promise/A+ compliant since
	// the caller of new Promise() can be certain that the promise wont be triggered the lines after constructing the promise.
	//
	// In previous versions this was fixed by not calling setTimeout when knowing that the resolve() or reject() came from another
	// tick. In Dexie v1.4.0, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
	// another strategy now that simplifies everything a lot: to always execute callbacks in a new tick, but have an own microTick
	// engine that is used instead of setImmediate() or setTimeout().
	// Promise class has also been optimized a lot with inspiration from bluebird - to avoid closures as much as possible.
	// Also with inspiration from bluebird, asyncronic stacks in debug mode.
	//
	// Specific non-standard features of this Promise class:
	// * Async static context support (Promise.PSD)
	// * Promise.follow() method built upon PSD, that allows user to track all promises created from current stack frame
	//   and below + all promises that those promises creates or awaits.
	// * Detect any unhandled promise in a PSD-scope (PSD.onunhandled).
	//
	// David Fahlander, https://github.com/dfahlander
	//

	// Just a pointer that only this module knows about.
	// Used in Promise constructor to emulate a private constructor.
	var INTERNAL = {};

	// Async stacks (long stacks) must not grow infinitely.
	var LONG_STACKS_CLIP_LIMIT = 100;
	var MAX_LONG_STACKS = 20;
	var stack_being_generated = false;

	/* The default "nextTick" function used only for the very first promise in a promise chain.
	   As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
	   emulated in this module. For indexedDB compatibility, this means that every method needs to
	   execute at least one promise before doing an indexedDB operation. Dexie will always call
	   db.ready().then() for every operation to make sure the indexedDB event is started in an
	   emulated micro tick.
	*/
	var schedulePhysicalTick = _global.setImmediate ?
	// setImmediate supported. Those modern platforms also supports Function.bind().
	setImmediate.bind(null, physicalTick) : _global.MutationObserver ?
	// MutationObserver supported
	function () {
	    var hiddenDiv = document.createElement("div");
	    new MutationObserver(function () {
	        physicalTick();
	        hiddenDiv = null;
	    }).observe(hiddenDiv, { attributes: true });
	    hiddenDiv.setAttribute('i', '1');
	} :
	// No support for setImmediate or MutationObserver. No worry, setTimeout is only called
	// once time. Every tick that follows will be our emulated micro tick.
	// Could have uses setTimeout.bind(null, 0, physicalTick) if it wasnt for that FF13 and below has a bug
	function () {
	    setTimeout(physicalTick, 0);
	};

	// Confifurable through Promise.scheduler.
	// Don't export because it would be unsafe to let unknown
	// code call it unless they do try..catch within their callback.
	// This function can be retrieved through getter of Promise.scheduler though,
	// but users must not do Promise.scheduler (myFuncThatThrows exception)!
	var asap$1 = function (callback, args) {
	    microtickQueue.push([callback, args]);
	    if (needsNewPhysicalTick) {
	        schedulePhysicalTick();
	        needsNewPhysicalTick = false;
	    }
	};

	var isOutsideMicroTick = true;
	var needsNewPhysicalTick = true;
	var unhandledErrors = [];
	var rejectingErrors = [];
	var currentFulfiller = null;
	var rejectionMapper = mirror; // Remove in next major when removing error mapping of DOMErrors and DOMExceptions

	var globalPSD = {
	    global: true,
	    ref: 0,
	    unhandleds: [],
	    onunhandled: globalError,
	    //env: null, // Will be set whenever leaving a scope using wrappers.snapshot()
	    finalize: function () {
	        this.unhandleds.forEach(function (uh) {
	            try {
	                globalError(uh[0], uh[1]);
	            } catch (e) {}
	        });
	    }
	};

	var PSD = globalPSD;

	var microtickQueue = []; // Callbacks to call in this or next physical tick.
	var numScheduledCalls = 0; // Number of listener-calls left to do in this physical tick.
	var tickFinalizers = []; // Finalizers to call when there are no more async calls scheduled within current physical tick.

	// Wrappers are not being used yet. Their framework is functioning and can be used
	// to replace environment during a PSD scope (a.k.a. 'zone').
	/* **KEEP** export var wrappers = (() => {
	    var wrappers = [];

	    return {
	        snapshot: () => {
	            var i = wrappers.length,
	                result = new Array(i);
	            while (i--) result[i] = wrappers[i].snapshot();
	            return result;
	        },
	        restore: values => {
	            var i = wrappers.length;
	            while (i--) wrappers[i].restore(values[i]);
	        },
	        wrap: () => wrappers.map(w => w.wrap()),
	        add: wrapper => {
	            wrappers.push(wrapper);
	        }
	    };
	})();
	*/

	function Promise(fn) {
	    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
	    this._listeners = [];
	    this.onuncatched = nop; // Deprecate in next major. Not needed. Better to use global error handler.

	    // A library may set `promise._lib = true;` after promise is created to make resolve() or reject()
	    // execute the microtask engine implicitely within the call to resolve() or reject().
	    // To remain A+ compliant, a library must only set `_lib=true` if it can guarantee that the stack
	    // only contains library code when calling resolve() or reject().
	    // RULE OF THUMB: ONLY set _lib = true for promises explicitely resolving/rejecting directly from
	    // global scope (event handler, timer etc)!
	    this._lib = false;
	    // Current async scope
	    var psd = this._PSD = PSD;

	    if (debug) {
	        this._stackHolder = getErrorWithStack();
	        this._prev = null;
	        this._numPrev = 0; // Number of previous promises (for long stacks)
	        linkToPreviousPromise(this, currentFulfiller);
	    }

	    if (typeof fn !== 'function') {
	        if (fn !== INTERNAL) throw new TypeError('Not a function');
	        // Private constructor (INTERNAL, state, value).
	        // Used internally by Promise.resolve() and Promise.reject().
	        this._state = arguments[1];
	        this._value = arguments[2];
	        if (this._state === false) handleRejection(this, this._value); // Map error, set stack and addPossiblyUnhandledError().
	        return;
	    }

	    this._state = null; // null (=pending), false (=rejected) or true (=resolved)
	    this._value = null; // error or result
	    ++psd.ref; // Refcounting current scope
	    executePromiseTask(this, fn);
	}

	props(Promise.prototype, {

	    then: function (onFulfilled, onRejected) {
	        var _this = this;

	        var rv = new Promise(function (resolve, reject) {
	            propagateToListener(_this, new Listener(onFulfilled, onRejected, resolve, reject));
	        });
	        debug && (!this._prev || this._state === null) && linkToPreviousPromise(rv, this);
	        return rv;
	    },

	    _then: function (onFulfilled, onRejected) {
	        // A little tinier version of then() that don't have to create a resulting promise.
	        propagateToListener(this, new Listener(null, null, onFulfilled, onRejected));
	    },

	    catch: function (onRejected) {
	        if (arguments.length === 1) return this.then(null, onRejected);
	        // First argument is the Error type to catch
	        var type = arguments[0],
	            handler = arguments[1];
	        return typeof type === 'function' ? this.then(null, function (err) {
	            return (
	                // Catching errors by its constructor type (similar to java / c++ / c#)
	                // Sample: promise.catch(TypeError, function (e) { ... });
	                err instanceof type ? handler(err) : PromiseReject(err)
	            );
	        }) : this.then(null, function (err) {
	            return (
	                // Catching errors by the error.name property. Makes sense for indexedDB where error type
	                // is always DOMError but where e.name tells the actual error type.
	                // Sample: promise.catch('ConstraintError', function (e) { ... });
	                err && err.name === type ? handler(err) : PromiseReject(err)
	            );
	        });
	    },

	    finally: function (onFinally) {
	        return this.then(function (value) {
	            onFinally();
	            return value;
	        }, function (err) {
	            onFinally();
	            return PromiseReject(err);
	        });
	    },

	    // Deprecate in next major. Needed only for db.on.error.
	    uncaught: function (uncaughtHandler) {
	        var _this2 = this;

	        // Be backward compatible and use "onuncatched" as the event name on this.
	        // Handle multiple subscribers through reverseStoppableEventChain(). If a handler returns `false`, bubbling stops.
	        this.onuncatched = reverseStoppableEventChain(this.onuncatched, uncaughtHandler);
	        // In case caller does this on an already rejected promise, assume caller wants to point out the error to this promise and not
	        // a previous promise. Reason: the prevous promise may lack onuncatched handler.
	        if (this._state === false && unhandledErrors.indexOf(this) === -1) {
	            // Replace unhandled error's destinaion promise with this one!
	            unhandledErrors.some(function (p, i, l) {
	                return p._value === _this2._value && (l[i] = _this2);
	            });
	            // Actually we do this shit because we need to support db.on.error() correctly during db.open(). If we deprecate db.on.error, we could
	            // take away this piece of code as well as the onuncatched and uncaught() method.
	        }
	        return this;
	    },

	    stack: {
	        get: function () {
	            if (this._stack) return this._stack;
	            try {
	                stack_being_generated = true;
	                var stacks = getStack(this, [], MAX_LONG_STACKS);
	                var stack = stacks.join("\nFrom previous: ");
	                if (this._state !== null) this._stack = stack; // Stack may be updated on reject.
	                return stack;
	            } finally {
	                stack_being_generated = false;
	            }
	        }
	    }
	});

	function Listener(onFulfilled, onRejected, resolve, reject) {
	    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	    this.resolve = resolve;
	    this.reject = reject;
	    this.psd = PSD;
	}

	// Promise Static Properties
	props(Promise, {
	    all: function () {
	        var values = getArrayOf.apply(null, arguments); // Supports iterables, implicit arguments and array-like.
	        return new Promise(function (resolve, reject) {
	            if (values.length === 0) resolve([]);
	            var remaining = values.length;
	            values.forEach(function (a, i) {
	                return Promise.resolve(a).then(function (x) {
	                    values[i] = x;
	                    if (! --remaining) resolve(values);
	                }, reject);
	            });
	        });
	    },

	    resolve: function (value) {
	        if (value instanceof Promise) return value;
	        if (value && typeof value.then === 'function') return new Promise(function (resolve, reject) {
	            value.then(resolve, reject);
	        });
	        return new Promise(INTERNAL, true, value);
	    },

	    reject: PromiseReject,

	    race: function () {
	        var values = getArrayOf.apply(null, arguments);
	        return new Promise(function (resolve, reject) {
	            values.map(function (value) {
	                return Promise.resolve(value).then(resolve, reject);
	            });
	        });
	    },

	    PSD: {
	        get: function () {
	            return PSD;
	        },
	        set: function (value) {
	            return PSD = value;
	        }
	    },

	    newPSD: newScope,

	    usePSD: usePSD,

	    scheduler: {
	        get: function () {
	            return asap$1;
	        },
	        set: function (value) {
	            asap$1 = value;
	        }
	    },

	    rejectionMapper: {
	        get: function () {
	            return rejectionMapper;
	        },
	        set: function (value) {
	            rejectionMapper = value;
	        } // Map reject failures
	    },

	    follow: function (fn) {
	        return new Promise(function (resolve, reject) {
	            return newScope(function (resolve, reject) {
	                var psd = PSD;
	                psd.unhandleds = []; // For unhandled standard- or 3rd party Promises. Checked at psd.finalize()
	                psd.onunhandled = reject; // Triggered directly on unhandled promises of this library.
	                psd.finalize = callBoth(function () {
	                    var _this3 = this;

	                    // Unhandled standard or 3rd part promises are put in PSD.unhandleds and
	                    // examined upon scope completion while unhandled rejections in this Promise
	                    // will trigger directly through psd.onunhandled
	                    run_at_end_of_this_or_next_physical_tick(function () {
	                        _this3.unhandleds.length === 0 ? resolve() : reject(_this3.unhandleds[0]);
	                    });
	                }, psd.finalize);
	                fn();
	            }, resolve, reject);
	        });
	    },

	    on: Events(null, { "error": [reverseStoppableEventChain, defaultErrorHandler] // Default to defaultErrorHandler
	    })

	});

	var PromiseOnError = Promise.on.error;
	PromiseOnError.subscribe = deprecated("Promise.on('error')", PromiseOnError.subscribe);
	PromiseOnError.unsubscribe = deprecated("Promise.on('error').unsubscribe", PromiseOnError.unsubscribe);

	/**
	* Take a potentially misbehaving resolver function and make sure
	* onFulfilled and onRejected are only called once.
	*
	* Makes no guarantees about asynchrony.
	*/
	function executePromiseTask(promise, fn) {
	    // Promise Resolution Procedure:
	    // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	    try {
	        fn(function (value) {
	            if (promise._state !== null) return;
	            if (value === promise) throw new TypeError('A promise cannot be resolved with itself.');
	            var shouldExecuteTick = promise._lib && beginMicroTickScope();
	            if (value && typeof value.then === 'function') {
	                executePromiseTask(promise, function (resolve, reject) {
	                    value instanceof Promise ? value._then(resolve, reject) : value.then(resolve, reject);
	                });
	            } else {
	                promise._state = true;
	                promise._value = value;
	                propagateAllListeners(promise);
	            }
	            if (shouldExecuteTick) endMicroTickScope();
	        }, handleRejection.bind(null, promise)); // If Function.bind is not supported. Exception is handled in catch below
	    } catch (ex) {
	        handleRejection(promise, ex);
	    }
	}

	function handleRejection(promise, reason) {
	    rejectingErrors.push(reason);
	    if (promise._state !== null) return;
	    var shouldExecuteTick = promise._lib && beginMicroTickScope();
	    reason = rejectionMapper(reason);
	    promise._state = false;
	    promise._value = reason;
	    debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(function () {
	        var origProp = getPropertyDescriptor(reason, "stack");
	        reason._promise = promise;
	        setProp(reason, "stack", {
	            get: function () {
	                return stack_being_generated ? origProp && (origProp.get ? origProp.get.apply(reason) : origProp.value) : promise.stack;
	            }
	        });
	    });
	    // Add the failure to a list of possibly uncaught errors
	    addPossiblyUnhandledError(promise);
	    propagateAllListeners(promise);
	    if (shouldExecuteTick) endMicroTickScope();
	}

	function propagateAllListeners(promise) {
	    //debug && linkToPreviousPromise(promise);
	    var listeners = promise._listeners;
	    promise._listeners = [];
	    for (var i = 0, len = listeners.length; i < len; ++i) {
	        propagateToListener(promise, listeners[i]);
	    }
	    var psd = promise._PSD;
	    --psd.ref || psd.finalize(); // if psd.ref reaches zero, call psd.finalize();
	    if (numScheduledCalls === 0) {
	        // If numScheduledCalls is 0, it means that our stack is not in a callback of a scheduled call,
	        // and that no deferreds where listening to this rejection or success.
	        // Since there is a risk that our stack can contain application code that may
	        // do stuff after this code is finished that may generate new calls, we cannot
	        // call finalizers here.
	        ++numScheduledCalls;
	        asap$1(function () {
	            if (--numScheduledCalls === 0) finalizePhysicalTick(); // Will detect unhandled errors
	        }, []);
	    }
	}

	function propagateToListener(promise, listener) {
	    if (promise._state === null) {
	        promise._listeners.push(listener);
	        return;
	    }

	    var cb = promise._state ? listener.onFulfilled : listener.onRejected;
	    if (cb === null) {
	        // This Listener doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
	        return (promise._state ? listener.resolve : listener.reject)(promise._value);
	    }
	    var psd = listener.psd;
	    ++psd.ref;
	    ++numScheduledCalls;
	    asap$1(callListener, [cb, promise, listener]);
	}

	function callListener(cb, promise, listener) {
	    var outerScope = PSD;
	    var psd = listener.psd;
	    try {
	        if (psd !== outerScope) {
	            // **KEEP** outerScope.env = wrappers.snapshot(); // Snapshot outerScope's environment.
	            PSD = psd;
	            // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
	        }

	        // Set static variable currentFulfiller to the promise that is being fullfilled,
	        // so that we connect the chain of promises (for long stacks support)
	        currentFulfiller = promise;

	        // Call callback and resolve our listener with it's return value.
	        var value = promise._value,
	            ret;
	        if (promise._state) {
	            ret = cb(value);
	        } else {
	            if (rejectingErrors.length) rejectingErrors = [];
	            ret = cb(value);
	            if (rejectingErrors.indexOf(value) === -1) markErrorAsHandled(promise); // Callback didnt do Promise.reject(err) nor reject(err) onto another promise.
	        }
	        listener.resolve(ret);
	    } catch (e) {
	        // Exception thrown in callback. Reject our listener.
	        listener.reject(e);
	    } finally {
	        // Restore PSD, env and currentFulfiller.
	        if (psd !== outerScope) {
	            PSD = outerScope;
	            // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment
	        }
	        currentFulfiller = null;
	        if (--numScheduledCalls === 0) finalizePhysicalTick();
	        --psd.ref || psd.finalize();
	    }
	}

	function getStack(promise, stacks, limit) {
	    if (stacks.length === limit) return stacks;
	    var stack = "";
	    if (promise._state === false) {
	        var failure = promise._value,
	            errorName,
	            message;

	        if (failure != null) {
	            errorName = failure.name || "Error";
	            message = failure.message || failure;
	            stack = prettyStack(failure, 0);
	        } else {
	            errorName = failure; // If error is undefined or null, show that.
	            message = "";
	        }
	        stacks.push(errorName + (message ? ": " + message : "") + stack);
	    }
	    if (debug) {
	        stack = prettyStack(promise._stackHolder, 2);
	        if (stack && stacks.indexOf(stack) === -1) stacks.push(stack);
	        if (promise._prev) getStack(promise._prev, stacks, limit);
	    }
	    return stacks;
	}

	function linkToPreviousPromise(promise, prev) {
	    // Support long stacks by linking to previous completed promise.
	    var numPrev = prev ? prev._numPrev + 1 : 0;
	    if (numPrev < LONG_STACKS_CLIP_LIMIT) {
	        // Prohibit infinite Promise loops to get an infinite long memory consuming "tail".
	        promise._prev = prev;
	        promise._numPrev = numPrev;
	    }
	}

	/* The callback to schedule with setImmediate() or setTimeout().
	   It runs a virtual microtick and executes any callback registered in microtickQueue.
	 */
	function physicalTick() {
	    beginMicroTickScope() && endMicroTickScope();
	}

	function beginMicroTickScope() {
	    var wasRootExec = isOutsideMicroTick;
	    isOutsideMicroTick = false;
	    needsNewPhysicalTick = false;
	    return wasRootExec;
	}

	/* Executes micro-ticks without doing try..catch.
	   This can be possible because we only use this internally and
	   the registered functions are exception-safe (they do try..catch
	   internally before calling any external method). If registering
	   functions in the microtickQueue that are not exception-safe, this
	   would destroy the framework and make it instable. So we don't export
	   our asap method.
	*/
	function endMicroTickScope() {
	    var callbacks, i, l;
	    do {
	        while (microtickQueue.length > 0) {
	            callbacks = microtickQueue;
	            microtickQueue = [];
	            l = callbacks.length;
	            for (i = 0; i < l; ++i) {
	                var item = callbacks[i];
	                item[0].apply(null, item[1]);
	            }
	        }
	    } while (microtickQueue.length > 0);
	    isOutsideMicroTick = true;
	    needsNewPhysicalTick = true;
	}

	function finalizePhysicalTick() {
	    var unhandledErrs = unhandledErrors;
	    unhandledErrors = [];
	    unhandledErrs.forEach(function (p) {
	        p._PSD.onunhandled.call(null, p._value, p);
	    });
	    var finalizers = tickFinalizers.slice(0); // Clone first because finalizer may remove itself from list.
	    var i = finalizers.length;
	    while (i) {
	        finalizers[--i]();
	    }
	}

	function run_at_end_of_this_or_next_physical_tick(fn) {
	    function finalizer() {
	        fn();
	        tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
	    }
	    tickFinalizers.push(finalizer);
	    ++numScheduledCalls;
	    asap$1(function () {
	        if (--numScheduledCalls === 0) finalizePhysicalTick();
	    }, []);
	}

	function addPossiblyUnhandledError(promise) {
	    // Only add to unhandledErrors if not already there. The first one to add to this list
	    // will be upon the first rejection so that the root cause (first promise in the
	    // rejection chain) is the one listed.
	    if (!unhandledErrors.some(function (p) {
	        return p._value === promise._value;
	    })) unhandledErrors.push(promise);
	}

	function markErrorAsHandled(promise) {
	    // Called when a reject handled is actually being called.
	    // Search in unhandledErrors for any promise whos _value is this promise_value (list
	    // contains only rejected promises, and only one item per error)
	    var i = unhandledErrors.length;
	    while (i) {
	        if (unhandledErrors[--i]._value === promise._value) {
	            // Found a promise that failed with this same error object pointer,
	            // Remove that since there is a listener that actually takes care of it.
	            unhandledErrors.splice(i, 1);
	            return;
	        }
	    }
	}

	// By default, log uncaught errors to the console
	function defaultErrorHandler(e) {
	    console.warn('Unhandled rejection: ' + (e.stack || e));
	}

	function PromiseReject(reason) {
	    return new Promise(INTERNAL, false, reason);
	}

	function wrap(fn, errorCatcher) {
	    var psd = PSD;
	    return function () {
	        var wasRootExec = beginMicroTickScope(),
	            outerScope = PSD;

	        try {
	            if (outerScope !== psd) {
	                // **KEEP** outerScope.env = wrappers.snapshot(); // Snapshot outerScope's environment
	                PSD = psd;
	                // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
	            }
	            return fn.apply(this, arguments);
	        } catch (e) {
	            errorCatcher && errorCatcher(e);
	        } finally {
	            if (outerScope !== psd) {
	                PSD = outerScope;
	                // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment
	            }
	            if (wasRootExec) endMicroTickScope();
	        }
	    };
	}

	function newScope(fn, a1, a2, a3) {
	    var parent = PSD,
	        psd = Object.create(parent);
	    psd.parent = parent;
	    psd.ref = 0;
	    psd.global = false;
	    // **KEEP** psd.env = wrappers.wrap(psd);

	    // unhandleds and onunhandled should not be specifically set here.
	    // Leave them on parent prototype.
	    // unhandleds.push(err) will push to parent's prototype
	    // onunhandled() will call parents onunhandled (with this scope's this-pointer though!)
	    ++parent.ref;
	    psd.finalize = function () {
	        --this.parent.ref || this.parent.finalize();
	    };
	    var rv = usePSD(psd, fn, a1, a2, a3);
	    if (psd.ref === 0) psd.finalize();
	    return rv;
	}

	function usePSD(psd, fn, a1, a2, a3) {
	    var outerScope = PSD;
	    try {
	        if (psd !== outerScope) {
	            // **KEEP** outerScope.env = wrappers.snapshot(); // snapshot outerScope's environment.
	            PSD = psd;
	            // **KEEP** wrappers.restore(psd.env); // Restore PSD's environment.
	        }
	        return fn(a1, a2, a3);
	    } finally {
	        if (psd !== outerScope) {
	            PSD = outerScope;
	            // **KEEP** wrappers.restore(outerScope.env); // Restore outerScope's environment.
	        }
	    }
	}

	var UNHANDLEDREJECTION = "unhandledrejection";

	function globalError(err, promise) {
	    var rv;
	    try {
	        rv = promise.onuncatched(err);
	    } catch (e) {}
	    if (rv !== false) try {
	        var event,
	            eventData = { promise: promise, reason: err };
	        if (_global.document && document.createEvent) {
	            event = document.createEvent('Event');
	            event.initEvent(UNHANDLEDREJECTION, true, true);
	            extend(event, eventData);
	        } else if (_global.CustomEvent) {
	            event = new CustomEvent(UNHANDLEDREJECTION, { detail: eventData });
	            extend(event, eventData);
	        }
	        if (event && _global.dispatchEvent) {
	            dispatchEvent(event);
	            if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
	                // No native support for PromiseRejectionEvent but user has set window.onunhandledrejection. Manually call it.
	                try {
	                    _global.onunhandledrejection(event);
	                } catch (_) {}
	        }
	        if (!event.defaultPrevented) {
	            // Backward compatibility: fire to events registered at Promise.on.error
	            Promise.on.error.fire(err, promise);
	        }
	    } catch (e) {}
	}

	/* **KEEP**

	export function wrapPromise(PromiseClass) {
	    var proto = PromiseClass.prototype;
	    var origThen = proto.then;

	    wrappers.add({
	        snapshot: () => proto.then,
	        restore: value => {proto.then = value;},
	        wrap: () => patchedThen
	    });

	    function patchedThen (onFulfilled, onRejected) {
	        var promise = this;
	        var onFulfilledProxy = wrap(function(value){
	            var rv = value;
	            if (onFulfilled) {
	                rv = onFulfilled(rv);
	                if (rv && typeof rv.then === 'function') rv.then(); // Intercept that promise as well.
	            }
	            --PSD.ref || PSD.finalize();
	            return rv;
	        });
	        var onRejectedProxy = wrap(function(err){
	            promise._$err = err;
	            var unhandleds = PSD.unhandleds;
	            var idx = unhandleds.length,
	                rv;
	            while (idx--) if (unhandleds[idx]._$err === err) break;
	            if (onRejected) {
	                if (idx !== -1) unhandleds.splice(idx, 1); // Mark as handled.
	                rv = onRejected(err);
	                if (rv && typeof rv.then === 'function') rv.then(); // Intercept that promise as well.
	            } else {
	                if (idx === -1) unhandleds.push(promise);
	                rv = PromiseClass.reject(err);
	                rv._$nointercept = true; // Prohibit eternal loop.
	            }
	            --PSD.ref || PSD.finalize();
	            return rv;
	        });

	        if (this._$nointercept) return origThen.apply(this, arguments);
	        ++PSD.ref;
	        return origThen.call(this, onFulfilledProxy, onRejectedProxy);
	    }
	}

	// Global Promise wrapper
	if (_global.Promise) wrapPromise(_global.Promise);

	*/

	doFakeAutoComplete(function () {
	    // Simplify the job for VS Intellisense. This piece of code is one of the keys to the new marvellous intellisense support in Dexie.
	    asap$1 = function (fn, args) {
	        setTimeout(function () {
	            fn.apply(null, args);
	        }, 0);
	    };
	});

	function rejection(err, uncaughtHandler) {
	    // Get the call stack and return a rejected promise.
	    var rv = Promise.reject(err);
	    return uncaughtHandler ? rv.uncaught(uncaughtHandler) : rv;
	}

	/*
	 * Dexie.js - a minimalistic wrapper for IndexedDB
	 * ===============================================
	 *
	 * By David Fahlander, david.fahlander@gmail.com
	 *
	 * Version 1.5.1, Tue Nov 01 2016
	 *
	 * http://dexie.org
	 *
	 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
	 */

	var DEXIE_VERSION = '1.5.1';
	var maxString = String.fromCharCode(65535);
	var maxKey = function () {
	    try {
	        IDBKeyRange.only([[]]);return [[]];
	    } catch (e) {
	        return maxString;
	    }
	}();
	var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
	var STRING_EXPECTED = "String expected.";
	var connections = [];
	var isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
	var hasIEDeleteObjectStoreBug = isIEOrEdge;
	var hangsOnDeleteLargeKeyRange = isIEOrEdge;
	var dexieStackFrameFilter = function (frame) {
	    return !/(dexie\.js|dexie\.min\.js)/.test(frame);
	};

	setDebug(debug, dexieStackFrameFilter);

	function Dexie(dbName, options) {
	    /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
	    var deps = Dexie.dependencies;
	    var opts = extend({
	        // Default Options
	        addons: Dexie.addons, // Pick statically registered addons by default
	        autoOpen: true, // Don't require db.open() explicitely.
	        indexedDB: deps.indexedDB, // Backend IndexedDB api. Default to IDBShim or browser env.
	        IDBKeyRange: deps.IDBKeyRange // Backend IDBKeyRange api. Default to IDBShim or browser env.
	    }, options);
	    var addons = opts.addons,
	        autoOpen = opts.autoOpen,
	        indexedDB = opts.indexedDB,
	        IDBKeyRange = opts.IDBKeyRange;

	    var globalSchema = this._dbSchema = {};
	    var versions = [];
	    var dbStoreNames = [];
	    var allTables = {};
	    ///<var type="IDBDatabase" />
	    var idbdb = null; // Instance of IDBDatabase
	    var dbOpenError = null;
	    var isBeingOpened = false;
	    var openComplete = false;
	    var READONLY = "readonly",
	        READWRITE = "readwrite";
	    var db = this;
	    var dbReadyResolve,
	        dbReadyPromise = new Promise(function (resolve) {
	        dbReadyResolve = resolve;
	    }),
	        cancelOpen,
	        openCanceller = new Promise(function (_, reject) {
	        cancelOpen = reject;
	    });
	    var autoSchema = true;
	    var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn(indexedDB),
	        hasGetAll;

	    function init() {
	        // Default subscribers to "versionchange" and "blocked".
	        // Can be overridden by custom handlers. If custom handlers return false, these default
	        // behaviours will be prevented.
	        db.on("versionchange", function (ev) {
	            // Default behavior for versionchange event is to close database connection.
	            // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
	            // Let's not block the other window from making it's delete() or open() call.
	            // NOTE! This event is never fired in IE,Edge or Safari.
	            if (ev.newVersion > 0) console.warn('Another connection wants to upgrade database \'' + db.name + '\'. Closing db now to resume the upgrade.');else console.warn('Another connection wants to delete database \'' + db.name + '\'. Closing db now to resume the delete request.');
	            db.close();
	            // In many web applications, it would be recommended to force window.reload()
	            // when this event occurs. To do that, subscribe to the versionchange event
	            // and call window.location.reload(true) if ev.newVersion > 0 (not a deletion)
	            // The reason for this is that your current web app obviously has old schema code that needs
	            // to be updated. Another window got a newer version of the app and needs to upgrade DB but
	            // your window is blocking it unless we close it here.
	        });
	        db.on("blocked", function (ev) {
	            if (!ev.newVersion || ev.newVersion < ev.oldVersion) console.warn('Dexie.delete(\'' + db.name + '\') was blocked');else console.warn('Upgrade \'' + db.name + '\' blocked by other connection holding version ' + ev.oldVersion / 10);
	        });
	    }

	    //
	    //
	    //
	    // ------------------------- Versioning Framework---------------------------
	    //
	    //
	    //

	    this.version = function (versionNumber) {
	        /// <param name="versionNumber" type="Number"></param>
	        /// <returns type="Version"></returns>
	        if (idbdb || isBeingOpened) throw new exceptions.Schema("Cannot add version when database is open");
	        this.verno = Math.max(this.verno, versionNumber);
	        var versionInstance = versions.filter(function (v) {
	            return v._cfg.version === versionNumber;
	        })[0];
	        if (versionInstance) return versionInstance;
	        versionInstance = new Version(versionNumber);
	        versions.push(versionInstance);
	        versions.sort(lowerVersionFirst);
	        return versionInstance;
	    };

	    function Version(versionNumber) {
	        this._cfg = {
	            version: versionNumber,
	            storesSource: null,
	            dbschema: {},
	            tables: {},
	            contentUpgrade: null
	        };
	        this.stores({}); // Derive earlier schemas by default.
	    }

	    extend(Version.prototype, {
	        stores: function (stores) {
	            /// <summary>
	            ///   Defines the schema for a particular version
	            /// </summary>
	            /// <param name="stores" type="Object">
	            /// Example: <br/>
	            ///   {users: "id++,first,last,&amp;username,*email", <br/>
	            ///   passwords: "id++,&amp;username"}<br/>
	            /// <br/>
	            /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
	            /// Special characters:<br/>
	            ///  "&amp;"  means unique key, <br/>
	            ///  "*"  means value is multiEntry, <br/>
	            ///  "++" means auto-increment and only applicable for primary key <br/>
	            /// </param>
	            this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;

	            // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
	            var storesSpec = {};
	            versions.forEach(function (version) {
	                // 'versions' is always sorted by lowest version first.
	                extend(storesSpec, version._cfg.storesSource);
	            });

	            var dbschema = this._cfg.dbschema = {};
	            this._parseStoresSpec(storesSpec, dbschema);
	            // Update the latest schema to this version
	            // Update API
	            globalSchema = db._dbSchema = dbschema;
	            removeTablesApi([allTables, db, Transaction.prototype]);
	            setApiOnPlace([allTables, db, Transaction.prototype, this._cfg.tables], keys(dbschema), READWRITE, dbschema);
	            dbStoreNames = keys(dbschema);
	            return this;
	        },
	        upgrade: function (upgradeFunction) {
	            /// <param name="upgradeFunction" optional="true">Function that performs upgrading actions.</param>
	            var self = this;
	            fakeAutoComplete(function () {
	                upgradeFunction(db._createTransaction(READWRITE, keys(self._cfg.dbschema), self._cfg.dbschema)); // BUGBUG: No code completion for prev version's tables wont appear.
	            });
	            this._cfg.contentUpgrade = upgradeFunction;
	            return this;
	        },
	        _parseStoresSpec: function (stores, outSchema) {
	            keys(stores).forEach(function (tableName) {
	                if (stores[tableName] !== null) {
	                    var instanceTemplate = {};
	                    var indexes = parseIndexSyntax(stores[tableName]);
	                    var primKey = indexes.shift();
	                    if (primKey.multi) throw new exceptions.Schema("Primary key cannot be multi-valued");
	                    if (primKey.keyPath) setByKeyPath(instanceTemplate, primKey.keyPath, primKey.auto ? 0 : primKey.keyPath);
	                    indexes.forEach(function (idx) {
	                        if (idx.auto) throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
	                        if (!idx.keyPath) throw new exceptions.Schema("Index must have a name and cannot be an empty string");
	                        setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () {
	                            return "";
	                        }) : "");
	                    });
	                    outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
	                }
	            });
	        }
	    });

	    function runUpgraders(oldVersion, idbtrans, reject) {
	        var trans = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
	        trans.create(idbtrans);
	        trans._completion.catch(reject);
	        var rejectTransaction = trans._reject.bind(trans);
	        newScope(function () {
	            PSD.trans = trans;
	            if (oldVersion === 0) {
	                // Create tables:
	                keys(globalSchema).forEach(function (tableName) {
	                    createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
	                });
	                Promise.follow(function () {
	                    return db.on.populate.fire(trans);
	                }).catch(rejectTransaction);
	            } else updateTablesAndIndexes(oldVersion, trans, idbtrans).catch(rejectTransaction);
	        });
	    }

	    function updateTablesAndIndexes(oldVersion, trans, idbtrans) {
	        // Upgrade version to version, step-by-step from oldest to newest version.
	        // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
	        var queue = [];
	        var oldVersionStruct = versions.filter(function (version) {
	            return version._cfg.version === oldVersion;
	        })[0];
	        if (!oldVersionStruct) throw new exceptions.Upgrade("Dexie specification of currently installed DB version is missing");
	        globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
	        var anyContentUpgraderHasRun = false;

	        var versToRun = versions.filter(function (v) {
	            return v._cfg.version > oldVersion;
	        });
	        versToRun.forEach(function (version) {
	            /// <param name="version" type="Version"></param>
	            queue.push(function () {
	                var oldSchema = globalSchema;
	                var newSchema = version._cfg.dbschema;
	                adjustToExistingIndexNames(oldSchema, idbtrans);
	                adjustToExistingIndexNames(newSchema, idbtrans);
	                globalSchema = db._dbSchema = newSchema;
	                var diff = getSchemaDiff(oldSchema, newSchema);
	                // Add tables
	                diff.add.forEach(function (tuple) {
	                    createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
	                });
	                // Change tables
	                diff.change.forEach(function (change) {
	                    if (change.recreate) {
	                        throw new exceptions.Upgrade("Not yet support for changing primary key");
	                    } else {
	                        var store = idbtrans.objectStore(change.name);
	                        // Add indexes
	                        change.add.forEach(function (idx) {
	                            addIndex(store, idx);
	                        });
	                        // Update indexes
	                        change.change.forEach(function (idx) {
	                            store.deleteIndex(idx.name);
	                            addIndex(store, idx);
	                        });
	                        // Delete indexes
	                        change.del.forEach(function (idxName) {
	                            store.deleteIndex(idxName);
	                        });
	                    }
	                });
	                if (version._cfg.contentUpgrade) {
	                    anyContentUpgraderHasRun = true;
	                    return Promise.follow(function () {
	                        version._cfg.contentUpgrade(trans);
	                    });
	                }
	            });
	            queue.push(function (idbtrans) {
	                if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
	                    // Dont delete old tables if ieBug is present and a content upgrader has run. Let tables be left in DB so far. This needs to be taken care of.
	                    var newSchema = version._cfg.dbschema;
	                    // Delete old tables
	                    deleteRemovedTables(newSchema, idbtrans);
	                }
	            });
	        });

	        // Now, create a queue execution engine
	        function runQueue() {
	            return queue.length ? Promise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : Promise.resolve();
	        }

	        return runQueue().then(function () {
	            createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
	        });
	    }

	    function getSchemaDiff(oldSchema, newSchema) {
	        var diff = {
	            del: [], // Array of table names
	            add: [], // Array of [tableName, newDefinition]
	            change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
	        };
	        for (var table in oldSchema) {
	            if (!newSchema[table]) diff.del.push(table);
	        }
	        for (table in newSchema) {
	            var oldDef = oldSchema[table],
	                newDef = newSchema[table];
	            if (!oldDef) {
	                diff.add.push([table, newDef]);
	            } else {
	                var change = {
	                    name: table,
	                    def: newDef,
	                    recreate: false,
	                    del: [],
	                    add: [],
	                    change: []
	                };
	                if (oldDef.primKey.src !== newDef.primKey.src) {
	                    // Primary key has changed. Remove and re-add table.
	                    change.recreate = true;
	                    diff.change.push(change);
	                } else {
	                    // Same primary key. Just find out what differs:
	                    var oldIndexes = oldDef.idxByName;
	                    var newIndexes = newDef.idxByName;
	                    for (var idxName in oldIndexes) {
	                        if (!newIndexes[idxName]) change.del.push(idxName);
	                    }
	                    for (idxName in newIndexes) {
	                        var oldIdx = oldIndexes[idxName],
	                            newIdx = newIndexes[idxName];
	                        if (!oldIdx) change.add.push(newIdx);else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
	                    }
	                    if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
	                        diff.change.push(change);
	                    }
	                }
	            }
	        }
	        return diff;
	    }

	    function createTable(idbtrans, tableName, primKey, indexes) {
	        /// <param name="idbtrans" type="IDBTransaction"></param>
	        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
	        indexes.forEach(function (idx) {
	            addIndex(store, idx);
	        });
	        return store;
	    }

	    function createMissingTables(newSchema, idbtrans) {
	        keys(newSchema).forEach(function (tableName) {
	            if (!idbtrans.db.objectStoreNames.contains(tableName)) {
	                createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
	            }
	        });
	    }

	    function deleteRemovedTables(newSchema, idbtrans) {
	        for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
	            var storeName = idbtrans.db.objectStoreNames[i];
	            if (newSchema[storeName] == null) {
	                idbtrans.db.deleteObjectStore(storeName);
	            }
	        }
	    }

	    function addIndex(store, idx) {
	        store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
	    }

	    function dbUncaught(err) {
	        return db.on.error.fire(err);
	    }

	    //
	    //
	    //      Dexie Protected API
	    //
	    //

	    this._allTables = allTables;

	    this._tableFactory = function createTable(mode, tableSchema) {
	        /// <param name="tableSchema" type="TableSchema"></param>
	        if (mode === READONLY) return new Table(tableSchema.name, tableSchema, Collection);else return new WriteableTable(tableSchema.name, tableSchema);
	    };

	    this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
	        return new Transaction(mode, storeNames, dbschema, parentTransaction);
	    };

	    /* Generate a temporary transaction when db operations are done outside a transactino scope.
	    */
	    function tempTransaction(mode, storeNames, fn) {
	        // Last argument is "writeLocked". But this doesnt apply to oneshot direct db operations, so we ignore it.
	        if (!openComplete && !PSD.letThrough) {
	            if (!isBeingOpened) {
	                if (!autoOpen) return rejection(new exceptions.DatabaseClosed(), dbUncaught);
	                db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
	            }
	            return dbReadyPromise.then(function () {
	                return tempTransaction(mode, storeNames, fn);
	            });
	        } else {
	            var trans = db._createTransaction(mode, storeNames, globalSchema);
	            return trans._promise(mode, function (resolve, reject) {
	                newScope(function () {
	                    // OPTIMIZATION POSSIBLE? newScope() not needed because it's already done in _promise.
	                    PSD.trans = trans;
	                    fn(resolve, reject, trans);
	                });
	            }).then(function (result) {
	                // Instead of resolving value directly, wait with resolving it until transaction has completed.
	                // Otherwise the data would not be in the DB if requesting it in the then() operation.
	                // Specifically, to ensure that the following expression will work:
	                //
	                //   db.friends.put({name: "Arne"}).then(function () {
	                //       db.friends.where("name").equals("Arne").count(function(count) {
	                //           assert (count === 1);
	                //       });
	                //   });
	                //
	                return trans._completion.then(function () {
	                    return result;
	                });
	            }); /*.catch(err => { // Don't do this as of now. If would affect bulk- and modify methods in a way that could be more intuitive. But wait! Maybe change in next major.
	                 trans._reject(err);
	                 return rejection(err);
	                });*/
	        }
	    }

	    this._whenReady = function (fn) {
	        return new Promise(fake || openComplete || PSD.letThrough ? fn : function (resolve, reject) {
	            if (!isBeingOpened) {
	                if (!autoOpen) {
	                    reject(new exceptions.DatabaseClosed());
	                    return;
	                }
	                db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
	            }
	            dbReadyPromise.then(function () {
	                fn(resolve, reject);
	            });
	        }).uncaught(dbUncaught);
	    };

	    //
	    //
	    //
	    //
	    //      Dexie API
	    //
	    //
	    //

	    this.verno = 0;

	    this.open = function () {
	        if (isBeingOpened || idbdb) return dbReadyPromise.then(function () {
	            return dbOpenError ? rejection(dbOpenError, dbUncaught) : db;
	        });
	        debug && (openCanceller._stackHolder = getErrorWithStack()); // Let stacks point to when open() was called rather than where new Dexie() was called.
	        isBeingOpened = true;
	        dbOpenError = null;
	        openComplete = false;

	        // Function pointers to call when the core opening process completes.
	        var resolveDbReady = dbReadyResolve,

	        // upgradeTransaction to abort on failure.
	        upgradeTransaction = null;

	        return Promise.race([openCanceller, new Promise(function (resolve, reject) {
	            doFakeAutoComplete(function () {
	                return resolve();
	            });

	            // Make sure caller has specified at least one version
	            if (versions.length > 0) autoSchema = false;

	            // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE:
	            // IE fails when deleting objectStore after reading from it.
	            // A future version of Dexie.js will stopover an intermediate version to workaround this.
	            // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.

	            // If no API, throw!
	            if (!indexedDB) throw new exceptions.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL " + "(not locally). If using old Safari versions, make sure to include indexedDB polyfill.");

	            var req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
	            if (!req) throw new exceptions.MissingAPI("IndexedDB API not available"); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134
	            req.onerror = wrap(eventRejectHandler(reject));
	            req.onblocked = wrap(fireOnBlocked);
	            req.onupgradeneeded = wrap(function (e) {
	                upgradeTransaction = req.transaction;
	                if (autoSchema && !db._allowEmptyDB) {
	                    // Unless an addon has specified db._allowEmptyDB, lets make the call fail.
	                    // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
	                    // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we
	                    // do not create a new database by accident here.
	                    req.onerror = preventDefault; // Prohibit onabort error from firing before we're done!
	                    upgradeTransaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
	                    // Close database and delete it.
	                    req.result.close();
	                    var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
	                    delreq.onsuccess = delreq.onerror = wrap(function () {
	                        reject(new exceptions.NoSuchDatabase('Database ' + dbName + ' doesnt exist'));
	                    });
	                } else {
	                    upgradeTransaction.onerror = wrap(eventRejectHandler(reject));
	                    var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
	                    runUpgraders(oldVer / 10, upgradeTransaction, reject, req);
	                }
	            }, reject);

	            req.onsuccess = wrap(function () {
	                // Core opening procedure complete. Now let's just record some stuff.
	                upgradeTransaction = null;
	                idbdb = req.result;
	                connections.push(db); // Used for emulating versionchange event on IE/Edge/Safari.

	                if (autoSchema) readGlobalSchema();else if (idbdb.objectStoreNames.length > 0) {
	                    try {
	                        adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
	                    } catch (e) {
	                        // Safari may bail out if > 1 store names. However, this shouldnt be a showstopper. Issue #120.
	                    }
	                }

	                idbdb.onversionchange = wrap(function (ev) {
	                    db._vcFired = true; // detect implementations that not support versionchange (IE/Edge/Safari)
	                    db.on("versionchange").fire(ev);
	                });

	                if (!hasNativeGetDatabaseNames) {
	                    // Update localStorage with list of database names
	                    globalDatabaseList(function (databaseNames) {
	                        if (databaseNames.indexOf(dbName) === -1) return databaseNames.push(dbName);
	                    });
	                }

	                resolve();
	            }, reject);
	        })]).then(function () {
	            // Before finally resolving the dbReadyPromise and this promise,
	            // call and await all on('ready') subscribers:
	            // Dexie.vip() makes subscribers able to use the database while being opened.
	            // This is a must since these subscribers take part of the opening procedure.
	            return Dexie.vip(db.on.ready.fire);
	        }).then(function () {
	            // Resolve the db.open() with the db instance.
	            isBeingOpened = false;
	            return db;
	        }).catch(function (err) {
	            try {
	                // Did we fail within onupgradeneeded? Make sure to abort the upgrade transaction so it doesnt commit.
	                upgradeTransaction && upgradeTransaction.abort();
	            } catch (e) {}
	            isBeingOpened = false; // Set before calling db.close() so that it doesnt reject openCanceller again (leads to unhandled rejection event).
	            db.close(); // Closes and resets idbdb, removes connections, resets dbReadyPromise and openCanceller so that a later db.open() is fresh.
	            // A call to db.close() may have made on-ready subscribers fail. Use dbOpenError if set, since err could be a follow-up error on that.
	            dbOpenError = err; // Record the error. It will be used to reject further promises of db operations.
	            return rejection(dbOpenError, dbUncaught); // dbUncaught will make sure any error that happened in any operation before will now bubble to db.on.error() thanks to the special handling in Promise.uncaught().
	        }).finally(function () {
	            openComplete = true;
	            resolveDbReady(); // dbReadyPromise is resolved no matter if open() rejects or resolved. It's just to wake up waiters.
	        });
	    };

	    this.close = function () {
	        var idx = connections.indexOf(db);
	        if (idx >= 0) connections.splice(idx, 1);
	        if (idbdb) {
	            try {
	                idbdb.close();
	            } catch (e) {}
	            idbdb = null;
	        }
	        autoOpen = false;
	        dbOpenError = new exceptions.DatabaseClosed();
	        if (isBeingOpened) cancelOpen(dbOpenError);
	        // Reset dbReadyPromise promise:
	        dbReadyPromise = new Promise(function (resolve) {
	            dbReadyResolve = resolve;
	        });
	        openCanceller = new Promise(function (_, reject) {
	            cancelOpen = reject;
	        });
	    };

	    this.delete = function () {
	        var hasArguments = arguments.length > 0;
	        return new Promise(function (resolve, reject) {
	            if (hasArguments) throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
	            if (isBeingOpened) {
	                dbReadyPromise.then(doDelete);
	            } else {
	                doDelete();
	            }
	            function doDelete() {
	                db.close();
	                var req = indexedDB.deleteDatabase(dbName);
	                req.onsuccess = wrap(function () {
	                    if (!hasNativeGetDatabaseNames) {
	                        globalDatabaseList(function (databaseNames) {
	                            var pos = databaseNames.indexOf(dbName);
	                            if (pos >= 0) return databaseNames.splice(pos, 1);
	                        });
	                    }
	                    resolve();
	                });
	                req.onerror = wrap(eventRejectHandler(reject));
	                req.onblocked = fireOnBlocked;
	            }
	        }).uncaught(dbUncaught);
	    };

	    this.backendDB = function () {
	        return idbdb;
	    };

	    this.isOpen = function () {
	        return idbdb !== null;
	    };
	    this.hasFailed = function () {
	        return dbOpenError !== null;
	    };
	    this.dynamicallyOpened = function () {
	        return autoSchema;
	    };

	    //
	    // Properties
	    //
	    this.name = dbName;

	    // db.tables - an array of all Table instances.
	    setProp(this, "tables", {
	        get: function () {
	            /// <returns type="Array" elementType="WriteableTable" />
	            return keys(allTables).map(function (name) {
	                return allTables[name];
	            });
	        }
	    });

	    //
	    // Events
	    //
	    this.on = Events(this, "error", "populate", "blocked", "versionchange", { ready: [promisableChain, nop] });
	    this.on.error.subscribe = deprecated("Dexie.on.error", this.on.error.subscribe);
	    this.on.error.unsubscribe = deprecated("Dexie.on.error.unsubscribe", this.on.error.unsubscribe);

	    this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
	        return function (subscriber, bSticky) {
	            Dexie.vip(function () {
	                if (openComplete) {
	                    // Database already open. Call subscriber asap.
	                    if (!dbOpenError) Promise.resolve().then(subscriber);
	                    // bSticky: Also subscribe to future open sucesses (after close / reopen)
	                    if (bSticky) subscribe(subscriber);
	                } else {
	                    // Database not yet open. Subscribe to it.
	                    subscribe(subscriber);
	                    // If bSticky is falsy, make sure to unsubscribe subscriber when fired once.
	                    if (!bSticky) subscribe(function unsubscribe() {
	                        db.on.ready.unsubscribe(subscriber);
	                        db.on.ready.unsubscribe(unsubscribe);
	                    });
	                }
	            });
	        };
	    });

	    fakeAutoComplete(function () {
	        db.on("populate").fire(db._createTransaction(READWRITE, dbStoreNames, globalSchema));
	        db.on("error").fire(new Error());
	    });

	    this.transaction = function (mode, tableInstances, scopeFunc) {
	        /// <summary>
	        ///
	        /// </summary>
	        /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
	        /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
	        /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>

	        // Let table arguments be all arguments between mode and last argument.
	        console.log('SUP FOOOOOO');
	        var i = arguments.length;
	        if (i < 2) throw new exceptions.InvalidArgument("Too few arguments");
	        // Prevent optimzation killer (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments)
	        // and clone arguments except the first one into local var 'args'.
	        var args = new Array(i - 1);
	        while (--i) {
	            args[i - 1] = arguments[i];
	        } // Let scopeFunc be the last argument and pop it so that args now only contain the table arguments.
	        scopeFunc = args.pop();
	        var tables = flatten(args); // Support using array as middle argument, or a mix of arrays and non-arrays.
	        var parentTransaction = PSD.trans;
	        // Check if parent transactions is bound to this db instance, and if caller wants to reuse it
	        if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1) parentTransaction = null;
	        var onlyIfCompatible = mode.indexOf('?') !== -1;
	        mode = mode.replace('!', '').replace('?', ''); // Ok. Will change arguments[0] as well but we wont touch arguments henceforth.

	        try {
	            //
	            // Get storeNames from arguments. Either through given table instances, or through given table names.
	            //
	            var storeNames = tables.map(function (table) {
	                var storeName = table instanceof Table ? table.name : table;
	                if (typeof storeName !== 'string') throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
	                return storeName;
	            });

	            //
	            // Resolve mode. Allow shortcuts "r" and "rw".
	            //
	            if (mode == "r" || mode == READONLY) mode = READONLY;else if (mode == "rw" || mode == READWRITE) mode = READWRITE;else throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);

	            if (parentTransaction) {
	                // Basic checks
	                if (parentTransaction.mode === READONLY && mode === READWRITE) {
	                    if (onlyIfCompatible) {
	                        // Spawn new transaction instead.
	                        parentTransaction = null;
	                    } else throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
	                }
	                if (parentTransaction) {
	                    storeNames.forEach(function (storeName) {
	                        if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
	                            if (onlyIfCompatible) {
	                                // Spawn new transaction instead.
	                                parentTransaction = null;
	                            } else throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
	                        }
	                    });
	                }
	            }
	        } catch (e) {
	            return parentTransaction ? parentTransaction._promise(null, function (_, reject) {
	                reject(e);
	            }) : rejection(e, dbUncaught);
	        }
	        // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
	        return parentTransaction ? parentTransaction._promise(mode, enterTransactionScope, "lock") : db._whenReady(enterTransactionScope);

	        function enterTransactionScope(resolve) {
	            var parentPSD = PSD;
	            resolve(Promise.resolve().then(function () {
	                return newScope(function () {
	                    // Keep a pointer to last non-transactional PSD to use if someone calls Dexie.ignoreTransaction().
	                    PSD.transless = PSD.transless || parentPSD;
	                    // Our transaction.
	                    //return new Promise((resolve, reject) => {
	                    var trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction);
	                    // Let the transaction instance be part of a Promise-specific data (PSD) value.
	                    PSD.trans = trans;

	                    if (parentTransaction) {
	                        // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
	                        trans.idbtrans = parentTransaction.idbtrans;
	                    } else {
	                        trans.create(); // Create the backend transaction so that complete() or error() will trigger even if no operation is made upon it.
	                    }

	                    // Provide arguments to the scope function (for backward compatibility)
	                    var tableArgs = storeNames.map(function (name) {
	                        return allTables[name];
	                    });
	                    tableArgs.push(trans);

	                    var returnValue;
	                    return Promise.follow(function () {
	                        // Finally, call the scope function with our table and transaction arguments.
	                        returnValue = scopeFunc.apply(trans, tableArgs); // NOTE: returnValue is used in trans.on.complete() not as a returnValue to this func.
	                        if (returnValue) {
	                            if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
	                                // scopeFunc returned an iterator with throw-support. Handle yield as await.
	                                returnValue = awaitIterator(returnValue);
	                            } else if (typeof returnValue.then === 'function' && !hasOwn(returnValue, '_PSD')) {
	                                throw new exceptions.IncompatiblePromise("Incompatible Promise returned from transaction scope (read more at http://tinyurl.com/znyqjqc). Transaction scope: " + scopeFunc.toString());
	                            }
	                        }
	                    }).uncaught(dbUncaught).then(function () {
	                        if (parentTransaction) trans._resolve(); // sub transactions don't react to idbtrans.oncomplete. We must trigger a acompletion.
	                        return trans._completion; // Even if WE believe everything is fine. Await IDBTransaction's oncomplete or onerror as well.
	                    }).then(function () {
	                        return returnValue;
	                    }).catch(function (e) {
	                        //reject(e);
	                        trans._reject(e); // Yes, above then-handler were maybe not called because of an unhandled rejection in scopeFunc!
	                        return rejection(e);
	                    });
	                    //});
	                });
	            }));
	        }
	    };

	    this.table = function (tableName) {
	        /// <returns type="WriteableTable"></returns>
	        if (fake && autoSchema) return new WriteableTable(tableName);
	        if (!hasOwn(allTables, tableName)) {
	            throw new exceptions.InvalidTable('Table ' + tableName + ' does not exist');
	        }
	        return allTables[tableName];
	    };

	    //
	    //
	    //
	    // Table Class
	    //
	    //
	    //
	    function Table(name, tableSchema, collClass) {
	        /// <param name="name" type="String"></param>
	        this.name = name;
	        this.schema = tableSchema;
	        this.hook = allTables[name] ? allTables[name].hook : Events(null, {
	            "creating": [hookCreatingChain, nop],
	            "reading": [pureFunctionChain, mirror],
	            "updating": [hookUpdatingChain, nop],
	            "deleting": [hookDeletingChain, nop]
	        });
	        this._collClass = collClass || Collection;
	    }

	    props(Table.prototype, {

	        //
	        // Table Protected Methods
	        //

	        _trans: function getTransaction(mode, fn, writeLocked) {
	            var trans = PSD.trans;
	            return trans && trans.db === db ? trans._promise(mode, fn, writeLocked) : tempTransaction(mode, [this.name], fn);
	        },
	        _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
	            if (fake) return new Promise(fn); // Simplify the work for Intellisense/Code completion.
	            var trans = PSD.trans,
	                tableName = this.name;
	            function supplyIdbStore(resolve, reject, trans) {
	                fn(resolve, reject, trans.idbtrans.objectStore(tableName), trans);
	            }
	            return trans && trans.db === db ? trans._promise(mode, supplyIdbStore, writeLocked) : tempTransaction(mode, [this.name], supplyIdbStore);
	        },

	        //
	        // Table Public Methods
	        //
	        get: function (key, cb) {
	            var self = this;
	            return this._idbstore(READONLY, function (resolve, reject, idbstore) {
	                fake && resolve(self.schema.instanceTemplate);
	                var req = idbstore.get(key);
	                req.onerror = eventRejectHandler(reject);
	                req.onsuccess = wrap(function () {
	                    resolve(self.hook.reading.fire(req.result));
	                }, reject);
	            }).then(cb);
	        },
	        where: function (indexName) {
	            return new WhereClause(this, indexName);
	        },
	        count: function (cb) {
	            return this.toCollection().count(cb);
	        },
	        offset: function (offset) {
	            return this.toCollection().offset(offset);
	        },
	        limit: function (numRows) {
	            return this.toCollection().limit(numRows);
	        },
	        reverse: function () {
	            return this.toCollection().reverse();
	        },
	        filter: function (filterFunction) {
	            return this.toCollection().and(filterFunction);
	        },
	        each: function (fn) {
	            return this.toCollection().each(fn);
	        },
	        toArray: function (cb) {
	            return this.toCollection().toArray(cb);
	        },
	        orderBy: function (index) {
	            return new this._collClass(new WhereClause(this, index));
	        },

	        toCollection: function () {
	            return new this._collClass(new WhereClause(this));
	        },

	        mapToClass: function (constructor, structure) {
	            /// <summary>
	            ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
	            ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
	            /// </summary>
	            /// <param name="constructor">Constructor function representing the class.</param>
	            /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
	            /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
	            this.schema.mappedClass = constructor;
	            var instanceTemplate = Object.create(constructor.prototype);
	            if (structure) {
	                // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
	                applyStructure(instanceTemplate, structure);
	            }
	            this.schema.instanceTemplate = instanceTemplate;

	            // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
	            // no matter which method to use for reading (Table.get() or Table.where(...)... )
	            var readHook = function (obj) {
	                if (!obj) return obj; // No valid object. (Value is null). Return as is.
	                // Create a new object that derives from constructor:
	                var res = Object.create(constructor.prototype);
	                // Clone members:
	                for (var m in obj) {
	                    if (hasOwn(obj, m)) try {
	                        res[m] = obj[m];
	                    } catch (_) {}
	                }return res;
	            };

	            if (this.schema.readHook) {
	                this.hook.reading.unsubscribe(this.schema.readHook);
	            }
	            this.schema.readHook = readHook;
	            this.hook("reading", readHook);
	            return constructor;
	        },
	        defineClass: function (structure) {
	            /// <summary>
	            ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
	            ///     as well as making it possible to extend the prototype of the returned constructor function.
	            /// </summary>
	            /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
	            /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
	            return this.mapToClass(Dexie.defineClass(structure), structure);
	        }
	    });

	    //
	    //
	    //
	    // WriteableTable Class (extends Table)
	    //
	    //
	    //
	    function WriteableTable(name, tableSchema, collClass) {
	        Table.call(this, name, tableSchema, collClass || WriteableCollection);
	    }

	    function BulkErrorHandlerCatchAll(errorList, done, supportHooks) {
	        return (supportHooks ? hookedEventRejectHandler : eventRejectHandler)(function (e) {
	            errorList.push(e);
	            done && done();
	        });
	    }

	    function bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook) {
	        // If hasDeleteHook, keysOrTuples must be an array of tuples: [[key1, value2],[key2,value2],...],
	        // else keysOrTuples must be just an array of keys: [key1, key2, ...].
	        return new Promise(function (resolve, reject) {
	            var len = keysOrTuples.length,
	                lastItem = len - 1;
	            if (len === 0) return resolve();
	            if (!hasDeleteHook) {
	                for (var i = 0; i < len; ++i) {
	                    var req = idbstore.delete(keysOrTuples[i]);
	                    req.onerror = wrap(eventRejectHandler(reject));
	                    if (i === lastItem) req.onsuccess = wrap(function () {
	                        return resolve();
	                    });
	                }
	            } else {
	                var hookCtx,
	                    errorHandler = hookedEventRejectHandler(reject),
	                    successHandler = hookedEventSuccessHandler(null);
	                tryCatch(function () {
	                    for (var i = 0; i < len; ++i) {
	                        hookCtx = { onsuccess: null, onerror: null };
	                        var tuple = keysOrTuples[i];
	                        deletingHook.call(hookCtx, tuple[0], tuple[1], trans);
	                        var req = idbstore.delete(tuple[0]);
	                        req._hookCtx = hookCtx;
	                        req.onerror = errorHandler;
	                        if (i === lastItem) req.onsuccess = hookedEventSuccessHandler(resolve);else req.onsuccess = successHandler;
	                    }
	                }, function (err) {
	                    hookCtx.onerror && hookCtx.onerror(err);
	                    throw err;
	                });
	            }
	        }).uncaught(dbUncaught);
	    }

	    derive(WriteableTable).from(Table).extend({
	        bulkDelete: function (keys$$1) {
	            if (this.hook.deleting.fire === nop) {
	                return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
	                    resolve(bulkDelete(idbstore, trans, keys$$1, false, nop));
	                });
	            } else {
	                return this.where(':id').anyOf(keys$$1).delete().then(function () {}); // Resolve with undefined.
	            }
	        },
	        bulkPut: function (objects, keys$$1) {
	            var _this = this;

	            return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
	                if (!idbstore.keyPath && !_this.schema.primKey.auto && !keys$$1) throw new exceptions.InvalidArgument("bulkPut() with non-inbound keys requires keys array in second argument");
	                if (idbstore.keyPath && keys$$1) throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
	                if (keys$$1 && keys$$1.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
	                if (objects.length === 0) return resolve(); // Caller provided empty list.
	                var done = function (result) {
	                    if (errorList.length === 0) resolve(result);else reject(new BulkError(_this.name + '.bulkPut(): ' + errorList.length + ' of ' + numObjs + ' operations failed', errorList));
	                };
	                var req,
	                    errorList = [],
	                    errorHandler,
	                    numObjs = objects.length,
	                    table = _this;
	                if (_this.hook.creating.fire === nop && _this.hook.updating.fire === nop) {
	                    //
	                    // Standard Bulk (no 'creating' or 'updating' hooks to care about)
	                    //
	                    errorHandler = BulkErrorHandlerCatchAll(errorList);
	                    for (var i = 0, l = objects.length; i < l; ++i) {
	                        req = keys$$1 ? idbstore.put(objects[i], keys$$1[i]) : idbstore.put(objects[i]);
	                        req.onerror = errorHandler;
	                    }
	                    // Only need to catch success or error on the last operation
	                    // according to the IDB spec.
	                    req.onerror = BulkErrorHandlerCatchAll(errorList, done);
	                    req.onsuccess = eventSuccessHandler(done);
	                } else {
	                    var effectiveKeys = keys$$1 || idbstore.keyPath && objects.map(function (o) {
	                        return getByKeyPath(o, idbstore.keyPath);
	                    });
	                    // Generate map of {[key]: object}
	                    var objectLookup = effectiveKeys && arrayToObject(effectiveKeys, function (key, i) {
	                        return key != null && [key, objects[i]];
	                    });
	                    var promise = !effectiveKeys ?

	                    // Auto-incremented key-less objects only without any keys argument.
	                    table.bulkAdd(objects) :

	                    // Keys provided. Either as inbound in provided objects, or as a keys argument.
	                    // Begin with updating those that exists in DB:
	                    table.where(':id').anyOf(effectiveKeys.filter(function (key) {
	                        return key != null;
	                    })).modify(function () {
	                        this.value = objectLookup[this.primKey];
	                        objectLookup[this.primKey] = null; // Mark as "don't add this"
	                    }).catch(ModifyError, function (e) {
	                        errorList = e.failures; // No need to concat here. These are the first errors added.
	                    }).then(function () {
	                        // Now, let's examine which items didnt exist so we can add them:
	                        var objsToAdd = [],
	                            keysToAdd = keys$$1 && [];
	                        // Iterate backwards. Why? Because if same key was used twice, just add the last one.
	                        for (var i = effectiveKeys.length - 1; i >= 0; --i) {
	                            var key = effectiveKeys[i];
	                            if (key == null || objectLookup[key]) {
	                                objsToAdd.push(objects[i]);
	                                keys$$1 && keysToAdd.push(key);
	                                if (key != null) objectLookup[key] = null; // Mark as "dont add again"
	                            }
	                        }
	                        // The items are in reverse order so reverse them before adding.
	                        // Could be important in order to get auto-incremented keys the way the caller
	                        // would expect. Could have used unshift instead of push()/reverse(),
	                        // but: http://jsperf.com/unshift-vs-reverse
	                        objsToAdd.reverse();
	                        keys$$1 && keysToAdd.reverse();
	                        return table.bulkAdd(objsToAdd, keysToAdd);
	                    }).then(function (lastAddedKey) {
	                        // Resolve with key of the last object in given arguments to bulkPut():
	                        var lastEffectiveKey = effectiveKeys[effectiveKeys.length - 1]; // Key was provided.
	                        return lastEffectiveKey != null ? lastEffectiveKey : lastAddedKey;
	                    });

	                    promise.then(done).catch(BulkError, function (e) {
	                        // Concat failure from ModifyError and reject using our 'done' method.
	                        errorList = errorList.concat(e.failures);
	                        done();
	                    }).catch(reject);
	                }
	            }, "locked"); // If called from transaction scope, lock transaction til all steps are done.
	        },
	        bulkAdd: function (objects, keys$$1) {
	            var self = this,
	                creatingHook = this.hook.creating.fire;
	            return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
	                if (!idbstore.keyPath && !self.schema.primKey.auto && !keys$$1) throw new exceptions.InvalidArgument("bulkAdd() with non-inbound keys requires keys array in second argument");
	                if (idbstore.keyPath && keys$$1) throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
	                if (keys$$1 && keys$$1.length !== objects.length) throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
	                if (objects.length === 0) return resolve(); // Caller provided empty list.
	                function done(result) {
	                    if (errorList.length === 0) resolve(result);else reject(new BulkError(self.name + '.bulkAdd(): ' + errorList.length + ' of ' + numObjs + ' operations failed', errorList));
	                }
	                var req,
	                    errorList = [],
	                    errorHandler,
	                    successHandler,
	                    numObjs = objects.length;
	                if (creatingHook !== nop) {
	                    //
	                    // There are subscribers to hook('creating')
	                    // Must behave as documented.
	                    //
	                    var keyPath = idbstore.keyPath,
	                        hookCtx;
	                    errorHandler = BulkErrorHandlerCatchAll(errorList, null, true);
	                    successHandler = hookedEventSuccessHandler(null);

	                    tryCatch(function () {
	                        for (var i = 0, l = objects.length; i < l; ++i) {
	                            hookCtx = { onerror: null, onsuccess: null };
	                            var key = keys$$1 && keys$$1[i];
	                            var obj = objects[i],
	                                effectiveKey = keys$$1 ? key : keyPath ? getByKeyPath(obj, keyPath) : undefined,
	                                keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans);
	                            if (effectiveKey == null && keyToUse != null) {
	                                if (keyPath) {
	                                    obj = deepClone(obj);
	                                    setByKeyPath(obj, keyPath, keyToUse);
	                                } else {
	                                    key = keyToUse;
	                                }
	                            }
	                            req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
	                            req._hookCtx = hookCtx;
	                            if (i < l - 1) {
	                                req.onerror = errorHandler;
	                                if (hookCtx.onsuccess) req.onsuccess = successHandler;
	                            }
	                        }
	                    }, function (err) {
	                        hookCtx.onerror && hookCtx.onerror(err);
	                        throw err;
	                    });

	                    req.onerror = BulkErrorHandlerCatchAll(errorList, done, true);
	                    req.onsuccess = hookedEventSuccessHandler(done);
	                } else {
	                    //
	                    // Standard Bulk (no 'creating' hook to care about)
	                    //
	                    errorHandler = BulkErrorHandlerCatchAll(errorList);
	                    for (var i = 0, l = objects.length; i < l; ++i) {
	                        req = keys$$1 ? idbstore.add(objects[i], keys$$1[i]) : idbstore.add(objects[i]);
	                        req.onerror = errorHandler;
	                    }
	                    // Only need to catch success or error on the last operation
	                    // according to the IDB spec.
	                    req.onerror = BulkErrorHandlerCatchAll(errorList, done);
	                    req.onsuccess = eventSuccessHandler(done);
	                }
	            });
	        },
	        add: function (obj, key) {
	            /// <summary>
	            ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
	            /// </summary>
	            /// <param name="obj" type="Object">A javascript object to insert</param>
	            /// <param name="key" optional="true">Primary key</param>
	            var creatingHook = this.hook.creating.fire;
	            return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
	                var hookCtx = { onsuccess: null, onerror: null };
	                if (creatingHook !== nop) {
	                    var effectiveKey = key != null ? key : idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined;
	                    var keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
	                    if (effectiveKey == null && keyToUse != null) {
	                        // Using "==" and "!=" to check for either null or undefined!
	                        if (idbstore.keyPath) setByKeyPath(obj, idbstore.keyPath, keyToUse);else key = keyToUse;
	                    }
	                }
	                try {
	                    var req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
	                    req._hookCtx = hookCtx;
	                    req.onerror = hookedEventRejectHandler(reject);
	                    req.onsuccess = hookedEventSuccessHandler(function (result) {
	                        // TODO: Remove these two lines in next major release (2.0?)
	                        // It's no good practice to have side effects on provided parameters
	                        var keyPath = idbstore.keyPath;
	                        if (keyPath) setByKeyPath(obj, keyPath, result);
	                        resolve(result);
	                    });
	                } catch (e) {
	                    if (hookCtx.onerror) hookCtx.onerror(e);
	                    throw e;
	                }
	            });
	        },

	        put: function (obj, key) {
	            /// <summary>
	            ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
	            /// </summary>
	            /// <param name="obj" type="Object">A javascript object to insert or update</param>
	            /// <param name="key" optional="true">Primary key</param>
	            var self = this,
	                creatingHook = this.hook.creating.fire,
	                updatingHook = this.hook.updating.fire;
	            if (creatingHook !== nop || updatingHook !== nop) {
	                //
	                // People listens to when("creating") or when("updating") events!
	                // We must know whether the put operation results in an CREATE or UPDATE.
	                //
	                return this._trans(READWRITE, function (resolve, reject, trans) {
	                    // Since key is optional, make sure we get it from obj if not provided
	                    var effectiveKey = key !== undefined ? key : self.schema.primKey.keyPath && getByKeyPath(obj, self.schema.primKey.keyPath);
	                    if (effectiveKey == null) {
	                        // "== null" means checking for either null or undefined.
	                        // No primary key. Must use add().
	                        self.add(obj).then(resolve, reject);
	                    } else {
	                        // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
	                        trans._lock(); // Needed because operation is splitted into modify() and add().
	                        // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
	                        obj = deepClone(obj);
	                        self.where(":id").equals(effectiveKey).modify(function () {
	                            // Replace extisting value with our object
	                            // CRUD event firing handled in WriteableCollection.modify()
	                            this.value = obj;
	                        }).then(function (count) {
	                            if (count === 0) {
	                                // Object's key was not found. Add the object instead.
	                                // CRUD event firing will be done in add()
	                                return self.add(obj, key); // Resolving with another Promise. Returned Promise will then resolve with the new key.
	                            } else {
	                                return effectiveKey; // Resolve with the provided key.
	                            }
	                        }).finally(function () {
	                            trans._unlock();
	                        }).then(resolve, reject);
	                    }
	                });
	            } else {
	                // Use the standard IDB put() method.
	                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
	                    var req = key !== undefined ? idbstore.put(obj, key) : idbstore.put(obj);
	                    req.onerror = eventRejectHandler(reject);
	                    req.onsuccess = function (ev) {
	                        var keyPath = idbstore.keyPath;
	                        if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
	                        resolve(req.result);
	                    };
	                });
	            }
	        },

	        'delete': function (key) {
	            /// <param name="key">Primary key of the object to delete</param>
	            if (this.hook.deleting.subscribers.length) {
	                // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
	                // call the CRUD event. Only WriteableCollection.delete() will know whether an object was actually deleted.
	                return this.where(":id").equals(key).delete();
	            } else {
	                // No one listens. Use standard IDB delete() method.
	                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
	                    var req = idbstore.delete(key);
	                    req.onerror = eventRejectHandler(reject);
	                    req.onsuccess = function () {
	                        resolve(req.result);
	                    };
	                });
	            }
	        },

	        clear: function () {
	            if (this.hook.deleting.subscribers.length) {
	                // People listens to when("deleting") event. Must implement delete using WriteableCollection.delete() that will
	                // call the CRUD event. Only WriteableCollection.delete() will knows which objects that are actually deleted.
	                return this.toCollection().delete();
	            } else {
	                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
	                    var req = idbstore.clear();
	                    req.onerror = eventRejectHandler(reject);
	                    req.onsuccess = function () {
	                        resolve(req.result);
	                    };
	                });
	            }
	        },

	        update: function (keyOrObject, modifications) {
	            if (typeof modifications !== 'object' || isArray(modifications)) throw new exceptions.InvalidArgument("Modifications must be an object.");
	            if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
	                // object to modify. Also modify given object with the modifications:
	                keys(modifications).forEach(function (keyPath) {
	                    setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
	                });
	                var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
	                if (key === undefined) return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"), dbUncaught);
	                return this.where(":id").equals(key).modify(modifications);
	            } else {
	                // key to modify
	                return this.where(":id").equals(keyOrObject).modify(modifications);
	            }
	        }
	    });

	    //
	    //
	    //
	    // Transaction Class
	    //
	    //
	    //
	    function Transaction(mode, storeNames, dbschema, parent) {
	        var _this2 = this;

	        /// <summary>
	        ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
	        /// </summary>
	        /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
	        /// <param name="storeNames" type="Array">Array of table names to operate on</param>
	        this.db = db;
	        this.mode = mode;
	        this.storeNames = storeNames;
	        this.idbtrans = null;
	        this.on = Events(this, "complete", "error", "abort");
	        this.parent = parent || null;
	        this.active = true;
	        this._tables = null;
	        this._reculock = 0;
	        this._blockedFuncs = [];
	        this._psd = null;
	        this._dbschema = dbschema;
	        this._resolve = null;
	        this._reject = null;
	        this._completion = new Promise(function (resolve, reject) {
	            _this2._resolve = resolve;
	            _this2._reject = reject;
	        }).uncaught(dbUncaught);

	        this._completion.then(function () {
	            _this2.on.complete.fire();
	        }, function (e) {
	            _this2.on.error.fire(e);
	            _this2.parent ? _this2.parent._reject(e) : _this2.active && _this2.idbtrans && _this2.idbtrans.abort();
	            _this2.active = false;
	            return rejection(e); // Indicate we actually DO NOT catch this error.
	        });
	    }

	    props(Transaction.prototype, {
	        //
	        // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
	        //
	        _lock: function () {
	            assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
	            // Temporary set all requests into a pending queue if they are called before database is ready.
	            ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
	            if (this._reculock === 1 && !PSD.global) PSD.lockOwnerFor = this;
	            return this;
	        },
	        _unlock: function () {
	            assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
	            if (--this._reculock === 0) {
	                if (!PSD.global) PSD.lockOwnerFor = null;
	                while (this._blockedFuncs.length > 0 && !this._locked()) {
	                    var fnAndPSD = this._blockedFuncs.shift();
	                    try {
	                        usePSD(fnAndPSD[1], fnAndPSD[0]);
	                    } catch (e) {}
	                }
	            }
	            return this;
	        },
	        _locked: function () {
	            // Checks if any write-lock is applied on this transaction.
	            // To simplify the Dexie API for extension implementations, we support recursive locks.
	            // This is accomplished by using "Promise Specific Data" (PSD).
	            // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
	            // PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
	            //         * callback given to the Promise() constructor  (function (resolve, reject){...})
	            //         * callbacks given to then()/catch()/finally() methods (function (value){...})
	            // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
	            // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
	            // PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
	            return this._reculock && PSD.lockOwnerFor !== this;
	        },
	        create: function (idbtrans) {
	            var _this3 = this;

	            assert(!this.idbtrans);
	            if (!idbtrans && !idbdb) {
	                switch (dbOpenError && dbOpenError.name) {
	                    case "DatabaseClosedError":
	                        // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
	                        throw new exceptions.DatabaseClosed(dbOpenError);
	                    case "MissingAPIError":
	                        // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
	                        throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
	                    default:
	                        // Make it clear that the user operation was not what caused the error - the error had occurred earlier on db.open()!
	                        throw new exceptions.OpenFailed(dbOpenError);
	                }
	            }
	            if (!this.active) throw new exceptions.TransactionInactive();
	            assert(this._completion._state === null);

	            idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode);
	            idbtrans.onerror = wrap(function (ev) {
	                preventDefault(ev); // Prohibit default bubbling to window.error
	                _this3._reject(idbtrans.error);
	            });
	            idbtrans.onabort = wrap(function (ev) {
	                preventDefault(ev);
	                _this3.active && _this3._reject(new exceptions.Abort());
	                _this3.active = false;
	                _this3.on("abort").fire(ev);
	            });
	            idbtrans.oncomplete = wrap(function () {
	                _this3.active = false;
	                _this3._resolve();
	            });
	            return this;
	        },
	        _promise: function (mode, fn, bWriteLock) {
	            var self = this;
	            var p = self._locked() ?
	            // Read lock always. Transaction is write-locked. Wait for mutex.
	            new Promise(function (resolve, reject) {
	                self._blockedFuncs.push([function () {
	                    self._promise(mode, fn, bWriteLock).then(resolve, reject);
	                }, PSD]);
	            }) : newScope(function () {
	                var p_ = self.active ? new Promise(function (resolve, reject) {
	                    if (mode === READWRITE && self.mode !== READWRITE) throw new exceptions.ReadOnly("Transaction is readonly");
	                    if (!self.idbtrans && mode) self.create();
	                    if (bWriteLock) self._lock(); // Write lock if write operation is requested
	                    fn(resolve, reject, self);
	                }) : rejection(new exceptions.TransactionInactive());
	                if (self.active && bWriteLock) p_.finally(function () {
	                    self._unlock();
	                });
	                return p_;
	            });

	            p._lib = true;
	            return p.uncaught(dbUncaught);
	        },

	        //
	        // Transaction Public Properties and Methods
	        //
	        abort: function () {
	            this.active && this._reject(new exceptions.Abort());
	            this.active = false;
	        },

	        tables: {
	            get: deprecated("Transaction.tables", function () {
	                return arrayToObject(this.storeNames, function (name) {
	                    return [name, allTables[name]];
	                });
	            }, "Use db.tables()")
	        },

	        complete: deprecated("Transaction.complete()", function (cb) {
	            return this.on("complete", cb);
	        }),

	        error: deprecated("Transaction.error()", function (cb) {
	            return this.on("error", cb);
	        }),

	        table: deprecated("Transaction.table()", function (name) {
	            if (this.storeNames.indexOf(name) === -1) throw new exceptions.InvalidTable("Table " + name + " not in transaction");
	            return allTables[name];
	        })

	    });

	    //
	    //
	    //
	    // WhereClause
	    //
	    //
	    //
	    function WhereClause(table, index, orCollection) {
	        /// <param name="table" type="Table"></param>
	        /// <param name="index" type="String" optional="true"></param>
	        /// <param name="orCollection" type="Collection" optional="true"></param>
	        this._ctx = {
	            table: table,
	            index: index === ":id" ? null : index,
	            collClass: table._collClass,
	            or: orCollection
	        };
	    }

	    props(WhereClause.prototype, function () {

	        // WhereClause private methods

	        function fail(collectionOrWhereClause, err, T) {
	            var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause._ctx.collClass(collectionOrWhereClause) : collectionOrWhereClause;

	            collection._ctx.error = T ? new T(err) : new TypeError(err);
	            return collection;
	        }

	        function emptyCollection(whereClause) {
	            return new whereClause._ctx.collClass(whereClause, function () {
	                return IDBKeyRange.only("");
	            }).limit(0);
	        }

	        function upperFactory(dir) {
	            return dir === "next" ? function (s) {
	                return s.toUpperCase();
	            } : function (s) {
	                return s.toLowerCase();
	            };
	        }
	        function lowerFactory(dir) {
	            return dir === "next" ? function (s) {
	                return s.toLowerCase();
	            } : function (s) {
	                return s.toUpperCase();
	            };
	        }
	        function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
	            var length = Math.min(key.length, lowerNeedle.length);
	            var llp = -1;
	            for (var i = 0; i < length; ++i) {
	                var lwrKeyChar = lowerKey[i];
	                if (lwrKeyChar !== lowerNeedle[i]) {
	                    if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
	                    if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
	                    if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
	                    return null;
	                }
	                if (cmp(key[i], lwrKeyChar) < 0) llp = i;
	            }
	            if (length < lowerNeedle.length && dir === "next") return key + upperNeedle.substr(key.length);
	            if (length < key.length && dir === "prev") return key.substr(0, upperNeedle.length);
	            return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
	        }

	        function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
	            /// <param name="needles" type="Array" elementType="String"></param>
	            var upper,
	                lower,
	                compare,
	                upperNeedles,
	                lowerNeedles,
	                direction,
	                nextKeySuffix,
	                needlesLen = needles.length;
	            if (!needles.every(function (s) {
	                return typeof s === 'string';
	            })) {
	                return fail(whereClause, STRING_EXPECTED);
	            }
	            function initDirection(dir) {
	                upper = upperFactory(dir);
	                lower = lowerFactory(dir);
	                compare = dir === "next" ? simpleCompare : simpleCompareReverse;
	                var needleBounds = needles.map(function (needle) {
	                    return { lower: lower(needle), upper: upper(needle) };
	                }).sort(function (a, b) {
	                    return compare(a.lower, b.lower);
	                });
	                upperNeedles = needleBounds.map(function (nb) {
	                    return nb.upper;
	                });
	                lowerNeedles = needleBounds.map(function (nb) {
	                    return nb.lower;
	                });
	                direction = dir;
	                nextKeySuffix = dir === "next" ? "" : suffix;
	            }
	            initDirection("next");

	            var c = new whereClause._ctx.collClass(whereClause, function () {
	                return IDBKeyRange.bound(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
	            });

	            c._ondirectionchange = function (direction) {
	                // This event onlys occur before filter is called the first time.
	                initDirection(direction);
	            };

	            var firstPossibleNeedle = 0;

	            c._addAlgorithm(function (cursor, advance, resolve) {
	                /// <param name="cursor" type="IDBCursor"></param>
	                /// <param name="advance" type="Function"></param>
	                /// <param name="resolve" type="Function"></param>
	                var key = cursor.key;
	                if (typeof key !== 'string') return false;
	                var lowerKey = lower(key);
	                if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
	                    return true;
	                } else {
	                    var lowestPossibleCasing = null;
	                    for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
	                        var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
	                        if (casing === null && lowestPossibleCasing === null) firstPossibleNeedle = i + 1;else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
	                            lowestPossibleCasing = casing;
	                        }
	                    }
	                    if (lowestPossibleCasing !== null) {
	                        advance(function () {
	                            cursor.continue(lowestPossibleCasing + nextKeySuffix);
	                        });
	                    } else {
	                        advance(resolve);
	                    }
	                    return false;
	                }
	            });
	            return c;
	        }

	        //
	        // WhereClause public methods
	        //
	        return {
	            between: function (lower, upper, includeLower, includeUpper) {
	                /// <summary>
	                ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
	                /// </summary>
	                /// <param name="lower"></param>
	                /// <param name="upper"></param>
	                /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
	                /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
	                /// <returns type="Collection"></returns>
	                includeLower = includeLower !== false; // Default to true
	                includeUpper = includeUpper === true; // Default to false
	                try {
	                    if (cmp(lower, upper) > 0 || cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)) return emptyCollection(this); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
	                    return new this._ctx.collClass(this, function () {
	                        return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper);
	                    });
	                } catch (e) {
	                    return fail(this, INVALID_KEY_ARGUMENT);
	                }
	            },
	            equals: function (value) {
	                return new this._ctx.collClass(this, function () {
	                    return IDBKeyRange.only(value);
	                });
	            },
	            above: function (value) {
	                return new this._ctx.collClass(this, function () {
	                    return IDBKeyRange.lowerBound(value, true);
	                });
	            },
	            aboveOrEqual: function (value) {
	                return new this._ctx.collClass(this, function () {
	                    return IDBKeyRange.lowerBound(value);
	                });
	            },
	            below: function (value) {
	                return new this._ctx.collClass(this, function () {
	                    return IDBKeyRange.upperBound(value, true);
	                });
	            },
	            belowOrEqual: function (value) {
	                return new this._ctx.collClass(this, function () {
	                    return IDBKeyRange.upperBound(value);
	                });
	            },
	            startsWith: function (str) {
	                /// <param name="str" type="String"></param>
	                if (typeof str !== 'string') return fail(this, STRING_EXPECTED);
	                return this.between(str, str + maxString, true, true);
	            },
	            startsWithIgnoreCase: function (str) {
	                /// <param name="str" type="String"></param>
	                if (str === "") return this.startsWith(str);
	                return addIgnoreCaseAlgorithm(this, function (x, a) {
	                    return x.indexOf(a[0]) === 0;
	                }, [str], maxString);
	            },
	            equalsIgnoreCase: function (str) {
	                /// <param name="str" type="String"></param>
	                return addIgnoreCaseAlgorithm(this, function (x, a) {
	                    return x === a[0];
	                }, [str], "");
	            },
	            anyOfIgnoreCase: function () {
	                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
	                if (set.length === 0) return emptyCollection(this);
	                return addIgnoreCaseAlgorithm(this, function (x, a) {
	                    return a.indexOf(x) !== -1;
	                }, set, "");
	            },
	            startsWithAnyOfIgnoreCase: function () {
	                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
	                if (set.length === 0) return emptyCollection(this);
	                return addIgnoreCaseAlgorithm(this, function (x, a) {
	                    return a.some(function (n) {
	                        return x.indexOf(n) === 0;
	                    });
	                }, set, maxString);
	            },
	            anyOf: function () {
	                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
	                var compare = ascending;
	                try {
	                    set.sort(compare);
	                } catch (e) {
	                    return fail(this, INVALID_KEY_ARGUMENT);
	                }
	                if (set.length === 0) return emptyCollection(this);
	                var c = new this._ctx.collClass(this, function () {
	                    return IDBKeyRange.bound(set[0], set[set.length - 1]);
	                });

	                c._ondirectionchange = function (direction) {
	                    compare = direction === "next" ? ascending : descending;
	                    set.sort(compare);
	                };
	                var i = 0;
	                c._addAlgorithm(function (cursor, advance, resolve) {
	                    var key = cursor.key;
	                    while (compare(key, set[i]) > 0) {
	                        // The cursor has passed beyond this key. Check next.
	                        ++i;
	                        if (i === set.length) {
	                            // There is no next. Stop searching.
	                            advance(resolve);
	                            return false;
	                        }
	                    }
	                    if (compare(key, set[i]) === 0) {
	                        // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
	                        return true;
	                    } else {
	                        // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
	                        advance(function () {
	                            cursor.continue(set[i]);
	                        });
	                        return false;
	                    }
	                });
	                return c;
	            },

	            notEqual: function (value) {
	                return this.inAnyRange([[-Infinity, value], [value, maxKey]], { includeLowers: false, includeUppers: false });
	            },

	            noneOf: function () {
	                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
	                if (set.length === 0) return new this._ctx.collClass(this); // Return entire collection.
	                try {
	                    set.sort(ascending);
	                } catch (e) {
	                    return fail(this, INVALID_KEY_ARGUMENT);
	                }
	                // Transform ["a","b","c"] to a set of ranges for between/above/below: [[-Infinity,"a"], ["a","b"], ["b","c"], ["c",maxKey]]
	                var ranges = set.reduce(function (res, val) {
	                    return res ? res.concat([[res[res.length - 1][1], val]]) : [[-Infinity, val]];
	                }, null);
	                ranges.push([set[set.length - 1], maxKey]);
	                return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
	            },

	            /** Filter out values withing given set of ranges.
	            * Example, give children and elders a rebate of 50%:
	            *
	            *   db.friends.where('age').inAnyRange([[0,18],[65,Infinity]]).modify({Rebate: 1/2});
	            *
	            * @param {(string|number|Date|Array)[][]} ranges
	            * @param {{includeLowers: boolean, includeUppers: boolean}} options
	            */
	            inAnyRange: function (ranges, options) {
	                var ctx = this._ctx;
	                if (ranges.length === 0) return emptyCollection(this);
	                if (!ranges.every(function (range) {
	                    return range[0] !== undefined && range[1] !== undefined && ascending(range[0], range[1]) <= 0;
	                })) {
	                    return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
	                }
	                var includeLowers = !options || options.includeLowers !== false; // Default to true
	                var includeUppers = options && options.includeUppers === true; // Default to false

	                function addRange(ranges, newRange) {
	                    for (var i = 0, l = ranges.length; i < l; ++i) {
	                        var range = ranges[i];
	                        if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
	                            range[0] = min(range[0], newRange[0]);
	                            range[1] = max(range[1], newRange[1]);
	                            break;
	                        }
	                    }
	                    if (i === l) ranges.push(newRange);
	                    return ranges;
	                }

	                var sortDirection = ascending;
	                function rangeSorter(a, b) {
	                    return sortDirection(a[0], b[0]);
	                }

	                // Join overlapping ranges
	                var set;
	                try {
	                    set = ranges.reduce(addRange, []);
	                    set.sort(rangeSorter);
	                } catch (ex) {
	                    return fail(this, INVALID_KEY_ARGUMENT);
	                }

	                var i = 0;
	                var keyIsBeyondCurrentEntry = includeUppers ? function (key) {
	                    return ascending(key, set[i][1]) > 0;
	                } : function (key) {
	                    return ascending(key, set[i][1]) >= 0;
	                };

	                var keyIsBeforeCurrentEntry = includeLowers ? function (key) {
	                    return descending(key, set[i][0]) > 0;
	                } : function (key) {
	                    return descending(key, set[i][0]) >= 0;
	                };

	                function keyWithinCurrentRange(key) {
	                    return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
	                }

	                var checkKey = keyIsBeyondCurrentEntry;

	                var c = new ctx.collClass(this, function () {
	                    return IDBKeyRange.bound(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
	                });

	                c._ondirectionchange = function (direction) {
	                    if (direction === "next") {
	                        checkKey = keyIsBeyondCurrentEntry;
	                        sortDirection = ascending;
	                    } else {
	                        checkKey = keyIsBeforeCurrentEntry;
	                        sortDirection = descending;
	                    }
	                    set.sort(rangeSorter);
	                };

	                c._addAlgorithm(function (cursor, advance, resolve) {
	                    var key = cursor.key;
	                    while (checkKey(key)) {
	                        // The cursor has passed beyond this key. Check next.
	                        ++i;
	                        if (i === set.length) {
	                            // There is no next. Stop searching.
	                            advance(resolve);
	                            return false;
	                        }
	                    }
	                    if (keyWithinCurrentRange(key)) {
	                        // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
	                        return true;
	                    } else if (cmp(key, set[i][1]) === 0 || cmp(key, set[i][0]) === 0) {
	                        // includeUpper or includeLower is false so keyWithinCurrentRange() returns false even though we are at range border.
	                        // Continue to next key but don't include this one.
	                        return false;
	                    } else {
	                        // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
	                        advance(function () {
	                            if (sortDirection === ascending) cursor.continue(set[i][0]);else cursor.continue(set[i][1]);
	                        });
	                        return false;
	                    }
	                });
	                return c;
	            },
	            startsWithAnyOf: function () {
	                var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);

	                if (!set.every(function (s) {
	                    return typeof s === 'string';
	                })) {
	                    return fail(this, "startsWithAnyOf() only works with strings");
	                }
	                if (set.length === 0) return emptyCollection(this);

	                return this.inAnyRange(set.map(function (str) {
	                    return [str, str + maxString];
	                }));
	            }
	        };
	    });

	    //
	    //
	    //
	    // Collection Class
	    //
	    //
	    //
	    function Collection(whereClause, keyRangeGenerator) {
	        /// <summary>
	        ///
	        /// </summary>
	        /// <param name="whereClause" type="WhereClause">Where clause instance</param>
	        /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
	        var keyRange = null,
	            error = null;
	        if (keyRangeGenerator) try {
	            keyRange = keyRangeGenerator();
	        } catch (ex) {
	            error = ex;
	        }

	        var whereCtx = whereClause._ctx,
	            table = whereCtx.table;
	        this._ctx = {
	            table: table,
	            index: whereCtx.index,
	            isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
	            range: keyRange,
	            keysOnly: false,
	            dir: "next",
	            unique: "",
	            algorithm: null,
	            filter: null,
	            replayFilter: null,
	            justLimit: true, // True if a replayFilter is just a filter that performs a "limit" operation (or none at all)
	            isMatch: null,
	            offset: 0,
	            limit: Infinity,
	            error: error, // If set, any promise must be rejected with this error
	            or: whereCtx.or,
	            valueMapper: table.hook.reading.fire
	        };
	    }

	    function isPlainKeyRange(ctx, ignoreLimitFilter) {
	        return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
	    }

	    props(Collection.prototype, function () {

	        //
	        // Collection Private Functions
	        //

	        function addFilter(ctx, fn) {
	            ctx.filter = combine(ctx.filter, fn);
	        }

	        function addReplayFilter(ctx, factory, isLimitFilter) {
	            var curr = ctx.replayFilter;
	            ctx.replayFilter = curr ? function () {
	                return combine(curr(), factory());
	            } : factory;
	            ctx.justLimit = isLimitFilter && !curr;
	        }

	        function addMatchFilter(ctx, fn) {
	            ctx.isMatch = combine(ctx.isMatch, fn);
	        }

	        /** @param ctx {
	         *      isPrimKey: boolean,
	         *      table: Table,
	         *      index: string
	         * }
	         * @param store IDBObjectStore
	         **/
	        function getIndexOrStore(ctx, store) {
	            if (ctx.isPrimKey) return store;
	            var indexSpec = ctx.table.schema.idxByName[ctx.index];
	            if (!indexSpec) throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
	            return store.index(indexSpec.name);
	        }

	        /** @param ctx {
	         *      isPrimKey: boolean,
	         *      table: Table,
	         *      index: string,
	         *      keysOnly: boolean,
	         *      range?: IDBKeyRange,
	         *      dir: "next" | "prev"
	         * }
	         */
	        function openCursor(ctx, store) {
	            var idxOrStore = getIndexOrStore(ctx, store);
	            return ctx.keysOnly && 'openKeyCursor' in idxOrStore ? idxOrStore.openKeyCursor(ctx.range || null, ctx.dir + ctx.unique) : idxOrStore.openCursor(ctx.range || null, ctx.dir + ctx.unique);
	        }

	        function iter(ctx, fn, resolve, reject, idbstore) {
	            var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
	            if (!ctx.or) {
	                iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, filter), fn, resolve, reject, !ctx.keysOnly && ctx.valueMapper);
	            } else (function () {
	                var set = {};
	                var resolved = 0;

	                function resolveboth() {
	                    if (++resolved === 2) resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
	                }

	                function union(item, cursor, advance) {
	                    if (!filter || filter(cursor, advance, resolveboth, reject)) {
	                        var key = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
	                        if (!hasOwn(set, key)) {
	                            set[key] = true;
	                            fn(item, cursor, advance);
	                        }
	                    }
	                }

	                ctx.or._iterate(union, resolveboth, reject, idbstore);
	                iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, !ctx.keysOnly && ctx.valueMapper);
	            })();
	        }
	        function getInstanceTemplate(ctx) {
	            return ctx.table.schema.instanceTemplate;
	        }

	        return {

	            //
	            // Collection Protected Functions
	            //

	            _read: function (fn, cb) {
	                var ctx = this._ctx;
	                if (ctx.error) return ctx.table._trans(null, function rejector(resolve, reject) {
	                    reject(ctx.error);
	                });else return ctx.table._idbstore(READONLY, fn).then(cb);
	            },
	            _write: function (fn) {
	                var ctx = this._ctx;
	                if (ctx.error) return ctx.table._trans(null, function rejector(resolve, reject) {
	                    reject(ctx.error);
	                });else return ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
	            },
	            _addAlgorithm: function (fn) {
	                var ctx = this._ctx;
	                ctx.algorithm = combine(ctx.algorithm, fn);
	            },

	            _iterate: function (fn, resolve, reject, idbstore) {
	                return iter(this._ctx, fn, resolve, reject, idbstore);
	            },

	            clone: function (props$$1) {
	                var rv = Object.create(this.constructor.prototype),
	                    ctx = Object.create(this._ctx);
	                if (props$$1) extend(ctx, props$$1);
	                rv._ctx = ctx;
	                return rv;
	            },

	            raw: function () {
	                this._ctx.valueMapper = null;
	                return this;
	            },

	            //
	            // Collection Public methods
	            //

	            each: function (fn) {
	                var ctx = this._ctx;

	                if (fake) {
	                    var item = getInstanceTemplate(ctx),
	                        primKeyPath = ctx.table.schema.primKey.keyPath,
	                        key = getByKeyPath(item, ctx.index ? ctx.table.schema.idxByName[ctx.index].keyPath : primKeyPath),
	                        primaryKey = getByKeyPath(item, primKeyPath);
	                    fn(item, { key: key, primaryKey: primaryKey });
	                }

	                return this._read(function (resolve, reject, idbstore) {
	                    iter(ctx, fn, resolve, reject, idbstore);
	                });
	            },

	            count: function (cb) {
	                if (fake) return Promise.resolve(0).then(cb);
	                var ctx = this._ctx;

	                if (isPlainKeyRange(ctx, true)) {
	                    // This is a plain key range. We can use the count() method if the index.
	                    return this._read(function (resolve, reject, idbstore) {
	                        var idx = getIndexOrStore(ctx, idbstore);
	                        var req = ctx.range ? idx.count(ctx.range) : idx.count();
	                        req.onerror = eventRejectHandler(reject);
	                        req.onsuccess = function (e) {
	                            resolve(Math.min(e.target.result, ctx.limit));
	                        };
	                    }, cb);
	                } else {
	                    // Algorithms, filters or expressions are applied. Need to count manually.
	                    var count = 0;
	                    return this._read(function (resolve, reject, idbstore) {
	                        iter(ctx, function () {
	                            ++count;return false;
	                        }, function () {
	                            resolve(count);
	                        }, reject, idbstore);
	                    }, cb);
	                }
	            },

	            sortBy: function (keyPath, cb) {
	                /// <param name="keyPath" type="String"></param>
	                var parts = keyPath.split('.').reverse(),
	                    lastPart = parts[0],
	                    lastIndex = parts.length - 1;
	                function getval(obj, i) {
	                    if (i) return getval(obj[parts[i]], i - 1);
	                    return obj[lastPart];
	                }
	                var order = this._ctx.dir === "next" ? 1 : -1;

	                function sorter(a, b) {
	                    var aVal = getval(a, lastIndex),
	                        bVal = getval(b, lastIndex);
	                    return aVal < bVal ? -order : aVal > bVal ? order : 0;
	                }
	                return this.toArray(function (a) {
	                    return a.sort(sorter);
	                }).then(cb);
	            },

	            toArray: function (cb) {
	                var ctx = this._ctx;
	                return this._read(function (resolve, reject, idbstore) {
	                    fake && resolve([getInstanceTemplate(ctx)]);
	                    if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
	                        // Special optimation if we could use IDBObjectStore.getAll() or
	                        // IDBKeyRange.getAll():
	                        var readingHook = ctx.table.hook.reading.fire;
	                        var idxOrStore = getIndexOrStore(ctx, idbstore);
	                        var req = ctx.limit < Infinity ? idxOrStore.getAll(ctx.range, ctx.limit) : idxOrStore.getAll(ctx.range);
	                        req.onerror = eventRejectHandler(reject);
	                        req.onsuccess = readingHook === mirror ? eventSuccessHandler(resolve) : wrap(eventSuccessHandler(function (res) {
	                            try {
	                                resolve(res.map(readingHook));
	                            } catch (e) {
	                                reject(e);
	                            }
	                        }));
	                    } else {
	                        // Getting array through a cursor.
	                        var a = [];
	                        iter(ctx, function (item) {
	                            a.push(item);
	                        }, function arrayComplete() {
	                            resolve(a);
	                        }, reject, idbstore);
	                    }
	                }, cb);
	            },

	            offset: function (offset) {
	                var ctx = this._ctx;
	                if (offset <= 0) return this;
	                ctx.offset += offset; // For count()
	                if (isPlainKeyRange(ctx)) {
	                    addReplayFilter(ctx, function () {
	                        var offsetLeft = offset;
	                        return function (cursor, advance) {
	                            if (offsetLeft === 0) return true;
	                            if (offsetLeft === 1) {
	                                --offsetLeft;return false;
	                            }
	                            advance(function () {
	                                cursor.advance(offsetLeft);
	                                offsetLeft = 0;
	                            });
	                            return false;
	                        };
	                    });
	                } else {
	                    addReplayFilter(ctx, function () {
	                        var offsetLeft = offset;
	                        return function () {
	                            return --offsetLeft < 0;
	                        };
	                    });
	                }
	                return this;
	            },

	            limit: function (numRows) {
	                this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
	                addReplayFilter(this._ctx, function () {
	                    var rowsLeft = numRows;
	                    return function (cursor, advance, resolve) {
	                        if (--rowsLeft <= 0) advance(resolve); // Stop after this item has been included
	                        return rowsLeft >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
	                    };
	                }, true);
	                return this;
	            },

	            until: function (filterFunction, bIncludeStopEntry) {
	                var ctx = this._ctx;
	                fake && filterFunction(getInstanceTemplate(ctx));
	                addFilter(this._ctx, function (cursor, advance, resolve) {
	                    if (filterFunction(cursor.value)) {
	                        advance(resolve);
	                        return bIncludeStopEntry;
	                    } else {
	                        return true;
	                    }
	                });
	                return this;
	            },

	            first: function (cb) {
	                return this.limit(1).toArray(function (a) {
	                    return a[0];
	                }).then(cb);
	            },

	            last: function (cb) {
	                return this.reverse().first(cb);
	            },

	            filter: function (filterFunction) {
	                /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
	                fake && filterFunction(getInstanceTemplate(this._ctx));
	                addFilter(this._ctx, function (cursor) {
	                    return filterFunction(cursor.value);
	                });
	                // match filters not used in Dexie.js but can be used by 3rd part libraries to test a
	                // collection for a match without querying DB. Used by Dexie.Observable.
	                addMatchFilter(this._ctx, filterFunction);
	                return this;
	            },

	            and: function (filterFunction) {
	                return this.filter(filterFunction);
	            },

	            or: function (indexName) {
	                return new WhereClause(this._ctx.table, indexName, this);
	            },

	            reverse: function () {
	                this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
	                if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
	                return this;
	            },

	            desc: function () {
	                return this.reverse();
	            },

	            eachKey: function (cb) {
	                var ctx = this._ctx;
	                ctx.keysOnly = !ctx.isMatch;
	                return this.each(function (val, cursor) {
	                    cb(cursor.key, cursor);
	                });
	            },

	            eachUniqueKey: function (cb) {
	                this._ctx.unique = "unique";
	                return this.eachKey(cb);
	            },

	            eachPrimaryKey: function (cb) {
	                var ctx = this._ctx;
	                ctx.keysOnly = !ctx.isMatch;
	                return this.each(function (val, cursor) {
	                    cb(cursor.primaryKey, cursor);
	                });
	            },

	            keys: function (cb) {
	                var ctx = this._ctx;
	                ctx.keysOnly = !ctx.isMatch;
	                var a = [];
	                return this.each(function (item, cursor) {
	                    a.push(cursor.key);
	                }).then(function () {
	                    return a;
	                }).then(cb);
	            },

	            primaryKeys: function (cb) {
	                var ctx = this._ctx;
	                if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
	                    // Special optimation if we could use IDBObjectStore.getAllKeys() or
	                    // IDBKeyRange.getAllKeys():
	                    return this._read(function (resolve, reject, idbstore) {
	                        var idxOrStore = getIndexOrStore(ctx, idbstore);
	                        var req = ctx.limit < Infinity ? idxOrStore.getAllKeys(ctx.range, ctx.limit) : idxOrStore.getAllKeys(ctx.range);
	                        req.onerror = eventRejectHandler(reject);
	                        req.onsuccess = eventSuccessHandler(resolve);
	                    }).then(cb);
	                }
	                ctx.keysOnly = !ctx.isMatch;
	                var a = [];
	                return this.each(function (item, cursor) {
	                    a.push(cursor.primaryKey);
	                }).then(function () {
	                    return a;
	                }).then(cb);
	            },

	            uniqueKeys: function (cb) {
	                this._ctx.unique = "unique";
	                return this.keys(cb);
	            },

	            firstKey: function (cb) {
	                return this.limit(1).keys(function (a) {
	                    return a[0];
	                }).then(cb);
	            },

	            lastKey: function (cb) {
	                return this.reverse().firstKey(cb);
	            },

	            distinct: function () {
	                var ctx = this._ctx,
	                    idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
	                if (!idx || !idx.multi) return this; // distinct() only makes differencies on multiEntry indexes.
	                var set = {};
	                addFilter(this._ctx, function (cursor) {
	                    var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
	                    var found = hasOwn(set, strKey);
	                    set[strKey] = true;
	                    return !found;
	                });
	                return this;
	            }
	        };
	    });

	    //
	    //
	    // WriteableCollection Class
	    //
	    //
	    function WriteableCollection() {
	        Collection.apply(this, arguments);
	    }

	    derive(WriteableCollection).from(Collection).extend({

	        //
	        // WriteableCollection Public Methods
	        //

	        modify: function (changes) {
	            var self = this,
	                ctx = this._ctx,
	                hook = ctx.table.hook,
	                updatingHook = hook.updating.fire,
	                deletingHook = hook.deleting.fire;

	            fake && typeof changes === 'function' && changes.call({ value: ctx.table.schema.instanceTemplate }, ctx.table.schema.instanceTemplate);

	            return this._write(function (resolve, reject, idbstore, trans) {
	                var modifyer;
	                if (typeof changes === 'function') {
	                    // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
	                    if (updatingHook === nop && deletingHook === nop) {
	                        // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
	                        modifyer = changes;
	                    } else {
	                        // People want to know exactly what is being modified or deleted.
	                        // Let modifyer be a proxy function that finds out what changes the caller is actually doing
	                        // and call the hooks accordingly!
	                        modifyer = function (item) {
	                            var origItem = deepClone(item); // Clone the item first so we can compare laters.
	                            if (changes.call(this, item, this) === false) return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
	                            if (!hasOwn(this, "value")) {
	                                // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
	                                deletingHook.call(this, this.primKey, item, trans);
	                            } else {
	                                // No deletion. Check what was changed
	                                var objectDiff = getObjectDiff(origItem, this.value);
	                                var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
	                                if (additionalChanges) {
	                                    // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
	                                    item = this.value;
	                                    keys(additionalChanges).forEach(function (keyPath) {
	                                        setByKeyPath(item, keyPath, additionalChanges[keyPath]); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
	                                    });
	                                }
	                            }
	                        };
	                    }
	                } else if (updatingHook === nop) {
	                    // changes is a set of {keyPath: value} and no one is listening to the updating hook.
	                    var keyPaths = keys(changes);
	                    var numKeys = keyPaths.length;
	                    modifyer = function (item) {
	                        var anythingModified = false;
	                        for (var i = 0; i < numKeys; ++i) {
	                            var keyPath = keyPaths[i],
	                                val = changes[keyPath];
	                            if (getByKeyPath(item, keyPath) !== val) {
	                                setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
	                                anythingModified = true;
	                            }
	                        }
	                        return anythingModified;
	                    };
	                } else {
	                    // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
	                    // allow it to add additional modifications to make.
	                    var origChanges = changes;
	                    changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
	                    modifyer = function (item) {
	                        var anythingModified = false;
	                        var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
	                        if (additionalChanges) extend(changes, additionalChanges);
	                        keys(changes).forEach(function (keyPath) {
	                            var val = changes[keyPath];
	                            if (getByKeyPath(item, keyPath) !== val) {
	                                setByKeyPath(item, keyPath, val);
	                                anythingModified = true;
	                            }
	                        });
	                        if (additionalChanges) changes = shallowClone(origChanges); // Restore original changes for next iteration
	                        return anythingModified;
	                    };
	                }

	                var count = 0;
	                var successCount = 0;
	                var iterationComplete = false;
	                var failures = [];
	                var failKeys = [];
	                var currentKey = null;

	                function modifyItem(item, cursor) {
	                    currentKey = cursor.primaryKey;
	                    var thisContext = {
	                        primKey: cursor.primaryKey,
	                        value: item,
	                        onsuccess: null,
	                        onerror: null
	                    };

	                    function onerror(e) {
	                        failures.push(e);
	                        failKeys.push(thisContext.primKey);
	                        checkFinished();
	                        return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
	                    }

	                    if (modifyer.call(thisContext, item, thisContext) !== false) {
	                        // If a callback explicitely returns false, do not perform the update!
	                        var bDelete = !hasOwn(thisContext, "value");
	                        ++count;
	                        tryCatch(function () {
	                            var req = bDelete ? cursor.delete() : cursor.update(thisContext.value);
	                            req._hookCtx = thisContext;
	                            req.onerror = hookedEventRejectHandler(onerror);
	                            req.onsuccess = hookedEventSuccessHandler(function () {
	                                ++successCount;
	                                checkFinished();
	                            });
	                        }, onerror);
	                    } else if (thisContext.onsuccess) {
	                        // Hook will expect either onerror or onsuccess to always be called!
	                        thisContext.onsuccess(thisContext.value);
	                    }
	                }

	                function doReject(e) {
	                    if (e) {
	                        failures.push(e);
	                        failKeys.push(currentKey);
	                    }
	                    return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
	                }

	                function checkFinished() {
	                    if (iterationComplete && successCount + failures.length === count) {
	                        if (failures.length > 0) doReject();else resolve(successCount);
	                    }
	                }
	                self.clone().raw()._iterate(modifyItem, function () {
	                    iterationComplete = true;
	                    checkFinished();
	                }, doReject, idbstore);
	            });
	        },

	        'delete': function () {
	            var _this4 = this;

	            var ctx = this._ctx,
	                range = ctx.range,
	                deletingHook = ctx.table.hook.deleting.fire,
	                hasDeleteHook = deletingHook !== nop;
	            if (!hasDeleteHook && isPlainKeyRange(ctx) && (ctx.isPrimKey && !hangsOnDeleteLargeKeyRange || !range)) // if no range, we'll use clear().
	                {
	                    // May use IDBObjectStore.delete(IDBKeyRange) in this case (Issue #208)
	                    // For chromium, this is the way most optimized version.
	                    // For IE/Edge, this could hang the indexedDB engine and make operating system instable
	                    // (https://gist.github.com/dfahlander/5a39328f029de18222cf2125d56c38f7)
	                    return this._write(function (resolve, reject, idbstore) {
	                        // Our API contract is to return a count of deleted items, so we have to count() before delete().
	                        var onerror = eventRejectHandler(reject),
	                            countReq = range ? idbstore.count(range) : idbstore.count();
	                        countReq.onerror = onerror;
	                        countReq.onsuccess = function () {
	                            var count = countReq.result;
	                            tryCatch(function () {
	                                var delReq = range ? idbstore.delete(range) : idbstore.clear();
	                                delReq.onerror = onerror;
	                                delReq.onsuccess = function () {
	                                    return resolve(count);
	                                };
	                            }, function (err) {
	                                return reject(err);
	                            });
	                        };
	                    });
	                }

	            // Default version to use when collection is not a vanilla IDBKeyRange on the primary key.
	            // Divide into chunks to not starve RAM.
	            // If has delete hook, we will have to collect not just keys but also objects, so it will use
	            // more memory and need lower chunk size.
	            var CHUNKSIZE = hasDeleteHook ? 2000 : 10000;

	            return this._write(function (resolve, reject, idbstore, trans) {
	                var totalCount = 0;
	                // Clone collection and change its table and set a limit of CHUNKSIZE on the cloned Collection instance.
	                var collection = _this4.clone({
	                    keysOnly: !ctx.isMatch && !hasDeleteHook }) // load just keys (unless filter() or and() or deleteHook has subscribers)
	                .distinct() // In case multiEntry is used, never delete same key twice because resulting count
	                // would become larger than actual delete count.
	                .limit(CHUNKSIZE).raw(); // Don't filter through reading-hooks (like mapped classes etc)

	                var keysOrTuples = [];

	                // We're gonna do things on as many chunks that are needed.
	                // Use recursion of nextChunk function:
	                var nextChunk = function () {
	                    return collection.each(hasDeleteHook ? function (val, cursor) {
	                        // Somebody subscribes to hook('deleting'). Collect all primary keys and their values,
	                        // so that the hook can be called with its values in bulkDelete().
	                        keysOrTuples.push([cursor.primaryKey, cursor.value]);
	                    } : function (val, cursor) {
	                        // No one subscribes to hook('deleting'). Collect only primary keys:
	                        keysOrTuples.push(cursor.primaryKey);
	                    }).then(function () {
	                        // Chromium deletes faster when doing it in sort order.
	                        hasDeleteHook ? keysOrTuples.sort(function (a, b) {
	                            return ascending(a[0], b[0]);
	                        }) : keysOrTuples.sort(ascending);
	                        return bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook);
	                    }).then(function () {
	                        var count = keysOrTuples.length;
	                        totalCount += count;
	                        keysOrTuples = [];
	                        return count < CHUNKSIZE ? totalCount : nextChunk();
	                    });
	                };

	                resolve(nextChunk());
	            });
	        }
	    });

	    //
	    //
	    //
	    // ------------------------- Help functions ---------------------------
	    //
	    //
	    //

	    function lowerVersionFirst(a, b) {
	        return a._cfg.version - b._cfg.version;
	    }

	    function setApiOnPlace(objs, tableNames, mode, dbschema) {
	        tableNames.forEach(function (tableName) {
	            var tableInstance = db._tableFactory(mode, dbschema[tableName]);
	            objs.forEach(function (obj) {
	                tableName in obj || (obj[tableName] = tableInstance);
	            });
	        });
	    }

	    function removeTablesApi(objs) {
	        objs.forEach(function (obj) {
	            for (var key in obj) {
	                if (obj[key] instanceof Table) delete obj[key];
	            }
	        });
	    }

	    function iterate(req, filter, fn, resolve, reject, valueMapper) {

	        // Apply valueMapper (hook('reading') or mappped class)
	        var mappedFn = valueMapper ? function (x, c, a) {
	            return fn(valueMapper(x), c, a);
	        } : fn;
	        // Wrap fn with PSD and microtick stuff from Promise.
	        var wrappedFn = wrap(mappedFn, reject);

	        if (!req.onerror) req.onerror = eventRejectHandler(reject);
	        if (filter) {
	            req.onsuccess = trycatcher(function filter_record() {
	                var cursor = req.result;
	                if (cursor) {
	                    var c = function () {
	                        cursor.continue();
	                    };
	                    if (filter(cursor, function (advancer) {
	                        c = advancer;
	                    }, resolve, reject)) wrappedFn(cursor.value, cursor, function (advancer) {
	                        c = advancer;
	                    });
	                    c();
	                } else {
	                    resolve();
	                }
	            }, reject);
	        } else {
	            req.onsuccess = trycatcher(function filter_record() {
	                var cursor = req.result;
	                if (cursor) {
	                    var c = function () {
	                        cursor.continue();
	                    };
	                    wrappedFn(cursor.value, cursor, function (advancer) {
	                        c = advancer;
	                    });
	                    c();
	                } else {
	                    resolve();
	                }
	            }, reject);
	        }
	    }

	    function parseIndexSyntax(indexes) {
	        /// <param name="indexes" type="String"></param>
	        /// <returns type="Array" elementType="IndexSpec"></returns>
	        var rv = [];
	        indexes.split(',').forEach(function (index) {
	            index = index.trim();
	            var name = index.replace(/([&*]|\+\+)/g, ""); // Remove "&", "++" and "*"
	            // Let keyPath of "[a+b]" be ["a","b"]:
	            var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;

	            rv.push(new IndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), /\./.test(index)));
	        });
	        return rv;
	    }

	    function cmp(key1, key2) {
	        return indexedDB.cmp(key1, key2);
	    }

	    function min(a, b) {
	        return cmp(a, b) < 0 ? a : b;
	    }

	    function max(a, b) {
	        return cmp(a, b) > 0 ? a : b;
	    }

	    function ascending(a, b) {
	        return indexedDB.cmp(a, b);
	    }

	    function descending(a, b) {
	        return indexedDB.cmp(b, a);
	    }

	    function simpleCompare(a, b) {
	        return a < b ? -1 : a === b ? 0 : 1;
	    }

	    function simpleCompareReverse(a, b) {
	        return a > b ? -1 : a === b ? 0 : 1;
	    }

	    function combine(filter1, filter2) {
	        return filter1 ? filter2 ? function () {
	            return filter1.apply(this, arguments) && filter2.apply(this, arguments);
	        } : filter1 : filter2;
	    }

	    function readGlobalSchema() {
	        db.verno = idbdb.version / 10;
	        db._dbSchema = globalSchema = {};
	        dbStoreNames = slice(idbdb.objectStoreNames, 0);
	        if (dbStoreNames.length === 0) return; // Database contains no stores.
	        var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
	        dbStoreNames.forEach(function (storeName) {
	            var store = trans.objectStore(storeName),
	                keyPath = store.keyPath,
	                dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
	            var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
	            var indexes = [];
	            for (var j = 0; j < store.indexNames.length; ++j) {
	                var idbindex = store.index(store.indexNames[j]);
	                keyPath = idbindex.keyPath;
	                dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
	                var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
	                indexes.push(index);
	            }
	            globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
	        });
	        setApiOnPlace([allTables, Transaction.prototype], keys(globalSchema), READWRITE, globalSchema);
	    }

	    function adjustToExistingIndexNames(schema, idbtrans) {
	        /// <summary>
	        /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
	        /// </summary>
	        /// <param name="schema" type="Object">Map between name and TableSchema</param>
	        /// <param name="idbtrans" type="IDBTransaction"></param>
	        var storeNames = idbtrans.db.objectStoreNames;
	        for (var i = 0; i < storeNames.length; ++i) {
	            var storeName = storeNames[i];
	            var store = idbtrans.objectStore(storeName);
	            hasGetAll = 'getAll' in store;
	            for (var j = 0; j < store.indexNames.length; ++j) {
	                var indexName = store.indexNames[j];
	                var keyPath = store.index(indexName).keyPath;
	                var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
	                if (schema[storeName]) {
	                    var indexSpec = schema[storeName].idxByName[dexieName];
	                    if (indexSpec) indexSpec.name = indexName;
	                }
	            }
	        }
	    }

	    function fireOnBlocked(ev) {
	        db.on("blocked").fire(ev);
	        // Workaround (not fully*) for missing "versionchange" event in IE,Edge and Safari:
	        connections.filter(function (c) {
	            return c.name === db.name && c !== db && !c._vcFired;
	        }).map(function (c) {
	            return c.on("versionchange").fire(ev);
	        });
	    }

	    extend(this, {
	        Collection: Collection,
	        Table: Table,
	        Transaction: Transaction,
	        Version: Version,
	        WhereClause: WhereClause,
	        WriteableCollection: WriteableCollection,
	        WriteableTable: WriteableTable
	    });

	    init();

	    addons.forEach(function (fn) {
	        fn(db);
	    });
	}

	var fakeAutoComplete = function () {}; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())
	var fake = false; // Will never be changed. We just fake for the IDE that we change it (see doFakeAutoComplete())

	function parseType(type) {
	    if (typeof type === 'function') {
	        return new type();
	    } else if (isArray(type)) {
	        return [parseType(type[0])];
	    } else if (type && typeof type === 'object') {
	        var rv = {};
	        applyStructure(rv, type);
	        return rv;
	    } else {
	        return type;
	    }
	}

	function applyStructure(obj, structure) {
	    keys(structure).forEach(function (member) {
	        var value = parseType(structure[member]);
	        obj[member] = value;
	    });
	    return obj;
	}

	function eventSuccessHandler(done) {
	    return function (ev) {
	        done(ev.target.result);
	    };
	}

	function hookedEventSuccessHandler(resolve) {
	    // wrap() is needed when calling hooks because the rare scenario of:
	    //  * hook does a db operation that fails immediately (IDB throws exception)
	    //    For calling db operations on correct transaction, wrap makes sure to set PSD correctly.
	    //    wrap() will also execute in a virtual tick.
	    //  * If not wrapped in a virtual tick, direct exception will launch a new physical tick.
	    //  * If this was the last event in the bulk, the promise will resolve after a physical tick
	    //    and the transaction will have committed already.
	    // If no hook, the virtual tick will be executed in the reject()/resolve of the final promise,
	    // because it is always marked with _lib = true when created using Transaction._promise().
	    return wrap(function (event) {
	        var req = event.target,
	            result = req.result,
	            ctx = req._hookCtx,
	            // Contains the hook error handler. Put here instead of closure to boost performance.
	        hookSuccessHandler = ctx && ctx.onsuccess;
	        hookSuccessHandler && hookSuccessHandler(result);
	        resolve && resolve(result);
	    }, resolve);
	}

	function eventRejectHandler(reject) {
	    return function (event) {
	        preventDefault(event);
	        reject(event.target.error);
	        return false;
	    };
	}

	function hookedEventRejectHandler(reject) {
	    return wrap(function (event) {
	        // See comment on hookedEventSuccessHandler() why wrap() is needed only when supporting hooks.

	        var req = event.target,
	            err = req.error,
	            ctx = req._hookCtx,
	            // Contains the hook error handler. Put here instead of closure to boost performance.
	        hookErrorHandler = ctx && ctx.onerror;
	        hookErrorHandler && hookErrorHandler(err);
	        preventDefault(event);
	        reject(err);
	        return false;
	    });
	}

	function preventDefault(event) {
	    if (event.stopPropagation) // IndexedDBShim doesnt support this on Safari 8 and below.
	        event.stopPropagation();
	    if (event.preventDefault) // IndexedDBShim doesnt support this on Safari 8 and below.
	        event.preventDefault();
	}

	function globalDatabaseList(cb) {
	    var val,
	        localStorage = Dexie.dependencies.localStorage;
	    if (!localStorage) return cb([]); // Envs without localStorage support
	    try {
	        val = JSON.parse(localStorage.getItem('Dexie.DatabaseNames') || "[]");
	    } catch (e) {
	        val = [];
	    }
	    if (cb(val)) {
	        localStorage.setItem('Dexie.DatabaseNames', JSON.stringify(val));
	    }
	}

	function awaitIterator(iterator) {
	    var callNext = function (result) {
	        return iterator.next(result);
	    },
	        doThrow = function (error) {
	        return iterator.throw(error);
	    },
	        onSuccess = step(callNext),
	        onError = step(doThrow);

	    function step(getNext) {
	        return function (val) {
	            var next = getNext(val),
	                value = next.value;

	            return next.done ? value : !value || typeof value.then !== 'function' ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
	        };
	    }

	    return step(callNext)();
	}

	//
	// IndexSpec struct
	//
	function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
	    /// <param name="name" type="String"></param>
	    /// <param name="keyPath" type="String"></param>
	    /// <param name="unique" type="Boolean"></param>
	    /// <param name="multi" type="Boolean"></param>
	    /// <param name="auto" type="Boolean"></param>
	    /// <param name="compound" type="Boolean"></param>
	    /// <param name="dotted" type="Boolean"></param>
	    this.name = name;
	    this.keyPath = keyPath;
	    this.unique = unique;
	    this.multi = multi;
	    this.auto = auto;
	    this.compound = compound;
	    this.dotted = dotted;
	    var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && '[' + [].join.call(keyPath, '+') + ']';
	    this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
	}

	//
	// TableSchema struct
	//
	function TableSchema(name, primKey, indexes, instanceTemplate) {
	    /// <param name="name" type="String"></param>
	    /// <param name="primKey" type="IndexSpec"></param>
	    /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
	    /// <param name="instanceTemplate" type="Object"></param>
	    this.name = name;
	    this.primKey = primKey || new IndexSpec();
	    this.indexes = indexes || [new IndexSpec()];
	    this.instanceTemplate = instanceTemplate;
	    this.mappedClass = null;
	    this.idxByName = arrayToObject(indexes, function (index) {
	        return [index.name, index];
	    });
	}

	// Used in when defining dependencies later...
	// (If IndexedDBShim is loaded, prefer it before standard indexedDB)
	var idbshim = _global.idbModules && _global.idbModules.shimIndexedDB ? _global.idbModules : {};

	function safariMultiStoreFix(storeNames) {
	    return storeNames.length === 1 ? storeNames[0] : storeNames;
	}

	function getNativeGetDatabaseNamesFn(indexedDB) {
	    var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
	    return fn && fn.bind(indexedDB);
	}

	// Export Error classes
	props(Dexie, fullNameExceptions); // Dexie.XXXError = class XXXError {...};

	//
	// Static methods and properties
	//
	props(Dexie, {

	    //
	    // Static delete() method.
	    //
	    delete: function (databaseName) {
	        var db = new Dexie(databaseName),
	            promise = db.delete();
	        promise.onblocked = function (fn) {
	            db.on("blocked", fn);
	            return this;
	        };
	        return promise;
	    },

	    //
	    // Static exists() method.
	    //
	    exists: function (name) {
	        return new Dexie(name).open().then(function (db) {
	            db.close();
	            return true;
	        }).catch(Dexie.NoSuchDatabaseError, function () {
	            return false;
	        });
	    },

	    //
	    // Static method for retrieving a list of all existing databases at current host.
	    //
	    getDatabaseNames: function (cb) {
	        return new Promise(function (resolve, reject) {
	            var getDatabaseNames = getNativeGetDatabaseNamesFn(indexedDB);
	            if (getDatabaseNames) {
	                // In case getDatabaseNames() becomes standard, let's prepare to support it:
	                var req = getDatabaseNames();
	                req.onsuccess = function (event) {
	                    resolve(slice(event.target.result, 0)); // Converst DOMStringList to Array<String>
	                };
	                req.onerror = eventRejectHandler(reject);
	            } else {
	                globalDatabaseList(function (val) {
	                    resolve(val);
	                    return false;
	                });
	            }
	        }).then(cb);
	    },

	    defineClass: function (structure) {
	        /// <summary>
	        ///     Create a javascript constructor based on given template for which properties to expect in the class.
	        ///     Any property that is a constructor function will act as a type. So {name: String} will be equal to {name: new String()}.
	        /// </summary>
	        /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
	        /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>

	        // Default constructor able to copy given properties into this object.
	        function Class(properties) {
	            /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
	            /// </param>
	            properties ? extend(this, properties) : fake && applyStructure(this, structure);
	        }
	        return Class;
	    },

	    applyStructure: applyStructure,

	    ignoreTransaction: function (scopeFunc) {
	        // In case caller is within a transaction but needs to create a separate transaction.
	        // Example of usage:
	        //
	        // Let's say we have a logger function in our app. Other application-logic should be unaware of the
	        // logger function and not need to include the 'logentries' table in all transaction it performs.
	        // The logging should always be done in a separate transaction and not be dependant on the current
	        // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
	        //
	        //     Dexie.ignoreTransaction(function() {
	        //         db.logentries.add(newLogEntry);
	        //     });
	        //
	        // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
	        // in current Promise-scope.
	        //
	        // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
	        // API for this because
	        //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
	        //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
	        //  3) setImmediate() is not supported in the ES standard.
	        //  4) You might want to keep other PSD state that was set in a parent PSD, such as PSD.letThrough.
	        return PSD.trans ? usePSD(PSD.transless, scopeFunc) : // Use the closest parent that was non-transactional.
	        scopeFunc(); // No need to change scope because there is no ongoing transaction.
	    },

	    vip: function (fn) {
	        // To be used by subscribers to the on('ready') event.
	        // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
	        // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
	        // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
	        // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
	        // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
	        // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
	        // the caller will not resolve until database is opened.
	        return newScope(function () {
	            PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
	            return fn();
	        });
	    },

	    async: function (generatorFn) {
	        return function () {
	            try {
	                var rv = awaitIterator(generatorFn.apply(this, arguments));
	                if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
	                return rv;
	            } catch (e) {
	                return rejection(e);
	            }
	        };
	    },

	    spawn: function (generatorFn, args, thiz) {
	        try {
	            var rv = awaitIterator(generatorFn.apply(thiz, args || []));
	            if (!rv || typeof rv.then !== 'function') return Promise.resolve(rv);
	            return rv;
	        } catch (e) {
	            return rejection(e);
	        }
	    },

	    // Dexie.currentTransaction property
	    currentTransaction: {
	        get: function () {
	            return PSD.trans || null;
	        }
	    },

	    // Export our Promise implementation since it can be handy as a standalone Promise implementation
	    Promise: Promise,

	    // Dexie.debug proptery:
	    // Dexie.debug = false
	    // Dexie.debug = true
	    // Dexie.debug = "dexie" - don't hide dexie's stack frames.
	    debug: {
	        get: function () {
	            return debug;
	        },
	        set: function (value) {
	            setDebug(value, value === 'dexie' ? function () {
	                return true;
	            } : dexieStackFrameFilter);
	        }
	    },

	    // Export our derive/extend/override methodology
	    derive: derive,
	    extend: extend,
	    props: props,
	    override: override,
	    // Export our Events() function - can be handy as a toolkit
	    Events: Events,
	    events: { get: deprecated(function () {
	            return Events;
	        }) }, // Backward compatible lowercase version.
	    // Utilities
	    getByKeyPath: getByKeyPath,
	    setByKeyPath: setByKeyPath,
	    delByKeyPath: delByKeyPath,
	    shallowClone: shallowClone,
	    deepClone: deepClone,
	    getObjectDiff: getObjectDiff,
	    asap: asap,
	    maxKey: maxKey,
	    // Addon registry
	    addons: [],
	    // Global DB connection list
	    connections: connections,

	    MultiModifyError: exceptions.Modify, // Backward compatibility 0.9.8. Deprecate.
	    errnames: errnames,

	    // Export other static classes
	    IndexSpec: IndexSpec,
	    TableSchema: TableSchema,

	    //
	    // Dependencies
	    //
	    // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
	    //
	    // In node.js, however, these properties must be set "manually" before instansiating a new Dexie().
	    // For node.js, you need to require indexeddb-js or similar and then set these deps.
	    //
	    dependencies: {
	        // Required:
	        indexedDB: idbshim.shimIndexedDB || _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
	        IDBKeyRange: idbshim.IDBKeyRange || _global.IDBKeyRange || _global.webkitIDBKeyRange
	    },

	    // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
	    semVer: DEXIE_VERSION,
	    version: DEXIE_VERSION.split('.').map(function (n) {
	        return parseInt(n);
	    }).reduce(function (p, c, i) {
	        return p + c / Math.pow(10, i * 2);
	    }),
	    fakeAutoComplete: fakeAutoComplete,

	    // https://github.com/dfahlander/Dexie.js/issues/186
	    // typescript compiler tsc in mode ts-->es5 & commonJS, will expect require() to return
	    // x.default. Workaround: Set Dexie.default = Dexie.
	    default: Dexie
	});

	tryCatch(function () {
	    // Optional dependencies
	    // localStorage
	    Dexie.dependencies.localStorage = (typeof chrome !== "undefined" && chrome !== null ? chrome.storage : void 0) != null ? null : _global.localStorage;
	});

	// Map DOMErrors and DOMExceptions to corresponding Dexie errors. May change in Dexie v2.0.
	Promise.rejectionMapper = mapError;

	// Fool IDE to improve autocomplete. Tested with Visual Studio 2013 and 2015.
	doFakeAutoComplete(function () {
	    Dexie.fakeAutoComplete = fakeAutoComplete = doFakeAutoComplete;
	    Dexie.fake = fake = true;
	});

	return Dexie;

	})));
	//# sourceMappingURL=dexie.js.map

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(2).setImmediate))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// setimmediate attaches itself to the global object
	__webpack_require__(3);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(4)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Q = __webpack_require__(6);

	var _require = __webpack_require__(7),
	    getIDBError = _require.getIDBError,
	    Cursor = __webpack_require__(15),
	    _aggregate = __webpack_require__(93),
	    _update = __webpack_require__(94),
	    _remove = __webpack_require__(95);

	/** Class representing a collection. */


	var Collection = function () {
	    /** <strong>Note:</strong> Do not instantiate directly. */
	    function Collection(db, name) {
	        _classCallCheck(this, Collection);

	        this._db = db;
	        this._name = name;
	        this._indexes = new Set();
	    }

	    /**
	     * The name of the collection.
	     * @type {string}
	     */


	    _createClass(Collection, [{
	        key: '_isIndexed',
	        value: function _isIndexed(path) {
	            return this._indexes.has(path) || path === '_id';
	        }

	        /**
	         * Open a cursor and optionally filter documents and apply a projection.
	         * @param {object} [expr] The query document to filter by.
	         * @param {object} [projection_spec] Specification for projection.
	         * @return {Cursor}
	         *
	         * @example
	         * col.find({ x: 4, g: { $lt: 10 } }, { k: 0 });
	         */

	    }, {
	        key: 'find',
	        value: function find(expr, projection_spec) {
	            var cur = new Cursor(this, 'readonly');

	            cur.filter(expr);

	            if (projection_spec) {
	                cur.project(projection_spec);
	            }

	            return cur;
	        }
	    }, {
	        key: 'findOne',
	        value: function findOne(expr, projection_spec) {
	            var cur = new Cursor(this, 'readonly');

	            cur.limit(1).filter(expr);

	            if (projection_spec) {
	                cur.project(projection_spec);
	            }

	            return cur;
	        }
	    }, {
	        key: 'count',
	        value: function count(expr, cb) {
	            if (typeof expr == 'function') {
	                cb = expr;
	                expr = {};
	            }
	            var cur = new Cursor(this, 'readonly');
	            return cur.count(expr, cb);
	        }
	    }, {
	        key: 'drop',
	        value: function drop(cb) {
	            var _this = this;

	            var deferred = Q.defer();
	            var trans = void 0;
	            this._db._getConn(function (error, idb) {
	                _this.count().then(function (count) {
	                    try {
	                        trans = idb.transaction([_this.name], 'readwrite');
	                    } catch (error) {
	                        return deferred.reject(error);
	                    }
	                    var objectStore = trans.objectStore(_this.name);
	                    objectStore.clear();
	                    deferred.resolve({ deletedCount: count, result: {} });
	                });
	            });

	            deferred.promise.nodeify(cb);
	            return deferred.promise;
	        }

	        /**
	         * Evaluate an aggregation framework pipeline.
	         * @param {object[]} pipeline The pipeline.
	         * @return {Cursor}
	         *
	         * @example
	         * col.aggregate([
	         *     { $match: { x: { $lt: 8 } } },
	         *     { $group: { _id: '$x', array: { $push: '$y' } } },
	         *     { $unwind: '$array' }
	         * ]);
	         */

	    }, {
	        key: 'aggregate',
	        value: function aggregate(pipeline) {
	            return _aggregate(this, pipeline);
	        }
	    }, {
	        key: '_validate',
	        value: function _validate(doc) {
	            for (var field in doc) {
	                if (field[0] === '$') {
	                    throw Error("field name cannot start with '$'");
	                }

	                var value = doc[field];

	                if (Array.isArray(value)) {
	                    var _iteratorNormalCompletion = true;
	                    var _didIteratorError = false;
	                    var _iteratorError = undefined;

	                    try {
	                        for (var _iterator = value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                            var element = _step.value;

	                            this._validate(element);
	                        }
	                    } catch (err) {
	                        _didIteratorError = true;
	                        _iteratorError = err;
	                    } finally {
	                        try {
	                            if (!_iteratorNormalCompletion && _iterator.return) {
	                                _iterator.return();
	                            }
	                        } finally {
	                            if (_didIteratorError) {
	                                throw _iteratorError;
	                            }
	                        }
	                    }
	                } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
	                    this._validate(value);
	                }
	            }
	        }

	        /**
	         * @param {object|object[]} docs Documents to insert.
	         * @param {function} [cb] The result callback.
	         * @return {Promise}
	         *
	         * @example
	         * col.insert([{ x: 4 }, { k: 8 }], (error) => {
	         *     if (error) { throw error; }
	         * });
	         *
	         * @example
	         * col.insert({ x: 4 }, (error) => {
	         *     if (error) { throw error; }
	         * });
	         */

	    }, {
	        key: 'insert',
	        value: function insert(docs, cb) {
	            var _this2 = this;

	            if (!Array.isArray(docs)) {
	                docs = [docs];
	            }

	            var deferred = Q.defer();

	            this._db._getConn(function (error, idb) {
	                var trans = void 0;

	                var name = _this2._name;

	                try {
	                    trans = idb.transaction([name], 'readwrite');
	                } catch (error) {
	                    return deferred.reject(error);
	                }

	                trans.oncomplete = function () {
	                    return deferred.resolve({ nInserted: docs.length });
	                };
	                trans.onerror = function (e) {
	                    return deferred.reject(getIDBError(e));
	                };

	                var store = trans.objectStore(name);

	                var i = 0;

	                var iterate = function iterate() {
	                    var doc = docs[i];

	                    try {
	                        _this2._validate(doc);
	                    } catch (error) {
	                        return deferred.reject(error);
	                    }

	                    var req = store.add(doc);

	                    req.onsuccess = function () {
	                        i++;

	                        if (i < docs.length) {
	                            iterate();
	                        }
	                    };
	                };

	                iterate();
	            });

	            deferred.promise.nodeify(cb);

	            return deferred.promise;
	        }
	    }, {
	        key: '_modify',
	        value: function _modify(fn, expr, cb) {
	            var deferred = Q.defer();
	            var cur = new Cursor(this, 'readwrite');

	            cur.filter(expr);

	            fn(cur, function (error) {
	                if (error) {
	                    deferred.reject(error);
	                } else {
	                    deferred.resolve();
	                }
	            });

	            deferred.promise.nodeify(cb);

	            return deferred.promise;
	        }

	        /**
	         * Update documents that match a filter.
	         * @param {object} expr The query document to filter by.
	         * @param {object} spec Specification for updating.
	         * @param {function} [cb] The result callback.
	         * @return {Promise}
	         *
	         * @example
	         * col.update({
	         *     age: { $gte: 18 }
	         * }, {
	         *     adult: true
	         * }, (error) => {
	         *     if (error) { throw error; }
	         * });
	         */

	    }, {
	        key: 'update',
	        value: function update(expr, spec, cb) {
	            var fn = function fn(cur, cb) {
	                return _update(cur, spec, cb);
	            };

	            return this._modify(fn, expr, cb);
	        }

	        /**
	         * Delete documents that match a filter.
	         * @param {object} expr The query document to filter by.
	         * @param {function} [cb] The result callback.
	         * @return {Promise}
	         *
	         * @example
	         * col.remove({ x: { $ne: 10 } }, (error) => {
	         *     if (error) { throw error; }
	         * });
	         */

	    }, {
	        key: 'remove',
	        value: function remove(expr, cb) {
	            return this._modify(_remove, expr, cb);
	        }
	    }, {
	        key: 'name',
	        get: function get() {
	            return this._name;
	        }
	    }]);

	    return Collection;
	}();

	module.exports = Collection;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// vim:ts=4:sts=4:sw=4:
	/*!
	 *
	 * Copyright 2009-2017 Kris Kowal under the terms of the MIT
	 * license found at https://github.com/kriskowal/q/blob/v1/LICENSE
	 *
	 * With parts by Tyler Close
	 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
	 * at http://www.opensource.org/licenses/mit-license.html
	 * Forked at ref_send.js version: 2009-05-11
	 *
	 * With parts by Mark Miller
	 * Copyright (C) 2011 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */

	(function (definition) {
	    "use strict";

	    // This file will function properly as a <script> tag, or a module
	    // using CommonJS and NodeJS or RequireJS module formats.  In
	    // Common/Node/RequireJS, the module exports the Q API and when
	    // executed as a simple <script>, it creates a Q global instead.

	    // Montage Require
	    if (typeof bootstrap === "function") {
	        bootstrap("promise", definition);

	    // CommonJS
	    } else if (true) {
	        module.exports = definition();

	    // RequireJS
	    } else if (typeof define === "function" && define.amd) {
	        define(definition);

	    // SES (Secure EcmaScript)
	    } else if (typeof ses !== "undefined") {
	        if (!ses.ok()) {
	            return;
	        } else {
	            ses.makeQ = definition;
	        }

	    // <script>
	    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
	        // Prefer window over self for add-on scripts. Use self for
	        // non-windowed contexts.
	        var global = typeof window !== "undefined" ? window : self;

	        // Get the `window` object, save the previous Q global
	        // and initialize Q as a global.
	        var previousQ = global.Q;
	        global.Q = definition();

	        // Add a noConflict function so Q can be removed from the
	        // global namespace.
	        global.Q.noConflict = function () {
	            global.Q = previousQ;
	            return this;
	        };

	    } else {
	        throw new Error("This environment was not anticipated by Q. Please file a bug.");
	    }

	})(function () {
	"use strict";

	var hasStacks = false;
	try {
	    throw new Error();
	} catch (e) {
	    hasStacks = !!e.stack;
	}

	// All code after this point will be filtered from stack traces reported
	// by Q.
	var qStartingLine = captureLine();
	var qFileName;

	// shims

	// used for fallback in "allResolved"
	var noop = function () {};

	// Use the fastest possible means to execute a task in a future turn
	// of the event loop.
	var nextTick =(function () {
	    // linked list of tasks (single, with head node)
	    var head = {task: void 0, next: null};
	    var tail = head;
	    var flushing = false;
	    var requestTick = void 0;
	    var isNodeJS = false;
	    // queue for late tasks, used by unhandled rejection tracking
	    var laterQueue = [];

	    function flush() {
	        /* jshint loopfunc: true */
	        var task, domain;

	        while (head.next) {
	            head = head.next;
	            task = head.task;
	            head.task = void 0;
	            domain = head.domain;

	            if (domain) {
	                head.domain = void 0;
	                domain.enter();
	            }
	            runSingle(task, domain);

	        }
	        while (laterQueue.length) {
	            task = laterQueue.pop();
	            runSingle(task);
	        }
	        flushing = false;
	    }
	    // runs a single function in the async queue
	    function runSingle(task, domain) {
	        try {
	            task();

	        } catch (e) {
	            if (isNodeJS) {
	                // In node, uncaught exceptions are considered fatal errors.
	                // Re-throw them synchronously to interrupt flushing!

	                // Ensure continuation if the uncaught exception is suppressed
	                // listening "uncaughtException" events (as domains does).
	                // Continue in next event to avoid tick recursion.
	                if (domain) {
	                    domain.exit();
	                }
	                setTimeout(flush, 0);
	                if (domain) {
	                    domain.enter();
	                }

	                throw e;

	            } else {
	                // In browsers, uncaught exceptions are not fatal.
	                // Re-throw them asynchronously to avoid slow-downs.
	                setTimeout(function () {
	                    throw e;
	                }, 0);
	            }
	        }

	        if (domain) {
	            domain.exit();
	        }
	    }

	    nextTick = function (task) {
	        tail = tail.next = {
	            task: task,
	            domain: isNodeJS && process.domain,
	            next: null
	        };

	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };

	    if (typeof process === "object" &&
	        process.toString() === "[object process]" && process.nextTick) {
	        // Ensure Q is in a real Node environment, with a `process.nextTick`.
	        // To see through fake Node environments:
	        // * Mocha test runner - exposes a `process` global without a `nextTick`
	        // * Browserify - exposes a `process.nexTick` function that uses
	        //   `setTimeout`. In this case `setImmediate` is preferred because
	        //    it is faster. Browserify's `process.toString()` yields
	        //   "[object Object]", while in a real Node environment
	        //   `process.toString()` yields "[object process]".
	        isNodeJS = true;

	        requestTick = function () {
	            process.nextTick(flush);
	        };

	    } else if (typeof setImmediate === "function") {
	        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
	        if (typeof window !== "undefined") {
	            requestTick = setImmediate.bind(window, flush);
	        } else {
	            requestTick = function () {
	                setImmediate(flush);
	            };
	        }

	    } else if (typeof MessageChannel !== "undefined") {
	        // modern browsers
	        // http://www.nonblocking.io/2011/06/windownexttick.html
	        var channel = new MessageChannel();
	        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
	        // working message ports the first time a page loads.
	        channel.port1.onmessage = function () {
	            requestTick = requestPortTick;
	            channel.port1.onmessage = flush;
	            flush();
	        };
	        var requestPortTick = function () {
	            // Opera requires us to provide a message payload, regardless of
	            // whether we use it.
	            channel.port2.postMessage(0);
	        };
	        requestTick = function () {
	            setTimeout(flush, 0);
	            requestPortTick();
	        };

	    } else {
	        // old browsers
	        requestTick = function () {
	            setTimeout(flush, 0);
	        };
	    }
	    // runs a task after all other tasks have been run
	    // this is useful for unhandled rejection tracking that needs to happen
	    // after all `then`d tasks have been run.
	    nextTick.runAfter = function (task) {
	        laterQueue.push(task);
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	    return nextTick;
	})();

	// Attempt to make generics safe in the face of downstream
	// modifications.
	// There is no situation where this is necessary.
	// If you need a security guarantee, these primordials need to be
	// deeply frozen anyway, and if you don’t need a security guarantee,
	// this is just plain paranoid.
	// However, this **might** have the nice side-effect of reducing the size of
	// the minified code by reducing x.call() to merely x()
	// See Mark Miller’s explanation of what this does.
	// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
	var call = Function.call;
	function uncurryThis(f) {
	    return function () {
	        return call.apply(f, arguments);
	    };
	}
	// This is equivalent, but slower:
	// uncurryThis = Function_bind.bind(Function_bind.call);
	// http://jsperf.com/uncurrythis

	var array_slice = uncurryThis(Array.prototype.slice);

	var array_reduce = uncurryThis(
	    Array.prototype.reduce || function (callback, basis) {
	        var index = 0,
	            length = this.length;
	        // concerning the initial value, if one is not provided
	        if (arguments.length === 1) {
	            // seek to the first value in the array, accounting
	            // for the possibility that is is a sparse array
	            do {
	                if (index in this) {
	                    basis = this[index++];
	                    break;
	                }
	                if (++index >= length) {
	                    throw new TypeError();
	                }
	            } while (1);
	        }
	        // reduce
	        for (; index < length; index++) {
	            // account for the possibility that the array is sparse
	            if (index in this) {
	                basis = callback(basis, this[index], index);
	            }
	        }
	        return basis;
	    }
	);

	var array_indexOf = uncurryThis(
	    Array.prototype.indexOf || function (value) {
	        // not a very good shim, but good enough for our one use of it
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] === value) {
	                return i;
	            }
	        }
	        return -1;
	    }
	);

	var array_map = uncurryThis(
	    Array.prototype.map || function (callback, thisp) {
	        var self = this;
	        var collect = [];
	        array_reduce(self, function (undefined, value, index) {
	            collect.push(callback.call(thisp, value, index, self));
	        }, void 0);
	        return collect;
	    }
	);

	var object_create = Object.create || function (prototype) {
	    function Type() { }
	    Type.prototype = prototype;
	    return new Type();
	};

	var object_defineProperty = Object.defineProperty || function (obj, prop, descriptor) {
	    obj[prop] = descriptor.value;
	    return obj;
	};

	var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

	var object_keys = Object.keys || function (object) {
	    var keys = [];
	    for (var key in object) {
	        if (object_hasOwnProperty(object, key)) {
	            keys.push(key);
	        }
	    }
	    return keys;
	};

	var object_toString = uncurryThis(Object.prototype.toString);

	function isObject(value) {
	    return value === Object(value);
	}

	// generator related shims

	// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
	function isStopIteration(exception) {
	    return (
	        object_toString(exception) === "[object StopIteration]" ||
	        exception instanceof QReturnValue
	    );
	}

	// FIXME: Remove this helper and Q.return once ES6 generators are in
	// SpiderMonkey.
	var QReturnValue;
	if (typeof ReturnValue !== "undefined") {
	    QReturnValue = ReturnValue;
	} else {
	    QReturnValue = function (value) {
	        this.value = value;
	    };
	}

	// long stack traces

	var STACK_JUMP_SEPARATOR = "From previous event:";

	function makeStackTraceLong(error, promise) {
	    // If possible, transform the error stack trace by removing Node and Q
	    // cruft, then concatenating with the stack trace of `promise`. See #57.
	    if (hasStacks &&
	        promise.stack &&
	        typeof error === "object" &&
	        error !== null &&
	        error.stack
	    ) {
	        var stacks = [];
	        for (var p = promise; !!p; p = p.source) {
	            if (p.stack && (!error.__minimumStackCounter__ || error.__minimumStackCounter__ > p.stackCounter)) {
	                object_defineProperty(error, "__minimumStackCounter__", {value: p.stackCounter, configurable: true});
	                stacks.unshift(p.stack);
	            }
	        }
	        stacks.unshift(error.stack);

	        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
	        var stack = filterStackString(concatedStacks);
	        object_defineProperty(error, "stack", {value: stack, configurable: true});
	    }
	}

	function filterStackString(stackString) {
	    var lines = stackString.split("\n");
	    var desiredLines = [];
	    for (var i = 0; i < lines.length; ++i) {
	        var line = lines[i];

	        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
	            desiredLines.push(line);
	        }
	    }
	    return desiredLines.join("\n");
	}

	function isNodeFrame(stackLine) {
	    return stackLine.indexOf("(module.js:") !== -1 ||
	           stackLine.indexOf("(node.js:") !== -1;
	}

	function getFileNameAndLineNumber(stackLine) {
	    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
	    // In IE10 function name can have spaces ("Anonymous function") O_o
	    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
	    if (attempt1) {
	        return [attempt1[1], Number(attempt1[2])];
	    }

	    // Anonymous functions: "at filename:lineNumber:columnNumber"
	    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
	    if (attempt2) {
	        return [attempt2[1], Number(attempt2[2])];
	    }

	    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
	    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
	    if (attempt3) {
	        return [attempt3[1], Number(attempt3[2])];
	    }
	}

	function isInternalFrame(stackLine) {
	    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

	    if (!fileNameAndLineNumber) {
	        return false;
	    }

	    var fileName = fileNameAndLineNumber[0];
	    var lineNumber = fileNameAndLineNumber[1];

	    return fileName === qFileName &&
	        lineNumber >= qStartingLine &&
	        lineNumber <= qEndingLine;
	}

	// discover own file name and line number range for filtering stack
	// traces
	function captureLine() {
	    if (!hasStacks) {
	        return;
	    }

	    try {
	        throw new Error();
	    } catch (e) {
	        var lines = e.stack.split("\n");
	        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
	        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
	        if (!fileNameAndLineNumber) {
	            return;
	        }

	        qFileName = fileNameAndLineNumber[0];
	        return fileNameAndLineNumber[1];
	    }
	}

	function deprecate(callback, name, alternative) {
	    return function () {
	        if (typeof console !== "undefined" &&
	            typeof console.warn === "function") {
	            console.warn(name + " is deprecated, use " + alternative +
	                         " instead.", new Error("").stack);
	        }
	        return callback.apply(callback, arguments);
	    };
	}

	// end of shims
	// beginning of real work

	/**
	 * Constructs a promise for an immediate reference, passes promises through, or
	 * coerces promises from different systems.
	 * @param value immediate reference or promise
	 */
	function Q(value) {
	    // If the object is already a Promise, return it directly.  This enables
	    // the resolve function to both be used to created references from objects,
	    // but to tolerably coerce non-promises to promises.
	    if (value instanceof Promise) {
	        return value;
	    }

	    // assimilate thenables
	    if (isPromiseAlike(value)) {
	        return coerce(value);
	    } else {
	        return fulfill(value);
	    }
	}
	Q.resolve = Q;

	/**
	 * Performs a task in a future turn of the event loop.
	 * @param {Function} task
	 */
	Q.nextTick = nextTick;

	/**
	 * Controls whether or not long stack traces will be on
	 */
	Q.longStackSupport = false;

	/**
	 * The counter is used to determine the stopping point for building
	 * long stack traces. In makeStackTraceLong we walk backwards through
	 * the linked list of promises, only stacks which were created before
	 * the rejection are concatenated.
	 */
	var longStackCounter = 1;

	// enable long stacks if Q_DEBUG is set
	if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
	    Q.longStackSupport = true;
	}

	/**
	 * Constructs a {promise, resolve, reject} object.
	 *
	 * `resolve` is a callback to invoke with a more resolved value for the
	 * promise. To fulfill the promise, invoke `resolve` with any value that is
	 * not a thenable. To reject the promise, invoke `resolve` with a rejected
	 * thenable, or invoke `reject` with the reason directly. To resolve the
	 * promise to another thenable, thus putting it in the same state, invoke
	 * `resolve` with that other thenable.
	 */
	Q.defer = defer;
	function defer() {
	    // if "messages" is an "Array", that indicates that the promise has not yet
	    // been resolved.  If it is "undefined", it has been resolved.  Each
	    // element of the messages array is itself an array of complete arguments to
	    // forward to the resolved promise.  We coerce the resolution value to a
	    // promise using the `resolve` function because it handles both fully
	    // non-thenable values and other thenables gracefully.
	    var messages = [], progressListeners = [], resolvedPromise;

	    var deferred = object_create(defer.prototype);
	    var promise = object_create(Promise.prototype);

	    promise.promiseDispatch = function (resolve, op, operands) {
	        var args = array_slice(arguments);
	        if (messages) {
	            messages.push(args);
	            if (op === "when" && operands[1]) { // progress operand
	                progressListeners.push(operands[1]);
	            }
	        } else {
	            Q.nextTick(function () {
	                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
	            });
	        }
	    };

	    // XXX deprecated
	    promise.valueOf = function () {
	        if (messages) {
	            return promise;
	        }
	        var nearerValue = nearer(resolvedPromise);
	        if (isPromise(nearerValue)) {
	            resolvedPromise = nearerValue; // shorten chain
	        }
	        return nearerValue;
	    };

	    promise.inspect = function () {
	        if (!resolvedPromise) {
	            return { state: "pending" };
	        }
	        return resolvedPromise.inspect();
	    };

	    if (Q.longStackSupport && hasStacks) {
	        try {
	            throw new Error();
	        } catch (e) {
	            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
	            // accessor around; that causes memory leaks as per GH-111. Just
	            // reify the stack trace as a string ASAP.
	            //
	            // At the same time, cut off the first line; it's always just
	            // "[object Promise]\n", as per the `toString`.
	            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
	            promise.stackCounter = longStackCounter++;
	        }
	    }

	    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
	    // consolidating them into `become`, since otherwise we'd create new
	    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

	    function become(newPromise) {
	        resolvedPromise = newPromise;

	        if (Q.longStackSupport && hasStacks) {
	            // Only hold a reference to the new promise if long stacks
	            // are enabled to reduce memory usage
	            promise.source = newPromise;
	        }

	        array_reduce(messages, function (undefined, message) {
	            Q.nextTick(function () {
	                newPromise.promiseDispatch.apply(newPromise, message);
	            });
	        }, void 0);

	        messages = void 0;
	        progressListeners = void 0;
	    }

	    deferred.promise = promise;
	    deferred.resolve = function (value) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(Q(value));
	    };

	    deferred.fulfill = function (value) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(fulfill(value));
	    };
	    deferred.reject = function (reason) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(reject(reason));
	    };
	    deferred.notify = function (progress) {
	        if (resolvedPromise) {
	            return;
	        }

	        array_reduce(progressListeners, function (undefined, progressListener) {
	            Q.nextTick(function () {
	                progressListener(progress);
	            });
	        }, void 0);
	    };

	    return deferred;
	}

	/**
	 * Creates a Node-style callback that will resolve or reject the deferred
	 * promise.
	 * @returns a nodeback
	 */
	defer.prototype.makeNodeResolver = function () {
	    var self = this;
	    return function (error, value) {
	        if (error) {
	            self.reject(error);
	        } else if (arguments.length > 2) {
	            self.resolve(array_slice(arguments, 1));
	        } else {
	            self.resolve(value);
	        }
	    };
	};

	/**
	 * @param resolver {Function} a function that returns nothing and accepts
	 * the resolve, reject, and notify functions for a deferred.
	 * @returns a promise that may be resolved with the given resolve and reject
	 * functions, or rejected by a thrown exception in resolver
	 */
	Q.Promise = promise; // ES6
	Q.promise = promise;
	function promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("resolver must be a function.");
	    }
	    var deferred = defer();
	    try {
	        resolver(deferred.resolve, deferred.reject, deferred.notify);
	    } catch (reason) {
	        deferred.reject(reason);
	    }
	    return deferred.promise;
	}

	promise.race = race; // ES6
	promise.all = all; // ES6
	promise.reject = reject; // ES6
	promise.resolve = Q; // ES6

	// XXX experimental.  This method is a way to denote that a local value is
	// serializable and should be immediately dispatched to a remote upon request,
	// instead of passing a reference.
	Q.passByCopy = function (object) {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return object;
	};

	Promise.prototype.passByCopy = function () {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return this;
	};

	/**
	 * If two promises eventually fulfill to the same value, promises that value,
	 * but otherwise rejects.
	 * @param x {Any*}
	 * @param y {Any*}
	 * @returns {Any*} a promise for x and y if they are the same, but a rejection
	 * otherwise.
	 *
	 */
	Q.join = function (x, y) {
	    return Q(x).join(y);
	};

	Promise.prototype.join = function (that) {
	    return Q([this, that]).spread(function (x, y) {
	        if (x === y) {
	            // TODO: "===" should be Object.is or equiv
	            return x;
	        } else {
	            throw new Error("Q can't join: not the same: " + x + " " + y);
	        }
	    });
	};

	/**
	 * Returns a promise for the first of an array of promises to become settled.
	 * @param answers {Array[Any*]} promises to race
	 * @returns {Any*} the first promise to be settled
	 */
	Q.race = race;
	function race(answerPs) {
	    return promise(function (resolve, reject) {
	        // Switch to this once we can assume at least ES5
	        // answerPs.forEach(function (answerP) {
	        //     Q(answerP).then(resolve, reject);
	        // });
	        // Use this in the meantime
	        for (var i = 0, len = answerPs.length; i < len; i++) {
	            Q(answerPs[i]).then(resolve, reject);
	        }
	    });
	}

	Promise.prototype.race = function () {
	    return this.then(Q.race);
	};

	/**
	 * Constructs a Promise with a promise descriptor object and optional fallback
	 * function.  The descriptor contains methods like when(rejected), get(name),
	 * set(name, value), post(name, args), and delete(name), which all
	 * return either a value, a promise for a value, or a rejection.  The fallback
	 * accepts the operation name, a resolver, and any further arguments that would
	 * have been forwarded to the appropriate method above had a method been
	 * provided with the proper name.  The API makes no guarantees about the nature
	 * of the returned object, apart from that it is usable whereever promises are
	 * bought and sold.
	 */
	Q.makePromise = Promise;
	function Promise(descriptor, fallback, inspect) {
	    if (fallback === void 0) {
	        fallback = function (op) {
	            return reject(new Error(
	                "Promise does not support operation: " + op
	            ));
	        };
	    }
	    if (inspect === void 0) {
	        inspect = function () {
	            return {state: "unknown"};
	        };
	    }

	    var promise = object_create(Promise.prototype);

	    promise.promiseDispatch = function (resolve, op, args) {
	        var result;
	        try {
	            if (descriptor[op]) {
	                result = descriptor[op].apply(promise, args);
	            } else {
	                result = fallback.call(promise, op, args);
	            }
	        } catch (exception) {
	            result = reject(exception);
	        }
	        if (resolve) {
	            resolve(result);
	        }
	    };

	    promise.inspect = inspect;

	    // XXX deprecated `valueOf` and `exception` support
	    if (inspect) {
	        var inspected = inspect();
	        if (inspected.state === "rejected") {
	            promise.exception = inspected.reason;
	        }

	        promise.valueOf = function () {
	            var inspected = inspect();
	            if (inspected.state === "pending" ||
	                inspected.state === "rejected") {
	                return promise;
	            }
	            return inspected.value;
	        };
	    }

	    return promise;
	}

	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};

	Promise.prototype.then = function (fulfilled, rejected, progressed) {
	    var self = this;
	    var deferred = defer();
	    var done = false;   // ensure the untrusted promise makes at most a
	                        // single call to one of the callbacks

	    function _fulfilled(value) {
	        try {
	            return typeof fulfilled === "function" ? fulfilled(value) : value;
	        } catch (exception) {
	            return reject(exception);
	        }
	    }

	    function _rejected(exception) {
	        if (typeof rejected === "function") {
	            makeStackTraceLong(exception, self);
	            try {
	                return rejected(exception);
	            } catch (newException) {
	                return reject(newException);
	            }
	        }
	        return reject(exception);
	    }

	    function _progressed(value) {
	        return typeof progressed === "function" ? progressed(value) : value;
	    }

	    Q.nextTick(function () {
	        self.promiseDispatch(function (value) {
	            if (done) {
	                return;
	            }
	            done = true;

	            deferred.resolve(_fulfilled(value));
	        }, "when", [function (exception) {
	            if (done) {
	                return;
	            }
	            done = true;

	            deferred.resolve(_rejected(exception));
	        }]);
	    });

	    // Progress propagator need to be attached in the current tick.
	    self.promiseDispatch(void 0, "when", [void 0, function (value) {
	        var newValue;
	        var threw = false;
	        try {
	            newValue = _progressed(value);
	        } catch (e) {
	            threw = true;
	            if (Q.onerror) {
	                Q.onerror(e);
	            } else {
	                throw e;
	            }
	        }

	        if (!threw) {
	            deferred.notify(newValue);
	        }
	    }]);

	    return deferred.promise;
	};

	Q.tap = function (promise, callback) {
	    return Q(promise).tap(callback);
	};

	/**
	 * Works almost like "finally", but not called for rejections.
	 * Original resolution value is passed through callback unaffected.
	 * Callback may return a promise that will be awaited for.
	 * @param {Function} callback
	 * @returns {Q.Promise}
	 * @example
	 * doSomething()
	 *   .then(...)
	 *   .tap(console.log)
	 *   .then(...);
	 */
	Promise.prototype.tap = function (callback) {
	    callback = Q(callback);

	    return this.then(function (value) {
	        return callback.fcall(value).thenResolve(value);
	    });
	};

	/**
	 * Registers an observer on a promise.
	 *
	 * Guarantees:
	 *
	 * 1. that fulfilled and rejected will be called only once.
	 * 2. that either the fulfilled callback or the rejected callback will be
	 *    called, but not both.
	 * 3. that fulfilled and rejected will not be called in this turn.
	 *
	 * @param value      promise or immediate reference to observe
	 * @param fulfilled  function to be called with the fulfilled value
	 * @param rejected   function to be called with the rejection exception
	 * @param progressed function to be called on any progress notifications
	 * @return promise for the return value from the invoked callback
	 */
	Q.when = when;
	function when(value, fulfilled, rejected, progressed) {
	    return Q(value).then(fulfilled, rejected, progressed);
	}

	Promise.prototype.thenResolve = function (value) {
	    return this.then(function () { return value; });
	};

	Q.thenResolve = function (promise, value) {
	    return Q(promise).thenResolve(value);
	};

	Promise.prototype.thenReject = function (reason) {
	    return this.then(function () { throw reason; });
	};

	Q.thenReject = function (promise, reason) {
	    return Q(promise).thenReject(reason);
	};

	/**
	 * If an object is not a promise, it is as "near" as possible.
	 * If a promise is rejected, it is as "near" as possible too.
	 * If it’s a fulfilled promise, the fulfillment value is nearer.
	 * If it’s a deferred promise and the deferred has been resolved, the
	 * resolution is "nearer".
	 * @param object
	 * @returns most resolved (nearest) form of the object
	 */

	// XXX should we re-do this?
	Q.nearer = nearer;
	function nearer(value) {
	    if (isPromise(value)) {
	        var inspected = value.inspect();
	        if (inspected.state === "fulfilled") {
	            return inspected.value;
	        }
	    }
	    return value;
	}

	/**
	 * @returns whether the given object is a promise.
	 * Otherwise it is a fulfilled value.
	 */
	Q.isPromise = isPromise;
	function isPromise(object) {
	    return object instanceof Promise;
	}

	Q.isPromiseAlike = isPromiseAlike;
	function isPromiseAlike(object) {
	    return isObject(object) && typeof object.then === "function";
	}

	/**
	 * @returns whether the given object is a pending promise, meaning not
	 * fulfilled or rejected.
	 */
	Q.isPending = isPending;
	function isPending(object) {
	    return isPromise(object) && object.inspect().state === "pending";
	}

	Promise.prototype.isPending = function () {
	    return this.inspect().state === "pending";
	};

	/**
	 * @returns whether the given object is a value or fulfilled
	 * promise.
	 */
	Q.isFulfilled = isFulfilled;
	function isFulfilled(object) {
	    return !isPromise(object) || object.inspect().state === "fulfilled";
	}

	Promise.prototype.isFulfilled = function () {
	    return this.inspect().state === "fulfilled";
	};

	/**
	 * @returns whether the given object is a rejected promise.
	 */
	Q.isRejected = isRejected;
	function isRejected(object) {
	    return isPromise(object) && object.inspect().state === "rejected";
	}

	Promise.prototype.isRejected = function () {
	    return this.inspect().state === "rejected";
	};

	//// BEGIN UNHANDLED REJECTION TRACKING

	// This promise library consumes exceptions thrown in handlers so they can be
	// handled by a subsequent promise.  The exceptions get added to this array when
	// they are created, and removed when they are handled.  Note that in ES6 or
	// shimmed environments, this would naturally be a `Set`.
	var unhandledReasons = [];
	var unhandledRejections = [];
	var reportedUnhandledRejections = [];
	var trackUnhandledRejections = true;

	function resetUnhandledRejections() {
	    unhandledReasons.length = 0;
	    unhandledRejections.length = 0;

	    if (!trackUnhandledRejections) {
	        trackUnhandledRejections = true;
	    }
	}

	function trackRejection(promise, reason) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	    if (typeof process === "object" && typeof process.emit === "function") {
	        Q.nextTick.runAfter(function () {
	            if (array_indexOf(unhandledRejections, promise) !== -1) {
	                process.emit("unhandledRejection", reason, promise);
	                reportedUnhandledRejections.push(promise);
	            }
	        });
	    }

	    unhandledRejections.push(promise);
	    if (reason && typeof reason.stack !== "undefined") {
	        unhandledReasons.push(reason.stack);
	    } else {
	        unhandledReasons.push("(no stack) " + reason);
	    }
	}

	function untrackRejection(promise) {
	    if (!trackUnhandledRejections) {
	        return;
	    }

	    var at = array_indexOf(unhandledRejections, promise);
	    if (at !== -1) {
	        if (typeof process === "object" && typeof process.emit === "function") {
	            Q.nextTick.runAfter(function () {
	                var atReport = array_indexOf(reportedUnhandledRejections, promise);
	                if (atReport !== -1) {
	                    process.emit("rejectionHandled", unhandledReasons[at], promise);
	                    reportedUnhandledRejections.splice(atReport, 1);
	                }
	            });
	        }
	        unhandledRejections.splice(at, 1);
	        unhandledReasons.splice(at, 1);
	    }
	}

	Q.resetUnhandledRejections = resetUnhandledRejections;

	Q.getUnhandledReasons = function () {
	    // Make a copy so that consumers can't interfere with our internal state.
	    return unhandledReasons.slice();
	};

	Q.stopUnhandledRejectionTracking = function () {
	    resetUnhandledRejections();
	    trackUnhandledRejections = false;
	};

	resetUnhandledRejections();

	//// END UNHANDLED REJECTION TRACKING

	/**
	 * Constructs a rejected promise.
	 * @param reason value describing the failure
	 */
	Q.reject = reject;
	function reject(reason) {
	    var rejection = Promise({
	        "when": function (rejected) {
	            // note that the error has been handled
	            if (rejected) {
	                untrackRejection(this);
	            }
	            return rejected ? rejected(reason) : this;
	        }
	    }, function fallback() {
	        return this;
	    }, function inspect() {
	        return { state: "rejected", reason: reason };
	    });

	    // Note that the reason has not been handled.
	    trackRejection(rejection, reason);

	    return rejection;
	}

	/**
	 * Constructs a fulfilled promise for an immediate reference.
	 * @param value immediate reference
	 */
	Q.fulfill = fulfill;
	function fulfill(value) {
	    return Promise({
	        "when": function () {
	            return value;
	        },
	        "get": function (name) {
	            return value[name];
	        },
	        "set": function (name, rhs) {
	            value[name] = rhs;
	        },
	        "delete": function (name) {
	            delete value[name];
	        },
	        "post": function (name, args) {
	            // Mark Miller proposes that post with no name should apply a
	            // promised function.
	            if (name === null || name === void 0) {
	                return value.apply(void 0, args);
	            } else {
	                return value[name].apply(value, args);
	            }
	        },
	        "apply": function (thisp, args) {
	            return value.apply(thisp, args);
	        },
	        "keys": function () {
	            return object_keys(value);
	        }
	    }, void 0, function inspect() {
	        return { state: "fulfilled", value: value };
	    });
	}

	/**
	 * Converts thenables to Q promises.
	 * @param promise thenable promise
	 * @returns a Q promise
	 */
	function coerce(promise) {
	    var deferred = defer();
	    Q.nextTick(function () {
	        try {
	            promise.then(deferred.resolve, deferred.reject, deferred.notify);
	        } catch (exception) {
	            deferred.reject(exception);
	        }
	    });
	    return deferred.promise;
	}

	/**
	 * Annotates an object such that it will never be
	 * transferred away from this process over any promise
	 * communication channel.
	 * @param object
	 * @returns promise a wrapping of that object that
	 * additionally responds to the "isDef" message
	 * without a rejection.
	 */
	Q.master = master;
	function master(object) {
	    return Promise({
	        "isDef": function () {}
	    }, function fallback(op, args) {
	        return dispatch(object, op, args);
	    }, function () {
	        return Q(object).inspect();
	    });
	}

	/**
	 * Spreads the values of a promised array of arguments into the
	 * fulfillment callback.
	 * @param fulfilled callback that receives variadic arguments from the
	 * promised array
	 * @param rejected callback that receives the exception if the promise
	 * is rejected.
	 * @returns a promise for the return value or thrown exception of
	 * either callback.
	 */
	Q.spread = spread;
	function spread(value, fulfilled, rejected) {
	    return Q(value).spread(fulfilled, rejected);
	}

	Promise.prototype.spread = function (fulfilled, rejected) {
	    return this.all().then(function (array) {
	        return fulfilled.apply(void 0, array);
	    }, rejected);
	};

	/**
	 * The async function is a decorator for generator functions, turning
	 * them into asynchronous generators.  Although generators are only part
	 * of the newest ECMAScript 6 drafts, this code does not cause syntax
	 * errors in older engines.  This code should continue to work and will
	 * in fact improve over time as the language improves.
	 *
	 * ES6 generators are currently part of V8 version 3.19 with the
	 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
	 * for longer, but under an older Python-inspired form.  This function
	 * works on both kinds of generators.
	 *
	 * Decorates a generator function such that:
	 *  - it may yield promises
	 *  - execution will continue when that promise is fulfilled
	 *  - the value of the yield expression will be the fulfilled value
	 *  - it returns a promise for the return value (when the generator
	 *    stops iterating)
	 *  - the decorated function returns a promise for the return value
	 *    of the generator or the first rejected promise among those
	 *    yielded.
	 *  - if an error is thrown in the generator, it propagates through
	 *    every following yield until it is caught, or until it escapes
	 *    the generator function altogether, and is translated into a
	 *    rejection for the promise returned by the decorated generator.
	 */
	Q.async = async;
	function async(makeGenerator) {
	    return function () {
	        // when verb is "send", arg is a value
	        // when verb is "throw", arg is an exception
	        function continuer(verb, arg) {
	            var result;

	            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
	            // engine that has a deployed base of browsers that support generators.
	            // However, SM's generators use the Python-inspired semantics of
	            // outdated ES6 drafts.  We would like to support ES6, but we'd also
	            // like to make it possible to use generators in deployed browsers, so
	            // we also support Python-style generators.  At some point we can remove
	            // this block.

	            if (typeof StopIteration === "undefined") {
	                // ES6 Generators
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    return reject(exception);
	                }
	                if (result.done) {
	                    return Q(result.value);
	                } else {
	                    return when(result.value, callback, errback);
	                }
	            } else {
	                // SpiderMonkey Generators
	                // FIXME: Remove this case when SM does ES6 generators.
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    if (isStopIteration(exception)) {
	                        return Q(exception.value);
	                    } else {
	                        return reject(exception);
	                    }
	                }
	                return when(result, callback, errback);
	            }
	        }
	        var generator = makeGenerator.apply(this, arguments);
	        var callback = continuer.bind(continuer, "next");
	        var errback = continuer.bind(continuer, "throw");
	        return callback();
	    };
	}

	/**
	 * The spawn function is a small wrapper around async that immediately
	 * calls the generator and also ends the promise chain, so that any
	 * unhandled errors are thrown instead of forwarded to the error
	 * handler. This is useful because it's extremely common to run
	 * generators at the top-level to work with libraries.
	 */
	Q.spawn = spawn;
	function spawn(makeGenerator) {
	    Q.done(Q.async(makeGenerator)());
	}

	// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
	/**
	 * Throws a ReturnValue exception to stop an asynchronous generator.
	 *
	 * This interface is a stop-gap measure to support generator return
	 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
	 * generators like Chromium 29, just use "return" in your generator
	 * functions.
	 *
	 * @param value the return value for the surrounding generator
	 * @throws ReturnValue exception with the value.
	 * @example
	 * // ES6 style
	 * Q.async(function* () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      return foo + bar;
	 * })
	 * // Older SpiderMonkey style
	 * Q.async(function () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      Q.return(foo + bar);
	 * })
	 */
	Q["return"] = _return;
	function _return(value) {
	    throw new QReturnValue(value);
	}

	/**
	 * The promised function decorator ensures that any promise arguments
	 * are settled and passed as values (`this` is also settled and passed
	 * as a value).  It will also ensure that the result of a function is
	 * always a promise.
	 *
	 * @example
	 * var add = Q.promised(function (a, b) {
	 *     return a + b;
	 * });
	 * add(Q(a), Q(B));
	 *
	 * @param {function} callback The function to decorate
	 * @returns {function} a function that has been decorated.
	 */
	Q.promised = promised;
	function promised(callback) {
	    return function () {
	        return spread([this, all(arguments)], function (self, args) {
	            return callback.apply(self, args);
	        });
	    };
	}

	/**
	 * sends a message to a value in a future turn
	 * @param object* the recipient
	 * @param op the name of the message operation, e.g., "when",
	 * @param args further arguments to be forwarded to the operation
	 * @returns result {Promise} a promise for the result of the operation
	 */
	Q.dispatch = dispatch;
	function dispatch(object, op, args) {
	    return Q(object).dispatch(op, args);
	}

	Promise.prototype.dispatch = function (op, args) {
	    var self = this;
	    var deferred = defer();
	    Q.nextTick(function () {
	        self.promiseDispatch(deferred.resolve, op, args);
	    });
	    return deferred.promise;
	};

	/**
	 * Gets the value of a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to get
	 * @return promise for the property value
	 */
	Q.get = function (object, key) {
	    return Q(object).dispatch("get", [key]);
	};

	Promise.prototype.get = function (key) {
	    return this.dispatch("get", [key]);
	};

	/**
	 * Sets the value of a property in a future turn.
	 * @param object    promise or immediate reference for object object
	 * @param name      name of property to set
	 * @param value     new value of property
	 * @return promise for the return value
	 */
	Q.set = function (object, key, value) {
	    return Q(object).dispatch("set", [key, value]);
	};

	Promise.prototype.set = function (key, value) {
	    return this.dispatch("set", [key, value]);
	};

	/**
	 * Deletes a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to delete
	 * @return promise for the return value
	 */
	Q.del = // XXX legacy
	Q["delete"] = function (object, key) {
	    return Q(object).dispatch("delete", [key]);
	};

	Promise.prototype.del = // XXX legacy
	Promise.prototype["delete"] = function (key) {
	    return this.dispatch("delete", [key]);
	};

	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param value     a value to post, typically an array of
	 *                  invocation arguments for promises that
	 *                  are ultimately backed with `resolve` values,
	 *                  as opposed to those backed with URLs
	 *                  wherein the posted value can be any
	 *                  JSON serializable object.
	 * @return promise for the return value
	 */
	// bound locally because it is used by other methods
	Q.mapply = // XXX As proposed by "Redsandro"
	Q.post = function (object, name, args) {
	    return Q(object).dispatch("post", [name, args]);
	};

	Promise.prototype.mapply = // XXX As proposed by "Redsandro"
	Promise.prototype.post = function (name, args) {
	    return this.dispatch("post", [name, args]);
	};

	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param ...args   array of invocation arguments
	 * @return promise for the return value
	 */
	Q.send = // XXX Mark Miller's proposed parlance
	Q.mcall = // XXX As proposed by "Redsandro"
	Q.invoke = function (object, name /*...args*/) {
	    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
	};

	Promise.prototype.send = // XXX Mark Miller's proposed parlance
	Promise.prototype.mcall = // XXX As proposed by "Redsandro"
	Promise.prototype.invoke = function (name /*...args*/) {
	    return this.dispatch("post", [name, array_slice(arguments, 1)]);
	};

	/**
	 * Applies the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param args      array of application arguments
	 */
	Q.fapply = function (object, args) {
	    return Q(object).dispatch("apply", [void 0, args]);
	};

	Promise.prototype.fapply = function (args) {
	    return this.dispatch("apply", [void 0, args]);
	};

	/**
	 * Calls the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q["try"] =
	Q.fcall = function (object /* ...args*/) {
	    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
	};

	Promise.prototype.fcall = function (/*...args*/) {
	    return this.dispatch("apply", [void 0, array_slice(arguments)]);
	};

	/**
	 * Binds the promised function, transforming return values into a fulfilled
	 * promise and thrown errors into a rejected one.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q.fbind = function (object /*...args*/) {
	    var promise = Q(object);
	    var args = array_slice(arguments, 1);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	Promise.prototype.fbind = function (/*...args*/) {
	    var promise = this;
	    var args = array_slice(arguments);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};

	/**
	 * Requests the names of the owned properties of a promised
	 * object in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @return promise for the keys of the eventually settled object
	 */
	Q.keys = function (object) {
	    return Q(object).dispatch("keys", []);
	};

	Promise.prototype.keys = function () {
	    return this.dispatch("keys", []);
	};

	/**
	 * Turns an array of promises into a promise for an array.  If any of
	 * the promises gets rejected, the whole array is rejected immediately.
	 * @param {Array*} an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns a promise for an array of the corresponding values
	 */
	// By Mark Miller
	// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
	Q.all = all;
	function all(promises) {
	    return when(promises, function (promises) {
	        var pendingCount = 0;
	        var deferred = defer();
	        array_reduce(promises, function (undefined, promise, index) {
	            var snapshot;
	            if (
	                isPromise(promise) &&
	                (snapshot = promise.inspect()).state === "fulfilled"
	            ) {
	                promises[index] = snapshot.value;
	            } else {
	                ++pendingCount;
	                when(
	                    promise,
	                    function (value) {
	                        promises[index] = value;
	                        if (--pendingCount === 0) {
	                            deferred.resolve(promises);
	                        }
	                    },
	                    deferred.reject,
	                    function (progress) {
	                        deferred.notify({ index: index, value: progress });
	                    }
	                );
	            }
	        }, void 0);
	        if (pendingCount === 0) {
	            deferred.resolve(promises);
	        }
	        return deferred.promise;
	    });
	}

	Promise.prototype.all = function () {
	    return all(this);
	};

	/**
	 * Returns the first resolved promise of an array. Prior rejected promises are
	 * ignored.  Rejects only if all promises are rejected.
	 * @param {Array*} an array containing values or promises for values
	 * @returns a promise fulfilled with the value of the first resolved promise,
	 * or a rejected promise if all promises are rejected.
	 */
	Q.any = any;

	function any(promises) {
	    if (promises.length === 0) {
	        return Q.resolve();
	    }

	    var deferred = Q.defer();
	    var pendingCount = 0;
	    array_reduce(promises, function (prev, current, index) {
	        var promise = promises[index];

	        pendingCount++;

	        when(promise, onFulfilled, onRejected, onProgress);
	        function onFulfilled(result) {
	            deferred.resolve(result);
	        }
	        function onRejected(err) {
	            pendingCount--;
	            if (pendingCount === 0) {
	                err.message = ("Q can't get fulfillment value from any promise, all " +
	                    "promises were rejected. Last error message: " + err.message);
	                deferred.reject(err);
	            }
	        }
	        function onProgress(progress) {
	            deferred.notify({
	                index: index,
	                value: progress
	            });
	        }
	    }, undefined);

	    return deferred.promise;
	}

	Promise.prototype.any = function () {
	    return any(this);
	};

	/**
	 * Waits for all promises to be settled, either fulfilled or
	 * rejected.  This is distinct from `all` since that would stop
	 * waiting at the first rejection.  The promise returned by
	 * `allResolved` will never be rejected.
	 * @param promises a promise for an array (or an array) of promises
	 * (or values)
	 * @return a promise for an array of promises
	 */
	Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
	function allResolved(promises) {
	    return when(promises, function (promises) {
	        promises = array_map(promises, Q);
	        return when(all(array_map(promises, function (promise) {
	            return when(promise, noop, noop);
	        })), function () {
	            return promises;
	        });
	    });
	}

	Promise.prototype.allResolved = function () {
	    return allResolved(this);
	};

	/**
	 * @see Promise#allSettled
	 */
	Q.allSettled = allSettled;
	function allSettled(promises) {
	    return Q(promises).allSettled();
	}

	/**
	 * Turns an array of promises into a promise for an array of their states (as
	 * returned by `inspect`) when they have all settled.
	 * @param {Array[Any*]} values an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns {Array[State]} an array of states for the respective values.
	 */
	Promise.prototype.allSettled = function () {
	    return this.then(function (promises) {
	        return all(array_map(promises, function (promise) {
	            promise = Q(promise);
	            function regardless() {
	                return promise.inspect();
	            }
	            return promise.then(regardless, regardless);
	        }));
	    });
	};

	/**
	 * Captures the failure of a promise, giving an oportunity to recover
	 * with a callback.  If the given promise is fulfilled, the returned
	 * promise is fulfilled.
	 * @param {Any*} promise for something
	 * @param {Function} callback to fulfill the returned promise if the
	 * given promise is rejected
	 * @returns a promise for the return value of the callback
	 */
	Q.fail = // XXX legacy
	Q["catch"] = function (object, rejected) {
	    return Q(object).then(void 0, rejected);
	};

	Promise.prototype.fail = // XXX legacy
	Promise.prototype["catch"] = function (rejected) {
	    return this.then(void 0, rejected);
	};

	/**
	 * Attaches a listener that can respond to progress notifications from a
	 * promise's originating deferred. This listener receives the exact arguments
	 * passed to ``deferred.notify``.
	 * @param {Any*} promise for something
	 * @param {Function} callback to receive any progress notifications
	 * @returns the given promise, unchanged
	 */
	Q.progress = progress;
	function progress(object, progressed) {
	    return Q(object).then(void 0, void 0, progressed);
	}

	Promise.prototype.progress = function (progressed) {
	    return this.then(void 0, void 0, progressed);
	};

	/**
	 * Provides an opportunity to observe the settling of a promise,
	 * regardless of whether the promise is fulfilled or rejected.  Forwards
	 * the resolution to the returned promise when the callback is done.
	 * The callback can return a promise to defer completion.
	 * @param {Any*} promise
	 * @param {Function} callback to observe the resolution of the given
	 * promise, takes no arguments.
	 * @returns a promise for the resolution of the given promise when
	 * ``fin`` is done.
	 */
	Q.fin = // XXX legacy
	Q["finally"] = function (object, callback) {
	    return Q(object)["finally"](callback);
	};

	Promise.prototype.fin = // XXX legacy
	Promise.prototype["finally"] = function (callback) {
	    if (!callback || typeof callback.apply !== "function") {
	        throw new Error("Q can't apply finally callback");
	    }
	    callback = Q(callback);
	    return this.then(function (value) {
	        return callback.fcall().then(function () {
	            return value;
	        });
	    }, function (reason) {
	        // TODO attempt to recycle the rejection with "this".
	        return callback.fcall().then(function () {
	            throw reason;
	        });
	    });
	};

	/**
	 * Terminates a chain of promises, forcing rejections to be
	 * thrown as exceptions.
	 * @param {Any*} promise at the end of a chain of promises
	 * @returns nothing
	 */
	Q.done = function (object, fulfilled, rejected, progress) {
	    return Q(object).done(fulfilled, rejected, progress);
	};

	Promise.prototype.done = function (fulfilled, rejected, progress) {
	    var onUnhandledError = function (error) {
	        // forward to a future turn so that ``when``
	        // does not catch it and turn it into a rejection.
	        Q.nextTick(function () {
	            makeStackTraceLong(error, promise);
	            if (Q.onerror) {
	                Q.onerror(error);
	            } else {
	                throw error;
	            }
	        });
	    };

	    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
	    var promise = fulfilled || rejected || progress ?
	        this.then(fulfilled, rejected, progress) :
	        this;

	    if (typeof process === "object" && process && process.domain) {
	        onUnhandledError = process.domain.bind(onUnhandledError);
	    }

	    promise.then(void 0, onUnhandledError);
	};

	/**
	 * Causes a promise to be rejected if it does not get fulfilled before
	 * some milliseconds time out.
	 * @param {Any*} promise
	 * @param {Number} milliseconds timeout
	 * @param {Any*} custom error message or Error object (optional)
	 * @returns a promise for the resolution of the given promise if it is
	 * fulfilled before the timeout, otherwise rejected.
	 */
	Q.timeout = function (object, ms, error) {
	    return Q(object).timeout(ms, error);
	};

	Promise.prototype.timeout = function (ms, error) {
	    var deferred = defer();
	    var timeoutId = setTimeout(function () {
	        if (!error || "string" === typeof error) {
	            error = new Error(error || "Timed out after " + ms + " ms");
	            error.code = "ETIMEDOUT";
	        }
	        deferred.reject(error);
	    }, ms);

	    this.then(function (value) {
	        clearTimeout(timeoutId);
	        deferred.resolve(value);
	    }, function (exception) {
	        clearTimeout(timeoutId);
	        deferred.reject(exception);
	    }, deferred.notify);

	    return deferred.promise;
	};

	/**
	 * Returns a promise for the given value (or promised value), some
	 * milliseconds after it resolved. Passes rejections immediately.
	 * @param {Any*} promise
	 * @param {Number} milliseconds
	 * @returns a promise for the resolution of the given promise after milliseconds
	 * time has elapsed since the resolution of the given promise.
	 * If the given promise rejects, that is passed immediately.
	 */
	Q.delay = function (object, timeout) {
	    if (timeout === void 0) {
	        timeout = object;
	        object = void 0;
	    }
	    return Q(object).delay(timeout);
	};

	Promise.prototype.delay = function (timeout) {
	    return this.then(function (value) {
	        var deferred = defer();
	        setTimeout(function () {
	            deferred.resolve(value);
	        }, timeout);
	        return deferred.promise;
	    });
	};

	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided as an array, and returns a promise.
	 *
	 *      Q.nfapply(FS.readFile, [__filename])
	 *      .then(function (content) {
	 *      })
	 *
	 */
	Q.nfapply = function (callback, args) {
	    return Q(callback).nfapply(args);
	};

	Promise.prototype.nfapply = function (args) {
	    var deferred = defer();
	    var nodeArgs = array_slice(args);
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided individually, and returns a promise.
	 * @example
	 * Q.nfcall(FS.readFile, __filename)
	 * .then(function (content) {
	 * })
	 *
	 */
	Q.nfcall = function (callback /*...args*/) {
	    var args = array_slice(arguments, 1);
	    return Q(callback).nfapply(args);
	};

	Promise.prototype.nfcall = function (/*...args*/) {
	    var nodeArgs = array_slice(arguments);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Wraps a NodeJS continuation passing function and returns an equivalent
	 * version that returns a promise.
	 * @example
	 * Q.nfbind(FS.readFile, __filename)("utf-8")
	 * .then(console.log)
	 * .done()
	 */
	Q.nfbind =
	Q.denodeify = function (callback /*...args*/) {
	    if (callback === undefined) {
	        throw new Error("Q can't wrap an undefined function");
	    }
	    var baseArgs = array_slice(arguments, 1);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        Q(callback).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};

	Promise.prototype.nfbind =
	Promise.prototype.denodeify = function (/*...args*/) {
	    var args = array_slice(arguments);
	    args.unshift(this);
	    return Q.denodeify.apply(void 0, args);
	};

	Q.nbind = function (callback, thisp /*...args*/) {
	    var baseArgs = array_slice(arguments, 2);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        function bound() {
	            return callback.apply(thisp, arguments);
	        }
	        Q(bound).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};

	Promise.prototype.nbind = function (/*thisp, ...args*/) {
	    var args = array_slice(arguments, 0);
	    args.unshift(this);
	    return Q.nbind.apply(void 0, args);
	};

	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback with a given array of arguments, plus a provided callback.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param {Array} args arguments to pass to the method; the callback
	 * will be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nmapply = // XXX As proposed by "Redsandro"
	Q.npost = function (object, name, args) {
	    return Q(object).npost(name, args);
	};

	Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
	Promise.prototype.npost = function (name, args) {
	    var nodeArgs = array_slice(args || []);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback, forwarding the given variadic arguments, plus a provided
	 * callback argument.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param ...args arguments to pass to the method; the callback will
	 * be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nsend = // XXX Based on Mark Miller's proposed "send"
	Q.nmcall = // XXX Based on "Redsandro's" proposal
	Q.ninvoke = function (object, name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 2);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
	Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
	Promise.prototype.ninvoke = function (name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 1);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * If a function would like to support both Node continuation-passing-style and
	 * promise-returning-style, it can end its internal promise chain with
	 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
	 * elects to use a nodeback, the result will be sent there.  If they do not
	 * pass a nodeback, they will receive the result promise.
	 * @param object a result (or a promise for a result)
	 * @param {Function} nodeback a Node.js-style callback
	 * @returns either the promise or nothing
	 */
	Q.nodeify = nodeify;
	function nodeify(object, nodeback) {
	    return Q(object).nodeify(nodeback);
	}

	Promise.prototype.nodeify = function (nodeback) {
	    if (nodeback) {
	        this.then(function (value) {
	            Q.nextTick(function () {
	                nodeback(null, value);
	            });
	        }, function (error) {
	            Q.nextTick(function () {
	                nodeback(error);
	            });
	        });
	    } else {
	        return this;
	    }
	};

	Q.noConflict = function() {
	    throw new Error("Q.noConflict only works when Q is used as a global");
	};

	// All code before this point will be filtered from stack traces.
	var qEndingLine = captureLine();

	return Q;

	});

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4), __webpack_require__(2).setImmediate))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var deepMerge = __webpack_require__(8),
	    clone = __webpack_require__(9),
	    objectHash = __webpack_require__(14);

	var toPathPieces = function toPathPieces(path) {
	    return path.split('.');
	};

	var _exists = function _exists(obj, path_pieces) {
	    for (var i = 0; i < path_pieces.length - 1; i++) {
	        var piece = path_pieces[i];
	        if (!obj.hasOwnProperty(piece)) {
	            return;
	        }

	        obj = obj[piece];

	        if (!isObject(obj)) {
	            return;
	        }
	    }

	    if (obj.hasOwnProperty(path_pieces[i])) {
	        return obj;
	    }
	};

	var exists = function exists(obj, path_pieces) {
	    return !!_exists(obj, path_pieces);
	};

	var create = function create(obj, path_pieces, i) {
	    for (var j = i; j < path_pieces.length - 1; j++) {
	        obj[path_pieces[j]] = {};
	        obj = obj[path_pieces[j]];
	    }

	    return obj;
	};

	var get = function get(obj, path_pieces, fn) {
	    if (obj = _exists(obj, path_pieces)) {
	        fn(obj, path_pieces[path_pieces.length - 1]);
	    }
	};

	// Set a value, creating the path if it doesn't exist.
	var set = function set(obj, path_pieces, value) {
	    var fn = function fn(obj, field) {
	        return obj[field] = value;
	    };

	    modify(obj, path_pieces, fn, fn);
	};

	var isObject = function isObject(obj) {
	    return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null;
	};

	// Update a value or create it and it's path if it doesn't exist.
	var modify = function modify(obj, path_pieces, update, init) {
	    var last = path_pieces[path_pieces.length - 1];

	    var _create = function _create(i) {
	        obj = create(obj, path_pieces, i);

	        init(obj, last);
	    };

	    if (!obj.hasOwnProperty(path_pieces[0])) {
	        return _create(0);
	    }

	    if (path_pieces.length > 1) {
	        obj = obj[path_pieces[0]];

	        for (var i = 1; i < path_pieces.length - 1; i++) {
	            var piece = path_pieces[i];

	            if (!isObject(obj[piece])) {
	                return;
	            }
	            if (Array.isArray(obj) && piece < 0) {
	                return;
	            }

	            if (!obj.hasOwnProperty(piece)) {
	                return _create(i);
	            }

	            obj = obj[piece];
	        }
	    }

	    update(obj, last);
	};

	// Delete specified paths from object.
	var remove1 = function remove1(obj, path_pieces) {
	    for (var i = 0; i < path_pieces.length - 1; i++) {
	        obj = obj[path_pieces[i]];

	        if (!isObject(obj)) {
	            return;
	        }
	    }

	    if (Array.isArray(obj)) {
	        var index = Number.parseFloat(path_pieces[i]);

	        if (Number.isInteger(index)) {
	            obj.splice(index, 1);
	        }
	    } else {
	        delete obj[path_pieces[i]];
	    }
	};

	var _remove2 = function _remove2(obj, new_obj, paths) {
	    var fn = function fn(field) {
	        var new_paths = [];

	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	            for (var _iterator = paths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                var path_pieces = _step.value;

	                if (path_pieces[0] !== field) {
	                    continue;
	                }
	                if (path_pieces.length === 1) {
	                    return;
	                }

	                new_paths.push(path_pieces.slice(1));
	            }
	        } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion && _iterator.return) {
	                    _iterator.return();
	                }
	            } finally {
	                if (_didIteratorError) {
	                    throw _iteratorError;
	                }
	            }
	        }

	        if (!new_paths.length) {
	            new_obj[field] = clone(obj[field]);
	        } else {
	            var value = obj[field];

	            new_obj[field] = new value.constructor();

	            _remove2(value, new_obj[field], new_paths);
	        }
	    };

	    for (var field in obj) {
	        fn(field);
	    }
	};

	// Copy an object ignoring specified paths.
	var remove2 = function remove2(obj, paths) {
	    var new_obj = new obj.constructor();

	    _remove2(obj, new_obj, paths);

	    return new_obj;
	};

	var rename = function rename(obj1, path_pieces, new_name) {
	    get(obj1, path_pieces, function (obj2, field) {
	        obj2[new_name] = obj2[field];
	        delete obj2[field];
	    });
	};

	// Copy an object by a path ignoring other fields.
	var _copy = function _copy(obj, new_obj, path_pieces) {
	    for (var i = 0; i < path_pieces.length - 1; i++) {
	        var piece = path_pieces[i];

	        obj = obj[piece];

	        if (!isObject(obj)) {
	            return;
	        }

	        new_obj[piece] = new obj.constructor();
	        new_obj = new_obj[piece];
	    }

	    if (obj.hasOwnProperty(path_pieces[i])) {
	        new_obj[path_pieces[i]] = obj[path_pieces[i]];

	        return obj;
	    }
	};

	// Copy an object by specified paths ignoring other paths.
	var copy = function copy(obj, paths) {
	    var new_objs = [];

	    var _iteratorNormalCompletion2 = true;
	    var _didIteratorError2 = false;
	    var _iteratorError2 = undefined;

	    try {
	        for (var _iterator2 = paths[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	            var path_pieces = _step2.value;

	            var new_obj = new obj.constructor();

	            if (_copy(obj, new_obj, path_pieces)) {
	                new_objs.push(new_obj);
	            }
	        }
	    } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                _iterator2.return();
	            }
	        } finally {
	            if (_didIteratorError2) {
	                throw _iteratorError2;
	            }
	        }
	    }

	    return new_objs.reduce(deepMerge, {});
	};

	var equal = function equal(value1, value2) {
	    return hashify(value1) === hashify(value2);
	};

	var unknownOp = function unknownOp(name) {
	    throw Error('unknown operator \'' + name + '\'');
	};

	var hashify = function hashify(value) {
	    if (value === undefined) {
	        return;
	    }

	    return objectHash(value);
	};

	var getIDBError = function getIDBError(e) {
	    return Error(e.target.error.message);
	};

	module.exports.toPathPieces = toPathPieces;
	module.exports.exists = exists;
	module.exports.create = create;
	module.exports.get = get;
	module.exports.set = set;
	module.exports.isObject = isObject;
	module.exports.modify = modify;
	module.exports.remove1 = remove1;
	module.exports.remove2 = remove2;
	module.exports.rename = rename;
	module.exports.copy = copy;
	module.exports.equal = equal;
	module.exports.unknownOp = unknownOp;
	module.exports.hashify = hashify;
	module.exports.getIDBError = getIDBError;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports === 'object') {
	        module.exports = factory();
	    } else {
	        root.deepmerge = factory();
	    }
	}(this, function () {

	function isMergeableObject(val) {
	    var nonNullObject = val && typeof val === 'object'

	    return nonNullObject
	        && Object.prototype.toString.call(val) !== '[object RegExp]'
	        && Object.prototype.toString.call(val) !== '[object Date]'
	}

	function emptyTarget(val) {
	    return Array.isArray(val) ? [] : {}
	}

	function cloneIfNecessary(value, optionsArgument) {
	    var clone = optionsArgument && optionsArgument.clone === true
	    return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
	}

	function defaultArrayMerge(target, source, optionsArgument) {
	    var destination = target.slice()
	    source.forEach(function(e, i) {
	        if (typeof destination[i] === 'undefined') {
	            destination[i] = cloneIfNecessary(e, optionsArgument)
	        } else if (isMergeableObject(e)) {
	            destination[i] = deepmerge(target[i], e, optionsArgument)
	        } else if (target.indexOf(e) === -1) {
	            destination.push(cloneIfNecessary(e, optionsArgument))
	        }
	    })
	    return destination
	}

	function mergeObject(target, source, optionsArgument) {
	    var destination = {}
	    if (isMergeableObject(target)) {
	        Object.keys(target).forEach(function (key) {
	            destination[key] = cloneIfNecessary(target[key], optionsArgument)
	        })
	    }
	    Object.keys(source).forEach(function (key) {
	        if (!isMergeableObject(source[key]) || !target[key]) {
	            destination[key] = cloneIfNecessary(source[key], optionsArgument)
	        } else {
	            destination[key] = deepmerge(target[key], source[key], optionsArgument)
	        }
	    })
	    return destination
	}

	function deepmerge(target, source, optionsArgument) {
	    var array = Array.isArray(source);
	    var options = optionsArgument || { arrayMerge: defaultArrayMerge }
	    var arrayMerge = options.arrayMerge || defaultArrayMerge

	    if (array) {
	        return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
	    } else {
	        return mergeObject(target, source, optionsArgument)
	    }
	}

	deepmerge.all = function deepmergeAll(array, optionsArgument) {
	    if (!Array.isArray(array) || array.length < 2) {
	        throw new Error('first argument should be an array with at least two elements')
	    }

	    // we are sure there are at least 2 values, so it is safe to have no initial value
	    return array.reduce(function(prev, next) {
	        return deepmerge(prev, next, optionsArgument)
	    })
	}

	return deepmerge

	}));


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var clone = (function() {
	'use strict';

	function _instanceof(obj, type) {
	  return type != null && obj instanceof type;
	}

	var nativeMap;
	try {
	  nativeMap = Map;
	} catch(_) {
	  // maybe a reference error because no `Map`. Give it a dummy value that no
	  // value will ever be an instanceof.
	  nativeMap = function() {};
	}

	var nativeSet;
	try {
	  nativeSet = Set;
	} catch(_) {
	  nativeSet = function() {};
	}

	var nativePromise;
	try {
	  nativePromise = Promise;
	} catch(_) {
	  nativePromise = function() {};
	}

	/**
	 * Clones (copies) an Object using deep copying.
	 *
	 * This function supports circular references by default, but if you are certain
	 * there are no circular references in your object, you can save some CPU time
	 * by calling clone(obj, false).
	 *
	 * Caution: if `circular` is false and `parent` contains circular references,
	 * your program may enter an infinite loop and crash.
	 *
	 * @param `parent` - the object to be cloned
	 * @param `circular` - set to true if the object to be cloned may contain
	 *    circular references. (optional - true by default)
	 * @param `depth` - set to a number if the object is only to be cloned to
	 *    a particular depth. (optional - defaults to Infinity)
	 * @param `prototype` - sets the prototype to be used when cloning an object.
	 *    (optional - defaults to parent prototype).
	 * @param `includeNonEnumerable` - set to true if the non-enumerable properties
	 *    should be cloned as well. Non-enumerable properties on the prototype
	 *    chain will be ignored. (optional - false by default)
	*/
	function clone(parent, circular, depth, prototype, includeNonEnumerable) {
	  if (typeof circular === 'object') {
	    depth = circular.depth;
	    prototype = circular.prototype;
	    includeNonEnumerable = circular.includeNonEnumerable;
	    circular = circular.circular;
	  }
	  // maintain two arrays for circular references, where corresponding parents
	  // and children have the same index
	  var allParents = [];
	  var allChildren = [];

	  var useBuffer = typeof Buffer != 'undefined';

	  if (typeof circular == 'undefined')
	    circular = true;

	  if (typeof depth == 'undefined')
	    depth = Infinity;

	  // recurse this function so we don't reset allParents and allChildren
	  function _clone(parent, depth) {
	    // cloning null always returns null
	    if (parent === null)
	      return null;

	    if (depth === 0)
	      return parent;

	    var child;
	    var proto;
	    if (typeof parent != 'object') {
	      return parent;
	    }

	    if (_instanceof(parent, nativeMap)) {
	      child = new nativeMap();
	    } else if (_instanceof(parent, nativeSet)) {
	      child = new nativeSet();
	    } else if (_instanceof(parent, nativePromise)) {
	      child = new nativePromise(function (resolve, reject) {
	        parent.then(function(value) {
	          resolve(_clone(value, depth - 1));
	        }, function(err) {
	          reject(_clone(err, depth - 1));
	        });
	      });
	    } else if (clone.__isArray(parent)) {
	      child = [];
	    } else if (clone.__isRegExp(parent)) {
	      child = new RegExp(parent.source, __getRegExpFlags(parent));
	      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
	    } else if (clone.__isDate(parent)) {
	      child = new Date(parent.getTime());
	    } else if (useBuffer && Buffer.isBuffer(parent)) {
	      child = new Buffer(parent.length);
	      parent.copy(child);
	      return child;
	    } else if (_instanceof(parent, Error)) {
	      child = Object.create(parent);
	    } else {
	      if (typeof prototype == 'undefined') {
	        proto = Object.getPrototypeOf(parent);
	        child = Object.create(proto);
	      }
	      else {
	        child = Object.create(prototype);
	        proto = prototype;
	      }
	    }

	    if (circular) {
	      var index = allParents.indexOf(parent);

	      if (index != -1) {
	        return allChildren[index];
	      }
	      allParents.push(parent);
	      allChildren.push(child);
	    }

	    if (_instanceof(parent, nativeMap)) {
	      parent.forEach(function(value, key) {
	        var keyChild = _clone(key, depth - 1);
	        var valueChild = _clone(value, depth - 1);
	        child.set(keyChild, valueChild);
	      });
	    }
	    if (_instanceof(parent, nativeSet)) {
	      parent.forEach(function(value) {
	        var entryChild = _clone(value, depth - 1);
	        child.add(entryChild);
	      });
	    }

	    for (var i in parent) {
	      var attrs;
	      if (proto) {
	        attrs = Object.getOwnPropertyDescriptor(proto, i);
	      }

	      if (attrs && attrs.set == null) {
	        continue;
	      }
	      child[i] = _clone(parent[i], depth - 1);
	    }

	    if (Object.getOwnPropertySymbols) {
	      var symbols = Object.getOwnPropertySymbols(parent);
	      for (var i = 0; i < symbols.length; i++) {
	        // Don't need to worry about cloning a symbol because it is a primitive,
	        // like a number or string.
	        var symbol = symbols[i];
	        var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
	        if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
	          continue;
	        }
	        child[symbol] = _clone(parent[symbol], depth - 1);
	        if (!descriptor.enumerable) {
	          Object.defineProperty(child, symbol, {
	            enumerable: false
	          });
	        }
	      }
	    }

	    if (includeNonEnumerable) {
	      var allPropertyNames = Object.getOwnPropertyNames(parent);
	      for (var i = 0; i < allPropertyNames.length; i++) {
	        var propertyName = allPropertyNames[i];
	        var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
	        if (descriptor && descriptor.enumerable) {
	          continue;
	        }
	        child[propertyName] = _clone(parent[propertyName], depth - 1);
	        Object.defineProperty(child, propertyName, {
	          enumerable: false
	        });
	      }
	    }

	    return child;
	  }

	  return _clone(parent, depth);
	}

	/**
	 * Simple flat clone using prototype, accepts only objects, usefull for property
	 * override on FLAT configuration object (no nested props).
	 *
	 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
	 * works.
	 */
	clone.clonePrototype = function clonePrototype(parent) {
	  if (parent === null)
	    return null;

	  var c = function () {};
	  c.prototype = parent;
	  return new c();
	};

	// private utility functions

	function __objToStr(o) {
	  return Object.prototype.toString.call(o);
	}
	clone.__objToStr = __objToStr;

	function __isDate(o) {
	  return typeof o === 'object' && __objToStr(o) === '[object Date]';
	}
	clone.__isDate = __isDate;

	function __isArray(o) {
	  return typeof o === 'object' && __objToStr(o) === '[object Array]';
	}
	clone.__isArray = __isArray;

	function __isRegExp(o) {
	  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
	}
	clone.__isRegExp = __isRegExp;

	function __getRegExpFlags(re) {
	  var flags = '';
	  if (re.global) flags += 'g';
	  if (re.ignoreCase) flags += 'i';
	  if (re.multiline) flags += 'm';
	  return flags;
	}
	clone.__getRegExpFlags = __getRegExpFlags;

	return clone;
	})();

	if (typeof module === 'object' && module.exports) {
	  module.exports = clone;
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer))

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(11)
	var ieee754 = __webpack_require__(12)
	var isArray = __webpack_require__(13)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	exports.kMaxLength = kMaxLength()

	function typedArraySupport () {
	  try {
	    var arr = new Uint8Array(1)
	    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length)
	    }
	    that.length = length
	  }

	  return that
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}

	Buffer.poolSize = 8192 // not used by this implementation

	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype
	  return arr
	}

	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }

	  return fromObject(that, value)
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer[Symbol.species] === Buffer) {
	    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
	    Object.defineProperty(Buffer, Symbol.species, {
	      value: null,
	      configurable: true
	    })
	  }
	}

	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}

	function alloc (that, size, fill, encoding) {
	  assertSize(size)
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	}

	function allocUnsafe (that, size) {
	  assertSize(size)
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	}
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8'
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  var length = byteLength(string, encoding) | 0
	  that = createBuffer(that, length)

	  var actual = that.write(string, encoding)

	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual)
	  }

	  return that
	}

	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0
	  that = createBuffer(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength // this throws if `array` is not a valid ArrayBuffer

	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }

	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array)
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset)
	  } else {
	    array = new Uint8Array(array, byteOffset, length)
	  }

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array)
	  }
	  return that
	}

	function fromObject (that, obj) {
	  if (Buffer.isBuffer(obj)) {
	    var len = checked(obj.length) | 0
	    that = createBuffer(that, len)

	    if (that.length === 0) {
	      return that
	    }

	    obj.copy(that, 0, 0, len)
	    return that
	  }

	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }

	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }

	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0
	  }
	  return Buffer.alloc(+length)
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i]
	      y = b[i]
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }

	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length
	    }
	  }

	  var buffer = Buffer.allocUnsafe(length)
	  var pos = 0
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i]
	    if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos)
	    pos += buf.length
	  }
	  return buffer
	}

	function byteLength (string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string
	  }

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length
	  }

	  if (end <= 0) {
	    return ''
	  }

	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0
	  start >>>= 0

	  if (end <= start) {
	    return ''
	  }

	  if (!encoding) encoding = 'utf8'

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true

	function swap (b, n, m) {
	  var i = b[n]
	  b[n] = b[m]
	  b[m] = i
	}

	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1)
	  }
	  return this
	}

	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3)
	    swap(this, i + 1, i + 2)
	  }
	  return this
	}

	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7)
	    swap(this, i + 1, i + 6)
	    swap(this, i + 2, i + 5)
	    swap(this, i + 3, i + 4)
	  }
	  return this
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }

	  if (start === undefined) {
	    start = 0
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0
	  }
	  if (thisStart === undefined) {
	    thisStart = 0
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length
	  }

	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }

	  start >>>= 0
	  end >>>= 0
	  thisStart >>>= 0
	  thisEnd >>>= 0

	  if (this === target) return 0

	  var x = thisEnd - thisStart
	  var y = end - start
	  var len = Math.min(x, y)

	  var thisCopy = this.slice(thisStart, thisEnd)
	  var targetCopy = target.slice(start, end)

	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i]
	      y = targetCopy[i]
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1

	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset
	    byteOffset = 0
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000
	  }
	  byteOffset = +byteOffset  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1)
	  }

	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0
	    else return -1
	  }

	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding)
	  }

	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (Buffer.isBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1
	  var arrLength = arr.length
	  var valLength = val.length

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase()
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2
	      arrLength /= 2
	      valLength /= 2
	      byteOffset /= 2
	    }
	  }

	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }

	  var i
	  if (dir) {
	    var foundIndex = -1
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex
	        foundIndex = -1
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false
	          break
	        }
	      }
	      if (found) return i
	    }
	  }

	  return -1
	}

	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	}

	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function latin1Slice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end)
	    newBuf.__proto__ = Buffer.prototype
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    )
	  }

	  return len
	}

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start
	      start = 0
	      end = this.length
	    } else if (typeof end === 'string') {
	      encoding = end
	      end = this.length
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0)
	      if (code < 256) {
	        val = code
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }

	  if (end <= start) {
	    return this
	  }

	  start = start >>> 0
	  end = end === undefined ? this.length : end >>> 0

	  if (!val) val = 0

	  var i
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val
	    }
	  } else {
	    var bytes = Buffer.isBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString())
	    var len = bytes.length
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len]
	    }
	  }

	  return this
	}

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	'use strict'

	exports.byteLength = byteLength
	exports.toByteArray = toByteArray
	exports.fromByteArray = fromByteArray

	var lookup = []
	var revLookup = []
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i]
	  revLookup[code.charCodeAt(i)] = i
	}

	revLookup['-'.charCodeAt(0)] = 62
	revLookup['_'.charCodeAt(0)] = 63

	function placeHoldersCount (b64) {
	  var len = b64.length
	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
	}

	function byteLength (b64) {
	  // base64 is 4/3 + up to two characters of the original data
	  return b64.length * 3 / 4 - placeHoldersCount(b64)
	}

	function toByteArray (b64) {
	  var i, j, l, tmp, placeHolders, arr
	  var len = b64.length
	  placeHolders = placeHoldersCount(b64)

	  arr = new Arr(len * 3 / 4 - placeHolders)

	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len

	  var L = 0

	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
	    arr[L++] = (tmp >> 16) & 0xFF
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }

	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
	    arr[L++] = tmp & 0xFF
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp
	  var output = []
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
	    output.push(tripletToBase64(tmp))
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  var tmp
	  var len = uint8.length
	  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
	  var output = ''
	  var parts = []
	  var maxChunkLength = 16383 // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1]
	    output += lookup[tmp >> 2]
	    output += lookup[(tmp << 4) & 0x3F]
	    output += '=='
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
	    output += lookup[tmp >> 10]
	    output += lookup[(tmp >> 4) & 0x3F]
	    output += lookup[(tmp << 2) & 0x3F]
	    output += '='
	  }

	  parts.push(output)

	  return parts.join('')
	}


/***/ }),
/* 12 */
/***/ (function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ }),
/* 13 */
/***/ (function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	var require;var require;!function(e){if(true)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var t;"undefined"!=typeof window?t=window:"undefined"!=typeof global?t=global:"undefined"!=typeof self&&(t=self),t.objectHash=e()}}(function(){return function e(t,n,r){function o(u,a){if(!n[u]){if(!t[u]){var f="function"==typeof require&&require;if(!a&&f)return require(u,!0);if(i)return i(u,!0);throw new Error("Cannot find module '"+u+"'")}var s=n[u]={exports:{}};t[u][0].call(s.exports,function(e){var n=t[u][1][e];return o(n?n:e)},s,s.exports,e,t,n,r)}return n[u].exports}for(var i="function"==typeof require&&require,u=0;u<r.length;u++)o(r[u]);return o}({1:[function(e,t,n){(function(r,o,i,u,a,f,s,c,l){"use strict";function d(e,t){return t=h(e,t),g(e,t)}function h(e,t){if(t=t||{},t.algorithm=t.algorithm||"sha1",t.encoding=t.encoding||"hex",t.excludeValues=!!t.excludeValues,t.algorithm=t.algorithm.toLowerCase(),t.encoding=t.encoding.toLowerCase(),t.ignoreUnknown=t.ignoreUnknown===!0,t.respectType=t.respectType!==!1,t.respectFunctionNames=t.respectFunctionNames!==!1,t.respectFunctionProperties=t.respectFunctionProperties!==!1,t.unorderedArrays=t.unorderedArrays===!0,t.unorderedSets=t.unorderedSets!==!1,t.replacer=t.replacer||void 0,"undefined"==typeof e)throw new Error("Object argument required.");for(var n=0;n<v.length;++n)v[n].toLowerCase()===t.algorithm.toLowerCase()&&(t.algorithm=v[n]);if(v.indexOf(t.algorithm)===-1)throw new Error('Algorithm "'+t.algorithm+'"  not supported. supported values: '+v.join(", "));if(m.indexOf(t.encoding)===-1&&"passthrough"!==t.algorithm)throw new Error('Encoding "'+t.encoding+'"  not supported. supported values: '+m.join(", "));return t}function p(e){if("function"!=typeof e)return!1;var t=/^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i;return null!=t.exec(Function.prototype.toString.call(e))}function g(e,t){var n;n="passthrough"!==t.algorithm?b.createHash(t.algorithm):new w,"undefined"==typeof n.write&&(n.write=n.update,n.end=n.update);var r=y(t,n);if(r.dispatch(e),n.update||n.end(""),n.digest)return n.digest("buffer"===t.encoding?void 0:t.encoding);var o=n.read();return"buffer"===t.encoding?o:o.toString(t.encoding)}function y(e,t,n){n=n||[];var r=function(e){return t.update?t.update(e,"utf8"):t.write(e,"utf8")};return{dispatch:function(t){e.replacer&&(t=e.replacer(t));var n=typeof t;return null===t&&(n="null"),this["_"+n](t)},_object:function(t){var o=/\[object (.*)\]/i,u=Object.prototype.toString.call(t),a=o.exec(u);a=a?a[1]:"unknown:["+u+"]",a=a.toLowerCase();var f=null;if((f=n.indexOf(t))>=0)return this.dispatch("[CIRCULAR:"+f+"]");if(n.push(t),"undefined"!=typeof i&&i.isBuffer&&i.isBuffer(t))return r("buffer:"),r(t);if("object"===a||"function"===a){var s=Object.keys(t).sort();e.respectType===!1||p(t)||s.splice(0,0,"prototype","__proto__","constructor"),r("object:"+s.length+":");var c=this;return s.forEach(function(n){c.dispatch(n),r(":"),e.excludeValues||c.dispatch(t[n]),r(",")})}if(!this["_"+a]){if(e.ignoreUnknown)return r("["+a+"]");throw new Error('Unknown object type "'+a+'"')}this["_"+a](t)},_array:function(t,o){o="undefined"!=typeof o?o:e.unorderedArrays!==!1;var i=this;if(r("array:"+t.length+":"),!o||t.length<=1)return t.forEach(function(e){return i.dispatch(e)});var u=[],a=t.map(function(t){var r=new w,o=n.slice(),i=y(e,r,o);return i.dispatch(t),u=u.concat(o.slice(n.length)),r.read().toString()});return n=n.concat(u),a.sort(),this._array(a,!1)},_date:function(e){return r("date:"+e.toJSON())},_symbol:function(e){return r("symbol:"+e.toString())},_error:function(e){return r("error:"+e.toString())},_boolean:function(e){return r("bool:"+e.toString())},_string:function(e){r("string:"+e.length+":"),r(e)},_function:function(t){r("fn:"),p(t)?this.dispatch("[native]"):this.dispatch(t.toString()),e.respectFunctionNames!==!1&&this.dispatch("function-name:"+String(t.name)),e.respectFunctionProperties&&this._object(t)},_number:function(e){return r("number:"+e.toString())},_xml:function(e){return r("xml:"+e.toString())},_null:function(){return r("Null")},_undefined:function(){return r("Undefined")},_regexp:function(e){return r("regex:"+e.toString())},_uint8array:function(e){return r("uint8array:"),this.dispatch(Array.prototype.slice.call(e))},_uint8clampedarray:function(e){return r("uint8clampedarray:"),this.dispatch(Array.prototype.slice.call(e))},_int8array:function(e){return r("uint8array:"),this.dispatch(Array.prototype.slice.call(e))},_uint16array:function(e){return r("uint16array:"),this.dispatch(Array.prototype.slice.call(e))},_int16array:function(e){return r("uint16array:"),this.dispatch(Array.prototype.slice.call(e))},_uint32array:function(e){return r("uint32array:"),this.dispatch(Array.prototype.slice.call(e))},_int32array:function(e){return r("uint32array:"),this.dispatch(Array.prototype.slice.call(e))},_float32array:function(e){return r("float32array:"),this.dispatch(Array.prototype.slice.call(e))},_float64array:function(e){return r("float64array:"),this.dispatch(Array.prototype.slice.call(e))},_arraybuffer:function(e){return r("arraybuffer:"),this.dispatch(new Uint8Array(e))},_url:function(e){return r("url:"+e.toString(),"utf8")},_map:function(t){r("map:");var n=Array.from(t);return this._array(n,e.unorderedSets!==!1)},_set:function(t){r("set:");var n=Array.from(t);return this._array(n,e.unorderedSets!==!1)},_blob:function(){if(e.ignoreUnknown)return r("[blob]");throw Error('Hashing Blob objects is currently not supported\n(see https://github.com/puleos/object-hash/issues/26)\nUse "options.replacer" or "options.ignoreUnknown"\n')},_domwindow:function(){return r("domwindow")},_process:function(){return r("process")},_timer:function(){return r("timer")},_pipe:function(){return r("pipe")},_tcp:function(){return r("tcp")},_udp:function(){return r("udp")},_tty:function(){return r("tty")},_statwatcher:function(){return r("statwatcher")},_securecontext:function(){return r("securecontext")},_connection:function(){return r("connection")},_zlib:function(){return r("zlib")},_context:function(){return r("context")},_nodescript:function(){return r("nodescript")},_httpparser:function(){return r("httpparser")},_dataview:function(){return r("dataview")},_signal:function(){return r("signal")},_fsevent:function(){return r("fsevent")},_tlswrap:function(){return r("tlswrap")}}}function w(){return{buf:"",write:function(e){this.buf+=e},end:function(e){this.buf+=e},read:function(){return this.buf}}}var b=e("crypto");n=t.exports=d,n.sha1=function(e){return d(e)},n.keys=function(e){return d(e,{excludeValues:!0,algorithm:"sha1",encoding:"hex"})},n.MD5=function(e){return d(e,{algorithm:"md5",encoding:"hex"})},n.keysMD5=function(e){return d(e,{algorithm:"md5",encoding:"hex",excludeValues:!0})};var v=b.getHashes?b.getHashes().slice():["sha1","md5"];v.push("passthrough");var m=["buffer","hex","binary","base64"];n.writeToStream=function(e,t,n){return"undefined"==typeof n&&(n=t,t={}),t=h(e,t),y(t,n).dispatch(e)}}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_8c3adc78.js","/")},{buffer:3,crypto:5,lYpoI2:10}],2:[function(e,t,n){(function(e,t,r,o,i,u,a,f,s){var c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";!function(e){"use strict";function t(e){var t=e.charCodeAt(0);return t===i||t===l?62:t===u||t===d?63:t<a?-1:t<a+10?t-a+26+26:t<s+26?t-s:t<f+26?t-f+26:void 0}function n(e){function n(e){s[l++]=e}var r,i,u,a,f,s;if(e.length%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var c=e.length;f="="===e.charAt(c-2)?2:"="===e.charAt(c-1)?1:0,s=new o(3*e.length/4-f),u=f>0?e.length-4:e.length;var l=0;for(r=0,i=0;r<u;r+=4,i+=3)a=t(e.charAt(r))<<18|t(e.charAt(r+1))<<12|t(e.charAt(r+2))<<6|t(e.charAt(r+3)),n((16711680&a)>>16),n((65280&a)>>8),n(255&a);return 2===f?(a=t(e.charAt(r))<<2|t(e.charAt(r+1))>>4,n(255&a)):1===f&&(a=t(e.charAt(r))<<10|t(e.charAt(r+1))<<4|t(e.charAt(r+2))>>2,n(a>>8&255),n(255&a)),s}function r(e){function t(e){return c.charAt(e)}function n(e){return t(e>>18&63)+t(e>>12&63)+t(e>>6&63)+t(63&e)}var r,o,i,u=e.length%3,a="";for(r=0,i=e.length-u;r<i;r+=3)o=(e[r]<<16)+(e[r+1]<<8)+e[r+2],a+=n(o);switch(u){case 1:o=e[e.length-1],a+=t(o>>2),a+=t(o<<4&63),a+="==";break;case 2:o=(e[e.length-2]<<8)+e[e.length-1],a+=t(o>>10),a+=t(o>>4&63),a+=t(o<<2&63),a+="="}return a}var o="undefined"!=typeof Uint8Array?Uint8Array:Array,i="+".charCodeAt(0),u="/".charCodeAt(0),a="0".charCodeAt(0),f="a".charCodeAt(0),s="A".charCodeAt(0),l="-".charCodeAt(0),d="_".charCodeAt(0);e.toByteArray=n,e.fromByteArray=r}("undefined"==typeof n?this.base64js={}:n)}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/base64-js/lib/b64.js","/node_modules/gulp-browserify/node_modules/base64-js/lib")},{buffer:3,lYpoI2:10}],3:[function(e,t,n){(function(t,r,o,i,u,a,f,s,c){function o(e,t,n){if(!(this instanceof o))return new o(e,t,n);var r=typeof e;if("base64"===t&&"string"===r)for(e=N(e);e.length%4!==0;)e+="=";var i;if("number"===r)i=F(e);else if("string"===r)i=o.byteLength(e,t);else{if("object"!==r)throw new Error("First argument needs to be a number, array or string.");i=F(e.length)}var u;o._useTypedArrays?u=o._augment(new Uint8Array(i)):(u=this,u.length=i,u._isBuffer=!0);var a;if(o._useTypedArrays&&"number"==typeof e.byteLength)u._set(e);else if(O(e))for(a=0;a<i;a++)o.isBuffer(e)?u[a]=e.readUInt8(a):u[a]=e[a];else if("string"===r)u.write(e,0,t);else if("number"===r&&!o._useTypedArrays&&!n)for(a=0;a<i;a++)u[a]=0;return u}function l(e,t,n,r){n=Number(n)||0;var i=e.length-n;r?(r=Number(r),r>i&&(r=i)):r=i;var u=t.length;G(u%2===0,"Invalid hex string"),r>u/2&&(r=u/2);for(var a=0;a<r;a++){var f=parseInt(t.substr(2*a,2),16);G(!isNaN(f),"Invalid hex string"),e[n+a]=f}return o._charsWritten=2*a,a}function d(e,t,n,r){var i=o._charsWritten=W(V(t),e,n,r);return i}function h(e,t,n,r){var i=o._charsWritten=W(q(t),e,n,r);return i}function p(e,t,n,r){return h(e,t,n,r)}function g(e,t,n,r){var i=o._charsWritten=W(R(t),e,n,r);return i}function y(e,t,n,r){var i=o._charsWritten=W(P(t),e,n,r);return i}function w(e,t,n){return 0===t&&n===e.length?K.fromByteArray(e):K.fromByteArray(e.slice(t,n))}function b(e,t,n){var r="",o="";n=Math.min(e.length,n);for(var i=t;i<n;i++)e[i]<=127?(r+=J(o)+String.fromCharCode(e[i]),o=""):o+="%"+e[i].toString(16);return r+J(o)}function v(e,t,n){var r="";n=Math.min(e.length,n);for(var o=t;o<n;o++)r+=String.fromCharCode(e[o]);return r}function m(e,t,n){return v(e,t,n)}function _(e,t,n){var r=e.length;(!t||t<0)&&(t=0),(!n||n<0||n>r)&&(n=r);for(var o="",i=t;i<n;i++)o+=H(e[i]);return o}function E(e,t,n){for(var r=e.slice(t,n),o="",i=0;i<r.length;i+=2)o+=String.fromCharCode(r[i]+256*r[i+1]);return o}function I(e,t,n,r){r||(G("boolean"==typeof n,"missing or invalid endian"),G(void 0!==t&&null!==t,"missing offset"),G(t+1<e.length,"Trying to read beyond buffer length"));var o=e.length;if(!(t>=o)){var i;return n?(i=e[t],t+1<o&&(i|=e[t+1]<<8)):(i=e[t]<<8,t+1<o&&(i|=e[t+1])),i}}function A(e,t,n,r){r||(G("boolean"==typeof n,"missing or invalid endian"),G(void 0!==t&&null!==t,"missing offset"),G(t+3<e.length,"Trying to read beyond buffer length"));var o=e.length;if(!(t>=o)){var i;return n?(t+2<o&&(i=e[t+2]<<16),t+1<o&&(i|=e[t+1]<<8),i|=e[t],t+3<o&&(i+=e[t+3]<<24>>>0)):(t+1<o&&(i=e[t+1]<<16),t+2<o&&(i|=e[t+2]<<8),t+3<o&&(i|=e[t+3]),i+=e[t]<<24>>>0),i}}function B(e,t,n,r){r||(G("boolean"==typeof n,"missing or invalid endian"),G(void 0!==t&&null!==t,"missing offset"),G(t+1<e.length,"Trying to read beyond buffer length"));var o=e.length;if(!(t>=o)){var i=I(e,t,n,!0),u=32768&i;return u?(65535-i+1)*-1:i}}function L(e,t,n,r){r||(G("boolean"==typeof n,"missing or invalid endian"),G(void 0!==t&&null!==t,"missing offset"),G(t+3<e.length,"Trying to read beyond buffer length"));var o=e.length;if(!(t>=o)){var i=A(e,t,n,!0),u=2147483648&i;return u?(4294967295-i+1)*-1:i}}function U(e,t,n,r){return r||(G("boolean"==typeof n,"missing or invalid endian"),G(t+3<e.length,"Trying to read beyond buffer length")),Q.read(e,t,n,23,4)}function x(e,t,n,r){return r||(G("boolean"==typeof n,"missing or invalid endian"),G(t+7<e.length,"Trying to read beyond buffer length")),Q.read(e,t,n,52,8)}function S(e,t,n,r,o){o||(G(void 0!==t&&null!==t,"missing value"),G("boolean"==typeof r,"missing or invalid endian"),G(void 0!==n&&null!==n,"missing offset"),G(n+1<e.length,"trying to write beyond buffer length"),z(t,65535));var i=e.length;if(!(n>=i))for(var u=0,a=Math.min(i-n,2);u<a;u++)e[n+u]=(t&255<<8*(r?u:1-u))>>>8*(r?u:1-u)}function C(e,t,n,r,o){o||(G(void 0!==t&&null!==t,"missing value"),G("boolean"==typeof r,"missing or invalid endian"),G(void 0!==n&&null!==n,"missing offset"),G(n+3<e.length,"trying to write beyond buffer length"),z(t,4294967295));var i=e.length;if(!(n>=i))for(var u=0,a=Math.min(i-n,4);u<a;u++)e[n+u]=t>>>8*(r?u:3-u)&255}function j(e,t,n,r,o){o||(G(void 0!==t&&null!==t,"missing value"),G("boolean"==typeof r,"missing or invalid endian"),G(void 0!==n&&null!==n,"missing offset"),G(n+1<e.length,"Trying to write beyond buffer length"),X(t,32767,-32768));var i=e.length;n>=i||(t>=0?S(e,t,n,r,o):S(e,65535+t+1,n,r,o))}function k(e,t,n,r,o){o||(G(void 0!==t&&null!==t,"missing value"),G("boolean"==typeof r,"missing or invalid endian"),G(void 0!==n&&null!==n,"missing offset"),G(n+3<e.length,"Trying to write beyond buffer length"),X(t,2147483647,-2147483648));var i=e.length;n>=i||(t>=0?C(e,t,n,r,o):C(e,4294967295+t+1,n,r,o))}function T(e,t,n,r,o){o||(G(void 0!==t&&null!==t,"missing value"),G("boolean"==typeof r,"missing or invalid endian"),G(void 0!==n&&null!==n,"missing offset"),G(n+3<e.length,"Trying to write beyond buffer length"),$(t,3.4028234663852886e38,-3.4028234663852886e38));var i=e.length;n>=i||Q.write(e,t,n,r,23,4)}function M(e,t,n,r,o){o||(G(void 0!==t&&null!==t,"missing value"),G("boolean"==typeof r,"missing or invalid endian"),G(void 0!==n&&null!==n,"missing offset"),G(n+7<e.length,"Trying to write beyond buffer length"),$(t,1.7976931348623157e308,-1.7976931348623157e308));var i=e.length;n>=i||Q.write(e,t,n,r,52,8)}function N(e){return e.trim?e.trim():e.replace(/^\s+|\s+$/g,"")}function Y(e,t,n){return"number"!=typeof e?n:(e=~~e,e>=t?t:e>=0?e:(e+=t,e>=0?e:0))}function F(e){return e=~~Math.ceil(+e),e<0?0:e}function D(e){return(Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)})(e)}function O(e){return D(e)||o.isBuffer(e)||e&&"object"==typeof e&&"number"==typeof e.length}function H(e){return e<16?"0"+e.toString(16):e.toString(16)}function V(e){for(var t=[],n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<=127)t.push(e.charCodeAt(n));else{var o=n;r>=55296&&r<=57343&&n++;for(var i=encodeURIComponent(e.slice(o,n+1)).substr(1).split("%"),u=0;u<i.length;u++)t.push(parseInt(i[u],16))}}return t}function q(e){for(var t=[],n=0;n<e.length;n++)t.push(255&e.charCodeAt(n));return t}function P(e){for(var t,n,r,o=[],i=0;i<e.length;i++)t=e.charCodeAt(i),n=t>>8,r=t%256,o.push(r),o.push(n);return o}function R(e){return K.toByteArray(e)}function W(e,t,n,r){for(var o=0;o<r&&!(o+n>=t.length||o>=e.length);o++)t[o+n]=e[o];return o}function J(e){try{return decodeURIComponent(e)}catch(t){return String.fromCharCode(65533)}}function z(e,t){G("number"==typeof e,"cannot write a non-number as a number"),G(e>=0,"specified a negative value for writing an unsigned value"),G(e<=t,"value is larger than maximum value for type"),G(Math.floor(e)===e,"value has a fractional component")}function X(e,t,n){G("number"==typeof e,"cannot write a non-number as a number"),G(e<=t,"value larger than maximum allowed value"),G(e>=n,"value smaller than minimum allowed value"),G(Math.floor(e)===e,"value has a fractional component")}function $(e,t,n){G("number"==typeof e,"cannot write a non-number as a number"),G(e<=t,"value larger than maximum allowed value"),G(e>=n,"value smaller than minimum allowed value")}function G(e,t){if(!e)throw new Error(t||"Failed assertion")}var K=e("base64-js"),Q=e("ieee754");n.Buffer=o,n.SlowBuffer=o,n.INSPECT_MAX_BYTES=50,o.poolSize=8192,o._useTypedArrays=function(){try{var e=new ArrayBuffer(0),t=new Uint8Array(e);return t.foo=function(){return 42},42===t.foo()&&"function"==typeof t.subarray}catch(n){return!1}}(),o.isEncoding=function(e){switch(String(e).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},o.isBuffer=function(e){return!(null===e||void 0===e||!e._isBuffer)},o.byteLength=function(e,t){var n;switch(e+="",t||"utf8"){case"hex":n=e.length/2;break;case"utf8":case"utf-8":n=V(e).length;break;case"ascii":case"binary":case"raw":n=e.length;break;case"base64":n=R(e).length;break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":n=2*e.length;break;default:throw new Error("Unknown encoding")}return n},o.concat=function(e,t){if(G(D(e),"Usage: Buffer.concat(list, [totalLength])\nlist should be an Array."),0===e.length)return new o(0);if(1===e.length)return e[0];var n;if("number"!=typeof t)for(t=0,n=0;n<e.length;n++)t+=e[n].length;var r=new o(t),i=0;for(n=0;n<e.length;n++){var u=e[n];u.copy(r,i),i+=u.length}return r},o.prototype.write=function(e,t,n,r){if(isFinite(t))isFinite(n)||(r=n,n=void 0);else{var o=r;r=t,t=n,n=o}t=Number(t)||0;var i=this.length-t;n?(n=Number(n),n>i&&(n=i)):n=i,r=String(r||"utf8").toLowerCase();var u;switch(r){case"hex":u=l(this,e,t,n);break;case"utf8":case"utf-8":u=d(this,e,t,n);break;case"ascii":u=h(this,e,t,n);break;case"binary":u=p(this,e,t,n);break;case"base64":u=g(this,e,t,n);break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":u=y(this,e,t,n);break;default:throw new Error("Unknown encoding")}return u},o.prototype.toString=function(e,t,n){var r=this;if(e=String(e||"utf8").toLowerCase(),t=Number(t)||0,n=void 0!==n?Number(n):n=r.length,n===t)return"";var o;switch(e){case"hex":o=_(r,t,n);break;case"utf8":case"utf-8":o=b(r,t,n);break;case"ascii":o=v(r,t,n);break;case"binary":o=m(r,t,n);break;case"base64":o=w(r,t,n);break;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":o=E(r,t,n);break;default:throw new Error("Unknown encoding")}return o},o.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}},o.prototype.copy=function(e,t,n,r){var i=this;if(n||(n=0),r||0===r||(r=this.length),t||(t=0),r!==n&&0!==e.length&&0!==i.length){G(r>=n,"sourceEnd < sourceStart"),G(t>=0&&t<e.length,"targetStart out of bounds"),G(n>=0&&n<i.length,"sourceStart out of bounds"),G(r>=0&&r<=i.length,"sourceEnd out of bounds"),r>this.length&&(r=this.length),e.length-t<r-n&&(r=e.length-t+n);var u=r-n;if(u<100||!o._useTypedArrays)for(var a=0;a<u;a++)e[a+t]=this[a+n];else e._set(this.subarray(n,n+u),t)}},o.prototype.slice=function(e,t){var n=this.length;if(e=Y(e,n,0),t=Y(t,n,n),o._useTypedArrays)return o._augment(this.subarray(e,t));for(var r=t-e,i=new o(r,(void 0),(!0)),u=0;u<r;u++)i[u]=this[u+e];return i},o.prototype.get=function(e){return console.log(".get() is deprecated. Access using array indexes instead."),this.readUInt8(e)},o.prototype.set=function(e,t){return console.log(".set() is deprecated. Access using array indexes instead."),this.writeUInt8(e,t)},o.prototype.readUInt8=function(e,t){if(t||(G(void 0!==e&&null!==e,"missing offset"),G(e<this.length,"Trying to read beyond buffer length")),!(e>=this.length))return this[e]},o.prototype.readUInt16LE=function(e,t){return I(this,e,!0,t)},o.prototype.readUInt16BE=function(e,t){return I(this,e,!1,t)},o.prototype.readUInt32LE=function(e,t){return A(this,e,!0,t)},o.prototype.readUInt32BE=function(e,t){return A(this,e,!1,t)},o.prototype.readInt8=function(e,t){if(t||(G(void 0!==e&&null!==e,"missing offset"),G(e<this.length,"Trying to read beyond buffer length")),!(e>=this.length)){var n=128&this[e];return n?(255-this[e]+1)*-1:this[e]}},o.prototype.readInt16LE=function(e,t){return B(this,e,!0,t)},o.prototype.readInt16BE=function(e,t){return B(this,e,!1,t)},o.prototype.readInt32LE=function(e,t){return L(this,e,!0,t)},o.prototype.readInt32BE=function(e,t){return L(this,e,!1,t)},o.prototype.readFloatLE=function(e,t){return U(this,e,!0,t)},o.prototype.readFloatBE=function(e,t){return U(this,e,!1,t)},o.prototype.readDoubleLE=function(e,t){return x(this,e,!0,t)},o.prototype.readDoubleBE=function(e,t){return x(this,e,!1,t)},o.prototype.writeUInt8=function(e,t,n){n||(G(void 0!==e&&null!==e,"missing value"),G(void 0!==t&&null!==t,"missing offset"),G(t<this.length,"trying to write beyond buffer length"),z(e,255)),t>=this.length||(this[t]=e)},o.prototype.writeUInt16LE=function(e,t,n){S(this,e,t,!0,n)},o.prototype.writeUInt16BE=function(e,t,n){S(this,e,t,!1,n)},o.prototype.writeUInt32LE=function(e,t,n){C(this,e,t,!0,n)},o.prototype.writeUInt32BE=function(e,t,n){C(this,e,t,!1,n)},o.prototype.writeInt8=function(e,t,n){n||(G(void 0!==e&&null!==e,"missing value"),G(void 0!==t&&null!==t,"missing offset"),G(t<this.length,"Trying to write beyond buffer length"),X(e,127,-128)),t>=this.length||(e>=0?this.writeUInt8(e,t,n):this.writeUInt8(255+e+1,t,n))},o.prototype.writeInt16LE=function(e,t,n){j(this,e,t,!0,n)},o.prototype.writeInt16BE=function(e,t,n){j(this,e,t,!1,n)},o.prototype.writeInt32LE=function(e,t,n){k(this,e,t,!0,n)},o.prototype.writeInt32BE=function(e,t,n){k(this,e,t,!1,n)},o.prototype.writeFloatLE=function(e,t,n){T(this,e,t,!0,n)},o.prototype.writeFloatBE=function(e,t,n){T(this,e,t,!1,n)},o.prototype.writeDoubleLE=function(e,t,n){M(this,e,t,!0,n)},o.prototype.writeDoubleBE=function(e,t,n){M(this,e,t,!1,n)},o.prototype.fill=function(e,t,n){if(e||(e=0),t||(t=0),n||(n=this.length),"string"==typeof e&&(e=e.charCodeAt(0)),G("number"==typeof e&&!isNaN(e),"value is not a number"),G(n>=t,"end < start"),n!==t&&0!==this.length){G(t>=0&&t<this.length,"start out of bounds"),G(n>=0&&n<=this.length,"end out of bounds");for(var r=t;r<n;r++)this[r]=e}},o.prototype.inspect=function(){for(var e=[],t=this.length,r=0;r<t;r++)if(e[r]=H(this[r]),r===n.INSPECT_MAX_BYTES){e[r+1]="...";break}return"<Buffer "+e.join(" ")+">"},o.prototype.toArrayBuffer=function(){if("undefined"!=typeof Uint8Array){if(o._useTypedArrays)return new o(this).buffer;for(var e=new Uint8Array(this.length),t=0,n=e.length;t<n;t+=1)e[t]=this[t];return e.buffer}throw new Error("Buffer.toArrayBuffer not supported in this browser")};var Z=o.prototype;o._augment=function(e){return e._isBuffer=!0,e._get=e.get,e._set=e.set,e.get=Z.get,e.set=Z.set,e.write=Z.write,e.toString=Z.toString,e.toLocaleString=Z.toString,e.toJSON=Z.toJSON,e.copy=Z.copy,e.slice=Z.slice,e.readUInt8=Z.readUInt8,e.readUInt16LE=Z.readUInt16LE,e.readUInt16BE=Z.readUInt16BE,e.readUInt32LE=Z.readUInt32LE,e.readUInt32BE=Z.readUInt32BE,e.readInt8=Z.readInt8,e.readInt16LE=Z.readInt16LE,e.readInt16BE=Z.readInt16BE,e.readInt32LE=Z.readInt32LE,e.readInt32BE=Z.readInt32BE,e.readFloatLE=Z.readFloatLE,e.readFloatBE=Z.readFloatBE,e.readDoubleLE=Z.readDoubleLE,e.readDoubleBE=Z.readDoubleBE,e.writeUInt8=Z.writeUInt8,e.writeUInt16LE=Z.writeUInt16LE,e.writeUInt16BE=Z.writeUInt16BE,e.writeUInt32LE=Z.writeUInt32LE,e.writeUInt32BE=Z.writeUInt32BE,e.writeInt8=Z.writeInt8,e.writeInt16LE=Z.writeInt16LE,e.writeInt16BE=Z.writeInt16BE,e.writeInt32LE=Z.writeInt32LE,e.writeInt32BE=Z.writeInt32BE,e.writeFloatLE=Z.writeFloatLE,e.writeFloatBE=Z.writeFloatBE,e.writeDoubleLE=Z.writeDoubleLE,e.writeDoubleBE=Z.writeDoubleBE,e.fill=Z.fill,e.inspect=Z.inspect,e.toArrayBuffer=Z.toArrayBuffer,e}}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/buffer/index.js","/node_modules/gulp-browserify/node_modules/buffer")},{"base64-js":2,buffer:3,ieee754:11,lYpoI2:10}],4:[function(e,t,n){(function(n,r,o,i,u,a,f,s,c){function l(e,t){if(e.length%p!==0){var n=e.length+(p-e.length%p);e=o.concat([e,g],n)}for(var r=[],i=t?e.readInt32BE:e.readInt32LE,u=0;u<e.length;u+=p)r.push(i.call(e,u));return r}function d(e,t,n){for(var r=new o(t),i=n?r.writeInt32BE:r.writeInt32LE,u=0;u<e.length;u++)i.call(r,e[u],4*u,!0);return r}function h(e,t,n,r){o.isBuffer(e)||(e=new o(e));var i=t(l(e,r),e.length*y);return d(i,n,r)}var o=e("buffer").Buffer,p=4,g=new o(p);g.fill(0);var y=8;t.exports={hash:h}}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/helpers.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{buffer:3,lYpoI2:10}],5:[function(e,t,n){(function(t,r,o,i,u,a,f,s,c){function l(e,t,n){o.isBuffer(t)||(t=new o(t)),o.isBuffer(n)||(n=new o(n)),t.length>m?t=e(t):t.length<m&&(t=o.concat([t,_],m));for(var r=new o(m),i=new o(m),u=0;u<m;u++)r[u]=54^t[u],i[u]=92^t[u];var a=e(o.concat([r,n]));return e(o.concat([i,a]))}function d(e,t){e=e||"sha1";var n=v[e],r=[],i=0;return n||h("algorithm:",e,"is not yet supported"),{update:function(e){return o.isBuffer(e)||(e=new o(e)),r.push(e),i+=e.length,this},digest:function(e){var i=o.concat(r),u=t?l(n,t,i):n(i);return r=null,e?u.toString(e):u}}}function h(){var e=[].slice.call(arguments).join(" ");throw new Error([e,"we accept pull requests","http://github.com/dominictarr/crypto-browserify"].join("\n"))}function p(e,t){for(var n in e)t(e[n],n)}var o=e("buffer").Buffer,g=e("./sha"),y=e("./sha256"),w=e("./rng"),b=e("./md5"),v={sha1:g,sha256:y,md5:b},m=64,_=new o(m);_.fill(0),n.createHash=function(e){return d(e)},n.createHmac=function(e,t){return d(e,t)},n.randomBytes=function(e,t){if(!t||!t.call)return new o(w(e));try{t.call(this,void 0,new o(w(e)))}catch(n){t(n)}},p(["createCredentials","createCipher","createCipheriv","createDecipher","createDecipheriv","createSign","createVerify","createDiffieHellman","pbkdf2"],function(e){n[e]=function(){h("sorry,",e,"is not implemented yet")}})}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/index.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{"./md5":6,"./rng":7,"./sha":8,"./sha256":9,buffer:3,lYpoI2:10}],6:[function(e,t,n){(function(n,r,o,i,u,a,f,s,c){function l(e,t){e[t>>5]|=128<<t%32,e[(t+64>>>9<<4)+14]=t;for(var n=1732584193,r=-271733879,o=-1732584194,i=271733878,u=0;u<e.length;u+=16){var a=n,f=r,s=o,c=i;n=h(n,r,o,i,e[u+0],7,-680876936),i=h(i,n,r,o,e[u+1],12,-389564586),o=h(o,i,n,r,e[u+2],17,606105819),r=h(r,o,i,n,e[u+3],22,-1044525330),n=h(n,r,o,i,e[u+4],7,-176418897),i=h(i,n,r,o,e[u+5],12,1200080426),o=h(o,i,n,r,e[u+6],17,-1473231341),r=h(r,o,i,n,e[u+7],22,-45705983),n=h(n,r,o,i,e[u+8],7,1770035416),i=h(i,n,r,o,e[u+9],12,-1958414417),o=h(o,i,n,r,e[u+10],17,-42063),r=h(r,o,i,n,e[u+11],22,-1990404162),n=h(n,r,o,i,e[u+12],7,1804603682),i=h(i,n,r,o,e[u+13],12,-40341101),o=h(o,i,n,r,e[u+14],17,-1502002290),r=h(r,o,i,n,e[u+15],22,1236535329),n=p(n,r,o,i,e[u+1],5,-165796510),i=p(i,n,r,o,e[u+6],9,-1069501632),o=p(o,i,n,r,e[u+11],14,643717713),r=p(r,o,i,n,e[u+0],20,-373897302),n=p(n,r,o,i,e[u+5],5,-701558691),i=p(i,n,r,o,e[u+10],9,38016083),o=p(o,i,n,r,e[u+15],14,-660478335),r=p(r,o,i,n,e[u+4],20,-405537848),n=p(n,r,o,i,e[u+9],5,568446438),i=p(i,n,r,o,e[u+14],9,-1019803690),o=p(o,i,n,r,e[u+3],14,-187363961),r=p(r,o,i,n,e[u+8],20,1163531501),n=p(n,r,o,i,e[u+13],5,-1444681467),i=p(i,n,r,o,e[u+2],9,-51403784),o=p(o,i,n,r,e[u+7],14,1735328473),r=p(r,o,i,n,e[u+12],20,-1926607734),n=g(n,r,o,i,e[u+5],4,-378558),i=g(i,n,r,o,e[u+8],11,-2022574463),o=g(o,i,n,r,e[u+11],16,1839030562),r=g(r,o,i,n,e[u+14],23,-35309556),n=g(n,r,o,i,e[u+1],4,-1530992060),i=g(i,n,r,o,e[u+4],11,1272893353),o=g(o,i,n,r,e[u+7],16,-155497632),r=g(r,o,i,n,e[u+10],23,-1094730640),n=g(n,r,o,i,e[u+13],4,681279174),i=g(i,n,r,o,e[u+0],11,-358537222),o=g(o,i,n,r,e[u+3],16,-722521979),r=g(r,o,i,n,e[u+6],23,76029189),n=g(n,r,o,i,e[u+9],4,-640364487),i=g(i,n,r,o,e[u+12],11,-421815835),o=g(o,i,n,r,e[u+15],16,530742520),r=g(r,o,i,n,e[u+2],23,-995338651),n=y(n,r,o,i,e[u+0],6,-198630844),i=y(i,n,r,o,e[u+7],10,1126891415),o=y(o,i,n,r,e[u+14],15,-1416354905),r=y(r,o,i,n,e[u+5],21,-57434055),n=y(n,r,o,i,e[u+12],6,1700485571),i=y(i,n,r,o,e[u+3],10,-1894986606),o=y(o,i,n,r,e[u+10],15,-1051523),r=y(r,o,i,n,e[u+1],21,-2054922799),n=y(n,r,o,i,e[u+8],6,1873313359),i=y(i,n,r,o,e[u+15],10,-30611744),o=y(o,i,n,r,e[u+6],15,-1560198380),r=y(r,o,i,n,e[u+13],21,1309151649),n=y(n,r,o,i,e[u+4],6,-145523070),i=y(i,n,r,o,e[u+11],10,-1120210379),o=y(o,i,n,r,e[u+2],15,718787259),r=y(r,o,i,n,e[u+9],21,-343485551),n=w(n,a),r=w(r,f),o=w(o,s),i=w(i,c)}return Array(n,r,o,i)}function d(e,t,n,r,o,i){return w(b(w(w(t,e),w(r,i)),o),n)}function h(e,t,n,r,o,i,u){return d(t&n|~t&r,e,t,o,i,u)}function p(e,t,n,r,o,i,u){return d(t&r|n&~r,e,t,o,i,u)}function g(e,t,n,r,o,i,u){return d(t^n^r,e,t,o,i,u)}function y(e,t,n,r,o,i,u){return d(n^(t|~r),e,t,o,i,u)}function w(e,t){var n=(65535&e)+(65535&t),r=(e>>16)+(t>>16)+(n>>16);return r<<16|65535&n}function b(e,t){return e<<t|e>>>32-t}var v=e("./helpers");t.exports=function(e){return v.hash(e,l,16)}}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/md5.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{"./helpers":4,buffer:3,lYpoI2:10}],7:[function(e,t,n){(function(e,n,r,o,i,u,a,f,s){!function(){var e,n,r=this;e=function(e){for(var t,t,n=new Array(e),r=0;r<e;r++)0==(3&r)&&(t=4294967296*Math.random()),n[r]=t>>>((3&r)<<3)&255;return n},r.crypto&&crypto.getRandomValues&&(n=function(e){var t=new Uint8Array(e);return crypto.getRandomValues(t),t}),t.exports=n||e}()}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/rng.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{buffer:3,lYpoI2:10}],8:[function(e,t,n){(function(n,r,o,i,u,a,f,s,c){function l(e,t){e[t>>5]|=128<<24-t%32,e[(t+64>>9<<4)+15]=t;for(var n=Array(80),r=1732584193,o=-271733879,i=-1732584194,u=271733878,a=-1009589776,f=0;f<e.length;f+=16){for(var s=r,c=o,l=i,y=u,w=a,b=0;b<80;b++){b<16?n[b]=e[f+b]:n[b]=g(n[b-3]^n[b-8]^n[b-14]^n[b-16],1);var v=p(p(g(r,5),d(b,o,i,u)),p(p(a,n[b]),h(b)));a=u,u=i,i=g(o,30),o=r,r=v}r=p(r,s),o=p(o,c),i=p(i,l),u=p(u,y),a=p(a,w)}return Array(r,o,i,u,a)}function d(e,t,n,r){return e<20?t&n|~t&r:e<40?t^n^r:e<60?t&n|t&r|n&r:t^n^r}function h(e){return e<20?1518500249:e<40?1859775393:e<60?-1894007588:-899497514}function p(e,t){var n=(65535&e)+(65535&t),r=(e>>16)+(t>>16)+(n>>16);return r<<16|65535&n}function g(e,t){return e<<t|e>>>32-t}var y=e("./helpers");t.exports=function(e){return y.hash(e,l,20,!0)}}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/sha.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{"./helpers":4,buffer:3,lYpoI2:10}],9:[function(e,t,n){(function(n,r,o,i,u,a,f,s,c){var l=e("./helpers"),d=function(e,t){var n=(65535&e)+(65535&t),r=(e>>16)+(t>>16)+(n>>16);return r<<16|65535&n},h=function(e,t){return e>>>t|e<<32-t},p=function(e,t){return e>>>t},g=function(e,t,n){return e&t^~e&n},y=function(e,t,n){return e&t^e&n^t&n},w=function(e){return h(e,2)^h(e,13)^h(e,22)},b=function(e){return h(e,6)^h(e,11)^h(e,25)},v=function(e){return h(e,7)^h(e,18)^p(e,3)},m=function(e){return h(e,17)^h(e,19)^p(e,10)},_=function(e,t){var n,r,o,i,u,a,f,s,c,l,h,p,_=new Array(1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298),E=new Array(1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225),I=new Array(64);
	e[t>>5]|=128<<24-t%32,e[(t+64>>9<<4)+15]=t;for(var c=0;c<e.length;c+=16){n=E[0],r=E[1],o=E[2],i=E[3],u=E[4],a=E[5],f=E[6],s=E[7];for(var l=0;l<64;l++)l<16?I[l]=e[l+c]:I[l]=d(d(d(m(I[l-2]),I[l-7]),v(I[l-15])),I[l-16]),h=d(d(d(d(s,b(u)),g(u,a,f)),_[l]),I[l]),p=d(w(n),y(n,r,o)),s=f,f=a,a=u,u=d(i,h),i=o,o=r,r=n,n=d(h,p);E[0]=d(n,E[0]),E[1]=d(r,E[1]),E[2]=d(o,E[2]),E[3]=d(i,E[3]),E[4]=d(u,E[4]),E[5]=d(a,E[5]),E[6]=d(f,E[6]),E[7]=d(s,E[7])}return E};t.exports=function(e){return l.hash(e,_,32,!0)}}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/crypto-browserify/sha256.js","/node_modules/gulp-browserify/node_modules/crypto-browserify")},{"./helpers":4,buffer:3,lYpoI2:10}],10:[function(e,t,n){(function(e,n,r,o,i,u,a,f,s){function c(){}var e=t.exports={};e.nextTick=function(){var e="undefined"!=typeof window&&window.setImmediate,t="undefined"!=typeof window&&window.postMessage&&window.addEventListener;if(e)return function(e){return window.setImmediate(e)};if(t){var n=[];return window.addEventListener("message",function(e){var t=e.source;if((t===window||null===t)&&"process-tick"===e.data&&(e.stopPropagation(),n.length>0)){var r=n.shift();r()}},!0),function(e){n.push(e),window.postMessage("process-tick","*")}}return function(e){setTimeout(e,0)}}(),e.title="browser",e.browser=!0,e.env={},e.argv=[],e.on=c,e.addListener=c,e.once=c,e.off=c,e.removeListener=c,e.removeAllListeners=c,e.emit=c,e.binding=function(e){throw new Error("process.binding is not supported")},e.cwd=function(){return"/"},e.chdir=function(e){throw new Error("process.chdir is not supported")}}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/process/browser.js","/node_modules/gulp-browserify/node_modules/process")},{buffer:3,lYpoI2:10}],11:[function(e,t,n){(function(e,t,r,o,i,u,a,f,s){n.read=function(e,t,n,r,o){var i,u,a=8*o-r-1,f=(1<<a)-1,s=f>>1,c=-7,l=n?o-1:0,d=n?-1:1,h=e[t+l];for(l+=d,i=h&(1<<-c)-1,h>>=-c,c+=a;c>0;i=256*i+e[t+l],l+=d,c-=8);for(u=i&(1<<-c)-1,i>>=-c,c+=r;c>0;u=256*u+e[t+l],l+=d,c-=8);if(0===i)i=1-s;else{if(i===f)return u?NaN:(h?-1:1)*(1/0);u+=Math.pow(2,r),i-=s}return(h?-1:1)*u*Math.pow(2,i-r)},n.write=function(e,t,n,r,o,i){var u,a,f,s=8*i-o-1,c=(1<<s)-1,l=c>>1,d=23===o?Math.pow(2,-24)-Math.pow(2,-77):0,h=r?0:i-1,p=r?1:-1,g=t<0||0===t&&1/t<0?1:0;for(t=Math.abs(t),isNaN(t)||t===1/0?(a=isNaN(t)?1:0,u=c):(u=Math.floor(Math.log(t)/Math.LN2),t*(f=Math.pow(2,-u))<1&&(u--,f*=2),t+=u+l>=1?d/f:d*Math.pow(2,1-l),t*f>=2&&(u++,f/=2),u+l>=c?(a=0,u=c):u+l>=1?(a=(t*f-1)*Math.pow(2,o),u+=l):(a=t*Math.pow(2,l-1)*Math.pow(2,o),u=0));o>=8;e[n+h]=255&a,h+=p,a/=256,o-=8);for(u=u<<o|a,s+=o;s>0;e[n+h]=255&u,h+=p,u/=256,s-=8);e[n+h-p]|=128*g}}).call(this,e("lYpoI2"),"undefined"!=typeof self?self:"undefined"!=typeof window?window:{},e("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/ieee754/index.js","/node_modules/ieee754")},{buffer:3,lYpoI2:10}]},{},[1])(1)});

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var EventEmitter = __webpack_require__(16);
	var Q = __webpack_require__(6);

	var createNextFn = __webpack_require__(17),
	    _filter = __webpack_require__(18),
	    _project = __webpack_require__(87),
	    _group = __webpack_require__(89),
	    _unwind = __webpack_require__(90),
	    _sort = __webpack_require__(84),
	    _skip = __webpack_require__(91),
	    _limit = __webpack_require__(92);

	/**
	 * Cursor data event.
	 * @event Cursor#data
	 * @type {object}
	 */

	/**
	 * Cursor end event.
	 * @event Cursor#end
	 */

	/**
	 * Class representing a query cursor.
	 * <strong>Note:</strong> The filter, limit, skip, project, group,
	 * unwind and sort, methods each add an additional stage to the
	 * cursor pipeline and thus do not override any previous invocations.
	 */

	var Cursor = function (_EventEmitter) {
	    _inherits(Cursor, _EventEmitter);

	    /** <strong>Note:</strong> Do not instantiate directly. */
	    function Cursor(col, read_pref) {
	        _classCallCheck(this, Cursor);

	        var _this = _possibleConstructorReturn(this, (Cursor.__proto__ || Object.getPrototypeOf(Cursor)).call(this));

	        _this._col = col;
	        _this._read_pref = read_pref;
	        _this._pipeline = [];
	        _this._next = _this._init;
	        _this.id = new Date().valueOf();
	        return _this;
	    }

	    _createClass(Cursor, [{
	        key: '_forEach',
	        value: function _forEach(fn, cb) {
	            var _this2 = this;

	            this._next(function (error, doc) {
	                if (doc) {
	                    fn(doc);

	                    _this2.emit('data', doc);
	                    _this2._forEach(fn, cb);
	                } else {
	                    _this2.emit('end');

	                    cb(error);
	                }
	            });
	        }

	        /**
	         * Iterate over each document and apply a function.
	         * @param {function} [fn] The function to apply to each document.
	         * @param {function} [cb] The result callback.
	         * @return {Promise}
	         *
	         * @example
	         * col.find().forEach((doc) => {
	         *     console.log('doc:', doc);
	         * }, (error) => {
	         *     if (error) { throw error; }
	         * });
	         */

	    }, {
	        key: 'forEach',
	        value: function forEach() {
	            var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
	            var cb = arguments[1];

	            var deferred = Q.defer();

	            this._forEach(fn, function (error) {
	                if (error) {
	                    deferred.reject(error);
	                } else {
	                    deferred.resolve();
	                }
	            });

	            deferred.promise.nodeify(cb);

	            return deferred.promise;
	        }
	    }, {
	        key: '_toArray',
	        value: function _toArray(cb) {
	            var docs = [];

	            this._forEach(function (doc) {
	                docs.push(doc);
	            }, function (error) {
	                return cb(error, docs);
	            });
	        }

	        /**
	         * Collect all documents as an array.
	         * @param {function} [cb] The result callback.
	         * @return {Promise}
	         *
	         * @example
	         * col.find().toArray((error, docs) => {
	         *     if (error) { throw error; }
	         *
	         *     for (let doc of docs) {
	         *         console.log('doc:', doc);
	         *     }
	         * });
	         */

	    }, {
	        key: 'toArray',
	        value: function toArray(cb) {
	            var deferred = Q.defer();

	            this._toArray(function (error, docs) {
	                if (error) {
	                    deferred.reject(error);
	                } else {
	                    deferred.resolve(docs);
	                }
	            });

	            deferred.promise.nodeify(cb);

	            return deferred.promise;
	        }
	    }, {
	        key: '_assertUnopened',
	        value: function _assertUnopened() {
	            if (this._opened) {
	                throw Error('cursor has already been opened');
	            }
	        }
	    }, {
	        key: 'hint',
	        value: function hint(path) {
	            this._assertUnopened();

	            if (!this._col._isIndexed(path)) {
	                throw Error('index \'' + path + '\' does not exist');
	            }

	            this._hint = path;

	            return this;
	        }
	    }, {
	        key: '_addStage',
	        value: function _addStage(fn, arg) {
	            this._assertUnopened();
	            this._pipeline.push([fn, arg]);

	            return this;
	        }

	        /**
	         * Filter documents.
	         * @param {object} expr The query document to filter by.
	         * @return {Cursor}
	         *
	         * @example
	         * col.find().filter({ x: 4 });
	         */

	    }, {
	        key: 'filter',
	        value: function filter(expr) {
	            return this._addStage(_filter, expr);
	        }

	        /**
	         * Limit the number of documents that can be iterated.
	         * @param {number} num The limit.
	         * @return {Cursor}
	         *
	         * @example
	         * col.find().limit(10);
	         */

	    }, {
	        key: 'limit',
	        value: function limit(num) {
	            return this._addStage(_limit, num);
	        }
	    }, {
	        key: 'count',
	        value: function count(expr, cb) {
	            if (typeof expr == 'function') {
	                cb = expr;
	                expr = {};
	            }

	            return this.filter(expr).toArray().then(function (docs) {
	                return docs.length;
	            });
	        }

	        /**
	         * Skip over a specified number of documents.
	         * @param {number} num The number of documents to skip.
	         * @return {Cursor}
	         *
	         * @example
	         * col.find().skip(4);
	         */

	    }, {
	        key: 'skip',
	        value: function skip(num) {
	            return this._addStage(_skip, num);
	        }

	        /**
	         * Add new fields, and include or exclude pre-existing fields.
	         * @param {object} spec Specification for projection.
	         * @return {Cursor}
	         *
	         * @example
	         * col.find().project({ _id: 0, x: 1, n: { $add: ['$k', 4] } });
	         */

	    }, {
	        key: 'project',
	        value: function project(spec) {
	            return this._addStage(_project, spec);
	        }

	        /**
	         * Group documents by an _id and optionally add computed fields.
	         * @param {object} spec Specification for grouping documents.
	         * @return {Cursor}
	         *
	         * @example
	         * col.find().group({
	         *     _id: '$author',
	         *     books: { $push: '$book' },
	         *     count: { $sum: 1 }
	         * });
	         */

	    }, {
	        key: 'group',
	        value: function group(spec) {
	            return this._addStage(_group, spec);
	        }

	        /**
	         * Deconstruct an iterable and output a document for each element.
	         * @param {string} path A path to an iterable to unwind.
	         * @return {Cursor}
	         *
	         * @example
	         * col.find().unwind('$elements');
	         */

	    }, {
	        key: 'unwind',
	        value: function unwind(path) {
	            return this._addStage(_unwind, path);
	        }

	        /**
	         * Sort documents.
	         * <strong>Note:</strong> An index will not be used for sorting
	         * unless the query predicate references one of the fields to
	         * sort by or {@link Cursor#hint} is used. This is so as not to exclude
	         * documents that do not contain the indexed field, in accordance
	         * with the functionality of MongoDB.
	         * @param {object} spec Specification for sorting.
	         * @return {Cursor}
	         *
	         * @example
	         * // No indexes will be used for sorting.
	         * col.find().sort({ x: 1 });
	         *
	         * @example
	         * // If x is indexed, it will be used for sorting.
	         * col.find({ x: { $gt: 4 } }).sort({ x: 1 });
	         *
	         * @example
	         * // If x is indexed, it will be used for sorting.
	         * col.find().sort({ x: 1 }).hint('x');
	         */

	    }, {
	        key: 'sort',
	        value: function sort(spec) {
	            return this._addStage(_sort, spec);
	        }
	    }, {
	        key: '_init',
	        value: function _init(cb) {
	            this._opened = true;
	            this._next = createNextFn(this);
	            this._next(cb);
	        }
	    }]);

	    return Cursor;
	}(EventEmitter);

	module.exports = Cursor;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var merge = __webpack_require__(8);

	var _require = __webpack_require__(7),
	    hashify = _require.hashify,
	    getIDBError = _require.getIDBError,
	    filter = __webpack_require__(18),
	    sort = __webpack_require__(84);

	var _require2 = __webpack_require__(85),
	    build = _require2.build,
	    Conjunction = _require2.Conjunction,
	    Disjunction = _require2.Disjunction,
	    Exists = _require2.Exists;

	var toIDBDirection = function toIDBDirection(value) {
	    return value > 0 ? 'next' : 'prev';
	};

	var joinPredicates = function joinPredicates(preds) {
	    if (preds.length > 1) {
	        return new Conjunction(preds);
	    }

	    return preds[0];
	};

	var removeClause = function removeClause(_ref) {
	    var parent = _ref.parent,
	        index = _ref.index;

	    parent.args.splice(index, 1);
	};

	var openConn = function openConn(_ref2, cb) {
	    var col = _ref2.col,
	        read_pref = _ref2.read_pref;

	    col._db._getConn(function (error, idb) {
	        if (error) {
	            return cb(error);
	        }

	        var name = col._name;

	        try {
	            var trans = idb.transaction([name], read_pref);
	            trans.onerror = function (e) {
	                return cb(getIDBError(e));
	            };

	            cb(null, trans.objectStore(name));
	        } catch (error) {
	            cb(error);
	        }
	    });
	};

	var getIDBReqWithIndex = function getIDBReqWithIndex(store, clause) {
	    var key_range = clause.idb_key_range || null,
	        direction = clause.idb_direction || 'next',
	        literal = clause.path.literal;


	    var index = void 0;

	    if (literal === '_id') {
	        index = store;
	    } else {
	        index = store.index(literal);
	    }

	    return index.openCursor(key_range, direction);
	};

	var getIDBReqWithoutIndex = function getIDBReqWithoutIndex(store) {
	    return store.openCursor();
	};

	var buildPredicates = function buildPredicates(pipeline) {
	    var new_pipeline = [];

	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	        for (var _iterator = pipeline[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var _step$value = _slicedToArray(_step.value, 2),
	                fn = _step$value[0],
	                arg = _step$value[1];

	            if (fn === filter) {
	                var pred = build(arg);

	                if (pred === false) {
	                    return;
	                }
	                if (!pred) {
	                    continue;
	                }

	                arg = pred;
	            }

	            new_pipeline.push([fn, arg]);
	        }
	    } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	            }
	        } finally {
	            if (_didIteratorError) {
	                throw _iteratorError;
	            }
	        }
	    }

	    return new_pipeline;
	};

	var initPredAndSortSpec = function initPredAndSortSpec(config) {
	    var pipeline = config.pipeline,
	        preds = [],
	        sort_specs = [];


	    var i = 0;

	    var _iteratorNormalCompletion2 = true;
	    var _didIteratorError2 = false;
	    var _iteratorError2 = undefined;

	    try {
	        for (var _iterator2 = pipeline[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	            var _step2$value = _slicedToArray(_step2.value, 2),
	                fn = _step2$value[0],
	                arg = _step2$value[1];

	            if (fn === sort) {
	                sort_specs.push(arg);
	            } else if (fn === filter) {
	                preds.push(arg);
	            } else {
	                break;
	            }

	            i++;
	        }
	    } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                _iterator2.return();
	            }
	        } finally {
	            if (_didIteratorError2) {
	                throw _iteratorError2;
	            }
	        }
	    }

	    pipeline.splice(0, i);

	    config.pred = joinPredicates(preds);

	    if (sort_specs.length) {
	        config.sort_spec = sort_specs.reduce(merge, {});
	    }
	};

	var getClauses = function getClauses(col, pred) {
	    if (!pred) {
	        return [];
	    }

	    var clauses = [],
	        exists_clauses = [];

	    var _iteratorNormalCompletion3 = true;
	    var _didIteratorError3 = false;
	    var _iteratorError3 = undefined;

	    try {
	        for (var _iterator3 = pred.getClauses()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	            var clause = _step3.value;

	            if (col._isIndexed(clause.path.literal)) {
	                if (clause instanceof Exists) {
	                    exists_clauses.push(clause);
	                } else {
	                    clauses.push(clause);
	                }
	            }
	        }
	    } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                _iterator3.return();
	            }
	        } finally {
	            if (_didIteratorError3) {
	                throw _iteratorError3;
	            }
	        }
	    }

	    if (clauses.length) {
	        return clauses;
	    }

	    return exists_clauses;
	};

	var initClauses = function initClauses(config) {
	    var col = config.col,
	        pred = config.pred;


	    config.clauses = getClauses(col, pred);
	};

	var initHint = function initHint(config) {
	    if (!config.hint) {
	        return;
	    }

	    var clauses = config.clauses,
	        hint = config.hint;


	    var new_clauses = [];

	    var _iteratorNormalCompletion4 = true;
	    var _didIteratorError4 = false;
	    var _iteratorError4 = undefined;

	    try {
	        for (var _iterator4 = clauses[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	            var clause = _step4.value;

	            if (clause.path.literal === hint) {
	                new_clauses.push(clause);
	            }
	        }
	    } catch (err) {
	        _didIteratorError4 = true;
	        _iteratorError4 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion4 && _iterator4.return) {
	                _iterator4.return();
	            }
	        } finally {
	            if (_didIteratorError4) {
	                throw _iteratorError4;
	            }
	        }
	    }

	    if (!new_clauses.length) {
	        new_clauses = [{ path: { literal: hint } }];
	    }

	    config.clauses = new_clauses;
	};

	var initSort = function initSort(config) {
	    if (!config.sort_spec) {
	        return;
	    }

	    var clauses = config.clauses,
	        spec = config.sort_spec,
	        pipeline = config.pipeline;

	    var new_clauses = [];

	    var _iteratorNormalCompletion5 = true;
	    var _didIteratorError5 = false;
	    var _iteratorError5 = undefined;

	    try {
	        for (var _iterator5 = clauses[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	            var clause = _step5.value;
	            var literal = clause.path.literal;

	            if (!spec.hasOwnProperty(literal)) {
	                continue;
	            }

	            var order = spec[literal];
	            clause.idb_direction = toIDBDirection(order);

	            new_clauses.push(clause);
	        }
	    } catch (err) {
	        _didIteratorError5 = true;
	        _iteratorError5 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion5 && _iterator5.return) {
	                _iterator5.return();
	            }
	        } finally {
	            if (_didIteratorError5) {
	                throw _iteratorError5;
	            }
	        }
	    }

	    if (new_clauses.length) {
	        config.clauses = new_clauses;
	    } else {
	        pipeline.push([sort, spec]);
	    }
	};

	var createGetIDBReqFn = function createGetIDBReqFn(_ref3) {
	    var pred = _ref3.pred,
	        clauses = _ref3.clauses,
	        pipeline = _ref3.pipeline;

	    var getIDBReq = void 0;

	    if (clauses.length) {
	        var clause = clauses[0];

	        getIDBReq = function getIDBReq(store) {
	            return getIDBReqWithIndex(store, clause);
	        };

	        if (!pred || clause === pred) {
	            return getIDBReq;
	        }

	        removeClause(clause);
	    } else {
	        getIDBReq = getIDBReqWithoutIndex;

	        if (!pred) {
	            return getIDBReq;
	        }
	    }

	    pipeline.unshift([filter, pred]);

	    return getIDBReq;
	};

	var createGetIDBCurFn = function createGetIDBCurFn(config) {
	    var idb_cur = void 0,
	        idb_req = void 0;

	    var getIDBReq = createGetIDBReqFn(config);

	    var onIDBCur = function onIDBCur(cb) {
	        idb_req.onsuccess = function (e) {
	            idb_cur = e.target.result;

	            cb();
	        };

	        idb_req.onerror = function (e) {
	            return cb(getIDBError(e));
	        };
	    };

	    var progressCur = function progressCur(cb) {
	        onIDBCur(cb);
	        idb_cur.continue();
	    };

	    var _getCur = function getCur(cb) {
	        openConn(config, function (error, store) {
	            if (error) {
	                return cb(error);
	            }

	            idb_req = getIDBReq(store);

	            onIDBCur(function (error) {
	                if (idb_cur) {
	                    _getCur = progressCur;
	                }

	                cb(error);
	            });
	        });
	    };

	    return function (cb) {
	        return _getCur(function (error) {
	            return cb(error, idb_cur);
	        });
	    };
	};

	var addPipelineStages = function addPipelineStages(_ref4, next) {
	    var pipeline = _ref4.pipeline;
	    var _iteratorNormalCompletion6 = true;
	    var _didIteratorError6 = false;
	    var _iteratorError6 = undefined;

	    try {
	        for (var _iterator6 = pipeline[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	            var _step6$value = _slicedToArray(_step6.value, 2),
	                fn = _step6$value[0],
	                arg = _step6$value[1];

	            next = fn(next, arg);
	        }
	    } catch (err) {
	        _didIteratorError6 = true;
	        _iteratorError6 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion6 && _iterator6.return) {
	                _iterator6.return();
	            }
	        } finally {
	            if (_didIteratorError6) {
	                throw _iteratorError6;
	            }
	        }
	    }

	    return next;
	};

	var createParallelNextFn = function createParallelNextFn(config) {
	    var next_fns = [];

	    var _iteratorNormalCompletion7 = true;
	    var _didIteratorError7 = false;
	    var _iteratorError7 = undefined;

	    try {
	        for (var _iterator7 = config.pred.args[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	            var node = _step7.value;

	            var new_config = {
	                col: config.col,
	                read_pref: config.read_pref,
	                pred: node,
	                pipeline: []
	            };

	            initClauses(new_config);

	            var _next = createNextFn(new_config);

	            next_fns.push(addPipelineStages(new_config, _next));
	        }
	    } catch (err) {
	        _didIteratorError7 = true;
	        _iteratorError7 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion7 && _iterator7.return) {
	                _iterator7.return();
	            }
	        } finally {
	            if (_didIteratorError7) {
	                throw _iteratorError7;
	            }
	        }
	    }

	    var _id_hashes = new Set();

	    var onDoc = function onDoc(doc) {
	        var _id_hash = hashify(doc._id);

	        if (!_id_hashes.has(_id_hash)) {
	            return _id_hashes.add(_id_hash);
	        }
	    };

	    var getNextFn = function getNextFn() {
	        return next_fns.pop();
	    };

	    var currentNextFn = getNextFn();

	    var changeNextFn = function changeNextFn(cb) {
	        if (currentNextFn = getNextFn()) {
	            next(cb);
	        } else {
	            cb();
	        }
	    };

	    var next = function next(cb) {
	        currentNextFn(function (error, doc, idb_cur) {
	            if (error) {
	                cb(error);
	            } else if (!doc) {
	                changeNextFn(cb);
	            } else if (onDoc(doc)) {
	                cb(null, doc, idb_cur);
	            } else {
	                next(cb);
	            }
	        });
	    };

	    var spec = config.sort_spec;
	    if (spec) {
	        config.pipeline.push([sort, spec]);
	    }

	    return next;
	};

	var createNextFn = function createNextFn(config) {
	    var getIDBCur = createGetIDBCurFn(config);

	    var next = function next(cb) {
	        getIDBCur(function (error, idb_cur) {
	            if (!idb_cur) {
	                cb(error);
	            } else {
	                cb(null, idb_cur.value, idb_cur);
	            }
	        });
	    };

	    return next;
	};

	module.exports = function (cur) {
	    var pipeline = void 0;

	    try {
	        pipeline = buildPredicates(cur._pipeline);
	    } catch (error) {
	        return function (cb) {
	            return cb(error);
	        };
	    }

	    if (!pipeline) {
	        return function (cb) {
	            return cb();
	        };
	    }

	    var config = {
	        col: cur._col,
	        read_pref: cur._read_pref,
	        hint: cur._hint,
	        pipeline: pipeline
	    };

	    initPredAndSortSpec(config);

	    var next = void 0;

	    if (config.pred instanceof Disjunction) {
	        next = createParallelNextFn(config);
	    } else {
	        initClauses(config);
	        initHint(config);
	        initSort(config);

	        next = createNextFn(config);
	    }

	    return addPipelineStages(config, next);
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var Fields = __webpack_require__(19);

	module.exports = function (next, pred) {
	    return function (cb) {
	        (function iterate() {
	            next(function (error, doc, idb_cur) {
	                if (!doc) {
	                    cb(error);
	                } else if (pred.run(new Fields(doc))) {
	                    cb(null, doc, idb_cur);
	                } else {
	                    iterate();
	                }
	            });
	        })();
	    };
	};

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var memoize = __webpack_require__(20);

	var _require = __webpack_require__(7),
	    _get = _require.get;

	var MISSING = __webpack_require__(83);

	var Fields = function () {
	    function Fields(doc) {
	        _classCallCheck(this, Fields);

	        this._doc = doc;
	        this.get = memoize(this.get);
	    }

	    _createClass(Fields, [{
	        key: 'get',
	        value: function get(path) {
	            var value = MISSING;

	            _get(this._doc, path.pieces, function (obj, field) {
	                value = obj[field];
	            });

	            return value;
	        }
	    }, {
	        key: 'ensure',
	        value: function ensure(paths) {
	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = paths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var path = _step.value;

	                    if (this.get(path) === MISSING) {
	                        return false;
	                    }
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            return true;
	        }
	    }]);

	    return Fields;
	}();

	module.exports = Fields;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var normalizeOpts = __webpack_require__(21)
	  , resolveLength = __webpack_require__(22)
	  , plain         = __webpack_require__(28);

	module.exports = function (fn/*, options*/) {
		var options = normalizeOpts(arguments[1]), length;

		if (!options.normalizer) {
			length = options.length = resolveLength(options.length, fn.length, options.async);
			if (length !== 0) {
				if (options.primitive) {
					if (length === false) {
						options.normalizer = __webpack_require__(65);
					} else if (length > 1) {
						options.normalizer = __webpack_require__(66)(length);
					}
				} else {
					if (length === false) options.normalizer = __webpack_require__(67)();
					else if (length === 1) options.normalizer = __webpack_require__(69)();
					else options.normalizer = __webpack_require__(70)(length);
				}
			}
		}

		// Assure extensions
		if (options.async) __webpack_require__(71);
		if (options.promise) __webpack_require__(74);
		if (options.dispose) __webpack_require__(76);
		if (options.maxAge) __webpack_require__(77);
		if (options.max) __webpack_require__(80);
		if (options.refCounter) __webpack_require__(82);

		return plain(fn, options);
	};


/***/ }),
/* 21 */
/***/ (function(module, exports) {

	'use strict';

	var forEach = Array.prototype.forEach, create = Object.create;

	var process = function (src, obj) {
		var key;
		for (key in src) obj[key] = src[key];
	};

	module.exports = function (options/*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var toPosInt = __webpack_require__(23);

	module.exports = function (optsLength, fnLength, isAsync) {
		var length;
		if (isNaN(optsLength)) {
			length = fnLength;
			if (!(length >= 0)) return 1;
			if (isAsync && length) return length - 1;
			return length;
		}
		if (optsLength === false) return false;
		return toPosInt(optsLength);
	};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var toInteger = __webpack_require__(24)

	  , max = Math.max;

	module.exports = function (value) { return max(0, toInteger(value)); };


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var sign = __webpack_require__(25)

	  , abs = Math.abs, floor = Math.floor;

	module.exports = function (value) {
		if (isNaN(value)) return 0;
		value = Number(value);
		if ((value === 0) || !isFinite(value)) return value;
		return sign(value) * floor(abs(value));
	};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(26)()
		? Math.sign
		: __webpack_require__(27);


/***/ }),
/* 26 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function () {
		var sign = Math.sign;
		if (typeof sign !== 'function') return false;
		return ((sign(10) === 1) && (sign(-20) === -1));
	};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function (value) {
		value = Number(value);
		if (isNaN(value) || (value === 0)) return value;
		return (value > 0) ? 1 : -1;
	};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var callable      = __webpack_require__(29)
	  , forEach       = __webpack_require__(30)
	  , extensions    = __webpack_require__(33)
	  , configure     = __webpack_require__(34)
	  , resolveLength = __webpack_require__(22)

	  , hasOwnProperty = Object.prototype.hasOwnProperty;

	module.exports = function self(fn/*, options */) {
		var options, length, conf;

		callable(fn);
		options = Object(arguments[1]);

		if (options.async && options.promise) {
			throw new Error("Options 'async' and 'promise' cannot be used together");
		}

		// Do not memoize already memoized function
		if (hasOwnProperty.call(fn, '__memoized__') && !options.force) return fn;

		// Resolve length;
		length = resolveLength(options.length, fn.length, options.async && extensions.async);

		// Configure cache map
		conf = configure(fn, length, options);

		// Bind eventual extensions
		forEach(extensions, function (fn, name) {
			if (options[name]) fn(options[name], conf, options);
		});

		if (self.__profiler__) self.__profiler__(conf);

		conf.updateEnv();
		return conf.memoized;
	};


/***/ }),
/* 29 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function (fn) {
		if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
		return fn;
	};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(31)('forEach');


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	// Internal method, used by iteration functions.
	// Calls a function for each key-value pair found in object
	// Optionally takes compareFn to iterate object in specific order

	'use strict';

	var callable = __webpack_require__(29)
	  , value    = __webpack_require__(32)

	  , bind = Function.prototype.bind, call = Function.prototype.call, keys = Object.keys
	  , propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

	module.exports = function (method, defVal) {
		return function (obj, cb/*, thisArg, compareFn*/) {
			var list, thisArg = arguments[2], compareFn = arguments[3];
			obj = Object(value(obj));
			callable(cb);

			list = keys(obj);
			if (compareFn) {
				list.sort((typeof compareFn === 'function') ? bind.call(compareFn, obj) : undefined);
			}
			if (typeof method !== 'function') method = list[method];
			return call.call(method, list, function (key, index) {
				if (!propertyIsEnumerable.call(obj, key)) return defVal;
				return call.call(cb, thisArg, obj[key], key, obj, index);
			});
		};
	};


/***/ }),
/* 32 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};


/***/ }),
/* 33 */
/***/ (function(module, exports) {

	'use strict';


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var customError      = __webpack_require__(35)
	  , defineLength     = __webpack_require__(42)
	  , d                = __webpack_require__(44)
	  , ee               = __webpack_require__(49).methods
	  , resolveResolve   = __webpack_require__(50)
	  , resolveNormalize = __webpack_require__(64)

	  , apply = Function.prototype.apply, call = Function.prototype.call
	  , create = Object.create, hasOwnProperty = Object.prototype.hasOwnProperty
	  , defineProperties = Object.defineProperties
	  , on = ee.on, emit = ee.emit;

	module.exports = function (original, length, options) {
		var cache = create(null), conf, memLength, get, set, del, clear, extDel,
			extGet, extHas, normalizer, getListeners, setListeners, deleteListeners, memoized, resolve;
		if (length !== false) memLength = length;
		else if (isNaN(original.length)) memLength = 1;
		else memLength = original.length;

		if (options.normalizer) {
			normalizer = resolveNormalize(options.normalizer);
			get = normalizer.get;
			set = normalizer.set;
			del = normalizer.delete;
			clear = normalizer.clear;
		}
		if (options.resolvers != null) resolve = resolveResolve(options.resolvers);

		if (get) {
			memoized = defineLength(function (arg) {
				var id, result, args = arguments;
				if (resolve) args = resolve(args);
				id = get(args);
				if (id !== null) {
					if (hasOwnProperty.call(cache, id)) {
						if (getListeners) conf.emit('get', id, args, this);
						return cache[id];
					}
				}
				if (args.length === 1) result = call.call(original, this, args[0]);
				else result = apply.call(original, this, args);
				if (id === null) {
					id = get(args);
					if (id !== null) throw customError("Circular invocation", 'CIRCULAR_INVOCATION');
					id = set(args);
				} else if (hasOwnProperty.call(cache, id)) {
					throw customError("Circular invocation", 'CIRCULAR_INVOCATION');
				}
				cache[id] = result;
				if (setListeners) conf.emit('set', id, null, result);
				return result;
			}, memLength);
		} else if (length === 0) {
			memoized = function () {
				var result;
				if (hasOwnProperty.call(cache, 'data')) {
					if (getListeners) conf.emit('get', 'data', arguments, this);
					return cache.data;
				}
				if (!arguments.length) result = call.call(original, this);
				else result = apply.call(original, this, arguments);
				if (hasOwnProperty.call(cache, 'data')) {
					throw customError("Circular invocation", 'CIRCULAR_INVOCATION');
				}
				cache.data = result;
				if (setListeners) conf.emit('set', 'data', null, result);
				return result;
			};
		} else {
			memoized = function (arg) {
				var result, args = arguments, id;
				if (resolve) args = resolve(arguments);
				id = String(args[0]);
				if (hasOwnProperty.call(cache, id)) {
					if (getListeners) conf.emit('get', id, args, this);
					return cache[id];
				}
				if (args.length === 1) result = call.call(original, this, args[0]);
				else result = apply.call(original, this, args);
				if (hasOwnProperty.call(cache, id)) {
					throw customError("Circular invocation", 'CIRCULAR_INVOCATION');
				}
				cache[id] = result;
				if (setListeners) conf.emit('set', id, null, result);
				return result;
			};
		}
		conf = {
			original: original,
			memoized: memoized,
			get: function (args) {
				if (resolve) args = resolve(args);
				if (get) return get(args);
				return String(args[0]);
			},
			has: function (id) { return hasOwnProperty.call(cache, id); },
			delete: function (id) {
				var result;
				if (!hasOwnProperty.call(cache, id)) return;
				if (del) del(id);
				result = cache[id];
				delete cache[id];
				if (deleteListeners) conf.emit('delete', id, result);
			},
			clear: function () {
				var oldCache = cache;
				if (clear) clear();
				cache = create(null);
				conf.emit('clear', oldCache);
			},
			on: function (type, listener) {
				if (type === 'get') getListeners = true;
				else if (type === 'set') setListeners = true;
				else if (type === 'delete') deleteListeners = true;
				return on.call(this, type, listener);
			},
			emit: emit,
			updateEnv: function () { original = conf.original; }
		};
		if (get) {
			extDel = defineLength(function (arg) {
				var id, args = arguments;
				if (resolve) args = resolve(args);
				id = get(args);
				if (id === null) return;
				conf.delete(id);
			}, memLength);
		} else if (length === 0) {
			extDel = function () { return conf.delete('data'); };
		} else {
			extDel = function (arg) {
				if (resolve) arg = resolve(arguments)[0];
				return conf.delete(arg);
			};
		}
		extGet = defineLength(function () {
			var id, args = arguments;
			if (resolve) args = resolve(args);
			id = get(args);
			return cache[id];
		});
		extHas = defineLength(function () {
			var id, args = arguments;
			if (resolve) args = resolve(args);
			id = get(args);
			if (id === null) return false;
			return conf.has(id);
		});
		defineProperties(memoized, {
			__memoized__: d(true),
			delete: d(extDel),
			clear: d(conf.clear),
			_get: d(extGet),
			_has: d(extHas)
		});
		return conf;
	};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var assign = __webpack_require__(36)

	  , captureStackTrace = Error.captureStackTrace;

	exports = module.exports = function (message/*, code, ext*/) {
		var err = new Error(message), code = arguments[1], ext = arguments[2];
		if (ext == null) {
			if (code && (typeof code === 'object')) {
				ext = code;
				code = null;
			}
		}
		if (ext != null) assign(err, ext);
		if (code != null) err.code = String(code);
		if (captureStackTrace) captureStackTrace(err, exports);
		return err;
	};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(37)()
		? Object.assign
		: __webpack_require__(38);


/***/ }),
/* 37 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function () {
		var assign = Object.assign, obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
	};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var keys  = __webpack_require__(39)
	  , value = __webpack_require__(32)

	  , max = Math.max;

	module.exports = function (dest, src/*, …srcn*/) {
		var error, i, l = max(arguments.length, 2), assign;
		dest = Object(value(dest));
		assign = function (key) {
			try { dest[key] = src[key]; } catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(40)()
		? Object.keys
		: __webpack_require__(41);


/***/ }),
/* 40 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) { return false; }
	};


/***/ }),
/* 41 */
/***/ (function(module, exports) {

	'use strict';

	var keys = Object.keys;

	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var toPosInt = __webpack_require__(23)

	  , test = function (a, b) {}, desc, defineProperty
	  , generate, mixin;

	try {
		Object.defineProperty(test, 'length', { configurable: true, writable: false,
			enumerable: false, value: 1 });
	} catch (ignore) {}

	if (test.length === 1) {
		// ES6
		desc = { configurable: true, writable: false, enumerable: false };
		defineProperty = Object.defineProperty;
		module.exports = function (fn, length) {
			length = toPosInt(length);
			if (fn.length === length) return fn;
			desc.value = length;
			return defineProperty(fn, 'length', desc);
		};
	} else {
		mixin = __webpack_require__(43);
		generate = (function () {
			var cache = [];
			return function (l) {
				var args, i = 0;
				if (cache[l]) return cache[l];
				args = [];
				while (l--) args.push('a' + (++i).toString(36));
				return new Function('fn', 'return function (' + args.join(', ') +
					') { return fn.apply(this, arguments); };');
			};
		}());
		module.exports = function (src, length) {
			var target;
			length = toPosInt(length);
			if (src.length === length) return src;
			target = generate(length)(src);
			try { mixin(target, src); } catch (ignore) {}
			return target;
		};
	}


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var value = __webpack_require__(32)

	  , defineProperty = Object.defineProperty
	  , getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
	  , getOwnPropertyNames = Object.getOwnPropertyNames
	  , getOwnPropertySymbols = Object.getOwnPropertySymbols;

	module.exports = function (target, source) {
		var error, sourceObject = Object(value(source));
		target = Object(value(target));
		getOwnPropertyNames(sourceObject).forEach(function (name) {
			try {
				defineProperty(target, name, getOwnPropertyDescriptor(source, name));
			} catch (e) { error = e; }
		});
		if (typeof getOwnPropertySymbols === 'function') {
			getOwnPropertySymbols(sourceObject).forEach(function (symbol) {
				try {
					defineProperty(target, symbol, getOwnPropertyDescriptor(source, symbol));
				} catch (e) { error = e; }
			});
		}
		if (error !== undefined) throw error;
		return target;
	};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var assign        = __webpack_require__(36)
	  , normalizeOpts = __webpack_require__(21)
	  , isCallable    = __webpack_require__(45)
	  , contains      = __webpack_require__(46)

	  , d;

	d = module.exports = function (dscr, value/*, options*/) {
		var c, e, w, options, desc;
		if ((arguments.length < 2) || (typeof dscr !== 'string')) {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}

		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};

	d.gs = function (dscr, get, set/*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}

		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};


/***/ }),
/* 45 */
/***/ (function(module, exports) {

	// Deprecated

	'use strict';

	module.exports = function (obj) { return typeof obj === 'function'; };


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(47)()
		? String.prototype.contains
		: __webpack_require__(48);


/***/ }),
/* 47 */
/***/ (function(module, exports) {

	'use strict';

	var str = 'razdwatrzy';

	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return ((str.contains('dwa') === true) && (str.contains('foo') === false));
	};


/***/ }),
/* 48 */
/***/ (function(module, exports) {

	'use strict';

	var indexOf = String.prototype.indexOf;

	module.exports = function (searchString/*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var d        = __webpack_require__(44)
	  , callable = __webpack_require__(29)

	  , apply = Function.prototype.apply, call = Function.prototype.call
	  , create = Object.create, defineProperty = Object.defineProperty
	  , defineProperties = Object.defineProperties
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , descriptor = { configurable: true, enumerable: false, writable: true }

	  , on, once, off, emit, methods, descriptors, base;

	on = function (type, listener) {
		var data;

		callable(listener);

		if (!hasOwnProperty.call(this, '__ee__')) {
			data = descriptor.value = create(null);
			defineProperty(this, '__ee__', descriptor);
			descriptor.value = null;
		} else {
			data = this.__ee__;
		}
		if (!data[type]) data[type] = listener;
		else if (typeof data[type] === 'object') data[type].push(listener);
		else data[type] = [data[type], listener];

		return this;
	};

	once = function (type, listener) {
		var once, self;

		callable(listener);
		self = this;
		on.call(this, type, once = function () {
			off.call(self, type, once);
			apply.call(listener, this, arguments);
		});

		once.__eeOnceListener__ = listener;
		return this;
	};

	off = function (type, listener) {
		var data, listeners, candidate, i;

		callable(listener);

		if (!hasOwnProperty.call(this, '__ee__')) return this;
		data = this.__ee__;
		if (!data[type]) return this;
		listeners = data[type];

		if (typeof listeners === 'object') {
			for (i = 0; (candidate = listeners[i]); ++i) {
				if ((candidate === listener) ||
						(candidate.__eeOnceListener__ === listener)) {
					if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
					else listeners.splice(i, 1);
				}
			}
		} else {
			if ((listeners === listener) ||
					(listeners.__eeOnceListener__ === listener)) {
				delete data[type];
			}
		}

		return this;
	};

	emit = function (type) {
		var i, l, listener, listeners, args;

		if (!hasOwnProperty.call(this, '__ee__')) return;
		listeners = this.__ee__[type];
		if (!listeners) return;

		if (typeof listeners === 'object') {
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

			listeners = listeners.slice();
			for (i = 0; (listener = listeners[i]); ++i) {
				apply.call(listener, this, args);
			}
		} else {
			switch (arguments.length) {
			case 1:
				call.call(listeners, this);
				break;
			case 2:
				call.call(listeners, this, arguments[1]);
				break;
			case 3:
				call.call(listeners, this, arguments[1], arguments[2]);
				break;
			default:
				l = arguments.length;
				args = new Array(l - 1);
				for (i = 1; i < l; ++i) {
					args[i - 1] = arguments[i];
				}
				apply.call(listeners, this, args);
			}
		}
	};

	methods = {
		on: on,
		once: once,
		off: off,
		emit: emit
	};

	descriptors = {
		on: d(on),
		once: d(once),
		off: d(off),
		emit: d(emit)
	};

	base = defineProperties({}, descriptors);

	module.exports = exports = function (o) {
		return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
	};
	exports.methods = methods;


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var toArray  = __webpack_require__(51)
	  , callable = __webpack_require__(29)

	  , slice = Array.prototype.slice
	  , resolveArgs;

	resolveArgs = function (args) {
		return this.map(function (r, i) {
			return r ? r(args[i]) : args[i];
		}).concat(slice.call(args, this.length));
	};

	module.exports = function (resolvers) {
		resolvers = toArray(resolvers);
		resolvers.forEach(function (r) {
			if (r != null) callable(r);
		});
		return resolveArgs.bind(resolvers);
	};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var from = __webpack_require__(52)

	  , isArray = Array.isArray;

	module.exports = function (arrayLike) {
		return isArray(arrayLike) ? arrayLike : from(arrayLike);
	};


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(53)()
		? Array.from
		: __webpack_require__(54);


/***/ }),
/* 53 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function () {
		var from = Array.from, arr, result;
		if (typeof from !== 'function') return false;
		arr = ['raz', 'dwa'];
		result = from(arr);
		return Boolean(result && (result !== arr) && (result[1] === 'dwa'));
	};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var iteratorSymbol = __webpack_require__(55).iterator
	  , isArguments    = __webpack_require__(60)
	  , isFunction     = __webpack_require__(61)
	  , toPosInt       = __webpack_require__(23)
	  , callable       = __webpack_require__(29)
	  , validValue     = __webpack_require__(32)
	  , isString       = __webpack_require__(63)

	  , isArray = Array.isArray, call = Function.prototype.call
	  , desc = { configurable: true, enumerable: true, writable: true, value: null }
	  , defineProperty = Object.defineProperty;

	module.exports = function (arrayLike/*, mapFn, thisArg*/) {
		var mapFn = arguments[1], thisArg = arguments[2], Constructor, i, j, arr, l, code, iterator
		  , result, getIterator, value;

		arrayLike = Object(validValue(arrayLike));

		if (mapFn != null) callable(mapFn);
		if (!this || (this === Array) || !isFunction(this)) {
			// Result: Plain array
			if (!mapFn) {
				if (isArguments(arrayLike)) {
					// Source: Arguments
					l = arrayLike.length;
					if (l !== 1) return Array.apply(null, arrayLike);
					arr = new Array(1);
					arr[0] = arrayLike[0];
					return arr;
				}
				if (isArray(arrayLike)) {
					// Source: Array
					arr = new Array(l = arrayLike.length);
					for (i = 0; i < l; ++i) arr[i] = arrayLike[i];
					return arr;
				}
			}
			arr = [];
		} else {
			// Result: Non plain array
			Constructor = this;
		}

		if (!isArray(arrayLike)) {
			if ((getIterator = arrayLike[iteratorSymbol]) !== undefined) {
				// Source: Iterator
				iterator = callable(getIterator).call(arrayLike);
				if (Constructor) arr = new Constructor();
				result = iterator.next();
				i = 0;
				while (!result.done) {
					value = mapFn ? call.call(mapFn, thisArg, result.value, i) : result.value;
					if (!Constructor) {
						arr[i] = value;
					} else {
						desc.value = value;
						defineProperty(arr, i, desc);
					}
					result = iterator.next();
					++i;
				}
				l = i;
			} else if (isString(arrayLike)) {
				// Source: String
				l = arrayLike.length;
				if (Constructor) arr = new Constructor();
				for (i = 0, j = 0; i < l; ++i) {
					value = arrayLike[i];
					if ((i + 1) < l) {
						code = value.charCodeAt(0);
						if ((code >= 0xD800) && (code <= 0xDBFF)) value += arrayLike[++i];
					}
					value = mapFn ? call.call(mapFn, thisArg, value, j) : value;
					if (!Constructor) {
						arr[j] = value;
					} else {
						desc.value = value;
						defineProperty(arr, j, desc);
					}
					++j;
				}
				l = j;
			}
		}
		if (l === undefined) {
			// Source: array or array-like
			l = toPosInt(arrayLike.length);
			if (Constructor) arr = new Constructor(l);
			for (i = 0; i < l; ++i) {
				value = mapFn ? call.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
				if (!Constructor) {
					arr[i] = value;
				} else {
					desc.value = value;
					defineProperty(arr, i, desc);
				}
			}
		}
		if (Constructor) {
			desc.value = null;
			arr.length = l;
		}
		return arr;
	};


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(56)() ? Symbol : __webpack_require__(57);


/***/ }),
/* 56 */
/***/ (function(module, exports) {

	'use strict';

	var validTypes = { object: true, symbol: true };

	module.exports = function () {
		var symbol;
		if (typeof Symbol !== 'function') return false;
		symbol = Symbol('test symbol');
		try { String(symbol); } catch (e) { return false; }

		// Return 'true' also for polyfills
		if (!validTypes[typeof Symbol.iterator]) return false;
		if (!validTypes[typeof Symbol.toPrimitive]) return false;
		if (!validTypes[typeof Symbol.toStringTag]) return false;

		return true;
	};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	// ES2015 Symbol polyfill for environments that do not (or partially) support it

	'use strict';

	var d              = __webpack_require__(44)
	  , validateSymbol = __webpack_require__(58)

	  , create = Object.create, defineProperties = Object.defineProperties
	  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
	  , NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null)
	  , isNativeSafe;

	if (typeof Symbol === 'function') {
		NativeSymbol = Symbol;
		try {
			String(NativeSymbol());
			isNativeSafe = true;
		} catch (ignore) {}
	}

	var generateName = (function () {
		var created = create(null);
		return function (desc) {
			var postfix = 0, name, ie11BugWorkaround;
			while (created[desc + (postfix || '')]) ++postfix;
			desc += (postfix || '');
			created[desc] = true;
			name = '@@' + desc;
			defineProperty(objPrototype, name, d.gs(null, function (value) {
				// For IE11 issue see:
				// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
				//    ie11-broken-getters-on-dom-objects
				// https://github.com/medikoo/es6-symbol/issues/12
				if (ie11BugWorkaround) return;
				ie11BugWorkaround = true;
				defineProperty(this, name, d(value));
				ie11BugWorkaround = false;
			}));
			return name;
		};
	}());

	// Internal constructor (not one exposed) for creating Symbol instances.
	// This one is used to ensure that `someSymbol instanceof Symbol` always return false
	HiddenSymbol = function Symbol(description) {
		if (this instanceof HiddenSymbol) throw new TypeError('Symbol is not a constructor');
		return SymbolPolyfill(description);
	};

	// Exposed `Symbol` constructor
	// (returns instances of HiddenSymbol)
	module.exports = SymbolPolyfill = function Symbol(description) {
		var symbol;
		if (this instanceof Symbol) throw new TypeError('Symbol is not a constructor');
		if (isNativeSafe) return NativeSymbol(description);
		symbol = create(HiddenSymbol.prototype);
		description = (description === undefined ? '' : String(description));
		return defineProperties(symbol, {
			__description__: d('', description),
			__name__: d('', generateName(description))
		});
	};
	defineProperties(SymbolPolyfill, {
		for: d(function (key) {
			if (globalSymbols[key]) return globalSymbols[key];
			return (globalSymbols[key] = SymbolPolyfill(String(key)));
		}),
		keyFor: d(function (s) {
			var key;
			validateSymbol(s);
			for (key in globalSymbols) if (globalSymbols[key] === s) return key;
		}),

		// To ensure proper interoperability with other native functions (e.g. Array.from)
		// fallback to eventual native implementation of given symbol
		hasInstance: d('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
		isConcatSpreadable: d('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
			SymbolPolyfill('isConcatSpreadable')),
		iterator: d('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
		match: d('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
		replace: d('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
		search: d('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
		species: d('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
		split: d('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
		toPrimitive: d('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
		toStringTag: d('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
		unscopables: d('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
	});

	// Internal tweaks for real symbol producer
	defineProperties(HiddenSymbol.prototype, {
		constructor: d(SymbolPolyfill),
		toString: d('', function () { return this.__name__; })
	});

	// Proper implementation of methods exposed on Symbol.prototype
	// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
	defineProperties(SymbolPolyfill.prototype, {
		toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
		valueOf: d(function () { return validateSymbol(this); })
	});
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('', function () {
		var symbol = validateSymbol(this);
		if (typeof symbol === 'symbol') return symbol;
		return symbol.toString();
	}));
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));

	// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

	// Note: It's important to define `toPrimitive` as last one, as some implementations
	// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
	// And that may invoke error in definition flow:
	// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var isSymbol = __webpack_require__(59);

	module.exports = function (value) {
		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
		return value;
	};


/***/ }),
/* 59 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function (x) {
		if (!x) return false;
		if (typeof x === 'symbol') return true;
		if (!x.constructor) return false;
		if (x.constructor.name !== 'Symbol') return false;
		return (x[x.constructor.toStringTag] === 'Symbol');
	};


/***/ }),
/* 60 */
/***/ (function(module, exports) {

	'use strict';

	var toString = Object.prototype.toString

	  , id = toString.call((function () { return arguments; }()));

	module.exports = function (x) { return (toString.call(x) === id); };


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var toString = Object.prototype.toString

	  , id = toString.call(__webpack_require__(62));

	module.exports = function (f) {
		return (typeof f === "function") && (toString.call(f) === id);
	};


/***/ }),
/* 62 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function () {};


/***/ }),
/* 63 */
/***/ (function(module, exports) {

	'use strict';

	var toString = Object.prototype.toString

	  , id = toString.call('');

	module.exports = function (x) {
		return (typeof x === 'string') || (x && (typeof x === 'object') &&
			((x instanceof String) || (toString.call(x) === id))) || false;
	};


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var callable = __webpack_require__(29);

	module.exports = function (userNormalizer) {
		var normalizer;
		if (typeof userNormalizer === 'function') return { set: userNormalizer, get: userNormalizer };
		normalizer = { get: callable(userNormalizer.get) };
		if (userNormalizer.set !== undefined) {
			normalizer.set = callable(userNormalizer.set);
			if (userNormalizer.delete) normalizer.delete = callable(userNormalizer.delete);
			if (userNormalizer.clear) normalizer.clear = callable(userNormalizer.clear);
			return normalizer;
		}
		normalizer.set = normalizer.get;
		return normalizer;
	};


/***/ }),
/* 65 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function (args) {
		var id, i, length = args.length;
		if (!length) return '\u0002';
		id = String(args[i = 0]);
		while (--length) id += '\u0001' + args[++i];
		return id;
	};


/***/ }),
/* 66 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function (length) {
		if (!length) {
			return function () { return ''; };
		}
		return function (args) {
			var id = String(args[0]), i = 0, l = length;
			while (--l) { id += '\u0001' + args[++i]; }
			return id;
		};
	};


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var indexOf = __webpack_require__(68)
	  , create = Object.create;

	module.exports = function () {
		var lastId = 0, map = [], cache = create(null);
		return {
			get: function (args) {
				var index = 0, set = map, i, length = args.length;
				if (length === 0) return set[length] || null;
				if ((set = set[length])) {
					while (index < (length - 1)) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) return null;
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) return null;
					return set[1][i] || null;
				}
				return null;
			},
			set: function (args) {
				var index = 0, set = map, i, length = args.length;
				if (length === 0) {
					set[length] = ++lastId;
				} else {
					if (!set[length]) {
						set[length] = [[], []];
					}
					set = set[length];
					while (index < (length - 1)) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) {
							i = set[0].push(args[index]) - 1;
							set[1].push([[], []]);
						}
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						i = set[0].push(args[index]) - 1;
					}
					set[1][i] = ++lastId;
				}
				cache[lastId] = args;
				return lastId;
			},
			delete: function (id) {
				var index = 0, set = map, i, args = cache[id], length = args.length
				  , path = [];
				if (length === 0) {
					delete set[length];
				} else if ((set = set[length])) {
					while (index < (length - 1)) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) {
							return;
						}
						path.push(set, i);
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						return;
					}
					id = set[1][i];
					set[0].splice(i, 1);
					set[1].splice(i, 1);
					while (!set[0].length && path.length) {
						i = path.pop();
						set = path.pop();
						set[0].splice(i, 1);
						set[1].splice(i, 1);
					}
				}
				delete cache[id];
			},
			clear: function () {
				map = [];
				cache = create(null);
			}
		};
	};


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var toPosInt = __webpack_require__(23)
	  , value    = __webpack_require__(32)

	  , indexOf = Array.prototype.indexOf
	  , hasOwnProperty = Object.prototype.hasOwnProperty
	  , abs = Math.abs, floor = Math.floor;

	module.exports = function (searchElement/*, fromIndex*/) {
		var i, l, fromIndex, val;
		if (searchElement === searchElement) { //jslint: ignore
			return indexOf.apply(this, arguments);
		}

		l = toPosInt(value(this).length);
		fromIndex = arguments[1];
		if (isNaN(fromIndex)) fromIndex = 0;
		else if (fromIndex >= 0) fromIndex = floor(fromIndex);
		else fromIndex = toPosInt(this.length) - floor(abs(fromIndex));

		for (i = fromIndex; i < l; ++i) {
			if (hasOwnProperty.call(this, i)) {
				val = this[i];
				if (val !== val) return i; //jslint: ignore
			}
		}
		return -1;
	};


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var indexOf = __webpack_require__(68);

	module.exports = function () {
		var lastId = 0, argsMap = [], cache = [];
		return {
			get: function (args) {
				var index = indexOf.call(argsMap, args[0]);
				return (index === -1) ? null : cache[index];
			},
			set: function (args) {
				argsMap.push(args[0]);
				cache.push(++lastId);
				return lastId;
			},
			delete: function (id) {
				var index = indexOf.call(cache, id);
				if (index !== -1) {
					argsMap.splice(index, 1);
					cache.splice(index, 1);
				}
			},
			clear: function () {
				argsMap = [];
				cache = [];
			}
		};
	};


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var indexOf = __webpack_require__(68)
	  , create = Object.create;

	module.exports = function (length) {
		var lastId = 0, map = [[], []], cache = create(null);
		return {
			get: function (args) {
				var index = 0, set = map, i;
				while (index < (length - 1)) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) return null;
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) return null;
				return set[1][i] || null;
			},
			set: function (args) {
				var index = 0, set = map, i;
				while (index < (length - 1)) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						i = set[0].push(args[index]) - 1;
						set[1].push([[], []]);
					}
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					i = set[0].push(args[index]) - 1;
				}
				set[1][i] = ++lastId;
				cache[lastId] = args;
				return lastId;
			},
			delete: function (id) {
				var index = 0, set = map, i, path = [], args = cache[id];
				while (index < (length - 1)) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						return;
					}
					path.push(set, i);
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					return;
				}
				id = set[1][i];
				set[0].splice(i, 1);
				set[1].splice(i, 1);
				while (!set[0].length && path.length) {
					i = path.pop();
					set = path.pop();
					set[0].splice(i, 1);
					set[1].splice(i, 1);
				}
				delete cache[id];
			},
			clear: function () {
				map = [[], []];
				cache = create(null);
			}
		};
	};


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	// Support for asynchronous functions

	'use strict';

	var aFrom        = __webpack_require__(52)
	  , objectMap    = __webpack_require__(72)
	  , mixin        = __webpack_require__(43)
	  , defineLength = __webpack_require__(42)
	  , nextTick     = __webpack_require__(73)

	  , slice = Array.prototype.slice
	  , apply = Function.prototype.apply, create = Object.create
	  , hasOwnProperty = Object.prototype.hasOwnProperty;

	__webpack_require__(33).async = function (tbi, conf) {
		var waiting = create(null), cache = create(null)
		  , base = conf.memoized, original = conf.original
		  , currentCallback, currentContext, currentArgs;

		// Initial
		conf.memoized = defineLength(function (arg) {
			var args = arguments, last = args[args.length - 1];
			if (typeof last === 'function') {
				currentCallback = last;
				args = slice.call(args, 0, -1);
			}
			return base.apply(currentContext = this, currentArgs = args);
		}, base);
		try { mixin(conf.memoized, base); } catch (ignore) {}

		// From cache (sync)
		conf.on('get', function (id) {
			var cb, context, args;
			if (!currentCallback) return;

			// Unresolved
			if (waiting[id]) {
				if (typeof waiting[id] === 'function') waiting[id] = [waiting[id], currentCallback];
				else waiting[id].push(currentCallback);
				currentCallback = null;
				return;
			}

			// Resolved, assure next tick invocation
			cb = currentCallback;
			context = currentContext;
			args = currentArgs;
			currentCallback = currentContext = currentArgs = null;
			nextTick(function () {
				var data;
				if (hasOwnProperty.call(cache, id)) {
					data = cache[id];
					conf.emit('getasync', id, args, context);
					apply.call(cb, data.context, data.args);
				} else {
					// Purged in a meantime, we shouldn't rely on cached value, recall
					currentCallback = cb;
					currentContext = context;
					currentArgs = args;
					base.apply(context, args);
				}
			});
		});

		// Not from cache
		conf.original = function () {
			var args, cb, origCb, result;
			if (!currentCallback) return apply.call(original, this, arguments);
			args = aFrom(arguments);
			cb = function self(err) {
				var cb, args, id = self.id;
				if (id == null) {
					// Shouldn't happen, means async callback was called sync way
					nextTick(apply.bind(self, this, arguments));
					return;
				}
				delete self.id;
				cb = waiting[id];
				delete waiting[id];
				if (!cb) {
					// Already processed,
					// outcome of race condition: asyncFn(1, cb), asyncFn.clear(), asyncFn(1, cb)
					return;
				}
				args = aFrom(arguments);
				if (conf.has(id)) {
					if (err) {
						conf.delete(id);
					} else {
						cache[id] = { context: this, args: args };
						conf.emit('setasync', id, (typeof cb === 'function') ? 1 : cb.length);
					}
				}
				if (typeof cb === 'function') {
					result = apply.call(cb, this, args);
				} else {
					cb.forEach(function (cb) { result = apply.call(cb, this, args); }, this);
				}
				return result;
			};
			origCb = currentCallback;
			currentCallback = currentContext = currentArgs = null;
			args.push(cb);
			result = apply.call(original, this, args);
			cb.cb = origCb;
			currentCallback = cb;
			return result;
		};

		// After not from cache call
		conf.on('set', function (id) {
			if (!currentCallback) {
				conf.delete(id);
				return;
			}
			if (waiting[id]) {
				// Race condition: asyncFn(1, cb), asyncFn.clear(), asyncFn(1, cb)
				if (typeof waiting[id] === 'function') waiting[id] = [waiting[id], currentCallback.cb];
				else waiting[id].push(currentCallback.cb);
			} else {
				waiting[id] = currentCallback.cb;
			}
			delete currentCallback.cb;
			currentCallback.id = id;
			currentCallback = null;
		});

		// On delete
		conf.on('delete', function (id) {
			var result;
			// If false, we don't have value yet, so we assume that intention is not
			// to memoize this call. After value is obtained we don't cache it but
			// gracefully pass to callback
			if (hasOwnProperty.call(waiting, id)) return;
			if (!cache[id]) return;
			result = cache[id];
			delete cache[id];
			conf.emit('deleteasync', id, slice.call(result.args, 1));
		});

		// On clear
		conf.on('clear', function () {
			var oldCache = cache;
			cache = create(null);
			conf.emit('clearasync', objectMap(oldCache, function (data) {
				return slice.call(data.args, 1);
			}));
		});
	};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var callable = __webpack_require__(29)
	  , forEach  = __webpack_require__(30)

	  , call = Function.prototype.call;

	module.exports = function (obj, cb/*, thisArg*/) {
		var o = {}, thisArg = arguments[2];
		callable(cb);
		forEach(obj, function (value, key, obj, index) {
			o[key] = call.call(cb, thisArg, value, key, obj, index);
		});
		return o;
	};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {'use strict';

	var callable, byObserver;

	callable = function (fn) {
		if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
		return fn;
	};

	byObserver = function (Observer) {
		var node = document.createTextNode(''), queue, currentQueue, i = 0;
		new Observer(function () {
			var callback;
			if (!queue) {
				if (!currentQueue) return;
				queue = currentQueue;
			} else if (currentQueue) {
				queue = currentQueue.concat(queue);
			}
			currentQueue = queue;
			queue = null;
			if (typeof currentQueue === 'function') {
				callback = currentQueue;
				currentQueue = null;
				callback();
				return;
			}
			node.data = (i = ++i % 2); // Invoke other batch, to handle leftover callbacks in case of crash
			while (currentQueue) {
				callback = currentQueue.shift();
				if (!currentQueue.length) currentQueue = null;
				callback();
			}
		}).observe(node, { characterData: true });
		return function (fn) {
			callable(fn);
			if (queue) {
				if (typeof queue === 'function') queue = [queue, fn];
				else queue.push(fn);
				return;
			}
			queue = fn;
			node.data = (i = ++i % 2);
		};
	};

	module.exports = (function () {
		// Node.js
		if ((typeof process === 'object') && process && (typeof process.nextTick === 'function')) {
			return process.nextTick;
		}

		// MutationObserver
		if ((typeof document === 'object') && document) {
			if (typeof MutationObserver === 'function') return byObserver(MutationObserver);
			if (typeof WebKitMutationObserver === 'function') return byObserver(WebKitMutationObserver);
		}

		// W3C Draft
		// http://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
		if (typeof setImmediate === 'function') {
			return function (cb) { setImmediate(callable(cb)); };
		}

		// Wide available standard
		if ((typeof setTimeout === 'function') || (typeof setTimeout === 'object')) {
			return function (cb) { setTimeout(callable(cb), 0); };
		}

		return null;
	}());

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4), __webpack_require__(2).setImmediate))

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	// Support for functions returning promise

	'use strict';

	var objectMap = __webpack_require__(72)
	  , isPromise = __webpack_require__(75)
	  , nextTick  = __webpack_require__(73)

	  , create = Object.create, hasOwnProperty = Object.prototype.hasOwnProperty;

	__webpack_require__(33).promise = function (mode, conf) {
		var waiting = create(null), cache = create(null), promises = create(null);

		// After not from cache call
		conf.on('set', function (id, ignore, promise) {
			var isFailed = false;

			if (!isPromise(promise)) {
				// Non promise result
				cache[id] = promise;
				conf.emit('setasync', id, 1);
				return;
			}
			waiting[id] = 1;
			promises[id] = promise;
			var onSuccess = function (result) {
				var count = waiting[id];
				if (isFailed) {
					throw new Error("Memoizee error: Promise resolved with both failure and success," +
						" this can be result of unordered done & finally resolution.\n" +
						"Instead of `promise: true` consider configuring memoization via `promise: 'then'` or " +
						"`promise: 'done'");
				}
				if (!count) return; // deleted from cache before resolved
				delete waiting[id];
				cache[id] = result;
				conf.emit('setasync', id, count);
			};
			var onFailure = function () {
				isFailed = true;
				if (!waiting[id]) return; // deleted from cache (or succeed in case of finally)
				delete waiting[id];
				delete promises[id];
				conf.delete(id);
			};

			if ((mode !== 'then') && (typeof promise.done === 'function')) {
				// Optimal promise resolution
				if ((mode !== 'done') && (typeof promise.finally === 'function')) {
					// Use 'finally' to not register error handling (still proper behavior is subject to
					// used implementation, if library throws unconditionally even on handled errors
					// switch to 'then' mode)
					promise.done(onSuccess);
					promise.finally(onFailure);
				} else {
					// With no `finally` side effect is that it mutes any eventual
					// "Unhandled error" events on returned promise
					promise.done(onSuccess, onFailure);
				}
			} else {
				// With no `done` it's best we can do.
				// Side effect is that it mutes any eventual "Unhandled error" events on returned promise
				promise.then(function (result) {
					nextTick(onSuccess.bind(this, result));
				}, function () {
					nextTick(onFailure);
				});
			}
		});

		// From cache (sync)
		conf.on('get', function (id, args, context) {
			var promise;
			if (waiting[id]) {
				++waiting[id]; // Still waiting
				return;
			}
			promise = promises[id];
			var emit = function () { conf.emit('getasync', id, args, context); };
			if (isPromise(promise)) {
				if (typeof promise.done === 'function') promise.done(emit);
				else promise.then(function () { nextTick(emit); });
			} else {
				emit();
			}
		});

		// On delete
		conf.on('delete', function (id) {
			delete promises[id];
			if (waiting[id]) {
				delete waiting[id];
				return; // Not yet resolved
			}
			if (!hasOwnProperty.call(cache, id)) return;
			var result = cache[id];
			delete cache[id];
			conf.emit('deleteasync', id, [result]);
		});

		// On clear
		conf.on('clear', function () {
			var oldCache = cache;
			cache = create(null);
			waiting = create(null);
			promises = create(null);
			conf.emit('clearasync', objectMap(oldCache, function (data) { return [data]; }));
		});
	};


/***/ }),
/* 75 */
/***/ (function(module, exports) {

	module.exports = isPromise;

	function isPromise(obj) {
	  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
	}


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	// Call dispose callback on each cache purge

	'use strict';

	var callable   = __webpack_require__(29)
	  , forEach    = __webpack_require__(30)
	  , extensions = __webpack_require__(33)

	  , apply = Function.prototype.apply;

	extensions.dispose = function (dispose, conf, options) {
		var del;
		callable(dispose);
		if ((options.async && extensions.async) || (options.promise && extensions.promise)) {
			conf.on('deleteasync', del = function (id, resultArray) {
				apply.call(dispose, null, resultArray);
			});
			conf.on('clearasync', function (cache) {
				forEach(cache, function (result, id) { del(id, result); });
			});
			return;
		}
		conf.on('delete', del = function (id, result) { dispose(result); });
		conf.on('clear', function (cache) {
			forEach(cache, function (result, id) { del(id, result); });
		});
	};


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	// Timeout cached values

	'use strict';

	var aFrom      = __webpack_require__(52)
	  , forEach    = __webpack_require__(30)
	  , nextTick   = __webpack_require__(73)
	  , isPromise  = __webpack_require__(75)
	  , timeout    = __webpack_require__(78)
	  , extensions = __webpack_require__(33)

	  , noop = Function.prototype
	  , max = Math.max, min = Math.min, create = Object.create;

	extensions.maxAge = function (maxAge, conf, options) {
		var timeouts, postfix, preFetchAge, preFetchTimeouts;

		maxAge = timeout(maxAge);
		if (!maxAge) return;

		timeouts = create(null);
		postfix = ((options.async && extensions.async) || (options.promise && extensions.promise))
			? 'async' : '';
		conf.on('set' + postfix, function (id) {
			timeouts[id] = setTimeout(function () { conf.delete(id); }, maxAge);
			if (!preFetchTimeouts) return;
			if (preFetchTimeouts[id]) {
				if (preFetchTimeouts[id] !== 'nextTick') clearTimeout(preFetchTimeouts[id]);
			}
			preFetchTimeouts[id] = setTimeout(function () {
				delete preFetchTimeouts[id];
			}, preFetchAge);
		});
		conf.on('delete' + postfix, function (id) {
			clearTimeout(timeouts[id]);
			delete timeouts[id];
			if (!preFetchTimeouts) return;
			if (preFetchTimeouts[id] !== 'nextTick') clearTimeout(preFetchTimeouts[id]);
			delete preFetchTimeouts[id];
		});

		if (options.preFetch) {
			if ((options.preFetch === true) || isNaN(options.preFetch)) {
				preFetchAge = 0.333;
			} else {
				preFetchAge = max(min(Number(options.preFetch), 1), 0);
			}
			if (preFetchAge) {
				preFetchTimeouts = {};
				preFetchAge = (1 - preFetchAge) * maxAge;
				conf.on('get' + postfix, function (id, args, context) {
					if (!preFetchTimeouts[id]) {
						preFetchTimeouts[id] = 'nextTick';
						nextTick(function () {
							var result;
							if (preFetchTimeouts[id] !== 'nextTick') return;
							delete preFetchTimeouts[id];
							conf.delete(id);
							if (options.async) {
								args = aFrom(args);
								args.push(noop);
							}
							result = conf.memoized.apply(context, args);
							if (options.promise) {
								// Supress eventual error warnings
								if (isPromise(result)) {
									if (typeof result.done === 'function') result.done(noop, noop);
									else result.then(noop, noop);
								}
							}
						});
					}
				});
			}
		}

		conf.on('clear' + postfix, function () {
			forEach(timeouts, function (id) { clearTimeout(id); });
			timeouts = {};
			if (preFetchTimeouts) {
				forEach(preFetchTimeouts, function (id) {
					if (id !== 'nextTick') clearTimeout(id);
				});
				preFetchTimeouts = {};
			}
		});
	};


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var toPosInt   = __webpack_require__(23)
	  , maxTimeout = __webpack_require__(79);

	module.exports = function (value) {
		value = toPosInt(value);
		if (value > maxTimeout) throw new TypeError(value + " exceeds maximum possible timeout");
		return value;
	};


/***/ }),
/* 79 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = 2147483647;


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	// Limit cache size, LRU (least recently used) algorithm.

	'use strict';

	var toPosInteger = __webpack_require__(23)
	  , lruQueue     = __webpack_require__(81)
	  , extensions   = __webpack_require__(33);

	extensions.max = function (max, conf, options) {
		var postfix, queue, hit;

		max = toPosInteger(max);
		if (!max) return;

		queue = lruQueue(max);
		postfix = ((options.async && extensions.async) || (options.promise && extensions.promise))
			? 'async' : '';

		conf.on('set' + postfix, hit = function (id) {
			id = queue.hit(id);
			if (id === undefined) return;
			conf.delete(id);
		});
		conf.on('get' + postfix, hit);
		conf.on('delete' + postfix, queue.delete);
		conf.on('clear' + postfix, queue.clear);
	};


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var toPosInt = __webpack_require__(23)

	  , create = Object.create, hasOwnProperty = Object.prototype.hasOwnProperty;

	module.exports = function (limit) {
		var size = 0, base = 1, queue = create(null), map = create(null), index = 0, del;
		limit = toPosInt(limit);
		return {
			hit: function (id) {
				var oldIndex = map[id], nuIndex = ++index;
				queue[nuIndex] = id;
				map[id] = nuIndex;
				if (!oldIndex) {
					++size;
					if (size <= limit) return;
					id = queue[base];
					del(id);
					return id;
				}
				delete queue[oldIndex];
				if (base !== oldIndex) return;
				while (!hasOwnProperty.call(queue, ++base)) continue; //jslint: skip
			},
			delete: del = function (id) {
				var oldIndex = map[id];
				if (!oldIndex) return;
				delete queue[oldIndex];
				delete map[id];
				--size;
				if (base !== oldIndex) return;
				if (!size) {
					index = 0;
					base = 1;
					return;
				}
				while (!hasOwnProperty.call(queue, ++base)) continue; //jslint: skip
			},
			clear: function () {
				size = 0;
				base = 1;
				queue = create(null);
				map = create(null);
				index = 0;
			}
		};
	};


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

	// Reference counter, useful for garbage collector like functionality

	'use strict';

	var d          = __webpack_require__(44)
	  , extensions = __webpack_require__(33)

	  , create = Object.create, defineProperties = Object.defineProperties;

	extensions.refCounter = function (ignore, conf, options) {
		var cache, postfix;

		cache = create(null);
		postfix = ((options.async && extensions.async) || (options.promise && extensions.promise))
			? 'async' : '';

		conf.on('set' + postfix, function (id, length) { cache[id] = length || 1; });
		conf.on('get' + postfix, function (id) { ++cache[id]; });
		conf.on('delete' + postfix, function (id) { delete cache[id]; });
		conf.on('clear' + postfix, function () { cache = {}; });

		defineProperties(conf.memoized, {
			deleteRef: d(function () {
				var id = conf.get(arguments);
				if (id === null) return null;
				if (!cache[id]) return null;
				if (!--cache[id]) {
					conf.delete(id);
					return true;
				}
				return false;
			}),
			getRefCount: d(function () {
				var id = conf.get(arguments);
				if (id === null) return 0;
				if (!cache[id]) return 0;
				return cache[id];
			})
		});
	};


/***/ }),
/* 83 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = Symbol('missing');

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _require = __webpack_require__(7),
	    toPathPieces = _require.toPathPieces,
	    isObject = _require.isObject,
	    equal = _require.equal;

	var compare = function compare(a, b, path_pieces, order) {
	    for (var i = 0; i < path_pieces.length - 1; i++) {
	        var _piece = path_pieces[i];

	        a = a[_piece];
	        b = b[_piece];

	        if (!isObject(a)) {
	            if (!isObject(b)) {
	                return null;
	            }
	        } else if (isObject(b)) {
	            continue;
	        }

	        return order;
	    }

	    var piece = path_pieces[i];

	    if (!a.hasOwnProperty(piece)) {
	        if (!b.hasOwnProperty(piece)) {
	            return null;
	        }
	    } else if (b.hasOwnProperty(piece)) {
	        a = a[piece];
	        b = b[piece];

	        if (equal(a, b)) {
	            return 0;
	        }

	        return (a < b ? 1 : -1) * order;
	    }

	    return order;
	};

	module.exports = function (_next, spec) {
	    var sorts = [];

	    for (var path in spec) {
	        sorts.push([toPathPieces(path), spec[path]]);
	    }

	    var sortFn = function sortFn(a, b) {
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	            for (var _iterator = sorts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                var _step$value = _slicedToArray(_step.value, 2),
	                    path_pieces = _step$value[0],
	                    order = _step$value[1];

	                var result = compare(a, b, path_pieces, order);

	                if (result !== null) {
	                    return result;
	                }
	            }
	        } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion && _iterator.return) {
	                    _iterator.return();
	                }
	            } finally {
	                if (_didIteratorError) {
	                    throw _iteratorError;
	                }
	            }
	        }

	        return -order;
	    };

	    var docs = [];

	    var fn = function fn(cb) {
	        return cb(null, docs.pop());
	    };

	    var _next2 = function next(cb) {
	        var done = function done(error) {
	            if (error) {
	                return cb(error);
	            }

	            docs = docs.sort(sortFn);

	            (_next2 = fn)(cb);
	        };

	        (function iterate() {
	            _next(function (error, doc) {
	                if (!doc) {
	                    return done(error);
	                }

	                docs.push(doc);
	                iterate();
	            });
	        })();
	    };

	    return function (cb) {
	        return _next2(cb);
	    };
	};

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _require = __webpack_require__(7),
	    isObject = _require.isObject,
	    equal = _require.equal,
	    unknownOp = _require.unknownOp;

	var MISSING = __webpack_require__(83),
	    Path = __webpack_require__(86),
	    Fields = __webpack_require__(19);

	var isIndexMatchable = function isIndexMatchable(value) {
	    if (typeof value === 'number') {
	        return !isNaN(value);
	    }
	    if (typeof value === 'string') {
	        return true;
	    }
	    if (typeof value === 'boolean') {
	        return true;
	    }
	    if (!value) {
	        return false;
	    }
	    if (value.constructor === Object) {
	        return false;
	    }

	    if (Array.isArray(value)) {
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	            for (var _iterator = value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                var element = _step.value;

	                if (!isIndexMatchable(element)) {
	                    return false;
	                }
	            }
	        } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion && _iterator.return) {
	                    _iterator.return();
	                }
	            } finally {
	                if (_didIteratorError) {
	                    throw _iteratorError;
	                }
	            }
	        }

	        return true;
	    }

	    if (value instanceof Date) {
	        return !isNaN(value.valueOf());
	    }

	    return false;
	};

	var Operator = function () {
	    function Operator() {
	        _classCallCheck(this, Operator);
	    }

	    _createClass(Operator, [{
	        key: 'getClauses',
	        value: function getClauses() {
	            return this.is_index_matchable ? [this] : [];
	        }
	    }]);

	    return Operator;
	}();

	var Connective = function (_Operator) {
	    _inherits(Connective, _Operator);

	    function Connective(args) {
	        _classCallCheck(this, Connective);

	        var _this = _possibleConstructorReturn(this, (Connective.__proto__ || Object.getPrototypeOf(Connective)).call(this));

	        _this.args = args;
	        return _this;
	    }

	    return Connective;
	}(Operator);

	var Conjunction = function (_Connective) {
	    _inherits(Conjunction, _Connective);

	    function Conjunction() {
	        _classCallCheck(this, Conjunction);

	        return _possibleConstructorReturn(this, (Conjunction.__proto__ || Object.getPrototypeOf(Conjunction)).apply(this, arguments));
	    }

	    _createClass(Conjunction, [{
	        key: 'getClauses',
	        value: function getClauses() {
	            var clauses = [];

	            for (var i = 0; i < this.args.length; i++) {
	                var op = this.args[i];

	                if (op instanceof Connective) {
	                    clauses.push.apply(clauses, _toConsumableArray(op.getClauses()));
	                } else if (op.is_index_matchable) {
	                    op.parent = this;
	                    op.index = i;

	                    clauses.push(op);
	                }
	            }

	            return clauses;
	        }
	    }, {
	        key: 'run',
	        value: function run(fields) {
	            var _iteratorNormalCompletion2 = true;
	            var _didIteratorError2 = false;
	            var _iteratorError2 = undefined;

	            try {
	                for (var _iterator2 = this.args[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                    var arg = _step2.value;

	                    if (!arg.run(fields)) {
	                        return false;
	                    }
	                }
	            } catch (err) {
	                _didIteratorError2 = true;
	                _iteratorError2 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                        _iterator2.return();
	                    }
	                } finally {
	                    if (_didIteratorError2) {
	                        throw _iteratorError2;
	                    }
	                }
	            }

	            return true;
	        }
	    }]);

	    return Conjunction;
	}(Connective);

	var Disjunction = function (_Connective2) {
	    _inherits(Disjunction, _Connective2);

	    function Disjunction() {
	        _classCallCheck(this, Disjunction);

	        return _possibleConstructorReturn(this, (Disjunction.__proto__ || Object.getPrototypeOf(Disjunction)).apply(this, arguments));
	    }

	    _createClass(Disjunction, [{
	        key: 'getClauses',
	        value: function getClauses() {
	            return [];
	        }
	    }, {
	        key: 'run',
	        value: function run(fields) {
	            var _iteratorNormalCompletion3 = true;
	            var _didIteratorError3 = false;
	            var _iteratorError3 = undefined;

	            try {
	                for (var _iterator3 = this.args[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                    var arg = _step3.value;

	                    if (arg.run(fields)) {
	                        return true;
	                    }
	                }
	            } catch (err) {
	                _didIteratorError3 = true;
	                _iteratorError3 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                        _iterator3.return();
	                    }
	                } finally {
	                    if (_didIteratorError3) {
	                        throw _iteratorError3;
	                    }
	                }
	            }

	            return false;
	        }
	    }]);

	    return Disjunction;
	}(Connective);

	var Negation = function (_Conjunction) {
	    _inherits(Negation, _Conjunction);

	    function Negation() {
	        _classCallCheck(this, Negation);

	        return _possibleConstructorReturn(this, (Negation.__proto__ || Object.getPrototypeOf(Negation)).apply(this, arguments));
	    }

	    _createClass(Negation, [{
	        key: 'getClauses',
	        value: function getClauses() {
	            return [];
	        }
	    }, {
	        key: 'run',
	        value: function run(fields) {
	            return !_get(Negation.prototype.__proto__ || Object.getPrototypeOf(Negation.prototype), 'run', this).call(this, fields);
	        }
	    }]);

	    return Negation;
	}(Conjunction);

	var Exists = function (_Operator2) {
	    _inherits(Exists, _Operator2);

	    function Exists(path, bool) {
	        _classCallCheck(this, Exists);

	        var _this5 = _possibleConstructorReturn(this, (Exists.__proto__ || Object.getPrototypeOf(Exists)).call(this));

	        _this5.path = path;
	        _this5.bool = bool;
	        return _this5;
	    }

	    _createClass(Exists, [{
	        key: 'run',
	        value: function run(fields) {
	            return fields.get(this.path) !== MISSING === this.bool;
	        }
	    }, {
	        key: 'is_index_matchable',
	        get: function get() {
	            return !!this.bool;
	        }
	    }]);

	    return Exists;
	}(Operator);

	var Equal = function (_Operator3) {
	    _inherits(Equal, _Operator3);

	    function Equal(path, value) {
	        _classCallCheck(this, Equal);

	        var _this6 = _possibleConstructorReturn(this, (Equal.__proto__ || Object.getPrototypeOf(Equal)).call(this));

	        _this6.path = path;
	        _this6.value = value;
	        return _this6;
	    }

	    _createClass(Equal, [{
	        key: 'run',
	        value: function run(fields) {
	            var value = fields.get(this.path);
	            if (value === MISSING) {
	                return false;
	            }

	            return equal(value, this.value);
	        }
	    }, {
	        key: 'is_index_matchable',
	        get: function get() {
	            return isIndexMatchable(this.value);
	        }
	    }, {
	        key: 'idb_key_range',
	        get: function get() {
	            return IDBKeyRange.only(this.value);
	        }
	    }]);

	    return Equal;
	}(Operator);

	var NotEqual = function (_Equal) {
	    _inherits(NotEqual, _Equal);

	    function NotEqual() {
	        _classCallCheck(this, NotEqual);

	        return _possibleConstructorReturn(this, (NotEqual.__proto__ || Object.getPrototypeOf(NotEqual)).apply(this, arguments));
	    }

	    _createClass(NotEqual, [{
	        key: 'run',
	        value: function run(fields) {
	            return !_get(NotEqual.prototype.__proto__ || Object.getPrototypeOf(NotEqual.prototype), 'run', this).call(this, fields);
	        }
	    }, {
	        key: 'is_index_matchable',
	        get: function get() {
	            return false;
	        }
	    }]);

	    return NotEqual;
	}(Equal);

	var Range = function (_Operator4) {
	    _inherits(Range, _Operator4);

	    function Range(path, fns, values) {
	        _classCallCheck(this, Range);

	        var _this8 = _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).call(this));

	        _this8.path = path;
	        _this8.fns = fns;
	        _this8.values = values;
	        return _this8;
	    }

	    _createClass(Range, [{
	        key: 'run',
	        value: function run(fields) {
	            var value = fields.get(this.path);

	            if (value === MISSING || value == null) {
	                return false;
	            }

	            var fns = this.fns,
	                values = this.values;


	            for (var i = 0; i < fns.length; i++) {
	                if (!fns[i](value, values[i])) {
	                    return false;
	                }
	            }

	            return true;
	        }
	    }, {
	        key: 'is_index_matchable',
	        get: function get() {
	            return true;
	        }
	    }]);

	    return Range;
	}(Operator);

	var rangeMixin = function rangeMixin() {
	    for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
	        fns[_key] = arguments[_key];
	    }

	    return function (_Range) {
	        _inherits(_class, _Range);

	        function _class(path, values) {
	            _classCallCheck(this, _class);

	            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, path, fns, values));
	        }

	        return _class;
	    }(Range);
	};

	var gt = function gt(a, b) {
	    return a > b;
	},
	    gte = function gte(a, b) {
	    return a >= b;
	},
	    lt = function lt(a, b) {
	    return a < b;
	},
	    lte = function lte(a, b) {
	    return a <= b;
	};

	var Gt = function (_rangeMixin) {
	    _inherits(Gt, _rangeMixin);

	    function Gt() {
	        _classCallCheck(this, Gt);

	        return _possibleConstructorReturn(this, (Gt.__proto__ || Object.getPrototypeOf(Gt)).apply(this, arguments));
	    }

	    _createClass(Gt, [{
	        key: 'idb_key_range',
	        get: function get() {
	            var _IDBKeyRange;

	            return (_IDBKeyRange = IDBKeyRange).lowerBound.apply(_IDBKeyRange, _toConsumableArray(this.values).concat([true]));
	        }
	    }]);

	    return Gt;
	}(rangeMixin(gt));

	var Gte = function (_rangeMixin2) {
	    _inherits(Gte, _rangeMixin2);

	    function Gte() {
	        _classCallCheck(this, Gte);

	        return _possibleConstructorReturn(this, (Gte.__proto__ || Object.getPrototypeOf(Gte)).apply(this, arguments));
	    }

	    _createClass(Gte, [{
	        key: 'idb_key_range',
	        get: function get() {
	            var _IDBKeyRange2;

	            return (_IDBKeyRange2 = IDBKeyRange).lowerBound.apply(_IDBKeyRange2, _toConsumableArray(this.values));
	        }
	    }]);

	    return Gte;
	}(rangeMixin(gte));

	var Lt = function (_rangeMixin3) {
	    _inherits(Lt, _rangeMixin3);

	    function Lt() {
	        _classCallCheck(this, Lt);

	        return _possibleConstructorReturn(this, (Lt.__proto__ || Object.getPrototypeOf(Lt)).apply(this, arguments));
	    }

	    _createClass(Lt, [{
	        key: 'idb_key_range',
	        get: function get() {
	            var _IDBKeyRange3;

	            return (_IDBKeyRange3 = IDBKeyRange).upperBound.apply(_IDBKeyRange3, _toConsumableArray(this.values).concat([true]));
	        }
	    }]);

	    return Lt;
	}(rangeMixin(lt));

	var Lte = function (_rangeMixin4) {
	    _inherits(Lte, _rangeMixin4);

	    function Lte() {
	        _classCallCheck(this, Lte);

	        return _possibleConstructorReturn(this, (Lte.__proto__ || Object.getPrototypeOf(Lte)).apply(this, arguments));
	    }

	    _createClass(Lte, [{
	        key: 'idb_key_range',
	        get: function get() {
	            var _IDBKeyRange4;

	            return (_IDBKeyRange4 = IDBKeyRange).upperBound.apply(_IDBKeyRange4, _toConsumableArray(this.values));
	        }
	    }]);

	    return Lte;
	}(rangeMixin(lte));

	var GtLt = function (_rangeMixin5) {
	    _inherits(GtLt, _rangeMixin5);

	    function GtLt() {
	        _classCallCheck(this, GtLt);

	        return _possibleConstructorReturn(this, (GtLt.__proto__ || Object.getPrototypeOf(GtLt)).apply(this, arguments));
	    }

	    _createClass(GtLt, [{
	        key: 'idb_key_range',
	        get: function get() {
	            var _IDBKeyRange5;

	            return (_IDBKeyRange5 = IDBKeyRange).bound.apply(_IDBKeyRange5, _toConsumableArray(this.values).concat([true, true]));
	        }
	    }]);

	    return GtLt;
	}(rangeMixin(gt, lt));

	var GteLt = function (_rangeMixin6) {
	    _inherits(GteLt, _rangeMixin6);

	    function GteLt() {
	        _classCallCheck(this, GteLt);

	        return _possibleConstructorReturn(this, (GteLt.__proto__ || Object.getPrototypeOf(GteLt)).apply(this, arguments));
	    }

	    _createClass(GteLt, [{
	        key: 'idb_key_range',
	        get: function get() {
	            var _IDBKeyRange6;

	            return (_IDBKeyRange6 = IDBKeyRange).bound.apply(_IDBKeyRange6, _toConsumableArray(this.values).concat([false, true]));
	        }
	    }]);

	    return GteLt;
	}(rangeMixin(gte, lt));

	var GtLte = function (_rangeMixin7) {
	    _inherits(GtLte, _rangeMixin7);

	    function GtLte() {
	        _classCallCheck(this, GtLte);

	        return _possibleConstructorReturn(this, (GtLte.__proto__ || Object.getPrototypeOf(GtLte)).apply(this, arguments));
	    }

	    _createClass(GtLte, [{
	        key: 'idb_key_range',
	        get: function get() {
	            var _IDBKeyRange7;

	            return (_IDBKeyRange7 = IDBKeyRange).bound.apply(_IDBKeyRange7, _toConsumableArray(this.values).concat([true, false]));
	        }
	    }]);

	    return GtLte;
	}(rangeMixin(gt, lte));

	var GteLte = function (_rangeMixin8) {
	    _inherits(GteLte, _rangeMixin8);

	    function GteLte() {
	        _classCallCheck(this, GteLte);

	        return _possibleConstructorReturn(this, (GteLte.__proto__ || Object.getPrototypeOf(GteLte)).apply(this, arguments));
	    }

	    _createClass(GteLte, [{
	        key: 'idb_key_range',
	        get: function get() {
	            var _IDBKeyRange8;

	            return (_IDBKeyRange8 = IDBKeyRange).bound.apply(_IDBKeyRange8, _toConsumableArray(this.values));
	        }
	    }]);

	    return GteLte;
	}(rangeMixin(gte, lte));

	var ElemMatch = function (_Operator5) {
	    _inherits(ElemMatch, _Operator5);

	    function ElemMatch(path, op) {
	        _classCallCheck(this, ElemMatch);

	        var _this18 = _possibleConstructorReturn(this, (ElemMatch.__proto__ || Object.getPrototypeOf(ElemMatch)).call(this));

	        _this18.path = path;
	        _this18.op = op;
	        return _this18;
	    }

	    _createClass(ElemMatch, [{
	        key: 'run',
	        value: function run(fields) {
	            var elements = fields.get(this.path);

	            if (!elements || !elements[Symbol.iterator]) {
	                return false;
	            }

	            var op = this.op;
	            var _iteratorNormalCompletion4 = true;
	            var _didIteratorError4 = false;
	            var _iteratorError4 = undefined;

	            try {

	                for (var _iterator4 = elements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	                    var obj = _step4.value;

	                    if (isObject(obj) && op.run(new Fields(obj))) {
	                        return true;
	                    }
	                }
	            } catch (err) {
	                _didIteratorError4 = true;
	                _iteratorError4 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
	                        _iterator4.return();
	                    }
	                } finally {
	                    if (_didIteratorError4) {
	                        throw _iteratorError4;
	                    }
	                }
	            }

	            return false;
	        }
	    }, {
	        key: 'is_index_matchable',
	        get: function get() {
	            return false;
	        }
	    }]);

	    return ElemMatch;
	}(Operator);

	var $and = function $and(parent_args, args) {
	    var _iteratorNormalCompletion5 = true;
	    var _didIteratorError5 = false;
	    var _iteratorError5 = undefined;

	    try {
	        for (var _iterator5 = args[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	            var expr = _step5.value;

	            var arg = build(expr);

	            if (arg === false) {
	                return false;
	            }
	            if (!arg) {
	                continue;
	            }

	            if (arg.constructor === Conjunction) {
	                parent_args.push.apply(parent_args, _toConsumableArray(arg.args));
	            } else {
	                parent_args.push(arg);
	            }
	        }
	    } catch (err) {
	        _didIteratorError5 = true;
	        _iteratorError5 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion5 && _iterator5.return) {
	                _iterator5.return();
	            }
	        } finally {
	            if (_didIteratorError5) {
	                throw _iteratorError5;
	            }
	        }
	    }

	    return true;
	};

	var $or = function $or(parent_args, args) {
	    var new_args = [];

	    var has_false = void 0;

	    var _iteratorNormalCompletion6 = true;
	    var _didIteratorError6 = false;
	    var _iteratorError6 = undefined;

	    try {
	        for (var _iterator6 = args[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	            var expr = _step6.value;

	            var arg = build(expr);

	            if (!arg) {
	                if (arg === false) {
	                    has_false = true;
	                }

	                continue;
	            }

	            if (arg.constructor === Disjunction) {
	                new_args.push.apply(new_args, _toConsumableArray(arg.args));
	            } else {
	                new_args.push(arg);
	            }
	        }
	    } catch (err) {
	        _didIteratorError6 = true;
	        _iteratorError6 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion6 && _iterator6.return) {
	                _iterator6.return();
	            }
	        } finally {
	            if (_didIteratorError6) {
	                throw _iteratorError6;
	            }
	        }
	    }

	    if (new_args.length > 1) {
	        parent_args.push(new Disjunction(new_args));
	    } else if (new_args.length) {
	        parent_args.push(new_args[0]);
	    } else if (has_false) {
	        return false;
	    }

	    return true;
	};

	var $not = function $not(parent_args, args) {
	    var new_args = [];

	    var _iteratorNormalCompletion7 = true;
	    var _didIteratorError7 = false;
	    var _iteratorError7 = undefined;

	    try {
	        for (var _iterator7 = args[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
	            var expr = _step7.value;

	            var arg = build(expr);

	            if (arg) {
	                new_args.push(arg);
	            }
	        }
	    } catch (err) {
	        _didIteratorError7 = true;
	        _iteratorError7 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion7 && _iterator7.return) {
	                _iterator7.return();
	            }
	        } finally {
	            if (_didIteratorError7) {
	                throw _iteratorError7;
	            }
	        }
	    }

	    if (new_args.length) {
	        parent_args.push(new Negation(new_args));
	    }

	    return true;
	};

	var connectives = {
	    $and: $and,
	    $or: $or,
	    $not: $not,
	    $nor: $not
	};

	var ranges = [[GtLt, '$gt', '$lt'], [GteLt, '$gte', '$lt'], [GtLte, '$gt', '$lte'], [GteLte, '$gte', '$lte'], [Gt, '$gt'], [Gte, '$gte'], [Lt, '$lt'], [Lte, '$lte']];

	var buildRange = function buildRange(new_args, path, params, op_keys) {
	    var build = function build(RangeOp, range_keys) {
	        var values = [];

	        var _iteratorNormalCompletion8 = true;
	        var _didIteratorError8 = false;
	        var _iteratorError8 = undefined;

	        try {
	            for (var _iterator8 = range_keys[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
	                var name = _step8.value;

	                if (!op_keys.has(name)) {
	                    return;
	                }

	                var value = params[name];
	                if (!isIndexMatchable(value)) {
	                    return false;
	                }

	                values.push(value);
	            }
	        } catch (err) {
	            _didIteratorError8 = true;
	            _iteratorError8 = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion8 && _iterator8.return) {
	                    _iterator8.return();
	                }
	            } finally {
	                if (_didIteratorError8) {
	                    throw _iteratorError8;
	                }
	            }
	        }

	        new_args.push(new RangeOp(path, values));

	        return true;
	    };

	    var _iteratorNormalCompletion9 = true;
	    var _didIteratorError9 = false;
	    var _iteratorError9 = undefined;

	    try {
	        for (var _iterator9 = ranges[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
	            var _step9$value = _toArray(_step9.value),
	                RangeOp = _step9$value[0],
	                range_keys = _step9$value.slice(1);

	            var result = build(RangeOp, range_keys);

	            if (result === false) {
	                return;
	            }
	            if (!result) {
	                continue;
	            }

	            op_keys.delete('$gt');
	            op_keys.delete('$gte');
	            op_keys.delete('$lt');
	            op_keys.delete('$lte');

	            break;
	        }
	    } catch (err) {
	        _didIteratorError9 = true;
	        _iteratorError9 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion9 && _iterator9.return) {
	                _iterator9.return();
	            }
	        } finally {
	            if (_didIteratorError9) {
	                throw _iteratorError9;
	            }
	        }
	    }

	    return true;
	};

	var buildClause = function buildClause(parent_args, path, params) {
	    var withoutOps = function withoutOps() {
	        parent_args.push(new Equal(path, params));

	        return true;
	    };

	    if (params == null || params.constructor !== Object) {
	        return withoutOps();
	    }

	    var op_keys = new Set(Object.keys(params));

	    if (op_keys.has('$exists') && !params.$exists) {
	        parent_args.push(new Exists(path, false));

	        return true;
	    }

	    var new_args = [];

	    if (op_keys.has('$eq')) {
	        new_args.push(new Equal(path, params.$eq));

	        op_keys.delete('$eq');
	    }

	    if (op_keys.has('$ne')) {
	        new_args.push(new NotEqual(path, params.$ne));

	        op_keys.delete('$ne');
	    }

	    if (!buildRange(new_args, path, params, op_keys)) {
	        return false;
	    }

	    if (op_keys.has('$in')) {
	        var eqs = [];

	        var _iteratorNormalCompletion10 = true;
	        var _didIteratorError10 = false;
	        var _iteratorError10 = undefined;

	        try {
	            for (var _iterator10 = params.$in[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
	                var value = _step10.value;

	                eqs.push(new Equal(path, value));
	            }
	        } catch (err) {
	            _didIteratorError10 = true;
	            _iteratorError10 = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion10 && _iterator10.return) {
	                    _iterator10.return();
	                }
	            } finally {
	                if (_didIteratorError10) {
	                    throw _iteratorError10;
	                }
	            }
	        }

	        if (eqs.length > 1) {
	            new_args.push(new Disjunction(eqs));
	        } else if (eqs.length) {
	            new_args.push(eqs[0]);
	        }

	        op_keys.delete('$in');
	    }

	    if (op_keys.has('$nin')) {
	        var _iteratorNormalCompletion11 = true;
	        var _didIteratorError11 = false;
	        var _iteratorError11 = undefined;

	        try {
	            for (var _iterator11 = params.$nin[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
	                var _value = _step11.value;

	                new_args.push(new NotEqual(path, _value));
	            }
	        } catch (err) {
	            _didIteratorError11 = true;
	            _iteratorError11 = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion11 && _iterator11.return) {
	                    _iterator11.return();
	                }
	            } finally {
	                if (_didIteratorError11) {
	                    throw _iteratorError11;
	                }
	            }
	        }

	        op_keys.delete('$nin');
	    }

	    if (op_keys.has('$elemMatch')) {
	        var op = build(params.$elemMatch);

	        if (op) {
	            new_args.push(new ElemMatch(path, op));
	        }

	        op_keys.delete('$elemMatch');
	    }

	    if (params.$exists && !new_args.length) {
	        new_args.push(new Exists(path, true));

	        op_keys.delete('$exists');
	    }

	    var _iteratorNormalCompletion12 = true;
	    var _didIteratorError12 = false;
	    var _iteratorError12 = undefined;

	    try {
	        for (var _iterator12 = op_keys[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
	            var name = _step12.value;

	            if (name[0] === '$') {
	                unknownOp(name);
	            }
	        }
	    } catch (err) {
	        _didIteratorError12 = true;
	        _iteratorError12 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion12 && _iterator12.return) {
	                _iterator12.return();
	            }
	        } finally {
	            if (_didIteratorError12) {
	                throw _iteratorError12;
	            }
	        }
	    }

	    if (!new_args.length) {
	        return withoutOps();
	    }

	    parent_args.push.apply(parent_args, new_args);

	    return true;
	};

	var build = function build(expr) {
	    var args = [];

	    for (var field in expr) {
	        var value = expr[field],
	            result = void 0;

	        if (field[0] !== '$') {
	            result = buildClause(args, new Path(field), value);
	        } else {
	            if (!Array.isArray(value)) {
	                value = [value];
	            }

	            var fn = connectives[field];
	            if (!fn) {
	                unknownOp(field);
	            }

	            result = fn(args, value);
	        }

	        if (!result) {
	            return result;
	        }
	    }

	    if (!args.length) {
	        return;
	    }
	    if (args.length === 1) {
	        return args[0];
	    }

	    return new Conjunction(args);
	};

	module.exports.build = build;
	module.exports.Conjunction = Conjunction;
	module.exports.Disjunction = Disjunction;
	module.exports.Exists = Exists;

	// db.open()
	// var peoples = [            { firstname: 'John', lastname: 'Doe', age: 24 },
	//             { firstname: 'Jane', lastname: 'Doe', age: 23 },
	//             { firstname: 'Pete', lastname: 'Fox', age: 22 },
	//             { firstname: 'Kyle', lastname: 'Riz', age: 17 },
	// ]
	// var insertions = peoples.map(function(person) {
	//     return db.table('people').add(person);
	// });
	// db.collection('people').find().toArray().then(function(a) { console.log(a) })
	// db.collection('people').find({$or: [{age: 12}, {age: 17}]}).toArray().then(function(a) { console.log(a) })

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _require = __webpack_require__(7),
	    toPathPieces = _require.toPathPieces;

	var Path = function Path(path) {
	    _classCallCheck(this, Path);

	    this.pieces = toPathPieces(path);
	    this.literal = path;
	};

	module.exports = Path;

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _require = __webpack_require__(7),
	    toPathPieces = _require.toPathPieces,
	    set = _require.set,
	    remove2 = _require.remove2,
	    copy = _require.copy;

	var build = __webpack_require__(88);
	var Fields = __webpack_require__(19);

	var addition = function addition(doc, new_doc, new_fields) {
	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	        for (var _iterator = new_fields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var _step$value = _slicedToArray(_step.value, 2),
	                path_pieces = _step$value[0],
	                add = _step$value[1];

	            add(doc, new_doc, path_pieces);
	        }
	    } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	            }
	        } finally {
	            if (_didIteratorError) {
	                throw _iteratorError;
	            }
	        }
	    }

	    return new_doc;
	};

	var _build = function _build(value1) {
	    var _build2 = build(value1),
	        ast = _build2.ast,
	        paths = _build2.paths,
	        has_refs = _build2.has_refs;

	    if (!has_refs) {
	        var value2 = ast.run();

	        return function (doc) {
	            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	                args[_key - 1] = arguments[_key];
	            }

	            return set.apply(undefined, args.concat([value2]));
	        };
	    }

	    return function (doc) {
	        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	            args[_key2 - 1] = arguments[_key2];
	        }

	        var fields = new Fields(doc);

	        if (fields.ensure(paths)) {
	            set.apply(undefined, args.concat([ast.run(fields)]));
	        }
	    };
	};

	var project = function project(_next, spec) {
	    var toBool = function toBool(path) {
	        return !!spec[path];
	    };
	    var _id_bool = true;

	    if (spec.hasOwnProperty('_id')) {
	        _id_bool = toBool('_id');

	        delete spec._id;
	    }

	    var existing_fields = [],
	        new_fields = [];
	    var is_inclusion = true;

	    var _mode = function _mode(path) {
	        if (toBool(path) !== is_inclusion) {
	            throw Error('cannot mix inclusions and exclusions');
	        }
	    };

	    var _mode2 = function mode(path) {
	        is_inclusion = toBool(path);

	        _mode2 = _mode;
	    };

	    for (var path in spec) {
	        var value = spec[path];
	        var path_pieces = toPathPieces(path);

	        if (typeof value === 'boolean' || value === 1 || value === 0) {
	            _mode2(path);
	            existing_fields.push(path_pieces);
	        } else {
	            new_fields.push([path_pieces, _build(value)]);
	        }
	    }

	    var steps = [];

	    if (new_fields.length) {
	        steps.push(function (doc, new_doc) {
	            return addition(doc, new_doc, new_fields);
	        });
	    }

	    if (!existing_fields.length) {
	        var _project = void 0;

	        if (_id_bool) {
	            _project = function _project(doc, new_doc) {
	                if (doc.hasOwnProperty('_id')) {
	                    new_doc._id = doc._id;
	                }
	            };
	        } else {
	            _project = function _project(doc, new_doc) {
	                delete new_doc._id;
	            };
	        }

	        steps.push(function (doc, new_doc) {
	            _project(doc, new_doc);

	            return new_doc;
	        });
	    } else {
	        if (is_inclusion === _id_bool) {
	            existing_fields.push(['_id']);
	        }

	        var _project2 = is_inclusion ? copy : remove2;

	        steps.push(function (doc) {
	            return _project2(doc, existing_fields);
	        });
	    }

	    var next = function next(cb) {
	        _next(function (error, doc) {
	            if (!doc) {
	                return cb(error);
	            }

	            var new_doc = doc;

	            var _iteratorNormalCompletion2 = true;
	            var _didIteratorError2 = false;
	            var _iteratorError2 = undefined;

	            try {
	                for (var _iterator2 = steps[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                    var fn = _step2.value;

	                    new_doc = fn(doc, new_doc);
	                }
	            } catch (err) {
	                _didIteratorError2 = true;
	                _iteratorError2 = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                        _iterator2.return();
	                    }
	                } finally {
	                    if (_didIteratorError2) {
	                        throw _iteratorError2;
	                    }
	                }
	            }

	            cb(null, new_doc);
	        });
	    };

	    return next;
	};

	module.exports = project;

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _require = __webpack_require__(7),
	    unknownOp = _require.unknownOp,
	    MISSING = __webpack_require__(83),
	    Path = __webpack_require__(86);

	var Value = function () {
	    function Value(value) {
	        _classCallCheck(this, Value);

	        this.value = value;
	    }

	    _createClass(Value, [{
	        key: 'run',
	        value: function run() {
	            return this.value;
	        }
	    }, {
	        key: 'ResultType',
	        get: function get() {
	            return this.constructor;
	        }
	    }], [{
	        key: 'any',
	        value: function any(value) {
	            if (typeof value === 'number') {
	                return new NumberValue(value);
	            }

	            if (typeof value === 'string') {
	                return new StringValue(value);
	            }

	            if (Array.isArray(value)) {
	                return new ArrayValue(value);
	            }

	            if (value instanceof Date) {
	                return new DateValue(value);
	            }

	            return new Value(value);
	        }
	    }, {
	        key: 'literal',
	        value: function literal(value) {
	            return new Literal(Value.any(value));
	        }
	    }]);

	    return Value;
	}();

	var NumberValue = function (_Value) {
	    _inherits(NumberValue, _Value);

	    function NumberValue() {
	        _classCallCheck(this, NumberValue);

	        return _possibleConstructorReturn(this, (NumberValue.__proto__ || Object.getPrototypeOf(NumberValue)).apply(this, arguments));
	    }

	    _createClass(NumberValue, null, [{
	        key: 'isType',
	        value: function isType(value) {
	            return typeof value === 'number';
	        }
	    }]);

	    return NumberValue;
	}(Value);

	var StringValue = function (_Value2) {
	    _inherits(StringValue, _Value2);

	    function StringValue() {
	        _classCallCheck(this, StringValue);

	        return _possibleConstructorReturn(this, (StringValue.__proto__ || Object.getPrototypeOf(StringValue)).apply(this, arguments));
	    }

	    _createClass(StringValue, null, [{
	        key: 'isType',
	        value: function isType(value) {
	            return typeof value === 'string';
	        }
	    }]);

	    return StringValue;
	}(Value);

	var ArrayValue = function (_Value3) {
	    _inherits(ArrayValue, _Value3);

	    function ArrayValue() {
	        _classCallCheck(this, ArrayValue);

	        return _possibleConstructorReturn(this, (ArrayValue.__proto__ || Object.getPrototypeOf(ArrayValue)).apply(this, arguments));
	    }

	    _createClass(ArrayValue, null, [{
	        key: 'isType',
	        value: function isType(value) {
	            return Array.isArray(value);
	        }
	    }]);

	    return ArrayValue;
	}(Value);

	var DateValue = function (_Value4) {
	    _inherits(DateValue, _Value4);

	    function DateValue() {
	        _classCallCheck(this, DateValue);

	        return _possibleConstructorReturn(this, (DateValue.__proto__ || Object.getPrototypeOf(DateValue)).apply(this, arguments));
	    }

	    _createClass(DateValue, null, [{
	        key: 'isType',
	        value: function isType(value) {
	            return value instanceof Date;
	        }
	    }]);

	    return DateValue;
	}(Value);

	var Literal = function (_Value5) {
	    _inherits(Literal, _Value5);

	    function Literal() {
	        _classCallCheck(this, Literal);

	        return _possibleConstructorReturn(this, (Literal.__proto__ || Object.getPrototypeOf(Literal)).apply(this, arguments));
	    }

	    _createClass(Literal, [{
	        key: 'run',
	        value: function run() {
	            return this.value.run();
	        }
	    }, {
	        key: 'ResultType',
	        get: function get() {
	            return this.value.ResultType;
	        }
	    }]);

	    return Literal;
	}(Value);

	var Get = function () {
	    function Get(path) {
	        _classCallCheck(this, Get);

	        this.path = path;
	    }

	    _createClass(Get, [{
	        key: 'run',
	        value: function run(fields) {
	            var value = fields.get(this.path);

	            return value === MISSING ? null : value;
	        }
	    }]);

	    return Get;
	}();

	var ObjectExpr = function (_Value6) {
	    _inherits(ObjectExpr, _Value6);

	    function ObjectExpr() {
	        _classCallCheck(this, ObjectExpr);

	        return _possibleConstructorReturn(this, (ObjectExpr.__proto__ || Object.getPrototypeOf(ObjectExpr)).apply(this, arguments));
	    }

	    _createClass(ObjectExpr, [{
	        key: 'run',
	        value: function run(fields) {
	            var result = {},
	                value = this.value;

	            for (var field in value) {
	                result[field] = value[field].run(fields);
	            }

	            return result;
	        }
	    }]);

	    return ObjectExpr;
	}(Value);

	var Operator = function () {
	    function Operator() {
	        _classCallCheck(this, Operator);

	        this.args = [];
	    }

	    _createClass(Operator, [{
	        key: 'add',
	        value: function add(node) {
	            this.args.push(node);
	        }
	    }, {
	        key: 'alt',
	        get: function get() {
	            return new Value(null);
	        }
	    }]);

	    return Operator;
	}();

	var FnOp = function (_Operator) {
	    _inherits(FnOp, _Operator);

	    function FnOp(fn) {
	        _classCallCheck(this, FnOp);

	        var _this7 = _possibleConstructorReturn(this, (FnOp.__proto__ || Object.getPrototypeOf(FnOp)).call(this));

	        _this7.fn = fn;
	        return _this7;
	    }

	    _createClass(FnOp, [{
	        key: 'run',
	        value: function run(fields) {
	            var args = this.args,
	                fn = this.fn;


	            return args.map(function (arg) {
	                return arg.run(fields);
	            }).reduce(fn);
	        }
	    }, {
	        key: 'length',
	        get: function get() {
	            return Infinity;
	        }
	    }]);

	    return FnOp;
	}(Operator);

	var UnaryFnOp = function (_FnOp) {
	    _inherits(UnaryFnOp, _FnOp);

	    function UnaryFnOp() {
	        _classCallCheck(this, UnaryFnOp);

	        return _possibleConstructorReturn(this, (UnaryFnOp.__proto__ || Object.getPrototypeOf(UnaryFnOp)).apply(this, arguments));
	    }

	    _createClass(UnaryFnOp, [{
	        key: 'run',
	        value: function run(fields) {
	            return this.fn(this.args[0].run(fields));
	        }
	    }, {
	        key: 'length',
	        get: function get() {
	            return 1;
	        }
	    }]);

	    return UnaryFnOp;
	}(FnOp);

	var fnOp = function fnOp(Parent, fn) {
	    return function (_Parent) {
	        _inherits(_class, _Parent);

	        function _class() {
	            _classCallCheck(this, _class);

	            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, fn));
	        }

	        return _class;
	    }(Parent);
	};

	var opTypes = function opTypes(Parent, InputType) {
	    var ResultType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : InputType;

	    var Constructor = function (_Parent2) {
	        _inherits(Constructor, _Parent2);

	        function Constructor() {
	            _classCallCheck(this, Constructor);

	            return _possibleConstructorReturn(this, (Constructor.__proto__ || Object.getPrototypeOf(Constructor)).apply(this, arguments));
	        }

	        return Constructor;
	    }(Parent);

	    Constructor.prototype.InputType = InputType;
	    Constructor.prototype.ResultType = ResultType;

	    return Constructor;
	};

	var ArithOp = function (_opTypes) {
	    _inherits(ArithOp, _opTypes);

	    function ArithOp() {
	        _classCallCheck(this, ArithOp);

	        return _possibleConstructorReturn(this, (ArithOp.__proto__ || Object.getPrototypeOf(ArithOp)).apply(this, arguments));
	    }

	    return ArithOp;
	}(opTypes(FnOp, NumberValue));

	var arithOp = function arithOp(fn) {
	    return fnOp(ArithOp, fn);
	};

	var Add = function (_arithOp) {
	    _inherits(Add, _arithOp);

	    function Add() {
	        _classCallCheck(this, Add);

	        return _possibleConstructorReturn(this, (Add.__proto__ || Object.getPrototypeOf(Add)).apply(this, arguments));
	    }

	    return Add;
	}(arithOp(function (a, b) {
	    return a + b;
	}));

	var Subtract = function (_arithOp2) {
	    _inherits(Subtract, _arithOp2);

	    function Subtract() {
	        _classCallCheck(this, Subtract);

	        return _possibleConstructorReturn(this, (Subtract.__proto__ || Object.getPrototypeOf(Subtract)).apply(this, arguments));
	    }

	    return Subtract;
	}(arithOp(function (a, b) {
	    return a - b;
	}));

	var Multiply = function (_arithOp3) {
	    _inherits(Multiply, _arithOp3);

	    function Multiply() {
	        _classCallCheck(this, Multiply);

	        return _possibleConstructorReturn(this, (Multiply.__proto__ || Object.getPrototypeOf(Multiply)).apply(this, arguments));
	    }

	    return Multiply;
	}(arithOp(function (a, b) {
	    return a * b;
	}));

	var Divide = function (_arithOp4) {
	    _inherits(Divide, _arithOp4);

	    function Divide() {
	        _classCallCheck(this, Divide);

	        return _possibleConstructorReturn(this, (Divide.__proto__ || Object.getPrototypeOf(Divide)).apply(this, arguments));
	    }

	    return Divide;
	}(arithOp(function (a, b) {
	    return a / b;
	}));

	var Mod = function (_arithOp5) {
	    _inherits(Mod, _arithOp5);

	    function Mod() {
	        _classCallCheck(this, Mod);

	        return _possibleConstructorReturn(this, (Mod.__proto__ || Object.getPrototypeOf(Mod)).apply(this, arguments));
	    }

	    return Mod;
	}(arithOp(function (a, b) {
	    return a % b;
	}));

	var MathOp = function (_opTypes2) {
	    _inherits(MathOp, _opTypes2);

	    function MathOp() {
	        _classCallCheck(this, MathOp);

	        return _possibleConstructorReturn(this, (MathOp.__proto__ || Object.getPrototypeOf(MathOp)).apply(this, arguments));
	    }

	    _createClass(MathOp, [{
	        key: 'run',
	        value: function run(fields) {
	            return this.fn.apply(this, _toConsumableArray(this.args.map(function (arg) {
	                return arg.run(fields);
	            })));
	        }
	    }, {
	        key: 'length',
	        get: function get() {
	            return this.fn.length;
	        }
	    }]);

	    return MathOp;
	}(opTypes(FnOp, NumberValue));

	var mathOp = function mathOp(fn) {
	    return fnOp(MathOp, fn);
	};

	var Abs = function (_mathOp) {
	    _inherits(Abs, _mathOp);

	    function Abs() {
	        _classCallCheck(this, Abs);

	        return _possibleConstructorReturn(this, (Abs.__proto__ || Object.getPrototypeOf(Abs)).apply(this, arguments));
	    }

	    return Abs;
	}(mathOp(Math.abs));

	var Ceil = function (_mathOp2) {
	    _inherits(Ceil, _mathOp2);

	    function Ceil() {
	        _classCallCheck(this, Ceil);

	        return _possibleConstructorReturn(this, (Ceil.__proto__ || Object.getPrototypeOf(Ceil)).apply(this, arguments));
	    }

	    return Ceil;
	}(mathOp(Math.ceil));

	var Floor = function (_mathOp3) {
	    _inherits(Floor, _mathOp3);

	    function Floor() {
	        _classCallCheck(this, Floor);

	        return _possibleConstructorReturn(this, (Floor.__proto__ || Object.getPrototypeOf(Floor)).apply(this, arguments));
	    }

	    return Floor;
	}(mathOp(Math.floor));

	var Ln = function (_mathOp4) {
	    _inherits(Ln, _mathOp4);

	    function Ln() {
	        _classCallCheck(this, Ln);

	        return _possibleConstructorReturn(this, (Ln.__proto__ || Object.getPrototypeOf(Ln)).apply(this, arguments));
	    }

	    return Ln;
	}(mathOp(Math.log));

	var Log10 = function (_mathOp5) {
	    _inherits(Log10, _mathOp5);

	    function Log10() {
	        _classCallCheck(this, Log10);

	        return _possibleConstructorReturn(this, (Log10.__proto__ || Object.getPrototypeOf(Log10)).apply(this, arguments));
	    }

	    return Log10;
	}(mathOp(Math.log10));

	var Pow = function (_mathOp6) {
	    _inherits(Pow, _mathOp6);

	    function Pow() {
	        _classCallCheck(this, Pow);

	        return _possibleConstructorReturn(this, (Pow.__proto__ || Object.getPrototypeOf(Pow)).apply(this, arguments));
	    }

	    return Pow;
	}(mathOp(Math.pow));

	var Sqrt = function (_mathOp7) {
	    _inherits(Sqrt, _mathOp7);

	    function Sqrt() {
	        _classCallCheck(this, Sqrt);

	        return _possibleConstructorReturn(this, (Sqrt.__proto__ || Object.getPrototypeOf(Sqrt)).apply(this, arguments));
	    }

	    return Sqrt;
	}(mathOp(Math.sqrt));

	var Trunc = function (_mathOp8) {
	    _inherits(Trunc, _mathOp8);

	    function Trunc() {
	        _classCallCheck(this, Trunc);

	        return _possibleConstructorReturn(this, (Trunc.__proto__ || Object.getPrototypeOf(Trunc)).apply(this, arguments));
	    }

	    return Trunc;
	}(mathOp(Math.trunc));

	var StringConcatOp = function (_opTypes3) {
	    _inherits(StringConcatOp, _opTypes3);

	    function StringConcatOp() {
	        _classCallCheck(this, StringConcatOp);

	        return _possibleConstructorReturn(this, (StringConcatOp.__proto__ || Object.getPrototypeOf(StringConcatOp)).apply(this, arguments));
	    }

	    return StringConcatOp;
	}(opTypes(FnOp, StringValue));

	var Concat = function (_fnOp) {
	    _inherits(Concat, _fnOp);

	    function Concat() {
	        _classCallCheck(this, Concat);

	        return _possibleConstructorReturn(this, (Concat.__proto__ || Object.getPrototypeOf(Concat)).apply(this, arguments));
	    }

	    return Concat;
	}(fnOp(StringConcatOp, function (a, b) {
	    return a + b;
	}));

	var CaseOp = function (_opTypes4) {
	    _inherits(CaseOp, _opTypes4);

	    function CaseOp() {
	        _classCallCheck(this, CaseOp);

	        return _possibleConstructorReturn(this, (CaseOp.__proto__ || Object.getPrototypeOf(CaseOp)).apply(this, arguments));
	    }

	    _createClass(CaseOp, [{
	        key: 'alt',
	        get: function get() {
	            return new StringValue('');
	        }
	    }]);

	    return CaseOp;
	}(opTypes(UnaryFnOp, StringValue));

	var ToLower = function (_fnOp2) {
	    _inherits(ToLower, _fnOp2);

	    function ToLower() {
	        _classCallCheck(this, ToLower);

	        return _possibleConstructorReturn(this, (ToLower.__proto__ || Object.getPrototypeOf(ToLower)).apply(this, arguments));
	    }

	    return ToLower;
	}(fnOp(CaseOp, function (s) {
	    return s.toLowerCase();
	}));

	var ToUpper = function (_fnOp3) {
	    _inherits(ToUpper, _fnOp3);

	    function ToUpper() {
	        _classCallCheck(this, ToUpper);

	        return _possibleConstructorReturn(this, (ToUpper.__proto__ || Object.getPrototypeOf(ToUpper)).apply(this, arguments));
	    }

	    return ToUpper;
	}(fnOp(CaseOp, function (s) {
	    return s.toUpperCase();
	}));

	var ConcatArraysOp = function (_opTypes5) {
	    _inherits(ConcatArraysOp, _opTypes5);

	    function ConcatArraysOp() {
	        _classCallCheck(this, ConcatArraysOp);

	        return _possibleConstructorReturn(this, (ConcatArraysOp.__proto__ || Object.getPrototypeOf(ConcatArraysOp)).apply(this, arguments));
	    }

	    return ConcatArraysOp;
	}(opTypes(FnOp, ArrayValue));

	var ConcatArrays = function (_fnOp4) {
	    _inherits(ConcatArrays, _fnOp4);

	    function ConcatArrays() {
	        _classCallCheck(this, ConcatArrays);

	        return _possibleConstructorReturn(this, (ConcatArrays.__proto__ || Object.getPrototypeOf(ConcatArrays)).apply(this, arguments));
	    }

	    return ConcatArrays;
	}(fnOp(ConcatArraysOp, function (a, b) {
	    return a.concat(b);
	}));

	var DateOp = function (_opTypes6) {
	    _inherits(DateOp, _opTypes6);

	    function DateOp() {
	        _classCallCheck(this, DateOp);

	        return _possibleConstructorReturn(this, (DateOp.__proto__ || Object.getPrototypeOf(DateOp)).apply(this, arguments));
	    }

	    return DateOp;
	}(opTypes(UnaryFnOp, DateValue, NumberValue));

	var dateOp = function dateOp(fn) {
	    return fnOp(DateOp, fn);
	};

	var DayOfMonth = function (_dateOp) {
	    _inherits(DayOfMonth, _dateOp);

	    function DayOfMonth() {
	        _classCallCheck(this, DayOfMonth);

	        return _possibleConstructorReturn(this, (DayOfMonth.__proto__ || Object.getPrototypeOf(DayOfMonth)).apply(this, arguments));
	    }

	    return DayOfMonth;
	}(dateOp(function (d) {
	    return d.getDate();
	}));

	var Year = function (_dateOp2) {
	    _inherits(Year, _dateOp2);

	    function Year() {
	        _classCallCheck(this, Year);

	        return _possibleConstructorReturn(this, (Year.__proto__ || Object.getPrototypeOf(Year)).apply(this, arguments));
	    }

	    return Year;
	}(dateOp(function (d) {
	    return d.getUTCFullYear();
	}));

	var Month = function (_dateOp3) {
	    _inherits(Month, _dateOp3);

	    function Month() {
	        _classCallCheck(this, Month);

	        return _possibleConstructorReturn(this, (Month.__proto__ || Object.getPrototypeOf(Month)).apply(this, arguments));
	    }

	    return Month;
	}(dateOp(function (d) {
	    return d.getUTCMonth() + 1;
	}));

	var Hour = function (_dateOp4) {
	    _inherits(Hour, _dateOp4);

	    function Hour() {
	        _classCallCheck(this, Hour);

	        return _possibleConstructorReturn(this, (Hour.__proto__ || Object.getPrototypeOf(Hour)).apply(this, arguments));
	    }

	    return Hour;
	}(dateOp(function (d) {
	    return d.getUTCHours();
	}));

	var Minute = function (_dateOp5) {
	    _inherits(Minute, _dateOp5);

	    function Minute() {
	        _classCallCheck(this, Minute);

	        return _possibleConstructorReturn(this, (Minute.__proto__ || Object.getPrototypeOf(Minute)).apply(this, arguments));
	    }

	    return Minute;
	}(dateOp(function (d) {
	    return d.getUTCMinutes();
	}));

	var Second = function (_dateOp6) {
	    _inherits(Second, _dateOp6);

	    function Second() {
	        _classCallCheck(this, Second);

	        return _possibleConstructorReturn(this, (Second.__proto__ || Object.getPrototypeOf(Second)).apply(this, arguments));
	    }

	    return Second;
	}(dateOp(function (d) {
	    return d.getUTCSeconds();
	}));

	var Millisecond = function (_dateOp7) {
	    _inherits(Millisecond, _dateOp7);

	    function Millisecond() {
	        _classCallCheck(this, Millisecond);

	        return _possibleConstructorReturn(this, (Millisecond.__proto__ || Object.getPrototypeOf(Millisecond)).apply(this, arguments));
	    }

	    return Millisecond;
	}(dateOp(function (d) {
	    return d.getUTCMilliseconds();
	}));

	var TypeCond = function () {
	    function TypeCond(stack, args, op) {
	        _classCallCheck(this, TypeCond);

	        var InputType = op.InputType,
	            alt = op.alt;


	        this.result_types = new Set([op.ResultType, alt.ResultType]);
	        this.stack = stack;
	        this.isType = InputType.isType;
	        this.args = args;
	        this.op = op;
	        this.alt_value = alt.value;
	    }

	    _createClass(TypeCond, [{
	        key: 'run',
	        value: function run(fields) {
	            var stack = this.stack,
	                isType = this.isType,
	                op = this.op;

	            var new_args = [];

	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = this.args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var arg = _step.value;

	                    var result = arg.run(fields);

	                    if (!isType(result)) {
	                        return this.alt_value;
	                    }

	                    new_args.push(result);
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            for (var i = new_args.length - 1; i >= 0; i--) {
	                stack.push(new_args[i]);
	            }

	            return op.run(fields);
	        }
	    }]);

	    return TypeCond;
	}();

	var PopFromStack = function () {
	    function PopFromStack(stack) {
	        _classCallCheck(this, PopFromStack);

	        this.stack = stack;
	    }

	    _createClass(PopFromStack, [{
	        key: 'run',
	        value: function run() {
	            return this.stack.pop();
	        }
	    }]);

	    return PopFromStack;
	}();

	var ops = {
	    $add: Add,
	    $subtract: Subtract,
	    $multiply: Multiply,
	    $divide: Divide,
	    $mod: Mod,
	    $abs: Abs,
	    $ceil: Ceil,
	    $floor: Floor,
	    $ln: Ln,
	    $log10: Log10,
	    $pow: Pow,
	    $sqrt: Sqrt,
	    $trunc: Trunc,
	    $concat: Concat,
	    $toLower: ToLower,
	    $toUpper: ToUpper,
	    $concatArrays: ConcatArrays,
	    $dayOfMonth: DayOfMonth,
	    $year: Year,
	    $month: Month,
	    $hour: Hour,
	    $minute: Minute,
	    $second: Second,
	    $millisecond: Millisecond
	};

	var buildOp = function buildOp(paths, name, args) {
	    var Op = ops[name];
	    if (!Op) {
	        unknownOp(name);
	    }

	    if (!Array.isArray(args)) {
	        args = [args];
	    }

	    var op = new Op(),
	        tc_nodes = [],
	        new_paths = [],
	        stack = [];

	    for (var i = 0; i < args.length && i < op.length; i++) {
	        var arg = build(new_paths, args[i]);

	        if (arg.ResultType) {
	            if (arg.ResultType !== op.InputType) {
	                return op.alt;
	            }

	            op.add(arg);

	            continue;
	        }

	        if (arg instanceof TypeCond) {
	            if (!arg.result_types.has(op.InputType)) {
	                return op.alt;
	            }

	            if (arg.result_types.size === 1) {
	                op.add(arg);

	                continue;
	            }
	        }

	        tc_nodes.push(arg);
	        op.add(new PopFromStack(stack));
	    }

	    if (!new_paths.length) {
	        return new op.ResultType(op.run());
	    }

	    paths.push.apply(paths, new_paths);

	    if (!tc_nodes.length) {
	        return op;
	    }

	    return new TypeCond(stack, tc_nodes, op);
	};

	var buildObject = function buildObject(paths, expr) {
	    var op_names = new Set(),
	        fields = new Set();

	    for (var field in expr) {
	        (field[0] === '$' ? op_names : fields).add(field);
	    }

	    if (op_names.size > 1) {
	        throw Error('objects cannot have more than one operator');
	    }

	    if (op_names.size) {
	        var _iteratorNormalCompletion2 = true;
	        var _didIteratorError2 = false;
	        var _iteratorError2 = undefined;

	        try {
	            for (var _iterator2 = fields[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                var path = _step2.value;

	                throw Error('unexpected field \'' + path + '\'');
	            }
	        } catch (err) {
	            _didIteratorError2 = true;
	            _iteratorError2 = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                    _iterator2.return();
	                }
	            } finally {
	                if (_didIteratorError2) {
	                    throw _iteratorError2;
	                }
	            }
	        }

	        var _iteratorNormalCompletion3 = true;
	        var _didIteratorError3 = false;
	        var _iteratorError3 = undefined;

	        try {
	            for (var _iterator3 = op_names[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                var name = _step3.value;

	                if (name === '$literal') {
	                    return Value.literal(expr[name]);
	                }

	                return buildOp(paths, name, expr[name]);
	            }
	        } catch (err) {
	            _didIteratorError3 = true;
	            _iteratorError3 = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                    _iterator3.return();
	                }
	            } finally {
	                if (_didIteratorError3) {
	                    throw _iteratorError3;
	                }
	            }
	        }
	    }

	    var new_paths = [],
	        obj = {};

	    for (var _field in expr) {
	        obj[_field] = build(new_paths, expr[_field]);
	    }

	    var node = new ObjectExpr(obj);

	    if (!new_paths.length) {
	        return new Value(node.run());
	    }

	    paths.push.apply(paths, new_paths);

	    return node;
	};

	var build = function build(paths, expr) {
	    if (typeof expr === 'string' && expr[0] === '$') {
	        var path = new Path(expr.substring(1));

	        paths.push(path);

	        return new Get(path);
	    }

	    if (expr == null || expr.constructor !== Object) {
	        return Value.any(expr);
	    }

	    return buildObject(paths, expr);
	};

	module.exports = function (expr) {
	    var paths = [],
	        ast = build(paths, expr);

	    return {
	        ast: ast,
	        paths: paths,
	        has_refs: !!paths.length
	    };
	};

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var memoize = __webpack_require__(20);

	var _require = __webpack_require__(7),
	    unknownOp = _require.unknownOp,
	    hashify = _require.hashify,
	    build = __webpack_require__(88),
	    Fields = __webpack_require__(19);

	var Operator = function () {
	    function Operator() {
	        _classCallCheck(this, Operator);
	    }

	    _createClass(Operator, [{
	        key: 'getOpValueWithRefs',
	        value: function getOpValueWithRefs(expr, doc, cb) {
	            var ast = expr.ast,
	                fields = expr.fields;


	            cb(ast.run(fields));
	        }
	    }, {
	        key: 'value',
	        get: function get() {
	            return this._value;
	        }
	    }], [{
	        key: 'getNoRefsSteps',
	        value: function getNoRefsSteps(steps) {
	            return steps.in_iter;
	        }
	    }, {
	        key: 'getOpValue',
	        value: function getOpValue(expr, cb) {
	            cb(expr.ast.run());
	        }
	    }]);

	    return Operator;
	}();

	var Sum = function (_Operator) {
	    _inherits(Sum, _Operator);

	    function Sum() {
	        _classCallCheck(this, Sum);

	        var _this = _possibleConstructorReturn(this, (Sum.__proto__ || Object.getPrototypeOf(Sum)).call(this));

	        _this._value = 0;
	        return _this;
	    }

	    _createClass(Sum, [{
	        key: 'getOpValueWithRefs',
	        value: function getOpValueWithRefs(expr, doc, cb) {
	            _get(Sum.prototype.__proto__ || Object.getPrototypeOf(Sum.prototype), 'getOpValueWithRefs', this).call(this, expr, doc, function (value) {
	                Sum._verify(value, cb);
	            });
	        }
	    }, {
	        key: 'add',
	        value: function add(value) {
	            this._value += value;
	        }
	    }], [{
	        key: '_verify',
	        value: function _verify(value, cb) {
	            if (typeof value === 'number') {
	                cb(value);
	            }
	        }
	    }, {
	        key: 'getOpValue',
	        value: function getOpValue(expr, cb) {
	            _get(Sum.__proto__ || Object.getPrototypeOf(Sum), 'getOpValue', this).call(this, expr, function (value) {
	                return Sum._verify(value, cb);
	            });
	        }
	    }]);

	    return Sum;
	}(Operator);

	var Avg = function (_Sum) {
	    _inherits(Avg, _Sum);

	    function Avg() {
	        _classCallCheck(this, Avg);

	        var _this2 = _possibleConstructorReturn(this, (Avg.__proto__ || Object.getPrototypeOf(Avg)).call(this));

	        _this2._count = 0;
	        return _this2;
	    }

	    _createClass(Avg, [{
	        key: 'add',
	        value: function add(value) {
	            this._count++;

	            _get(Avg.prototype.__proto__ || Object.getPrototypeOf(Avg.prototype), 'add', this).call(this, value);
	        }
	    }, {
	        key: 'value',
	        get: function get() {
	            return this._value / this._count || 0;
	        }
	    }]);

	    return Avg;
	}(Sum);

	var Compare = function (_Operator2) {
	    _inherits(Compare, _Operator2);

	    function Compare(fn) {
	        _classCallCheck(this, Compare);

	        var _this3 = _possibleConstructorReturn(this, (Compare.__proto__ || Object.getPrototypeOf(Compare)).call(this));

	        _this3._value = null;
	        _this3._fn = fn;
	        _this3._add = _this3._add1;
	        return _this3;
	    }

	    _createClass(Compare, [{
	        key: '_add1',
	        value: function _add1(value) {
	            this._value = value;
	            this._add = this._add2;
	        }
	    }, {
	        key: '_add2',
	        value: function _add2(new_value) {
	            if (this._fn(new_value, this._value)) {
	                this._value = new_value;
	            }
	        }
	    }, {
	        key: 'add',
	        value: function add(value) {
	            if (value != null) {
	                this._add(value);
	            }
	        }
	    }], [{
	        key: 'getNoRefsSteps',
	        value: function getNoRefsSteps(steps) {
	            return steps.in_end;
	        }
	    }]);

	    return Compare;
	}(Operator);

	var Min = function (_Compare) {
	    _inherits(Min, _Compare);

	    function Min() {
	        _classCallCheck(this, Min);

	        return _possibleConstructorReturn(this, (Min.__proto__ || Object.getPrototypeOf(Min)).call(this, function (a, b) {
	            return a < b;
	        }));
	    }

	    return Min;
	}(Compare);

	var Max = function (_Compare2) {
	    _inherits(Max, _Compare2);

	    function Max() {
	        _classCallCheck(this, Max);

	        return _possibleConstructorReturn(this, (Max.__proto__ || Object.getPrototypeOf(Max)).call(this, function (a, b) {
	            return a > b;
	        }));
	    }

	    return Max;
	}(Compare);

	var Push = function (_Operator3) {
	    _inherits(Push, _Operator3);

	    function Push() {
	        _classCallCheck(this, Push);

	        var _this6 = _possibleConstructorReturn(this, (Push.__proto__ || Object.getPrototypeOf(Push)).call(this));

	        _this6._value = [];
	        return _this6;
	    }

	    _createClass(Push, [{
	        key: 'add',
	        value: function add(value) {
	            this._value.push(value);
	        }
	    }]);

	    return Push;
	}(Operator);

	var AddToSet = function (_Operator4) {
	    _inherits(AddToSet, _Operator4);

	    function AddToSet() {
	        _classCallCheck(this, AddToSet);

	        var _this7 = _possibleConstructorReturn(this, (AddToSet.__proto__ || Object.getPrototypeOf(AddToSet)).call(this));

	        _this7._hashes = {};
	        return _this7;
	    }

	    _createClass(AddToSet, [{
	        key: 'add',
	        value: function add(value) {
	            this._hashes[hashify(value)] = value;
	        }
	    }, {
	        key: 'value',
	        get: function get() {
	            var docs = [];

	            for (var hash in this._hashes) {
	                docs.push(this._hashes[hash]);
	            }

	            return docs;
	        }
	    }], [{
	        key: 'getNoRefsSteps',
	        value: function getNoRefsSteps(steps) {
	            return steps.in_end;
	        }
	    }]);

	    return AddToSet;
	}(Operator);

	var runSteps = function runSteps(steps) {
	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	    }

	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	        for (var _iterator = steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var fn = _step.value;
	            fn.apply(undefined, args);
	        }
	    } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	            }
	        } finally {
	            if (_didIteratorError) {
	                throw _iteratorError;
	            }
	        }
	    }
	};

	var runInEnd = function runInEnd(in_end, groups) {
	    var _iteratorNormalCompletion2 = true;
	    var _didIteratorError2 = false;
	    var _iteratorError2 = undefined;

	    try {
	        for (var _iterator2 = groups[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	            var group_doc = _step2.value;

	            runSteps(in_end, group_doc);
	        }
	    } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                _iterator2.return();
	            }
	        } finally {
	            if (_didIteratorError2) {
	                throw _iteratorError2;
	            }
	        }
	    }
	};

	var groupLoopFn = function groupLoopFn(next, in_end, groups, fn) {
	    return function (cb) {
	        var done = function done(error) {
	            if (!error) {
	                runInEnd(in_end, groups);
	            }

	            cb(error, groups);
	        };

	        (function iterate() {
	            next(function (error, doc) {
	                if (!doc) {
	                    return done(error);
	                }

	                fn(doc);
	                iterate();
	            });
	        })();
	    };
	};

	var createGroupByRefFn = function createGroupByRefFn(next, expr, steps) {
	    var in_start = steps.in_start,
	        in_iter = steps.in_iter,
	        in_end = steps.in_end;

	    var groups = [];

	    var add = memoize(function (_id_hash, _id) {
	        var group_doc = { _id: _id };

	        groups.push(group_doc);
	        runSteps(in_start, group_doc);

	        return group_doc;
	    }, { length: 1 });

	    var ast = expr.ast;

	    var _idFn = function _idFn(doc) {
	        return ast.run(new Fields(doc));
	    };

	    var onDoc = void 0;

	    if (in_iter.length) {
	        onDoc = function onDoc(doc) {
	            var _id = _idFn(doc);
	            var group_doc = add(hashify(_id), _id);

	            runSteps(in_iter, group_doc, doc);
	        };
	    } else {
	        onDoc = function onDoc(doc) {
	            var _id = _idFn(doc);

	            add(hashify(_id), _id);
	        };
	    }

	    return groupLoopFn(next, in_end, groups, onDoc);
	};

	var createGroupFn = function createGroupFn(next, expr, steps) {
	    if (expr.has_refs) {
	        return createGroupByRefFn(next, expr, steps);
	    }

	    var in_start = steps.in_start,
	        in_iter = steps.in_iter,
	        in_end = steps.in_end;

	    var groups = [];

	    var initGroupDoc = function initGroupDoc() {
	        var group_doc = { _id: expr.ast.run() };

	        runSteps(in_start, group_doc);
	        groups.push(group_doc);

	        return group_doc;
	    };

	    if (in_iter.length) {
	        var add = memoize(function () {
	            return initGroupDoc();
	        });

	        return groupLoopFn(next, in_end, groups, function (doc) {
	            runSteps(in_iter, add(), doc);
	        });
	    }

	    return function (cb) {
	        next(function (error, doc) {
	            if (doc) {
	                initGroupDoc();

	                runInEnd(in_end, groups);
	            }

	            cb(error, groups);
	        });
	    };
	};

	var ops = {
	    $sum: Sum,
	    $avg: Avg,
	    $min: Min,
	    $max: Max,
	    $push: Push,
	    $addToSet: AddToSet
	};

	var _build = function _build(steps, field, value) {
	    var in_start = steps.in_start,
	        in_iter = steps.in_iter,
	        in_end = steps.in_end;

	    var op_strs = Object.keys(value);

	    if (op_strs.length > 1) {
	        throw Error('fields must have only one operator');
	    }

	    var op_str = op_strs[0],
	        Op = ops[op_str];

	    if (!Op) {
	        if (op_str[0] === '$') {
	            unknownOp(op_str);
	        }

	        throw Error('unexpected field \'' + op_str + '\'');
	    }

	    var expr = build(value[op_str]);

	    in_start.push(function (group_doc) {
	        group_doc[field] = new Op(expr);
	    });

	    if (expr.has_refs) {
	        in_iter.push(function (group_doc, doc) {
	            var fields = new Fields(doc);
	            if (!fields.ensure(expr.paths)) {
	                return;
	            }

	            var op = group_doc[field],
	                _expr = Object.assign({ fields: fields }, expr),
	                add = function add(value) {
	                return op.add(value);
	            };

	            op.getOpValueWithRefs(_expr, doc, add);
	        });
	    } else {
	        Op.getOpValue(expr, function (value) {
	            Op.getNoRefsSteps(steps).push(function (group_doc) {
	                group_doc[field].add(value);
	            });
	        });
	    }

	    in_end.push(function (group_doc) {
	        group_doc[field] = group_doc[field].value;
	    });
	};

	module.exports = function (_next, spec) {
	    if (!spec.hasOwnProperty('_id')) {
	        throw Error("the '_id' field is missing");
	    }

	    var expr = build(spec._id);
	    var new_spec = Object.assign({}, spec);

	    delete new_spec._id;

	    var steps = {
	        in_start: [],
	        in_iter: [],
	        in_end: []
	    };

	    for (var field in new_spec) {
	        _build(steps, field, new_spec[field]);
	    }

	    var group = createGroupFn(_next, expr, steps);

	    var _next2 = function next(cb) {
	        group(function (error, groups) {
	            if (error) {
	                cb(error);
	            } else {
	                (_next2 = function next(cb) {
	                    return cb(null, groups.pop());
	                })(cb);
	            }
	        });
	    };

	    return function (cb) {
	        return _next2(cb);
	    };
	};

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var _require = __webpack_require__(7),
	    toPathPieces = _require.toPathPieces,
	    get = _require.get;

	module.exports = function (_next, path) {
	    var path_pieces = toPathPieces(path.substring(1)),
	        elements = [],
	        fn = function fn(cb) {
	        return cb(null, elements.pop());
	    };

	    var onDoc = function onDoc(doc, cb) {
	        var old_length = elements.length;

	        get(doc, path_pieces, function (obj, field) {
	            var new_elements = obj[field];
	            if (!new_elements) {
	                return;
	            }

	            if (new_elements[Symbol.iterator]) {
	                var _iteratorNormalCompletion = true;
	                var _didIteratorError = false;
	                var _iteratorError = undefined;

	                try {
	                    for (var _iterator = new_elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                        var element = _step.value;

	                        elements.push(_defineProperty({}, field, element));
	                    }
	                } catch (err) {
	                    _didIteratorError = true;
	                    _iteratorError = err;
	                } finally {
	                    try {
	                        if (!_iteratorNormalCompletion && _iterator.return) {
	                            _iterator.return();
	                        }
	                    } finally {
	                        if (_didIteratorError) {
	                            throw _iteratorError;
	                        }
	                    }
	                }
	            }
	        });

	        if (old_length === elements.length) {
	            return _next2(cb);
	        }

	        fn(cb);
	    };

	    var _next2 = function next(cb) {
	        _next(function (error, doc) {
	            if (error) {
	                cb(error);
	            } else if (doc) {
	                onDoc(doc, cb);
	            } else {
	                (_next2 = fn)(cb);
	            }
	        });
	    };

	    return function (cb) {
	        return _next2(cb);
	    };
	};

/***/ }),
/* 91 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = function (_next, num) {
	    var count = 0;

	    var next = function next(cb) {
	        _next(function (error, doc) {
	            if (!doc) {
	                cb(error);
	            } else if (++count > num) {
	                cb(null, doc);
	            } else {
	                next(cb);
	            }
	        });
	    };

	    return next;
	};

/***/ }),
/* 92 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = function (_next, num) {
	    var count = 0;

	    var next = function next(cb) {
	        if (count++ < num) {
	            _next(cb);
	        } else {
	            cb();
	        }
	    };

	    return next;
	};

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _require = __webpack_require__(7),
	    unknownOp = _require.unknownOp;

	var Cursor = __webpack_require__(15);

	var ops = {
	    $match: function $match(cur, doc) {
	        return cur.filter(doc);
	    },
	    $project: function $project(cur, spec) {
	        return cur.project(spec);
	    },
	    $group: function $group(cur, spec) {
	        return cur.group(spec);
	    },
	    $unwind: function $unwind(cur, path) {
	        return cur.unwind(path);
	    },
	    $sort: function $sort(cur, spec) {
	        return cur.sort(spec);
	    },
	    $skip: function $skip(cur, num) {
	        return cur.skip(num);
	    },
	    $limit: function $limit(cur, num) {
	        return cur.limit(num);
	    }
	};

	var getStageObject = function getStageObject(doc) {
	    var op_keys = Object.keys(doc);

	    if (op_keys.length > 1) {
	        throw Error('stages must be passed only one operator');
	    }

	    var op_key = op_keys[0],
	        fn = ops[op_key];

	    if (!fn) {
	        unknownOp(op_key);
	    }

	    return [fn, doc[op_key]];
	};

	var aggregate = function aggregate(col, pipeline) {
	    var cur = new Cursor(col, 'readonly');

	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	        for (var _iterator = pipeline[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var doc = _step.value;

	            var _getStageObject = getStageObject(doc),
	                _getStageObject2 = _slicedToArray(_getStageObject, 2),
	                fn = _getStageObject2[0],
	                arg = _getStageObject2[1];

	            fn(cur, arg);
	        }
	    } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	            }
	        } finally {
	            if (_didIteratorError) {
	                throw _iteratorError;
	            }
	        }
	    }

	    return cur;
	};

	module.exports = aggregate;

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(7),
	    toPathPieces = _require.toPathPieces,
	    get = _require.get,
	    set = _require.set,
	    modify = _require.modify,
	    remove1 = _require.remove1,
	    rename = _require.rename,
	    unknownOp = _require.unknownOp,
	    getIDBError = _require.getIDBError;

	var $set = function $set(path_pieces, value) {
	    return function (doc) {
	        set(doc, path_pieces, value);
	    };
	};

	var $unset = function $unset(path_pieces) {
	    return function (doc) {
	        return remove1(doc, path_pieces);
	    };
	};

	var $rename = function $rename(path_pieces, new_name) {
	    return function (doc) {
	        rename(doc, path_pieces, new_name);
	    };
	};

	var modifyOp = function modifyOp(path_pieces, update, init) {
	    return function (doc) {
	        modify(doc, path_pieces, update, init);
	    };
	};

	var arithOp = function arithOp(fn) {
	    return function (path_pieces, value1) {
	        var update = function update(obj, field) {
	            var value2 = obj[field];

	            if (typeof value2 === 'number') {
	                obj[field] = fn(value1, value2);
	            }
	        };

	        var init = function init(obj, field) {
	            return obj[field] = 0;
	        };

	        return modifyOp(path_pieces, update, init);
	    };
	};

	var $inc = arithOp(function (a, b) {
	    return a + b;
	});
	var $mul = arithOp(function (a, b) {
	    return a * b;
	});

	var compareOp = function compareOp(fn) {
	    return function (path_pieces, value) {
	        var update = function update(obj, field) {
	            if (fn(value, obj[field])) {
	                obj[field] = value;
	            }
	        };

	        var init = function init(obj, field) {
	            return obj[field] = value;
	        };

	        return modifyOp(path_pieces, update, init);
	    };
	};

	var $min = compareOp(function (a, b) {
	    return a < b;
	});
	var $max = compareOp(function (a, b) {
	    return a > b;
	});

	var $push = function $push(path_pieces, value) {
	    var update = function update(obj, field) {
	        var elements = obj[field];

	        if (Array.isArray(elements)) {
	            elements.push(value);
	        }
	    };

	    var init = function init(obj, field) {
	        return obj[field] = [value];
	    };

	    return modifyOp(path_pieces, update, init);
	};

	var $pop = function $pop(path_pieces, direction) {
	    var pop = void 0;

	    if (direction < 1) {
	        pop = function pop(e) {
	            return e.shift();
	        };
	    } else {
	        pop = function pop(e) {
	            return e.pop();
	        };
	    }

	    return function (doc) {
	        get(doc, path_pieces, function (obj, field) {
	            var elements = obj[field];

	            if (Array.isArray(elements)) {
	                pop(elements);
	            }
	        });
	    };
	};

	var ops = {
	    $set: $set,
	    $unset: $unset,
	    $rename: $rename,
	    $inc: $inc,
	    $mul: $mul,
	    $min: $min,
	    $max: $max,
	    $push: $push,
	    $pop: $pop
	};

	var build = function build(steps, field, value) {
	    if (field[0] !== '$') {
	        return steps.push($set(toPathPieces(field), value));
	    }

	    var op = ops[field];
	    if (!op) {
	        unknownOp(field);
	    }

	    for (var path in value) {
	        steps.push(op(toPathPieces(path), value[path]));
	    }
	};

	module.exports = function (cur, spec, cb) {
	    var steps = [];

	    for (var field in spec) {
	        build(steps, field, spec[field]);
	    }

	    if (!steps.length) {
	        return cb(null);
	    }

	    (function iterate() {
	        cur._next(function (error, doc, idb_cur) {
	            if (!doc) {
	                return cb(error);
	            }

	            var _iteratorNormalCompletion = true;
	            var _didIteratorError = false;
	            var _iteratorError = undefined;

	            try {
	                for (var _iterator = steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                    var fn = _step.value;
	                    fn(doc);
	                }
	            } catch (err) {
	                _didIteratorError = true;
	                _iteratorError = err;
	            } finally {
	                try {
	                    if (!_iteratorNormalCompletion && _iterator.return) {
	                        _iterator.return();
	                    }
	                } finally {
	                    if (_didIteratorError) {
	                        throw _iteratorError;
	                    }
	                }
	            }

	            var idb_req = idb_cur.update(doc);

	            idb_req.onsuccess = iterate;
	            idb_req.onerror = function (e) {
	                return cb(getIDBError(e));
	            };
	        });
	    })();
	};

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(7),
	    getIDBError = _require.getIDBError;

	module.exports = function (cur, cb) {
	    (function iterate() {
	        cur._next(function (error, doc, idb_cur) {
	            if (!doc) {
	                return cb(error);
	            }

	            var idb_req = idb_cur.delete();

	            idb_req.onsuccess = iterate;
	            idb_req.onerror = function (e) {
	                return cb(getIDBError(e));
	            };
	        });
	    })();
	};

/***/ })
/******/ ])
});
;
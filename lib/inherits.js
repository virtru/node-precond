/**
 * Inherit prototype properties
 * @param {Function} ctor
 * @param {Function} superCtor
 */
module.exports = function() {
  function Noop(){}

  function ecma3(ctor, superCtor) {
    Noop.prototype = superCtor.prototype;
    ctor.prototype = new Noop();
    ctor.prototype.constructor = superCtor;
  }

  function ecma5(ctor, superCtor) {
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: { value: ctor, enumerable: false }
    });
  }

  return Object.create ? ecma5 : ecma3;
}();
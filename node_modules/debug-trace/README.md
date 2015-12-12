# debug-trace

This fork of console-trace adds the following features:
 * work with callsite >= version 1.0.0
 * work with https://github.com/visionmedia/debug 
 (and print the caller of debug instead of console)
 * provide an easy to override formatting function `console.format` e.g.:

```javascript
  // overridable console string prefix formatting function
  console.format = function(c) {
    return c.date + ": " +  c.method + " [" + c.filename + ":" + c.getLineNumber() + "] " + c.functionName;
  }
```

## Available methods from [V8 JavaScript stack trace API](https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi)
 * getThis: returns the value of this
 * getTypeName: returns the type of this as a string. This is the name of the function stored in the constructor field of this, if available, otherwise the object's [[Class]] internal property.
 * getFunction: returns the current function
 * getFunctionName: returns the name of the current function, typically its name property. If a name property is not available an attempt will be made to try to infer a name from the function's context.
 * getMethodName: returns the name of the property of this or one of its prototypes that holds the current function
 * getFileName: if this function was defined in a script returns the name of the script
 * getLineNumber: if this function was defined in a script returns the current line number
 * getColumnNumber: if this function was defined in a script returns the current column number
 * getEvalOrigin: if this function was created using a call to eval returns a CallSite object representing the location where eval was called
 * isToplevel: is this a toplevel invocation, that is, is this the global object?
 * isEval: does this call take place in code defined by a call to eval?
 * isNative: is this call in native V8 code?
 * isConstructor: is this a constructor call?

## Added properties
  * filename: getFileName without the base path: console.traceOptions.cwd
  * method: console method name like `log`, `error` ect.
  * functionName: call.getFunctionName() || 'anonymous'
  * date: actual date formatted with moment().format(console.traceOptions.dateFormat)



Extends the native Node.JS `console` object to prefix logging functions
with the [CallSite](http://github.com/visionmedia/callsite) information.

To read more about runtime stack trace introspection you can refer to [this
article](http://www.devthought.com/2011/12/22/a-string-is-not-an-error/#beyond).

![](http://f.cl.ly/items/1T2K0H0i2H2J0C3q3H2u/console-trace.png)

## Installation

    $ npm install debug-trace

### Syntax:

```javascript
require('debug-trace')([options])
```

### Available Options:

* __always__ - (`Boolean`: defaults to false) always print the callsite info even without accessing methods from the `t` or `traced` getters.
* __cwd__ - (`String`: defaults to `process.cwd()`) the path that will be stripped from the callsite info
* __colors__ - (`Boolean|Object`: defaults to `undefined`) terminal colors support flag or a custom color object
* __right__ - (`Boolean`: defaults to false) callsite alignment flag, when true prints infos on the right
* __dateFormat__ - (`String`: defaults to 'YYYY.MM.DD HH:mm:ss.SSS') date time format with `moment().format(...)`

### Examples:

```javascript
require('debug-trace')
```

You can add the `t` or `traced` getter to your calls to obtain a stacktrace:

```javascript
console.t.log('a');
console.traced.log('a');
```

You can also make every console call trace:

```javascript
require('debug-trace')({
  always: true,
})

...

console.log('a');     // tracing
console.error('a');   // tracing
```

You can align the callsite infos to the right

```javascript
require('debug-trace')({
  always: true,
  right: true
})

...

console.log('a');     // tracing right
console.error('a');   // tracing right
```

You can change defaults colors too

```javascript
require('./debug-trace')({
  always: true,
  colors: {
    warn: '35',
    info: '32'
  }
})

...

console.warn('a');    // magenta
console.info('a');    // green
```

To customize the string that's prefixed to the calls, override the
`console.traceFormat` function.

## Beyond console
If you have more sophisticated logging needs, or don't wish to extend
`console`, I suggest you look at [tracer](https://github.com/baryon/tracer).

## Credits
I only added some functionality to the original console-trace:

  * [Guillermo Rauch](https://github.com/guille)
  * [Kilian Ciuffolo](https://github.com/kilianc)
  * [Nicholas Manousos](https://github.com/nmanousos)  

## License 
MIT License
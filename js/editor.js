/*!
 * Platform.js v1.3.0 <http://mths.be/platform>
 * Copyright 2010-2015 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object` */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object */
  var oldRoot = root;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Opera regexp */
  var reOpera = /\bOpera/;

  /** Possible global object */
  var thisBinding = this;

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // platform tokens defined at
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '6.4':  '10',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // detect Windows version from platform tokens
    if (pattern && label && /^Win/i.test(os) &&
        (data = data[0/*Opera 9.25 fix*/, /[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // correct character case and cleanup
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object */
    var context = root;

    /** Used to flag when a custom context is provided */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // juggle arguments
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object */
    var nav = context.navigator || {};

    /** Browser user agent string */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope] */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environment */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based)
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]` */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime */
    var data;

    /** The CPU architecture */
    var arch = ua;

    /** Platform description array */
    var description = [];

    /** Platform alpha/beta indicator */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform */
    var useFeatures = ua == userAgent;

    /** The browser/environment version */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important) */
    var layout = getLayout([
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important) */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      'Midori',
      'Nook Browser',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      'Sunrise',
      'Swiftfox',
      'WebPositive',
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chrome',
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important) */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nook',
      'PlayBook',
      'PlayStation 4',
      'PlayStation 3',
      'PlayStation Vita',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation 4': 1, 'PlayStation 3': 1, 'PlayStation Vita': 1 }
    });

    /* Detectable OSes (order is important) */
    var os = getOS([
      'Windows Phone ',
      'Android',
      'CentOS',
      'Debian',
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // lookup the manufacturer by product or scan the UA for the manufacturer
        return result || (
          value[product] ||
          value[0/*Opera 9.25 fix*/, /^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // split by forward slash and append product version if needed
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // correct character case and cleanup
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // convert layout to an array so we can add extra details
    layout && (layout = [layout]);

    // detect product names that contain their manufacturer's name
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    }
    // clean up Google TV
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // detect simulators
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // detect iOS
    if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // detect Kubuntu
    else if (name == 'Konqueror' && !/buntu/i.test(os)) {
      os = 'Kubuntu';
    }
    // detect Android browsers
    else if (manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // detect false positives for Firefox/Safari
    else if (!name || (data = !/\bMinefield\b|\(Android;/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // escape the `/` for Firefox 1
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // clear name of false positives
        name = null;
      }
      // reassign a generic name
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // detect Firefox OS
    if ((data = /\((Mobile|Tablet).*?Firefox\b/i.exec(ua)) && data[1]) {
      os = 'Firefox OS';
      if (!product) {
        product = data[1];
      }
    }
    // detect non-Opera versions (order is important)
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|Silk(?!/[\\d.]+$))',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // detect stubborn layout engines
    if (layout == 'iCab' && parseFloat(version) > 3) {
      layout = ['WebKit'];
    } else if (
        layout != 'Trident' &&
        (data =
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident')
        )
    ) {
      layout = [data];
    }
    // detect NetFront on PlayStation
    else if (/\bPlayStation\b(?! Vita\b)/i.test(name) && layout == 'WebKit') {
      layout = ['NetFront'];
    }
    // detect Windows Phone 7 desktop mode
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // detect Windows Phone 8+ desktop mode
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8+';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // detect IE 11 and above
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (!/\bWPDesktop\b/i.test(ua)) {
        if (name) {
          description.push('identifying as ' + name + (version ? ' ' + version : ''));
        }
        name = 'IE';
      }
      version = data[1];
    }
    // detect IE Tech Preview
    else if ((name == 'Chrome' || name != 'IE') && (data = /\bEdge\/([\d.]+)/.exec(ua))) {
      name = 'IE';
      version = data[1];
      layout = ['Trident'];
      description.unshift('platform preview');
    }
    // leverage environment features
    if (useFeatures) {
      // detect server-side environments
      // Rhino has a global function while others have a global object
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (isModuleScope && isHostType(context, 'system') && (data = [context.system])[0]) {
          os || (os = data[0].os || null);
          try {
            data[1] = context.require('ringo/engine').version;
            version = data[1].join('.');
            name = 'RingoJS';
          } catch(e) {
            if (data[0].global.system == context.system) {
              name = 'Narwhal';
            }
          }
        }
        else if (typeof context.process == 'object' && (data = context.process)) {
          name = 'Node.js';
          arch = data.arch;
          os = data.platform;
          version = /[\d.]+/.exec(data.version)[0];
        }
        else if (rhino) {
          name = 'Rhino';
        }
      }
      // detect Adobe AIR
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // detect PhantomJS
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // detect IE compatibility modes
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // we're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      os = os && format(os);
    }
    // detect prerelease phases
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // detect Firefox Mobile
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // obscure Maxthon's unreliable version
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // detect Silk desktop/accelerated modes
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // detect Xbox 360 and Xbox One
    else if (/\bXbox\b/i.test(product)) {
      os = null;
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // add mobile postfix
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // detect IE platform preview
    else if (name == 'IE' && useFeatures && context.external === null) {
      description.unshift('platform preview');
    }
    // detect BlackBerry OS version
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // detect Opera identifying/masking itself as another browser
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && (
          product != 'Wii' && (
            (useFeatures && opera) ||
            (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
            (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
            (name == 'IE' && (
              (os && !/^Win/.test(os) && version > 5.5) ||
              /\bWindows XP\b/.test(os) && version > 8 ||
              version == 8 && !/\bTrident\b/.test(ua)
            ))
          )
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {

      // when "indentifying", the UA contains both Opera and the other browser's name
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // when "masking", the UA contains only the other browser's name
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // detect WebKit Nightly and approximate Chrome/Safari versions
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // correct build for numeric comparison
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // nightly builds are postfixed with a `+`
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // clear incorrect browser versions
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // use the full Chrome version when available
      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // detect Blink layout engine
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && name != 'IE') {
        layout = ['Blink'];
      }
      // detect JavaScriptCore
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // add the postfix of ".x" or "+" for approximate versions
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // obscure version for some Safari 1-2 releases
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    }
    // detect Opera desktop modes
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // detect Chrome desktop mode
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // strip incorrect OS versions
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // add layout engine
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Sleipnir|Web)/.test(name) && layout[1])) {
      // don't add layout details to description if they are falsey
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // combine contextual information
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // append manufacturer
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // append product
    if (product) {
      description.push((/^on /.test(description[description.length -1]) ? '' : 'on ') + product);
    }
    // parse OS into an object
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // add browser/OS architecture
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // export platform
  // some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as an anonymous module so, through path mapping, it can be aliased
    define(function() {
      return parse();
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Narwhal, Node.js, Rhino -require, or RingoJS
    forOwn(parse(), function(value, key) {
      freeExports[key] = value;
    });
  }
  // in a browser or Rhino
  else {
    root.platform = parse();
  }
}.call(this));
/**
 * StyleFix 1.0.3 & PrefixFree 1.0.7
 * @author Lea Verou
 * MIT license
 */(function(){function t(e,t){return[].slice.call((t||document).querySelectorAll(e))}if(!window.addEventListener)return;var e=window.StyleFix={link:function(t){try{if(t.rel!=="stylesheet"||t.hasAttribute("data-noprefix"))return}catch(n){return}var r=t.href||t.getAttribute("data-href"),i=r.replace(/[^\/]+$/,""),s=(/^[a-z]{3,10}:/.exec(i)||[""])[0],o=(/^[a-z]{3,10}:\/\/[^\/]+/.exec(i)||[""])[0],u=/^([^?]*)\??/.exec(r)[1],a=t.parentNode,f=new XMLHttpRequest,l;f.onreadystatechange=function(){f.readyState===4&&l()};l=function(){var n=f.responseText;if(n&&t.parentNode&&(!f.status||f.status<400||f.status>600)){n=e.fix(n,!0,t);if(i){n=n.replace(/url\(\s*?((?:"|')?)(.+?)\1\s*?\)/gi,function(e,t,n){return/^([a-z]{3,10}:|#)/i.test(n)?e:/^\/\//.test(n)?'url("'+s+n+'")':/^\//.test(n)?'url("'+o+n+'")':/^\?/.test(n)?'url("'+u+n+'")':'url("'+i+n+'")'});var r=i.replace(/([\\\^\$*+[\]?{}.=!:(|)])/g,"\\$1");n=n.replace(RegExp("\\b(behavior:\\s*?url\\('?\"?)"+r,"gi"),"$1")}var l=document.createElement("style");l.textContent=n;l.media=t.media;l.disabled=t.disabled;l.setAttribute("data-href",t.getAttribute("href"));a.insertBefore(l,t);a.removeChild(t);l.media=t.media}};try{f.open("GET",r);f.send(null)}catch(n){if(typeof XDomainRequest!="undefined"){f=new XDomainRequest;f.onerror=f.onprogress=function(){};f.onload=l;f.open("GET",r);f.send(null)}}t.setAttribute("data-inprogress","")},styleElement:function(t){if(t.hasAttribute("data-noprefix"))return;var n=t.disabled;t.textContent=e.fix(t.textContent,!0,t);t.disabled=n},styleAttribute:function(t){var n=t.getAttribute("style");n=e.fix(n,!1,t);t.setAttribute("style",n)},process:function(){t('link[rel="stylesheet"]:not([data-inprogress])').forEach(StyleFix.link);t("style").forEach(StyleFix.styleElement);t("[style]").forEach(StyleFix.styleAttribute)},register:function(t,n){(e.fixers=e.fixers||[]).splice(n===undefined?e.fixers.length:n,0,t)},fix:function(t,n,r){for(var i=0;i<e.fixers.length;i++)t=e.fixers[i](t,n,r)||t;return t},camelCase:function(e){return e.replace(/-([a-z])/g,function(e,t){return t.toUpperCase()}).replace("-","")},deCamelCase:function(e){return e.replace(/[A-Z]/g,function(e){return"-"+e.toLowerCase()})}};(function(){setTimeout(function(){t('link[rel="stylesheet"]').forEach(StyleFix.link)},10);document.addEventListener("DOMContentLoaded",StyleFix.process,!1)})()})();(function(e){function t(e,t,r,i,s){e=n[e];if(e.length){var o=RegExp(t+"("+e.join("|")+")"+r,"gi");s=s.replace(o,i)}return s}if(!window.StyleFix||!window.getComputedStyle)return;var n=window.PrefixFree={prefixCSS:function(e,r,i){var s=n.prefix;n.functions.indexOf("linear-gradient")>-1&&(e=e.replace(/(\s|:|,)(repeating-)?linear-gradient\(\s*(-?\d*\.?\d*)deg/ig,function(e,t,n,r){return t+(n||"")+"linear-gradient("+(90-r)+"deg"}));e=t("functions","(\\s|:|,)","\\s*\\(","$1"+s+"$2(",e);e=t("keywords","(\\s|:)","(\\s|;|\\}|$)","$1"+s+"$2$3",e);e=t("properties","(^|\\{|\\s|;)","\\s*:","$1"+s+"$2:",e);if(n.properties.length){var o=RegExp("\\b("+n.properties.join("|")+")(?!:)","gi");e=t("valueProperties","\\b",":(.+?);",function(e){return e.replace(o,s+"$1")},e)}if(r){e=t("selectors","","\\b",n.prefixSelector,e);e=t("atrules","@","\\b","@"+s+"$1",e)}e=e.replace(RegExp("-"+s,"g"),"-");e=e.replace(/-\*-(?=[a-z]+)/gi,n.prefix);return e},property:function(e){return(n.properties.indexOf(e)>=0?n.prefix:"")+e},value:function(e,r){e=t("functions","(^|\\s|,)","\\s*\\(","$1"+n.prefix+"$2(",e);e=t("keywords","(^|\\s)","(\\s|$)","$1"+n.prefix+"$2$3",e);n.valueProperties.indexOf(r)>=0&&(e=t("properties","(^|\\s|,)","($|\\s|,)","$1"+n.prefix+"$2$3",e));return e},prefixSelector:function(e){return e.replace(/^:{1,2}/,function(e){return e+n.prefix})},prefixProperty:function(e,t){var r=n.prefix+e;return t?StyleFix.camelCase(r):r}};(function(){var e={},t=[],r={},i=getComputedStyle(document.documentElement,null),s=document.createElement("div").style,o=function(n){if(n.charAt(0)==="-"){t.push(n);var r=n.split("-"),i=r[1];e[i]=++e[i]||1;while(r.length>3){r.pop();var s=r.join("-");u(s)&&t.indexOf(s)===-1&&t.push(s)}}},u=function(e){return StyleFix.camelCase(e)in s};if(i.length>0)for(var a=0;a<i.length;a++)o(i[a]);else for(var f in i)o(StyleFix.deCamelCase(f));var l={uses:0};for(var c in e){var h=e[c];l.uses<h&&(l={prefix:c,uses:h})}n.prefix="-"+l.prefix+"-";n.Prefix=StyleFix.camelCase(n.prefix);n.properties=[];for(var a=0;a<t.length;a++){var f=t[a];if(f.indexOf(n.prefix)===0){var p=f.slice(n.prefix.length);u(p)||n.properties.push(p)}}n.Prefix=="Ms"&&!("transform"in s)&&!("MsTransform"in s)&&"msTransform"in s&&n.properties.push("transform","transform-origin");n.properties.sort()})();(function(){function i(e,t){r[t]="";r[t]=e;return!!r[t]}var e={"linear-gradient":{property:"backgroundImage",params:"red, teal"},calc:{property:"width",params:"1px + 5%"},element:{property:"backgroundImage",params:"#foo"},"cross-fade":{property:"backgroundImage",params:"url(a.png), url(b.png), 50%"}};e["repeating-linear-gradient"]=e["repeating-radial-gradient"]=e["radial-gradient"]=e["linear-gradient"];var t={initial:"color","zoom-in":"cursor","zoom-out":"cursor",box:"display",flexbox:"display","inline-flexbox":"display",flex:"display","inline-flex":"display",grid:"display","inline-grid":"display","min-content":"width"};n.functions=[];n.keywords=[];var r=document.createElement("div").style;for(var s in e){var o=e[s],u=o.property,a=s+"("+o.params+")";!i(a,u)&&i(n.prefix+a,u)&&n.functions.push(s)}for(var f in t){var u=t[f];!i(f,u)&&i(n.prefix+f,u)&&n.keywords.push(f)}})();(function(){function s(e){i.textContent=e+"{}";return!!i.sheet.cssRules.length}var t={":read-only":null,":read-write":null,":any-link":null,"::selection":null},r={keyframes:"name",viewport:null,document:'regexp(".")'};n.selectors=[];n.atrules=[];var i=e.appendChild(document.createElement("style"));for(var o in t){var u=o+(t[o]?"("+t[o]+")":"");!s(u)&&s(n.prefixSelector(u))&&n.selectors.push(o)}for(var a in r){var u=a+" "+(r[a]||"");!s("@"+u)&&s("@"+n.prefix+u)&&n.atrules.push(a)}e.removeChild(i)})();n.valueProperties=["transition","transition-property"];e.className+=" "+n.prefix;StyleFix.register(n.prefixCSS)})(document.documentElement);
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// This is CodeMirror (http://codemirror.net), a code editor
// implemented in JavaScript on top of the browser's DOM.
//
// You can find some technical background for some of the code below
// at http://marijnhaverbeke.nl/blog/#cm-internals .

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    module.exports = mod();
  else if (typeof define == "function" && define.amd) // AMD
    return define([], mod);
  else // Plain browser env
    this.CodeMirror = mod();
})(function() {
  "use strict";

  // BROWSER SNIFFING

  // Kludges for bugs and behavior differences that can't be feature
  // detected are enabled based on userAgent etc sniffing.

  var gecko = /gecko\/\d/i.test(navigator.userAgent);
  // ie_uptoN means Internet Explorer version N or lower
  var ie_upto10 = /MSIE \d/.test(navigator.userAgent);
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
  var ie = ie_upto10 || ie_11up;
  var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : ie_11up[1]);
  var webkit = /WebKit\//.test(navigator.userAgent);
  var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(navigator.userAgent);
  var chrome = /Chrome\//.test(navigator.userAgent);
  var presto = /Opera\//.test(navigator.userAgent);
  var safari = /Apple Computer/.test(navigator.vendor);
  var khtml = /KHTML\//.test(navigator.userAgent);
  var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(navigator.userAgent);
  var phantom = /PhantomJS/.test(navigator.userAgent);

  var ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
  // This is woefully incomplete. Suggestions for alternative methods welcome.
  var mobile = ios || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent);
  var mac = ios || /Mac/.test(navigator.platform);
  var windows = /win/i.test(navigator.platform);

  var presto_version = presto && navigator.userAgent.match(/Version\/(\d*\.\d*)/);
  if (presto_version) presto_version = Number(presto_version[1]);
  if (presto_version && presto_version >= 15) { presto = false; webkit = true; }
  // Some browsers use the wrong event properties to signal cmd/ctrl on OS X
  var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
  var captureRightClick = gecko || (ie && ie_version >= 9);

  // Optimize some code when these features are not used.
  var sawReadOnlySpans = false, sawCollapsedSpans = false;

  // EDITOR CONSTRUCTOR

  // A CodeMirror instance represents an editor. This is the object
  // that user code is usually dealing with.

  function CodeMirror(place, options) {
    if (!(this instanceof CodeMirror)) return new CodeMirror(place, options);

    this.options = options = options ? copyObj(options) : {};
    // Determine effective options based on given values and defaults.
    copyObj(defaults, options, false);
    setGuttersForLineNumbers(options);

    var doc = options.value;
    if (typeof doc == "string") doc = new Doc(doc, options.mode);
    this.doc = doc;

    var display = this.display = new Display(place, doc);
    display.wrapper.CodeMirror = this;
    updateGutters(this);
    themeChanged(this);
    if (options.lineWrapping)
      this.display.wrapper.className += " CodeMirror-wrap";
    if (options.autofocus && !mobile) focusInput(this);
    initScrollbars(this);

    this.state = {
      keyMaps: [],  // stores maps added by addKeyMap
      overlays: [], // highlighting overlays, as added by addOverlay
      modeGen: 0,   // bumped when mode/overlay changes, used to invalidate highlighting info
      overwrite: false, focused: false,
      suppressEdits: false, // used to disable editing during key handlers when in readOnly mode
      pasteIncoming: false, cutIncoming: false, // help recognize paste/cut edits in readInput
      draggingText: false,
      highlight: new Delayed(), // stores highlight worker timeout
      keySeq: null  // Unfinished key sequence
    };

    // Override magic textarea content restore that IE sometimes does
    // on our hidden textarea on reload
    if (ie && ie_version < 11) setTimeout(bind(resetInput, this, true), 20);

    registerEventHandlers(this);
    ensureGlobalHandlers();

    startOperation(this);
    this.curOp.forceUpdate = true;
    attachDoc(this, doc);

    if ((options.autofocus && !mobile) || activeElt() == display.input)
      setTimeout(bind(onFocus, this), 20);
    else
      onBlur(this);

    for (var opt in optionHandlers) if (optionHandlers.hasOwnProperty(opt))
      optionHandlers[opt](this, options[opt], Init);
    maybeUpdateLineNumberWidth(this);
    for (var i = 0; i < initHooks.length; ++i) initHooks[i](this);
    endOperation(this);
    // Suppress optimizelegibility in Webkit, since it breaks text
    // measuring on line wrapping boundaries.
    if (webkit && options.lineWrapping &&
        getComputedStyle(display.lineDiv).textRendering == "optimizelegibility")
      display.lineDiv.style.textRendering = "auto";
  }

  // DISPLAY CONSTRUCTOR

  // The display handles the DOM integration, both for input reading
  // and content drawing. It holds references to DOM nodes and
  // display-related state.

  function Display(place, doc) {
    var d = this;

    // The semihidden textarea that is focused when the editor is
    // focused, and receives input.
    var input = d.input = elt("textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em; outline: none");
    // The textarea is kept positioned near the cursor to prevent the
    // fact that it'll be scrolled into view on input from scrolling
    // our fake cursor out of view. On webkit, when wrap=off, paste is
    // very slow. So make the area wide instead.
    if (webkit) input.style.width = "1000px";
    else input.setAttribute("wrap", "off");
    // If border: 0; -- iOS fails to open keyboard (issue #1287)
    if (ios) input.style.border = "1px solid black";
    input.setAttribute("autocorrect", "off"); input.setAttribute("autocapitalize", "off"); input.setAttribute("spellcheck", "false");

    // Wraps and hides input textarea
    d.inputDiv = elt("div", [input], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
    // Covers bottom-right square when both scrollbars are present.
    d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
    d.scrollbarFiller.setAttribute("not-content", "true");
    // Covers bottom of gutter when coverGutterNextToScrollbar is on
    // and h scrollbar is present.
    d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
    d.gutterFiller.setAttribute("not-content", "true");
    // Will contain the actual code, positioned to cover the viewport.
    d.lineDiv = elt("div", null, "CodeMirror-code");
    // Elements are added to these to represent selection and cursors.
    d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
    d.cursorDiv = elt("div", null, "CodeMirror-cursors");
    // A visibility: hidden element used to find the size of things.
    d.measure = elt("div", null, "CodeMirror-measure");
    // When lines outside of the viewport are measured, they are drawn in this.
    d.lineMeasure = elt("div", null, "CodeMirror-measure");
    // Wraps everything that needs to exist inside the vertically-padded coordinate system
    d.lineSpace = elt("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv],
                      null, "position: relative; outline: none");
    // Moved around its parent to cover visible view.
    d.mover = elt("div", [elt("div", [d.lineSpace], "CodeMirror-lines")], null, "position: relative");
    // Set to the height of the document, allowing scrolling.
    d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
    d.sizerWidth = null;
    // Behavior of elts with overflow: auto and padding is
    // inconsistent across browsers. This is used to ensure the
    // scrollable area is big enough.
    d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;");
    // Will contain the gutters, if any.
    d.gutters = elt("div", null, "CodeMirror-gutters");
    d.lineGutter = null;
    // Actual scrollable element.
    d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
    d.scroller.setAttribute("tabIndex", "-1");
    // The element in which the editor lives.
    d.wrapper = elt("div", [d.inputDiv, d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror");

    // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)
    if (ie && ie_version < 8) { d.gutters.style.zIndex = -1; d.scroller.style.paddingRight = 0; }
    // Needed to hide big blue blinking cursor on Mobile Safari
    if (ios) input.style.width = "0px";
    if (!webkit) d.scroller.draggable = true;
    // Needed to handle Tab key in KHTML
    if (khtml) { d.inputDiv.style.height = "1px"; d.inputDiv.style.position = "absolute"; }

    if (place) {
      if (place.appendChild) place.appendChild(d.wrapper);
      else place(d.wrapper);
    }

    // Current rendered range (may be bigger than the view window).
    d.viewFrom = d.viewTo = doc.first;
    d.reportedViewFrom = d.reportedViewTo = doc.first;
    // Information about the rendered lines.
    d.view = [];
    d.renderedView = null;
    // Holds info about a single rendered line when it was rendered
    // for measurement, while not in view.
    d.externalMeasured = null;
    // Empty space (in pixels) above the view
    d.viewOffset = 0;
    d.lastWrapHeight = d.lastWrapWidth = 0;
    d.updateLineNumbers = null;

    d.nativeBarWidth = d.barHeight = d.barWidth = 0;
    d.scrollbarsClipped = false;

    // Used to only resize the line number gutter when necessary (when
    // the amount of lines crosses a boundary that makes its width change)
    d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null;
    // See readInput and resetInput
    d.prevInput = "";
    // Set to true when a non-horizontal-scrolling line widget is
    // added. As an optimization, line widget aligning is skipped when
    // this is false.
    d.alignWidgets = false;
    // Flag that indicates whether we expect input to appear real soon
    // now (after some event like 'keypress' or 'input') and are
    // polling intensively.
    d.pollingFast = false;
    // Self-resetting timeout for the poller
    d.poll = new Delayed();

    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;

    // Tracks when resetInput has punted to just putting a short
    // string into the textarea instead of the full selection.
    d.inaccurateSelection = false;

    // Tracks the maximum line length so that the horizontal scrollbar
    // can be kept static when scrolling.
    d.maxLine = null;
    d.maxLineLength = 0;
    d.maxLineChanged = false;

    // Used for measuring wheel scrolling granularity
    d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null;

    // True when shift is held down.
    d.shift = false;

    // Used to track whether anything happened since the context menu
    // was opened.
    d.selForContextMenu = null;
  }

  // STATE UPDATES

  // Used to get the editor into a consistent state again when options change.

  function loadMode(cm) {
    cm.doc.mode = CodeMirror.getMode(cm.options, cm.doc.modeOption);
    resetModeState(cm);
  }

  function resetModeState(cm) {
    cm.doc.iter(function(line) {
      if (line.stateAfter) line.stateAfter = null;
      if (line.styles) line.styles = null;
    });
    cm.doc.frontier = cm.doc.first;
    startWorker(cm, 100);
    cm.state.modeGen++;
    if (cm.curOp) regChange(cm);
  }

  function wrappingChanged(cm) {
    if (cm.options.lineWrapping) {
      addClass(cm.display.wrapper, "CodeMirror-wrap");
      cm.display.sizer.style.minWidth = "";
      cm.display.sizerWidth = null;
    } else {
      rmClass(cm.display.wrapper, "CodeMirror-wrap");
      findMaxLine(cm);
    }
    estimateLineHeights(cm);
    regChange(cm);
    clearCaches(cm);
    setTimeout(function(){updateScrollbars(cm);}, 100);
  }

  // Returns a function that estimates the height of a line, to use as
  // first approximation until the line becomes visible (and is thus
  // properly measurable).
  function estimateHeight(cm) {
    var th = textHeight(cm.display), wrapping = cm.options.lineWrapping;
    var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
    return function(line) {
      if (lineIsHidden(cm.doc, line)) return 0;

      var widgetsHeight = 0;
      if (line.widgets) for (var i = 0; i < line.widgets.length; i++) {
        if (line.widgets[i].height) widgetsHeight += line.widgets[i].height;
      }

      if (wrapping)
        return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th;
      else
        return widgetsHeight + th;
    };
  }

  function estimateLineHeights(cm) {
    var doc = cm.doc, est = estimateHeight(cm);
    doc.iter(function(line) {
      var estHeight = est(line);
      if (estHeight != line.height) updateLineHeight(line, estHeight);
    });
  }

  function themeChanged(cm) {
    cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") +
      cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
    clearCaches(cm);
  }

  function guttersChanged(cm) {
    updateGutters(cm);
    regChange(cm);
    setTimeout(function(){alignHorizontally(cm);}, 20);
  }

  // Rebuild the gutter elements, ensure the margin to the left of the
  // code matches their width.
  function updateGutters(cm) {
    var gutters = cm.display.gutters, specs = cm.options.gutters;
    removeChildren(gutters);
    for (var i = 0; i < specs.length; ++i) {
      var gutterClass = specs[i];
      var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + gutterClass));
      if (gutterClass == "CodeMirror-linenumbers") {
        cm.display.lineGutter = gElt;
        gElt.style.width = (cm.display.lineNumWidth || 1) + "px";
      }
    }
    gutters.style.display = i ? "" : "none";
    updateGutterSpace(cm);
  }

  function updateGutterSpace(cm) {
    var width = cm.display.gutters.offsetWidth;
    cm.display.sizer.style.marginLeft = width + "px";
  }

  // Compute the character length of a line, taking into account
  // collapsed ranges (see markText) that might hide parts, and join
  // other lines onto it.
  function lineLength(line) {
    if (line.height == 0) return 0;
    var len = line.text.length, merged, cur = line;
    while (merged = collapsedSpanAtStart(cur)) {
      var found = merged.find(0, true);
      cur = found.from.line;
      len += found.from.ch - found.to.ch;
    }
    cur = line;
    while (merged = collapsedSpanAtEnd(cur)) {
      var found = merged.find(0, true);
      len -= cur.text.length - found.from.ch;
      cur = found.to.line;
      len += cur.text.length - found.to.ch;
    }
    return len;
  }

  // Find the longest line in the document.
  function findMaxLine(cm) {
    var d = cm.display, doc = cm.doc;
    d.maxLine = getLine(doc, doc.first);
    d.maxLineLength = lineLength(d.maxLine);
    d.maxLineChanged = true;
    doc.iter(function(line) {
      var len = lineLength(line);
      if (len > d.maxLineLength) {
        d.maxLineLength = len;
        d.maxLine = line;
      }
    });
  }

  // Make sure the gutters options contains the element
  // "CodeMirror-linenumbers" when the lineNumbers option is true.
  function setGuttersForLineNumbers(options) {
    var found = indexOf(options.gutters, "CodeMirror-linenumbers");
    if (found == -1 && options.lineNumbers) {
      options.gutters = options.gutters.concat(["CodeMirror-linenumbers"]);
    } else if (found > -1 && !options.lineNumbers) {
      options.gutters = options.gutters.slice(0);
      options.gutters.splice(found, 1);
    }
  }

  // SCROLLBARS

  // Prepare DOM reads needed to update the scrollbars. Done in one
  // shot to minimize update/measure roundtrips.
  function measureForScrollbars(cm) {
    var d = cm.display, gutterW = d.gutters.offsetWidth;
    var docH = Math.round(cm.doc.height + paddingVert(cm.display));
    return {
      clientHeight: d.scroller.clientHeight,
      viewHeight: d.wrapper.clientHeight,
      scrollWidth: d.scroller.scrollWidth, clientWidth: d.scroller.clientWidth,
      viewWidth: d.wrapper.clientWidth,
      barLeft: cm.options.fixedGutter ? gutterW : 0,
      docHeight: docH,
      scrollHeight: docH + scrollGap(cm) + d.barHeight,
      nativeBarWidth: d.nativeBarWidth,
      gutterWidth: gutterW
    };
  }

  function NativeScrollbars(place, scroll, cm) {
    this.cm = cm;
    var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
    var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
    place(vert); place(horiz);

    on(vert, "scroll", function() {
      if (vert.clientHeight) scroll(vert.scrollTop, "vertical");
    });
    on(horiz, "scroll", function() {
      if (horiz.clientWidth) scroll(horiz.scrollLeft, "horizontal");
    });

    this.checkedOverlay = false;
    // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).
    if (ie && ie_version < 8) this.horiz.style.minHeight = this.vert.style.minWidth = "18px";
  }

  NativeScrollbars.prototype = copyObj({
    update: function(measure) {
      var needsH = measure.scrollWidth > measure.clientWidth + 1;
      var needsV = measure.scrollHeight > measure.clientHeight + 1;
      var sWidth = measure.nativeBarWidth;

      if (needsV) {
        this.vert.style.display = "block";
        this.vert.style.bottom = needsH ? sWidth + "px" : "0";
        var totalHeight = measure.viewHeight - (needsH ? sWidth : 0);
        // A bug in IE8 can cause this value to be negative, so guard it.
        this.vert.firstChild.style.height =
          Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px";
      } else {
        this.vert.style.display = "";
        this.vert.firstChild.style.height = "0";
      }

      if (needsH) {
        this.horiz.style.display = "block";
        this.horiz.style.right = needsV ? sWidth + "px" : "0";
        this.horiz.style.left = measure.barLeft + "px";
        var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
        this.horiz.firstChild.style.width =
          (measure.scrollWidth - measure.clientWidth + totalWidth) + "px";
      } else {
        this.horiz.style.display = "";
        this.horiz.firstChild.style.width = "0";
      }

      if (!this.checkedOverlay && measure.clientHeight > 0) {
        if (sWidth == 0) this.overlayHack();
        this.checkedOverlay = true;
      }

      return {right: needsV ? sWidth : 0, bottom: needsH ? sWidth : 0};
    },
    setScrollLeft: function(pos) {
      if (this.horiz.scrollLeft != pos) this.horiz.scrollLeft = pos;
    },
    setScrollTop: function(pos) {
      if (this.vert.scrollTop != pos) this.vert.scrollTop = pos;
    },
    overlayHack: function() {
      var w = mac && !mac_geMountainLion ? "12px" : "18px";
      this.horiz.style.minHeight = this.vert.style.minWidth = w;
      var self = this;
      var barMouseDown = function(e) {
        if (e_target(e) != self.vert && e_target(e) != self.horiz)
          operation(self.cm, onMouseDown)(e);
      };
      on(this.vert, "mousedown", barMouseDown);
      on(this.horiz, "mousedown", barMouseDown);
    },
    clear: function() {
      var parent = this.horiz.parentNode;
      parent.removeChild(this.horiz);
      parent.removeChild(this.vert);
    }
  }, NativeScrollbars.prototype);

  function NullScrollbars() {}

  NullScrollbars.prototype = copyObj({
    update: function() { return {bottom: 0, right: 0}; },
    setScrollLeft: function() {},
    setScrollTop: function() {},
    clear: function() {}
  }, NullScrollbars.prototype);

  CodeMirror.scrollbarModel = {"native": NativeScrollbars, "null": NullScrollbars};

  function initScrollbars(cm) {
    if (cm.display.scrollbars) {
      cm.display.scrollbars.clear();
      if (cm.display.scrollbars.addClass)
        rmClass(cm.display.wrapper, cm.display.scrollbars.addClass);
    }

    cm.display.scrollbars = new CodeMirror.scrollbarModel[cm.options.scrollbarStyle](function(node) {
      cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller);
      on(node, "mousedown", function() {
        if (cm.state.focused) setTimeout(bind(focusInput, cm), 0);
      });
      node.setAttribute("not-content", "true");
    }, function(pos, axis) {
      if (axis == "horizontal") setScrollLeft(cm, pos);
      else setScrollTop(cm, pos);
    }, cm);
    if (cm.display.scrollbars.addClass)
      addClass(cm.display.wrapper, cm.display.scrollbars.addClass);
  }

  function updateScrollbars(cm, measure) {
    if (!measure) measure = measureForScrollbars(cm);
    var startWidth = cm.display.barWidth, startHeight = cm.display.barHeight;
    updateScrollbarsInner(cm, measure);
    for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
      if (startWidth != cm.display.barWidth && cm.options.lineWrapping)
        updateHeightsInViewport(cm);
      updateScrollbarsInner(cm, measureForScrollbars(cm));
      startWidth = cm.display.barWidth; startHeight = cm.display.barHeight;
    }
  }

  // Re-synchronize the fake scrollbars with the actual size of the
  // content.
  function updateScrollbarsInner(cm, measure) {
    var d = cm.display;
    var sizes = d.scrollbars.update(measure);

    d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
    d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";

    if (sizes.right && sizes.bottom) {
      d.scrollbarFiller.style.display = "block";
      d.scrollbarFiller.style.height = sizes.bottom + "px";
      d.scrollbarFiller.style.width = sizes.right + "px";
    } else d.scrollbarFiller.style.display = "";
    if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
      d.gutterFiller.style.display = "block";
      d.gutterFiller.style.height = sizes.bottom + "px";
      d.gutterFiller.style.width = measure.gutterWidth + "px";
    } else d.gutterFiller.style.display = "";
  }

  // Compute the lines that are visible in a given viewport (defaults
  // the the current scroll position). viewport may contain top,
  // height, and ensure (see op.scrollToPos) properties.
  function visibleLines(display, doc, viewport) {
    var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
    top = Math.floor(top - paddingTop(display));
    var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;

    var from = lineAtHeight(doc, top), to = lineAtHeight(doc, bottom);
    // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
    // forces those lines into the viewport (if possible).
    if (viewport && viewport.ensure) {
      var ensureFrom = viewport.ensure.from.line, ensureTo = viewport.ensure.to.line;
      if (ensureFrom < from) {
        from = ensureFrom;
        to = lineAtHeight(doc, heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight);
      } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
        from = lineAtHeight(doc, heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
        to = ensureTo;
      }
    }
    return {from: from, to: Math.max(to, from + 1)};
  }

  // LINE NUMBERS

  // Re-align line numbers and gutter marks to compensate for
  // horizontal scrolling.
  function alignHorizontally(cm) {
    var display = cm.display, view = display.view;
    if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) return;
    var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
    var gutterW = display.gutters.offsetWidth, left = comp + "px";
    for (var i = 0; i < view.length; i++) if (!view[i].hidden) {
      if (cm.options.fixedGutter && view[i].gutter)
        view[i].gutter.style.left = left;
      var align = view[i].alignable;
      if (align) for (var j = 0; j < align.length; j++)
        align[j].style.left = left;
    }
    if (cm.options.fixedGutter)
      display.gutters.style.left = (comp + gutterW) + "px";
  }

  // Used to ensure that the line number gutter is still the right
  // size for the current document size. Returns true when an update
  // is needed.
  function maybeUpdateLineNumberWidth(cm) {
    if (!cm.options.lineNumbers) return false;
    var doc = cm.doc, last = lineNumberFor(cm.options, doc.first + doc.size - 1), display = cm.display;
    if (last.length != display.lineNumChars) {
      var test = display.measure.appendChild(elt("div", [elt("div", last)],
                                                 "CodeMirror-linenumber CodeMirror-gutter-elt"));
      var innerW = test.firstChild.offsetWidth, padding = test.offsetWidth - innerW;
      display.lineGutter.style.width = "";
      display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding);
      display.lineNumWidth = display.lineNumInnerWidth + padding;
      display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
      display.lineGutter.style.width = display.lineNumWidth + "px";
      updateGutterSpace(cm);
      return true;
    }
    return false;
  }

  function lineNumberFor(options, i) {
    return String(options.lineNumberFormatter(i + options.firstLineNumber));
  }

  // Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
  // but using getBoundingClientRect to get a sub-pixel-accurate
  // result.
  function compensateForHScroll(display) {
    return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left;
  }

  // DISPLAY DRAWING

  function DisplayUpdate(cm, viewport, force) {
    var display = cm.display;

    this.viewport = viewport;
    // Store some values that we'll need later (but don't want to force a relayout for)
    this.visible = visibleLines(display, cm.doc, viewport);
    this.editorIsHidden = !display.wrapper.offsetWidth;
    this.wrapperHeight = display.wrapper.clientHeight;
    this.wrapperWidth = display.wrapper.clientWidth;
    this.oldDisplayWidth = displayWidth(cm);
    this.force = force;
    this.dims = getDimensions(cm);
  }

  function maybeClipScrollbars(cm) {
    var display = cm.display;
    if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
      display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
      display.heightForcer.style.height = scrollGap(cm) + "px";
      display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
      display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
      display.scrollbarsClipped = true;
    }
  }

  // Does the actual updating of the line display. Bails out
  // (returning false) when there is nothing to be done and forced is
  // false.
  function updateDisplayIfNeeded(cm, update) {
    var display = cm.display, doc = cm.doc;

    if (update.editorIsHidden) {
      resetView(cm);
      return false;
    }

    // Bail out if the visible area is already rendered and nothing changed.
    if (!update.force &&
        update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo &&
        (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) &&
        display.renderedView == display.view && countDirtyView(cm) == 0)
      return false;

    if (maybeUpdateLineNumberWidth(cm)) {
      resetView(cm);
      update.dims = getDimensions(cm);
    }

    // Compute a suitable new viewport (from & to)
    var end = doc.first + doc.size;
    var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
    var to = Math.min(end, update.visible.to + cm.options.viewportMargin);
    if (display.viewFrom < from && from - display.viewFrom < 20) from = Math.max(doc.first, display.viewFrom);
    if (display.viewTo > to && display.viewTo - to < 20) to = Math.min(end, display.viewTo);
    if (sawCollapsedSpans) {
      from = visualLineNo(cm.doc, from);
      to = visualLineEndNo(cm.doc, to);
    }

    var different = from != display.viewFrom || to != display.viewTo ||
      display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
    adjustView(cm, from, to);

    display.viewOffset = heightAtLine(getLine(cm.doc, display.viewFrom));
    // Position the mover div to align with the current scroll position
    cm.display.mover.style.top = display.viewOffset + "px";

    var toUpdate = countDirtyView(cm);
    if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view &&
        (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo))
      return false;

    // For big changes, we hide the enclosing element during the
    // update, since that speeds up the operations on most browsers.
    var focused = activeElt();
    if (toUpdate > 4) display.lineDiv.style.display = "none";
    patchDisplay(cm, display.updateLineNumbers, update.dims);
    if (toUpdate > 4) display.lineDiv.style.display = "";
    display.renderedView = display.view;
    // There might have been a widget with a focused element that got
    // hidden or updated, if so re-focus it.
    if (focused && activeElt() != focused && focused.offsetHeight) focused.focus();

    // Prevent selection and cursors from interfering with the scroll
    // width and height.
    removeChildren(display.cursorDiv);
    removeChildren(display.selectionDiv);
    display.gutters.style.height = 0;

    if (different) {
      display.lastWrapHeight = update.wrapperHeight;
      display.lastWrapWidth = update.wrapperWidth;
      startWorker(cm, 400);
    }

    display.updateLineNumbers = null;

    return true;
  }

  function postUpdateDisplay(cm, update) {
    var force = update.force, viewport = update.viewport;
    for (var first = true;; first = false) {
      if (first && cm.options.lineWrapping && update.oldDisplayWidth != displayWidth(cm)) {
        force = true;
      } else {
        force = false;
        // Clip forced viewport to actual scrollable area.
        if (viewport && viewport.top != null)
          viewport = {top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)};
        // Updated line heights might result in the drawn area not
        // actually covering the viewport. Keep looping until it does.
        update.visible = visibleLines(cm.display, cm.doc, viewport);
        if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo)
          break;
      }
      if (!updateDisplayIfNeeded(cm, update)) break;
      updateHeightsInViewport(cm);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      setDocumentHeight(cm, barMeasure);
      updateScrollbars(cm, barMeasure);
    }

    signalLater(cm, "update", cm);
    if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
      signalLater(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
      cm.display.reportedViewFrom = cm.display.viewFrom; cm.display.reportedViewTo = cm.display.viewTo;
    }
  }

  function updateDisplaySimple(cm, viewport) {
    var update = new DisplayUpdate(cm, viewport);
    if (updateDisplayIfNeeded(cm, update)) {
      updateHeightsInViewport(cm);
      postUpdateDisplay(cm, update);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      setDocumentHeight(cm, barMeasure);
      updateScrollbars(cm, barMeasure);
    }
  }

  function setDocumentHeight(cm, measure) {
    cm.display.sizer.style.minHeight = measure.docHeight + "px";
    var total = measure.docHeight + cm.display.barHeight;
    cm.display.heightForcer.style.top = total + "px";
    cm.display.gutters.style.height = Math.max(total + scrollGap(cm), measure.clientHeight) + "px";
  }

  // Read the actual heights of the rendered lines, and update their
  // stored heights to match.
  function updateHeightsInViewport(cm) {
    var display = cm.display;
    var prevBottom = display.lineDiv.offsetTop;
    for (var i = 0; i < display.view.length; i++) {
      var cur = display.view[i], height;
      if (cur.hidden) continue;
      if (ie && ie_version < 8) {
        var bot = cur.node.offsetTop + cur.node.offsetHeight;
        height = bot - prevBottom;
        prevBottom = bot;
      } else {
        var box = cur.node.getBoundingClientRect();
        height = box.bottom - box.top;
      }
      var diff = cur.line.height - height;
      if (height < 2) height = textHeight(display);
      if (diff > .001 || diff < -.001) {
        updateLineHeight(cur.line, height);
        updateWidgetHeight(cur.line);
        if (cur.rest) for (var j = 0; j < cur.rest.length; j++)
          updateWidgetHeight(cur.rest[j]);
      }
    }
  }

  // Read and store the height of line widgets associated with the
  // given line.
  function updateWidgetHeight(line) {
    if (line.widgets) for (var i = 0; i < line.widgets.length; ++i)
      line.widgets[i].height = line.widgets[i].node.offsetHeight;
  }

  // Do a bulk-read of the DOM positions and sizes needed to draw the
  // view, so that we don't interleave reading and writing to the DOM.
  function getDimensions(cm) {
    var d = cm.display, left = {}, width = {};
    var gutterLeft = d.gutters.clientLeft;
    for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
      left[cm.options.gutters[i]] = n.offsetLeft + n.clientLeft + gutterLeft;
      width[cm.options.gutters[i]] = n.clientWidth;
    }
    return {fixedPos: compensateForHScroll(d),
            gutterTotalWidth: d.gutters.offsetWidth,
            gutterLeft: left,
            gutterWidth: width,
            wrapperWidth: d.wrapper.clientWidth};
  }

  // Sync the actual display DOM structure with display.view, removing
  // nodes for lines that are no longer in view, and creating the ones
  // that are not there yet, and updating the ones that are out of
  // date.
  function patchDisplay(cm, updateNumbersFrom, dims) {
    var display = cm.display, lineNumbers = cm.options.lineNumbers;
    var container = display.lineDiv, cur = container.firstChild;

    function rm(node) {
      var next = node.nextSibling;
      // Works around a throw-scroll bug in OS X Webkit
      if (webkit && mac && cm.display.currentWheelTarget == node)
        node.style.display = "none";
      else
        node.parentNode.removeChild(node);
      return next;
    }

    var view = display.view, lineN = display.viewFrom;
    // Loop over the elements in the view, syncing cur (the DOM nodes
    // in display.lineDiv) with the view as we go.
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (lineView.hidden) {
      } else if (!lineView.node) { // Not drawn yet
        var node = buildLineElement(cm, lineView, lineN, dims);
        container.insertBefore(node, cur);
      } else { // Already drawn
        while (cur != lineView.node) cur = rm(cur);
        var updateNumber = lineNumbers && updateNumbersFrom != null &&
          updateNumbersFrom <= lineN && lineView.lineNumber;
        if (lineView.changes) {
          if (indexOf(lineView.changes, "gutter") > -1) updateNumber = false;
          updateLineForChanges(cm, lineView, lineN, dims);
        }
        if (updateNumber) {
          removeChildren(lineView.lineNumber);
          lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
        }
        cur = lineView.node.nextSibling;
      }
      lineN += lineView.size;
    }
    while (cur) cur = rm(cur);
  }

  // When an aspect of a line changes, a string is added to
  // lineView.changes. This updates the relevant part of the line's
  // DOM structure.
  function updateLineForChanges(cm, lineView, lineN, dims) {
    for (var j = 0; j < lineView.changes.length; j++) {
      var type = lineView.changes[j];
      if (type == "text") updateLineText(cm, lineView);
      else if (type == "gutter") updateLineGutter(cm, lineView, lineN, dims);
      else if (type == "class") updateLineClasses(lineView);
      else if (type == "widget") updateLineWidgets(lineView, dims);
    }
    lineView.changes = null;
  }

  // Lines with gutter elements, widgets or a background class need to
  // be wrapped, and have the extra elements added to the wrapper div
  function ensureLineWrapped(lineView) {
    if (lineView.node == lineView.text) {
      lineView.node = elt("div", null, null, "position: relative");
      if (lineView.text.parentNode)
        lineView.text.parentNode.replaceChild(lineView.node, lineView.text);
      lineView.node.appendChild(lineView.text);
      if (ie && ie_version < 8) lineView.node.style.zIndex = 2;
    }
    return lineView.node;
  }

  function updateLineBackground(lineView) {
    var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;
    if (cls) cls += " CodeMirror-linebackground";
    if (lineView.background) {
      if (cls) lineView.background.className = cls;
      else { lineView.background.parentNode.removeChild(lineView.background); lineView.background = null; }
    } else if (cls) {
      var wrap = ensureLineWrapped(lineView);
      lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
    }
  }

  // Wrapper around buildLineContent which will reuse the structure
  // in display.externalMeasured when possible.
  function getLineContent(cm, lineView) {
    var ext = cm.display.externalMeasured;
    if (ext && ext.line == lineView.line) {
      cm.display.externalMeasured = null;
      lineView.measure = ext.measure;
      return ext.built;
    }
    return buildLineContent(cm, lineView);
  }

  // Redraw the line's text. Interacts with the background and text
  // classes because the mode may output tokens that influence these
  // classes.
  function updateLineText(cm, lineView) {
    var cls = lineView.text.className;
    var built = getLineContent(cm, lineView);
    if (lineView.text == lineView.node) lineView.node = built.pre;
    lineView.text.parentNode.replaceChild(built.pre, lineView.text);
    lineView.text = built.pre;
    if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
      lineView.bgClass = built.bgClass;
      lineView.textClass = built.textClass;
      updateLineClasses(lineView);
    } else if (cls) {
      lineView.text.className = cls;
    }
  }

  function updateLineClasses(lineView) {
    updateLineBackground(lineView);
    if (lineView.line.wrapClass)
      ensureLineWrapped(lineView).className = lineView.line.wrapClass;
    else if (lineView.node != lineView.text)
      lineView.node.className = "";
    var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
    lineView.text.className = textClass || "";
  }

  function updateLineGutter(cm, lineView, lineN, dims) {
    if (lineView.gutter) {
      lineView.node.removeChild(lineView.gutter);
      lineView.gutter = null;
    }
    var markers = lineView.line.gutterMarkers;
    if (cm.options.lineNumbers || markers) {
      var wrap = ensureLineWrapped(lineView);
      var gutterWrap = lineView.gutter =
        wrap.insertBefore(elt("div", null, "CodeMirror-gutter-wrapper", "left: " +
                              (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) +
                              "px; width: " + dims.gutterTotalWidth + "px"),
                          lineView.text);
      if (lineView.line.gutterClass)
        gutterWrap.className += " " + lineView.line.gutterClass;
      if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"]))
        lineView.lineNumber = gutterWrap.appendChild(
          elt("div", lineNumberFor(cm.options, lineN),
              "CodeMirror-linenumber CodeMirror-gutter-elt",
              "left: " + dims.gutterLeft["CodeMirror-linenumbers"] + "px; width: "
              + cm.display.lineNumInnerWidth + "px"));
      if (markers) for (var k = 0; k < cm.options.gutters.length; ++k) {
        var id = cm.options.gutters[k], found = markers.hasOwnProperty(id) && markers[id];
        if (found)
          gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt", "left: " +
                                     dims.gutterLeft[id] + "px; width: " + dims.gutterWidth[id] + "px"));
      }
    }
  }

  function updateLineWidgets(lineView, dims) {
    if (lineView.alignable) lineView.alignable = null;
    for (var node = lineView.node.firstChild, next; node; node = next) {
      var next = node.nextSibling;
      if (node.className == "CodeMirror-linewidget")
        lineView.node.removeChild(node);
    }
    insertLineWidgets(lineView, dims);
  }

  // Build a line's DOM representation from scratch
  function buildLineElement(cm, lineView, lineN, dims) {
    var built = getLineContent(cm, lineView);
    lineView.text = lineView.node = built.pre;
    if (built.bgClass) lineView.bgClass = built.bgClass;
    if (built.textClass) lineView.textClass = built.textClass;

    updateLineClasses(lineView);
    updateLineGutter(cm, lineView, lineN, dims);
    insertLineWidgets(lineView, dims);
    return lineView.node;
  }

  // A lineView may contain multiple logical lines (when merged by
  // collapsed spans). The widgets for all of them need to be drawn.
  function insertLineWidgets(lineView, dims) {
    insertLineWidgetsFor(lineView.line, lineView, dims, true);
    if (lineView.rest) for (var i = 0; i < lineView.rest.length; i++)
      insertLineWidgetsFor(lineView.rest[i], lineView, dims, false);
  }

  function insertLineWidgetsFor(line, lineView, dims, allowAbove) {
    if (!line.widgets) return;
    var wrap = ensureLineWrapped(lineView);
    for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
      var widget = ws[i], node = elt("div", [widget.node], "CodeMirror-linewidget");
      if (!widget.handleMouseEvents) node.setAttribute("cm-ignore-events", "true");
      positionLineWidget(widget, node, lineView, dims);
      if (allowAbove && widget.above)
        wrap.insertBefore(node, lineView.gutter || lineView.text);
      else
        wrap.appendChild(node);
      signalLater(widget, "redraw");
    }
  }

  function positionLineWidget(widget, node, lineView, dims) {
    if (widget.noHScroll) {
      (lineView.alignable || (lineView.alignable = [])).push(node);
      var width = dims.wrapperWidth;
      node.style.left = dims.fixedPos + "px";
      if (!widget.coverGutter) {
        width -= dims.gutterTotalWidth;
        node.style.paddingLeft = dims.gutterTotalWidth + "px";
      }
      node.style.width = width + "px";
    }
    if (widget.coverGutter) {
      node.style.zIndex = 5;
      node.style.position = "relative";
      if (!widget.noHScroll) node.style.marginLeft = -dims.gutterTotalWidth + "px";
    }
  }

  // POSITION OBJECT

  // A Pos instance represents a position within the text.
  var Pos = CodeMirror.Pos = function(line, ch) {
    if (!(this instanceof Pos)) return new Pos(line, ch);
    this.line = line; this.ch = ch;
  };

  // Compare two positions, return 0 if they are the same, a negative
  // number when a is less, and a positive number otherwise.
  var cmp = CodeMirror.cmpPos = function(a, b) { return a.line - b.line || a.ch - b.ch; };

  function copyPos(x) {return Pos(x.line, x.ch);}
  function maxPos(a, b) { return cmp(a, b) < 0 ? b : a; }
  function minPos(a, b) { return cmp(a, b) < 0 ? a : b; }

  // SELECTION / CURSOR

  // Selection objects are immutable. A new one is created every time
  // the selection changes. A selection is one or more non-overlapping
  // (and non-touching) ranges, sorted, and an integer that indicates
  // which one is the primary selection (the one that's scrolled into
  // view, that getCursor returns, etc).
  function Selection(ranges, primIndex) {
    this.ranges = ranges;
    this.primIndex = primIndex;
  }

  Selection.prototype = {
    primary: function() { return this.ranges[this.primIndex]; },
    equals: function(other) {
      if (other == this) return true;
      if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) return false;
      for (var i = 0; i < this.ranges.length; i++) {
        var here = this.ranges[i], there = other.ranges[i];
        if (cmp(here.anchor, there.anchor) != 0 || cmp(here.head, there.head) != 0) return false;
      }
      return true;
    },
    deepCopy: function() {
      for (var out = [], i = 0; i < this.ranges.length; i++)
        out[i] = new Range(copyPos(this.ranges[i].anchor), copyPos(this.ranges[i].head));
      return new Selection(out, this.primIndex);
    },
    somethingSelected: function() {
      for (var i = 0; i < this.ranges.length; i++)
        if (!this.ranges[i].empty()) return true;
      return false;
    },
    contains: function(pos, end) {
      if (!end) end = pos;
      for (var i = 0; i < this.ranges.length; i++) {
        var range = this.ranges[i];
        if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0)
          return i;
      }
      return -1;
    }
  };

  function Range(anchor, head) {
    this.anchor = anchor; this.head = head;
  }

  Range.prototype = {
    from: function() { return minPos(this.anchor, this.head); },
    to: function() { return maxPos(this.anchor, this.head); },
    empty: function() {
      return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
    }
  };

  // Take an unsorted, potentially overlapping set of ranges, and
  // build a selection out of it. 'Consumes' ranges array (modifying
  // it).
  function normalizeSelection(ranges, primIndex) {
    var prim = ranges[primIndex];
    ranges.sort(function(a, b) { return cmp(a.from(), b.from()); });
    primIndex = indexOf(ranges, prim);
    for (var i = 1; i < ranges.length; i++) {
      var cur = ranges[i], prev = ranges[i - 1];
      if (cmp(prev.to(), cur.from()) >= 0) {
        var from = minPos(prev.from(), cur.from()), to = maxPos(prev.to(), cur.to());
        var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;
        if (i <= primIndex) --primIndex;
        ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
      }
    }
    return new Selection(ranges, primIndex);
  }

  function simpleSelection(anchor, head) {
    return new Selection([new Range(anchor, head || anchor)], 0);
  }

  // Most of the external API clips given positions to make sure they
  // actually exist within the document.
  function clipLine(doc, n) {return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1));}
  function clipPos(doc, pos) {
    if (pos.line < doc.first) return Pos(doc.first, 0);
    var last = doc.first + doc.size - 1;
    if (pos.line > last) return Pos(last, getLine(doc, last).text.length);
    return clipToLen(pos, getLine(doc, pos.line).text.length);
  }
  function clipToLen(pos, linelen) {
    var ch = pos.ch;
    if (ch == null || ch > linelen) return Pos(pos.line, linelen);
    else if (ch < 0) return Pos(pos.line, 0);
    else return pos;
  }
  function isLine(doc, l) {return l >= doc.first && l < doc.first + doc.size;}
  function clipPosArray(doc, array) {
    for (var out = [], i = 0; i < array.length; i++) out[i] = clipPos(doc, array[i]);
    return out;
  }

  // SELECTION UPDATES

  // The 'scroll' parameter given to many of these indicated whether
  // the new cursor position should be scrolled into view after
  // modifying the selection.

  // If shift is held or the extend flag is set, extends a range to
  // include a given position (and optionally a second position).
  // Otherwise, simply returns the range between the given positions.
  // Used for cursor motion and such.
  function extendRange(doc, range, head, other) {
    if (doc.cm && doc.cm.display.shift || doc.extend) {
      var anchor = range.anchor;
      if (other) {
        var posBefore = cmp(head, anchor) < 0;
        if (posBefore != (cmp(other, anchor) < 0)) {
          anchor = head;
          head = other;
        } else if (posBefore != (cmp(head, other) < 0)) {
          head = other;
        }
      }
      return new Range(anchor, head);
    } else {
      return new Range(other || head, head);
    }
  }

  // Extend the primary selection range, discard the rest.
  function extendSelection(doc, head, other, options) {
    setSelection(doc, new Selection([extendRange(doc, doc.sel.primary(), head, other)], 0), options);
  }

  // Extend all selections (pos is an array of selections with length
  // equal the number of selections)
  function extendSelections(doc, heads, options) {
    for (var out = [], i = 0; i < doc.sel.ranges.length; i++)
      out[i] = extendRange(doc, doc.sel.ranges[i], heads[i], null);
    var newSel = normalizeSelection(out, doc.sel.primIndex);
    setSelection(doc, newSel, options);
  }

  // Updates a single range in the selection.
  function replaceOneSelection(doc, i, range, options) {
    var ranges = doc.sel.ranges.slice(0);
    ranges[i] = range;
    setSelection(doc, normalizeSelection(ranges, doc.sel.primIndex), options);
  }

  // Reset the selection to a single range.
  function setSimpleSelection(doc, anchor, head, options) {
    setSelection(doc, simpleSelection(anchor, head), options);
  }

  // Give beforeSelectionChange handlers a change to influence a
  // selection update.
  function filterSelectionChange(doc, sel) {
    var obj = {
      ranges: sel.ranges,
      update: function(ranges) {
        this.ranges = [];
        for (var i = 0; i < ranges.length; i++)
          this.ranges[i] = new Range(clipPos(doc, ranges[i].anchor),
                                     clipPos(doc, ranges[i].head));
      }
    };
    signal(doc, "beforeSelectionChange", doc, obj);
    if (doc.cm) signal(doc.cm, "beforeSelectionChange", doc.cm, obj);
    if (obj.ranges != sel.ranges) return normalizeSelection(obj.ranges, obj.ranges.length - 1);
    else return sel;
  }

  function setSelectionReplaceHistory(doc, sel, options) {
    var done = doc.history.done, last = lst(done);
    if (last && last.ranges) {
      done[done.length - 1] = sel;
      setSelectionNoUndo(doc, sel, options);
    } else {
      setSelection(doc, sel, options);
    }
  }

  // Set a new selection.
  function setSelection(doc, sel, options) {
    setSelectionNoUndo(doc, sel, options);
    addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options);
  }

  function setSelectionNoUndo(doc, sel, options) {
    if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange"))
      sel = filterSelectionChange(doc, sel);

    var bias = options && options.bias ||
      (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
    setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));

    if (!(options && options.scroll === false) && doc.cm)
      ensureCursorVisible(doc.cm);
  }

  function setSelectionInner(doc, sel) {
    if (sel.equals(doc.sel)) return;

    doc.sel = sel;

    if (doc.cm) {
      doc.cm.curOp.updateInput = doc.cm.curOp.selectionChanged = true;
      signalCursorActivity(doc.cm);
    }
    signalLater(doc, "cursorActivity", doc);
  }

  // Verify that the selection does not partially select any atomic
  // marked ranges.
  function reCheckSelection(doc) {
    setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false), sel_dontScroll);
  }

  // Return a selection that does not partially select any atomic
  // ranges.
  function skipAtomicInSelection(doc, sel, bias, mayClear) {
    var out;
    for (var i = 0; i < sel.ranges.length; i++) {
      var range = sel.ranges[i];
      var newAnchor = skipAtomic(doc, range.anchor, bias, mayClear);
      var newHead = skipAtomic(doc, range.head, bias, mayClear);
      if (out || newAnchor != range.anchor || newHead != range.head) {
        if (!out) out = sel.ranges.slice(0, i);
        out[i] = new Range(newAnchor, newHead);
      }
    }
    return out ? normalizeSelection(out, sel.primIndex) : sel;
  }

  // Ensure a given position is not inside an atomic range.
  function skipAtomic(doc, pos, bias, mayClear) {
    var flipped = false, curPos = pos;
    var dir = bias || 1;
    doc.cantEdit = false;
    search: for (;;) {
      var line = getLine(doc, curPos.line);
      if (line.markedSpans) {
        for (var i = 0; i < line.markedSpans.length; ++i) {
          var sp = line.markedSpans[i], m = sp.marker;
          if ((sp.from == null || (m.inclusiveLeft ? sp.from <= curPos.ch : sp.from < curPos.ch)) &&
              (sp.to == null || (m.inclusiveRight ? sp.to >= curPos.ch : sp.to > curPos.ch))) {
            if (mayClear) {
              signal(m, "beforeCursorEnter");
              if (m.explicitlyCleared) {
                if (!line.markedSpans) break;
                else {--i; continue;}
              }
            }
            if (!m.atomic) continue;
            var newPos = m.find(dir < 0 ? -1 : 1);
            if (cmp(newPos, curPos) == 0) {
              newPos.ch += dir;
              if (newPos.ch < 0) {
                if (newPos.line > doc.first) newPos = clipPos(doc, Pos(newPos.line - 1));
                else newPos = null;
              } else if (newPos.ch > line.text.length) {
                if (newPos.line < doc.first + doc.size - 1) newPos = Pos(newPos.line + 1, 0);
                else newPos = null;
              }
              if (!newPos) {
                if (flipped) {
                  // Driven in a corner -- no valid cursor position found at all
                  // -- try again *with* clearing, if we didn't already
                  if (!mayClear) return skipAtomic(doc, pos, bias, true);
                  // Otherwise, turn off editing until further notice, and return the start of the doc
                  doc.cantEdit = true;
                  return Pos(doc.first, 0);
                }
                flipped = true; newPos = pos; dir = -dir;
              }
            }
            curPos = newPos;
            continue search;
          }
        }
      }
      return curPos;
    }
  }

  // SELECTION DRAWING

  // Redraw the selection and/or cursor
  function drawSelection(cm) {
    var display = cm.display, doc = cm.doc, result = {};
    var curFragment = result.cursors = document.createDocumentFragment();
    var selFragment = result.selection = document.createDocumentFragment();

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      var range = doc.sel.ranges[i];
      var collapsed = range.empty();
      if (collapsed || cm.options.showCursorWhenSelecting)
        drawSelectionCursor(cm, range, curFragment);
      if (!collapsed)
        drawSelectionRange(cm, range, selFragment);
    }

    // Move the hidden textarea near the cursor to prevent scrolling artifacts
    if (cm.options.moveInputWithCursor) {
      var headPos = cursorCoords(cm, doc.sel.primary().head, "div");
      var wrapOff = display.wrapper.getBoundingClientRect(), lineOff = display.lineDiv.getBoundingClientRect();
      result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10,
                                          headPos.top + lineOff.top - wrapOff.top));
      result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10,
                                           headPos.left + lineOff.left - wrapOff.left));
    }

    return result;
  }

  function showSelection(cm, drawn) {
    removeChildrenAndAdd(cm.display.cursorDiv, drawn.cursors);
    removeChildrenAndAdd(cm.display.selectionDiv, drawn.selection);
    if (drawn.teTop != null) {
      cm.display.inputDiv.style.top = drawn.teTop + "px";
      cm.display.inputDiv.style.left = drawn.teLeft + "px";
    }
  }

  function updateSelection(cm) {
    showSelection(cm, drawSelection(cm));
  }

  // Draws a cursor for the given range
  function drawSelectionCursor(cm, range, output) {
    var pos = cursorCoords(cm, range.head, "div", null, null, !cm.options.singleCursorHeightPerLine);

    var cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor"));
    cursor.style.left = pos.left + "px";
    cursor.style.top = pos.top + "px";
    cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";

    if (pos.other) {
      // Secondary cursor, shown when on a 'jump' in bi-directional text
      var otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"));
      otherCursor.style.display = "";
      otherCursor.style.left = pos.other.left + "px";
      otherCursor.style.top = pos.other.top + "px";
      otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px";
    }
  }

  // Draws the given range as a highlighted selection
  function drawSelectionRange(cm, range, output) {
    var display = cm.display, doc = cm.doc;
    var fragment = document.createDocumentFragment();
    var padding = paddingH(cm.display), leftSide = padding.left;
    var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;

    function add(left, top, width, bottom) {
      if (top < 0) top = 0;
      top = Math.round(top);
      bottom = Math.round(bottom);
      fragment.appendChild(elt("div", null, "CodeMirror-selected", "position: absolute; left: " + left +
                               "px; top: " + top + "px; width: " + (width == null ? rightSide - left : width) +
                               "px; height: " + (bottom - top) + "px"));
    }

    function drawForLine(line, fromArg, toArg) {
      var lineObj = getLine(doc, line);
      var lineLen = lineObj.text.length;
      var start, end;
      function coords(ch, bias) {
        return charCoords(cm, Pos(line, ch), "div", lineObj, bias);
      }

      iterateBidiSections(getOrder(lineObj), fromArg || 0, toArg == null ? lineLen : toArg, function(from, to, dir) {
        var leftPos = coords(from, "left"), rightPos, left, right;
        if (from == to) {
          rightPos = leftPos;
          left = right = leftPos.left;
        } else {
          rightPos = coords(to - 1, "right");
          if (dir == "rtl") { var tmp = leftPos; leftPos = rightPos; rightPos = tmp; }
          left = leftPos.left;
          right = rightPos.right;
        }
        if (fromArg == null && from == 0) left = leftSide;
        if (rightPos.top - leftPos.top > 3) { // Different lines, draw top part
          add(left, leftPos.top, null, leftPos.bottom);
          left = leftSide;
          if (leftPos.bottom < rightPos.top) add(left, leftPos.bottom, null, rightPos.top);
        }
        if (toArg == null && to == lineLen) right = rightSide;
        if (!start || leftPos.top < start.top || leftPos.top == start.top && leftPos.left < start.left)
          start = leftPos;
        if (!end || rightPos.bottom > end.bottom || rightPos.bottom == end.bottom && rightPos.right > end.right)
          end = rightPos;
        if (left < leftSide + 1) left = leftSide;
        add(left, rightPos.top, right - left, rightPos.bottom);
      });
      return {start: start, end: end};
    }

    var sFrom = range.from(), sTo = range.to();
    if (sFrom.line == sTo.line) {
      drawForLine(sFrom.line, sFrom.ch, sTo.ch);
    } else {
      var fromLine = getLine(doc, sFrom.line), toLine = getLine(doc, sTo.line);
      var singleVLine = visualLine(fromLine) == visualLine(toLine);
      var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
      var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;
      if (singleVLine) {
        if (leftEnd.top < rightStart.top - 2) {
          add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
          add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
        } else {
          add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
        }
      }
      if (leftEnd.bottom < rightStart.top)
        add(leftSide, leftEnd.bottom, null, rightStart.top);
    }

    output.appendChild(fragment);
  }

  // Cursor-blinking
  function restartBlink(cm) {
    if (!cm.state.focused) return;
    var display = cm.display;
    clearInterval(display.blinker);
    var on = true;
    display.cursorDiv.style.visibility = "";
    if (cm.options.cursorBlinkRate > 0)
      display.blinker = setInterval(function() {
        display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden";
      }, cm.options.cursorBlinkRate);
    else if (cm.options.cursorBlinkRate < 0)
      display.cursorDiv.style.visibility = "hidden";
  }

  // HIGHLIGHT WORKER

  function startWorker(cm, time) {
    if (cm.doc.mode.startState && cm.doc.frontier < cm.display.viewTo)
      cm.state.highlight.set(time, bind(highlightWorker, cm));
  }

  function highlightWorker(cm) {
    var doc = cm.doc;
    if (doc.frontier < doc.first) doc.frontier = doc.first;
    if (doc.frontier >= cm.display.viewTo) return;
    var end = +new Date + cm.options.workTime;
    var state = copyState(doc.mode, getStateBefore(cm, doc.frontier));
    var changedLines = [];

    doc.iter(doc.frontier, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function(line) {
      if (doc.frontier >= cm.display.viewFrom) { // Visible
        var oldStyles = line.styles;
        var highlighted = highlightLine(cm, line, state, true);
        line.styles = highlighted.styles;
        var oldCls = line.styleClasses, newCls = highlighted.classes;
        if (newCls) line.styleClasses = newCls;
        else if (oldCls) line.styleClasses = null;
        var ischange = !oldStyles || oldStyles.length != line.styles.length ||
          oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);
        for (var i = 0; !ischange && i < oldStyles.length; ++i) ischange = oldStyles[i] != line.styles[i];
        if (ischange) changedLines.push(doc.frontier);
        line.stateAfter = copyState(doc.mode, state);
      } else {
        processLine(cm, line.text, state);
        line.stateAfter = doc.frontier % 5 == 0 ? copyState(doc.mode, state) : null;
      }
      ++doc.frontier;
      if (+new Date > end) {
        startWorker(cm, cm.options.workDelay);
        return true;
      }
    });
    if (changedLines.length) runInOp(cm, function() {
      for (var i = 0; i < changedLines.length; i++)
        regLineChange(cm, changedLines[i], "text");
    });
  }

  // Finds the line to start with when starting a parse. Tries to
  // find a line with a stateAfter, so that it can start with a
  // valid state. If that fails, it returns the line with the
  // smallest indentation, which tends to need the least context to
  // parse correctly.
  function findStartLine(cm, n, precise) {
    var minindent, minline, doc = cm.doc;
    var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100);
    for (var search = n; search > lim; --search) {
      if (search <= doc.first) return doc.first;
      var line = getLine(doc, search - 1);
      if (line.stateAfter && (!precise || search <= doc.frontier)) return search;
      var indented = countColumn(line.text, null, cm.options.tabSize);
      if (minline == null || minindent > indented) {
        minline = search - 1;
        minindent = indented;
      }
    }
    return minline;
  }

  function getStateBefore(cm, n, precise) {
    var doc = cm.doc, display = cm.display;
    if (!doc.mode.startState) return true;
    var pos = findStartLine(cm, n, precise), state = pos > doc.first && getLine(doc, pos-1).stateAfter;
    if (!state) state = startState(doc.mode);
    else state = copyState(doc.mode, state);
    doc.iter(pos, n, function(line) {
      processLine(cm, line.text, state);
      var save = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo;
      line.stateAfter = save ? copyState(doc.mode, state) : null;
      ++pos;
    });
    if (precise) doc.frontier = pos;
    return state;
  }

  // POSITION MEASUREMENT

  function paddingTop(display) {return display.lineSpace.offsetTop;}
  function paddingVert(display) {return display.mover.offsetHeight - display.lineSpace.offsetHeight;}
  function paddingH(display) {
    if (display.cachedPaddingH) return display.cachedPaddingH;
    var e = removeChildrenAndAdd(display.measure, elt("pre", "x"));
    var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
    var data = {left: parseInt(style.paddingLeft), right: parseInt(style.paddingRight)};
    if (!isNaN(data.left) && !isNaN(data.right)) display.cachedPaddingH = data;
    return data;
  }

  function scrollGap(cm) { return scrollerGap - cm.display.nativeBarWidth; }
  function displayWidth(cm) {
    return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth;
  }
  function displayHeight(cm) {
    return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight;
  }

  // Ensure the lineView.wrapping.heights array is populated. This is
  // an array of bottom offsets for the lines that make up a drawn
  // line. When lineWrapping is on, there might be more than one
  // height.
  function ensureLineHeights(cm, lineView, rect) {
    var wrapping = cm.options.lineWrapping;
    var curWidth = wrapping && displayWidth(cm);
    if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
      var heights = lineView.measure.heights = [];
      if (wrapping) {
        lineView.measure.width = curWidth;
        var rects = lineView.text.firstChild.getClientRects();
        for (var i = 0; i < rects.length - 1; i++) {
          var cur = rects[i], next = rects[i + 1];
          if (Math.abs(cur.bottom - next.bottom) > 2)
            heights.push((cur.bottom + next.top) / 2 - rect.top);
        }
      }
      heights.push(rect.bottom - rect.top);
    }
  }

  // Find a line map (mapping character offsets to text nodes) and a
  // measurement cache for the given line number. (A line view might
  // contain multiple lines when collapsed ranges are present.)
  function mapFromLineView(lineView, line, lineN) {
    if (lineView.line == line)
      return {map: lineView.measure.map, cache: lineView.measure.cache};
    for (var i = 0; i < lineView.rest.length; i++)
      if (lineView.rest[i] == line)
        return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i]};
    for (var i = 0; i < lineView.rest.length; i++)
      if (lineNo(lineView.rest[i]) > lineN)
        return {map: lineView.measure.maps[i], cache: lineView.measure.caches[i], before: true};
  }

  // Render a line into the hidden node display.externalMeasured. Used
  // when measurement is needed for a line that's not in the viewport.
  function updateExternalMeasurement(cm, line) {
    line = visualLine(line);
    var lineN = lineNo(line);
    var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
    view.lineN = lineN;
    var built = view.built = buildLineContent(cm, view);
    view.text = built.pre;
    removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
    return view;
  }

  // Get a {top, bottom, left, right} box (in line-local coordinates)
  // for a given character.
  function measureChar(cm, line, ch, bias) {
    return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias);
  }

  // Find a line view that corresponds to the given line number.
  function findViewForLine(cm, lineN) {
    if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo)
      return cm.display.view[findViewIndex(cm, lineN)];
    var ext = cm.display.externalMeasured;
    if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size)
      return ext;
  }

  // Measurement can be split in two steps, the set-up work that
  // applies to the whole line, and the measurement of the actual
  // character. Functions like coordsChar, that need to do a lot of
  // measurements in a row, can thus ensure that the set-up work is
  // only done once.
  function prepareMeasureForLine(cm, line) {
    var lineN = lineNo(line);
    var view = findViewForLine(cm, lineN);
    if (view && !view.text)
      view = null;
    else if (view && view.changes)
      updateLineForChanges(cm, view, lineN, getDimensions(cm));
    if (!view)
      view = updateExternalMeasurement(cm, line);

    var info = mapFromLineView(view, line, lineN);
    return {
      line: line, view: view, rect: null,
      map: info.map, cache: info.cache, before: info.before,
      hasHeights: false
    };
  }

  // Given a prepared measurement object, measures the position of an
  // actual character (or fetches it from the cache).
  function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
    if (prepared.before) ch = -1;
    var key = ch + (bias || ""), found;
    if (prepared.cache.hasOwnProperty(key)) {
      found = prepared.cache[key];
    } else {
      if (!prepared.rect)
        prepared.rect = prepared.view.text.getBoundingClientRect();
      if (!prepared.hasHeights) {
        ensureLineHeights(cm, prepared.view, prepared.rect);
        prepared.hasHeights = true;
      }
      found = measureCharInner(cm, prepared, ch, bias);
      if (!found.bogus) prepared.cache[key] = found;
    }
    return {left: found.left, right: found.right,
            top: varHeight ? found.rtop : found.top,
            bottom: varHeight ? found.rbottom : found.bottom};
  }

  var nullRect = {left: 0, right: 0, top: 0, bottom: 0};

  function measureCharInner(cm, prepared, ch, bias) {
    var map = prepared.map;

    var node, start, end, collapse;
    // First, search the line map for the text node corresponding to,
    // or closest to, the target character.
    for (var i = 0; i < map.length; i += 3) {
      var mStart = map[i], mEnd = map[i + 1];
      if (ch < mStart) {
        start = 0; end = 1;
        collapse = "left";
      } else if (ch < mEnd) {
        start = ch - mStart;
        end = start + 1;
      } else if (i == map.length - 3 || ch == mEnd && map[i + 3] > ch) {
        end = mEnd - mStart;
        start = end - 1;
        if (ch >= mEnd) collapse = "right";
      }
      if (start != null) {
        node = map[i + 2];
        if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right"))
          collapse = bias;
        if (bias == "left" && start == 0)
          while (i && map[i - 2] == map[i - 3] && map[i - 1].insertLeft) {
            node = map[(i -= 3) + 2];
            collapse = "left";
          }
        if (bias == "right" && start == mEnd - mStart)
          while (i < map.length - 3 && map[i + 3] == map[i + 4] && !map[i + 5].insertLeft) {
            node = map[(i += 3) + 2];
            collapse = "right";
          }
        break;
      }
    }

    var rect;
    if (node.nodeType == 3) { // If it is a text node, use a range to retrieve the coordinates.
      for (var i = 0; i < 4; i++) { // Retry a maximum of 4 times when nonsense rectangles are returned
        while (start && isExtendingChar(prepared.line.text.charAt(mStart + start))) --start;
        while (mStart + end < mEnd && isExtendingChar(prepared.line.text.charAt(mStart + end))) ++end;
        if (ie && ie_version < 9 && start == 0 && end == mEnd - mStart) {
          rect = node.parentNode.getBoundingClientRect();
        } else if (ie && cm.options.lineWrapping) {
          var rects = range(node, start, end).getClientRects();
          if (rects.length)
            rect = rects[bias == "right" ? rects.length - 1 : 0];
          else
            rect = nullRect;
        } else {
          rect = range(node, start, end).getBoundingClientRect() || nullRect;
        }
        if (rect.left || rect.right || start == 0) break;
        end = start;
        start = start - 1;
        collapse = "right";
      }
      if (ie && ie_version < 11) rect = maybeUpdateRectForZooming(cm.display.measure, rect);
    } else { // If it is a widget, simply get the box for the whole widget.
      if (start > 0) collapse = bias = "right";
      var rects;
      if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1)
        rect = rects[bias == "right" ? rects.length - 1 : 0];
      else
        rect = node.getBoundingClientRect();
    }
    if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
      var rSpan = node.parentNode.getClientRects()[0];
      if (rSpan)
        rect = {left: rSpan.left, right: rSpan.left + charWidth(cm.display), top: rSpan.top, bottom: rSpan.bottom};
      else
        rect = nullRect;
    }

    var rtop = rect.top - prepared.rect.top, rbot = rect.bottom - prepared.rect.top;
    var mid = (rtop + rbot) / 2;
    var heights = prepared.view.measure.heights;
    for (var i = 0; i < heights.length - 1; i++)
      if (mid < heights[i]) break;
    var top = i ? heights[i - 1] : 0, bot = heights[i];
    var result = {left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
                  right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
                  top: top, bottom: bot};
    if (!rect.left && !rect.right) result.bogus = true;
    if (!cm.options.singleCursorHeightPerLine) { result.rtop = rtop; result.rbottom = rbot; }

    return result;
  }

  // Work around problem with bounding client rects on ranges being
  // returned incorrectly when zoomed on IE10 and below.
  function maybeUpdateRectForZooming(measure, rect) {
    if (!window.screen || screen.logicalXDPI == null ||
        screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure))
      return rect;
    var scaleX = screen.logicalXDPI / screen.deviceXDPI;
    var scaleY = screen.logicalYDPI / screen.deviceYDPI;
    return {left: rect.left * scaleX, right: rect.right * scaleX,
            top: rect.top * scaleY, bottom: rect.bottom * scaleY};
  }

  function clearLineMeasurementCacheFor(lineView) {
    if (lineView.measure) {
      lineView.measure.cache = {};
      lineView.measure.heights = null;
      if (lineView.rest) for (var i = 0; i < lineView.rest.length; i++)
        lineView.measure.caches[i] = {};
    }
  }

  function clearLineMeasurementCache(cm) {
    cm.display.externalMeasure = null;
    removeChildren(cm.display.lineMeasure);
    for (var i = 0; i < cm.display.view.length; i++)
      clearLineMeasurementCacheFor(cm.display.view[i]);
  }

  function clearCaches(cm) {
    clearLineMeasurementCache(cm);
    cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;
    if (!cm.options.lineWrapping) cm.display.maxLineChanged = true;
    cm.display.lineNumChars = null;
  }

  function pageScrollX() { return window.pageXOffset || (document.documentElement || document.body).scrollLeft; }
  function pageScrollY() { return window.pageYOffset || (document.documentElement || document.body).scrollTop; }

  // Converts a {top, bottom, left, right} box from line-local
  // coordinates into another coordinate system. Context may be one of
  // "line", "div" (display.lineDiv), "local"/null (editor), "window",
  // or "page".
  function intoCoordSystem(cm, lineObj, rect, context) {
    if (lineObj.widgets) for (var i = 0; i < lineObj.widgets.length; ++i) if (lineObj.widgets[i].above) {
      var size = widgetHeight(lineObj.widgets[i]);
      rect.top += size; rect.bottom += size;
    }
    if (context == "line") return rect;
    if (!context) context = "local";
    var yOff = heightAtLine(lineObj);
    if (context == "local") yOff += paddingTop(cm.display);
    else yOff -= cm.display.viewOffset;
    if (context == "page" || context == "window") {
      var lOff = cm.display.lineSpace.getBoundingClientRect();
      yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
      var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
      rect.left += xOff; rect.right += xOff;
    }
    rect.top += yOff; rect.bottom += yOff;
    return rect;
  }

  // Coverts a box from "div" coords to another coordinate system.
  // Context may be "window", "page", "div", or "local"/null.
  function fromCoordSystem(cm, coords, context) {
    if (context == "div") return coords;
    var left = coords.left, top = coords.top;
    // First move into "page" coordinate system
    if (context == "page") {
      left -= pageScrollX();
      top -= pageScrollY();
    } else if (context == "local" || !context) {
      var localBox = cm.display.sizer.getBoundingClientRect();
      left += localBox.left;
      top += localBox.top;
    }

    var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
    return {left: left - lineSpaceBox.left, top: top - lineSpaceBox.top};
  }

  function charCoords(cm, pos, context, lineObj, bias) {
    if (!lineObj) lineObj = getLine(cm.doc, pos.line);
    return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context);
  }

  // Returns a box for a given cursor position, which may have an
  // 'other' property containing the position of the secondary cursor
  // on a bidi boundary.
  function cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
    lineObj = lineObj || getLine(cm.doc, pos.line);
    if (!preparedMeasure) preparedMeasure = prepareMeasureForLine(cm, lineObj);
    function get(ch, right) {
      var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);
      if (right) m.left = m.right; else m.right = m.left;
      return intoCoordSystem(cm, lineObj, m, context);
    }
    function getBidi(ch, partPos) {
      var part = order[partPos], right = part.level % 2;
      if (ch == bidiLeft(part) && partPos && part.level < order[partPos - 1].level) {
        part = order[--partPos];
        ch = bidiRight(part) - (part.level % 2 ? 0 : 1);
        right = true;
      } else if (ch == bidiRight(part) && partPos < order.length - 1 && part.level < order[partPos + 1].level) {
        part = order[++partPos];
        ch = bidiLeft(part) - part.level % 2;
        right = false;
      }
      if (right && ch == part.to && ch > part.from) return get(ch - 1);
      return get(ch, right);
    }
    var order = getOrder(lineObj), ch = pos.ch;
    if (!order) return get(ch);
    var partPos = getBidiPartAt(order, ch);
    var val = getBidi(ch, partPos);
    if (bidiOther != null) val.other = getBidi(ch, bidiOther);
    return val;
  }

  // Used to cheaply estimate the coordinates for a position. Used for
  // intermediate scroll updates.
  function estimateCoords(cm, pos) {
    var left = 0, pos = clipPos(cm.doc, pos);
    if (!cm.options.lineWrapping) left = charWidth(cm.display) * pos.ch;
    var lineObj = getLine(cm.doc, pos.line);
    var top = heightAtLine(lineObj) + paddingTop(cm.display);
    return {left: left, right: left, top: top, bottom: top + lineObj.height};
  }

  // Positions returned by coordsChar contain some extra information.
  // xRel is the relative x position of the input coordinates compared
  // to the found position (so xRel > 0 means the coordinates are to
  // the right of the character position, for example). When outside
  // is true, that means the coordinates lie outside the line's
  // vertical range.
  function PosWithInfo(line, ch, outside, xRel) {
    var pos = Pos(line, ch);
    pos.xRel = xRel;
    if (outside) pos.outside = true;
    return pos;
  }

  // Compute the character position closest to the given coordinates.
  // Input must be lineSpace-local ("div" coordinate system).
  function coordsChar(cm, x, y) {
    var doc = cm.doc;
    y += cm.display.viewOffset;
    if (y < 0) return PosWithInfo(doc.first, 0, true, -1);
    var lineN = lineAtHeight(doc, y), last = doc.first + doc.size - 1;
    if (lineN > last)
      return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, true, 1);
    if (x < 0) x = 0;

    var lineObj = getLine(doc, lineN);
    for (;;) {
      var found = coordsCharInner(cm, lineObj, lineN, x, y);
      var merged = collapsedSpanAtEnd(lineObj);
      var mergedPos = merged && merged.find(0, true);
      if (merged && (found.ch > mergedPos.from.ch || found.ch == mergedPos.from.ch && found.xRel > 0))
        lineN = lineNo(lineObj = mergedPos.to.line);
      else
        return found;
    }
  }

  function coordsCharInner(cm, lineObj, lineNo, x, y) {
    var innerOff = y - heightAtLine(lineObj);
    var wrongLine = false, adjust = 2 * cm.display.wrapper.clientWidth;
    var preparedMeasure = prepareMeasureForLine(cm, lineObj);

    function getX(ch) {
      var sp = cursorCoords(cm, Pos(lineNo, ch), "line", lineObj, preparedMeasure);
      wrongLine = true;
      if (innerOff > sp.bottom) return sp.left - adjust;
      else if (innerOff < sp.top) return sp.left + adjust;
      else wrongLine = false;
      return sp.left;
    }

    var bidi = getOrder(lineObj), dist = lineObj.text.length;
    var from = lineLeft(lineObj), to = lineRight(lineObj);
    var fromX = getX(from), fromOutside = wrongLine, toX = getX(to), toOutside = wrongLine;

    if (x > toX) return PosWithInfo(lineNo, to, toOutside, 1);
    // Do a binary search between these bounds.
    for (;;) {
      if (bidi ? to == from || to == moveVisually(lineObj, from, 1) : to - from <= 1) {
        var ch = x < fromX || x - fromX <= toX - x ? from : to;
        var xDiff = x - (ch == from ? fromX : toX);
        while (isExtendingChar(lineObj.text.charAt(ch))) ++ch;
        var pos = PosWithInfo(lineNo, ch, ch == from ? fromOutside : toOutside,
                              xDiff < -1 ? -1 : xDiff > 1 ? 1 : 0);
        return pos;
      }
      var step = Math.ceil(dist / 2), middle = from + step;
      if (bidi) {
        middle = from;
        for (var i = 0; i < step; ++i) middle = moveVisually(lineObj, middle, 1);
      }
      var middleX = getX(middle);
      if (middleX > x) {to = middle; toX = middleX; if (toOutside = wrongLine) toX += 1000; dist = step;}
      else {from = middle; fromX = middleX; fromOutside = wrongLine; dist -= step;}
    }
  }

  var measureText;
  // Compute the default text height.
  function textHeight(display) {
    if (display.cachedTextHeight != null) return display.cachedTextHeight;
    if (measureText == null) {
      measureText = elt("pre");
      // Measure a bunch of lines, for browsers that compute
      // fractional heights.
      for (var i = 0; i < 49; ++i) {
        measureText.appendChild(document.createTextNode("x"));
        measureText.appendChild(elt("br"));
      }
      measureText.appendChild(document.createTextNode("x"));
    }
    removeChildrenAndAdd(display.measure, measureText);
    var height = measureText.offsetHeight / 50;
    if (height > 3) display.cachedTextHeight = height;
    removeChildren(display.measure);
    return height || 1;
  }

  // Compute the default character width.
  function charWidth(display) {
    if (display.cachedCharWidth != null) return display.cachedCharWidth;
    var anchor = elt("span", "xxxxxxxxxx");
    var pre = elt("pre", [anchor]);
    removeChildrenAndAdd(display.measure, pre);
    var rect = anchor.getBoundingClientRect(), width = (rect.right - rect.left) / 10;
    if (width > 2) display.cachedCharWidth = width;
    return width || 10;
  }

  // OPERATIONS

  // Operations are used to wrap a series of changes to the editor
  // state in such a way that each change won't have to update the
  // cursor and display (which would be awkward, slow, and
  // error-prone). Instead, display updates are batched and then all
  // combined and executed at once.

  var operationGroup = null;

  var nextOpId = 0;
  // Start a new operation.
  function startOperation(cm) {
    cm.curOp = {
      cm: cm,
      viewChanged: false,      // Flag that indicates that lines might need to be redrawn
      startHeight: cm.doc.height, // Used to detect need to update scrollbar
      forceUpdate: false,      // Used to force a redraw
      updateInput: null,       // Whether to reset the input textarea
      typing: false,           // Whether this reset should be careful to leave existing text (for compositing)
      changeObjs: null,        // Accumulated changes, for firing change events
      cursorActivityHandlers: null, // Set of handlers to fire cursorActivity on
      cursorActivityCalled: 0, // Tracks which cursorActivity handlers have been called already
      selectionChanged: false, // Whether the selection needs to be redrawn
      updateMaxLine: false,    // Set when the widest line needs to be determined anew
      scrollLeft: null, scrollTop: null, // Intermediate scroll position, not pushed to DOM yet
      scrollToPos: null,       // Used to scroll to a specific position
      id: ++nextOpId           // Unique ID
    };
    if (operationGroup) {
      operationGroup.ops.push(cm.curOp);
    } else {
      cm.curOp.ownsGroup = operationGroup = {
        ops: [cm.curOp],
        delayedCallbacks: []
      };
    }
  }

  function fireCallbacksForOps(group) {
    // Calls delayed callbacks and cursorActivity handlers until no
    // new ones appear
    var callbacks = group.delayedCallbacks, i = 0;
    do {
      for (; i < callbacks.length; i++)
        callbacks[i]();
      for (var j = 0; j < group.ops.length; j++) {
        var op = group.ops[j];
        if (op.cursorActivityHandlers)
          while (op.cursorActivityCalled < op.cursorActivityHandlers.length)
            op.cursorActivityHandlers[op.cursorActivityCalled++](op.cm);
      }
    } while (i < callbacks.length);
  }

  // Finish an operation, updating the display and signalling delayed events
  function endOperation(cm) {
    var op = cm.curOp, group = op.ownsGroup;
    if (!group) return;

    try { fireCallbacksForOps(group); }
    finally {
      operationGroup = null;
      for (var i = 0; i < group.ops.length; i++)
        group.ops[i].cm.curOp = null;
      endOperations(group);
    }
  }

  // The DOM updates done when an operation finishes are batched so
  // that the minimum number of relayouts are required.
  function endOperations(group) {
    var ops = group.ops;
    for (var i = 0; i < ops.length; i++) // Read DOM
      endOperation_R1(ops[i]);
    for (var i = 0; i < ops.length; i++) // Write DOM (maybe)
      endOperation_W1(ops[i]);
    for (var i = 0; i < ops.length; i++) // Read DOM
      endOperation_R2(ops[i]);
    for (var i = 0; i < ops.length; i++) // Write DOM (maybe)
      endOperation_W2(ops[i]);
    for (var i = 0; i < ops.length; i++) // Read DOM
      endOperation_finish(ops[i]);
  }

  function endOperation_R1(op) {
    var cm = op.cm, display = cm.display;
    maybeClipScrollbars(cm);
    if (op.updateMaxLine) findMaxLine(cm);

    op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null ||
      op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom ||
                         op.scrollToPos.to.line >= display.viewTo) ||
      display.maxLineChanged && cm.options.lineWrapping;
    op.update = op.mustUpdate &&
      new DisplayUpdate(cm, op.mustUpdate && {top: op.scrollTop, ensure: op.scrollToPos}, op.forceUpdate);
  }

  function endOperation_W1(op) {
    op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update);
  }

  function endOperation_R2(op) {
    var cm = op.cm, display = cm.display;
    if (op.updatedDisplay) updateHeightsInViewport(cm);

    op.barMeasure = measureForScrollbars(cm);

    // If the max line changed since it was last measured, measure it,
    // and ensure the document's width matches it.
    // updateDisplay_W2 will use these properties to do the actual resizing
    if (display.maxLineChanged && !cm.options.lineWrapping) {
      op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
      cm.display.sizerWidth = op.adjustWidthTo;
      op.barMeasure.scrollWidth =
        Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
      op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm));
    }

    if (op.updatedDisplay || op.selectionChanged)
      op.newSelectionNodes = drawSelection(cm);
  }

  function endOperation_W2(op) {
    var cm = op.cm;

    if (op.adjustWidthTo != null) {
      cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";
      if (op.maxScrollLeft < cm.doc.scrollLeft)
        setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true);
      cm.display.maxLineChanged = false;
    }

    if (op.newSelectionNodes)
      showSelection(cm, op.newSelectionNodes);
    if (op.updatedDisplay)
      setDocumentHeight(cm, op.barMeasure);
    if (op.updatedDisplay || op.startHeight != cm.doc.height)
      updateScrollbars(cm, op.barMeasure);

    if (op.selectionChanged) restartBlink(cm);

    if (cm.state.focused && op.updateInput)
      resetInput(cm, op.typing);
  }

  function endOperation_finish(op) {
    var cm = op.cm, display = cm.display, doc = cm.doc;

    if (op.updatedDisplay) postUpdateDisplay(cm, op.update);

    // Abort mouse wheel delta measurement, when scrolling explicitly
    if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos))
      display.wheelStartX = display.wheelStartY = null;

    // Propagate the scroll position to the actual DOM scroller
    if (op.scrollTop != null && (display.scroller.scrollTop != op.scrollTop || op.forceScroll)) {
      doc.scrollTop = Math.max(0, Math.min(display.scroller.scrollHeight - display.scroller.clientHeight, op.scrollTop));
      display.scrollbars.setScrollTop(doc.scrollTop);
      display.scroller.scrollTop = doc.scrollTop;
    }
    if (op.scrollLeft != null && (display.scroller.scrollLeft != op.scrollLeft || op.forceScroll)) {
      doc.scrollLeft = Math.max(0, Math.min(display.scroller.scrollWidth - displayWidth(cm), op.scrollLeft));
      display.scrollbars.setScrollLeft(doc.scrollLeft);
      display.scroller.scrollLeft = doc.scrollLeft;
      alignHorizontally(cm);
    }
    // If we need to scroll a specific position into view, do so.
    if (op.scrollToPos) {
      var coords = scrollPosIntoView(cm, clipPos(doc, op.scrollToPos.from),
                                     clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
      if (op.scrollToPos.isCursor && cm.state.focused) maybeScrollWindow(cm, coords);
    }

    // Fire events for markers that are hidden/unidden by editing or
    // undoing
    var hidden = op.maybeHiddenMarkers, unhidden = op.maybeUnhiddenMarkers;
    if (hidden) for (var i = 0; i < hidden.length; ++i)
      if (!hidden[i].lines.length) signal(hidden[i], "hide");
    if (unhidden) for (var i = 0; i < unhidden.length; ++i)
      if (unhidden[i].lines.length) signal(unhidden[i], "unhide");

    if (display.wrapper.offsetHeight)
      doc.scrollTop = cm.display.scroller.scrollTop;

    // Fire change events, and delayed event handlers
    if (op.changeObjs)
      signal(cm, "changes", cm, op.changeObjs);
  }

  // Run the given function in an operation
  function runInOp(cm, f) {
    if (cm.curOp) return f();
    startOperation(cm);
    try { return f(); }
    finally { endOperation(cm); }
  }
  // Wraps a function in an operation. Returns the wrapped function.
  function operation(cm, f) {
    return function() {
      if (cm.curOp) return f.apply(cm, arguments);
      startOperation(cm);
      try { return f.apply(cm, arguments); }
      finally { endOperation(cm); }
    };
  }
  // Used to add methods to editor and doc instances, wrapping them in
  // operations.
  function methodOp(f) {
    return function() {
      if (this.curOp) return f.apply(this, arguments);
      startOperation(this);
      try { return f.apply(this, arguments); }
      finally { endOperation(this); }
    };
  }
  function docMethodOp(f) {
    return function() {
      var cm = this.cm;
      if (!cm || cm.curOp) return f.apply(this, arguments);
      startOperation(cm);
      try { return f.apply(this, arguments); }
      finally { endOperation(cm); }
    };
  }

  // VIEW TRACKING

  // These objects are used to represent the visible (currently drawn)
  // part of the document. A LineView may correspond to multiple
  // logical lines, if those are connected by collapsed ranges.
  function LineView(doc, line, lineN) {
    // The starting line
    this.line = line;
    // Continuing lines, if any
    this.rest = visualLineContinued(line);
    // Number of logical lines in this visual line
    this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
    this.node = this.text = null;
    this.hidden = lineIsHidden(doc, line);
  }

  // Create a range of LineView objects for the given lines.
  function buildViewArray(cm, from, to) {
    var array = [], nextPos;
    for (var pos = from; pos < to; pos = nextPos) {
      var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
      nextPos = pos + view.size;
      array.push(view);
    }
    return array;
  }

  // Updates the display.view data structure for a given change to the
  // document. From and to are in pre-change coordinates. Lendiff is
  // the amount of lines added or subtracted by the change. This is
  // used for changes that span multiple lines, or change the way
  // lines are divided into visual lines. regLineChange (below)
  // registers single-line changes.
  function regChange(cm, from, to, lendiff) {
    if (from == null) from = cm.doc.first;
    if (to == null) to = cm.doc.first + cm.doc.size;
    if (!lendiff) lendiff = 0;

    var display = cm.display;
    if (lendiff && to < display.viewTo &&
        (display.updateLineNumbers == null || display.updateLineNumbers > from))
      display.updateLineNumbers = from;

    cm.curOp.viewChanged = true;

    if (from >= display.viewTo) { // Change after
      if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo)
        resetView(cm);
    } else if (to <= display.viewFrom) { // Change before
      if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
        resetView(cm);
      } else {
        display.viewFrom += lendiff;
        display.viewTo += lendiff;
      }
    } else if (from <= display.viewFrom && to >= display.viewTo) { // Full overlap
      resetView(cm);
    } else if (from <= display.viewFrom) { // Top overlap
      var cut = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cut) {
        display.view = display.view.slice(cut.index);
        display.viewFrom = cut.lineN;
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    } else if (to >= display.viewTo) { // Bottom overlap
      var cut = viewCuttingPoint(cm, from, from, -1);
      if (cut) {
        display.view = display.view.slice(0, cut.index);
        display.viewTo = cut.lineN;
      } else {
        resetView(cm);
      }
    } else { // Gap in the middle
      var cutTop = viewCuttingPoint(cm, from, from, -1);
      var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);
      if (cutTop && cutBot) {
        display.view = display.view.slice(0, cutTop.index)
          .concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN))
          .concat(display.view.slice(cutBot.index));
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    }

    var ext = display.externalMeasured;
    if (ext) {
      if (to < ext.lineN)
        ext.lineN += lendiff;
      else if (from < ext.lineN + ext.size)
        display.externalMeasured = null;
    }
  }

  // Register a change to a single line. Type must be one of "text",
  // "gutter", "class", "widget"
  function regLineChange(cm, line, type) {
    cm.curOp.viewChanged = true;
    var display = cm.display, ext = cm.display.externalMeasured;
    if (ext && line >= ext.lineN && line < ext.lineN + ext.size)
      display.externalMeasured = null;

    if (line < display.viewFrom || line >= display.viewTo) return;
    var lineView = display.view[findViewIndex(cm, line)];
    if (lineView.node == null) return;
    var arr = lineView.changes || (lineView.changes = []);
    if (indexOf(arr, type) == -1) arr.push(type);
  }

  // Clear the view.
  function resetView(cm) {
    cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
    cm.display.view = [];
    cm.display.viewOffset = 0;
  }

  // Find the view element corresponding to a given line. Return null
  // when the line isn't visible.
  function findViewIndex(cm, n) {
    if (n >= cm.display.viewTo) return null;
    n -= cm.display.viewFrom;
    if (n < 0) return null;
    var view = cm.display.view;
    for (var i = 0; i < view.length; i++) {
      n -= view[i].size;
      if (n < 0) return i;
    }
  }

  function viewCuttingPoint(cm, oldN, newN, dir) {
    var index = findViewIndex(cm, oldN), diff, view = cm.display.view;
    if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size)
      return {index: index, lineN: newN};
    for (var i = 0, n = cm.display.viewFrom; i < index; i++)
      n += view[i].size;
    if (n != oldN) {
      if (dir > 0) {
        if (index == view.length - 1) return null;
        diff = (n + view[index].size) - oldN;
        index++;
      } else {
        diff = n - oldN;
      }
      oldN += diff; newN += diff;
    }
    while (visualLineNo(cm.doc, newN) != newN) {
      if (index == (dir < 0 ? 0 : view.length - 1)) return null;
      newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
      index += dir;
    }
    return {index: index, lineN: newN};
  }

  // Force the view to cover a given range, adding empty view element
  // or clipping off existing ones as needed.
  function adjustView(cm, from, to) {
    var display = cm.display, view = display.view;
    if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
      display.view = buildViewArray(cm, from, to);
      display.viewFrom = from;
    } else {
      if (display.viewFrom > from)
        display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view);
      else if (display.viewFrom < from)
        display.view = display.view.slice(findViewIndex(cm, from));
      display.viewFrom = from;
      if (display.viewTo < to)
        display.view = display.view.concat(buildViewArray(cm, display.viewTo, to));
      else if (display.viewTo > to)
        display.view = display.view.slice(0, findViewIndex(cm, to));
    }
    display.viewTo = to;
  }

  // Count the number of lines in the view whose DOM representation is
  // out of date (or nonexistent).
  function countDirtyView(cm) {
    var view = cm.display.view, dirty = 0;
    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (!lineView.hidden && (!lineView.node || lineView.changes)) ++dirty;
    }
    return dirty;
  }

  // INPUT HANDLING

  // Poll for input changes, using the normal rate of polling. This
  // runs as long as the editor is focused.
  function slowPoll(cm) {
    if (cm.display.pollingFast) return;
    cm.display.poll.set(cm.options.pollInterval, function() {
      readInput(cm);
      if (cm.state.focused) slowPoll(cm);
    });
  }

  // When an event has just come in that is likely to add or change
  // something in the input textarea, we poll faster, to ensure that
  // the change appears on the screen quickly.
  function fastPoll(cm) {
    var missed = false;
    cm.display.pollingFast = true;
    function p() {
      var changed = readInput(cm);
      if (!changed && !missed) {missed = true; cm.display.poll.set(60, p);}
      else {cm.display.pollingFast = false; slowPoll(cm);}
    }
    cm.display.poll.set(20, p);
  }

  // This will be set to an array of strings when copying, so that,
  // when pasting, we know what kind of selections the copied text
  // was made out of.
  var lastCopied = null;

  // Read input from the textarea, and update the document to match.
  // When something is selected, it is present in the textarea, and
  // selected (unless it is huge, in which case a placeholder is
  // used). When nothing is selected, the cursor sits after previously
  // seen text (can be empty), which is stored in prevInput (we must
  // not reset the textarea when typing, because that breaks IME).
  function readInput(cm) {
    var input = cm.display.input, prevInput = cm.display.prevInput, doc = cm.doc;
    // Since this is called a *lot*, try to bail out as cheaply as
    // possible when it is clear that nothing happened. hasSelection
    // will be the case when there is a lot of text in the textarea,
    // in which case reading its value would be expensive.
    if (!cm.state.focused || (hasSelection(input) && !prevInput) || isReadOnly(cm) || cm.options.disableInput || cm.state.keySeq)
      return false;
    // See paste handler for more on the fakedLastChar kludge
    if (cm.state.pasteIncoming && cm.state.fakedLastChar) {
      input.value = input.value.substring(0, input.value.length - 1);
      cm.state.fakedLastChar = false;
    }
    var text = input.value;
    // If nothing changed, bail.
    if (text == prevInput && !cm.somethingSelected()) return false;
    // Work around nonsensical selection resetting in IE9/10, and
    // inexplicable appearance of private area unicode characters on
    // some key combos in Mac (#2689).
    if (ie && ie_version >= 9 && cm.display.inputHasSelection === text ||
        mac && /[\uf700-\uf7ff]/.test(text)) {
      resetInput(cm);
      return false;
    }

    var withOp = !cm.curOp;
    if (withOp) startOperation(cm);
    cm.display.shift = false;

    if (text.charCodeAt(0) == 0x200b && doc.sel == cm.display.selForContextMenu && !prevInput)
      prevInput = "\u200b";
    // Find the part of the input that is actually new
    var same = 0, l = Math.min(prevInput.length, text.length);
    while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) ++same;
    var inserted = text.slice(same), textLines = splitLines(inserted);

    // When pasing N lines into N selections, insert one line per selection
    var multiPaste = null;
    if (cm.state.pasteIncoming && doc.sel.ranges.length > 1) {
      if (lastCopied && lastCopied.join("\n") == inserted)
        multiPaste = doc.sel.ranges.length % lastCopied.length == 0 && map(lastCopied, splitLines);
      else if (textLines.length == doc.sel.ranges.length)
        multiPaste = map(textLines, function(l) { return [l]; });
    }

    // Normal behavior is to insert the new text into every selection
    for (var i = doc.sel.ranges.length - 1; i >= 0; i--) {
      var range = doc.sel.ranges[i];
      var from = range.from(), to = range.to();
      // Handle deletion
      if (same < prevInput.length)
        from = Pos(from.line, from.ch - (prevInput.length - same));
      // Handle overwrite
      else if (cm.state.overwrite && range.empty() && !cm.state.pasteIncoming)
        to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length));
      var updateInput = cm.curOp.updateInput;
      var changeEvent = {from: from, to: to, text: multiPaste ? multiPaste[i % multiPaste.length] : textLines,
                         origin: cm.state.pasteIncoming ? "paste" : cm.state.cutIncoming ? "cut" : "+input"};
      makeChange(cm.doc, changeEvent);
      signalLater(cm, "inputRead", cm, changeEvent);
      // When an 'electric' character is inserted, immediately trigger a reindent
      if (inserted && !cm.state.pasteIncoming && cm.options.electricChars &&
          cm.options.smartIndent && range.head.ch < 100 &&
          (!i || doc.sel.ranges[i - 1].head.line != range.head.line)) {
        var mode = cm.getModeAt(range.head);
        var end = changeEnd(changeEvent);
        if (mode.electricChars) {
          for (var j = 0; j < mode.electricChars.length; j++)
            if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
              indentLine(cm, end.line, "smart");
              break;
            }
        } else if (mode.electricInput) {
          if (mode.electricInput.test(getLine(doc, end.line).text.slice(0, end.ch)))
            indentLine(cm, end.line, "smart");
        }
      }
    }
    ensureCursorVisible(cm);
    cm.curOp.updateInput = updateInput;
    cm.curOp.typing = true;

    // Don't leave long text in the textarea, since it makes further polling slow
    if (text.length > 1000 || text.indexOf("\n") > -1) input.value = cm.display.prevInput = "";
    else cm.display.prevInput = text;
    if (withOp) endOperation(cm);
    cm.state.pasteIncoming = cm.state.cutIncoming = false;
    return true;
  }

  // Reset the input to correspond to the selection (or to be empty,
  // when not typing and nothing is selected)
  function resetInput(cm, typing) {
    if (cm.display.contextMenuPending) return;
    var minimal, selected, doc = cm.doc;
    if (cm.somethingSelected()) {
      cm.display.prevInput = "";
      var range = doc.sel.primary();
      minimal = hasCopyEvent &&
        (range.to().line - range.from().line > 100 || (selected = cm.getSelection()).length > 1000);
      var content = minimal ? "-" : selected || cm.getSelection();
      cm.display.input.value = content;
      if (cm.state.focused) selectInput(cm.display.input);
      if (ie && ie_version >= 9) cm.display.inputHasSelection = content;
    } else if (!typing) {
      cm.display.prevInput = cm.display.input.value = "";
      if (ie && ie_version >= 9) cm.display.inputHasSelection = null;
    }
    cm.display.inaccurateSelection = minimal;
  }

  function focusInput(cm) {
    if (cm.options.readOnly != "nocursor" && (!mobile || activeElt() != cm.display.input))
      cm.display.input.focus();
  }

  function ensureFocus(cm) {
    if (!cm.state.focused) { focusInput(cm); onFocus(cm); }
  }

  function isReadOnly(cm) {
    return cm.options.readOnly || cm.doc.cantEdit;
  }

  // EVENT HANDLERS

  // Attach the necessary event handlers when initializing the editor
  function registerEventHandlers(cm) {
    var d = cm.display;
    on(d.scroller, "mousedown", operation(cm, onMouseDown));
    // Older IE's will not fire a second mousedown for a double click
    if (ie && ie_version < 11)
      on(d.scroller, "dblclick", operation(cm, function(e) {
        if (signalDOMEvent(cm, e)) return;
        var pos = posFromMouse(cm, e);
        if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) return;
        e_preventDefault(e);
        var word = cm.findWordAt(pos);
        extendSelection(cm.doc, word.anchor, word.head);
      }));
    else
      on(d.scroller, "dblclick", function(e) { signalDOMEvent(cm, e) || e_preventDefault(e); });
    // Prevent normal selection in the editor (we handle our own)
    on(d.lineSpace, "selectstart", function(e) {
      if (!eventInWidget(d, e)) e_preventDefault(e);
    });
    // Some browsers fire contextmenu *after* opening the menu, at
    // which point we can't mess with it anymore. Context menu is
    // handled in onMouseDown for these browsers.
    if (!captureRightClick) on(d.scroller, "contextmenu", function(e) {onContextMenu(cm, e);});

    // Sync scrolling between fake scrollbars and real scrollable
    // area, ensure viewport is updated when scrolling.
    on(d.scroller, "scroll", function() {
      if (d.scroller.clientHeight) {
        setScrollTop(cm, d.scroller.scrollTop);
        setScrollLeft(cm, d.scroller.scrollLeft, true);
        signal(cm, "scroll", cm);
      }
    });

    // Listen to wheel events in order to try and update the viewport on time.
    on(d.scroller, "mousewheel", function(e){onScrollWheel(cm, e);});
    on(d.scroller, "DOMMouseScroll", function(e){onScrollWheel(cm, e);});

    // Prevent wrapper from ever scrolling
    on(d.wrapper, "scroll", function() { d.wrapper.scrollTop = d.wrapper.scrollLeft = 0; });

    on(d.input, "keyup", function(e) { onKeyUp.call(cm, e); });
    on(d.input, "input", function() {
      if (ie && ie_version >= 9 && cm.display.inputHasSelection) cm.display.inputHasSelection = null;
      readInput(cm);
    });
    on(d.input, "keydown", operation(cm, onKeyDown));
    on(d.input, "keypress", operation(cm, onKeyPress));
    on(d.input, "focus", bind(onFocus, cm));
    on(d.input, "blur", bind(onBlur, cm));

    function drag_(e) {
      if (!signalDOMEvent(cm, e)) e_stop(e);
    }
    if (cm.options.dragDrop) {
      on(d.scroller, "dragstart", function(e){onDragStart(cm, e);});
      on(d.scroller, "dragenter", drag_);
      on(d.scroller, "dragover", drag_);
      on(d.scroller, "drop", operation(cm, onDrop));
    }
    on(d.scroller, "paste", function(e) {
      if (eventInWidget(d, e)) return;
      cm.state.pasteIncoming = true;
      focusInput(cm);
      fastPoll(cm);
    });
    on(d.input, "paste", function() {
      // Workaround for webkit bug https://bugs.webkit.org/show_bug.cgi?id=90206
      // Add a char to the end of textarea before paste occur so that
      // selection doesn't span to the end of textarea.
      if (webkit && !cm.state.fakedLastChar && !(new Date - cm.state.lastMiddleDown < 200)) {
        var start = d.input.selectionStart, end = d.input.selectionEnd;
        d.input.value += "$";
        // The selection end needs to be set before the start, otherwise there
        // can be an intermediate non-empty selection between the two, which
        // can override the middle-click paste buffer on linux and cause the
        // wrong thing to get pasted.
        d.input.selectionEnd = end;
        d.input.selectionStart = start;
        cm.state.fakedLastChar = true;
      }
      cm.state.pasteIncoming = true;
      fastPoll(cm);
    });

    function prepareCopyCut(e) {
      if (cm.somethingSelected()) {
        lastCopied = cm.getSelections();
        if (d.inaccurateSelection) {
          d.prevInput = "";
          d.inaccurateSelection = false;
          d.input.value = lastCopied.join("\n");
          selectInput(d.input);
        }
      } else {
        var text = [], ranges = [];
        for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
          var line = cm.doc.sel.ranges[i].head.line;
          var lineRange = {anchor: Pos(line, 0), head: Pos(line + 1, 0)};
          ranges.push(lineRange);
          text.push(cm.getRange(lineRange.anchor, lineRange.head));
        }
        if (e.type == "cut") {
          cm.setSelections(ranges, null, sel_dontScroll);
        } else {
          d.prevInput = "";
          d.input.value = text.join("\n");
          selectInput(d.input);
        }
        lastCopied = text;
      }
      if (e.type == "cut") cm.state.cutIncoming = true;
    }
    on(d.input, "cut", prepareCopyCut);
    on(d.input, "copy", prepareCopyCut);

    // Needed to handle Tab key in KHTML
    if (khtml) on(d.sizer, "mouseup", function() {
      if (activeElt() == d.input) d.input.blur();
      focusInput(cm);
    });
  }

  // Called when the window resizes
  function onResize(cm) {
    var d = cm.display;
    if (d.lastWrapHeight == d.wrapper.clientHeight && d.lastWrapWidth == d.wrapper.clientWidth)
      return;
    // Might be a text scaling operation, clear size caches.
    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
    d.scrollbarsClipped = false;
    cm.setSize();
  }

  // MOUSE EVENTS

  // Return true when the given mouse event happened in a widget
  function eventInWidget(display, e) {
    for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
      if (!n || (n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true") ||
          (n.parentNode == display.sizer && n != display.mover))
        return true;
    }
  }

  // Given a mouse event, find the corresponding position. If liberal
  // is false, it checks whether a gutter or scrollbar was clicked,
  // and returns null if it was. forRect is used by rectangular
  // selections, and tries to estimate a character position even for
  // coordinates beyond the right of the text.
  function posFromMouse(cm, e, liberal, forRect) {
    var display = cm.display;
    if (!liberal && e_target(e).getAttribute("not-content") == "true") return null;

    var x, y, space = display.lineSpace.getBoundingClientRect();
    // Fails unpredictably on IE[67] when mouse is dragged around quickly.
    try { x = e.clientX - space.left; y = e.clientY - space.top; }
    catch (e) { return null; }
    var coords = coordsChar(cm, x, y), line;
    if (forRect && coords.xRel == 1 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
      var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
      coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
    }
    return coords;
  }

  // A mouse down can be a single click, double click, triple click,
  // start of selection drag, start of text drag, new cursor
  // (ctrl-click), rectangle drag (alt-drag), or xwin
  // middle-click-paste. Or it might be a click on something we should
  // not interfere with, such as a scrollbar or widget.
  function onMouseDown(e) {
    if (signalDOMEvent(this, e)) return;
    var cm = this, display = cm.display;
    display.shift = e.shiftKey;

    if (eventInWidget(display, e)) {
      if (!webkit) {
        // Briefly turn off draggability, to allow widgets to do
        // normal dragging things.
        display.scroller.draggable = false;
        setTimeout(function(){display.scroller.draggable = true;}, 100);
      }
      return;
    }
    if (clickInGutter(cm, e)) return;
    var start = posFromMouse(cm, e);
    window.focus();

    switch (e_button(e)) {
    case 1:
      if (start)
        leftButtonDown(cm, e, start);
      else if (e_target(e) == display.scroller)
        e_preventDefault(e);
      break;
    case 2:
      if (webkit) cm.state.lastMiddleDown = +new Date;
      if (start) extendSelection(cm.doc, start);
      setTimeout(bind(focusInput, cm), 20);
      e_preventDefault(e);
      break;
    case 3:
      if (captureRightClick) onContextMenu(cm, e);
      break;
    }
  }

  var lastClick, lastDoubleClick;
  function leftButtonDown(cm, e, start) {
    setTimeout(bind(ensureFocus, cm), 0);

    var now = +new Date, type;
    if (lastDoubleClick && lastDoubleClick.time > now - 400 && cmp(lastDoubleClick.pos, start) == 0) {
      type = "triple";
    } else if (lastClick && lastClick.time > now - 400 && cmp(lastClick.pos, start) == 0) {
      type = "double";
      lastDoubleClick = {time: now, pos: start};
    } else {
      type = "single";
      lastClick = {time: now, pos: start};
    }

    var sel = cm.doc.sel, modifier = mac ? e.metaKey : e.ctrlKey, contained;
    if (cm.options.dragDrop && dragAndDrop && !isReadOnly(cm) &&
        type == "single" && (contained = sel.contains(start)) > -1 &&
        !sel.ranges[contained].empty())
      leftButtonStartDrag(cm, e, start, modifier);
    else
      leftButtonSelect(cm, e, start, type, modifier);
  }

  // Start a text drag. When it ends, see if any dragging actually
  // happen, and treat as a click if it didn't.
  function leftButtonStartDrag(cm, e, start, modifier) {
    var display = cm.display;
    var dragEnd = operation(cm, function(e2) {
      if (webkit) display.scroller.draggable = false;
      cm.state.draggingText = false;
      off(document, "mouseup", dragEnd);
      off(display.scroller, "drop", dragEnd);
      if (Math.abs(e.clientX - e2.clientX) + Math.abs(e.clientY - e2.clientY) < 10) {
        e_preventDefault(e2);
        if (!modifier)
          extendSelection(cm.doc, start);
        focusInput(cm);
        // Work around unexplainable focus problem in IE9 (#2127)
        if (ie && ie_version == 9)
          setTimeout(function() {document.body.focus(); focusInput(cm);}, 20);
      }
    });
    // Let the drag handler handle this.
    if (webkit) display.scroller.draggable = true;
    cm.state.draggingText = dragEnd;
    // IE's approach to draggable
    if (display.scroller.dragDrop) display.scroller.dragDrop();
    on(document, "mouseup", dragEnd);
    on(display.scroller, "drop", dragEnd);
  }

  // Normal selection, as opposed to text dragging.
  function leftButtonSelect(cm, e, start, type, addNew) {
    var display = cm.display, doc = cm.doc;
    e_preventDefault(e);

    var ourRange, ourIndex, startSel = doc.sel, ranges = startSel.ranges;
    if (addNew && !e.shiftKey) {
      ourIndex = doc.sel.contains(start);
      if (ourIndex > -1)
        ourRange = ranges[ourIndex];
      else
        ourRange = new Range(start, start);
    } else {
      ourRange = doc.sel.primary();
    }

    if (e.altKey) {
      type = "rect";
      if (!addNew) ourRange = new Range(start, start);
      start = posFromMouse(cm, e, true, true);
      ourIndex = -1;
    } else if (type == "double") {
      var word = cm.findWordAt(start);
      if (cm.display.shift || doc.extend)
        ourRange = extendRange(doc, ourRange, word.anchor, word.head);
      else
        ourRange = word;
    } else if (type == "triple") {
      var line = new Range(Pos(start.line, 0), clipPos(doc, Pos(start.line + 1, 0)));
      if (cm.display.shift || doc.extend)
        ourRange = extendRange(doc, ourRange, line.anchor, line.head);
      else
        ourRange = line;
    } else {
      ourRange = extendRange(doc, ourRange, start);
    }

    if (!addNew) {
      ourIndex = 0;
      setSelection(doc, new Selection([ourRange], 0), sel_mouse);
      startSel = doc.sel;
    } else if (ourIndex == -1) {
      ourIndex = ranges.length;
      setSelection(doc, normalizeSelection(ranges.concat([ourRange]), ourIndex),
                   {scroll: false, origin: "*mouse"});
    } else if (ranges.length > 1 && ranges[ourIndex].empty() && type == "single") {
      setSelection(doc, normalizeSelection(ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0));
      startSel = doc.sel;
    } else {
      replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
    }

    var lastPos = start;
    function extendTo(pos) {
      if (cmp(lastPos, pos) == 0) return;
      lastPos = pos;

      if (type == "rect") {
        var ranges = [], tabSize = cm.options.tabSize;
        var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
        var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
        var left = Math.min(startCol, posCol), right = Math.max(startCol, posCol);
        for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line));
             line <= end; line++) {
          var text = getLine(doc, line).text, leftPos = findColumn(text, left, tabSize);
          if (left == right)
            ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos)));
          else if (text.length > leftPos)
            ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize))));
        }
        if (!ranges.length) ranges.push(new Range(start, start));
        setSelection(doc, normalizeSelection(startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex),
                     {origin: "*mouse", scroll: false});
        cm.scrollIntoView(pos);
      } else {
        var oldRange = ourRange;
        var anchor = oldRange.anchor, head = pos;
        if (type != "single") {
          if (type == "double")
            var range = cm.findWordAt(pos);
          else
            var range = new Range(Pos(pos.line, 0), clipPos(doc, Pos(pos.line + 1, 0)));
          if (cmp(range.anchor, anchor) > 0) {
            head = range.head;
            anchor = minPos(oldRange.from(), range.anchor);
          } else {
            head = range.anchor;
            anchor = maxPos(oldRange.to(), range.head);
          }
        }
        var ranges = startSel.ranges.slice(0);
        ranges[ourIndex] = new Range(clipPos(doc, anchor), head);
        setSelection(doc, normalizeSelection(ranges, ourIndex), sel_mouse);
      }
    }

    var editorSize = display.wrapper.getBoundingClientRect();
    // Used to ensure timeout re-tries don't fire when another extend
    // happened in the meantime (clearTimeout isn't reliable -- at
    // least on Chrome, the timeouts still happen even when cleared,
    // if the clear happens after their scheduled firing time).
    var counter = 0;

    function extend(e) {
      var curCount = ++counter;
      var cur = posFromMouse(cm, e, true, type == "rect");
      if (!cur) return;
      if (cmp(cur, lastPos) != 0) {
        ensureFocus(cm);
        extendTo(cur);
        var visible = visibleLines(display, doc);
        if (cur.line >= visible.to || cur.line < visible.from)
          setTimeout(operation(cm, function(){if (counter == curCount) extend(e);}), 150);
      } else {
        var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;
        if (outside) setTimeout(operation(cm, function() {
          if (counter != curCount) return;
          display.scroller.scrollTop += outside;
          extend(e);
        }), 50);
      }
    }

    function done(e) {
      counter = Infinity;
      e_preventDefault(e);
      focusInput(cm);
      off(document, "mousemove", move);
      off(document, "mouseup", up);
      doc.history.lastSelOrigin = null;
    }

    var move = operation(cm, function(e) {
      if (!e_button(e)) done(e);
      else extend(e);
    });
    var up = operation(cm, done);
    on(document, "mousemove", move);
    on(document, "mouseup", up);
  }

  // Determines whether an event happened in the gutter, and fires the
  // handlers for the corresponding event.
  function gutterEvent(cm, e, type, prevent, signalfn) {
    try { var mX = e.clientX, mY = e.clientY; }
    catch(e) { return false; }
    if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) return false;
    if (prevent) e_preventDefault(e);

    var display = cm.display;
    var lineBox = display.lineDiv.getBoundingClientRect();

    if (mY > lineBox.bottom || !hasHandler(cm, type)) return e_defaultPrevented(e);
    mY -= lineBox.top - display.viewOffset;

    for (var i = 0; i < cm.options.gutters.length; ++i) {
      var g = display.gutters.childNodes[i];
      if (g && g.getBoundingClientRect().right >= mX) {
        var line = lineAtHeight(cm.doc, mY);
        var gutter = cm.options.gutters[i];
        signalfn(cm, type, cm, line, gutter, e);
        return e_defaultPrevented(e);
      }
    }
  }

  function clickInGutter(cm, e) {
    return gutterEvent(cm, e, "gutterClick", true, signalLater);
  }

  // Kludge to work around strange IE behavior where it'll sometimes
  // re-fire a series of drag-related events right after the drop (#1551)
  var lastDrop = 0;

  function onDrop(e) {
    var cm = this;
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e))
      return;
    e_preventDefault(e);
    if (ie) lastDrop = +new Date;
    var pos = posFromMouse(cm, e, true), files = e.dataTransfer.files;
    if (!pos || isReadOnly(cm)) return;
    // Might be a file drop, in which case we simply extract the text
    // and insert it.
    if (files && files.length && window.FileReader && window.File) {
      var n = files.length, text = Array(n), read = 0;
      var loadFile = function(file, i) {
        var reader = new FileReader;
        reader.onload = operation(cm, function() {
          text[i] = reader.result;
          if (++read == n) {
            pos = clipPos(cm.doc, pos);
            var change = {from: pos, to: pos, text: splitLines(text.join("\n")), origin: "paste"};
            makeChange(cm.doc, change);
            setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)));
          }
        });
        reader.readAsText(file);
      };
      for (var i = 0; i < n; ++i) loadFile(files[i], i);
    } else { // Normal drop
      // Don't do a replace if the drop happened inside of the selected text.
      if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
        cm.state.draggingText(e);
        // Ensure the editor is re-focused
        setTimeout(bind(focusInput, cm), 20);
        return;
      }
      try {
        var text = e.dataTransfer.getData("Text");
        if (text) {
          if (cm.state.draggingText && !(mac ? e.metaKey : e.ctrlKey))
            var selected = cm.listSelections();
          setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));
          if (selected) for (var i = 0; i < selected.length; ++i)
            replaceRange(cm.doc, "", selected[i].anchor, selected[i].head, "drag");
          cm.replaceSelection(text, "around", "paste");
          focusInput(cm);
        }
      }
      catch(e){}
    }
  }

  function onDragStart(cm, e) {
    if (ie && (!cm.state.draggingText || +new Date - lastDrop < 100)) { e_stop(e); return; }
    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) return;

    e.dataTransfer.setData("Text", cm.getSelection());

    // Use dummy image instead of default browsers image.
    // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.
    if (e.dataTransfer.setDragImage && !safari) {
      var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
      img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
      if (presto) {
        img.width = img.height = 1;
        cm.display.wrapper.appendChild(img);
        // Force a relayout, or Opera won't use our image for some obscure reason
        img._top = img.offsetTop;
      }
      e.dataTransfer.setDragImage(img, 0, 0);
      if (presto) img.parentNode.removeChild(img);
    }
  }

  // SCROLL EVENTS

  // Sync the scrollable area and scrollbars, ensure the viewport
  // covers the visible area.
  function setScrollTop(cm, val) {
    if (Math.abs(cm.doc.scrollTop - val) < 2) return;
    cm.doc.scrollTop = val;
    if (!gecko) updateDisplaySimple(cm, {top: val});
    if (cm.display.scroller.scrollTop != val) cm.display.scroller.scrollTop = val;
    cm.display.scrollbars.setScrollTop(val);
    if (gecko) updateDisplaySimple(cm);
    startWorker(cm, 100);
  }
  // Sync scroller and scrollbar, ensure the gutter elements are
  // aligned.
  function setScrollLeft(cm, val, isScroller) {
    if (isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) return;
    val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth);
    cm.doc.scrollLeft = val;
    alignHorizontally(cm);
    if (cm.display.scroller.scrollLeft != val) cm.display.scroller.scrollLeft = val;
    cm.display.scrollbars.setScrollLeft(val);
  }

  // Since the delta values reported on mouse wheel events are
  // unstandardized between browsers and even browser versions, and
  // generally horribly unpredictable, this code starts by measuring
  // the scroll effect that the first few mouse wheel events have,
  // and, from that, detects the way it can convert deltas to pixel
  // offsets afterwards.
  //
  // The reason we want to know the amount a wheel event will scroll
  // is that it gives us a chance to update the display before the
  // actual scrolling happens, reducing flickering.

  var wheelSamples = 0, wheelPixelsPerUnit = null;
  // Fill in a browser-detected starting value on browsers where we
  // know one. These don't have to be accurate -- the result of them
  // being wrong would just be a slight flicker on the first wheel
  // scroll (if it is large enough).
  if (ie) wheelPixelsPerUnit = -.53;
  else if (gecko) wheelPixelsPerUnit = 15;
  else if (chrome) wheelPixelsPerUnit = -.7;
  else if (safari) wheelPixelsPerUnit = -1/3;

  var wheelEventDelta = function(e) {
    var dx = e.wheelDeltaX, dy = e.wheelDeltaY;
    if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) dx = e.detail;
    if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) dy = e.detail;
    else if (dy == null) dy = e.wheelDelta;
    return {x: dx, y: dy};
  };
  CodeMirror.wheelEventPixels = function(e) {
    var delta = wheelEventDelta(e);
    delta.x *= wheelPixelsPerUnit;
    delta.y *= wheelPixelsPerUnit;
    return delta;
  };

  function onScrollWheel(cm, e) {
    var delta = wheelEventDelta(e), dx = delta.x, dy = delta.y;

    var display = cm.display, scroll = display.scroller;
    // Quit if there's nothing to scroll here
    if (!(dx && scroll.scrollWidth > scroll.clientWidth ||
          dy && scroll.scrollHeight > scroll.clientHeight)) return;

    // Webkit browsers on OS X abort momentum scrolls when the target
    // of the scroll event is removed from the scrollable element.
    // This hack (see related code in patchDisplay) makes sure the
    // element is kept around.
    if (dy && mac && webkit) {
      outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
        for (var i = 0; i < view.length; i++) {
          if (view[i].node == cur) {
            cm.display.currentWheelTarget = cur;
            break outer;
          }
        }
      }
    }

    // On some browsers, horizontal scrolling will cause redraws to
    // happen before the gutter has been realigned, causing it to
    // wriggle around in a most unseemly way. When we have an
    // estimated pixels/delta value, we just handle horizontal
    // scrolling entirely here. It'll be slightly off from native, but
    // better than glitching out.
    if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
      if (dy)
        setScrollTop(cm, Math.max(0, Math.min(scroll.scrollTop + dy * wheelPixelsPerUnit, scroll.scrollHeight - scroll.clientHeight)));
      setScrollLeft(cm, Math.max(0, Math.min(scroll.scrollLeft + dx * wheelPixelsPerUnit, scroll.scrollWidth - scroll.clientWidth)));
      e_preventDefault(e);
      display.wheelStartX = null; // Abort measurement, if in progress
      return;
    }

    // 'Project' the visible viewport to cover the area that is being
    // scrolled into view (if we know enough to estimate it).
    if (dy && wheelPixelsPerUnit != null) {
      var pixels = dy * wheelPixelsPerUnit;
      var top = cm.doc.scrollTop, bot = top + display.wrapper.clientHeight;
      if (pixels < 0) top = Math.max(0, top + pixels - 50);
      else bot = Math.min(cm.doc.height, bot + pixels + 50);
      updateDisplaySimple(cm, {top: top, bottom: bot});
    }

    if (wheelSamples < 20) {
      if (display.wheelStartX == null) {
        display.wheelStartX = scroll.scrollLeft; display.wheelStartY = scroll.scrollTop;
        display.wheelDX = dx; display.wheelDY = dy;
        setTimeout(function() {
          if (display.wheelStartX == null) return;
          var movedX = scroll.scrollLeft - display.wheelStartX;
          var movedY = scroll.scrollTop - display.wheelStartY;
          var sample = (movedY && display.wheelDY && movedY / display.wheelDY) ||
            (movedX && display.wheelDX && movedX / display.wheelDX);
          display.wheelStartX = display.wheelStartY = null;
          if (!sample) return;
          wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
          ++wheelSamples;
        }, 200);
      } else {
        display.wheelDX += dx; display.wheelDY += dy;
      }
    }
  }

  // KEY EVENTS

  // Run a handler that was bound to a key.
  function doHandleBinding(cm, bound, dropShift) {
    if (typeof bound == "string") {
      bound = commands[bound];
      if (!bound) return false;
    }
    // Ensure previous input has been read, so that the handler sees a
    // consistent view of the document
    if (cm.display.pollingFast && readInput(cm)) cm.display.pollingFast = false;
    var prevShift = cm.display.shift, done = false;
    try {
      if (isReadOnly(cm)) cm.state.suppressEdits = true;
      if (dropShift) cm.display.shift = false;
      done = bound(cm) != Pass;
    } finally {
      cm.display.shift = prevShift;
      cm.state.suppressEdits = false;
    }
    return done;
  }

  function lookupKeyForEditor(cm, name, handle) {
    for (var i = 0; i < cm.state.keyMaps.length; i++) {
      var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);
      if (result) return result;
    }
    return (cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm))
      || lookupKey(name, cm.options.keyMap, handle, cm);
  }

  var stopSeq = new Delayed;
  function dispatchKey(cm, name, e, handle) {
    var seq = cm.state.keySeq;
    if (seq) {
      if (isModifierKey(name)) return "handled";
      stopSeq.set(50, function() {
        if (cm.state.keySeq == seq) {
          cm.state.keySeq = null;
          resetInput(cm);
        }
      });
      name = seq + " " + name;
    }
    var result = lookupKeyForEditor(cm, name, handle);

    if (result == "multi")
      cm.state.keySeq = name;
    if (result == "handled")
      signalLater(cm, "keyHandled", cm, name, e);

    if (result == "handled" || result == "multi") {
      e_preventDefault(e);
      restartBlink(cm);
    }

    if (seq && !result && /\'$/.test(name)) {
      e_preventDefault(e);
      return true;
    }
    return !!result;
  }

  // Handle a key from the keydown event.
  function handleKeyBinding(cm, e) {
    var name = keyName(e, true);
    if (!name) return false;

    if (e.shiftKey && !cm.state.keySeq) {
      // First try to resolve full name (including 'Shift-'). Failing
      // that, see if there is a cursor-motion command (starting with
      // 'go') bound to the keyname without 'Shift-'.
      return dispatchKey(cm, "Shift-" + name, e, function(b) {return doHandleBinding(cm, b, true);})
          || dispatchKey(cm, name, e, function(b) {
               if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion)
                 return doHandleBinding(cm, b);
             });
    } else {
      return dispatchKey(cm, name, e, function(b) { return doHandleBinding(cm, b); });
    }
  }

  // Handle a key from the keypress event
  function handleCharBinding(cm, e, ch) {
    return dispatchKey(cm, "'" + ch + "'", e,
                       function(b) { return doHandleBinding(cm, b, true); });
  }

  var lastStoppedKey = null;
  function onKeyDown(e) {
    var cm = this;
    ensureFocus(cm);
    if (signalDOMEvent(cm, e)) return;
    // IE does strange things with escape.
    if (ie && ie_version < 11 && e.keyCode == 27) e.returnValue = false;
    var code = e.keyCode;
    cm.display.shift = code == 16 || e.shiftKey;
    var handled = handleKeyBinding(cm, e);
    if (presto) {
      lastStoppedKey = handled ? code : null;
      // Opera has no cut event... we try to at least catch the key combo
      if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey))
        cm.replaceSelection("", null, "cut");
    }

    // Turn mouse into crosshair when Alt is held on Mac.
    if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className))
      showCrossHair(cm);
  }

  function showCrossHair(cm) {
    var lineDiv = cm.display.lineDiv;
    addClass(lineDiv, "CodeMirror-crosshair");

    function up(e) {
      if (e.keyCode == 18 || !e.altKey) {
        rmClass(lineDiv, "CodeMirror-crosshair");
        off(document, "keyup", up);
        off(document, "mouseover", up);
      }
    }
    on(document, "keyup", up);
    on(document, "mouseover", up);
  }

  function onKeyUp(e) {
    if (e.keyCode == 16) this.doc.sel.shift = false;
    signalDOMEvent(this, e);
  }

  function onKeyPress(e) {
    var cm = this;
    if (signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) return;
    var keyCode = e.keyCode, charCode = e.charCode;
    if (presto && keyCode == lastStoppedKey) {lastStoppedKey = null; e_preventDefault(e); return;}
    if (((presto && (!e.which || e.which < 10)) || khtml) && handleKeyBinding(cm, e)) return;
    var ch = String.fromCharCode(charCode == null ? keyCode : charCode);
    if (handleCharBinding(cm, e, ch)) return;
    if (ie && ie_version >= 9) cm.display.inputHasSelection = null;
    fastPoll(cm);
  }

  // FOCUS/BLUR EVENTS

  function onFocus(cm) {
    if (cm.options.readOnly == "nocursor") return;
    if (!cm.state.focused) {
      signal(cm, "focus", cm);
      cm.state.focused = true;
      addClass(cm.display.wrapper, "CodeMirror-focused");
      // The prevInput test prevents this from firing when a context
      // menu is closed (since the resetInput would kill the
      // select-all detection hack)
      if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
        resetInput(cm);
        if (webkit) setTimeout(bind(resetInput, cm, true), 0); // Issue #1730
      }
    }
    slowPoll(cm);
    restartBlink(cm);
  }
  function onBlur(cm) {
    if (cm.state.focused) {
      signal(cm, "blur", cm);
      cm.state.focused = false;
      rmClass(cm.display.wrapper, "CodeMirror-focused");
    }
    clearInterval(cm.display.blinker);
    setTimeout(function() {if (!cm.state.focused) cm.display.shift = false;}, 150);
  }

  // CONTEXT MENU HANDLING

  // To make the context menu work, we need to briefly unhide the
  // textarea (making it as unobtrusive as possible) to let the
  // right-click take effect on it.
  function onContextMenu(cm, e) {
    if (signalDOMEvent(cm, e, "contextmenu")) return;
    var display = cm.display;
    if (eventInWidget(display, e) || contextMenuInGutter(cm, e)) return;

    var pos = posFromMouse(cm, e), scrollPos = display.scroller.scrollTop;
    if (!pos || presto) return; // Opera is difficult.

    // Reset the current text selection only if the click is done outside of the selection
    // and 'resetSelectionOnContextMenu' option is true.
    var reset = cm.options.resetSelectionOnContextMenu;
    if (reset && cm.doc.sel.contains(pos) == -1)
      operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll);

    var oldCSS = display.input.style.cssText;
    display.inputDiv.style.position = "absolute";
    display.input.style.cssText = "position: fixed; width: 30px; height: 30px; top: " + (e.clientY - 5) +
      "px; left: " + (e.clientX - 5) + "px; z-index: 1000; background: " +
      (ie ? "rgba(255, 255, 255, .05)" : "transparent") +
      "; outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
    if (webkit) var oldScrollY = window.scrollY; // Work around Chrome issue (#2712)
    focusInput(cm);
    if (webkit) window.scrollTo(null, oldScrollY);
    resetInput(cm);
    // Adds "Select all" to context menu in FF
    if (!cm.somethingSelected()) display.input.value = display.prevInput = " ";
    display.contextMenuPending = true;
    display.selForContextMenu = cm.doc.sel;
    clearTimeout(display.detectingSelectAll);

    // Select-all will be greyed out if there's nothing to select, so
    // this adds a zero-width space so that we can later check whether
    // it got selected.
    function prepareSelectAllHack() {
      if (display.input.selectionStart != null) {
        var selected = cm.somethingSelected();
        var extval = display.input.value = "\u200b" + (selected ? display.input.value : "");
        display.prevInput = selected ? "" : "\u200b";
        display.input.selectionStart = 1; display.input.selectionEnd = extval.length;
        // Re-set this, in case some other handler touched the
        // selection in the meantime.
        display.selForContextMenu = cm.doc.sel;
      }
    }
    function rehide() {
      display.contextMenuPending = false;
      display.inputDiv.style.position = "relative";
      display.input.style.cssText = oldCSS;
      if (ie && ie_version < 9) display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos);
      slowPoll(cm);

      // Try to detect the user choosing select-all
      if (display.input.selectionStart != null) {
        if (!ie || (ie && ie_version < 9)) prepareSelectAllHack();
        var i = 0, poll = function() {
          if (display.selForContextMenu == cm.doc.sel && display.input.selectionStart == 0)
            operation(cm, commands.selectAll)(cm);
          else if (i++ < 10) display.detectingSelectAll = setTimeout(poll, 500);
          else resetInput(cm);
        };
        display.detectingSelectAll = setTimeout(poll, 200);
      }
    }

    if (ie && ie_version >= 9) prepareSelectAllHack();
    if (captureRightClick) {
      e_stop(e);
      var mouseup = function() {
        off(window, "mouseup", mouseup);
        setTimeout(rehide, 20);
      };
      on(window, "mouseup", mouseup);
    } else {
      setTimeout(rehide, 50);
    }
  }

  function contextMenuInGutter(cm, e) {
    if (!hasHandler(cm, "gutterContextMenu")) return false;
    return gutterEvent(cm, e, "gutterContextMenu", false, signal);
  }

  // UPDATING

  // Compute the position of the end of a change (its 'to' property
  // refers to the pre-change end).
  var changeEnd = CodeMirror.changeEnd = function(change) {
    if (!change.text) return change.to;
    return Pos(change.from.line + change.text.length - 1,
               lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0));
  };

  // Adjust a position to refer to the post-change position of the
  // same text, or the end of the change if the change covers it.
  function adjustForChange(pos, change) {
    if (cmp(pos, change.from) < 0) return pos;
    if (cmp(pos, change.to) <= 0) return changeEnd(change);

    var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1, ch = pos.ch;
    if (pos.line == change.to.line) ch += changeEnd(change).ch - change.to.ch;
    return Pos(line, ch);
  }

  function computeSelAfterChange(doc, change) {
    var out = [];
    for (var i = 0; i < doc.sel.ranges.length; i++) {
      var range = doc.sel.ranges[i];
      out.push(new Range(adjustForChange(range.anchor, change),
                         adjustForChange(range.head, change)));
    }
    return normalizeSelection(out, doc.sel.primIndex);
  }

  function offsetPos(pos, old, nw) {
    if (pos.line == old.line)
      return Pos(nw.line, pos.ch - old.ch + nw.ch);
    else
      return Pos(nw.line + (pos.line - old.line), pos.ch);
  }

  // Used by replaceSelections to allow moving the selection to the
  // start or around the replaced test. Hint may be "start" or "around".
  function computeReplacedSel(doc, changes, hint) {
    var out = [];
    var oldPrev = Pos(doc.first, 0), newPrev = oldPrev;
    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      var from = offsetPos(change.from, oldPrev, newPrev);
      var to = offsetPos(changeEnd(change), oldPrev, newPrev);
      oldPrev = change.to;
      newPrev = to;
      if (hint == "around") {
        var range = doc.sel.ranges[i], inv = cmp(range.head, range.anchor) < 0;
        out[i] = new Range(inv ? to : from, inv ? from : to);
      } else {
        out[i] = new Range(from, from);
      }
    }
    return new Selection(out, doc.sel.primIndex);
  }

  // Allow "beforeChange" event handlers to influence a change
  function filterChange(doc, change, update) {
    var obj = {
      canceled: false,
      from: change.from,
      to: change.to,
      text: change.text,
      origin: change.origin,
      cancel: function() { this.canceled = true; }
    };
    if (update) obj.update = function(from, to, text, origin) {
      if (from) this.from = clipPos(doc, from);
      if (to) this.to = clipPos(doc, to);
      if (text) this.text = text;
      if (origin !== undefined) this.origin = origin;
    };
    signal(doc, "beforeChange", doc, obj);
    if (doc.cm) signal(doc.cm, "beforeChange", doc.cm, obj);

    if (obj.canceled) return null;
    return {from: obj.from, to: obj.to, text: obj.text, origin: obj.origin};
  }

  // Apply a change to a document, and add it to the document's
  // history, and propagating it to all linked documents.
  function makeChange(doc, change, ignoreReadOnly) {
    if (doc.cm) {
      if (!doc.cm.curOp) return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly);
      if (doc.cm.state.suppressEdits) return;
    }

    if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
      change = filterChange(doc, change, true);
      if (!change) return;
    }

    // Possibly split or suppress the update based on the presence
    // of read-only spans in its range.
    var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);
    if (split) {
      for (var i = split.length - 1; i >= 0; --i)
        makeChangeInner(doc, {from: split[i].from, to: split[i].to, text: i ? [""] : change.text});
    } else {
      makeChangeInner(doc, change);
    }
  }

  function makeChangeInner(doc, change) {
    if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) return;
    var selAfter = computeSelAfterChange(doc, change);
    addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);

    makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
    var rebased = [];

    linkedDocs(doc, function(doc, sharedHist) {
      if (!sharedHist && indexOf(rebased, doc.history) == -1) {
        rebaseHist(doc.history, change);
        rebased.push(doc.history);
      }
      makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change));
    });
  }

  // Revert a change stored in a document's history.
  function makeChangeFromHistory(doc, type, allowSelectionOnly) {
    if (doc.cm && doc.cm.state.suppressEdits) return;

    var hist = doc.history, event, selAfter = doc.sel;
    var source = type == "undo" ? hist.done : hist.undone, dest = type == "undo" ? hist.undone : hist.done;

    // Verify that there is a useable event (so that ctrl-z won't
    // needlessly clear selection events)
    for (var i = 0; i < source.length; i++) {
      event = source[i];
      if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges)
        break;
    }
    if (i == source.length) return;
    hist.lastOrigin = hist.lastSelOrigin = null;

    for (;;) {
      event = source.pop();
      if (event.ranges) {
        pushSelectionToHistory(event, dest);
        if (allowSelectionOnly && !event.equals(doc.sel)) {
          setSelection(doc, event, {clearRedo: false});
          return;
        }
        selAfter = event;
      }
      else break;
    }

    // Build up a reverse change object to add to the opposite history
    // stack (redo when undoing, and vice versa).
    var antiChanges = [];
    pushSelectionToHistory(selAfter, dest);
    dest.push({changes: antiChanges, generation: hist.generation});
    hist.generation = event.generation || ++hist.maxGeneration;

    var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

    for (var i = event.changes.length - 1; i >= 0; --i) {
      var change = event.changes[i];
      change.origin = type;
      if (filter && !filterChange(doc, change, false)) {
        source.length = 0;
        return;
      }

      antiChanges.push(historyChangeFromChange(doc, change));

      var after = i ? computeSelAfterChange(doc, change) : lst(source);
      makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));
      if (!i && doc.cm) doc.cm.scrollIntoView({from: change.from, to: changeEnd(change)});
      var rebased = [];

      // Propagate to the linked documents
      linkedDocs(doc, function(doc, sharedHist) {
        if (!sharedHist && indexOf(rebased, doc.history) == -1) {
          rebaseHist(doc.history, change);
          rebased.push(doc.history);
        }
        makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change));
      });
    }
  }

  // Sub-views need their line numbers shifted when text is added
  // above or below them in the parent document.
  function shiftDoc(doc, distance) {
    if (distance == 0) return;
    doc.first += distance;
    doc.sel = new Selection(map(doc.sel.ranges, function(range) {
      return new Range(Pos(range.anchor.line + distance, range.anchor.ch),
                       Pos(range.head.line + distance, range.head.ch));
    }), doc.sel.primIndex);
    if (doc.cm) {
      regChange(doc.cm, doc.first, doc.first - distance, distance);
      for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++)
        regLineChange(doc.cm, l, "gutter");
    }
  }

  // More lower-level change function, handling only a single document
  // (not linked ones).
  function makeChangeSingleDoc(doc, change, selAfter, spans) {
    if (doc.cm && !doc.cm.curOp)
      return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans);

    if (change.to.line < doc.first) {
      shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
      return;
    }
    if (change.from.line > doc.lastLine()) return;

    // Clip the change to the size of this doc
    if (change.from.line < doc.first) {
      var shift = change.text.length - 1 - (doc.first - change.from.line);
      shiftDoc(doc, shift);
      change = {from: Pos(doc.first, 0), to: Pos(change.to.line + shift, change.to.ch),
                text: [lst(change.text)], origin: change.origin};
    }
    var last = doc.lastLine();
    if (change.to.line > last) {
      change = {from: change.from, to: Pos(last, getLine(doc, last).text.length),
                text: [change.text[0]], origin: change.origin};
    }

    change.removed = getBetween(doc, change.from, change.to);

    if (!selAfter) selAfter = computeSelAfterChange(doc, change);
    if (doc.cm) makeChangeSingleDocInEditor(doc.cm, change, spans);
    else updateDoc(doc, change, spans);
    setSelectionNoUndo(doc, selAfter, sel_dontScroll);
  }

  // Handle the interaction of a change to a document with the editor
  // that this document is part of.
  function makeChangeSingleDocInEditor(cm, change, spans) {
    var doc = cm.doc, display = cm.display, from = change.from, to = change.to;

    var recomputeMaxLength = false, checkWidthStart = from.line;
    if (!cm.options.lineWrapping) {
      checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
      doc.iter(checkWidthStart, to.line + 1, function(line) {
        if (line == display.maxLine) {
          recomputeMaxLength = true;
          return true;
        }
      });
    }

    if (doc.sel.contains(change.from, change.to) > -1)
      signalCursorActivity(cm);

    updateDoc(doc, change, spans, estimateHeight(cm));

    if (!cm.options.lineWrapping) {
      doc.iter(checkWidthStart, from.line + change.text.length, function(line) {
        var len = lineLength(line);
        if (len > display.maxLineLength) {
          display.maxLine = line;
          display.maxLineLength = len;
          display.maxLineChanged = true;
          recomputeMaxLength = false;
        }
      });
      if (recomputeMaxLength) cm.curOp.updateMaxLine = true;
    }

    // Adjust frontier, schedule worker
    doc.frontier = Math.min(doc.frontier, from.line);
    startWorker(cm, 400);

    var lendiff = change.text.length - (to.line - from.line) - 1;
    // Remember that these lines changed, for updating the display
    if (change.full)
      regChange(cm);
    else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change))
      regLineChange(cm, from.line, "text");
    else
      regChange(cm, from.line, to.line + 1, lendiff);

    var changesHandler = hasHandler(cm, "changes"), changeHandler = hasHandler(cm, "change");
    if (changeHandler || changesHandler) {
      var obj = {
        from: from, to: to,
        text: change.text,
        removed: change.removed,
        origin: change.origin
      };
      if (changeHandler) signalLater(cm, "change", cm, obj);
      if (changesHandler) (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj);
    }
    cm.display.selForContextMenu = null;
  }

  function replaceRange(doc, code, from, to, origin) {
    if (!to) to = from;
    if (cmp(to, from) < 0) { var tmp = to; to = from; from = tmp; }
    if (typeof code == "string") code = splitLines(code);
    makeChange(doc, {from: from, to: to, text: code, origin: origin});
  }

  // SCROLLING THINGS INTO VIEW

  // If an editor sits on the top or bottom of the window, partially
  // scrolled out of view, this ensures that the cursor is visible.
  function maybeScrollWindow(cm, coords) {
    if (signalDOMEvent(cm, "scrollCursorIntoView")) return;

    var display = cm.display, box = display.sizer.getBoundingClientRect(), doScroll = null;
    if (coords.top + box.top < 0) doScroll = true;
    else if (coords.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) doScroll = false;
    if (doScroll != null && !phantom) {
      var scrollNode = elt("div", "\u200b", null, "position: absolute; top: " +
                           (coords.top - display.viewOffset - paddingTop(cm.display)) + "px; height: " +
                           (coords.bottom - coords.top + scrollGap(cm) + display.barHeight) + "px; left: " +
                           coords.left + "px; width: 2px;");
      cm.display.lineSpace.appendChild(scrollNode);
      scrollNode.scrollIntoView(doScroll);
      cm.display.lineSpace.removeChild(scrollNode);
    }
  }

  // Scroll a given position into view (immediately), verifying that
  // it actually became visible (as line heights are accurately
  // measured, the position of something may 'drift' during drawing).
  function scrollPosIntoView(cm, pos, end, margin) {
    if (margin == null) margin = 0;
    for (var limit = 0; limit < 5; limit++) {
      var changed = false, coords = cursorCoords(cm, pos);
      var endCoords = !end || end == pos ? coords : cursorCoords(cm, end);
      var scrollPos = calculateScrollPos(cm, Math.min(coords.left, endCoords.left),
                                         Math.min(coords.top, endCoords.top) - margin,
                                         Math.max(coords.left, endCoords.left),
                                         Math.max(coords.bottom, endCoords.bottom) + margin);
      var startTop = cm.doc.scrollTop, startLeft = cm.doc.scrollLeft;
      if (scrollPos.scrollTop != null) {
        setScrollTop(cm, scrollPos.scrollTop);
        if (Math.abs(cm.doc.scrollTop - startTop) > 1) changed = true;
      }
      if (scrollPos.scrollLeft != null) {
        setScrollLeft(cm, scrollPos.scrollLeft);
        if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) changed = true;
      }
      if (!changed) break;
    }
    return coords;
  }

  // Scroll a given set of coordinates into view (immediately).
  function scrollIntoView(cm, x1, y1, x2, y2) {
    var scrollPos = calculateScrollPos(cm, x1, y1, x2, y2);
    if (scrollPos.scrollTop != null) setScrollTop(cm, scrollPos.scrollTop);
    if (scrollPos.scrollLeft != null) setScrollLeft(cm, scrollPos.scrollLeft);
  }

  // Calculate a new scroll position needed to scroll the given
  // rectangle into view. Returns an object with scrollTop and
  // scrollLeft properties. When these are undefined, the
  // vertical/horizontal position does not need to be adjusted.
  function calculateScrollPos(cm, x1, y1, x2, y2) {
    var display = cm.display, snapMargin = textHeight(cm.display);
    if (y1 < 0) y1 = 0;
    var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
    var screen = displayHeight(cm), result = {};
    if (y2 - y1 > screen) y2 = y1 + screen;
    var docBottom = cm.doc.height + paddingVert(display);
    var atTop = y1 < snapMargin, atBottom = y2 > docBottom - snapMargin;
    if (y1 < screentop) {
      result.scrollTop = atTop ? 0 : y1;
    } else if (y2 > screentop + screen) {
      var newTop = Math.min(y1, (atBottom ? docBottom : y2) - screen);
      if (newTop != screentop) result.scrollTop = newTop;
    }

    var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft;
    var screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0);
    var tooWide = x2 - x1 > screenw;
    if (tooWide) x2 = x1 + screenw;
    if (x1 < 10)
      result.scrollLeft = 0;
    else if (x1 < screenleft)
      result.scrollLeft = Math.max(0, x1 - (tooWide ? 0 : 10));
    else if (x2 > screenw + screenleft - 3)
      result.scrollLeft = x2 + (tooWide ? 0 : 10) - screenw;
    return result;
  }

  // Store a relative adjustment to the scroll position in the current
  // operation (to be applied when the operation finishes).
  function addToScrollPos(cm, left, top) {
    if (left != null || top != null) resolveScrollToPos(cm);
    if (left != null)
      cm.curOp.scrollLeft = (cm.curOp.scrollLeft == null ? cm.doc.scrollLeft : cm.curOp.scrollLeft) + left;
    if (top != null)
      cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
  }

  // Make sure that at the end of the operation the current cursor is
  // shown.
  function ensureCursorVisible(cm) {
    resolveScrollToPos(cm);
    var cur = cm.getCursor(), from = cur, to = cur;
    if (!cm.options.lineWrapping) {
      from = cur.ch ? Pos(cur.line, cur.ch - 1) : cur;
      to = Pos(cur.line, cur.ch + 1);
    }
    cm.curOp.scrollToPos = {from: from, to: to, margin: cm.options.cursorScrollMargin, isCursor: true};
  }

  // When an operation has its scrollToPos property set, and another
  // scroll action is applied before the end of the operation, this
  // 'simulates' scrolling that position into view in a cheap way, so
  // that the effect of intermediate scroll commands is not ignored.
  function resolveScrollToPos(cm) {
    var range = cm.curOp.scrollToPos;
    if (range) {
      cm.curOp.scrollToPos = null;
      var from = estimateCoords(cm, range.from), to = estimateCoords(cm, range.to);
      var sPos = calculateScrollPos(cm, Math.min(from.left, to.left),
                                    Math.min(from.top, to.top) - range.margin,
                                    Math.max(from.right, to.right),
                                    Math.max(from.bottom, to.bottom) + range.margin);
      cm.scrollTo(sPos.scrollLeft, sPos.scrollTop);
    }
  }

  // API UTILITIES

  // Indent the given line. The how parameter can be "smart",
  // "add"/null, "subtract", or "prev". When aggressive is false
  // (typically set to true for forced single-line indents), empty
  // lines are not indented, and places where the mode returns Pass
  // are left alone.
  function indentLine(cm, n, how, aggressive) {
    var doc = cm.doc, state;
    if (how == null) how = "add";
    if (how == "smart") {
      // Fall back to "prev" when the mode doesn't have an indentation
      // method.
      if (!doc.mode.indent) how = "prev";
      else state = getStateBefore(cm, n);
    }

    var tabSize = cm.options.tabSize;
    var line = getLine(doc, n), curSpace = countColumn(line.text, null, tabSize);
    if (line.stateAfter) line.stateAfter = null;
    var curSpaceString = line.text.match(/^\s*/)[0], indentation;
    if (!aggressive && !/\S/.test(line.text)) {
      indentation = 0;
      how = "not";
    } else if (how == "smart") {
      indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);
      if (indentation == Pass || indentation > 150) {
        if (!aggressive) return;
        how = "prev";
      }
    }
    if (how == "prev") {
      if (n > doc.first) indentation = countColumn(getLine(doc, n-1).text, null, tabSize);
      else indentation = 0;
    } else if (how == "add") {
      indentation = curSpace + cm.options.indentUnit;
    } else if (how == "subtract") {
      indentation = curSpace - cm.options.indentUnit;
    } else if (typeof how == "number") {
      indentation = curSpace + how;
    }
    indentation = Math.max(0, indentation);

    var indentString = "", pos = 0;
    if (cm.options.indentWithTabs)
      for (var i = Math.floor(indentation / tabSize); i; --i) {pos += tabSize; indentString += "\t";}
    if (pos < indentation) indentString += spaceStr(indentation - pos);

    if (indentString != curSpaceString) {
      replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");
    } else {
      // Ensure that, if the cursor was in the whitespace at the start
      // of the line, it is moved to the end of that space.
      for (var i = 0; i < doc.sel.ranges.length; i++) {
        var range = doc.sel.ranges[i];
        if (range.head.line == n && range.head.ch < curSpaceString.length) {
          var pos = Pos(n, curSpaceString.length);
          replaceOneSelection(doc, i, new Range(pos, pos));
          break;
        }
      }
    }
    line.stateAfter = null;
  }

  // Utility for applying a change to a line by handle or number,
  // returning the number and optionally registering the line as
  // changed.
  function changeLine(doc, handle, changeType, op) {
    var no = handle, line = handle;
    if (typeof handle == "number") line = getLine(doc, clipLine(doc, handle));
    else no = lineNo(handle);
    if (no == null) return null;
    if (op(line, no) && doc.cm) regLineChange(doc.cm, no, changeType);
    return line;
  }

  // Helper for deleting text near the selection(s), used to implement
  // backspace, delete, and similar functionality.
  function deleteNearSelection(cm, compute) {
    var ranges = cm.doc.sel.ranges, kill = [];
    // Build up a set of ranges to kill first, merging overlapping
    // ranges.
    for (var i = 0; i < ranges.length; i++) {
      var toKill = compute(ranges[i]);
      while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
        var replaced = kill.pop();
        if (cmp(replaced.from, toKill.from) < 0) {
          toKill.from = replaced.from;
          break;
        }
      }
      kill.push(toKill);
    }
    // Next, remove those actual ranges.
    runInOp(cm, function() {
      for (var i = kill.length - 1; i >= 0; i--)
        replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete");
      ensureCursorVisible(cm);
    });
  }

  // Used for horizontal relative motion. Dir is -1 or 1 (left or
  // right), unit can be "char", "column" (like char, but doesn't
  // cross line boundaries), "word" (across next word), or "group" (to
  // the start of next group of word or non-word-non-whitespace
  // chars). The visually param controls whether, in right-to-left
  // text, direction 1 means to move towards the next index in the
  // string, or towards the character to the right of the current
  // position. The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosH(doc, pos, dir, unit, visually) {
    var line = pos.line, ch = pos.ch, origDir = dir;
    var lineObj = getLine(doc, line);
    var possible = true;
    function findNextLine() {
      var l = line + dir;
      if (l < doc.first || l >= doc.first + doc.size) return (possible = false);
      line = l;
      return lineObj = getLine(doc, l);
    }
    function moveOnce(boundToLine) {
      var next = (visually ? moveVisually : moveLogically)(lineObj, ch, dir, true);
      if (next == null) {
        if (!boundToLine && findNextLine()) {
          if (visually) ch = (dir < 0 ? lineRight : lineLeft)(lineObj);
          else ch = dir < 0 ? lineObj.text.length : 0;
        } else return (possible = false);
      } else ch = next;
      return true;
    }

    if (unit == "char") moveOnce();
    else if (unit == "column") moveOnce(true);
    else if (unit == "word" || unit == "group") {
      var sawType = null, group = unit == "group";
      var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");
      for (var first = true;; first = false) {
        if (dir < 0 && !moveOnce(!first)) break;
        var cur = lineObj.text.charAt(ch) || "\n";
        var type = isWordChar(cur, helper) ? "w"
          : group && cur == "\n" ? "n"
          : !group || /\s/.test(cur) ? null
          : "p";
        if (group && !first && !type) type = "s";
        if (sawType && sawType != type) {
          if (dir < 0) {dir = 1; moveOnce();}
          break;
        }

        if (type) sawType = type;
        if (dir > 0 && !moveOnce(!first)) break;
      }
    }
    var result = skipAtomic(doc, Pos(line, ch), origDir, true);
    if (!possible) result.hitSide = true;
    return result;
  }

  // For relative vertical movement. Dir may be -1 or 1. Unit can be
  // "page" or "line". The resulting position will have a hitSide=true
  // property if it reached the end of the document.
  function findPosV(cm, pos, dir, unit) {
    var doc = cm.doc, x = pos.left, y;
    if (unit == "page") {
      var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
      y = pos.top + dir * (pageSize - (dir < 0 ? 1.5 : .5) * textHeight(cm.display));
    } else if (unit == "line") {
      y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
    }
    for (;;) {
      var target = coordsChar(cm, x, y);
      if (!target.outside) break;
      if (dir < 0 ? y <= 0 : y >= doc.height) { target.hitSide = true; break; }
      y += dir * 5;
    }
    return target;
  }

  // EDITOR METHODS

  // The publicly visible API. Note that methodOp(f) means
  // 'wrap f in an operation, performed on its `this` parameter'.

  // This is not the complete set of editor methods. Most of the
  // methods defined on the Doc type are also injected into
  // CodeMirror.prototype, for backwards compatibility and
  // convenience.

  CodeMirror.prototype = {
    constructor: CodeMirror,
    focus: function(){window.focus(); focusInput(this); fastPoll(this);},

    setOption: function(option, value) {
      var options = this.options, old = options[option];
      if (options[option] == value && option != "mode") return;
      options[option] = value;
      if (optionHandlers.hasOwnProperty(option))
        operation(this, optionHandlers[option])(this, value, old);
    },

    getOption: function(option) {return this.options[option];},
    getDoc: function() {return this.doc;},

    addKeyMap: function(map, bottom) {
      this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map));
    },
    removeKeyMap: function(map) {
      var maps = this.state.keyMaps;
      for (var i = 0; i < maps.length; ++i)
        if (maps[i] == map || maps[i].name == map) {
          maps.splice(i, 1);
          return true;
        }
    },

    addOverlay: methodOp(function(spec, options) {
      var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);
      if (mode.startState) throw new Error("Overlays may not be stateful.");
      this.state.overlays.push({mode: mode, modeSpec: spec, opaque: options && options.opaque});
      this.state.modeGen++;
      regChange(this);
    }),
    removeOverlay: methodOp(function(spec) {
      var overlays = this.state.overlays;
      for (var i = 0; i < overlays.length; ++i) {
        var cur = overlays[i].modeSpec;
        if (cur == spec || typeof spec == "string" && cur.name == spec) {
          overlays.splice(i, 1);
          this.state.modeGen++;
          regChange(this);
          return;
        }
      }
    }),

    indentLine: methodOp(function(n, dir, aggressive) {
      if (typeof dir != "string" && typeof dir != "number") {
        if (dir == null) dir = this.options.smartIndent ? "smart" : "prev";
        else dir = dir ? "add" : "subtract";
      }
      if (isLine(this.doc, n)) indentLine(this, n, dir, aggressive);
    }),
    indentSelection: methodOp(function(how) {
      var ranges = this.doc.sel.ranges, end = -1;
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i];
        if (!range.empty()) {
          var from = range.from(), to = range.to();
          var start = Math.max(end, from.line);
          end = Math.min(this.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;
          for (var j = start; j < end; ++j)
            indentLine(this, j, how);
          var newRanges = this.doc.sel.ranges;
          if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0)
            replaceOneSelection(this.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll);
        } else if (range.head.line > end) {
          indentLine(this, range.head.line, how, true);
          end = range.head.line;
          if (i == this.doc.sel.primIndex) ensureCursorVisible(this);
        }
      }
    }),

    // Fetch the parser token for a given character. Useful for hacks
    // that want to inspect the mode state (say, for completion).
    getTokenAt: function(pos, precise) {
      return takeToken(this, pos, precise);
    },

    getLineTokens: function(line, precise) {
      return takeToken(this, Pos(line), precise, true);
    },

    getTokenTypeAt: function(pos) {
      pos = clipPos(this.doc, pos);
      var styles = getLineStyles(this, getLine(this.doc, pos.line));
      var before = 0, after = (styles.length - 1) / 2, ch = pos.ch;
      var type;
      if (ch == 0) type = styles[2];
      else for (;;) {
        var mid = (before + after) >> 1;
        if ((mid ? styles[mid * 2 - 1] : 0) >= ch) after = mid;
        else if (styles[mid * 2 + 1] < ch) before = mid + 1;
        else { type = styles[mid * 2 + 2]; break; }
      }
      var cut = type ? type.indexOf("cm-overlay ") : -1;
      return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1);
    },

    getModeAt: function(pos) {
      var mode = this.doc.mode;
      if (!mode.innerMode) return mode;
      return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode;
    },

    getHelper: function(pos, type) {
      return this.getHelpers(pos, type)[0];
    },

    getHelpers: function(pos, type) {
      var found = [];
      if (!helpers.hasOwnProperty(type)) return helpers;
      var help = helpers[type], mode = this.getModeAt(pos);
      if (typeof mode[type] == "string") {
        if (help[mode[type]]) found.push(help[mode[type]]);
      } else if (mode[type]) {
        for (var i = 0; i < mode[type].length; i++) {
          var val = help[mode[type][i]];
          if (val) found.push(val);
        }
      } else if (mode.helperType && help[mode.helperType]) {
        found.push(help[mode.helperType]);
      } else if (help[mode.name]) {
        found.push(help[mode.name]);
      }
      for (var i = 0; i < help._global.length; i++) {
        var cur = help._global[i];
        if (cur.pred(mode, this) && indexOf(found, cur.val) == -1)
          found.push(cur.val);
      }
      return found;
    },

    getStateAfter: function(line, precise) {
      var doc = this.doc;
      line = clipLine(doc, line == null ? doc.first + doc.size - 1: line);
      return getStateBefore(this, line + 1, precise);
    },

    cursorCoords: function(start, mode) {
      var pos, range = this.doc.sel.primary();
      if (start == null) pos = range.head;
      else if (typeof start == "object") pos = clipPos(this.doc, start);
      else pos = start ? range.from() : range.to();
      return cursorCoords(this, pos, mode || "page");
    },

    charCoords: function(pos, mode) {
      return charCoords(this, clipPos(this.doc, pos), mode || "page");
    },

    coordsChar: function(coords, mode) {
      coords = fromCoordSystem(this, coords, mode || "page");
      return coordsChar(this, coords.left, coords.top);
    },

    lineAtHeight: function(height, mode) {
      height = fromCoordSystem(this, {top: height, left: 0}, mode || "page").top;
      return lineAtHeight(this.doc, height + this.display.viewOffset);
    },
    heightAtLine: function(line, mode) {
      var end = false, last = this.doc.first + this.doc.size - 1;
      if (line < this.doc.first) line = this.doc.first;
      else if (line > last) { line = last; end = true; }
      var lineObj = getLine(this.doc, line);
      return intoCoordSystem(this, lineObj, {top: 0, left: 0}, mode || "page").top +
        (end ? this.doc.height - heightAtLine(lineObj) : 0);
    },

    defaultTextHeight: function() { return textHeight(this.display); },
    defaultCharWidth: function() { return charWidth(this.display); },

    setGutterMarker: methodOp(function(line, gutterID, value) {
      return changeLine(this.doc, line, "gutter", function(line) {
        var markers = line.gutterMarkers || (line.gutterMarkers = {});
        markers[gutterID] = value;
        if (!value && isEmpty(markers)) line.gutterMarkers = null;
        return true;
      });
    }),

    clearGutter: methodOp(function(gutterID) {
      var cm = this, doc = cm.doc, i = doc.first;
      doc.iter(function(line) {
        if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
          line.gutterMarkers[gutterID] = null;
          regLineChange(cm, i, "gutter");
          if (isEmpty(line.gutterMarkers)) line.gutterMarkers = null;
        }
        ++i;
      });
    }),

    addLineWidget: methodOp(function(handle, node, options) {
      return addLineWidget(this, handle, node, options);
    }),

    removeLineWidget: function(widget) { widget.clear(); },

    lineInfo: function(line) {
      if (typeof line == "number") {
        if (!isLine(this.doc, line)) return null;
        var n = line;
        line = getLine(this.doc, line);
        if (!line) return null;
      } else {
        var n = lineNo(line);
        if (n == null) return null;
      }
      return {line: n, handle: line, text: line.text, gutterMarkers: line.gutterMarkers,
              textClass: line.textClass, bgClass: line.bgClass, wrapClass: line.wrapClass,
              widgets: line.widgets};
    },

    getViewport: function() { return {from: this.display.viewFrom, to: this.display.viewTo};},

    addWidget: function(pos, node, scroll, vert, horiz) {
      var display = this.display;
      pos = cursorCoords(this, clipPos(this.doc, pos));
      var top = pos.bottom, left = pos.left;
      node.style.position = "absolute";
      node.setAttribute("cm-ignore-events", "true");
      display.sizer.appendChild(node);
      if (vert == "over") {
        top = pos.top;
      } else if (vert == "above" || vert == "near") {
        var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
        hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth);
        // Default to positioning above (if specified and possible); otherwise default to positioning below
        if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight)
          top = pos.top - node.offsetHeight;
        else if (pos.bottom + node.offsetHeight <= vspace)
          top = pos.bottom;
        if (left + node.offsetWidth > hspace)
          left = hspace - node.offsetWidth;
      }
      node.style.top = top + "px";
      node.style.left = node.style.right = "";
      if (horiz == "right") {
        left = display.sizer.clientWidth - node.offsetWidth;
        node.style.right = "0px";
      } else {
        if (horiz == "left") left = 0;
        else if (horiz == "middle") left = (display.sizer.clientWidth - node.offsetWidth) / 2;
        node.style.left = left + "px";
      }
      if (scroll)
        scrollIntoView(this, left, top, left + node.offsetWidth, top + node.offsetHeight);
    },

    triggerOnKeyDown: methodOp(onKeyDown),
    triggerOnKeyPress: methodOp(onKeyPress),
    triggerOnKeyUp: onKeyUp,

    execCommand: function(cmd) {
      if (commands.hasOwnProperty(cmd))
        return commands[cmd](this);
    },

    findPosH: function(from, amount, unit, visually) {
      var dir = 1;
      if (amount < 0) { dir = -1; amount = -amount; }
      for (var i = 0, cur = clipPos(this.doc, from); i < amount; ++i) {
        cur = findPosH(this.doc, cur, dir, unit, visually);
        if (cur.hitSide) break;
      }
      return cur;
    },

    moveH: methodOp(function(dir, unit) {
      var cm = this;
      cm.extendSelectionsBy(function(range) {
        if (cm.display.shift || cm.doc.extend || range.empty())
          return findPosH(cm.doc, range.head, dir, unit, cm.options.rtlMoveVisually);
        else
          return dir < 0 ? range.from() : range.to();
      }, sel_move);
    }),

    deleteH: methodOp(function(dir, unit) {
      var sel = this.doc.sel, doc = this.doc;
      if (sel.somethingSelected())
        doc.replaceSelection("", null, "+delete");
      else
        deleteNearSelection(this, function(range) {
          var other = findPosH(doc, range.head, dir, unit, false);
          return dir < 0 ? {from: other, to: range.head} : {from: range.head, to: other};
        });
    }),

    findPosV: function(from, amount, unit, goalColumn) {
      var dir = 1, x = goalColumn;
      if (amount < 0) { dir = -1; amount = -amount; }
      for (var i = 0, cur = clipPos(this.doc, from); i < amount; ++i) {
        var coords = cursorCoords(this, cur, "div");
        if (x == null) x = coords.left;
        else coords.left = x;
        cur = findPosV(this, coords, dir, unit);
        if (cur.hitSide) break;
      }
      return cur;
    },

    moveV: methodOp(function(dir, unit) {
      var cm = this, doc = this.doc, goals = [];
      var collapse = !cm.display.shift && !doc.extend && doc.sel.somethingSelected();
      doc.extendSelectionsBy(function(range) {
        if (collapse)
          return dir < 0 ? range.from() : range.to();
        var headPos = cursorCoords(cm, range.head, "div");
        if (range.goalColumn != null) headPos.left = range.goalColumn;
        goals.push(headPos.left);
        var pos = findPosV(cm, headPos, dir, unit);
        if (unit == "page" && range == doc.sel.primary())
          addToScrollPos(cm, null, charCoords(cm, pos, "div").top - headPos.top);
        return pos;
      }, sel_move);
      if (goals.length) for (var i = 0; i < doc.sel.ranges.length; i++)
        doc.sel.ranges[i].goalColumn = goals[i];
    }),

    // Find the word at the given position (as returned by coordsChar).
    findWordAt: function(pos) {
      var doc = this.doc, line = getLine(doc, pos.line).text;
      var start = pos.ch, end = pos.ch;
      if (line) {
        var helper = this.getHelper(pos, "wordChars");
        if ((pos.xRel < 0 || end == line.length) && start) --start; else ++end;
        var startChar = line.charAt(start);
        var check = isWordChar(startChar, helper)
          ? function(ch) { return isWordChar(ch, helper); }
          : /\s/.test(startChar) ? function(ch) {return /\s/.test(ch);}
          : function(ch) {return !/\s/.test(ch) && !isWordChar(ch);};
        while (start > 0 && check(line.charAt(start - 1))) --start;
        while (end < line.length && check(line.charAt(end))) ++end;
      }
      return new Range(Pos(pos.line, start), Pos(pos.line, end));
    },

    toggleOverwrite: function(value) {
      if (value != null && value == this.state.overwrite) return;
      if (this.state.overwrite = !this.state.overwrite)
        addClass(this.display.cursorDiv, "CodeMirror-overwrite");
      else
        rmClass(this.display.cursorDiv, "CodeMirror-overwrite");

      signal(this, "overwriteToggle", this, this.state.overwrite);
    },
    hasFocus: function() { return activeElt() == this.display.input; },

    scrollTo: methodOp(function(x, y) {
      if (x != null || y != null) resolveScrollToPos(this);
      if (x != null) this.curOp.scrollLeft = x;
      if (y != null) this.curOp.scrollTop = y;
    }),
    getScrollInfo: function() {
      var scroller = this.display.scroller;
      return {left: scroller.scrollLeft, top: scroller.scrollTop,
              height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
              width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
              clientHeight: displayHeight(this), clientWidth: displayWidth(this)};
    },

    scrollIntoView: methodOp(function(range, margin) {
      if (range == null) {
        range = {from: this.doc.sel.primary().head, to: null};
        if (margin == null) margin = this.options.cursorScrollMargin;
      } else if (typeof range == "number") {
        range = {from: Pos(range, 0), to: null};
      } else if (range.from == null) {
        range = {from: range, to: null};
      }
      if (!range.to) range.to = range.from;
      range.margin = margin || 0;

      if (range.from.line != null) {
        resolveScrollToPos(this);
        this.curOp.scrollToPos = range;
      } else {
        var sPos = calculateScrollPos(this, Math.min(range.from.left, range.to.left),
                                      Math.min(range.from.top, range.to.top) - range.margin,
                                      Math.max(range.from.right, range.to.right),
                                      Math.max(range.from.bottom, range.to.bottom) + range.margin);
        this.scrollTo(sPos.scrollLeft, sPos.scrollTop);
      }
    }),

    setSize: methodOp(function(width, height) {
      var cm = this;
      function interpret(val) {
        return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val;
      }
      if (width != null) cm.display.wrapper.style.width = interpret(width);
      if (height != null) cm.display.wrapper.style.height = interpret(height);
      if (cm.options.lineWrapping) clearLineMeasurementCache(this);
      var lineNo = cm.display.viewFrom;
      cm.doc.iter(lineNo, cm.display.viewTo, function(line) {
        if (line.widgets) for (var i = 0; i < line.widgets.length; i++)
          if (line.widgets[i].noHScroll) { regLineChange(cm, lineNo, "widget"); break; }
        ++lineNo;
      });
      cm.curOp.forceUpdate = true;
      signal(cm, "refresh", this);
    }),

    operation: function(f){return runInOp(this, f);},

    refresh: methodOp(function() {
      var oldHeight = this.display.cachedTextHeight;
      regChange(this);
      this.curOp.forceUpdate = true;
      clearCaches(this);
      this.scrollTo(this.doc.scrollLeft, this.doc.scrollTop);
      updateGutterSpace(this);
      if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5)
        estimateLineHeights(this);
      signal(this, "refresh", this);
    }),

    swapDoc: methodOp(function(doc) {
      var old = this.doc;
      old.cm = null;
      attachDoc(this, doc);
      clearCaches(this);
      resetInput(this);
      this.scrollTo(doc.scrollLeft, doc.scrollTop);
      this.curOp.forceScroll = true;
      signalLater(this, "swapDoc", this, old);
      return old;
    }),

    getInputField: function(){return this.display.input;},
    getWrapperElement: function(){return this.display.wrapper;},
    getScrollerElement: function(){return this.display.scroller;},
    getGutterElement: function(){return this.display.gutters;}
  };
  eventMixin(CodeMirror);

  // OPTION DEFAULTS

  // The default configuration options.
  var defaults = CodeMirror.defaults = {};
  // Functions to run when options are changed.
  var optionHandlers = CodeMirror.optionHandlers = {};

  function option(name, deflt, handle, notOnInit) {
    CodeMirror.defaults[name] = deflt;
    if (handle) optionHandlers[name] =
      notOnInit ? function(cm, val, old) {if (old != Init) handle(cm, val, old);} : handle;
  }

  // Passed to option handlers when there is no old value.
  var Init = CodeMirror.Init = {toString: function(){return "CodeMirror.Init";}};

  // These two are, on init, called from the constructor because they
  // have to be initialized before the editor can start at all.
  option("value", "", function(cm, val) {
    cm.setValue(val);
  }, true);
  option("mode", null, function(cm, val) {
    cm.doc.modeOption = val;
    loadMode(cm);
  }, true);

  option("indentUnit", 2, loadMode, true);
  option("indentWithTabs", false);
  option("smartIndent", true);
  option("tabSize", 4, function(cm) {
    resetModeState(cm);
    clearCaches(cm);
    regChange(cm);
  }, true);
  option("specialChars", /[\t\u0000-\u0019\u00ad\u200b-\u200f\u2028\u2029\ufeff]/g, function(cm, val) {
    cm.options.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g");
    cm.refresh();
  }, true);
  option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function(cm) {cm.refresh();}, true);
  option("electricChars", true);
  option("rtlMoveVisually", !windows);
  option("wholeLineUpdateBefore", true);

  option("theme", "default", function(cm) {
    themeChanged(cm);
    guttersChanged(cm);
  }, true);
  option("keyMap", "default", function(cm, val, old) {
    var next = getKeyMap(val);
    var prev = old != CodeMirror.Init && getKeyMap(old);
    if (prev && prev.detach) prev.detach(cm, next);
    if (next.attach) next.attach(cm, prev || null);
  });
  option("extraKeys", null);

  option("lineWrapping", false, wrappingChanged, true);
  option("gutters", [], function(cm) {
    setGuttersForLineNumbers(cm.options);
    guttersChanged(cm);
  }, true);
  option("fixedGutter", true, function(cm, val) {
    cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
    cm.refresh();
  }, true);
  option("coverGutterNextToScrollbar", false, function(cm) {updateScrollbars(cm);}, true);
  option("scrollbarStyle", "native", function(cm) {
    initScrollbars(cm);
    updateScrollbars(cm);
    cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
    cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft);
  }, true);
  option("lineNumbers", false, function(cm) {
    setGuttersForLineNumbers(cm.options);
    guttersChanged(cm);
  }, true);
  option("firstLineNumber", 1, guttersChanged, true);
  option("lineNumberFormatter", function(integer) {return integer;}, guttersChanged, true);
  option("showCursorWhenSelecting", false, updateSelection, true);

  option("resetSelectionOnContextMenu", true);

  option("readOnly", false, function(cm, val) {
    if (val == "nocursor") {
      onBlur(cm);
      cm.display.input.blur();
      cm.display.disabled = true;
    } else {
      cm.display.disabled = false;
      if (!val) resetInput(cm);
    }
  });
  option("disableInput", false, function(cm, val) {if (!val) resetInput(cm);}, true);
  option("dragDrop", true);

  option("cursorBlinkRate", 530);
  option("cursorScrollMargin", 0);
  option("cursorHeight", 1, updateSelection, true);
  option("singleCursorHeightPerLine", true, updateSelection, true);
  option("workTime", 100);
  option("workDelay", 100);
  option("flattenSpans", true, resetModeState, true);
  option("addModeClass", false, resetModeState, true);
  option("pollInterval", 100);
  option("undoDepth", 200, function(cm, val){cm.doc.history.undoDepth = val;});
  option("historyEventDelay", 1250);
  option("viewportMargin", 10, function(cm){cm.refresh();}, true);
  option("maxHighlightLength", 10000, resetModeState, true);
  option("moveInputWithCursor", true, function(cm, val) {
    if (!val) cm.display.inputDiv.style.top = cm.display.inputDiv.style.left = 0;
  });

  option("tabindex", null, function(cm, val) {
    cm.display.input.tabIndex = val || "";
  });
  option("autofocus", null);

  // MODE DEFINITION AND QUERYING

  // Known modes, by name and by MIME
  var modes = CodeMirror.modes = {}, mimeModes = CodeMirror.mimeModes = {};

  // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)
  CodeMirror.defineMode = function(name, mode) {
    if (!CodeMirror.defaults.mode && name != "null") CodeMirror.defaults.mode = name;
    if (arguments.length > 2)
      mode.dependencies = Array.prototype.slice.call(arguments, 2);
    modes[name] = mode;
  };

  CodeMirror.defineMIME = function(mime, spec) {
    mimeModes[mime] = spec;
  };

  // Given a MIME type, a {name, ...options} config object, or a name
  // string, return a mode config object.
  CodeMirror.resolveMode = function(spec) {
    if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
      spec = mimeModes[spec];
    } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
      var found = mimeModes[spec.name];
      if (typeof found == "string") found = {name: found};
      spec = createObj(found, spec);
      spec.name = found.name;
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
      return CodeMirror.resolveMode("application/xml");
    }
    if (typeof spec == "string") return {name: spec};
    else return spec || {name: "null"};
  };

  // Given a mode spec (anything that resolveMode accepts), find and
  // initialize an actual mode object.
  CodeMirror.getMode = function(options, spec) {
    var spec = CodeMirror.resolveMode(spec);
    var mfactory = modes[spec.name];
    if (!mfactory) return CodeMirror.getMode(options, "text/plain");
    var modeObj = mfactory(options, spec);
    if (modeExtensions.hasOwnProperty(spec.name)) {
      var exts = modeExtensions[spec.name];
      for (var prop in exts) {
        if (!exts.hasOwnProperty(prop)) continue;
        if (modeObj.hasOwnProperty(prop)) modeObj["_" + prop] = modeObj[prop];
        modeObj[prop] = exts[prop];
      }
    }
    modeObj.name = spec.name;
    if (spec.helperType) modeObj.helperType = spec.helperType;
    if (spec.modeProps) for (var prop in spec.modeProps)
      modeObj[prop] = spec.modeProps[prop];

    return modeObj;
  };

  // Minimal default mode.
  CodeMirror.defineMode("null", function() {
    return {token: function(stream) {stream.skipToEnd();}};
  });
  CodeMirror.defineMIME("text/plain", "null");

  // This can be used to attach properties to mode objects from
  // outside the actual mode definition.
  var modeExtensions = CodeMirror.modeExtensions = {};
  CodeMirror.extendMode = function(mode, properties) {
    var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : (modeExtensions[mode] = {});
    copyObj(properties, exts);
  };

  // EXTENSIONS

  CodeMirror.defineExtension = function(name, func) {
    CodeMirror.prototype[name] = func;
  };
  CodeMirror.defineDocExtension = function(name, func) {
    Doc.prototype[name] = func;
  };
  CodeMirror.defineOption = option;

  var initHooks = [];
  CodeMirror.defineInitHook = function(f) {initHooks.push(f);};

  var helpers = CodeMirror.helpers = {};
  CodeMirror.registerHelper = function(type, name, value) {
    if (!helpers.hasOwnProperty(type)) helpers[type] = CodeMirror[type] = {_global: []};
    helpers[type][name] = value;
  };
  CodeMirror.registerGlobalHelper = function(type, name, predicate, value) {
    CodeMirror.registerHelper(type, name, value);
    helpers[type]._global.push({pred: predicate, val: value});
  };

  // MODE STATE HANDLING

  // Utility functions for working with state. Exported because nested
  // modes need to do this for their inner modes.

  var copyState = CodeMirror.copyState = function(mode, state) {
    if (state === true) return state;
    if (mode.copyState) return mode.copyState(state);
    var nstate = {};
    for (var n in state) {
      var val = state[n];
      if (val instanceof Array) val = val.concat([]);
      nstate[n] = val;
    }
    return nstate;
  };

  var startState = CodeMirror.startState = function(mode, a1, a2) {
    return mode.startState ? mode.startState(a1, a2) : true;
  };

  // Given a mode and a state (for that mode), find the inner mode and
  // state at the position that the state refers to.
  CodeMirror.innerMode = function(mode, state) {
    while (mode.innerMode) {
      var info = mode.innerMode(state);
      if (!info || info.mode == mode) break;
      state = info.state;
      mode = info.mode;
    }
    return info || {mode: mode, state: state};
  };

  // STANDARD COMMANDS

  // Commands are parameter-less actions that can be performed on an
  // editor, mostly used for keybindings.
  var commands = CodeMirror.commands = {
    selectAll: function(cm) {cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);},
    singleSelection: function(cm) {
      cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll);
    },
    killLine: function(cm) {
      deleteNearSelection(cm, function(range) {
        if (range.empty()) {
          var len = getLine(cm.doc, range.head.line).text.length;
          if (range.head.ch == len && range.head.line < cm.lastLine())
            return {from: range.head, to: Pos(range.head.line + 1, 0)};
          else
            return {from: range.head, to: Pos(range.head.line, len)};
        } else {
          return {from: range.from(), to: range.to()};
        }
      });
    },
    deleteLine: function(cm) {
      deleteNearSelection(cm, function(range) {
        return {from: Pos(range.from().line, 0),
                to: clipPos(cm.doc, Pos(range.to().line + 1, 0))};
      });
    },
    delLineLeft: function(cm) {
      deleteNearSelection(cm, function(range) {
        return {from: Pos(range.from().line, 0), to: range.from()};
      });
    },
    delWrappedLineLeft: function(cm) {
      deleteNearSelection(cm, function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var leftPos = cm.coordsChar({left: 0, top: top}, "div");
        return {from: leftPos, to: range.from()};
      });
    },
    delWrappedLineRight: function(cm) {
      deleteNearSelection(cm, function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var rightPos = cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div");
        return {from: range.from(), to: rightPos };
      });
    },
    undo: function(cm) {cm.undo();},
    redo: function(cm) {cm.redo();},
    undoSelection: function(cm) {cm.undoSelection();},
    redoSelection: function(cm) {cm.redoSelection();},
    goDocStart: function(cm) {cm.extendSelection(Pos(cm.firstLine(), 0));},
    goDocEnd: function(cm) {cm.extendSelection(Pos(cm.lastLine()));},
    goLineStart: function(cm) {
      cm.extendSelectionsBy(function(range) { return lineStart(cm, range.head.line); },
                            {origin: "+move", bias: 1});
    },
    goLineStartSmart: function(cm) {
      cm.extendSelectionsBy(function(range) {
        return lineStartSmart(cm, range.head);
      }, {origin: "+move", bias: 1});
    },
    goLineEnd: function(cm) {
      cm.extendSelectionsBy(function(range) { return lineEnd(cm, range.head.line); },
                            {origin: "+move", bias: -1});
    },
    goLineRight: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        return cm.coordsChar({left: cm.display.lineDiv.offsetWidth + 100, top: top}, "div");
      }, sel_move);
    },
    goLineLeft: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        return cm.coordsChar({left: 0, top: top}, "div");
      }, sel_move);
    },
    goLineLeftSmart: function(cm) {
      cm.extendSelectionsBy(function(range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var pos = cm.coordsChar({left: 0, top: top}, "div");
        if (pos.ch < cm.getLine(pos.line).search(/\S/)) return lineStartSmart(cm, range.head);
        return pos;
      }, sel_move);
    },
    goLineUp: function(cm) {cm.moveV(-1, "line");},
    goLineDown: function(cm) {cm.moveV(1, "line");},
    goPageUp: function(cm) {cm.moveV(-1, "page");},
    goPageDown: function(cm) {cm.moveV(1, "page");},
    goCharLeft: function(cm) {cm.moveH(-1, "char");},
    goCharRight: function(cm) {cm.moveH(1, "char");},
    goColumnLeft: function(cm) {cm.moveH(-1, "column");},
    goColumnRight: function(cm) {cm.moveH(1, "column");},
    goWordLeft: function(cm) {cm.moveH(-1, "word");},
    goGroupRight: function(cm) {cm.moveH(1, "group");},
    goGroupLeft: function(cm) {cm.moveH(-1, "group");},
    goWordRight: function(cm) {cm.moveH(1, "word");},
    delCharBefore: function(cm) {cm.deleteH(-1, "char");},
    delCharAfter: function(cm) {cm.deleteH(1, "char");},
    delWordBefore: function(cm) {cm.deleteH(-1, "word");},
    delWordAfter: function(cm) {cm.deleteH(1, "word");},
    delGroupBefore: function(cm) {cm.deleteH(-1, "group");},
    delGroupAfter: function(cm) {cm.deleteH(1, "group");},
    indentAuto: function(cm) {cm.indentSelection("smart");},
    indentMore: function(cm) {cm.indentSelection("add");},
    indentLess: function(cm) {cm.indentSelection("subtract");},
    insertTab: function(cm) {cm.replaceSelection("\t");},
    insertSoftTab: function(cm) {
      var spaces = [], ranges = cm.listSelections(), tabSize = cm.options.tabSize;
      for (var i = 0; i < ranges.length; i++) {
        var pos = ranges[i].from();
        var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
        spaces.push(new Array(tabSize - col % tabSize + 1).join(" "));
      }
      cm.replaceSelections(spaces);
    },
    defaultTab: function(cm) {
      if (cm.somethingSelected()) cm.indentSelection("add");
      else cm.execCommand("insertTab");
    },
    transposeChars: function(cm) {
      runInOp(cm, function() {
        var ranges = cm.listSelections(), newSel = [];
        for (var i = 0; i < ranges.length; i++) {
          var cur = ranges[i].head, line = getLine(cm.doc, cur.line).text;
          if (line) {
            if (cur.ch == line.length) cur = new Pos(cur.line, cur.ch - 1);
            if (cur.ch > 0) {
              cur = new Pos(cur.line, cur.ch + 1);
              cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2),
                              Pos(cur.line, cur.ch - 2), cur, "+transpose");
            } else if (cur.line > cm.doc.first) {
              var prev = getLine(cm.doc, cur.line - 1).text;
              if (prev)
                cm.replaceRange(line.charAt(0) + "\n" + prev.charAt(prev.length - 1),
                                Pos(cur.line - 1, prev.length - 1), Pos(cur.line, 1), "+transpose");
            }
          }
          newSel.push(new Range(cur, cur));
        }
        cm.setSelections(newSel);
      });
    },
    newlineAndIndent: function(cm) {
      runInOp(cm, function() {
        var len = cm.listSelections().length;
        for (var i = 0; i < len; i++) {
          var range = cm.listSelections()[i];
          cm.replaceRange("\n", range.anchor, range.head, "+input");
          cm.indentLine(range.from().line + 1, null, true);
          ensureCursorVisible(cm);
        }
      });
    },
    toggleOverwrite: function(cm) {cm.toggleOverwrite();}
  };


  // STANDARD KEYMAPS

  var keyMap = CodeMirror.keyMap = {};

  keyMap.basic = {
    "Left": "goCharLeft", "Right": "goCharRight", "Up": "goLineUp", "Down": "goLineDown",
    "End": "goLineEnd", "Home": "goLineStartSmart", "PageUp": "goPageUp", "PageDown": "goPageDown",
    "Delete": "delCharAfter", "Backspace": "delCharBefore", "Shift-Backspace": "delCharBefore",
    "Tab": "defaultTab", "Shift-Tab": "indentAuto",
    "Enter": "newlineAndIndent", "Insert": "toggleOverwrite",
    "Esc": "singleSelection"
  };
  // Note that the save and find-related commands aren't defined by
  // default. User code or addons can define them. Unknown commands
  // are simply ignored.
  keyMap.pcDefault = {
    "Ctrl-A": "selectAll", "Ctrl-D": "deleteLine", "Ctrl-Z": "undo", "Shift-Ctrl-Z": "redo", "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart", "Ctrl-End": "goDocEnd", "Ctrl-Up": "goLineUp", "Ctrl-Down": "goLineDown",
    "Ctrl-Left": "goGroupLeft", "Ctrl-Right": "goGroupRight", "Alt-Left": "goLineStart", "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore", "Ctrl-Delete": "delGroupAfter", "Ctrl-S": "save", "Ctrl-F": "find",
    "Ctrl-G": "findNext", "Shift-Ctrl-G": "findPrev", "Shift-Ctrl-F": "replace", "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess", "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection", "Shift-Ctrl-U": "redoSelection", "Alt-U": "redoSelection",
    fallthrough: "basic"
  };
  // Very basic readline/emacs-style bindings, which are standard on Mac.
  keyMap.emacsy = {
    "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown", "Shift-Ctrl-V": "goPageUp", "Ctrl-D": "delCharAfter", "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter", "Alt-Backspace": "delWordBefore", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars"
  };
  keyMap.macDefault = {
    "Cmd-A": "selectAll", "Cmd-D": "deleteLine", "Cmd-Z": "undo", "Shift-Cmd-Z": "redo", "Cmd-Y": "redo",
    "Cmd-Home": "goDocStart", "Cmd-Up": "goDocStart", "Cmd-End": "goDocEnd", "Cmd-Down": "goDocEnd", "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight", "Cmd-Left": "goLineLeft", "Cmd-Right": "goLineRight", "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter", "Alt-Delete": "delGroupAfter", "Cmd-S": "save", "Cmd-F": "find",
    "Cmd-G": "findNext", "Shift-Cmd-G": "findPrev", "Cmd-Alt-F": "replace", "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess", "Cmd-]": "indentMore", "Cmd-Backspace": "delWrappedLineLeft", "Cmd-Delete": "delWrappedLineRight",
    "Cmd-U": "undoSelection", "Shift-Cmd-U": "redoSelection", "Ctrl-Up": "goDocStart", "Ctrl-Down": "goDocEnd",
    fallthrough: ["basic", "emacsy"]
  };
  keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;

  // KEYMAP DISPATCH

  function normalizeKeyName(name) {
    var parts = name.split(/-(?!$)/), name = parts[parts.length - 1];
    var alt, ctrl, shift, cmd;
    for (var i = 0; i < parts.length - 1; i++) {
      var mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod)) cmd = true;
      else if (/^a(lt)?$/i.test(mod)) alt = true;
      else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
      else if (/^s(hift)$/i.test(mod)) shift = true;
      else throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt) name = "Alt-" + name;
    if (ctrl) name = "Ctrl-" + name;
    if (cmd) name = "Cmd-" + name;
    if (shift) name = "Shift-" + name;
    return name;
  }

  // This is a kludge to keep keymaps mostly working as raw objects
  // (backwards compatibility) while at the same time support features
  // like normalization and multi-stroke key bindings. It compiles a
  // new normalized keymap, and then updates the old object to reflect
  // this.
  CodeMirror.normalizeKeyMap = function(keymap) {
    var copy = {};
    for (var keyname in keymap) if (keymap.hasOwnProperty(keyname)) {
      var value = keymap[keyname];
      if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) continue;
      if (value == "...") { delete keymap[keyname]; continue; }

      var keys = map(keyname.split(" "), normalizeKeyName);
      for (var i = 0; i < keys.length; i++) {
        var val, name;
        if (i == keys.length - 1) {
          name = keyname;
          val = value;
        } else {
          name = keys.slice(0, i + 1).join(" ");
          val = "...";
        }
        var prev = copy[name];
        if (!prev) copy[name] = val;
        else if (prev != val) throw new Error("Inconsistent bindings for " + name);
      }
      delete keymap[keyname];
    }
    for (var prop in copy) keymap[prop] = copy[prop];
    return keymap;
  };

  var lookupKey = CodeMirror.lookupKey = function(key, map, handle, context) {
    map = getKeyMap(map);
    var found = map.call ? map.call(key, context) : map[key];
    if (found === false) return "nothing";
    if (found === "...") return "multi";
    if (found != null && handle(found)) return "handled";

    if (map.fallthrough) {
      if (Object.prototype.toString.call(map.fallthrough) != "[object Array]")
        return lookupKey(key, map.fallthrough, handle, context);
      for (var i = 0; i < map.fallthrough.length; i++) {
        var result = lookupKey(key, map.fallthrough[i], handle, context);
        if (result) return result;
      }
    }
  };

  // Modifier key presses don't count as 'real' key presses for the
  // purpose of keymap fallthrough.
  var isModifierKey = CodeMirror.isModifierKey = function(value) {
    var name = typeof value == "string" ? value : keyNames[value.keyCode];
    return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod";
  };

  // Look up the name of a key as indicated by an event object.
  var keyName = CodeMirror.keyName = function(event, noShift) {
    if (presto && event.keyCode == 34 && event["char"]) return false;
    var base = keyNames[event.keyCode], name = base;
    if (name == null || event.altGraphKey) return false;
    if (event.altKey && base != "Alt") name = "Alt-" + name;
    if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl") name = "Ctrl-" + name;
    if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Cmd") name = "Cmd-" + name;
    if (!noShift && event.shiftKey && base != "Shift") name = "Shift-" + name;
    return name;
  };

  function getKeyMap(val) {
    return typeof val == "string" ? keyMap[val] : val;
  }

  // FROMTEXTAREA

  CodeMirror.fromTextArea = function(textarea, options) {
    if (!options) options = {};
    options.value = textarea.value;
    if (!options.tabindex && textarea.tabindex)
      options.tabindex = textarea.tabindex;
    if (!options.placeholder && textarea.placeholder)
      options.placeholder = textarea.placeholder;
    // Set autofocus to true if this textarea is focused, or if it has
    // autofocus and no other element is focused.
    if (options.autofocus == null) {
      var hasFocus = activeElt();
      options.autofocus = hasFocus == textarea ||
        textarea.getAttribute("autofocus") != null && hasFocus == document.body;
    }

    function save() {textarea.value = cm.getValue();}
    if (textarea.form) {
      on(textarea.form, "submit", save);
      // Deplorable hack to make the submit method do the right thing.
      if (!options.leaveSubmitMethodAlone) {
        var form = textarea.form, realSubmit = form.submit;
        try {
          var wrappedSubmit = form.submit = function() {
            save();
            form.submit = realSubmit;
            form.submit();
            form.submit = wrappedSubmit;
          };
        } catch(e) {}
      }
    }

    textarea.style.display = "none";
    var cm = CodeMirror(function(node) {
      textarea.parentNode.insertBefore(node, textarea.nextSibling);
    }, options);
    cm.save = save;
    cm.getTextArea = function() { return textarea; };
    cm.toTextArea = function() {
      cm.toTextArea = isNaN; // Prevent this from being ran twice
      save();
      textarea.parentNode.removeChild(cm.getWrapperElement());
      textarea.style.display = "";
      if (textarea.form) {
        off(textarea.form, "submit", save);
        if (typeof textarea.form.submit == "function")
          textarea.form.submit = realSubmit;
      }
    };
    return cm;
  };

  // STRING STREAM

  // Fed to the mode parsers, provides helper functions to make
  // parsers more succinct.

  var StringStream = CodeMirror.StringStream = function(string, tabSize) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
  };

  StringStream.prototype = {
    eol: function() {return this.pos >= this.string.length;},
    sol: function() {return this.pos == this.lineStart;},
    peek: function() {return this.string.charAt(this.pos) || undefined;},
    next: function() {
      if (this.pos < this.string.length)
        return this.string.charAt(this.pos++);
    },
    eat: function(match) {
      var ch = this.string.charAt(this.pos);
      if (typeof match == "string") var ok = ch == match;
      else var ok = ch && (match.test ? match.test(ch) : match(ch));
      if (ok) {++this.pos; return ch;}
    },
    eatWhile: function(match) {
      var start = this.pos;
      while (this.eat(match)){}
      return this.pos > start;
    },
    eatSpace: function() {
      var start = this.pos;
      while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) ++this.pos;
      return this.pos > start;
    },
    skipToEnd: function() {this.pos = this.string.length;},
    skipTo: function(ch) {
      var found = this.string.indexOf(ch, this.pos);
      if (found > -1) {this.pos = found; return true;}
    },
    backUp: function(n) {this.pos -= n;},
    column: function() {
      if (this.lastColumnPos < this.start) {
        this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
        this.lastColumnPos = this.start;
      }
      return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    indentation: function() {
      return countColumn(this.string, null, this.tabSize) -
        (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
    },
    match: function(pattern, consume, caseInsensitive) {
      if (typeof pattern == "string") {
        var cased = function(str) {return caseInsensitive ? str.toLowerCase() : str;};
        var substr = this.string.substr(this.pos, pattern.length);
        if (cased(substr) == cased(pattern)) {
          if (consume !== false) this.pos += pattern.length;
          return true;
        }
      } else {
        var match = this.string.slice(this.pos).match(pattern);
        if (match && match.index > 0) return null;
        if (match && consume !== false) this.pos += match[0].length;
        return match;
      }
    },
    current: function(){return this.string.slice(this.start, this.pos);},
    hideFirstChars: function(n, inner) {
      this.lineStart += n;
      try { return inner(); }
      finally { this.lineStart -= n; }
    }
  };

  // TEXTMARKERS

  // Created with markText and setBookmark methods. A TextMarker is a
  // handle that can be used to clear or find a marked position in the
  // document. Line objects hold arrays (markedSpans) containing
  // {from, to, marker} object pointing to such marker objects, and
  // indicating that such a marker is present on that line. Multiple
  // lines may point to the same marker when it spans across lines.
  // The spans will have null for their from/to properties when the
  // marker continues beyond the start/end of the line. Markers have
  // links back to the lines they currently touch.

  var TextMarker = CodeMirror.TextMarker = function(doc, type) {
    this.lines = [];
    this.type = type;
    this.doc = doc;
  };
  eventMixin(TextMarker);

  // Clear the marker.
  TextMarker.prototype.clear = function() {
    if (this.explicitlyCleared) return;
    var cm = this.doc.cm, withOp = cm && !cm.curOp;
    if (withOp) startOperation(cm);
    if (hasHandler(this, "clear")) {
      var found = this.find();
      if (found) signalLater(this, "clear", found.from, found.to);
    }
    var min = null, max = null;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this);
      if (cm && !this.collapsed) regLineChange(cm, lineNo(line), "text");
      else if (cm) {
        if (span.to != null) max = lineNo(line);
        if (span.from != null) min = lineNo(line);
      }
      line.markedSpans = removeMarkedSpan(line.markedSpans, span);
      if (span.from == null && this.collapsed && !lineIsHidden(this.doc, line) && cm)
        updateLineHeight(line, textHeight(cm.display));
    }
    if (cm && this.collapsed && !cm.options.lineWrapping) for (var i = 0; i < this.lines.length; ++i) {
      var visual = visualLine(this.lines[i]), len = lineLength(visual);
      if (len > cm.display.maxLineLength) {
        cm.display.maxLine = visual;
        cm.display.maxLineLength = len;
        cm.display.maxLineChanged = true;
      }
    }

    if (min != null && cm && this.collapsed) regChange(cm, min, max + 1);
    this.lines.length = 0;
    this.explicitlyCleared = true;
    if (this.atomic && this.doc.cantEdit) {
      this.doc.cantEdit = false;
      if (cm) reCheckSelection(cm.doc);
    }
    if (cm) signalLater(cm, "markerCleared", cm, this);
    if (withOp) endOperation(cm);
    if (this.parent) this.parent.clear();
  };

  // Find the position of the marker in the document. Returns a {from,
  // to} object by default. Side can be passed to get a specific side
  // -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
  // Pos objects returned contain a line object, rather than a line
  // number (used to prevent looking up the same line twice).
  TextMarker.prototype.find = function(side, lineObj) {
    if (side == null && this.type == "bookmark") side = 1;
    var from, to;
    for (var i = 0; i < this.lines.length; ++i) {
      var line = this.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this);
      if (span.from != null) {
        from = Pos(lineObj ? line : lineNo(line), span.from);
        if (side == -1) return from;
      }
      if (span.to != null) {
        to = Pos(lineObj ? line : lineNo(line), span.to);
        if (side == 1) return to;
      }
    }
    return from && {from: from, to: to};
  };

  // Signals that the marker's widget changed, and surrounding layout
  // should be recomputed.
  TextMarker.prototype.changed = function() {
    var pos = this.find(-1, true), widget = this, cm = this.doc.cm;
    if (!pos || !cm) return;
    runInOp(cm, function() {
      var line = pos.line, lineN = lineNo(pos.line);
      var view = findViewForLine(cm, lineN);
      if (view) {
        clearLineMeasurementCacheFor(view);
        cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
      }
      cm.curOp.updateMaxLine = true;
      if (!lineIsHidden(widget.doc, line) && widget.height != null) {
        var oldHeight = widget.height;
        widget.height = null;
        var dHeight = widgetHeight(widget) - oldHeight;
        if (dHeight)
          updateLineHeight(line, line.height + dHeight);
      }
    });
  };

  TextMarker.prototype.attachLine = function(line) {
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1)
        (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this);
    }
    this.lines.push(line);
  };
  TextMarker.prototype.detachLine = function(line) {
    this.lines.splice(indexOf(this.lines, line), 1);
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      (op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
    }
  };

  // Collapsed markers have unique ids, in order to be able to order
  // them, which is needed for uniquely determining an outer marker
  // when they overlap (they may nest, but not partially overlap).
  var nextMarkerId = 0;

  // Create a marker, wire it up to the right lines, and
  function markText(doc, from, to, options, type) {
    // Shared markers (across linked documents) are handled separately
    // (markTextShared will call out to this again, once per
    // document).
    if (options && options.shared) return markTextShared(doc, from, to, options, type);
    // Ensure we are in an operation.
    if (doc.cm && !doc.cm.curOp) return operation(doc.cm, markText)(doc, from, to, options, type);

    var marker = new TextMarker(doc, type), diff = cmp(from, to);
    if (options) copyObj(options, marker, false);
    // Don't connect empty markers unless clearWhenEmpty is false
    if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false)
      return marker;
    if (marker.replacedWith) {
      // Showing up as a widget implies collapsed (widget replaces text)
      marker.collapsed = true;
      marker.widgetNode = elt("span", [marker.replacedWith], "CodeMirror-widget");
      if (!options.handleMouseEvents) marker.widgetNode.setAttribute("cm-ignore-events", "true");
      if (options.insertLeft) marker.widgetNode.insertLeft = true;
    }
    if (marker.collapsed) {
      if (conflictingCollapsedRange(doc, from.line, from, to, marker) ||
          from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker))
        throw new Error("Inserting collapsed marker partially overlapping an existing one");
      sawCollapsedSpans = true;
    }

    if (marker.addToHistory)
      addChangeToHistory(doc, {from: from, to: to, origin: "markText"}, doc.sel, NaN);

    var curLine = from.line, cm = doc.cm, updateMaxLine;
    doc.iter(curLine, to.line + 1, function(line) {
      if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine)
        updateMaxLine = true;
      if (marker.collapsed && curLine != from.line) updateLineHeight(line, 0);
      addMarkedSpan(line, new MarkedSpan(marker,
                                         curLine == from.line ? from.ch : null,
                                         curLine == to.line ? to.ch : null));
      ++curLine;
    });
    // lineIsHidden depends on the presence of the spans, so needs a second pass
    if (marker.collapsed) doc.iter(from.line, to.line + 1, function(line) {
      if (lineIsHidden(doc, line)) updateLineHeight(line, 0);
    });

    if (marker.clearOnEnter) on(marker, "beforeCursorEnter", function() { marker.clear(); });

    if (marker.readOnly) {
      sawReadOnlySpans = true;
      if (doc.history.done.length || doc.history.undone.length)
        doc.clearHistory();
    }
    if (marker.collapsed) {
      marker.id = ++nextMarkerId;
      marker.atomic = true;
    }
    if (cm) {
      // Sync editor state
      if (updateMaxLine) cm.curOp.updateMaxLine = true;
      if (marker.collapsed)
        regChange(cm, from.line, to.line + 1);
      else if (marker.className || marker.title || marker.startStyle || marker.endStyle || marker.css)
        for (var i = from.line; i <= to.line; i++) regLineChange(cm, i, "text");
      if (marker.atomic) reCheckSelection(cm.doc);
      signalLater(cm, "markerAdded", cm, marker);
    }
    return marker;
  }

  // SHARED TEXTMARKERS

  // A shared marker spans multiple linked documents. It is
  // implemented as a meta-marker-object controlling multiple normal
  // markers.
  var SharedTextMarker = CodeMirror.SharedTextMarker = function(markers, primary) {
    this.markers = markers;
    this.primary = primary;
    for (var i = 0; i < markers.length; ++i)
      markers[i].parent = this;
  };
  eventMixin(SharedTextMarker);

  SharedTextMarker.prototype.clear = function() {
    if (this.explicitlyCleared) return;
    this.explicitlyCleared = true;
    for (var i = 0; i < this.markers.length; ++i)
      this.markers[i].clear();
    signalLater(this, "clear");
  };
  SharedTextMarker.prototype.find = function(side, lineObj) {
    return this.primary.find(side, lineObj);
  };

  function markTextShared(doc, from, to, options, type) {
    options = copyObj(options);
    options.shared = false;
    var markers = [markText(doc, from, to, options, type)], primary = markers[0];
    var widget = options.widgetNode;
    linkedDocs(doc, function(doc) {
      if (widget) options.widgetNode = widget.cloneNode(true);
      markers.push(markText(doc, clipPos(doc, from), clipPos(doc, to), options, type));
      for (var i = 0; i < doc.linked.length; ++i)
        if (doc.linked[i].isParent) return;
      primary = lst(markers);
    });
    return new SharedTextMarker(markers, primary);
  }

  function findSharedMarkers(doc) {
    return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())),
                         function(m) { return m.parent; });
  }

  function copySharedMarkers(doc, markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i], pos = marker.find();
      var mFrom = doc.clipPos(pos.from), mTo = doc.clipPos(pos.to);
      if (cmp(mFrom, mTo)) {
        var subMark = markText(doc, mFrom, mTo, marker.primary, marker.primary.type);
        marker.markers.push(subMark);
        subMark.parent = marker;
      }
    }
  }

  function detachSharedMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i], linked = [marker.primary.doc];;
      linkedDocs(marker.primary.doc, function(d) { linked.push(d); });
      for (var j = 0; j < marker.markers.length; j++) {
        var subMarker = marker.markers[j];
        if (indexOf(linked, subMarker.doc) == -1) {
          subMarker.parent = null;
          marker.markers.splice(j--, 1);
        }
      }
    }
  }

  // TEXTMARKER SPANS

  function MarkedSpan(marker, from, to) {
    this.marker = marker;
    this.from = from; this.to = to;
  }

  // Search an array of spans for a span matching the given marker.
  function getMarkedSpanFor(spans, marker) {
    if (spans) for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.marker == marker) return span;
    }
  }
  // Remove a span from an array, returning undefined if no spans are
  // left (we don't store arrays for lines without spans).
  function removeMarkedSpan(spans, span) {
    for (var r, i = 0; i < spans.length; ++i)
      if (spans[i] != span) (r || (r = [])).push(spans[i]);
    return r;
  }
  // Add a span to a line.
  function addMarkedSpan(line, span) {
    line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
    span.marker.attachLine(line);
  }

  // Used for the algorithm that adjusts markers for a change in the
  // document. These functions cut an array of spans at a given
  // character position, returning an array of remaining chunks (or
  // undefined if nothing remains).
  function markedSpansBefore(old, startCh, isInsert) {
    if (old) for (var i = 0, nw; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
      if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);
        (nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
      }
    }
    return nw;
  }
  function markedSpansAfter(old, endCh, isInsert) {
    if (old) for (var i = 0, nw; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
      if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);
        (nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh,
                                              span.to == null ? null : span.to - endCh));
      }
    }
    return nw;
  }

  // Given a change object, compute the new set of marker spans that
  // cover the line in which the change took place. Removes spans
  // entirely within the change, reconnects spans belonging to the
  // same marker that appear on both sides of the change, and cuts off
  // spans partially within the change. Returns an array of span
  // arrays with one element for each line in (after) the change.
  function stretchSpansOverChange(doc, change) {
    if (change.full) return null;
    var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
    var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;
    if (!oldFirst && !oldLast) return null;

    var startCh = change.from.ch, endCh = change.to.ch, isInsert = cmp(change.from, change.to) == 0;
    // Get the spans that 'stick out' on both sides
    var first = markedSpansBefore(oldFirst, startCh, isInsert);
    var last = markedSpansAfter(oldLast, endCh, isInsert);

    // Next, merge those two ends
    var sameLine = change.text.length == 1, offset = lst(change.text).length + (sameLine ? startCh : 0);
    if (first) {
      // Fix up .to properties of first
      for (var i = 0; i < first.length; ++i) {
        var span = first[i];
        if (span.to == null) {
          var found = getMarkedSpanFor(last, span.marker);
          if (!found) span.to = startCh;
          else if (sameLine) span.to = found.to == null ? null : found.to + offset;
        }
      }
    }
    if (last) {
      // Fix up .from in last (or move them into first in case of sameLine)
      for (var i = 0; i < last.length; ++i) {
        var span = last[i];
        if (span.to != null) span.to += offset;
        if (span.from == null) {
          var found = getMarkedSpanFor(first, span.marker);
          if (!found) {
            span.from = offset;
            if (sameLine) (first || (first = [])).push(span);
          }
        } else {
          span.from += offset;
          if (sameLine) (first || (first = [])).push(span);
        }
      }
    }
    // Make sure we didn't create any zero-length spans
    if (first) first = clearEmptySpans(first);
    if (last && last != first) last = clearEmptySpans(last);

    var newMarkers = [first];
    if (!sameLine) {
      // Fill gap with whole-line-spans
      var gap = change.text.length - 2, gapMarkers;
      if (gap > 0 && first)
        for (var i = 0; i < first.length; ++i)
          if (first[i].to == null)
            (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i].marker, null, null));
      for (var i = 0; i < gap; ++i)
        newMarkers.push(gapMarkers);
      newMarkers.push(last);
    }
    return newMarkers;
  }

  // Remove spans that are empty and don't have a clearWhenEmpty
  // option of false.
  function clearEmptySpans(spans) {
    for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false)
        spans.splice(i--, 1);
    }
    if (!spans.length) return null;
    return spans;
  }

  // Used for un/re-doing changes from the history. Combines the
  // result of computing the existing spans with the set of spans that
  // existed in the history (so that deleting around a span and then
  // undoing brings back the span).
  function mergeOldSpans(doc, change) {
    var old = getOldSpans(doc, change);
    var stretched = stretchSpansOverChange(doc, change);
    if (!old) return stretched;
    if (!stretched) return old;

    for (var i = 0; i < old.length; ++i) {
      var oldCur = old[i], stretchCur = stretched[i];
      if (oldCur && stretchCur) {
        spans: for (var j = 0; j < stretchCur.length; ++j) {
          var span = stretchCur[j];
          for (var k = 0; k < oldCur.length; ++k)
            if (oldCur[k].marker == span.marker) continue spans;
          oldCur.push(span);
        }
      } else if (stretchCur) {
        old[i] = stretchCur;
      }
    }
    return old;
  }

  // Used to 'clip' out readOnly ranges when making a change.
  function removeReadOnlyRanges(doc, from, to) {
    var markers = null;
    doc.iter(from.line, to.line + 1, function(line) {
      if (line.markedSpans) for (var i = 0; i < line.markedSpans.length; ++i) {
        var mark = line.markedSpans[i].marker;
        if (mark.readOnly && (!markers || indexOf(markers, mark) == -1))
          (markers || (markers = [])).push(mark);
      }
    });
    if (!markers) return null;
    var parts = [{from: from, to: to}];
    for (var i = 0; i < markers.length; ++i) {
      var mk = markers[i], m = mk.find(0);
      for (var j = 0; j < parts.length; ++j) {
        var p = parts[j];
        if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) continue;
        var newParts = [j, 1], dfrom = cmp(p.from, m.from), dto = cmp(p.to, m.to);
        if (dfrom < 0 || !mk.inclusiveLeft && !dfrom)
          newParts.push({from: p.from, to: m.from});
        if (dto > 0 || !mk.inclusiveRight && !dto)
          newParts.push({from: m.to, to: p.to});
        parts.splice.apply(parts, newParts);
        j += newParts.length - 1;
      }
    }
    return parts;
  }

  // Connect or disconnect spans from a line.
  function detachMarkedSpans(line) {
    var spans = line.markedSpans;
    if (!spans) return;
    for (var i = 0; i < spans.length; ++i)
      spans[i].marker.detachLine(line);
    line.markedSpans = null;
  }
  function attachMarkedSpans(line, spans) {
    if (!spans) return;
    for (var i = 0; i < spans.length; ++i)
      spans[i].marker.attachLine(line);
    line.markedSpans = spans;
  }

  // Helpers used when computing which overlapping collapsed span
  // counts as the larger one.
  function extraLeft(marker) { return marker.inclusiveLeft ? -1 : 0; }
  function extraRight(marker) { return marker.inclusiveRight ? 1 : 0; }

  // Returns a number indicating which of two overlapping collapsed
  // spans is larger (and thus includes the other). Falls back to
  // comparing ids when the spans cover exactly the same range.
  function compareCollapsedMarkers(a, b) {
    var lenDiff = a.lines.length - b.lines.length;
    if (lenDiff != 0) return lenDiff;
    var aPos = a.find(), bPos = b.find();
    var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);
    if (fromCmp) return -fromCmp;
    var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);
    if (toCmp) return toCmp;
    return b.id - a.id;
  }

  // Find out whether a line ends or starts in a collapsed span. If
  // so, return the marker for that span.
  function collapsedSpanAtSide(line, start) {
    var sps = sawCollapsedSpans && line.markedSpans, found;
    if (sps) for (var sp, i = 0; i < sps.length; ++i) {
      sp = sps[i];
      if (sp.marker.collapsed && (start ? sp.from : sp.to) == null &&
          (!found || compareCollapsedMarkers(found, sp.marker) < 0))
        found = sp.marker;
    }
    return found;
  }
  function collapsedSpanAtStart(line) { return collapsedSpanAtSide(line, true); }
  function collapsedSpanAtEnd(line) { return collapsedSpanAtSide(line, false); }

  // Test whether there exists a collapsed span that partially
  // overlaps (covers the start or end, but not both) of a new span.
  // Such overlap is not allowed.
  function conflictingCollapsedRange(doc, lineNo, from, to, marker) {
    var line = getLine(doc, lineNo);
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) for (var i = 0; i < sps.length; ++i) {
      var sp = sps[i];
      if (!sp.marker.collapsed) continue;
      var found = sp.marker.find(0);
      var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
      var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);
      if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) continue;
      if (fromCmp <= 0 && (cmp(found.to, from) > 0 || (sp.marker.inclusiveRight && marker.inclusiveLeft)) ||
          fromCmp >= 0 && (cmp(found.from, to) < 0 || (sp.marker.inclusiveLeft && marker.inclusiveRight)))
        return true;
    }
  }

  // A visual line is a line as drawn on the screen. Folding, for
  // example, can cause multiple logical lines to appear on the same
  // visual line. This finds the start of the visual line that the
  // given line is part of (usually that is the line itself).
  function visualLine(line) {
    var merged;
    while (merged = collapsedSpanAtStart(line))
      line = merged.find(-1, true).line;
    return line;
  }

  // Returns an array of logical lines that continue the visual line
  // started by the argument, or undefined if there are no such lines.
  function visualLineContinued(line) {
    var merged, lines;
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      (lines || (lines = [])).push(line);
    }
    return lines;
  }

  // Get the line number of the start of the visual line that the
  // given line number is part of.
  function visualLineNo(doc, lineN) {
    var line = getLine(doc, lineN), vis = visualLine(line);
    if (line == vis) return lineN;
    return lineNo(vis);
  }
  // Get the line number of the start of the next visual line after
  // the given line.
  function visualLineEndNo(doc, lineN) {
    if (lineN > doc.lastLine()) return lineN;
    var line = getLine(doc, lineN), merged;
    if (!lineIsHidden(doc, line)) return lineN;
    while (merged = collapsedSpanAtEnd(line))
      line = merged.find(1, true).line;
    return lineNo(line) + 1;
  }

  // Compute whether a line is hidden. Lines count as hidden when they
  // are part of a visual line that starts with another line, or when
  // they are entirely covered by collapsed, non-widget span.
  function lineIsHidden(doc, line) {
    var sps = sawCollapsedSpans && line.markedSpans;
    if (sps) for (var sp, i = 0; i < sps.length; ++i) {
      sp = sps[i];
      if (!sp.marker.collapsed) continue;
      if (sp.from == null) return true;
      if (sp.marker.widgetNode) continue;
      if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp))
        return true;
    }
  }
  function lineIsHiddenInner(doc, line, span) {
    if (span.to == null) {
      var end = span.marker.find(1, true);
      return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker));
    }
    if (span.marker.inclusiveRight && span.to == line.text.length)
      return true;
    for (var sp, i = 0; i < line.markedSpans.length; ++i) {
      sp = line.markedSpans[i];
      if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to &&
          (sp.to == null || sp.to != span.from) &&
          (sp.marker.inclusiveLeft || span.marker.inclusiveRight) &&
          lineIsHiddenInner(doc, line, sp)) return true;
    }
  }

  // LINE WIDGETS

  // Line widgets are block elements displayed above or below a line.

  var LineWidget = CodeMirror.LineWidget = function(cm, node, options) {
    if (options) for (var opt in options) if (options.hasOwnProperty(opt))
      this[opt] = options[opt];
    this.cm = cm;
    this.node = node;
  };
  eventMixin(LineWidget);

  function adjustScrollWhenAboveVisible(cm, line, diff) {
    if (heightAtLine(line) < ((cm.curOp && cm.curOp.scrollTop) || cm.doc.scrollTop))
      addToScrollPos(cm, null, diff);
  }

  LineWidget.prototype.clear = function() {
    var cm = this.cm, ws = this.line.widgets, line = this.line, no = lineNo(line);
    if (no == null || !ws) return;
    for (var i = 0; i < ws.length; ++i) if (ws[i] == this) ws.splice(i--, 1);
    if (!ws.length) line.widgets = null;
    var height = widgetHeight(this);
    runInOp(cm, function() {
      adjustScrollWhenAboveVisible(cm, line, -height);
      regLineChange(cm, no, "widget");
      updateLineHeight(line, Math.max(0, line.height - height));
    });
  };
  LineWidget.prototype.changed = function() {
    var oldH = this.height, cm = this.cm, line = this.line;
    this.height = null;
    var diff = widgetHeight(this) - oldH;
    if (!diff) return;
    runInOp(cm, function() {
      cm.curOp.forceUpdate = true;
      adjustScrollWhenAboveVisible(cm, line, diff);
      updateLineHeight(line, line.height + diff);
    });
  };

  function widgetHeight(widget) {
    if (widget.height != null) return widget.height;
    if (!contains(document.body, widget.node)) {
      var parentStyle = "position: relative;";
      if (widget.coverGutter)
        parentStyle += "margin-left: -" + widget.cm.display.gutters.offsetWidth + "px;";
      if (widget.noHScroll)
        parentStyle += "width: " + widget.cm.display.wrapper.clientWidth + "px;";
      removeChildrenAndAdd(widget.cm.display.measure, elt("div", [widget.node], null, parentStyle));
    }
    return widget.height = widget.node.offsetHeight;
  }

  function addLineWidget(cm, handle, node, options) {
    var widget = new LineWidget(cm, node, options);
    if (widget.noHScroll) cm.display.alignWidgets = true;
    changeLine(cm.doc, handle, "widget", function(line) {
      var widgets = line.widgets || (line.widgets = []);
      if (widget.insertAt == null) widgets.push(widget);
      else widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget);
      widget.line = line;
      if (!lineIsHidden(cm.doc, line)) {
        var aboveVisible = heightAtLine(line) < cm.doc.scrollTop;
        updateLineHeight(line, line.height + widgetHeight(widget));
        if (aboveVisible) addToScrollPos(cm, null, widget.height);
        cm.curOp.forceUpdate = true;
      }
      return true;
    });
    return widget;
  }

  // LINE DATA STRUCTURE

  // Line objects. These hold state related to a line, including
  // highlighting info (the styles array).
  var Line = CodeMirror.Line = function(text, markedSpans, estimateHeight) {
    this.text = text;
    attachMarkedSpans(this, markedSpans);
    this.height = estimateHeight ? estimateHeight(this) : 1;
  };
  eventMixin(Line);
  Line.prototype.lineNo = function() { return lineNo(this); };

  // Change the content (text, markers) of a line. Automatically
  // invalidates cached information and tries to re-estimate the
  // line's height.
  function updateLine(line, text, markedSpans, estimateHeight) {
    line.text = text;
    if (line.stateAfter) line.stateAfter = null;
    if (line.styles) line.styles = null;
    if (line.order != null) line.order = null;
    detachMarkedSpans(line);
    attachMarkedSpans(line, markedSpans);
    var estHeight = estimateHeight ? estimateHeight(line) : 1;
    if (estHeight != line.height) updateLineHeight(line, estHeight);
  }

  // Detach a line from the document tree and its markers.
  function cleanUpLine(line) {
    line.parent = null;
    detachMarkedSpans(line);
  }

  function extractLineClasses(type, output) {
    if (type) for (;;) {
      var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);
      if (!lineClass) break;
      type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
      var prop = lineClass[1] ? "bgClass" : "textClass";
      if (output[prop] == null)
        output[prop] = lineClass[2];
      else if (!(new RegExp("(?:^|\s)" + lineClass[2] + "(?:$|\s)")).test(output[prop]))
        output[prop] += " " + lineClass[2];
    }
    return type;
  }

  function callBlankLine(mode, state) {
    if (mode.blankLine) return mode.blankLine(state);
    if (!mode.innerMode) return;
    var inner = CodeMirror.innerMode(mode, state);
    if (inner.mode.blankLine) return inner.mode.blankLine(inner.state);
  }

  function readToken(mode, stream, state, inner) {
    for (var i = 0; i < 10; i++) {
      if (inner) inner[0] = CodeMirror.innerMode(mode, state).mode;
      var style = mode.token(stream, state);
      if (stream.pos > stream.start) return style;
    }
    throw new Error("Mode " + mode.name + " failed to advance stream.");
  }

  // Utility for getTokenAt and getLineTokens
  function takeToken(cm, pos, precise, asArray) {
    function getObj(copy) {
      return {start: stream.start, end: stream.pos,
              string: stream.current(),
              type: style || null,
              state: copy ? copyState(doc.mode, state) : state};
    }

    var doc = cm.doc, mode = doc.mode, style;
    pos = clipPos(doc, pos);
    var line = getLine(doc, pos.line), state = getStateBefore(cm, pos.line, precise);
    var stream = new StringStream(line.text, cm.options.tabSize), tokens;
    if (asArray) tokens = [];
    while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
      stream.start = stream.pos;
      style = readToken(mode, stream, state);
      if (asArray) tokens.push(getObj(true));
    }
    return asArray ? tokens : getObj();
  }

  // Run the given mode's parser over a line, calling f for each token.
  function runMode(cm, text, mode, state, f, lineClasses, forceToEnd) {
    var flattenSpans = mode.flattenSpans;
    if (flattenSpans == null) flattenSpans = cm.options.flattenSpans;
    var curStart = 0, curStyle = null;
    var stream = new StringStream(text, cm.options.tabSize), style;
    var inner = cm.options.addModeClass && [null];
    if (text == "") extractLineClasses(callBlankLine(mode, state), lineClasses);
    while (!stream.eol()) {
      if (stream.pos > cm.options.maxHighlightLength) {
        flattenSpans = false;
        if (forceToEnd) processLine(cm, text, state, stream.pos);
        stream.pos = text.length;
        style = null;
      } else {
        style = extractLineClasses(readToken(mode, stream, state, inner), lineClasses);
      }
      if (inner) {
        var mName = inner[0].name;
        if (mName) style = "m-" + (style ? mName + " " + style : mName);
      }
      if (!flattenSpans || curStyle != style) {
        while (curStart < stream.start) {
          curStart = Math.min(stream.start, curStart + 50000);
          f(curStart, curStyle);
        }
        curStyle = style;
      }
      stream.start = stream.pos;
    }
    while (curStart < stream.pos) {
      // Webkit seems to refuse to render text nodes longer than 57444 characters
      var pos = Math.min(stream.pos, curStart + 50000);
      f(pos, curStyle);
      curStart = pos;
    }
  }

  // Compute a style array (an array starting with a mode generation
  // -- for invalidation -- followed by pairs of end positions and
  // style strings), which is used to highlight the tokens on the
  // line.
  function highlightLine(cm, line, state, forceToEnd) {
    // A styles array always starts with a number identifying the
    // mode/overlays that it is based on (for easy invalidation).
    var st = [cm.state.modeGen], lineClasses = {};
    // Compute the base array of styles
    runMode(cm, line.text, cm.doc.mode, state, function(end, style) {
      st.push(end, style);
    }, lineClasses, forceToEnd);

    // Run overlays, adjust style array.
    for (var o = 0; o < cm.state.overlays.length; ++o) {
      var overlay = cm.state.overlays[o], i = 1, at = 0;
      runMode(cm, line.text, overlay.mode, true, function(end, style) {
        var start = i;
        // Ensure there's a token end at the current position, and that i points at it
        while (at < end) {
          var i_end = st[i];
          if (i_end > end)
            st.splice(i, 1, end, st[i+1], i_end);
          i += 2;
          at = Math.min(end, i_end);
        }
        if (!style) return;
        if (overlay.opaque) {
          st.splice(start, i - start, end, "cm-overlay " + style);
          i = start + 2;
        } else {
          for (; start < i; start += 2) {
            var cur = st[start+1];
            st[start+1] = (cur ? cur + " " : "") + "cm-overlay " + style;
          }
        }
      }, lineClasses);
    }

    return {styles: st, classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null};
  }

  function getLineStyles(cm, line, updateFrontier) {
    if (!line.styles || line.styles[0] != cm.state.modeGen) {
      var result = highlightLine(cm, line, line.stateAfter = getStateBefore(cm, lineNo(line)));
      line.styles = result.styles;
      if (result.classes) line.styleClasses = result.classes;
      else if (line.styleClasses) line.styleClasses = null;
      if (updateFrontier === cm.doc.frontier) cm.doc.frontier++;
    }
    return line.styles;
  }

  // Lightweight form of highlight -- proceed over this line and
  // update state, but don't save a style array. Used for lines that
  // aren't currently visible.
  function processLine(cm, text, state, startAt) {
    var mode = cm.doc.mode;
    var stream = new StringStream(text, cm.options.tabSize);
    stream.start = stream.pos = startAt || 0;
    if (text == "") callBlankLine(mode, state);
    while (!stream.eol() && stream.pos <= cm.options.maxHighlightLength) {
      readToken(mode, stream, state);
      stream.start = stream.pos;
    }
  }

  // Convert a style as returned by a mode (either null, or a string
  // containing one or more styles) to a CSS style. This is cached,
  // and also looks for line-wide styles.
  var styleToClassCache = {}, styleToClassCacheWithMode = {};
  function interpretTokenStyle(style, options) {
    if (!style || /^\s*$/.test(style)) return null;
    var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
    return cache[style] ||
      (cache[style] = style.replace(/\S+/g, "cm-$&"));
  }

  // Render the DOM representation of the text of a line. Also builds
  // up a 'line map', which points at the DOM nodes that represent
  // specific stretches of text, and is used by the measuring code.
  // The returned object contains the DOM node, this map, and
  // information about line-wide styles that were set by the mode.
  function buildLineContent(cm, lineView) {
    // The padding-right forces the element to have a 'border', which
    // is needed on Webkit to be able to get line-level bounding
    // rectangles for it (in measureChar).
    var content = elt("span", null, null, webkit ? "padding-right: .1px" : null);
    var builder = {pre: elt("pre", [content]), content: content, col: 0, pos: 0, cm: cm};
    lineView.measure = {};

    // Iterate over the logical lines that make up this visual line.
    for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
      var line = i ? lineView.rest[i - 1] : lineView.line, order;
      builder.pos = 0;
      builder.addToken = buildToken;
      // Optionally wire in some hacks into the token-rendering
      // algorithm, to deal with browser quirks.
      if ((ie || webkit) && cm.getOption("lineWrapping"))
        builder.addToken = buildTokenSplitSpaces(builder.addToken);
      if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line)))
        builder.addToken = buildTokenBadBidi(builder.addToken, order);
      builder.map = [];
      var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
      insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));
      if (line.styleClasses) {
        if (line.styleClasses.bgClass)
          builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "");
        if (line.styleClasses.textClass)
          builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || "");
      }

      // Ensure at least a single node is present, for measuring.
      if (builder.map.length == 0)
        builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure)));

      // Store the map and a cache object for the current logical line
      if (i == 0) {
        lineView.measure.map = builder.map;
        lineView.measure.cache = {};
      } else {
        (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map);
        (lineView.measure.caches || (lineView.measure.caches = [])).push({});
      }
    }

    // See issue #2901
    if (webkit && /\bcm-tab\b/.test(builder.content.lastChild.className))
      builder.content.className = "cm-tab-wrap-hack";

    signal(cm, "renderLine", cm, lineView.line, builder.pre);
    if (builder.pre.className)
      builder.textClass = joinClasses(builder.pre.className, builder.textClass || "");

    return builder;
  }

  function defaultSpecialCharPlaceholder(ch) {
    var token = elt("span", "\u2022", "cm-invalidchar");
    token.title = "\\u" + ch.charCodeAt(0).toString(16);
    return token;
  }

  // Build up the DOM representation for a single token, and add it to
  // the line map. Takes care to render special characters separately.
  function buildToken(builder, text, style, startStyle, endStyle, title, css) {
    if (!text) return;
    var special = builder.cm.options.specialChars, mustWrap = false;
    if (!special.test(text)) {
      builder.col += text.length;
      var content = document.createTextNode(text);
      builder.map.push(builder.pos, builder.pos + text.length, content);
      if (ie && ie_version < 9) mustWrap = true;
      builder.pos += text.length;
    } else {
      var content = document.createDocumentFragment(), pos = 0;
      while (true) {
        special.lastIndex = pos;
        var m = special.exec(text);
        var skipped = m ? m.index - pos : text.length - pos;
        if (skipped) {
          var txt = document.createTextNode(text.slice(pos, pos + skipped));
          if (ie && ie_version < 9) content.appendChild(elt("span", [txt]));
          else content.appendChild(txt);
          builder.map.push(builder.pos, builder.pos + skipped, txt);
          builder.col += skipped;
          builder.pos += skipped;
        }
        if (!m) break;
        pos += skipped + 1;
        if (m[0] == "\t") {
          var tabSize = builder.cm.options.tabSize, tabWidth = tabSize - builder.col % tabSize;
          var txt = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
          builder.col += tabWidth;
        } else {
          var txt = builder.cm.options.specialCharPlaceholder(m[0]);
          if (ie && ie_version < 9) content.appendChild(elt("span", [txt]));
          else content.appendChild(txt);
          builder.col += 1;
        }
        builder.map.push(builder.pos, builder.pos + 1, txt);
        builder.pos++;
      }
    }
    if (style || startStyle || endStyle || mustWrap || css) {
      var fullStyle = style || "";
      if (startStyle) fullStyle += startStyle;
      if (endStyle) fullStyle += endStyle;
      var token = elt("span", [content], fullStyle, css);
      if (title) token.title = title;
      return builder.content.appendChild(token);
    }
    builder.content.appendChild(content);
  }

  function buildTokenSplitSpaces(inner) {
    function split(old) {
      var out = " ";
      for (var i = 0; i < old.length - 2; ++i) out += i % 2 ? " " : "\u00a0";
      out += " ";
      return out;
    }
    return function(builder, text, style, startStyle, endStyle, title) {
      inner(builder, text.replace(/ {3,}/g, split), style, startStyle, endStyle, title);
    };
  }

  // Work around nonsense dimensions being reported for stretches of
  // right-to-left text.
  function buildTokenBadBidi(inner, order) {
    return function(builder, text, style, startStyle, endStyle, title) {
      style = style ? style + " cm-force-border" : "cm-force-border";
      var start = builder.pos, end = start + text.length;
      for (;;) {
        // Find the part that overlaps with the start of this text
        for (var i = 0; i < order.length; i++) {
          var part = order[i];
          if (part.to > start && part.from <= start) break;
        }
        if (part.to >= end) return inner(builder, text, style, startStyle, endStyle, title);
        inner(builder, text.slice(0, part.to - start), style, startStyle, null, title);
        startStyle = null;
        text = text.slice(part.to - start);
        start = part.to;
      }
    };
  }

  function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
    var widget = !ignoreWidget && marker.widgetNode;
    if (widget) {
      builder.map.push(builder.pos, builder.pos + size, widget);
      builder.content.appendChild(widget);
    }
    builder.pos += size;
  }

  // Outputs a number of spans to make up a line, taking highlighting
  // and marked text into account.
  function insertLineContent(line, builder, styles) {
    var spans = line.markedSpans, allText = line.text, at = 0;
    if (!spans) {
      for (var i = 1; i < styles.length; i+=2)
        builder.addToken(builder, allText.slice(at, at = styles[i]), interpretTokenStyle(styles[i+1], builder.cm.options));
      return;
    }

    var len = allText.length, pos = 0, i = 1, text = "", style, css;
    var nextChange = 0, spanStyle, spanEndStyle, spanStartStyle, title, collapsed;
    for (;;) {
      if (nextChange == pos) { // Update current marker set
        spanStyle = spanEndStyle = spanStartStyle = title = css = "";
        collapsed = null; nextChange = Infinity;
        var foundBookmarks = [];
        for (var j = 0; j < spans.length; ++j) {
          var sp = spans[j], m = sp.marker;
          if (sp.from <= pos && (sp.to == null || sp.to > pos)) {
            if (sp.to != null && nextChange > sp.to) { nextChange = sp.to; spanEndStyle = ""; }
            if (m.className) spanStyle += " " + m.className;
            if (m.css) css = m.css;
            if (m.startStyle && sp.from == pos) spanStartStyle += " " + m.startStyle;
            if (m.endStyle && sp.to == nextChange) spanEndStyle += " " + m.endStyle;
            if (m.title && !title) title = m.title;
            if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0))
              collapsed = sp;
          } else if (sp.from > pos && nextChange > sp.from) {
            nextChange = sp.from;
          }
          if (m.type == "bookmark" && sp.from == pos && m.widgetNode) foundBookmarks.push(m);
        }
        if (collapsed && (collapsed.from || 0) == pos) {
          buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos,
                             collapsed.marker, collapsed.from == null);
          if (collapsed.to == null) return;
        }
        if (!collapsed && foundBookmarks.length) for (var j = 0; j < foundBookmarks.length; ++j)
          buildCollapsedSpan(builder, 0, foundBookmarks[j]);
      }
      if (pos >= len) break;

      var upto = Math.min(len, nextChange);
      while (true) {
        if (text) {
          var end = pos + text.length;
          if (!collapsed) {
            var tokenText = end > upto ? text.slice(0, upto - pos) : text;
            builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle,
                             spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", title, css);
          }
          if (end >= upto) {text = text.slice(upto - pos); pos = upto; break;}
          pos = end;
          spanStartStyle = "";
        }
        text = allText.slice(at, at = styles[i++]);
        style = interpretTokenStyle(styles[i++], builder.cm.options);
      }
    }
  }

  // DOCUMENT DATA STRUCTURE

  // By default, updates that start and end at the beginning of a line
  // are treated specially, in order to make the association of line
  // widgets and marker elements with the text behave more intuitive.
  function isWholeLineUpdate(doc, change) {
    return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" &&
      (!doc.cm || doc.cm.options.wholeLineUpdateBefore);
  }

  // Perform a change on the document data structure.
  function updateDoc(doc, change, markedSpans, estimateHeight) {
    function spansFor(n) {return markedSpans ? markedSpans[n] : null;}
    function update(line, text, spans) {
      updateLine(line, text, spans, estimateHeight);
      signalLater(line, "change", line, change);
    }
    function linesFor(start, end) {
      for (var i = start, result = []; i < end; ++i)
        result.push(new Line(text[i], spansFor(i), estimateHeight));
      return result;
    }

    var from = change.from, to = change.to, text = change.text;
    var firstLine = getLine(doc, from.line), lastLine = getLine(doc, to.line);
    var lastText = lst(text), lastSpans = spansFor(text.length - 1), nlines = to.line - from.line;

    // Adjust the line structure
    if (change.full) {
      doc.insert(0, linesFor(0, text.length));
      doc.remove(text.length, doc.size - text.length);
    } else if (isWholeLineUpdate(doc, change)) {
      // This is a whole-line replace. Treated specially to make
      // sure line objects move the way they are supposed to.
      var added = linesFor(0, text.length - 1);
      update(lastLine, lastLine.text, lastSpans);
      if (nlines) doc.remove(from.line, nlines);
      if (added.length) doc.insert(from.line, added);
    } else if (firstLine == lastLine) {
      if (text.length == 1) {
        update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
      } else {
        var added = linesFor(1, text.length - 1);
        added.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight));
        update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
        doc.insert(from.line + 1, added);
      }
    } else if (text.length == 1) {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
      doc.remove(from.line + 1, nlines);
    } else {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
      update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
      var added = linesFor(1, text.length - 1);
      if (nlines > 1) doc.remove(from.line + 1, nlines - 1);
      doc.insert(from.line + 1, added);
    }

    signalLater(doc, "change", doc, change);
  }

  // The document is represented as a BTree consisting of leaves, with
  // chunk of lines in them, and branches, with up to ten leaves or
  // other branch nodes below them. The top node is always a branch
  // node, and is the document object itself (meaning it has
  // additional methods and properties).
  //
  // All nodes have parent links. The tree is used both to go from
  // line numbers to line objects, and to go from objects to numbers.
  // It also indexes by height, and is used to convert between height
  // and line object, and to find the total height of the document.
  //
  // See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html

  function LeafChunk(lines) {
    this.lines = lines;
    this.parent = null;
    for (var i = 0, height = 0; i < lines.length; ++i) {
      lines[i].parent = this;
      height += lines[i].height;
    }
    this.height = height;
  }

  LeafChunk.prototype = {
    chunkSize: function() { return this.lines.length; },
    // Remove the n lines at offset 'at'.
    removeInner: function(at, n) {
      for (var i = at, e = at + n; i < e; ++i) {
        var line = this.lines[i];
        this.height -= line.height;
        cleanUpLine(line);
        signalLater(line, "delete");
      }
      this.lines.splice(at, n);
    },
    // Helper used to collapse a small branch into a single leaf.
    collapse: function(lines) {
      lines.push.apply(lines, this.lines);
    },
    // Insert the given array of lines at offset 'at', count them as
    // having the given height.
    insertInner: function(at, lines, height) {
      this.height += height;
      this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
      for (var i = 0; i < lines.length; ++i) lines[i].parent = this;
    },
    // Used to iterate over a part of the tree.
    iterN: function(at, n, op) {
      for (var e = at + n; at < e; ++at)
        if (op(this.lines[at])) return true;
    }
  };

  function BranchChunk(children) {
    this.children = children;
    var size = 0, height = 0;
    for (var i = 0; i < children.length; ++i) {
      var ch = children[i];
      size += ch.chunkSize(); height += ch.height;
      ch.parent = this;
    }
    this.size = size;
    this.height = height;
    this.parent = null;
  }

  BranchChunk.prototype = {
    chunkSize: function() { return this.size; },
    removeInner: function(at, n) {
      this.size -= n;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var rm = Math.min(n, sz - at), oldHeight = child.height;
          child.removeInner(at, rm);
          this.height -= oldHeight - child.height;
          if (sz == rm) { this.children.splice(i--, 1); child.parent = null; }
          if ((n -= rm) == 0) break;
          at = 0;
        } else at -= sz;
      }
      // If the result is smaller than 25 lines, ensure that it is a
      // single leaf node.
      if (this.size - n < 25 &&
          (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
        var lines = [];
        this.collapse(lines);
        this.children = [new LeafChunk(lines)];
        this.children[0].parent = this;
      }
    },
    collapse: function(lines) {
      for (var i = 0; i < this.children.length; ++i) this.children[i].collapse(lines);
    },
    insertInner: function(at, lines, height) {
      this.size += lines.length;
      this.height += height;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at <= sz) {
          child.insertInner(at, lines, height);
          if (child.lines && child.lines.length > 50) {
            while (child.lines.length > 50) {
              var spilled = child.lines.splice(child.lines.length - 25, 25);
              var newleaf = new LeafChunk(spilled);
              child.height -= newleaf.height;
              this.children.splice(i + 1, 0, newleaf);
              newleaf.parent = this;
            }
            this.maybeSpill();
          }
          break;
        }
        at -= sz;
      }
    },
    // When a node has grown, check whether it should be split.
    maybeSpill: function() {
      if (this.children.length <= 10) return;
      var me = this;
      do {
        var spilled = me.children.splice(me.children.length - 5, 5);
        var sibling = new BranchChunk(spilled);
        if (!me.parent) { // Become the parent node
          var copy = new BranchChunk(me.children);
          copy.parent = me;
          me.children = [copy, sibling];
          me = copy;
        } else {
          me.size -= sibling.size;
          me.height -= sibling.height;
          var myIndex = indexOf(me.parent.children, me);
          me.parent.children.splice(myIndex + 1, 0, sibling);
        }
        sibling.parent = me.parent;
      } while (me.children.length > 10);
      me.parent.maybeSpill();
    },
    iterN: function(at, n, op) {
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var used = Math.min(n, sz - at);
          if (child.iterN(at, used, op)) return true;
          if ((n -= used) == 0) break;
          at = 0;
        } else at -= sz;
      }
    }
  };

  var nextDocId = 0;
  var Doc = CodeMirror.Doc = function(text, mode, firstLine) {
    if (!(this instanceof Doc)) return new Doc(text, mode, firstLine);
    if (firstLine == null) firstLine = 0;

    BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
    this.first = firstLine;
    this.scrollTop = this.scrollLeft = 0;
    this.cantEdit = false;
    this.cleanGeneration = 1;
    this.frontier = firstLine;
    var start = Pos(firstLine, 0);
    this.sel = simpleSelection(start);
    this.history = new History(null);
    this.id = ++nextDocId;
    this.modeOption = mode;

    if (typeof text == "string") text = splitLines(text);
    updateDoc(this, {from: start, to: start, text: text});
    setSelection(this, simpleSelection(start), sel_dontScroll);
  };

  Doc.prototype = createObj(BranchChunk.prototype, {
    constructor: Doc,
    // Iterate over the document. Supports two forms -- with only one
    // argument, it calls that for each line in the document. With
    // three, it iterates over the range given by the first two (with
    // the second being non-inclusive).
    iter: function(from, to, op) {
      if (op) this.iterN(from - this.first, to - from, op);
      else this.iterN(this.first, this.first + this.size, from);
    },

    // Non-public interface for adding and removing lines.
    insert: function(at, lines) {
      var height = 0;
      for (var i = 0; i < lines.length; ++i) height += lines[i].height;
      this.insertInner(at - this.first, lines, height);
    },
    remove: function(at, n) { this.removeInner(at - this.first, n); },

    // From here, the methods are part of the public interface. Most
    // are also available from CodeMirror (editor) instances.

    getValue: function(lineSep) {
      var lines = getLines(this, this.first, this.first + this.size);
      if (lineSep === false) return lines;
      return lines.join(lineSep || "\n");
    },
    setValue: docMethodOp(function(code) {
      var top = Pos(this.first, 0), last = this.first + this.size - 1;
      makeChange(this, {from: top, to: Pos(last, getLine(this, last).text.length),
                        text: splitLines(code), origin: "setValue", full: true}, true);
      setSelection(this, simpleSelection(top));
    }),
    replaceRange: function(code, from, to, origin) {
      from = clipPos(this, from);
      to = to ? clipPos(this, to) : from;
      replaceRange(this, code, from, to, origin);
    },
    getRange: function(from, to, lineSep) {
      var lines = getBetween(this, clipPos(this, from), clipPos(this, to));
      if (lineSep === false) return lines;
      return lines.join(lineSep || "\n");
    },

    getLine: function(line) {var l = this.getLineHandle(line); return l && l.text;},

    getLineHandle: function(line) {if (isLine(this, line)) return getLine(this, line);},
    getLineNumber: function(line) {return lineNo(line);},

    getLineHandleVisualStart: function(line) {
      if (typeof line == "number") line = getLine(this, line);
      return visualLine(line);
    },

    lineCount: function() {return this.size;},
    firstLine: function() {return this.first;},
    lastLine: function() {return this.first + this.size - 1;},

    clipPos: function(pos) {return clipPos(this, pos);},

    getCursor: function(start) {
      var range = this.sel.primary(), pos;
      if (start == null || start == "head") pos = range.head;
      else if (start == "anchor") pos = range.anchor;
      else if (start == "end" || start == "to" || start === false) pos = range.to();
      else pos = range.from();
      return pos;
    },
    listSelections: function() { return this.sel.ranges; },
    somethingSelected: function() {return this.sel.somethingSelected();},

    setCursor: docMethodOp(function(line, ch, options) {
      setSimpleSelection(this, clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options);
    }),
    setSelection: docMethodOp(function(anchor, head, options) {
      setSimpleSelection(this, clipPos(this, anchor), clipPos(this, head || anchor), options);
    }),
    extendSelection: docMethodOp(function(head, other, options) {
      extendSelection(this, clipPos(this, head), other && clipPos(this, other), options);
    }),
    extendSelections: docMethodOp(function(heads, options) {
      extendSelections(this, clipPosArray(this, heads, options));
    }),
    extendSelectionsBy: docMethodOp(function(f, options) {
      extendSelections(this, map(this.sel.ranges, f), options);
    }),
    setSelections: docMethodOp(function(ranges, primary, options) {
      if (!ranges.length) return;
      for (var i = 0, out = []; i < ranges.length; i++)
        out[i] = new Range(clipPos(this, ranges[i].anchor),
                           clipPos(this, ranges[i].head));
      if (primary == null) primary = Math.min(ranges.length - 1, this.sel.primIndex);
      setSelection(this, normalizeSelection(out, primary), options);
    }),
    addSelection: docMethodOp(function(anchor, head, options) {
      var ranges = this.sel.ranges.slice(0);
      ranges.push(new Range(clipPos(this, anchor), clipPos(this, head || anchor)));
      setSelection(this, normalizeSelection(ranges, ranges.length - 1), options);
    }),

    getSelection: function(lineSep) {
      var ranges = this.sel.ranges, lines;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this, ranges[i].from(), ranges[i].to());
        lines = lines ? lines.concat(sel) : sel;
      }
      if (lineSep === false) return lines;
      else return lines.join(lineSep || "\n");
    },
    getSelections: function(lineSep) {
      var parts = [], ranges = this.sel.ranges;
      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this, ranges[i].from(), ranges[i].to());
        if (lineSep !== false) sel = sel.join(lineSep || "\n");
        parts[i] = sel;
      }
      return parts;
    },
    replaceSelection: function(code, collapse, origin) {
      var dup = [];
      for (var i = 0; i < this.sel.ranges.length; i++)
        dup[i] = code;
      this.replaceSelections(dup, collapse, origin || "+input");
    },
    replaceSelections: docMethodOp(function(code, collapse, origin) {
      var changes = [], sel = this.sel;
      for (var i = 0; i < sel.ranges.length; i++) {
        var range = sel.ranges[i];
        changes[i] = {from: range.from(), to: range.to(), text: splitLines(code[i]), origin: origin};
      }
      var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);
      for (var i = changes.length - 1; i >= 0; i--)
        makeChange(this, changes[i]);
      if (newSel) setSelectionReplaceHistory(this, newSel);
      else if (this.cm) ensureCursorVisible(this.cm);
    }),
    undo: docMethodOp(function() {makeChangeFromHistory(this, "undo");}),
    redo: docMethodOp(function() {makeChangeFromHistory(this, "redo");}),
    undoSelection: docMethodOp(function() {makeChangeFromHistory(this, "undo", true);}),
    redoSelection: docMethodOp(function() {makeChangeFromHistory(this, "redo", true);}),

    setExtending: function(val) {this.extend = val;},
    getExtending: function() {return this.extend;},

    historySize: function() {
      var hist = this.history, done = 0, undone = 0;
      for (var i = 0; i < hist.done.length; i++) if (!hist.done[i].ranges) ++done;
      for (var i = 0; i < hist.undone.length; i++) if (!hist.undone[i].ranges) ++undone;
      return {undo: done, redo: undone};
    },
    clearHistory: function() {this.history = new History(this.history.maxGeneration);},

    markClean: function() {
      this.cleanGeneration = this.changeGeneration(true);
    },
    changeGeneration: function(forceSplit) {
      if (forceSplit)
        this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null;
      return this.history.generation;
    },
    isClean: function (gen) {
      return this.history.generation == (gen || this.cleanGeneration);
    },

    getHistory: function() {
      return {done: copyHistoryArray(this.history.done),
              undone: copyHistoryArray(this.history.undone)};
    },
    setHistory: function(histData) {
      var hist = this.history = new History(this.history.maxGeneration);
      hist.done = copyHistoryArray(histData.done.slice(0), null, true);
      hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
    },

    addLineClass: docMethodOp(function(handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function(line) {
        var prop = where == "text" ? "textClass"
                 : where == "background" ? "bgClass"
                 : where == "gutter" ? "gutterClass" : "wrapClass";
        if (!line[prop]) line[prop] = cls;
        else if (classTest(cls).test(line[prop])) return false;
        else line[prop] += " " + cls;
        return true;
      });
    }),
    removeLineClass: docMethodOp(function(handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function(line) {
        var prop = where == "text" ? "textClass"
                 : where == "background" ? "bgClass"
                 : where == "gutter" ? "gutterClass" : "wrapClass";
        var cur = line[prop];
        if (!cur) return false;
        else if (cls == null) line[prop] = null;
        else {
          var found = cur.match(classTest(cls));
          if (!found) return false;
          var end = found.index + found[0].length;
          line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
        }
        return true;
      });
    }),

    markText: function(from, to, options) {
      return markText(this, clipPos(this, from), clipPos(this, to), options, "range");
    },
    setBookmark: function(pos, options) {
      var realOpts = {replacedWith: options && (options.nodeType == null ? options.widget : options),
                      insertLeft: options && options.insertLeft,
                      clearWhenEmpty: false, shared: options && options.shared};
      pos = clipPos(this, pos);
      return markText(this, pos, pos, realOpts, "bookmark");
    },
    findMarksAt: function(pos) {
      pos = clipPos(this, pos);
      var markers = [], spans = getLine(this, pos.line).markedSpans;
      if (spans) for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];
        if ((span.from == null || span.from <= pos.ch) &&
            (span.to == null || span.to >= pos.ch))
          markers.push(span.marker.parent || span.marker);
      }
      return markers;
    },
    findMarks: function(from, to, filter) {
      from = clipPos(this, from); to = clipPos(this, to);
      var found = [], lineNo = from.line;
      this.iter(from.line, to.line + 1, function(line) {
        var spans = line.markedSpans;
        if (spans) for (var i = 0; i < spans.length; i++) {
          var span = spans[i];
          if (!(lineNo == from.line && from.ch > span.to ||
                span.from == null && lineNo != from.line||
                lineNo == to.line && span.from > to.ch) &&
              (!filter || filter(span.marker)))
            found.push(span.marker.parent || span.marker);
        }
        ++lineNo;
      });
      return found;
    },
    getAllMarks: function() {
      var markers = [];
      this.iter(function(line) {
        var sps = line.markedSpans;
        if (sps) for (var i = 0; i < sps.length; ++i)
          if (sps[i].from != null) markers.push(sps[i].marker);
      });
      return markers;
    },

    posFromIndex: function(off) {
      var ch, lineNo = this.first;
      this.iter(function(line) {
        var sz = line.text.length + 1;
        if (sz > off) { ch = off; return true; }
        off -= sz;
        ++lineNo;
      });
      return clipPos(this, Pos(lineNo, ch));
    },
    indexFromPos: function (coords) {
      coords = clipPos(this, coords);
      var index = coords.ch;
      if (coords.line < this.first || coords.ch < 0) return 0;
      this.iter(this.first, coords.line, function (line) {
        index += line.text.length + 1;
      });
      return index;
    },

    copy: function(copyHistory) {
      var doc = new Doc(getLines(this, this.first, this.first + this.size), this.modeOption, this.first);
      doc.scrollTop = this.scrollTop; doc.scrollLeft = this.scrollLeft;
      doc.sel = this.sel;
      doc.extend = false;
      if (copyHistory) {
        doc.history.undoDepth = this.history.undoDepth;
        doc.setHistory(this.getHistory());
      }
      return doc;
    },

    linkedDoc: function(options) {
      if (!options) options = {};
      var from = this.first, to = this.first + this.size;
      if (options.from != null && options.from > from) from = options.from;
      if (options.to != null && options.to < to) to = options.to;
      var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from);
      if (options.sharedHist) copy.history = this.history;
      (this.linked || (this.linked = [])).push({doc: copy, sharedHist: options.sharedHist});
      copy.linked = [{doc: this, isParent: true, sharedHist: options.sharedHist}];
      copySharedMarkers(copy, findSharedMarkers(this));
      return copy;
    },
    unlinkDoc: function(other) {
      if (other instanceof CodeMirror) other = other.doc;
      if (this.linked) for (var i = 0; i < this.linked.length; ++i) {
        var link = this.linked[i];
        if (link.doc != other) continue;
        this.linked.splice(i, 1);
        other.unlinkDoc(this);
        detachSharedMarkers(findSharedMarkers(this));
        break;
      }
      // If the histories were shared, split them again
      if (other.history == this.history) {
        var splitIds = [other.id];
        linkedDocs(other, function(doc) {splitIds.push(doc.id);}, true);
        other.history = new History(null);
        other.history.done = copyHistoryArray(this.history.done, splitIds);
        other.history.undone = copyHistoryArray(this.history.undone, splitIds);
      }
    },
    iterLinkedDocs: function(f) {linkedDocs(this, f);},

    getMode: function() {return this.mode;},
    getEditor: function() {return this.cm;}
  });

  // Public alias.
  Doc.prototype.eachLine = Doc.prototype.iter;

  // Set up methods on CodeMirror's prototype to redirect to the editor's document.
  var dontDelegate = "iter insert remove copy getEditor".split(" ");
  for (var prop in Doc.prototype) if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0)
    CodeMirror.prototype[prop] = (function(method) {
      return function() {return method.apply(this.doc, arguments);};
    })(Doc.prototype[prop]);

  eventMixin(Doc);

  // Call f for all linked documents.
  function linkedDocs(doc, f, sharedHistOnly) {
    function propagate(doc, skip, sharedHist) {
      if (doc.linked) for (var i = 0; i < doc.linked.length; ++i) {
        var rel = doc.linked[i];
        if (rel.doc == skip) continue;
        var shared = sharedHist && rel.sharedHist;
        if (sharedHistOnly && !shared) continue;
        f(rel.doc, shared);
        propagate(rel.doc, doc, shared);
      }
    }
    propagate(doc, null, true);
  }

  // Attach a document to an editor.
  function attachDoc(cm, doc) {
    if (doc.cm) throw new Error("This document is already in use.");
    cm.doc = doc;
    doc.cm = cm;
    estimateLineHeights(cm);
    loadMode(cm);
    if (!cm.options.lineWrapping) findMaxLine(cm);
    cm.options.mode = doc.modeOption;
    regChange(cm);
  }

  // LINE UTILITIES

  // Find the line object corresponding to the given line number.
  function getLine(doc, n) {
    n -= doc.first;
    if (n < 0 || n >= doc.size) throw new Error("There is no line " + (n + doc.first) + " in the document.");
    for (var chunk = doc; !chunk.lines;) {
      for (var i = 0;; ++i) {
        var child = chunk.children[i], sz = child.chunkSize();
        if (n < sz) { chunk = child; break; }
        n -= sz;
      }
    }
    return chunk.lines[n];
  }

  // Get the part of a document between two positions, as an array of
  // strings.
  function getBetween(doc, start, end) {
    var out = [], n = start.line;
    doc.iter(start.line, end.line + 1, function(line) {
      var text = line.text;
      if (n == end.line) text = text.slice(0, end.ch);
      if (n == start.line) text = text.slice(start.ch);
      out.push(text);
      ++n;
    });
    return out;
  }
  // Get the lines between from and to, as array of strings.
  function getLines(doc, from, to) {
    var out = [];
    doc.iter(from, to, function(line) { out.push(line.text); });
    return out;
  }

  // Update the height of a line, propagating the height change
  // upwards to parent nodes.
  function updateLineHeight(line, height) {
    var diff = height - line.height;
    if (diff) for (var n = line; n; n = n.parent) n.height += diff;
  }

  // Given a line object, find its line number by walking up through
  // its parent links.
  function lineNo(line) {
    if (line.parent == null) return null;
    var cur = line.parent, no = indexOf(cur.lines, line);
    for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
      for (var i = 0;; ++i) {
        if (chunk.children[i] == cur) break;
        no += chunk.children[i].chunkSize();
      }
    }
    return no + cur.first;
  }

  // Find the line at the given vertical position, using the height
  // information in the document tree.
  function lineAtHeight(chunk, h) {
    var n = chunk.first;
    outer: do {
      for (var i = 0; i < chunk.children.length; ++i) {
        var child = chunk.children[i], ch = child.height;
        if (h < ch) { chunk = child; continue outer; }
        h -= ch;
        n += child.chunkSize();
      }
      return n;
    } while (!chunk.lines);
    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i], lh = line.height;
      if (h < lh) break;
      h -= lh;
    }
    return n + i;
  }


  // Find the height above the given line.
  function heightAtLine(lineObj) {
    lineObj = visualLine(lineObj);

    var h = 0, chunk = lineObj.parent;
    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i];
      if (line == lineObj) break;
      else h += line.height;
    }
    for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
      for (var i = 0; i < p.children.length; ++i) {
        var cur = p.children[i];
        if (cur == chunk) break;
        else h += cur.height;
      }
    }
    return h;
  }

  // Get the bidi ordering for the given line (and cache it). Returns
  // false for lines that are fully left-to-right, and an array of
  // BidiSpan objects otherwise.
  function getOrder(line) {
    var order = line.order;
    if (order == null) order = line.order = bidiOrdering(line.text);
    return order;
  }

  // HISTORY

  function History(startGen) {
    // Arrays of change events and selections. Doing something adds an
    // event to done and clears undo. Undoing moves events from done
    // to undone, redoing moves them in the other direction.
    this.done = []; this.undone = [];
    this.undoDepth = Infinity;
    // Used to track when changes can be merged into a single undo
    // event
    this.lastModTime = this.lastSelTime = 0;
    this.lastOp = this.lastSelOp = null;
    this.lastOrigin = this.lastSelOrigin = null;
    // Used by the isClean() method
    this.generation = this.maxGeneration = startGen || 1;
  }

  // Create a history change event from an updateDoc-style change
  // object.
  function historyChangeFromChange(doc, change) {
    var histChange = {from: copyPos(change.from), to: changeEnd(change), text: getBetween(doc, change.from, change.to)};
    attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    linkedDocs(doc, function(doc) {attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);}, true);
    return histChange;
  }

  // Pop all selection events off the end of a history array. Stop at
  // a change event.
  function clearSelectionEvents(array) {
    while (array.length) {
      var last = lst(array);
      if (last.ranges) array.pop();
      else break;
    }
  }

  // Find the top change event in the history. Pop off selection
  // events that are in the way.
  function lastChangeEvent(hist, force) {
    if (force) {
      clearSelectionEvents(hist.done);
      return lst(hist.done);
    } else if (hist.done.length && !lst(hist.done).ranges) {
      return lst(hist.done);
    } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
      hist.done.pop();
      return lst(hist.done);
    }
  }

  // Register a change in the history. Merges changes that are within
  // a single operation, ore are close together with an origin that
  // allows merging (starting with "+") into a single event.
  function addChangeToHistory(doc, change, selAfter, opId) {
    var hist = doc.history;
    hist.undone.length = 0;
    var time = +new Date, cur;

    if ((hist.lastOp == opId ||
         hist.lastOrigin == change.origin && change.origin &&
         ((change.origin.charAt(0) == "+" && doc.cm && hist.lastModTime > time - doc.cm.options.historyEventDelay) ||
          change.origin.charAt(0) == "*")) &&
        (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
      // Merge this change into the last event
      var last = lst(cur.changes);
      if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
        // Optimized case for simple insertion -- don't want to add
        // new changesets for every character typed
        last.to = changeEnd(change);
      } else {
        // Add new sub-event
        cur.changes.push(historyChangeFromChange(doc, change));
      }
    } else {
      // Can not be merged, start a new event.
      var before = lst(hist.done);
      if (!before || !before.ranges)
        pushSelectionToHistory(doc.sel, hist.done);
      cur = {changes: [historyChangeFromChange(doc, change)],
             generation: hist.generation};
      hist.done.push(cur);
      while (hist.done.length > hist.undoDepth) {
        hist.done.shift();
        if (!hist.done[0].ranges) hist.done.shift();
      }
    }
    hist.done.push(selAfter);
    hist.generation = ++hist.maxGeneration;
    hist.lastModTime = hist.lastSelTime = time;
    hist.lastOp = hist.lastSelOp = opId;
    hist.lastOrigin = hist.lastSelOrigin = change.origin;

    if (!last) signal(doc, "historyAdded");
  }

  function selectionEventCanBeMerged(doc, origin, prev, sel) {
    var ch = origin.charAt(0);
    return ch == "*" ||
      ch == "+" &&
      prev.ranges.length == sel.ranges.length &&
      prev.somethingSelected() == sel.somethingSelected() &&
      new Date - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500);
  }

  // Called whenever the selection changes, sets the new selection as
  // the pending selection in the history, and pushes the old pending
  // selection into the 'done' array when it was significantly
  // different (in number of selected ranges, emptiness, or time).
  function addSelectionToHistory(doc, sel, opId, options) {
    var hist = doc.history, origin = options && options.origin;

    // A new event is started when the previous origin does not match
    // the current, or the origins don't allow matching. Origins
    // starting with * are always merged, those starting with + are
    // merged when similar and close together in time.
    if (opId == hist.lastSelOp ||
        (origin && hist.lastSelOrigin == origin &&
         (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin ||
          selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))))
      hist.done[hist.done.length - 1] = sel;
    else
      pushSelectionToHistory(sel, hist.done);

    hist.lastSelTime = +new Date;
    hist.lastSelOrigin = origin;
    hist.lastSelOp = opId;
    if (options && options.clearRedo !== false)
      clearSelectionEvents(hist.undone);
  }

  function pushSelectionToHistory(sel, dest) {
    var top = lst(dest);
    if (!(top && top.ranges && top.equals(sel)))
      dest.push(sel);
  }

  // Used to store marked span information in the history.
  function attachLocalSpans(doc, change, from, to) {
    var existing = change["spans_" + doc.id], n = 0;
    doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function(line) {
      if (line.markedSpans)
        (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans;
      ++n;
    });
  }

  // When un/re-doing restores text containing marked spans, those
  // that have been explicitly cleared should not be restored.
  function removeClearedSpans(spans) {
    if (!spans) return null;
    for (var i = 0, out; i < spans.length; ++i) {
      if (spans[i].marker.explicitlyCleared) { if (!out) out = spans.slice(0, i); }
      else if (out) out.push(spans[i]);
    }
    return !out ? spans : out.length ? out : null;
  }

  // Retrieve and filter the old marked spans stored in a change event.
  function getOldSpans(doc, change) {
    var found = change["spans_" + doc.id];
    if (!found) return null;
    for (var i = 0, nw = []; i < change.text.length; ++i)
      nw.push(removeClearedSpans(found[i]));
    return nw;
  }

  // Used both to provide a JSON-safe object in .getHistory, and, when
  // detaching a document, to split the history in two
  function copyHistoryArray(events, newGroup, instantiateSel) {
    for (var i = 0, copy = []; i < events.length; ++i) {
      var event = events[i];
      if (event.ranges) {
        copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
        continue;
      }
      var changes = event.changes, newChanges = [];
      copy.push({changes: newChanges});
      for (var j = 0; j < changes.length; ++j) {
        var change = changes[j], m;
        newChanges.push({from: change.from, to: change.to, text: change.text});
        if (newGroup) for (var prop in change) if (m = prop.match(/^spans_(\d+)$/)) {
          if (indexOf(newGroup, Number(m[1])) > -1) {
            lst(newChanges)[prop] = change[prop];
            delete change[prop];
          }
        }
      }
    }
    return copy;
  }

  // Rebasing/resetting history to deal with externally-sourced changes

  function rebaseHistSelSingle(pos, from, to, diff) {
    if (to < pos.line) {
      pos.line += diff;
    } else if (from < pos.line) {
      pos.line = from;
      pos.ch = 0;
    }
  }

  // Tries to rebase an array of history events given a change in the
  // document. If the change touches the same lines as the event, the
  // event, and everything 'behind' it, is discarded. If the change is
  // before the event, the event's positions are updated. Uses a
  // copy-on-write scheme for the positions, to avoid having to
  // reallocate them all on every rebase, but also avoid problems with
  // shared position objects being unsafely updated.
  function rebaseHistArray(array, from, to, diff) {
    for (var i = 0; i < array.length; ++i) {
      var sub = array[i], ok = true;
      if (sub.ranges) {
        if (!sub.copied) { sub = array[i] = sub.deepCopy(); sub.copied = true; }
        for (var j = 0; j < sub.ranges.length; j++) {
          rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
          rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
        }
        continue;
      }
      for (var j = 0; j < sub.changes.length; ++j) {
        var cur = sub.changes[j];
        if (to < cur.from.line) {
          cur.from = Pos(cur.from.line + diff, cur.from.ch);
          cur.to = Pos(cur.to.line + diff, cur.to.ch);
        } else if (from <= cur.to.line) {
          ok = false;
          break;
        }
      }
      if (!ok) {
        array.splice(0, i + 1);
        i = 0;
      }
    }
  }

  function rebaseHist(hist, change) {
    var from = change.from.line, to = change.to.line, diff = change.text.length - (to - from) - 1;
    rebaseHistArray(hist.done, from, to, diff);
    rebaseHistArray(hist.undone, from, to, diff);
  }

  // EVENT UTILITIES

  // Due to the fact that we still support jurassic IE versions, some
  // compatibility wrappers are needed.

  var e_preventDefault = CodeMirror.e_preventDefault = function(e) {
    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
  };
  var e_stopPropagation = CodeMirror.e_stopPropagation = function(e) {
    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;
  };
  function e_defaultPrevented(e) {
    return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false;
  }
  var e_stop = CodeMirror.e_stop = function(e) {e_preventDefault(e); e_stopPropagation(e);};

  function e_target(e) {return e.target || e.srcElement;}
  function e_button(e) {
    var b = e.which;
    if (b == null) {
      if (e.button & 1) b = 1;
      else if (e.button & 2) b = 3;
      else if (e.button & 4) b = 2;
    }
    if (mac && e.ctrlKey && b == 1) b = 3;
    return b;
  }

  // EVENT HANDLING

  // Lightweight event framework. on/off also work on DOM nodes,
  // registering native DOM handlers.

  var on = CodeMirror.on = function(emitter, type, f) {
    if (emitter.addEventListener)
      emitter.addEventListener(type, f, false);
    else if (emitter.attachEvent)
      emitter.attachEvent("on" + type, f);
    else {
      var map = emitter._handlers || (emitter._handlers = {});
      var arr = map[type] || (map[type] = []);
      arr.push(f);
    }
  };

  var off = CodeMirror.off = function(emitter, type, f) {
    if (emitter.removeEventListener)
      emitter.removeEventListener(type, f, false);
    else if (emitter.detachEvent)
      emitter.detachEvent("on" + type, f);
    else {
      var arr = emitter._handlers && emitter._handlers[type];
      if (!arr) return;
      for (var i = 0; i < arr.length; ++i)
        if (arr[i] == f) { arr.splice(i, 1); break; }
    }
  };

  var signal = CodeMirror.signal = function(emitter, type /*, values...*/) {
    var arr = emitter._handlers && emitter._handlers[type];
    if (!arr) return;
    var args = Array.prototype.slice.call(arguments, 2);
    for (var i = 0; i < arr.length; ++i) arr[i].apply(null, args);
  };

  var orphanDelayedCallbacks = null;

  // Often, we want to signal events at a point where we are in the
  // middle of some work, but don't want the handler to start calling
  // other methods on the editor, which might be in an inconsistent
  // state or simply not expect any other events to happen.
  // signalLater looks whether there are any handlers, and schedules
  // them to be executed when the last operation ends, or, if no
  // operation is active, when a timeout fires.
  function signalLater(emitter, type /*, values...*/) {
    var arr = emitter._handlers && emitter._handlers[type];
    if (!arr) return;
    var args = Array.prototype.slice.call(arguments, 2), list;
    if (operationGroup) {
      list = operationGroup.delayedCallbacks;
    } else if (orphanDelayedCallbacks) {
      list = orphanDelayedCallbacks;
    } else {
      list = orphanDelayedCallbacks = [];
      setTimeout(fireOrphanDelayed, 0);
    }
    function bnd(f) {return function(){f.apply(null, args);};};
    for (var i = 0; i < arr.length; ++i)
      list.push(bnd(arr[i]));
  }

  function fireOrphanDelayed() {
    var delayed = orphanDelayedCallbacks;
    orphanDelayedCallbacks = null;
    for (var i = 0; i < delayed.length; ++i) delayed[i]();
  }

  // The DOM events that CodeMirror handles can be overridden by
  // registering a (non-DOM) handler on the editor for the event name,
  // and preventDefault-ing the event in that handler.
  function signalDOMEvent(cm, e, override) {
    if (typeof e == "string")
      e = {type: e, preventDefault: function() { this.defaultPrevented = true; }};
    signal(cm, override || e.type, cm, e);
    return e_defaultPrevented(e) || e.codemirrorIgnore;
  }

  function signalCursorActivity(cm) {
    var arr = cm._handlers && cm._handlers.cursorActivity;
    if (!arr) return;
    var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);
    for (var i = 0; i < arr.length; ++i) if (indexOf(set, arr[i]) == -1)
      set.push(arr[i]);
  }

  function hasHandler(emitter, type) {
    var arr = emitter._handlers && emitter._handlers[type];
    return arr && arr.length > 0;
  }

  // Add on and off methods to a constructor's prototype, to make
  // registering events on such objects more convenient.
  function eventMixin(ctor) {
    ctor.prototype.on = function(type, f) {on(this, type, f);};
    ctor.prototype.off = function(type, f) {off(this, type, f);};
  }

  // MISC UTILITIES

  // Number of pixels added to scroller and sizer to hide scrollbar
  var scrollerGap = 30;

  // Returned or thrown by various protocols to signal 'I'm not
  // handling this'.
  var Pass = CodeMirror.Pass = {toString: function(){return "CodeMirror.Pass";}};

  // Reused option objects for setSelection & friends
  var sel_dontScroll = {scroll: false}, sel_mouse = {origin: "*mouse"}, sel_move = {origin: "+move"};

  function Delayed() {this.id = null;}
  Delayed.prototype.set = function(ms, f) {
    clearTimeout(this.id);
    this.id = setTimeout(f, ms);
  };

  // Counts the column offset in a string, taking tabs into account.
  // Used mostly to find indentation.
  var countColumn = CodeMirror.countColumn = function(string, end, tabSize, startIndex, startValue) {
    if (end == null) {
      end = string.search(/[^\s\u00a0]/);
      if (end == -1) end = string.length;
    }
    for (var i = startIndex || 0, n = startValue || 0;;) {
      var nextTab = string.indexOf("\t", i);
      if (nextTab < 0 || nextTab >= end)
        return n + (end - i);
      n += nextTab - i;
      n += tabSize - (n % tabSize);
      i = nextTab + 1;
    }
  };

  // The inverse of countColumn -- find the offset that corresponds to
  // a particular column.
  function findColumn(string, goal, tabSize) {
    for (var pos = 0, col = 0;;) {
      var nextTab = string.indexOf("\t", pos);
      if (nextTab == -1) nextTab = string.length;
      var skipped = nextTab - pos;
      if (nextTab == string.length || col + skipped >= goal)
        return pos + Math.min(skipped, goal - col);
      col += nextTab - pos;
      col += tabSize - (col % tabSize);
      pos = nextTab + 1;
      if (col >= goal) return pos;
    }
  }

  var spaceStrs = [""];
  function spaceStr(n) {
    while (spaceStrs.length <= n)
      spaceStrs.push(lst(spaceStrs) + " ");
    return spaceStrs[n];
  }

  function lst(arr) { return arr[arr.length-1]; }

  var selectInput = function(node) { node.select(); };
  if (ios) // Mobile Safari apparently has a bug where select() is broken.
    selectInput = function(node) { node.selectionStart = 0; node.selectionEnd = node.value.length; };
  else if (ie) // Suppress mysterious IE10 errors
    selectInput = function(node) { try { node.select(); } catch(_e) {} };

  function indexOf(array, elt) {
    for (var i = 0; i < array.length; ++i)
      if (array[i] == elt) return i;
    return -1;
  }
  function map(array, f) {
    var out = [];
    for (var i = 0; i < array.length; i++) out[i] = f(array[i], i);
    return out;
  }

  function createObj(base, props) {
    var inst;
    if (Object.create) {
      inst = Object.create(base);
    } else {
      var ctor = function() {};
      ctor.prototype = base;
      inst = new ctor();
    }
    if (props) copyObj(props, inst);
    return inst;
  };

  function copyObj(obj, target, overwrite) {
    if (!target) target = {};
    for (var prop in obj)
      if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop)))
        target[prop] = obj[prop];
    return target;
  }

  function bind(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(){return f.apply(null, args);};
  }

  var nonASCIISingleCaseWordChar = /[\u00df\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
  var isWordCharBasic = CodeMirror.isWordChar = function(ch) {
    return /\w/.test(ch) || ch > "\x80" &&
      (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch));
  };
  function isWordChar(ch, helper) {
    if (!helper) return isWordCharBasic(ch);
    if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) return true;
    return helper.test(ch);
  }

  function isEmpty(obj) {
    for (var n in obj) if (obj.hasOwnProperty(n) && obj[n]) return false;
    return true;
  }

  // Extending unicode characters. A series of a non-extending char +
  // any number of extending chars is treated as a single unit as far
  // as editing and measuring is concerned. This is not fully correct,
  // since some scripts/fonts/browsers also treat other configurations
  // of code points as a group.
  var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;
  function isExtendingChar(ch) { return ch.charCodeAt(0) >= 768 && extendingChars.test(ch); }

  // DOM UTILITIES

  function elt(tag, content, className, style) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (style) e.style.cssText = style;
    if (typeof content == "string") e.appendChild(document.createTextNode(content));
    else if (content) for (var i = 0; i < content.length; ++i) e.appendChild(content[i]);
    return e;
  }

  var range;
  if (document.createRange) range = function(node, start, end) {
    var r = document.createRange();
    r.setEnd(node, end);
    r.setStart(node, start);
    return r;
  };
  else range = function(node, start, end) {
    var r = document.body.createTextRange();
    try { r.moveToElementText(node.parentNode); }
    catch(e) { return r; }
    r.collapse(true);
    r.moveEnd("character", end);
    r.moveStart("character", start);
    return r;
  };

  function removeChildren(e) {
    for (var count = e.childNodes.length; count > 0; --count)
      e.removeChild(e.firstChild);
    return e;
  }

  function removeChildrenAndAdd(parent, e) {
    return removeChildren(parent).appendChild(e);
  }

  function contains(parent, child) {
    if (parent.contains)
      return parent.contains(child);
    while (child = child.parentNode)
      if (child == parent) return true;
  }

  function activeElt() { return document.activeElement; }
  // Older versions of IE throws unspecified error when touching
  // document.activeElement in some cases (during loading, in iframe)
  if (ie && ie_version < 11) activeElt = function() {
    try { return document.activeElement; }
    catch(e) { return document.body; }
  };

  function classTest(cls) { return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*"); }
  var rmClass = CodeMirror.rmClass = function(node, cls) {
    var current = node.className;
    var match = classTest(cls).exec(current);
    if (match) {
      var after = current.slice(match.index + match[0].length);
      node.className = current.slice(0, match.index) + (after ? match[1] + after : "");
    }
  };
  var addClass = CodeMirror.addClass = function(node, cls) {
    var current = node.className;
    if (!classTest(cls).test(current)) node.className += (current ? " " : "") + cls;
  };
  function joinClasses(a, b) {
    var as = a.split(" ");
    for (var i = 0; i < as.length; i++)
      if (as[i] && !classTest(as[i]).test(b)) b += " " + as[i];
    return b;
  }

  // WINDOW-WIDE EVENTS

  // These must be handled carefully, because naively registering a
  // handler for each editor will cause the editors to never be
  // garbage collected.

  function forEachCodeMirror(f) {
    if (!document.body.getElementsByClassName) return;
    var byClass = document.body.getElementsByClassName("CodeMirror");
    for (var i = 0; i < byClass.length; i++) {
      var cm = byClass[i].CodeMirror;
      if (cm) f(cm);
    }
  }

  var globalsRegistered = false;
  function ensureGlobalHandlers() {
    if (globalsRegistered) return;
    registerGlobalHandlers();
    globalsRegistered = true;
  }
  function registerGlobalHandlers() {
    // When the window resizes, we need to refresh active editors.
    var resizeTimer;
    on(window, "resize", function() {
      if (resizeTimer == null) resizeTimer = setTimeout(function() {
        resizeTimer = null;
        forEachCodeMirror(onResize);
      }, 100);
    });
    // When the window loses focus, we want to show the editor as blurred
    on(window, "blur", function() {
      forEachCodeMirror(onBlur);
    });
  }

  // FEATURE DETECTION

  // Detect drag-and-drop
  var dragAndDrop = function() {
    // There is *some* kind of drag-and-drop support in IE6-8, but I
    // couldn't get it to work yet.
    if (ie && ie_version < 9) return false;
    var div = elt('div');
    return "draggable" in div || "dragDrop" in div;
  }();

  var zwspSupported;
  function zeroWidthElement(measure) {
    if (zwspSupported == null) {
      var test = elt("span", "\u200b");
      removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));
      if (measure.firstChild.offsetHeight != 0)
        zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8);
    }
    if (zwspSupported) return elt("span", "\u200b");
    else return elt("span", "\u00a0", null, "display: inline-block; width: 1px; margin-right: -1px");
  }

  // Feature-detect IE's crummy client rect reporting for bidi text
  var badBidiRects;
  function hasBadBidiRects(measure) {
    if (badBidiRects != null) return badBidiRects;
    var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062eA"));
    var r0 = range(txt, 0, 1).getBoundingClientRect();
    if (!r0 || r0.left == r0.right) return false; // Safari returns null in some cases (#2780)
    var r1 = range(txt, 1, 2).getBoundingClientRect();
    return badBidiRects = (r1.right - r0.right < 3);
  }

  // See if "".split is the broken IE version, if so, provide an
  // alternative way to split lines.
  var splitLines = CodeMirror.splitLines = "\n\nb".split(/\n/).length != 3 ? function(string) {
    var pos = 0, result = [], l = string.length;
    while (pos <= l) {
      var nl = string.indexOf("\n", pos);
      if (nl == -1) nl = string.length;
      var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
      var rt = line.indexOf("\r");
      if (rt != -1) {
        result.push(line.slice(0, rt));
        pos += rt + 1;
      } else {
        result.push(line);
        pos = nl + 1;
      }
    }
    return result;
  } : function(string){return string.split(/\r\n?|\n/);};

  var hasSelection = window.getSelection ? function(te) {
    try { return te.selectionStart != te.selectionEnd; }
    catch(e) { return false; }
  } : function(te) {
    try {var range = te.ownerDocument.selection.createRange();}
    catch(e) {}
    if (!range || range.parentElement() != te) return false;
    return range.compareEndPoints("StartToEnd", range) != 0;
  };

  var hasCopyEvent = (function() {
    var e = elt("div");
    if ("oncopy" in e) return true;
    e.setAttribute("oncopy", "return;");
    return typeof e.oncopy == "function";
  })();

  var badZoomedRects = null;
  function hasBadZoomedRects(measure) {
    if (badZoomedRects != null) return badZoomedRects;
    var node = removeChildrenAndAdd(measure, elt("span", "x"));
    var normal = node.getBoundingClientRect();
    var fromRange = range(node, 0, 1).getBoundingClientRect();
    return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1;
  }

  // KEY NAMES

  var keyNames = {3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
                  19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
                  36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
                  46: "Delete", 59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod", 107: "=", 109: "-", 127: "Delete",
                  173: "-", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
                  221: "]", 222: "'", 63232: "Up", 63233: "Down", 63234: "Left", 63235: "Right", 63272: "Delete",
                  63273: "Home", 63275: "End", 63276: "PageUp", 63277: "PageDown", 63302: "Insert"};
  CodeMirror.keyNames = keyNames;
  (function() {
    // Number keys
    for (var i = 0; i < 10; i++) keyNames[i + 48] = keyNames[i + 96] = String(i);
    // Alphabetic keys
    for (var i = 65; i <= 90; i++) keyNames[i] = String.fromCharCode(i);
    // Function keys
    for (var i = 1; i <= 12; i++) keyNames[i + 111] = keyNames[i + 63235] = "F" + i;
  })();

  // BIDI HELPERS

  function iterateBidiSections(order, from, to, f) {
    if (!order) return f(from, to, "ltr");
    var found = false;
    for (var i = 0; i < order.length; ++i) {
      var part = order[i];
      if (part.from < to && part.to > from || from == to && part.to == from) {
        f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr");
        found = true;
      }
    }
    if (!found) f(from, to, "ltr");
  }

  function bidiLeft(part) { return part.level % 2 ? part.to : part.from; }
  function bidiRight(part) { return part.level % 2 ? part.from : part.to; }

  function lineLeft(line) { var order = getOrder(line); return order ? bidiLeft(order[0]) : 0; }
  function lineRight(line) {
    var order = getOrder(line);
    if (!order) return line.text.length;
    return bidiRight(lst(order));
  }

  function lineStart(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLine(line);
    if (visual != line) lineN = lineNo(visual);
    var order = getOrder(visual);
    var ch = !order ? 0 : order[0].level % 2 ? lineRight(visual) : lineLeft(visual);
    return Pos(lineN, ch);
  }
  function lineEnd(cm, lineN) {
    var merged, line = getLine(cm.doc, lineN);
    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      lineN = null;
    }
    var order = getOrder(line);
    var ch = !order ? line.text.length : order[0].level % 2 ? lineLeft(line) : lineRight(line);
    return Pos(lineN == null ? lineNo(line) : lineN, ch);
  }
  function lineStartSmart(cm, pos) {
    var start = lineStart(cm, pos.line);
    var line = getLine(cm.doc, start.line);
    var order = getOrder(line);
    if (!order || order[0].level == 0) {
      var firstNonWS = Math.max(0, line.text.search(/\S/));
      var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
      return Pos(start.line, inWS ? 0 : firstNonWS);
    }
    return start;
  }

  function compareBidiLevel(order, a, b) {
    var linedir = order[0].level;
    if (a == linedir) return true;
    if (b == linedir) return false;
    return a < b;
  }
  var bidiOther;
  function getBidiPartAt(order, pos) {
    bidiOther = null;
    for (var i = 0, found; i < order.length; ++i) {
      var cur = order[i];
      if (cur.from < pos && cur.to > pos) return i;
      if ((cur.from == pos || cur.to == pos)) {
        if (found == null) {
          found = i;
        } else if (compareBidiLevel(order, cur.level, order[found].level)) {
          if (cur.from != cur.to) bidiOther = found;
          return i;
        } else {
          if (cur.from != cur.to) bidiOther = i;
          return found;
        }
      }
    }
    return found;
  }

  function moveInLine(line, pos, dir, byUnit) {
    if (!byUnit) return pos + dir;
    do pos += dir;
    while (pos > 0 && isExtendingChar(line.text.charAt(pos)));
    return pos;
  }

  // This is needed in order to move 'visually' through bi-directional
  // text -- i.e., pressing left should make the cursor go left, even
  // when in RTL text. The tricky part is the 'jumps', where RTL and
  // LTR text touch each other. This often requires the cursor offset
  // to move more than one unit, in order to visually move one unit.
  function moveVisually(line, start, dir, byUnit) {
    var bidi = getOrder(line);
    if (!bidi) return moveLogically(line, start, dir, byUnit);
    var pos = getBidiPartAt(bidi, start), part = bidi[pos];
    var target = moveInLine(line, start, part.level % 2 ? -dir : dir, byUnit);

    for (;;) {
      if (target > part.from && target < part.to) return target;
      if (target == part.from || target == part.to) {
        if (getBidiPartAt(bidi, target) == pos) return target;
        part = bidi[pos += dir];
        return (dir > 0) == part.level % 2 ? part.to : part.from;
      } else {
        part = bidi[pos += dir];
        if (!part) return null;
        if ((dir > 0) == part.level % 2)
          target = moveInLine(line, part.to, -1, byUnit);
        else
          target = moveInLine(line, part.from, 1, byUnit);
      }
    }
  }

  function moveLogically(line, start, dir, byUnit) {
    var target = start + dir;
    if (byUnit) while (target > 0 && isExtendingChar(line.text.charAt(target))) target += dir;
    return target < 0 || target > line.text.length ? null : target;
  }

  // Bidirectional ordering algorithm
  // See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
  // that this (partially) implements.

  // One-char codes used for character types:
  // L (L):   Left-to-Right
  // R (R):   Right-to-Left
  // r (AL):  Right-to-Left Arabic
  // 1 (EN):  European Number
  // + (ES):  European Number Separator
  // % (ET):  European Number Terminator
  // n (AN):  Arabic Number
  // , (CS):  Common Number Separator
  // m (NSM): Non-Spacing Mark
  // b (BN):  Boundary Neutral
  // s (B):   Paragraph Separator
  // t (S):   Segment Separator
  // w (WS):  Whitespace
  // N (ON):  Other Neutrals

  // Returns null if characters are ordered as they appear
  // (left-to-right), or an array of sections ({from, to, level}
  // objects) in the order in which they occur visually.
  var bidiOrdering = (function() {
    // Character types for codepoints 0 to 0xff
    var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN";
    // Character types for codepoints 0x600 to 0x6ff
    var arabicTypes = "rrrrrrrrrrrr,rNNmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmrrrrrrrnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmNmmmm";
    function charType(code) {
      if (code <= 0xf7) return lowTypes.charAt(code);
      else if (0x590 <= code && code <= 0x5f4) return "R";
      else if (0x600 <= code && code <= 0x6ed) return arabicTypes.charAt(code - 0x600);
      else if (0x6ee <= code && code <= 0x8ac) return "r";
      else if (0x2000 <= code && code <= 0x200b) return "w";
      else if (code == 0x200c) return "b";
      else return "L";
    }

    var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
    var isNeutral = /[stwN]/, isStrong = /[LRr]/, countsAsLeft = /[Lb1n]/, countsAsNum = /[1n]/;
    // Browsers seem to always treat the boundaries of block elements as being L.
    var outerType = "L";

    function BidiSpan(level, from, to) {
      this.level = level;
      this.from = from; this.to = to;
    }

    return function(str) {
      if (!bidiRE.test(str)) return false;
      var len = str.length, types = [];
      for (var i = 0, type; i < len; ++i)
        types.push(type = charType(str.charCodeAt(i)));

      // W1. Examine each non-spacing mark (NSM) in the level run, and
      // change the type of the NSM to the type of the previous
      // character. If the NSM is at the start of the level run, it will
      // get the type of sor.
      for (var i = 0, prev = outerType; i < len; ++i) {
        var type = types[i];
        if (type == "m") types[i] = prev;
        else prev = type;
      }

      // W2. Search backwards from each instance of a European number
      // until the first strong type (R, L, AL, or sor) is found. If an
      // AL is found, change the type of the European number to Arabic
      // number.
      // W3. Change all ALs to R.
      for (var i = 0, cur = outerType; i < len; ++i) {
        var type = types[i];
        if (type == "1" && cur == "r") types[i] = "n";
        else if (isStrong.test(type)) { cur = type; if (type == "r") types[i] = "R"; }
      }

      // W4. A single European separator between two European numbers
      // changes to a European number. A single common separator between
      // two numbers of the same type changes to that type.
      for (var i = 1, prev = types[0]; i < len - 1; ++i) {
        var type = types[i];
        if (type == "+" && prev == "1" && types[i+1] == "1") types[i] = "1";
        else if (type == "," && prev == types[i+1] &&
                 (prev == "1" || prev == "n")) types[i] = prev;
        prev = type;
      }

      // W5. A sequence of European terminators adjacent to European
      // numbers changes to all European numbers.
      // W6. Otherwise, separators and terminators change to Other
      // Neutral.
      for (var i = 0; i < len; ++i) {
        var type = types[i];
        if (type == ",") types[i] = "N";
        else if (type == "%") {
          for (var end = i + 1; end < len && types[end] == "%"; ++end) {}
          var replace = (i && types[i-1] == "!") || (end < len && types[end] == "1") ? "1" : "N";
          for (var j = i; j < end; ++j) types[j] = replace;
          i = end - 1;
        }
      }

      // W7. Search backwards from each instance of a European number
      // until the first strong type (R, L, or sor) is found. If an L is
      // found, then change the type of the European number to L.
      for (var i = 0, cur = outerType; i < len; ++i) {
        var type = types[i];
        if (cur == "L" && type == "1") types[i] = "L";
        else if (isStrong.test(type)) cur = type;
      }

      // N1. A sequence of neutrals takes the direction of the
      // surrounding strong text if the text on both sides has the same
      // direction. European and Arabic numbers act as if they were R in
      // terms of their influence on neutrals. Start-of-level-run (sor)
      // and end-of-level-run (eor) are used at level run boundaries.
      // N2. Any remaining neutrals take the embedding direction.
      for (var i = 0; i < len; ++i) {
        if (isNeutral.test(types[i])) {
          for (var end = i + 1; end < len && isNeutral.test(types[end]); ++end) {}
          var before = (i ? types[i-1] : outerType) == "L";
          var after = (end < len ? types[end] : outerType) == "L";
          var replace = before || after ? "L" : "R";
          for (var j = i; j < end; ++j) types[j] = replace;
          i = end - 1;
        }
      }

      // Here we depart from the documented algorithm, in order to avoid
      // building up an actual levels array. Since there are only three
      // levels (0, 1, 2) in an implementation that doesn't take
      // explicit embedding into account, we can build up the order on
      // the fly, without following the level-based algorithm.
      var order = [], m;
      for (var i = 0; i < len;) {
        if (countsAsLeft.test(types[i])) {
          var start = i;
          for (++i; i < len && countsAsLeft.test(types[i]); ++i) {}
          order.push(new BidiSpan(0, start, i));
        } else {
          var pos = i, at = order.length;
          for (++i; i < len && types[i] != "L"; ++i) {}
          for (var j = pos; j < i;) {
            if (countsAsNum.test(types[j])) {
              if (pos < j) order.splice(at, 0, new BidiSpan(1, pos, j));
              var nstart = j;
              for (++j; j < i && countsAsNum.test(types[j]); ++j) {}
              order.splice(at, 0, new BidiSpan(2, nstart, j));
              pos = j;
            } else ++j;
          }
          if (pos < i) order.splice(at, 0, new BidiSpan(1, pos, i));
        }
      }
      if (order[0].level == 1 && (m = str.match(/^\s+/))) {
        order[0].from = m[0].length;
        order.unshift(new BidiSpan(0, 0, m[0].length));
      }
      if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
        lst(order).to -= m[0].length;
        order.push(new BidiSpan(0, len - m[0].length, len));
      }
      if (order[0].level != lst(order).level)
        order.push(new BidiSpan(order[0].level, len, len));

      return order;
    };
  })();

  // THE END

  CodeMirror.version = "4.12.0";

  return CodeMirror;
});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  var ie_lt8 = /MSIE \d/.test(navigator.userAgent) &&
    (document.documentMode == null || document.documentMode < 8);

  var Pos = CodeMirror.Pos;

  var matching = {"(": ")>", ")": "(<", "[": "]>", "]": "[<", "{": "}>", "}": "{<"};

  function findMatchingBracket(cm, where, strict, config) {
    var line = cm.getLineHandle(where.line), pos = where.ch - 1;
    var match = (pos >= 0 && matching[line.text.charAt(pos)]) || matching[line.text.charAt(++pos)];
    if (!match) return null;
    var dir = match.charAt(1) == ">" ? 1 : -1;
    if (strict && (dir > 0) != (pos == where.ch)) return null;
    var style = cm.getTokenTypeAt(Pos(where.line, pos + 1));

    var found = scanForBracket(cm, Pos(where.line, pos + (dir > 0 ? 1 : 0)), dir, style || null, config);
    if (found == null) return null;
    return {from: Pos(where.line, pos), to: found && found.pos,
            match: found && found.ch == match.charAt(0), forward: dir > 0};
  }

  // bracketRegex is used to specify which type of bracket to scan
  // should be a regexp, e.g. /[[\]]/
  //
  // Note: If "where" is on an open bracket, then this bracket is ignored.
  //
  // Returns false when no bracket was found, null when it reached
  // maxScanLines and gave up
  function scanForBracket(cm, where, dir, style, config) {
    var maxScanLen = (config && config.maxScanLineLength) || 10000;
    var maxScanLines = (config && config.maxScanLines) || 1000;

    var stack = [];
    var re = config && config.bracketRegex ? config.bracketRegex : /[(){}[\]]/;
    var lineEnd = dir > 0 ? Math.min(where.line + maxScanLines, cm.lastLine() + 1)
                          : Math.max(cm.firstLine() - 1, where.line - maxScanLines);
    for (var lineNo = where.line; lineNo != lineEnd; lineNo += dir) {
      var line = cm.getLine(lineNo);
      if (!line) continue;
      var pos = dir > 0 ? 0 : line.length - 1, end = dir > 0 ? line.length : -1;
      if (line.length > maxScanLen) continue;
      if (lineNo == where.line) pos = where.ch - (dir < 0 ? 1 : 0);
      for (; pos != end; pos += dir) {
        var ch = line.charAt(pos);
        if (re.test(ch) && (style === undefined || cm.getTokenTypeAt(Pos(lineNo, pos + 1)) == style)) {
          var match = matching[ch];
          if ((match.charAt(1) == ">") == (dir > 0)) stack.push(ch);
          else if (!stack.length) return {pos: Pos(lineNo, pos), ch: ch};
          else stack.pop();
        }
      }
    }
    return lineNo - dir == (dir > 0 ? cm.lastLine() : cm.firstLine()) ? false : null;
  }

  function matchBrackets(cm, autoclear, config) {
    // Disable brace matching in long lines, since it'll cause hugely slow updates
    var maxHighlightLen = cm.state.matchBrackets.maxHighlightLineLength || 1000;
    var marks = [], ranges = cm.listSelections();
    for (var i = 0; i < ranges.length; i++) {
      var match = ranges[i].empty() && findMatchingBracket(cm, ranges[i].head, false, config);
      if (match && cm.getLine(match.from.line).length <= maxHighlightLen) {
        var style = match.match ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
        marks.push(cm.markText(match.from, Pos(match.from.line, match.from.ch + 1), {className: style}));
        if (match.to && cm.getLine(match.to.line).length <= maxHighlightLen)
          marks.push(cm.markText(match.to, Pos(match.to.line, match.to.ch + 1), {className: style}));
      }
    }

    if (marks.length) {
      // Kludge to work around the IE bug from issue #1193, where text
      // input stops going to the textare whever this fires.
      if (ie_lt8 && cm.state.focused) cm.display.input.focus();

      var clear = function() {
        cm.operation(function() {
          for (var i = 0; i < marks.length; i++) marks[i].clear();
        });
      };
      if (autoclear) setTimeout(clear, 800);
      else return clear;
    }
  }

  var currentlyHighlighted = null;
  function doMatchBrackets(cm) {
    cm.operation(function() {
      if (currentlyHighlighted) {currentlyHighlighted(); currentlyHighlighted = null;}
      currentlyHighlighted = matchBrackets(cm, false, cm.state.matchBrackets);
    });
  }

  CodeMirror.defineOption("matchBrackets", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init)
      cm.off("cursorActivity", doMatchBrackets);
    if (val) {
      cm.state.matchBrackets = typeof val == "object" ? val : {};
      cm.on("cursorActivity", doMatchBrackets);
    }
  });

  CodeMirror.defineExtension("matchBrackets", function() {matchBrackets(this, true);});
  CodeMirror.defineExtension("findMatchingBracket", function(pos, strict, config){
    return findMatchingBracket(this, pos, strict, config);
  });
  CodeMirror.defineExtension("scanForBracket", function(pos, dir, style, config){
    return scanForBracket(this, pos, dir, style, config);
  });
});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  var DEFAULT_BRACKETS = "()[]{}''\"\"";
  var DEFAULT_EXPLODE_ON_ENTER = "[]{}";
  var SPACE_CHAR_REGEX = /\s/;

  var Pos = CodeMirror.Pos;

  CodeMirror.defineOption("autoCloseBrackets", false, function(cm, val, old) {
    if (old != CodeMirror.Init && old)
      cm.removeKeyMap("autoCloseBrackets");
    if (!val) return;
    var pairs = DEFAULT_BRACKETS, explode = DEFAULT_EXPLODE_ON_ENTER;
    if (typeof val == "string") pairs = val;
    else if (typeof val == "object") {
      if (val.pairs != null) pairs = val.pairs;
      if (val.explode != null) explode = val.explode;
    }
    var map = buildKeymap(pairs);
    if (explode) map.Enter = buildExplodeHandler(explode);
    cm.addKeyMap(map);
  });

  function charsAround(cm, pos) {
    var str = cm.getRange(Pos(pos.line, pos.ch - 1),
                          Pos(pos.line, pos.ch + 1));
    return str.length == 2 ? str : null;
  }

  // Project the token type that will exists after the given char is
  // typed, and use it to determine whether it would cause the start
  // of a string token.
  function enteringString(cm, pos, ch) {
    var line = cm.getLine(pos.line);
    var token = cm.getTokenAt(pos);
    if (/\bstring2?\b/.test(token.type)) return false;
    var stream = new CodeMirror.StringStream(line.slice(0, pos.ch) + ch + line.slice(pos.ch), 4);
    stream.pos = stream.start = token.start;
    for (;;) {
      var type1 = cm.getMode().token(stream, token.state);
      if (stream.pos >= pos.ch + 1) return /\bstring2?\b/.test(type1);
      stream.start = stream.pos;
    }
  }

  function buildKeymap(pairs) {
    var map = {
      name : "autoCloseBrackets",
      Backspace: function(cm) {
        if (cm.getOption("disableInput")) return CodeMirror.Pass;
        var ranges = cm.listSelections();
        for (var i = 0; i < ranges.length; i++) {
          if (!ranges[i].empty()) return CodeMirror.Pass;
          var around = charsAround(cm, ranges[i].head);
          if (!around || pairs.indexOf(around) % 2 != 0) return CodeMirror.Pass;
        }
        for (var i = ranges.length - 1; i >= 0; i--) {
          var cur = ranges[i].head;
          cm.replaceRange("", Pos(cur.line, cur.ch - 1), Pos(cur.line, cur.ch + 1));
        }
      }
    };
    var closingBrackets = "";
    for (var i = 0; i < pairs.length; i += 2) (function(left, right) {
      closingBrackets += right;
      map["'" + left + "'"] = function(cm) {
        if (cm.getOption("disableInput")) return CodeMirror.Pass;
        var ranges = cm.listSelections(), type, next;
        for (var i = 0; i < ranges.length; i++) {
          var range = ranges[i], cur = range.head, curType;
          var next = cm.getRange(cur, Pos(cur.line, cur.ch + 1));
          if (!range.empty()) {
            curType = "surround";
          } else if (left == right && next == right) {
            if (cm.getRange(cur, Pos(cur.line, cur.ch + 3)) == left + left + left)
              curType = "skipThree";
            else
              curType = "skip";
          } else if (left == right && cur.ch > 1 &&
                     cm.getRange(Pos(cur.line, cur.ch - 2), cur) == left + left &&
                     (cur.ch <= 2 || cm.getRange(Pos(cur.line, cur.ch - 3), Pos(cur.line, cur.ch - 2)) != left)) {
            curType = "addFour";
          } else if (left == '"' || left == "'") {
            if (!CodeMirror.isWordChar(next) && enteringString(cm, cur, left)) curType = "both";
            else return CodeMirror.Pass;
          } else if (cm.getLine(cur.line).length == cur.ch || closingBrackets.indexOf(next) >= 0 || SPACE_CHAR_REGEX.test(next)) {
            curType = "both";
          } else {
            return CodeMirror.Pass;
          }
          if (!type) type = curType;
          else if (type != curType) return CodeMirror.Pass;
        }

        cm.operation(function() {
          if (type == "skip") {
            cm.execCommand("goCharRight");
          } else if (type == "skipThree") {
            for (var i = 0; i < 3; i++)
              cm.execCommand("goCharRight");
          } else if (type == "surround") {
            var sels = cm.getSelections();
            for (var i = 0; i < sels.length; i++)
              sels[i] = left + sels[i] + right;
            cm.replaceSelections(sels, "around");
          } else if (type == "both") {
            cm.replaceSelection(left + right, null);
            cm.execCommand("goCharLeft");
          } else if (type == "addFour") {
            cm.replaceSelection(left + left + left + left, "before");
            cm.execCommand("goCharRight");
          }
        });
      };
      if (left != right) map["'" + right + "'"] = function(cm) {
        var ranges = cm.listSelections();
        for (var i = 0; i < ranges.length; i++) {
          var range = ranges[i];
          if (!range.empty() ||
              cm.getRange(range.head, Pos(range.head.line, range.head.ch + 1)) != right)
            return CodeMirror.Pass;
        }
        cm.execCommand("goCharRight");
      };
    })(pairs.charAt(i), pairs.charAt(i + 1));
    return map;
  }

  function buildExplodeHandler(pairs) {
    return function(cm) {
      if (cm.getOption("disableInput")) return CodeMirror.Pass;
      var ranges = cm.listSelections();
      for (var i = 0; i < ranges.length; i++) {
        if (!ranges[i].empty()) return CodeMirror.Pass;
        var around = charsAround(cm, ranges[i].head);
        if (!around || pairs.indexOf(around) % 2 != 0) return CodeMirror.Pass;
      }
      cm.operation(function() {
        cm.replaceSelection("\n\n", null);
        cm.execCommand("goCharLeft");
        ranges = cm.listSelections();
        for (var i = 0; i < ranges.length; i++) {
          var line = ranges[i].head.line;
          cm.indentLine(line, null, true);
          cm.indentLine(line + 1, null, true);
        }
      });
    };
  }
});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Because sometimes you need to style the cursor's line.
//
// Adds an option 'styleActiveLine' which, when enabled, gives the
// active line's wrapping <div> the CSS class "CodeMirror-activeline",
// and gives its background <div> the class "CodeMirror-activeline-background".

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  var WRAP_CLASS = "CodeMirror-activeline";
  var BACK_CLASS = "CodeMirror-activeline-background";

  CodeMirror.defineOption("styleActiveLine", false, function(cm, val, old) {
    var prev = old && old != CodeMirror.Init;
    if (val && !prev) {
      cm.state.activeLines = [];
      updateActiveLines(cm, cm.listSelections());
      cm.on("beforeSelectionChange", selectionChange);
    } else if (!val && prev) {
      cm.off("beforeSelectionChange", selectionChange);
      clearActiveLines(cm);
      delete cm.state.activeLines;
    }
  });

  function clearActiveLines(cm) {
    for (var i = 0; i < cm.state.activeLines.length; i++) {
      cm.removeLineClass(cm.state.activeLines[i], "wrap", WRAP_CLASS);
      cm.removeLineClass(cm.state.activeLines[i], "background", BACK_CLASS);
    }
  }

  function sameArray(a, b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++)
      if (a[i] != b[i]) return false;
    return true;
  }

  function updateActiveLines(cm, ranges) {
    var active = [];
    for (var i = 0; i < ranges.length; i++) {
      var range = ranges[i];
      if (!range.empty()) continue;
      var line = cm.getLineHandleVisualStart(range.head.line);
      if (active[active.length - 1] != line) active.push(line);
    }
    if (sameArray(cm.state.activeLines, active)) return;
    cm.operation(function() {
      clearActiveLines(cm);
      for (var i = 0; i < active.length; i++) {
        cm.addLineClass(active[i], "wrap", WRAP_CLASS);
        cm.addLineClass(active[i], "background", BACK_CLASS);
      }
      cm.state.activeLines = active;
    });
  }

  function selectionChange(cm, sel) {
    updateActiveLines(cm, sel.ranges);
  }
});

/* Jison generated parser */
var jsonlint = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"JSONString":3,"STRING":4,"JSONNumber":5,"NUMBER":6,"JSONNullLiteral":7,"NULL":8,"JSONBooleanLiteral":9,"TRUE":10,"FALSE":11,"JSONText":12,"JSONValue":13,"EOF":14,"JSONObject":15,"JSONArray":16,"{":17,"}":18,"JSONMemberList":19,"JSONMember":20,":":21,",":22,"[":23,"]":24,"JSONElementList":25,"$accept":0,"$end":1},
terminals_: {2:"error",4:"STRING",6:"NUMBER",8:"NULL",10:"TRUE",11:"FALSE",14:"EOF",17:"{",18:"}",21:":",22:",",23:"[",24:"]"},
productions_: [0,[3,1],[5,1],[7,1],[9,1],[9,1],[12,2],[13,1],[13,1],[13,1],[13,1],[13,1],[13,1],[15,2],[15,3],[20,3],[19,1],[19,3],[16,2],[16,3],[25,1],[25,3]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: // replace escaped characters with actual character
          this.$ = yytext.replace(/\\(\\|")/g, "$"+"1")
                     .replace(/\\n/g,'\n')
                     .replace(/\\r/g,'\r')
                     .replace(/\\t/g,'\t')
                     .replace(/\\v/g,'\v')
                     .replace(/\\f/g,'\f')
                     .replace(/\\b/g,'\b');

break;
case 2:this.$ = Number(yytext);
break;
case 3:this.$ = null;
break;
case 4:this.$ = true;
break;
case 5:this.$ = false;
break;
case 6:return this.$ = $$[$0-1];
break;
case 13:this.$ = {};
break;
case 14:this.$ = $$[$0-1];
break;
case 15:this.$ = [$$[$0-2], $$[$0]];
break;
case 16:this.$ = {}; this.$[$$[$0][0]] = $$[$0][1];
break;
case 17:this.$ = $$[$0-2]; $$[$0-2][$$[$0][0]] = $$[$0][1];
break;
case 18:this.$ = [];
break;
case 19:this.$ = $$[$0-1];
break;
case 20:this.$ = [$$[$0]];
break;
case 21:this.$ = $$[$0-2]; $$[$0-2].push($$[$0]);
break;
}
},
table: [{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],12:1,13:2,15:7,16:8,17:[1,14],23:[1,15]},{1:[3]},{14:[1,16]},{14:[2,7],18:[2,7],22:[2,7],24:[2,7]},{14:[2,8],18:[2,8],22:[2,8],24:[2,8]},{14:[2,9],18:[2,9],22:[2,9],24:[2,9]},{14:[2,10],18:[2,10],22:[2,10],24:[2,10]},{14:[2,11],18:[2,11],22:[2,11],24:[2,11]},{14:[2,12],18:[2,12],22:[2,12],24:[2,12]},{14:[2,3],18:[2,3],22:[2,3],24:[2,3]},{14:[2,4],18:[2,4],22:[2,4],24:[2,4]},{14:[2,5],18:[2,5],22:[2,5],24:[2,5]},{14:[2,1],18:[2,1],21:[2,1],22:[2,1],24:[2,1]},{14:[2,2],18:[2,2],22:[2,2],24:[2,2]},{3:20,4:[1,12],18:[1,17],19:18,20:19},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:23,15:7,16:8,17:[1,14],23:[1,15],24:[1,21],25:22},{1:[2,6]},{14:[2,13],18:[2,13],22:[2,13],24:[2,13]},{18:[1,24],22:[1,25]},{18:[2,16],22:[2,16]},{21:[1,26]},{14:[2,18],18:[2,18],22:[2,18],24:[2,18]},{22:[1,28],24:[1,27]},{22:[2,20],24:[2,20]},{14:[2,14],18:[2,14],22:[2,14],24:[2,14]},{3:20,4:[1,12],20:29},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:30,15:7,16:8,17:[1,14],23:[1,15]},{14:[2,19],18:[2,19],22:[2,19],24:[2,19]},{3:5,4:[1,12],5:6,6:[1,13],7:3,8:[1,9],9:4,10:[1,10],11:[1,11],13:31,15:7,16:8,17:[1,14],23:[1,15]},{18:[2,17],22:[2,17]},{18:[2,15],22:[2,15]},{22:[2,21],24:[2,21]}],
defaultActions: {16:[2,6]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parseError) {
            this.yy.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext+=ch;
        this.yyleng++;
        this.match+=ch;
        this.matched+=ch;
        var lines = ch.match(/\n/);
        if (lines) this.yylineno++;
        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        this._input = ch + this._input;
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this._input = this.match.slice(n) + this._input;
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/\n.*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length}
            this.yytext += match[0];
            this.match += match[0];
            this.yyleng = this.yytext.length;
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 6
break;
case 2:yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2); return 4
break;
case 3:return 17
break;
case 4:return 18
break;
case 5:return 23
break;
case 6:return 24
break;
case 7:return 22
break;
case 8:return 21
break;
case 9:return 10
break;
case 10:return 11
break;
case 11:return 8
break;
case 12:return 14
break;
case 13:return 'INVALID'
break;
}
};
lexer.rules = [/^(?:\s+)/,/^(?:(-?([0-9]|[1-9][0-9]+))(\.[0-9]+)?([eE][-+]?[0-9]+)?\b)/,/^(?:"(?:\\[\\"bfnrt/]|\\u[a-fA-F0-9]{4}|[^\\\0-\x09\x0a-\x1f"])*")/,/^(?:\{)/,/^(?:\})/,/^(?:\[)/,/^(?:\])/,/^(?:,)/,/^(?::)/,/^(?:true\b)/,/^(?:false\b)/,/^(?:null\b)/,/^(?:$)/,/^(?:.)/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13],"inclusive":true}};


;
return lexer;})()
parser.lexer = lexer;
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = jsonlint;
exports.parse = function () { return jsonlint.parse.apply(jsonlint, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";
  var GUTTER_ID = "CodeMirror-lint-markers";

  function showTooltip(e, content) {
    var tt = document.createElement("div");
    tt.className = "CodeMirror-lint-tooltip";
    tt.appendChild(content.cloneNode(true));
    document.body.appendChild(tt);

    function position(e) {
      if (!tt.parentNode) return CodeMirror.off(document, "mousemove", position);
      tt.style.top = Math.max(0, e.clientY - tt.offsetHeight - 5) + "px";
      tt.style.left = (e.clientX + 5) + "px";
    }
    CodeMirror.on(document, "mousemove", position);
    position(e);
    if (tt.style.opacity != null) tt.style.opacity = 1;
    return tt;
  }
  function rm(elt) {
    if (elt.parentNode) elt.parentNode.removeChild(elt);
  }
  function hideTooltip(tt) {
    if (!tt.parentNode) return;
    if (tt.style.opacity == null) rm(tt);
    tt.style.opacity = 0;
    setTimeout(function() { rm(tt); }, 600);
  }

  function showTooltipFor(e, content, node) {
    var tooltip = showTooltip(e, content);
    function hide() {
      CodeMirror.off(node, "mouseout", hide);
      if (tooltip) { hideTooltip(tooltip); tooltip = null; }
    }
    var poll = setInterval(function() {
      if (tooltip) for (var n = node;; n = n.parentNode) {
        if (n == document.body) return;
        if (!n) { hide(); break; }
      }
      if (!tooltip) return clearInterval(poll);
    }, 400);
    CodeMirror.on(node, "mouseout", hide);
  }

  function LintState(cm, options, hasGutter) {
    this.marked = [];
    this.options = options;
    this.timeout = null;
    this.hasGutter = hasGutter;
    this.onMouseOver = function(e) { onMouseOver(cm, e); };
  }

  function parseOptions(cm, options) {
    if (options instanceof Function) return {getAnnotations: options};
    if (!options || options === true) options = {};
    if (!options.getAnnotations) options.getAnnotations = cm.getHelper(CodeMirror.Pos(0, 0), "lint");
    if (!options.getAnnotations) throw new Error("Required option 'getAnnotations' missing (lint addon)");
    return options;
  }

  function clearMarks(cm) {
    var state = cm.state.lint;
    if (state.hasGutter) cm.clearGutter(GUTTER_ID);
    for (var i = 0; i < state.marked.length; ++i)
      state.marked[i].clear();
    state.marked.length = 0;
  }

  function makeMarker(labels, severity, multiple, tooltips) {
    var marker = document.createElement("div"), inner = marker;
    marker.className = "CodeMirror-lint-marker-" + severity;
    if (multiple) {
      inner = marker.appendChild(document.createElement("div"));
      inner.className = "CodeMirror-lint-marker-multiple";
    }

    if (tooltips != false) CodeMirror.on(inner, "mouseover", function(e) {
      showTooltipFor(e, labels, inner);
    });

    return marker;
  }

  function getMaxSeverity(a, b) {
    if (a == "error") return a;
    else return b;
  }

  function groupByLine(annotations) {
    var lines = [];
    for (var i = 0; i < annotations.length; ++i) {
      var ann = annotations[i], line = ann.from.line;
      (lines[line] || (lines[line] = [])).push(ann);
    }
    return lines;
  }

  function annotationTooltip(ann) {
    var severity = ann.severity;
    if (!severity) severity = "error";
    var tip = document.createElement("div");
    tip.className = "CodeMirror-lint-message-" + severity;
    tip.appendChild(document.createTextNode(ann.message));
    return tip;
  }

  function startLinting(cm) {
    var state = cm.state.lint, options = state.options;
    var passOptions = options.options || options; // Support deprecated passing of `options` property in options
    if (options.async)
      options.getAnnotations(cm.getValue(), updateLinting, passOptions, cm);
    else
      updateLinting(cm, options.getAnnotations(cm.getValue(), passOptions, cm));
  }

  function updateLinting(cm, annotationsNotSorted) {
    clearMarks(cm);
    var state = cm.state.lint, options = state.options;

    var annotations = groupByLine(annotationsNotSorted);

    for (var line = 0; line < annotations.length; ++line) {
      var anns = annotations[line];
      if (!anns) continue;

      var maxSeverity = null;
      var tipLabel = state.hasGutter && document.createDocumentFragment();

      for (var i = 0; i < anns.length; ++i) {
        var ann = anns[i];
        var severity = ann.severity;
        if (!severity) severity = "error";
        maxSeverity = getMaxSeverity(maxSeverity, severity);

        if (options.formatAnnotation) ann = options.formatAnnotation(ann);
        if (state.hasGutter) tipLabel.appendChild(annotationTooltip(ann));

        if (ann.to) state.marked.push(cm.markText(ann.from, ann.to, {
          className: "CodeMirror-lint-mark-" + severity,
          __annotation: ann
        }));
      }

      if (state.hasGutter)
        cm.setGutterMarker(line, GUTTER_ID, makeMarker(tipLabel, maxSeverity, anns.length > 1,
                                                       state.options.tooltips));
    }
    if (options.onUpdateLinting) options.onUpdateLinting(annotationsNotSorted, annotations, cm);
  }

  function onChange(cm) {
    var state = cm.state.lint;
    clearTimeout(state.timeout);
    state.timeout = setTimeout(function(){startLinting(cm);}, state.options.delay || 500);
  }

  function popupSpanTooltip(ann, e) {
    var target = e.target || e.srcElement;
    showTooltipFor(e, annotationTooltip(ann), target);
  }

  function onMouseOver(cm, e) {
    var target = e.target || e.srcElement;
    if (!/\bCodeMirror-lint-mark-/.test(target.className)) return;
    var box = target.getBoundingClientRect(), x = (box.left + box.right) / 2, y = (box.top + box.bottom) / 2;
    var spans = cm.findMarksAt(cm.coordsChar({left: x, top: y}, "client"));
    for (var i = 0; i < spans.length; ++i) {
      var ann = spans[i].__annotation;
      if (ann) return popupSpanTooltip(ann, e);
    }
  }

  CodeMirror.defineOption("lint", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init) {
      clearMarks(cm);
      cm.off("change", onChange);
      CodeMirror.off(cm.getWrapperElement(), "mouseover", cm.state.lint.onMouseOver);
      delete cm.state.lint;
    }

    if (val) {
      var gutters = cm.getOption("gutters"), hasLintGutter = false;
      for (var i = 0; i < gutters.length; ++i) if (gutters[i] == GUTTER_ID) hasLintGutter = true;
      var state = cm.state.lint = new LintState(cm, parseOptions(cm, val), hasLintGutter);
      cm.on("change", onChange);
      if (state.options.tooltips != false)
        CodeMirror.on(cm.getWrapperElement(), "mouseover", state.onMouseOver);

      startLinting(cm);
    }
  });
});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// Depends on jsonlint.js from https://github.com/zaach/jsonlint

// declare global: jsonlint

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.registerHelper("lint", "json", function(text) {
  var found = [];
  jsonlint.parseError = function(str, hash) {
    var loc = hash.loc;
    found.push({from: CodeMirror.Pos(loc.first_line - 1, loc.first_column),
                to: CodeMirror.Pos(loc.last_line - 1, loc.last_column),
                message: str});
  };
  try { jsonlint.parse(text); }
  catch(e) {}
  return found;
});

});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  function doFold(cm, pos, options, force) {
    if (options && options.call) {
      var finder = options;
      options = null;
    } else {
      var finder = getOption(cm, options, "rangeFinder");
    }
    if (typeof pos == "number") pos = CodeMirror.Pos(pos, 0);
    var minSize = getOption(cm, options, "minFoldSize");

    function getRange(allowFolded) {
      var range = finder(cm, pos);
      if (!range || range.to.line - range.from.line < minSize) return null;
      var marks = cm.findMarksAt(range.from);
      for (var i = 0; i < marks.length; ++i) {
        if (marks[i].__isFold && force !== "fold") {
          if (!allowFolded) return null;
          range.cleared = true;
          marks[i].clear();
        }
      }
      return range;
    }

    var range = getRange(true);
    if (getOption(cm, options, "scanUp")) while (!range && pos.line > cm.firstLine()) {
      pos = CodeMirror.Pos(pos.line - 1, 0);
      range = getRange(false);
    }
    if (!range || range.cleared || force === "unfold") return;

    var myWidget = makeWidget(cm, options);
    CodeMirror.on(myWidget, "mousedown", function(e) {
      myRange.clear();
      CodeMirror.e_preventDefault(e);
    });
    var myRange = cm.markText(range.from, range.to, {
      replacedWith: myWidget,
      clearOnEnter: true,
      __isFold: true
    });
    myRange.on("clear", function(from, to) {
      CodeMirror.signal(cm, "unfold", cm, from, to);
    });
    CodeMirror.signal(cm, "fold", cm, range.from, range.to);
  }

  function makeWidget(cm, options) {
    var widget = getOption(cm, options, "widget");
    if (typeof widget == "string") {
      var text = document.createTextNode(widget);
      widget = document.createElement("span");
      widget.appendChild(text);
      widget.className = "CodeMirror-foldmarker";
    }
    return widget;
  }

  // Clumsy backwards-compatible interface
  CodeMirror.newFoldFunction = function(rangeFinder, widget) {
    return function(cm, pos) { doFold(cm, pos, {rangeFinder: rangeFinder, widget: widget}); };
  };

  // New-style interface
  CodeMirror.defineExtension("foldCode", function(pos, options, force) {
    doFold(this, pos, options, force);
  });

  CodeMirror.defineExtension("isFolded", function(pos) {
    var marks = this.findMarksAt(pos);
    for (var i = 0; i < marks.length; ++i)
      if (marks[i].__isFold) return true;
  });

  CodeMirror.commands.toggleFold = function(cm) {
    cm.foldCode(cm.getCursor());
  };
  CodeMirror.commands.fold = function(cm) {
    cm.foldCode(cm.getCursor(), null, "fold");
  };
  CodeMirror.commands.unfold = function(cm) {
    cm.foldCode(cm.getCursor(), null, "unfold");
  };
  CodeMirror.commands.foldAll = function(cm) {
    cm.operation(function() {
      for (var i = cm.firstLine(), e = cm.lastLine(); i <= e; i++)
        cm.foldCode(CodeMirror.Pos(i, 0), null, "fold");
    });
  };
  CodeMirror.commands.unfoldAll = function(cm) {
    cm.operation(function() {
      for (var i = cm.firstLine(), e = cm.lastLine(); i <= e; i++)
        cm.foldCode(CodeMirror.Pos(i, 0), null, "unfold");
    });
  };

  CodeMirror.registerHelper("fold", "combine", function() {
    var funcs = Array.prototype.slice.call(arguments, 0);
    return function(cm, start) {
      for (var i = 0; i < funcs.length; ++i) {
        var found = funcs[i](cm, start);
        if (found) return found;
      }
    };
  });

  CodeMirror.registerHelper("fold", "auto", function(cm, start) {
    var helpers = cm.getHelpers(start, "fold");
    for (var i = 0; i < helpers.length; i++) {
      var cur = helpers[i](cm, start);
      if (cur) return cur;
    }
  });

  var defaultOptions = {
    rangeFinder: CodeMirror.fold.auto,
    widget: "\u2194",
    minFoldSize: 0,
    scanUp: false
  };

  CodeMirror.defineOption("foldOptions", null);

  function getOption(cm, options, name) {
    if (options && options[name] !== undefined)
      return options[name];
    var editorOptions = cm.options.foldOptions;
    if (editorOptions && editorOptions[name] !== undefined)
      return editorOptions[name];
    return defaultOptions[name];
  }

  CodeMirror.defineExtension("foldOption", function(options, name) {
    return getOption(this, options, name);
  });
});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"), require("./foldcode"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror", "./foldcode"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineOption("foldGutter", false, function(cm, val, old) {
    if (old && old != CodeMirror.Init) {
      cm.clearGutter(cm.state.foldGutter.options.gutter);
      cm.state.foldGutter = null;
      cm.off("gutterClick", onGutterClick);
      cm.off("change", onChange);
      cm.off("viewportChange", onViewportChange);
      cm.off("fold", onFold);
      cm.off("unfold", onFold);
      cm.off("swapDoc", updateInViewport);
    }
    if (val) {
      cm.state.foldGutter = new State(parseOptions(val));
      updateInViewport(cm);
      cm.on("gutterClick", onGutterClick);
      cm.on("change", onChange);
      cm.on("viewportChange", onViewportChange);
      cm.on("fold", onFold);
      cm.on("unfold", onFold);
      cm.on("swapDoc", updateInViewport);
    }
  });

  var Pos = CodeMirror.Pos;

  function State(options) {
    this.options = options;
    this.from = this.to = 0;
  }

  function parseOptions(opts) {
    if (opts === true) opts = {};
    if (opts.gutter == null) opts.gutter = "CodeMirror-foldgutter";
    if (opts.indicatorOpen == null) opts.indicatorOpen = "CodeMirror-foldgutter-open";
    if (opts.indicatorFolded == null) opts.indicatorFolded = "CodeMirror-foldgutter-folded";
    return opts;
  }

  function isFolded(cm, line) {
    var marks = cm.findMarksAt(Pos(line));
    for (var i = 0; i < marks.length; ++i)
      if (marks[i].__isFold && marks[i].find().from.line == line) return true;
  }

  function marker(spec) {
    if (typeof spec == "string") {
      var elt = document.createElement("div");
      elt.className = spec + " CodeMirror-guttermarker-subtle";
      return elt;
    } else {
      return spec.cloneNode(true);
    }
  }

  function updateFoldInfo(cm, from, to) {
    var opts = cm.state.foldGutter.options, cur = from;
    var minSize = cm.foldOption(opts, "minFoldSize");
    var func = cm.foldOption(opts, "rangeFinder");
    cm.eachLine(from, to, function(line) {
      var mark = null;
      if (isFolded(cm, cur)) {
        mark = marker(opts.indicatorFolded);
      } else {
        var pos = Pos(cur, 0);
        var range = func && func(cm, pos);
        if (range && range.to.line - range.from.line >= minSize)
          mark = marker(opts.indicatorOpen);
      }
      cm.setGutterMarker(line, opts.gutter, mark);
      ++cur;
    });
  }

  function updateInViewport(cm) {
    var vp = cm.getViewport(), state = cm.state.foldGutter;
    if (!state) return;
    cm.operation(function() {
      updateFoldInfo(cm, vp.from, vp.to);
    });
    state.from = vp.from; state.to = vp.to;
  }

  function onGutterClick(cm, line, gutter) {
    var opts = cm.state.foldGutter.options;
    if (gutter != opts.gutter) return;
    cm.foldCode(Pos(line, 0), opts.rangeFinder);
  }

  function onChange(cm) {
    var state = cm.state.foldGutter, opts = cm.state.foldGutter.options;
    state.from = state.to = 0;
    clearTimeout(state.changeUpdate);
    state.changeUpdate = setTimeout(function() { updateInViewport(cm); }, opts.foldOnChangeTimeSpan || 600);
  }

  function onViewportChange(cm) {
    var state = cm.state.foldGutter, opts = cm.state.foldGutter.options;
    clearTimeout(state.changeUpdate);
    state.changeUpdate = setTimeout(function() {
      var vp = cm.getViewport();
      if (state.from == state.to || vp.from - state.to > 20 || state.from - vp.to > 20) {
        updateInViewport(cm);
      } else {
        cm.operation(function() {
          if (vp.from < state.from) {
            updateFoldInfo(cm, vp.from, state.from);
            state.from = vp.from;
          }
          if (vp.to > state.to) {
            updateFoldInfo(cm, state.to, vp.to);
            state.to = vp.to;
          }
        });
      }
    }, opts.updateViewportTimeSpan || 400);
  }

  function onFold(cm, from) {
    var state = cm.state.foldGutter, line = from.line;
    if (line >= state.from && line < state.to)
      updateFoldInfo(cm, line, line + 1);
  }
});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.registerHelper("fold", "brace", function(cm, start) {
  var line = start.line, lineText = cm.getLine(line);
  var startCh, tokenType;

  function findOpening(openCh) {
    for (var at = start.ch, pass = 0;;) {
      var found = at <= 0 ? -1 : lineText.lastIndexOf(openCh, at - 1);
      if (found == -1) {
        if (pass == 1) break;
        pass = 1;
        at = lineText.length;
        continue;
      }
      if (pass == 1 && found < start.ch) break;
      tokenType = cm.getTokenTypeAt(CodeMirror.Pos(line, found + 1));
      if (!/^(comment|string)/.test(tokenType)) return found + 1;
      at = found - 1;
    }
  }

  var startToken = "{", endToken = "}", startCh = findOpening("{");
  if (startCh == null) {
    startToken = "[", endToken = "]";
    startCh = findOpening("[");
  }

  if (startCh == null) return;
  var count = 1, lastLine = cm.lastLine(), end, endCh;
  outer: for (var i = line; i <= lastLine; ++i) {
    var text = cm.getLine(i), pos = i == line ? startCh : 0;
    for (;;) {
      var nextOpen = text.indexOf(startToken, pos), nextClose = text.indexOf(endToken, pos);
      if (nextOpen < 0) nextOpen = text.length;
      if (nextClose < 0) nextClose = text.length;
      pos = Math.min(nextOpen, nextClose);
      if (pos == text.length) break;
      if (cm.getTokenTypeAt(CodeMirror.Pos(i, pos + 1)) == tokenType) {
        if (pos == nextOpen) ++count;
        else if (!--count) { end = i; endCh = pos; break outer; }
      }
      ++pos;
    }
  }
  if (end == null || line == end && endCh == startCh) return;
  return {from: CodeMirror.Pos(line, startCh),
          to: CodeMirror.Pos(end, endCh)};
});

CodeMirror.registerHelper("fold", "import", function(cm, start) {
  function hasImport(line) {
    if (line < cm.firstLine() || line > cm.lastLine()) return null;
    var start = cm.getTokenAt(CodeMirror.Pos(line, 1));
    if (!/\S/.test(start.string)) start = cm.getTokenAt(CodeMirror.Pos(line, start.end + 1));
    if (start.type != "keyword" || start.string != "import") return null;
    // Now find closing semicolon, return its position
    for (var i = line, e = Math.min(cm.lastLine(), line + 10); i <= e; ++i) {
      var text = cm.getLine(i), semi = text.indexOf(";");
      if (semi != -1) return {startCh: start.end, end: CodeMirror.Pos(i, semi)};
    }
  }

  var start = start.line, has = hasImport(start), prev;
  if (!has || hasImport(start - 1) || ((prev = hasImport(start - 2)) && prev.end.line == start - 1))
    return null;
  for (var end = has.end;;) {
    var next = hasImport(end.line + 1);
    if (next == null) break;
    end = next.end;
  }
  return {from: cm.clipPos(CodeMirror.Pos(start, has.startCh + 1)), to: end};
});

CodeMirror.registerHelper("fold", "include", function(cm, start) {
  function hasInclude(line) {
    if (line < cm.firstLine() || line > cm.lastLine()) return null;
    var start = cm.getTokenAt(CodeMirror.Pos(line, 1));
    if (!/\S/.test(start.string)) start = cm.getTokenAt(CodeMirror.Pos(line, start.end + 1));
    if (start.type == "meta" && start.string.slice(0, 8) == "#include") return start.start + 8;
  }

  var start = start.line, has = hasInclude(start);
  if (has == null || hasInclude(start - 1) != null) return null;
  for (var end = start;;) {
    var next = hasInclude(end + 1);
    if (next == null) break;
    ++end;
  }
  return {from: CodeMirror.Pos(start, has + 1),
          to: cm.clipPos(CodeMirror.Pos(end))};
});

});

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// TODO actually recognize syntax of TypeScript constructs

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("javascript", function(config, parserConfig) {
  var indentUnit = config.indentUnit;
  var statementIndent = parserConfig.statementIndent;
  var jsonldMode = parserConfig.jsonld;
  var jsonMode = parserConfig.json || jsonldMode;
  var isTS = parserConfig.typescript;
  var wordRE = parserConfig.wordCharacters || /[\w$\xa1-\uffff]/;

  // Tokenizer

  var keywords = function(){
    function kw(type) {return {type: type, style: "keyword"};}
    var A = kw("keyword a"), B = kw("keyword b"), C = kw("keyword c");
    var operator = kw("operator"), atom = {type: "atom", style: "atom"};

    var jsKeywords = {
      "if": kw("if"), "while": A, "with": A, "else": B, "do": B, "try": B, "finally": B,
      "return": C, "break": C, "continue": C, "new": C, "delete": C, "throw": C, "debugger": C,
      "var": kw("var"), "const": kw("var"), "let": kw("var"),
      "function": kw("function"), "catch": kw("catch"),
      "for": kw("for"), "switch": kw("switch"), "case": kw("case"), "default": kw("default"),
      "in": operator, "typeof": operator, "instanceof": operator,
      "true": atom, "false": atom, "null": atom, "undefined": atom, "NaN": atom, "Infinity": atom,
      "this": kw("this"), "module": kw("module"), "class": kw("class"), "super": kw("atom"),
      "yield": C, "export": kw("export"), "import": kw("import"), "extends": C
    };

    // Extend the 'normal' keywords with the TypeScript language extensions
    if (isTS) {
      var type = {type: "variable", style: "variable-3"};
      var tsKeywords = {
        // object-like things
        "interface": kw("interface"),
        "extends": kw("extends"),
        "constructor": kw("constructor"),

        // scope modifiers
        "public": kw("public"),
        "private": kw("private"),
        "protected": kw("protected"),
        "static": kw("static"),

        // types
        "string": type, "number": type, "bool": type, "any": type
      };

      for (var attr in tsKeywords) {
        jsKeywords[attr] = tsKeywords[attr];
      }
    }

    return jsKeywords;
  }();

  var isOperatorChar = /[+\-*&%=<>!?|~^]/;
  var isJsonldKeyword = /^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;

  function readRegexp(stream) {
    var escaped = false, next, inSet = false;
    while ((next = stream.next()) != null) {
      if (!escaped) {
        if (next == "/" && !inSet) return;
        if (next == "[") inSet = true;
        else if (inSet && next == "]") inSet = false;
      }
      escaped = !escaped && next == "\\";
    }
  }

  // Used as scratch variables to communicate multiple values without
  // consing up tons of objects.
  var type, content;
  function ret(tp, style, cont) {
    type = tp; content = cont;
    return style;
  }
  function tokenBase(stream, state) {
    var ch = stream.next();
    if (ch == '"' || ch == "'") {
      state.tokenize = tokenString(ch);
      return state.tokenize(stream, state);
    } else if (ch == "." && stream.match(/^\d+(?:[eE][+\-]?\d+)?/)) {
      return ret("number", "number");
    } else if (ch == "." && stream.match("..")) {
      return ret("spread", "meta");
    } else if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
      return ret(ch);
    } else if (ch == "=" && stream.eat(">")) {
      return ret("=>", "operator");
    } else if (ch == "0" && stream.eat(/x/i)) {
      stream.eatWhile(/[\da-f]/i);
      return ret("number", "number");
    } else if (/\d/.test(ch)) {
      stream.match(/^\d*(?:\.\d*)?(?:[eE][+\-]?\d+)?/);
      return ret("number", "number");
    } else if (ch == "/") {
      if (stream.eat("*")) {
        state.tokenize = tokenComment;
        return tokenComment(stream, state);
      } else if (stream.eat("/")) {
        stream.skipToEnd();
        return ret("comment", "comment");
      } else if (state.lastType == "operator" || state.lastType == "keyword c" ||
               state.lastType == "sof" || /^[\[{}\(,;:]$/.test(state.lastType)) {
        readRegexp(stream);
        stream.eatWhile(/[gimy]/); // 'y' is "sticky" option in Mozilla
        return ret("regexp", "string-2");
      } else {
        stream.eatWhile(isOperatorChar);
        return ret("operator", "operator", stream.current());
      }
    } else if (ch == "`") {
      state.tokenize = tokenQuasi;
      return tokenQuasi(stream, state);
    } else if (ch == "#") {
      stream.skipToEnd();
      return ret("error", "error");
    } else if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return ret("operator", "operator", stream.current());
    } else if (wordRE.test(ch)) {
      stream.eatWhile(wordRE);
      var word = stream.current(), known = keywords.propertyIsEnumerable(word) && keywords[word];
      return (known && state.lastType != ".") ? ret(known.type, known.style, word) :
                     ret("variable", "variable", word);
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next;
      if (jsonldMode && stream.peek() == "@" && stream.match(isJsonldKeyword)){
        state.tokenize = tokenBase;
        return ret("jsonld-keyword", "meta");
      }
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) break;
        escaped = !escaped && next == "\\";
      }
      if (!escaped) state.tokenize = tokenBase;
      return ret("string", "string");
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ret("comment", "comment");
  }

  function tokenQuasi(stream, state) {
    var escaped = false, next;
    while ((next = stream.next()) != null) {
      if (!escaped && (next == "`" || next == "$" && stream.eat("{"))) {
        state.tokenize = tokenBase;
        break;
      }
      escaped = !escaped && next == "\\";
    }
    return ret("quasi", "string-2", stream.current());
  }

  var brackets = "([{}])";
  // This is a crude lookahead trick to try and notice that we're
  // parsing the argument patterns for a fat-arrow function before we
  // actually hit the arrow token. It only works if the arrow is on
  // the same line as the arguments and there's no strange noise
  // (comments) in between. Fallback is to only notice when we hit the
  // arrow, and not declare the arguments as locals for the arrow
  // body.
  function findFatArrow(stream, state) {
    if (state.fatArrowAt) state.fatArrowAt = null;
    var arrow = stream.string.indexOf("=>", stream.start);
    if (arrow < 0) return;

    var depth = 0, sawSomething = false;
    for (var pos = arrow - 1; pos >= 0; --pos) {
      var ch = stream.string.charAt(pos);
      var bracket = brackets.indexOf(ch);
      if (bracket >= 0 && bracket < 3) {
        if (!depth) { ++pos; break; }
        if (--depth == 0) break;
      } else if (bracket >= 3 && bracket < 6) {
        ++depth;
      } else if (wordRE.test(ch)) {
        sawSomething = true;
      } else if (/["'\/]/.test(ch)) {
        return;
      } else if (sawSomething && !depth) {
        ++pos;
        break;
      }
    }
    if (sawSomething && !depth) state.fatArrowAt = pos;
  }

  // Parser

  var atomicTypes = {"atom": true, "number": true, "variable": true, "string": true, "regexp": true, "this": true, "jsonld-keyword": true};

  function JSLexical(indented, column, type, align, prev, info) {
    this.indented = indented;
    this.column = column;
    this.type = type;
    this.prev = prev;
    this.info = info;
    if (align != null) this.align = align;
  }

  function inScope(state, varname) {
    for (var v = state.localVars; v; v = v.next)
      if (v.name == varname) return true;
    for (var cx = state.context; cx; cx = cx.prev) {
      for (var v = cx.vars; v; v = v.next)
        if (v.name == varname) return true;
    }
  }

  function parseJS(state, style, type, content, stream) {
    var cc = state.cc;
    // Communicate our context to the combinators.
    // (Less wasteful than consing up a hundred closures on every call.)
    cx.state = state; cx.stream = stream; cx.marked = null, cx.cc = cc; cx.style = style;

    if (!state.lexical.hasOwnProperty("align"))
      state.lexical.align = true;

    while(true) {
      var combinator = cc.length ? cc.pop() : jsonMode ? expression : statement;
      if (combinator(type, content)) {
        while(cc.length && cc[cc.length - 1].lex)
          cc.pop()();
        if (cx.marked) return cx.marked;
        if (type == "variable" && inScope(state, content)) return "variable-2";
        return style;
      }
    }
  }

  // Combinator utils

  var cx = {state: null, column: null, marked: null, cc: null};
  function pass() {
    for (var i = arguments.length - 1; i >= 0; i--) cx.cc.push(arguments[i]);
  }
  function cont() {
    pass.apply(null, arguments);
    return true;
  }
  function register(varname) {
    function inList(list) {
      for (var v = list; v; v = v.next)
        if (v.name == varname) return true;
      return false;
    }
    var state = cx.state;
    if (state.context) {
      cx.marked = "def";
      if (inList(state.localVars)) return;
      state.localVars = {name: varname, next: state.localVars};
    } else {
      if (inList(state.globalVars)) return;
      if (parserConfig.globalVars)
        state.globalVars = {name: varname, next: state.globalVars};
    }
  }

  // Combinators

  var defaultVars = {name: "this", next: {name: "arguments"}};
  function pushcontext() {
    cx.state.context = {prev: cx.state.context, vars: cx.state.localVars};
    cx.state.localVars = defaultVars;
  }
  function popcontext() {
    cx.state.localVars = cx.state.context.vars;
    cx.state.context = cx.state.context.prev;
  }
  function pushlex(type, info) {
    var result = function() {
      var state = cx.state, indent = state.indented;
      if (state.lexical.type == "stat") indent = state.lexical.indented;
      else for (var outer = state.lexical; outer && outer.type == ")" && outer.align; outer = outer.prev)
        indent = outer.indented;
      state.lexical = new JSLexical(indent, cx.stream.column(), type, null, state.lexical, info);
    };
    result.lex = true;
    return result;
  }
  function poplex() {
    var state = cx.state;
    if (state.lexical.prev) {
      if (state.lexical.type == ")")
        state.indented = state.lexical.indented;
      state.lexical = state.lexical.prev;
    }
  }
  poplex.lex = true;

  function expect(wanted) {
    function exp(type) {
      if (type == wanted) return cont();
      else if (wanted == ";") return pass();
      else return cont(exp);
    };
    return exp;
  }

  function statement(type, value) {
    if (type == "var") return cont(pushlex("vardef", value.length), vardef, expect(";"), poplex);
    if (type == "keyword a") return cont(pushlex("form"), expression, statement, poplex);
    if (type == "keyword b") return cont(pushlex("form"), statement, poplex);
    if (type == "{") return cont(pushlex("}"), block, poplex);
    if (type == ";") return cont();
    if (type == "if") {
      if (cx.state.lexical.info == "else" && cx.state.cc[cx.state.cc.length - 1] == poplex)
        cx.state.cc.pop()();
      return cont(pushlex("form"), expression, statement, poplex, maybeelse);
    }
    if (type == "function") return cont(functiondef);
    if (type == "for") return cont(pushlex("form"), forspec, statement, poplex);
    if (type == "variable") return cont(pushlex("stat"), maybelabel);
    if (type == "switch") return cont(pushlex("form"), expression, pushlex("}", "switch"), expect("{"),
                                      block, poplex, poplex);
    if (type == "case") return cont(expression, expect(":"));
    if (type == "default") return cont(expect(":"));
    if (type == "catch") return cont(pushlex("form"), pushcontext, expect("("), funarg, expect(")"),
                                     statement, poplex, popcontext);
    if (type == "module") return cont(pushlex("form"), pushcontext, afterModule, popcontext, poplex);
    if (type == "class") return cont(pushlex("form"), className, poplex);
    if (type == "export") return cont(pushlex("form"), afterExport, poplex);
    if (type == "import") return cont(pushlex("form"), afterImport, poplex);
    return pass(pushlex("stat"), expression, expect(";"), poplex);
  }
  function expression(type) {
    return expressionInner(type, false);
  }
  function expressionNoComma(type) {
    return expressionInner(type, true);
  }
  function expressionInner(type, noComma) {
    if (cx.state.fatArrowAt == cx.stream.start) {
      var body = noComma ? arrowBodyNoComma : arrowBody;
      if (type == "(") return cont(pushcontext, pushlex(")"), commasep(pattern, ")"), poplex, expect("=>"), body, popcontext);
      else if (type == "variable") return pass(pushcontext, pattern, expect("=>"), body, popcontext);
    }

    var maybeop = noComma ? maybeoperatorNoComma : maybeoperatorComma;
    if (atomicTypes.hasOwnProperty(type)) return cont(maybeop);
    if (type == "function") return cont(functiondef, maybeop);
    if (type == "keyword c") return cont(noComma ? maybeexpressionNoComma : maybeexpression);
    if (type == "(") return cont(pushlex(")"), maybeexpression, comprehension, expect(")"), poplex, maybeop);
    if (type == "operator" || type == "spread") return cont(noComma ? expressionNoComma : expression);
    if (type == "[") return cont(pushlex("]"), arrayLiteral, poplex, maybeop);
    if (type == "{") return contCommasep(objprop, "}", null, maybeop);
    if (type == "quasi") { return pass(quasi, maybeop); }
    return cont();
  }
  function maybeexpression(type) {
    if (type.match(/[;\}\)\],]/)) return pass();
    return pass(expression);
  }
  function maybeexpressionNoComma(type) {
    if (type.match(/[;\}\)\],]/)) return pass();
    return pass(expressionNoComma);
  }

  function maybeoperatorComma(type, value) {
    if (type == ",") return cont(expression);
    return maybeoperatorNoComma(type, value, false);
  }
  function maybeoperatorNoComma(type, value, noComma) {
    var me = noComma == false ? maybeoperatorComma : maybeoperatorNoComma;
    var expr = noComma == false ? expression : expressionNoComma;
    if (type == "=>") return cont(pushcontext, noComma ? arrowBodyNoComma : arrowBody, popcontext);
    if (type == "operator") {
      if (/\+\+|--/.test(value)) return cont(me);
      if (value == "?") return cont(expression, expect(":"), expr);
      return cont(expr);
    }
    if (type == "quasi") { return pass(quasi, me); }
    if (type == ";") return;
    if (type == "(") return contCommasep(expressionNoComma, ")", "call", me);
    if (type == ".") return cont(property, me);
    if (type == "[") return cont(pushlex("]"), maybeexpression, expect("]"), poplex, me);
  }
  function quasi(type, value) {
    if (type != "quasi") return pass();
    if (value.slice(value.length - 2) != "${") return cont(quasi);
    return cont(expression, continueQuasi);
  }
  function continueQuasi(type) {
    if (type == "}") {
      cx.marked = "string-2";
      cx.state.tokenize = tokenQuasi;
      return cont(quasi);
    }
  }
  function arrowBody(type) {
    findFatArrow(cx.stream, cx.state);
    return pass(type == "{" ? statement : expression);
  }
  function arrowBodyNoComma(type) {
    findFatArrow(cx.stream, cx.state);
    return pass(type == "{" ? statement : expressionNoComma);
  }
  function maybelabel(type) {
    if (type == ":") return cont(poplex, statement);
    return pass(maybeoperatorComma, expect(";"), poplex);
  }
  function property(type) {
    if (type == "variable") {cx.marked = "property"; return cont();}
  }
  function objprop(type, value) {
    if (type == "variable" || cx.style == "keyword") {
      cx.marked = "property";
      if (value == "get" || value == "set") return cont(getterSetter);
      return cont(afterprop);
    } else if (type == "number" || type == "string") {
      cx.marked = jsonldMode ? "property" : (cx.style + " property");
      return cont(afterprop);
    } else if (type == "jsonld-keyword") {
      return cont(afterprop);
    } else if (type == "[") {
      return cont(expression, expect("]"), afterprop);
    }
  }
  function getterSetter(type) {
    if (type != "variable") return pass(afterprop);
    cx.marked = "property";
    return cont(functiondef);
  }
  function afterprop(type) {
    if (type == ":") return cont(expressionNoComma);
    if (type == "(") return pass(functiondef);
  }
  function commasep(what, end) {
    function proceed(type) {
      if (type == ",") {
        var lex = cx.state.lexical;
        if (lex.info == "call") lex.pos = (lex.pos || 0) + 1;
        return cont(what, proceed);
      }
      if (type == end) return cont();
      return cont(expect(end));
    }
    return function(type) {
      if (type == end) return cont();
      return pass(what, proceed);
    };
  }
  function contCommasep(what, end, info) {
    for (var i = 3; i < arguments.length; i++)
      cx.cc.push(arguments[i]);
    return cont(pushlex(end, info), commasep(what, end), poplex);
  }
  function block(type) {
    if (type == "}") return cont();
    return pass(statement, block);
  }
  function maybetype(type) {
    if (isTS && type == ":") return cont(typedef);
  }
  function typedef(type) {
    if (type == "variable"){cx.marked = "variable-3"; return cont();}
  }
  function vardef() {
    return pass(pattern, maybetype, maybeAssign, vardefCont);
  }
  function pattern(type, value) {
    if (type == "variable") { register(value); return cont(); }
    if (type == "[") return contCommasep(pattern, "]");
    if (type == "{") return contCommasep(proppattern, "}");
  }
  function proppattern(type, value) {
    if (type == "variable" && !cx.stream.match(/^\s*:/, false)) {
      register(value);
      return cont(maybeAssign);
    }
    if (type == "variable") cx.marked = "property";
    return cont(expect(":"), pattern, maybeAssign);
  }
  function maybeAssign(_type, value) {
    if (value == "=") return cont(expressionNoComma);
  }
  function vardefCont(type) {
    if (type == ",") return cont(vardef);
  }
  function maybeelse(type, value) {
    if (type == "keyword b" && value == "else") return cont(pushlex("form", "else"), statement, poplex);
  }
  function forspec(type) {
    if (type == "(") return cont(pushlex(")"), forspec1, expect(")"), poplex);
  }
  function forspec1(type) {
    if (type == "var") return cont(vardef, expect(";"), forspec2);
    if (type == ";") return cont(forspec2);
    if (type == "variable") return cont(formaybeinof);
    return pass(expression, expect(";"), forspec2);
  }
  function formaybeinof(_type, value) {
    if (value == "in" || value == "of") { cx.marked = "keyword"; return cont(expression); }
    return cont(maybeoperatorComma, forspec2);
  }
  function forspec2(type, value) {
    if (type == ";") return cont(forspec3);
    if (value == "in" || value == "of") { cx.marked = "keyword"; return cont(expression); }
    return pass(expression, expect(";"), forspec3);
  }
  function forspec3(type) {
    if (type != ")") cont(expression);
  }
  function functiondef(type, value) {
    if (value == "*") {cx.marked = "keyword"; return cont(functiondef);}
    if (type == "variable") {register(value); return cont(functiondef);}
    if (type == "(") return cont(pushcontext, pushlex(")"), commasep(funarg, ")"), poplex, statement, popcontext);
  }
  function funarg(type) {
    if (type == "spread") return cont(funarg);
    return pass(pattern, maybetype);
  }
  function className(type, value) {
    if (type == "variable") {register(value); return cont(classNameAfter);}
  }
  function classNameAfter(type, value) {
    if (value == "extends") return cont(expression, classNameAfter);
    if (type == "{") return cont(pushlex("}"), classBody, poplex);
  }
  function classBody(type, value) {
    if (type == "variable" || cx.style == "keyword") {
      cx.marked = "property";
      if (value == "get" || value == "set") return cont(classGetterSetter, functiondef, classBody);
      return cont(functiondef, classBody);
    }
    if (value == "*") {
      cx.marked = "keyword";
      return cont(classBody);
    }
    if (type == ";") return cont(classBody);
    if (type == "}") return cont();
  }
  function classGetterSetter(type) {
    if (type != "variable") return pass();
    cx.marked = "property";
    return cont();
  }
  function afterModule(type, value) {
    if (type == "string") return cont(statement);
    if (type == "variable") { register(value); return cont(maybeFrom); }
  }
  function afterExport(_type, value) {
    if (value == "*") { cx.marked = "keyword"; return cont(maybeFrom, expect(";")); }
    if (value == "default") { cx.marked = "keyword"; return cont(expression, expect(";")); }
    return pass(statement);
  }
  function afterImport(type) {
    if (type == "string") return cont();
    return pass(importSpec, maybeFrom);
  }
  function importSpec(type, value) {
    if (type == "{") return contCommasep(importSpec, "}");
    if (type == "variable") register(value);
    return cont();
  }
  function maybeFrom(_type, value) {
    if (value == "from") { cx.marked = "keyword"; return cont(expression); }
  }
  function arrayLiteral(type) {
    if (type == "]") return cont();
    return pass(expressionNoComma, maybeArrayComprehension);
  }
  function maybeArrayComprehension(type) {
    if (type == "for") return pass(comprehension, expect("]"));
    if (type == ",") return cont(commasep(maybeexpressionNoComma, "]"));
    return pass(commasep(expressionNoComma, "]"));
  }
  function comprehension(type) {
    if (type == "for") return cont(forspec, comprehension);
    if (type == "if") return cont(expression, comprehension);
  }

  function isContinuedStatement(state, textAfter) {
    return state.lastType == "operator" || state.lastType == "," ||
      isOperatorChar.test(textAfter.charAt(0)) ||
      /[,.]/.test(textAfter.charAt(0));
  }

  // Interface

  return {
    startState: function(basecolumn) {
      var state = {
        tokenize: tokenBase,
        lastType: "sof",
        cc: [],
        lexical: new JSLexical((basecolumn || 0) - indentUnit, 0, "block", false),
        localVars: parserConfig.localVars,
        context: parserConfig.localVars && {vars: parserConfig.localVars},
        indented: 0
      };
      if (parserConfig.globalVars && typeof parserConfig.globalVars == "object")
        state.globalVars = parserConfig.globalVars;
      return state;
    },

    token: function(stream, state) {
      if (stream.sol()) {
        if (!state.lexical.hasOwnProperty("align"))
          state.lexical.align = false;
        state.indented = stream.indentation();
        findFatArrow(stream, state);
      }
      if (state.tokenize != tokenComment && stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);
      if (type == "comment") return style;
      state.lastType = type == "operator" && (content == "++" || content == "--") ? "incdec" : type;
      return parseJS(state, style, type, content, stream);
    },

    indent: function(state, textAfter) {
      if (state.tokenize == tokenComment) return CodeMirror.Pass;
      if (state.tokenize != tokenBase) return 0;
      var firstChar = textAfter && textAfter.charAt(0), lexical = state.lexical;
      // Kludge to prevent 'maybelse' from blocking lexical scope pops
      if (!/^\s*else\b/.test(textAfter)) for (var i = state.cc.length - 1; i >= 0; --i) {
        var c = state.cc[i];
        if (c == poplex) lexical = lexical.prev;
        else if (c != maybeelse) break;
      }
      if (lexical.type == "stat" && firstChar == "}") lexical = lexical.prev;
      if (statementIndent && lexical.type == ")" && lexical.prev.type == "stat")
        lexical = lexical.prev;
      var type = lexical.type, closing = firstChar == type;

      if (type == "vardef") return lexical.indented + (state.lastType == "operator" || state.lastType == "," ? lexical.info + 1 : 0);
      else if (type == "form" && firstChar == "{") return lexical.indented;
      else if (type == "form") return lexical.indented + indentUnit;
      else if (type == "stat")
        return lexical.indented + (isContinuedStatement(state, textAfter) ? statementIndent || indentUnit : 0);
      else if (lexical.info == "switch" && !closing && parserConfig.doubleIndentSwitch != false)
        return lexical.indented + (/^(?:case|default)\b/.test(textAfter) ? indentUnit : 2 * indentUnit);
      else if (lexical.align) return lexical.column + (closing ? 0 : 1);
      else return lexical.indented + (closing ? 0 : indentUnit);
    },

    electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
    blockCommentStart: jsonMode ? null : "/*",
    blockCommentEnd: jsonMode ? null : "*/",
    lineComment: jsonMode ? null : "//",
    fold: "brace",

    helperType: jsonMode ? "json" : "javascript",
    jsonldMode: jsonldMode,
    jsonMode: jsonMode
  };
});

CodeMirror.registerHelper("wordChars", "javascript", /[\w$]/);

CodeMirror.defineMIME("text/javascript", "javascript");
CodeMirror.defineMIME("text/ecmascript", "javascript");
CodeMirror.defineMIME("application/javascript", "javascript");
CodeMirror.defineMIME("application/x-javascript", "javascript");
CodeMirror.defineMIME("application/ecmascript", "javascript");
CodeMirror.defineMIME("application/json", {name: "javascript", json: true});
CodeMirror.defineMIME("application/x-json", {name: "javascript", json: true});
CodeMirror.defineMIME("application/ld+json", {name: "javascript", jsonld: true});
CodeMirror.defineMIME("text/typescript", { name: "javascript", typescript: true });
CodeMirror.defineMIME("application/typescript", { name: "javascript", typescript: true });

});

if(typeof Math.imul == "undefined" || (Math.imul(0xffffffff,5) == 0)) {
    Math.imul = function (a, b) {
        var ah  = (a >>> 16) & 0xffff;
        var al = a & 0xffff;
        var bh  = (b >>> 16) & 0xffff;
        var bl = b & 0xffff;
        // the shift by 0 fixes the sign on the high part
        // the final |0 converts the unsigned value into a signed value
        return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    }
}

/**
 * React v0.12.2
 *
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;"undefined"!=typeof window?t=window:"undefined"!=typeof global?t=global:"undefined"!=typeof self&&(t=self),t.React=e()}}(function(){return function e(t,n,r){function o(i,s){if(!n[i]){if(!t[i]){var u="function"==typeof require&&require;if(!s&&u)return u(i,!0);if(a)return a(i,!0);var c=new Error("Cannot find module '"+i+"'");throw c.code="MODULE_NOT_FOUND",c}var l=n[i]={exports:{}};t[i][0].call(l.exports,function(e){var n=t[i][1][e];return o(n?n:e)},l,l.exports,e,t,n,r)}return n[i].exports}for(var a="function"==typeof require&&require,i=0;i<r.length;i++)o(r[i]);return o}({1:[function(e,t){"use strict";var n=e("./DOMPropertyOperations"),r=e("./EventPluginUtils"),o=e("./ReactChildren"),a=e("./ReactComponent"),i=e("./ReactCompositeComponent"),s=e("./ReactContext"),u=e("./ReactCurrentOwner"),c=e("./ReactElement"),l=(e("./ReactElementValidator"),e("./ReactDOM")),p=e("./ReactDOMComponent"),d=e("./ReactDefaultInjection"),f=e("./ReactInstanceHandles"),h=e("./ReactLegacyElement"),m=e("./ReactMount"),v=e("./ReactMultiChild"),g=e("./ReactPerf"),y=e("./ReactPropTypes"),E=e("./ReactServerRendering"),C=e("./ReactTextComponent"),R=e("./Object.assign"),M=e("./deprecated"),b=e("./onlyChild");d.inject();var O=c.createElement,D=c.createFactory;O=h.wrapCreateElement(O),D=h.wrapCreateFactory(D);var x=g.measure("React","render",m.render),P={Children:{map:o.map,forEach:o.forEach,count:o.count,only:b},DOM:l,PropTypes:y,initializeTouchEvents:function(e){r.useTouchEvents=e},createClass:i.createClass,createElement:O,createFactory:D,constructAndRenderComponent:m.constructAndRenderComponent,constructAndRenderComponentByID:m.constructAndRenderComponentByID,render:x,renderToString:E.renderToString,renderToStaticMarkup:E.renderToStaticMarkup,unmountComponentAtNode:m.unmountComponentAtNode,isValidClass:h.isValidClass,isValidElement:c.isValidElement,withContext:s.withContext,__spread:R,renderComponent:M("React","renderComponent","render",this,x),renderComponentToString:M("React","renderComponentToString","renderToString",this,E.renderToString),renderComponentToStaticMarkup:M("React","renderComponentToStaticMarkup","renderToStaticMarkup",this,E.renderToStaticMarkup),isValidComponent:M("React","isValidComponent","isValidElement",this,c.isValidElement)};"undefined"!=typeof __REACT_DEVTOOLS_GLOBAL_HOOK__&&"function"==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject&&__REACT_DEVTOOLS_GLOBAL_HOOK__.inject({Component:a,CurrentOwner:u,DOMComponent:p,DOMPropertyOperations:n,InstanceHandles:f,Mount:m,MultiChild:v,TextComponent:C});P.version="0.12.2",t.exports=P},{"./DOMPropertyOperations":12,"./EventPluginUtils":20,"./Object.assign":27,"./ReactChildren":31,"./ReactComponent":32,"./ReactCompositeComponent":34,"./ReactContext":35,"./ReactCurrentOwner":36,"./ReactDOM":37,"./ReactDOMComponent":39,"./ReactDefaultInjection":49,"./ReactElement":50,"./ReactElementValidator":51,"./ReactInstanceHandles":58,"./ReactLegacyElement":59,"./ReactMount":61,"./ReactMultiChild":62,"./ReactPerf":66,"./ReactPropTypes":70,"./ReactServerRendering":74,"./ReactTextComponent":76,"./deprecated":104,"./onlyChild":135}],2:[function(e,t){"use strict";var n=e("./focusNode"),r={componentDidMount:function(){this.props.autoFocus&&n(this.getDOMNode())}};t.exports=r},{"./focusNode":109}],3:[function(e,t){"use strict";function n(){var e=window.opera;return"object"==typeof e&&"function"==typeof e.version&&parseInt(e.version(),10)<=12}function r(e){return(e.ctrlKey||e.altKey||e.metaKey)&&!(e.ctrlKey&&e.altKey)}var o=e("./EventConstants"),a=e("./EventPropagators"),i=e("./ExecutionEnvironment"),s=e("./SyntheticInputEvent"),u=e("./keyOf"),c=i.canUseDOM&&"TextEvent"in window&&!("documentMode"in document||n()),l=32,p=String.fromCharCode(l),d=o.topLevelTypes,f={beforeInput:{phasedRegistrationNames:{bubbled:u({onBeforeInput:null}),captured:u({onBeforeInputCapture:null})},dependencies:[d.topCompositionEnd,d.topKeyPress,d.topTextInput,d.topPaste]}},h=null,m=!1,v={eventTypes:f,extractEvents:function(e,t,n,o){var i;if(c)switch(e){case d.topKeyPress:var u=o.which;if(u!==l)return;m=!0,i=p;break;case d.topTextInput:if(i=o.data,i===p&&m)return;break;default:return}else{switch(e){case d.topPaste:h=null;break;case d.topKeyPress:o.which&&!r(o)&&(h=String.fromCharCode(o.which));break;case d.topCompositionEnd:h=o.data}if(null===h)return;i=h}if(i){var v=s.getPooled(f.beforeInput,n,o);return v.data=i,h=null,a.accumulateTwoPhaseDispatches(v),v}}};t.exports=v},{"./EventConstants":16,"./EventPropagators":21,"./ExecutionEnvironment":22,"./SyntheticInputEvent":87,"./keyOf":131}],4:[function(e,t){"use strict";function n(e,t){return e+t.charAt(0).toUpperCase()+t.substring(1)}var r={columnCount:!0,flex:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,strokeOpacity:!0},o=["Webkit","ms","Moz","O"];Object.keys(r).forEach(function(e){o.forEach(function(t){r[n(t,e)]=r[e]})});var a={background:{backgroundImage:!0,backgroundPosition:!0,backgroundRepeat:!0,backgroundColor:!0},border:{borderWidth:!0,borderStyle:!0,borderColor:!0},borderBottom:{borderBottomWidth:!0,borderBottomStyle:!0,borderBottomColor:!0},borderLeft:{borderLeftWidth:!0,borderLeftStyle:!0,borderLeftColor:!0},borderRight:{borderRightWidth:!0,borderRightStyle:!0,borderRightColor:!0},borderTop:{borderTopWidth:!0,borderTopStyle:!0,borderTopColor:!0},font:{fontStyle:!0,fontVariant:!0,fontWeight:!0,fontSize:!0,lineHeight:!0,fontFamily:!0}},i={isUnitlessNumber:r,shorthandPropertyExpansions:a};t.exports=i},{}],5:[function(e,t){"use strict";var n=e("./CSSProperty"),r=e("./ExecutionEnvironment"),o=(e("./camelizeStyleName"),e("./dangerousStyleValue")),a=e("./hyphenateStyleName"),i=e("./memoizeStringOnly"),s=(e("./warning"),i(function(e){return a(e)})),u="cssFloat";r.canUseDOM&&void 0===document.documentElement.style.cssFloat&&(u="styleFloat");var c={createMarkupForStyles:function(e){var t="";for(var n in e)if(e.hasOwnProperty(n)){var r=e[n];null!=r&&(t+=s(n)+":",t+=o(n,r)+";")}return t||null},setValueForStyles:function(e,t){var r=e.style;for(var a in t)if(t.hasOwnProperty(a)){var i=o(a,t[a]);if("float"===a&&(a=u),i)r[a]=i;else{var s=n.shorthandPropertyExpansions[a];if(s)for(var c in s)r[c]="";else r[a]=""}}}};t.exports=c},{"./CSSProperty":4,"./ExecutionEnvironment":22,"./camelizeStyleName":98,"./dangerousStyleValue":103,"./hyphenateStyleName":122,"./memoizeStringOnly":133,"./warning":141}],6:[function(e,t){"use strict";function n(){this._callbacks=null,this._contexts=null}var r=e("./PooledClass"),o=e("./Object.assign"),a=e("./invariant");o(n.prototype,{enqueue:function(e,t){this._callbacks=this._callbacks||[],this._contexts=this._contexts||[],this._callbacks.push(e),this._contexts.push(t)},notifyAll:function(){var e=this._callbacks,t=this._contexts;if(e){a(e.length===t.length),this._callbacks=null,this._contexts=null;for(var n=0,r=e.length;r>n;n++)e[n].call(t[n]);e.length=0,t.length=0}},reset:function(){this._callbacks=null,this._contexts=null},destructor:function(){this.reset()}}),r.addPoolingTo(n),t.exports=n},{"./Object.assign":27,"./PooledClass":28,"./invariant":124}],7:[function(e,t){"use strict";function n(e){return"SELECT"===e.nodeName||"INPUT"===e.nodeName&&"file"===e.type}function r(e){var t=M.getPooled(P.change,w,e);E.accumulateTwoPhaseDispatches(t),R.batchedUpdates(o,t)}function o(e){y.enqueueEvents(e),y.processEventQueue()}function a(e,t){_=e,w=t,_.attachEvent("onchange",r)}function i(){_&&(_.detachEvent("onchange",r),_=null,w=null)}function s(e,t,n){return e===x.topChange?n:void 0}function u(e,t,n){e===x.topFocus?(i(),a(t,n)):e===x.topBlur&&i()}function c(e,t){_=e,w=t,T=e.value,N=Object.getOwnPropertyDescriptor(e.constructor.prototype,"value"),Object.defineProperty(_,"value",k),_.attachEvent("onpropertychange",p)}function l(){_&&(delete _.value,_.detachEvent("onpropertychange",p),_=null,w=null,T=null,N=null)}function p(e){if("value"===e.propertyName){var t=e.srcElement.value;t!==T&&(T=t,r(e))}}function d(e,t,n){return e===x.topInput?n:void 0}function f(e,t,n){e===x.topFocus?(l(),c(t,n)):e===x.topBlur&&l()}function h(e){return e!==x.topSelectionChange&&e!==x.topKeyUp&&e!==x.topKeyDown||!_||_.value===T?void 0:(T=_.value,w)}function m(e){return"INPUT"===e.nodeName&&("checkbox"===e.type||"radio"===e.type)}function v(e,t,n){return e===x.topClick?n:void 0}var g=e("./EventConstants"),y=e("./EventPluginHub"),E=e("./EventPropagators"),C=e("./ExecutionEnvironment"),R=e("./ReactUpdates"),M=e("./SyntheticEvent"),b=e("./isEventSupported"),O=e("./isTextInputElement"),D=e("./keyOf"),x=g.topLevelTypes,P={change:{phasedRegistrationNames:{bubbled:D({onChange:null}),captured:D({onChangeCapture:null})},dependencies:[x.topBlur,x.topChange,x.topClick,x.topFocus,x.topInput,x.topKeyDown,x.topKeyUp,x.topSelectionChange]}},_=null,w=null,T=null,N=null,I=!1;C.canUseDOM&&(I=b("change")&&(!("documentMode"in document)||document.documentMode>8));var S=!1;C.canUseDOM&&(S=b("input")&&(!("documentMode"in document)||document.documentMode>9));var k={get:function(){return N.get.call(this)},set:function(e){T=""+e,N.set.call(this,e)}},A={eventTypes:P,extractEvents:function(e,t,r,o){var a,i;if(n(t)?I?a=s:i=u:O(t)?S?a=d:(a=h,i=f):m(t)&&(a=v),a){var c=a(e,t,r);if(c){var l=M.getPooled(P.change,c,o);return E.accumulateTwoPhaseDispatches(l),l}}i&&i(e,t,r)}};t.exports=A},{"./EventConstants":16,"./EventPluginHub":18,"./EventPropagators":21,"./ExecutionEnvironment":22,"./ReactUpdates":77,"./SyntheticEvent":85,"./isEventSupported":125,"./isTextInputElement":127,"./keyOf":131}],8:[function(e,t){"use strict";var n=0,r={createReactRootIndex:function(){return n++}};t.exports=r},{}],9:[function(e,t){"use strict";function n(e){switch(e){case g.topCompositionStart:return E.compositionStart;case g.topCompositionEnd:return E.compositionEnd;case g.topCompositionUpdate:return E.compositionUpdate}}function r(e,t){return e===g.topKeyDown&&t.keyCode===h}function o(e,t){switch(e){case g.topKeyUp:return-1!==f.indexOf(t.keyCode);case g.topKeyDown:return t.keyCode!==h;case g.topKeyPress:case g.topMouseDown:case g.topBlur:return!0;default:return!1}}function a(e){this.root=e,this.startSelection=c.getSelection(e),this.startValue=this.getText()}var i=e("./EventConstants"),s=e("./EventPropagators"),u=e("./ExecutionEnvironment"),c=e("./ReactInputSelection"),l=e("./SyntheticCompositionEvent"),p=e("./getTextContentAccessor"),d=e("./keyOf"),f=[9,13,27,32],h=229,m=u.canUseDOM&&"CompositionEvent"in window,v=!m||"documentMode"in document&&document.documentMode>8&&document.documentMode<=11,g=i.topLevelTypes,y=null,E={compositionEnd:{phasedRegistrationNames:{bubbled:d({onCompositionEnd:null}),captured:d({onCompositionEndCapture:null})},dependencies:[g.topBlur,g.topCompositionEnd,g.topKeyDown,g.topKeyPress,g.topKeyUp,g.topMouseDown]},compositionStart:{phasedRegistrationNames:{bubbled:d({onCompositionStart:null}),captured:d({onCompositionStartCapture:null})},dependencies:[g.topBlur,g.topCompositionStart,g.topKeyDown,g.topKeyPress,g.topKeyUp,g.topMouseDown]},compositionUpdate:{phasedRegistrationNames:{bubbled:d({onCompositionUpdate:null}),captured:d({onCompositionUpdateCapture:null})},dependencies:[g.topBlur,g.topCompositionUpdate,g.topKeyDown,g.topKeyPress,g.topKeyUp,g.topMouseDown]}};a.prototype.getText=function(){return this.root.value||this.root[p()]},a.prototype.getData=function(){var e=this.getText(),t=this.startSelection.start,n=this.startValue.length-this.startSelection.end;return e.substr(t,e.length-n-t)};var C={eventTypes:E,extractEvents:function(e,t,i,u){var c,p;if(m?c=n(e):y?o(e,u)&&(c=E.compositionEnd):r(e,u)&&(c=E.compositionStart),v&&(y||c!==E.compositionStart?c===E.compositionEnd&&y&&(p=y.getData(),y=null):y=new a(t)),c){var d=l.getPooled(c,i,u);return p&&(d.data=p),s.accumulateTwoPhaseDispatches(d),d}}};t.exports=C},{"./EventConstants":16,"./EventPropagators":21,"./ExecutionEnvironment":22,"./ReactInputSelection":57,"./SyntheticCompositionEvent":83,"./getTextContentAccessor":119,"./keyOf":131}],10:[function(e,t){"use strict";function n(e,t,n){e.insertBefore(t,e.childNodes[n]||null)}var r,o=e("./Danger"),a=e("./ReactMultiChildUpdateTypes"),i=e("./getTextContentAccessor"),s=e("./invariant"),u=i();r="textContent"===u?function(e,t){e.textContent=t}:function(e,t){for(;e.firstChild;)e.removeChild(e.firstChild);if(t){var n=e.ownerDocument||document;e.appendChild(n.createTextNode(t))}};var c={dangerouslyReplaceNodeWithMarkup:o.dangerouslyReplaceNodeWithMarkup,updateTextContent:r,processUpdates:function(e,t){for(var i,u=null,c=null,l=0;i=e[l];l++)if(i.type===a.MOVE_EXISTING||i.type===a.REMOVE_NODE){var p=i.fromIndex,d=i.parentNode.childNodes[p],f=i.parentID;s(d),u=u||{},u[f]=u[f]||[],u[f][p]=d,c=c||[],c.push(d)}var h=o.dangerouslyRenderMarkup(t);if(c)for(var m=0;m<c.length;m++)c[m].parentNode.removeChild(c[m]);for(var v=0;i=e[v];v++)switch(i.type){case a.INSERT_MARKUP:n(i.parentNode,h[i.markupIndex],i.toIndex);break;case a.MOVE_EXISTING:n(i.parentNode,u[i.parentID][i.fromIndex],i.toIndex);break;case a.TEXT_CONTENT:r(i.parentNode,i.textContent);break;case a.REMOVE_NODE:}}};t.exports=c},{"./Danger":13,"./ReactMultiChildUpdateTypes":63,"./getTextContentAccessor":119,"./invariant":124}],11:[function(e,t){"use strict";function n(e,t){return(e&t)===t}var r=e("./invariant"),o={MUST_USE_ATTRIBUTE:1,MUST_USE_PROPERTY:2,HAS_SIDE_EFFECTS:4,HAS_BOOLEAN_VALUE:8,HAS_NUMERIC_VALUE:16,HAS_POSITIVE_NUMERIC_VALUE:48,HAS_OVERLOADED_BOOLEAN_VALUE:64,injectDOMPropertyConfig:function(e){var t=e.Properties||{},a=e.DOMAttributeNames||{},s=e.DOMPropertyNames||{},u=e.DOMMutationMethods||{};e.isCustomAttribute&&i._isCustomAttributeFunctions.push(e.isCustomAttribute);for(var c in t){r(!i.isStandardName.hasOwnProperty(c)),i.isStandardName[c]=!0;var l=c.toLowerCase();if(i.getPossibleStandardName[l]=c,a.hasOwnProperty(c)){var p=a[c];i.getPossibleStandardName[p]=c,i.getAttributeName[c]=p}else i.getAttributeName[c]=l;i.getPropertyName[c]=s.hasOwnProperty(c)?s[c]:c,i.getMutationMethod[c]=u.hasOwnProperty(c)?u[c]:null;var d=t[c];i.mustUseAttribute[c]=n(d,o.MUST_USE_ATTRIBUTE),i.mustUseProperty[c]=n(d,o.MUST_USE_PROPERTY),i.hasSideEffects[c]=n(d,o.HAS_SIDE_EFFECTS),i.hasBooleanValue[c]=n(d,o.HAS_BOOLEAN_VALUE),i.hasNumericValue[c]=n(d,o.HAS_NUMERIC_VALUE),i.hasPositiveNumericValue[c]=n(d,o.HAS_POSITIVE_NUMERIC_VALUE),i.hasOverloadedBooleanValue[c]=n(d,o.HAS_OVERLOADED_BOOLEAN_VALUE),r(!i.mustUseAttribute[c]||!i.mustUseProperty[c]),r(i.mustUseProperty[c]||!i.hasSideEffects[c]),r(!!i.hasBooleanValue[c]+!!i.hasNumericValue[c]+!!i.hasOverloadedBooleanValue[c]<=1)}}},a={},i={ID_ATTRIBUTE_NAME:"data-reactid",isStandardName:{},getPossibleStandardName:{},getAttributeName:{},getPropertyName:{},getMutationMethod:{},mustUseAttribute:{},mustUseProperty:{},hasSideEffects:{},hasBooleanValue:{},hasNumericValue:{},hasPositiveNumericValue:{},hasOverloadedBooleanValue:{},_isCustomAttributeFunctions:[],isCustomAttribute:function(e){for(var t=0;t<i._isCustomAttributeFunctions.length;t++){var n=i._isCustomAttributeFunctions[t];if(n(e))return!0}return!1},getDefaultValueForProperty:function(e,t){var n,r=a[e];return r||(a[e]=r={}),t in r||(n=document.createElement(e),r[t]=n[t]),r[t]},injection:o};t.exports=i},{"./invariant":124}],12:[function(e,t){"use strict";function n(e,t){return null==t||r.hasBooleanValue[e]&&!t||r.hasNumericValue[e]&&isNaN(t)||r.hasPositiveNumericValue[e]&&1>t||r.hasOverloadedBooleanValue[e]&&t===!1}var r=e("./DOMProperty"),o=e("./escapeTextForBrowser"),a=e("./memoizeStringOnly"),i=(e("./warning"),a(function(e){return o(e)+'="'})),s={createMarkupForID:function(e){return i(r.ID_ATTRIBUTE_NAME)+o(e)+'"'},createMarkupForProperty:function(e,t){if(r.isStandardName.hasOwnProperty(e)&&r.isStandardName[e]){if(n(e,t))return"";var a=r.getAttributeName[e];return r.hasBooleanValue[e]||r.hasOverloadedBooleanValue[e]&&t===!0?o(a):i(a)+o(t)+'"'}return r.isCustomAttribute(e)?null==t?"":i(e)+o(t)+'"':null},setValueForProperty:function(e,t,o){if(r.isStandardName.hasOwnProperty(t)&&r.isStandardName[t]){var a=r.getMutationMethod[t];if(a)a(e,o);else if(n(t,o))this.deleteValueForProperty(e,t);else if(r.mustUseAttribute[t])e.setAttribute(r.getAttributeName[t],""+o);else{var i=r.getPropertyName[t];r.hasSideEffects[t]&&""+e[i]==""+o||(e[i]=o)}}else r.isCustomAttribute(t)&&(null==o?e.removeAttribute(t):e.setAttribute(t,""+o))},deleteValueForProperty:function(e,t){if(r.isStandardName.hasOwnProperty(t)&&r.isStandardName[t]){var n=r.getMutationMethod[t];if(n)n(e,void 0);else if(r.mustUseAttribute[t])e.removeAttribute(r.getAttributeName[t]);else{var o=r.getPropertyName[t],a=r.getDefaultValueForProperty(e.nodeName,o);r.hasSideEffects[t]&&""+e[o]===a||(e[o]=a)}}else r.isCustomAttribute(t)&&e.removeAttribute(t)}};t.exports=s},{"./DOMProperty":11,"./escapeTextForBrowser":107,"./memoizeStringOnly":133,"./warning":141}],13:[function(e,t){"use strict";function n(e){return e.substring(1,e.indexOf(" "))}var r=e("./ExecutionEnvironment"),o=e("./createNodesFromMarkup"),a=e("./emptyFunction"),i=e("./getMarkupWrap"),s=e("./invariant"),u=/^(<[^ \/>]+)/,c="data-danger-index",l={dangerouslyRenderMarkup:function(e){s(r.canUseDOM);for(var t,l={},p=0;p<e.length;p++)s(e[p]),t=n(e[p]),t=i(t)?t:"*",l[t]=l[t]||[],l[t][p]=e[p];var d=[],f=0;for(t in l)if(l.hasOwnProperty(t)){var h=l[t];for(var m in h)if(h.hasOwnProperty(m)){var v=h[m];h[m]=v.replace(u,"$1 "+c+'="'+m+'" ')}var g=o(h.join(""),a);for(p=0;p<g.length;++p){var y=g[p];y.hasAttribute&&y.hasAttribute(c)&&(m=+y.getAttribute(c),y.removeAttribute(c),s(!d.hasOwnProperty(m)),d[m]=y,f+=1)}}return s(f===d.length),s(d.length===e.length),d},dangerouslyReplaceNodeWithMarkup:function(e,t){s(r.canUseDOM),s(t),s("html"!==e.tagName.toLowerCase());var n=o(t,a)[0];e.parentNode.replaceChild(n,e)}};t.exports=l},{"./ExecutionEnvironment":22,"./createNodesFromMarkup":102,"./emptyFunction":105,"./getMarkupWrap":116,"./invariant":124}],14:[function(e,t){"use strict";var n=e("./keyOf"),r=[n({ResponderEventPlugin:null}),n({SimpleEventPlugin:null}),n({TapEventPlugin:null}),n({EnterLeaveEventPlugin:null}),n({ChangeEventPlugin:null}),n({SelectEventPlugin:null}),n({CompositionEventPlugin:null}),n({BeforeInputEventPlugin:null}),n({AnalyticsEventPlugin:null}),n({MobileSafariClickEventPlugin:null})];t.exports=r},{"./keyOf":131}],15:[function(e,t){"use strict";var n=e("./EventConstants"),r=e("./EventPropagators"),o=e("./SyntheticMouseEvent"),a=e("./ReactMount"),i=e("./keyOf"),s=n.topLevelTypes,u=a.getFirstReactDOM,c={mouseEnter:{registrationName:i({onMouseEnter:null}),dependencies:[s.topMouseOut,s.topMouseOver]},mouseLeave:{registrationName:i({onMouseLeave:null}),dependencies:[s.topMouseOut,s.topMouseOver]}},l=[null,null],p={eventTypes:c,extractEvents:function(e,t,n,i){if(e===s.topMouseOver&&(i.relatedTarget||i.fromElement))return null;if(e!==s.topMouseOut&&e!==s.topMouseOver)return null;var p;if(t.window===t)p=t;else{var d=t.ownerDocument;p=d?d.defaultView||d.parentWindow:window}var f,h;if(e===s.topMouseOut?(f=t,h=u(i.relatedTarget||i.toElement)||p):(f=p,h=t),f===h)return null;var m=f?a.getID(f):"",v=h?a.getID(h):"",g=o.getPooled(c.mouseLeave,m,i);g.type="mouseleave",g.target=f,g.relatedTarget=h;var y=o.getPooled(c.mouseEnter,v,i);return y.type="mouseenter",y.target=h,y.relatedTarget=f,r.accumulateEnterLeaveDispatches(g,y,m,v),l[0]=g,l[1]=y,l}};t.exports=p},{"./EventConstants":16,"./EventPropagators":21,"./ReactMount":61,"./SyntheticMouseEvent":89,"./keyOf":131}],16:[function(e,t){"use strict";var n=e("./keyMirror"),r=n({bubbled:null,captured:null}),o=n({topBlur:null,topChange:null,topClick:null,topCompositionEnd:null,topCompositionStart:null,topCompositionUpdate:null,topContextMenu:null,topCopy:null,topCut:null,topDoubleClick:null,topDrag:null,topDragEnd:null,topDragEnter:null,topDragExit:null,topDragLeave:null,topDragOver:null,topDragStart:null,topDrop:null,topError:null,topFocus:null,topInput:null,topKeyDown:null,topKeyPress:null,topKeyUp:null,topLoad:null,topMouseDown:null,topMouseMove:null,topMouseOut:null,topMouseOver:null,topMouseUp:null,topPaste:null,topReset:null,topScroll:null,topSelectionChange:null,topSubmit:null,topTextInput:null,topTouchCancel:null,topTouchEnd:null,topTouchMove:null,topTouchStart:null,topWheel:null}),a={topLevelTypes:o,PropagationPhases:r};t.exports=a},{"./keyMirror":130}],17:[function(e,t){var n=e("./emptyFunction"),r={listen:function(e,t,n){return e.addEventListener?(e.addEventListener(t,n,!1),{remove:function(){e.removeEventListener(t,n,!1)}}):e.attachEvent?(e.attachEvent("on"+t,n),{remove:function(){e.detachEvent("on"+t,n)}}):void 0},capture:function(e,t,r){return e.addEventListener?(e.addEventListener(t,r,!0),{remove:function(){e.removeEventListener(t,r,!0)}}):{remove:n}},registerDefault:function(){}};t.exports=r},{"./emptyFunction":105}],18:[function(e,t){"use strict";var n=e("./EventPluginRegistry"),r=e("./EventPluginUtils"),o=e("./accumulateInto"),a=e("./forEachAccumulated"),i=e("./invariant"),s={},u=null,c=function(e){if(e){var t=r.executeDispatch,o=n.getPluginModuleForEvent(e);o&&o.executeDispatch&&(t=o.executeDispatch),r.executeDispatchesInOrder(e,t),e.isPersistent()||e.constructor.release(e)}},l=null,p={injection:{injectMount:r.injection.injectMount,injectInstanceHandle:function(e){l=e},getInstanceHandle:function(){return l},injectEventPluginOrder:n.injectEventPluginOrder,injectEventPluginsByName:n.injectEventPluginsByName},eventNameDispatchConfigs:n.eventNameDispatchConfigs,registrationNameModules:n.registrationNameModules,putListener:function(e,t,n){i(!n||"function"==typeof n);var r=s[t]||(s[t]={});r[e]=n},getListener:function(e,t){var n=s[t];return n&&n[e]},deleteListener:function(e,t){var n=s[t];n&&delete n[e]},deleteAllListeners:function(e){for(var t in s)delete s[t][e]},extractEvents:function(e,t,r,a){for(var i,s=n.plugins,u=0,c=s.length;c>u;u++){var l=s[u];if(l){var p=l.extractEvents(e,t,r,a);p&&(i=o(i,p))}}return i},enqueueEvents:function(e){e&&(u=o(u,e))},processEventQueue:function(){var e=u;u=null,a(e,c),i(!u)},__purge:function(){s={}},__getListenerBank:function(){return s}};t.exports=p},{"./EventPluginRegistry":19,"./EventPluginUtils":20,"./accumulateInto":95,"./forEachAccumulated":110,"./invariant":124}],19:[function(e,t){"use strict";function n(){if(i)for(var e in s){var t=s[e],n=i.indexOf(e);if(a(n>-1),!u.plugins[n]){a(t.extractEvents),u.plugins[n]=t;var o=t.eventTypes;for(var c in o)a(r(o[c],t,c))}}}function r(e,t,n){a(!u.eventNameDispatchConfigs.hasOwnProperty(n)),u.eventNameDispatchConfigs[n]=e;var r=e.phasedRegistrationNames;if(r){for(var i in r)if(r.hasOwnProperty(i)){var s=r[i];o(s,t,n)}return!0}return e.registrationName?(o(e.registrationName,t,n),!0):!1}function o(e,t,n){a(!u.registrationNameModules[e]),u.registrationNameModules[e]=t,u.registrationNameDependencies[e]=t.eventTypes[n].dependencies}var a=e("./invariant"),i=null,s={},u={plugins:[],eventNameDispatchConfigs:{},registrationNameModules:{},registrationNameDependencies:{},injectEventPluginOrder:function(e){a(!i),i=Array.prototype.slice.call(e),n()},injectEventPluginsByName:function(e){var t=!1;for(var r in e)if(e.hasOwnProperty(r)){var o=e[r];s.hasOwnProperty(r)&&s[r]===o||(a(!s[r]),s[r]=o,t=!0)}t&&n()},getPluginModuleForEvent:function(e){var t=e.dispatchConfig;if(t.registrationName)return u.registrationNameModules[t.registrationName]||null;for(var n in t.phasedRegistrationNames)if(t.phasedRegistrationNames.hasOwnProperty(n)){var r=u.registrationNameModules[t.phasedRegistrationNames[n]];if(r)return r}return null},_resetEventPlugins:function(){i=null;for(var e in s)s.hasOwnProperty(e)&&delete s[e];u.plugins.length=0;var t=u.eventNameDispatchConfigs;for(var n in t)t.hasOwnProperty(n)&&delete t[n];var r=u.registrationNameModules;for(var o in r)r.hasOwnProperty(o)&&delete r[o]}};t.exports=u},{"./invariant":124}],20:[function(e,t){"use strict";function n(e){return e===m.topMouseUp||e===m.topTouchEnd||e===m.topTouchCancel}function r(e){return e===m.topMouseMove||e===m.topTouchMove}function o(e){return e===m.topMouseDown||e===m.topTouchStart}function a(e,t){var n=e._dispatchListeners,r=e._dispatchIDs;if(Array.isArray(n))for(var o=0;o<n.length&&!e.isPropagationStopped();o++)t(e,n[o],r[o]);else n&&t(e,n,r)}function i(e,t,n){e.currentTarget=h.Mount.getNode(n);var r=t(e,n);return e.currentTarget=null,r}function s(e,t){a(e,t),e._dispatchListeners=null,e._dispatchIDs=null}function u(e){var t=e._dispatchListeners,n=e._dispatchIDs;if(Array.isArray(t)){for(var r=0;r<t.length&&!e.isPropagationStopped();r++)if(t[r](e,n[r]))return n[r]}else if(t&&t(e,n))return n;return null}function c(e){var t=u(e);return e._dispatchIDs=null,e._dispatchListeners=null,t}function l(e){var t=e._dispatchListeners,n=e._dispatchIDs;f(!Array.isArray(t));var r=t?t(e,n):null;return e._dispatchListeners=null,e._dispatchIDs=null,r}function p(e){return!!e._dispatchListeners}var d=e("./EventConstants"),f=e("./invariant"),h={Mount:null,injectMount:function(e){h.Mount=e}},m=d.topLevelTypes,v={isEndish:n,isMoveish:r,isStartish:o,executeDirectDispatch:l,executeDispatch:i,executeDispatchesInOrder:s,executeDispatchesInOrderStopAtTrue:c,hasDispatches:p,injection:h,useTouchEvents:!1};t.exports=v},{"./EventConstants":16,"./invariant":124}],21:[function(e,t){"use strict";function n(e,t,n){var r=t.dispatchConfig.phasedRegistrationNames[n];return m(e,r)}function r(e,t,r){var o=t?h.bubbled:h.captured,a=n(e,r,o);a&&(r._dispatchListeners=d(r._dispatchListeners,a),r._dispatchIDs=d(r._dispatchIDs,e))}function o(e){e&&e.dispatchConfig.phasedRegistrationNames&&p.injection.getInstanceHandle().traverseTwoPhase(e.dispatchMarker,r,e)}function a(e,t,n){if(n&&n.dispatchConfig.registrationName){var r=n.dispatchConfig.registrationName,o=m(e,r);o&&(n._dispatchListeners=d(n._dispatchListeners,o),n._dispatchIDs=d(n._dispatchIDs,e))}}function i(e){e&&e.dispatchConfig.registrationName&&a(e.dispatchMarker,null,e)}function s(e){f(e,o)}function u(e,t,n,r){p.injection.getInstanceHandle().traverseEnterLeave(n,r,a,e,t)}function c(e){f(e,i)}var l=e("./EventConstants"),p=e("./EventPluginHub"),d=e("./accumulateInto"),f=e("./forEachAccumulated"),h=l.PropagationPhases,m=p.getListener,v={accumulateTwoPhaseDispatches:s,accumulateDirectDispatches:c,accumulateEnterLeaveDispatches:u};t.exports=v},{"./EventConstants":16,"./EventPluginHub":18,"./accumulateInto":95,"./forEachAccumulated":110}],22:[function(e,t){"use strict";var n=!("undefined"==typeof window||!window.document||!window.document.createElement),r={canUseDOM:n,canUseWorkers:"undefined"!=typeof Worker,canUseEventListeners:n&&!(!window.addEventListener&&!window.attachEvent),canUseViewport:n&&!!window.screen,isInWorker:!n};t.exports=r},{}],23:[function(e,t){"use strict";var n,r=e("./DOMProperty"),o=e("./ExecutionEnvironment"),a=r.injection.MUST_USE_ATTRIBUTE,i=r.injection.MUST_USE_PROPERTY,s=r.injection.HAS_BOOLEAN_VALUE,u=r.injection.HAS_SIDE_EFFECTS,c=r.injection.HAS_NUMERIC_VALUE,l=r.injection.HAS_POSITIVE_NUMERIC_VALUE,p=r.injection.HAS_OVERLOADED_BOOLEAN_VALUE;if(o.canUseDOM){var d=document.implementation;n=d&&d.hasFeature&&d.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")}var f={isCustomAttribute:RegExp.prototype.test.bind(/^(data|aria)-[a-z_][a-z\d_.\-]*$/),Properties:{accept:null,acceptCharset:null,accessKey:null,action:null,allowFullScreen:a|s,allowTransparency:a,alt:null,async:s,autoComplete:null,autoPlay:s,cellPadding:null,cellSpacing:null,charSet:a,checked:i|s,classID:a,className:n?a:i,cols:a|l,colSpan:null,content:null,contentEditable:null,contextMenu:a,controls:i|s,coords:null,crossOrigin:null,data:null,dateTime:a,defer:s,dir:null,disabled:a|s,download:p,draggable:null,encType:null,form:a,formAction:a,formEncType:a,formMethod:a,formNoValidate:s,formTarget:a,frameBorder:a,height:a,hidden:a|s,href:null,hrefLang:null,htmlFor:null,httpEquiv:null,icon:null,id:i,label:null,lang:null,list:a,loop:i|s,manifest:a,marginHeight:null,marginWidth:null,max:null,maxLength:a,media:a,mediaGroup:null,method:null,min:null,multiple:i|s,muted:i|s,name:null,noValidate:s,open:null,pattern:null,placeholder:null,poster:null,preload:null,radioGroup:null,readOnly:i|s,rel:null,required:s,role:a,rows:a|l,rowSpan:null,sandbox:null,scope:null,scrolling:null,seamless:a|s,selected:i|s,shape:null,size:a|l,sizes:a,span:l,spellCheck:null,src:null,srcDoc:i,srcSet:a,start:c,step:null,style:null,tabIndex:null,target:null,title:null,type:null,useMap:null,value:i|u,width:a,wmode:a,autoCapitalize:null,autoCorrect:null,itemProp:a,itemScope:a|s,itemType:a,property:null},DOMAttributeNames:{acceptCharset:"accept-charset",className:"class",htmlFor:"for",httpEquiv:"http-equiv"},DOMPropertyNames:{autoCapitalize:"autocapitalize",autoComplete:"autocomplete",autoCorrect:"autocorrect",autoFocus:"autofocus",autoPlay:"autoplay",encType:"enctype",hrefLang:"hreflang",radioGroup:"radiogroup",spellCheck:"spellcheck",srcDoc:"srcdoc",srcSet:"srcset"}};t.exports=f},{"./DOMProperty":11,"./ExecutionEnvironment":22}],24:[function(e,t){"use strict";function n(e){u(null==e.props.checkedLink||null==e.props.valueLink)}function r(e){n(e),u(null==e.props.value&&null==e.props.onChange)}function o(e){n(e),u(null==e.props.checked&&null==e.props.onChange)}function a(e){this.props.valueLink.requestChange(e.target.value)}function i(e){this.props.checkedLink.requestChange(e.target.checked)}var s=e("./ReactPropTypes"),u=e("./invariant"),c={button:!0,checkbox:!0,image:!0,hidden:!0,radio:!0,reset:!0,submit:!0},l={Mixin:{propTypes:{value:function(e,t){return!e[t]||c[e.type]||e.onChange||e.readOnly||e.disabled?void 0:new Error("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.")},checked:function(e,t){return!e[t]||e.onChange||e.readOnly||e.disabled?void 0:new Error("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.")},onChange:s.func}},getValue:function(e){return e.props.valueLink?(r(e),e.props.valueLink.value):e.props.value},getChecked:function(e){return e.props.checkedLink?(o(e),e.props.checkedLink.value):e.props.checked},getOnChange:function(e){return e.props.valueLink?(r(e),a):e.props.checkedLink?(o(e),i):e.props.onChange}};t.exports=l},{"./ReactPropTypes":70,"./invariant":124}],25:[function(e,t){"use strict";function n(e){e.remove()}var r=e("./ReactBrowserEventEmitter"),o=e("./accumulateInto"),a=e("./forEachAccumulated"),i=e("./invariant"),s={trapBubbledEvent:function(e,t){i(this.isMounted());var n=r.trapBubbledEvent(e,t,this.getDOMNode());this._localEventListeners=o(this._localEventListeners,n)},componentWillUnmount:function(){this._localEventListeners&&a(this._localEventListeners,n)}};t.exports=s},{"./ReactBrowserEventEmitter":30,"./accumulateInto":95,"./forEachAccumulated":110,"./invariant":124}],26:[function(e,t){"use strict";var n=e("./EventConstants"),r=e("./emptyFunction"),o=n.topLevelTypes,a={eventTypes:null,extractEvents:function(e,t,n,a){if(e===o.topTouchStart){var i=a.target;i&&!i.onclick&&(i.onclick=r)}}};t.exports=a},{"./EventConstants":16,"./emptyFunction":105}],27:[function(e,t){function n(e){if(null==e)throw new TypeError("Object.assign target cannot be null or undefined");for(var t=Object(e),n=Object.prototype.hasOwnProperty,r=1;r<arguments.length;r++){var o=arguments[r];if(null!=o){var a=Object(o);for(var i in a)n.call(a,i)&&(t[i]=a[i])}}return t}t.exports=n},{}],28:[function(e,t){"use strict";var n=e("./invariant"),r=function(e){var t=this;if(t.instancePool.length){var n=t.instancePool.pop();return t.call(n,e),n}return new t(e)},o=function(e,t){var n=this;if(n.instancePool.length){var r=n.instancePool.pop();return n.call(r,e,t),r}return new n(e,t)},a=function(e,t,n){var r=this;
if(r.instancePool.length){var o=r.instancePool.pop();return r.call(o,e,t,n),o}return new r(e,t,n)},i=function(e,t,n,r,o){var a=this;if(a.instancePool.length){var i=a.instancePool.pop();return a.call(i,e,t,n,r,o),i}return new a(e,t,n,r,o)},s=function(e){var t=this;n(e instanceof t),e.destructor&&e.destructor(),t.instancePool.length<t.poolSize&&t.instancePool.push(e)},u=10,c=r,l=function(e,t){var n=e;return n.instancePool=[],n.getPooled=t||c,n.poolSize||(n.poolSize=u),n.release=s,n},p={addPoolingTo:l,oneArgumentPooler:r,twoArgumentPooler:o,threeArgumentPooler:a,fiveArgumentPooler:i};t.exports=p},{"./invariant":124}],29:[function(e,t){"use strict";var n=e("./ReactEmptyComponent"),r=e("./ReactMount"),o=e("./invariant"),a={getDOMNode:function(){return o(this.isMounted()),n.isNullComponentID(this._rootNodeID)?null:r.getNode(this._rootNodeID)}};t.exports=a},{"./ReactEmptyComponent":52,"./ReactMount":61,"./invariant":124}],30:[function(e,t){"use strict";function n(e){return Object.prototype.hasOwnProperty.call(e,h)||(e[h]=d++,l[e[h]]={}),l[e[h]]}var r=e("./EventConstants"),o=e("./EventPluginHub"),a=e("./EventPluginRegistry"),i=e("./ReactEventEmitterMixin"),s=e("./ViewportMetrics"),u=e("./Object.assign"),c=e("./isEventSupported"),l={},p=!1,d=0,f={topBlur:"blur",topChange:"change",topClick:"click",topCompositionEnd:"compositionend",topCompositionStart:"compositionstart",topCompositionUpdate:"compositionupdate",topContextMenu:"contextmenu",topCopy:"copy",topCut:"cut",topDoubleClick:"dblclick",topDrag:"drag",topDragEnd:"dragend",topDragEnter:"dragenter",topDragExit:"dragexit",topDragLeave:"dragleave",topDragOver:"dragover",topDragStart:"dragstart",topDrop:"drop",topFocus:"focus",topInput:"input",topKeyDown:"keydown",topKeyPress:"keypress",topKeyUp:"keyup",topMouseDown:"mousedown",topMouseMove:"mousemove",topMouseOut:"mouseout",topMouseOver:"mouseover",topMouseUp:"mouseup",topPaste:"paste",topScroll:"scroll",topSelectionChange:"selectionchange",topTextInput:"textInput",topTouchCancel:"touchcancel",topTouchEnd:"touchend",topTouchMove:"touchmove",topTouchStart:"touchstart",topWheel:"wheel"},h="_reactListenersID"+String(Math.random()).slice(2),m=u({},i,{ReactEventListener:null,injection:{injectReactEventListener:function(e){e.setHandleTopLevel(m.handleTopLevel),m.ReactEventListener=e}},setEnabled:function(e){m.ReactEventListener&&m.ReactEventListener.setEnabled(e)},isEnabled:function(){return!(!m.ReactEventListener||!m.ReactEventListener.isEnabled())},listenTo:function(e,t){for(var o=t,i=n(o),s=a.registrationNameDependencies[e],u=r.topLevelTypes,l=0,p=s.length;p>l;l++){var d=s[l];i.hasOwnProperty(d)&&i[d]||(d===u.topWheel?c("wheel")?m.ReactEventListener.trapBubbledEvent(u.topWheel,"wheel",o):c("mousewheel")?m.ReactEventListener.trapBubbledEvent(u.topWheel,"mousewheel",o):m.ReactEventListener.trapBubbledEvent(u.topWheel,"DOMMouseScroll",o):d===u.topScroll?c("scroll",!0)?m.ReactEventListener.trapCapturedEvent(u.topScroll,"scroll",o):m.ReactEventListener.trapBubbledEvent(u.topScroll,"scroll",m.ReactEventListener.WINDOW_HANDLE):d===u.topFocus||d===u.topBlur?(c("focus",!0)?(m.ReactEventListener.trapCapturedEvent(u.topFocus,"focus",o),m.ReactEventListener.trapCapturedEvent(u.topBlur,"blur",o)):c("focusin")&&(m.ReactEventListener.trapBubbledEvent(u.topFocus,"focusin",o),m.ReactEventListener.trapBubbledEvent(u.topBlur,"focusout",o)),i[u.topBlur]=!0,i[u.topFocus]=!0):f.hasOwnProperty(d)&&m.ReactEventListener.trapBubbledEvent(d,f[d],o),i[d]=!0)}},trapBubbledEvent:function(e,t,n){return m.ReactEventListener.trapBubbledEvent(e,t,n)},trapCapturedEvent:function(e,t,n){return m.ReactEventListener.trapCapturedEvent(e,t,n)},ensureScrollValueMonitoring:function(){if(!p){var e=s.refreshScrollValues;m.ReactEventListener.monitorScrollValue(e),p=!0}},eventNameDispatchConfigs:o.eventNameDispatchConfigs,registrationNameModules:o.registrationNameModules,putListener:o.putListener,getListener:o.getListener,deleteListener:o.deleteListener,deleteAllListeners:o.deleteAllListeners});t.exports=m},{"./EventConstants":16,"./EventPluginHub":18,"./EventPluginRegistry":19,"./Object.assign":27,"./ReactEventEmitterMixin":54,"./ViewportMetrics":94,"./isEventSupported":125}],31:[function(e,t){"use strict";function n(e,t){this.forEachFunction=e,this.forEachContext=t}function r(e,t,n,r){var o=e;o.forEachFunction.call(o.forEachContext,t,r)}function o(e,t,o){if(null==e)return e;var a=n.getPooled(t,o);p(e,r,a),n.release(a)}function a(e,t,n){this.mapResult=e,this.mapFunction=t,this.mapContext=n}function i(e,t,n,r){var o=e,a=o.mapResult,i=!a.hasOwnProperty(n);if(i){var s=o.mapFunction.call(o.mapContext,t,r);a[n]=s}}function s(e,t,n){if(null==e)return e;var r={},o=a.getPooled(r,t,n);return p(e,i,o),a.release(o),r}function u(){return null}function c(e){return p(e,u,null)}var l=e("./PooledClass"),p=e("./traverseAllChildren"),d=(e("./warning"),l.twoArgumentPooler),f=l.threeArgumentPooler;l.addPoolingTo(n,d),l.addPoolingTo(a,f);var h={forEach:o,map:s,count:c};t.exports=h},{"./PooledClass":28,"./traverseAllChildren":140,"./warning":141}],32:[function(e,t){"use strict";var n=e("./ReactElement"),r=e("./ReactOwner"),o=e("./ReactUpdates"),a=e("./Object.assign"),i=e("./invariant"),s=e("./keyMirror"),u=s({MOUNTED:null,UNMOUNTED:null}),c=!1,l=null,p=null,d={injection:{injectEnvironment:function(e){i(!c),p=e.mountImageIntoNode,l=e.unmountIDFromEnvironment,d.BackendIDOperations=e.BackendIDOperations,c=!0}},LifeCycle:u,BackendIDOperations:null,Mixin:{isMounted:function(){return this._lifeCycleState===u.MOUNTED},setProps:function(e,t){var n=this._pendingElement||this._currentElement;this.replaceProps(a({},n.props,e),t)},replaceProps:function(e,t){i(this.isMounted()),i(0===this._mountDepth),this._pendingElement=n.cloneAndReplaceProps(this._pendingElement||this._currentElement,e),o.enqueueUpdate(this,t)},_setPropsInternal:function(e,t){var r=this._pendingElement||this._currentElement;this._pendingElement=n.cloneAndReplaceProps(r,a({},r.props,e)),o.enqueueUpdate(this,t)},construct:function(e){this.props=e.props,this._owner=e._owner,this._lifeCycleState=u.UNMOUNTED,this._pendingCallbacks=null,this._currentElement=e,this._pendingElement=null},mountComponent:function(e,t,n){i(!this.isMounted());var o=this._currentElement.ref;if(null!=o){var a=this._currentElement._owner;r.addComponentAsRefTo(this,o,a)}this._rootNodeID=e,this._lifeCycleState=u.MOUNTED,this._mountDepth=n},unmountComponent:function(){i(this.isMounted());var e=this._currentElement.ref;null!=e&&r.removeComponentAsRefFrom(this,e,this._owner),l(this._rootNodeID),this._rootNodeID=null,this._lifeCycleState=u.UNMOUNTED},receiveComponent:function(e,t){i(this.isMounted()),this._pendingElement=e,this.performUpdateIfNecessary(t)},performUpdateIfNecessary:function(e){if(null!=this._pendingElement){var t=this._currentElement,n=this._pendingElement;this._currentElement=n,this.props=n.props,this._owner=n._owner,this._pendingElement=null,this.updateComponent(e,t)}},updateComponent:function(e,t){var n=this._currentElement;(n._owner!==t._owner||n.ref!==t.ref)&&(null!=t.ref&&r.removeComponentAsRefFrom(this,t.ref,t._owner),null!=n.ref&&r.addComponentAsRefTo(this,n.ref,n._owner))},mountComponentIntoNode:function(e,t,n){var r=o.ReactReconcileTransaction.getPooled();r.perform(this._mountComponentIntoNode,this,e,t,r,n),o.ReactReconcileTransaction.release(r)},_mountComponentIntoNode:function(e,t,n,r){var o=this.mountComponent(e,n,0);p(o,t,r)},isOwnedBy:function(e){return this._owner===e},getSiblingByRef:function(e){var t=this._owner;return t&&t.refs?t.refs[e]:null}}};t.exports=d},{"./Object.assign":27,"./ReactElement":50,"./ReactOwner":65,"./ReactUpdates":77,"./invariant":124,"./keyMirror":130}],33:[function(e,t){"use strict";var n=e("./ReactDOMIDOperations"),r=e("./ReactMarkupChecksum"),o=e("./ReactMount"),a=e("./ReactPerf"),i=e("./ReactReconcileTransaction"),s=e("./getReactRootElementInContainer"),u=e("./invariant"),c=e("./setInnerHTML"),l=1,p=9,d={ReactReconcileTransaction:i,BackendIDOperations:n,unmountIDFromEnvironment:function(e){o.purgeID(e)},mountImageIntoNode:a.measure("ReactComponentBrowserEnvironment","mountImageIntoNode",function(e,t,n){if(u(t&&(t.nodeType===l||t.nodeType===p)),n){if(r.canReuseMarkup(e,s(t)))return;u(t.nodeType!==p)}u(t.nodeType!==p),c(t,e)})};t.exports=d},{"./ReactDOMIDOperations":41,"./ReactMarkupChecksum":60,"./ReactMount":61,"./ReactPerf":66,"./ReactReconcileTransaction":72,"./getReactRootElementInContainer":118,"./invariant":124,"./setInnerHTML":136}],34:[function(e,t){"use strict";function n(e){var t=e._owner||null;return t&&t.constructor&&t.constructor.displayName?" Check the render method of `"+t.constructor.displayName+"`.":""}function r(e,t){for(var n in t)t.hasOwnProperty(n)&&D("function"==typeof t[n])}function o(e,t){var n=S.hasOwnProperty(t)?S[t]:null;L.hasOwnProperty(t)&&D(n===N.OVERRIDE_BASE),e.hasOwnProperty(t)&&D(n===N.DEFINE_MANY||n===N.DEFINE_MANY_MERGED)}function a(e){var t=e._compositeLifeCycleState;D(e.isMounted()||t===A.MOUNTING),D(null==f.current),D(t!==A.UNMOUNTING)}function i(e,t){if(t){D(!g.isValidFactory(t)),D(!h.isValidElement(t));var n=e.prototype;t.hasOwnProperty(T)&&k.mixins(e,t.mixins);for(var r in t)if(t.hasOwnProperty(r)&&r!==T){var a=t[r];if(o(n,r),k.hasOwnProperty(r))k[r](e,a);else{var i=S.hasOwnProperty(r),s=n.hasOwnProperty(r),u=a&&a.__reactDontBind,p="function"==typeof a,d=p&&!i&&!s&&!u;if(d)n.__reactAutoBindMap||(n.__reactAutoBindMap={}),n.__reactAutoBindMap[r]=a,n[r]=a;else if(s){var f=S[r];D(i&&(f===N.DEFINE_MANY_MERGED||f===N.DEFINE_MANY)),f===N.DEFINE_MANY_MERGED?n[r]=c(n[r],a):f===N.DEFINE_MANY&&(n[r]=l(n[r],a))}else n[r]=a}}}}function s(e,t){if(t)for(var n in t){var r=t[n];if(t.hasOwnProperty(n)){var o=n in k;D(!o);var a=n in e;D(!a),e[n]=r}}}function u(e,t){return D(e&&t&&"object"==typeof e&&"object"==typeof t),_(t,function(t,n){D(void 0===e[n]),e[n]=t}),e}function c(e,t){return function(){var n=e.apply(this,arguments),r=t.apply(this,arguments);return null==n?r:null==r?n:u(n,r)}}function l(e,t){return function(){e.apply(this,arguments),t.apply(this,arguments)}}var p=e("./ReactComponent"),d=e("./ReactContext"),f=e("./ReactCurrentOwner"),h=e("./ReactElement"),m=(e("./ReactElementValidator"),e("./ReactEmptyComponent")),v=e("./ReactErrorUtils"),g=e("./ReactLegacyElement"),y=e("./ReactOwner"),E=e("./ReactPerf"),C=e("./ReactPropTransferer"),R=e("./ReactPropTypeLocations"),M=(e("./ReactPropTypeLocationNames"),e("./ReactUpdates")),b=e("./Object.assign"),O=e("./instantiateReactComponent"),D=e("./invariant"),x=e("./keyMirror"),P=e("./keyOf"),_=(e("./monitorCodeUse"),e("./mapObject")),w=e("./shouldUpdateReactComponent"),T=(e("./warning"),P({mixins:null})),N=x({DEFINE_ONCE:null,DEFINE_MANY:null,OVERRIDE_BASE:null,DEFINE_MANY_MERGED:null}),I=[],S={mixins:N.DEFINE_MANY,statics:N.DEFINE_MANY,propTypes:N.DEFINE_MANY,contextTypes:N.DEFINE_MANY,childContextTypes:N.DEFINE_MANY,getDefaultProps:N.DEFINE_MANY_MERGED,getInitialState:N.DEFINE_MANY_MERGED,getChildContext:N.DEFINE_MANY_MERGED,render:N.DEFINE_ONCE,componentWillMount:N.DEFINE_MANY,componentDidMount:N.DEFINE_MANY,componentWillReceiveProps:N.DEFINE_MANY,shouldComponentUpdate:N.DEFINE_ONCE,componentWillUpdate:N.DEFINE_MANY,componentDidUpdate:N.DEFINE_MANY,componentWillUnmount:N.DEFINE_MANY,updateComponent:N.OVERRIDE_BASE},k={displayName:function(e,t){e.displayName=t},mixins:function(e,t){if(t)for(var n=0;n<t.length;n++)i(e,t[n])},childContextTypes:function(e,t){r(e,t,R.childContext),e.childContextTypes=b({},e.childContextTypes,t)},contextTypes:function(e,t){r(e,t,R.context),e.contextTypes=b({},e.contextTypes,t)},getDefaultProps:function(e,t){e.getDefaultProps=e.getDefaultProps?c(e.getDefaultProps,t):t},propTypes:function(e,t){r(e,t,R.prop),e.propTypes=b({},e.propTypes,t)},statics:function(e,t){s(e,t)}},A=x({MOUNTING:null,UNMOUNTING:null,RECEIVING_PROPS:null}),L={construct:function(){p.Mixin.construct.apply(this,arguments),y.Mixin.construct.apply(this,arguments),this.state=null,this._pendingState=null,this.context=null,this._compositeLifeCycleState=null},isMounted:function(){return p.Mixin.isMounted.call(this)&&this._compositeLifeCycleState!==A.MOUNTING},mountComponent:E.measure("ReactCompositeComponent","mountComponent",function(e,t,n){p.Mixin.mountComponent.call(this,e,t,n),this._compositeLifeCycleState=A.MOUNTING,this.__reactAutoBindMap&&this._bindAutoBindMethods(),this.context=this._processContext(this._currentElement._context),this.props=this._processProps(this.props),this.state=this.getInitialState?this.getInitialState():null,D("object"==typeof this.state&&!Array.isArray(this.state)),this._pendingState=null,this._pendingForceUpdate=!1,this.componentWillMount&&(this.componentWillMount(),this._pendingState&&(this.state=this._pendingState,this._pendingState=null)),this._renderedComponent=O(this._renderValidatedComponent(),this._currentElement.type),this._compositeLifeCycleState=null;var r=this._renderedComponent.mountComponent(e,t,n+1);return this.componentDidMount&&t.getReactMountReady().enqueue(this.componentDidMount,this),r}),unmountComponent:function(){this._compositeLifeCycleState=A.UNMOUNTING,this.componentWillUnmount&&this.componentWillUnmount(),this._compositeLifeCycleState=null,this._renderedComponent.unmountComponent(),this._renderedComponent=null,p.Mixin.unmountComponent.call(this)},setState:function(e,t){D("object"==typeof e||null==e),this.replaceState(b({},this._pendingState||this.state,e),t)},replaceState:function(e,t){a(this),this._pendingState=e,this._compositeLifeCycleState!==A.MOUNTING&&M.enqueueUpdate(this,t)},_processContext:function(e){var t=null,n=this.constructor.contextTypes;if(n){t={};for(var r in n)t[r]=e[r]}return t},_processChildContext:function(e){var t=this.getChildContext&&this.getChildContext();if(this.constructor.displayName||"ReactCompositeComponent",t){D("object"==typeof this.constructor.childContextTypes);for(var n in t)D(n in this.constructor.childContextTypes);return b({},e,t)}return e},_processProps:function(e){return e},_checkPropTypes:function(e,t,r){var o=this.constructor.displayName;for(var a in e)if(e.hasOwnProperty(a)){var i=e[a](t,a,o,r);i instanceof Error&&n(this)}},performUpdateIfNecessary:function(e){var t=this._compositeLifeCycleState;if(t!==A.MOUNTING&&t!==A.RECEIVING_PROPS&&(null!=this._pendingElement||null!=this._pendingState||this._pendingForceUpdate)){var n=this.context,r=this.props,o=this._currentElement;null!=this._pendingElement&&(o=this._pendingElement,n=this._processContext(o._context),r=this._processProps(o.props),this._pendingElement=null,this._compositeLifeCycleState=A.RECEIVING_PROPS,this.componentWillReceiveProps&&this.componentWillReceiveProps(r,n)),this._compositeLifeCycleState=null;var a=this._pendingState||this.state;this._pendingState=null;var i=this._pendingForceUpdate||!this.shouldComponentUpdate||this.shouldComponentUpdate(r,a,n);i?(this._pendingForceUpdate=!1,this._performComponentUpdate(o,r,a,n,e)):(this._currentElement=o,this.props=r,this.state=a,this.context=n,this._owner=o._owner)}},_performComponentUpdate:function(e,t,n,r,o){var a=this._currentElement,i=this.props,s=this.state,u=this.context;this.componentWillUpdate&&this.componentWillUpdate(t,n,r),this._currentElement=e,this.props=t,this.state=n,this.context=r,this._owner=e._owner,this.updateComponent(o,a),this.componentDidUpdate&&o.getReactMountReady().enqueue(this.componentDidUpdate.bind(this,i,s,u),this)},receiveComponent:function(e,t){(e!==this._currentElement||null==e._owner)&&p.Mixin.receiveComponent.call(this,e,t)},updateComponent:E.measure("ReactCompositeComponent","updateComponent",function(e,t){p.Mixin.updateComponent.call(this,e,t);var n=this._renderedComponent,r=n._currentElement,o=this._renderValidatedComponent();if(w(r,o))n.receiveComponent(o,e);else{var a=this._rootNodeID,i=n._rootNodeID;n.unmountComponent(),this._renderedComponent=O(o,this._currentElement.type);var s=this._renderedComponent.mountComponent(a,e,this._mountDepth+1);p.BackendIDOperations.dangerouslyReplaceNodeWithMarkupByID(i,s)}}),forceUpdate:function(e){var t=this._compositeLifeCycleState;D(this.isMounted()||t===A.MOUNTING),D(t!==A.UNMOUNTING&&null==f.current),this._pendingForceUpdate=!0,M.enqueueUpdate(this,e)},_renderValidatedComponent:E.measure("ReactCompositeComponent","_renderValidatedComponent",function(){var e,t=d.current;d.current=this._processChildContext(this._currentElement._context),f.current=this;try{e=this.render(),null===e||e===!1?(e=m.getEmptyComponent(),m.registerNullComponentID(this._rootNodeID)):m.deregisterNullComponentID(this._rootNodeID)}finally{d.current=t,f.current=null}return D(h.isValidElement(e)),e}),_bindAutoBindMethods:function(){for(var e in this.__reactAutoBindMap)if(this.__reactAutoBindMap.hasOwnProperty(e)){var t=this.__reactAutoBindMap[e];this[e]=this._bindAutoBindMethod(v.guard(t,this.constructor.displayName+"."+e))}},_bindAutoBindMethod:function(e){var t=this,n=e.bind(t);return n}},U=function(){};b(U.prototype,p.Mixin,y.Mixin,C.Mixin,L);var F={LifeCycle:A,Base:U,createClass:function(e){var t=function(){};t.prototype=new U,t.prototype.constructor=t,I.forEach(i.bind(null,t)),i(t,e),t.getDefaultProps&&(t.defaultProps=t.getDefaultProps()),D(t.prototype.render);for(var n in S)t.prototype[n]||(t.prototype[n]=null);return g.wrapFactory(h.createFactory(t))},injection:{injectMixin:function(e){I.push(e)}}};t.exports=F},{"./Object.assign":27,"./ReactComponent":32,"./ReactContext":35,"./ReactCurrentOwner":36,"./ReactElement":50,"./ReactElementValidator":51,"./ReactEmptyComponent":52,"./ReactErrorUtils":53,"./ReactLegacyElement":59,"./ReactOwner":65,"./ReactPerf":66,"./ReactPropTransferer":67,"./ReactPropTypeLocationNames":68,"./ReactPropTypeLocations":69,"./ReactUpdates":77,"./instantiateReactComponent":123,"./invariant":124,"./keyMirror":130,"./keyOf":131,"./mapObject":132,"./monitorCodeUse":134,"./shouldUpdateReactComponent":138,"./warning":141}],35:[function(e,t){"use strict";var n=e("./Object.assign"),r={current:{},withContext:function(e,t){var o,a=r.current;r.current=n({},a,e);try{o=t()}finally{r.current=a}return o}};t.exports=r},{"./Object.assign":27}],36:[function(e,t){"use strict";var n={current:null};t.exports=n},{}],37:[function(e,t){"use strict";function n(e){return o.markNonLegacyFactory(r.createFactory(e))}var r=e("./ReactElement"),o=(e("./ReactElementValidator"),e("./ReactLegacyElement")),a=e("./mapObject"),i=a({a:"a",abbr:"abbr",address:"address",area:"area",article:"article",aside:"aside",audio:"audio",b:"b",base:"base",bdi:"bdi",bdo:"bdo",big:"big",blockquote:"blockquote",body:"body",br:"br",button:"button",canvas:"canvas",caption:"caption",cite:"cite",code:"code",col:"col",colgroup:"colgroup",data:"data",datalist:"datalist",dd:"dd",del:"del",details:"details",dfn:"dfn",dialog:"dialog",div:"div",dl:"dl",dt:"dt",em:"em",embed:"embed",fieldset:"fieldset",figcaption:"figcaption",figure:"figure",footer:"footer",form:"form",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",h6:"h6",head:"head",header:"header",hr:"hr",html:"html",i:"i",iframe:"iframe",img:"img",input:"input",ins:"ins",kbd:"kbd",keygen:"keygen",label:"label",legend:"legend",li:"li",link:"link",main:"main",map:"map",mark:"mark",menu:"menu",menuitem:"menuitem",meta:"meta",meter:"meter",nav:"nav",noscript:"noscript",object:"object",ol:"ol",optgroup:"optgroup",option:"option",output:"output",p:"p",param:"param",picture:"picture",pre:"pre",progress:"progress",q:"q",rp:"rp",rt:"rt",ruby:"ruby",s:"s",samp:"samp",script:"script",section:"section",select:"select",small:"small",source:"source",span:"span",strong:"strong",style:"style",sub:"sub",summary:"summary",sup:"sup",table:"table",tbody:"tbody",td:"td",textarea:"textarea",tfoot:"tfoot",th:"th",thead:"thead",time:"time",title:"title",tr:"tr",track:"track",u:"u",ul:"ul","var":"var",video:"video",wbr:"wbr",circle:"circle",defs:"defs",ellipse:"ellipse",g:"g",line:"line",linearGradient:"linearGradient",mask:"mask",path:"path",pattern:"pattern",polygon:"polygon",polyline:"polyline",radialGradient:"radialGradient",rect:"rect",stop:"stop",svg:"svg",text:"text",tspan:"tspan"},n);t.exports=i},{"./ReactElement":50,"./ReactElementValidator":51,"./ReactLegacyElement":59,"./mapObject":132}],38:[function(e,t){"use strict";var n=e("./AutoFocusMixin"),r=e("./ReactBrowserComponentMixin"),o=e("./ReactCompositeComponent"),a=e("./ReactElement"),i=e("./ReactDOM"),s=e("./keyMirror"),u=a.createFactory(i.button.type),c=s({onClick:!0,onDoubleClick:!0,onMouseDown:!0,onMouseMove:!0,onMouseUp:!0,onClickCapture:!0,onDoubleClickCapture:!0,onMouseDownCapture:!0,onMouseMoveCapture:!0,onMouseUpCapture:!0}),l=o.createClass({displayName:"ReactDOMButton",mixins:[n,r],render:function(){var e={};for(var t in this.props)!this.props.hasOwnProperty(t)||this.props.disabled&&c[t]||(e[t]=this.props[t]);return u(e,this.props.children)}});t.exports=l},{"./AutoFocusMixin":2,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50,"./keyMirror":130}],39:[function(e,t){"use strict";function n(e){e&&(g(null==e.children||null==e.dangerouslySetInnerHTML),g(null==e.style||"object"==typeof e.style))}function r(e,t,n,r){var o=d.findReactContainerForID(e);if(o){var a=o.nodeType===O?o.ownerDocument:o;C(t,a)}r.getPutListenerQueue().enqueuePutListener(e,t,n)}function o(e){_.call(P,e)||(g(x.test(e)),P[e]=!0)}function a(e){o(e),this._tag=e,this.tagName=e.toUpperCase()}var i=e("./CSSPropertyOperations"),s=e("./DOMProperty"),u=e("./DOMPropertyOperations"),c=e("./ReactBrowserComponentMixin"),l=e("./ReactComponent"),p=e("./ReactBrowserEventEmitter"),d=e("./ReactMount"),f=e("./ReactMultiChild"),h=e("./ReactPerf"),m=e("./Object.assign"),v=e("./escapeTextForBrowser"),g=e("./invariant"),y=(e("./isEventSupported"),e("./keyOf")),E=(e("./monitorCodeUse"),p.deleteListener),C=p.listenTo,R=p.registrationNameModules,M={string:!0,number:!0},b=y({style:null}),O=1,D={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0},x=/^[a-zA-Z][a-zA-Z:_\.\-\d]*$/,P={},_={}.hasOwnProperty;a.displayName="ReactDOMComponent",a.Mixin={mountComponent:h.measure("ReactDOMComponent","mountComponent",function(e,t,r){l.Mixin.mountComponent.call(this,e,t,r),n(this.props);var o=D[this._tag]?"":"</"+this._tag+">";return this._createOpenTagMarkupAndPutListeners(t)+this._createContentMarkup(t)+o}),_createOpenTagMarkupAndPutListeners:function(e){var t=this.props,n="<"+this._tag;for(var o in t)if(t.hasOwnProperty(o)){var a=t[o];if(null!=a)if(R.hasOwnProperty(o))r(this._rootNodeID,o,a,e);else{o===b&&(a&&(a=t.style=m({},t.style)),a=i.createMarkupForStyles(a));var s=u.createMarkupForProperty(o,a);s&&(n+=" "+s)}}if(e.renderToStaticMarkup)return n+">";var c=u.createMarkupForID(this._rootNodeID);return n+" "+c+">"},_createContentMarkup:function(e){var t=this.props.dangerouslySetInnerHTML;if(null!=t){if(null!=t.__html)return t.__html}else{var n=M[typeof this.props.children]?this.props.children:null,r=null!=n?null:this.props.children;if(null!=n)return v(n);if(null!=r){var o=this.mountChildren(r,e);return o.join("")}}return""},receiveComponent:function(e,t){(e!==this._currentElement||null==e._owner)&&l.Mixin.receiveComponent.call(this,e,t)},updateComponent:h.measure("ReactDOMComponent","updateComponent",function(e,t){n(this._currentElement.props),l.Mixin.updateComponent.call(this,e,t),this._updateDOMProperties(t.props,e),this._updateDOMChildren(t.props,e)}),_updateDOMProperties:function(e,t){var n,o,a,i=this.props;for(n in e)if(!i.hasOwnProperty(n)&&e.hasOwnProperty(n))if(n===b){var u=e[n];for(o in u)u.hasOwnProperty(o)&&(a=a||{},a[o]="")}else R.hasOwnProperty(n)?E(this._rootNodeID,n):(s.isStandardName[n]||s.isCustomAttribute(n))&&l.BackendIDOperations.deletePropertyByID(this._rootNodeID,n);for(n in i){var c=i[n],p=e[n];if(i.hasOwnProperty(n)&&c!==p)if(n===b)if(c&&(c=i.style=m({},c)),p){for(o in p)!p.hasOwnProperty(o)||c&&c.hasOwnProperty(o)||(a=a||{},a[o]="");for(o in c)c.hasOwnProperty(o)&&p[o]!==c[o]&&(a=a||{},a[o]=c[o])}else a=c;else R.hasOwnProperty(n)?r(this._rootNodeID,n,c,t):(s.isStandardName[n]||s.isCustomAttribute(n))&&l.BackendIDOperations.updatePropertyByID(this._rootNodeID,n,c)}a&&l.BackendIDOperations.updateStylesByID(this._rootNodeID,a)},_updateDOMChildren:function(e,t){var n=this.props,r=M[typeof e.children]?e.children:null,o=M[typeof n.children]?n.children:null,a=e.dangerouslySetInnerHTML&&e.dangerouslySetInnerHTML.__html,i=n.dangerouslySetInnerHTML&&n.dangerouslySetInnerHTML.__html,s=null!=r?null:e.children,u=null!=o?null:n.children,c=null!=r||null!=a,p=null!=o||null!=i;null!=s&&null==u?this.updateChildren(null,t):c&&!p&&this.updateTextContent(""),null!=o?r!==o&&this.updateTextContent(""+o):null!=i?a!==i&&l.BackendIDOperations.updateInnerHTMLByID(this._rootNodeID,i):null!=u&&this.updateChildren(u,t)},unmountComponent:function(){this.unmountChildren(),p.deleteAllListeners(this._rootNodeID),l.Mixin.unmountComponent.call(this)}},m(a.prototype,l.Mixin,a.Mixin,f.Mixin,c),t.exports=a},{"./CSSPropertyOperations":5,"./DOMProperty":11,"./DOMPropertyOperations":12,"./Object.assign":27,"./ReactBrowserComponentMixin":29,"./ReactBrowserEventEmitter":30,"./ReactComponent":32,"./ReactMount":61,"./ReactMultiChild":62,"./ReactPerf":66,"./escapeTextForBrowser":107,"./invariant":124,"./isEventSupported":125,"./keyOf":131,"./monitorCodeUse":134}],40:[function(e,t){"use strict";var n=e("./EventConstants"),r=e("./LocalEventTrapMixin"),o=e("./ReactBrowserComponentMixin"),a=e("./ReactCompositeComponent"),i=e("./ReactElement"),s=e("./ReactDOM"),u=i.createFactory(s.form.type),c=a.createClass({displayName:"ReactDOMForm",mixins:[o,r],render:function(){return u(this.props)},componentDidMount:function(){this.trapBubbledEvent(n.topLevelTypes.topReset,"reset"),this.trapBubbledEvent(n.topLevelTypes.topSubmit,"submit")}});t.exports=c},{"./EventConstants":16,"./LocalEventTrapMixin":25,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50}],41:[function(e,t){"use strict";var n=e("./CSSPropertyOperations"),r=e("./DOMChildrenOperations"),o=e("./DOMPropertyOperations"),a=e("./ReactMount"),i=e("./ReactPerf"),s=e("./invariant"),u=e("./setInnerHTML"),c={dangerouslySetInnerHTML:"`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.",style:"`style` must be set using `updateStylesByID()`."},l={updatePropertyByID:i.measure("ReactDOMIDOperations","updatePropertyByID",function(e,t,n){var r=a.getNode(e);s(!c.hasOwnProperty(t)),null!=n?o.setValueForProperty(r,t,n):o.deleteValueForProperty(r,t)}),deletePropertyByID:i.measure("ReactDOMIDOperations","deletePropertyByID",function(e,t,n){var r=a.getNode(e);s(!c.hasOwnProperty(t)),o.deleteValueForProperty(r,t,n)}),updateStylesByID:i.measure("ReactDOMIDOperations","updateStylesByID",function(e,t){var r=a.getNode(e);n.setValueForStyles(r,t)}),updateInnerHTMLByID:i.measure("ReactDOMIDOperations","updateInnerHTMLByID",function(e,t){var n=a.getNode(e);u(n,t)}),updateTextContentByID:i.measure("ReactDOMIDOperations","updateTextContentByID",function(e,t){var n=a.getNode(e);r.updateTextContent(n,t)}),dangerouslyReplaceNodeWithMarkupByID:i.measure("ReactDOMIDOperations","dangerouslyReplaceNodeWithMarkupByID",function(e,t){var n=a.getNode(e);r.dangerouslyReplaceNodeWithMarkup(n,t)}),dangerouslyProcessChildrenUpdates:i.measure("ReactDOMIDOperations","dangerouslyProcessChildrenUpdates",function(e,t){for(var n=0;n<e.length;n++)e[n].parentNode=a.getNode(e[n].parentID);r.processUpdates(e,t)})};t.exports=l},{"./CSSPropertyOperations":5,"./DOMChildrenOperations":10,"./DOMPropertyOperations":12,"./ReactMount":61,"./ReactPerf":66,"./invariant":124,"./setInnerHTML":136}],42:[function(e,t){"use strict";var n=e("./EventConstants"),r=e("./LocalEventTrapMixin"),o=e("./ReactBrowserComponentMixin"),a=e("./ReactCompositeComponent"),i=e("./ReactElement"),s=e("./ReactDOM"),u=i.createFactory(s.img.type),c=a.createClass({displayName:"ReactDOMImg",tagName:"IMG",mixins:[o,r],render:function(){return u(this.props)},componentDidMount:function(){this.trapBubbledEvent(n.topLevelTypes.topLoad,"load"),this.trapBubbledEvent(n.topLevelTypes.topError,"error")}});t.exports=c},{"./EventConstants":16,"./LocalEventTrapMixin":25,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50}],43:[function(e,t){"use strict";function n(){this.isMounted()&&this.forceUpdate()}var r=e("./AutoFocusMixin"),o=e("./DOMPropertyOperations"),a=e("./LinkedValueUtils"),i=e("./ReactBrowserComponentMixin"),s=e("./ReactCompositeComponent"),u=e("./ReactElement"),c=e("./ReactDOM"),l=e("./ReactMount"),p=e("./ReactUpdates"),d=e("./Object.assign"),f=e("./invariant"),h=u.createFactory(c.input.type),m={},v=s.createClass({displayName:"ReactDOMInput",mixins:[r,a.Mixin,i],getInitialState:function(){var e=this.props.defaultValue;return{initialChecked:this.props.defaultChecked||!1,initialValue:null!=e?e:null}},render:function(){var e=d({},this.props);e.defaultChecked=null,e.defaultValue=null;var t=a.getValue(this);e.value=null!=t?t:this.state.initialValue;var n=a.getChecked(this);return e.checked=null!=n?n:this.state.initialChecked,e.onChange=this._handleChange,h(e,this.props.children)},componentDidMount:function(){var e=l.getID(this.getDOMNode());m[e]=this},componentWillUnmount:function(){var e=this.getDOMNode(),t=l.getID(e);delete m[t]},componentDidUpdate:function(){var e=this.getDOMNode();null!=this.props.checked&&o.setValueForProperty(e,"checked",this.props.checked||!1);var t=a.getValue(this);null!=t&&o.setValueForProperty(e,"value",""+t)},_handleChange:function(e){var t,r=a.getOnChange(this);r&&(t=r.call(this,e)),p.asap(n,this);var o=this.props.name;if("radio"===this.props.type&&null!=o){for(var i=this.getDOMNode(),s=i;s.parentNode;)s=s.parentNode;for(var u=s.querySelectorAll("input[name="+JSON.stringify(""+o)+'][type="radio"]'),c=0,d=u.length;d>c;c++){var h=u[c];if(h!==i&&h.form===i.form){var v=l.getID(h);f(v);var g=m[v];f(g),p.asap(n,g)}}}return t}});t.exports=v},{"./AutoFocusMixin":2,"./DOMPropertyOperations":12,"./LinkedValueUtils":24,"./Object.assign":27,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50,"./ReactMount":61,"./ReactUpdates":77,"./invariant":124}],44:[function(e,t){"use strict";var n=e("./ReactBrowserComponentMixin"),r=e("./ReactCompositeComponent"),o=e("./ReactElement"),a=e("./ReactDOM"),i=(e("./warning"),o.createFactory(a.option.type)),s=r.createClass({displayName:"ReactDOMOption",mixins:[n],componentWillMount:function(){},render:function(){return i(this.props,this.props.children)}});t.exports=s},{"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50,"./warning":141}],45:[function(e,t){"use strict";function n(){this.isMounted()&&(this.setState({value:this._pendingValue}),this._pendingValue=0)}function r(e,t){if(null!=e[t])if(e.multiple){if(!Array.isArray(e[t]))return new Error("The `"+t+"` prop supplied to <select> must be an array if `multiple` is true.")}else if(Array.isArray(e[t]))return new Error("The `"+t+"` prop supplied to <select> must be a scalar value if `multiple` is false.")}function o(e,t){var n,r,o,a=e.props.multiple,i=null!=t?t:e.state.value,s=e.getDOMNode().options;if(a)for(n={},r=0,o=i.length;o>r;++r)n[""+i[r]]=!0;else n=""+i;for(r=0,o=s.length;o>r;r++){var u=a?n.hasOwnProperty(s[r].value):s[r].value===n;u!==s[r].selected&&(s[r].selected=u)}}var a=e("./AutoFocusMixin"),i=e("./LinkedValueUtils"),s=e("./ReactBrowserComponentMixin"),u=e("./ReactCompositeComponent"),c=e("./ReactElement"),l=e("./ReactDOM"),p=e("./ReactUpdates"),d=e("./Object.assign"),f=c.createFactory(l.select.type),h=u.createClass({displayName:"ReactDOMSelect",mixins:[a,i.Mixin,s],propTypes:{defaultValue:r,value:r},getInitialState:function(){return{value:this.props.defaultValue||(this.props.multiple?[]:"")}},componentWillMount:function(){this._pendingValue=null},componentWillReceiveProps:function(e){!this.props.multiple&&e.multiple?this.setState({value:[this.state.value]}):this.props.multiple&&!e.multiple&&this.setState({value:this.state.value[0]})
},render:function(){var e=d({},this.props);return e.onChange=this._handleChange,e.value=null,f(e,this.props.children)},componentDidMount:function(){o(this,i.getValue(this))},componentDidUpdate:function(e){var t=i.getValue(this),n=!!e.multiple,r=!!this.props.multiple;(null!=t||n!==r)&&o(this,t)},_handleChange:function(e){var t,r=i.getOnChange(this);r&&(t=r.call(this,e));var o;if(this.props.multiple){o=[];for(var a=e.target.options,s=0,u=a.length;u>s;s++)a[s].selected&&o.push(a[s].value)}else o=e.target.value;return this._pendingValue=o,p.asap(n,this),t}});t.exports=h},{"./AutoFocusMixin":2,"./LinkedValueUtils":24,"./Object.assign":27,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50,"./ReactUpdates":77}],46:[function(e,t){"use strict";function n(e,t,n,r){return e===n&&t===r}function r(e){var t=document.selection,n=t.createRange(),r=n.text.length,o=n.duplicate();o.moveToElementText(e),o.setEndPoint("EndToStart",n);var a=o.text.length,i=a+r;return{start:a,end:i}}function o(e){var t=window.getSelection&&window.getSelection();if(!t||0===t.rangeCount)return null;var r=t.anchorNode,o=t.anchorOffset,a=t.focusNode,i=t.focusOffset,s=t.getRangeAt(0),u=n(t.anchorNode,t.anchorOffset,t.focusNode,t.focusOffset),c=u?0:s.toString().length,l=s.cloneRange();l.selectNodeContents(e),l.setEnd(s.startContainer,s.startOffset);var p=n(l.startContainer,l.startOffset,l.endContainer,l.endOffset),d=p?0:l.toString().length,f=d+c,h=document.createRange();h.setStart(r,o),h.setEnd(a,i);var m=h.collapsed;return{start:m?f:d,end:m?d:f}}function a(e,t){var n,r,o=document.selection.createRange().duplicate();"undefined"==typeof t.end?(n=t.start,r=n):t.start>t.end?(n=t.end,r=t.start):(n=t.start,r=t.end),o.moveToElementText(e),o.moveStart("character",n),o.setEndPoint("EndToStart",o),o.moveEnd("character",r-n),o.select()}function i(e,t){if(window.getSelection){var n=window.getSelection(),r=e[c()].length,o=Math.min(t.start,r),a="undefined"==typeof t.end?o:Math.min(t.end,r);if(!n.extend&&o>a){var i=a;a=o,o=i}var s=u(e,o),l=u(e,a);if(s&&l){var p=document.createRange();p.setStart(s.node,s.offset),n.removeAllRanges(),o>a?(n.addRange(p),n.extend(l.node,l.offset)):(p.setEnd(l.node,l.offset),n.addRange(p))}}}var s=e("./ExecutionEnvironment"),u=e("./getNodeForCharacterOffset"),c=e("./getTextContentAccessor"),l=s.canUseDOM&&document.selection,p={getOffsets:l?r:o,setOffsets:l?a:i};t.exports=p},{"./ExecutionEnvironment":22,"./getNodeForCharacterOffset":117,"./getTextContentAccessor":119}],47:[function(e,t){"use strict";function n(){this.isMounted()&&this.forceUpdate()}var r=e("./AutoFocusMixin"),o=e("./DOMPropertyOperations"),a=e("./LinkedValueUtils"),i=e("./ReactBrowserComponentMixin"),s=e("./ReactCompositeComponent"),u=e("./ReactElement"),c=e("./ReactDOM"),l=e("./ReactUpdates"),p=e("./Object.assign"),d=e("./invariant"),f=(e("./warning"),u.createFactory(c.textarea.type)),h=s.createClass({displayName:"ReactDOMTextarea",mixins:[r,a.Mixin,i],getInitialState:function(){var e=this.props.defaultValue,t=this.props.children;null!=t&&(d(null==e),Array.isArray(t)&&(d(t.length<=1),t=t[0]),e=""+t),null==e&&(e="");var n=a.getValue(this);return{initialValue:""+(null!=n?n:e)}},render:function(){var e=p({},this.props);return d(null==e.dangerouslySetInnerHTML),e.defaultValue=null,e.value=null,e.onChange=this._handleChange,f(e,this.state.initialValue)},componentDidUpdate:function(){var e=a.getValue(this);if(null!=e){var t=this.getDOMNode();o.setValueForProperty(t,"value",""+e)}},_handleChange:function(e){var t,r=a.getOnChange(this);return r&&(t=r.call(this,e)),l.asap(n,this),t}});t.exports=h},{"./AutoFocusMixin":2,"./DOMPropertyOperations":12,"./LinkedValueUtils":24,"./Object.assign":27,"./ReactBrowserComponentMixin":29,"./ReactCompositeComponent":34,"./ReactDOM":37,"./ReactElement":50,"./ReactUpdates":77,"./invariant":124,"./warning":141}],48:[function(e,t){"use strict";function n(){this.reinitializeTransaction()}var r=e("./ReactUpdates"),o=e("./Transaction"),a=e("./Object.assign"),i=e("./emptyFunction"),s={initialize:i,close:function(){p.isBatchingUpdates=!1}},u={initialize:i,close:r.flushBatchedUpdates.bind(r)},c=[u,s];a(n.prototype,o.Mixin,{getTransactionWrappers:function(){return c}});var l=new n,p={isBatchingUpdates:!1,batchedUpdates:function(e,t,n){var r=p.isBatchingUpdates;p.isBatchingUpdates=!0,r?e(t,n):l.perform(e,null,t,n)}};t.exports=p},{"./Object.assign":27,"./ReactUpdates":77,"./Transaction":93,"./emptyFunction":105}],49:[function(e,t){"use strict";function n(){O.EventEmitter.injectReactEventListener(b),O.EventPluginHub.injectEventPluginOrder(s),O.EventPluginHub.injectInstanceHandle(D),O.EventPluginHub.injectMount(x),O.EventPluginHub.injectEventPluginsByName({SimpleEventPlugin:w,EnterLeaveEventPlugin:u,ChangeEventPlugin:o,CompositionEventPlugin:i,MobileSafariClickEventPlugin:p,SelectEventPlugin:P,BeforeInputEventPlugin:r}),O.NativeComponent.injectGenericComponentClass(m),O.NativeComponent.injectComponentClasses({button:v,form:g,img:y,input:E,option:C,select:R,textarea:M,html:N("html"),head:N("head"),body:N("body")}),O.CompositeComponent.injectMixin(d),O.DOMProperty.injectDOMPropertyConfig(l),O.DOMProperty.injectDOMPropertyConfig(T),O.EmptyComponent.injectEmptyComponent("noscript"),O.Updates.injectReconcileTransaction(f.ReactReconcileTransaction),O.Updates.injectBatchingStrategy(h),O.RootIndex.injectCreateReactRootIndex(c.canUseDOM?a.createReactRootIndex:_.createReactRootIndex),O.Component.injectEnvironment(f)}var r=e("./BeforeInputEventPlugin"),o=e("./ChangeEventPlugin"),a=e("./ClientReactRootIndex"),i=e("./CompositionEventPlugin"),s=e("./DefaultEventPluginOrder"),u=e("./EnterLeaveEventPlugin"),c=e("./ExecutionEnvironment"),l=e("./HTMLDOMPropertyConfig"),p=e("./MobileSafariClickEventPlugin"),d=e("./ReactBrowserComponentMixin"),f=e("./ReactComponentBrowserEnvironment"),h=e("./ReactDefaultBatchingStrategy"),m=e("./ReactDOMComponent"),v=e("./ReactDOMButton"),g=e("./ReactDOMForm"),y=e("./ReactDOMImg"),E=e("./ReactDOMInput"),C=e("./ReactDOMOption"),R=e("./ReactDOMSelect"),M=e("./ReactDOMTextarea"),b=e("./ReactEventListener"),O=e("./ReactInjection"),D=e("./ReactInstanceHandles"),x=e("./ReactMount"),P=e("./SelectEventPlugin"),_=e("./ServerReactRootIndex"),w=e("./SimpleEventPlugin"),T=e("./SVGDOMPropertyConfig"),N=e("./createFullPageComponent");t.exports={inject:n}},{"./BeforeInputEventPlugin":3,"./ChangeEventPlugin":7,"./ClientReactRootIndex":8,"./CompositionEventPlugin":9,"./DefaultEventPluginOrder":14,"./EnterLeaveEventPlugin":15,"./ExecutionEnvironment":22,"./HTMLDOMPropertyConfig":23,"./MobileSafariClickEventPlugin":26,"./ReactBrowserComponentMixin":29,"./ReactComponentBrowserEnvironment":33,"./ReactDOMButton":38,"./ReactDOMComponent":39,"./ReactDOMForm":40,"./ReactDOMImg":42,"./ReactDOMInput":43,"./ReactDOMOption":44,"./ReactDOMSelect":45,"./ReactDOMTextarea":47,"./ReactDefaultBatchingStrategy":48,"./ReactEventListener":55,"./ReactInjection":56,"./ReactInstanceHandles":58,"./ReactMount":61,"./SVGDOMPropertyConfig":78,"./SelectEventPlugin":79,"./ServerReactRootIndex":80,"./SimpleEventPlugin":81,"./createFullPageComponent":101}],50:[function(e,t){"use strict";var n=e("./ReactContext"),r=e("./ReactCurrentOwner"),o=(e("./warning"),{key:!0,ref:!0}),a=function(e,t,n,r,o,a){this.type=e,this.key=t,this.ref=n,this._owner=r,this._context=o,this.props=a};a.prototype={_isReactElement:!0},a.createElement=function(e,t,i){var s,u={},c=null,l=null;if(null!=t){l=void 0===t.ref?null:t.ref,c=null==t.key?null:""+t.key;for(s in t)t.hasOwnProperty(s)&&!o.hasOwnProperty(s)&&(u[s]=t[s])}var p=arguments.length-2;if(1===p)u.children=i;else if(p>1){for(var d=Array(p),f=0;p>f;f++)d[f]=arguments[f+2];u.children=d}if(e&&e.defaultProps){var h=e.defaultProps;for(s in h)"undefined"==typeof u[s]&&(u[s]=h[s])}return new a(e,c,l,r.current,n.current,u)},a.createFactory=function(e){var t=a.createElement.bind(null,e);return t.type=e,t},a.cloneAndReplaceProps=function(e,t){var n=new a(e.type,e.key,e.ref,e._owner,e._context,t);return n},a.isValidElement=function(e){var t=!(!e||!e._isReactElement);return t},t.exports=a},{"./ReactContext":35,"./ReactCurrentOwner":36,"./warning":141}],51:[function(e,t){"use strict";function n(){var e=p.current;return e&&e.constructor.displayName||void 0}function r(e,t){e._store.validated||null!=e.key||(e._store.validated=!0,a("react_key_warning",'Each child in an array should have a unique "key" prop.',e,t))}function o(e,t,n){v.test(e)&&a("react_numeric_key_warning","Child objects should have non-numeric keys so ordering is preserved.",t,n)}function a(e,t,r,o){var a=n(),i=o.displayName,s=a||i,u=f[e];if(!u.hasOwnProperty(s)){u[s]=!0,t+=a?" Check the render method of "+a+".":" Check the renderComponent call using <"+i+">.";var c=null;r._owner&&r._owner!==p.current&&(c=r._owner.constructor.displayName,t+=" It was passed a child from "+c+"."),t+=" See http://fb.me/react-warning-keys for more information.",d(e,{component:s,componentOwner:c}),console.warn(t)}}function i(){var e=n()||"";h.hasOwnProperty(e)||(h[e]=!0,d("react_object_map_children"))}function s(e,t){if(Array.isArray(e))for(var n=0;n<e.length;n++){var a=e[n];c.isValidElement(a)&&r(a,t)}else if(c.isValidElement(e))e._store.validated=!0;else if(e&&"object"==typeof e){i();for(var s in e)o(s,e[s],t)}}function u(e,t,n,r){for(var o in t)if(t.hasOwnProperty(o)){var a;try{a=t[o](n,o,e,r)}catch(i){a=i}a instanceof Error&&!(a.message in m)&&(m[a.message]=!0,d("react_failed_descriptor_type_check",{message:a.message}))}}var c=e("./ReactElement"),l=e("./ReactPropTypeLocations"),p=e("./ReactCurrentOwner"),d=e("./monitorCodeUse"),f=(e("./warning"),{react_key_warning:{},react_numeric_key_warning:{}}),h={},m={},v=/^\d+$/,g={createElement:function(e){var t=c.createElement.apply(this,arguments);if(null==t)return t;for(var n=2;n<arguments.length;n++)s(arguments[n],e);if(e){var r=e.displayName;e.propTypes&&u(r,e.propTypes,t.props,l.prop),e.contextTypes&&u(r,e.contextTypes,t._context,l.context)}return t},createFactory:function(e){var t=g.createElement.bind(null,e);return t.type=e,t}};t.exports=g},{"./ReactCurrentOwner":36,"./ReactElement":50,"./ReactPropTypeLocations":69,"./monitorCodeUse":134,"./warning":141}],52:[function(e,t){"use strict";function n(){return u(i),i()}function r(e){c[e]=!0}function o(e){delete c[e]}function a(e){return c[e]}var i,s=e("./ReactElement"),u=e("./invariant"),c={},l={injectEmptyComponent:function(e){i=s.createFactory(e)}},p={deregisterNullComponentID:o,getEmptyComponent:n,injection:l,isNullComponentID:a,registerNullComponentID:r};t.exports=p},{"./ReactElement":50,"./invariant":124}],53:[function(e,t){"use strict";var n={guard:function(e){return e}};t.exports=n},{}],54:[function(e,t){"use strict";function n(e){r.enqueueEvents(e),r.processEventQueue()}var r=e("./EventPluginHub"),o={handleTopLevel:function(e,t,o,a){var i=r.extractEvents(e,t,o,a);n(i)}};t.exports=o},{"./EventPluginHub":18}],55:[function(e,t){"use strict";function n(e){var t=l.getID(e),n=c.getReactRootIDFromNodeID(t),r=l.findReactContainerForID(n),o=l.getFirstReactDOM(r);return o}function r(e,t){this.topLevelType=e,this.nativeEvent=t,this.ancestors=[]}function o(e){for(var t=l.getFirstReactDOM(f(e.nativeEvent))||window,r=t;r;)e.ancestors.push(r),r=n(r);for(var o=0,a=e.ancestors.length;a>o;o++){t=e.ancestors[o];var i=l.getID(t)||"";m._handleTopLevel(e.topLevelType,t,i,e.nativeEvent)}}function a(e){var t=h(window);e(t)}var i=e("./EventListener"),s=e("./ExecutionEnvironment"),u=e("./PooledClass"),c=e("./ReactInstanceHandles"),l=e("./ReactMount"),p=e("./ReactUpdates"),d=e("./Object.assign"),f=e("./getEventTarget"),h=e("./getUnboundedScrollPosition");d(r.prototype,{destructor:function(){this.topLevelType=null,this.nativeEvent=null,this.ancestors.length=0}}),u.addPoolingTo(r,u.twoArgumentPooler);var m={_enabled:!0,_handleTopLevel:null,WINDOW_HANDLE:s.canUseDOM?window:null,setHandleTopLevel:function(e){m._handleTopLevel=e},setEnabled:function(e){m._enabled=!!e},isEnabled:function(){return m._enabled},trapBubbledEvent:function(e,t,n){var r=n;return r?i.listen(r,t,m.dispatchEvent.bind(null,e)):void 0},trapCapturedEvent:function(e,t,n){var r=n;return r?i.capture(r,t,m.dispatchEvent.bind(null,e)):void 0},monitorScrollValue:function(e){var t=a.bind(null,e);i.listen(window,"scroll",t),i.listen(window,"resize",t)},dispatchEvent:function(e,t){if(m._enabled){var n=r.getPooled(e,t);try{p.batchedUpdates(o,n)}finally{r.release(n)}}}};t.exports=m},{"./EventListener":17,"./ExecutionEnvironment":22,"./Object.assign":27,"./PooledClass":28,"./ReactInstanceHandles":58,"./ReactMount":61,"./ReactUpdates":77,"./getEventTarget":115,"./getUnboundedScrollPosition":120}],56:[function(e,t){"use strict";var n=e("./DOMProperty"),r=e("./EventPluginHub"),o=e("./ReactComponent"),a=e("./ReactCompositeComponent"),i=e("./ReactEmptyComponent"),s=e("./ReactBrowserEventEmitter"),u=e("./ReactNativeComponent"),c=e("./ReactPerf"),l=e("./ReactRootIndex"),p=e("./ReactUpdates"),d={Component:o.injection,CompositeComponent:a.injection,DOMProperty:n.injection,EmptyComponent:i.injection,EventPluginHub:r.injection,EventEmitter:s.injection,NativeComponent:u.injection,Perf:c.injection,RootIndex:l.injection,Updates:p.injection};t.exports=d},{"./DOMProperty":11,"./EventPluginHub":18,"./ReactBrowserEventEmitter":30,"./ReactComponent":32,"./ReactCompositeComponent":34,"./ReactEmptyComponent":52,"./ReactNativeComponent":64,"./ReactPerf":66,"./ReactRootIndex":73,"./ReactUpdates":77}],57:[function(e,t){"use strict";function n(e){return o(document.documentElement,e)}var r=e("./ReactDOMSelection"),o=e("./containsNode"),a=e("./focusNode"),i=e("./getActiveElement"),s={hasSelectionCapabilities:function(e){return e&&("INPUT"===e.nodeName&&"text"===e.type||"TEXTAREA"===e.nodeName||"true"===e.contentEditable)},getSelectionInformation:function(){var e=i();return{focusedElem:e,selectionRange:s.hasSelectionCapabilities(e)?s.getSelection(e):null}},restoreSelection:function(e){var t=i(),r=e.focusedElem,o=e.selectionRange;t!==r&&n(r)&&(s.hasSelectionCapabilities(r)&&s.setSelection(r,o),a(r))},getSelection:function(e){var t;if("selectionStart"in e)t={start:e.selectionStart,end:e.selectionEnd};else if(document.selection&&"INPUT"===e.nodeName){var n=document.selection.createRange();n.parentElement()===e&&(t={start:-n.moveStart("character",-e.value.length),end:-n.moveEnd("character",-e.value.length)})}else t=r.getOffsets(e);return t||{start:0,end:0}},setSelection:function(e,t){var n=t.start,o=t.end;if("undefined"==typeof o&&(o=n),"selectionStart"in e)e.selectionStart=n,e.selectionEnd=Math.min(o,e.value.length);else if(document.selection&&"INPUT"===e.nodeName){var a=e.createTextRange();a.collapse(!0),a.moveStart("character",n),a.moveEnd("character",o-n),a.select()}else r.setOffsets(e,t)}};t.exports=s},{"./ReactDOMSelection":46,"./containsNode":99,"./focusNode":109,"./getActiveElement":111}],58:[function(e,t){"use strict";function n(e){return d+e.toString(36)}function r(e,t){return e.charAt(t)===d||t===e.length}function o(e){return""===e||e.charAt(0)===d&&e.charAt(e.length-1)!==d}function a(e,t){return 0===t.indexOf(e)&&r(t,e.length)}function i(e){return e?e.substr(0,e.lastIndexOf(d)):""}function s(e,t){if(p(o(e)&&o(t)),p(a(e,t)),e===t)return e;for(var n=e.length+f,i=n;i<t.length&&!r(t,i);i++);return t.substr(0,i)}function u(e,t){var n=Math.min(e.length,t.length);if(0===n)return"";for(var a=0,i=0;n>=i;i++)if(r(e,i)&&r(t,i))a=i;else if(e.charAt(i)!==t.charAt(i))break;var s=e.substr(0,a);return p(o(s)),s}function c(e,t,n,r,o,u){e=e||"",t=t||"",p(e!==t);var c=a(t,e);p(c||a(e,t));for(var l=0,d=c?i:s,f=e;;f=d(f,t)){var m;if(o&&f===e||u&&f===t||(m=n(f,c,r)),m===!1||f===t)break;p(l++<h)}}var l=e("./ReactRootIndex"),p=e("./invariant"),d=".",f=d.length,h=100,m={createReactRootID:function(){return n(l.createReactRootIndex())},createReactID:function(e,t){return e+t},getReactRootIDFromNodeID:function(e){if(e&&e.charAt(0)===d&&e.length>1){var t=e.indexOf(d,1);return t>-1?e.substr(0,t):e}return null},traverseEnterLeave:function(e,t,n,r,o){var a=u(e,t);a!==e&&c(e,a,n,r,!1,!0),a!==t&&c(a,t,n,o,!0,!1)},traverseTwoPhase:function(e,t,n){e&&(c("",e,t,n,!0,!1),c(e,"",t,n,!1,!0))},traverseAncestors:function(e,t,n){c("",e,t,n,!0,!1)},_getFirstCommonAncestorID:u,_getNextDescendantID:s,isAncestorIDOf:a,SEPARATOR:d};t.exports=m},{"./ReactRootIndex":73,"./invariant":124}],59:[function(e,t){"use strict";function n(e,t){if("function"==typeof t)for(var n in t)if(t.hasOwnProperty(n)){var r=t[n];if("function"==typeof r){var o=r.bind(t);for(var a in r)r.hasOwnProperty(a)&&(o[a]=r[a]);e[n]=o}else e[n]=r}}var r=(e("./ReactCurrentOwner"),e("./invariant")),o=(e("./monitorCodeUse"),e("./warning"),{}),a={},i={};i.wrapCreateFactory=function(e){var t=function(t){return"function"!=typeof t?e(t):t.isReactNonLegacyFactory?e(t.type):t.isReactLegacyFactory?e(t.type):t};return t},i.wrapCreateElement=function(e){var t=function(t){if("function"!=typeof t)return e.apply(this,arguments);var n;return t.isReactNonLegacyFactory?(n=Array.prototype.slice.call(arguments,0),n[0]=t.type,e.apply(this,n)):t.isReactLegacyFactory?(t._isMockFunction&&(t.type._mockedReactClassConstructor=t),n=Array.prototype.slice.call(arguments,0),n[0]=t.type,e.apply(this,n)):t.apply(null,Array.prototype.slice.call(arguments,1))};return t},i.wrapFactory=function(e){r("function"==typeof e);var t=function(){return e.apply(this,arguments)};return n(t,e.type),t.isReactLegacyFactory=o,t.type=e.type,t},i.markNonLegacyFactory=function(e){return e.isReactNonLegacyFactory=a,e},i.isValidFactory=function(e){return"function"==typeof e&&e.isReactLegacyFactory===o},i.isValidClass=function(e){return i.isValidFactory(e)},i._isLegacyCallWarningEnabled=!0,t.exports=i},{"./ReactCurrentOwner":36,"./invariant":124,"./monitorCodeUse":134,"./warning":141}],60:[function(e,t){"use strict";var n=e("./adler32"),r={CHECKSUM_ATTR_NAME:"data-react-checksum",addChecksumToMarkup:function(e){var t=n(e);return e.replace(">"," "+r.CHECKSUM_ATTR_NAME+'="'+t+'">')},canReuseMarkup:function(e,t){var o=t.getAttribute(r.CHECKSUM_ATTR_NAME);o=o&&parseInt(o,10);var a=n(e);return a===o}};t.exports=r},{"./adler32":96}],61:[function(e,t){"use strict";function n(e){var t=E(e);return t&&S.getID(t)}function r(e){var t=o(e);if(t)if(x.hasOwnProperty(t)){var n=x[t];n!==e&&(R(!s(n,t)),x[t]=e)}else x[t]=e;return t}function o(e){return e&&e.getAttribute&&e.getAttribute(D)||""}function a(e,t){var n=o(e);n!==t&&delete x[n],e.setAttribute(D,t),x[t]=e}function i(e){return x.hasOwnProperty(e)&&s(x[e],e)||(x[e]=S.findReactNodeByID(e)),x[e]}function s(e,t){if(e){R(o(e)===t);var n=S.findReactContainerForID(t);if(n&&g(n,e))return!0}return!1}function u(e){delete x[e]}function c(e){var t=x[e];return t&&s(t,e)?void(I=t):!1}function l(e){I=null,m.traverseAncestors(e,c);var t=I;return I=null,t}var p=e("./DOMProperty"),d=e("./ReactBrowserEventEmitter"),f=(e("./ReactCurrentOwner"),e("./ReactElement")),h=e("./ReactLegacyElement"),m=e("./ReactInstanceHandles"),v=e("./ReactPerf"),g=e("./containsNode"),y=e("./deprecated"),E=e("./getReactRootElementInContainer"),C=e("./instantiateReactComponent"),R=e("./invariant"),M=e("./shouldUpdateReactComponent"),b=(e("./warning"),h.wrapCreateElement(f.createElement)),O=m.SEPARATOR,D=p.ID_ATTRIBUTE_NAME,x={},P=1,_=9,w={},T={},N=[],I=null,S={_instancesByReactRootID:w,scrollMonitor:function(e,t){t()},_updateRootComponent:function(e,t,n,r){var o=t.props;return S.scrollMonitor(n,function(){e.replaceProps(o,r)}),e},_registerComponent:function(e,t){R(t&&(t.nodeType===P||t.nodeType===_)),d.ensureScrollValueMonitoring();var n=S.registerContainer(t);return w[n]=e,n},_renderNewRootComponent:v.measure("ReactMount","_renderNewRootComponent",function(e,t,n){var r=C(e,null),o=S._registerComponent(r,t);return r.mountComponentIntoNode(o,t,n),r}),render:function(e,t,r){R(f.isValidElement(e));var o=w[n(t)];if(o){var a=o._currentElement;if(M(a,e))return S._updateRootComponent(o,e,t,r);S.unmountComponentAtNode(t)}var i=E(t),s=i&&S.isRenderedByReact(i),u=s&&!o,c=S._renderNewRootComponent(e,t,u);return r&&r.call(c),c},constructAndRenderComponent:function(e,t,n){var r=b(e,t);return S.render(r,n)},constructAndRenderComponentByID:function(e,t,n){var r=document.getElementById(n);return R(r),S.constructAndRenderComponent(e,t,r)},registerContainer:function(e){var t=n(e);return t&&(t=m.getReactRootIDFromNodeID(t)),t||(t=m.createReactRootID()),T[t]=e,t},unmountComponentAtNode:function(e){var t=n(e),r=w[t];return r?(S.unmountComponentFromNode(r,e),delete w[t],delete T[t],!0):!1},unmountComponentFromNode:function(e,t){for(e.unmountComponent(),t.nodeType===_&&(t=t.documentElement);t.lastChild;)t.removeChild(t.lastChild)},findReactContainerForID:function(e){var t=m.getReactRootIDFromNodeID(e),n=T[t];return n},findReactNodeByID:function(e){var t=S.findReactContainerForID(e);return S.findComponentRoot(t,e)},isRenderedByReact:function(e){if(1!==e.nodeType)return!1;var t=S.getID(e);return t?t.charAt(0)===O:!1},getFirstReactDOM:function(e){for(var t=e;t&&t.parentNode!==t;){if(S.isRenderedByReact(t))return t;t=t.parentNode}return null},findComponentRoot:function(e,t){var n=N,r=0,o=l(t)||e;for(n[0]=o.firstChild,n.length=1;r<n.length;){for(var a,i=n[r++];i;){var s=S.getID(i);s?t===s?a=i:m.isAncestorIDOf(s,t)&&(n.length=r=0,n.push(i.firstChild)):n.push(i.firstChild),i=i.nextSibling}if(a)return n.length=0,a}n.length=0,R(!1)},getReactRootID:n,getID:r,setID:a,getNode:i,purgeID:u};S.renderComponent=y("ReactMount","renderComponent","render",this,S.render),t.exports=S},{"./DOMProperty":11,"./ReactBrowserEventEmitter":30,"./ReactCurrentOwner":36,"./ReactElement":50,"./ReactInstanceHandles":58,"./ReactLegacyElement":59,"./ReactPerf":66,"./containsNode":99,"./deprecated":104,"./getReactRootElementInContainer":118,"./instantiateReactComponent":123,"./invariant":124,"./shouldUpdateReactComponent":138,"./warning":141}],62:[function(e,t){"use strict";function n(e,t,n){h.push({parentID:e,parentNode:null,type:c.INSERT_MARKUP,markupIndex:m.push(t)-1,textContent:null,fromIndex:null,toIndex:n})}function r(e,t,n){h.push({parentID:e,parentNode:null,type:c.MOVE_EXISTING,markupIndex:null,textContent:null,fromIndex:t,toIndex:n})}function o(e,t){h.push({parentID:e,parentNode:null,type:c.REMOVE_NODE,markupIndex:null,textContent:null,fromIndex:t,toIndex:null})}function a(e,t){h.push({parentID:e,parentNode:null,type:c.TEXT_CONTENT,markupIndex:null,textContent:t,fromIndex:null,toIndex:null})}function i(){h.length&&(u.BackendIDOperations.dangerouslyProcessChildrenUpdates(h,m),s())}function s(){h.length=0,m.length=0}var u=e("./ReactComponent"),c=e("./ReactMultiChildUpdateTypes"),l=e("./flattenChildren"),p=e("./instantiateReactComponent"),d=e("./shouldUpdateReactComponent"),f=0,h=[],m=[],v={Mixin:{mountChildren:function(e,t){var n=l(e),r=[],o=0;this._renderedChildren=n;for(var a in n){var i=n[a];if(n.hasOwnProperty(a)){var s=p(i,null);n[a]=s;var u=this._rootNodeID+a,c=s.mountComponent(u,t,this._mountDepth+1);s._mountIndex=o,r.push(c),o++}}return r},updateTextContent:function(e){f++;var t=!0;try{var n=this._renderedChildren;for(var r in n)n.hasOwnProperty(r)&&this._unmountChildByName(n[r],r);this.setTextContent(e),t=!1}finally{f--,f||(t?s():i())}},updateChildren:function(e,t){f++;var n=!0;try{this._updateChildren(e,t),n=!1}finally{f--,f||(n?s():i())}},_updateChildren:function(e,t){var n=l(e),r=this._renderedChildren;if(n||r){var o,a=0,i=0;for(o in n)if(n.hasOwnProperty(o)){var s=r&&r[o],u=s&&s._currentElement,c=n[o];if(d(u,c))this.moveChild(s,i,a),a=Math.max(s._mountIndex,a),s.receiveComponent(c,t),s._mountIndex=i;else{s&&(a=Math.max(s._mountIndex,a),this._unmountChildByName(s,o));var f=p(c,null);this._mountChildByNameAtIndex(f,o,i,t)}i++}for(o in r)!r.hasOwnProperty(o)||n&&n[o]||this._unmountChildByName(r[o],o)}},unmountChildren:function(){var e=this._renderedChildren;for(var t in e){var n=e[t];n.unmountComponent&&n.unmountComponent()}this._renderedChildren=null},moveChild:function(e,t,n){e._mountIndex<n&&r(this._rootNodeID,e._mountIndex,t)},createChild:function(e,t){n(this._rootNodeID,t,e._mountIndex)},removeChild:function(e){o(this._rootNodeID,e._mountIndex)},setTextContent:function(e){a(this._rootNodeID,e)},_mountChildByNameAtIndex:function(e,t,n,r){var o=this._rootNodeID+t,a=e.mountComponent(o,r,this._mountDepth+1);e._mountIndex=n,this.createChild(e,a),this._renderedChildren=this._renderedChildren||{},this._renderedChildren[t]=e},_unmountChildByName:function(e,t){this.removeChild(e),e._mountIndex=null,e.unmountComponent(),delete this._renderedChildren[t]}}};t.exports=v},{"./ReactComponent":32,"./ReactMultiChildUpdateTypes":63,"./flattenChildren":108,"./instantiateReactComponent":123,"./shouldUpdateReactComponent":138}],63:[function(e,t){"use strict";var n=e("./keyMirror"),r=n({INSERT_MARKUP:null,MOVE_EXISTING:null,REMOVE_NODE:null,TEXT_CONTENT:null});t.exports=r},{"./keyMirror":130}],64:[function(e,t){"use strict";function n(e,t,n){var r=i[e];return null==r?(o(a),new a(e,t)):n===e?(o(a),new a(e,t)):new r.type(t)}var r=e("./Object.assign"),o=e("./invariant"),a=null,i={},s={injectGenericComponentClass:function(e){a=e},injectComponentClasses:function(e){r(i,e)}},u={createInstanceForTag:n,injection:s};t.exports=u},{"./Object.assign":27,"./invariant":124}],65:[function(e,t){"use strict";var n=e("./emptyObject"),r=e("./invariant"),o={isValidOwner:function(e){return!(!e||"function"!=typeof e.attachRef||"function"!=typeof e.detachRef)},addComponentAsRefTo:function(e,t,n){r(o.isValidOwner(n)),n.attachRef(t,e)},removeComponentAsRefFrom:function(e,t,n){r(o.isValidOwner(n)),n.refs[t]===e&&n.detachRef(t)},Mixin:{construct:function(){this.refs=n},attachRef:function(e,t){r(t.isOwnedBy(this));var o=this.refs===n?this.refs={}:this.refs;o[e]=t},detachRef:function(e){delete this.refs[e]}}};t.exports=o},{"./emptyObject":106,"./invariant":124}],66:[function(e,t){"use strict";function n(e,t,n){return n}var r={enableMeasure:!1,storedMeasure:n,measure:function(e,t,n){return n},injection:{injectMeasure:function(e){r.storedMeasure=e}}};t.exports=r},{}],67:[function(e,t){"use strict";function n(e){return function(t,n,r){t[n]=t.hasOwnProperty(n)?e(t[n],r):r}}function r(e,t){for(var n in t)if(t.hasOwnProperty(n)){var r=c[n];r&&c.hasOwnProperty(n)?r(e,n,t[n]):e.hasOwnProperty(n)||(e[n]=t[n])}return e}var o=e("./Object.assign"),a=e("./emptyFunction"),i=e("./invariant"),s=e("./joinClasses"),u=(e("./warning"),n(function(e,t){return o({},t,e)})),c={children:a,className:n(s),style:u},l={TransferStrategies:c,mergeProps:function(e,t){return r(o({},e),t)},Mixin:{transferPropsTo:function(e){return i(e._owner===this),r(e.props,this.props),e}}};t.exports=l},{"./Object.assign":27,"./emptyFunction":105,"./invariant":124,"./joinClasses":129,"./warning":141}],68:[function(e,t){"use strict";var n={};t.exports=n},{}],69:[function(e,t){"use strict";var n=e("./keyMirror"),r=n({prop:null,context:null,childContext:null});t.exports=r},{"./keyMirror":130}],70:[function(e,t){"use strict";function n(e){function t(t,n,r,o,a){if(o=o||C,null!=n[r])return e(n,r,o,a);var i=g[a];return t?new Error("Required "+i+" `"+r+"` was not specified in "+("`"+o+"`.")):void 0}var n=t.bind(null,!1);return n.isRequired=t.bind(null,!0),n}function r(e){function t(t,n,r,o){var a=t[n],i=h(a);if(i!==e){var s=g[o],u=m(a);return new Error("Invalid "+s+" `"+n+"` of type `"+u+"` "+("supplied to `"+r+"`, expected `"+e+"`."))}}return n(t)}function o(){return n(E.thatReturns())}function a(e){function t(t,n,r,o){var a=t[n];if(!Array.isArray(a)){var i=g[o],s=h(a);return new Error("Invalid "+i+" `"+n+"` of type "+("`"+s+"` supplied to `"+r+"`, expected an array."))}for(var u=0;u<a.length;u++){var c=e(a,u,r,o);if(c instanceof Error)return c}}return n(t)}function i(){function e(e,t,n,r){if(!v.isValidElement(e[t])){var o=g[r];return new Error("Invalid "+o+" `"+t+"` supplied to "+("`"+n+"`, expected a ReactElement."))}}return n(e)}function s(e){function t(t,n,r,o){if(!(t[n]instanceof e)){var a=g[o],i=e.name||C;return new Error("Invalid "+a+" `"+n+"` supplied to "+("`"+r+"`, expected instance of `"+i+"`."))}}return n(t)}function u(e){function t(t,n,r,o){for(var a=t[n],i=0;i<e.length;i++)if(a===e[i])return;var s=g[o],u=JSON.stringify(e);return new Error("Invalid "+s+" `"+n+"` of value `"+a+"` "+("supplied to `"+r+"`, expected one of "+u+"."))}return n(t)}function c(e){function t(t,n,r,o){var a=t[n],i=h(a);if("object"!==i){var s=g[o];return new Error("Invalid "+s+" `"+n+"` of type "+("`"+i+"` supplied to `"+r+"`, expected an object."))}for(var u in a)if(a.hasOwnProperty(u)){var c=e(a,u,r,o);if(c instanceof Error)return c}}return n(t)}function l(e){function t(t,n,r,o){for(var a=0;a<e.length;a++){var i=e[a];if(null==i(t,n,r,o))return}var s=g[o];return new Error("Invalid "+s+" `"+n+"` supplied to "+("`"+r+"`."))}return n(t)}function p(){function e(e,t,n,r){if(!f(e[t])){var o=g[r];return new Error("Invalid "+o+" `"+t+"` supplied to "+("`"+n+"`, expected a ReactNode."))}}return n(e)}function d(e){function t(t,n,r,o){var a=t[n],i=h(a);if("object"!==i){var s=g[o];return new Error("Invalid "+s+" `"+n+"` of type `"+i+"` "+("supplied to `"+r+"`, expected `object`."))}for(var u in e){var c=e[u];if(c){var l=c(a,u,r,o);if(l)return l}}}return n(t,"expected `object`")}function f(e){switch(typeof e){case"number":case"string":return!0;case"boolean":return!e;case"object":if(Array.isArray(e))return e.every(f);if(v.isValidElement(e))return!0;for(var t in e)if(!f(e[t]))return!1;return!0;default:return!1}}function h(e){var t=typeof e;return Array.isArray(e)?"array":e instanceof RegExp?"object":t}function m(e){var t=h(e);if("object"===t){if(e instanceof Date)return"date";if(e instanceof RegExp)return"regexp"}return t}var v=e("./ReactElement"),g=e("./ReactPropTypeLocationNames"),y=e("./deprecated"),E=e("./emptyFunction"),C="<<anonymous>>",R=i(),M=p(),b={array:r("array"),bool:r("boolean"),func:r("function"),number:r("number"),object:r("object"),string:r("string"),any:o(),arrayOf:a,element:R,instanceOf:s,node:M,objectOf:c,oneOf:u,oneOfType:l,shape:d,component:y("React.PropTypes","component","element",this,R),renderable:y("React.PropTypes","renderable","node",this,M)};t.exports=b},{"./ReactElement":50,"./ReactPropTypeLocationNames":68,"./deprecated":104,"./emptyFunction":105}],71:[function(e,t){"use strict";function n(){this.listenersToPut=[]}var r=e("./PooledClass"),o=e("./ReactBrowserEventEmitter"),a=e("./Object.assign");a(n.prototype,{enqueuePutListener:function(e,t,n){this.listenersToPut.push({rootNodeID:e,propKey:t,propValue:n})},putListeners:function(){for(var e=0;e<this.listenersToPut.length;e++){var t=this.listenersToPut[e];o.putListener(t.rootNodeID,t.propKey,t.propValue)}},reset:function(){this.listenersToPut.length=0},destructor:function(){this.reset()}}),r.addPoolingTo(n),t.exports=n},{"./Object.assign":27,"./PooledClass":28,"./ReactBrowserEventEmitter":30}],72:[function(e,t){"use strict";function n(){this.reinitializeTransaction(),this.renderToStaticMarkup=!1,this.reactMountReady=r.getPooled(null),this.putListenerQueue=s.getPooled()}var r=e("./CallbackQueue"),o=e("./PooledClass"),a=e("./ReactBrowserEventEmitter"),i=e("./ReactInputSelection"),s=e("./ReactPutListenerQueue"),u=e("./Transaction"),c=e("./Object.assign"),l={initialize:i.getSelectionInformation,close:i.restoreSelection},p={initialize:function(){var e=a.isEnabled();return a.setEnabled(!1),e},close:function(e){a.setEnabled(e)}},d={initialize:function(){this.reactMountReady.reset()},close:function(){this.reactMountReady.notifyAll()}},f={initialize:function(){this.putListenerQueue.reset()},close:function(){this.putListenerQueue.putListeners()}},h=[f,l,p,d],m={getTransactionWrappers:function(){return h},getReactMountReady:function(){return this.reactMountReady},getPutListenerQueue:function(){return this.putListenerQueue},destructor:function(){r.release(this.reactMountReady),this.reactMountReady=null,s.release(this.putListenerQueue),this.putListenerQueue=null}};c(n.prototype,u.Mixin,m),o.addPoolingTo(n),t.exports=n
},{"./CallbackQueue":6,"./Object.assign":27,"./PooledClass":28,"./ReactBrowserEventEmitter":30,"./ReactInputSelection":57,"./ReactPutListenerQueue":71,"./Transaction":93}],73:[function(e,t){"use strict";var n={injectCreateReactRootIndex:function(e){r.createReactRootIndex=e}},r={createReactRootIndex:null,injection:n};t.exports=r},{}],74:[function(e,t){"use strict";function n(e){c(o.isValidElement(e));var t;try{var n=a.createReactRootID();return t=s.getPooled(!1),t.perform(function(){var r=u(e,null),o=r.mountComponent(n,t,0);return i.addChecksumToMarkup(o)},null)}finally{s.release(t)}}function r(e){c(o.isValidElement(e));var t;try{var n=a.createReactRootID();return t=s.getPooled(!0),t.perform(function(){var r=u(e,null);return r.mountComponent(n,t,0)},null)}finally{s.release(t)}}var o=e("./ReactElement"),a=e("./ReactInstanceHandles"),i=e("./ReactMarkupChecksum"),s=e("./ReactServerRenderingTransaction"),u=e("./instantiateReactComponent"),c=e("./invariant");t.exports={renderToString:n,renderToStaticMarkup:r}},{"./ReactElement":50,"./ReactInstanceHandles":58,"./ReactMarkupChecksum":60,"./ReactServerRenderingTransaction":75,"./instantiateReactComponent":123,"./invariant":124}],75:[function(e,t){"use strict";function n(e){this.reinitializeTransaction(),this.renderToStaticMarkup=e,this.reactMountReady=o.getPooled(null),this.putListenerQueue=a.getPooled()}var r=e("./PooledClass"),o=e("./CallbackQueue"),a=e("./ReactPutListenerQueue"),i=e("./Transaction"),s=e("./Object.assign"),u=e("./emptyFunction"),c={initialize:function(){this.reactMountReady.reset()},close:u},l={initialize:function(){this.putListenerQueue.reset()},close:u},p=[l,c],d={getTransactionWrappers:function(){return p},getReactMountReady:function(){return this.reactMountReady},getPutListenerQueue:function(){return this.putListenerQueue},destructor:function(){o.release(this.reactMountReady),this.reactMountReady=null,a.release(this.putListenerQueue),this.putListenerQueue=null}};s(n.prototype,i.Mixin,d),r.addPoolingTo(n),t.exports=n},{"./CallbackQueue":6,"./Object.assign":27,"./PooledClass":28,"./ReactPutListenerQueue":71,"./Transaction":93,"./emptyFunction":105}],76:[function(e,t){"use strict";var n=e("./DOMPropertyOperations"),r=e("./ReactComponent"),o=e("./ReactElement"),a=e("./Object.assign"),i=e("./escapeTextForBrowser"),s=function(){};a(s.prototype,r.Mixin,{mountComponent:function(e,t,o){r.Mixin.mountComponent.call(this,e,t,o);var a=i(this.props);return t.renderToStaticMarkup?a:"<span "+n.createMarkupForID(e)+">"+a+"</span>"},receiveComponent:function(e){var t=e.props;t!==this.props&&(this.props=t,r.BackendIDOperations.updateTextContentByID(this._rootNodeID,t))}});var u=function(e){return new o(s,null,null,null,null,e)};u.type=s,t.exports=u},{"./DOMPropertyOperations":12,"./Object.assign":27,"./ReactComponent":32,"./ReactElement":50,"./escapeTextForBrowser":107}],77:[function(e,t){"use strict";function n(){h(O.ReactReconcileTransaction&&y)}function r(){this.reinitializeTransaction(),this.dirtyComponentsLength=null,this.callbackQueue=c.getPooled(),this.reconcileTransaction=O.ReactReconcileTransaction.getPooled()}function o(e,t,r){n(),y.batchedUpdates(e,t,r)}function a(e,t){return e._mountDepth-t._mountDepth}function i(e){var t=e.dirtyComponentsLength;h(t===m.length),m.sort(a);for(var n=0;t>n;n++){var r=m[n];if(r.isMounted()){var o=r._pendingCallbacks;if(r._pendingCallbacks=null,r.performUpdateIfNecessary(e.reconcileTransaction),o)for(var i=0;i<o.length;i++)e.callbackQueue.enqueue(o[i],r)}}}function s(e,t){return h(!t||"function"==typeof t),n(),y.isBatchingUpdates?(m.push(e),void(t&&(e._pendingCallbacks?e._pendingCallbacks.push(t):e._pendingCallbacks=[t]))):void y.batchedUpdates(s,e,t)}function u(e,t){h(y.isBatchingUpdates),v.enqueue(e,t),g=!0}var c=e("./CallbackQueue"),l=e("./PooledClass"),p=(e("./ReactCurrentOwner"),e("./ReactPerf")),d=e("./Transaction"),f=e("./Object.assign"),h=e("./invariant"),m=(e("./warning"),[]),v=c.getPooled(),g=!1,y=null,E={initialize:function(){this.dirtyComponentsLength=m.length},close:function(){this.dirtyComponentsLength!==m.length?(m.splice(0,this.dirtyComponentsLength),M()):m.length=0}},C={initialize:function(){this.callbackQueue.reset()},close:function(){this.callbackQueue.notifyAll()}},R=[E,C];f(r.prototype,d.Mixin,{getTransactionWrappers:function(){return R},destructor:function(){this.dirtyComponentsLength=null,c.release(this.callbackQueue),this.callbackQueue=null,O.ReactReconcileTransaction.release(this.reconcileTransaction),this.reconcileTransaction=null},perform:function(e,t,n){return d.Mixin.perform.call(this,this.reconcileTransaction.perform,this.reconcileTransaction,e,t,n)}}),l.addPoolingTo(r);var M=p.measure("ReactUpdates","flushBatchedUpdates",function(){for(;m.length||g;){if(m.length){var e=r.getPooled();e.perform(i,null,e),r.release(e)}if(g){g=!1;var t=v;v=c.getPooled(),t.notifyAll(),c.release(t)}}}),b={injectReconcileTransaction:function(e){h(e),O.ReactReconcileTransaction=e},injectBatchingStrategy:function(e){h(e),h("function"==typeof e.batchedUpdates),h("boolean"==typeof e.isBatchingUpdates),y=e}},O={ReactReconcileTransaction:null,batchedUpdates:o,enqueueUpdate:s,flushBatchedUpdates:M,injection:b,asap:u};t.exports=O},{"./CallbackQueue":6,"./Object.assign":27,"./PooledClass":28,"./ReactCurrentOwner":36,"./ReactPerf":66,"./Transaction":93,"./invariant":124,"./warning":141}],78:[function(e,t){"use strict";var n=e("./DOMProperty"),r=n.injection.MUST_USE_ATTRIBUTE,o={Properties:{cx:r,cy:r,d:r,dx:r,dy:r,fill:r,fillOpacity:r,fontFamily:r,fontSize:r,fx:r,fy:r,gradientTransform:r,gradientUnits:r,markerEnd:r,markerMid:r,markerStart:r,offset:r,opacity:r,patternContentUnits:r,patternUnits:r,points:r,preserveAspectRatio:r,r:r,rx:r,ry:r,spreadMethod:r,stopColor:r,stopOpacity:r,stroke:r,strokeDasharray:r,strokeLinecap:r,strokeOpacity:r,strokeWidth:r,textAnchor:r,transform:r,version:r,viewBox:r,x1:r,x2:r,x:r,y1:r,y2:r,y:r},DOMAttributeNames:{fillOpacity:"fill-opacity",fontFamily:"font-family",fontSize:"font-size",gradientTransform:"gradientTransform",gradientUnits:"gradientUnits",markerEnd:"marker-end",markerMid:"marker-mid",markerStart:"marker-start",patternContentUnits:"patternContentUnits",patternUnits:"patternUnits",preserveAspectRatio:"preserveAspectRatio",spreadMethod:"spreadMethod",stopColor:"stop-color",stopOpacity:"stop-opacity",strokeDasharray:"stroke-dasharray",strokeLinecap:"stroke-linecap",strokeOpacity:"stroke-opacity",strokeWidth:"stroke-width",textAnchor:"text-anchor",viewBox:"viewBox"}};t.exports=o},{"./DOMProperty":11}],79:[function(e,t){"use strict";function n(e){if("selectionStart"in e&&i.hasSelectionCapabilities(e))return{start:e.selectionStart,end:e.selectionEnd};if(window.getSelection){var t=window.getSelection();return{anchorNode:t.anchorNode,anchorOffset:t.anchorOffset,focusNode:t.focusNode,focusOffset:t.focusOffset}}if(document.selection){var n=document.selection.createRange();return{parentElement:n.parentElement(),text:n.text,top:n.boundingTop,left:n.boundingLeft}}}function r(e){if(!g&&null!=h&&h==u()){var t=n(h);if(!v||!p(v,t)){v=t;var r=s.getPooled(f.select,m,e);return r.type="select",r.target=h,a.accumulateTwoPhaseDispatches(r),r}}}var o=e("./EventConstants"),a=e("./EventPropagators"),i=e("./ReactInputSelection"),s=e("./SyntheticEvent"),u=e("./getActiveElement"),c=e("./isTextInputElement"),l=e("./keyOf"),p=e("./shallowEqual"),d=o.topLevelTypes,f={select:{phasedRegistrationNames:{bubbled:l({onSelect:null}),captured:l({onSelectCapture:null})},dependencies:[d.topBlur,d.topContextMenu,d.topFocus,d.topKeyDown,d.topMouseDown,d.topMouseUp,d.topSelectionChange]}},h=null,m=null,v=null,g=!1,y={eventTypes:f,extractEvents:function(e,t,n,o){switch(e){case d.topFocus:(c(t)||"true"===t.contentEditable)&&(h=t,m=n,v=null);break;case d.topBlur:h=null,m=null,v=null;break;case d.topMouseDown:g=!0;break;case d.topContextMenu:case d.topMouseUp:return g=!1,r(o);case d.topSelectionChange:case d.topKeyDown:case d.topKeyUp:return r(o)}}};t.exports=y},{"./EventConstants":16,"./EventPropagators":21,"./ReactInputSelection":57,"./SyntheticEvent":85,"./getActiveElement":111,"./isTextInputElement":127,"./keyOf":131,"./shallowEqual":137}],80:[function(e,t){"use strict";var n=Math.pow(2,53),r={createReactRootIndex:function(){return Math.ceil(Math.random()*n)}};t.exports=r},{}],81:[function(e,t){"use strict";var n=e("./EventConstants"),r=e("./EventPluginUtils"),o=e("./EventPropagators"),a=e("./SyntheticClipboardEvent"),i=e("./SyntheticEvent"),s=e("./SyntheticFocusEvent"),u=e("./SyntheticKeyboardEvent"),c=e("./SyntheticMouseEvent"),l=e("./SyntheticDragEvent"),p=e("./SyntheticTouchEvent"),d=e("./SyntheticUIEvent"),f=e("./SyntheticWheelEvent"),h=e("./getEventCharCode"),m=e("./invariant"),v=e("./keyOf"),g=(e("./warning"),n.topLevelTypes),y={blur:{phasedRegistrationNames:{bubbled:v({onBlur:!0}),captured:v({onBlurCapture:!0})}},click:{phasedRegistrationNames:{bubbled:v({onClick:!0}),captured:v({onClickCapture:!0})}},contextMenu:{phasedRegistrationNames:{bubbled:v({onContextMenu:!0}),captured:v({onContextMenuCapture:!0})}},copy:{phasedRegistrationNames:{bubbled:v({onCopy:!0}),captured:v({onCopyCapture:!0})}},cut:{phasedRegistrationNames:{bubbled:v({onCut:!0}),captured:v({onCutCapture:!0})}},doubleClick:{phasedRegistrationNames:{bubbled:v({onDoubleClick:!0}),captured:v({onDoubleClickCapture:!0})}},drag:{phasedRegistrationNames:{bubbled:v({onDrag:!0}),captured:v({onDragCapture:!0})}},dragEnd:{phasedRegistrationNames:{bubbled:v({onDragEnd:!0}),captured:v({onDragEndCapture:!0})}},dragEnter:{phasedRegistrationNames:{bubbled:v({onDragEnter:!0}),captured:v({onDragEnterCapture:!0})}},dragExit:{phasedRegistrationNames:{bubbled:v({onDragExit:!0}),captured:v({onDragExitCapture:!0})}},dragLeave:{phasedRegistrationNames:{bubbled:v({onDragLeave:!0}),captured:v({onDragLeaveCapture:!0})}},dragOver:{phasedRegistrationNames:{bubbled:v({onDragOver:!0}),captured:v({onDragOverCapture:!0})}},dragStart:{phasedRegistrationNames:{bubbled:v({onDragStart:!0}),captured:v({onDragStartCapture:!0})}},drop:{phasedRegistrationNames:{bubbled:v({onDrop:!0}),captured:v({onDropCapture:!0})}},focus:{phasedRegistrationNames:{bubbled:v({onFocus:!0}),captured:v({onFocusCapture:!0})}},input:{phasedRegistrationNames:{bubbled:v({onInput:!0}),captured:v({onInputCapture:!0})}},keyDown:{phasedRegistrationNames:{bubbled:v({onKeyDown:!0}),captured:v({onKeyDownCapture:!0})}},keyPress:{phasedRegistrationNames:{bubbled:v({onKeyPress:!0}),captured:v({onKeyPressCapture:!0})}},keyUp:{phasedRegistrationNames:{bubbled:v({onKeyUp:!0}),captured:v({onKeyUpCapture:!0})}},load:{phasedRegistrationNames:{bubbled:v({onLoad:!0}),captured:v({onLoadCapture:!0})}},error:{phasedRegistrationNames:{bubbled:v({onError:!0}),captured:v({onErrorCapture:!0})}},mouseDown:{phasedRegistrationNames:{bubbled:v({onMouseDown:!0}),captured:v({onMouseDownCapture:!0})}},mouseMove:{phasedRegistrationNames:{bubbled:v({onMouseMove:!0}),captured:v({onMouseMoveCapture:!0})}},mouseOut:{phasedRegistrationNames:{bubbled:v({onMouseOut:!0}),captured:v({onMouseOutCapture:!0})}},mouseOver:{phasedRegistrationNames:{bubbled:v({onMouseOver:!0}),captured:v({onMouseOverCapture:!0})}},mouseUp:{phasedRegistrationNames:{bubbled:v({onMouseUp:!0}),captured:v({onMouseUpCapture:!0})}},paste:{phasedRegistrationNames:{bubbled:v({onPaste:!0}),captured:v({onPasteCapture:!0})}},reset:{phasedRegistrationNames:{bubbled:v({onReset:!0}),captured:v({onResetCapture:!0})}},scroll:{phasedRegistrationNames:{bubbled:v({onScroll:!0}),captured:v({onScrollCapture:!0})}},submit:{phasedRegistrationNames:{bubbled:v({onSubmit:!0}),captured:v({onSubmitCapture:!0})}},touchCancel:{phasedRegistrationNames:{bubbled:v({onTouchCancel:!0}),captured:v({onTouchCancelCapture:!0})}},touchEnd:{phasedRegistrationNames:{bubbled:v({onTouchEnd:!0}),captured:v({onTouchEndCapture:!0})}},touchMove:{phasedRegistrationNames:{bubbled:v({onTouchMove:!0}),captured:v({onTouchMoveCapture:!0})}},touchStart:{phasedRegistrationNames:{bubbled:v({onTouchStart:!0}),captured:v({onTouchStartCapture:!0})}},wheel:{phasedRegistrationNames:{bubbled:v({onWheel:!0}),captured:v({onWheelCapture:!0})}}},E={topBlur:y.blur,topClick:y.click,topContextMenu:y.contextMenu,topCopy:y.copy,topCut:y.cut,topDoubleClick:y.doubleClick,topDrag:y.drag,topDragEnd:y.dragEnd,topDragEnter:y.dragEnter,topDragExit:y.dragExit,topDragLeave:y.dragLeave,topDragOver:y.dragOver,topDragStart:y.dragStart,topDrop:y.drop,topError:y.error,topFocus:y.focus,topInput:y.input,topKeyDown:y.keyDown,topKeyPress:y.keyPress,topKeyUp:y.keyUp,topLoad:y.load,topMouseDown:y.mouseDown,topMouseMove:y.mouseMove,topMouseOut:y.mouseOut,topMouseOver:y.mouseOver,topMouseUp:y.mouseUp,topPaste:y.paste,topReset:y.reset,topScroll:y.scroll,topSubmit:y.submit,topTouchCancel:y.touchCancel,topTouchEnd:y.touchEnd,topTouchMove:y.touchMove,topTouchStart:y.touchStart,topWheel:y.wheel};for(var C in E)E[C].dependencies=[C];var R={eventTypes:y,executeDispatch:function(e,t,n){var o=r.executeDispatch(e,t,n);o===!1&&(e.stopPropagation(),e.preventDefault())},extractEvents:function(e,t,n,r){var v=E[e];if(!v)return null;var y;switch(e){case g.topInput:case g.topLoad:case g.topError:case g.topReset:case g.topSubmit:y=i;break;case g.topKeyPress:if(0===h(r))return null;case g.topKeyDown:case g.topKeyUp:y=u;break;case g.topBlur:case g.topFocus:y=s;break;case g.topClick:if(2===r.button)return null;case g.topContextMenu:case g.topDoubleClick:case g.topMouseDown:case g.topMouseMove:case g.topMouseOut:case g.topMouseOver:case g.topMouseUp:y=c;break;case g.topDrag:case g.topDragEnd:case g.topDragEnter:case g.topDragExit:case g.topDragLeave:case g.topDragOver:case g.topDragStart:case g.topDrop:y=l;break;case g.topTouchCancel:case g.topTouchEnd:case g.topTouchMove:case g.topTouchStart:y=p;break;case g.topScroll:y=d;break;case g.topWheel:y=f;break;case g.topCopy:case g.topCut:case g.topPaste:y=a}m(y);var C=y.getPooled(v,n,r);return o.accumulateTwoPhaseDispatches(C),C}};t.exports=R},{"./EventConstants":16,"./EventPluginUtils":20,"./EventPropagators":21,"./SyntheticClipboardEvent":82,"./SyntheticDragEvent":84,"./SyntheticEvent":85,"./SyntheticFocusEvent":86,"./SyntheticKeyboardEvent":88,"./SyntheticMouseEvent":89,"./SyntheticTouchEvent":90,"./SyntheticUIEvent":91,"./SyntheticWheelEvent":92,"./getEventCharCode":112,"./invariant":124,"./keyOf":131,"./warning":141}],82:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticEvent"),o={clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}};r.augmentClass(n,o),t.exports=n},{"./SyntheticEvent":85}],83:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticEvent"),o={data:null};r.augmentClass(n,o),t.exports=n},{"./SyntheticEvent":85}],84:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticMouseEvent"),o={dataTransfer:null};r.augmentClass(n,o),t.exports=n},{"./SyntheticMouseEvent":89}],85:[function(e,t){"use strict";function n(e,t,n){this.dispatchConfig=e,this.dispatchMarker=t,this.nativeEvent=n;var r=this.constructor.Interface;for(var o in r)if(r.hasOwnProperty(o)){var i=r[o];this[o]=i?i(n):n[o]}var s=null!=n.defaultPrevented?n.defaultPrevented:n.returnValue===!1;this.isDefaultPrevented=s?a.thatReturnsTrue:a.thatReturnsFalse,this.isPropagationStopped=a.thatReturnsFalse}var r=e("./PooledClass"),o=e("./Object.assign"),a=e("./emptyFunction"),i=e("./getEventTarget"),s={type:null,target:i,currentTarget:a.thatReturnsNull,eventPhase:null,bubbles:null,cancelable:null,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:null,isTrusted:null};o(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e.preventDefault?e.preventDefault():e.returnValue=!1,this.isDefaultPrevented=a.thatReturnsTrue},stopPropagation:function(){var e=this.nativeEvent;e.stopPropagation?e.stopPropagation():e.cancelBubble=!0,this.isPropagationStopped=a.thatReturnsTrue},persist:function(){this.isPersistent=a.thatReturnsTrue},isPersistent:a.thatReturnsFalse,destructor:function(){var e=this.constructor.Interface;for(var t in e)this[t]=null;this.dispatchConfig=null,this.dispatchMarker=null,this.nativeEvent=null}}),n.Interface=s,n.augmentClass=function(e,t){var n=this,a=Object.create(n.prototype);o(a,e.prototype),e.prototype=a,e.prototype.constructor=e,e.Interface=o({},n.Interface,t),e.augmentClass=n.augmentClass,r.addPoolingTo(e,r.threeArgumentPooler)},r.addPoolingTo(n,r.threeArgumentPooler),t.exports=n},{"./Object.assign":27,"./PooledClass":28,"./emptyFunction":105,"./getEventTarget":115}],86:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticUIEvent"),o={relatedTarget:null};r.augmentClass(n,o),t.exports=n},{"./SyntheticUIEvent":91}],87:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticEvent"),o={data:null};r.augmentClass(n,o),t.exports=n},{"./SyntheticEvent":85}],88:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticUIEvent"),o=e("./getEventCharCode"),a=e("./getEventKey"),i=e("./getEventModifierState"),s={key:a,location:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,repeat:null,locale:null,getModifierState:i,charCode:function(e){return"keypress"===e.type?o(e):0},keyCode:function(e){return"keydown"===e.type||"keyup"===e.type?e.keyCode:0},which:function(e){return"keypress"===e.type?o(e):"keydown"===e.type||"keyup"===e.type?e.keyCode:0}};r.augmentClass(n,s),t.exports=n},{"./SyntheticUIEvent":91,"./getEventCharCode":112,"./getEventKey":113,"./getEventModifierState":114}],89:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticUIEvent"),o=e("./ViewportMetrics"),a=e("./getEventModifierState"),i={screenX:null,screenY:null,clientX:null,clientY:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,getModifierState:a,button:function(e){var t=e.button;return"which"in e?t:2===t?2:4===t?1:0},buttons:null,relatedTarget:function(e){return e.relatedTarget||(e.fromElement===e.srcElement?e.toElement:e.fromElement)},pageX:function(e){return"pageX"in e?e.pageX:e.clientX+o.currentScrollLeft},pageY:function(e){return"pageY"in e?e.pageY:e.clientY+o.currentScrollTop}};r.augmentClass(n,i),t.exports=n},{"./SyntheticUIEvent":91,"./ViewportMetrics":94,"./getEventModifierState":114}],90:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticUIEvent"),o=e("./getEventModifierState"),a={touches:null,targetTouches:null,changedTouches:null,altKey:null,metaKey:null,ctrlKey:null,shiftKey:null,getModifierState:o};r.augmentClass(n,a),t.exports=n},{"./SyntheticUIEvent":91,"./getEventModifierState":114}],91:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticEvent"),o=e("./getEventTarget"),a={view:function(e){if(e.view)return e.view;var t=o(e);if(null!=t&&t.window===t)return t;var n=t.ownerDocument;return n?n.defaultView||n.parentWindow:window},detail:function(e){return e.detail||0}};r.augmentClass(n,a),t.exports=n},{"./SyntheticEvent":85,"./getEventTarget":115}],92:[function(e,t){"use strict";function n(e,t,n){r.call(this,e,t,n)}var r=e("./SyntheticMouseEvent"),o={deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:null,deltaMode:null};r.augmentClass(n,o),t.exports=n},{"./SyntheticMouseEvent":89}],93:[function(e,t){"use strict";var n=e("./invariant"),r={reinitializeTransaction:function(){this.transactionWrappers=this.getTransactionWrappers(),this.wrapperInitData?this.wrapperInitData.length=0:this.wrapperInitData=[],this._isInTransaction=!1},_isInTransaction:!1,getTransactionWrappers:null,isInTransaction:function(){return!!this._isInTransaction},perform:function(e,t,r,o,a,i,s,u){n(!this.isInTransaction());var c,l;try{this._isInTransaction=!0,c=!0,this.initializeAll(0),l=e.call(t,r,o,a,i,s,u),c=!1}finally{try{if(c)try{this.closeAll(0)}catch(p){}else this.closeAll(0)}finally{this._isInTransaction=!1}}return l},initializeAll:function(e){for(var t=this.transactionWrappers,n=e;n<t.length;n++){var r=t[n];try{this.wrapperInitData[n]=o.OBSERVED_ERROR,this.wrapperInitData[n]=r.initialize?r.initialize.call(this):null}finally{if(this.wrapperInitData[n]===o.OBSERVED_ERROR)try{this.initializeAll(n+1)}catch(a){}}}},closeAll:function(e){n(this.isInTransaction());for(var t=this.transactionWrappers,r=e;r<t.length;r++){var a,i=t[r],s=this.wrapperInitData[r];try{a=!0,s!==o.OBSERVED_ERROR&&i.close&&i.close.call(this,s),a=!1}finally{if(a)try{this.closeAll(r+1)}catch(u){}}}this.wrapperInitData.length=0}},o={Mixin:r,OBSERVED_ERROR:{}};t.exports=o},{"./invariant":124}],94:[function(e,t){"use strict";var n=e("./getUnboundedScrollPosition"),r={currentScrollLeft:0,currentScrollTop:0,refreshScrollValues:function(){var e=n(window);r.currentScrollLeft=e.x,r.currentScrollTop=e.y}};t.exports=r},{"./getUnboundedScrollPosition":120}],95:[function(e,t){"use strict";function n(e,t){if(r(null!=t),null==e)return t;var n=Array.isArray(e),o=Array.isArray(t);return n&&o?(e.push.apply(e,t),e):n?(e.push(t),e):o?[e].concat(t):[e,t]}var r=e("./invariant");t.exports=n},{"./invariant":124}],96:[function(e,t){"use strict";function n(e){for(var t=1,n=0,o=0;o<e.length;o++)t=(t+e.charCodeAt(o))%r,n=(n+t)%r;return t|n<<16}var r=65521;t.exports=n},{}],97:[function(e,t){function n(e){return e.replace(r,function(e,t){return t.toUpperCase()})}var r=/-(.)/g;t.exports=n},{}],98:[function(e,t){"use strict";function n(e){return r(e.replace(o,"ms-"))}var r=e("./camelize"),o=/^-ms-/;t.exports=n},{"./camelize":97}],99:[function(e,t){function n(e,t){return e&&t?e===t?!0:r(e)?!1:r(t)?n(e,t.parentNode):e.contains?e.contains(t):e.compareDocumentPosition?!!(16&e.compareDocumentPosition(t)):!1:!1}var r=e("./isTextNode");t.exports=n},{"./isTextNode":128}],100:[function(e,t){function n(e){return!!e&&("object"==typeof e||"function"==typeof e)&&"length"in e&&!("setInterval"in e)&&"number"!=typeof e.nodeType&&(Array.isArray(e)||"callee"in e||"item"in e)}function r(e){return n(e)?Array.isArray(e)?e.slice():o(e):[e]}var o=e("./toArray");t.exports=r},{"./toArray":139}],101:[function(e,t){"use strict";function n(e){var t=o.createFactory(e),n=r.createClass({displayName:"ReactFullPageComponent"+e,componentWillUnmount:function(){a(!1)},render:function(){return t(this.props)}});return n}var r=e("./ReactCompositeComponent"),o=e("./ReactElement"),a=e("./invariant");t.exports=n},{"./ReactCompositeComponent":34,"./ReactElement":50,"./invariant":124}],102:[function(e,t){function n(e){var t=e.match(c);return t&&t[1].toLowerCase()}function r(e,t){var r=u;s(!!u);var o=n(e),c=o&&i(o);if(c){r.innerHTML=c[1]+e+c[2];for(var l=c[0];l--;)r=r.lastChild}else r.innerHTML=e;var p=r.getElementsByTagName("script");p.length&&(s(t),a(p).forEach(t));for(var d=a(r.childNodes);r.lastChild;)r.removeChild(r.lastChild);return d}var o=e("./ExecutionEnvironment"),a=e("./createArrayFrom"),i=e("./getMarkupWrap"),s=e("./invariant"),u=o.canUseDOM?document.createElement("div"):null,c=/^\s*<(\w+)/;t.exports=r},{"./ExecutionEnvironment":22,"./createArrayFrom":100,"./getMarkupWrap":116,"./invariant":124}],103:[function(e,t){"use strict";function n(e,t){var n=null==t||"boolean"==typeof t||""===t;if(n)return"";var r=isNaN(t);return r||0===t||o.hasOwnProperty(e)&&o[e]?""+t:("string"==typeof t&&(t=t.trim()),t+"px")}var r=e("./CSSProperty"),o=r.isUnitlessNumber;t.exports=n},{"./CSSProperty":4}],104:[function(e,t){function n(e,t,n,r,o){return o}e("./Object.assign"),e("./warning");t.exports=n},{"./Object.assign":27,"./warning":141}],105:[function(e,t){function n(e){return function(){return e}}function r(){}r.thatReturns=n,r.thatReturnsFalse=n(!1),r.thatReturnsTrue=n(!0),r.thatReturnsNull=n(null),r.thatReturnsThis=function(){return this},r.thatReturnsArgument=function(e){return e},t.exports=r},{}],106:[function(e,t){"use strict";var n={};t.exports=n},{}],107:[function(e,t){"use strict";function n(e){return o[e]}function r(e){return(""+e).replace(a,n)}var o={"&":"&amp;",">":"&gt;","<":"&lt;",'"':"&quot;","'":"&#x27;"},a=/[&><"']/g;t.exports=r},{}],108:[function(e,t){"use strict";function n(e,t,n){var r=e,a=!r.hasOwnProperty(n);if(a&&null!=t){var i,s=typeof t;i="string"===s?o(t):"number"===s?o(""+t):t,r[n]=i}}function r(e){if(null==e)return e;var t={};return a(e,n,t),t}{var o=e("./ReactTextComponent"),a=e("./traverseAllChildren");e("./warning")}t.exports=r},{"./ReactTextComponent":76,"./traverseAllChildren":140,"./warning":141}],109:[function(e,t){"use strict";function n(e){try{e.focus()}catch(t){}}t.exports=n},{}],110:[function(e,t){"use strict";var n=function(e,t,n){Array.isArray(e)?e.forEach(t,n):e&&t.call(n,e)};t.exports=n},{}],111:[function(e,t){function n(){try{return document.activeElement||document.body}catch(e){return document.body}}t.exports=n},{}],112:[function(e,t){"use strict";function n(e){var t,n=e.keyCode;return"charCode"in e?(t=e.charCode,0===t&&13===n&&(t=13)):t=n,t>=32||13===t?t:0}t.exports=n},{}],113:[function(e,t){"use strict";function n(e){if(e.key){var t=o[e.key]||e.key;if("Unidentified"!==t)return t}if("keypress"===e.type){var n=r(e);return 13===n?"Enter":String.fromCharCode(n)}return"keydown"===e.type||"keyup"===e.type?a[e.keyCode]||"Unidentified":""}var r=e("./getEventCharCode"),o={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},a={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"};t.exports=n},{"./getEventCharCode":112}],114:[function(e,t){"use strict";function n(e){var t=this,n=t.nativeEvent;if(n.getModifierState)return n.getModifierState(e);var r=o[e];return r?!!n[r]:!1}function r(){return n}var o={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};t.exports=r},{}],115:[function(e,t){"use strict";function n(e){var t=e.target||e.srcElement||window;return 3===t.nodeType?t.parentNode:t}t.exports=n},{}],116:[function(e,t){function n(e){return o(!!a),p.hasOwnProperty(e)||(e="*"),i.hasOwnProperty(e)||(a.innerHTML="*"===e?"<link />":"<"+e+"></"+e+">",i[e]=!a.firstChild),i[e]?p[e]:null}var r=e("./ExecutionEnvironment"),o=e("./invariant"),a=r.canUseDOM?document.createElement("div"):null,i={circle:!0,defs:!0,ellipse:!0,g:!0,line:!0,linearGradient:!0,path:!0,polygon:!0,polyline:!0,radialGradient:!0,rect:!0,stop:!0,text:!0},s=[1,'<select multiple="true">',"</select>"],u=[1,"<table>","</table>"],c=[3,"<table><tbody><tr>","</tr></tbody></table>"],l=[1,"<svg>","</svg>"],p={"*":[1,"?<div>","</div>"],area:[1,"<map>","</map>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],legend:[1,"<fieldset>","</fieldset>"],param:[1,"<object>","</object>"],tr:[2,"<table><tbody>","</tbody></table>"],optgroup:s,option:s,caption:u,colgroup:u,tbody:u,tfoot:u,thead:u,td:c,th:c,circle:l,defs:l,ellipse:l,g:l,line:l,linearGradient:l,path:l,polygon:l,polyline:l,radialGradient:l,rect:l,stop:l,text:l};t.exports=n},{"./ExecutionEnvironment":22,"./invariant":124}],117:[function(e,t){"use strict";function n(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function r(e){for(;e;){if(e.nextSibling)return e.nextSibling;e=e.parentNode}}function o(e,t){for(var o=n(e),a=0,i=0;o;){if(3==o.nodeType){if(i=a+o.textContent.length,t>=a&&i>=t)return{node:o,offset:t-a};a=i}o=n(r(o))}}t.exports=o},{}],118:[function(e,t){"use strict";function n(e){return e?e.nodeType===r?e.documentElement:e.firstChild:null}var r=9;t.exports=n},{}],119:[function(e,t){"use strict";function n(){return!o&&r.canUseDOM&&(o="textContent"in document.documentElement?"textContent":"innerText"),o}var r=e("./ExecutionEnvironment"),o=null;t.exports=n},{"./ExecutionEnvironment":22}],120:[function(e,t){"use strict";function n(e){return e===window?{x:window.pageXOffset||document.documentElement.scrollLeft,y:window.pageYOffset||document.documentElement.scrollTop}:{x:e.scrollLeft,y:e.scrollTop}}t.exports=n},{}],121:[function(e,t){function n(e){return e.replace(r,"-$1").toLowerCase()}var r=/([A-Z])/g;t.exports=n},{}],122:[function(e,t){"use strict";function n(e){return r(e).replace(o,"-ms-")}var r=e("./hyphenate"),o=/^ms-/;t.exports=n},{"./hyphenate":121}],123:[function(e,t){"use strict";function n(e,t){var n;return n="string"==typeof e.type?r.createInstanceForTag(e.type,e.props,t):new e.type(e.props),n.construct(e),n}{var r=(e("./warning"),e("./ReactElement"),e("./ReactLegacyElement"),e("./ReactNativeComponent"));e("./ReactEmptyComponent")}t.exports=n},{"./ReactElement":50,"./ReactEmptyComponent":52,"./ReactLegacyElement":59,"./ReactNativeComponent":64,"./warning":141}],124:[function(e,t){"use strict";var n=function(e,t,n,r,o,a,i,s){if(!e){var u;if(void 0===t)u=new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var c=[n,r,o,a,i,s],l=0;u=new Error("Invariant Violation: "+t.replace(/%s/g,function(){return c[l++]}))}throw u.framesToPop=1,u}};t.exports=n},{}],125:[function(e,t){"use strict";function n(e,t){if(!o.canUseDOM||t&&!("addEventListener"in document))return!1;var n="on"+e,a=n in document;if(!a){var i=document.createElement("div");i.setAttribute(n,"return;"),a="function"==typeof i[n]}return!a&&r&&"wheel"===e&&(a=document.implementation.hasFeature("Events.wheel","3.0")),a}var r,o=e("./ExecutionEnvironment");o.canUseDOM&&(r=document.implementation&&document.implementation.hasFeature&&document.implementation.hasFeature("","")!==!0),t.exports=n},{"./ExecutionEnvironment":22}],126:[function(e,t){function n(e){return!(!e||!("function"==typeof Node?e instanceof Node:"object"==typeof e&&"number"==typeof e.nodeType&&"string"==typeof e.nodeName))}t.exports=n},{}],127:[function(e,t){"use strict";function n(e){return e&&("INPUT"===e.nodeName&&r[e.type]||"TEXTAREA"===e.nodeName)}var r={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};t.exports=n},{}],128:[function(e,t){function n(e){return r(e)&&3==e.nodeType}var r=e("./isNode");t.exports=n},{"./isNode":126}],129:[function(e,t){"use strict";function n(e){e||(e="");var t,n=arguments.length;if(n>1)for(var r=1;n>r;r++)t=arguments[r],t&&(e=(e?e+" ":"")+t);return e}t.exports=n},{}],130:[function(e,t){"use strict";var n=e("./invariant"),r=function(e){var t,r={};n(e instanceof Object&&!Array.isArray(e));for(t in e)e.hasOwnProperty(t)&&(r[t]=t);return r};t.exports=r},{"./invariant":124}],131:[function(e,t){var n=function(e){var t;for(t in e)if(e.hasOwnProperty(t))return t;return null};t.exports=n},{}],132:[function(e,t){"use strict";function n(e,t,n){if(!e)return null;var o={};for(var a in e)r.call(e,a)&&(o[a]=t.call(n,e[a],a,e));return o}var r=Object.prototype.hasOwnProperty;t.exports=n},{}],133:[function(e,t){"use strict";function n(e){var t={};return function(n){return t.hasOwnProperty(n)?t[n]:t[n]=e.call(this,n)}}t.exports=n},{}],134:[function(e,t){"use strict";function n(e){r(e&&!/[^a-z0-9_]/.test(e))}var r=e("./invariant");t.exports=n},{"./invariant":124}],135:[function(e,t){"use strict";function n(e){return o(r.isValidElement(e)),e}var r=e("./ReactElement"),o=e("./invariant");t.exports=n},{"./ReactElement":50,"./invariant":124}],136:[function(e,t){"use strict";var n=e("./ExecutionEnvironment"),r=/^[ \r\n\t\f]/,o=/<(!--|link|noscript|meta|script|style)[ \r\n\t\f\/>]/,a=function(e,t){e.innerHTML=t};if(n.canUseDOM){var i=document.createElement("div");i.innerHTML=" ",""===i.innerHTML&&(a=function(e,t){if(e.parentNode&&e.parentNode.replaceChild(e,e),r.test(t)||"<"===t[0]&&o.test(t)){e.innerHTML=""+t;
var n=e.firstChild;1===n.data.length?e.removeChild(n):n.deleteData(0,1)}else e.innerHTML=t})}t.exports=a},{"./ExecutionEnvironment":22}],137:[function(e,t){"use strict";function n(e,t){if(e===t)return!0;var n;for(n in e)if(e.hasOwnProperty(n)&&(!t.hasOwnProperty(n)||e[n]!==t[n]))return!1;for(n in t)if(t.hasOwnProperty(n)&&!e.hasOwnProperty(n))return!1;return!0}t.exports=n},{}],138:[function(e,t){"use strict";function n(e,t){return e&&t&&e.type===t.type&&e.key===t.key&&e._owner===t._owner?!0:!1}t.exports=n},{}],139:[function(e,t){function n(e){var t=e.length;if(r(!Array.isArray(e)&&("object"==typeof e||"function"==typeof e)),r("number"==typeof t),r(0===t||t-1 in e),e.hasOwnProperty)try{return Array.prototype.slice.call(e)}catch(n){}for(var o=Array(t),a=0;t>a;a++)o[a]=e[a];return o}var r=e("./invariant");t.exports=n},{"./invariant":124}],140:[function(e,t){"use strict";function n(e){return d[e]}function r(e,t){return e&&null!=e.key?a(e.key):t.toString(36)}function o(e){return(""+e).replace(f,n)}function a(e){return"$"+o(e)}function i(e,t,n){return null==e?0:h(e,"",0,t,n)}var s=e("./ReactElement"),u=e("./ReactInstanceHandles"),c=e("./invariant"),l=u.SEPARATOR,p=":",d={"=":"=0",".":"=1",":":"=2"},f=/[=.:]/g,h=function(e,t,n,o,i){var u,d,f=0;if(Array.isArray(e))for(var m=0;m<e.length;m++){var v=e[m];u=t+(t?p:l)+r(v,m),d=n+f,f+=h(v,u,d,o,i)}else{var g=typeof e,y=""===t,E=y?l+r(e,0):t;if(null==e||"boolean"===g)o(i,null,E,n),f=1;else if("string"===g||"number"===g||s.isValidElement(e))o(i,e,E,n),f=1;else if("object"===g){c(!e||1!==e.nodeType);for(var C in e)e.hasOwnProperty(C)&&(u=t+(t?p:l)+a(C)+p+r(e[C],0),d=n+f,f+=h(e[C],u,d,o,i))}}return f};t.exports=i},{"./ReactElement":50,"./ReactInstanceHandles":58,"./invariant":124}],141:[function(e,t){"use strict";var n=e("./emptyFunction"),r=n;t.exports=r},{"./emptyFunction":105}]},{},[1])(1)});
;(function(){
var h,aa=this;
function q(b){var a=typeof b;if("object"==a)if(b){if(b instanceof Array)return"array";if(b instanceof Object)return a;var c=Object.prototype.toString.call(b);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof b.length&&"undefined"!=typeof b.splice&&"undefined"!=typeof b.propertyIsEnumerable&&!b.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof b.call&&"undefined"!=typeof b.propertyIsEnumerable&&!b.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
a&&"undefined"==typeof b.call)return"object";return a}var ba="closure_uid_"+(1E9*Math.random()>>>0),ca=0;function da(b){return Array.prototype.join.call(arguments,"")}function ea(b,a){return b<a?-1:b>a?1:0};function fa(b,a){for(var c in b)a.call(void 0,b[c],c,b)}var ga="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function ha(b,a){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)b[c]=d[c];for(var f=0;f<ga.length;f++)c=ga[f],Object.prototype.hasOwnProperty.call(d,c)&&(b[c]=d[c])}};function ja(b,a){null!=b&&this.append.apply(this,arguments)}h=ja.prototype;h.cb="";h.set=function(b){this.cb=""+b};h.append=function(b,a,c){this.cb+=b;if(null!=a)for(var d=1;d<arguments.length;d++)this.cb+=arguments[d];return this};h.clear=function(){this.cb=""};h.toString=function(){return this.cb};function la(b,a){b.sort(a||ma)}function na(b,a){for(var c=0;c<b.length;c++)b[c]={index:c,value:b[c]};var d=a||ma;la(b,function(a,b){return d(a.value,b.value)||a.index-b.index});for(c=0;c<b.length;c++)b[c]=b[c].value}function ma(b,a){return b>a?1:b<a?-1:0};if("undefined"===typeof oa)var oa=function(){throw Error("No *print-fn* fn set for evaluation environment");};var pa=null;if("undefined"===typeof qa)var qa=null;function sa(){return new t(null,5,[ta,!0,ua,!0,va,!1,wa,!1,xa,null],null)}function u(b){return null!=b&&!1!==b}function ya(b){return null==b}function za(b){return b instanceof Array}function Aa(b){return u(b)?!1:!0}function Ba(b){return"string"==typeof b}function v(b,a){return b[q(null==a?null:a)]?!0:b._?!0:!1}
function Da(b){return null==b?null:b.constructor}function x(b,a){var c=Da(a),c=u(u(c)?c.kb:c)?c.jb:q(a);return Error(["No protocol method ",b," defined for type ",c,": ",a].join(""))}function Ea(b){var a=b.jb;return u(a)?a:""+y(b)}var Fa="undefined"!==typeof Symbol&&"function"===q(Symbol)?Symbol.iterator:"@@iterator";function Ga(b){for(var a=b.length,c=Array(a),d=0;;)if(d<a)c[d]=b[d],d+=1;else break;return c}
function Ia(b){for(var a=Array(arguments.length),c=0;;)if(c<a.length)a[c]=arguments[c],c+=1;else return a}
var La=function(){function b(a,b){function c(a,b){a.push(b);return a}var g=[];return Ka.h?Ka.h(c,g,b):Ka.call(null,c,g,b)}function a(a){return c.c(null,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,0,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),Ma={},Na={},Oa={},Pa=function Pa(a){if(a?a.T:a)return a.T(a);var c;c=Pa[q(null==a?null:a)];if(!c&&(c=Pa._,!c))throw x("ICloneable.-clone",a);return c.call(null,
a)},Qa={},Ra=function Ra(a){if(a?a.O:a)return a.O(a);var c;c=Ra[q(null==a?null:a)];if(!c&&(c=Ra._,!c))throw x("ICounted.-count",a);return c.call(null,a)},Sa=function Sa(a){if(a?a.Y:a)return a.Y(a);var c;c=Sa[q(null==a?null:a)];if(!c&&(c=Sa._,!c))throw x("IEmptyableCollection.-empty",a);return c.call(null,a)},Ta={},A=function A(a,c){if(a?a.N:a)return a.N(a,c);var d;d=A[q(null==a?null:a)];if(!d&&(d=A._,!d))throw x("ICollection.-conj",a);return d.call(null,a,c)},Ua={},B=function(){function b(a,b,f){if(a?
a.pa:a)return a.pa(a,b,f);var g;g=c[q(null==a?null:a)];if(!g&&(g=c._,!g))throw x("IIndexed.-nth",a);return g.call(null,a,b,f)}function a(a,b){if(a?a.Q:a)return a.Q(a,b);var f;f=c[q(null==a?null:a)];if(!f&&(f=c._,!f))throw x("IIndexed.-nth",a);return f.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),Va={},Wa=function Wa(a){if(a?a.$:a)return a.$(a);
var c;c=Wa[q(null==a?null:a)];if(!c&&(c=Wa._,!c))throw x("ISeq.-first",a);return c.call(null,a)},Xa=function Xa(a){if(a?a.na:a)return a.na(a);var c;c=Xa[q(null==a?null:a)];if(!c&&(c=Xa._,!c))throw x("ISeq.-rest",a);return c.call(null,a)},Ya={},Za={},$a=function(){function b(a,b,f){if(a?a.F:a)return a.F(a,b,f);var g;g=c[q(null==a?null:a)];if(!g&&(g=c._,!g))throw x("ILookup.-lookup",a);return g.call(null,a,b,f)}function a(a,b){if(a?a.H:a)return a.H(a,b);var f;f=c[q(null==a?null:a)];if(!f&&(f=c._,!f))throw x("ILookup.-lookup",
a);return f.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),ab={},bb=function bb(a,c){if(a?a.rb:a)return a.rb(a,c);var d;d=bb[q(null==a?null:a)];if(!d&&(d=bb._,!d))throw x("IAssociative.-contains-key?",a);return d.call(null,a,c)},db=function db(a,c,d){if(a?a.aa:a)return a.aa(a,c,d);var e;e=db[q(null==a?null:a)];if(!e&&(e=db._,!e))throw x("IAssociative.-assoc",
a);return e.call(null,a,c,d)},fb={},gb=function gb(a,c){if(a?a.ma:a)return a.ma(a,c);var d;d=gb[q(null==a?null:a)];if(!d&&(d=gb._,!d))throw x("IMap.-dissoc",a);return d.call(null,a,c)},hb={},ib=function ib(a){if(a?a.Qb:a)return a.Qb();var c;c=ib[q(null==a?null:a)];if(!c&&(c=ib._,!c))throw x("IMapEntry.-key",a);return c.call(null,a)},jb=function jb(a){if(a?a.Rb:a)return a.Rb();var c;c=jb[q(null==a?null:a)];if(!c&&(c=jb._,!c))throw x("IMapEntry.-val",a);return c.call(null,a)},kb={},lb=function lb(a,
c){if(a?a.$b:a)return a.$b(0,c);var d;d=lb[q(null==a?null:a)];if(!d&&(d=lb._,!d))throw x("ISet.-disjoin",a);return d.call(null,a,c)},mb={},ob=function ob(a,c,d){if(a?a.Sb:a)return a.Sb(a,c,d);var e;e=ob[q(null==a?null:a)];if(!e&&(e=ob._,!e))throw x("IVector.-assoc-n",a);return e.call(null,a,c,d)},pb=function pb(a){if(a?a.Da:a)return a.Da(a);var c;c=pb[q(null==a?null:a)];if(!c&&(c=pb._,!c))throw x("IDeref.-deref",a);return c.call(null,a)},qb={},sb=function sb(a){if(a?a.I:a)return a.I(a);var c;c=sb[q(null==
a?null:a)];if(!c&&(c=sb._,!c))throw x("IMeta.-meta",a);return c.call(null,a)},tb={},ub=function ub(a,c){if(a?a.K:a)return a.K(a,c);var d;d=ub[q(null==a?null:a)];if(!d&&(d=ub._,!d))throw x("IWithMeta.-with-meta",a);return d.call(null,a,c)},vb={},yb=function(){function b(a,b,f){if(a?a.da:a)return a.da(a,b,f);var g;g=c[q(null==a?null:a)];if(!g&&(g=c._,!g))throw x("IReduce.-reduce",a);return g.call(null,a,b,f)}function a(a,b){if(a?a.ca:a)return a.ca(a,b);var f;f=c[q(null==a?null:a)];if(!f&&(f=c._,!f))throw x("IReduce.-reduce",
a);return f.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),zb=function zb(a,c){if(a?a.D:a)return a.D(a,c);var d;d=zb[q(null==a?null:a)];if(!d&&(d=zb._,!d))throw x("IEquiv.-equiv",a);return d.call(null,a,c)},Bb=function Bb(a){if(a?a.L:a)return a.L(a);var c;c=Bb[q(null==a?null:a)];if(!c&&(c=Bb._,!c))throw x("IHash.-hash",a);return c.call(null,
a)},Cb={},Db=function Db(a){if(a?a.M:a)return a.M(a);var c;c=Db[q(null==a?null:a)];if(!c&&(c=Db._,!c))throw x("ISeqable.-seq",a);return c.call(null,a)},Eb={},Fb={},Hb={},Ib=function Ib(a){if(a?a.Eb:a)return a.Eb(a);var c;c=Ib[q(null==a?null:a)];if(!c&&(c=Ib._,!c))throw x("IReversible.-rseq",a);return c.call(null,a)},Jb=function Jb(a,c){if(a?a.ec:a)return a.ec(0,c);var d;d=Jb[q(null==a?null:a)];if(!d&&(d=Jb._,!d))throw x("IWriter.-write",a);return d.call(null,a,c)},Kb={},Lb=function Lb(a,c,d){if(a?
a.G:a)return a.G(a,c,d);var e;e=Lb[q(null==a?null:a)];if(!e&&(e=Lb._,!e))throw x("IPrintWithWriter.-pr-writer",a);return e.call(null,a,c,d)},Mb=function Mb(a,c,d){if(a?a.cc:a)return a.cc(0,c,d);var e;e=Mb[q(null==a?null:a)];if(!e&&(e=Mb._,!e))throw x("IWatchable.-notify-watches",a);return e.call(null,a,c,d)},Nb=function Nb(a,c,d){if(a?a.bc:a)return a.bc(0,c,d);var e;e=Nb[q(null==a?null:a)];if(!e&&(e=Nb._,!e))throw x("IWatchable.-add-watch",a);return e.call(null,a,c,d)},Pb=function Pb(a,c){if(a?a.dc:
a)return a.dc(0,c);var d;d=Pb[q(null==a?null:a)];if(!d&&(d=Pb._,!d))throw x("IWatchable.-remove-watch",a);return d.call(null,a,c)},Qb=function Qb(a){if(a?a.ib:a)return a.ib(a);var c;c=Qb[q(null==a?null:a)];if(!c&&(c=Qb._,!c))throw x("IEditableCollection.-as-transient",a);return c.call(null,a)},Rb=function Rb(a,c){if(a?a.eb:a)return a.eb(a,c);var d;d=Rb[q(null==a?null:a)];if(!d&&(d=Rb._,!d))throw x("ITransientCollection.-conj!",a);return d.call(null,a,c)},Sb=function Sb(a){if(a?a.fb:a)return a.fb(a);
var c;c=Sb[q(null==a?null:a)];if(!c&&(c=Sb._,!c))throw x("ITransientCollection.-persistent!",a);return c.call(null,a)},Tb=function Tb(a,c,d){if(a?a.wb:a)return a.wb(a,c,d);var e;e=Tb[q(null==a?null:a)];if(!e&&(e=Tb._,!e))throw x("ITransientAssociative.-assoc!",a);return e.call(null,a,c,d)},Ub=function Ub(a,c,d){if(a?a.ac:a)return a.ac(0,c,d);var e;e=Ub[q(null==a?null:a)];if(!e&&(e=Ub._,!e))throw x("ITransientVector.-assoc-n!",a);return e.call(null,a,c,d)},Vb=function Vb(a){if(a?a.Xb:a)return a.Xb();
var c;c=Vb[q(null==a?null:a)];if(!c&&(c=Vb._,!c))throw x("IChunk.-drop-first",a);return c.call(null,a)},Wb=function Wb(a){if(a?a.Ob:a)return a.Ob(a);var c;c=Wb[q(null==a?null:a)];if(!c&&(c=Wb._,!c))throw x("IChunkedSeq.-chunked-first",a);return c.call(null,a)},Xb=function Xb(a){if(a?a.Pb:a)return a.Pb(a);var c;c=Xb[q(null==a?null:a)];if(!c&&(c=Xb._,!c))throw x("IChunkedSeq.-chunked-rest",a);return c.call(null,a)},Yb=function Yb(a){if(a?a.Nb:a)return a.Nb(a);var c;c=Yb[q(null==a?null:a)];if(!c&&(c=
Yb._,!c))throw x("IChunkedNext.-chunked-next",a);return c.call(null,a)},Zb={},bc=function bc(a,c){if(a?a.Zc:a)return a.Zc(a,c);var d;d=bc[q(null==a?null:a)];if(!d&&(d=bc._,!d))throw x("IReset.-reset!",a);return d.call(null,a,c)},cc=function(){function b(a,b,c,d,m){if(a?a.cd:a)return a.cd(a,b,c,d,m);var n;n=e[q(null==a?null:a)];if(!n&&(n=e._,!n))throw x("ISwap.-swap!",a);return n.call(null,a,b,c,d,m)}function a(a,b,c,d){if(a?a.bd:a)return a.bd(a,b,c,d);var m;m=e[q(null==a?null:a)];if(!m&&(m=e._,!m))throw x("ISwap.-swap!",
a);return m.call(null,a,b,c,d)}function c(a,b,c){if(a?a.ad:a)return a.ad(a,b,c);var d;d=e[q(null==a?null:a)];if(!d&&(d=e._,!d))throw x("ISwap.-swap!",a);return d.call(null,a,b,c)}function d(a,b){if(a?a.$c:a)return a.$c(a,b);var c;c=e[q(null==a?null:a)];if(!c&&(c=e._,!c))throw x("ISwap.-swap!",a);return c.call(null,a,b)}var e=null,e=function(e,g,k,l,m){switch(arguments.length){case 2:return d.call(this,e,g);case 3:return c.call(this,e,g,k);case 4:return a.call(this,e,g,k,l);case 5:return b.call(this,
e,g,k,l,m)}throw Error("Invalid arity: "+arguments.length);};e.c=d;e.h=c;e.B=a;e.J=b;return e}(),dc=function dc(a,c){if(a?a.Fb:a)return a.Fb(0,c);var d;d=dc[q(null==a?null:a)];if(!d&&(d=dc._,!d))throw x("IVolatile.-vreset!",a);return d.call(null,a,c)},ec=function ec(a){if(a?a.ub:a)return a.ub(a);var c;c=ec[q(null==a?null:a)];if(!c&&(c=ec._,!c))throw x("IIterable.-iterator",a);return c.call(null,a)};function fc(b){this.ae=b;this.C=0;this.o=1073741824}fc.prototype.ec=function(b,a){return this.ae.append(a)};
function gc(b){var a=new ja;b.G(null,new fc(a),sa());return""+y(a)}var hc="undefined"!==typeof Math.imul&&0!==(Math.imul.c?Math.imul.c(4294967295,5):Math.imul.call(null,4294967295,5))?function(b,a){return Math.imul.c?Math.imul.c(b,a):Math.imul.call(null,b,a)}:function(b,a){var c=b&65535,d=a&65535;return c*d+((b>>>16&65535)*d+c*(a>>>16&65535)<<16>>>0)|0};function ic(b){b=hc(b|0,-862048943);return hc(b<<15|b>>>-15,461845907)}
function jc(b,a){var c=(b|0)^(a|0);return hc(c<<13|c>>>-13,5)+-430675100|0}function kc(b,a){var c=(b|0)^a,c=hc(c^c>>>16,-2048144789),c=hc(c^c>>>13,-1028477387);return c^c>>>16}function lc(b){var a;a:{a=1;for(var c=0;;)if(a<b.length){var d=a+2,c=jc(c,ic(b.charCodeAt(a-1)|b.charCodeAt(a)<<16));a=d}else{a=c;break a}}a=1===(b.length&1)?a^ic(b.charCodeAt(b.length-1)):a;return kc(a,hc(2,b.length))}var mc={},nc=0;
function oc(b){255<nc&&(mc={},nc=0);var a=mc[b];if("number"!==typeof a){a:if(null!=b)if(a=b.length,0<a)for(var c=0,d=0;;)if(c<a)var e=c+1,d=hc(31,d)+b.charCodeAt(c),c=e;else{a=d;break a}else a=0;else a=0;mc[b]=a;nc+=1}return b=a}
function qc(b){b&&(b.o&4194304||b.le)?b=b.L(null):"number"===typeof b?b=(Math.floor.e?Math.floor.e(b):Math.floor.call(null,b))%2147483647:!0===b?b=1:!1===b?b=0:"string"===typeof b?(b=oc(b),0!==b&&(b=ic(b),b=jc(0,b),b=kc(b,4))):b=b instanceof Date?b.valueOf():null==b?0:Bb(b);return b}function rc(b,a){return b^a+2654435769+(b<<6)+(b>>2)}function sc(b){return b instanceof C}
function tc(b,a){if(b.Ia===a.Ia)return 0;var c=Aa(b.ja);if(u(c?a.ja:c))return-1;if(u(b.ja)){if(Aa(a.ja))return 1;c=ma(b.ja,a.ja);return 0===c?ma(b.name,a.name):c}return ma(b.name,a.name)}function C(b,a,c,d,e){this.ja=b;this.name=a;this.Ia=c;this.hb=d;this.la=e;this.o=2154168321;this.C=4096}h=C.prototype;h.G=function(b,a){return Jb(a,this.Ia)};h.L=function(){var b=this.hb;return null!=b?b:this.hb=b=rc(lc(this.name),oc(this.ja))};h.K=function(b,a){return new C(this.ja,this.name,this.Ia,this.hb,a)};
h.I=function(){return this.la};h.call=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return $a.h(b,this,null);case 3:return $a.h(b,this,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return $a.h(b,this,null)};b.h=function(a,b,d){return $a.h(b,this,d)};return b}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.e=function(b){return $a.h(b,this,null)};h.c=function(b,a){return $a.h(b,this,a)};
h.D=function(b,a){return a instanceof C?this.Ia===a.Ia:!1};h.toString=function(){return this.Ia};h.equiv=function(b){return this.D(null,b)};var uc=function(){function b(a,b){var c=null!=a?[y(a),y("/"),y(b)].join(""):b;return new C(a,b,c,null,null)}function a(a){return a instanceof C?a:c.c(null,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}();
function E(b){if(null==b)return null;if(b&&(b.o&8388608||b.oe))return b.M(null);if(za(b)||"string"===typeof b)return 0===b.length?null:new F(b,0);if(v(Cb,b))return Db(b);throw Error([y(b),y(" is not ISeqable")].join(""));}function G(b){if(null==b)return null;if(b&&(b.o&64||b.vb))return b.$(null);b=E(b);return null==b?null:Wa(b)}function I(b){return null!=b?b&&(b.o&64||b.vb)?b.na(null):(b=E(b))?Xa(b):J:J}function K(b){return null==b?null:b&&(b.o&128||b.Db)?b.fa(null):E(I(b))}
var L=function(){function b(a,b){return null==a?null==b:a===b||zb(a,b)}var a=null,c=function(){function b(a,d,k){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,a,d,l)}function c(b,d,e){for(;;)if(a.c(b,d))if(K(e))b=d,d=G(e),e=K(e);else return a.c(d,G(e));else return!1}b.v=2;b.l=function(a){var b=G(a);a=K(a);var d=G(a);a=I(a);return c(b,d,a)};b.j=c;return b}(),a=function(a,e,f){switch(arguments.length){case 1:return!0;
case 2:return b.call(this,a,e);default:var g=null;if(2<arguments.length){for(var g=0,k=Array(arguments.length-2);g<k.length;)k[g]=arguments[g+2],++g;g=new F(k,0)}return c.j(a,e,g)}throw Error("Invalid arity: "+arguments.length);};a.v=2;a.l=c.l;a.e=function(){return!0};a.c=b;a.j=c.j;return a}();function vc(b){this.s=b}vc.prototype.next=function(){if(null!=this.s){var b=G(this.s);this.s=K(this.s);return{done:!1,value:b}}return{done:!0,value:null}};function wc(b){return new vc(E(b))}
function xc(b,a){var c=ic(b),c=jc(0,c);return kc(c,a)}function yc(b){var a=0,c=1;for(b=E(b);;)if(null!=b)a+=1,c=hc(31,c)+qc(G(b))|0,b=K(b);else return xc(c,a)}var zc=xc(1,0);function Ac(b){var a=0,c=0;for(b=E(b);;)if(null!=b)a+=1,c=c+qc(G(b))|0,b=K(b);else return xc(c,a)}var Bc=xc(0,0);Qa["null"]=!0;Ra["null"]=function(){return 0};Date.prototype.sb=!0;Date.prototype.tb=function(b,a){return ma(this.valueOf(),a.valueOf())};Date.prototype.Sc=!0;
Date.prototype.D=function(b,a){return a instanceof Date&&this.valueOf()===a.valueOf()};zb.number=function(b,a){return b===a};qb["function"]=!0;sb["function"]=function(){return null};Ma["function"]=!0;Bb._=function(b){return b[ba]||(b[ba]=++ca)};function Cc(b){return b+1}function Dc(b){this.val=b;this.C=0;this.o=32768}Dc.prototype.Da=function(){return this.val};function Ec(b){return b instanceof Dc}function M(b){return pb(b)}
var Fc=function(){function b(a,b,c,d){for(var l=Ra(a);;)if(d<l){var m=B.c(a,d);c=b.c?b.c(c,m):b.call(null,c,m);if(Ec(c))return pb(c);d+=1}else return c}function a(a,b,c){var d=Ra(a),l=c;for(c=0;;)if(c<d){var m=B.c(a,c),l=b.c?b.c(l,m):b.call(null,l,m);if(Ec(l))return pb(l);c+=1}else return l}function c(a,b){var c=Ra(a);if(0===c)return b.t?b.t():b.call(null);for(var d=B.c(a,0),l=1;;)if(l<c){var m=B.c(a,l),d=b.c?b.c(d,m):b.call(null,d,m);if(Ec(d))return pb(d);l+=1}else return d}var d=null,d=function(d,
f,g,k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return a.call(this,d,f,g);case 4:return b.call(this,d,f,g,k)}throw Error("Invalid arity: "+arguments.length);};d.c=c;d.h=a;d.B=b;return d}(),Gc=function(){function b(a,b,c,d){for(var l=a.length;;)if(d<l){var m=a[d];c=b.c?b.c(c,m):b.call(null,c,m);if(Ec(c))return pb(c);d+=1}else return c}function a(a,b,c){var d=a.length,l=c;for(c=0;;)if(c<d){var m=a[c],l=b.c?b.c(l,m):b.call(null,l,m);if(Ec(l))return pb(l);c+=1}else return l}function c(a,
b){var c=a.length;if(0===a.length)return b.t?b.t():b.call(null);for(var d=a[0],l=1;;)if(l<c){var m=a[l],d=b.c?b.c(d,m):b.call(null,d,m);if(Ec(d))return pb(d);l+=1}else return d}var d=null,d=function(d,f,g,k){switch(arguments.length){case 2:return c.call(this,d,f);case 3:return a.call(this,d,f,g);case 4:return b.call(this,d,f,g,k)}throw Error("Invalid arity: "+arguments.length);};d.c=c;d.h=a;d.B=b;return d}();function Hc(b){return b?b.o&2||b.Nc?!0:b.o?!1:v(Qa,b):v(Qa,b)}
function Ic(b){return b?b.o&16||b.Yb?!0:b.o?!1:v(Ua,b):v(Ua,b)}function Jc(b,a){this.k=b;this.i=a}Jc.prototype.Gb=function(){return this.i<this.k.length};Jc.prototype.next=function(){var b=this.k[this.i];this.i+=1;return b};function F(b,a){this.k=b;this.i=a;this.o=166199550;this.C=8192}h=F.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.Q=function(b,a){var c=a+this.i;return c<this.k.length?this.k[c]:null};
h.pa=function(b,a,c){b=a+this.i;return b<this.k.length?this.k[b]:c};h.ub=function(){return new Jc(this.k,this.i)};h.T=function(){return new F(this.k,this.i)};h.fa=function(){return this.i+1<this.k.length?new F(this.k,this.i+1):null};h.O=function(){return this.k.length-this.i};h.Eb=function(){var b=Ra(this);return 0<b?new Kc(this,b-1,null):null};h.L=function(){return yc(this)};h.D=function(b,a){return Lc.c?Lc.c(this,a):Lc.call(null,this,a)};h.Y=function(){return J};
h.ca=function(b,a){return Gc.B(this.k,a,this.k[this.i],this.i+1)};h.da=function(b,a,c){return Gc.B(this.k,a,c,this.i)};h.$=function(){return this.k[this.i]};h.na=function(){return this.i+1<this.k.length?new F(this.k,this.i+1):J};h.M=function(){return this};h.N=function(b,a){return O.c?O.c(a,this):O.call(null,a,this)};F.prototype[Fa]=function(){return wc(this)};
var Mc=function(){function b(a,b){return b<a.length?new F(a,b):null}function a(a){return c.c(a,0)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),Q=function(){function b(a,b){return Mc.c(a,b)}function a(a){return Mc.c(a,0)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+
arguments.length);};c.e=a;c.c=b;return c}();function Kc(b,a,c){this.qb=b;this.i=a;this.meta=c;this.o=32374990;this.C=8192}h=Kc.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.meta};h.T=function(){return new Kc(this.qb,this.i,this.meta)};h.fa=function(){return 0<this.i?new Kc(this.qb,this.i-1,null):null};h.O=function(){return this.i+1};h.L=function(){return yc(this)};
h.D=function(b,a){return Lc.c?Lc.c(this,a):Lc.call(null,this,a)};h.Y=function(){var b=this.meta;return Nc.c?Nc.c(J,b):Nc.call(null,J,b)};h.ca=function(b,a){return Oc.c?Oc.c(a,this):Oc.call(null,a,this)};h.da=function(b,a,c){return Oc.h?Oc.h(a,c,this):Oc.call(null,a,c,this)};h.$=function(){return B.c(this.qb,this.i)};h.na=function(){return 0<this.i?new Kc(this.qb,this.i-1,null):J};h.M=function(){return this};h.K=function(b,a){return new Kc(this.qb,this.i,a)};
h.N=function(b,a){return O.c?O.c(a,this):O.call(null,a,this)};Kc.prototype[Fa]=function(){return wc(this)};function Pc(b){return G(K(b))}zb._=function(b,a){return b===a};
var Rc=function(){function b(a,b){return null!=a?A(a,b):A(J,b)}var a=null,c=function(){function b(a,d,k){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,a,d,l)}function c(b,d,e){for(;;)if(u(e))b=a.c(b,d),d=G(e),e=K(e);else return a.c(b,d)}b.v=2;b.l=function(a){var b=G(a);a=K(a);var d=G(a);a=I(a);return c(b,d,a)};b.j=c;return b}(),a=function(a,e,f){switch(arguments.length){case 0:return Qc;case 1:return a;
case 2:return b.call(this,a,e);default:var g=null;if(2<arguments.length){for(var g=0,k=Array(arguments.length-2);g<k.length;)k[g]=arguments[g+2],++g;g=new F(k,0)}return c.j(a,e,g)}throw Error("Invalid arity: "+arguments.length);};a.v=2;a.l=c.l;a.t=function(){return Qc};a.e=function(a){return a};a.c=b;a.j=c.j;return a}();function Sc(b){return null==b?null:Sa(b)}
function R(b){if(null!=b)if(b&&(b.o&2||b.Nc))b=b.O(null);else if(za(b))b=b.length;else if("string"===typeof b)b=b.length;else if(v(Qa,b))b=Ra(b);else a:{b=E(b);for(var a=0;;){if(Hc(b)){b=a+Ra(b);break a}b=K(b);a+=1}}else b=0;return b}
var Tc=function(){function b(a,b,c){for(;;){if(null==a)return c;if(0===b)return E(a)?G(a):c;if(Ic(a))return B.h(a,b,c);if(E(a))a=K(a),--b;else return c}}function a(a,b){for(;;){if(null==a)throw Error("Index out of bounds");if(0===b){if(E(a))return G(a);throw Error("Index out of bounds");}if(Ic(a))return B.c(a,b);if(E(a)){var c=K(a),g=b-1;a=c;b=g}else throw Error("Index out of bounds");}}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,
c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),S=function(){function b(a,b,c){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return c;if(a&&(a.o&16||a.Yb))return a.pa(null,b,c);if(za(a)||"string"===typeof a)return b<a.length?a[b]:c;if(v(Ua,a))return B.c(a,b);if(a?a.o&64||a.vb||(a.o?0:v(Va,a)):v(Va,a))return Tc.h(a,b,c);throw Error([y("nth not supported on this type "),y(Ea(Da(a)))].join(""));}function a(a,b){if("number"!==
typeof b)throw Error("index argument to nth must be a number");if(null==a)return a;if(a&&(a.o&16||a.Yb))return a.Q(null,b);if(za(a)||"string"===typeof a)return b<a.length?a[b]:null;if(v(Ua,a))return B.c(a,b);if(a?a.o&64||a.vb||(a.o?0:v(Va,a)):v(Va,a))return Tc.c(a,b);throw Error([y("nth not supported on this type "),y(Ea(Da(a)))].join(""));}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);
};c.c=a;c.h=b;return c}(),U=function(){function b(a,b,c){return null!=a?a&&(a.o&256||a.Zb)?a.F(null,b,c):za(a)?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:v(Za,a)?$a.h(a,b,c):c:c}function a(a,b){return null==a?null:a&&(a.o&256||a.Zb)?a.H(null,b):za(a)?b<a.length?a[b]:null:"string"===typeof a?b<a.length?a[b]:null:v(Za,a)?$a.c(a,b):null}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);
};c.c=a;c.h=b;return c}(),Vc=function(){function b(a,b,c){return null!=a?db(a,b,c):Uc([b],[c])}var a=null,c=function(){function b(a,d,k,l){var m=null;if(3<arguments.length){for(var m=0,n=Array(arguments.length-3);m<n.length;)n[m]=arguments[m+3],++m;m=new F(n,0)}return c.call(this,a,d,k,m)}function c(b,d,e,l){for(;;)if(b=a.h(b,d,e),u(l))d=G(l),e=Pc(l),l=K(K(l));else return b}b.v=3;b.l=function(a){var b=G(a);a=K(a);var d=G(a);a=K(a);var l=G(a);a=I(a);return c(b,d,l,a)};b.j=c;return b}(),a=function(a,
e,f,g){switch(arguments.length){case 3:return b.call(this,a,e,f);default:var k=null;if(3<arguments.length){for(var k=0,l=Array(arguments.length-3);k<l.length;)l[k]=arguments[k+3],++k;k=new F(l,0)}return c.j(a,e,f,k)}throw Error("Invalid arity: "+arguments.length);};a.v=3;a.l=c.l;a.h=b;a.j=c.j;return a}(),Wc=function(){function b(a,b){return null==a?null:gb(a,b)}var a=null,c=function(){function b(a,d,k){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+
2],++l;l=new F(m,0)}return c.call(this,a,d,l)}function c(b,d,e){for(;;){if(null==b)return null;b=a.c(b,d);if(u(e))d=G(e),e=K(e);else return b}}b.v=2;b.l=function(a){var b=G(a);a=K(a);var d=G(a);a=I(a);return c(b,d,a)};b.j=c;return b}(),a=function(a,e,f){switch(arguments.length){case 1:return a;case 2:return b.call(this,a,e);default:var g=null;if(2<arguments.length){for(var g=0,k=Array(arguments.length-2);g<k.length;)k[g]=arguments[g+2],++g;g=new F(k,0)}return c.j(a,e,g)}throw Error("Invalid arity: "+
arguments.length);};a.v=2;a.l=c.l;a.e=function(a){return a};a.c=b;a.j=c.j;return a}();function Xc(b){var a="function"==q(b);return u(a)?a:b?u(u(null)?null:b.Lc)?!0:b.R?!1:v(Ma,b):v(Ma,b)}function Yc(b,a){this.m=b;this.meta=a;this.C=0;this.o=393217}h=Yc.prototype;
h.call=function(){function b(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja,T){a=this.m;return V.Cb?V.Cb(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja,T):V.call(null,a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja,T)}function a(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja){a=this;return a.m.Ta?a.m.Ta(b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja):a.m.call(null,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja)}function c(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra){a=this;return a.m.Sa?a.m.Sa(b,c,d,e,f,g,k,l,m,n,p,r,w,z,
D,H,P,N,ra):a.m.call(null,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra)}function d(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N){a=this;return a.m.Ra?a.m.Ra(b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N):a.m.call(null,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N)}function e(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P){a=this;return a.m.Qa?a.m.Qa(b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P):a.m.call(null,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P)}function f(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H){a=this;return a.m.Pa?a.m.Pa(b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H):a.m.call(null,
b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H)}function g(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D){a=this;return a.m.Oa?a.m.Oa(b,c,d,e,f,g,k,l,m,n,p,r,w,z,D):a.m.call(null,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D)}function k(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z){a=this;return a.m.Na?a.m.Na(b,c,d,e,f,g,k,l,m,n,p,r,w,z):a.m.call(null,b,c,d,e,f,g,k,l,m,n,p,r,w,z)}function l(a,b,c,d,e,f,g,k,l,m,n,p,r,w){a=this;return a.m.Ma?a.m.Ma(b,c,d,e,f,g,k,l,m,n,p,r,w):a.m.call(null,b,c,d,e,f,g,k,l,m,n,p,r,w)}function m(a,b,c,d,e,f,g,k,l,m,n,p,r){a=this;
return a.m.La?a.m.La(b,c,d,e,f,g,k,l,m,n,p,r):a.m.call(null,b,c,d,e,f,g,k,l,m,n,p,r)}function n(a,b,c,d,e,f,g,k,l,m,n,p){a=this;return a.m.Ka?a.m.Ka(b,c,d,e,f,g,k,l,m,n,p):a.m.call(null,b,c,d,e,f,g,k,l,m,n,p)}function p(a,b,c,d,e,f,g,k,l,m,n){a=this;return a.m.Ja?a.m.Ja(b,c,d,e,f,g,k,l,m,n):a.m.call(null,b,c,d,e,f,g,k,l,m,n)}function r(a,b,c,d,e,f,g,k,l,m){a=this;return a.m.Va?a.m.Va(b,c,d,e,f,g,k,l,m):a.m.call(null,b,c,d,e,f,g,k,l,m)}function w(a,b,c,d,e,f,g,k,l){a=this;return a.m.Ua?a.m.Ua(b,c,
d,e,f,g,k,l):a.m.call(null,b,c,d,e,f,g,k,l)}function z(a,b,c,d,e,f,g,k){a=this;return a.m.wa?a.m.wa(b,c,d,e,f,g,k):a.m.call(null,b,c,d,e,f,g,k)}function D(a,b,c,d,e,f,g){a=this;return a.m.ba?a.m.ba(b,c,d,e,f,g):a.m.call(null,b,c,d,e,f,g)}function H(a,b,c,d,e,f){a=this;return a.m.J?a.m.J(b,c,d,e,f):a.m.call(null,b,c,d,e,f)}function P(a,b,c,d,e){a=this;return a.m.B?a.m.B(b,c,d,e):a.m.call(null,b,c,d,e)}function N(a,b,c,d){a=this;return a.m.h?a.m.h(b,c,d):a.m.call(null,b,c,d)}function ra(a,b,c){a=this;
return a.m.c?a.m.c(b,c):a.m.call(null,b,c)}function Ja(a,b){a=this;return a.m.e?a.m.e(b):a.m.call(null,b)}function eb(a){a=this;return a.m.t?a.m.t():a.m.call(null)}var T=null,T=function(T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,$b,ac,pc,ud,$d,Ee,Lf,eh,aj,Mf){switch(arguments.length){case 1:return eb.call(this,T);case 2:return Ja.call(this,T,ka);case 3:return ra.call(this,T,ka,Ca);case 4:return N.call(this,T,ka,Ca,Ha);case 5:return P.call(this,T,ka,Ca,Ha,ia);case 6:return H.call(this,T,ka,Ca,Ha,ia,nb);case 7:return D.call(this,
T,ka,Ca,Ha,ia,nb,rb);case 8:return z.call(this,T,ka,Ca,Ha,ia,nb,rb,xb);case 9:return w.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb);case 10:return r.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb);case 11:return p.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob);case 12:return n.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab);case 13:return m.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,$b);case 14:return l.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,$b,ac);case 15:return k.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,
$b,ac,pc);case 16:return g.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,$b,ac,pc,ud);case 17:return f.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,$b,ac,pc,ud,$d);case 18:return e.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,$b,ac,pc,ud,$d,Ee);case 19:return d.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,$b,ac,pc,ud,$d,Ee,Lf);case 20:return c.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,$b,ac,pc,ud,$d,Ee,Lf,eh);case 21:return a.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,$b,ac,pc,ud,$d,Ee,Lf,eh,
aj);case 22:return b.call(this,T,ka,Ca,Ha,ia,nb,rb,xb,cb,Gb,Ob,Ab,$b,ac,pc,ud,$d,Ee,Lf,eh,aj,Mf)}throw Error("Invalid arity: "+arguments.length);};T.e=eb;T.c=Ja;T.h=ra;T.B=N;T.J=P;T.ba=H;T.wa=D;T.Ua=z;T.Va=w;T.Ja=r;T.Ka=p;T.La=n;T.Ma=m;T.Na=l;T.Oa=k;T.Pa=g;T.Qa=f;T.Ra=e;T.Sa=d;T.Ta=c;T.Tc=a;T.Cb=b;return T}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.t=function(){return this.m.t?this.m.t():this.m.call(null)};
h.e=function(b){return this.m.e?this.m.e(b):this.m.call(null,b)};h.c=function(b,a){return this.m.c?this.m.c(b,a):this.m.call(null,b,a)};h.h=function(b,a,c){return this.m.h?this.m.h(b,a,c):this.m.call(null,b,a,c)};h.B=function(b,a,c,d){return this.m.B?this.m.B(b,a,c,d):this.m.call(null,b,a,c,d)};h.J=function(b,a,c,d,e){return this.m.J?this.m.J(b,a,c,d,e):this.m.call(null,b,a,c,d,e)};h.ba=function(b,a,c,d,e,f){return this.m.ba?this.m.ba(b,a,c,d,e,f):this.m.call(null,b,a,c,d,e,f)};
h.wa=function(b,a,c,d,e,f,g){return this.m.wa?this.m.wa(b,a,c,d,e,f,g):this.m.call(null,b,a,c,d,e,f,g)};h.Ua=function(b,a,c,d,e,f,g,k){return this.m.Ua?this.m.Ua(b,a,c,d,e,f,g,k):this.m.call(null,b,a,c,d,e,f,g,k)};h.Va=function(b,a,c,d,e,f,g,k,l){return this.m.Va?this.m.Va(b,a,c,d,e,f,g,k,l):this.m.call(null,b,a,c,d,e,f,g,k,l)};h.Ja=function(b,a,c,d,e,f,g,k,l,m){return this.m.Ja?this.m.Ja(b,a,c,d,e,f,g,k,l,m):this.m.call(null,b,a,c,d,e,f,g,k,l,m)};
h.Ka=function(b,a,c,d,e,f,g,k,l,m,n){return this.m.Ka?this.m.Ka(b,a,c,d,e,f,g,k,l,m,n):this.m.call(null,b,a,c,d,e,f,g,k,l,m,n)};h.La=function(b,a,c,d,e,f,g,k,l,m,n,p){return this.m.La?this.m.La(b,a,c,d,e,f,g,k,l,m,n,p):this.m.call(null,b,a,c,d,e,f,g,k,l,m,n,p)};h.Ma=function(b,a,c,d,e,f,g,k,l,m,n,p,r){return this.m.Ma?this.m.Ma(b,a,c,d,e,f,g,k,l,m,n,p,r):this.m.call(null,b,a,c,d,e,f,g,k,l,m,n,p,r)};
h.Na=function(b,a,c,d,e,f,g,k,l,m,n,p,r,w){return this.m.Na?this.m.Na(b,a,c,d,e,f,g,k,l,m,n,p,r,w):this.m.call(null,b,a,c,d,e,f,g,k,l,m,n,p,r,w)};h.Oa=function(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z){return this.m.Oa?this.m.Oa(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z):this.m.call(null,b,a,c,d,e,f,g,k,l,m,n,p,r,w,z)};h.Pa=function(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D){return this.m.Pa?this.m.Pa(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D):this.m.call(null,b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D)};
h.Qa=function(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H){return this.m.Qa?this.m.Qa(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H):this.m.call(null,b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H)};h.Ra=function(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P){return this.m.Ra?this.m.Ra(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P):this.m.call(null,b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P)};
h.Sa=function(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N){return this.m.Sa?this.m.Sa(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N):this.m.call(null,b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N)};h.Ta=function(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra){return this.m.Ta?this.m.Ta(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra):this.m.call(null,b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra)};
h.Tc=function(b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja){var eb=this.m;return V.Cb?V.Cb(eb,b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja):V.call(null,eb,b,a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja)};h.Lc=!0;h.K=function(b,a){return new Yc(this.m,a)};h.I=function(){return this.meta};function Nc(b,a){return Xc(b)&&!(b?b.o&262144||b.se||(b.o?0:v(tb,b)):v(tb,b))?new Yc(b,a):null==b?null:ub(b,a)}function Zc(b){var a=null!=b;return(a?b?b.o&131072||b.Wc||(b.o?0:v(qb,b)):v(qb,b):a)?sb(b):null}
var $c=function(){function b(a,b){return null==a?null:lb(a,b)}var a=null,c=function(){function b(a,d,k){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,a,d,l)}function c(b,d,e){for(;;){if(null==b)return null;b=a.c(b,d);if(u(e))d=G(e),e=K(e);else return b}}b.v=2;b.l=function(a){var b=G(a);a=K(a);var d=G(a);a=I(a);return c(b,d,a)};b.j=c;return b}(),a=function(a,e,f){switch(arguments.length){case 1:return a;
case 2:return b.call(this,a,e);default:var g=null;if(2<arguments.length){for(var g=0,k=Array(arguments.length-2);g<k.length;)k[g]=arguments[g+2],++g;g=new F(k,0)}return c.j(a,e,g)}throw Error("Invalid arity: "+arguments.length);};a.v=2;a.l=c.l;a.e=function(a){return a};a.c=b;a.j=c.j;return a}();function ad(b){return null==b||Aa(E(b))}function bd(b){return null==b?!1:b?b.o&8||b.he?!0:b.o?!1:v(Ta,b):v(Ta,b)}function cd(b){return null==b?!1:b?b.o&4096||b.qe?!0:b.o?!1:v(kb,b):v(kb,b)}
function dd(b){return b?b.o&16777216||b.pe?!0:b.o?!1:v(Eb,b):v(Eb,b)}function ed(b){return null==b?!1:b?b.o&1024||b.Uc?!0:b.o?!1:v(fb,b):v(fb,b)}function fd(b){return b?b.o&16384||b.re?!0:b.o?!1:v(mb,b):v(mb,b)}function gd(b){return b?b.C&512||b.ge?!0:!1:!1}function hd(b){var a=[];fa(b,function(a,b){return function(a,c){return b.push(c)}}(b,a));return a}function id(b,a,c,d,e){for(;0!==e;)c[d]=b[a],d+=1,--e,a+=1}function jd(b,a,c,d,e){a+=e-1;for(d+=e-1;0!==e;)c[d]=b[a],--d,--e,--a}var kd={};
function ld(b){return null==b?!1:b?b.o&64||b.vb?!0:b.o?!1:v(Va,b):v(Va,b)}function md(b){return u(b)?!0:!1}function nd(b){var a=Xc(b);return a?a:b?b.o&1||b.ke?!0:b.o?!1:v(Na,b):v(Na,b)}function od(b){return"number"===typeof b&&Aa(isNaN(b))&&Infinity!==b&&parseFloat(b)===parseInt(b,10)}function pd(b,a){return U.h(b,a,kd)===kd?!1:!0}function qd(b,a){var c;if(c=null!=b)c=b?b.o&512||b.ee?!0:b.o?!1:v(ab,b):v(ab,b);return c&&pd(b,a)?new W(null,2,5,X,[a,U.c(b,a)],null):null}
var wd=function(){function b(a,b){return!L.c(a,b)}var a=null,c=function(){function a(c,d,k){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return b.call(this,c,d,l)}function b(a,c,d){if(L.c(a,c))return!1;a:if(a=[a,c],c=a.length,c<=rd)for(var e=0,m=Qb(sd);;)if(e<c)var n=e+1,m=Tb(m,a[e],null),e=n;else{a=new td(null,Sb(m),null);break a}else for(e=0,m=Qb(vd);;)if(e<c)n=e+1,m=Rb(m,a[e]),e=n;else{a=Sb(m);break a}for(c=d;;)if(e=
G(c),d=K(c),u(c)){if(pd(a,e))return!1;a=Rc.c(a,e);c=d}else return!0}a.v=2;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=I(a);return b(c,d,a)};a.j=b;return a}(),a=function(a,e,f){switch(arguments.length){case 1:return!0;case 2:return b.call(this,a,e);default:var g=null;if(2<arguments.length){for(var g=0,k=Array(arguments.length-2);g<k.length;)k[g]=arguments[g+2],++g;g=new F(k,0)}return c.j(a,e,g)}throw Error("Invalid arity: "+arguments.length);};a.v=2;a.l=c.l;a.e=function(){return!0};a.c=b;a.j=c.j;
return a}();function xd(b,a){if(b===a)return 0;if(null==b)return-1;if(null==a)return 1;if(Da(b)===Da(a))return b&&(b.C&2048||b.sb)?b.tb(null,a):ma(b,a);throw Error("compare on non-nil objects of different types");}
var yd=function(){function b(a,b,c,g){for(;;){var k=xd(S.c(a,g),S.c(b,g));if(0===k&&g+1<c)g+=1;else return k}}function a(a,b){var f=R(a),g=R(b);return f<g?-1:f>g?1:c.B(a,b,f,0)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 2:return a.call(this,c,e);case 4:return b.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.B=b;return c}();
function zd(b){return L.c(b,xd)?xd:function(a,c){var d=b.c?b.c(a,c):b.call(null,a,c);return"number"===typeof d?d:u(d)?-1:u(b.c?b.c(c,a):b.call(null,c,a))?1:0}}
var Bd=function(){function b(a,b){if(E(b)){var c=Ad.e?Ad.e(b):Ad.call(null,b),g=zd(a);na(c,g);return E(c)}return J}function a(a){return c.c(xd,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),Cd=function(){function b(a,b,c){return Bd.c(function(c,f){return zd(b).call(null,a.e?a.e(c):a.call(null,c),a.e?a.e(f):a.call(null,f))},c)}function a(a,b){return c.h(a,xd,
b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),Oc=function(){function b(a,b,c){for(c=E(c);;)if(c){var g=G(c);b=a.c?a.c(b,g):a.call(null,b,g);if(Ec(b))return pb(b);c=K(c)}else return b}function a(a,b){var c=E(b);if(c){var g=G(c),c=K(c);return Ka.h?Ka.h(a,g,c):Ka.call(null,a,g,c)}return a.t?a.t():a.call(null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,
c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),Ka=function(){function b(a,b,c){return c&&(c.o&524288||c.Yc)?c.da(null,a,b):za(c)?Gc.h(c,a,b):"string"===typeof c?Gc.h(c,a,b):v(vb,c)?yb.h(c,a,b):Oc.h(a,b,c)}function a(a,b){return b&&(b.o&524288||b.Yc)?b.ca(null,a):za(b)?Gc.c(b,a):"string"===typeof b?Gc.c(b,a):v(vb,b)?yb.c(b,a):Oc.c(a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,
c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}();function Dd(b){return b}var Ed=function(){function b(a,b,c,g){a=a.e?a.e(b):a.call(null,b);c=Ka.h(a,c,g);return a.e?a.e(c):a.call(null,c)}function a(a,b,f){return c.B(a,b,b.t?b.t():b.call(null),f)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 3:return a.call(this,c,e,f);case 4:return b.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.h=a;c.B=b;return c}();
function Fd(b){b=(b-b%2)/2;return 0<=b?Math.floor.e?Math.floor.e(b):Math.floor.call(null,b):Math.ceil.e?Math.ceil.e(b):Math.ceil.call(null,b)}function Gd(b){b-=b>>1&1431655765;b=(b&858993459)+(b>>2&858993459);return 16843009*(b+(b>>4)&252645135)>>24}function Hd(b){var a=1;for(b=E(b);;)if(b&&0<a)--a,b=K(b);else return b}
var y=function(){function b(a){return null==a?"":da(a)}var a=null,c=function(){function b(a,d){var k=null;if(1<arguments.length){for(var k=0,l=Array(arguments.length-1);k<l.length;)l[k]=arguments[k+1],++k;k=new F(l,0)}return c.call(this,a,k)}function c(b,d){for(var e=new ja(a.e(b)),l=d;;)if(u(l))e=e.append(a.e(G(l))),l=K(l);else return e.toString()}b.v=1;b.l=function(a){var b=G(a);a=I(a);return c(b,a)};b.j=c;return b}(),a=function(a,e){switch(arguments.length){case 0:return"";case 1:return b.call(this,
a);default:var f=null;if(1<arguments.length){for(var f=0,g=Array(arguments.length-1);f<g.length;)g[f]=arguments[f+1],++f;f=new F(g,0)}return c.j(a,f)}throw Error("Invalid arity: "+arguments.length);};a.v=1;a.l=c.l;a.t=function(){return""};a.e=b;a.j=c.j;return a}(),Id=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return a.substring(b);case 3:return a.substring(b,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return a.substring(b)};b.h=function(a,b,
d){return a.substring(b,d)};return b}();function Lc(b,a){var c;if(dd(a))if(Hc(b)&&Hc(a)&&R(b)!==R(a))c=!1;else a:{c=E(b);for(var d=E(a);;){if(null==c){c=null==d;break a}if(null!=d&&L.c(G(c),G(d)))c=K(c),d=K(d);else{c=!1;break a}}}else c=null;return md(c)}function Jd(b){var a=0;for(b=E(b);;)if(b){var c=G(b),a=(a+(qc(function(){var a=c;return Kd.e?Kd.e(a):Kd.call(null,a)}())^qc(function(){var a=c;return Ld.e?Ld.e(a):Ld.call(null,a)}())))%4503599627370496;b=K(b)}else return a}
function Md(b,a,c,d,e){this.meta=b;this.first=a;this.Ba=c;this.count=d;this.r=e;this.o=65937646;this.C=8192}h=Md.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.meta};h.T=function(){return new Md(this.meta,this.first,this.Ba,this.count,this.r)};h.fa=function(){return 1===this.count?null:this.Ba};h.O=function(){return this.count};h.L=function(){var b=this.r;return null!=b?b:this.r=b=yc(this)};h.D=function(b,a){return Lc(this,a)};
h.Y=function(){return ub(J,this.meta)};h.ca=function(b,a){return Oc.c(a,this)};h.da=function(b,a,c){return Oc.h(a,c,this)};h.$=function(){return this.first};h.na=function(){return 1===this.count?J:this.Ba};h.M=function(){return this};h.K=function(b,a){return new Md(a,this.first,this.Ba,this.count,this.r)};h.N=function(b,a){return new Md(this.meta,a,this,this.count+1,null)};Md.prototype[Fa]=function(){return wc(this)};function Nd(b){this.meta=b;this.o=65937614;this.C=8192}h=Nd.prototype;
h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.meta};h.T=function(){return new Nd(this.meta)};h.fa=function(){return null};h.O=function(){return 0};h.L=function(){return zc};h.D=function(b,a){return Lc(this,a)};h.Y=function(){return this};h.ca=function(b,a){return Oc.c(a,this)};h.da=function(b,a,c){return Oc.h(a,c,this)};h.$=function(){return null};h.na=function(){return J};h.M=function(){return null};h.K=function(b,a){return new Nd(a)};
h.N=function(b,a){return new Md(this.meta,a,null,1,null)};var J=new Nd(null);Nd.prototype[Fa]=function(){return wc(this)};function Od(b){return(b?b.o&134217728||b.ne||(b.o?0:v(Hb,b)):v(Hb,b))?Ib(b):Ka.h(Rc,J,b)}
var Pd=function(){function b(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return a.call(this,d)}function a(a){var b;if(a instanceof F&&0===a.i)b=a.k;else a:for(b=[];;)if(null!=a)b.push(a.$(null)),a=a.fa(null);else break a;a=b.length;for(var e=J;;)if(0<a){var f=a-1,e=e.N(null,b[a-1]);a=f}else return e}b.v=0;b.l=function(b){b=E(b);return a(b)};b.j=a;return b}();
function Qd(b,a,c,d){this.meta=b;this.first=a;this.Ba=c;this.r=d;this.o=65929452;this.C=8192}h=Qd.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.meta};h.T=function(){return new Qd(this.meta,this.first,this.Ba,this.r)};h.fa=function(){return null==this.Ba?null:E(this.Ba)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=yc(this)};h.D=function(b,a){return Lc(this,a)};h.Y=function(){return Nc(J,this.meta)};
h.ca=function(b,a){return Oc.c(a,this)};h.da=function(b,a,c){return Oc.h(a,c,this)};h.$=function(){return this.first};h.na=function(){return null==this.Ba?J:this.Ba};h.M=function(){return this};h.K=function(b,a){return new Qd(a,this.first,this.Ba,this.r)};h.N=function(b,a){return new Qd(null,a,this,this.r)};Qd.prototype[Fa]=function(){return wc(this)};function O(b,a){var c=null==a;return(c?c:a&&(a.o&64||a.vb))?new Qd(null,b,a,null):new Qd(null,b,E(a),null)}
function Rd(b,a){if(b.X===a.X)return 0;var c=Aa(b.ja);if(u(c?a.ja:c))return-1;if(u(b.ja)){if(Aa(a.ja))return 1;c=ma(b.ja,a.ja);return 0===c?ma(b.name,a.name):c}return ma(b.name,a.name)}function Y(b,a,c,d){this.ja=b;this.name=a;this.X=c;this.hb=d;this.o=2153775105;this.C=4096}h=Y.prototype;h.G=function(b,a){return Jb(a,[y(":"),y(this.X)].join(""))};h.L=function(){var b=this.hb;return null!=b?b:this.hb=b=rc(lc(this.name),oc(this.ja))+2654435769|0};
h.call=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return U.c(b,this);case 3:return U.h(b,this,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return U.c(b,this)};b.h=function(a,b,d){return U.h(b,this,d)};return b}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.e=function(b){return U.c(b,this)};h.c=function(b,a){return U.h(b,this,a)};h.D=function(b,a){return a instanceof Y?this.X===a.X:!1};
h.toString=function(){return[y(":"),y(this.X)].join("")};h.equiv=function(b){return this.D(null,b)};function Sd(b){return b instanceof Y}function Z(b,a){return b===a?!0:b instanceof Y&&a instanceof Y?b.X===a.X:!1}
var Ud=function(){function b(a,b){return new Y(a,b,[y(u(a)?[y(a),y("/")].join(""):null),y(b)].join(""),null)}function a(a){if(a instanceof Y)return a;if(a instanceof C){var b;if(a&&(a.C&4096||a.Xc))b=a.ja;else throw Error([y("Doesn't support namespace: "),y(a)].join(""));return new Y(b,Td.e?Td.e(a):Td.call(null,a),a.Ia,null)}return"string"===typeof a?(b=a.split("/"),2===b.length?new Y(b[0],b[1],a,null):new Y(null,b[0],a,null)):null}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,
c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}();function Vd(b,a,c,d){this.meta=b;this.nb=a;this.s=c;this.r=d;this.C=0;this.o=32374988}h=Vd.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};function Wd(b){null!=b.nb&&(b.s=b.nb.t?b.nb.t():b.nb.call(null),b.nb=null);return b.s}h.I=function(){return this.meta};h.fa=function(){Db(this);return null==this.s?null:K(this.s)};
h.L=function(){var b=this.r;return null!=b?b:this.r=b=yc(this)};h.D=function(b,a){return Lc(this,a)};h.Y=function(){return Nc(J,this.meta)};h.ca=function(b,a){return Oc.c(a,this)};h.da=function(b,a,c){return Oc.h(a,c,this)};h.$=function(){Db(this);return null==this.s?null:G(this.s)};h.na=function(){Db(this);return null!=this.s?I(this.s):J};h.M=function(){Wd(this);if(null==this.s)return null;for(var b=this.s;;)if(b instanceof Vd)b=Wd(b);else return this.s=b,E(this.s)};
h.K=function(b,a){return new Vd(a,this.nb,this.s,this.r)};h.N=function(b,a){return O(a,this)};Vd.prototype[Fa]=function(){return wc(this)};function Xd(b,a){this.Mb=b;this.end=a;this.C=0;this.o=2}Xd.prototype.O=function(){return this.end};Xd.prototype.add=function(b){this.Mb[this.end]=b;return this.end+=1};Xd.prototype.P=function(){var b=new Yd(this.Mb,0,this.end);this.Mb=null;return b};function Zd(b){return new Xd(Array(b),0)}
function Yd(b,a,c){this.k=b;this.off=a;this.end=c;this.C=0;this.o=524306}h=Yd.prototype;h.ca=function(b,a){return Gc.B(this.k,a,this.k[this.off],this.off+1)};h.da=function(b,a,c){return Gc.B(this.k,a,c,this.off)};h.Xb=function(){if(this.off===this.end)throw Error("-drop-first of empty chunk");return new Yd(this.k,this.off+1,this.end)};h.Q=function(b,a){return this.k[this.off+a]};h.pa=function(b,a,c){return 0<=a&&a<this.end-this.off?this.k[this.off+a]:c};h.O=function(){return this.end-this.off};
var ae=function(){function b(a,b,c){return new Yd(a,b,c)}function a(a,b){return new Yd(a,b,a.length)}function c(a){return new Yd(a,0,a.length)}var d=null,d=function(d,f,g){switch(arguments.length){case 1:return c.call(this,d);case 2:return a.call(this,d,f);case 3:return b.call(this,d,f,g)}throw Error("Invalid arity: "+arguments.length);};d.e=c;d.c=a;d.h=b;return d}();function be(b,a,c,d){this.P=b;this.Fa=a;this.meta=c;this.r=d;this.o=31850732;this.C=1536}h=be.prototype;h.toString=function(){return gc(this)};
h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.meta};h.fa=function(){if(1<Ra(this.P))return new be(Vb(this.P),this.Fa,this.meta,null);var b=Db(this.Fa);return null==b?null:b};h.L=function(){var b=this.r;return null!=b?b:this.r=b=yc(this)};h.D=function(b,a){return Lc(this,a)};h.Y=function(){return Nc(J,this.meta)};h.$=function(){return B.c(this.P,0)};h.na=function(){return 1<Ra(this.P)?new be(Vb(this.P),this.Fa,this.meta,null):null==this.Fa?J:this.Fa};h.M=function(){return this};
h.Ob=function(){return this.P};h.Pb=function(){return null==this.Fa?J:this.Fa};h.K=function(b,a){return new be(this.P,this.Fa,a,this.r)};h.N=function(b,a){return O(a,this)};h.Nb=function(){return null==this.Fa?null:this.Fa};be.prototype[Fa]=function(){return wc(this)};function ce(b,a){return 0===Ra(b)?a:new be(b,a,null,null)}function de(b,a){b.add(a)}function Ad(b){for(var a=[];;)if(E(b))a.push(G(b)),b=K(b);else return a}
function ee(b,a){if(Hc(b))return R(b);for(var c=b,d=a,e=0;;)if(0<d&&E(c))c=K(c),--d,e+=1;else return e}
var fe=function fe(a){return null==a?null:null==K(a)?E(G(a)):O(G(a),fe(K(a)))},ge=function(){function b(a,b){return new Vd(null,function(){var c=E(a);return c?gd(c)?ce(Wb(c),d.c(Xb(c),b)):O(G(c),d.c(I(c),b)):b},null,null)}function a(a){return new Vd(null,function(){return a},null,null)}function c(){return new Vd(null,function(){return null},null,null)}var d=null,e=function(){function a(c,d,e){var f=null;if(2<arguments.length){for(var f=0,p=Array(arguments.length-2);f<p.length;)p[f]=arguments[f+2],
++f;f=new F(p,0)}return b.call(this,c,d,f)}function b(a,c,e){return function p(a,b){return new Vd(null,function(){var c=E(a);return c?gd(c)?ce(Wb(c),p(Xb(c),b)):O(G(c),p(I(c),b)):u(b)?p(G(b),K(b)):null},null,null)}(d.c(a,c),e)}a.v=2;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=I(a);return b(c,d,a)};a.j=b;return a}(),d=function(d,g,k){switch(arguments.length){case 0:return c.call(this);case 1:return a.call(this,d);case 2:return b.call(this,d,g);default:var l=null;if(2<arguments.length){for(var l=
0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return e.j(d,g,l)}throw Error("Invalid arity: "+arguments.length);};d.v=2;d.l=e.l;d.t=c;d.e=a;d.c=b;d.j=e.j;return d}(),he=function(){function b(a,b,c,d){return O(a,O(b,O(c,d)))}function a(a,b,c){return O(a,O(b,c))}var c=null,d=function(){function a(c,d,e,m,n){var p=null;if(4<arguments.length){for(var p=0,r=Array(arguments.length-4);p<r.length;)r[p]=arguments[p+4],++p;p=new F(r,0)}return b.call(this,c,d,e,m,p)}function b(a,
c,d,e,f){return O(a,O(c,O(d,O(e,fe(f)))))}a.v=4;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var n=G(a);a=I(a);return b(c,d,e,n,a)};a.j=b;return a}(),c=function(c,f,g,k,l){switch(arguments.length){case 1:return E(c);case 2:return O(c,f);case 3:return a.call(this,c,f,g);case 4:return b.call(this,c,f,g,k);default:var m=null;if(4<arguments.length){for(var m=0,n=Array(arguments.length-4);m<n.length;)n[m]=arguments[m+4],++m;m=new F(n,0)}return d.j(c,f,g,k,m)}throw Error("Invalid arity: "+
arguments.length);};c.v=4;c.l=d.l;c.e=function(a){return E(a)};c.c=function(a,b){return O(a,b)};c.h=a;c.B=b;c.j=d.j;return c}();function ie(b){return Sb(b)}
var je=function(){function b(){return Qb(Qc)}var a=null,c=function(){function a(c,d,k){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return b.call(this,c,d,l)}function b(a,c,d){for(;;)if(a=Rb(a,c),u(d))c=G(d),d=K(d);else return a}a.v=2;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=I(a);return b(c,d,a)};a.j=b;return a}(),a=function(a,e,f){switch(arguments.length){case 0:return b.call(this);case 1:return a;case 2:return Rb(a,
e);default:var g=null;if(2<arguments.length){for(var g=0,k=Array(arguments.length-2);g<k.length;)k[g]=arguments[g+2],++g;g=new F(k,0)}return c.j(a,e,g)}throw Error("Invalid arity: "+arguments.length);};a.v=2;a.l=c.l;a.t=b;a.e=function(a){return a};a.c=function(a,b){return Rb(a,b)};a.j=c.j;return a}(),ke=function(){var b=null,a=function(){function a(c,f,g,k){var l=null;if(3<arguments.length){for(var l=0,m=Array(arguments.length-3);l<m.length;)m[l]=arguments[l+3],++l;l=new F(m,0)}return b.call(this,
c,f,g,l)}function b(a,c,d,k){for(;;)if(a=Tb(a,c,d),u(k))c=G(k),d=Pc(k),k=K(K(k));else return a}a.v=3;a.l=function(a){var c=G(a);a=K(a);var g=G(a);a=K(a);var k=G(a);a=I(a);return b(c,g,k,a)};a.j=b;return a}(),b=function(b,d,e,f){switch(arguments.length){case 3:return Tb(b,d,e);default:var g=null;if(3<arguments.length){for(var g=0,k=Array(arguments.length-3);g<k.length;)k[g]=arguments[g+3],++g;g=new F(k,0)}return a.j(b,d,e,g)}throw Error("Invalid arity: "+arguments.length);};b.v=3;b.l=a.l;b.h=function(a,
b,e){return Tb(a,b,e)};b.j=a.j;return b}();
function le(b,a,c){var d=E(c);if(0===a)return b.t?b.t():b.call(null);c=Wa(d);var e=Xa(d);if(1===a)return b.e?b.e(c):b.e?b.e(c):b.call(null,c);var d=Wa(e),f=Xa(e);if(2===a)return b.c?b.c(c,d):b.c?b.c(c,d):b.call(null,c,d);var e=Wa(f),g=Xa(f);if(3===a)return b.h?b.h(c,d,e):b.h?b.h(c,d,e):b.call(null,c,d,e);var f=Wa(g),k=Xa(g);if(4===a)return b.B?b.B(c,d,e,f):b.B?b.B(c,d,e,f):b.call(null,c,d,e,f);var g=Wa(k),l=Xa(k);if(5===a)return b.J?b.J(c,d,e,f,g):b.J?b.J(c,d,e,f,g):b.call(null,c,d,e,f,g);var k=Wa(l),
m=Xa(l);if(6===a)return b.ba?b.ba(c,d,e,f,g,k):b.ba?b.ba(c,d,e,f,g,k):b.call(null,c,d,e,f,g,k);var l=Wa(m),n=Xa(m);if(7===a)return b.wa?b.wa(c,d,e,f,g,k,l):b.wa?b.wa(c,d,e,f,g,k,l):b.call(null,c,d,e,f,g,k,l);var m=Wa(n),p=Xa(n);if(8===a)return b.Ua?b.Ua(c,d,e,f,g,k,l,m):b.Ua?b.Ua(c,d,e,f,g,k,l,m):b.call(null,c,d,e,f,g,k,l,m);var n=Wa(p),r=Xa(p);if(9===a)return b.Va?b.Va(c,d,e,f,g,k,l,m,n):b.Va?b.Va(c,d,e,f,g,k,l,m,n):b.call(null,c,d,e,f,g,k,l,m,n);var p=Wa(r),w=Xa(r);if(10===a)return b.Ja?b.Ja(c,
d,e,f,g,k,l,m,n,p):b.Ja?b.Ja(c,d,e,f,g,k,l,m,n,p):b.call(null,c,d,e,f,g,k,l,m,n,p);var r=Wa(w),z=Xa(w);if(11===a)return b.Ka?b.Ka(c,d,e,f,g,k,l,m,n,p,r):b.Ka?b.Ka(c,d,e,f,g,k,l,m,n,p,r):b.call(null,c,d,e,f,g,k,l,m,n,p,r);var w=Wa(z),D=Xa(z);if(12===a)return b.La?b.La(c,d,e,f,g,k,l,m,n,p,r,w):b.La?b.La(c,d,e,f,g,k,l,m,n,p,r,w):b.call(null,c,d,e,f,g,k,l,m,n,p,r,w);var z=Wa(D),H=Xa(D);if(13===a)return b.Ma?b.Ma(c,d,e,f,g,k,l,m,n,p,r,w,z):b.Ma?b.Ma(c,d,e,f,g,k,l,m,n,p,r,w,z):b.call(null,c,d,e,f,g,k,l,
m,n,p,r,w,z);var D=Wa(H),P=Xa(H);if(14===a)return b.Na?b.Na(c,d,e,f,g,k,l,m,n,p,r,w,z,D):b.Na?b.Na(c,d,e,f,g,k,l,m,n,p,r,w,z,D):b.call(null,c,d,e,f,g,k,l,m,n,p,r,w,z,D);var H=Wa(P),N=Xa(P);if(15===a)return b.Oa?b.Oa(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H):b.Oa?b.Oa(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H):b.call(null,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H);var P=Wa(N),ra=Xa(N);if(16===a)return b.Pa?b.Pa(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P):b.Pa?b.Pa(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P):b.call(null,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P);var N=
Wa(ra),Ja=Xa(ra);if(17===a)return b.Qa?b.Qa(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N):b.Qa?b.Qa(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N):b.call(null,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N);var ra=Wa(Ja),eb=Xa(Ja);if(18===a)return b.Ra?b.Ra(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra):b.Ra?b.Ra(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra):b.call(null,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra);Ja=Wa(eb);eb=Xa(eb);if(19===a)return b.Sa?b.Sa(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja):b.Sa?b.Sa(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja):b.call(null,
c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja);var T=Wa(eb);Xa(eb);if(20===a)return b.Ta?b.Ta(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja,T):b.Ta?b.Ta(c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja,T):b.call(null,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H,P,N,ra,Ja,T);throw Error("Only up to 20 arguments supported on functions");}
var V=function(){function b(a,b,c,d,e){b=he.B(b,c,d,e);c=a.v;return a.l?(d=ee(b,c+1),d<=c?le(a,d,b):a.l(b)):a.apply(a,Ad(b))}function a(a,b,c,d){b=he.h(b,c,d);c=a.v;return a.l?(d=ee(b,c+1),d<=c?le(a,d,b):a.l(b)):a.apply(a,Ad(b))}function c(a,b,c){b=he.c(b,c);c=a.v;if(a.l){var d=ee(b,c+1);return d<=c?le(a,d,b):a.l(b)}return a.apply(a,Ad(b))}function d(a,b){var c=a.v;if(a.l){var d=ee(b,c+1);return d<=c?le(a,d,b):a.l(b)}return a.apply(a,Ad(b))}var e=null,f=function(){function a(c,d,e,f,g,w){var z=null;
if(5<arguments.length){for(var z=0,D=Array(arguments.length-5);z<D.length;)D[z]=arguments[z+5],++z;z=new F(D,0)}return b.call(this,c,d,e,f,g,z)}function b(a,c,d,e,f,g){c=O(c,O(d,O(e,O(f,fe(g)))));d=a.v;return a.l?(e=ee(c,d+1),e<=d?le(a,e,c):a.l(c)):a.apply(a,Ad(c))}a.v=5;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var f=G(a);a=K(a);var g=G(a);a=I(a);return b(c,d,e,f,g,a)};a.j=b;return a}(),e=function(e,k,l,m,n,p){switch(arguments.length){case 2:return d.call(this,e,k);case 3:return c.call(this,
e,k,l);case 4:return a.call(this,e,k,l,m);case 5:return b.call(this,e,k,l,m,n);default:var r=null;if(5<arguments.length){for(var r=0,w=Array(arguments.length-5);r<w.length;)w[r]=arguments[r+5],++r;r=new F(w,0)}return f.j(e,k,l,m,n,r)}throw Error("Invalid arity: "+arguments.length);};e.v=5;e.l=f.l;e.c=d;e.h=c;e.B=a;e.J=b;e.j=f.j;return e}(),me=function(){function b(a,b){return!L.c(a,b)}var a=null,c=function(){function a(c,d,k){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-
2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return b.call(this,c,d,l)}function b(a,c,d){return Aa(V.B(L,a,c,d))}a.v=2;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=I(a);return b(c,d,a)};a.j=b;return a}(),a=function(a,e,f){switch(arguments.length){case 1:return!1;case 2:return b.call(this,a,e);default:var g=null;if(2<arguments.length){for(var g=0,k=Array(arguments.length-2);g<k.length;)k[g]=arguments[g+2],++g;g=new F(k,0)}return c.j(a,e,g)}throw Error("Invalid arity: "+arguments.length);};
a.v=2;a.l=c.l;a.e=function(){return!1};a.c=b;a.j=c.j;return a}();function ne(b){return E(b)?b:null}function oe(b,a){for(;;){if(null==E(a))return!0;var c;c=G(a);c=b.e?b.e(c):b.call(null,c);if(u(c)){c=b;var d=K(a);b=c;a=d}else return!1}}function pe(b,a){for(;;)if(E(a)){var c;c=G(a);c=b.e?b.e(c):b.call(null,c);if(u(c))return c;c=b;var d=K(a);b=c;a=d}else return null}
function qe(b){return function(){function a(a,c){return Aa(b.c?b.c(a,c):b.call(null,a,c))}function c(a){return Aa(b.e?b.e(a):b.call(null,a))}function d(){return Aa(b.t?b.t():b.call(null))}var e=null,f=function(){function a(b,d,e){var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new F(g,0)}return c.call(this,b,d,f)}function c(a,d,e){return Aa(V.B(b,a,d,e))}a.v=2;a.l=function(a){var b=G(a);a=K(a);var d=G(a);a=I(a);return c(b,d,a)};a.j=c;
return a}(),e=function(b,e,l){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,b);case 2:return a.call(this,b,e);default:var m=null;if(2<arguments.length){for(var m=0,n=Array(arguments.length-2);m<n.length;)n[m]=arguments[m+2],++m;m=new F(n,0)}return f.j(b,e,m)}throw Error("Invalid arity: "+arguments.length);};e.v=2;e.l=f.l;e.t=d;e.e=c;e.c=a;e.j=f.j;return e}()}
function re(){var b=sd;return function(){function a(a){if(0<arguments.length)for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;return b}a.v=0;a.l=function(a){E(a);return b};a.j=function(){return b};return a}()}
var se=function(){function b(a,b,c){return function(){function d(k,l,m){k=c.h?c.h(k,l,m):c.call(null,k,l,m);k=b.e?b.e(k):b.call(null,k);return a.e?a.e(k):a.call(null,k)}function l(d,k){var l;l=c.c?c.c(d,k):c.call(null,d,k);l=b.e?b.e(l):b.call(null,l);return a.e?a.e(l):a.call(null,l)}function m(d){d=c.e?c.e(d):c.call(null,d);d=b.e?b.e(d):b.call(null,d);return a.e?a.e(d):a.call(null,d)}function n(){var d;d=c.t?c.t():c.call(null);d=b.e?b.e(d):b.call(null,d);return a.e?a.e(d):a.call(null,d)}var p=null,
r=function(){function d(a,b,c,e){var f=null;if(3<arguments.length){for(var f=0,g=Array(arguments.length-3);f<g.length;)g[f]=arguments[f+3],++f;f=new F(g,0)}return k.call(this,a,b,c,f)}function k(d,l,m,n){d=V.J(c,d,l,m,n);d=b.e?b.e(d):b.call(null,d);return a.e?a.e(d):a.call(null,d)}d.v=3;d.l=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var d=G(a);a=I(a);return k(b,c,d,a)};d.j=k;return d}(),p=function(a,b,c,e){switch(arguments.length){case 0:return n.call(this);case 1:return m.call(this,a);case 2:return l.call(this,
a,b);case 3:return d.call(this,a,b,c);default:var f=null;if(3<arguments.length){for(var f=0,g=Array(arguments.length-3);f<g.length;)g[f]=arguments[f+3],++f;f=new F(g,0)}return r.j(a,b,c,f)}throw Error("Invalid arity: "+arguments.length);};p.v=3;p.l=r.l;p.t=n;p.e=m;p.c=l;p.h=d;p.j=r.j;return p}()}function a(a,b){return function(){function c(d,g,k){d=b.h?b.h(d,g,k):b.call(null,d,g,k);return a.e?a.e(d):a.call(null,d)}function d(c,g){var k=b.c?b.c(c,g):b.call(null,c,g);return a.e?a.e(k):a.call(null,k)}
function l(c){c=b.e?b.e(c):b.call(null,c);return a.e?a.e(c):a.call(null,c)}function m(){var c=b.t?b.t():b.call(null);return a.e?a.e(c):a.call(null,c)}var n=null,p=function(){function c(a,b,e,f){var g=null;if(3<arguments.length){for(var g=0,k=Array(arguments.length-3);g<k.length;)k[g]=arguments[g+3],++g;g=new F(k,0)}return d.call(this,a,b,e,g)}function d(c,g,k,l){c=V.J(b,c,g,k,l);return a.e?a.e(c):a.call(null,c)}c.v=3;c.l=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var e=G(a);a=I(a);return d(b,
c,e,a)};c.j=d;return c}(),n=function(a,b,e,f){switch(arguments.length){case 0:return m.call(this);case 1:return l.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,e);default:var n=null;if(3<arguments.length){for(var n=0,P=Array(arguments.length-3);n<P.length;)P[n]=arguments[n+3],++n;n=new F(P,0)}return p.j(a,b,e,n)}throw Error("Invalid arity: "+arguments.length);};n.v=3;n.l=p.l;n.t=m;n.e=l;n.c=d;n.h=c;n.j=p.j;return n}()}var c=null,d=function(){function a(c,d,e,m){var n=null;
if(3<arguments.length){for(var n=0,p=Array(arguments.length-3);n<p.length;)p[n]=arguments[n+3],++n;n=new F(p,0)}return b.call(this,c,d,e,n)}function b(a,c,d,e){return function(a){return function(){function b(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return c.call(this,d)}function c(b){b=V.c(G(a),b);for(var d=K(a);;)if(d)b=G(d).call(null,b),d=K(d);else return b}b.v=0;b.l=function(a){a=E(a);return c(a)};b.j=c;return b}()}(Od(he.B(a,
c,d,e)))}a.v=3;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=I(a);return b(c,d,e,a)};a.j=b;return a}(),c=function(c,f,g,k){switch(arguments.length){case 0:return Dd;case 1:return c;case 2:return a.call(this,c,f);case 3:return b.call(this,c,f,g);default:var l=null;if(3<arguments.length){for(var l=0,m=Array(arguments.length-3);l<m.length;)m[l]=arguments[l+3],++l;l=new F(m,0)}return d.j(c,f,g,l)}throw Error("Invalid arity: "+arguments.length);};c.v=3;c.l=d.l;c.t=function(){return Dd};
c.e=function(a){return a};c.c=a;c.h=b;c.j=d.j;return c}(),te=function(){function b(a,b,c,d){return function(){function e(m,n,p){return a.ba?a.ba(b,c,d,m,n,p):a.call(null,b,c,d,m,n,p)}function n(e,m){return a.J?a.J(b,c,d,e,m):a.call(null,b,c,d,e,m)}function p(e){return a.B?a.B(b,c,d,e):a.call(null,b,c,d,e)}function r(){return a.h?a.h(b,c,d):a.call(null,b,c,d)}var w=null,z=function(){function e(a,b,c,d){var f=null;if(3<arguments.length){for(var f=0,g=Array(arguments.length-3);f<g.length;)g[f]=arguments[f+
3],++f;f=new F(g,0)}return m.call(this,a,b,c,f)}function m(e,n,p,r){return V.j(a,b,c,d,e,Q([n,p,r],0))}e.v=3;e.l=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var d=G(a);a=I(a);return m(b,c,d,a)};e.j=m;return e}(),w=function(a,b,c,d){switch(arguments.length){case 0:return r.call(this);case 1:return p.call(this,a);case 2:return n.call(this,a,b);case 3:return e.call(this,a,b,c);default:var f=null;if(3<arguments.length){for(var f=0,g=Array(arguments.length-3);f<g.length;)g[f]=arguments[f+3],++f;f=
new F(g,0)}return z.j(a,b,c,f)}throw Error("Invalid arity: "+arguments.length);};w.v=3;w.l=z.l;w.t=r;w.e=p;w.c=n;w.h=e;w.j=z.j;return w}()}function a(a,b,c){return function(){function d(e,l,m){return a.J?a.J(b,c,e,l,m):a.call(null,b,c,e,l,m)}function e(d,l){return a.B?a.B(b,c,d,l):a.call(null,b,c,d,l)}function n(d){return a.h?a.h(b,c,d):a.call(null,b,c,d)}function p(){return a.c?a.c(b,c):a.call(null,b,c)}var r=null,w=function(){function d(a,b,c,f){var g=null;if(3<arguments.length){for(var g=0,k=Array(arguments.length-
3);g<k.length;)k[g]=arguments[g+3],++g;g=new F(k,0)}return e.call(this,a,b,c,g)}function e(d,l,m,n){return V.j(a,b,c,d,l,Q([m,n],0))}d.v=3;d.l=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var d=G(a);a=I(a);return e(b,c,d,a)};d.j=e;return d}(),r=function(a,b,c,f){switch(arguments.length){case 0:return p.call(this);case 1:return n.call(this,a);case 2:return e.call(this,a,b);case 3:return d.call(this,a,b,c);default:var g=null;if(3<arguments.length){for(var g=0,k=Array(arguments.length-3);g<k.length;)k[g]=
arguments[g+3],++g;g=new F(k,0)}return w.j(a,b,c,g)}throw Error("Invalid arity: "+arguments.length);};r.v=3;r.l=w.l;r.t=p;r.e=n;r.c=e;r.h=d;r.j=w.j;return r}()}function c(a,b){return function(){function c(d,e,k){return a.B?a.B(b,d,e,k):a.call(null,b,d,e,k)}function d(c,e){return a.h?a.h(b,c,e):a.call(null,b,c,e)}function e(c){return a.c?a.c(b,c):a.call(null,b,c)}function n(){return a.e?a.e(b):a.call(null,b)}var p=null,r=function(){function c(a,b,e,f){var g=null;if(3<arguments.length){for(var g=0,
k=Array(arguments.length-3);g<k.length;)k[g]=arguments[g+3],++g;g=new F(k,0)}return d.call(this,a,b,e,g)}function d(c,e,k,l){return V.j(a,b,c,e,k,Q([l],0))}c.v=3;c.l=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var e=G(a);a=I(a);return d(b,c,e,a)};c.j=d;return c}(),p=function(a,b,f,g){switch(arguments.length){case 0:return n.call(this);case 1:return e.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,f);default:var p=null;if(3<arguments.length){for(var p=0,N=Array(arguments.length-
3);p<N.length;)N[p]=arguments[p+3],++p;p=new F(N,0)}return r.j(a,b,f,p)}throw Error("Invalid arity: "+arguments.length);};p.v=3;p.l=r.l;p.t=n;p.e=e;p.c=d;p.h=c;p.j=r.j;return p}()}var d=null,e=function(){function a(c,d,e,f,p){var r=null;if(4<arguments.length){for(var r=0,w=Array(arguments.length-4);r<w.length;)w[r]=arguments[r+4],++r;r=new F(w,0)}return b.call(this,c,d,e,f,r)}function b(a,c,d,e,f){return function(){function b(a){var c=null;if(0<arguments.length){for(var c=0,d=Array(arguments.length-
0);c<d.length;)d[c]=arguments[c+0],++c;c=new F(d,0)}return g.call(this,c)}function g(b){return V.J(a,c,d,e,ge.c(f,b))}b.v=0;b.l=function(a){a=E(a);return g(a)};b.j=g;return b}()}a.v=4;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var f=G(a);a=I(a);return b(c,d,e,f,a)};a.j=b;return a}(),d=function(d,g,k,l,m){switch(arguments.length){case 1:return d;case 2:return c.call(this,d,g);case 3:return a.call(this,d,g,k);case 4:return b.call(this,d,g,k,l);default:var n=null;if(4<arguments.length){for(var n=
0,p=Array(arguments.length-4);n<p.length;)p[n]=arguments[n+4],++n;n=new F(p,0)}return e.j(d,g,k,l,n)}throw Error("Invalid arity: "+arguments.length);};d.v=4;d.l=e.l;d.e=function(a){return a};d.c=c;d.h=a;d.B=b;d.j=e.j;return d}(),ue=function(){function b(a,b){return new Vd(null,function(){var f=E(b);if(f){if(gd(f)){for(var g=Wb(f),k=R(g),l=Zd(k),m=0;;)if(m<k){var n=function(){var b=B.c(g,m);return a.e?a.e(b):a.call(null,b)}();null!=n&&l.add(n);m+=1}else break;return ce(l.P(),c.c(a,Xb(f)))}k=function(){var b=
G(f);return a.e?a.e(b):a.call(null,b)}();return null==k?c.c(a,I(f)):O(k,c.c(a,I(f)))}return null},null,null)}function a(a){return function(b){return function(){function c(f,g){var k=a.e?a.e(g):a.call(null,g);return null==k?f:b.c?b.c(f,k):b.call(null,f,k)}function g(a){return b.e?b.e(a):b.call(null,a)}function k(){return b.t?b.t():b.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return k.call(this);case 1:return g.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+
arguments.length);};l.t=k;l.e=g;l.c=c;return l}()}}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}();function ve(b,a,c,d){this.state=b;this.meta=a;this.de=c;this.pb=d;this.o=6455296;this.C=16386}h=ve.prototype;h.L=function(){return this[ba]||(this[ba]=++ca)};
h.cc=function(b,a,c){for(var d=E(this.pb),e=null,f=0,g=0;;)if(g<f){b=e.Q(null,g);var k=S.h(b,0,null);b=S.h(b,1,null);var l=a,m=c;b.B?b.B(k,this,l,m):b.call(null,k,this,l,m);g+=1}else if(b=E(d))d=b,gd(d)?(e=Wb(d),d=Xb(d),b=e,f=R(e),e=b):(b=G(d),k=S.h(b,0,null),b=S.h(b,1,null),e=k,f=a,g=c,b.B?b.B(e,this,f,g):b.call(null,e,this,f,g),d=K(d),e=null,f=0),g=0;else return null};h.bc=function(b,a,c){this.pb=Vc.h(this.pb,a,c);return this};h.dc=function(b,a){return this.pb=Wc.c(this.pb,a)};h.I=function(){return this.meta};
h.Da=function(){return this.state};h.D=function(b,a){return this===a};h.equiv=function(b){return this.D(null,b)};
var ye=function(){function b(a){return new ve(a,null,null,null)}var a=null,c=function(){function a(c,d){var k=null;if(1<arguments.length){for(var k=0,l=Array(arguments.length-1);k<l.length;)l[k]=arguments[k+1],++k;k=new F(l,0)}return b.call(this,c,k)}function b(a,c){var d=ld(c)?V.c(we,c):c,e=U.c(d,xe),d=U.c(d,va);return new ve(a,d,e,null)}a.v=1;a.l=function(a){var c=G(a);a=I(a);return b(c,a)};a.j=b;return a}(),a=function(a,e){switch(arguments.length){case 1:return b.call(this,a);default:var f=null;
if(1<arguments.length){for(var f=0,g=Array(arguments.length-1);f<g.length;)g[f]=arguments[f+1],++f;f=new F(g,0)}return c.j(a,f)}throw Error("Invalid arity: "+arguments.length);};a.v=1;a.l=c.l;a.e=b;a.j=c.j;return a}();
function ze(b,a){if(b instanceof ve){var c=b.de;if(null!=c&&!u(c.e?c.e(a):c.call(null,a)))throw Error([y("Assert failed: "),y("Validator rejected reference state"),y("\n"),y(function(){var a=Pd(new C(null,"validate","validate",1439230700,null),new C(null,"new-value","new-value",-1567397401,null));return Ae.e?Ae.e(a):Ae.call(null,a)}())].join(""));c=b.state;b.state=a;null!=b.pb&&Mb(b,c,a);return a}return bc(b,a)}
var Be=function(){function b(a,b,c,d){if(a instanceof ve){var e=a.state;b=b.h?b.h(e,c,d):b.call(null,e,c,d);a=ze(a,b)}else a=cc.B(a,b,c,d);return a}function a(a,b,c){if(a instanceof ve){var d=a.state;b=b.c?b.c(d,c):b.call(null,d,c);a=ze(a,b)}else a=cc.h(a,b,c);return a}function c(a,b){var c;a instanceof ve?(c=a.state,c=b.e?b.e(c):b.call(null,c),c=ze(a,c)):c=cc.c(a,b);return c}var d=null,e=function(){function a(c,d,e,f,p){var r=null;if(4<arguments.length){for(var r=0,w=Array(arguments.length-4);r<
w.length;)w[r]=arguments[r+4],++r;r=new F(w,0)}return b.call(this,c,d,e,f,r)}function b(a,c,d,e,f){return a instanceof ve?ze(a,V.J(c,a.state,d,e,f)):cc.J(a,c,d,e,f)}a.v=4;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var f=G(a);a=I(a);return b(c,d,e,f,a)};a.j=b;return a}(),d=function(d,g,k,l,m){switch(arguments.length){case 2:return c.call(this,d,g);case 3:return a.call(this,d,g,k);case 4:return b.call(this,d,g,k,l);default:var n=null;if(4<arguments.length){for(var n=0,p=Array(arguments.length-
4);n<p.length;)p[n]=arguments[n+4],++n;n=new F(p,0)}return e.j(d,g,k,l,n)}throw Error("Invalid arity: "+arguments.length);};d.v=4;d.l=e.l;d.c=c;d.h=a;d.B=b;d.j=e.j;return d}();function Ce(b){this.state=b;this.C=0;this.o=32768}Ce.prototype.Da=function(){return this.state};Ce.prototype.Fb=function(b,a){return this.state=a};
var De=function(){function b(a,b,c,d){return new Vd(null,function(){var f=E(b),p=E(c),r=E(d);if(f&&p&&r){var w=O,z;z=G(f);var D=G(p),H=G(r);z=a.h?a.h(z,D,H):a.call(null,z,D,H);f=w(z,e.B(a,I(f),I(p),I(r)))}else f=null;return f},null,null)}function a(a,b,c){return new Vd(null,function(){var d=E(b),f=E(c);if(d&&f){var p=O,r;r=G(d);var w=G(f);r=a.c?a.c(r,w):a.call(null,r,w);d=p(r,e.h(a,I(d),I(f)))}else d=null;return d},null,null)}function c(a,b){return new Vd(null,function(){var c=E(b);if(c){if(gd(c)){for(var d=
Wb(c),f=R(d),p=Zd(f),r=0;;)if(r<f)de(p,function(){var b=B.c(d,r);return a.e?a.e(b):a.call(null,b)}()),r+=1;else break;return ce(p.P(),e.c(a,Xb(c)))}return O(function(){var b=G(c);return a.e?a.e(b):a.call(null,b)}(),e.c(a,I(c)))}return null},null,null)}function d(a){return function(b){return function(){function c(d,e){var f=a.e?a.e(e):a.call(null,e);return b.c?b.c(d,f):b.call(null,d,f)}function d(a){return b.e?b.e(a):b.call(null,a)}function e(){return b.t?b.t():b.call(null)}var f=null,r=function(){function c(a,
b,e){var f=null;if(2<arguments.length){for(var f=0,g=Array(arguments.length-2);f<g.length;)g[f]=arguments[f+2],++f;f=new F(g,0)}return d.call(this,a,b,f)}function d(c,e,f){e=V.h(a,e,f);return b.c?b.c(c,e):b.call(null,c,e)}c.v=2;c.l=function(a){var b=G(a);a=K(a);var c=G(a);a=I(a);return d(b,c,a)};c.j=d;return c}(),f=function(a,b,f){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b);default:var g=null;if(2<arguments.length){for(var g=0,k=
Array(arguments.length-2);g<k.length;)k[g]=arguments[g+2],++g;g=new F(k,0)}return r.j(a,b,g)}throw Error("Invalid arity: "+arguments.length);};f.v=2;f.l=r.l;f.t=e;f.e=d;f.c=c;f.j=r.j;return f}()}}var e=null,f=function(){function a(c,d,e,f,g){var w=null;if(4<arguments.length){for(var w=0,z=Array(arguments.length-4);w<z.length;)z[w]=arguments[w+4],++w;w=new F(z,0)}return b.call(this,c,d,e,f,w)}function b(a,c,d,f,g){var k=function D(a){return new Vd(null,function(){var b=e.c(E,a);return oe(Dd,b)?O(e.c(G,
b),D(e.c(I,b))):null},null,null)};return e.c(function(){return function(b){return V.c(a,b)}}(k),k(Rc.j(g,f,Q([d,c],0))))}a.v=4;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var f=G(a);a=I(a);return b(c,d,e,f,a)};a.j=b;return a}(),e=function(e,k,l,m,n){switch(arguments.length){case 1:return d.call(this,e);case 2:return c.call(this,e,k);case 3:return a.call(this,e,k,l);case 4:return b.call(this,e,k,l,m);default:var p=null;if(4<arguments.length){for(var p=0,r=Array(arguments.length-
4);p<r.length;)r[p]=arguments[p+4],++p;p=new F(r,0)}return f.j(e,k,l,m,p)}throw Error("Invalid arity: "+arguments.length);};e.v=4;e.l=f.l;e.e=d;e.c=c;e.h=a;e.B=b;e.j=f.j;return e}(),Fe=function(){function b(a,b){return new Vd(null,function(){if(0<a){var f=E(b);return f?O(G(f),c.c(a-1,I(f))):null}return null},null,null)}function a(a){return function(b){return function(a){return function(){function c(d,g){var k=pb(a),l=a.Fb(0,a.Da(null)-1),k=0<k?b.c?b.c(d,g):b.call(null,d,g):d;return 0<l?k:Ec(k)?k:
new Dc(k)}function d(a){return b.e?b.e(a):b.call(null,a)}function l(){return b.t?b.t():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.t=l;m.e=d;m.c=c;return m}()}(new Ce(a))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=
b;return c}(),Ge=function(){function b(a,b){return new Vd(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var c=E(b);if(0<a&&c){var d=a-1,c=I(c);a=d;b=c}else return c}}),null,null)}function a(a){return function(b){return function(a){return function(){function c(d,g){var k=pb(a);a.Fb(0,a.Da(null)-1);return 0<k?d:b.c?b.c(d,g):b.call(null,d,g)}function d(a){return b.e?b.e(a):b.call(null,a)}function l(){return b.t?b.t():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);
case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.t=l;m.e=d;m.c=c;return m}()}(new Ce(a))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),He=function(){function b(a,b){return new Vd(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var c=E(b),d;if(d=c)d=G(c),d=a.e?a.e(d):a.call(null,
d);if(u(d))d=a,c=I(c),a=d,b=c;else return c}}),null,null)}function a(a){return function(b){return function(c){return function(){function g(g,k){var l=pb(c);if(u(u(l)?a.e?a.e(k):a.call(null,k):l))return g;dc(c,null);return b.c?b.c(g,k):b.call(null,g,k)}function k(a){return b.e?b.e(a):b.call(null,a)}function l(){return b.t?b.t():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);case 1:return k.call(this,a);case 2:return g.call(this,a,b)}throw Error("Invalid arity: "+
arguments.length);};m.t=l;m.e=k;m.c=g;return m}()}(new Ce(!0))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),Ie=function(){function b(a,b){return Fe.c(a,c.e(b))}function a(a){return new Vd(null,function(){return O(a,c.e(a))},null,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+
arguments.length);};c.e=a;c.c=b;return c}(),Je=function(){function b(b,c){return new Vd(null,function(){var f=E(b),g=E(c);return f&&g?O(G(f),O(G(g),a.c(I(f),I(g)))):null},null,null)}var a=null,c=function(){function b(a,d,k){var l=null;if(2<arguments.length){for(var l=0,m=Array(arguments.length-2);l<m.length;)m[l]=arguments[l+2],++l;l=new F(m,0)}return c.call(this,a,d,l)}function c(b,d,e){return new Vd(null,function(){var c=De.c(E,Rc.j(e,d,Q([b],0)));return oe(Dd,c)?ge.c(De.c(G,c),V.c(a,De.c(I,c))):
null},null,null)}b.v=2;b.l=function(a){var b=G(a);a=K(a);var d=G(a);a=I(a);return c(b,d,a)};b.j=c;return b}(),a=function(a,e,f){switch(arguments.length){case 2:return b.call(this,a,e);default:var g=null;if(2<arguments.length){for(var g=0,k=Array(arguments.length-2);g<k.length;)k[g]=arguments[g+2],++g;g=new F(k,0)}return c.j(a,e,g)}throw Error("Invalid arity: "+arguments.length);};a.v=2;a.l=c.l;a.c=b;a.j=c.j;return a}(),Ke=function(){function b(a,b){return Ge.c(1,Je.c(Ie.e(a),b))}function a(a){return function(b){return function(c){return function(){function g(g,
k){if(u(pb(c))){var l=b.c?b.c(g,a):b.call(null,g,a);return Ec(l)?l:b.c?b.c(l,k):b.call(null,l,k)}dc(c,!0);return b.c?b.c(g,k):b.call(null,g,k)}function k(a){return b.e?b.e(a):b.call(null,a)}function l(){return b.t?b.t():b.call(null)}var m=null,m=function(a,b){switch(arguments.length){case 0:return l.call(this);case 1:return k.call(this,a);case 2:return g.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};m.t=l;m.e=k;m.c=g;return m}()}(new Ce(!1))}}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,
c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),Me=function(){function b(a){return se.c(De.e(a),Le)}var a=null,c=function(){function a(c,d){var k=null;if(1<arguments.length){for(var k=0,l=Array(arguments.length-1);k<l.length;)l[k]=arguments[k+1],++k;k=new F(l,0)}return b.call(this,c,k)}function b(a,c){return V.c(ge,V.h(De,a,c))}a.v=1;a.l=function(a){var c=G(a);a=I(a);return b(c,a)};a.j=b;return a}(),a=function(a,e){switch(arguments.length){case 1:return b.call(this,
a);default:var f=null;if(1<arguments.length){for(var f=0,g=Array(arguments.length-1);f<g.length;)g[f]=arguments[f+1],++f;f=new F(g,0)}return c.j(a,f)}throw Error("Invalid arity: "+arguments.length);};a.v=1;a.l=c.l;a.e=b;a.j=c.j;return a}(),Ne=function(){function b(a,b){return new Vd(null,function(){var f=E(b);if(f){if(gd(f)){for(var g=Wb(f),k=R(g),l=Zd(k),m=0;;)if(m<k){var n;n=B.c(g,m);n=a.e?a.e(n):a.call(null,n);u(n)&&(n=B.c(g,m),l.add(n));m+=1}else break;return ce(l.P(),c.c(a,Xb(f)))}g=G(f);f=I(f);
return u(a.e?a.e(g):a.call(null,g))?O(g,c.c(a,f)):c.c(a,f)}return null},null,null)}function a(a){return function(b){return function(){function c(f,g){return u(a.e?a.e(g):a.call(null,g))?b.c?b.c(f,g):b.call(null,f,g):f}function g(a){return b.e?b.e(a):b.call(null,a)}function k(){return b.t?b.t():b.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return k.call(this);case 1:return g.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};l.t=
k;l.e=g;l.c=c;return l}()}}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),Oe=function(){function b(a,b){return Ne.c(qe(a),b)}function a(a){return Ne.e(qe(a))}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}();
function Pe(b){return function c(b){return new Vd(null,function(){return O(b,u(dd.e?dd.e(b):dd.call(null,b))?Me.j(c,Q([E.e?E.e(b):E.call(null,b)],0)):null)},null,null)}(b)}function Qe(b){return Ne.c(function(a){return!dd(a)},I(Pe(b)))}
var Re=function(){function b(a,b,c){return a&&(a.C&4||a.Oc)?Nc(ie(Ed.B(b,je,Qb(a),c)),Zc(a)):Ed.B(b,Rc,a,c)}function a(a,b){return null!=a?a&&(a.C&4||a.Oc)?Nc(ie(Ka.h(Rb,Qb(a),b)),Zc(a)):Ka.h(A,a,b):Ka.h(Rc,J,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),Se=function(){function b(a,b,c,d){return Re.c(Qc,De.B(a,b,c,d))}function a(a,b,c){return Re.c(Qc,
De.h(a,b,c))}function c(a,b){return ie(Ka.h(function(b,c){return je.c(b,a.e?a.e(c):a.call(null,c))},Qb(Qc),b))}var d=null,e=function(){function a(c,d,e,f,p){var r=null;if(4<arguments.length){for(var r=0,w=Array(arguments.length-4);r<w.length;)w[r]=arguments[r+4],++r;r=new F(w,0)}return b.call(this,c,d,e,f,r)}function b(a,c,d,e,f){return Re.c(Qc,V.j(De,a,c,d,e,Q([f],0)))}a.v=4;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=K(a);var f=G(a);a=I(a);return b(c,d,e,f,a)};a.j=b;return a}(),
d=function(d,g,k,l,m){switch(arguments.length){case 2:return c.call(this,d,g);case 3:return a.call(this,d,g,k);case 4:return b.call(this,d,g,k,l);default:var n=null;if(4<arguments.length){for(var n=0,p=Array(arguments.length-4);n<p.length;)p[n]=arguments[n+4],++n;n=new F(p,0)}return e.j(d,g,k,l,n)}throw Error("Invalid arity: "+arguments.length);};d.v=4;d.l=e.l;d.c=c;d.h=a;d.B=b;d.j=e.j;return d}(),Te=function(){function b(a,b,c){var g=kd;for(b=E(b);;)if(b){var k=a;if(k?k.o&256||k.Zb||(k.o?0:v(Za,
k)):v(Za,k)){a=U.h(a,G(b),g);if(g===a)return c;b=K(b)}else return c}else return a}function a(a,b){return c.h(a,b,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),Ue=function Ue(a,c,d){var e=S.h(c,0,null);return(c=Hd(c))?Vc.h(a,e,Ue(U.c(a,e),c,d)):Vc.h(a,e,d)},Ve=function(){function b(a,b,c,d,f,p){var r=S.h(b,0,null);return(b=Hd(b))?Vc.h(a,r,e.ba(U.c(a,
r),b,c,d,f,p)):Vc.h(a,r,function(){var b=U.c(a,r);return c.B?c.B(b,d,f,p):c.call(null,b,d,f,p)}())}function a(a,b,c,d,f){var p=S.h(b,0,null);return(b=Hd(b))?Vc.h(a,p,e.J(U.c(a,p),b,c,d,f)):Vc.h(a,p,function(){var b=U.c(a,p);return c.h?c.h(b,d,f):c.call(null,b,d,f)}())}function c(a,b,c,d){var f=S.h(b,0,null);return(b=Hd(b))?Vc.h(a,f,e.B(U.c(a,f),b,c,d)):Vc.h(a,f,function(){var b=U.c(a,f);return c.c?c.c(b,d):c.call(null,b,d)}())}function d(a,b,c){var d=S.h(b,0,null);return(b=Hd(b))?Vc.h(a,d,e.h(U.c(a,
d),b,c)):Vc.h(a,d,function(){var b=U.c(a,d);return c.e?c.e(b):c.call(null,b)}())}var e=null,f=function(){function a(c,d,e,f,g,w,z){var D=null;if(6<arguments.length){for(var D=0,H=Array(arguments.length-6);D<H.length;)H[D]=arguments[D+6],++D;D=new F(H,0)}return b.call(this,c,d,e,f,g,w,D)}function b(a,c,d,f,g,k,z){var D=S.h(c,0,null);return(c=Hd(c))?Vc.h(a,D,V.j(e,U.c(a,D),c,d,f,Q([g,k,z],0))):Vc.h(a,D,V.j(d,U.c(a,D),f,g,k,Q([z],0)))}a.v=6;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);
a=K(a);var f=G(a);a=K(a);var g=G(a);a=K(a);var z=G(a);a=I(a);return b(c,d,e,f,g,z,a)};a.j=b;return a}(),e=function(e,k,l,m,n,p,r){switch(arguments.length){case 3:return d.call(this,e,k,l);case 4:return c.call(this,e,k,l,m);case 5:return a.call(this,e,k,l,m,n);case 6:return b.call(this,e,k,l,m,n,p);default:var w=null;if(6<arguments.length){for(var w=0,z=Array(arguments.length-6);w<z.length;)z[w]=arguments[w+6],++w;w=new F(z,0)}return f.j(e,k,l,m,n,p,w)}throw Error("Invalid arity: "+arguments.length);
};e.v=6;e.l=f.l;e.h=d;e.B=c;e.J=a;e.ba=b;e.j=f.j;return e}();function We(b,a){this.S=b;this.k=a}function Xe(b){return new We(b,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function Ye(b){b=b.w;return 32>b?0:b-1>>>5<<5}function Ze(b,a,c){for(;;){if(0===a)return c;var d=Xe(b);d.k[0]=c;c=d;a-=5}}
var $e=function $e(a,c,d,e){var f=new We(d.S,Ga(d.k)),g=a.w-1>>>c&31;5===c?f.k[g]=e:(d=d.k[g],a=null!=d?$e(a,c-5,d,e):Ze(null,c-5,e),f.k[g]=a);return f};function af(b,a){throw Error([y("No item "),y(b),y(" in vector of length "),y(a)].join(""));}function bf(b,a){if(a>=Ye(b))return b.ka;for(var c=b.root,d=b.shift;;)if(0<d)var e=d-5,c=c.k[a>>>d&31],d=e;else return c.k}function cf(b,a){return 0<=a&&a<b.w?bf(b,a):af(a,b.w)}
var df=function df(a,c,d,e,f){var g=new We(d.S,Ga(d.k));if(0===c)g.k[e&31]=f;else{var k=e>>>c&31;a=df(a,c-5,d.k[k],e,f);g.k[k]=a}return g};function ef(b,a,c,d,e,f){this.i=b;this.base=a;this.k=c;this.Z=d;this.start=e;this.end=f}ef.prototype.Gb=function(){return this.i<this.end};ef.prototype.next=function(){32===this.i-this.base&&(this.k=bf(this.Z,this.i),this.base+=32);var b=this.k[this.i&31];this.i+=1;return b};
function W(b,a,c,d,e,f){this.meta=b;this.w=a;this.shift=c;this.root=d;this.ka=e;this.r=f;this.o=167668511;this.C=8196}h=W.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){return"number"===typeof a?B.h(this,a,c):c};h.Q=function(b,a){return cf(this,a)[a&31]};h.pa=function(b,a,c){return 0<=a&&a<this.w?bf(this,a)[a&31]:c};
h.Sb=function(b,a,c){if(0<=a&&a<this.w)return Ye(this)<=a?(b=Ga(this.ka),b[a&31]=c,new W(this.meta,this.w,this.shift,this.root,b,null)):new W(this.meta,this.w,this.shift,df(this,this.shift,this.root,a,c),this.ka,null);if(a===this.w)return A(this,c);throw Error([y("Index "),y(a),y(" out of bounds  [0,"),y(this.w),y("]")].join(""));};h.ub=function(){var b=this.w;return new ef(0,0,0<R(this)?bf(this,0):null,this,0,b)};h.I=function(){return this.meta};
h.T=function(){return new W(this.meta,this.w,this.shift,this.root,this.ka,this.r)};h.O=function(){return this.w};h.Qb=function(){return B.c(this,0)};h.Rb=function(){return B.c(this,1)};h.Eb=function(){return 0<this.w?new Kc(this,this.w-1,null):null};h.L=function(){var b=this.r;return null!=b?b:this.r=b=yc(this)};
h.D=function(b,a){if(a instanceof W)if(this.w===R(a))for(var c=ec(this),d=ec(a);;)if(u(c.Gb())){var e=c.next(),f=d.next();if(!L.c(e,f))return!1}else return!0;else return!1;else return Lc(this,a)};h.ib=function(){var b=this;return new ff(b.w,b.shift,function(){var a=b.root;return gf.e?gf.e(a):gf.call(null,a)}(),function(){var a=b.ka;return hf.e?hf.e(a):hf.call(null,a)}())};h.Y=function(){return Nc(Qc,this.meta)};h.ca=function(b,a){return Fc.c(this,a)};
h.da=function(b,a,c){b=0;for(var d=c;;)if(b<this.w){var e=bf(this,b);c=e.length;a:for(var f=0;;)if(f<c){var g=e[f],d=a.c?a.c(d,g):a.call(null,d,g);if(Ec(d)){e=d;break a}f+=1}else{e=d;break a}if(Ec(e))return a=e,M.e?M.e(a):M.call(null,a);b+=c;d=e}else return d};h.aa=function(b,a,c){if("number"===typeof a)return ob(this,a,c);throw Error("Vector's key for assoc must be a number.");};
h.M=function(){if(0===this.w)return null;if(32>=this.w)return new F(this.ka,0);var b;a:{b=this.root;for(var a=this.shift;;)if(0<a)a-=5,b=b.k[0];else{b=b.k;break a}}return jf.B?jf.B(this,b,0,0):jf.call(null,this,b,0,0)};h.K=function(b,a){return new W(a,this.w,this.shift,this.root,this.ka,this.r)};
h.N=function(b,a){if(32>this.w-Ye(this)){for(var c=this.ka.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.ka[e],e+=1;else break;d[c]=a;return new W(this.meta,this.w+1,this.shift,this.root,d,null)}c=(d=this.w>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=Xe(null),d.k[0]=this.root,e=Ze(null,this.shift,new We(null,this.ka)),d.k[1]=e):d=$e(this,this.shift,this.root,new We(null,this.ka));return new W(this.meta,this.w+1,c,d,[a],null)};
h.call=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return this.Q(null,b);case 3:return this.pa(null,b,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return this.Q(null,b)};b.h=function(a,b,d){return this.pa(null,b,d)};return b}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.e=function(b){return this.Q(null,b)};h.c=function(b,a){return this.pa(null,b,a)};
var X=new We(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),Qc=new W(null,0,5,X,[],zc);W.prototype[Fa]=function(){return wc(this)};function kf(b){if(za(b))a:{var a=b.length;if(32>a)b=new W(null,a,5,X,b,null);else for(var c=32,d=(new W(null,32,5,X,b.slice(0,32),null)).ib(null);;)if(c<a)var e=c+1,d=je.c(d,b[c]),c=e;else{b=Sb(d);break a}}else b=Sb(Ka.h(Rb,Qb(Qc),b));return b}
function lf(b,a,c,d,e,f){this.va=b;this.node=a;this.i=c;this.off=d;this.meta=e;this.r=f;this.o=32375020;this.C=1536}h=lf.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.meta};h.fa=function(){if(this.off+1<this.node.length){var b;b=this.va;var a=this.node,c=this.i,d=this.off+1;b=jf.B?jf.B(b,a,c,d):jf.call(null,b,a,c,d);return null==b?null:b}return Yb(this)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=yc(this)};
h.D=function(b,a){return Lc(this,a)};h.Y=function(){return Nc(Qc,this.meta)};h.ca=function(b,a){var c=this;return Fc.c(function(){var a=c.va,b=c.i+c.off,f=R(c.va);return mf.h?mf.h(a,b,f):mf.call(null,a,b,f)}(),a)};h.da=function(b,a,c){var d=this;return Fc.h(function(){var a=d.va,b=d.i+d.off,c=R(d.va);return mf.h?mf.h(a,b,c):mf.call(null,a,b,c)}(),a,c)};h.$=function(){return this.node[this.off]};
h.na=function(){if(this.off+1<this.node.length){var b;b=this.va;var a=this.node,c=this.i,d=this.off+1;b=jf.B?jf.B(b,a,c,d):jf.call(null,b,a,c,d);return null==b?J:b}return Xb(this)};h.M=function(){return this};h.Ob=function(){return ae.c(this.node,this.off)};h.Pb=function(){var b=this.i+this.node.length;if(b<Ra(this.va)){var a=this.va,c=bf(this.va,b);return jf.B?jf.B(a,c,b,0):jf.call(null,a,c,b,0)}return J};
h.K=function(b,a){var c=this.va,d=this.node,e=this.i,f=this.off;return jf.J?jf.J(c,d,e,f,a):jf.call(null,c,d,e,f,a)};h.N=function(b,a){return O(a,this)};h.Nb=function(){var b=this.i+this.node.length;if(b<Ra(this.va)){var a=this.va,c=bf(this.va,b);return jf.B?jf.B(a,c,b,0):jf.call(null,a,c,b,0)}return null};lf.prototype[Fa]=function(){return wc(this)};
var jf=function(){function b(a,b,c,d,l){return new lf(a,b,c,d,l,null)}function a(a,b,c,d){return new lf(a,b,c,d,null,null)}function c(a,b,c){return new lf(a,cf(a,b),b,c,null,null)}var d=null,d=function(d,f,g,k,l){switch(arguments.length){case 3:return c.call(this,d,f,g);case 4:return a.call(this,d,f,g,k);case 5:return b.call(this,d,f,g,k,l)}throw Error("Invalid arity: "+arguments.length);};d.h=c;d.B=a;d.J=b;return d}();
function nf(b,a,c,d,e){this.meta=b;this.Z=a;this.start=c;this.end=d;this.r=e;this.o=167666463;this.C=8192}h=nf.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){return"number"===typeof a?B.h(this,a,c):c};h.Q=function(b,a){return 0>a||this.end<=this.start+a?af(a,this.end-this.start):B.c(this.Z,this.start+a)};h.pa=function(b,a,c){return 0>a||this.end<=this.start+a?c:B.h(this.Z,this.start+a,c)};
h.Sb=function(b,a,c){var d=this.start+a;b=this.meta;c=Vc.h(this.Z,d,c);a=this.start;var e=this.end,d=d+1,d=e>d?e:d;return of.J?of.J(b,c,a,d,null):of.call(null,b,c,a,d,null)};h.I=function(){return this.meta};h.T=function(){return new nf(this.meta,this.Z,this.start,this.end,this.r)};h.O=function(){return this.end-this.start};h.Eb=function(){return this.start!==this.end?new Kc(this,this.end-this.start-1,null):null};h.L=function(){var b=this.r;return null!=b?b:this.r=b=yc(this)};
h.D=function(b,a){return Lc(this,a)};h.Y=function(){return Nc(Qc,this.meta)};h.ca=function(b,a){return Fc.c(this,a)};h.da=function(b,a,c){return Fc.h(this,a,c)};h.aa=function(b,a,c){if("number"===typeof a)return ob(this,a,c);throw Error("Subvec's key for assoc must be a number.");};h.M=function(){var b=this;return function(a){return function d(e){return e===b.end?null:O(B.c(b.Z,e),new Vd(null,function(){return function(){return d(e+1)}}(a),null,null))}}(this)(b.start)};
h.K=function(b,a){var c=this.Z,d=this.start,e=this.end,f=this.r;return of.J?of.J(a,c,d,e,f):of.call(null,a,c,d,e,f)};h.N=function(b,a){var c=this.meta,d=ob(this.Z,this.end,a),e=this.start,f=this.end+1;return of.J?of.J(c,d,e,f,null):of.call(null,c,d,e,f,null)};
h.call=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return this.Q(null,b);case 3:return this.pa(null,b,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return this.Q(null,b)};b.h=function(a,b,d){return this.pa(null,b,d)};return b}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.e=function(b){return this.Q(null,b)};h.c=function(b,a){return this.pa(null,b,a)};nf.prototype[Fa]=function(){return wc(this)};
function of(b,a,c,d,e){for(;;)if(a instanceof nf)c=a.start+c,d=a.start+d,a=a.Z;else{var f=R(a);if(0>c||0>d||c>f||d>f)throw Error("Index out of bounds");return new nf(b,a,c,d,e)}}var mf=function(){function b(a,b,c){return of(null,a,b,c,null)}function a(a,b){return c.h(a,b,R(a))}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}();
function pf(b,a){return b===a.S?a:new We(b,Ga(a.k))}function gf(b){return new We({},Ga(b.k))}function hf(b){var a=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];id(b,0,a,0,b.length);return a}var qf=function qf(a,c,d,e){d=pf(a.root.S,d);var f=a.w-1>>>c&31;if(5===c)a=e;else{var g=d.k[f];a=null!=g?qf(a,c-5,g,e):Ze(a.root.S,c-5,e)}d.k[f]=a;return d};
function ff(b,a,c,d){this.w=b;this.shift=a;this.root=c;this.ka=d;this.o=275;this.C=88}h=ff.prototype;h.call=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return this.H(null,b);case 3:return this.F(null,b,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return this.H(null,b)};b.h=function(a,b,d){return this.F(null,b,d)};return b}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.e=function(b){return this.H(null,b)};
h.c=function(b,a){return this.F(null,b,a)};h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){return"number"===typeof a?B.h(this,a,c):c};h.Q=function(b,a){if(this.root.S)return cf(this,a)[a&31];throw Error("nth after persistent!");};h.pa=function(b,a,c){return 0<=a&&a<this.w?B.c(this,a):c};h.O=function(){if(this.root.S)return this.w;throw Error("count after persistent!");};
h.ac=function(b,a,c){var d=this;if(d.root.S){if(0<=a&&a<d.w)return Ye(this)<=a?d.ka[a&31]=c:(b=function(){return function f(b,k){var l=pf(d.root.S,k);if(0===b)l.k[a&31]=c;else{var m=a>>>b&31,n=f(b-5,l.k[m]);l.k[m]=n}return l}}(this).call(null,d.shift,d.root),d.root=b),this;if(a===d.w)return Rb(this,c);throw Error([y("Index "),y(a),y(" out of bounds for TransientVector of length"),y(d.w)].join(""));}throw Error("assoc! after persistent!");};
h.wb=function(b,a,c){if("number"===typeof a)return Ub(this,a,c);throw Error("TransientVector's key for assoc! must be a number.");};
h.eb=function(b,a){if(this.root.S){if(32>this.w-Ye(this))this.ka[this.w&31]=a;else{var c=new We(this.root.S,this.ka),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=a;this.ka=d;if(this.w>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=Ze(this.root.S,this.shift,c);this.root=new We(this.root.S,d);this.shift=e}else this.root=qf(this,this.shift,this.root,c)}this.w+=1;return this}throw Error("conj! after persistent!");};h.fb=function(){if(this.root.S){this.root.S=null;var b=this.w-Ye(this),a=Array(b);id(this.ka,0,a,0,b);return new W(null,this.w,this.shift,this.root,a,null)}throw Error("persistent! called twice");};function rf(){this.C=0;this.o=2097152}rf.prototype.D=function(){return!1};
rf.prototype.equiv=function(b){return this.D(null,b)};var sf=new rf;function tf(b,a){return md(ed(a)?R(b)===R(a)?oe(Dd,De.c(function(b){return L.c(U.h(a,G(b),sf),Pc(b))},b)):null:null)}function uf(b){this.s=b}uf.prototype.next=function(){if(null!=this.s){var b=G(this.s),a=S.h(b,0,null),b=S.h(b,1,null);this.s=K(this.s);return{done:!1,value:[a,b]}}return{done:!0,value:null}};function vf(b){return new uf(E(b))}function wf(b){this.s=b}
wf.prototype.next=function(){if(null!=this.s){var b=G(this.s);this.s=K(this.s);return{done:!1,value:[b,b]}}return{done:!0,value:null}};
function xf(b,a){var c=b.k;if(a instanceof Y)a:for(var d=c.length,e=a.X,f=0;;){if(d<=f){c=-1;break a}var g=c[f];if(g instanceof Y&&e===g.X){c=f;break a}f+=2}else if(d="string"==typeof a,u(u(d)?d:"number"===typeof a))a:for(d=c.length,e=0;;){if(d<=e){c=-1;break a}if(a===c[e]){c=e;break a}e+=2}else if(a instanceof C)a:for(d=c.length,e=a.Ia,f=0;;){if(d<=f){c=-1;break a}g=c[f];if(g instanceof C&&e===g.Ia){c=f;break a}f+=2}else if(null==a)a:for(d=c.length,e=0;;){if(d<=e){c=-1;break a}if(null==c[e]){c=e;
break a}e+=2}else a:for(d=c.length,e=0;;){if(d<=e){c=-1;break a}if(L.c(a,c[e])){c=e;break a}e+=2}return c}function yf(b,a,c){this.k=b;this.i=a;this.la=c;this.C=0;this.o=32374990}h=yf.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.la};h.fa=function(){return this.i<this.k.length-2?new yf(this.k,this.i+2,this.la):null};h.O=function(){return(this.k.length-this.i)/2};h.L=function(){return yc(this)};
h.D=function(b,a){return Lc(this,a)};h.Y=function(){return Nc(J,this.la)};h.ca=function(b,a){return Oc.c(a,this)};h.da=function(b,a,c){return Oc.h(a,c,this)};h.$=function(){return new W(null,2,5,X,[this.k[this.i],this.k[this.i+1]],null)};h.na=function(){return this.i<this.k.length-2?new yf(this.k,this.i+2,this.la):J};h.M=function(){return this};h.K=function(b,a){return new yf(this.k,this.i,a)};h.N=function(b,a){return O(a,this)};yf.prototype[Fa]=function(){return wc(this)};
function zf(b,a,c){this.k=b;this.i=a;this.w=c}zf.prototype.Gb=function(){return this.i<this.w};zf.prototype.next=function(){var b=new W(null,2,5,X,[this.k[this.i],this.k[this.i+1]],null);this.i+=2;return b};function t(b,a,c,d){this.meta=b;this.w=a;this.k=c;this.r=d;this.o=16647951;this.C=8196}h=t.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.keys=function(){return wc(Af.e?Af.e(this):Af.call(null,this))};h.entries=function(){return vf(E(this))};
h.values=function(){return wc(Bf.e?Bf.e(this):Bf.call(null,this))};h.has=function(b){return pd(this,b)};h.get=function(b,a){return this.F(null,b,a)};h.forEach=function(b){for(var a=E(this),c=null,d=0,e=0;;)if(e<d){var f=c.Q(null,e),g=S.h(f,0,null),f=S.h(f,1,null);b.c?b.c(f,g):b.call(null,f,g);e+=1}else if(a=E(a))gd(a)?(c=Wb(a),a=Xb(a),g=c,d=R(c),c=g):(c=G(a),g=S.h(c,0,null),c=f=S.h(c,1,null),b.c?b.c(c,g):b.call(null,c,g),a=K(a),c=null,d=0),e=0;else return null};
h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){b=xf(this,a);return-1===b?c:this.k[b+1]};h.ub=function(){return new zf(this.k,0,2*this.w)};h.I=function(){return this.meta};h.T=function(){return new t(this.meta,this.w,this.k,this.r)};h.O=function(){return this.w};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Ac(this)};
h.D=function(b,a){if(a&&(a.o&1024||a.Uc)){var c=this.k.length;if(this.w===a.O(null))for(var d=0;;)if(d<c){var e=a.F(null,this.k[d],kd);if(e!==kd)if(L.c(this.k[d+1],e))d+=2;else return!1;else return!1}else return!0;else return!1}else return tf(this,a)};h.ib=function(){return new Cf({},this.k.length,Ga(this.k))};h.Y=function(){return ub(sd,this.meta)};h.ca=function(b,a){return Oc.c(a,this)};h.da=function(b,a,c){return Oc.h(a,c,this)};
h.ma=function(b,a){if(0<=xf(this,a)){var c=this.k.length,d=c-2;if(0===d)return Sa(this);for(var d=Array(d),e=0,f=0;;){if(e>=c)return new t(this.meta,this.w-1,d,null);L.c(a,this.k[e])||(d[f]=this.k[e],d[f+1]=this.k[e+1],f+=2);e+=2}}else return this};
h.aa=function(b,a,c){b=xf(this,a);if(-1===b){if(this.w<rd){b=this.k;for(var d=b.length,e=Array(d+2),f=0;;)if(f<d)e[f]=b[f],f+=1;else break;e[d]=a;e[d+1]=c;return new t(this.meta,this.w+1,e,null)}return ub(db(Re.c(Df,this),a,c),this.meta)}if(c===this.k[b+1])return this;a=Ga(this.k);a[b+1]=c;return new t(this.meta,this.w,a,null)};h.rb=function(b,a){return-1!==xf(this,a)};h.M=function(){var b=this.k;return 0<=b.length-2?new yf(b,0,null):null};h.K=function(b,a){return new t(a,this.w,this.k,this.r)};
h.N=function(b,a){if(fd(a))return db(this,B.c(a,0),B.c(a,1));for(var c=this,d=E(a);;){if(null==d)return c;var e=G(d);if(fd(e))c=db(c,B.c(e,0),B.c(e,1)),d=K(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
h.call=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return this.H(null,b);case 3:return this.F(null,b,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return this.H(null,b)};b.h=function(a,b,d){return this.F(null,b,d)};return b}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.e=function(b){return this.H(null,b)};h.c=function(b,a){return this.F(null,b,a)};var sd=new t(null,0,[],Bc),rd=8;
function Ef(b){for(var a=b.length,c=0,d=Qb(sd);;)if(c<a)var e=c+2,d=Tb(d,b[c],b[c+1]),c=e;else return Sb(d)}t.prototype[Fa]=function(){return wc(this)};function Cf(b,a,c){this.lb=b;this.ob=a;this.k=c;this.C=56;this.o=258}h=Cf.prototype;
h.wb=function(b,a,c){var d=this;if(u(d.lb)){b=xf(this,a);if(-1===b)return d.ob+2<=2*rd?(d.ob+=2,d.k.push(a),d.k.push(c),this):ke.h(function(){var a=d.ob,b=d.k;return Ff.c?Ff.c(a,b):Ff.call(null,a,b)}(),a,c);c!==d.k[b+1]&&(d.k[b+1]=c);return this}throw Error("assoc! after persistent!");};
h.eb=function(b,a){if(u(this.lb)){if(a?a.o&2048||a.Vc||(a.o?0:v(hb,a)):v(hb,a))return Tb(this,Kd.e?Kd.e(a):Kd.call(null,a),Ld.e?Ld.e(a):Ld.call(null,a));for(var c=E(a),d=this;;){var e=G(c);if(u(e))var f=e,c=K(c),d=Tb(d,function(){var a=f;return Kd.e?Kd.e(a):Kd.call(null,a)}(),function(){var a=f;return Ld.e?Ld.e(a):Ld.call(null,a)}());else return d}}else throw Error("conj! after persistent!");};
h.fb=function(){if(u(this.lb))return this.lb=!1,new t(null,Fd(this.ob),this.k,null);throw Error("persistent! called twice");};h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){if(u(this.lb))return b=xf(this,a),-1===b?c:this.k[b+1];throw Error("lookup after persistent!");};h.O=function(){if(u(this.lb))return Fd(this.ob);throw Error("count after persistent!");};function Ff(b,a){for(var c=Qb(Df),d=0;;)if(d<b)c=ke.h(c,a[d],a[d+1]),d+=2;else return c}function Gf(){this.val=!1}
function Hf(b,a){return b===a?!0:Z(b,a)?!0:L.c(b,a)}var If=function(){function b(a,b,c,g,k){a=Ga(a);a[b]=c;a[g]=k;return a}function a(a,b,c){a=Ga(a);a[b]=c;return a}var c=null,c=function(c,e,f,g,k){switch(arguments.length){case 3:return a.call(this,c,e,f);case 5:return b.call(this,c,e,f,g,k)}throw Error("Invalid arity: "+arguments.length);};c.h=a;c.J=b;return c}();function Jf(b,a){var c=Array(b.length-2);id(b,0,c,0,2*a);id(b,2*(a+1),c,2*a,c.length-2*a);return c}
var Kf=function(){function b(a,b,c,g,k,l){a=a.mb(b);a.k[c]=g;a.k[k]=l;return a}function a(a,b,c,g){a=a.mb(b);a.k[c]=g;return a}var c=null,c=function(c,e,f,g,k,l){switch(arguments.length){case 4:return a.call(this,c,e,f,g);case 6:return b.call(this,c,e,f,g,k,l)}throw Error("Invalid arity: "+arguments.length);};c.B=a;c.ba=b;return c}();function Nf(b,a,c){this.S=b;this.U=a;this.k=c}h=Nf.prototype;
h.mb=function(b){if(b===this.S)return this;var a=Gd(this.U),c=Array(0>a?4:2*(a+1));id(this.k,0,c,0,2*a);return new Nf(b,this.U,c)};h.yb=function(){var b=this.k;return Of.e?Of.e(b):Of.call(null,b)};h.$a=function(b,a,c,d){var e=1<<(a>>>b&31);if(0===(this.U&e))return d;var f=Gd(this.U&e-1),e=this.k[2*f],f=this.k[2*f+1];return null==e?f.$a(b+5,a,c,d):Hf(c,e)?f:d};
h.za=function(b,a,c,d,e,f){var g=1<<(c>>>a&31),k=Gd(this.U&g-1);if(0===(this.U&g)){var l=Gd(this.U);if(2*l<this.k.length){var m=this.mb(b),n=m.k;f.val=!0;jd(n,2*k,n,2*(k+1),2*(l-k));n[2*k]=d;n[2*k+1]=e;m.U|=g;return m}if(16<=l){g=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];g[c>>>a&31]=Pf.za(b,a+5,c,d,e,f);for(m=k=0;;)if(32>k)0!==(this.U>>>k&1)&&(g[k]=null!=this.k[m]?Pf.za(b,a+5,qc(this.k[m]),
this.k[m],this.k[m+1],f):this.k[m+1],m+=2),k+=1;else break;return new Qf(b,l+1,g)}n=Array(2*(l+4));id(this.k,0,n,0,2*k);n[2*k]=d;n[2*k+1]=e;id(this.k,2*k,n,2*(k+1),2*(l-k));f.val=!0;m=this.mb(b);m.k=n;m.U|=g;return m}var p=this.k[2*k],r=this.k[2*k+1];if(null==p)return l=r.za(b,a+5,c,d,e,f),l===r?this:Kf.B(this,b,2*k+1,l);if(Hf(d,p))return e===r?this:Kf.B(this,b,2*k+1,e);f.val=!0;return Kf.ba(this,b,2*k,null,2*k+1,function(){var f=a+5;return Rf.wa?Rf.wa(b,f,p,r,c,d,e):Rf.call(null,b,f,p,r,c,d,e)}())};
h.ya=function(b,a,c,d,e){var f=1<<(a>>>b&31),g=Gd(this.U&f-1);if(0===(this.U&f)){var k=Gd(this.U);if(16<=k){f=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];f[a>>>b&31]=Pf.ya(b+5,a,c,d,e);for(var l=g=0;;)if(32>g)0!==(this.U>>>g&1)&&(f[g]=null!=this.k[l]?Pf.ya(b+5,qc(this.k[l]),this.k[l],this.k[l+1],e):this.k[l+1],l+=2),g+=1;else break;return new Qf(null,k+1,f)}l=Array(2*(k+1));id(this.k,
0,l,0,2*g);l[2*g]=c;l[2*g+1]=d;id(this.k,2*g,l,2*(g+1),2*(k-g));e.val=!0;return new Nf(null,this.U|f,l)}var m=this.k[2*g],n=this.k[2*g+1];if(null==m)return k=n.ya(b+5,a,c,d,e),k===n?this:new Nf(null,this.U,If.h(this.k,2*g+1,k));if(Hf(c,m))return d===n?this:new Nf(null,this.U,If.h(this.k,2*g+1,d));e.val=!0;return new Nf(null,this.U,If.J(this.k,2*g,null,2*g+1,function(){var e=b+5;return Rf.ba?Rf.ba(e,m,n,a,c,d):Rf.call(null,e,m,n,a,c,d)}()))};
h.zb=function(b,a,c){var d=1<<(a>>>b&31);if(0===(this.U&d))return this;var e=Gd(this.U&d-1),f=this.k[2*e],g=this.k[2*e+1];return null==f?(b=g.zb(b+5,a,c),b===g?this:null!=b?new Nf(null,this.U,If.h(this.k,2*e+1,b)):this.U===d?null:new Nf(null,this.U^d,Jf(this.k,e))):Hf(c,f)?new Nf(null,this.U^d,Jf(this.k,e)):this};var Pf=new Nf(null,0,[]);function Qf(b,a,c){this.S=b;this.w=a;this.k=c}h=Qf.prototype;h.mb=function(b){return b===this.S?this:new Qf(b,this.w,Ga(this.k))};
h.yb=function(){var b=this.k;return Sf.e?Sf.e(b):Sf.call(null,b)};h.$a=function(b,a,c,d){var e=this.k[a>>>b&31];return null!=e?e.$a(b+5,a,c,d):d};h.za=function(b,a,c,d,e,f){var g=c>>>a&31,k=this.k[g];if(null==k)return b=Kf.B(this,b,g,Pf.za(b,a+5,c,d,e,f)),b.w+=1,b;a=k.za(b,a+5,c,d,e,f);return a===k?this:Kf.B(this,b,g,a)};
h.ya=function(b,a,c,d,e){var f=a>>>b&31,g=this.k[f];if(null==g)return new Qf(null,this.w+1,If.h(this.k,f,Pf.ya(b+5,a,c,d,e)));b=g.ya(b+5,a,c,d,e);return b===g?this:new Qf(null,this.w,If.h(this.k,f,b))};
h.zb=function(b,a,c){var d=a>>>b&31,e=this.k[d];if(null!=e){b=e.zb(b+5,a,c);if(b===e)d=this;else if(null==b)if(8>=this.w)a:{e=this.k;b=e.length;a=Array(2*(this.w-1));c=0;for(var f=1,g=0;;)if(c<b)c!==d&&null!=e[c]&&(a[f]=e[c],f+=2,g|=1<<c),c+=1;else{d=new Nf(null,g,a);break a}}else d=new Qf(null,this.w-1,If.h(this.k,d,b));else d=new Qf(null,this.w,If.h(this.k,d,b));return d}return this};function Tf(b,a,c){a*=2;for(var d=0;;)if(d<a){if(Hf(c,b[d]))return d;d+=2}else return-1}
function Uf(b,a,c,d){this.S=b;this.Wa=a;this.w=c;this.k=d}h=Uf.prototype;h.mb=function(b){if(b===this.S)return this;var a=Array(2*(this.w+1));id(this.k,0,a,0,2*this.w);return new Uf(b,this.Wa,this.w,a)};h.yb=function(){var b=this.k;return Of.e?Of.e(b):Of.call(null,b)};h.$a=function(b,a,c,d){b=Tf(this.k,this.w,c);return 0>b?d:Hf(c,this.k[b])?this.k[b+1]:d};
h.za=function(b,a,c,d,e,f){if(c===this.Wa){a=Tf(this.k,this.w,d);if(-1===a){if(this.k.length>2*this.w)return b=Kf.ba(this,b,2*this.w,d,2*this.w+1,e),f.val=!0,b.w+=1,b;c=this.k.length;a=Array(c+2);id(this.k,0,a,0,c);a[c]=d;a[c+1]=e;f.val=!0;f=this.w+1;b===this.S?(this.k=a,this.w=f,b=this):b=new Uf(this.S,this.Wa,f,a);return b}return this.k[a+1]===e?this:Kf.B(this,b,a+1,e)}return(new Nf(b,1<<(this.Wa>>>a&31),[null,this,null,null])).za(b,a,c,d,e,f)};
h.ya=function(b,a,c,d,e){return a===this.Wa?(b=Tf(this.k,this.w,c),-1===b?(b=2*this.w,a=Array(b+2),id(this.k,0,a,0,b),a[b]=c,a[b+1]=d,e.val=!0,new Uf(null,this.Wa,this.w+1,a)):L.c(this.k[b],d)?this:new Uf(null,this.Wa,this.w,If.h(this.k,b+1,d))):(new Nf(null,1<<(this.Wa>>>b&31),[null,this])).ya(b,a,c,d,e)};h.zb=function(b,a,c){b=Tf(this.k,this.w,c);return-1===b?this:1===this.w?null:new Uf(null,this.Wa,this.w-1,Jf(this.k,Fd(b)))};
var Rf=function(){function b(a,b,c,g,k,l,m){var n=qc(c);if(n===k)return new Uf(null,n,2,[c,g,l,m]);var p=new Gf;return Pf.za(a,b,n,c,g,p).za(a,b,k,l,m,p)}function a(a,b,c,g,k,l){var m=qc(b);if(m===g)return new Uf(null,m,2,[b,c,k,l]);var n=new Gf;return Pf.ya(a,m,b,c,n).ya(a,g,k,l,n)}var c=null,c=function(c,e,f,g,k,l,m){switch(arguments.length){case 6:return a.call(this,c,e,f,g,k,l);case 7:return b.call(this,c,e,f,g,k,l,m)}throw Error("Invalid arity: "+arguments.length);};c.ba=a;c.wa=b;return c}();
function Vf(b,a,c,d,e){this.meta=b;this.bb=a;this.i=c;this.s=d;this.r=e;this.C=0;this.o=32374860}h=Vf.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.meta};h.L=function(){var b=this.r;return null!=b?b:this.r=b=yc(this)};h.D=function(b,a){return Lc(this,a)};h.Y=function(){return Nc(J,this.meta)};h.ca=function(b,a){return Oc.c(a,this)};h.da=function(b,a,c){return Oc.h(a,c,this)};
h.$=function(){return null==this.s?new W(null,2,5,X,[this.bb[this.i],this.bb[this.i+1]],null):G(this.s)};h.na=function(){if(null==this.s){var b=this.bb,a=this.i+2;return Of.h?Of.h(b,a,null):Of.call(null,b,a,null)}var b=this.bb,a=this.i,c=K(this.s);return Of.h?Of.h(b,a,c):Of.call(null,b,a,c)};h.M=function(){return this};h.K=function(b,a){return new Vf(a,this.bb,this.i,this.s,this.r)};h.N=function(b,a){return O(a,this)};Vf.prototype[Fa]=function(){return wc(this)};
var Of=function(){function b(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new Vf(null,a,b,null,null);var g=a[b+1];if(u(g)&&(g=g.yb(),u(g)))return new Vf(null,a,b+2,g,null);b+=2}else return null;else return new Vf(null,a,b,c,null)}function a(a){return c.h(a,0,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 1:return a.call(this,c);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.h=b;return c}();
function Wf(b,a,c,d,e){this.meta=b;this.bb=a;this.i=c;this.s=d;this.r=e;this.C=0;this.o=32374860}h=Wf.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.meta};h.L=function(){var b=this.r;return null!=b?b:this.r=b=yc(this)};h.D=function(b,a){return Lc(this,a)};h.Y=function(){return Nc(J,this.meta)};h.ca=function(b,a){return Oc.c(a,this)};h.da=function(b,a,c){return Oc.h(a,c,this)};h.$=function(){return G(this.s)};
h.na=function(){var b=this.bb,a=this.i,c=K(this.s);return Sf.B?Sf.B(null,b,a,c):Sf.call(null,null,b,a,c)};h.M=function(){return this};h.K=function(b,a){return new Wf(a,this.bb,this.i,this.s,this.r)};h.N=function(b,a){return O(a,this)};Wf.prototype[Fa]=function(){return wc(this)};
var Sf=function(){function b(a,b,c,g){if(null==g)for(g=b.length;;)if(c<g){var k=b[c];if(u(k)&&(k=k.yb(),u(k)))return new Wf(a,b,c+1,k,null);c+=1}else return null;else return new Wf(a,b,c,g,null)}function a(a){return c.B(null,a,0,null)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 1:return a.call(this,c);case 4:return b.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.B=b;return c}();
function Xf(b,a,c,d,e,f){this.meta=b;this.w=a;this.root=c;this.ha=d;this.ta=e;this.r=f;this.o=16123663;this.C=8196}h=Xf.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.keys=function(){return wc(Af.e?Af.e(this):Af.call(null,this))};h.entries=function(){return vf(E(this))};h.values=function(){return wc(Bf.e?Bf.e(this):Bf.call(null,this))};h.has=function(b){return pd(this,b)};h.get=function(b,a){return this.F(null,b,a)};
h.forEach=function(b){for(var a=E(this),c=null,d=0,e=0;;)if(e<d){var f=c.Q(null,e),g=S.h(f,0,null),f=S.h(f,1,null);b.c?b.c(f,g):b.call(null,f,g);e+=1}else if(a=E(a))gd(a)?(c=Wb(a),a=Xb(a),g=c,d=R(c),c=g):(c=G(a),g=S.h(c,0,null),c=f=S.h(c,1,null),b.c?b.c(c,g):b.call(null,c,g),a=K(a),c=null,d=0),e=0;else return null};h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){return null==a?this.ha?this.ta:c:null==this.root?c:this.root.$a(0,qc(a),a,c)};h.I=function(){return this.meta};
h.T=function(){return new Xf(this.meta,this.w,this.root,this.ha,this.ta,this.r)};h.O=function(){return this.w};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Ac(this)};h.D=function(b,a){return tf(this,a)};h.ib=function(){return new Yf({},this.root,this.w,this.ha,this.ta)};h.Y=function(){return ub(Df,this.meta)};
h.ma=function(b,a){if(null==a)return this.ha?new Xf(this.meta,this.w-1,this.root,!1,null,null):this;if(null==this.root)return this;var c=this.root.zb(0,qc(a),a);return c===this.root?this:new Xf(this.meta,this.w-1,c,this.ha,this.ta,null)};
h.aa=function(b,a,c){if(null==a)return this.ha&&c===this.ta?this:new Xf(this.meta,this.ha?this.w:this.w+1,this.root,!0,c,null);b=new Gf;a=(null==this.root?Pf:this.root).ya(0,qc(a),a,c,b);return a===this.root?this:new Xf(this.meta,b.val?this.w+1:this.w,a,this.ha,this.ta,null)};h.rb=function(b,a){return null==a?this.ha:null==this.root?!1:this.root.$a(0,qc(a),a,kd)!==kd};h.M=function(){if(0<this.w){var b=null!=this.root?this.root.yb():null;return this.ha?O(new W(null,2,5,X,[null,this.ta],null),b):b}return null};
h.K=function(b,a){return new Xf(a,this.w,this.root,this.ha,this.ta,this.r)};h.N=function(b,a){if(fd(a))return db(this,B.c(a,0),B.c(a,1));for(var c=this,d=E(a);;){if(null==d)return c;var e=G(d);if(fd(e))c=db(c,B.c(e,0),B.c(e,1)),d=K(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
h.call=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return this.H(null,b);case 3:return this.F(null,b,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return this.H(null,b)};b.h=function(a,b,d){return this.F(null,b,d)};return b}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.e=function(b){return this.H(null,b)};h.c=function(b,a){return this.F(null,b,a)};var Df=new Xf(null,0,null,!1,null,Bc);
function Uc(b,a){for(var c=b.length,d=0,e=Qb(Df);;)if(d<c)var f=d+1,e=e.wb(null,b[d],a[d]),d=f;else return Sb(e)}Xf.prototype[Fa]=function(){return wc(this)};function Yf(b,a,c,d,e){this.S=b;this.root=a;this.count=c;this.ha=d;this.ta=e;this.C=56;this.o=258}h=Yf.prototype;h.wb=function(b,a,c){return Zf(this,a,c)};h.eb=function(b,a){return $f(this,a)};h.fb=function(){var b;if(this.S)this.S=null,b=new Xf(null,this.count,this.root,this.ha,this.ta,null);else throw Error("persistent! called twice");return b};
h.H=function(b,a){return null==a?this.ha?this.ta:null:null==this.root?null:this.root.$a(0,qc(a),a)};h.F=function(b,a,c){return null==a?this.ha?this.ta:c:null==this.root?c:this.root.$a(0,qc(a),a,c)};h.O=function(){if(this.S)return this.count;throw Error("count after persistent!");};
function $f(b,a){if(b.S){if(a?a.o&2048||a.Vc||(a.o?0:v(hb,a)):v(hb,a))return Zf(b,Kd.e?Kd.e(a):Kd.call(null,a),Ld.e?Ld.e(a):Ld.call(null,a));for(var c=E(a),d=b;;){var e=G(c);if(u(e))var f=e,c=K(c),d=Zf(d,function(){var a=f;return Kd.e?Kd.e(a):Kd.call(null,a)}(),function(){var a=f;return Ld.e?Ld.e(a):Ld.call(null,a)}());else return d}}else throw Error("conj! after persistent");}
function Zf(b,a,c){if(b.S){if(null==a)b.ta!==c&&(b.ta=c),b.ha||(b.count+=1,b.ha=!0);else{var d=new Gf;a=(null==b.root?Pf:b.root).za(b.S,0,qc(a),a,c,d);a!==b.root&&(b.root=a);d.val&&(b.count+=1)}return b}throw Error("assoc! after persistent!");}
var we=function(){function b(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return a.call(this,d)}function a(a){a=E(a);for(var b=Qb(Df);;)if(a){var e=K(K(a)),b=ke.h(b,G(a),Pc(a));a=e}else return Sb(b)}b.v=0;b.l=function(b){b=E(b);return a(b)};b.j=a;return b}(),ag=function(){function b(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return a.call(this,
d)}function a(a){return Ef(V.c(Ia,a))}b.v=0;b.l=function(b){b=E(b);return a(b)};b.j=a;return b}();function bg(b,a){this.ia=b;this.la=a;this.C=0;this.o=32374988}h=bg.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.la};h.fa=function(){var b=this.ia,b=(b?b.o&128||b.Db||(b.o?0:v(Ya,b)):v(Ya,b))?this.ia.fa(null):K(this.ia);return null==b?null:new bg(b,this.la)};h.L=function(){return yc(this)};h.D=function(b,a){return Lc(this,a)};
h.Y=function(){return Nc(J,this.la)};h.ca=function(b,a){return Oc.c(a,this)};h.da=function(b,a,c){return Oc.h(a,c,this)};h.$=function(){return this.ia.$(null).Qb()};h.na=function(){var b=this.ia,b=(b?b.o&128||b.Db||(b.o?0:v(Ya,b)):v(Ya,b))?this.ia.fa(null):K(this.ia);return null!=b?new bg(b,this.la):J};h.M=function(){return this};h.K=function(b,a){return new bg(this.ia,a)};h.N=function(b,a){return O(a,this)};bg.prototype[Fa]=function(){return wc(this)};
function Af(b){return(b=E(b))?new bg(b,null):null}function Kd(b){return ib(b)}function cg(b,a){this.ia=b;this.la=a;this.C=0;this.o=32374988}h=cg.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.I=function(){return this.la};h.fa=function(){var b=this.ia,b=(b?b.o&128||b.Db||(b.o?0:v(Ya,b)):v(Ya,b))?this.ia.fa(null):K(this.ia);return null==b?null:new cg(b,this.la)};h.L=function(){return yc(this)};h.D=function(b,a){return Lc(this,a)};
h.Y=function(){return Nc(J,this.la)};h.ca=function(b,a){return Oc.c(a,this)};h.da=function(b,a,c){return Oc.h(a,c,this)};h.$=function(){return this.ia.$(null).Rb()};h.na=function(){var b=this.ia,b=(b?b.o&128||b.Db||(b.o?0:v(Ya,b)):v(Ya,b))?this.ia.fa(null):K(this.ia);return null!=b?new cg(b,this.la):J};h.M=function(){return this};h.K=function(b,a){return new cg(this.ia,a)};h.N=function(b,a){return O(a,this)};cg.prototype[Fa]=function(){return wc(this)};
function Bf(b){return(b=E(b))?new cg(b,null):null}function Ld(b){return jb(b)}var dg=function(){function b(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return a.call(this,d)}function a(a){return u(pe(Dd,a))?Ka.c(function(a,b){return Rc.c(u(a)?a:sd,b)},a):null}b.v=0;b.l=function(b){b=E(b);return a(b)};b.j=a;return b}();function td(b,a,c){this.meta=b;this.Za=a;this.r=c;this.o=15077647;this.C=8196}h=td.prototype;
h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.keys=function(){return wc(E(this))};h.entries=function(){var b=E(this);return new wf(E(b))};h.values=function(){return wc(E(this))};h.has=function(b){return pd(this,b)};
h.forEach=function(b){for(var a=E(this),c=null,d=0,e=0;;)if(e<d){var f=c.Q(null,e),g=S.h(f,0,null),f=S.h(f,1,null);b.c?b.c(f,g):b.call(null,f,g);e+=1}else if(a=E(a))gd(a)?(c=Wb(a),a=Xb(a),g=c,d=R(c),c=g):(c=G(a),g=S.h(c,0,null),c=f=S.h(c,1,null),b.c?b.c(c,g):b.call(null,c,g),a=K(a),c=null,d=0),e=0;else return null};h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){return bb(this.Za,a)?a:c};h.I=function(){return this.meta};h.T=function(){return new td(this.meta,this.Za,this.r)};h.O=function(){return Ra(this.Za)};
h.L=function(){var b=this.r;return null!=b?b:this.r=b=Ac(this)};h.D=function(b,a){return cd(a)&&R(this)===R(a)&&oe(function(a){return function(b){return pd(a,b)}}(this),a)};h.ib=function(){return new eg(Qb(this.Za))};h.Y=function(){return Nc(vd,this.meta)};h.$b=function(b,a){return new td(this.meta,gb(this.Za,a),null)};h.M=function(){return Af(this.Za)};h.K=function(b,a){return new td(a,this.Za,this.r)};h.N=function(b,a){return new td(this.meta,Vc.h(this.Za,a,null),null)};
h.call=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return this.H(null,b);case 3:return this.F(null,b,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return this.H(null,b)};b.h=function(a,b,d){return this.F(null,b,d)};return b}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.e=function(b){return this.H(null,b)};h.c=function(b,a){return this.F(null,b,a)};var vd=new td(null,sd,Bc);td.prototype[Fa]=function(){return wc(this)};
function eg(b){this.Ya=b;this.o=259;this.C=136}h=eg.prototype;h.call=function(){function b(a,b,c){return $a.h(this.Ya,b,kd)===kd?c:b}function a(a,b){return $a.h(this.Ya,b,kd)===kd?null:b}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};
h.e=function(b){return $a.h(this.Ya,b,kd)===kd?null:b};h.c=function(b,a){return $a.h(this.Ya,b,kd)===kd?a:b};h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){return $a.h(this.Ya,a,kd)===kd?c:a};h.O=function(){return R(this.Ya)};h.eb=function(b,a){this.Ya=ke.h(this.Ya,a,null);return this};h.fb=function(){return new td(null,Sb(this.Ya),null)};
function fg(b){b=E(b);if(null==b)return vd;if(b instanceof F&&0===b.i){b=b.k;a:for(var a=0,c=Qb(vd);;)if(a<b.length)var d=a+1,c=c.eb(null,b[a]),a=d;else break a;return c.fb(null)}for(d=Qb(vd);;)if(null!=b)a=b.fa(null),d=d.eb(null,b.$(null)),b=a;else return d.fb(null)}function Td(b){if(b&&(b.C&4096||b.Xc))return b.name;if("string"===typeof b)return b;throw Error([y("Doesn't support name: "),y(b)].join(""));}
var gg=function(){function b(a,b){return new Vd(null,function(){var f=E(b);if(f){var g;g=G(f);g=a.e?a.e(g):a.call(null,g);f=u(g)?O(G(f),c.c(a,I(f))):null}else f=null;return f},null,null)}function a(a){return function(b){return function(){function c(f,g){return u(a.e?a.e(g):a.call(null,g))?b.c?b.c(f,g):b.call(null,f,g):new Dc(f)}function g(a){return b.e?b.e(a):b.call(null,a)}function k(){return b.t?b.t():b.call(null)}var l=null,l=function(a,b){switch(arguments.length){case 0:return k.call(this);case 1:return g.call(this,
a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};l.t=k;l.e=g;l.c=c;return l}()}}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}();function hg(b,a,c){this.i=b;this.end=a;this.step=c}hg.prototype.Gb=function(){return 0<this.step?this.i<this.end:this.i>this.end};hg.prototype.next=function(){var b=this.i;this.i+=this.step;return b};
function ig(b,a,c,d,e){this.meta=b;this.start=a;this.end=c;this.step=d;this.r=e;this.o=32375006;this.C=8192}h=ig.prototype;h.toString=function(){return gc(this)};h.equiv=function(b){return this.D(null,b)};h.Q=function(b,a){if(a<Ra(this))return this.start+a*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};h.pa=function(b,a,c){return a<Ra(this)?this.start+a*this.step:this.start>this.end&&0===this.step?this.start:c};
h.ub=function(){return new hg(this.start,this.end,this.step)};h.I=function(){return this.meta};h.T=function(){return new ig(this.meta,this.start,this.end,this.step,this.r)};h.fa=function(){return 0<this.step?this.start+this.step<this.end?new ig(this.meta,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new ig(this.meta,this.start+this.step,this.end,this.step,null):null};
h.O=function(){if(Aa(Db(this)))return 0;var b=(this.end-this.start)/this.step;return Math.ceil.e?Math.ceil.e(b):Math.ceil.call(null,b)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=yc(this)};h.D=function(b,a){return Lc(this,a)};h.Y=function(){return Nc(J,this.meta)};h.ca=function(b,a){return Fc.c(this,a)};h.da=function(b,a,c){for(b=this.start;;)if(0<this.step?b<this.end:b>this.end){var d=b;c=a.c?a.c(c,d):a.call(null,c,d);if(Ec(c))return a=c,M.e?M.e(a):M.call(null,a);b+=this.step}else return c};
h.$=function(){return null==Db(this)?null:this.start};h.na=function(){return null!=Db(this)?new ig(this.meta,this.start+this.step,this.end,this.step,null):J};h.M=function(){return 0<this.step?this.start<this.end?this:null:this.start>this.end?this:null};h.K=function(b,a){return new ig(a,this.start,this.end,this.step,this.r)};h.N=function(b,a){return O(a,this)};ig.prototype[Fa]=function(){return wc(this)};
var jg=function(){function b(a,b,c){return new ig(null,a,b,c,null)}function a(a,b){return e.h(a,b,1)}function c(a){return e.h(0,a,1)}function d(){return e.h(0,Number.MAX_VALUE,1)}var e=null,e=function(e,g,k){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,e);case 2:return a.call(this,e,g);case 3:return b.call(this,e,g,k)}throw Error("Invalid arity: "+arguments.length);};e.t=d;e.e=c;e.c=a;e.h=b;return e}();
function kg(b,a){return new W(null,2,5,X,[gg.c(b,a),He.c(b,a)],null)}
var lg=function(){function b(a,b,c){return function(){function d(e,l,m){return new W(null,3,5,X,[a.h?a.h(e,l,m):a.call(null,e,l,m),b.h?b.h(e,l,m):b.call(null,e,l,m),c.h?c.h(e,l,m):c.call(null,e,l,m)],null)}function e(d,l){return new W(null,3,5,X,[a.c?a.c(d,l):a.call(null,d,l),b.c?b.c(d,l):b.call(null,d,l),c.c?c.c(d,l):c.call(null,d,l)],null)}function n(d){return new W(null,3,5,X,[a.e?a.e(d):a.call(null,d),b.e?b.e(d):b.call(null,d),c.e?c.e(d):c.call(null,d)],null)}function p(){return new W(null,3,
5,X,[a.t?a.t():a.call(null),b.t?b.t():b.call(null),c.t?c.t():c.call(null)],null)}var r=null,w=function(){function d(a,b,c,f){var g=null;if(3<arguments.length){for(var g=0,k=Array(arguments.length-3);g<k.length;)k[g]=arguments[g+3],++g;g=new F(k,0)}return e.call(this,a,b,c,g)}function e(d,l,m,n){return new W(null,3,5,X,[V.J(a,d,l,m,n),V.J(b,d,l,m,n),V.J(c,d,l,m,n)],null)}d.v=3;d.l=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var d=G(a);a=I(a);return e(b,c,d,a)};d.j=e;return d}(),r=function(a,b,
c,f){switch(arguments.length){case 0:return p.call(this);case 1:return n.call(this,a);case 2:return e.call(this,a,b);case 3:return d.call(this,a,b,c);default:var g=null;if(3<arguments.length){for(var g=0,k=Array(arguments.length-3);g<k.length;)k[g]=arguments[g+3],++g;g=new F(k,0)}return w.j(a,b,c,g)}throw Error("Invalid arity: "+arguments.length);};r.v=3;r.l=w.l;r.t=p;r.e=n;r.c=e;r.h=d;r.j=w.j;return r}()}function a(a,b){return function(){function c(d,e,k){return new W(null,2,5,X,[a.h?a.h(d,e,k):
a.call(null,d,e,k),b.h?b.h(d,e,k):b.call(null,d,e,k)],null)}function d(c,e){return new W(null,2,5,X,[a.c?a.c(c,e):a.call(null,c,e),b.c?b.c(c,e):b.call(null,c,e)],null)}function e(c){return new W(null,2,5,X,[a.e?a.e(c):a.call(null,c),b.e?b.e(c):b.call(null,c)],null)}function n(){return new W(null,2,5,X,[a.t?a.t():a.call(null),b.t?b.t():b.call(null)],null)}var p=null,r=function(){function c(a,b,e,f){var g=null;if(3<arguments.length){for(var g=0,k=Array(arguments.length-3);g<k.length;)k[g]=arguments[g+
3],++g;g=new F(k,0)}return d.call(this,a,b,e,g)}function d(c,e,k,l){return new W(null,2,5,X,[V.J(a,c,e,k,l),V.J(b,c,e,k,l)],null)}c.v=3;c.l=function(a){var b=G(a);a=K(a);var c=G(a);a=K(a);var e=G(a);a=I(a);return d(b,c,e,a)};c.j=d;return c}(),p=function(a,b,f,g){switch(arguments.length){case 0:return n.call(this);case 1:return e.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,f);default:var p=null;if(3<arguments.length){for(var p=0,N=Array(arguments.length-3);p<N.length;)N[p]=
arguments[p+3],++p;p=new F(N,0)}return r.j(a,b,f,p)}throw Error("Invalid arity: "+arguments.length);};p.v=3;p.l=r.l;p.t=n;p.e=e;p.c=d;p.h=c;p.j=r.j;return p}()}function c(a){return function(){function b(c,d,e){return new W(null,1,5,X,[a.h?a.h(c,d,e):a.call(null,c,d,e)],null)}function c(b,d){return new W(null,1,5,X,[a.c?a.c(b,d):a.call(null,b,d)],null)}function d(b){return new W(null,1,5,X,[a.e?a.e(b):a.call(null,b)],null)}function e(){return new W(null,1,5,X,[a.t?a.t():a.call(null)],null)}var n=null,
p=function(){function b(a,d,e,f){var g=null;if(3<arguments.length){for(var g=0,k=Array(arguments.length-3);g<k.length;)k[g]=arguments[g+3],++g;g=new F(k,0)}return c.call(this,a,d,e,g)}function c(b,d,e,g){return new W(null,1,5,X,[V.J(a,b,d,e,g)],null)}b.v=3;b.l=function(a){var b=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=I(a);return c(b,d,e,a)};b.j=c;return b}(),n=function(a,f,n,D){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,f);case 3:return b.call(this,
a,f,n);default:var H=null;if(3<arguments.length){for(var H=0,P=Array(arguments.length-3);H<P.length;)P[H]=arguments[H+3],++H;H=new F(P,0)}return p.j(a,f,n,H)}throw Error("Invalid arity: "+arguments.length);};n.v=3;n.l=p.l;n.t=e;n.e=d;n.c=c;n.h=b;n.j=p.j;return n}()}var d=null,e=function(){function a(c,d,e,f){var p=null;if(3<arguments.length){for(var p=0,r=Array(arguments.length-3);p<r.length;)r[p]=arguments[p+3],++p;p=new F(r,0)}return b.call(this,c,d,e,p)}function b(a,c,d,e){return function(a){return function(){function b(c,
d,e){return Ka.h(function(){return function(a,b){return Rc.c(a,b.h?b.h(c,d,e):b.call(null,c,d,e))}}(a),Qc,a)}function c(b,d){return Ka.h(function(){return function(a,c){return Rc.c(a,c.c?c.c(b,d):c.call(null,b,d))}}(a),Qc,a)}function d(b){return Ka.h(function(){return function(a,c){return Rc.c(a,c.e?c.e(b):c.call(null,b))}}(a),Qc,a)}function e(){return Ka.h(function(){return function(a,b){return Rc.c(a,b.t?b.t():b.call(null))}}(a),Qc,a)}var f=null,g=function(){function b(a,d,e,f){var g=null;if(3<
arguments.length){for(var g=0,k=Array(arguments.length-3);g<k.length;)k[g]=arguments[g+3],++g;g=new F(k,0)}return c.call(this,a,d,e,g)}function c(b,d,e,f){return Ka.h(function(){return function(a,c){return Rc.c(a,V.J(c,b,d,e,f))}}(a),Qc,a)}b.v=3;b.l=function(a){var b=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=I(a);return c(b,d,e,a)};b.j=c;return b}(),f=function(a,f,k,l){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,f);case 3:return b.call(this,
a,f,k);default:var m=null;if(3<arguments.length){for(var m=0,n=Array(arguments.length-3);m<n.length;)n[m]=arguments[m+3],++m;m=new F(n,0)}return g.j(a,f,k,m)}throw Error("Invalid arity: "+arguments.length);};f.v=3;f.l=g.l;f.t=e;f.e=d;f.c=c;f.h=b;f.j=g.j;return f}()}(he.B(a,c,d,e))}a.v=3;a.l=function(a){var c=G(a);a=K(a);var d=G(a);a=K(a);var e=G(a);a=I(a);return b(c,d,e,a)};a.j=b;return a}(),d=function(d,g,k,l){switch(arguments.length){case 1:return c.call(this,d);case 2:return a.call(this,d,g);case 3:return b.call(this,
d,g,k);default:var m=null;if(3<arguments.length){for(var m=0,n=Array(arguments.length-3);m<n.length;)n[m]=arguments[m+3],++m;m=new F(n,0)}return e.j(d,g,k,m)}throw Error("Invalid arity: "+arguments.length);};d.v=3;d.l=e.l;d.e=c;d.c=a;d.h=b;d.j=e.j;return d}(),mg=function(){function b(a,b){for(;;)if(E(b)&&0<a){var c=a-1,g=K(b);a=c;b=g}else return null}function a(a){for(;;)if(E(a))a=K(a);else return null}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,
c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),ng=function(){function b(a,b){mg.c(a,b);return b}function a(a){mg.e(a);return a}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}();
function og(b,a){if("string"===typeof a){var c=b.exec(a);return null==c?null:1===R(c)?G(c):kf(c)}throw new TypeError("re-find must match against a string.");}
function pg(b,a,c,d,e,f,g){var k=pa;pa=null==pa?null:pa-1;try{if(null!=pa&&0>pa)return Jb(b,"#");Jb(b,c);if(0===xa.e(f))E(g)&&Jb(b,function(){var a=qg.e(f);return u(a)?a:"..."}());else{if(E(g)){var l=G(g);a.h?a.h(l,b,f):a.call(null,l,b,f)}for(var m=K(g),n=xa.e(f)-1;;)if(!m||null!=n&&0===n){E(m)&&0===n&&(Jb(b,d),Jb(b,function(){var a=qg.e(f);return u(a)?a:"..."}()));break}else{Jb(b,d);var p=G(m);c=b;g=f;a.h?a.h(p,c,g):a.call(null,p,c,g);var r=K(m);c=n-1;m=r;n=c}}return Jb(b,e)}finally{pa=k}}
var rg=function(){function b(b,d){var e=null;if(1<arguments.length){for(var e=0,f=Array(arguments.length-1);e<f.length;)f[e]=arguments[e+1],++e;e=new F(f,0)}return a.call(this,b,e)}function a(a,b){for(var e=E(b),f=null,g=0,k=0;;)if(k<g){var l=f.Q(null,k);Jb(a,l);k+=1}else if(e=E(e))f=e,gd(f)?(e=Wb(f),g=Xb(f),f=e,l=R(e),e=g,g=l):(l=G(f),Jb(a,l),e=K(f),f=null,g=0),k=0;else return null}b.v=1;b.l=function(b){var d=G(b);b=I(b);return a(d,b)};b.j=a;return b}(),sg={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f",
"\n":"\\n","\r":"\\r","\t":"\\t"};function tg(b){return[y('"'),y(b.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return sg[a]})),y('"')].join("")}
function ug(b,a,c){if(null==b)return Jb(a,"nil");if(void 0===b)return Jb(a,"#\x3cundefined\x3e");if(u(function(){var a=U.c(c,va);return u(a)?(a=b?b.o&131072||b.Wc?!0:b.o?!1:v(qb,b):v(qb,b))?Zc(b):a:a}())){Jb(a,"^");var d=Zc(b);vg.h?vg.h(d,a,c):vg.call(null,d,a,c);Jb(a," ")}return null==b?Jb(a,"nil"):b.kb?b.xb(b,a,c):b&&(b.o&2147483648||b.W)?b.G(null,a,c):Da(b)===Boolean||"number"===typeof b?Jb(a,""+y(b)):null!=b&&b.constructor===Object?(Jb(a,"#js "),d=De.c(function(a){return new W(null,2,5,X,[Ud.e(a),
b[a]],null)},hd(b)),wg.B?wg.B(d,vg,a,c):wg.call(null,d,vg,a,c)):za(b)?pg(a,vg,"#js ["," ","]",c,b):u("string"==typeof b)?u(ua.e(c))?Jb(a,tg(b)):Jb(a,b):Xc(b)?rg.j(a,Q(["#\x3c",""+y(b),"\x3e"],0)):b instanceof Date?(d=function(a,b){for(var c=""+y(a);;)if(R(c)<b)c=[y("0"),y(c)].join("");else return c},rg.j(a,Q(['#inst "',""+y(b.getUTCFullYear()),"-",d(b.getUTCMonth()+1,2),"-",d(b.getUTCDate(),2),"T",d(b.getUTCHours(),2),":",d(b.getUTCMinutes(),2),":",d(b.getUTCSeconds(),2),".",d(b.getUTCMilliseconds(),
3),"-",'00:00"'],0))):b instanceof RegExp?rg.j(a,Q(['#"',b.source,'"'],0)):(b?b.o&2147483648||b.W||(b.o?0:v(Kb,b)):v(Kb,b))?Lb(b,a,c):rg.j(a,Q(["#\x3c",""+y(b),"\x3e"],0))}function vg(b,a,c){var d=xg.e(c);return u(d)?(c=Vc.h(c,yg,ug),d.h?d.h(b,a,c):d.call(null,b,a,c)):ug(b,a,c)}
var Ae=function(){function b(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return a.call(this,d)}function a(a){var b=sa();if(ad(a))b="";else{var e=y,f=new ja;a:{var g=new fc(f);vg(G(a),g,b);a=E(K(a));for(var k=null,l=0,m=0;;)if(m<l){var n=k.Q(null,m);Jb(g," ");vg(n,g,b);m+=1}else if(a=E(a))k=a,gd(k)?(a=Wb(k),l=Xb(k),k=a,n=R(a),a=l,l=n):(n=G(k),Jb(g," "),vg(n,g,b),a=K(k),k=null,l=0),m=0;else break a}b=""+e(f)}return b}
b.v=0;b.l=function(b){b=E(b);return a(b)};b.j=a;return b}();function wg(b,a,c,d){return pg(c,function(b,c,d){var k=ib(b);a.h?a.h(k,c,d):a.call(null,k,c,d);Jb(c," ");b=jb(b);return a.h?a.h(b,c,d):a.call(null,b,c,d)},"{",", ","}",d,E(b))}Ce.prototype.W=!0;Ce.prototype.G=function(b,a,c){Jb(a,"#\x3cVolatile: ");vg(this.state,a,c);return Jb(a,"\x3e")};F.prototype.W=!0;F.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};Vd.prototype.W=!0;
Vd.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};Vf.prototype.W=!0;Vf.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};yf.prototype.W=!0;yf.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};lf.prototype.W=!0;lf.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};Qd.prototype.W=!0;Qd.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};Kc.prototype.W=!0;Kc.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};
Xf.prototype.W=!0;Xf.prototype.G=function(b,a,c){return wg(this,vg,a,c)};Wf.prototype.W=!0;Wf.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};nf.prototype.W=!0;nf.prototype.G=function(b,a,c){return pg(a,vg,"["," ","]",c,this)};td.prototype.W=!0;td.prototype.G=function(b,a,c){return pg(a,vg,"#{"," ","}",c,this)};be.prototype.W=!0;be.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};ve.prototype.W=!0;
ve.prototype.G=function(b,a,c){Jb(a,"#\x3cAtom: ");vg(this.state,a,c);return Jb(a,"\x3e")};cg.prototype.W=!0;cg.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};W.prototype.W=!0;W.prototype.G=function(b,a,c){return pg(a,vg,"["," ","]",c,this)};Nd.prototype.W=!0;Nd.prototype.G=function(b,a){return Jb(a,"()")};t.prototype.W=!0;t.prototype.G=function(b,a,c){return wg(this,vg,a,c)};ig.prototype.W=!0;ig.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};bg.prototype.W=!0;
bg.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};Md.prototype.W=!0;Md.prototype.G=function(b,a,c){return pg(a,vg,"("," ",")",c,this)};W.prototype.sb=!0;W.prototype.tb=function(b,a){return yd.c(this,a)};nf.prototype.sb=!0;nf.prototype.tb=function(b,a){return yd.c(this,a)};Y.prototype.sb=!0;Y.prototype.tb=function(b,a){return Rd(this,a)};C.prototype.sb=!0;C.prototype.tb=function(b,a){return tc(this,a)};function zg(b,a,c){Nb(b,a,c)}
var Ag=null,Bg=function(){function b(a){null==Ag&&(Ag=ye.e?ye.e(0):ye.call(null,0));return uc.e([y(a),y(Be.c(Ag,Cc))].join(""))}function a(){return c.e("G__")}var c=null,c=function(c){switch(arguments.length){case 0:return a.call(this);case 1:return b.call(this,c)}throw Error("Invalid arity: "+arguments.length);};c.t=a;c.e=b;return c}();function Cg(b,a){this.gb=b;this.value=a;this.C=1;this.o=32768}
Cg.prototype.Da=function(){u(this.gb)&&(this.value=this.gb.t?this.gb.t():this.gb.call(null),this.gb=null);return this.value};function Dg(b){return function(a,c){var d=b.c?b.c(a,c):b.call(null,a,c);return Ec(d)?new Dc(d):d}}
function Le(b){return function(a){return function(){function c(b,c){return Ka.h(a,b,c)}function d(a){return b.e?b.e(a):b.call(null,a)}function e(){return b.t?b.t():b.call(null)}var f=null,f=function(a,b){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};f.t=e;f.e=d;f.c=c;return f}()}(Dg(b))}
var Eg={},Fg=function Fg(a){if(a?a.Rc:a)return a.Rc(a);var c;c=Fg[q(null==a?null:a)];if(!c&&(c=Fg._,!c))throw x("IEncodeJS.-clj-\x3ejs",a);return c.call(null,a)};function Gg(b){return(b?u(u(null)?null:b.Qc)||(b.R?0:v(Eg,b)):v(Eg,b))?Fg(b):"string"===typeof b||"number"===typeof b||b instanceof Y||b instanceof C?Hg.e?Hg.e(b):Hg.call(null,b):Ae.j(Q([b],0))}
var Hg=function Hg(a){if(null==a)return null;if(a?u(u(null)?null:a.Qc)||(a.R?0:v(Eg,a)):v(Eg,a))return Fg(a);if(a instanceof Y)return Td(a);if(a instanceof C)return""+y(a);if(ed(a)){var c={};a=E(a);for(var d=null,e=0,f=0;;)if(f<e){var g=d.Q(null,f),k=S.h(g,0,null),g=S.h(g,1,null);c[Gg(k)]=Hg(g);f+=1}else if(a=E(a))gd(a)?(e=Wb(a),a=Xb(a),d=e,e=R(e)):(e=G(a),d=S.h(e,0,null),e=S.h(e,1,null),c[Gg(d)]=Hg(e),a=K(a),d=null,e=0),f=0;else break;return c}if(bd(a)){c=[];a=E(De.c(Hg,a));d=null;for(f=e=0;;)if(f<
e)k=d.Q(null,f),c.push(k),f+=1;else if(a=E(a))d=a,gd(d)?(a=Wb(d),f=Xb(d),d=a,e=R(a),a=f):(a=G(d),c.push(a),a=K(d),d=null,e=0),f=0;else break;return c}return a},Ig={},Jg=function Jg(a,c){if(a?a.Pc:a)return a.Pc(a,c);var d;d=Jg[q(null==a?null:a)];if(!d&&(d=Jg._,!d))throw x("IEncodeClojure.-js-\x3eclj",a);return d.call(null,a,c)},Lg=function(){function b(b){return a.j(b,Q([new t(null,1,[Kg,!1],null)],0))}var a=null,c=function(){function a(c,d){var k=null;if(1<arguments.length){for(var k=0,l=Array(arguments.length-
1);k<l.length;)l[k]=arguments[k+1],++k;k=new F(l,0)}return b.call(this,c,k)}function b(a,c){var d=ld(c)?V.c(we,c):c,e=U.c(d,Kg);return function(a,b,d,e){return function z(f){return(f?u(u(null)?null:f.je)||(f.R?0:v(Ig,f)):v(Ig,f))?Jg(f,V.c(ag,c)):ld(f)?ng.e(De.c(z,f)):bd(f)?Re.c(Sc(f),De.c(z,f)):za(f)?kf(De.c(z,f)):Da(f)===Object?Re.c(sd,function(){return function(a,b,c,d){return function eb(e){return new Vd(null,function(a,b,c,d){return function(){for(;;){var a=E(e);if(a){if(gd(a)){var b=Wb(a),c=
R(b),g=Zd(c);return function(){for(var a=0;;)if(a<c){var e=B.c(b,a),k=g,l=X,m;m=e;m=d.e?d.e(m):d.call(null,m);e=new W(null,2,5,l,[m,z(f[e])],null);k.add(e);a+=1}else return!0}()?ce(g.P(),eb(Xb(a))):ce(g.P(),null)}var k=G(a);return O(new W(null,2,5,X,[function(){var a=k;return d.e?d.e(a):d.call(null,a)}(),z(f[k])],null),eb(I(a)))}return null}}}(a,b,c,d),null,null)}}(a,b,d,e)(hd(f))}()):f}}(c,d,e,u(e)?Ud:y)(a)}a.v=1;a.l=function(a){var c=G(a);a=I(a);return b(c,a)};a.j=b;return a}(),a=function(a,e){switch(arguments.length){case 1:return b.call(this,
a);default:var f=null;if(1<arguments.length){for(var f=0,g=Array(arguments.length-1);f<g.length;)g[f]=arguments[f+1],++f;f=new F(g,0)}return c.j(a,f)}throw Error("Invalid arity: "+arguments.length);};a.v=1;a.l=c.l;a.e=b;a.j=c.j;return a}();
function Mg(){var b=Ng;return function(a){return function(){function c(a){var b=null;if(0<arguments.length){for(var b=0,c=Array(arguments.length-0);b<c.length;)c[b]=arguments[b+0],++b;b=new F(c,0)}return d.call(this,b)}function d(c){var d=U.h(M.e?M.e(a):M.call(null,a),c,kd);d===kd&&(d=V.c(b,c),Be.B(a,Vc,c,d));return d}c.v=0;c.l=function(a){a=E(a);return d(a)};c.j=d;return c}()}(ye.e?ye.e(sd):ye.call(null,sd))}
function Og(b,a){return ie(Ka.h(function(a,d){var e=b.e?b.e(d):b.call(null,d);return ke.h(a,e,Rc.c(U.h(a,e,Qc),d))},Qb(sd),a))}function Pg(b,a,c){var d=Error();this.message=b;this.data=a;this.Wb=c;this.name=d.name;this.description=d.description;this.number=d.number;this.fileName=d.fileName;this.lineNumber=d.lineNumber;this.columnNumber=d.columnNumber;this.stack=d.stack;return this}Pg.prototype.__proto__=Error.prototype;Pg.prototype.W=!0;
Pg.prototype.G=function(b,a,c){Jb(a,"#ExceptionInfo{:message ");vg(this.message,a,c);u(this.data)&&(Jb(a,", :data "),vg(this.data,a,c));u(this.Wb)&&(Jb(a,", :cause "),vg(this.Wb,a,c));return Jb(a,"}")};Pg.prototype.toString=function(){return gc(this)};
var Qg=function(){function b(a,b,c){return new Pg(a,b,c)}function a(a,b){return c.h(a,b,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}();var Rg=new Y(null,"y","y",-1757859776),Sg=new Y(null,"zero","zero",-858964576),Tg=new Y(null,"old-state","old-state",1039580704),Ug=new Y(null,"path","path",-188191168),Vg=new Y(null,"shift","shift",997140064),Wg=new Y(null,"one","one",935007904),Xg=new Y(null,"state-map","state-map",-1313872128),Yg=new Y(null,"new-value","new-value",1087038368),Zg=new Y(null,"q","q",689001697),$g=new Y(null,"schema","schema",-1582001791),ah=new Y(null,"num-eight","num-eight",1648171777),bh=new Y(null,"ff-semicolon",
"ff-semicolon",1279895297),ch=new Y(null,"slash","slash",-1449773022),dh=new Y(null,"down","down",1565245570),fh=new Y(null,"question-mark","question-mark",1946747234),gh=new Y(null,"win-key","win-key",528957026),hh=new Y(null,"r","r",-471384190),ih=new Y(null,"descriptor","descriptor",76122018),jh=new Y(null,"space","space",348133475),kh=new Y(null,"num-division","num-division",-1651240829),lh=new Y(null,"home","home",-74557309),mh=new Y(null,"insert","insert",1286475395),nh=new Y("om.core","not-found",
"om.core/not-found",1869894275),oh=new Y(null,"componentDidUpdate","componentDidUpdate",-1983477981),ph=new Y(null,"num-zero","num-zero",-2066202749),qh=new Y(null,"v","v",21465059),rh=new Y(null,"mac-enter","mac-enter",-1535813532),sh=new Y(null,"fn","fn",-1175266204),th=new Y(null,"family","family",-1313145692),uh=new Y(null,"f8","f8",-2141475484),vh=new Y(null,"new-state","new-state",-490349212),wh=new Y(null,"instrument","instrument",-960698844),xh=new Y(null,"o","o",-1350007228),va=new Y(null,
"meta","meta",1499536964),yh=new Y("schema.core","error","schema.core/error",1991454308),zh=new Y(null,"react-key","react-key",1337881348),Ah=new Y(null,"eight","eight",-1202254044),Bh=new Y(null,"f1","f1",1714532389),Ch=new Y("om.core","id","om.core/id",299074693),Dh=new Y(null,"win-ime","win-ime",1187364997),wa=new Y(null,"dup","dup",556298533),Eh=new Y(null,"win-key-ff-linux","win-key-ff-linux",-37611163),Fh=new Y(null,"mac-wk-cmd-left","mac-wk-cmd-left",-84384283),Gh=new Y(null,"key","key",-1516042587),
Hh=new Y(null,"skip-render-root","skip-render-root",-5219643),Ih=new Y(null,"f10","f10",627525541),Jh=new Y(null,"last-media-key","last-media-key",486556613),Kh=new Y(null,"mac-ff-meta","mac-ff-meta",-999198298),Lh=new Y(null,"num-six","num-six",-357946906),Mh=new Y(null,"num-period","num-period",378989254),Nh=new Y(null,"isOmComponent","isOmComponent",-2070015162),Oh=new Y(null,"alt","alt",-3214426),Ph=new Y(null,"first-media-key","first-media-key",861535271),Qh=new Y(null,"scroll-lock","scroll-lock",
281688679),Rh=new Y(null,"esc","esc",-1671924121),Sh=new Y(null,"phantom","phantom",1438556935),Th=new Y(null,"_","_",1453416199),xe=new Y(null,"validator","validator",-1966190681),Uh=new Y(null,"kspec","kspec",-1151232248),Vh=new Y(null,"does-not-satisfy-schema","does-not-satisfy-schema",-1543152824),Wh=new Y(null,"name","name",1843675177),Xh=new Y(null,"n","n",562130025),Yh=new Y(null,"adapt","adapt",-1817022327),Zh=new Y(null,"w","w",354169001),$h=new Y(null,"m","m",1632677161),ai=new Y(null,"output-schema",
"output-schema",272504137),bi=new Y(null,"editor-path","editor-path",1083496905),ci=new Y(null,"comma","comma",1699024745),di=new Y(null,"value","value",305978217),ei=new Y(null,"num-nine","num-nine",-348334806),fi=new Y(null,"page-up","page-up",1352555050),gi=new Y(null,"proto-sym","proto-sym",-886371734),hi=new Y(null,"num-seven","num-seven",-1673554070),ii=new Y(null,"numlock","numlock",-1383996470),ji=new Y(null,"win-key-right","win-key-right",-1650150165),ki=new Y(null,"input-schemas","input-schemas",
-982154805),li=new Y(null,"extra","extra",1612569067),mi=new Y(null,"f5","f5",1587057387),ni=new Y(null,"old-value","old-value",862546795),oi=new Y(null,"caps-lock","caps-lock",406112235),pi=new Y(null,"open-square-bracket","open-square-bracket",-1607562196),qi=new Y(null,"dash","dash",23821356),ri=new Y(null,"num-multiply","num-multiply",302427276),si=new Y("om.core","pass","om.core/pass",-1453289268),ti=new Y(null,"tilde","tilde",-306005780),ui=new Y(null,"type","type",1174270348),vi=new Y(null,
"init-state","init-state",1450863212),wi=new Y(null,"delete","delete",-1768633620),xi=new Y(null,"three","three",-1651831795),yi=new Y(null,"state","state",-1988618099),zi=new Y(null,"mac-wk-cmd-right","mac-wk-cmd-right",-1985015411),yg=new Y(null,"fallback-impl","fallback-impl",-1501286995),Ai=new Y(null,"val-schema","val-schema",-2014773619),Bi=new Y(null,"five","five",1430677197),Ci=new Y(null,"pending-state","pending-state",1525896973),Di=new Y("schema.core","missing","schema.core/missing",1420181325),
ta=new Y(null,"flush-on-newline","flush-on-newline",-151457939),Ei=new Y(null,"save","save",1850079149),Fi=new Y(null,"componentWillUnmount","componentWillUnmount",1573788814),Gi=new Y(null,"componentWillReceiveProps","componentWillReceiveProps",559988974),Hi=new Y(null,"equals","equals",-463033970),Ii=new Y(null,"four","four",1338555054),Ji=new Y(null,"e","e",1381269198),Ki=new Y(null,"ctrl","ctrl",361402094),Li=new Y(null,"s","s",1705939918),Mi=new Y(null,"l","l",1395893423),Ni=new Y(null,"ignore",
"ignore",-1631542033),Oi=new Y(null,"className","className",-1983287057),Pi=new Y(null,"up","up",-269712113),Qi=new Y(null,"production","production",1781416239),Ri=new Y(null,"k","k",-2146297393),Si=new Y(null,"num-center","num-center",967095119),Ti=new Y(null,"enter","enter",1792452624),Ui=new Y(null,"shouldComponentUpdate","shouldComponentUpdate",1795750960),ua=new Y(null,"readably","readably",1129599760),qg=new Y(null,"more-marker","more-marker",-14717935),Vi=new Y(null,"optional?","optional?",
1184638129),Wi=new Y(null,"z","z",-789527183),Xi=new Y(null,"key-fn","key-fn",-636154479),Yi=new Y(null,"g","g",1738089905),Zi=new Y(null,"num-two","num-two",-1446413903),$i=new Y(null,"f11","f11",-1417398799),bj=new Y(null,"c","c",-1763192079),cj=new Y(null,"render","render",-1408033454),dj=new Y(null,"single-quote","single-quote",-1053657646),ej=new Y(null,"num-plus","num-plus",-770369838),fj=new Y(null,"num-five","num-five",-2036785166),gj=new Y(null,"j","j",-1397974765),hj=new Y(null,"schemas",
"schemas",575070579),ij=new Y(null,"previous-state","previous-state",1888227923),jj=new Y(null,"f3","f3",1954829043),kj=new Y(null,"status","status",-1997798413),lj=new Y(null,"h","h",1109658740),xa=new Y(null,"print-length","print-length",1931866356),mj=new Y(null,"componentWillUpdate","componentWillUpdate",657390932),nj=new Y(null,"f2","f2",396168596),oj=new Y(null,"apostrophe","apostrophe",-1476834636),pj=new Y(null,"getInitialState","getInitialState",1541760916),qj=new Y(null,"nine","nine",-1883832396),
rj=new Y(null,"opts","opts",155075701),sj=new Y(null,"num-three","num-three",1043534997),tj=new Y(null,"close-square-bracket","close-square-bracket",1583926421),uj=new Y(null,"two","two",627606869),vj=new Y(null,"context-menu","context-menu",-1002713451),wj=new Y(null,"pred-name","pred-name",-3677451),xj=new Y(null,"semicolon","semicolon",797086549),yj=new Y(null,"f12","f12",853352790),zj=new Y(null,"seven","seven",1278068278),Aj=new Y(null,"editor","editor",-989377770),Bj=new Y(null,"b","b",1482224470),
Cj=new Y("om.core","index","om.core/index",-1724175434),Dj=new Y(null,"ff-equals","ff-equals",6193142),Ej=new Y(null,"shared","shared",-384145993),Fj=new Y(null,"right","right",-452581833),Gj=new Y(null,"editor-content","editor-content",-959857833),Hj=new Y(null,"raf","raf",-1295410152),Ij=new Y(null,"d","d",1972142424),Jj=new Y(null,"f","f",-1597136552),Kj=new Y(null,"componentDidMount","componentDidMount",955710936),Lj=new Y(null,"htmlFor","htmlFor",-1050291720),Mj=new Y(null,"pause","pause",-2095325672),
Nj=new Y(null,"error","error",-978969032),Oj=new Y(null,"backspace","backspace",-696007848),Pj=new Y(null,"num-four","num-four",710728568),Qj=new Y(null,"f7","f7",356150168),Rj=new Y(null,"t","t",-1397832519),Sj=new Y(null,"x","x",2099068185),Tj=new Y("om.core","invalid","om.core/invalid",1948827993),Uj=new Y(null,"os","os",795021913),Vj=new Y(null,"tag","tag",-1290361223),Wj=new Y(null,"period","period",-352129191),Xj=new Y(null,"print-screen","print-screen",6404025),Yj=new Y(null,"target","target",
253001721),Zj=new Y(null,"getDisplayName","getDisplayName",1324429466),ak=new Y(null,"f9","f9",704633338),bk=new Y(null,"page-down","page-down",-392838598),ck=new Y(null,"end","end",-268185958),dk=new Y(null,"ff-dash","ff-dash",-526209989),ek=new Y(null,"tab","tab",-559583621),xg=new Y(null,"alt-impl","alt-impl",670969595),fk=new Y(null,"p?","p?",-1172161701),gk=new Y(null,"failures","failures",-912916356),hk=new Y(null,"f6","f6",2103080604),ik=new Y(null,"proto-pred","proto-pred",1885698716),Kg=
new Y(null,"keywordize-keys","keywordize-keys",1310784252),jk=new Y(null,"f4","f4",990968764),kk=new Y(null,"p","p",151049309),lk=new Y(null,"six","six",-2128505347),mk=new Y(null,"componentWillMount","componentWillMount",-285327619),nk=new Y(null,"i","i",-1386841315),qk=new Y(null,"num-one","num-one",-417870851),rk=new Y("om.core","defer","om.core/defer",-1038866178),sk=new Y(null,"num-minus","num-minus",-979319330),tk=new Y(null,"a","a",-2123407586),uk=new Y(null,"render-state","render-state",2053902270),
vk=new Y(null,"backslash","backslash",1790786526),wk=new Y(null,"tx-listen","tx-listen",119130367),xk=new Y(null,"left","left",-399115937),yk=new Y("cljs.core","not-found","cljs.core/not-found",-1572889185),zk=new Y(null,"u","u",-1156634785);function Ak(b,a){var c=function(){return React.createClass({render:function(){var a={};ha(a,this.props,{children:this.props.children,onChange:this.onChange,value:this.state.value});return b.e?b.e(a):b.call(null,a)},componentWillReceiveProps:function(a){return this.setState({value:a.value})},onChange:function(a){var b=this.props.onChange;if(null==b)return null;b.e?b.e(a):b.call(null,a);return this.setState({value:a.target.value})},getInitialState:function(){return{value:this.props.value}},getDisplayName:function(){return a}})}();
React.createFactory(c)}Ak(React.DOM.input,"input");Ak(React.DOM.textarea,"textarea");Ak(React.DOM.option,"option");function Bk(b,a){return React.render(b,a)};function Ck(b){var a=/-(\w)/,c=se.c(Dk,Pc);if("string"===typeof a)return b.replace(new RegExp(String(a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08"),"g"),c);if(a instanceof RegExp)return b.replace(new RegExp(a.source,"g"),c);throw[y("Invalid match arg: "),y(a)].join("");}function Dk(b){return b.toUpperCase()};function Ek(b){return u(function(){var a=5>R(b);if(a)return a;switch(Id.h(b,0,5)){case "data-":case "aria-":return!0;default:return!1}}())?b:Ck(b)}function Fk(b){return ed(b)?Hg(Re.c(sd,De.c(function(a){var b=S.h(a,0,null),d=S.h(a,1,null);a=X;a:switch(b instanceof Y?b.X:null){case "for":b=Lj;break a;case "class":b=Oi;break a}b=Ud.e(Ek(Td(b)));d=ed(d)?Fk.e?Fk.e(d):Fk.call(null,d):d;return new W(null,2,5,a,[b,d],null)},b))):b};function Gk(b,a){var c=Array.prototype.slice.call(arguments),d=c.shift();if("undefined"==typeof d)throw Error("[goog.string.format] Template required");return d.replace(/%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g,function(a,b,d,k,l,m,n,p){if("%"==m)return"%";var r=c.shift();if("undefined"==typeof r)throw Error("[goog.string.format] Not enough arguments");arguments[0]=r;return Gk.Xa[m].apply(null,arguments)})}Gk.Xa={};
Gk.Xa.s=function(b,a,c){return isNaN(c)||""==c||b.length>=c?b:b=-1<a.indexOf("-",0)?b+Array(c-b.length+1).join(" "):Array(c-b.length+1).join(" ")+b};
Gk.Xa.f=function(b,a,c,d,e){d=b.toString();isNaN(e)||""==e||(d=b.toFixed(e));var f;f=0>b?"-":0<=a.indexOf("+")?"+":0<=a.indexOf(" ")?" ":"";0<=b&&(d=f+d);if(isNaN(c)||d.length>=c)return d;d=isNaN(e)?Math.abs(b).toString():Math.abs(b).toFixed(e);b=c-d.length-f.length;return d=0<=a.indexOf("-",0)?f+d+Array(b+1).join(" "):f+Array(b+1).join(0<=a.indexOf("0",0)?"0":" ")+d};Gk.Xa.d=function(b,a,c,d,e,f,g,k){return Gk.Xa.f(parseInt(b,10),a,c,d,0,f,g,k)};Gk.Xa.i=Gk.Xa.d;Gk.Xa.u=Gk.Xa.d;var Hk=function(){function b(b,d){var e=null;if(1<arguments.length){for(var e=0,f=Array(arguments.length-1);e<f.length;)f[e]=arguments[e+1],++e;e=new F(f,0)}return a.call(this,b,e)}function a(a,b){return V.h(Gk,a,b)}b.v=1;b.l=function(b){var d=G(b);b=I(b);return a(d,b)};b.j=a;return b}();function Ik(b){var a=typeof b;return 20>R(""+y(b))?b:uc.e([y("a-"),y(a)].join(""))}function Jk(b,a,c,d){this.V=b;this.value=a;this.fd=c;this.gd=d;this.C=0;this.o=2147483648}
Jk.prototype.G=function(b,a,c){return Lb(Kk.e?Kk.e(this):Kk.call(null,this),a,c)};function Lk(b,a,c,d){return new Jk(b,a,c,d)}function Kk(b){return A(A(J,function(){var a=b.fd;return M.e?M.e(a):M.call(null,a)}()),function(){var a=b.gd;return u(a)?a:new C(null,"not","not",1044554643,null)}())}Lk=function(b,a,c,d){return new Jk(b,a,c,d)};function Mk(b,a){this.name=b;this.error=a;this.C=0;this.o=2147483648}Mk.prototype.G=function(b,a,c){return Lb(Nk.e?Nk.e(this):Nk.call(null,this),a,c)};
function Ok(b,a){return new Mk(b,a)}function Nk(b){return A(A(A(J,b.name),b.error),new C(null,"named","named",1218138048,null))}Ok=function(b,a){return new Mk(b,a)};function Pk(b,a,c,d){this.error=b;this.A=a;this.n=c;this.r=d;this.o=2229667594;this.C=8192}h=Pk.prototype;h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "error":return this.error;default:return U.h(this.n,a,c)}};
h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.utils.ErrorContainer{",", ","}",c,ge.c(new W(null,1,5,X,[new W(null,2,5,X,[Nj,this.error],null)],null),this.n))};h.I=function(){return this.A};h.T=function(){return new Pk(this.error,this.A,this.n,this.r)};h.O=function(){return 1+R(this.n)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};
h.ma=function(b,a){return pd(new td(null,new t(null,1,[Nj,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new Pk(this.error,this.A,ne(Wc.c(this.n,a)),null)};h.aa=function(b,a,c){return u(Z.c?Z.c(Nj,a):Z.call(null,Nj,a))?new Pk(c,this.A,this.n,null):new Pk(this.error,this.A,Vc.h(this.n,a,c),null)};h.M=function(){return E(ge.c(new W(null,1,5,X,[new W(null,2,5,X,[Nj,this.error],null)],null),this.n))};h.K=function(b,a){return new Pk(this.error,a,this.n,this.r)};
h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};function Qk(b){if(!u(b))throw Error([y("Assert failed: "),y(Ae.j(Q([new C(null,"x","x",-555367584,null)],0)))].join(""));return new Pk(b,null,null,null)}function Rk(b){return b instanceof Pk?b.error:null}function Sk(b){return function(a,c){var d=Rk(c);if(u(d))return Qk(Rc.c(function(){var c=Rk(a);return u(c)?c:b.e?b.e(a):b.call(null,a)}(),d));d=Rk(a);return u(d)?Qk(Rc.c(d,null)):Rc.c(a,c)}}
function Tk(b,a){b.schema$utils$schema=a}function Uk(b){this.q=b}Uk.prototype.be=function(){return this.q};Uk.prototype.Cc=function(b,a){return this.q=a};var Vk=new Uk(!1);Vk.Ea=te.c(function Wk(a){if(a?a.be:a)return a.q;var c;c=Wk[q(null==a?null:a)];if(!c&&(c=Wk._,!c))throw x("PSimpleCell.get_cell",a);return c.call(null,a)},Vk);Vk.Ge=te.c(function Xk(a,c){if(a?a.Cc:a)return a.Cc(0,c);var d;d=Xk[q(null==a?null:a)];if(!d&&(d=Xk._,!d))throw x("PSimpleCell.set_cell",a);return d.call(null,a,c)},Vk);var Yk,Zk={},Ng=function Ng(a){if(a?a.oa:a)return a.oa(a);var c;c=Ng[q(null==a?null:a)];if(!c&&(c=Ng._,!c))throw x("Schema.walker",a);return c.call(null,a)},$k=function $k(a){if(a?a.ga:a)return a.ga(a);var c;c=$k[q(null==a?null:a)];if(!c&&(c=$k._,!c))throw x("Schema.explain",a);return c.call(null,a)};function al(){throw Error([y("Walking is unsupported outside of start-walker; "),y("all composite schemas must eagerly bind subschema-walkers "),y("outside the returned walker.")].join(""));}
function bl(b,a){var c=al;al=b;try{return al.e?al.e(a):al.call(null,a)}finally{al=c}}function cl(b){return se.c(Rk,bl(Mg(),b))}Zk["function"]=!0;
Ng["function"]=function(b){return function(a){return function(c){var d=null==c||Aa(function(){var a=b===c.constructor;return a?a:c instanceof b}())?Qk(Lk(b,c,new Cg(function(){return function(){return A(A(A(J,Ik(c)),b),new C(null,"instance?","instance?",1075939923,null))}}(a),null),null)):null;return u(d)?d:a.e?a.e(c):a.call(null,c)}}(function(){var a=b.schema$utils$schema;return u(a)?al.e?al.e(a):al.call(null,a):Dd}())};$k["function"]=function(b){var a=b.schema$utils$schema;return u(a)?$k(a):b};
function dl(b,a,c,d){this.xa=b;this.A=a;this.n=c;this.r=d;this.o=2229667594;this.C=8192}h=dl.prototype;h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "_":return this.xa;default:return U.h(this.n,a,c)}};h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.AnythingSchema{",", ","}",c,ge.c(new W(null,1,5,X,[new W(null,2,5,X,[Th,this.xa],null)],null),this.n))};h.I=function(){return this.A};
h.T=function(){return new dl(this.xa,this.A,this.n,this.r)};h.O=function(){return 1+R(this.n)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};h.ma=function(b,a){return pd(new td(null,new t(null,1,[Th,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new dl(this.xa,this.A,ne(Wc.c(this.n,a)),null)};
h.aa=function(b,a,c){return u(Z.c?Z.c(Th,a):Z.call(null,Th,a))?new dl(c,this.A,this.n,null):new dl(this.xa,this.A,Vc.h(this.n,a,c),null)};h.M=function(){return E(ge.c(new W(null,1,5,X,[new W(null,2,5,X,[Th,this.xa],null)],null),this.n))};h.K=function(b,a){return new dl(this.xa,a,this.n,this.r)};h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};h.ra=!0;h.oa=function(){return Dd};h.ga=function(){return new C(null,"Any","Any",1277492269,null)};var el=new dl(null,null,null,null);
function fl(b,a,c,d){this.Z=b;this.A=a;this.n=c;this.r=d;this.o=2229667594;this.C=8192}h=fl.prototype;h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "v":return this.Z;default:return U.h(this.n,a,c)}};h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.EqSchema{",", ","}",c,ge.c(new W(null,1,5,X,[new W(null,2,5,X,[qh,this.Z],null)],null),this.n))};h.I=function(){return this.A};
h.T=function(){return new fl(this.Z,this.A,this.n,this.r)};h.O=function(){return 1+R(this.n)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};h.ma=function(b,a){return pd(new td(null,new t(null,1,[qh,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new fl(this.Z,this.A,ne(Wc.c(this.n,a)),null)};
h.aa=function(b,a,c){return u(Z.c?Z.c(qh,a):Z.call(null,qh,a))?new fl(c,this.A,this.n,null):new fl(this.Z,this.A,Vc.h(this.n,a,c),null)};h.M=function(){return E(ge.c(new W(null,1,5,X,[new W(null,2,5,X,[qh,this.Z],null)],null),this.n))};h.K=function(b,a){return new fl(this.Z,a,this.n,this.r)};h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};h.ra=!0;
h.oa=function(){var b=this;return function(a){return function(c){return L.c(b.Z,c)?c:Qk(Lk(a,c,new Cg(function(){return function(){return A(A(A(J,Ik(c)),b.Z),new C(null,"\x3d","\x3d",-1501502141,null))}}(a),null),null))}}(this)};h.ga=function(){return A(A(J,this.Z),new C(null,"eq","eq",1021992460,null))};function gl(b,a,c,d,e){this.qa=b;this.Ha=a;this.A=c;this.n=d;this.r=e;this.o=2229667594;this.C=8192}h=gl.prototype;h.H=function(b,a){return $a.h(this,a,null)};
h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "pred-name":return this.Ha;case "p?":return this.qa;default:return U.h(this.n,a,c)}};h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.Predicate{",", ","}",c,ge.c(new W(null,2,5,X,[new W(null,2,5,X,[fk,this.qa],null),new W(null,2,5,X,[wj,this.Ha],null)],null),this.n))};h.I=function(){return this.A};h.T=function(){return new gl(this.qa,this.Ha,this.A,this.n,this.r)};
h.O=function(){return 2+R(this.n)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};h.ma=function(b,a){return pd(new td(null,new t(null,2,[wj,null,fk,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new gl(this.qa,this.Ha,this.A,ne(Wc.c(this.n,a)),null)};
h.aa=function(b,a,c){return u(Z.c?Z.c(fk,a):Z.call(null,fk,a))?new gl(c,this.Ha,this.A,this.n,null):u(Z.c?Z.c(wj,a):Z.call(null,wj,a))?new gl(this.qa,c,this.A,this.n,null):new gl(this.qa,this.Ha,this.A,Vc.h(this.n,a,c),null)};h.M=function(){return E(ge.c(new W(null,2,5,X,[new W(null,2,5,X,[fk,this.qa],null),new W(null,2,5,X,[wj,this.Ha],null)],null),this.n))};h.K=function(b,a){return new gl(this.qa,this.Ha,a,this.n,this.r)};h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};
h.ra=!0;h.oa=function(){var b=this;return function(a){return function(c){var d;try{d=u(b.qa.e?b.qa.e(c):b.qa.call(null,c))?null:new C(null,"not","not",1044554643,null)}catch(e){if(e instanceof Object)d=new C(null,"throws?","throws?",789734533,null);else throw e;}return u(d)?Qk(Lk(a,c,new Cg(function(){return function(){return A(A(J,Ik(c)),b.Ha)}}(d,d,a),null),d)):c}}(this)};
h.ga=function(){return L.c(this.qa,od)?new C(null,"Int","Int",-2116888740,null):L.c(this.qa,Sd)?new C(null,"Keyword","Keyword",-850065993,null):L.c(this.qa,sc)?new C(null,"Symbol","Symbol",716452869,null):L.c(this.qa,Ba)?new C(null,"Str","Str",907970895,null):A(A(J,this.Ha),new C(null,"pred","pred",-727012372,null))};
var hl=function(){function b(a,b){if(!nd(a))throw Error(Hk.j("Not a function: %s",Q([a],0)));return new gl(a,b,null,null,null)}function a(a){return c.c(a,a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}();function il(b,a,c,d){this.p=b;this.A=a;this.n=c;this.r=d;this.o=2229667594;this.C=8192}h=il.prototype;h.H=function(b,a){return $a.h(this,a,null)};
h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "p":return this.p;default:return U.h(this.n,a,c)}};h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.Protocol{",", ","}",c,ge.c(new W(null,1,5,X,[new W(null,2,5,X,[kk,this.p],null)],null),this.n))};h.I=function(){return this.A};h.T=function(){return new il(this.p,this.A,this.n,this.r)};h.O=function(){return 1+R(this.n)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};
h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};h.ma=function(b,a){return pd(new td(null,new t(null,1,[kk,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new il(this.p,this.A,ne(Wc.c(this.n,a)),null)};h.aa=function(b,a,c){return u(Z.c?Z.c(kk,a):Z.call(null,kk,a))?new il(c,this.A,this.n,null):new il(this.p,this.A,Vc.h(this.n,a,c),null)};h.M=function(){return E(ge.c(new W(null,1,5,X,[new W(null,2,5,X,[kk,this.p],null)],null),this.n))};
h.K=function(b,a){return new il(this.p,a,this.n,this.r)};h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};h.ra=!0;h.oa=function(){return function(b){return function(a){return u(ik.e(Zc(b)).call(null,a))?a:Qk(Lk(b,a,new Cg(function(b){return function(){return A(A(A(J,Ik(a)),gi.e(Zc(b))),new C(null,"satisfies?","satisfies?",-433227199,null))}}(b),null),null))}}(this)};h.ga=function(){return A(A(J,gi.e(Zc(this))),new C(null,"protocol","protocol",-2001965651,null))};
RegExp.prototype.ra=!0;RegExp.prototype.oa=function(){return function(b){return function(a){return"string"!==typeof a?Qk(Lk(b,a,new Cg(function(){return function(){return A(A(J,Ik(a)),new C(null,"string?","string?",-1129175764,null))}}(b),null),null)):Aa(og(b,a))?Qk(Lk(b,a,new Cg(function(b){return function(){return A(A(A(J,Ik(a)),$k(b)),new C(null,"re-find","re-find",1143444147,null))}}(b),null),null)):a}}(this)};RegExp.prototype.ga=function(){return uc.e([y('#"'),y((""+y(this)).slice(1,-1)),y('"')].join(""))};
hl.e(Ba);var jl=Boolean;hl.c(od,new C(null,"integer?","integer?",1303791671,null));var kl=hl.c(Sd,new C(null,"keyword?","keyword?",1917797069,null));hl.c(sc,new C(null,"symbol?","symbol?",1820680511,null));
"undefined"===typeof Yk&&(Yk=function(b){this.ud=b;this.C=0;this.o=393216},h=Yk.prototype,h.ra=!0,h.oa=function(){return function(b){return function(a){return a instanceof RegExp?a:Qk(Lk(b,a,new Cg(function(){return function(){return A(A(A(J,Ik(a)),new C("js","RegExp","js/RegExp",1778210562,null)),new C(null,"instance?","instance?",1075939923,null))}}(b),null),null))}}(this)},h.ga=function(){return new C(null,"Regex","Regex",205914413,null)},h.I=function(){return this.ud},h.K=function(b,a){return new Yk(a)},
Yk.kb=!0,Yk.jb="schema.core/t52633",Yk.xb=function(b,a){return Jb(a,"schema.core/t52633")});function ll(b,a,c,d){this.V=b;this.A=a;this.n=c;this.r=d;this.o=2229667594;this.C=8192}h=ll.prototype;h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "schema":return this.V;default:return U.h(this.n,a,c)}};
h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.Maybe{",", ","}",c,ge.c(new W(null,1,5,X,[new W(null,2,5,X,[$g,this.V],null)],null),this.n))};h.I=function(){return this.A};h.T=function(){return new ll(this.V,this.A,this.n,this.r)};h.O=function(){return 1+R(this.n)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};
h.ma=function(b,a){return pd(new td(null,new t(null,1,[$g,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new ll(this.V,this.A,ne(Wc.c(this.n,a)),null)};h.aa=function(b,a,c){return u(Z.c?Z.c($g,a):Z.call(null,$g,a))?new ll(c,this.A,this.n,null):new ll(this.V,this.A,Vc.h(this.n,a,c),null)};h.M=function(){return E(ge.c(new W(null,1,5,X,[new W(null,2,5,X,[$g,this.V],null)],null),this.n))};h.K=function(b,a){return new ll(this.V,a,this.n,this.r)};
h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};h.ra=!0;h.oa=function(){return function(b){return function(a){return null==a?null:b.e?b.e(a):b.call(null,a)}}(al.e?al.e(this.V):al.call(null,this.V),this)};h.ga=function(){return A(A(J,$k(this.V)),new C(null,"maybe","maybe",1326133967,null))};function ml(b,a,c,d){this.ea=b;this.A=a;this.n=c;this.r=d;this.o=2229667594;this.C=8192}h=ml.prototype;h.H=function(b,a){return $a.h(this,a,null)};
h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "schemas":return this.ea;default:return U.h(this.n,a,c)}};h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.Either{",", ","}",c,ge.c(new W(null,1,5,X,[new W(null,2,5,X,[hj,this.ea],null)],null),this.n))};h.I=function(){return this.A};h.T=function(){return new ml(this.ea,this.A,this.n,this.r)};h.O=function(){return 1+R(this.n)};
h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};h.ma=function(b,a){return pd(new td(null,new t(null,1,[hj,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new ml(this.ea,this.A,ne(Wc.c(this.n,a)),null)};h.aa=function(b,a,c){return u(Z.c?Z.c(hj,a):Z.call(null,hj,a))?new ml(c,this.A,this.n,null):new ml(this.ea,this.A,Vc.h(this.n,a,c),null)};
h.M=function(){return E(ge.c(new W(null,1,5,X,[new W(null,2,5,X,[hj,this.ea],null)],null),this.n))};h.K=function(b,a){return new ml(this.ea,a,this.n,this.r)};h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};h.ra=!0;
h.oa=function(){return function(b,a){return function(c){for(var d=E(b);;){if(Aa(d))return Qk(Lk(a,c,new Cg(function(){return function(){return A(A(A(J,new C(null,"schemas","schemas",-2079365190,null)),A(A(A(J,Ik(c)),new C(null,"%","%",-950237169,null)),new C(null,"check","check",-1428126865,null))),new C(null,"some","some",-310548046,null))}}(d,b,a),null),null));var e=G(d).call(null,c);if(e instanceof Pk)d=K(d);else return e}}}(Se.c(al,this.ea),this)};
h.ga=function(){return O(new C(null,"either","either",-2144373018,null),De.c($k,this.ea))};var nl=function(){function b(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return a.call(this,d)}function a(a){return new ml(a,null,null,null)}b.v=0;b.l=function(b){b=E(b);return a(b)};b.j=a;return b}();function ol(b,a,c,d){this.ea=b;this.A=a;this.n=c;this.r=d;this.o=2229667594;this.C=8192}h=ol.prototype;
h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "schemas":return this.ea;default:return U.h(this.n,a,c)}};h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.Both{",", ","}",c,ge.c(new W(null,1,5,X,[new W(null,2,5,X,[hj,this.ea],null)],null),this.n))};h.I=function(){return this.A};h.T=function(){return new ol(this.ea,this.A,this.n,this.r)};h.O=function(){return 1+R(this.n)};
h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};h.ma=function(b,a){return pd(new td(null,new t(null,1,[hj,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new ol(this.ea,this.A,ne(Wc.c(this.n,a)),null)};h.aa=function(b,a,c){return u(Z.c?Z.c(hj,a):Z.call(null,hj,a))?new ol(c,this.A,this.n,null):new ol(this.ea,this.A,Vc.h(this.n,a,c),null)};
h.M=function(){return E(ge.c(new W(null,1,5,X,[new W(null,2,5,X,[hj,this.ea],null)],null),this.n))};h.K=function(b,a){return new ol(this.ea,a,this.n,this.r)};h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};h.ra=!0;h.oa=function(){return function(b,a){return function(c){return Ka.h(function(){return function(a,b){return a instanceof Pk?a:b.e?b.e(a):b.call(null,a)}}(b,a),c,b)}}(Se.c(al,this.ea),this)};
h.ga=function(){return O(new C(null,"both","both",1246882687,null),De.c($k,this.ea))};var pl=function(){function b(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return a.call(this,d)}function a(a){return new ol(a,null,null,null)}b.v=0;b.l=function(b){b=E(b);return a(b)};b.j=a;return b}();function ql(b){return b instanceof Y||!1}function rl(b,a,c,d){this.ab=b;this.A=a;this.n=c;this.r=d;this.o=2229667594;this.C=8192}h=rl.prototype;
h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "k":return this.ab;default:return U.h(this.n,a,c)}};h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.OptionalKey{",", ","}",c,ge.c(new W(null,1,5,X,[new W(null,2,5,X,[Ri,this.ab],null)],null),this.n))};h.I=function(){return this.A};h.T=function(){return new rl(this.ab,this.A,this.n,this.r)};h.O=function(){return 1+R(this.n)};
h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};h.ma=function(b,a){return pd(new td(null,new t(null,1,[Ri,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new rl(this.ab,this.A,ne(Wc.c(this.n,a)),null)};h.aa=function(b,a,c){return u(Z.c?Z.c(Ri,a):Z.call(null,Ri,a))?new rl(c,this.A,this.n,null):new rl(this.ab,this.A,Vc.h(this.n,a,c),null)};
h.M=function(){return E(ge.c(new W(null,1,5,X,[new W(null,2,5,X,[Ri,this.ab],null)],null),this.n))};h.K=function(b,a){return new rl(this.ab,a,this.n,this.r)};h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};function sl(b){return new rl(b,null,null,null)}function tl(b){return b instanceof rl}function ul(b){if(b instanceof Y)return b;if(tl(b))return b.ab;throw Error(Hk.j("Bad explicit key: %s",Q([b],0)));}function vl(b){return ql(b)||tl(b)}
function wl(b){return vl(b)?b instanceof Y?b:A(A(J,ul(b)),ql(b)?new C(null,"required-key","required-key",1624616412,null):tl(b)?new C(null,"optional-key","optional-key",988406145,null):null):$k(b)}function xl(b,a,c,d,e){this.sa=b;this.Ca=a;this.A=c;this.n=d;this.r=e;this.o=2229667594;this.C=8192}h=xl.prototype;h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "val-schema":return this.Ca;case "kspec":return this.sa;default:return U.h(this.n,a,c)}};
h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.MapEntry{",", ","}",c,ge.c(new W(null,2,5,X,[new W(null,2,5,X,[Uh,this.sa],null),new W(null,2,5,X,[Ai,this.Ca],null)],null),this.n))};h.I=function(){return this.A};h.T=function(){return new xl(this.sa,this.Ca,this.A,this.n,this.r)};h.O=function(){return 2+R(this.n)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};
h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};h.ma=function(b,a){return pd(new td(null,new t(null,2,[Uh,null,Ai,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new xl(this.sa,this.Ca,this.A,ne(Wc.c(this.n,a)),null)};h.aa=function(b,a,c){return u(Z.c?Z.c(Uh,a):Z.call(null,Uh,a))?new xl(c,this.Ca,this.A,this.n,null):u(Z.c?Z.c(Ai,a):Z.call(null,Ai,a))?new xl(this.sa,c,this.A,this.n,null):new xl(this.sa,this.Ca,this.A,Vc.h(this.n,a,c),null)};
h.M=function(){return E(ge.c(new W(null,2,5,X,[new W(null,2,5,X,[Uh,this.sa],null),new W(null,2,5,X,[Ai,this.Ca],null)],null),this.n))};h.K=function(b,a){return new xl(this.sa,this.Ca,a,this.n,this.r)};h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};h.ra=!0;
h.oa=function(){var b=al.e?al.e(this.Ca):al.call(null,this.Ca);if(vl(this.sa)){var a=tl(this.sa),c=ul(this.sa);return function(a,b,c,g){return function(k){if(Di===k)return a?null:Qk(new W(null,2,5,X,[b,new C(null,"missing-required-key","missing-required-key",709961446,null)],null));if(L.c(2,R(k))){var l=S.h(k,0,null),m=S.h(k,1,null);if(!L.c(l,b))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"\x3d","\x3d",-1501502141,null),new C(null,"xk","xk",741114825,null),new C(null,"k","k",-505765866,
null))],0)))].join(""));var m=c.e?c.e(m):c.call(null,m),n=Rk(m);return u(n)?Qk(new W(null,2,5,X,[l,n],null)):new W(null,2,5,X,[l,m],null)}return Qk(Lk(g,k,new Cg(function(){return function(){return A(A(A(J,A(A(J,Ik(k)),new C(null,"count","count",-514511684,null))),2),L)}}(a,b,c,g),null),null))}}(a,c,b,this)}return function(a,b,c){return function(g){if(L.c(2,R(g))){var k=function(){var b=ib(g);return a.e?a.e(b):a.call(null,b)}(),l=Rk(k),m=function(){var a=jb(g);return b.e?b.e(a):b.call(null,a)}(),
n=Rk(m);return u(u(l)?l:n)?Qk(new W(null,2,5,X,[u(l)?l:ib(g),u(n)?n:new C(null,"invalid-key","invalid-key",-1461682245,null)],null)):new W(null,2,5,X,[k,m],null)}return Qk(Lk(c,g,new Cg(function(){return function(){return A(A(A(J,A(A(J,Ik(g)),new C(null,"count","count",-514511684,null))),2),L)}}(a,b,c),null),null))}}(al.e?al.e(this.sa):al.call(null,this.sa),b,this)};h.ga=function(){return A(A(A(J,$k(this.Ca)),wl(this.sa)),new C(null,"map-entry","map-entry",329617471,null))};
function yl(b,a){return new xl(b,a,null,null,null)}function zl(b){b=Oe.c(vl,Af(b));if(!(2>R(b)))throw Error(Hk.j("More than one non-optional/required key schemata: %s",Q([kf(b)],0)));return G(b)}function Al(b,a){return(b?b.o&67108864||b.me||(b.o?0:v(Fb,b)):v(Fb,b))&&!(a instanceof Pk)?Re.c(b,a):a}
function Bl(b){var a=zl(b),c=u(a)?al.e?al.e(V.c(yl,qd(b,a))):al.call(null,V.c(yl,qd(b,a))):null,d=Wc.c(b,a),e=Re.c(sd,function(){return function(a,b,c){return function n(d){return new Vd(null,function(){return function(){for(;;){var a=E(d);if(a){if(gd(a)){var b=Wb(a),c=R(b),e=Zd(c);a:for(var f=0;;)if(f<c){var g=B.c(b,f),k=S.h(g,0,null),g=S.h(g,1,null),k=new W(null,2,5,X,[ul(k),al.e?al.e(yl(k,g)):al.call(null,yl(k,g))],null);e.add(k);f+=1}else{b=!0;break a}return b?ce(e.P(),n(Xb(a))):ce(e.P(),null)}b=
G(a);e=S.h(b,0,null);b=S.h(b,1,null);return O(new W(null,2,5,X,[ul(e),al.e?al.e(yl(e,b)):al.call(null,yl(e,b))],null),n(I(a)))}return null}}}(a,b,c),null,null)}}(a,c,d)(d)}()),f=Sk(re());if(!L.c(R(d),R(e)))throw Error(Hk.j("Schema has multiple variants of the same explicit key: %s",Q([Se.c(wl,V.c(ge,Ne.c(function(){return function(a){return 1<R(a)}}(a,c,d,e,f),Bf(Og(ul,Af(d))))))],0)));return function(a,c,d,e,f){return function(p){return ed(p)?Al(p,function(){for(var b=vd,w=E(e),z=sd;;){if(Aa(w))return Ka.h(u(c)?
function(a,b,c,d,e,f,g,k){return function(a,b){var c=e.e?e.e(b):e.call(null,b);return k.c?k.c(a,c):k.call(null,a,c)}}(b,w,z,a,c,d,e,f):function(a,b,c,d,e,f,g,k){return function(a,b){var c=S.h(b,0,null);S.h(b,1,null);c=Qk(new W(null,2,5,X,[c,new C(null,"disallowed-key","disallowed-key",-1877785633,null)],null));return k.c?k.c(a,c):k.call(null,a,c)}}(b,w,z,a,c,d,e,f),z,Oe.c(function(a){return function(b){var c=S.h(b,0,null);S.h(b,1,null);return a.e?a.e(c):a.call(null,c)}}(b,w,z,a,c,d,e,f),p));var D=
G(w),H=S.h(D,0,null),P=S.h(D,1,null),b=Rc.c(b,H),w=K(w),z=D=function(){var a=z,b;b=qd(p,H);b=u(b)?b:Di;b=P.e?P.e(b):P.call(null,b);return f.c?f.c(a,b):f.call(null,a,b)}()}}()):Qk(Lk(b,p,new Cg(function(){return function(){return A(A(J,Ik(p)),new C(null,"map?","map?",-1780568534,null))}}(a,c,d,e,f),null),null))}}(a,c,d,e,f)}
function Cl(b){return Re.c(sd,function(){return function c(b){return new Vd(null,function(){for(;;){var e=E(b);if(e){if(gd(e)){var f=Wb(e),g=R(f),k=Zd(g);a:for(var l=0;;)if(l<g){var m=B.c(f,l),n=S.h(m,0,null),m=S.h(m,1,null),n=kf(K(yl(n,m).ga(null)));k.add(n);l+=1}else{f=!0;break a}return f?ce(k.P(),c(Xb(e))):ce(k.P(),null)}f=G(e);k=S.h(f,0,null);f=S.h(f,1,null);return O(kf(K(yl(k,f).ga(null))),c(I(e)))}return null}},null,null)}(b)}())}Xf.prototype.ra=!0;Xf.prototype.oa=function(){return Bl(this)};
Xf.prototype.ga=function(){return Cl(this)};t.prototype.ra=!0;t.prototype.oa=function(){return Bl(this)};t.prototype.ga=function(){return Cl(this)};td.prototype.ra=!0;
td.prototype.oa=function(){if(!L.c(R(this),1))throw Error(Hk("Set schema must have exactly one element"));return function(b,a){return function(c){var d=cd(c)?null:Qk(Lk(a,c,new Cg(function(){return function(){return A(A(J,Ik(c)),new C(null,"set?","set?",1636014792,null))}}(b,a),null),null));if(u(d))return d;var e=lg.c(Oe,ue).call(null,Rk,De.c(b,c)),d=S.h(e,0,null),e=S.h(e,1,null);return E(e)?Qk(fg(e)):fg(d)}}(al.e?al.e(G(this)):al.call(null,G(this)),this)};
td.prototype.ga=function(){return fg(new W(null,1,5,X,[$k(G(this))],null))};function Dl(b,a,c,d,e,f){this.V=b;this.ua=a;this.name=c;this.A=d;this.n=e;this.r=f;this.o=2229667594;this.C=8192}h=Dl.prototype;h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "name":return this.name;case "optional?":return this.ua;case "schema":return this.V;default:return U.h(this.n,a,c)}};
h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.One{",", ","}",c,ge.c(new W(null,3,5,X,[new W(null,2,5,X,[$g,this.V],null),new W(null,2,5,X,[Vi,this.ua],null),new W(null,2,5,X,[Wh,this.name],null)],null),this.n))};h.I=function(){return this.A};h.T=function(){return new Dl(this.V,this.ua,this.name,this.A,this.n,this.r)};h.O=function(){return 3+R(this.n)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};
h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};h.ma=function(b,a){return pd(new td(null,new t(null,3,[$g,null,Wh,null,Vi,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new Dl(this.V,this.ua,this.name,this.A,ne(Wc.c(this.n,a)),null)};
h.aa=function(b,a,c){return u(Z.c?Z.c($g,a):Z.call(null,$g,a))?new Dl(c,this.ua,this.name,this.A,this.n,null):u(Z.c?Z.c(Vi,a):Z.call(null,Vi,a))?new Dl(this.V,c,this.name,this.A,this.n,null):u(Z.c?Z.c(Wh,a):Z.call(null,Wh,a))?new Dl(this.V,this.ua,c,this.A,this.n,null):new Dl(this.V,this.ua,this.name,this.A,Vc.h(this.n,a,c),null)};h.M=function(){return E(ge.c(new W(null,3,5,X,[new W(null,2,5,X,[$g,this.V],null),new W(null,2,5,X,[Vi,this.ua],null),new W(null,2,5,X,[Wh,this.name],null)],null),this.n))};
h.K=function(b,a){return new Dl(this.V,this.ua,this.name,a,this.n,this.r)};h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};function El(b,a){return new Dl(b,!1,a,null,null,null)}
function Fl(b){var a=kg(function(a){return a instanceof Dl&&Aa(Vi.e(a))},b),c=S.h(a,0,null),d=S.h(a,1,null),e=kg(function(){return function(a){var b=a instanceof Dl;return b?Vi.e(a):b}}(a,c,d),d),f=S.h(e,0,null),g=S.h(e,1,null);if(!(1>=R(g)&&oe(function(){return function(a){return!(a instanceof Dl)}}(a,c,d,e,f,g),g)))throw Error(Hk.j("Sequence schema %s does not match [one* optional* rest-schema?]",Q([b],0)));return new W(null,2,5,X,[ge.c(c,f),G(g)],null)}W.prototype.ra=!0;
W.prototype.oa=function(){var b=this,a=Fl(b),c=S.h(a,0,null),d=S.h(a,1,null),e=kf(function(){return function(a,b,c,d){return function p(e){return new Vd(null,function(){return function(){for(;;){var a=E(e);if(a){if(gd(a)){var b=Wb(a),c=R(b),d=Zd(c);a:for(var f=0;;)if(f<c){var g=B.c(b,f),g=new W(null,2,5,X,[g,al.e?al.e(g.V):al.call(null,g.V)],null);d.add(g);f+=1}else{b=!0;break a}return b?ce(d.P(),p(Xb(a))):ce(d.P(),null)}d=G(a);return O(new W(null,2,5,X,[d,al.e?al.e(d.V):al.call(null,d.V)],null),
p(I(a)))}return null}}}(a,b,c,d),null,null)}}(a,c,d,b)(c)}()),f=u(d)?al.e?al.e(d):al.call(null,d):null;return function(a,b,c,d,e,f,r){return function(w){var z=null==w||dd(w)?null:Qk(Lk(r,w,new Cg(function(){return function(){return A(A(J,Ik(w)),new C(null,"sequential?","sequential?",1102351463,null))}}(a,b,c,d,e,f,r),null),null));if(u(z))return z;for(var D=d,H=w,P=Qc;;){var N=G(D);if(u(N)){var ra=N,Ja=S.h(ra,0,null),eb=S.h(ra,1,null);if(ad(H)){if(u(Ja.ua))return P;var T=P,z=Qk(Lk(kf(De.c(G,D)),null,
new Cg(function(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D){return function(){return he.c(new C(null,"present?","present?",-1810613791,null),function(){return function(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D){return function pk(H){return new Vd(null,function(){return function(){for(;;){var a=E(H);if(a){if(gd(a)){var b=Wb(a),c=R(b),d=Zd(c);a:for(var e=0;;)if(e<c){var f=B.c(b,e),f=S.h(f,0,null);if(Aa(f.ua))d.add(f.name),e+=1;else{b=null;break a}}else{b=!0;break a}return b?ce(d.P(),pk(Xb(a))):ce(d.P(),null)}d=G(a);d=S.h(d,
0,null);return Aa(d.ua)?O(d.name,pk(I(a))):null}return null}}}(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D),null,null)}}(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D)(a)}())}}(D,H,P,T,ra,Ja,eb,N,z,a,b,c,d,e,f,r),null),null));return f.c?f.c(T,z):f.call(null,T,z)}D=K(D);N=I(H);T=function(){var a=P,b=Ja.name,c=G(H),c=eb.e?eb.e(c):eb.call(null,c),d=Rk(c),b=u(d)?Qk(Ok(b,d)):c;return f.c?f.c(a,b):f.call(null,a,b)}();H=N;P=T}else return u(c)?Ka.h(f,P,De.c(e,H)):E(H)?(T=P,z=Qk(Lk(null,H,new Cg(function(a,b){return function(){return A(A(J,
R(b)),new C(null,"has-extra-elts?","has-extra-elts?",-1376562869,null))}}(D,H,P,T,N,z,a,b,c,d,e,f,r),null),null)),f.c?f.c(T,z):f.call(null,T,z)):P}}}(a,c,d,e,f,Sk(function(){return function(a){return kf(Ie.c(R(a),null))}}(a,c,d,e,f,b)),b)};
W.prototype.ga=function(){var b=this,a=Fl(b),c=S.h(a,0,null),d=S.h(a,1,null);return kf(ge.c(function(){return function(a,b,c,d){return function m(n){return new Vd(null,function(){return function(){for(;;){var a=E(n);if(a){if(gd(a)){var b=Wb(a),c=R(b),d=Zd(c);a:for(var e=0;;)if(e<c){var f=B.c(b,e),f=A(A(A(J,Wh.e(f)),$k($g.e(f))),u(f.ua)?new C(null,"optional","optional",-600484260,null):new C(null,"one","one",-1719427865,null));d.add(f);e+=1}else{b=!0;break a}return b?ce(d.P(),m(Xb(a))):ce(d.P(),null)}d=
G(a);return O(A(A(A(J,Wh.e(d)),$k($g.e(d))),u(d.ua)?new C(null,"optional","optional",-600484260,null):new C(null,"one","one",-1719427865,null)),m(I(a)))}return null}}}(a,b,c,d),null,null)}}(a,c,d,b)(c)}(),u(d)?new W(null,1,5,X,[$k(d)],null):null))};
function Gl(b){b=kg(function(a){return a instanceof Dl},b);var a=S.h(b,0,null),c=S.h(b,1,null);return ge.c(De.c(function(){return function(a){return $k(a.V)}}(b,a,c),a),E(c)?new W(null,2,5,X,[new C(null,"\x26","\x26",-2144855648,null),Se.c($k,c)],null):null)}function Hl(b,a,c,d,e){this.Ga=b;this.Aa=a;this.A=c;this.n=d;this.r=e;this.o=2229667594;this.C=8192}h=Hl.prototype;h.H=function(b,a){return $a.h(this,a,null)};
h.F=function(b,a,c){switch(a instanceof Y?a.X:null){case "input-schemas":return this.Aa;case "output-schema":return this.Ga;default:return U.h(this.n,a,c)}};h.G=function(b,a,c){return pg(a,function(){return function(b){return pg(a,vg,""," ","",c,b)}}(this),"#schema.core.FnSchema{",", ","}",c,ge.c(new W(null,2,5,X,[new W(null,2,5,X,[ai,this.Ga],null),new W(null,2,5,X,[ki,this.Aa],null)],null),this.n))};h.I=function(){return this.A};h.T=function(){return new Hl(this.Ga,this.Aa,this.A,this.n,this.r)};
h.O=function(){return 2+R(this.n)};h.L=function(){var b=this.r;return null!=b?b:this.r=b=Jd(this)};h.D=function(b,a){return u(u(a)?this.constructor===a.constructor&&tf(this,a):a)?!0:!1};h.ma=function(b,a){return pd(new td(null,new t(null,2,[ai,null,ki,null],null),null),a)?Wc.c(Nc(Re.c(sd,this),this.A),a):new Hl(this.Ga,this.Aa,this.A,ne(Wc.c(this.n,a)),null)};
h.aa=function(b,a,c){return u(Z.c?Z.c(ai,a):Z.call(null,ai,a))?new Hl(c,this.Aa,this.A,this.n,null):u(Z.c?Z.c(ki,a):Z.call(null,ki,a))?new Hl(this.Ga,c,this.A,this.n,null):new Hl(this.Ga,this.Aa,this.A,Vc.h(this.n,a,c),null)};h.M=function(){return E(ge.c(new W(null,2,5,X,[new W(null,2,5,X,[ai,this.Ga],null),new W(null,2,5,X,[ki,this.Aa],null)],null),this.n))};h.K=function(b,a){return new Hl(this.Ga,this.Aa,a,this.n,this.r)};h.N=function(b,a){return fd(a)?db(this,B.c(a,0),B.c(a,1)):Ka.h(A,this,a)};
h.ra=!0;h.oa=function(){return function(b){return function(a){return nd(a)?a:Qk(Lk(b,a,new Cg(function(){return function(){return A(A(J,Ik(a)),new C(null,"ifn?","ifn?",-2106461064,null))}}(b),null),null))}}(this)};h.ga=function(){return 1<R(this.Aa)?he.h(new C(null,"\x3d\x3e*","\x3d\x3e*",1909690043,null),$k(this.Ga),De.c(Gl,this.Aa)):he.h(new C(null,"\x3d\x3e","\x3d\x3e",-813269641,null),$k(this.Ga),Gl(G(this.Aa)))};
function Il(b){if(E(b)){var a;a:for(a=b;;){var c=K(a);if(null!=c)a=c;else{a=G(a);break a}}b=a instanceof Dl?R(b):Number.MAX_VALUE}else b=0;return b}function Jl(b,a){if(!E(a))throw Error(Hk("Function must have at least one input schema"));if(!oe(fd,a))throw Error(Hk("Each arity must be a vector."));if(!u(V.c(wd,De.c(Il,a))))throw Error(Hk("Arities must be distinct"));return new Hl(b,Cd.c(Il,a),null,null,null)};var Kl=Nc(new il(Zk,null,null,null),new t(null,2,[gi,new C("s","Schema","s/Schema",-1305723789,null),ik,function(b){return b?u(u(null)?null:b.ra)?!0:b.R?!1:v(Zk,b):v(Zk,b)}],null)),Ll=new Ef([nl.j(Q([new fl(kl,null,null,null),rl,kl],0)),Kl]),Ml=new W(null,2,5,X,[El(Ll,new C(null,"input","input",-2097503808,null)),El(Kl,new C(null,"output","output",534662484,null))],null),Nl=new Ef([nl.j(Q([rl,kl],0)),Kl]),Ol=new Ef([kl,Kl]),Pl=new W(null,2,5,X,[El(Nl,new C(null,"input","input",-2097503808,null)),
El(Ol,new C(null,"output","output",534662484,null))],null);function Ql(b){return b instanceof t||b instanceof Xf}var Rl;Rl=new ll(new W(null,2,5,X,[El(kl,"k"),El(jl,"optional?")],null),null,null,null);
var Sl=new W(null,1,5,X,[El(el,new C(null,"k","k",-505765866,null))],null),Tl=cl(Sl),Ul=cl(Rl),Vl=function(b,a,c,d,e){return function(f){var g=b.Ea();if(u(g)){var k=new W(null,1,5,X,[f],null),l=d.e?d.e(k):d.call(null,k);if(u(l))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"unwrap-schema-form-key","unwrap-schema-form-key",-300088791,null),Ae.j(Q([l],0))],0)),new t(null,4,[Nj,l,di,k,$g,c,ui,yh],null));}a:for(;;){f=vl(f)?new W(null,2,5,X,[ul(f),ql(f)],null):dd(f)&&!fd(f)&&L.c(R(f),
2)&&L.c(G(f),new C("schema.core","optional-key","schema.core/optional-key",-170069547,null))?new W(null,2,5,X,[Pc(f),!1],null):null;break a}if(u(g)&&(g=e.e?e.e(f):e.call(null,f),u(g)))throw Qg.c(Hk.j("Output of %s does not match schema: %s",Q([new C(null,"unwrap-schema-form-key","unwrap-schema-form-key",-300088791,null),Ae.j(Q([g],0))],0)),new t(null,4,[Nj,g,di,f,$g,a,ui,yh],null));return f}}(Vk,Rl,Sl,Tl,Ul);Tk(Vl,Jl(Rl,new W(null,1,5,X,[Sl],null)));
var Wl=new Ef([kl,jl]),Xl=new W(null,1,5,X,[El(el,new C(null,"s","s",-948495851,null))],null),Yl=cl(Xl),Zl=cl(Wl);
Tk(function(b,a,c,d,e){return function(f){var g=b.Ea();if(u(g)){var k=new W(null,1,5,X,[f],null),l=d.e?d.e(k):d.call(null,k);if(u(l))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"explicit-schema-key-map","explicit-schema-key-map",1668953963,null),Ae.j(Q([l],0))],0)),new t(null,4,[Nj,l,di,k,$g,c,ui,yh],null));}a:for(;;){f=Re.c(sd,ue.c(Vl,Af(f)));break a}if(u(g)&&(g=e.e?e.e(f):e.call(null,f),u(g)))throw Qg.c(Hk.j("Output of %s does not match schema: %s",Q([new C(null,"explicit-schema-key-map",
"explicit-schema-key-map",1668953963,null),Ae.j(Q([g],0))],0)),new t(null,4,[Nj,g,di,f,$g,a,ui,yh],null));return f}}(Vk,Wl,Xl,Yl,Zl),Jl(Wl,new W(null,1,5,X,[Xl],null)));var $l=new W(null,2,5,X,[El(new W(null,1,5,X,[kl],null),new C(null,"required","required",-846788763,null)),El(new W(null,1,5,X,[kl],null),new C(null,"optional","optional",-600484260,null))],null),am=new W(null,1,5,X,[El(new Ef([kl,jl]),new C(null,"s","s",-948495851,null))],null),bm=cl(am),cm=cl($l);
Tk(function(b,a,c,d,e){return function(f){var g=b.Ea();if(u(g)){var k=new W(null,1,5,X,[f],null),l=d.e?d.e(k):d.call(null,k);if(u(l))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"split-schema-keys","split-schema-keys",933671594,null),Ae.j(Q([l],0))],0)),new t(null,4,[Nj,l,di,k,$g,c,ui,yh],null));}a:for(;;){f=Se.c(te.c(Se,Kd),lg.c(Ne,Oe).call(null,Ld,f));break a}if(u(g)&&(g=e.e?e.e(f):e.call(null,f),u(g)))throw Qg.c(Hk.j("Output of %s does not match schema: %s",Q([new C(null,
"split-schema-keys","split-schema-keys",933671594,null),Ae.j(Q([g],0))],0)),new t(null,4,[Nj,g,di,f,$g,a,ui,yh],null));return f}}(Vk,$l,am,bm,cm),Jl($l,new W(null,1,5,X,[am],null)));
var dm=function(){function b(b,d,e,f){var g=null;if(3<arguments.length){for(var g=0,k=Array(arguments.length-3);g<k.length;)k[g]=arguments[g+3],++g;g=new F(k,0)}return a.call(this,b,d,e,g)}function a(a,b,e,f){return Re.c(sd,Bf(Ka.h(function(f,k){var l=S.h(k,0,null),m=S.h(k,1,null),n=a.e?a.e(l):a.call(null,l),p=U.c(f,n);if(u(p)){var r=S.h(p,0,null),p=S.h(p,1,null);return Vc.h(f,n,new W(null,2,5,X,[b.c?b.c(r,l):b.call(null,r,l),e.c?e.c(p,m):e.call(null,p,m)],null))}return Vc.h(f,n,new W(null,2,5,X,
[l,m],null))},sd,V.c(ge,f))))}b.v=3;b.l=function(b){var d=G(b);b=K(b);var e=G(b);b=K(b);var f=G(b);b=I(b);return a(d,e,f,b)};b.j=a;return b}(),em=new W(null,2,5,X,[El(Ll,new C(null,"i1","i1",-572470430,null)),El(Ll,new C(null,"i2","i2",850408895,null))],null),fm=cl(em),gm=cl(Ll),hm=function(b,a,c,d,e){return function g(k,l){var m=b.Ea();if(u(m)){var n=new W(null,2,5,X,[k,l],null),p=d.e?d.e(n):d.call(null,n);if(u(p))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"union-input-schemata",
"union-input-schemata",-1338811970,null),Ae.j(Q([p],0))],0)),new t(null,4,[Nj,p,di,n,$g,c,ui,yh],null));}n=function(){for(;;)return dm.j(function(){return function(a){return vl(a)?ul(a):li}}(m,b,a,c,d,e),function(){return function(a,b){if(ql(a))return a;if(ql(b))return b;if(tl(a)){if(!L.c(a,b))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"\x3d","\x3d",-1501502141,null),new C(null,"k1","k1",-1701777341,null),new C(null,"k2","k2",-1225133949,null))],0)))].join(""));return a}if(L.c(a,b))return a;
throw Error(Hk("Only one extra schema allowed"));}}(m,b,a,c,d,e),function(){return function(a,b){return Ql(a)&&Ql(b)?g(a,b):L.c(a,b)?a:L.c(a,el)?b:L.c(b,el)?a:pl.j(Q([a,b],0))}}(m,b,a,c,d,e),Q([k,l],0))}();if(u(m)&&(p=e.e?e.e(n):e.call(null,n),u(p)))throw Qg.c(Hk.j("Output of %s does not match schema: %s",Q([new C(null,"union-input-schemata","union-input-schemata",-1338811970,null),Ae.j(Q([p],0))],0)),new t(null,4,[Nj,p,di,n,$g,a,ui,yh],null));return n}}(Vk,Ll,em,fm,gm);
Tk(hm,Jl(Ll,new W(null,1,5,X,[em],null)));var im=new W(null,1,5,X,[kl],null),jm=new W(null,1,5,X,[El(Ll,new C(null,"input-schema","input-schema",1373647181,null))],null),km=cl(jm),lm=cl(im);
Tk(function(b,a,c,d,e){return function(f){var g=b.Ea();if(u(g)){var k=new W(null,1,5,X,[f],null),l=d.e?d.e(k):d.call(null,k);if(u(l))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"required-toplevel-keys","required-toplevel-keys",1052167617,null),Ae.j(Q([l],0))],0)),new t(null,4,[Nj,l,di,k,$g,c,ui,yh],null));}k=function(){for(;;)return ue.c(function(){return function(a){return ql(a)?ul(a):null}}(g,b,a,c,d,e),Af(f))}();if(u(g)&&(l=e.e?e.e(k):e.call(null,k),u(l)))throw Qg.c(Hk.j("Output of %s does not match schema: %s",
Q([new C(null,"required-toplevel-keys","required-toplevel-keys",1052167617,null),Ae.j(Q([l],0))],0)),new t(null,4,[Nj,l,di,k,$g,a,ui,yh],null));return k}}(Vk,im,jm,km,lm),Jl(im,new W(null,1,5,X,[jm],null)));
var mm=function mm(a,c){return Ql(a)?Ql(c)?ne(Re.c(sd,function(){return function e(a){return new Vd(null,function(){for(var g=a;;)if(g=E(g)){if(gd(g)){var k=Wb(g),l=R(k),m=Zd(l);a:for(var n=0;;)if(n<l){var p=B.c(k,n),r=S.h(p,0,null),p=S.h(p,1,null);if(vl(r)){var w=ql(r),z=ul(r),D=pd(c,z);if(w||D)p=D?mm(p,U.c(c,z)):new C(null,"missing-required-key","missing-required-key",709961446,null),u(p)&&m.add(new W(null,2,5,X,[r,p],null))}n+=1}else{k=!0;break a}return k?ce(m.P(),e(Xb(g))):ce(m.P(),null)}k=G(g);
m=S.h(k,0,null);k=S.h(k,1,null);if(vl(m)&&(l=ql(m),n=ul(m),r=pd(c,n),l||r)&&(k=r?mm(k,U.c(c,n)):new C(null,"missing-required-key","missing-required-key",709961446,null),u(k)))return O(new W(null,2,5,X,[m,k],null),e(I(g)));g=I(g)}else return null},null,null)}(a)}())):Qk(Lk(a,c,new Cg(function(){return A(A(J,$k(c)),new C(null,"map?","map?",-1780568534,null))},null),null)):null};function nm(b,a){var c=mm(b,a);if(u(c))throw Qg.c(""+y(c),new t(null,2,[Nj,Vh,gk,c],null));}
var om=new W(null,2,5,X,[El(Ml,new C(null,"arg0","arg0",-1024593414,null)),El(new W(null,2,5,X,[El(Ll,new C(null,"input","input",-2097503808,null)),El(Ol,new C(null,"output","output",534662484,null))],null),new C(null,"arg1","arg1",-1702536411,null))],null),pm=cl(om),qm=cl(el);
Tk(function(b,a,c,d,e){return function(b,g){var k=new W(null,2,5,X,[b,g],null),l=d.e?d.e(k):d.call(null,k);if(u(l))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"compose-schemata","compose-schemata",918607729,null),Ae.j(Q([l],0))],0)),new t(null,4,[Nj,l,di,k,$g,c,ui,yh],null));a:for(S.h(b,0,null),S.h(b,1,null),S.h(g,0,null),S.h(g,1,null);;){var l=b,k=S.h(l,0,null),l=S.h(l,1,null),m=g,n=S.h(m,0,null),m=S.h(m,1,null),p;b:{p=k;for(var r=Af(m),w=sd,r=E(r);;)if(r)var z=G(r),D=U.h(p,
z,yk),w=me.c(D,yk)?Vc.h(w,z,D):w,r=K(r);else{p=Nc(w,Zc(p));break b}}nm(p,m);k=new W(null,2,5,X,[hm(V.h(Wc,k,ge.c(Af(m),De.c(sl,Af(m)))),n),l],null);break a}l=e.e?e.e(k):e.call(null,k);if(u(l))throw Qg.c(Hk.j("Output of %s does not match schema: %s",Q([new C(null,"compose-schemata","compose-schemata",918607729,null),Ae.j(Q([l],0))],0)),new t(null,4,[Nj,l,di,k,$g,a,ui,yh],null));return k}}(Vk,el,om,pm,qm),Jl(el,new W(null,1,5,X,[om],null)));function rm(b,a){return pd(b,a)?a:pd(b,sl(a))?sl(a):null}
var sm=new W(null,2,5,X,[El(Ll,new C(null,"s","s",-948495851,null)),El(new W(null,1,5,X,[kl],null),new C(null,"ks","ks",-754231827,null))],null),tm=cl(sm),um=cl(el),vm=function(b,a,c,d,e){return function(f,g){var k=b.Ea();if(u(k)){var l=new W(null,2,5,X,[f,g],null),m=d.e?d.e(l):d.call(null,l);if(u(m))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"split-schema","split-schema",1859174771,null),Ae.j(Q([m],0))],0)),new t(null,4,[Nj,m,di,l,$g,c,ui,yh],null));}l=function(){for(;;)return function(a,
b,c,d,e,g,k){return function N(l){return new Vd(null,function(a,b,c,d,e,g,k){return function(){for(;;){var m=E(l);if(m){var n=m;if(gd(n)){var p=Wb(n),r=R(p),w=Zd(r);return function(){for(var l=0;;)if(l<r){var z=B.c(p,l);de(w,Re.c(sd,function(){return function(a,b,c,d,e,f,g,k,l,m,n,p,r,w){return function ok(z){return new Vd(null,function(a,b,c,d,e,f,g,k){return function(){for(var a=z;;)if(a=E(a)){if(gd(a)){var c=Wb(a),d=R(c),e=Zd(d);a:for(var f=0;;)if(f<d){var g=B.c(c,f),l=S.h(g,0,null),g=S.h(g,1,
null);vl(l)&&L.c(b,pd(k,ul(l)))&&e.add(new W(null,2,5,X,[l,g],null));f+=1}else{c=!0;break a}return c?ce(e.P(),ok(Xb(a))):ce(e.P(),null)}c=G(a);e=S.h(c,0,null);c=S.h(c,1,null);if(vl(e)&&L.c(b,pd(k,ul(e))))return O(new W(null,2,5,X,[e,c],null),ok(I(a)));a=I(a)}else return null}}(a,b,c,d,e,f,g,k,l,m,n,p,r,w),null,null)}}(l,z,p,r,w,n,m,a,b,c,d,e,g,k)(f)}()));l+=1}else return!0}()?ce(w.P(),N(Xb(n))):ce(w.P(),null)}var z=G(n);return O(Re.c(sd,function(){return function(a,b,c,d,e,f,g,k,l,m){return function Mf(n){return new Vd(null,
function(a,b,c,d){return function(){for(var b=n;;)if(b=E(b)){if(gd(b)){var c=Wb(b),e=R(c),f=Zd(e);a:for(var g=0;;)if(g<e){var k=B.c(c,g),l=S.h(k,0,null),k=S.h(k,1,null);vl(l)&&L.c(a,pd(d,ul(l)))&&f.add(new W(null,2,5,X,[l,k],null));g+=1}else{c=!0;break a}return c?ce(f.P(),Mf(Xb(b))):ce(f.P(),null)}c=G(b);f=S.h(c,0,null);c=S.h(c,1,null);if(vl(f)&&L.c(a,pd(d,ul(f))))return O(new W(null,2,5,X,[f,c],null),Mf(I(b)));b=I(b)}else return null}}(a,b,c,d,e,f,g,k,l,m),null,null)}}(z,n,m,a,b,c,d,e,g,k)(f)}()),
N(I(n)))}return null}}}(a,b,c,d,e,g,k),null,null)}}(fg(g),k,b,a,c,d,e)(new W(null,2,5,X,[!0,!1],null))}();if(u(k)&&(m=e.e?e.e(l):e.call(null,l),u(m)))throw Qg.c(Hk.j("Output of %s does not match schema: %s",Q([new C(null,"split-schema","split-schema",1859174771,null),Ae.j(Q([m],0))],0)),new t(null,4,[Nj,m,di,l,$g,a,ui,yh],null));return l}}(Vk,el,sm,tm,um);Tk(vm,Jl(el,new W(null,1,5,X,[sm],null)));
var wm=new W(null,2,5,X,[El(Pl,new C(null,"arg0","arg0",-1024593414,null)),El(new W(null,2,5,X,[El(kl,"key"),El(Ml,"inner-schemas")],null),new C(null,"arg1","arg1",-1702536411,null))],null),xm=cl(wm),ym=cl(Pl);
Tk(function(b,a,c,d,e){return function(f,g){var k=b.Ea();if(u(k)){var l=new W(null,2,5,X,[f,g],null),m=d.e?d.e(l):d.call(null,l);if(u(m))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"sequence-schemata","sequence-schemata",-2061205313,null),Ae.j(Q([m],0))],0)),new t(null,4,[Nj,m,di,l,$g,c,ui,yh],null));}a:for(S.h(f,0,null),S.h(f,1,null),S.h(g,0,null),l=S.h(g,1,null),S.h(l,0,null),S.h(l,1,null);;){var m=f,l=S.h(m,0,null),m=S.h(m,1,null),n=g,p=S.h(n,0,null),n=S.h(n,1,null),r=
S.h(n,0,null),n=S.h(n,1,null);if(md(rm(l,p)))throw Error(Hk.j("Duplicate key output (possibly due to a misordered graph) %s for input %s from input %s",Q([p,$k(r),$k(l)],0)));if(md(rm(r,p)))throw Error(Hk.j("Node outputs a key %s in its inputs %s",Q([p,$k(r)],0)));if(md(rm(m,p)))throw Error(Hk.j("Node outputs a duplicate key %s given inputs %s",Q([p,$k(l)],0)));var w=vm(r,Af(m)),r=S.h(w,0,null),w=S.h(w,1,null);nm(r,m);l=new W(null,2,5,X,[hm(w,l),Vc.h(m,p,n)],null);break a}if(u(k)&&(k=e.e?e.e(l):e.call(null,
l),u(k)))throw Qg.c(Hk.j("Output of %s does not match schema: %s",Q([new C(null,"sequence-schemata","sequence-schemata",-2061205313,null),Ae.j(Q([k],0))],0)),new t(null,4,[Nj,k,di,l,$g,a,ui,yh],null));return l}}(Vk,Pl,wm,xm,ym),Jl(Pl,new W(null,1,5,X,[wm],null)));se.c(Od,Cd);var zm;a:{var Am=aa.navigator;if(Am){var Bm=Am.userAgent;if(Bm){zm=Bm;break a}}zm=""};var Cm=-1!=zm.indexOf("Opera")||-1!=zm.indexOf("OPR"),Dm=-1!=zm.indexOf("Trident")||-1!=zm.indexOf("MSIE"),Em=-1!=zm.indexOf("Gecko")&&-1==zm.toLowerCase().indexOf("webkit")&&!(-1!=zm.indexOf("Trident")||-1!=zm.indexOf("MSIE")),Fm=-1!=zm.toLowerCase().indexOf("webkit");function Gm(){var b=aa.document;return b?b.documentMode:void 0}
var Hm=function(){var b="",a;if(Cm&&aa.opera)return b=aa.opera.version,"function"==q(b)?b():b;Em?a=/rv\:([^\);]+)(\)|;)/:Dm?a=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:Fm&&(a=/WebKit\/(\S+)/);a&&(b=(b=a.exec(zm))?b[1]:"");return Dm&&(a=Gm(),a>parseFloat(b))?String(a):b}(),Im={};
function Jm(b){var a;if(!(a=Im[b])){a=0;for(var c=String(Hm).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),d=String(b).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),e=Math.max(c.length,d.length),f=0;0==a&&f<e;f++){var g=c[f]||"",k=d[f]||"",l=RegExp("(\\d*)(\\D*)","g"),m=RegExp("(\\d*)(\\D*)","g");do{var n=l.exec(g)||["","",""],p=m.exec(k)||["","",""];if(0==n[0].length&&0==p[0].length)break;a=ea(0==n[1].length?0:parseInt(n[1],10),0==p[1].length?0:parseInt(p[1],10))||ea(0==n[2].length,0==p[2].length)||
ea(n[2],p[2])}while(0==a)}a=Im[b]=0<=a}return a}var Km=aa.document,Lm=Km&&Dm?Gm()||("CSS1Compat"==Km.compatMode?parseInt(Hm,10):5):void 0;!Em&&!Dm||Dm&&Dm&&9<=Lm||Em&&Jm("1.9.1");Dm&&Jm("9");function Mm(){}Mm.fc=function(){return Mm.gc?Mm.gc:Mm.gc=new Mm};Mm.prototype.hc=0;var Nm=null,Om=null,Pm=null,Qm=null,Rm=null,Sm={},Tm=function Tm(a){if(a?a.Jb:a)return a.Jb(a);var c;c=Tm[q(null==a?null:a)];if(!c&&(c=Tm._,!c))throw x("IDisplayName.display-name",a);return c.call(null,a)},Um={},Vm=function Vm(a){if(a?a.Cd:a)return a.Cd(a);var c;c=Vm[q(null==a?null:a)];if(!c&&(c=Vm._,!c))throw x("IInitState.init-state",a);return c.call(null,a)},Wm={},Xm=function Xm(a,c,d){if(a?a.Kd:a)return a.Kd(a,c,d);var e;e=Xm[q(null==a?null:a)];if(!e&&(e=Xm._,!e))throw x("IShouldUpdate.should-update",
a);return e.call(null,a,c,d)},Ym={},Zm=function Zm(a){if(a?a.Od:a)return a.Od(a);var c;c=Zm[q(null==a?null:a)];if(!c&&(c=Zm._,!c))throw x("IWillMount.will-mount",a);return c.call(null,a)},$m={},an=function an(a){if(a?a.jc:a)return a.jc(a);var c;c=an[q(null==a?null:a)];if(!c&&(c=an._,!c))throw x("IDidMount.did-mount",a);return c.call(null,a)},bn={},cn=function cn(a){if(a?a.Rd:a)return a.Rd(a);var c;c=cn[q(null==a?null:a)];if(!c&&(c=cn._,!c))throw x("IWillUnmount.will-unmount",a);return c.call(null,
a)},dn={},en=function en(a,c,d){if(a?a.Td:a)return a.Td(a,c,d);var e;e=en[q(null==a?null:a)];if(!e&&(e=en._,!e))throw x("IWillUpdate.will-update",a);return e.call(null,a,c,d)},fn={},gn=function gn(a,c,d){if(a?a.Ad:a)return a.Ad(a,c,d);var e;e=gn[q(null==a?null:a)];if(!e&&(e=gn._,!e))throw x("IDidUpdate.did-update",a);return e.call(null,a,c,d)},hn={},jn=function jn(a,c){if(a?a.Pd:a)return a.Pd(a,c);var d;d=jn[q(null==a?null:a)];if(!d&&(d=jn._,!d))throw x("IWillReceiveProps.will-receive-props",a);return d.call(null,
a,c)},kn={},ln=function ln(a){if(a?a.Lb:a)return a.Lb(a);var c;c=ln[q(null==a?null:a)];if(!c&&(c=ln._,!c))throw x("IRender.render",a);return c.call(null,a)},mn={},nn=function nn(a,c,d){if(a?a.Hd:a)return a.Hd(a,c,d);var e;e=nn[q(null==a?null:a)];if(!e&&(e=nn._,!e))throw x("IRenderProps.render-props",a);return e.call(null,a,c,d)},on={},pn=function pn(a,c){if(a?a.Jd:a)return a.Jd(a,c);var d;d=pn[q(null==a?null:a)];if(!d&&(d=pn._,!d))throw x("IRenderState.render-state",a);return d.call(null,a,c)},qn=
{},rn={},sn=function sn(a,c,d,e,f){if(a?a.Fd:a)return a.Fd(a,c,d,e,f);var g;g=sn[q(null==a?null:a)];if(!g&&(g=sn._,!g))throw x("IOmSwap.-om-swap!",a);return g.call(null,a,c,d,e,f)},tn=function(){function b(a,b){if(a?a.nc:a)return a.nc(a,b);var f;f=c[q(null==a?null:a)];if(!f&&(f=c._,!f))throw x("IGetState.-get-state",a);return f.call(null,a,b)}function a(a){if(a?a.mc:a)return a.mc(a);var b;b=c[q(null==a?null:a)];if(!b&&(b=c._,!b))throw x("IGetState.-get-state",a);return b.call(null,a)}var c=null,c=
function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),un=function(){function b(a,b){if(a?a.lc:a)return a.lc(a,b);var f;f=c[q(null==a?null:a)];if(!f&&(f=c._,!f))throw x("IGetRenderState.-get-render-state",a);return f.call(null,a,b)}function a(a){if(a?a.kc:a)return a.kc(a);var b;b=c[q(null==a?null:a)];if(!b&&(b=c._,!b))throw x("IGetRenderState.-get-render-state",a);return b.call(null,
a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),vn=function(){function b(a,b,f,g){if(a?a.yc:a)return a.yc(a,b,f,g);var k;k=c[q(null==a?null:a)];if(!k&&(k=c._,!k))throw x("ISetState.-set-state!",a);return k.call(null,a,b,f,g)}function a(a,b,f){if(a?a.xc:a)return a.xc(a,b,f);var g;g=c[q(null==a?null:a)];if(!g&&(g=c._,!g))throw x("ISetState.-set-state!",a);return g.call(null,
a,b,f)}var c=null,c=function(c,e,f,g){switch(arguments.length){case 3:return a.call(this,c,e,f);case 4:return b.call(this,c,e,f,g)}throw Error("Invalid arity: "+arguments.length);};c.h=a;c.B=b;return c}(),wn=function wn(a){if(a?a.sc:a)return a.sc(a);var c;c=wn[q(null==a?null:a)];if(!c&&(c=wn._,!c))throw x("IRenderQueue.-get-queue",a);return c.call(null,a)},xn=function xn(a,c){if(a?a.tc:a)return a.tc(a,c);var d;d=xn[q(null==a?null:a)];if(!d&&(d=xn._,!d))throw x("IRenderQueue.-queue-render!",a);return d.call(null,
a,c)},yn=function yn(a){if(a?a.rc:a)return a.rc(a);var c;c=yn[q(null==a?null:a)];if(!c&&(c=yn._,!c))throw x("IRenderQueue.-empty-queue!",a);return c.call(null,a)},zn=function zn(a){if(a?a.Bc:a)return a.value;var c;c=zn[q(null==a?null:a)];if(!c&&(c=zn._,!c))throw x("IValue.-value",a);return c.call(null,a)};zn._=function(b){return b};
var An={},Bn=function Bn(a){if(a?a.Hb:a)return a.Hb(a);var c;c=Bn[q(null==a?null:a)];if(!c&&(c=Bn._,!c))throw x("ICursor.-path",a);return c.call(null,a)},Cn=function Cn(a){if(a?a.Ib:a)return a.Ib(a);var c;c=Cn[q(null==a?null:a)];if(!c&&(c=Cn._,!c))throw x("ICursor.-state",a);return c.call(null,a)},Dn={},En=function(){function b(a,b,f){if(a?a.Md:a)return a.Md(a,b,f);var g;g=c[q(null==a?null:a)];if(!g&&(g=c._,!g))throw x("IToCursor.-to-cursor",a);return g.call(null,a,b,f)}function a(a,b){if(a?a.Ld:
a)return a.Ld(a,b);var f;f=c[q(null==a?null:a)];if(!f&&(f=c._,!f))throw x("IToCursor.-to-cursor",a);return f.call(null,a,b)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),Fn=function Fn(a,c,d,e){if(a?a.xd:a)return a.xd(a,c,d,e);var f;f=Fn[q(null==a?null:a)];if(!f&&(f=Fn._,!f))throw x("ICursorDerive.-derive",a);return f.call(null,a,c,d,e)};
Fn._=function(b,a,c,d){return Gn.h?Gn.h(a,c,d):Gn.call(null,a,c,d)};function Hn(b){return Bn(b)}
var In={},Jn=function Jn(a,c,d){if(a?a.oc:a)return a.oc(a,c,d);var e;e=Jn[q(null==a?null:a)];if(!e&&(e=Jn._,!e))throw x("INotify.-listen!",a);return e.call(null,a,c,d)},Kn=function Kn(a,c){if(a?a.qc:a)return a.qc(a,c);var d;d=Kn[q(null==a?null:a)];if(!d&&(d=Kn._,!d))throw x("INotify.-unlisten!",a);return d.call(null,a,c)},Ln=function Ln(a,c,d){if(a?a.pc:a)return a.pc(a,c,d);var e;e=Ln[q(null==a?null:a)];if(!e&&(e=Ln._,!e))throw x("INotify.-notify!",a);return e.call(null,a,c,d)},Mn=function Mn(a,c,
d,e){if(a?a.wc:a)return a.wc(a,c,d,e);var f;f=Mn[q(null==a?null:a)];if(!f&&(f=Mn._,!f))throw x("IRootProperties.-set-property!",a);return f.call(null,a,c,d,e)},Nn=function Nn(a,c){if(a?a.vc:a)return a.vc(a,c);var d;d=Nn[q(null==a?null:a)];if(!d&&(d=Nn._,!d))throw x("IRootProperties.-remove-properties!",a);return d.call(null,a,c)},On=function On(a,c,d){if(a?a.uc:a)return a.uc(a,c,d);var e;e=On[q(null==a?null:a)];if(!e&&(e=On._,!e))throw x("IRootProperties.-get-property",a);return e.call(null,a,c,d)},
Pn=function Pn(a,c){if(a?a.ic:a)return a.ic(a,c);var d;d=Pn[q(null==a?null:a)];if(!d&&(d=Pn._,!d))throw x("IAdapt.-adapt",a);return d.call(null,a,c)};Pn._=function(b,a){return a};var Qn=function Qn(a,c){if(a?a.Ed:a)return a.Ed(a,c);var d;d=Qn[q(null==a?null:a)];if(!d&&(d=Qn._,!d))throw x("IOmRef.-remove-dep!",a);return d.call(null,a,c)};
function Rn(b,a,c,d,e){var f=M.e?M.e(b):M.call(null,b),g=Re.c(Hn.e?Hn.e(a):Hn.call(null,a),c);c=(b?u(u(null)?null:b.we)||(b.R?0:v(rn,b)):v(rn,b))?sn(b,a,c,d,e):ad(g)?Be.c(b,d):Be.B(b,Ve,g,d);if(L.c(c,rk))return null;b=new t(null,5,[Ug,g,ni,Te.c(f,g),Yg,Te.c(M.e?M.e(b):M.call(null,b),g),Tg,f,vh,M.e?M.e(b):M.call(null,b)],null);return null!=e?(e=Vc.h(b,Vj,e),Sn.c?Sn.c(a,e):Sn.call(null,a,e)):Sn.c?Sn.c(a,b):Sn.call(null,a,b)}function Tn(b){return b?u(u(null)?null:b.Tb)?!0:b.R?!1:v(An,b):v(An,b)}
function Un(b){return b.isOmComponent}function Vn(b){var a=b.props.children;return nd(a)?b.props.children=a.e?a.e(b):a.call(null,b):a}
var Wn=function(){function b(a,b){if(!u(Un(a)))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"component?","component?",2048315517,null),new C(null,"x","x",-555367584,null))],0)))].join(""));var c=dd(b)?b:new W(null,1,5,X,[b],null),g=a.props.__om_cursor;return E(c)?Te.c(g,c):g}function a(a){if(!u(Un(a)))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"component?","component?",2048315517,null),new C(null,"x","x",-555367584,null))],0)))].join(""));return a.props.__om_cursor}var c=
null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),Xn=function(){function b(a,b){if(!u(Un(a)))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"component?","component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));var c=dd(b)?b:new W(null,1,5,X,[b],null);return tn.c(a,c)}function a(a){if(!u(Un(a)))throw Error([y("Assert failed: "),
y(Ae.j(Q([Pd(new C(null,"component?","component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));return tn.e(a)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),Yn=function(){function b(a,b){return dd(b)?ad(b)?c.e(a):Te.c(c.e(a),b):U.c(c.e(a),b)}function a(a){return null==a?null:a.props.__om_shared}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,
c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}();function Zn(b){b=b.state;var a=b.__om_pending_state;return u(a)?(b.__om_prev_state=b.__om_state,b.__om_state=a,b.__om_pending_state=null,b):null}
var $n=function(){function b(a,b){var c=u(b)?b:a.props,g=c.__om_state;if(u(g)){var k=a.state,l=k.__om_pending_state;k.__om_pending_state=dg.j(Q([u(l)?l:k.__om_state,g],0));return c.__om_state=null}return null}function a(a){return c.c(a,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}();
function ao(b){var a=zn(b),c=Te.h(function(){var a=Cn(b);return M.e?M.e(a):M.call(null,a)}(),Hn.e?Hn.e(b):Hn.call(null,b),nh);return me.c(a,c)}function bo(b){b=b.state;var a=b.__om_refs;return 0===R(a)?null:b.__om_refs=Re.c(vd,Ne.c(ya,De.c(function(){return function(a){var b=zn(a),e=Cn(a),f=Hn.e?Hn.e(a):Hn.call(null,a),g=Te.h(M.e?M.e(e):M.call(null,e),f,nh);me.c(b,nh)?me.c(b,g)&&(b=Gn.h?Gn.h(g,e,f):Gn.call(null,g,e,f),a=Pn(a,b)):a=null;return a}}(b,a),a)))}
var eo=Uc([oh,Nh,Fi,Gi,Ui,cj,mj,pj,Kj,Zj,mk],[function(b){var a=Vn(this);if(a?u(u(null)?null:a.zd)||(a.R?0:v(fn,a)):v(fn,a)){var c=this.state;b=Wn.e({isOmComponent:!0,props:b});var d=c.__om_prev_state;gn(a,b,u(d)?d:c.__om_state)}return this.state.__om_prev_state=null},!0,function(){var b=Vn(this);(b?u(u(null)?null:b.Qd)||(b.R?0:v(bn,b)):v(bn,b))&&cn(b);if(b=E(this.state.__om_refs))for(var b=E(b),a=null,c=0,d=0;;)if(d<c){var e=a.Q(null,d);co.c?co.c(this,e):co.call(null,this,e);d+=1}else if(b=E(b))gd(b)?
(c=Wb(b),b=Xb(b),a=c,c=R(c)):(a=e=G(b),co.c?co.c(this,a):co.call(null,this,a),b=K(b),a=null,c=0),d=0;else return null;else return null},function(b){var a=Vn(this);return(a?u(u(null)?null:a.Fe)||(a.R?0:v(hn,a)):v(hn,a))?jn(a,Wn.e({isOmComponent:!0,props:b})):null},function(b){var a=this,c=a.props,d=a.state,e=Vn(a);$n.c(a,b);if(e?u(u(null)?null:e.De)||(e.R?0:v(Wm,e)):v(Wm,e))return Xm(e,Wn.e({isOmComponent:!0,props:b}),tn.e(a));var f=c.__om_cursor,g=b.__om_cursor;return me.c(zn(f),zn(g))?!0:Tn(f)&&
Tn(g)&&me.c(Bn(f),Bn(g))?!0:me.c(tn.e(a),un.e(a))?!0:u(function(){var b=0!==R(d.__om_refs);return b?pe(function(){return function(a){return ao(a)}}(b,f,g,c,d,e,a),d.__om_refs):b}())?!0:c.__om_index!==b.__om_index?!0:!1},function(){var b=Vn(this),a=this.props,c=Nm,d=Qm,e=Om,f=Pm,g=Rm;Nm=this;Qm=a.__om_app_state;Om=a.__om_instrument;Pm=a.__om_descriptor;Rm=a.__om_root_key;try{return(b?u(u(null)?null:b.Kb)||(b.R?0:v(kn,b)):v(kn,b))?ln(b):(b?u(u(null)?null:b.Gd)||(b.R?0:v(mn,b)):v(mn,b))?nn(b,a.__om_cursor,
Xn.e(this)):(b?u(u(null)?null:b.Id)||(b.R?0:v(on,b)):v(on,b))?pn(b,Xn.e(this)):b}finally{Rm=g,Pm=f,Om=e,Qm=d,Nm=c}},function(b){var a=Vn(this);(a?u(u(null)?null:a.Sd)||(a.R?0:v(dn,a)):v(dn,a))&&en(a,Wn.e({isOmComponent:!0,props:b}),tn.e(this));Zn(this);return bo(this)},function(){var b=Vn(this),a=this.props,c;c=a.__om_init_state;c=u(c)?c:sd;var d=Ch.e(c),b={__om_state:dg.j(Q([(b?u(u(null)?null:b.Bd)||(b.R?0:v(Um,b)):v(Um,b))?Vm(b):null,Wc.c(c,Ch)],0)),__om_id:u(d)?d:":"+(Mm.fc().hc++).toString(36)};
a.__om_init_state=null;return b},function(){var b=Vn(this);return(b?u(u(null)?null:b.yd)||(b.R?0:v($m,b)):v($m,b))?an(b):null},function(){var b=Vn(this);return(b?u(u(null)?null:b.Ub)||(b.R?0:v(Sm,b)):v(Sm,b))?Tm(b):null},function(){$n.e(this);var b=Vn(this);(b?u(u(null)?null:b.Nd)||(b.R?0:v(Ym,b)):v(Ym,b))&&Zm(b);return Zn(this)}]),fo=function(b){b.ve=!0;b.mc=function(){return function(){var a=this.state,b=a.__om_pending_state;return u(b)?b:a.__om_state}}(b);b.nc=function(){return function(a,b){return Te.c(tn.e(this),
b)}}(b);b.ue=!0;b.kc=function(){return function(){return this.state.__om_state}}(b);b.lc=function(){return function(a,b){return Te.c(un.e(this),b)}}(b);b.Ce=!0;b.xc=function(){return function(a,b,d){a=this.props.__om_app_state;this.state.__om_pending_state=b;b=null!=a;return u(b?d:b)?xn(a,this):null}}(b);b.yc=function(){return function(a,b,d,e){var f=this.props;a=this.state;var g=tn.e(this),f=f.__om_app_state;a.__om_pending_state=Ue(g,b,d);b=null!=f;return u(b?e:b)?xn(f,this):null}}(b);return b}(Hg(eo));
function go(b){b=b._rootNodeID;if(!u(b))throw Error([y("Assert failed: "),y(Ae.j(Q([new C(null,"id","id",252129435,null)],0)))].join(""));return b}function ho(b){return b.props.__om_app_state}function io(b){var a=ho(b);b=new W(null,2,5,X,[Xg,go(b)],null);var c=Te.c(M.e?M.e(a):M.call(null,a),b);return u(Ci.e(c))?Be.B(a,Ve,b,function(){return function(a){return Wc.c(Vc.h(Vc.h(a,ij,uk.e(a)),uk,dg.j(Q([uk.e(a),Ci.e(a)],0))),Ci)}}(a,b,c)):null}
Vc.j(eo,pj,function(){var b=Vn(this),a=this.props,c=function(){var b=a.__om_init_state;return u(b)?b:sd}(),d=function(){var a=Ch.e(c);return u(a)?a:":"+(Mm.fc().hc++).toString(36)}(),b=dg.j(Q([Wc.c(c,Ch),(b?u(u(null)?null:b.Bd)||(b.R?0:v(Um,b)):v(Um,b))?Vm(b):null],0)),e=new W(null,3,5,X,[Xg,go(this),uk],null);a.__om_init_state=null;Be.B(ho(this),Ue,e,b);return{__om_id:d}},Q([mk,function(){$n.e(this);var b=Vn(this);(b?u(u(null)?null:b.Nd)||(b.R?0:v(Ym,b)):v(Ym,b))&&Zm(b);return io(this)},Fi,function(){var b=
Vn(this);(b?u(u(null)?null:b.Qd)||(b.R?0:v(bn,b)):v(bn,b))&&cn(b);Be.j(ho(this),Ve,new W(null,1,5,X,[Xg],null),Wc,Q([go(this)],0));if(b=E(this.state.__om_refs))for(var b=E(b),a=null,c=0,d=0;;)if(d<c){var e=a.Q(null,d);co.c?co.c(this,e):co.call(null,this,e);d+=1}else if(b=E(b))gd(b)?(c=Wb(b),b=Xb(b),a=c,c=R(c)):(a=e=G(b),co.c?co.c(this,a):co.call(null,this,a),b=K(b),a=null,c=0),d=0;else return null;else return null},mj,function(b){var a=Vn(this);(a?u(u(null)?null:a.Sd)||(a.R?0:v(dn,a)):v(dn,a))&&en(a,
Wn.e({isOmComponent:!0,props:b}),tn.e(this));io(this);return bo(this)},oh,function(b){var a=Vn(this),c=ho(this),d=Te.c(M.e?M.e(c):M.call(null,c),new W(null,2,5,X,[Xg,go(this)],null)),e=new W(null,2,5,X,[Xg,go(this)],null);if(a?u(u(null)?null:a.zd)||(a.R?0:v(fn,a)):v(fn,a)){b=Wn.e({isOmComponent:!0,props:b});var f;f=ij.e(d);f=u(f)?f:uk.e(d);gn(a,b,f)}return u(ij.e(d))?Be.j(c,Ve,e,Wc,Q([ij],0)):null}],0));function jo(b,a,c){this.value=b;this.state=a;this.path=c;this.o=2163640079;this.C=8192}h=jo.prototype;
h.H=function(b,a){return $a.h(this,a,null)};h.F=function(b,a,c){b=$a.h(this.value,a,nh);return L.c(b,nh)?c:Fn(this,b,this.state,Rc.c(this.path,a))};h.G=function(b,a,c){return Lb(this.value,a,c)};h.Tb=!0;h.Hb=function(){return this.path};h.Ib=function(){return this.state};h.I=function(){return Zc(this.value)};h.T=function(){return new jo(this.value,this.state,this.path)};h.O=function(){return Ra(this.value)};h.L=function(){return qc(this.value)};
h.D=function(b,a){return Tn(a)?L.c(this.value,zn(a)):L.c(this.value,a)};h.Bc=function(){return this.value};h.Y=function(){return new jo(Sc(this.value),this.state,this.path)};h.ma=function(b,a){return new jo(gb(this.value,a),this.state,this.path)};h.zc=!0;h.Ac=function(b,a,c,d){return Rn(this.state,this,a,c,d)};h.rb=function(b,a){return bb(this.value,a)};h.aa=function(b,a,c){return new jo(db(this.value,a,c),this.state,this.path)};
h.M=function(){var b=this;return 0<R(b.value)?De.c(function(a){return function(c){var d=S.h(c,0,null);c=S.h(c,1,null);return new W(null,2,5,X,[d,Fn(a,c,b.state,Rc.c(b.path,d))],null)}}(this),b.value):null};h.K=function(b,a){return new jo(Nc(this.value,a),this.state,this.path)};h.N=function(b,a){return new jo(A(this.value,a),this.state,this.path)};
h.call=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return this.H(null,b);case 3:return this.F(null,b,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return this.H(null,b)};b.h=function(a,b,d){return this.F(null,b,d)};return b}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.e=function(b){return this.H(null,b)};h.c=function(b,a){return this.F(null,b,a)};
h.Da=function(){var b=this;return Te.h(function(){var a=b.state;return M.e?M.e(a):M.call(null,a)}(),b.path,Tj)};function ko(b,a,c){this.value=b;this.state=a;this.path=c;this.o=2180424479;this.C=8192}h=ko.prototype;h.H=function(b,a){return B.h(this,a,null)};h.F=function(b,a,c){return B.h(this,a,c)};h.Q=function(b,a){return Fn(this,B.c(this.value,a),this.state,Rc.c(this.path,a))};h.pa=function(b,a,c){return a<Ra(this.value)?Fn(this,B.h(this.value,a,c),this.state,Rc.c(this.path,a)):c};
h.G=function(b,a,c){return Lb(this.value,a,c)};h.Tb=!0;h.Hb=function(){return this.path};h.Ib=function(){return this.state};h.I=function(){return Zc(this.value)};h.T=function(){return new ko(this.value,this.state,this.path)};h.O=function(){return Ra(this.value)};h.L=function(){return qc(this.value)};h.D=function(b,a){return Tn(a)?L.c(this.value,zn(a)):L.c(this.value,a)};h.Bc=function(){return this.value};h.Y=function(){return new ko(Sc(this.value),this.state,this.path)};h.zc=!0;
h.Ac=function(b,a,c,d){return Rn(this.state,this,a,c,d)};h.rb=function(b,a){return bb(this.value,a)};h.aa=function(b,a,c){return Fn(this,ob(this.value,a,c),this.state,this.path)};h.M=function(){var b=this;return 0<R(b.value)?De.h(function(a){return function(c,d){return Fn(a,c,b.state,Rc.c(b.path,d))}}(this),b.value,jg.t()):null};h.K=function(b,a){return new ko(Nc(this.value,a),this.state,this.path)};h.N=function(b,a){return new ko(A(this.value,a),this.state,this.path)};
h.call=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return this.H(null,b);case 3:return this.F(null,b,d)}throw Error("Invalid arity: "+arguments.length);};b.c=function(a,b){return this.H(null,b)};b.h=function(a,b,d){return this.F(null,b,d)};return b}();h.apply=function(b,a){return this.call.apply(this,[this].concat(Ga(a)))};h.e=function(b){return this.H(null,b)};h.c=function(b,a){return this.F(null,b,a)};
h.Da=function(){var b=this;return Te.h(function(){var a=b.state;return M.e?M.e(a):M.call(null,a)}(),b.path,Tj)};
function lo(b,a,c){var d=Pa(b);d.Sc=!0;d.D=function(){return function(a,c){return Tn(c)?L.c(b,zn(c)):L.c(b,c)}}(d);d.zc=!0;d.Ac=function(){return function(b,c,d,k){return Rn(a,this,c,d,k)}}(d);d.Tb=!0;d.Hb=function(){return function(){return c}}(d);d.Ib=function(){return function(){return a}}(d);d.ie=!0;d.Da=function(){return function(){return Te.h(M.e?M.e(a):M.call(null,a),c,Tj)}}(d);return d}
var Gn=function(){function b(a,b,c){return Tn(a)?a:(a?u(u(null)?null:a.Ee)||(a.R?0:v(Dn,a)):v(Dn,a))?En.h(a,b,c):Ic(a)?new ko(a,b,c):ed(a)?new jo(a,b,c):(a?a.C&8192||a.Mc||(a.C?0:v(Oa,a)):v(Oa,a))?lo(a,b,c):a}function a(a,b){return d.h(a,b,Qc)}function c(a){return d.h(a,null,Qc)}var d=null,d=function(d,f,g){switch(arguments.length){case 1:return c.call(this,d);case 2:return a.call(this,d,f);case 3:return b.call(this,d,f,g)}throw Error("Invalid arity: "+arguments.length);};d.e=c;d.c=a;d.h=b;return d}();
function Sn(b,a){var c=Cn(b);return Ln(c,a,Gn.c(M.e?M.e(c):M.call(null,c),c))}var mo=ye.e?ye.e(sd):ye.call(null,sd);function co(b,a){var c=b.state,d=c.__om_refs;pd(d,a)&&(c.__om_refs=$c.c(d,a));Qn(a,b);return a}
var no=!1,oo=ye.e?ye.e(vd):ye.call(null,vd),po=function(){function b(a){no=!1;for(var b=E(M.e?M.e(oo):M.call(null,oo)),c=null,g=0,k=0;;)if(k<g){var l=c.Q(null,k);l.t?l.t():l.call(null);k+=1}else if(b=E(b))c=b,gd(c)?(b=Wb(c),k=Xb(c),c=b,g=R(b),b=k):(b=G(c),b.t?b.t():b.call(null),b=K(c),c=null,g=0),k=0;else break;null==a?a=null:(b=a.Ud,a=a.Ud=(u(b)?b:0)+1);return a}function a(){return c.e(null)}var c=null,c=function(c){switch(arguments.length){case 0:return a.call(this);case 1:return b.call(this,c)}throw Error("Invalid arity: "+
arguments.length);};c.t=a;c.e=b;return c}(),qo=ye.e?ye.e(sd):ye.call(null,sd);
function ro(b,a){var c;c=b?u(u(null)?null:b.Kb)?!0:b.R?!1:v(kn,b):v(kn,b);c||(c=(c=b?u(u(null)?null:b.Gd)?!0:b.R?!1:v(mn,b):v(mn,b))?c:b?u(u(null)?null:b.Id)?!0:b.R?!1:v(on,b):v(on,b));if(!c)throw Error([y("Assert failed: "),y([y("Invalid Om component fn, "),y(a.name),y(" does not return valid instance")].join("")),y("\n"),y(Ae.j(Q([Pd(new C(null,"or","or",1876275696,null),Pd(new C(null,"satisfies?","satisfies?",-433227199,null),new C(null,"IRender","IRender",590822196,null),new C(null,"x","x",-555367584,
null)),Pd(new C(null,"satisfies?","satisfies?",-433227199,null),new C(null,"IRenderProps","IRenderProps",2115139472,null),new C(null,"x","x",-555367584,null)),Pd(new C(null,"satisfies?","satisfies?",-433227199,null),new C(null,"IRenderState","IRenderState",-897673898,null),new C(null,"x","x",-555367584,null)))],0)))].join(""));}
var so=function(){function b(a,b){if(null==a.om$descriptor){var c;u(b)?c=b:(c=Pm,c=u(c)?c:fo);c=React.createClass(c);c=React.createFactory(c);a.om$descriptor=c}return a.om$descriptor}function a(a){return c.c(a,null)}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),to=function(){var b=null,b=function(a,b,d){switch(arguments.length){case 2:return a;case 3:return a}throw Error("Invalid arity: "+
arguments.length);};b.c=function(a){return a};b.h=function(a){return a};return b}(),uo=function(){function b(a,b,c){if(!nd(a))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"ifn?","ifn?",-2106461064,null),new C(null,"f","f",43394975,null))],0)))].join(""));if(null!=c&&!ed(c))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"or","or",1876275696,null),Pd(new C(null,"nil?","nil?",1612038930,null),new C(null,"m","m",-1021758608,null)),Pd(new C(null,"map?","map?",-1780568534,null),
new C(null,"m","m",-1021758608,null)))],0)))].join(""));if(!oe(new td(null,new t(null,11,[ih,null,sh,null,wh,null,zh,null,Gh,null,vi,null,yi,null,Xi,null,rj,null,Cj,null,Ej,null],null),null),Af(c)))throw Error([y("Assert failed: "),y(V.B(y,"build options contains invalid keys, only :key, :key-fn :react-key, ",":fn, :init-state, :state, and :opts allowed, given ",Ke.c(", ",Af(c)))),y("\n"),y(Ae.j(Q([Pd(new C(null,"valid-opts?","valid-opts?",1000038576,null),new C(null,"m","m",-1021758608,null))],0)))].join(""));
if(null==c){var g=Yn.e(Nm),k=so.e(to.c(a,b)),g={children:function(){return function(c){c=a.c?a.c(b,c):a.call(null,b,c);ro(c,a);return c}}(g,k),__om_instrument:Om,__om_descriptor:Pm,__om_app_state:Qm,__om_root_key:Rm,__om_shared:g,__om_cursor:b};return k.e?k.e(g):k.call(null,g)}var l=ld(c)?V.c(we,c):c,m=U.c(l,rj),n=U.c(l,vi),p=U.c(l,yi),r=U.c(l,Xi),w=U.c(l,Gh),z=U.c(c,sh),D=null!=z?function(){var a=Cj.e(c);return u(a)?z.c?z.c(b,a):z.call(null,b,a):z.e?z.e(b):z.call(null,b)}():b,H=null!=w?U.c(D,w):
null!=r?r.e?r.e(D):r.call(null,D):U.c(c,zh),g=function(){var a=Ej.e(c);return u(a)?a:Yn.e(Nm)}(),k=so.c(to.h(a,D,m),ih.e(c)),P;P=u(H)?H:void 0;g={__om_state:p,__om_instrument:Om,children:null==m?function(b,c,e,f,g,k,l,m,n){return function(b){b=a.c?a.c(n,b):a.call(null,n,b);ro(b,a);return b}}(c,l,m,n,p,r,w,z,D,H,g,k):function(b,c,e,f,g,k,l,m,n){return function(b){b=a.h?a.h(n,b,e):a.call(null,n,b,e);ro(b,a);return b}}(c,l,m,n,p,r,w,z,D,H,g,k),__om_init_state:n,key:P,__om_app_state:Qm,__om_cursor:D,
__om_index:Cj.e(c),__om_shared:g,__om_descriptor:Pm,__om_root_key:Rm};return k.e?k.e(g):k.call(null,g)}function a(a,b){return c.h(a,b,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),vo=function(){function b(a,b,c){if(!nd(a))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"ifn?","ifn?",-2106461064,null),new C(null,"f","f",43394975,null))],0)))].join(""));
if(null!=c&&!ed(c))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"or","or",1876275696,null),Pd(new C(null,"nil?","nil?",1612038930,null),new C(null,"m","m",-1021758608,null)),Pd(new C(null,"map?","map?",-1780568534,null),new C(null,"m","m",-1021758608,null)))],0)))].join(""));if(null!=Om){var g=Om.h?Om.h(a,b,c):Om.call(null,a,b,c);return L.c(g,si)?uo.h(a,b,c):g}return uo.h(a,b,c)}function a(a,b){return c.h(a,b,null)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,
c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}();
function wo(b,a,c){if(!(b?u(u(null)?null:b.Dd)||(b.R?0:v(In,b)):v(In,b))){var d=ye.e?ye.e(sd):ye.call(null,sd),e=ye.e?ye.e(sd):ye.call(null,sd),f=ye.e?ye.e(vd):ye.call(null,vd);b.xe=!0;b.sc=function(a,b,c,d){return function(){return M.e?M.e(d):M.call(null,d)}}(b,d,e,f);b.tc=function(a,b,c,d){return function(a,b){if(pd(M.e?M.e(d):M.call(null,d),b))return null;Be.h(d,Rc,b);return Be.c(this,Dd)}}(b,d,e,f);b.rc=function(a,b,c,d){return function(){return Be.c(d,Sc)}}(b,d,e,f);b.Dd=!0;b.oc=function(a,b,
c){return function(a,b,d){null!=d&&Be.B(c,Vc,b,d);return this}}(b,d,e,f);b.qc=function(a,b,c){return function(a,b){Be.h(c,Wc,b);return this}}(b,d,e,f);b.pc=function(a,b,c){return function(a,b,d){a=E(M.e?M.e(c):M.call(null,c));for(var e=null,f=0,g=0;;)if(g<f){var k=e.Q(null,g);S.h(k,0,null);var k=S.h(k,1,null),H=b,P=d;k.c?k.c(H,P):k.call(null,H,P);g+=1}else if(a=E(a))gd(a)?(f=Wb(a),a=Xb(a),e=f,f=R(f)):(e=G(a),S.h(e,0,null),e=S.h(e,1,null),f=b,g=d,e.c?e.c(f,g):e.call(null,f,g),a=K(a),e=null,f=0),g=
0;else break;return this}}(b,d,e,f);b.Ae=!0;b.wc=function(a,b){return function(a,c,d,e){return Be.B(b,Ue,new W(null,2,5,X,[c,d],null),e)}}(b,d,e,f);b.Be=function(a,b){return function(a,c,d){return Be.B(b,Wc,c,d)}}(b,d,e,f);b.vc=function(a,b){return function(a,c){return Be.h(b,Wc,c)}}(b,d,e,f);b.uc=function(a,b){return function(a,c,d){return Te.c(M.e?M.e(b):M.call(null,b),new W(null,2,5,X,[c,d],null))}}(b,d,e,f)}return Jn(b,a,c)}
var xo=function xo(a,c){if(Tn(a)){var d=Pa(a);d.ye=!0;d.ze=function(){return function(){return c}}(d);d.te=!0;d.ic=function(){return function(d,f){return xo(Pn(a,f),c)}}(d);d.Mc=!0;d.T=function(){return function(){return xo(Pa(a),c)}}(d);return d}return a},yo=function(){function b(a,b){if("string"!==typeof b)throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"string?","string?",-1129175764,null),new C(null,"name","name",-810760592,null))],0)))].join(""));var c=a.refs;return u(c)?c[b].getDOMNode():
null}function a(a){return a.getDOMNode()}var c=null,c=function(c,e){switch(arguments.length){case 1:return a.call(this,c);case 2:return b.call(this,c,e)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.c=b;return c}(),zo=function(){function b(a,b,c){if(!u(Un(a)))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"component?","component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));b=dd(b)?b:new W(null,1,5,X,[b],null);return vn.B(a,b,c,!0)}function a(a,
b){if(!u(Un(a)))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"component?","component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));return vn.h(a,b,!0)}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}(),Ao=function(){function b(a,b,c){if(!u(Un(a)))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"component?",
"component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));if(!nd(c))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"ifn?","ifn?",-2106461064,null),new C(null,"f","f",43394975,null))],0)))].join(""));return zo.h(a,b,function(){var g=Xn.c(a,b);return c.e?c.e(g):c.call(null,g)}())}function a(a,b){if(!u(Un(a)))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"component?","component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));
if(!nd(b))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"ifn?","ifn?",-2106461064,null),new C(null,"f","f",43394975,null))],0)))].join(""));return zo.c(a,function(){var c=Xn.e(a);return b.e?b.e(c):b.call(null,c)}())}var c=null,c=function(c,e,f){switch(arguments.length){case 2:return a.call(this,c,e);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.c=a;c.h=b;return c}();var Bo=function(){function b(b,d){var e=null;if(1<arguments.length){for(var e=0,f=Array(arguments.length-1);e<f.length;)f[e]=arguments[e+1],++e;e=new F(f,0)}return a.call(this,b,e)}function a(a,b){return console[a].apply(console,La.e(b))}b.v=1;b.l=function(b){var d=G(b);b=I(b);return a(d,b)};b.j=a;return b}(),Co=function(){function b(a){if(0<arguments.length)for(var b=0,d=Array(arguments.length-0);b<d.length;)d[b]=arguments[b+0],++b;return null}b.v=0;b.l=function(a){E(a);return null};b.j=function(){return null};
return b}(),Do=function(){function b(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return a.call(this,d)}function a(a){return V.c(Bo,O("error",a))}b.v=0;b.l=function(b){b=E(b);return a(b)};b.j=a;return b}(),Eo=function(){function b(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return a.call(this,d)}function a(a){return V.c(Bo,O("warn",a))}
b.v=0;b.l=function(b){b=E(b);return a(b)};b.j=a;return b}();var Fo,Ho=new W(null,3,5,X,[El(el,new C(null,"data","data",1407862150,null)),El(el,new C(null,"_","_",-1201019570,null)),El(el,new C(null,"_","_",-1201019570,null))],null),Io=cl(Ho),Jo=cl(el),Ko=function(b,a,c,d,e){return function g(k,l,m){var n=b.Ea();if(u(n)){var p=new W(null,3,5,X,[k,l,m],null),r=d.e?d.e(p):d.call(null,p);if(u(r))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"status-component","status-component",2119421421,null),Ae.j(Q([r],0))],0)),new t(null,4,[Nj,r,di,
p,$g,c,ui,yh],null));}p=function(){for(;;)return"undefined"===typeof Fo&&(Fo=function(a,b,c,d,e,g,k,l,m,n,p,r,Ca){this.od=a;this.data=b;this.Jc=c;this.ce=d;this.xa=e;this.Ic=g;this.ld=k;this.$d=l;this.Bb=m;this.Xd=n;this.Kc=p;this.Ab=r;this.sd=Ca;this.C=0;this.o=393216},Fo.prototype.Ub=!0,Fo.prototype.Jb=function(){return function(){return"status-component"}}(n,b,a,c,d,e),Fo.prototype.Kb=!0,Fo.prototype.Lb=function(){return function(){return V.h(React.DOM.div,{className:"status"},Qe(new W(null,1,
5,X,[this.data],null)))}}(n,b,a,c,d,e),Fo.prototype.I=function(){return function(){return this.sd}}(n,b,a,c,d,e),Fo.prototype.K=function(){return function(a,b){return new Fo(this.od,this.data,this.Jc,this.ce,this.xa,this.Ic,this.ld,this.$d,this.Bb,this.Xd,this.Kc,this.Ab,b)}}(n,b,a,c,d,e),Fo.kb=!0,Fo.jb="editor.views.status/t51017",Fo.xb=function(){return function(a,b){return Jb(b,"editor.views.status/t51017")}}(n,b,a,c,d,e)),new Fo(c,k,l,g,m,k,d,a,n,e,m,b,null)}();if(u(n)&&(r=e.e?e.e(p):e.call(null,
p),u(r)))throw Qg.c(Hk.j("Output of %s does not match schema: %s",Q([new C(null,"status-component","status-component",2119421421,null),Ae.j(Q([r],0))],0)),new t(null,4,[Nj,r,di,p,$g,a,ui,yh],null));return p}}(Vk,el,Ho,Io,Jo);Tk(Ko,Jl(el,new W(null,1,5,X,[Ho],null)));Dm&&Jm("9");!Fm||Jm("528");Em&&Jm("1.9b")||Dm&&Jm("8")||Cm&&Jm("9.5")||Fm&&Jm("528");Em&&!Jm("8")||Dm&&Jm("9");var Lo;function Mo(b){b=JSON.parse(b);return Lg.j(b,Q([Kg,!0],0))};var No=Lg.j(platform,Q([Kg,!0],0)),Oo=null!=window["faceboard-env"]?Lg.j(faceboard_env,Q([Kg,!0],0)):sd,Po=L.c(Te.c(No,new W(null,2,5,X,[Uj,th],null)),"OS X");Qi.e(Oo);if("undefined"===typeof Qo){var Qo,Ro=new t(null,2,[kj,"",Aj,new t(null,2,[bi,Qc,Gj,""],null)],null);Qo=ye.e?ye.e(Ro):ye.call(null,Ro)};function So(b){b=Mo(b);b=Ue(M.e?M.e(Qo):M.call(null,Qo),new W(null,1,5,X,[Aj],null),b);return ze.c?ze.c(Qo,b):ze.call(null,Qo,b)}var To=["editor","exports","drive"],Uo=aa;To[0]in Uo||!Uo.execScript||Uo.execScript("var "+To[0]);for(var Vo;To.length&&(Vo=To.shift());){var Wo;if(Wo=!To.length)Wo=void 0!==So;Wo?Uo[Vo]=So:Uo=Uo[Vo]?Uo[Vo]:Uo[Vo]={}}window.drive=So;var Xo=function(b){return Ka.h(function(a,b){var d=S.h(b,0,null),e=S.h(b,1,null);return Vc.h(a,e,d)},sd,b)}(Uc([Rg,Sg,Vg,Wg,Zg,ah,bh,ch,dh,fh,gh,hh,jh,kh,lh,mh,ph,qh,rh,uh,xh,va,Ah,Bh,Dh,Eh,Fh,Ih,Jh,Kh,Lh,Mh,Oh,Ph,Qh,Rh,Sh,Xh,Zh,$h,ci,ei,fi,hi,ii,ji,mi,oi,pi,qi,ri,ti,wi,xi,zi,Bi,Hi,Ii,Ji,Ki,Li,Mi,Pi,Ri,Si,Ti,Wi,Yi,Zi,$i,bj,dj,ej,fj,gj,jj,lj,nj,oj,qj,sj,tj,uj,vj,xj,yj,zj,Bj,Dj,Fj,Ij,Jj,Mj,Oj,Pj,Qj,Rj,Sj,Wj,Xj,ak,bk,ck,dk,ek,hk,jk,kk,lk,nk,qk,sk,tk,vk,xk,zk],[89,48,16,49,81,104,59,191,40,63,224,82,
32,111,36,45,96,86,3,119,79,91,56,112,229,0,91,121,183,224,102,110,18,166,145,27,255,78,87,77,188,105,33,103,144,92,116,20,219,189,106,192,46,51,93,53,187,52,69,17,83,76,38,75,12,13,90,71,98,122,67,222,107,101,74,114,72,113,192,57,99,221,50,93,186,123,55,66,61,39,68,70,19,8,100,118,84,88,190,44,120,34,35,173,9,117,115,80,54,73,97,109,65,220,37,85]));
function Yo(b){return Rc.c(fg(Af(Ne.c(Ld,new t(null,4,[Ki,md(b.ctrlKey),Vg,md(b.shiftKey),Oh,md(b.altKey),va,md(b.metaKey)],null)))),function(){var a=b.keyCode;return Xo.e?Xo.e(a):Xo.call(null,a)}())};function Zo(b,a,c){this.key=b;this.val=a;this.forward=c;this.C=0;this.o=2155872256}Zo.prototype.G=function(b,a,c){return pg(a,vg,"["," ","]",c,this)};Zo.prototype.M=function(){return A(A(J,this.val),this.key)};
(function(){function b(a,b,c){c=Array(c+1);for(var g=0;;)if(g<c.length)c[g]=null,g+=1;else break;return new Zo(a,b,c)}function a(a){return c.h(null,null,a)}var c=null,c=function(c,e,f){switch(arguments.length){case 1:return a.call(this,c);case 3:return b.call(this,c,e,f)}throw Error("Invalid arity: "+arguments.length);};c.e=a;c.h=b;return c})().e(0);(function $o(a){"undefined"===typeof Lo&&(Lo=function(a,d,e){this.gb=a;this.hd=d;this.vd=e;this.C=0;this.o=393216},Lo.prototype.I=function(){return this.vd},Lo.prototype.K=function(a,d){return new Lo(this.gb,this.hd,d)},Lo.kb=!0,Lo.jb="cljs.core.async/t54314",Lo.xb=function(a,d){return Jb(d,"cljs.core.async/t54314")});return new Lo(a,$o,sd)})(function(){return null});var ap,bp,cp;function dp(){return u(ap)?Aa(ap.isClean.call(ap)):null}function ep(b){window.setTimeout(function(){var a=Vc.h(M.e?M.e(Qo):M.call(null,Qo),kj,b);return ze.c?ze.c(Qo,a):ze.call(null,Qo,a)},0)}
function fp(){var b=bp,a=null==ap?null:ap.getValue.call(ap);ep("");try{Mo(a);var c=window.opener.faceboardApplyJSON;if(u(c)){var d;d=JSON.stringify(Hg(new W(null,2,5,X,[b,a],null)),null,2);c.e?c.e(d):c.call(null,d)}return ap.markClean.call(ap)}catch(e){if(e instanceof Object)return ep("The JSON is malformed!"),Do.j(Q([e],0));throw e;}}function gp(b){if(null!=ap){var a=ap.getCursor.call(ap);ap.setValue.call(ap,b);u(a)&&ap.setCursor.call(ap,a);ap.markClean.call(ap)}}
function hp(b){return V.c(y,Ke.c("/",De.c(function(a){return Hg(a)},b)))}function ip(b){var a=hp(bp),c=hp(bi.e(b));b=Gj.e(b);var d;d=null==ap?null:ap.getValue.call(ap);d=u(d)?d:b;var e=dp();return u(e)?L.c(a,c)&&!L.c(d,b):e}function jp(b,a){b.preventDefault();return u(a)?!0===confirm("Really overwrite external changes? This is most likely not a good idea.")?fp():null:fp()}
var kp=new W(null,1,5,X,[new W(null,3,5,X,[new td(null,new t(null,2,[va,null,Li,null],null),null),new td(null,new t(null,2,[Ki,null,Li,null],null),null),Ei],null)],null);function lp(b,a){var c=S.h(a,0,null),d=S.h(a,1,null),e=S.h(a,2,null),c=u(Po)?L.c(b,c):Po,d=u(c)?c:Aa(Po)&&L.c(b,d);return u(d)?e:null}function mp(b){return Ka.h(function(a,c){return Rc.c(a,lp(b,c))},vd,kp)}
var np=new W(null,2,5,X,[El(el,new C(null,"data","data",1407862150,null)),El(el,new C(null,"owner","owner",1247919588,null))],null),op=cl(np),pp=cl(el),qp=function(b,a,c,d,e){return function g(k,l){var m=b.Ea();if(u(m)){var n=new W(null,2,5,X,[k,l],null),p=d.e?d.e(n):d.call(null,n);if(u(p))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"editor-component","editor-component",1191234199,null),Ae.j(Q([p],0))],0)),new t(null,4,[Nj,p,di,n,$g,c,ui,yh],null));}n=function(){for(;;)return"undefined"===
typeof cp&&(cp=function(a,b,c,d,e,g,k,l,m,n,p,wb){this.Dc=a;this.Vb=b;this.data=c;this.Vd=d;this.Yd=e;this.ed=g;this.Bb=k;this.Ec=l;this.Ab=m;this.md=n;this.jd=p;this.qd=wb;this.C=0;this.o=393216},cp.prototype.Ub=!0,cp.prototype.Jb=function(){return function(){return"editor-component"}}(m,b,a,c,d,e),cp.prototype.yd=!0,cp.prototype.jc=function(a,b,c,d,e,g){return function(){var k=this,l=function(){var a=yo.c(k.Vb,"host"),b={lineWrapping:!0,gutters:["CodeMirror-linenumbers","CodeMirror-foldgutter"],
foldGutter:!0,matchBrackets:!0,smartIndent:!0,value:Te.h(k.data,new W(null,2,5,X,[Aj,Gj],null),""),mode:{json:!0,name:"javascript"},lint:!0,"viewportMargin:":Infinity,lineNumbers:!0,styleActiveLine:!0,autoCloseBrackets:!0};return CodeMirror(a,b)}(),m=l.defaultCharWidth.call(l);l.on.call(l,"renderLine",function(a,b,c,d,e,g,k,l,m,n){return function(p,r,w){var z=function(){return function(a,b){var c=(new RegExp(a,"g")).exec(b);return u(c)?R(c[0]):0}}(a,b,c,d,e,g,k,l,m,n);r=r.text;p=p.getOption.call(p,
"tabSize");p=CodeMirror.countColumn.call(CodeMirror,r,null,p)*b;z=z('".*"\\: "',r);z=p+z*b;w.style.textIndent=[y("-"),y(z),y("px")].join("");return w.style.paddingLeft=[y(c+z),y("px")].join("")}}(l,m,4,this,a,b,c,d,e,g));return ap=l}}(m,b,a,c,d,e),cp.prototype.Kb=!0,cp.prototype.Lb=function(a,b,c,d,e,g){return function(){var k=this,l=this,m=k.data,n=hp(bi.e(m)),p=Gj.e(m),wb=dp(),ka=ip(m);u(wb)||(gp(p),bp=bi.e(m));return V.h(React.DOM.div,{className:Fk([y("editor"),y(u(ka)?" danger":null),y(u(wb)?
" unsaved":null)].join(""))},Qe(new W(null,4,5,X,[V.h(React.DOM.div,{className:"info"},Qe(new W(null,1,5,X,[V.h(React.DOM.div,{className:"path-row"},Qe(new W(null,2,5,X,["JSON PATH: ",V.h(React.DOM.span,{className:"path"},Qe(new W(null,1,5,X,[n],null)))],null)))],null))),function(){var k={onKeyDown:Fk(function(a,b,c,d,e){return function(a){return u(Ei.e(mp(Yo(a))))?jp(a,e):null}}(m,n,p,wb,ka,l,a,b,c,d,e,g)),className:"editor-host",ref:"host"};return React.DOM.div(k)}(),V.h(React.DOM.div,{className:"docs"},
Qe(new W(null,2,5,X,["docs: ",React.DOM.a({href:"https://github.com/darwin/faceboard/wiki/format",target:"_blank"},"https://github.com/darwin/faceboard/wiki/format")],null))),V.h(React.DOM.div,{className:"buttons"},Qe(new W(null,2,5,X,[V.h(React.DOM.div,{onClick:Fk(function(a,b,c,d,e){return function(a){return jp(a,e)}}(m,n,p,wb,ka,l,a,b,c,d,e,g)),title:"Save model and update the app.",className:"button hint"},Qe(new W(null,1,5,X,[u(Po)?"save (CMD+S)":"save (CTRL+S)"],null))),u(ka)?function(){ep("Someone else just modified this data behind your back!");
var Ca={onClick:Fk(function(a,b,c){return function(){gp(c);var a=k.Vb;if(!u(Un(a)))throw Error([y("Assert failed: "),y(Ae.j(Q([Pd(new C(null,"component?","component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));return Ao.c(a,Dd)}}(m,n,p,wb,ka,l,a,b,c,d,e,g)),title:"This will throw away your changes since last save.",className:"button refresh"};return React.DOM.div(Ca,"discard my changes")}():null],null)))],null)))}}(m,b,a,c,d,e),cp.prototype.I=function(){return function(){return this.qd}}(m,
b,a,c,d,e),cp.prototype.K=function(){return function(a,b){return new cp(this.Dc,this.Vb,this.data,this.Vd,this.Yd,this.ed,this.Bb,this.Ec,this.Ab,this.md,this.jd,b)}}(m,b,a,c,d,e),cp.kb=!0,cp.jb="editor.views.editor/t50935",cp.xb=function(){return function(a,b){return Jb(b,"editor.views.editor/t50935")}}(m,b,a,c,d,e)),new cp(k,l,k,e,a,g,m,l,b,c,d,null)}();if(u(m)&&(p=e.e?e.e(n):e.call(null,n),u(p)))throw Qg.c(Hk.j("Output of %s does not match schema: %s",Q([new C(null,"editor-component","editor-component",
1191234199,null),Ae.j(Q([p],0))],0)),new t(null,4,[Nj,p,di,n,$g,a,ui,yh],null));return n}}(Vk,el,np,op,pp);Tk(qp,Jl(el,new W(null,1,5,X,[np],null)));var rp,sp=new W(null,3,5,X,[El(el,new C(null,"data","data",1407862150,null)),El(el,new C(null,"_","_",-1201019570,null)),El(el,new C(null,"_","_",-1201019570,null))],null),tp=cl(sp),up=cl(el),vp=function(b,a,c,d,e){return function g(k,l,m){var n=b.Ea();if(u(n)){var p=new W(null,3,5,X,[k,l,m],null),r=d.e?d.e(p):d.call(null,p);if(u(r))throw Qg.c(Hk.j("Input to %s does not match schema: %s",Q([new C(null,"main-component","main-component",-40016256,null),Ae.j(Q([r],0))],0)),new t(null,4,[Nj,r,di,p,$g,
c,ui,yh],null));}p=function(){for(;;)return"undefined"===typeof rp&&(rp=function(a,b,c,d,e,g,k,l,m,n,p,r,Ca){this.pd=a;this.Fc=b;this.data=c;this.Hc=d;this.xa=e;this.Wd=g;this.Zd=k;this.Bb=l;this.nd=m;this.Gc=n;this.Ab=p;this.kd=r;this.rd=Ca;this.C=0;this.o=393216},rp.prototype.Ub=!0,rp.prototype.Jb=function(){return function(){return"main-component"}}(n,b,a,c,d,e),rp.prototype.Kb=!0,rp.prototype.Lb=function(){return function(){var a;try{var b=window.opener.faceboardApplyJSON;u(b)&&Co.j(Q(["apply-fn",
b],0));a=!1}catch(c){if(c instanceof Object)Eo.j(Q(["disable the popup blocker"],0)),a=!0;else throw c;}return Aa(a)?V.h(React.DOM.div,{className:"editor-main"},Qe(new W(null,2,5,X,[vo.c(qp,Aj.e(this.data)),vo.c(Ko,kj.e(this.data))],null))):V.h(React.DOM.div,{className:"editor-main"},Qe(new W(null,1,5,X,[V.h(React.DOM.div,{className:"warning"},Qe(new W(null,8,5,X,["Please disable popup blocking for this domain.",React.DOM.br(null),""+y(location.host),React.DOM.br(null),React.DOM.br(null),"Then ",
React.DOM.a({href:"javascript:window.close()"},"close this popup")," and then open Faceboard Editor again."],null)))],null)))}}(n,b,a,c,d,e),rp.prototype.I=function(){return function(){return this.rd}}(n,b,a,c,d,e),rp.prototype.K=function(){return function(a,b){return new rp(this.pd,this.Fc,this.data,this.Hc,this.xa,this.Wd,this.Zd,this.Bb,this.nd,this.Gc,this.Ab,this.kd,b)}}(n,b,a,c,d,e),rp.kb=!0,rp.jb="editor.views.main/t50982",rp.xb=function(){return function(a,b){return Jb(b,"editor.views.main/t50982")}}(n,
b,a,c,d,e)),new rp(g,k,k,m,m,e,a,n,c,l,b,d,null)}();if(u(n)&&(r=e.e?e.e(p):e.call(null,p),u(r)))throw Qg.c(Hk.j("Output of %s does not match schema: %s",Q([new C(null,"main-component","main-component",-40016256,null),Ae.j(Q([r],0))],0)),new t(null,4,[Nj,r,di,p,$g,a,ui,yh],null));return p}}(Vk,el,sp,tp,up);Tk(vp,Jl(el,new W(null,1,5,X,[sp],null)));oa=function(){function b(b){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new F(e,0)}return a.call(this,d)}function a(a){return console.log.apply(console,La.e?La.e(a):La.call(null,a))}b.v=0;b.l=function(b){b=E(b);return a(b)};b.j=a;return b}();
(function(b,a,c){var d=ld(c)?V.c(we,c):c,e=U.c(d,Hj),f=U.c(d,Yh),g=U.c(d,ih),k=U.c(d,wh),l=U.c(d,Ug),m=U.c(d,wk),n=U.c(d,Yj);if(!nd(b))throw Error([y("Assert failed: "),y("First argument must be a function"),y("\n"),y(Ae.j(Q([Pd(new C(null,"ifn?","ifn?",-2106461064,null),new C(null,"f","f",43394975,null))],0)))].join(""));if(null==n)throw Error([y("Assert failed: "),y("No target specified to om.core/root"),y("\n"),y(Ae.j(Q([Pd(new C(null,"not","not",1044554643,null),Pd(new C(null,"nil?","nil?",1612038930,
null),new C(null,"target","target",1893533248,null)))],0)))].join(""));var p=M.e?M.e(qo):M.call(null,qo);pd(p,n)&&U.c(p,n).call(null);p=Bg.t();a=(a?a.C&16384||a.fe||(a.C?0:v(Zb,a)):v(Zb,a))?a:ye.e?ye.e(a):ye.call(null,a);var r=wo(a,p,m),w=u(f)?f:Dd,z=Wc.j(d,Yj,Q([wk,Ug,Yh,Hj],0)),D=ye.e?ye.e(null):ye.call(null,null),H=function(a,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H){return function Ab(){Be.h(oo,$c,Ab);var c=M.e?M.e(d):M.call(null,d),k=function(){var b=xo(null==z?Gn.h(c,d,Qc):Gn.h(Te.c(c,z),d,z),a);return e.e?
e.e(b):e.call(null,b)}();if(!u(On(d,a,Hh))){var l=Bk(function(){var c=Pm,e=Om,g=Qm,l=Rm;Pm=r;Om=w;Qm=d;Rm=a;try{return vo.h(b,k,f)}finally{Rm=l,Qm=g,Om=e,Pm=c}}(),H);null==(M.e?M.e(g):M.call(null,g))&&(ze.c?ze.c(g,l):ze.call(null,g,l))}l=wn(d);yn(d);if(!ad(l))for(var l=E(l),m=null,n=0,p=0;;)if(p<n){var D=m.Q(null,p);if(u(D.isMounted())){var N=D.state.__om_next_cursor;u(N)&&(D.props.__om_cursor=N,D.state.__om_next_cursor=null);u(function(){var a=Vn(D);return(a=!(a?u(u(null)?null:a.wd)||(a.R?0:v(qn,
a)):v(qn,a)))?a:D.shouldComponentUpdate(D.props,D.state)}())&&D.forceUpdate()}p+=1}else if(l=E(l)){m=l;if(gd(m))l=Wb(m),p=Xb(m),m=l,n=R(l),l=p;else{var ka=G(m);u(ka.isMounted())&&(l=ka.state.__om_next_cursor,u(l)&&(ka.props.__om_cursor=l,ka.state.__om_next_cursor=null),u(function(){var a=Vn(ka);return(a=!(a?u(u(null)?null:a.wd)||(a.R?0:v(qn,a)):v(qn,a)))?a:ka.shouldComponentUpdate(ka.props,ka.state)}())&&ka.forceUpdate());l=K(m);m=null;n=0}p=0}else break;l=M.e?M.e(mo):M.call(null,mo);if(!ad(l))for(l=
E(l),m=null,p=n=0;;)if(p<n){N=m.Q(null,p);S.h(N,0,null);for(var Ca=S.h(N,1,null),N=function(){var a=Ca;return M.e?M.e(a):M.call(null,a)}(),N=E(N),ia=null,Ha=0,cb=0;;)if(cb<Ha){var wb=ia.Q(null,cb);S.h(wb,0,null);wb=S.h(wb,1,null);u(wb.shouldComponentUpdate(wb.props,wb.state))&&wb.forceUpdate();cb+=1}else if(N=E(N))gd(N)?(Ha=Wb(N),N=Xb(N),ia=Ha,Ha=R(Ha)):(ia=G(N),S.h(ia,0,null),ia=S.h(ia,1,null),u(ia.shouldComponentUpdate(ia.props,ia.state))&&ia.forceUpdate(),N=K(N),ia=null,Ha=0),cb=0;else break;p+=
1}else if(l=E(l)){if(gd(l))n=Wb(l),l=Xb(l),m=n,n=R(n);else{m=G(l);S.h(m,0,null);for(var Go=S.h(m,1,null),m=function(){var a=Go;return M.e?M.e(a):M.call(null,a)}(),m=E(m),n=null,N=p=0;;)if(N<p)ia=n.Q(null,N),S.h(ia,0,null),ia=S.h(ia,1,null),u(ia.shouldComponentUpdate(ia.props,ia.state))&&ia.forceUpdate(),N+=1;else if(m=E(m))gd(m)?(p=Wb(m),m=Xb(m),n=p,p=R(p)):(n=G(m),S.h(n,0,null),n=S.h(n,1,null),u(n.shouldComponentUpdate(n.props,n.state))&&n.forceUpdate(),m=K(m),n=null,p=0),N=0;else break;l=K(l);m=
null;n=0}p=0}else break;Mn(d,a,Hh,!0);return M.e?M.e(g):M.call(null,g)}}(p,a,r,w,z,D,c,d,d,e,f,g,k,l,m,n);zg(r,p,function(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H){return function(Ab,$b,ac,pc){Aa(On(c,a,Ni))&&ac!==pc&&Mn(c,a,Hh,!1);Mn(c,a,Ni,!1);pd(M.e?M.e(oo):M.call(null,oo),g)||Be.h(oo,Rc,g);if(u(no))return null;no=!0;return!1===n||"undefined"===typeof requestAnimationFrame?setTimeout(function(a,b,c){return function(){return po.e(c)}}(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H),16):Xc(n)?n.t?n.t():n.call(null):
requestAnimationFrame(function(a,b,c){return function(){return po.e(c)}}(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H))}}(p,a,r,w,z,D,H,c,d,d,e,f,g,k,l,m,n));Be.B(qo,Vc,n,function(a,b,c,d,e,f,g,k,l,m,n,p,r,w,z,D,H){return function(){Nn(c,a);Pb(c,a);Kn(c,a);Be.h(oo,$c,g);Be.h(qo,Wc,H);return React.unmountComponentAtNode(H)}}(p,a,r,w,z,D,H,c,d,d,e,f,g,k,l,m,n));return H()})(vp,Qo,new t(null,1,[Yj,document.getElementById("app")],null));var wp=window.opener.faceboardPerformRefresh;u(wp)&&(wp.t?wp.t():wp.call(null));
})();

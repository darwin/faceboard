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
 * DOM event delegator
 *
 * The delegator will listen
 * for events that bubble up
 * to the root node.
 *
 * @constructor
 * @param {Node|string} [root] The root node or a selector string matching the root node
 */
function Delegate(root) {

  /**
   * Maintain a map of listener
   * lists, keyed by event name.
   *
   * @type Object
   */
  this.listenerMap = [{}, {}];
  if (root) {
    this.root(root);
  }

  /** @type function() */
  this.handle = Delegate.prototype.handle.bind(this);
}

/**
 * Start listening for events
 * on the provided DOM element
 *
 * @param  {Node|string} [root] The root node or a selector string matching the root node
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.root = function(root) {
  var listenerMap = this.listenerMap;
  var eventType;

  // Remove master event listeners
  if (this.rootElement) {
    for (eventType in listenerMap[1]) {
      if (listenerMap[1].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, true);
      }
    }
    for (eventType in listenerMap[0]) {
      if (listenerMap[0].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, false);
      }
    }
  }

  // If no root or root is not
  // a dom node, then remove internal
  // root reference and exit here
  if (!root || !root.addEventListener) {
    if (this.rootElement) {
      delete this.rootElement;
    }
    return this;
  }

  /**
   * The root node at which
   * listeners are attached.
   *
   * @type Node
   */
  this.rootElement = root;

  // Set up master event listeners
  for (eventType in listenerMap[1]) {
    if (listenerMap[1].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, true);
    }
  }
  for (eventType in listenerMap[0]) {
    if (listenerMap[0].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, false);
    }
  }

  return this;
};

/**
 * @param {string} eventType
 * @returns boolean
 */
Delegate.prototype.captureForType = function(eventType) {
  return ['blur', 'error', 'focus', 'load', 'resize', 'scroll'].indexOf(eventType) !== -1;
};

/**
 * Attach a handler to one
 * event for all elements
 * that match the selector,
 * now or in the future
 *
 * The handler function receives
 * three arguments: the DOM event
 * object, the node that matched
 * the selector while the event
 * was bubbling and a reference
 * to itself. Within the handler,
 * 'this' is equal to the second
 * argument.
 *
 * The node that actually received
 * the event can be accessed via
 * 'event.target'.
 *
 * @param {string} eventType Listen for these events
 * @param {string|undefined} selector Only handle events on elements matching this selector, if undefined match root element
 * @param {function()} handler Handler function - event data passed here will be in event.data
 * @param {Object} [eventData] Data to pass in event.data
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.on = function(eventType, selector, handler, useCapture) {
  var root, listenerMap, matcher, matcherParam;

  if (!eventType) {
    throw new TypeError('Invalid event type: ' + eventType);
  }

  // handler can be passed as
  // the second or third argument
  if (typeof selector === 'function') {
    useCapture = handler;
    handler = selector;
    selector = null;
  }

  // Fallback to sensible defaults
  // if useCapture not set
  if (useCapture === undefined) {
    useCapture = this.captureForType(eventType);
  }

  if (typeof handler !== 'function') {
    throw new TypeError('Handler must be a type of Function');
  }

  root = this.rootElement;
  listenerMap = this.listenerMap[useCapture ? 1 : 0];

  // Add master handler for type if not created yet
  if (!listenerMap[eventType]) {
    if (root) {
      root.addEventListener(eventType, this.handle, useCapture);
    }
    listenerMap[eventType] = [];
  }

  if (!selector) {
    matcherParam = null;

    // COMPLEX - matchesRoot needs to have access to
    // this.rootElement, so bind the function to this.
    matcher = matchesRoot.bind(this);

  // Compile a matcher for the given selector
  } else if (/^[a-z]+$/i.test(selector)) {
    matcherParam = selector;
    matcher = matchesTag;
  } else if (/^#[a-z0-9\-_]+$/i.test(selector)) {
    matcherParam = selector.slice(1);
    matcher = matchesId;
  } else {
    matcherParam = selector;
    matcher = matches;
  }

  // Add to the list of listeners
  listenerMap[eventType].push({
    selector: selector,
    handler: handler,
    matcher: matcher,
    matcherParam: matcherParam
  });

  return this;
};

/**
 * Remove an event handler
 * for elements that match
 * the selector, forever
 *
 * @param {string} [eventType] Remove handlers for events matching this type, considering the other parameters
 * @param {string} [selector] If this parameter is omitted, only handlers which match the other two will be removed
 * @param {function()} [handler] If this parameter is omitted, only handlers which match the previous two will be removed
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.off = function(eventType, selector, handler, useCapture) {
  var i, listener, listenerMap, listenerList, singleEventType;

  // Handler can be passed as
  // the second or third argument
  if (typeof selector === 'function') {
    useCapture = handler;
    handler = selector;
    selector = null;
  }

  // If useCapture not set, remove
  // all event listeners
  if (useCapture === undefined) {
    this.off(eventType, selector, handler, true);
    this.off(eventType, selector, handler, false);
    return this;
  }

  listenerMap = this.listenerMap[useCapture ? 1 : 0];
  if (!eventType) {
    for (singleEventType in listenerMap) {
      if (listenerMap.hasOwnProperty(singleEventType)) {
        this.off(singleEventType, selector, handler);
      }
    }

    return this;
  }

  listenerList = listenerMap[eventType];
  if (!listenerList || !listenerList.length) {
    return this;
  }

  // Remove only parameter matches
  // if specified
  for (i = listenerList.length - 1; i >= 0; i--) {
    listener = listenerList[i];

    if ((!selector || selector === listener.selector) && (!handler || handler === listener.handler)) {
      listenerList.splice(i, 1);
    }
  }

  // All listeners removed
  if (!listenerList.length) {
    delete listenerMap[eventType];

    // Remove the main handler
    if (this.rootElement) {
      this.rootElement.removeEventListener(eventType, this.handle, useCapture);
    }
  }

  return this;
};


/**
 * Handle an arbitrary event.
 *
 * @param {Event} event
 */
Delegate.prototype.handle = function(event) {
  var i, l, type = event.type, root, phase, listener, returned, listenerList = [], target, /** @const */ EVENTIGNORE = 'ftLabsDelegateIgnore';

  if (event[EVENTIGNORE] === true) {
    return;
  }

  target = event.target;

  // Hardcode value of Node.TEXT_NODE
  // as not defined in IE8
  if (target.nodeType === 3) {
    target = target.parentNode;
  }

  root = this.rootElement;

  phase = event.eventPhase || ( event.target !== event.currentTarget ? 3 : 2 );
  
  switch (phase) {
    case 1: //Event.CAPTURING_PHASE:
      listenerList = this.listenerMap[1][type];
    break;
    case 2: //Event.AT_TARGET:
      if (this.listenerMap[0] && this.listenerMap[0][type]) listenerList = listenerList.concat(this.listenerMap[0][type]);
      if (this.listenerMap[1] && this.listenerMap[1][type]) listenerList = listenerList.concat(this.listenerMap[1][type]);
    break;
    case 3: //Event.BUBBLING_PHASE:
      listenerList = this.listenerMap[0][type];
    break;
  }

  // Need to continuously check
  // that the specific list is
  // still populated in case one
  // of the callbacks actually
  // causes the list to be destroyed.
  l = listenerList.length;
  while (target && l) {
    for (i = 0; i < l; i++) {
      listener = listenerList[i];

      // Bail from this loop if
      // the length changed and
      // no more listeners are
      // defined between i and l.
      if (!listener) {
        break;
      }

      // Check for match and fire
      // the event if there's one
      //
      // TODO:MCG:20120117: Need a way
      // to check if event#stopImmediatePropagation
      // was called. If so, break both loops.
      if (listener.matcher.call(target, listener.matcherParam, target)) {
        returned = this.fire(event, target, listener);
      }

      // Stop propagation to subsequent
      // callbacks if the callback returned
      // false
      if (returned === false) {
        event[EVENTIGNORE] = true;
        event.preventDefault();
        return;
      }
    }

    // TODO:MCG:20120117: Need a way to
    // check if event#stopPropagation
    // was called. If so, break looping
    // through the DOM. Stop if the
    // delegation root has been reached
    if (target === root) {
      break;
    }

    l = listenerList.length;
    target = target.parentElement;
  }
};

/**
 * Fire a listener on a target.
 *
 * @param {Event} event
 * @param {Node} target
 * @param {Object} listener
 * @returns {boolean}
 */
Delegate.prototype.fire = function(event, target, listener) {
  return listener.handler.call(target, event, target);
};

/**
 * Check whether an element
 * matches a generic selector.
 *
 * @type function()
 * @param {string} selector A CSS selector
 */
var matches = (function(el) {
  if (!el) return;
  var p = el.prototype;
  return (p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector);
}(Element));

/**
 * Check whether an element
 * matches a tag selector.
 *
 * Tags are NOT case-sensitive,
 * except in XML (and XML-based
 * languages such as XHTML).
 *
 * @param {string} tagName The tag name to test against
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesTag(tagName, element) {
  return tagName.toLowerCase() === element.tagName.toLowerCase();
}

/**
 * Check whether an element
 * matches the root.
 *
 * @param {?String} selector In this case this is always passed through as null and not used
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesRoot(selector, element) {
  /*jshint validthis:true*/
  if (this.rootElement === window) return element === document;
  return this.rootElement === element;
}

/**
 * Check whether the ID of
 * the element in 'this'
 * matches the given ID.
 *
 * IDs are case-sensitive.
 *
 * @param {string} id The ID to test against
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesId(id, element) {
  return id === element.id;
}

/**
 * Short hand for off()
 * and root(), ie both
 * with no parameters
 *
 * @return void
 */
Delegate.prototype.destroy = function() {
  this.off();
  this.root();
};
/**
* Detect Element Resize
*
* https://github.com/sdecima/javascript-detect-element-resize
* Sebastian Decima
*
* version: 0.5.3
**/

(function () {
	var attachEvent = document.attachEvent,
		stylesCreated = false;

	if (!attachEvent) {
		var requestFrame = (function(){
			var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
								function(fn){ return window.setTimeout(fn, 20); };
			return function(fn){ return raf(fn); };
		})();

		var cancelFrame = (function(){
			var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
								   window.clearTimeout;
		  return function(id){ return cancel(id); };
		})();

		function resetTriggers(element){
			var triggers = element.__resizeTriggers__,
				expand = triggers.firstElementChild,
				contract = triggers.lastElementChild,
				expandChild = expand.firstElementChild;
			contract.scrollLeft = contract.scrollWidth;
			contract.scrollTop = contract.scrollHeight;
			expandChild.style.width = expand.offsetWidth + 1 + 'px';
			expandChild.style.height = expand.offsetHeight + 1 + 'px';
			expand.scrollLeft = expand.scrollWidth;
			expand.scrollTop = expand.scrollHeight;
		};

		function checkTriggers(element){
			return element.offsetWidth != element.__resizeLast__.width ||
						 element.offsetHeight != element.__resizeLast__.height;
		}

		function scrollListener(e){
			var element = this;
			resetTriggers(this);
			if (this.__resizeRAF__) cancelFrame(this.__resizeRAF__);
			this.__resizeRAF__ = requestFrame(function(){
				if (checkTriggers(element)) {
					element.__resizeLast__.width = element.offsetWidth;
					element.__resizeLast__.height = element.offsetHeight;
					element.__resizeListeners__.forEach(function(fn){
						fn.call(element, e);
					});
				}
			});
		};

		/* Detect CSS Animations support to detect element display/re-attach */
		var animation = false,
			animationstring = 'animation',
			keyframeprefix = '',
			animationstartevent = 'animationstart',
			domPrefixes = 'Webkit Moz O ms'.split(' '),
			startEvents = 'webkitAnimationStart animationstart oAnimationStart MSAnimationStart'.split(' '),
			pfx  = '';
		{
			var elm = document.createElement('fakeelement');
			if( elm.style.animationName !== undefined ) { animation = true; }

			if( animation === false ) {
				for( var i = 0; i < domPrefixes.length; i++ ) {
					if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
						pfx = domPrefixes[ i ];
						animationstring = pfx + 'Animation';
						keyframeprefix = '-' + pfx.toLowerCase() + '-';
						animationstartevent = startEvents[ i ];
						animation = true;
						break;
					}
				}
			}
		}

		var animationName = 'resizeanim';
		var animationKeyframes = '@' + keyframeprefix + 'keyframes ' + animationName + ' { from { opacity: 0; } to { opacity: 0; } } ';
		var animationStyle = keyframeprefix + 'animation: 1ms ' + animationName + '; ';
	}

	function createStyles() {
		if (!stylesCreated) {
			//opacity:0 works around a chrome bug https://code.google.com/p/chromium/issues/detail?id=286360
			var css = (animationKeyframes ? animationKeyframes : '') +
					'.resize-triggers { ' + (animationStyle ? animationStyle : '') + 'visibility: hidden; opacity: 0; } ' +
					'.resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }',
				head = document.head || document.getElementsByTagName('head')[0],
				style = document.createElement('style');

			style.type = 'text/css';
			if (style.styleSheet) {
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(document.createTextNode(css));
			}

			head.appendChild(style);
			stylesCreated = true;
		}
	}

	window.addResizeListener = function(element, fn){
		if (attachEvent) element.attachEvent('onresize', fn);
		else {
			if (!element.__resizeTriggers__) {
				if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
				createStyles();
				element.__resizeLast__ = {};
				element.__resizeListeners__ = [];
				(element.__resizeTriggers__ = document.createElement('div')).className = 'resize-triggers';
				element.__resizeTriggers__.innerHTML = '<div class="expand-trigger"><div></div></div>' +
																						'<div class="contract-trigger"></div>';
				element.appendChild(element.__resizeTriggers__);
				resetTriggers(element);
				element.addEventListener('scroll', scrollListener, true);

				/* Listen for a css animation to detect element display/re-attach */
				animationstartevent && element.__resizeTriggers__.addEventListener(animationstartevent, function(e) {
					if(e.animationName == animationName)
						resetTriggers(element);
				});
			}
			element.__resizeListeners__.push(fn);
		}
	};

	window.removeResizeListener = function(element, fn){
		if (attachEvent) element.detachEvent('onresize', fn);
		else {
			element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
			if (!element.__resizeListeners__.length) {
					element.removeEventListener('scroll', scrollListener);
					element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
			}
		}
	}
})();
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
 * React v0.13.3
 *
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.React=e()}}(function(){return function e(t,n,r){function o(a,u){if(!n[a]){if(!t[a]){var s="function"==typeof require&&require;if(!u&&s)return s(a,!0);if(i)return i(a,!0);var l=new Error("Cannot find module '"+a+"'");throw l.code="MODULE_NOT_FOUND",l}var c=n[a]={exports:{}};t[a][0].call(c.exports,function(e){var n=t[a][1][e];return o(n?n:e)},c,c.exports,e,t,n,r)}return n[a].exports}for(var i="function"==typeof require&&require,a=0;a<r.length;a++)o(r[a]);return o}({1:[function(e,t,n){"use strict";var r=e(19),o=e(32),i=e(34),a=e(33),u=e(38),s=e(39),l=e(55),c=(e(56),e(40)),p=e(51),d=e(54),f=e(64),h=e(68),m=e(73),v=e(76),g=e(79),y=e(82),C=e(27),E=e(115),b=e(142);d.inject();var _=l.createElement,x=l.createFactory,D=l.cloneElement,M=m.measure("React","render",h.render),N={Children:{map:o.map,forEach:o.forEach,count:o.count,only:b},Component:i,DOM:c,PropTypes:v,initializeTouchEvents:function(e){r.useTouchEvents=e},createClass:a.createClass,createElement:_,cloneElement:D,createFactory:x,createMixin:function(e){return e},constructAndRenderComponent:h.constructAndRenderComponent,constructAndRenderComponentByID:h.constructAndRenderComponentByID,findDOMNode:E,render:M,renderToString:y.renderToString,renderToStaticMarkup:y.renderToStaticMarkup,unmountComponentAtNode:h.unmountComponentAtNode,isValidElement:l.isValidElement,withContext:u.withContext,__spread:C};"undefined"!=typeof __REACT_DEVTOOLS_GLOBAL_HOOK__&&"function"==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.inject&&__REACT_DEVTOOLS_GLOBAL_HOOK__.inject({CurrentOwner:s,InstanceHandles:f,Mount:h,Reconciler:g,TextComponent:p});N.version="0.13.3",t.exports=N},{115:115,142:142,19:19,27:27,32:32,33:33,34:34,38:38,39:39,40:40,51:51,54:54,55:55,56:56,64:64,68:68,73:73,76:76,79:79,82:82}],2:[function(e,t,n){"use strict";var r=e(117),o={componentDidMount:function(){this.props.autoFocus&&r(this.getDOMNode())}};t.exports=o},{117:117}],3:[function(e,t,n){"use strict";function r(){var e=window.opera;return"object"==typeof e&&"function"==typeof e.version&&parseInt(e.version(),10)<=12}function o(e){return(e.ctrlKey||e.altKey||e.metaKey)&&!(e.ctrlKey&&e.altKey)}function i(e){switch(e){case T.topCompositionStart:return P.compositionStart;case T.topCompositionEnd:return P.compositionEnd;case T.topCompositionUpdate:return P.compositionUpdate}}function a(e,t){return e===T.topKeyDown&&t.keyCode===b}function u(e,t){switch(e){case T.topKeyUp:return-1!==E.indexOf(t.keyCode);case T.topKeyDown:return t.keyCode!==b;case T.topKeyPress:case T.topMouseDown:case T.topBlur:return!0;default:return!1}}function s(e){var t=e.detail;return"object"==typeof t&&"data"in t?t.data:null}function l(e,t,n,r){var o,l;if(_?o=i(e):w?u(e,r)&&(o=P.compositionEnd):a(e,r)&&(o=P.compositionStart),!o)return null;M&&(w||o!==P.compositionStart?o===P.compositionEnd&&w&&(l=w.getData()):w=v.getPooled(t));var c=g.getPooled(o,n,r);if(l)c.data=l;else{var p=s(r);null!==p&&(c.data=p)}return h.accumulateTwoPhaseDispatches(c),c}function c(e,t){switch(e){case T.topCompositionEnd:return s(t);case T.topKeyPress:var n=t.which;return n!==N?null:(R=!0,I);case T.topTextInput:var r=t.data;return r===I&&R?null:r;default:return null}}function p(e,t){if(w){if(e===T.topCompositionEnd||u(e,t)){var n=w.getData();return v.release(w),w=null,n}return null}switch(e){case T.topPaste:return null;case T.topKeyPress:return t.which&&!o(t)?String.fromCharCode(t.which):null;case T.topCompositionEnd:return M?null:t.data;default:return null}}function d(e,t,n,r){var o;if(o=D?c(e,r):p(e,r),!o)return null;var i=y.getPooled(P.beforeInput,n,r);return i.data=o,h.accumulateTwoPhaseDispatches(i),i}var f=e(15),h=e(20),m=e(21),v=e(22),g=e(91),y=e(95),C=e(139),E=[9,13,27,32],b=229,_=m.canUseDOM&&"CompositionEvent"in window,x=null;m.canUseDOM&&"documentMode"in document&&(x=document.documentMode);var D=m.canUseDOM&&"TextEvent"in window&&!x&&!r(),M=m.canUseDOM&&(!_||x&&x>8&&11>=x),N=32,I=String.fromCharCode(N),T=f.topLevelTypes,P={beforeInput:{phasedRegistrationNames:{bubbled:C({onBeforeInput:null}),captured:C({onBeforeInputCapture:null})},dependencies:[T.topCompositionEnd,T.topKeyPress,T.topTextInput,T.topPaste]},compositionEnd:{phasedRegistrationNames:{bubbled:C({onCompositionEnd:null}),captured:C({onCompositionEndCapture:null})},dependencies:[T.topBlur,T.topCompositionEnd,T.topKeyDown,T.topKeyPress,T.topKeyUp,T.topMouseDown]},compositionStart:{phasedRegistrationNames:{bubbled:C({onCompositionStart:null}),captured:C({onCompositionStartCapture:null})},dependencies:[T.topBlur,T.topCompositionStart,T.topKeyDown,T.topKeyPress,T.topKeyUp,T.topMouseDown]},compositionUpdate:{phasedRegistrationNames:{bubbled:C({onCompositionUpdate:null}),captured:C({onCompositionUpdateCapture:null})},dependencies:[T.topBlur,T.topCompositionUpdate,T.topKeyDown,T.topKeyPress,T.topKeyUp,T.topMouseDown]}},R=!1,w=null,O={eventTypes:P,extractEvents:function(e,t,n,r){return[l(e,t,n,r),d(e,t,n,r)]}};t.exports=O},{139:139,15:15,20:20,21:21,22:22,91:91,95:95}],4:[function(e,t,n){"use strict";function r(e,t){return e+t.charAt(0).toUpperCase()+t.substring(1)}var o={boxFlex:!0,boxFlexGroup:!0,columnCount:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,strokeDashoffset:!0,strokeOpacity:!0,strokeWidth:!0},i=["Webkit","ms","Moz","O"];Object.keys(o).forEach(function(e){i.forEach(function(t){o[r(t,e)]=o[e]})});var a={background:{backgroundImage:!0,backgroundPosition:!0,backgroundRepeat:!0,backgroundColor:!0},border:{borderWidth:!0,borderStyle:!0,borderColor:!0},borderBottom:{borderBottomWidth:!0,borderBottomStyle:!0,borderBottomColor:!0},borderLeft:{borderLeftWidth:!0,borderLeftStyle:!0,borderLeftColor:!0},borderRight:{borderRightWidth:!0,borderRightStyle:!0,borderRightColor:!0},borderTop:{borderTopWidth:!0,borderTopStyle:!0,borderTopColor:!0},font:{fontStyle:!0,fontVariant:!0,fontWeight:!0,fontSize:!0,lineHeight:!0,fontFamily:!0}},u={isUnitlessNumber:o,shorthandPropertyExpansions:a};t.exports=u},{}],5:[function(e,t,n){"use strict";var r=e(4),o=e(21),i=(e(106),e(111)),a=e(131),u=e(141),s=(e(150),u(function(e){return a(e)})),l="cssFloat";o.canUseDOM&&void 0===document.documentElement.style.cssFloat&&(l="styleFloat");var c={createMarkupForStyles:function(e){var t="";for(var n in e)if(e.hasOwnProperty(n)){var r=e[n];null!=r&&(t+=s(n)+":",t+=i(n,r)+";")}return t||null},setValueForStyles:function(e,t){var n=e.style;for(var o in t)if(t.hasOwnProperty(o)){var a=i(o,t[o]);if("float"===o&&(o=l),a)n[o]=a;else{var u=r.shorthandPropertyExpansions[o];if(u)for(var s in u)n[s]="";else n[o]=""}}}};t.exports=c},{106:106,111:111,131:131,141:141,150:150,21:21,4:4}],6:[function(e,t,n){"use strict";function r(){this._callbacks=null,this._contexts=null}var o=e(28),i=e(27),a=e(133);i(r.prototype,{enqueue:function(e,t){this._callbacks=this._callbacks||[],this._contexts=this._contexts||[],this._callbacks.push(e),this._contexts.push(t)},notifyAll:function(){var e=this._callbacks,t=this._contexts;if(e){a(e.length===t.length),this._callbacks=null,this._contexts=null;for(var n=0,r=e.length;r>n;n++)e[n].call(t[n]);e.length=0,t.length=0}},reset:function(){this._callbacks=null,this._contexts=null},destructor:function(){this.reset()}}),o.addPoolingTo(r),t.exports=r},{133:133,27:27,28:28}],7:[function(e,t,n){"use strict";function r(e){return"SELECT"===e.nodeName||"INPUT"===e.nodeName&&"file"===e.type}function o(e){var t=x.getPooled(T.change,R,e);E.accumulateTwoPhaseDispatches(t),_.batchedUpdates(i,t)}function i(e){C.enqueueEvents(e),C.processEventQueue()}function a(e,t){P=e,R=t,P.attachEvent("onchange",o)}function u(){P&&(P.detachEvent("onchange",o),P=null,R=null)}function s(e,t,n){return e===I.topChange?n:void 0}function l(e,t,n){e===I.topFocus?(u(),a(t,n)):e===I.topBlur&&u()}function c(e,t){P=e,R=t,w=e.value,O=Object.getOwnPropertyDescriptor(e.constructor.prototype,"value"),Object.defineProperty(P,"value",k),P.attachEvent("onpropertychange",d)}function p(){P&&(delete P.value,P.detachEvent("onpropertychange",d),P=null,R=null,w=null,O=null)}function d(e){if("value"===e.propertyName){var t=e.srcElement.value;t!==w&&(w=t,o(e))}}function f(e,t,n){return e===I.topInput?n:void 0}function h(e,t,n){e===I.topFocus?(p(),c(t,n)):e===I.topBlur&&p()}function m(e,t,n){return e!==I.topSelectionChange&&e!==I.topKeyUp&&e!==I.topKeyDown||!P||P.value===w?void 0:(w=P.value,R)}function v(e){return"INPUT"===e.nodeName&&("checkbox"===e.type||"radio"===e.type)}function g(e,t,n){return e===I.topClick?n:void 0}var y=e(15),C=e(17),E=e(20),b=e(21),_=e(85),x=e(93),D=e(134),M=e(136),N=e(139),I=y.topLevelTypes,T={change:{phasedRegistrationNames:{bubbled:N({onChange:null}),captured:N({onChangeCapture:null})},dependencies:[I.topBlur,I.topChange,I.topClick,I.topFocus,I.topInput,I.topKeyDown,I.topKeyUp,I.topSelectionChange]}},P=null,R=null,w=null,O=null,S=!1;b.canUseDOM&&(S=D("change")&&(!("documentMode"in document)||document.documentMode>8));var A=!1;b.canUseDOM&&(A=D("input")&&(!("documentMode"in document)||document.documentMode>9));var k={get:function(){return O.get.call(this)},set:function(e){w=""+e,O.set.call(this,e)}},L={eventTypes:T,extractEvents:function(e,t,n,o){var i,a;if(r(t)?S?i=s:a=l:M(t)?A?i=f:(i=m,a=h):v(t)&&(i=g),i){var u=i(e,t,n);if(u){var c=x.getPooled(T.change,u,o);return E.accumulateTwoPhaseDispatches(c),c}}a&&a(e,t,n)}};t.exports=L},{134:134,136:136,139:139,15:15,17:17,20:20,21:21,85:85,93:93}],8:[function(e,t,n){"use strict";var r=0,o={createReactRootIndex:function(){return r++}};t.exports=o},{}],9:[function(e,t,n){"use strict";function r(e,t,n){e.insertBefore(t,e.childNodes[n]||null)}var o=e(12),i=e(70),a=e(145),u=e(133),s={dangerouslyReplaceNodeWithMarkup:o.dangerouslyReplaceNodeWithMarkup,updateTextContent:a,processUpdates:function(e,t){for(var n,s=null,l=null,c=0;c<e.length;c++)if(n=e[c],n.type===i.MOVE_EXISTING||n.type===i.REMOVE_NODE){var p=n.fromIndex,d=n.parentNode.childNodes[p],f=n.parentID;u(d),s=s||{},s[f]=s[f]||[],s[f][p]=d,l=l||[],l.push(d)}var h=o.dangerouslyRenderMarkup(t);if(l)for(var m=0;m<l.length;m++)l[m].parentNode.removeChild(l[m]);for(var v=0;v<e.length;v++)switch(n=e[v],n.type){case i.INSERT_MARKUP:r(n.parentNode,h[n.markupIndex],n.toIndex);break;case i.MOVE_EXISTING:r(n.parentNode,s[n.parentID][n.fromIndex],n.toIndex);break;case i.TEXT_CONTENT:a(n.parentNode,n.textContent);break;case i.REMOVE_NODE:}}};t.exports=s},{12:12,133:133,145:145,70:70}],10:[function(e,t,n){"use strict";function r(e,t){return(e&t)===t}var o=e(133),i={MUST_USE_ATTRIBUTE:1,MUST_USE_PROPERTY:2,HAS_SIDE_EFFECTS:4,HAS_BOOLEAN_VALUE:8,HAS_NUMERIC_VALUE:16,HAS_POSITIVE_NUMERIC_VALUE:48,HAS_OVERLOADED_BOOLEAN_VALUE:64,injectDOMPropertyConfig:function(e){var t=e.Properties||{},n=e.DOMAttributeNames||{},a=e.DOMPropertyNames||{},s=e.DOMMutationMethods||{};e.isCustomAttribute&&u._isCustomAttributeFunctions.push(e.isCustomAttribute);for(var l in t){o(!u.isStandardName.hasOwnProperty(l)),u.isStandardName[l]=!0;var c=l.toLowerCase();if(u.getPossibleStandardName[c]=l,n.hasOwnProperty(l)){var p=n[l];u.getPossibleStandardName[p]=l,u.getAttributeName[l]=p}else u.getAttributeName[l]=c;u.getPropertyName[l]=a.hasOwnProperty(l)?a[l]:l,s.hasOwnProperty(l)?u.getMutationMethod[l]=s[l]:u.getMutationMethod[l]=null;var d=t[l];u.mustUseAttribute[l]=r(d,i.MUST_USE_ATTRIBUTE),u.mustUseProperty[l]=r(d,i.MUST_USE_PROPERTY),u.hasSideEffects[l]=r(d,i.HAS_SIDE_EFFECTS),u.hasBooleanValue[l]=r(d,i.HAS_BOOLEAN_VALUE),u.hasNumericValue[l]=r(d,i.HAS_NUMERIC_VALUE),u.hasPositiveNumericValue[l]=r(d,i.HAS_POSITIVE_NUMERIC_VALUE),u.hasOverloadedBooleanValue[l]=r(d,i.HAS_OVERLOADED_BOOLEAN_VALUE),o(!u.mustUseAttribute[l]||!u.mustUseProperty[l]),o(u.mustUseProperty[l]||!u.hasSideEffects[l]),o(!!u.hasBooleanValue[l]+!!u.hasNumericValue[l]+!!u.hasOverloadedBooleanValue[l]<=1)}}},a={},u={ID_ATTRIBUTE_NAME:"data-reactid",isStandardName:{},getPossibleStandardName:{},getAttributeName:{},getPropertyName:{},getMutationMethod:{},mustUseAttribute:{},mustUseProperty:{},hasSideEffects:{},hasBooleanValue:{},hasNumericValue:{},hasPositiveNumericValue:{},hasOverloadedBooleanValue:{},_isCustomAttributeFunctions:[],isCustomAttribute:function(e){for(var t=0;t<u._isCustomAttributeFunctions.length;t++){var n=u._isCustomAttributeFunctions[t];if(n(e))return!0}return!1},getDefaultValueForProperty:function(e,t){var n,r=a[e];return r||(a[e]=r={}),t in r||(n=document.createElement(e),r[t]=n[t]),r[t]},injection:i};t.exports=u},{133:133}],11:[function(e,t,n){"use strict";function r(e,t){return null==t||o.hasBooleanValue[e]&&!t||o.hasNumericValue[e]&&isNaN(t)||o.hasPositiveNumericValue[e]&&1>t||o.hasOverloadedBooleanValue[e]&&t===!1}var o=e(10),i=e(143),a=(e(150),{createMarkupForID:function(e){return o.ID_ATTRIBUTE_NAME+"="+i(e)},createMarkupForProperty:function(e,t){if(o.isStandardName.hasOwnProperty(e)&&o.isStandardName[e]){if(r(e,t))return"";var n=o.getAttributeName[e];return o.hasBooleanValue[e]||o.hasOverloadedBooleanValue[e]&&t===!0?n:n+"="+i(t)}return o.isCustomAttribute(e)?null==t?"":e+"="+i(t):null},setValueForProperty:function(e,t,n){if(o.isStandardName.hasOwnProperty(t)&&o.isStandardName[t]){var i=o.getMutationMethod[t];if(i)i(e,n);else if(r(t,n))this.deleteValueForProperty(e,t);else if(o.mustUseAttribute[t])e.setAttribute(o.getAttributeName[t],""+n);else{var a=o.getPropertyName[t];o.hasSideEffects[t]&&""+e[a]==""+n||(e[a]=n)}}else o.isCustomAttribute(t)&&(null==n?e.removeAttribute(t):e.setAttribute(t,""+n))},deleteValueForProperty:function(e,t){if(o.isStandardName.hasOwnProperty(t)&&o.isStandardName[t]){var n=o.getMutationMethod[t];if(n)n(e,void 0);else if(o.mustUseAttribute[t])e.removeAttribute(o.getAttributeName[t]);else{var r=o.getPropertyName[t],i=o.getDefaultValueForProperty(e.nodeName,r);o.hasSideEffects[t]&&""+e[r]===i||(e[r]=i)}}else o.isCustomAttribute(t)&&e.removeAttribute(t)}});t.exports=a},{10:10,143:143,150:150}],12:[function(e,t,n){"use strict";function r(e){return e.substring(1,e.indexOf(" "))}var o=e(21),i=e(110),a=e(112),u=e(125),s=e(133),l=/^(<[^ \/>]+)/,c="data-danger-index",p={dangerouslyRenderMarkup:function(e){s(o.canUseDOM);for(var t,n={},p=0;p<e.length;p++)s(e[p]),t=r(e[p]),t=u(t)?t:"*",n[t]=n[t]||[],n[t][p]=e[p];var d=[],f=0;for(t in n)if(n.hasOwnProperty(t)){var h,m=n[t];for(h in m)if(m.hasOwnProperty(h)){var v=m[h];m[h]=v.replace(l,"$1 "+c+'="'+h+'" ')}for(var g=i(m.join(""),a),y=0;y<g.length;++y){var C=g[y];C.hasAttribute&&C.hasAttribute(c)&&(h=+C.getAttribute(c),C.removeAttribute(c),s(!d.hasOwnProperty(h)),d[h]=C,f+=1)}}return s(f===d.length),s(d.length===e.length),d},dangerouslyReplaceNodeWithMarkup:function(e,t){s(o.canUseDOM),s(t),s("html"!==e.tagName.toLowerCase());var n=i(t,a)[0];e.parentNode.replaceChild(n,e)}};t.exports=p},{110:110,112:112,125:125,133:133,21:21}],13:[function(e,t,n){"use strict";var r=e(139),o=[r({ResponderEventPlugin:null}),r({SimpleEventPlugin:null}),r({TapEventPlugin:null}),r({EnterLeaveEventPlugin:null}),r({ChangeEventPlugin:null}),r({SelectEventPlugin:null}),r({BeforeInputEventPlugin:null}),r({AnalyticsEventPlugin:null}),r({MobileSafariClickEventPlugin:null})];t.exports=o},{139:139}],14:[function(e,t,n){"use strict";var r=e(15),o=e(20),i=e(97),a=e(68),u=e(139),s=r.topLevelTypes,l=a.getFirstReactDOM,c={mouseEnter:{registrationName:u({onMouseEnter:null}),dependencies:[s.topMouseOut,s.topMouseOver]},mouseLeave:{registrationName:u({onMouseLeave:null}),dependencies:[s.topMouseOut,s.topMouseOver]}},p=[null,null],d={eventTypes:c,extractEvents:function(e,t,n,r){if(e===s.topMouseOver&&(r.relatedTarget||r.fromElement))return null;if(e!==s.topMouseOut&&e!==s.topMouseOver)return null;var u;if(t.window===t)u=t;else{var d=t.ownerDocument;u=d?d.defaultView||d.parentWindow:window}var f,h;if(e===s.topMouseOut?(f=t,h=l(r.relatedTarget||r.toElement)||u):(f=u,h=t),f===h)return null;var m=f?a.getID(f):"",v=h?a.getID(h):"",g=i.getPooled(c.mouseLeave,m,r);g.type="mouseleave",g.target=f,g.relatedTarget=h;var y=i.getPooled(c.mouseEnter,v,r);return y.type="mouseenter",y.target=h,y.relatedTarget=f,o.accumulateEnterLeaveDispatches(g,y,m,v),p[0]=g,p[1]=y,p}};t.exports=d},{139:139,15:15,20:20,68:68,97:97}],15:[function(e,t,n){"use strict";var r=e(138),o=r({bubbled:null,captured:null}),i=r({topBlur:null,topChange:null,topClick:null,topCompositionEnd:null,topCompositionStart:null,topCompositionUpdate:null,topContextMenu:null,topCopy:null,topCut:null,topDoubleClick:null,topDrag:null,topDragEnd:null,topDragEnter:null,topDragExit:null,topDragLeave:null,topDragOver:null,topDragStart:null,topDrop:null,topError:null,topFocus:null,topInput:null,topKeyDown:null,topKeyPress:null,topKeyUp:null,topLoad:null,topMouseDown:null,topMouseMove:null,topMouseOut:null,topMouseOver:null,topMouseUp:null,topPaste:null,topReset:null,topScroll:null,topSelectionChange:null,topSubmit:null,topTextInput:null,topTouchCancel:null,topTouchEnd:null,topTouchMove:null,topTouchStart:null,topWheel:null}),a={topLevelTypes:i,PropagationPhases:o};t.exports=a},{138:138}],16:[function(e,t,n){var r=e(112),o={listen:function(e,t,n){return e.addEventListener?(e.addEventListener(t,n,!1),{remove:function(){e.removeEventListener(t,n,!1)}}):e.attachEvent?(e.attachEvent("on"+t,n),{remove:function(){e.detachEvent("on"+t,n)}}):void 0},capture:function(e,t,n){return e.addEventListener?(e.addEventListener(t,n,!0),{remove:function(){e.removeEventListener(t,n,!0)}}):{remove:r}},registerDefault:function(){}};t.exports=o},{112:112}],17:[function(e,t,n){"use strict";var r=e(18),o=e(19),i=e(103),a=e(118),u=e(133),s={},l=null,c=function(e){if(e){var t=o.executeDispatch,n=r.getPluginModuleForEvent(e);n&&n.executeDispatch&&(t=n.executeDispatch),o.executeDispatchesInOrder(e,t),e.isPersistent()||e.constructor.release(e)}},p=null,d={injection:{injectMount:o.injection.injectMount,injectInstanceHandle:function(e){p=e},getInstanceHandle:function(){return p},injectEventPluginOrder:r.injectEventPluginOrder,injectEventPluginsByName:r.injectEventPluginsByName},eventNameDispatchConfigs:r.eventNameDispatchConfigs,registrationNameModules:r.registrationNameModules,putListener:function(e,t,n){u(!n||"function"==typeof n);var r=s[t]||(s[t]={});r[e]=n},getListener:function(e,t){var n=s[t];return n&&n[e]},deleteListener:function(e,t){var n=s[t];n&&delete n[e]},deleteAllListeners:function(e){for(var t in s)delete s[t][e]},extractEvents:function(e,t,n,o){for(var a,u=r.plugins,s=0,l=u.length;l>s;s++){var c=u[s];if(c){var p=c.extractEvents(e,t,n,o);p&&(a=i(a,p))}}return a},enqueueEvents:function(e){e&&(l=i(l,e))},processEventQueue:function(){var e=l;l=null,a(e,c),u(!l)},__purge:function(){s={}},__getListenerBank:function(){return s}};t.exports=d},{103:103,118:118,133:133,18:18,19:19}],18:[function(e,t,n){"use strict";function r(){if(u)for(var e in s){var t=s[e],n=u.indexOf(e);if(a(n>-1),!l.plugins[n]){a(t.extractEvents),l.plugins[n]=t;var r=t.eventTypes;for(var i in r)a(o(r[i],t,i))}}}function o(e,t,n){a(!l.eventNameDispatchConfigs.hasOwnProperty(n)),l.eventNameDispatchConfigs[n]=e;var r=e.phasedRegistrationNames;if(r){for(var o in r)if(r.hasOwnProperty(o)){var u=r[o];i(u,t,n)}return!0}return e.registrationName?(i(e.registrationName,t,n),!0):!1}function i(e,t,n){a(!l.registrationNameModules[e]),l.registrationNameModules[e]=t,l.registrationNameDependencies[e]=t.eventTypes[n].dependencies}var a=e(133),u=null,s={},l={plugins:[],eventNameDispatchConfigs:{},registrationNameModules:{},registrationNameDependencies:{},injectEventPluginOrder:function(e){a(!u),u=Array.prototype.slice.call(e),r()},injectEventPluginsByName:function(e){var t=!1;for(var n in e)if(e.hasOwnProperty(n)){var o=e[n];s.hasOwnProperty(n)&&s[n]===o||(a(!s[n]),s[n]=o,t=!0)}t&&r()},getPluginModuleForEvent:function(e){var t=e.dispatchConfig;if(t.registrationName)return l.registrationNameModules[t.registrationName]||null;for(var n in t.phasedRegistrationNames)if(t.phasedRegistrationNames.hasOwnProperty(n)){var r=l.registrationNameModules[t.phasedRegistrationNames[n]];if(r)return r}return null},_resetEventPlugins:function(){u=null;for(var e in s)s.hasOwnProperty(e)&&delete s[e];l.plugins.length=0;var t=l.eventNameDispatchConfigs;for(var n in t)t.hasOwnProperty(n)&&delete t[n];var r=l.registrationNameModules;for(var o in r)r.hasOwnProperty(o)&&delete r[o]}};t.exports=l},{133:133}],19:[function(e,t,n){"use strict";function r(e){return e===v.topMouseUp||e===v.topTouchEnd||e===v.topTouchCancel}function o(e){return e===v.topMouseMove||e===v.topTouchMove}function i(e){return e===v.topMouseDown||e===v.topTouchStart}function a(e,t){var n=e._dispatchListeners,r=e._dispatchIDs;if(Array.isArray(n))for(var o=0;o<n.length&&!e.isPropagationStopped();o++)t(e,n[o],r[o]);else n&&t(e,n,r)}function u(e,t,n){e.currentTarget=m.Mount.getNode(n);var r=t(e,n);return e.currentTarget=null,r}function s(e,t){a(e,t),e._dispatchListeners=null,e._dispatchIDs=null}function l(e){var t=e._dispatchListeners,n=e._dispatchIDs;if(Array.isArray(t)){for(var r=0;r<t.length&&!e.isPropagationStopped();r++)if(t[r](e,n[r]))return n[r]}else if(t&&t(e,n))return n;return null}function c(e){var t=l(e);return e._dispatchIDs=null,e._dispatchListeners=null,t}function p(e){var t=e._dispatchListeners,n=e._dispatchIDs;h(!Array.isArray(t));var r=t?t(e,n):null;return e._dispatchListeners=null,e._dispatchIDs=null,r}function d(e){return!!e._dispatchListeners}var f=e(15),h=e(133),m={Mount:null,injectMount:function(e){m.Mount=e}},v=f.topLevelTypes,g={isEndish:r,isMoveish:o,isStartish:i,executeDirectDispatch:p,executeDispatch:u,executeDispatchesInOrder:s,executeDispatchesInOrderStopAtTrue:c,hasDispatches:d,injection:m,useTouchEvents:!1};t.exports=g},{133:133,15:15}],20:[function(e,t,n){"use strict";function r(e,t,n){var r=t.dispatchConfig.phasedRegistrationNames[n];return v(e,r)}function o(e,t,n){var o=t?m.bubbled:m.captured,i=r(e,n,o);i&&(n._dispatchListeners=f(n._dispatchListeners,i),n._dispatchIDs=f(n._dispatchIDs,e))}function i(e){e&&e.dispatchConfig.phasedRegistrationNames&&d.injection.getInstanceHandle().traverseTwoPhase(e.dispatchMarker,o,e)}function a(e,t,n){if(n&&n.dispatchConfig.registrationName){var r=n.dispatchConfig.registrationName,o=v(e,r);o&&(n._dispatchListeners=f(n._dispatchListeners,o),n._dispatchIDs=f(n._dispatchIDs,e))}}function u(e){e&&e.dispatchConfig.registrationName&&a(e.dispatchMarker,null,e)}function s(e){h(e,i)}function l(e,t,n,r){d.injection.getInstanceHandle().traverseEnterLeave(n,r,a,e,t)}function c(e){h(e,u)}var p=e(15),d=e(17),f=e(103),h=e(118),m=p.PropagationPhases,v=d.getListener,g={accumulateTwoPhaseDispatches:s,accumulateDirectDispatches:c,accumulateEnterLeaveDispatches:l};t.exports=g},{103:103,118:118,15:15,17:17}],21:[function(e,t,n){"use strict";var r=!("undefined"==typeof window||!window.document||!window.document.createElement),o={canUseDOM:r,canUseWorkers:"undefined"!=typeof Worker,canUseEventListeners:r&&!(!window.addEventListener&&!window.attachEvent),canUseViewport:r&&!!window.screen,isInWorker:!r};t.exports=o},{}],22:[function(e,t,n){"use strict";function r(e){this._root=e,this._startText=this.getText(),this._fallbackText=null}var o=e(28),i=e(27),a=e(128);i(r.prototype,{getText:function(){return"value"in this._root?this._root.value:this._root[a()]},getData:function(){if(this._fallbackText)return this._fallbackText;var e,t,n=this._startText,r=n.length,o=this.getText(),i=o.length;for(e=0;r>e&&n[e]===o[e];e++);var a=r-e;for(t=1;a>=t&&n[r-t]===o[i-t];t++);var u=t>1?1-t:void 0;return this._fallbackText=o.slice(e,u),this._fallbackText}}),o.addPoolingTo(r),t.exports=r},{128:128,27:27,28:28}],23:[function(e,t,n){"use strict";var r,o=e(10),i=e(21),a=o.injection.MUST_USE_ATTRIBUTE,u=o.injection.MUST_USE_PROPERTY,s=o.injection.HAS_BOOLEAN_VALUE,l=o.injection.HAS_SIDE_EFFECTS,c=o.injection.HAS_NUMERIC_VALUE,p=o.injection.HAS_POSITIVE_NUMERIC_VALUE,d=o.injection.HAS_OVERLOADED_BOOLEAN_VALUE;if(i.canUseDOM){var f=document.implementation;r=f&&f.hasFeature&&f.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")}var h={isCustomAttribute:RegExp.prototype.test.bind(/^(data|aria)-[a-z_][a-z\d_.\-]*$/),Properties:{accept:null,acceptCharset:null,accessKey:null,action:null,allowFullScreen:a|s,allowTransparency:a,alt:null,async:s,autoComplete:null,autoPlay:s,cellPadding:null,cellSpacing:null,charSet:a,checked:u|s,classID:a,className:r?a:u,cols:a|p,colSpan:null,content:null,contentEditable:null,contextMenu:a,controls:u|s,coords:null,crossOrigin:null,data:null,dateTime:a,defer:s,dir:null,disabled:a|s,download:d,draggable:null,encType:null,form:a,formAction:a,formEncType:a,formMethod:a,formNoValidate:s,formTarget:a,frameBorder:a,headers:null,height:a,hidden:a|s,high:null,href:null,hrefLang:null,htmlFor:null,httpEquiv:null,icon:null,id:u,label:null,lang:null,list:a,loop:u|s,low:null,manifest:a,marginHeight:null,marginWidth:null,max:null,maxLength:a,media:a,mediaGroup:null,method:null,min:null,multiple:u|s,muted:u|s,name:null,noValidate:s,open:s,optimum:null,pattern:null,placeholder:null,poster:null,preload:null,radioGroup:null,readOnly:u|s,rel:null,required:s,role:a,rows:a|p,rowSpan:null,sandbox:null,scope:null,scoped:s,scrolling:null,seamless:a|s,selected:u|s,shape:null,size:a|p,sizes:a,span:p,spellCheck:null,src:null,srcDoc:u,srcSet:a,start:c,step:null,style:null,tabIndex:null,target:null,title:null,type:null,useMap:null,value:u|l,width:a,wmode:a,autoCapitalize:null,autoCorrect:null,itemProp:a,itemScope:a|s,itemType:a,itemID:a,itemRef:a,property:null,unselectable:a},DOMAttributeNames:{acceptCharset:"accept-charset",className:"class",htmlFor:"for",httpEquiv:"http-equiv"},DOMPropertyNames:{autoCapitalize:"autocapitalize",autoComplete:"autocomplete",autoCorrect:"autocorrect",autoFocus:"autofocus",autoPlay:"autoplay",encType:"encoding",hrefLang:"hreflang",radioGroup:"radiogroup",spellCheck:"spellcheck",srcDoc:"srcdoc",srcSet:"srcset"}};t.exports=h},{10:10,21:21}],24:[function(e,t,n){"use strict";function r(e){l(null==e.props.checkedLink||null==e.props.valueLink)}function o(e){r(e),l(null==e.props.value&&null==e.props.onChange)}function i(e){r(e),l(null==e.props.checked&&null==e.props.onChange)}function a(e){this.props.valueLink.requestChange(e.target.value)}function u(e){this.props.checkedLink.requestChange(e.target.checked)}var s=e(76),l=e(133),c={button:!0,checkbox:!0,image:!0,hidden:!0,radio:!0,reset:!0,submit:!0},p={Mixin:{propTypes:{value:function(e,t,n){return!e[t]||c[e.type]||e.onChange||e.readOnly||e.disabled?null:new Error("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.")},checked:function(e,t,n){return!e[t]||e.onChange||e.readOnly||e.disabled?null:new Error("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.")},onChange:s.func}},getValue:function(e){return e.props.valueLink?(o(e),e.props.valueLink.value):e.props.value},getChecked:function(e){return e.props.checkedLink?(i(e),e.props.checkedLink.value):e.props.checked},getOnChange:function(e){return e.props.valueLink?(o(e),a):e.props.checkedLink?(i(e),u):e.props.onChange}};t.exports=p},{133:133,76:76}],25:[function(e,t,n){"use strict";function r(e){e.remove()}var o=e(30),i=e(103),a=e(118),u=e(133),s={trapBubbledEvent:function(e,t){u(this.isMounted());var n=this.getDOMNode();u(n);var r=o.trapBubbledEvent(e,t,n);this._localEventListeners=i(this._localEventListeners,r)},componentWillUnmount:function(){this._localEventListeners&&a(this._localEventListeners,r)}};t.exports=s},{103:103,118:118,133:133,30:30}],26:[function(e,t,n){"use strict";var r=e(15),o=e(112),i=r.topLevelTypes,a={eventTypes:null,extractEvents:function(e,t,n,r){if(e===i.topTouchStart){var a=r.target;a&&!a.onclick&&(a.onclick=o)}}};t.exports=a},{112:112,15:15}],27:[function(e,t,n){"use strict";function r(e,t){if(null==e)throw new TypeError("Object.assign target cannot be null or undefined");for(var n=Object(e),r=Object.prototype.hasOwnProperty,o=1;o<arguments.length;o++){var i=arguments[o];if(null!=i){var a=Object(i);for(var u in a)r.call(a,u)&&(n[u]=a[u])}}return n}t.exports=r},{}],28:[function(e,t,n){"use strict";var r=e(133),o=function(e){var t=this;if(t.instancePool.length){var n=t.instancePool.pop();return t.call(n,e),n}return new t(e)},i=function(e,t){var n=this;if(n.instancePool.length){var r=n.instancePool.pop();return n.call(r,e,t),r}return new n(e,t)},a=function(e,t,n){var r=this;if(r.instancePool.length){var o=r.instancePool.pop();return r.call(o,e,t,n),o}return new r(e,t,n)},u=function(e,t,n,r,o){var i=this;if(i.instancePool.length){var a=i.instancePool.pop();return i.call(a,e,t,n,r,o),a}return new i(e,t,n,r,o)},s=function(e){var t=this;r(e instanceof t),e.destructor&&e.destructor(),t.instancePool.length<t.poolSize&&t.instancePool.push(e)},l=10,c=o,p=function(e,t){var n=e;return n.instancePool=[],n.getPooled=t||c,n.poolSize||(n.poolSize=l),n.release=s,n},d={addPoolingTo:p,oneArgumentPooler:o,twoArgumentPooler:i,threeArgumentPooler:a,fiveArgumentPooler:u};t.exports=d},{133:133}],29:[function(e,t,n){"use strict";var r=e(115),o={getDOMNode:function(){return r(this)}};t.exports=o},{115:115}],30:[function(e,t,n){"use strict";function r(e){return Object.prototype.hasOwnProperty.call(e,m)||(e[m]=f++,p[e[m]]={}),p[e[m]]}var o=e(15),i=e(17),a=e(18),u=e(59),s=e(102),l=e(27),c=e(134),p={},d=!1,f=0,h={topBlur:"blur",topChange:"change",topClick:"click",topCompositionEnd:"compositionend",topCompositionStart:"compositionstart",topCompositionUpdate:"compositionupdate",topContextMenu:"contextmenu",topCopy:"copy",topCut:"cut",topDoubleClick:"dblclick",topDrag:"drag",topDragEnd:"dragend",topDragEnter:"dragenter",topDragExit:"dragexit",topDragLeave:"dragleave",topDragOver:"dragover",topDragStart:"dragstart",topDrop:"drop",topFocus:"focus",topInput:"input",topKeyDown:"keydown",topKeyPress:"keypress",topKeyUp:"keyup",topMouseDown:"mousedown",topMouseMove:"mousemove",topMouseOut:"mouseout",topMouseOver:"mouseover",topMouseUp:"mouseup",topPaste:"paste",topScroll:"scroll",topSelectionChange:"selectionchange",topTextInput:"textInput",topTouchCancel:"touchcancel",topTouchEnd:"touchend",topTouchMove:"touchmove",topTouchStart:"touchstart",topWheel:"wheel"},m="_reactListenersID"+String(Math.random()).slice(2),v=l({},u,{ReactEventListener:null,injection:{injectReactEventListener:function(e){e.setHandleTopLevel(v.handleTopLevel),v.ReactEventListener=e}},setEnabled:function(e){v.ReactEventListener&&v.ReactEventListener.setEnabled(e)},isEnabled:function(){return!(!v.ReactEventListener||!v.ReactEventListener.isEnabled())},listenTo:function(e,t){for(var n=t,i=r(n),u=a.registrationNameDependencies[e],s=o.topLevelTypes,l=0,p=u.length;p>l;l++){var d=u[l];i.hasOwnProperty(d)&&i[d]||(d===s.topWheel?c("wheel")?v.ReactEventListener.trapBubbledEvent(s.topWheel,"wheel",n):c("mousewheel")?v.ReactEventListener.trapBubbledEvent(s.topWheel,"mousewheel",n):v.ReactEventListener.trapBubbledEvent(s.topWheel,"DOMMouseScroll",n):d===s.topScroll?c("scroll",!0)?v.ReactEventListener.trapCapturedEvent(s.topScroll,"scroll",n):v.ReactEventListener.trapBubbledEvent(s.topScroll,"scroll",v.ReactEventListener.WINDOW_HANDLE):d===s.topFocus||d===s.topBlur?(c("focus",!0)?(v.ReactEventListener.trapCapturedEvent(s.topFocus,"focus",n),v.ReactEventListener.trapCapturedEvent(s.topBlur,"blur",n)):c("focusin")&&(v.ReactEventListener.trapBubbledEvent(s.topFocus,"focusin",n),v.ReactEventListener.trapBubbledEvent(s.topBlur,"focusout",n)),i[s.topBlur]=!0,i[s.topFocus]=!0):h.hasOwnProperty(d)&&v.ReactEventListener.trapBubbledEvent(d,h[d],n),i[d]=!0)}},trapBubbledEvent:function(e,t,n){
return v.ReactEventListener.trapBubbledEvent(e,t,n)},trapCapturedEvent:function(e,t,n){return v.ReactEventListener.trapCapturedEvent(e,t,n)},ensureScrollValueMonitoring:function(){if(!d){var e=s.refreshScrollValues;v.ReactEventListener.monitorScrollValue(e),d=!0}},eventNameDispatchConfigs:i.eventNameDispatchConfigs,registrationNameModules:i.registrationNameModules,putListener:i.putListener,getListener:i.getListener,deleteListener:i.deleteListener,deleteAllListeners:i.deleteAllListeners});t.exports=v},{102:102,134:134,15:15,17:17,18:18,27:27,59:59}],31:[function(e,t,n){"use strict";var r=e(79),o=e(116),i=e(132),a=e(147),u={instantiateChildren:function(e,t,n){var r=o(e);for(var a in r)if(r.hasOwnProperty(a)){var u=r[a],s=i(u,null);r[a]=s}return r},updateChildren:function(e,t,n,u){var s=o(t);if(!s&&!e)return null;var l;for(l in s)if(s.hasOwnProperty(l)){var c=e&&e[l],p=c&&c._currentElement,d=s[l];if(a(p,d))r.receiveComponent(c,d,n,u),s[l]=c;else{c&&r.unmountComponent(c,l);var f=i(d,null);s[l]=f}}for(l in e)!e.hasOwnProperty(l)||s&&s.hasOwnProperty(l)||r.unmountComponent(e[l]);return s},unmountChildren:function(e){for(var t in e){var n=e[t];r.unmountComponent(n)}}};t.exports=u},{116:116,132:132,147:147,79:79}],32:[function(e,t,n){"use strict";function r(e,t){this.forEachFunction=e,this.forEachContext=t}function o(e,t,n,r){var o=e;o.forEachFunction.call(o.forEachContext,t,r)}function i(e,t,n){if(null==e)return e;var i=r.getPooled(t,n);f(e,o,i),r.release(i)}function a(e,t,n){this.mapResult=e,this.mapFunction=t,this.mapContext=n}function u(e,t,n,r){var o=e,i=o.mapResult,a=!i.hasOwnProperty(n);if(a){var u=o.mapFunction.call(o.mapContext,t,r);i[n]=u}}function s(e,t,n){if(null==e)return e;var r={},o=a.getPooled(r,t,n);return f(e,u,o),a.release(o),d.create(r)}function l(e,t,n,r){return null}function c(e,t){return f(e,l,null)}var p=e(28),d=e(61),f=e(149),h=(e(150),p.twoArgumentPooler),m=p.threeArgumentPooler;p.addPoolingTo(r,h),p.addPoolingTo(a,m);var v={forEach:i,map:s,count:c};t.exports=v},{149:149,150:150,28:28,61:61}],33:[function(e,t,n){"use strict";function r(e,t){var n=D.hasOwnProperty(t)?D[t]:null;N.hasOwnProperty(t)&&y(n===_.OVERRIDE_BASE),e.hasOwnProperty(t)&&y(n===_.DEFINE_MANY||n===_.DEFINE_MANY_MERGED)}function o(e,t){if(t){y("function"!=typeof t),y(!d.isValidElement(t));var n=e.prototype;t.hasOwnProperty(b)&&M.mixins(e,t.mixins);for(var o in t)if(t.hasOwnProperty(o)&&o!==b){var i=t[o];if(r(n,o),M.hasOwnProperty(o))M[o](e,i);else{var a=D.hasOwnProperty(o),l=n.hasOwnProperty(o),c=i&&i.__reactDontBind,p="function"==typeof i,f=p&&!a&&!l&&!c;if(f)n.__reactAutoBindMap||(n.__reactAutoBindMap={}),n.__reactAutoBindMap[o]=i,n[o]=i;else if(l){var h=D[o];y(a&&(h===_.DEFINE_MANY_MERGED||h===_.DEFINE_MANY)),h===_.DEFINE_MANY_MERGED?n[o]=u(n[o],i):h===_.DEFINE_MANY&&(n[o]=s(n[o],i))}else n[o]=i}}}}function i(e,t){if(t)for(var n in t){var r=t[n];if(t.hasOwnProperty(n)){var o=n in M;y(!o);var i=n in e;y(!i),e[n]=r}}}function a(e,t){y(e&&t&&"object"==typeof e&&"object"==typeof t);for(var n in t)t.hasOwnProperty(n)&&(y(void 0===e[n]),e[n]=t[n]);return e}function u(e,t){return function(){var n=e.apply(this,arguments),r=t.apply(this,arguments);if(null==n)return r;if(null==r)return n;var o={};return a(o,n),a(o,r),o}}function s(e,t){return function(){e.apply(this,arguments),t.apply(this,arguments)}}function l(e,t){var n=t.bind(e);return n}function c(e){for(var t in e.__reactAutoBindMap)if(e.__reactAutoBindMap.hasOwnProperty(t)){var n=e.__reactAutoBindMap[t];e[t]=l(e,f.guard(n,e.constructor.displayName+"."+t))}}var p=e(34),d=(e(39),e(55)),f=e(58),h=e(65),m=e(66),v=(e(75),e(74),e(84)),g=e(27),y=e(133),C=e(138),E=e(139),b=(e(150),E({mixins:null})),_=C({DEFINE_ONCE:null,DEFINE_MANY:null,OVERRIDE_BASE:null,DEFINE_MANY_MERGED:null}),x=[],D={mixins:_.DEFINE_MANY,statics:_.DEFINE_MANY,propTypes:_.DEFINE_MANY,contextTypes:_.DEFINE_MANY,childContextTypes:_.DEFINE_MANY,getDefaultProps:_.DEFINE_MANY_MERGED,getInitialState:_.DEFINE_MANY_MERGED,getChildContext:_.DEFINE_MANY_MERGED,render:_.DEFINE_ONCE,componentWillMount:_.DEFINE_MANY,componentDidMount:_.DEFINE_MANY,componentWillReceiveProps:_.DEFINE_MANY,shouldComponentUpdate:_.DEFINE_ONCE,componentWillUpdate:_.DEFINE_MANY,componentDidUpdate:_.DEFINE_MANY,componentWillUnmount:_.DEFINE_MANY,updateComponent:_.OVERRIDE_BASE},M={displayName:function(e,t){e.displayName=t},mixins:function(e,t){if(t)for(var n=0;n<t.length;n++)o(e,t[n])},childContextTypes:function(e,t){e.childContextTypes=g({},e.childContextTypes,t)},contextTypes:function(e,t){e.contextTypes=g({},e.contextTypes,t)},getDefaultProps:function(e,t){e.getDefaultProps?e.getDefaultProps=u(e.getDefaultProps,t):e.getDefaultProps=t},propTypes:function(e,t){e.propTypes=g({},e.propTypes,t)},statics:function(e,t){i(e,t)}},N={replaceState:function(e,t){v.enqueueReplaceState(this,e),t&&v.enqueueCallback(this,t)},isMounted:function(){var e=h.get(this);return e&&e!==m.currentlyMountingInstance},setProps:function(e,t){v.enqueueSetProps(this,e),t&&v.enqueueCallback(this,t)},replaceProps:function(e,t){v.enqueueReplaceProps(this,e),t&&v.enqueueCallback(this,t)}},I=function(){};g(I.prototype,p.prototype,N);var T={createClass:function(e){var t=function(e,t){this.__reactAutoBindMap&&c(this),this.props=e,this.context=t,this.state=null;var n=this.getInitialState?this.getInitialState():null;y("object"==typeof n&&!Array.isArray(n)),this.state=n};t.prototype=new I,t.prototype.constructor=t,x.forEach(o.bind(null,t)),o(t,e),t.getDefaultProps&&(t.defaultProps=t.getDefaultProps()),y(t.prototype.render);for(var n in D)t.prototype[n]||(t.prototype[n]=null);return t.type=t,t},injection:{injectMixin:function(e){x.push(e)}}};t.exports=T},{133:133,138:138,139:139,150:150,27:27,34:34,39:39,55:55,58:58,65:65,66:66,74:74,75:75,84:84}],34:[function(e,t,n){"use strict";function r(e,t){this.props=e,this.context=t}{var o=e(84),i=e(133);e(150)}r.prototype.setState=function(e,t){i("object"==typeof e||"function"==typeof e||null==e),o.enqueueSetState(this,e),t&&o.enqueueCallback(this,t)},r.prototype.forceUpdate=function(e){o.enqueueForceUpdate(this),e&&o.enqueueCallback(this,e)};t.exports=r},{133:133,150:150,84:84}],35:[function(e,t,n){"use strict";var r=e(44),o=e(68),i={processChildrenUpdates:r.dangerouslyProcessChildrenUpdates,replaceNodeWithMarkupByID:r.dangerouslyReplaceNodeWithMarkupByID,unmountIDFromEnvironment:function(e){o.purgeID(e)}};t.exports=i},{44:44,68:68}],36:[function(e,t,n){"use strict";var r=e(133),o=!1,i={unmountIDFromEnvironment:null,replaceNodeWithMarkupByID:null,processChildrenUpdates:null,injection:{injectEnvironment:function(e){r(!o),i.unmountIDFromEnvironment=e.unmountIDFromEnvironment,i.replaceNodeWithMarkupByID=e.replaceNodeWithMarkupByID,i.processChildrenUpdates=e.processChildrenUpdates,o=!0}}};t.exports=i},{133:133}],37:[function(e,t,n){"use strict";function r(e){var t=e._currentElement._owner||null;if(t){var n=t.getName();if(n)return" Check the render method of `"+n+"`."}return""}var o=e(36),i=e(38),a=e(39),u=e(55),s=(e(56),e(65)),l=e(66),c=e(71),p=e(73),d=e(75),f=(e(74),e(79)),h=e(85),m=e(27),v=e(113),g=e(133),y=e(147),C=(e(150),1),E={construct:function(e){this._currentElement=e,this._rootNodeID=null,this._instance=null,this._pendingElement=null,this._pendingStateQueue=null,this._pendingReplaceState=!1,this._pendingForceUpdate=!1,this._renderedComponent=null,this._context=null,this._mountOrder=0,this._isTopLevel=!1,this._pendingCallbacks=null},mountComponent:function(e,t,n){this._context=n,this._mountOrder=C++,this._rootNodeID=e;var r=this._processProps(this._currentElement.props),o=this._processContext(this._currentElement._context),i=c.getComponentClassForElement(this._currentElement),a=new i(r,o);a.props=r,a.context=o,a.refs=v,this._instance=a,s.set(a,this);var u=a.state;void 0===u&&(a.state=u=null),g("object"==typeof u&&!Array.isArray(u)),this._pendingStateQueue=null,this._pendingReplaceState=!1,this._pendingForceUpdate=!1;var p,d,h=l.currentlyMountingInstance;l.currentlyMountingInstance=this;try{a.componentWillMount&&(a.componentWillMount(),this._pendingStateQueue&&(a.state=this._processPendingState(a.props,a.context))),p=this._getValidatedChildContext(n),d=this._renderValidatedComponent(p)}finally{l.currentlyMountingInstance=h}this._renderedComponent=this._instantiateReactComponent(d,this._currentElement.type);var m=f.mountComponent(this._renderedComponent,e,t,this._mergeChildContext(n,p));return a.componentDidMount&&t.getReactMountReady().enqueue(a.componentDidMount,a),m},unmountComponent:function(){var e=this._instance;if(e.componentWillUnmount){var t=l.currentlyUnmountingInstance;l.currentlyUnmountingInstance=this;try{e.componentWillUnmount()}finally{l.currentlyUnmountingInstance=t}}f.unmountComponent(this._renderedComponent),this._renderedComponent=null,this._pendingStateQueue=null,this._pendingReplaceState=!1,this._pendingForceUpdate=!1,this._pendingCallbacks=null,this._pendingElement=null,this._context=null,this._rootNodeID=null,s.remove(e)},_setPropsInternal:function(e,t){var n=this._pendingElement||this._currentElement;this._pendingElement=u.cloneAndReplaceProps(n,m({},n.props,e)),h.enqueueUpdate(this,t)},_maskContext:function(e){var t=null;if("string"==typeof this._currentElement.type)return v;var n=this._currentElement.type.contextTypes;if(!n)return v;t={};for(var r in n)t[r]=e[r];return t},_processContext:function(e){var t=this._maskContext(e);return t},_getValidatedChildContext:function(e){var t=this._instance,n=t.getChildContext&&t.getChildContext();if(n){g("object"==typeof t.constructor.childContextTypes);for(var r in n)g(r in t.constructor.childContextTypes);return n}return null},_mergeChildContext:function(e,t){return t?m({},e,t):e},_processProps:function(e){return e},_checkPropTypes:function(e,t,n){var o=this.getName();for(var i in e)if(e.hasOwnProperty(i)){var a;try{g("function"==typeof e[i]),a=e[i](t,i,o,n)}catch(u){a=u}a instanceof Error&&(r(this),n===d.prop)}},receiveComponent:function(e,t,n){var r=this._currentElement,o=this._context;this._pendingElement=null,this.updateComponent(t,r,e,o,n)},performUpdateIfNecessary:function(e){null!=this._pendingElement&&f.receiveComponent(this,this._pendingElement||this._currentElement,e,this._context),(null!==this._pendingStateQueue||this._pendingForceUpdate)&&this.updateComponent(e,this._currentElement,this._currentElement,this._context,this._context)},_warnIfContextsDiffer:function(e,t){e=this._maskContext(e),t=this._maskContext(t);for(var n=Object.keys(t).sort(),r=(this.getName()||"ReactCompositeComponent",0);r<n.length;r++)n[r]},updateComponent:function(e,t,n,r,o){var i=this._instance,a=i.context,u=i.props;t!==n&&(a=this._processContext(n._context),u=this._processProps(n.props),i.componentWillReceiveProps&&i.componentWillReceiveProps(u,a));var s=this._processPendingState(u,a),l=this._pendingForceUpdate||!i.shouldComponentUpdate||i.shouldComponentUpdate(u,s,a);l?(this._pendingForceUpdate=!1,this._performComponentUpdate(n,u,s,a,e,o)):(this._currentElement=n,this._context=o,i.props=u,i.state=s,i.context=a)},_processPendingState:function(e,t){var n=this._instance,r=this._pendingStateQueue,o=this._pendingReplaceState;if(this._pendingReplaceState=!1,this._pendingStateQueue=null,!r)return n.state;if(o&&1===r.length)return r[0];for(var i=m({},o?r[0]:n.state),a=o?1:0;a<r.length;a++){var u=r[a];m(i,"function"==typeof u?u.call(n,i,e,t):u)}return i},_performComponentUpdate:function(e,t,n,r,o,i){var a=this._instance,u=a.props,s=a.state,l=a.context;a.componentWillUpdate&&a.componentWillUpdate(t,n,r),this._currentElement=e,this._context=i,a.props=t,a.state=n,a.context=r,this._updateRenderedComponent(o,i),a.componentDidUpdate&&o.getReactMountReady().enqueue(a.componentDidUpdate.bind(a,u,s,l),a)},_updateRenderedComponent:function(e,t){var n=this._renderedComponent,r=n._currentElement,o=this._getValidatedChildContext(),i=this._renderValidatedComponent(o);if(y(r,i))f.receiveComponent(n,i,e,this._mergeChildContext(t,o));else{var a=this._rootNodeID,u=n._rootNodeID;f.unmountComponent(n),this._renderedComponent=this._instantiateReactComponent(i,this._currentElement.type);var s=f.mountComponent(this._renderedComponent,a,e,this._mergeChildContext(t,o));this._replaceNodeWithMarkupByID(u,s)}},_replaceNodeWithMarkupByID:function(e,t){o.replaceNodeWithMarkupByID(e,t)},_renderValidatedComponentWithoutOwnerOrContext:function(){var e=this._instance,t=e.render();return t},_renderValidatedComponent:function(e){var t,n=i.current;i.current=this._mergeChildContext(this._currentElement._context,e),a.current=this;try{t=this._renderValidatedComponentWithoutOwnerOrContext()}finally{i.current=n,a.current=null}return g(null===t||t===!1||u.isValidElement(t)),t},attachRef:function(e,t){var n=this.getPublicInstance(),r=n.refs===v?n.refs={}:n.refs;r[e]=t.getPublicInstance()},detachRef:function(e){var t=this.getPublicInstance().refs;delete t[e]},getName:function(){var e=this._currentElement.type,t=this._instance&&this._instance.constructor;return e.displayName||t&&t.displayName||e.name||t&&t.name||null},getPublicInstance:function(){return this._instance},_instantiateReactComponent:null};p.measureMethods(E,"ReactCompositeComponent",{mountComponent:"mountComponent",updateComponent:"updateComponent",_renderValidatedComponent:"_renderValidatedComponent"});var b={Mixin:E};t.exports=b},{113:113,133:133,147:147,150:150,27:27,36:36,38:38,39:39,55:55,56:56,65:65,66:66,71:71,73:73,74:74,75:75,79:79,85:85}],38:[function(e,t,n){"use strict";var r=e(27),o=e(113),i=(e(150),{current:o,withContext:function(e,t){var n,o=i.current;i.current=r({},o,e);try{n=t()}finally{i.current=o}return n}});t.exports=i},{113:113,150:150,27:27}],39:[function(e,t,n){"use strict";var r={current:null};t.exports=r},{}],40:[function(e,t,n){"use strict";function r(e){return o.createFactory(e)}var o=e(55),i=(e(56),e(140)),a=i({a:"a",abbr:"abbr",address:"address",area:"area",article:"article",aside:"aside",audio:"audio",b:"b",base:"base",bdi:"bdi",bdo:"bdo",big:"big",blockquote:"blockquote",body:"body",br:"br",button:"button",canvas:"canvas",caption:"caption",cite:"cite",code:"code",col:"col",colgroup:"colgroup",data:"data",datalist:"datalist",dd:"dd",del:"del",details:"details",dfn:"dfn",dialog:"dialog",div:"div",dl:"dl",dt:"dt",em:"em",embed:"embed",fieldset:"fieldset",figcaption:"figcaption",figure:"figure",footer:"footer",form:"form",h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",h6:"h6",head:"head",header:"header",hr:"hr",html:"html",i:"i",iframe:"iframe",img:"img",input:"input",ins:"ins",kbd:"kbd",keygen:"keygen",label:"label",legend:"legend",li:"li",link:"link",main:"main",map:"map",mark:"mark",menu:"menu",menuitem:"menuitem",meta:"meta",meter:"meter",nav:"nav",noscript:"noscript",object:"object",ol:"ol",optgroup:"optgroup",option:"option",output:"output",p:"p",param:"param",picture:"picture",pre:"pre",progress:"progress",q:"q",rp:"rp",rt:"rt",ruby:"ruby",s:"s",samp:"samp",script:"script",section:"section",select:"select",small:"small",source:"source",span:"span",strong:"strong",style:"style",sub:"sub",summary:"summary",sup:"sup",table:"table",tbody:"tbody",td:"td",textarea:"textarea",tfoot:"tfoot",th:"th",thead:"thead",time:"time",title:"title",tr:"tr",track:"track",u:"u",ul:"ul","var":"var",video:"video",wbr:"wbr",circle:"circle",clipPath:"clipPath",defs:"defs",ellipse:"ellipse",g:"g",line:"line",linearGradient:"linearGradient",mask:"mask",path:"path",pattern:"pattern",polygon:"polygon",polyline:"polyline",radialGradient:"radialGradient",rect:"rect",stop:"stop",svg:"svg",text:"text",tspan:"tspan"},r);t.exports=a},{140:140,55:55,56:56}],41:[function(e,t,n){"use strict";var r=e(2),o=e(29),i=e(33),a=e(55),u=e(138),s=a.createFactory("button"),l=u({onClick:!0,onDoubleClick:!0,onMouseDown:!0,onMouseMove:!0,onMouseUp:!0,onClickCapture:!0,onDoubleClickCapture:!0,onMouseDownCapture:!0,onMouseMoveCapture:!0,onMouseUpCapture:!0}),c=i.createClass({displayName:"ReactDOMButton",tagName:"BUTTON",mixins:[r,o],render:function(){var e={};for(var t in this.props)!this.props.hasOwnProperty(t)||this.props.disabled&&l[t]||(e[t]=this.props[t]);return s(e,this.props.children)}});t.exports=c},{138:138,2:2,29:29,33:33,55:55}],42:[function(e,t,n){"use strict";function r(e){e&&(null!=e.dangerouslySetInnerHTML&&(g(null==e.children),g("object"==typeof e.dangerouslySetInnerHTML&&"__html"in e.dangerouslySetInnerHTML)),g(null==e.style||"object"==typeof e.style))}function o(e,t,n,r){var o=d.findReactContainerForID(e);if(o){var i=o.nodeType===D?o.ownerDocument:o;E(t,i)}r.getPutListenerQueue().enqueuePutListener(e,t,n)}function i(e){P.call(T,e)||(g(I.test(e)),T[e]=!0)}function a(e){i(e),this._tag=e,this._renderedChildren=null,this._previousStyleCopy=null,this._rootNodeID=null}var u=e(5),s=e(10),l=e(11),c=e(30),p=e(35),d=e(68),f=e(69),h=e(73),m=e(27),v=e(114),g=e(133),y=(e(134),e(139)),C=(e(150),c.deleteListener),E=c.listenTo,b=c.registrationNameModules,_={string:!0,number:!0},x=y({style:null}),D=1,M=null,N={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0},I=/^[a-zA-Z][a-zA-Z:_\.\-\d]*$/,T={},P={}.hasOwnProperty;a.displayName="ReactDOMComponent",a.Mixin={construct:function(e){this._currentElement=e},mountComponent:function(e,t,n){this._rootNodeID=e,r(this._currentElement.props);var o=N[this._tag]?"":"</"+this._tag+">";return this._createOpenTagMarkupAndPutListeners(t)+this._createContentMarkup(t,n)+o},_createOpenTagMarkupAndPutListeners:function(e){var t=this._currentElement.props,n="<"+this._tag;for(var r in t)if(t.hasOwnProperty(r)){var i=t[r];if(null!=i)if(b.hasOwnProperty(r))o(this._rootNodeID,r,i,e);else{r===x&&(i&&(i=this._previousStyleCopy=m({},t.style)),i=u.createMarkupForStyles(i));var a=l.createMarkupForProperty(r,i);a&&(n+=" "+a)}}if(e.renderToStaticMarkup)return n+">";var s=l.createMarkupForID(this._rootNodeID);return n+" "+s+">"},_createContentMarkup:function(e,t){var n="";("listing"===this._tag||"pre"===this._tag||"textarea"===this._tag)&&(n="\n");var r=this._currentElement.props,o=r.dangerouslySetInnerHTML;if(null!=o){if(null!=o.__html)return n+o.__html}else{var i=_[typeof r.children]?r.children:null,a=null!=i?null:r.children;if(null!=i)return n+v(i);if(null!=a){var u=this.mountChildren(a,e,t);return n+u.join("")}}return n},receiveComponent:function(e,t,n){var r=this._currentElement;this._currentElement=e,this.updateComponent(t,r,e,n)},updateComponent:function(e,t,n,o){r(this._currentElement.props),this._updateDOMProperties(t.props,e),this._updateDOMChildren(t.props,e,o)},_updateDOMProperties:function(e,t){var n,r,i,a=this._currentElement.props;for(n in e)if(!a.hasOwnProperty(n)&&e.hasOwnProperty(n))if(n===x){var u=this._previousStyleCopy;for(r in u)u.hasOwnProperty(r)&&(i=i||{},i[r]="");this._previousStyleCopy=null}else b.hasOwnProperty(n)?C(this._rootNodeID,n):(s.isStandardName[n]||s.isCustomAttribute(n))&&M.deletePropertyByID(this._rootNodeID,n);for(n in a){var l=a[n],c=n===x?this._previousStyleCopy:e[n];if(a.hasOwnProperty(n)&&l!==c)if(n===x)if(l?l=this._previousStyleCopy=m({},l):this._previousStyleCopy=null,c){for(r in c)!c.hasOwnProperty(r)||l&&l.hasOwnProperty(r)||(i=i||{},i[r]="");for(r in l)l.hasOwnProperty(r)&&c[r]!==l[r]&&(i=i||{},i[r]=l[r])}else i=l;else b.hasOwnProperty(n)?o(this._rootNodeID,n,l,t):(s.isStandardName[n]||s.isCustomAttribute(n))&&M.updatePropertyByID(this._rootNodeID,n,l)}i&&M.updateStylesByID(this._rootNodeID,i)},_updateDOMChildren:function(e,t,n){var r=this._currentElement.props,o=_[typeof e.children]?e.children:null,i=_[typeof r.children]?r.children:null,a=e.dangerouslySetInnerHTML&&e.dangerouslySetInnerHTML.__html,u=r.dangerouslySetInnerHTML&&r.dangerouslySetInnerHTML.__html,s=null!=o?null:e.children,l=null!=i?null:r.children,c=null!=o||null!=a,p=null!=i||null!=u;null!=s&&null==l?this.updateChildren(null,t,n):c&&!p&&this.updateTextContent(""),null!=i?o!==i&&this.updateTextContent(""+i):null!=u?a!==u&&M.updateInnerHTMLByID(this._rootNodeID,u):null!=l&&this.updateChildren(l,t,n)},unmountComponent:function(){this.unmountChildren(),c.deleteAllListeners(this._rootNodeID),p.unmountIDFromEnvironment(this._rootNodeID),this._rootNodeID=null}},h.measureMethods(a,"ReactDOMComponent",{mountComponent:"mountComponent",updateComponent:"updateComponent"}),m(a.prototype,a.Mixin,f.Mixin),a.injection={injectIDOperations:function(e){a.BackendIDOperations=M=e}},t.exports=a},{10:10,11:11,114:114,133:133,134:134,139:139,150:150,27:27,30:30,35:35,5:5,68:68,69:69,73:73}],43:[function(e,t,n){"use strict";var r=e(15),o=e(25),i=e(29),a=e(33),u=e(55),s=u.createFactory("form"),l=a.createClass({displayName:"ReactDOMForm",tagName:"FORM",mixins:[i,o],render:function(){return s(this.props)},componentDidMount:function(){this.trapBubbledEvent(r.topLevelTypes.topReset,"reset"),this.trapBubbledEvent(r.topLevelTypes.topSubmit,"submit")}});t.exports=l},{15:15,25:25,29:29,33:33,55:55}],44:[function(e,t,n){"use strict";var r=e(5),o=e(9),i=e(11),a=e(68),u=e(73),s=e(133),l=e(144),c={dangerouslySetInnerHTML:"`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.",style:"`style` must be set using `updateStylesByID()`."},p={updatePropertyByID:function(e,t,n){var r=a.getNode(e);s(!c.hasOwnProperty(t)),null!=n?i.setValueForProperty(r,t,n):i.deleteValueForProperty(r,t)},deletePropertyByID:function(e,t,n){var r=a.getNode(e);s(!c.hasOwnProperty(t)),i.deleteValueForProperty(r,t,n)},updateStylesByID:function(e,t){var n=a.getNode(e);r.setValueForStyles(n,t)},updateInnerHTMLByID:function(e,t){var n=a.getNode(e);l(n,t)},updateTextContentByID:function(e,t){var n=a.getNode(e);o.updateTextContent(n,t)},dangerouslyReplaceNodeWithMarkupByID:function(e,t){var n=a.getNode(e);o.dangerouslyReplaceNodeWithMarkup(n,t)},dangerouslyProcessChildrenUpdates:function(e,t){for(var n=0;n<e.length;n++)e[n].parentNode=a.getNode(e[n].parentID);o.processUpdates(e,t)}};u.measureMethods(p,"ReactDOMIDOperations",{updatePropertyByID:"updatePropertyByID",deletePropertyByID:"deletePropertyByID",updateStylesByID:"updateStylesByID",updateInnerHTMLByID:"updateInnerHTMLByID",updateTextContentByID:"updateTextContentByID",dangerouslyReplaceNodeWithMarkupByID:"dangerouslyReplaceNodeWithMarkupByID",dangerouslyProcessChildrenUpdates:"dangerouslyProcessChildrenUpdates"}),t.exports=p},{11:11,133:133,144:144,5:5,68:68,73:73,9:9}],45:[function(e,t,n){"use strict";var r=e(15),o=e(25),i=e(29),a=e(33),u=e(55),s=u.createFactory("iframe"),l=a.createClass({displayName:"ReactDOMIframe",tagName:"IFRAME",mixins:[i,o],render:function(){return s(this.props)},componentDidMount:function(){this.trapBubbledEvent(r.topLevelTypes.topLoad,"load")}});t.exports=l},{15:15,25:25,29:29,33:33,55:55}],46:[function(e,t,n){"use strict";var r=e(15),o=e(25),i=e(29),a=e(33),u=e(55),s=u.createFactory("img"),l=a.createClass({displayName:"ReactDOMImg",tagName:"IMG",mixins:[i,o],render:function(){return s(this.props)},componentDidMount:function(){this.trapBubbledEvent(r.topLevelTypes.topLoad,"load"),this.trapBubbledEvent(r.topLevelTypes.topError,"error")}});t.exports=l},{15:15,25:25,29:29,33:33,55:55}],47:[function(e,t,n){"use strict";function r(){this.isMounted()&&this.forceUpdate()}var o=e(2),i=e(11),a=e(24),u=e(29),s=e(33),l=e(55),c=e(68),p=e(85),d=e(27),f=e(133),h=l.createFactory("input"),m={},v=s.createClass({displayName:"ReactDOMInput",tagName:"INPUT",mixins:[o,a.Mixin,u],getInitialState:function(){var e=this.props.defaultValue;return{initialChecked:this.props.defaultChecked||!1,initialValue:null!=e?e:null}},render:function(){var e=d({},this.props);e.defaultChecked=null,e.defaultValue=null;var t=a.getValue(this);e.value=null!=t?t:this.state.initialValue;var n=a.getChecked(this);return e.checked=null!=n?n:this.state.initialChecked,e.onChange=this._handleChange,h(e,this.props.children)},componentDidMount:function(){var e=c.getID(this.getDOMNode());m[e]=this},componentWillUnmount:function(){var e=this.getDOMNode(),t=c.getID(e);delete m[t]},componentDidUpdate:function(e,t,n){var r=this.getDOMNode();null!=this.props.checked&&i.setValueForProperty(r,"checked",this.props.checked||!1);var o=a.getValue(this);null!=o&&i.setValueForProperty(r,"value",""+o)},_handleChange:function(e){var t,n=a.getOnChange(this);n&&(t=n.call(this,e)),p.asap(r,this);var o=this.props.name;if("radio"===this.props.type&&null!=o){for(var i=this.getDOMNode(),u=i;u.parentNode;)u=u.parentNode;for(var s=u.querySelectorAll("input[name="+JSON.stringify(""+o)+'][type="radio"]'),l=0,d=s.length;d>l;l++){var h=s[l];if(h!==i&&h.form===i.form){var v=c.getID(h);f(v);var g=m[v];f(g),p.asap(r,g)}}}return t}});t.exports=v},{11:11,133:133,2:2,24:24,27:27,29:29,33:33,55:55,68:68,85:85}],48:[function(e,t,n){"use strict";var r=e(29),o=e(33),i=e(55),a=(e(150),i.createFactory("option")),u=o.createClass({displayName:"ReactDOMOption",tagName:"OPTION",mixins:[r],componentWillMount:function(){},render:function(){return a(this.props,this.props.children)}});t.exports=u},{150:150,29:29,33:33,55:55}],49:[function(e,t,n){"use strict";function r(){if(this._pendingUpdate){this._pendingUpdate=!1;var e=u.getValue(this);null!=e&&this.isMounted()&&i(this,e)}}function o(e,t,n){if(null==e[t])return null;if(e.multiple){if(!Array.isArray(e[t]))return new Error("The `"+t+"` prop supplied to <select> must be an array if `multiple` is true.")}else if(Array.isArray(e[t]))return new Error("The `"+t+"` prop supplied to <select> must be a scalar value if `multiple` is false.")}function i(e,t){var n,r,o,i=e.getDOMNode().options;if(e.props.multiple){for(n={},r=0,o=t.length;o>r;r++)n[""+t[r]]=!0;for(r=0,o=i.length;o>r;r++){var a=n.hasOwnProperty(i[r].value);i[r].selected!==a&&(i[r].selected=a)}}else{for(n=""+t,r=0,o=i.length;o>r;r++)if(i[r].value===n)return void(i[r].selected=!0);i.length&&(i[0].selected=!0)}}var a=e(2),u=e(24),s=e(29),l=e(33),c=e(55),p=e(85),d=e(27),f=c.createFactory("select"),h=l.createClass({displayName:"ReactDOMSelect",tagName:"SELECT",mixins:[a,u.Mixin,s],propTypes:{defaultValue:o,value:o},render:function(){var e=d({},this.props);return e.onChange=this._handleChange,e.value=null,f(e,this.props.children)},componentWillMount:function(){this._pendingUpdate=!1},componentDidMount:function(){var e=u.getValue(this);null!=e?i(this,e):null!=this.props.defaultValue&&i(this,this.props.defaultValue)},componentDidUpdate:function(e){var t=u.getValue(this);null!=t?(this._pendingUpdate=!1,i(this,t)):!e.multiple!=!this.props.multiple&&(null!=this.props.defaultValue?i(this,this.props.defaultValue):i(this,this.props.multiple?[]:""))},_handleChange:function(e){var t,n=u.getOnChange(this);return n&&(t=n.call(this,e)),this._pendingUpdate=!0,p.asap(r,this),t}});t.exports=h},{2:2,24:24,27:27,29:29,33:33,55:55,85:85}],50:[function(e,t,n){"use strict";function r(e,t,n,r){return e===n&&t===r}function o(e){var t=document.selection,n=t.createRange(),r=n.text.length,o=n.duplicate();o.moveToElementText(e),o.setEndPoint("EndToStart",n);var i=o.text.length,a=i+r;return{start:i,end:a}}function i(e){var t=window.getSelection&&window.getSelection();if(!t||0===t.rangeCount)return null;var n=t.anchorNode,o=t.anchorOffset,i=t.focusNode,a=t.focusOffset,u=t.getRangeAt(0),s=r(t.anchorNode,t.anchorOffset,t.focusNode,t.focusOffset),l=s?0:u.toString().length,c=u.cloneRange();c.selectNodeContents(e),c.setEnd(u.startContainer,u.startOffset);var p=r(c.startContainer,c.startOffset,c.endContainer,c.endOffset),d=p?0:c.toString().length,f=d+l,h=document.createRange();h.setStart(n,o),h.setEnd(i,a);var m=h.collapsed;return{start:m?f:d,end:m?d:f}}function a(e,t){var n,r,o=document.selection.createRange().duplicate();"undefined"==typeof t.end?(n=t.start,r=n):t.start>t.end?(n=t.end,r=t.start):(n=t.start,r=t.end),o.moveToElementText(e),o.moveStart("character",n),o.setEndPoint("EndToStart",o),o.moveEnd("character",r-n),o.select()}function u(e,t){if(window.getSelection){var n=window.getSelection(),r=e[c()].length,o=Math.min(t.start,r),i="undefined"==typeof t.end?o:Math.min(t.end,r);if(!n.extend&&o>i){var a=i;i=o,o=a}var u=l(e,o),s=l(e,i);if(u&&s){var p=document.createRange();p.setStart(u.node,u.offset),n.removeAllRanges(),o>i?(n.addRange(p),n.extend(s.node,s.offset)):(p.setEnd(s.node,s.offset),n.addRange(p))}}}var s=e(21),l=e(126),c=e(128),p=s.canUseDOM&&"selection"in document&&!("getSelection"in window),d={getOffsets:p?o:i,setOffsets:p?a:u};t.exports=d},{126:126,128:128,21:21}],51:[function(e,t,n){"use strict";var r=e(11),o=e(35),i=e(42),a=e(27),u=e(114),s=function(e){};a(s.prototype,{construct:function(e){this._currentElement=e,this._stringText=""+e,this._rootNodeID=null,this._mountIndex=0},mountComponent:function(e,t,n){this._rootNodeID=e;var o=u(this._stringText);return t.renderToStaticMarkup?o:"<span "+r.createMarkupForID(e)+">"+o+"</span>"},receiveComponent:function(e,t){if(e!==this._currentElement){this._currentElement=e;var n=""+e;n!==this._stringText&&(this._stringText=n,i.BackendIDOperations.updateTextContentByID(this._rootNodeID,n))}},unmountComponent:function(){o.unmountIDFromEnvironment(this._rootNodeID)}}),t.exports=s},{11:11,114:114,27:27,35:35,42:42}],52:[function(e,t,n){"use strict";function r(){this.isMounted()&&this.forceUpdate()}var o=e(2),i=e(11),a=e(24),u=e(29),s=e(33),l=e(55),c=e(85),p=e(27),d=e(133),f=(e(150),l.createFactory("textarea")),h=s.createClass({displayName:"ReactDOMTextarea",tagName:"TEXTAREA",mixins:[o,a.Mixin,u],getInitialState:function(){var e=this.props.defaultValue,t=this.props.children;null!=t&&(d(null==e),Array.isArray(t)&&(d(t.length<=1),t=t[0]),e=""+t),null==e&&(e="");var n=a.getValue(this);return{initialValue:""+(null!=n?n:e)}},render:function(){var e=p({},this.props);return d(null==e.dangerouslySetInnerHTML),e.defaultValue=null,e.value=null,e.onChange=this._handleChange,f(e,this.state.initialValue)},componentDidUpdate:function(e,t,n){var r=a.getValue(this);if(null!=r){var o=this.getDOMNode();i.setValueForProperty(o,"value",""+r)}},_handleChange:function(e){var t,n=a.getOnChange(this);return n&&(t=n.call(this,e)),c.asap(r,this),t}});t.exports=h},{11:11,133:133,150:150,2:2,24:24,27:27,29:29,33:33,55:55,85:85}],53:[function(e,t,n){"use strict";function r(){this.reinitializeTransaction()}var o=e(85),i=e(101),a=e(27),u=e(112),s={initialize:u,close:function(){d.isBatchingUpdates=!1}},l={initialize:u,close:o.flushBatchedUpdates.bind(o)},c=[l,s];a(r.prototype,i.Mixin,{getTransactionWrappers:function(){return c}});var p=new r,d={isBatchingUpdates:!1,batchedUpdates:function(e,t,n,r,o){var i=d.isBatchingUpdates;d.isBatchingUpdates=!0,i?e(t,n,r,o):p.perform(e,null,t,n,r,o)}};t.exports=d},{101:101,112:112,27:27,85:85}],54:[function(e,t,n){"use strict";function r(e){return h.createClass({tagName:e.toUpperCase(),render:function(){return new T(e,null,null,null,null,this.props)}})}function o(){R.EventEmitter.injectReactEventListener(P),R.EventPluginHub.injectEventPluginOrder(s),R.EventPluginHub.injectInstanceHandle(w),R.EventPluginHub.injectMount(O),R.EventPluginHub.injectEventPluginsByName({SimpleEventPlugin:L,EnterLeaveEventPlugin:l,ChangeEventPlugin:a,MobileSafariClickEventPlugin:d,SelectEventPlugin:A,BeforeInputEventPlugin:i}),R.NativeComponent.injectGenericComponentClass(g),R.NativeComponent.injectTextComponentClass(I),R.NativeComponent.injectAutoWrapper(r),R.Class.injectMixin(f),R.NativeComponent.injectComponentClasses({button:y,form:C,iframe:_,img:E,input:x,option:D,select:M,textarea:N,html:F("html"),head:F("head"),body:F("body")}),R.DOMProperty.injectDOMPropertyConfig(p),R.DOMProperty.injectDOMPropertyConfig(U),R.EmptyComponent.injectEmptyComponent("noscript"),R.Updates.injectReconcileTransaction(S),R.Updates.injectBatchingStrategy(v),R.RootIndex.injectCreateReactRootIndex(c.canUseDOM?u.createReactRootIndex:k.createReactRootIndex),R.Component.injectEnvironment(m),R.DOMComponent.injectIDOperations(b)}var i=e(3),a=e(7),u=e(8),s=e(13),l=e(14),c=e(21),p=e(23),d=e(26),f=e(29),h=e(33),m=e(35),v=e(53),g=e(42),y=e(41),C=e(43),E=e(46),b=e(44),_=e(45),x=e(47),D=e(48),M=e(49),N=e(52),I=e(51),T=e(55),P=e(60),R=e(62),w=e(64),O=e(68),S=e(78),A=e(87),k=e(88),L=e(89),U=e(86),F=e(109);

t.exports={inject:o}},{109:109,13:13,14:14,21:21,23:23,26:26,29:29,3:3,33:33,35:35,41:41,42:42,43:43,44:44,45:45,46:46,47:47,48:48,49:49,51:51,52:52,53:53,55:55,60:60,62:62,64:64,68:68,7:7,78:78,8:8,86:86,87:87,88:88,89:89}],55:[function(e,t,n){"use strict";var r=e(38),o=e(39),i=e(27),a=(e(150),{key:!0,ref:!0}),u=function(e,t,n,r,o,i){this.type=e,this.key=t,this.ref=n,this._owner=r,this._context=o,this.props=i};u.prototype={_isReactElement:!0},u.createElement=function(e,t,n){var i,s={},l=null,c=null;if(null!=t){c=void 0===t.ref?null:t.ref,l=void 0===t.key?null:""+t.key;for(i in t)t.hasOwnProperty(i)&&!a.hasOwnProperty(i)&&(s[i]=t[i])}var p=arguments.length-2;if(1===p)s.children=n;else if(p>1){for(var d=Array(p),f=0;p>f;f++)d[f]=arguments[f+2];s.children=d}if(e&&e.defaultProps){var h=e.defaultProps;for(i in h)"undefined"==typeof s[i]&&(s[i]=h[i])}return new u(e,l,c,o.current,r.current,s)},u.createFactory=function(e){var t=u.createElement.bind(null,e);return t.type=e,t},u.cloneAndReplaceProps=function(e,t){var n=new u(e.type,e.key,e.ref,e._owner,e._context,t);return n},u.cloneElement=function(e,t,n){var r,s=i({},e.props),l=e.key,c=e.ref,p=e._owner;if(null!=t){void 0!==t.ref&&(c=t.ref,p=o.current),void 0!==t.key&&(l=""+t.key);for(r in t)t.hasOwnProperty(r)&&!a.hasOwnProperty(r)&&(s[r]=t[r])}var d=arguments.length-2;if(1===d)s.children=n;else if(d>1){for(var f=Array(d),h=0;d>h;h++)f[h]=arguments[h+2];s.children=f}return new u(e.type,l,c,p,e._context,s)},u.isValidElement=function(e){var t=!(!e||!e._isReactElement);return t},t.exports=u},{150:150,27:27,38:38,39:39}],56:[function(e,t,n){"use strict";function r(){if(y.current){var e=y.current.getName();if(e)return" Check the render method of `"+e+"`."}return""}function o(e){var t=e&&e.getPublicInstance();if(!t)return void 0;var n=t.constructor;return n?n.displayName||n.name||void 0:void 0}function i(){var e=y.current;return e&&o(e)||void 0}function a(e,t){e._store.validated||null!=e.key||(e._store.validated=!0,s('Each child in an array or iterator should have a unique "key" prop.',e,t))}function u(e,t,n){D.test(e)&&s("Child objects should have non-numeric keys so ordering is preserved.",t,n)}function s(e,t,n){var r=i(),a="string"==typeof n?n:n.displayName||n.name,u=r||a,s=_[e]||(_[e]={});if(!s.hasOwnProperty(u)){s[u]=!0;var l="";if(t&&t._owner&&t._owner!==y.current){var c=o(t._owner);l=" It was passed a child from "+c+"."}}}function l(e,t){if(Array.isArray(e))for(var n=0;n<e.length;n++){var r=e[n];m.isValidElement(r)&&a(r,t)}else if(m.isValidElement(e))e._store.validated=!0;else if(e){var o=E(e);if(o){if(o!==e.entries)for(var i,s=o.call(e);!(i=s.next()).done;)m.isValidElement(i.value)&&a(i.value,t)}else if("object"==typeof e){var l=v.extractIfFragment(e);for(var c in l)l.hasOwnProperty(c)&&u(c,l[c],t)}}}function c(e,t,n,o){for(var i in t)if(t.hasOwnProperty(i)){var a;try{b("function"==typeof t[i]),a=t[i](n,i,e,o)}catch(u){a=u}a instanceof Error&&!(a.message in x)&&(x[a.message]=!0,r(this))}}function p(e,t){var n=t.type,r="string"==typeof n?n:n.displayName,o=t._owner?t._owner.getPublicInstance().constructor.displayName:null,i=e+"|"+r+"|"+o;if(!M.hasOwnProperty(i)){M[i]=!0;var a="";r&&(a=" <"+r+" />");var u="";o&&(u=" The element was created by "+o+".")}}function d(e,t){return e!==e?t!==t:0===e&&0===t?1/e===1/t:e===t}function f(e){if(e._store){var t=e._store.originalProps,n=e.props;for(var r in n)n.hasOwnProperty(r)&&(t.hasOwnProperty(r)&&d(t[r],n[r])||(p(r,e),t[r]=n[r]))}}function h(e){if(null!=e.type){var t=C.getComponentClassForElement(e),n=t.displayName||t.name;t.propTypes&&c(n,t.propTypes,e.props,g.prop),"function"==typeof t.getDefaultProps}}var m=e(55),v=e(61),g=e(75),y=(e(74),e(39)),C=e(71),E=e(124),b=e(133),_=(e(150),{}),x={},D=/^\d+$/,M={},N={checkAndWarnForMutatedProps:f,createElement:function(e,t,n){var r=m.createElement.apply(this,arguments);if(null==r)return r;for(var o=2;o<arguments.length;o++)l(arguments[o],e);return h(r),r},createFactory:function(e){var t=N.createElement.bind(null,e);return t.type=e,t},cloneElement:function(e,t,n){for(var r=m.cloneElement.apply(this,arguments),o=2;o<arguments.length;o++)l(arguments[o],r.type);return h(r),r}};t.exports=N},{124:124,133:133,150:150,39:39,55:55,61:61,71:71,74:74,75:75}],57:[function(e,t,n){"use strict";function r(e){c[e]=!0}function o(e){delete c[e]}function i(e){return!!c[e]}var a,u=e(55),s=e(65),l=e(133),c={},p={injectEmptyComponent:function(e){a=u.createFactory(e)}},d=function(){};d.prototype.componentDidMount=function(){var e=s.get(this);e&&r(e._rootNodeID)},d.prototype.componentWillUnmount=function(){var e=s.get(this);e&&o(e._rootNodeID)},d.prototype.render=function(){return l(a),a()};var f=u.createElement(d),h={emptyElement:f,injection:p,isNullComponentID:i};t.exports=h},{133:133,55:55,65:65}],58:[function(e,t,n){"use strict";var r={guard:function(e,t){return e}};t.exports=r},{}],59:[function(e,t,n){"use strict";function r(e){o.enqueueEvents(e),o.processEventQueue()}var o=e(17),i={handleTopLevel:function(e,t,n,i){var a=o.extractEvents(e,t,n,i);r(a)}};t.exports=i},{17:17}],60:[function(e,t,n){"use strict";function r(e){var t=p.getID(e),n=c.getReactRootIDFromNodeID(t),r=p.findReactContainerForID(n),o=p.getFirstReactDOM(r);return o}function o(e,t){this.topLevelType=e,this.nativeEvent=t,this.ancestors=[]}function i(e){for(var t=p.getFirstReactDOM(h(e.nativeEvent))||window,n=t;n;)e.ancestors.push(n),n=r(n);for(var o=0,i=e.ancestors.length;i>o;o++){t=e.ancestors[o];var a=p.getID(t)||"";v._handleTopLevel(e.topLevelType,t,a,e.nativeEvent)}}function a(e){var t=m(window);e(t)}var u=e(16),s=e(21),l=e(28),c=e(64),p=e(68),d=e(85),f=e(27),h=e(123),m=e(129);f(o.prototype,{destructor:function(){this.topLevelType=null,this.nativeEvent=null,this.ancestors.length=0}}),l.addPoolingTo(o,l.twoArgumentPooler);var v={_enabled:!0,_handleTopLevel:null,WINDOW_HANDLE:s.canUseDOM?window:null,setHandleTopLevel:function(e){v._handleTopLevel=e},setEnabled:function(e){v._enabled=!!e},isEnabled:function(){return v._enabled},trapBubbledEvent:function(e,t,n){var r=n;return r?u.listen(r,t,v.dispatchEvent.bind(null,e)):null},trapCapturedEvent:function(e,t,n){var r=n;return r?u.capture(r,t,v.dispatchEvent.bind(null,e)):null},monitorScrollValue:function(e){var t=a.bind(null,e);u.listen(window,"scroll",t)},dispatchEvent:function(e,t){if(v._enabled){var n=o.getPooled(e,t);try{d.batchedUpdates(i,n)}finally{o.release(n)}}}};t.exports=v},{123:123,129:129,16:16,21:21,27:27,28:28,64:64,68:68,85:85}],61:[function(e,t,n){"use strict";var r=(e(55),e(150),{create:function(e){return e},extract:function(e){return e},extractIfFragment:function(e){return e}});t.exports=r},{150:150,55:55}],62:[function(e,t,n){"use strict";var r=e(10),o=e(17),i=e(36),a=e(33),u=e(57),s=e(30),l=e(71),c=e(42),p=e(73),d=e(81),f=e(85),h={Component:i.injection,Class:a.injection,DOMComponent:c.injection,DOMProperty:r.injection,EmptyComponent:u.injection,EventPluginHub:o.injection,EventEmitter:s.injection,NativeComponent:l.injection,Perf:p.injection,RootIndex:d.injection,Updates:f.injection};t.exports=h},{10:10,17:17,30:30,33:33,36:36,42:42,57:57,71:71,73:73,81:81,85:85}],63:[function(e,t,n){"use strict";function r(e){return i(document.documentElement,e)}var o=e(50),i=e(107),a=e(117),u=e(119),s={hasSelectionCapabilities:function(e){return e&&("INPUT"===e.nodeName&&"text"===e.type||"TEXTAREA"===e.nodeName||"true"===e.contentEditable)},getSelectionInformation:function(){var e=u();return{focusedElem:e,selectionRange:s.hasSelectionCapabilities(e)?s.getSelection(e):null}},restoreSelection:function(e){var t=u(),n=e.focusedElem,o=e.selectionRange;t!==n&&r(n)&&(s.hasSelectionCapabilities(n)&&s.setSelection(n,o),a(n))},getSelection:function(e){var t;if("selectionStart"in e)t={start:e.selectionStart,end:e.selectionEnd};else if(document.selection&&"INPUT"===e.nodeName){var n=document.selection.createRange();n.parentElement()===e&&(t={start:-n.moveStart("character",-e.value.length),end:-n.moveEnd("character",-e.value.length)})}else t=o.getOffsets(e);return t||{start:0,end:0}},setSelection:function(e,t){var n=t.start,r=t.end;if("undefined"==typeof r&&(r=n),"selectionStart"in e)e.selectionStart=n,e.selectionEnd=Math.min(r,e.value.length);else if(document.selection&&"INPUT"===e.nodeName){var i=e.createTextRange();i.collapse(!0),i.moveStart("character",n),i.moveEnd("character",r-n),i.select()}else o.setOffsets(e,t)}};t.exports=s},{107:107,117:117,119:119,50:50}],64:[function(e,t,n){"use strict";function r(e){return f+e.toString(36)}function o(e,t){return e.charAt(t)===f||t===e.length}function i(e){return""===e||e.charAt(0)===f&&e.charAt(e.length-1)!==f}function a(e,t){return 0===t.indexOf(e)&&o(t,e.length)}function u(e){return e?e.substr(0,e.lastIndexOf(f)):""}function s(e,t){if(d(i(e)&&i(t)),d(a(e,t)),e===t)return e;var n,r=e.length+h;for(n=r;n<t.length&&!o(t,n);n++);return t.substr(0,n)}function l(e,t){var n=Math.min(e.length,t.length);if(0===n)return"";for(var r=0,a=0;n>=a;a++)if(o(e,a)&&o(t,a))r=a;else if(e.charAt(a)!==t.charAt(a))break;var u=e.substr(0,r);return d(i(u)),u}function c(e,t,n,r,o,i){e=e||"",t=t||"",d(e!==t);var l=a(t,e);d(l||a(e,t));for(var c=0,p=l?u:s,f=e;;f=p(f,t)){var h;if(o&&f===e||i&&f===t||(h=n(f,l,r)),h===!1||f===t)break;d(c++<m)}}var p=e(81),d=e(133),f=".",h=f.length,m=100,v={createReactRootID:function(){return r(p.createReactRootIndex())},createReactID:function(e,t){return e+t},getReactRootIDFromNodeID:function(e){if(e&&e.charAt(0)===f&&e.length>1){var t=e.indexOf(f,1);return t>-1?e.substr(0,t):e}return null},traverseEnterLeave:function(e,t,n,r,o){var i=l(e,t);i!==e&&c(e,i,n,r,!1,!0),i!==t&&c(i,t,n,o,!0,!1)},traverseTwoPhase:function(e,t,n){e&&(c("",e,t,n,!0,!1),c(e,"",t,n,!1,!0))},traverseAncestors:function(e,t,n){c("",e,t,n,!0,!1)},_getFirstCommonAncestorID:l,_getNextDescendantID:s,isAncestorIDOf:a,SEPARATOR:f};t.exports=v},{133:133,81:81}],65:[function(e,t,n){"use strict";var r={remove:function(e){e._reactInternalInstance=void 0},get:function(e){return e._reactInternalInstance},has:function(e){return void 0!==e._reactInternalInstance},set:function(e,t){e._reactInternalInstance=t}};t.exports=r},{}],66:[function(e,t,n){"use strict";var r={currentlyMountingInstance:null,currentlyUnmountingInstance:null};t.exports=r},{}],67:[function(e,t,n){"use strict";var r=e(104),o={CHECKSUM_ATTR_NAME:"data-react-checksum",addChecksumToMarkup:function(e){var t=r(e);return e.replace(">"," "+o.CHECKSUM_ATTR_NAME+'="'+t+'">')},canReuseMarkup:function(e,t){var n=t.getAttribute(o.CHECKSUM_ATTR_NAME);n=n&&parseInt(n,10);var i=r(e);return i===n}};t.exports=o},{104:104}],68:[function(e,t,n){"use strict";function r(e,t){for(var n=Math.min(e.length,t.length),r=0;n>r;r++)if(e.charAt(r)!==t.charAt(r))return r;return e.length===t.length?-1:n}function o(e){var t=P(e);return t&&K.getID(t)}function i(e){var t=a(e);if(t)if(L.hasOwnProperty(t)){var n=L[t];n!==e&&(w(!c(n,t)),L[t]=e)}else L[t]=e;return t}function a(e){return e&&e.getAttribute&&e.getAttribute(k)||""}function u(e,t){var n=a(e);n!==t&&delete L[n],e.setAttribute(k,t),L[t]=e}function s(e){return L.hasOwnProperty(e)&&c(L[e],e)||(L[e]=K.findReactNodeByID(e)),L[e]}function l(e){var t=b.get(e)._rootNodeID;return C.isNullComponentID(t)?null:(L.hasOwnProperty(t)&&c(L[t],t)||(L[t]=K.findReactNodeByID(t)),L[t])}function c(e,t){if(e){w(a(e)===t);var n=K.findReactContainerForID(t);if(n&&T(n,e))return!0}return!1}function p(e){delete L[e]}function d(e){var t=L[e];return t&&c(t,e)?void(W=t):!1}function f(e){W=null,E.traverseAncestors(e,d);var t=W;return W=null,t}function h(e,t,n,r,o){var i=D.mountComponent(e,t,r,I);e._isTopLevel=!0,K._mountImageIntoNode(i,n,o)}function m(e,t,n,r){var o=N.ReactReconcileTransaction.getPooled();o.perform(h,null,e,t,n,o,r),N.ReactReconcileTransaction.release(o)}var v=e(10),g=e(30),y=(e(39),e(55)),C=(e(56),e(57)),E=e(64),b=e(65),_=e(67),x=e(73),D=e(79),M=e(84),N=e(85),I=e(113),T=e(107),P=e(127),R=e(132),w=e(133),O=e(144),S=e(147),A=(e(150),E.SEPARATOR),k=v.ID_ATTRIBUTE_NAME,L={},U=1,F=9,B={},V={},j=[],W=null,K={_instancesByReactRootID:B,scrollMonitor:function(e,t){t()},_updateRootComponent:function(e,t,n,r){return K.scrollMonitor(n,function(){M.enqueueElementInternal(e,t),r&&M.enqueueCallbackInternal(e,r)}),e},_registerComponent:function(e,t){w(t&&(t.nodeType===U||t.nodeType===F)),g.ensureScrollValueMonitoring();var n=K.registerContainer(t);return B[n]=e,n},_renderNewRootComponent:function(e,t,n){var r=R(e,null),o=K._registerComponent(r,t);return N.batchedUpdates(m,r,o,t,n),r},render:function(e,t,n){w(y.isValidElement(e));var r=B[o(t)];if(r){var i=r._currentElement;if(S(i,e))return K._updateRootComponent(r,e,t,n).getPublicInstance();K.unmountComponentAtNode(t)}var a=P(t),u=a&&K.isRenderedByReact(a),s=u&&!r,l=K._renderNewRootComponent(e,t,s).getPublicInstance();return n&&n.call(l),l},constructAndRenderComponent:function(e,t,n){var r=y.createElement(e,t);return K.render(r,n)},constructAndRenderComponentByID:function(e,t,n){var r=document.getElementById(n);return w(r),K.constructAndRenderComponent(e,t,r)},registerContainer:function(e){var t=o(e);return t&&(t=E.getReactRootIDFromNodeID(t)),t||(t=E.createReactRootID()),V[t]=e,t},unmountComponentAtNode:function(e){w(e&&(e.nodeType===U||e.nodeType===F));var t=o(e),n=B[t];return n?(K.unmountComponentFromNode(n,e),delete B[t],delete V[t],!0):!1},unmountComponentFromNode:function(e,t){for(D.unmountComponent(e),t.nodeType===F&&(t=t.documentElement);t.lastChild;)t.removeChild(t.lastChild)},findReactContainerForID:function(e){var t=E.getReactRootIDFromNodeID(e),n=V[t];return n},findReactNodeByID:function(e){var t=K.findReactContainerForID(e);return K.findComponentRoot(t,e)},isRenderedByReact:function(e){if(1!==e.nodeType)return!1;var t=K.getID(e);return t?t.charAt(0)===A:!1},getFirstReactDOM:function(e){for(var t=e;t&&t.parentNode!==t;){if(K.isRenderedByReact(t))return t;t=t.parentNode}return null},findComponentRoot:function(e,t){var n=j,r=0,o=f(t)||e;for(n[0]=o.firstChild,n.length=1;r<n.length;){for(var i,a=n[r++];a;){var u=K.getID(a);u?t===u?i=a:E.isAncestorIDOf(u,t)&&(n.length=r=0,n.push(a.firstChild)):n.push(a.firstChild),a=a.nextSibling}if(i)return n.length=0,i}n.length=0,w(!1)},_mountImageIntoNode:function(e,t,n){if(w(t&&(t.nodeType===U||t.nodeType===F)),n){var o=P(t);if(_.canReuseMarkup(e,o))return;var i=o.getAttribute(_.CHECKSUM_ATTR_NAME);o.removeAttribute(_.CHECKSUM_ATTR_NAME);var a=o.outerHTML;o.setAttribute(_.CHECKSUM_ATTR_NAME,i);var u=r(e,a);" (client) "+e.substring(u-20,u+20)+"\n (server) "+a.substring(u-20,u+20),w(t.nodeType!==F)}w(t.nodeType!==F),O(t,e)},getReactRootID:o,getID:i,setID:u,getNode:s,getNodeFromInstance:l,purgeID:p};x.measureMethods(K,"ReactMount",{_renderNewRootComponent:"_renderNewRootComponent",_mountImageIntoNode:"_mountImageIntoNode"}),t.exports=K},{10:10,107:107,113:113,127:127,132:132,133:133,144:144,147:147,150:150,30:30,39:39,55:55,56:56,57:57,64:64,65:65,67:67,73:73,79:79,84:84,85:85}],69:[function(e,t,n){"use strict";function r(e,t,n){h.push({parentID:e,parentNode:null,type:c.INSERT_MARKUP,markupIndex:m.push(t)-1,textContent:null,fromIndex:null,toIndex:n})}function o(e,t,n){h.push({parentID:e,parentNode:null,type:c.MOVE_EXISTING,markupIndex:null,textContent:null,fromIndex:t,toIndex:n})}function i(e,t){h.push({parentID:e,parentNode:null,type:c.REMOVE_NODE,markupIndex:null,textContent:null,fromIndex:t,toIndex:null})}function a(e,t){h.push({parentID:e,parentNode:null,type:c.TEXT_CONTENT,markupIndex:null,textContent:t,fromIndex:null,toIndex:null})}function u(){h.length&&(l.processChildrenUpdates(h,m),s())}function s(){h.length=0,m.length=0}var l=e(36),c=e(70),p=e(79),d=e(31),f=0,h=[],m=[],v={Mixin:{mountChildren:function(e,t,n){var r=d.instantiateChildren(e,t,n);this._renderedChildren=r;var o=[],i=0;for(var a in r)if(r.hasOwnProperty(a)){var u=r[a],s=this._rootNodeID+a,l=p.mountComponent(u,s,t,n);u._mountIndex=i,o.push(l),i++}return o},updateTextContent:function(e){f++;var t=!0;try{var n=this._renderedChildren;d.unmountChildren(n);for(var r in n)n.hasOwnProperty(r)&&this._unmountChildByName(n[r],r);this.setTextContent(e),t=!1}finally{f--,f||(t?s():u())}},updateChildren:function(e,t,n){f++;var r=!0;try{this._updateChildren(e,t,n),r=!1}finally{f--,f||(r?s():u())}},_updateChildren:function(e,t,n){var r=this._renderedChildren,o=d.updateChildren(r,e,t,n);if(this._renderedChildren=o,o||r){var i,a=0,u=0;for(i in o)if(o.hasOwnProperty(i)){var s=r&&r[i],l=o[i];s===l?(this.moveChild(s,u,a),a=Math.max(s._mountIndex,a),s._mountIndex=u):(s&&(a=Math.max(s._mountIndex,a),this._unmountChildByName(s,i)),this._mountChildByNameAtIndex(l,i,u,t,n)),u++}for(i in r)!r.hasOwnProperty(i)||o&&o.hasOwnProperty(i)||this._unmountChildByName(r[i],i)}},unmountChildren:function(){var e=this._renderedChildren;d.unmountChildren(e),this._renderedChildren=null},moveChild:function(e,t,n){e._mountIndex<n&&o(this._rootNodeID,e._mountIndex,t)},createChild:function(e,t){r(this._rootNodeID,t,e._mountIndex)},removeChild:function(e){i(this._rootNodeID,e._mountIndex)},setTextContent:function(e){a(this._rootNodeID,e)},_mountChildByNameAtIndex:function(e,t,n,r,o){var i=this._rootNodeID+t,a=p.mountComponent(e,i,r,o);e._mountIndex=n,this.createChild(e,a)},_unmountChildByName:function(e,t){this.removeChild(e),e._mountIndex=null}}};t.exports=v},{31:31,36:36,70:70,79:79}],70:[function(e,t,n){"use strict";var r=e(138),o=r({INSERT_MARKUP:null,MOVE_EXISTING:null,REMOVE_NODE:null,TEXT_CONTENT:null});t.exports=o},{138:138}],71:[function(e,t,n){"use strict";function r(e){if("function"==typeof e.type)return e.type;var t=e.type,n=p[t];return null==n&&(p[t]=n=l(t)),n}function o(e){return s(c),new c(e.type,e.props)}function i(e){return new d(e)}function a(e){return e instanceof d}var u=e(27),s=e(133),l=null,c=null,p={},d=null,f={injectGenericComponentClass:function(e){c=e},injectTextComponentClass:function(e){d=e},injectComponentClasses:function(e){u(p,e)},injectAutoWrapper:function(e){l=e}},h={getComponentClassForElement:r,createInternalComponent:o,createInstanceForText:i,isTextComponent:a,injection:f};t.exports=h},{133:133,27:27}],72:[function(e,t,n){"use strict";var r=e(133),o={isValidOwner:function(e){return!(!e||"function"!=typeof e.attachRef||"function"!=typeof e.detachRef)},addComponentAsRefTo:function(e,t,n){r(o.isValidOwner(n)),n.attachRef(t,e)},removeComponentAsRefFrom:function(e,t,n){r(o.isValidOwner(n)),n.getPublicInstance().refs[t]===e.getPublicInstance()&&n.detachRef(t)}};t.exports=o},{133:133}],73:[function(e,t,n){"use strict";function r(e,t,n){return n}var o={enableMeasure:!1,storedMeasure:r,measureMethods:function(e,t,n){},measure:function(e,t,n){return n},injection:{injectMeasure:function(e){o.storedMeasure=e}}};t.exports=o},{}],74:[function(e,t,n){"use strict";var r={};t.exports=r},{}],75:[function(e,t,n){"use strict";var r=e(138),o=r({prop:null,context:null,childContext:null});t.exports=o},{138:138}],76:[function(e,t,n){"use strict";function r(e){function t(t,n,r,o,i){if(o=o||b,null==n[r]){var a=C[i];return t?new Error("Required "+a+" `"+r+"` was not specified in "+("`"+o+"`.")):null}return e(n,r,o,i)}var n=t.bind(null,!1);return n.isRequired=t.bind(null,!0),n}function o(e){function t(t,n,r,o){var i=t[n],a=m(i);if(a!==e){var u=C[o],s=v(i);return new Error("Invalid "+u+" `"+n+"` of type `"+s+"` "+("supplied to `"+r+"`, expected `"+e+"`."))}return null}return r(t)}function i(){return r(E.thatReturns(null))}function a(e){function t(t,n,r,o){var i=t[n];if(!Array.isArray(i)){var a=C[o],u=m(i);return new Error("Invalid "+a+" `"+n+"` of type "+("`"+u+"` supplied to `"+r+"`, expected an array."))}for(var s=0;s<i.length;s++){var l=e(i,s,r,o);if(l instanceof Error)return l}return null}return r(t)}function u(){function e(e,t,n,r){if(!g.isValidElement(e[t])){var o=C[r];return new Error("Invalid "+o+" `"+t+"` supplied to "+("`"+n+"`, expected a ReactElement."))}return null}return r(e)}function s(e){function t(t,n,r,o){if(!(t[n]instanceof e)){var i=C[o],a=e.name||b;return new Error("Invalid "+i+" `"+n+"` supplied to "+("`"+r+"`, expected instance of `"+a+"`."))}return null}return r(t)}function l(e){function t(t,n,r,o){for(var i=t[n],a=0;a<e.length;a++)if(i===e[a])return null;var u=C[o],s=JSON.stringify(e);return new Error("Invalid "+u+" `"+n+"` of value `"+i+"` "+("supplied to `"+r+"`, expected one of "+s+"."))}return r(t)}function c(e){function t(t,n,r,o){var i=t[n],a=m(i);if("object"!==a){var u=C[o];return new Error("Invalid "+u+" `"+n+"` of type "+("`"+a+"` supplied to `"+r+"`, expected an object."))}for(var s in i)if(i.hasOwnProperty(s)){var l=e(i,s,r,o);if(l instanceof Error)return l}return null}return r(t)}function p(e){function t(t,n,r,o){for(var i=0;i<e.length;i++){var a=e[i];if(null==a(t,n,r,o))return null}var u=C[o];return new Error("Invalid "+u+" `"+n+"` supplied to "+("`"+r+"`."))}return r(t)}function d(){function e(e,t,n,r){if(!h(e[t])){var o=C[r];return new Error("Invalid "+o+" `"+t+"` supplied to "+("`"+n+"`, expected a ReactNode."))}return null}return r(e)}function f(e){function t(t,n,r,o){var i=t[n],a=m(i);if("object"!==a){var u=C[o];return new Error("Invalid "+u+" `"+n+"` of type `"+a+"` "+("supplied to `"+r+"`, expected `object`."))}for(var s in e){var l=e[s];if(l){var c=l(i,s,r,o);if(c)return c}}return null}return r(t)}function h(e){switch(typeof e){case"number":case"string":case"undefined":return!0;case"boolean":return!e;case"object":if(Array.isArray(e))return e.every(h);if(null===e||g.isValidElement(e))return!0;e=y.extractIfFragment(e);for(var t in e)if(!h(e[t]))return!1;return!0;default:return!1}}function m(e){var t=typeof e;return Array.isArray(e)?"array":e instanceof RegExp?"object":t}function v(e){var t=m(e);if("object"===t){if(e instanceof Date)return"date";if(e instanceof RegExp)return"regexp"}return t}var g=e(55),y=e(61),C=e(74),E=e(112),b="<<anonymous>>",_=u(),x=d(),D={array:o("array"),bool:o("boolean"),func:o("function"),number:o("number"),object:o("object"),string:o("string"),any:i(),arrayOf:a,element:_,instanceOf:s,node:x,objectOf:c,oneOf:l,oneOfType:p,shape:f};t.exports=D},{112:112,55:55,61:61,74:74}],77:[function(e,t,n){"use strict";function r(){this.listenersToPut=[]}var o=e(28),i=e(30),a=e(27);a(r.prototype,{enqueuePutListener:function(e,t,n){this.listenersToPut.push({rootNodeID:e,propKey:t,propValue:n})},putListeners:function(){for(var e=0;e<this.listenersToPut.length;e++){var t=this.listenersToPut[e];i.putListener(t.rootNodeID,t.propKey,t.propValue)}},reset:function(){this.listenersToPut.length=0},destructor:function(){this.reset()}}),o.addPoolingTo(r),t.exports=r},{27:27,28:28,30:30}],78:[function(e,t,n){"use strict";function r(){this.reinitializeTransaction(),this.renderToStaticMarkup=!1,this.reactMountReady=o.getPooled(null),this.putListenerQueue=s.getPooled()}var o=e(6),i=e(28),a=e(30),u=e(63),s=e(77),l=e(101),c=e(27),p={initialize:u.getSelectionInformation,close:u.restoreSelection},d={initialize:function(){var e=a.isEnabled();return a.setEnabled(!1),e},close:function(e){a.setEnabled(e)}},f={initialize:function(){this.reactMountReady.reset()},close:function(){this.reactMountReady.notifyAll()}},h={initialize:function(){this.putListenerQueue.reset()},close:function(){this.putListenerQueue.putListeners()}},m=[h,p,d,f],v={getTransactionWrappers:function(){return m},getReactMountReady:function(){return this.reactMountReady},getPutListenerQueue:function(){return this.putListenerQueue},destructor:function(){o.release(this.reactMountReady),this.reactMountReady=null,s.release(this.putListenerQueue),this.putListenerQueue=null}};c(r.prototype,l.Mixin,v),i.addPoolingTo(r),t.exports=r},{101:101,27:27,28:28,30:30,6:6,63:63,77:77}],79:[function(e,t,n){"use strict";function r(){o.attachRefs(this,this._currentElement)}var o=e(80),i=(e(56),{mountComponent:function(e,t,n,o){var i=e.mountComponent(t,n,o);return n.getReactMountReady().enqueue(r,e),i},unmountComponent:function(e){o.detachRefs(e,e._currentElement),e.unmountComponent()},receiveComponent:function(e,t,n,i){var a=e._currentElement;if(t!==a||null==t._owner){var u=o.shouldUpdateRefs(a,t);u&&o.detachRefs(e,a),e.receiveComponent(t,n,i),u&&n.getReactMountReady().enqueue(r,e)}},performUpdateIfNecessary:function(e,t){e.performUpdateIfNecessary(t)}});t.exports=i},{56:56,80:80}],80:[function(e,t,n){"use strict";function r(e,t,n){"function"==typeof e?e(t.getPublicInstance()):i.addComponentAsRefTo(t,e,n)}function o(e,t,n){"function"==typeof e?e(null):i.removeComponentAsRefFrom(t,e,n)}var i=e(72),a={};a.attachRefs=function(e,t){var n=t.ref;null!=n&&r(n,e,t._owner)},a.shouldUpdateRefs=function(e,t){return t._owner!==e._owner||t.ref!==e.ref},a.detachRefs=function(e,t){var n=t.ref;null!=n&&o(n,e,t._owner)},t.exports=a},{72:72}],81:[function(e,t,n){"use strict";var r={injectCreateReactRootIndex:function(e){o.createReactRootIndex=e}},o={createReactRootIndex:null,injection:r};t.exports=o},{}],82:[function(e,t,n){"use strict";function r(e){p(i.isValidElement(e));var t;try{var n=a.createReactRootID();return t=s.getPooled(!1),t.perform(function(){var r=c(e,null),o=r.mountComponent(n,t,l);return u.addChecksumToMarkup(o)},null)}finally{s.release(t)}}function o(e){p(i.isValidElement(e));var t;try{var n=a.createReactRootID();return t=s.getPooled(!0),t.perform(function(){var r=c(e,null);return r.mountComponent(n,t,l)},null)}finally{s.release(t)}}var i=e(55),a=e(64),u=e(67),s=e(83),l=e(113),c=e(132),p=e(133);t.exports={renderToString:r,renderToStaticMarkup:o}},{113:113,132:132,133:133,55:55,64:64,67:67,83:83}],83:[function(e,t,n){"use strict";function r(e){this.reinitializeTransaction(),this.renderToStaticMarkup=e,this.reactMountReady=i.getPooled(null),this.putListenerQueue=a.getPooled()}var o=e(28),i=e(6),a=e(77),u=e(101),s=e(27),l=e(112),c={initialize:function(){this.reactMountReady.reset()},close:l},p={initialize:function(){this.putListenerQueue.reset()},close:l},d=[p,c],f={getTransactionWrappers:function(){return d},getReactMountReady:function(){return this.reactMountReady},getPutListenerQueue:function(){return this.putListenerQueue},destructor:function(){i.release(this.reactMountReady),this.reactMountReady=null,a.release(this.putListenerQueue),this.putListenerQueue=null}};s(r.prototype,u.Mixin,f),o.addPoolingTo(r),t.exports=r},{101:101,112:112,27:27,28:28,6:6,77:77}],84:[function(e,t,n){"use strict";function r(e){e!==i.currentlyMountingInstance&&l.enqueueUpdate(e)}function o(e,t){p(null==a.current);var n=s.get(e);return n?n===i.currentlyUnmountingInstance?null:n:null}var i=e(66),a=e(39),u=e(55),s=e(65),l=e(85),c=e(27),p=e(133),d=(e(150),{enqueueCallback:function(e,t){p("function"==typeof t);var n=o(e);return n&&n!==i.currentlyMountingInstance?(n._pendingCallbacks?n._pendingCallbacks.push(t):n._pendingCallbacks=[t],void r(n)):null},enqueueCallbackInternal:function(e,t){p("function"==typeof t),e._pendingCallbacks?e._pendingCallbacks.push(t):e._pendingCallbacks=[t],r(e)},enqueueForceUpdate:function(e){var t=o(e,"forceUpdate");t&&(t._pendingForceUpdate=!0,r(t))},enqueueReplaceState:function(e,t){var n=o(e,"replaceState");n&&(n._pendingStateQueue=[t],n._pendingReplaceState=!0,r(n))},enqueueSetState:function(e,t){var n=o(e,"setState");if(n){var i=n._pendingStateQueue||(n._pendingStateQueue=[]);i.push(t),r(n)}},enqueueSetProps:function(e,t){var n=o(e,"setProps");if(n){p(n._isTopLevel);var i=n._pendingElement||n._currentElement,a=c({},i.props,t);n._pendingElement=u.cloneAndReplaceProps(i,a),r(n)}},enqueueReplaceProps:function(e,t){var n=o(e,"replaceProps");if(n){p(n._isTopLevel);var i=n._pendingElement||n._currentElement;n._pendingElement=u.cloneAndReplaceProps(i,t),r(n)}},enqueueElementInternal:function(e,t){e._pendingElement=t,r(e)}});t.exports=d},{133:133,150:150,27:27,39:39,55:55,65:65,66:66,85:85}],85:[function(e,t,n){"use strict";function r(){v(N.ReactReconcileTransaction&&E)}function o(){this.reinitializeTransaction(),this.dirtyComponentsLength=null,this.callbackQueue=c.getPooled(),this.reconcileTransaction=N.ReactReconcileTransaction.getPooled()}function i(e,t,n,o,i){r(),E.batchedUpdates(e,t,n,o,i)}function a(e,t){return e._mountOrder-t._mountOrder}function u(e){var t=e.dirtyComponentsLength;v(t===g.length),g.sort(a);for(var n=0;t>n;n++){var r=g[n],o=r._pendingCallbacks;if(r._pendingCallbacks=null,f.performUpdateIfNecessary(r,e.reconcileTransaction),o)for(var i=0;i<o.length;i++)e.callbackQueue.enqueue(o[i],r.getPublicInstance())}}function s(e){return r(),E.isBatchingUpdates?void g.push(e):void E.batchedUpdates(s,e)}function l(e,t){v(E.isBatchingUpdates),y.enqueue(e,t),C=!0}var c=e(6),p=e(28),d=(e(39),e(73)),f=e(79),h=e(101),m=e(27),v=e(133),g=(e(150),[]),y=c.getPooled(),C=!1,E=null,b={initialize:function(){this.dirtyComponentsLength=g.length},close:function(){this.dirtyComponentsLength!==g.length?(g.splice(0,this.dirtyComponentsLength),D()):g.length=0}},_={initialize:function(){this.callbackQueue.reset()},close:function(){this.callbackQueue.notifyAll()}},x=[b,_];m(o.prototype,h.Mixin,{getTransactionWrappers:function(){return x},destructor:function(){this.dirtyComponentsLength=null,c.release(this.callbackQueue),this.callbackQueue=null,N.ReactReconcileTransaction.release(this.reconcileTransaction),this.reconcileTransaction=null},perform:function(e,t,n){return h.Mixin.perform.call(this,this.reconcileTransaction.perform,this.reconcileTransaction,e,t,n)}}),p.addPoolingTo(o);var D=function(){for(;g.length||C;){if(g.length){var e=o.getPooled();e.perform(u,null,e),o.release(e)}if(C){C=!1;var t=y;y=c.getPooled(),t.notifyAll(),c.release(t)}}};D=d.measure("ReactUpdates","flushBatchedUpdates",D);var M={injectReconcileTransaction:function(e){v(e),N.ReactReconcileTransaction=e},injectBatchingStrategy:function(e){v(e),v("function"==typeof e.batchedUpdates),v("boolean"==typeof e.isBatchingUpdates),E=e}},N={ReactReconcileTransaction:null,batchedUpdates:i,enqueueUpdate:s,flushBatchedUpdates:D,injection:M,asap:l};t.exports=N},{101:101,133:133,150:150,27:27,28:28,39:39,6:6,73:73,79:79}],86:[function(e,t,n){"use strict";var r=e(10),o=r.injection.MUST_USE_ATTRIBUTE,i={Properties:{clipPath:o,cx:o,cy:o,d:o,dx:o,dy:o,fill:o,fillOpacity:o,fontFamily:o,fontSize:o,fx:o,fy:o,gradientTransform:o,gradientUnits:o,markerEnd:o,markerMid:o,markerStart:o,offset:o,opacity:o,patternContentUnits:o,patternUnits:o,points:o,preserveAspectRatio:o,r:o,rx:o,ry:o,spreadMethod:o,stopColor:o,stopOpacity:o,stroke:o,strokeDasharray:o,strokeLinecap:o,strokeOpacity:o,strokeWidth:o,textAnchor:o,transform:o,version:o,viewBox:o,x1:o,x2:o,x:o,y1:o,y2:o,y:o},DOMAttributeNames:{clipPath:"clip-path",fillOpacity:"fill-opacity",fontFamily:"font-family",fontSize:"font-size",gradientTransform:"gradientTransform",gradientUnits:"gradientUnits",markerEnd:"marker-end",markerMid:"marker-mid",markerStart:"marker-start",patternContentUnits:"patternContentUnits",patternUnits:"patternUnits",preserveAspectRatio:"preserveAspectRatio",spreadMethod:"spreadMethod",stopColor:"stop-color",stopOpacity:"stop-opacity",strokeDasharray:"stroke-dasharray",strokeLinecap:"stroke-linecap",strokeOpacity:"stroke-opacity",strokeWidth:"stroke-width",textAnchor:"text-anchor",viewBox:"viewBox"}};t.exports=i},{10:10}],87:[function(e,t,n){"use strict";function r(e){if("selectionStart"in e&&u.hasSelectionCapabilities(e))return{start:e.selectionStart,end:e.selectionEnd};if(window.getSelection){var t=window.getSelection();return{anchorNode:t.anchorNode,anchorOffset:t.anchorOffset,focusNode:t.focusNode,focusOffset:t.focusOffset}}if(document.selection){var n=document.selection.createRange();return{parentElement:n.parentElement(),text:n.text,top:n.boundingTop,left:n.boundingLeft}}}function o(e){if(y||null==m||m!==l())return null;var t=r(m);if(!g||!d(g,t)){g=t;var n=s.getPooled(h.select,v,e);return n.type="select",n.target=m,a.accumulateTwoPhaseDispatches(n),n}}var i=e(15),a=e(20),u=e(63),s=e(93),l=e(119),c=e(136),p=e(139),d=e(146),f=i.topLevelTypes,h={select:{phasedRegistrationNames:{bubbled:p({onSelect:null}),captured:p({onSelectCapture:null})},dependencies:[f.topBlur,f.topContextMenu,f.topFocus,f.topKeyDown,f.topMouseDown,f.topMouseUp,f.topSelectionChange]
}},m=null,v=null,g=null,y=!1,C={eventTypes:h,extractEvents:function(e,t,n,r){switch(e){case f.topFocus:(c(t)||"true"===t.contentEditable)&&(m=t,v=n,g=null);break;case f.topBlur:m=null,v=null,g=null;break;case f.topMouseDown:y=!0;break;case f.topContextMenu:case f.topMouseUp:return y=!1,o(r);case f.topSelectionChange:case f.topKeyDown:case f.topKeyUp:return o(r)}}};t.exports=C},{119:119,136:136,139:139,146:146,15:15,20:20,63:63,93:93}],88:[function(e,t,n){"use strict";var r=Math.pow(2,53),o={createReactRootIndex:function(){return Math.ceil(Math.random()*r)}};t.exports=o},{}],89:[function(e,t,n){"use strict";var r=e(15),o=e(19),i=e(20),a=e(90),u=e(93),s=e(94),l=e(96),c=e(97),p=e(92),d=e(98),f=e(99),h=e(100),m=e(120),v=e(133),g=e(139),y=(e(150),r.topLevelTypes),C={blur:{phasedRegistrationNames:{bubbled:g({onBlur:!0}),captured:g({onBlurCapture:!0})}},click:{phasedRegistrationNames:{bubbled:g({onClick:!0}),captured:g({onClickCapture:!0})}},contextMenu:{phasedRegistrationNames:{bubbled:g({onContextMenu:!0}),captured:g({onContextMenuCapture:!0})}},copy:{phasedRegistrationNames:{bubbled:g({onCopy:!0}),captured:g({onCopyCapture:!0})}},cut:{phasedRegistrationNames:{bubbled:g({onCut:!0}),captured:g({onCutCapture:!0})}},doubleClick:{phasedRegistrationNames:{bubbled:g({onDoubleClick:!0}),captured:g({onDoubleClickCapture:!0})}},drag:{phasedRegistrationNames:{bubbled:g({onDrag:!0}),captured:g({onDragCapture:!0})}},dragEnd:{phasedRegistrationNames:{bubbled:g({onDragEnd:!0}),captured:g({onDragEndCapture:!0})}},dragEnter:{phasedRegistrationNames:{bubbled:g({onDragEnter:!0}),captured:g({onDragEnterCapture:!0})}},dragExit:{phasedRegistrationNames:{bubbled:g({onDragExit:!0}),captured:g({onDragExitCapture:!0})}},dragLeave:{phasedRegistrationNames:{bubbled:g({onDragLeave:!0}),captured:g({onDragLeaveCapture:!0})}},dragOver:{phasedRegistrationNames:{bubbled:g({onDragOver:!0}),captured:g({onDragOverCapture:!0})}},dragStart:{phasedRegistrationNames:{bubbled:g({onDragStart:!0}),captured:g({onDragStartCapture:!0})}},drop:{phasedRegistrationNames:{bubbled:g({onDrop:!0}),captured:g({onDropCapture:!0})}},focus:{phasedRegistrationNames:{bubbled:g({onFocus:!0}),captured:g({onFocusCapture:!0})}},input:{phasedRegistrationNames:{bubbled:g({onInput:!0}),captured:g({onInputCapture:!0})}},keyDown:{phasedRegistrationNames:{bubbled:g({onKeyDown:!0}),captured:g({onKeyDownCapture:!0})}},keyPress:{phasedRegistrationNames:{bubbled:g({onKeyPress:!0}),captured:g({onKeyPressCapture:!0})}},keyUp:{phasedRegistrationNames:{bubbled:g({onKeyUp:!0}),captured:g({onKeyUpCapture:!0})}},load:{phasedRegistrationNames:{bubbled:g({onLoad:!0}),captured:g({onLoadCapture:!0})}},error:{phasedRegistrationNames:{bubbled:g({onError:!0}),captured:g({onErrorCapture:!0})}},mouseDown:{phasedRegistrationNames:{bubbled:g({onMouseDown:!0}),captured:g({onMouseDownCapture:!0})}},mouseMove:{phasedRegistrationNames:{bubbled:g({onMouseMove:!0}),captured:g({onMouseMoveCapture:!0})}},mouseOut:{phasedRegistrationNames:{bubbled:g({onMouseOut:!0}),captured:g({onMouseOutCapture:!0})}},mouseOver:{phasedRegistrationNames:{bubbled:g({onMouseOver:!0}),captured:g({onMouseOverCapture:!0})}},mouseUp:{phasedRegistrationNames:{bubbled:g({onMouseUp:!0}),captured:g({onMouseUpCapture:!0})}},paste:{phasedRegistrationNames:{bubbled:g({onPaste:!0}),captured:g({onPasteCapture:!0})}},reset:{phasedRegistrationNames:{bubbled:g({onReset:!0}),captured:g({onResetCapture:!0})}},scroll:{phasedRegistrationNames:{bubbled:g({onScroll:!0}),captured:g({onScrollCapture:!0})}},submit:{phasedRegistrationNames:{bubbled:g({onSubmit:!0}),captured:g({onSubmitCapture:!0})}},touchCancel:{phasedRegistrationNames:{bubbled:g({onTouchCancel:!0}),captured:g({onTouchCancelCapture:!0})}},touchEnd:{phasedRegistrationNames:{bubbled:g({onTouchEnd:!0}),captured:g({onTouchEndCapture:!0})}},touchMove:{phasedRegistrationNames:{bubbled:g({onTouchMove:!0}),captured:g({onTouchMoveCapture:!0})}},touchStart:{phasedRegistrationNames:{bubbled:g({onTouchStart:!0}),captured:g({onTouchStartCapture:!0})}},wheel:{phasedRegistrationNames:{bubbled:g({onWheel:!0}),captured:g({onWheelCapture:!0})}}},E={topBlur:C.blur,topClick:C.click,topContextMenu:C.contextMenu,topCopy:C.copy,topCut:C.cut,topDoubleClick:C.doubleClick,topDrag:C.drag,topDragEnd:C.dragEnd,topDragEnter:C.dragEnter,topDragExit:C.dragExit,topDragLeave:C.dragLeave,topDragOver:C.dragOver,topDragStart:C.dragStart,topDrop:C.drop,topError:C.error,topFocus:C.focus,topInput:C.input,topKeyDown:C.keyDown,topKeyPress:C.keyPress,topKeyUp:C.keyUp,topLoad:C.load,topMouseDown:C.mouseDown,topMouseMove:C.mouseMove,topMouseOut:C.mouseOut,topMouseOver:C.mouseOver,topMouseUp:C.mouseUp,topPaste:C.paste,topReset:C.reset,topScroll:C.scroll,topSubmit:C.submit,topTouchCancel:C.touchCancel,topTouchEnd:C.touchEnd,topTouchMove:C.touchMove,topTouchStart:C.touchStart,topWheel:C.wheel};for(var b in E)E[b].dependencies=[b];var _={eventTypes:C,executeDispatch:function(e,t,n){var r=o.executeDispatch(e,t,n);r===!1&&(e.stopPropagation(),e.preventDefault())},extractEvents:function(e,t,n,r){var o=E[e];if(!o)return null;var g;switch(e){case y.topInput:case y.topLoad:case y.topError:case y.topReset:case y.topSubmit:g=u;break;case y.topKeyPress:if(0===m(r))return null;case y.topKeyDown:case y.topKeyUp:g=l;break;case y.topBlur:case y.topFocus:g=s;break;case y.topClick:if(2===r.button)return null;case y.topContextMenu:case y.topDoubleClick:case y.topMouseDown:case y.topMouseMove:case y.topMouseOut:case y.topMouseOver:case y.topMouseUp:g=c;break;case y.topDrag:case y.topDragEnd:case y.topDragEnter:case y.topDragExit:case y.topDragLeave:case y.topDragOver:case y.topDragStart:case y.topDrop:g=p;break;case y.topTouchCancel:case y.topTouchEnd:case y.topTouchMove:case y.topTouchStart:g=d;break;case y.topScroll:g=f;break;case y.topWheel:g=h;break;case y.topCopy:case y.topCut:case y.topPaste:g=a}v(g);var C=g.getPooled(o,n,r);return i.accumulateTwoPhaseDispatches(C),C}};t.exports=_},{100:100,120:120,133:133,139:139,15:15,150:150,19:19,20:20,90:90,92:92,93:93,94:94,96:96,97:97,98:98,99:99}],90:[function(e,t,n){"use strict";function r(e,t,n){o.call(this,e,t,n)}var o=e(93),i={clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}};o.augmentClass(r,i),t.exports=r},{93:93}],91:[function(e,t,n){"use strict";function r(e,t,n){o.call(this,e,t,n)}var o=e(93),i={data:null};o.augmentClass(r,i),t.exports=r},{93:93}],92:[function(e,t,n){"use strict";function r(e,t,n){o.call(this,e,t,n)}var o=e(97),i={dataTransfer:null};o.augmentClass(r,i),t.exports=r},{97:97}],93:[function(e,t,n){"use strict";function r(e,t,n){this.dispatchConfig=e,this.dispatchMarker=t,this.nativeEvent=n;var r=this.constructor.Interface;for(var o in r)if(r.hasOwnProperty(o)){var i=r[o];i?this[o]=i(n):this[o]=n[o]}var u=null!=n.defaultPrevented?n.defaultPrevented:n.returnValue===!1;u?this.isDefaultPrevented=a.thatReturnsTrue:this.isDefaultPrevented=a.thatReturnsFalse,this.isPropagationStopped=a.thatReturnsFalse}var o=e(28),i=e(27),a=e(112),u=e(123),s={type:null,target:u,currentTarget:a.thatReturnsNull,eventPhase:null,bubbles:null,cancelable:null,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:null,isTrusted:null};i(r.prototype,{preventDefault:function(){this.defaultPrevented=!0;var e=this.nativeEvent;e.preventDefault?e.preventDefault():e.returnValue=!1,this.isDefaultPrevented=a.thatReturnsTrue},stopPropagation:function(){var e=this.nativeEvent;e.stopPropagation?e.stopPropagation():e.cancelBubble=!0,this.isPropagationStopped=a.thatReturnsTrue},persist:function(){this.isPersistent=a.thatReturnsTrue},isPersistent:a.thatReturnsFalse,destructor:function(){var e=this.constructor.Interface;for(var t in e)this[t]=null;this.dispatchConfig=null,this.dispatchMarker=null,this.nativeEvent=null}}),r.Interface=s,r.augmentClass=function(e,t){var n=this,r=Object.create(n.prototype);i(r,e.prototype),e.prototype=r,e.prototype.constructor=e,e.Interface=i({},n.Interface,t),e.augmentClass=n.augmentClass,o.addPoolingTo(e,o.threeArgumentPooler)},o.addPoolingTo(r,o.threeArgumentPooler),t.exports=r},{112:112,123:123,27:27,28:28}],94:[function(e,t,n){"use strict";function r(e,t,n){o.call(this,e,t,n)}var o=e(99),i={relatedTarget:null};o.augmentClass(r,i),t.exports=r},{99:99}],95:[function(e,t,n){"use strict";function r(e,t,n){o.call(this,e,t,n)}var o=e(93),i={data:null};o.augmentClass(r,i),t.exports=r},{93:93}],96:[function(e,t,n){"use strict";function r(e,t,n){o.call(this,e,t,n)}var o=e(99),i=e(120),a=e(121),u=e(122),s={key:a,location:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,repeat:null,locale:null,getModifierState:u,charCode:function(e){return"keypress"===e.type?i(e):0},keyCode:function(e){return"keydown"===e.type||"keyup"===e.type?e.keyCode:0},which:function(e){return"keypress"===e.type?i(e):"keydown"===e.type||"keyup"===e.type?e.keyCode:0}};o.augmentClass(r,s),t.exports=r},{120:120,121:121,122:122,99:99}],97:[function(e,t,n){"use strict";function r(e,t,n){o.call(this,e,t,n)}var o=e(99),i=e(102),a=e(122),u={screenX:null,screenY:null,clientX:null,clientY:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,getModifierState:a,button:function(e){var t=e.button;return"which"in e?t:2===t?2:4===t?1:0},buttons:null,relatedTarget:function(e){return e.relatedTarget||(e.fromElement===e.srcElement?e.toElement:e.fromElement)},pageX:function(e){return"pageX"in e?e.pageX:e.clientX+i.currentScrollLeft},pageY:function(e){return"pageY"in e?e.pageY:e.clientY+i.currentScrollTop}};o.augmentClass(r,u),t.exports=r},{102:102,122:122,99:99}],98:[function(e,t,n){"use strict";function r(e,t,n){o.call(this,e,t,n)}var o=e(99),i=e(122),a={touches:null,targetTouches:null,changedTouches:null,altKey:null,metaKey:null,ctrlKey:null,shiftKey:null,getModifierState:i};o.augmentClass(r,a),t.exports=r},{122:122,99:99}],99:[function(e,t,n){"use strict";function r(e,t,n){o.call(this,e,t,n)}var o=e(93),i=e(123),a={view:function(e){if(e.view)return e.view;var t=i(e);if(null!=t&&t.window===t)return t;var n=t.ownerDocument;return n?n.defaultView||n.parentWindow:window},detail:function(e){return e.detail||0}};o.augmentClass(r,a),t.exports=r},{123:123,93:93}],100:[function(e,t,n){"use strict";function r(e,t,n){o.call(this,e,t,n)}var o=e(97),i={deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:null,deltaMode:null};o.augmentClass(r,i),t.exports=r},{97:97}],101:[function(e,t,n){"use strict";var r=e(133),o={reinitializeTransaction:function(){this.transactionWrappers=this.getTransactionWrappers(),this.wrapperInitData?this.wrapperInitData.length=0:this.wrapperInitData=[],this._isInTransaction=!1},_isInTransaction:!1,getTransactionWrappers:null,isInTransaction:function(){return!!this._isInTransaction},perform:function(e,t,n,o,i,a,u,s){r(!this.isInTransaction());var l,c;try{this._isInTransaction=!0,l=!0,this.initializeAll(0),c=e.call(t,n,o,i,a,u,s),l=!1}finally{try{if(l)try{this.closeAll(0)}catch(p){}else this.closeAll(0)}finally{this._isInTransaction=!1}}return c},initializeAll:function(e){for(var t=this.transactionWrappers,n=e;n<t.length;n++){var r=t[n];try{this.wrapperInitData[n]=i.OBSERVED_ERROR,this.wrapperInitData[n]=r.initialize?r.initialize.call(this):null}finally{if(this.wrapperInitData[n]===i.OBSERVED_ERROR)try{this.initializeAll(n+1)}catch(o){}}}},closeAll:function(e){r(this.isInTransaction());for(var t=this.transactionWrappers,n=e;n<t.length;n++){var o,a=t[n],u=this.wrapperInitData[n];try{o=!0,u!==i.OBSERVED_ERROR&&a.close&&a.close.call(this,u),o=!1}finally{if(o)try{this.closeAll(n+1)}catch(s){}}}this.wrapperInitData.length=0}},i={Mixin:o,OBSERVED_ERROR:{}};t.exports=i},{133:133}],102:[function(e,t,n){"use strict";var r={currentScrollLeft:0,currentScrollTop:0,refreshScrollValues:function(e){r.currentScrollLeft=e.x,r.currentScrollTop=e.y}};t.exports=r},{}],103:[function(e,t,n){"use strict";function r(e,t){if(o(null!=t),null==e)return t;var n=Array.isArray(e),r=Array.isArray(t);return n&&r?(e.push.apply(e,t),e):n?(e.push(t),e):r?[e].concat(t):[e,t]}var o=e(133);t.exports=r},{133:133}],104:[function(e,t,n){"use strict";function r(e){for(var t=1,n=0,r=0;r<e.length;r++)t=(t+e.charCodeAt(r))%o,n=(n+t)%o;return t|n<<16}var o=65521;t.exports=r},{}],105:[function(e,t,n){function r(e){return e.replace(o,function(e,t){return t.toUpperCase()})}var o=/-(.)/g;t.exports=r},{}],106:[function(e,t,n){"use strict";function r(e){return o(e.replace(i,"ms-"))}var o=e(105),i=/^-ms-/;t.exports=r},{105:105}],107:[function(e,t,n){function r(e,t){return e&&t?e===t?!0:o(e)?!1:o(t)?r(e,t.parentNode):e.contains?e.contains(t):e.compareDocumentPosition?!!(16&e.compareDocumentPosition(t)):!1:!1}var o=e(137);t.exports=r},{137:137}],108:[function(e,t,n){function r(e){return!!e&&("object"==typeof e||"function"==typeof e)&&"length"in e&&!("setInterval"in e)&&"number"!=typeof e.nodeType&&(Array.isArray(e)||"callee"in e||"item"in e)}function o(e){return r(e)?Array.isArray(e)?e.slice():i(e):[e]}var i=e(148);t.exports=o},{148:148}],109:[function(e,t,n){"use strict";function r(e){var t=i.createFactory(e),n=o.createClass({tagName:e.toUpperCase(),displayName:"ReactFullPageComponent"+e,componentWillUnmount:function(){a(!1)},render:function(){return t(this.props)}});return n}var o=e(33),i=e(55),a=e(133);t.exports=r},{133:133,33:33,55:55}],110:[function(e,t,n){function r(e){var t=e.match(c);return t&&t[1].toLowerCase()}function o(e,t){var n=l;s(!!l);var o=r(e),i=o&&u(o);if(i){n.innerHTML=i[1]+e+i[2];for(var c=i[0];c--;)n=n.lastChild}else n.innerHTML=e;var p=n.getElementsByTagName("script");p.length&&(s(t),a(p).forEach(t));for(var d=a(n.childNodes);n.lastChild;)n.removeChild(n.lastChild);return d}var i=e(21),a=e(108),u=e(125),s=e(133),l=i.canUseDOM?document.createElement("div"):null,c=/^\s*<(\w+)/;t.exports=o},{108:108,125:125,133:133,21:21}],111:[function(e,t,n){"use strict";function r(e,t){var n=null==t||"boolean"==typeof t||""===t;if(n)return"";var r=isNaN(t);return r||0===t||i.hasOwnProperty(e)&&i[e]?""+t:("string"==typeof t&&(t=t.trim()),t+"px")}var o=e(4),i=o.isUnitlessNumber;t.exports=r},{4:4}],112:[function(e,t,n){function r(e){return function(){return e}}function o(){}o.thatReturns=r,o.thatReturnsFalse=r(!1),o.thatReturnsTrue=r(!0),o.thatReturnsNull=r(null),o.thatReturnsThis=function(){return this},o.thatReturnsArgument=function(e){return e},t.exports=o},{}],113:[function(e,t,n){"use strict";var r={};t.exports=r},{}],114:[function(e,t,n){"use strict";function r(e){return i[e]}function o(e){return(""+e).replace(a,r)}var i={"&":"&amp;",">":"&gt;","<":"&lt;",'"':"&quot;","'":"&#x27;"},a=/[&><"']/g;t.exports=o},{}],115:[function(e,t,n){"use strict";function r(e){return null==e?null:u(e)?e:o.has(e)?i.getNodeFromInstance(e):(a(null==e.render||"function"!=typeof e.render),void a(!1))}{var o=(e(39),e(65)),i=e(68),a=e(133),u=e(135);e(150)}t.exports=r},{133:133,135:135,150:150,39:39,65:65,68:68}],116:[function(e,t,n){"use strict";function r(e,t,n){var r=e,o=!r.hasOwnProperty(n);o&&null!=t&&(r[n]=t)}function o(e){if(null==e)return e;var t={};return i(e,r,t),t}{var i=e(149);e(150)}t.exports=o},{149:149,150:150}],117:[function(e,t,n){"use strict";function r(e){try{e.focus()}catch(t){}}t.exports=r},{}],118:[function(e,t,n){"use strict";var r=function(e,t,n){Array.isArray(e)?e.forEach(t,n):e&&t.call(n,e)};t.exports=r},{}],119:[function(e,t,n){function r(){try{return document.activeElement||document.body}catch(e){return document.body}}t.exports=r},{}],120:[function(e,t,n){"use strict";function r(e){var t,n=e.keyCode;return"charCode"in e?(t=e.charCode,0===t&&13===n&&(t=13)):t=n,t>=32||13===t?t:0}t.exports=r},{}],121:[function(e,t,n){"use strict";function r(e){if(e.key){var t=i[e.key]||e.key;if("Unidentified"!==t)return t}if("keypress"===e.type){var n=o(e);return 13===n?"Enter":String.fromCharCode(n)}return"keydown"===e.type||"keyup"===e.type?a[e.keyCode]||"Unidentified":""}var o=e(120),i={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},a={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"};t.exports=r},{120:120}],122:[function(e,t,n){"use strict";function r(e){var t=this,n=t.nativeEvent;if(n.getModifierState)return n.getModifierState(e);var r=i[e];return r?!!n[r]:!1}function o(e){return r}var i={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};t.exports=o},{}],123:[function(e,t,n){"use strict";function r(e){var t=e.target||e.srcElement||window;return 3===t.nodeType?t.parentNode:t}t.exports=r},{}],124:[function(e,t,n){"use strict";function r(e){var t=e&&(o&&e[o]||e[i]);return"function"==typeof t?t:void 0}var o="function"==typeof Symbol&&Symbol.iterator,i="@@iterator";t.exports=r},{}],125:[function(e,t,n){function r(e){return i(!!a),d.hasOwnProperty(e)||(e="*"),u.hasOwnProperty(e)||("*"===e?a.innerHTML="<link />":a.innerHTML="<"+e+"></"+e+">",u[e]=!a.firstChild),u[e]?d[e]:null}var o=e(21),i=e(133),a=o.canUseDOM?document.createElement("div"):null,u={circle:!0,clipPath:!0,defs:!0,ellipse:!0,g:!0,line:!0,linearGradient:!0,path:!0,polygon:!0,polyline:!0,radialGradient:!0,rect:!0,stop:!0,text:!0},s=[1,'<select multiple="true">',"</select>"],l=[1,"<table>","</table>"],c=[3,"<table><tbody><tr>","</tr></tbody></table>"],p=[1,"<svg>","</svg>"],d={"*":[1,"?<div>","</div>"],area:[1,"<map>","</map>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],legend:[1,"<fieldset>","</fieldset>"],param:[1,"<object>","</object>"],tr:[2,"<table><tbody>","</tbody></table>"],optgroup:s,option:s,caption:l,colgroup:l,tbody:l,tfoot:l,thead:l,td:c,th:c,circle:p,clipPath:p,defs:p,ellipse:p,g:p,line:p,linearGradient:p,path:p,polygon:p,polyline:p,radialGradient:p,rect:p,stop:p,text:p};t.exports=r},{133:133,21:21}],126:[function(e,t,n){"use strict";function r(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function o(e){for(;e;){if(e.nextSibling)return e.nextSibling;e=e.parentNode}}function i(e,t){for(var n=r(e),i=0,a=0;n;){if(3===n.nodeType){if(a=i+n.textContent.length,t>=i&&a>=t)return{node:n,offset:t-i};i=a}n=r(o(n))}}t.exports=i},{}],127:[function(e,t,n){"use strict";function r(e){return e?e.nodeType===o?e.documentElement:e.firstChild:null}var o=9;t.exports=r},{}],128:[function(e,t,n){"use strict";function r(){return!i&&o.canUseDOM&&(i="textContent"in document.documentElement?"textContent":"innerText"),i}var o=e(21),i=null;t.exports=r},{21:21}],129:[function(e,t,n){"use strict";function r(e){return e===window?{x:window.pageXOffset||document.documentElement.scrollLeft,y:window.pageYOffset||document.documentElement.scrollTop}:{x:e.scrollLeft,y:e.scrollTop}}t.exports=r},{}],130:[function(e,t,n){function r(e){return e.replace(o,"-$1").toLowerCase()}var o=/([A-Z])/g;t.exports=r},{}],131:[function(e,t,n){"use strict";function r(e){return o(e).replace(i,"-ms-")}var o=e(130),i=/^ms-/;t.exports=r},{130:130}],132:[function(e,t,n){"use strict";function r(e){return"function"==typeof e&&"undefined"!=typeof e.prototype&&"function"==typeof e.prototype.mountComponent&&"function"==typeof e.prototype.receiveComponent}function o(e,t){var n;if((null===e||e===!1)&&(e=a.emptyElement),"object"==typeof e){var o=e;n=t===o.type&&"string"==typeof o.type?u.createInternalComponent(o):r(o.type)?new o.type(o):new c}else"string"==typeof e||"number"==typeof e?n=u.createInstanceForText(e):l(!1);return n.construct(e),n._mountIndex=0,n._mountImage=null,n}var i=e(37),a=e(57),u=e(71),s=e(27),l=e(133),c=(e(150),function(){});s(c.prototype,i.Mixin,{_instantiateReactComponent:o}),t.exports=o},{133:133,150:150,27:27,37:37,57:57,71:71}],133:[function(e,t,n){"use strict";var r=function(e,t,n,r,o,i,a,u){if(!e){var s;if(void 0===t)s=new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var l=[n,r,o,i,a,u],c=0;s=new Error("Invariant Violation: "+t.replace(/%s/g,function(){return l[c++]}))}throw s.framesToPop=1,s}};t.exports=r},{}],134:[function(e,t,n){"use strict";function r(e,t){if(!i.canUseDOM||t&&!("addEventListener"in document))return!1;var n="on"+e,r=n in document;if(!r){var a=document.createElement("div");a.setAttribute(n,"return;"),r="function"==typeof a[n]}return!r&&o&&"wheel"===e&&(r=document.implementation.hasFeature("Events.wheel","3.0")),r}var o,i=e(21);i.canUseDOM&&(o=document.implementation&&document.implementation.hasFeature&&document.implementation.hasFeature("","")!==!0),t.exports=r},{21:21}],135:[function(e,t,n){function r(e){return!(!e||!("function"==typeof Node?e instanceof Node:"object"==typeof e&&"number"==typeof e.nodeType&&"string"==typeof e.nodeName))}t.exports=r},{}],136:[function(e,t,n){"use strict";function r(e){return e&&("INPUT"===e.nodeName&&o[e.type]||"TEXTAREA"===e.nodeName)}var o={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};t.exports=r},{}],137:[function(e,t,n){function r(e){return o(e)&&3==e.nodeType}var o=e(135);t.exports=r},{135:135}],138:[function(e,t,n){"use strict";var r=e(133),o=function(e){var t,n={};r(e instanceof Object&&!Array.isArray(e));for(t in e)e.hasOwnProperty(t)&&(n[t]=t);return n};t.exports=o},{133:133}],139:[function(e,t,n){var r=function(e){var t;for(t in e)if(e.hasOwnProperty(t))return t;return null};t.exports=r},{}],140:[function(e,t,n){"use strict";function r(e,t,n){if(!e)return null;var r={};for(var i in e)o.call(e,i)&&(r[i]=t.call(n,e[i],i,e));return r}var o=Object.prototype.hasOwnProperty;t.exports=r},{}],141:[function(e,t,n){"use strict";function r(e){var t={};return function(n){return t.hasOwnProperty(n)||(t[n]=e.call(this,n)),t[n]}}t.exports=r},{}],142:[function(e,t,n){"use strict";function r(e){return i(o.isValidElement(e)),e}var o=e(55),i=e(133);t.exports=r},{133:133,55:55}],143:[function(e,t,n){"use strict";function r(e){return'"'+o(e)+'"'}var o=e(114);t.exports=r},{114:114}],144:[function(e,t,n){"use strict";var r=e(21),o=/^[ \r\n\t\f]/,i=/<(!--|link|noscript|meta|script|style)[ \r\n\t\f\/>]/,a=function(e,t){e.innerHTML=t};if("undefined"!=typeof MSApp&&MSApp.execUnsafeLocalFunction&&(a=function(e,t){MSApp.execUnsafeLocalFunction(function(){e.innerHTML=t})}),r.canUseDOM){var u=document.createElement("div");u.innerHTML=" ",""===u.innerHTML&&(a=function(e,t){if(e.parentNode&&e.parentNode.replaceChild(e,e),o.test(t)||"<"===t[0]&&i.test(t)){e.innerHTML="\ufeff"+t;var n=e.firstChild;1===n.data.length?e.removeChild(n):n.deleteData(0,1)}else e.innerHTML=t})}t.exports=a},{21:21}],145:[function(e,t,n){"use strict";var r=e(21),o=e(114),i=e(144),a=function(e,t){e.textContent=t};r.canUseDOM&&("textContent"in document.documentElement||(a=function(e,t){i(e,o(t))})),t.exports=a},{114:114,144:144,21:21}],146:[function(e,t,n){"use strict";function r(e,t){if(e===t)return!0;var n;for(n in e)if(e.hasOwnProperty(n)&&(!t.hasOwnProperty(n)||e[n]!==t[n]))return!1;for(n in t)if(t.hasOwnProperty(n)&&!e.hasOwnProperty(n))return!1;return!0}t.exports=r},{}],147:[function(e,t,n){"use strict";function r(e,t){if(null!=e&&null!=t){var n=typeof e,r=typeof t;if("string"===n||"number"===n)return"string"===r||"number"===r;if("object"===r&&e.type===t.type&&e.key===t.key){var o=e._owner===t._owner;return o}}return!1}e(150);t.exports=r},{150:150}],148:[function(e,t,n){function r(e){var t=e.length;if(o(!Array.isArray(e)&&("object"==typeof e||"function"==typeof e)),o("number"==typeof t),o(0===t||t-1 in e),e.hasOwnProperty)try{return Array.prototype.slice.call(e)}catch(n){}for(var r=Array(t),i=0;t>i;i++)r[i]=e[i];return r}var o=e(133);t.exports=r},{133:133}],149:[function(e,t,n){"use strict";function r(e){return v[e]}function o(e,t){return e&&null!=e.key?a(e.key):t.toString(36)}function i(e){return(""+e).replace(g,r)}function a(e){return"$"+i(e)}function u(e,t,n,r,i){var s=typeof e;if(("undefined"===s||"boolean"===s)&&(e=null),null===e||"string"===s||"number"===s||l.isValidElement(e))return r(i,e,""===t?h+o(e,0):t,n),1;var p,v,g,y=0;if(Array.isArray(e))for(var C=0;C<e.length;C++)p=e[C],v=(""!==t?t+m:h)+o(p,C),g=n+y,y+=u(p,v,g,r,i);else{var E=d(e);if(E){var b,_=E.call(e);if(E!==e.entries)for(var x=0;!(b=_.next()).done;)p=b.value,v=(""!==t?t+m:h)+o(p,x++),g=n+y,y+=u(p,v,g,r,i);else for(;!(b=_.next()).done;){var D=b.value;D&&(p=D[1],v=(""!==t?t+m:h)+a(D[0])+m+o(p,0),g=n+y,y+=u(p,v,g,r,i))}}else if("object"===s){f(1!==e.nodeType);var M=c.extract(e);for(var N in M)M.hasOwnProperty(N)&&(p=M[N],v=(""!==t?t+m:h)+a(N)+m+o(p,0),g=n+y,y+=u(p,v,g,r,i))}}return y}function s(e,t,n){return null==e?0:u(e,"",0,t,n)}var l=e(55),c=e(61),p=e(64),d=e(124),f=e(133),h=(e(150),p.SEPARATOR),m=":",v={"=":"=0",".":"=1",":":"=2"},g=/[=.:]/g;t.exports=s},{124:124,133:133,150:150,55:55,61:61,64:64}],150:[function(e,t,n){"use strict";var r=e(112),o=r;t.exports=o},{112:112}]},{},[1])(1)});
;(function(){
var f,aa=this;
function m(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}var ba="closure_uid_"+(1E9*Math.random()>>>0),ca=0;var da=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function ea(a){return Array.prototype.join.call(arguments,"")}function fa(a,b){return a<b?-1:a>b?1:0};function ga(a,b){for(var c in a)b.call(void 0,a[c],c,a)}var ha="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function ja(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var g=0;g<ha.length;g++)c=ha[g],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}}
function la(a){var b=arguments.length;if(1==b&&"array"==m(arguments[0]))return la.apply(null,arguments[0]);for(var c={},d=0;d<b;d++)c[arguments[d]]=!0;return c};function ma(a,b){null!=a&&this.append.apply(this,arguments)}f=ma.prototype;f.gb="";f.set=function(a){this.gb=""+a};f.append=function(a,b,c){this.gb+=a;if(null!=b)for(var d=1;d<arguments.length;d++)this.gb+=arguments[d];return this};f.clear=function(){this.gb=""};f.toString=function(){return this.gb};function na(a,b){a.sort(b||oa)}function pa(a,b){for(var c=0;c<a.length;c++)a[c]={index:c,value:a[c]};var d=b||oa;na(a,function(a,b){return d(a.value,b.value)||a.index-b.index});for(c=0;c<a.length;c++)a[c]=a[c].value}function oa(a,b){return a>b?1:a<b?-1:0};if("undefined"===typeof qa)var qa=function(){throw Error("No *print-fn* fn set for evaluation environment");};var ra=null;if("undefined"===typeof sa)var sa=null;function ta(){return new va(null,5,[wa,!0,xa,!0,ya,!1,za,!1,Aa,null],null)}function p(a){return null!=a&&!1!==a}function Ba(a){return null==a}function Ca(a){return a instanceof Array}function Da(a){return p(a)?!1:!0}function Ea(a){return"string"==typeof a}function t(a,b){return a[m(null==b?null:b)]?!0:a._?!0:!1}
function Fa(a){return null==a?null:a.constructor}function u(a,b){var c=Fa(b),c=p(p(c)?c.pb:c)?c.ob:m(b);return Error(["No protocol method ",a," defined for type ",c,": ",b].join(""))}function Ga(a){var b=a.ob;return p(b)?b:""+w(a)}var Ha="undefined"!==typeof Symbol&&"function"===m(Symbol)?Symbol.iterator:"@@iterator";function Ia(a){for(var b=a.length,c=Array(b),d=0;;)if(d<b)c[d]=a[d],d+=1;else break;return c}
function Ja(){switch(arguments.length){case 1:return Ka(arguments[0]);case 2:return Ka(arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function Oa(a){return Ka(a)}function Ka(a){function b(a,b){a.push(b);return a}var c=[];return Pa?Pa(b,c,a):Qa.call(null,b,c,a)}
var Ra={},Sa={},Ta={},Ua=function Ua(b){if(b?b.X:b)return b.X(b);var c;c=Ua[m(null==b?null:b)];if(!c&&(c=Ua._,!c))throw u("ICloneable.-clone",b);return c.call(null,b)},Va={},Wa=function Wa(b){if(b?b.T:b)return b.T(b);var c;c=Wa[m(null==b?null:b)];if(!c&&(c=Wa._,!c))throw u("ICounted.-count",b);return c.call(null,b)},Ya=function Ya(b){if(b?b.ba:b)return b.ba(b);var c;c=Ya[m(null==b?null:b)];if(!c&&(c=Ya._,!c))throw u("IEmptyableCollection.-empty",b);return c.call(null,b)},Za={},y=function y(b,c){if(b?
b.S:b)return b.S(b,c);var d;d=y[m(null==b?null:b)];if(!d&&(d=y._,!d))throw u("ICollection.-conj",b);return d.call(null,b,c)},$a={},z=function z(){switch(arguments.length){case 2:return z.c(arguments[0],arguments[1]);case 3:return z.j(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};z.c=function(a,b){if(a?a.V:a)return a.V(a,b);var c;c=z[m(null==a?null:a)];if(!c&&(c=z._,!c))throw u("IIndexed.-nth",a);return c.call(null,a,b)};
z.j=function(a,b,c){if(a?a.ua:a)return a.ua(a,b,c);var d;d=z[m(null==a?null:a)];if(!d&&(d=z._,!d))throw u("IIndexed.-nth",a);return d.call(null,a,b,c)};z.H=3;
var ab={},bb=function bb(b){if(b?b.ia:b)return b.ia(b);var c;c=bb[m(null==b?null:b)];if(!c&&(c=bb._,!c))throw u("ISeq.-first",b);return c.call(null,b)},cb=function cb(b){if(b?b.ra:b)return b.ra(b);var c;c=cb[m(null==b?null:b)];if(!c&&(c=cb._,!c))throw u("ISeq.-rest",b);return c.call(null,b)},eb={},fb={},A=function A(){switch(arguments.length){case 2:return A.c(arguments[0],arguments[1]);case 3:return A.j(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));
}};A.c=function(a,b){if(a?a.L:a)return a.L(a,b);var c;c=A[m(null==a?null:a)];if(!c&&(c=A._,!c))throw u("ILookup.-lookup",a);return c.call(null,a,b)};A.j=function(a,b,c){if(a?a.J:a)return a.J(a,b,c);var d;d=A[m(null==a?null:a)];if(!d&&(d=A._,!d))throw u("ILookup.-lookup",a);return d.call(null,a,b,c)};A.H=3;
var gb={},hb=function hb(b,c){if(b?b.vb:b)return b.vb(b,c);var d;d=hb[m(null==b?null:b)];if(!d&&(d=hb._,!d))throw u("IAssociative.-contains-key?",b);return d.call(null,b,c)},kb=function kb(b,c,d){if(b?b.fa:b)return b.fa(b,c,d);var e;e=kb[m(null==b?null:b)];if(!e&&(e=kb._,!e))throw u("IAssociative.-assoc",b);return e.call(null,b,c,d)},lb={},mb=function mb(b,c){if(b?b.pa:b)return b.pa(b,c);var d;d=mb[m(null==b?null:b)];if(!d&&(d=mb._,!d))throw u("IMap.-dissoc",b);return d.call(null,b,c)},nb={},ob=function ob(b){if(b?
b.Rb:b)return b.Rb();var c;c=ob[m(null==b?null:b)];if(!c&&(c=ob._,!c))throw u("IMapEntry.-key",b);return c.call(null,b)},pb=function pb(b){if(b?b.Sb:b)return b.Sb();var c;c=pb[m(null==b?null:b)];if(!c&&(c=pb._,!c))throw u("IMapEntry.-val",b);return c.call(null,b)},qb={},sb=function sb(b,c){if(b?b.bc:b)return b.bc(0,c);var d;d=sb[m(null==b?null:b)];if(!d&&(d=sb._,!d))throw u("ISet.-disjoin",b);return d.call(null,b,c)},tb={},ub=function ub(b,c,d){if(b?b.Tb:b)return b.Tb(b,c,d);var e;e=ub[m(null==b?
null:b)];if(!e&&(e=ub._,!e))throw u("IVector.-assoc-n",b);return e.call(null,b,c,d)},wb=function wb(b){if(b?b.lb:b)return b.lb(b);var c;c=wb[m(null==b?null:b)];if(!c&&(c=wb._,!c))throw u("IDeref.-deref",b);return c.call(null,b)},xb={},yb=function yb(b){if(b?b.N:b)return b.N(b);var c;c=yb[m(null==b?null:b)];if(!c&&(c=yb._,!c))throw u("IMeta.-meta",b);return c.call(null,b)},zb={},Ab=function Ab(b,c){if(b?b.O:b)return b.O(b,c);var d;d=Ab[m(null==b?null:b)];if(!d&&(d=Ab._,!d))throw u("IWithMeta.-with-meta",
b);return d.call(null,b,c)},Bb={},Cb=function Cb(){switch(arguments.length){case 2:return Cb.c(arguments[0],arguments[1]);case 3:return Cb.j(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};Cb.c=function(a,b){if(a?a.ga:a)return a.ga(a,b);var c;c=Cb[m(null==a?null:a)];if(!c&&(c=Cb._,!c))throw u("IReduce.-reduce",a);return c.call(null,a,b)};
Cb.j=function(a,b,c){if(a?a.ha:a)return a.ha(a,b,c);var d;d=Cb[m(null==a?null:a)];if(!d&&(d=Cb._,!d))throw u("IReduce.-reduce",a);return d.call(null,a,b,c)};Cb.H=3;
var Db=function Db(b,c){if(b?b.D:b)return b.D(b,c);var d;d=Db[m(null==b?null:b)];if(!d&&(d=Db._,!d))throw u("IEquiv.-equiv",b);return d.call(null,b,c)},Eb=function Eb(b){if(b?b.P:b)return b.P(b);var c;c=Eb[m(null==b?null:b)];if(!c&&(c=Eb._,!c))throw u("IHash.-hash",b);return c.call(null,b)},Fb={},Gb=function Gb(b){if(b?b.R:b)return b.R(b);var c;c=Gb[m(null==b?null:b)];if(!c&&(c=Gb._,!c))throw u("ISeqable.-seq",b);return c.call(null,b)},Hb={},Ib={},Jb={},Kb=function Kb(b){if(b?b.Gb:b)return b.Gb(b);
var c;c=Kb[m(null==b?null:b)];if(!c&&(c=Kb._,!c))throw u("IReversible.-rseq",b);return c.call(null,b)},Nb=function Nb(b,c){if(b?b.gc:b)return b.gc(0,c);var d;d=Nb[m(null==b?null:b)];if(!d&&(d=Nb._,!d))throw u("IWriter.-write",b);return d.call(null,b,c)},Ob={},Pb=function Pb(b,c,d){if(b?b.M:b)return b.M(b,c,d);var e;e=Pb[m(null==b?null:b)];if(!e&&(e=Pb._,!e))throw u("IPrintWithWriter.-pr-writer",b);return e.call(null,b,c,d)},Qb=function Qb(b,c,d){if(b?b.ec:b)return b.ec(0,c,d);var e;e=Qb[m(null==b?
null:b)];if(!e&&(e=Qb._,!e))throw u("IWatchable.-notify-watches",b);return e.call(null,b,c,d)},Rb=function Rb(b,c,d){if(b?b.dc:b)return b.dc(0,c,d);var e;e=Rb[m(null==b?null:b)];if(!e&&(e=Rb._,!e))throw u("IWatchable.-add-watch",b);return e.call(null,b,c,d)},Sb=function Sb(b,c){if(b?b.fc:b)return b.fc(0,c);var d;d=Sb[m(null==b?null:b)];if(!d&&(d=Sb._,!d))throw u("IWatchable.-remove-watch",b);return d.call(null,b,c)},Tb=function Tb(b){if(b?b.mb:b)return b.mb(b);var c;c=Tb[m(null==b?null:b)];if(!c&&
(c=Tb._,!c))throw u("IEditableCollection.-as-transient",b);return c.call(null,b)},Ub=function Ub(b,c){if(b?b.hb:b)return b.hb(b,c);var d;d=Ub[m(null==b?null:b)];if(!d&&(d=Ub._,!d))throw u("ITransientCollection.-conj!",b);return d.call(null,b,c)},Vb=function Vb(b){if(b?b.nb:b)return b.nb(b);var c;c=Vb[m(null==b?null:b)];if(!c&&(c=Vb._,!c))throw u("ITransientCollection.-persistent!",b);return c.call(null,b)},Wb=function Wb(b,c,d){if(b?b.Ab:b)return b.Ab(b,c,d);var e;e=Wb[m(null==b?null:b)];if(!e&&(e=
Wb._,!e))throw u("ITransientAssociative.-assoc!",b);return e.call(null,b,c,d)},Xb=function Xb(b,c,d){if(b?b.cc:b)return b.cc(0,c,d);var e;e=Xb[m(null==b?null:b)];if(!e&&(e=Xb._,!e))throw u("ITransientVector.-assoc-n!",b);return e.call(null,b,c,d)},Yb=function Yb(b){if(b?b.Zb:b)return b.Zb();var c;c=Yb[m(null==b?null:b)];if(!c&&(c=Yb._,!c))throw u("IChunk.-drop-first",b);return c.call(null,b)},Zb=function Zb(b){if(b?b.Pb:b)return b.Pb(b);var c;c=Zb[m(null==b?null:b)];if(!c&&(c=Zb._,!c))throw u("IChunkedSeq.-chunked-first",
b);return c.call(null,b)},bc=function bc(b){if(b?b.Qb:b)return b.Qb(b);var c;c=bc[m(null==b?null:b)];if(!c&&(c=bc._,!c))throw u("IChunkedSeq.-chunked-rest",b);return c.call(null,b)},cc=function cc(b){if(b?b.Ob:b)return b.Ob(b);var c;c=cc[m(null==b?null:b)];if(!c&&(c=cc._,!c))throw u("IChunkedNext.-chunked-next",b);return c.call(null,b)},dc={},ec=function ec(b,c){if(b?b.Tc:b)return b.Tc(b,c);var d;d=ec[m(null==b?null:b)];if(!d&&(d=ec._,!d))throw u("IReset.-reset!",b);return d.call(null,b,c)},fc=function fc(){switch(arguments.length){case 2:return fc.c(arguments[0],
arguments[1]);case 3:return fc.j(arguments[0],arguments[1],arguments[2]);case 4:return fc.K(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return fc.da(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};fc.c=function(a,b){if(a?a.Uc:a)return a.Uc(a,b);var c;c=fc[m(null==a?null:a)];if(!c&&(c=fc._,!c))throw u("ISwap.-swap!",a);return c.call(null,a,b)};
fc.j=function(a,b,c){if(a?a.Vc:a)return a.Vc(a,b,c);var d;d=fc[m(null==a?null:a)];if(!d&&(d=fc._,!d))throw u("ISwap.-swap!",a);return d.call(null,a,b,c)};fc.K=function(a,b,c,d){if(a?a.Wc:a)return a.Wc(a,b,c,d);var e;e=fc[m(null==a?null:a)];if(!e&&(e=fc._,!e))throw u("ISwap.-swap!",a);return e.call(null,a,b,c,d)};fc.da=function(a,b,c,d,e){if(a?a.Xc:a)return a.Xc(a,b,c,d,e);var g;g=fc[m(null==a?null:a)];if(!g&&(g=fc._,!g))throw u("ISwap.-swap!",a);return g.call(null,a,b,c,d,e)};fc.H=5;
var gc=function gc(b){if(b?b.yb:b)return b.yb(b);var c;c=gc[m(null==b?null:b)];if(!c&&(c=gc._,!c))throw u("IIterable.-iterator",b);return c.call(null,b)};function hc(a){this.Nd=a;this.w=1073741824;this.F=0}hc.prototype.gc=function(a,b){return this.Nd.append(b)};function ic(a){var b=new ma;a.M(null,new hc(b),ta());return""+w(b)}
var jc="undefined"!==typeof Math.imul&&0!==Math.imul(4294967295,5)?function(a,b){return Math.imul(a,b)}:function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};function kc(a){a=jc(a|0,-862048943);return jc(a<<15|a>>>-15,461845907)}function lc(a,b){var c=(a|0)^(b|0);return jc(c<<13|c>>>-13,5)+-430675100|0}function mc(a,b){var c=(a|0)^b,c=jc(c^c>>>16,-2048144789),c=jc(c^c>>>13,-1028477387);return c^c>>>16}
function nc(a){var b;a:{b=1;for(var c=0;;)if(b<a.length){var d=b+2,c=lc(c,kc(a.charCodeAt(b-1)|a.charCodeAt(b)<<16));b=d}else{b=c;break a}}b=1===(a.length&1)?b^kc(a.charCodeAt(a.length-1)):b;return mc(b,jc(2,a.length))}var oc={},pc=0;function qc(a){255<pc&&(oc={},pc=0);var b=oc[a];if("number"!==typeof b){a:if(null!=a)if(b=a.length,0<b)for(var c=0,d=0;;)if(c<b)var e=c+1,d=jc(31,d)+a.charCodeAt(c),c=e;else{b=d;break a}else b=0;else b=0;oc[a]=b;pc+=1}return a=b}
function rc(a){a&&(a.w&4194304||a.Xd)?a=a.P(null):"number"===typeof a?a=Math.floor(a)%2147483647:!0===a?a=1:!1===a?a=0:"string"===typeof a?(a=qc(a),0!==a&&(a=kc(a),a=lc(0,a),a=mc(a,4))):a=a instanceof Date?a.valueOf():null==a?0:Eb(a);return a}function sc(a,b){return a^b+2654435769+(a<<6)+(a>>2)}function tc(a){return a instanceof C}
function vc(a,b){if(a.La===b.La)return 0;var c=Da(a.ma);if(p(c?b.ma:c))return-1;if(p(a.ma)){if(Da(b.ma))return 1;c=oa(a.ma,b.ma);return 0===c?oa(a.name,b.name):c}return oa(a.name,b.name)}function C(a,b,c,d,e){this.ma=a;this.name=b;this.La=c;this.kb=d;this.oa=e;this.w=2154168321;this.F=4096}f=C.prototype;f.toString=function(){return this.La};f.equiv=function(a){return this.D(null,a)};f.D=function(a,b){return b instanceof C?this.La===b.La:!1};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return A.j(c,this,null);case 3:return A.j(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return A.j(c,this,null)};a.j=function(a,c,d){return A.j(c,this,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return A.j(a,this,null)};f.c=function(a,b){return A.j(a,this,b)};f.N=function(){return this.oa};
f.O=function(a,b){return new C(this.ma,this.name,this.La,this.kb,b)};f.P=function(){var a=this.kb;return null!=a?a:this.kb=a=sc(nc(this.name),qc(this.ma))};f.M=function(a,b){return Nb(b,this.La)};function wc(a){return a instanceof C?a:new C(null,a,a,null,null)}function D(a){if(null==a)return null;if(a&&(a.w&8388608||a.$d))return a.R(null);if(Ca(a)||"string"===typeof a)return 0===a.length?null:new E(a,0);if(t(Fb,a))return Gb(a);throw Error([w(a),w(" is not ISeqable")].join(""));}
function H(a){if(null==a)return null;if(a&&(a.w&64||a.zb))return a.ia(null);a=D(a);return null==a?null:bb(a)}function xc(a){return null!=a?a&&(a.w&64||a.zb)?a.ra(null):(a=D(a))?cb(a):I:I}function J(a){return null==a?null:a&&(a.w&128||a.Fb)?a.qa(null):D(xc(a))}var K=function K(){switch(arguments.length){case 1:return K.h(arguments[0]);case 2:return K.c(arguments[0],arguments[1]);default:return K.B(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};K.h=function(){return!0};
K.c=function(a,b){return null==a?null==b:a===b||Db(a,b)};K.B=function(a,b,c){for(;;)if(K.c(a,b))if(J(c))a=b,b=H(c),c=J(c);else return K.c(b,H(c));else return!1};K.I=function(a){var b=H(a),c=J(a);a=H(c);c=J(c);return K.B(b,a,c)};K.H=2;function yc(a){this.s=a}yc.prototype.next=function(){if(null!=this.s){var a=H(this.s);this.s=J(this.s);return{value:a,done:!1}}return{value:null,done:!0}};function zc(a){return new yc(D(a))}function Ac(a,b){var c=kc(a),c=lc(0,c);return mc(c,b)}
function Bc(a){var b=0,c=1;for(a=D(a);;)if(null!=a)b+=1,c=jc(31,c)+rc(H(a))|0,a=J(a);else return Ac(c,b)}var Cc=Ac(1,0);function Dc(a){var b=0,c=0;for(a=D(a);;)if(null!=a)b+=1,c=c+rc(H(a))|0,a=J(a);else return Ac(c,b)}var Ec=Ac(0,0);Va["null"]=!0;Wa["null"]=function(){return 0};Date.prototype.Mc=!0;Date.prototype.D=function(a,b){return b instanceof Date&&this.valueOf()===b.valueOf()};Date.prototype.wb=!0;Date.prototype.xb=function(a,b){return oa(this.valueOf(),b.valueOf())};
Db.number=function(a,b){return a===b};Ra["function"]=!0;xb["function"]=!0;yb["function"]=function(){return null};Eb._=function(a){return a[ba]||(a[ba]=++ca)};function Fc(a){return a+1}function L(a){return wb(a)}function Gc(a,b){var c=Wa(a);if(0===c)return b.G?b.G():b.call(null);for(var d=z.c(a,0),e=1;;)if(e<c)var g=z.c(a,e),d=b.c?b.c(d,g):b.call(null,d,g),e=e+1;else return d}function Hc(a,b,c){var d=Wa(a),e=c;for(c=0;;)if(c<d){var g=z.c(a,c),e=b.c?b.c(e,g):b.call(null,e,g);c+=1}else return e}
function Ic(a,b){var c=a.length;if(0===a.length)return b.G?b.G():b.call(null);for(var d=a[0],e=1;;)if(e<c)var g=a[e],d=b.c?b.c(d,g):b.call(null,d,g),e=e+1;else return d}function Jc(a,b,c){var d=a.length,e=c;for(c=0;;)if(c<d){var g=a[c],e=b.c?b.c(e,g):b.call(null,e,g);c+=1}else return e}function Kc(a,b,c,d){for(var e=a.length;;)if(d<e){var g=a[d];c=b.c?b.c(c,g):b.call(null,c,g);d+=1}else return c}function Lc(a){return a?a.w&2||a.Hc?!0:a.w?!1:t(Va,a):t(Va,a)}
function Mc(a){return a?a.w&16||a.$b?!0:a.w?!1:t($a,a):t($a,a)}function Nc(a,b){this.l=a;this.i=b}Nc.prototype.Ib=function(){return this.i<this.l.length};Nc.prototype.next=function(){var a=this.l[this.i];this.i+=1;return a};function E(a,b){this.l=a;this.i=b;this.w=166199550;this.F=8192}f=E.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.V=function(a,b){var c=b+this.i;return c<this.l.length?this.l[c]:null};
f.ua=function(a,b,c){a=b+this.i;return a<this.l.length?this.l[a]:c};f.yb=function(){return new Nc(this.l,this.i)};f.X=function(){return new E(this.l,this.i)};f.qa=function(){return this.i+1<this.l.length?new E(this.l,this.i+1):null};f.T=function(){return this.l.length-this.i};f.Gb=function(){var a=Wa(this);return 0<a?new Oc(this,a-1,null):null};f.P=function(){return Bc(this)};f.D=function(a,b){return Pc.c?Pc.c(this,b):Pc.call(null,this,b)};f.ba=function(){return I};
f.ga=function(a,b){return Kc(this.l,b,this.l[this.i],this.i+1)};f.ha=function(a,b,c){return Kc(this.l,b,c,this.i)};f.ia=function(){return this.l[this.i]};f.ra=function(){return this.i+1<this.l.length?new E(this.l,this.i+1):I};f.R=function(){return this};f.S=function(a,b){return M.c?M.c(b,this):M.call(null,b,this)};E.prototype[Ha]=function(){return zc(this)};function Qc(a,b){return b<a.length?new E(a,b):null}
function Rc(){switch(arguments.length){case 1:return Qc(arguments[0],0);case 2:return Qc(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function Oc(a,b,c){this.ub=a;this.i=b;this.meta=c;this.w=32374990;this.F=8192}f=Oc.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.meta};f.X=function(){return new Oc(this.ub,this.i,this.meta)};
f.qa=function(){return 0<this.i?new Oc(this.ub,this.i-1,null):null};f.T=function(){return this.i+1};f.P=function(){return Bc(this)};f.D=function(a,b){return Pc.c?Pc.c(this,b):Pc.call(null,this,b)};f.ba=function(){var a=this.meta;return Sc.c?Sc.c(I,a):Sc.call(null,I,a)};f.ga=function(a,b){return Tc?Tc(b,this):Uc.call(null,b,this)};f.ha=function(a,b,c){return Vc?Vc(b,c,this):Uc.call(null,b,c,this)};f.ia=function(){return z.c(this.ub,this.i)};
f.ra=function(){return 0<this.i?new Oc(this.ub,this.i-1,null):I};f.R=function(){return this};f.O=function(a,b){return new Oc(this.ub,this.i,b)};f.S=function(a,b){return M.c?M.c(b,this):M.call(null,b,this)};Oc.prototype[Ha]=function(){return zc(this)};function Wc(a){return H(J(a))}Db._=function(a,b){return a===b};
var Xc=function Xc(){switch(arguments.length){case 0:return Xc.G();case 1:return Xc.h(arguments[0]);case 2:return Xc.c(arguments[0],arguments[1]);default:return Xc.B(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};Xc.G=function(){return Zc};Xc.h=function(a){return a};Xc.c=function(a,b){return null!=a?y(a,b):y(I,b)};Xc.B=function(a,b,c){for(;;)if(p(c))a=Xc.c(a,b),b=H(c),c=J(c);else return Xc.c(a,b)};Xc.I=function(a){var b=H(a),c=J(a);a=H(c);c=J(c);return Xc.B(b,a,c)};
Xc.H=2;function $c(a){return null==a?null:Ya(a)}function Q(a){if(null!=a)if(a&&(a.w&2||a.Hc))a=a.T(null);else if(Ca(a))a=a.length;else if("string"===typeof a)a=a.length;else if(t(Va,a))a=Wa(a);else a:{a=D(a);for(var b=0;;){if(Lc(a)){a=b+Wa(a);break a}a=J(a);b+=1}}else a=0;return a}function ad(a,b){for(var c=null;;){if(null==a)return c;if(0===b)return D(a)?H(a):c;if(Mc(a))return z.j(a,b,c);if(D(a)){var d=J(a),e=b-1;a=d;b=e}else return c}}
function bd(a,b){if("number"!==typeof b)throw Error("index argument to nth must be a number");if(null==a)return a;if(a&&(a.w&16||a.$b))return a.V(null,b);if(Ca(a)||"string"===typeof a)return b<a.length?a[b]:null;if(t($a,a))return z.c(a,b);if(a?a.w&64||a.zb||(a.w?0:t(ab,a)):t(ab,a)){var c;a:{c=a;for(var d=b;;){if(null==c)throw Error("Index out of bounds");if(0===d){if(D(c)){c=H(c);break a}throw Error("Index out of bounds");}if(Mc(c)){c=z.c(c,d);break a}if(D(c))c=J(c),--d;else throw Error("Index out of bounds");
}}return c}throw Error([w("nth not supported on this type "),w(Ga(Fa(a)))].join(""));}function R(a,b){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return null;if(a&&(a.w&16||a.$b))return a.ua(null,b,null);if(Ca(a)||"string"===typeof a)return b<a.length?a[b]:null;if(t($a,a))return z.c(a,b);if(a?a.w&64||a.zb||(a.w?0:t(ab,a)):t(ab,a))return ad(a,b);throw Error([w("nth not supported on this type "),w(Ga(Fa(a)))].join(""));}
function cd(a,b){return null==a?null:a&&(a.w&256||a.ac)?a.L(null,b):Ca(a)?b<a.length?a[b]:null:"string"===typeof a?b<a.length?a[b]:null:t(fb,a)?A.c(a,b):null}function dd(a,b,c){return null!=a?a&&(a.w&256||a.ac)?a.J(null,b,c):Ca(a)?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:t(fb,a)?A.j(a,b,c):c:c}
var S=function S(){switch(arguments.length){case 3:return S.j(arguments[0],arguments[1],arguments[2]);default:return S.B(arguments[0],arguments[1],arguments[2],new E(Array.prototype.slice.call(arguments,3),0))}};S.j=function(a,b,c){return null!=a?kb(a,b,c):ed([b],[c])};S.B=function(a,b,c,d){for(;;)if(a=S.j(a,b,c),p(d))b=H(d),c=Wc(d),d=J(J(d));else return a};S.I=function(a){var b=H(a),c=J(a);a=H(c);var d=J(c),c=H(d),d=J(d);return S.B(b,a,c,d)};S.H=3;
var T=function T(){switch(arguments.length){case 1:return T.h(arguments[0]);case 2:return T.c(arguments[0],arguments[1]);default:return T.B(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};T.h=function(a){return a};T.c=function(a,b){return null==a?null:mb(a,b)};T.B=function(a,b,c){for(;;){if(null==a)return null;a=T.c(a,b);if(p(c))b=H(c),c=J(c);else return a}};T.I=function(a){var b=H(a),c=J(a);a=H(c);c=J(c);return T.B(b,a,c)};T.H=2;
function fd(a){var b="function"==m(a);return p(b)?b:a?p(p(null)?null:a.Fc)?!0:a.Y?!1:t(Ra,a):t(Ra,a)}function gd(a,b){this.m=a;this.meta=b;this.w=393217;this.F=0}f=gd.prototype;f.N=function(){return this.meta};f.O=function(a,b){return new gd(this.m,b)};f.Fc=!0;
f.call=function(){function a(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka,O,P,Na){a=this.m;return hd.Eb?hd.Eb(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka,O,P,Na):hd.call(null,a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka,O,P,Na)}function b(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka,O,P){a=this;return a.m.Wa?a.m.Wa(b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka,O,P):a.m.call(null,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka,O,P)}function c(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka,O){a=this;return a.m.Va?a.m.Va(b,c,d,e,g,h,k,l,n,q,r,v,x,B,
F,N,G,ka,O):a.m.call(null,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka,O)}function d(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka){a=this;return a.m.Ua?a.m.Ua(b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka):a.m.call(null,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G,ka)}function e(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G){a=this;return a.m.Ta?a.m.Ta(b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G):a.m.call(null,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N,G)}function g(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N){a=this;return a.m.Sa?a.m.Sa(b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N):
a.m.call(null,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,N)}function h(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F){a=this;return a.m.Ra?a.m.Ra(b,c,d,e,g,h,k,l,n,q,r,v,x,B,F):a.m.call(null,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F)}function k(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B){a=this;return a.m.Qa?a.m.Qa(b,c,d,e,g,h,k,l,n,q,r,v,x,B):a.m.call(null,b,c,d,e,g,h,k,l,n,q,r,v,x,B)}function l(a,b,c,d,e,g,h,k,l,n,q,r,v,x){a=this;return a.m.Pa?a.m.Pa(b,c,d,e,g,h,k,l,n,q,r,v,x):a.m.call(null,b,c,d,e,g,h,k,l,n,q,r,v,x)}function n(a,b,c,d,e,g,h,k,l,
n,q,r,v){a=this;return a.m.Oa?a.m.Oa(b,c,d,e,g,h,k,l,n,q,r,v):a.m.call(null,b,c,d,e,g,h,k,l,n,q,r,v)}function q(a,b,c,d,e,g,h,k,l,n,q,r){a=this;return a.m.Na?a.m.Na(b,c,d,e,g,h,k,l,n,q,r):a.m.call(null,b,c,d,e,g,h,k,l,n,q,r)}function r(a,b,c,d,e,g,h,k,l,n,q){a=this;return a.m.Ma?a.m.Ma(b,c,d,e,g,h,k,l,n,q):a.m.call(null,b,c,d,e,g,h,k,l,n,q)}function v(a,b,c,d,e,g,h,k,l,n){a=this;return a.m.Za?a.m.Za(b,c,d,e,g,h,k,l,n):a.m.call(null,b,c,d,e,g,h,k,l,n)}function x(a,b,c,d,e,g,h,k,l){a=this;return a.m.Ya?
a.m.Ya(b,c,d,e,g,h,k,l):a.m.call(null,b,c,d,e,g,h,k,l)}function B(a,b,c,d,e,g,h,k){a=this;return a.m.Xa?a.m.Xa(b,c,d,e,g,h,k):a.m.call(null,b,c,d,e,g,h,k)}function F(a,b,c,d,e,g,h){a=this;return a.m.Ba?a.m.Ba(b,c,d,e,g,h):a.m.call(null,b,c,d,e,g,h)}function G(a,b,c,d,e,g){a=this;return a.m.da?a.m.da(b,c,d,e,g):a.m.call(null,b,c,d,e,g)}function N(a,b,c,d,e){a=this;return a.m.K?a.m.K(b,c,d,e):a.m.call(null,b,c,d,e)}function P(a,b,c,d){a=this;return a.m.j?a.m.j(b,c,d):a.m.call(null,b,c,d)}function ka(a,
b,c){a=this;return a.m.c?a.m.c(b,c):a.m.call(null,b,c)}function Na(a,b){a=this;return a.m.h?a.m.h(b):a.m.call(null,b)}function jb(a){a=this;return a.m.G?a.m.G():a.m.call(null)}var O=null,O=function(O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb,$b,ac,uc,Bd,fe,Me,Vf,jh,aj,Yc){switch(arguments.length){case 1:return jb.call(this,O);case 2:return Na.call(this,O,ua);case 3:return ka.call(this,O,ua,La);case 4:return P.call(this,O,ua,La,Ma);case 5:return N.call(this,O,ua,La,Ma,ia);case 6:return G.call(this,O,ua,La,
Ma,ia,db);case 7:return F.call(this,O,ua,La,Ma,ia,db,ib);case 8:return B.call(this,O,ua,La,Ma,ia,db,ib,rb);case 9:return x.call(this,O,ua,La,Ma,ia,db,ib,rb,vb);case 10:return v.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa);case 11:return r.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb);case 12:return q.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb);case 13:return n.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb,$b);case 14:return l.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb,$b,ac);case 15:return k.call(this,
O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb,$b,ac,uc);case 16:return h.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb,$b,ac,uc,Bd);case 17:return g.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb,$b,ac,uc,Bd,fe);case 18:return e.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb,$b,ac,uc,Bd,fe,Me);case 19:return d.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb,$b,ac,uc,Bd,fe,Me,Vf);case 20:return c.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb,$b,ac,uc,Bd,fe,Me,Vf,jh);case 21:return b.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,
Xa,Lb,Mb,$b,ac,uc,Bd,fe,Me,Vf,jh,aj);case 22:return a.call(this,O,ua,La,Ma,ia,db,ib,rb,vb,Xa,Lb,Mb,$b,ac,uc,Bd,fe,Me,Vf,jh,aj,Yc)}throw Error("Invalid arity: "+arguments.length);};O.h=jb;O.c=Na;O.j=ka;O.K=P;O.da=N;O.Ba=G;O.Xa=F;O.Ya=B;O.Za=x;O.Ma=v;O.Na=r;O.Oa=q;O.Pa=n;O.Qa=l;O.Ra=k;O.Sa=h;O.Ta=g;O.Ua=e;O.Va=d;O.Wa=c;O.Nc=b;O.Eb=a;return O}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.G=function(){return this.m.G?this.m.G():this.m.call(null)};
f.h=function(a){return this.m.h?this.m.h(a):this.m.call(null,a)};f.c=function(a,b){return this.m.c?this.m.c(a,b):this.m.call(null,a,b)};f.j=function(a,b,c){return this.m.j?this.m.j(a,b,c):this.m.call(null,a,b,c)};f.K=function(a,b,c,d){return this.m.K?this.m.K(a,b,c,d):this.m.call(null,a,b,c,d)};f.da=function(a,b,c,d,e){return this.m.da?this.m.da(a,b,c,d,e):this.m.call(null,a,b,c,d,e)};f.Ba=function(a,b,c,d,e,g){return this.m.Ba?this.m.Ba(a,b,c,d,e,g):this.m.call(null,a,b,c,d,e,g)};
f.Xa=function(a,b,c,d,e,g,h){return this.m.Xa?this.m.Xa(a,b,c,d,e,g,h):this.m.call(null,a,b,c,d,e,g,h)};f.Ya=function(a,b,c,d,e,g,h,k){return this.m.Ya?this.m.Ya(a,b,c,d,e,g,h,k):this.m.call(null,a,b,c,d,e,g,h,k)};f.Za=function(a,b,c,d,e,g,h,k,l){return this.m.Za?this.m.Za(a,b,c,d,e,g,h,k,l):this.m.call(null,a,b,c,d,e,g,h,k,l)};f.Ma=function(a,b,c,d,e,g,h,k,l,n){return this.m.Ma?this.m.Ma(a,b,c,d,e,g,h,k,l,n):this.m.call(null,a,b,c,d,e,g,h,k,l,n)};
f.Na=function(a,b,c,d,e,g,h,k,l,n,q){return this.m.Na?this.m.Na(a,b,c,d,e,g,h,k,l,n,q):this.m.call(null,a,b,c,d,e,g,h,k,l,n,q)};f.Oa=function(a,b,c,d,e,g,h,k,l,n,q,r){return this.m.Oa?this.m.Oa(a,b,c,d,e,g,h,k,l,n,q,r):this.m.call(null,a,b,c,d,e,g,h,k,l,n,q,r)};f.Pa=function(a,b,c,d,e,g,h,k,l,n,q,r,v){return this.m.Pa?this.m.Pa(a,b,c,d,e,g,h,k,l,n,q,r,v):this.m.call(null,a,b,c,d,e,g,h,k,l,n,q,r,v)};
f.Qa=function(a,b,c,d,e,g,h,k,l,n,q,r,v,x){return this.m.Qa?this.m.Qa(a,b,c,d,e,g,h,k,l,n,q,r,v,x):this.m.call(null,a,b,c,d,e,g,h,k,l,n,q,r,v,x)};f.Ra=function(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B){return this.m.Ra?this.m.Ra(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B):this.m.call(null,a,b,c,d,e,g,h,k,l,n,q,r,v,x,B)};f.Sa=function(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F){return this.m.Sa?this.m.Sa(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F):this.m.call(null,a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F)};
f.Ta=function(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G){return this.m.Ta?this.m.Ta(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G):this.m.call(null,a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G)};f.Ua=function(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N){return this.m.Ua?this.m.Ua(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N):this.m.call(null,a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N)};
f.Va=function(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P){return this.m.Va?this.m.Va(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P):this.m.call(null,a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P)};f.Wa=function(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka){return this.m.Wa?this.m.Wa(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka):this.m.call(null,a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka)};
f.Nc=function(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka,Na){var jb=this.m;return hd.Eb?hd.Eb(jb,a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka,Na):hd.call(null,jb,a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka,Na)};function Sc(a,b){return fd(a)&&!(a?a.w&262144||a.de||(a.w?0:t(zb,a)):t(zb,a))?new gd(a,b):null==a?null:Ab(a,b)}function id(a){var b=null!=a;return(b?a?a.w&131072||a.Qc||(a.w?0:t(xb,a)):t(xb,a):b)?yb(a):null}
var jd=function jd(){switch(arguments.length){case 1:return jd.h(arguments[0]);case 2:return jd.c(arguments[0],arguments[1]);default:return jd.B(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};jd.h=function(a){return a};jd.c=function(a,b){return null==a?null:sb(a,b)};jd.B=function(a,b,c){for(;;){if(null==a)return null;a=jd.c(a,b);if(p(c))b=H(c),c=J(c);else return a}};jd.I=function(a){var b=H(a),c=J(a);a=H(c);c=J(c);return jd.B(b,a,c)};jd.H=2;
function kd(a){return null==a||Da(D(a))}function ld(a){return null==a?!1:a?a.w&8||a.Td?!0:a.w?!1:t(Za,a):t(Za,a)}function md(a){return null==a?!1:a?a.w&4096||a.be?!0:a.w?!1:t(qb,a):t(qb,a)}function nd(a){return a?a.w&16777216||a.ae?!0:a.w?!1:t(Hb,a):t(Hb,a)}function od(a){return null==a?!1:a?a.w&1024||a.Oc?!0:a.w?!1:t(lb,a):t(lb,a)}function pd(a){return a?a.w&16384||a.ce?!0:a.w?!1:t(tb,a):t(tb,a)}function qd(a){return a?a.F&512||a.Sd?!0:!1:!1}
function rd(a){var b=[];ga(a,function(a,b){return function(a,c){return b.push(c)}}(a,b));return b}function sd(a,b,c,d,e){for(;0!==e;)c[d]=a[b],d+=1,--e,b+=1}var td={};function ud(a){return null==a?!1:a?a.w&64||a.zb?!0:a.w?!1:t(ab,a):t(ab,a)}function vd(a){return p(a)?!0:!1}function wd(a){var b=fd(a);return b?b:a?a.w&1||a.Wd?!0:a.w?!1:t(Sa,a):t(Sa,a)}function xd(a){return"number"===typeof a&&Da(isNaN(a))&&Infinity!==a&&parseFloat(a)===parseInt(a,10)}function yd(a,b){return dd(a,b,td)===td?!1:!0}
function zd(a,b){var c;if(c=null!=a)c=a?a.w&512||a.Qd?!0:a.w?!1:t(gb,a):t(gb,a);return c&&yd(a,b)?new U(null,2,5,V,[b,cd(a,b)],null):null}var Ad=function Ad(){switch(arguments.length){case 1:return Ad.h(arguments[0]);case 2:return Ad.c(arguments[0],arguments[1]);default:return Ad.B(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};Ad.h=function(){return!0};Ad.c=function(a,b){return!K.c(a,b)};
Ad.B=function(a,b,c){if(K.c(a,b))return!1;a:if(a=[a,b],b=a.length,b<=Cd)for(var d=0,e=Tb(Dd);;)if(d<b)var g=d+1,e=Wb(e,a[d],null),d=g;else{a=new Ed(null,Vb(e),null);break a}else for(d=0,e=Tb(Fd);;)if(d<b)g=d+1,e=Ub(e,a[d]),d=g;else{a=Vb(e);break a}for(b=c;;)if(d=H(b),c=J(b),p(b)){if(yd(a,d))return!1;a=Xc.c(a,d);b=c}else return!0};Ad.I=function(a){var b=H(a),c=J(a);a=H(c);c=J(c);return Ad.B(b,a,c)};Ad.H=2;
function Gd(a,b){if(a===b)return 0;if(null==a)return-1;if(null==b)return 1;if(Fa(a)===Fa(b))return a&&(a.F&2048||a.wb)?a.xb(null,b):oa(a,b);throw Error("compare on non-nil objects of different types");}function Hd(a,b){var c=Q(a),d=Q(b);if(c<d)c=-1;else if(c>d)c=1;else if(0===c)c=0;else a:for(d=0;;){var e=Gd(bd(a,d),bd(b,d));if(0===e&&d+1<c)d+=1;else{c=e;break a}}return c}
function Id(a){return K.c(a,Gd)?Gd:function(b,c){var d=a.c?a.c(b,c):a.call(null,b,c);return"number"===typeof d?d:p(d)?-1:p(a.c?a.c(c,b):a.call(null,c,b))?1:0}}function Jd(a,b){if(D(b)){var c=Kd.h?Kd.h(b):Kd.call(null,b),d=Id(a);pa(c,d);return D(c)}return I}var Ld=function Ld(){switch(arguments.length){case 2:return Ld.c(arguments[0],arguments[1]);case 3:return Ld.j(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};
Ld.c=function(a,b){return Ld.j(a,Gd,b)};Ld.j=function(a,b,c){return Jd(function(c,e){return Id(b).call(null,a.h?a.h(c):a.call(null,c),a.h?a.h(e):a.call(null,e))},c)};Ld.H=3;function Uc(){switch(arguments.length){case 2:return Tc(arguments[0],arguments[1]);case 3:return Vc(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}
function Tc(a,b){var c=D(b);if(c){var d=H(c),c=J(c);return Pa?Pa(a,d,c):Qa.call(null,a,d,c)}return a.G?a.G():a.call(null)}function Vc(a,b,c){for(c=D(c);;)if(c){var d=H(c);b=a.c?a.c(b,d):a.call(null,b,d);c=J(c)}else return b}function Qa(){switch(arguments.length){case 2:return Md(arguments[0],arguments[1]);case 3:return Pa(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}
function Md(a,b){return b&&(b.w&524288||b.Sc)?b.ga(null,a):Ca(b)?Ic(b,a):"string"===typeof b?Ic(b,a):t(Bb,b)?Cb.c(b,a):Tc(a,b)}function Pa(a,b,c){return c&&(c.w&524288||c.Sc)?c.ha(null,a,b):Ca(c)?Jc(c,a,b):"string"===typeof c?Jc(c,a,b):t(Bb,c)?Cb.j(c,a,b):Vc(a,b,c)}function Nd(a){return a}function Od(a,b,c,d){a=a.h?a.h(b):a.call(null,b);c=Pa(a,c,d);return a.h?a.h(c):a.call(null,c)}function Pd(a){a=(a-a%2)/2;return 0<=a?Math.floor(a):Math.ceil(a)}
function Qd(a){a-=a>>1&1431655765;a=(a&858993459)+(a>>2&858993459);return 16843009*(a+(a>>4)&252645135)>>24}function Rd(a){var b=1;for(a=D(a);;)if(a&&0<b)--b,a=J(a);else return a}var w=function w(){switch(arguments.length){case 0:return w.G();case 1:return w.h(arguments[0]);default:return w.B(arguments[0],new E(Array.prototype.slice.call(arguments,1),0))}};w.G=function(){return""};w.h=function(a){return null==a?"":ea(a)};
w.B=function(a,b){for(var c=new ma(""+w(a)),d=b;;)if(p(d))c=c.append(""+w(H(d))),d=J(d);else return c.toString()};w.I=function(a){var b=H(a);a=J(a);return w.B(b,a)};w.H=1;function Pc(a,b){var c;if(nd(b))if(Lc(a)&&Lc(b)&&Q(a)!==Q(b))c=!1;else a:{c=D(a);for(var d=D(b);;){if(null==c){c=null==d;break a}if(null!=d&&K.c(H(c),H(d)))c=J(c),d=J(d);else{c=!1;break a}}}else c=null;return vd(c)}
function Sd(a){var b=0;for(a=D(a);;)if(a){var c=H(a),b=(b+(rc(function(){var a=c;return Td.h?Td.h(a):Td.call(null,a)}())^rc(function(){var a=c;return Vd.h?Vd.h(a):Vd.call(null,a)}())))%4503599627370496;a=J(a)}else return b}function Wd(a,b,c,d,e){this.meta=a;this.first=b;this.Ga=c;this.count=d;this.v=e;this.w=65937646;this.F=8192}f=Wd.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.meta};
f.X=function(){return new Wd(this.meta,this.first,this.Ga,this.count,this.v)};f.qa=function(){return 1===this.count?null:this.Ga};f.T=function(){return this.count};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Bc(this)};f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Ab(I,this.meta)};f.ga=function(a,b){return Tc(b,this)};f.ha=function(a,b,c){return Vc(b,c,this)};f.ia=function(){return this.first};f.ra=function(){return 1===this.count?I:this.Ga};f.R=function(){return this};
f.O=function(a,b){return new Wd(b,this.first,this.Ga,this.count,this.v)};f.S=function(a,b){return new Wd(this.meta,b,this,this.count+1,null)};Wd.prototype[Ha]=function(){return zc(this)};function Xd(a){this.meta=a;this.w=65937614;this.F=8192}f=Xd.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.meta};f.X=function(){return new Xd(this.meta)};f.qa=function(){return null};f.T=function(){return 0};f.P=function(){return Cc};
f.D=function(a,b){return Pc(this,b)};f.ba=function(){return this};f.ga=function(a,b){return Tc(b,this)};f.ha=function(a,b,c){return Vc(b,c,this)};f.ia=function(){return null};f.ra=function(){return I};f.R=function(){return null};f.O=function(a,b){return new Xd(b)};f.S=function(a,b){return new Wd(this.meta,b,null,1,null)};var I=new Xd(null);Xd.prototype[Ha]=function(){return zc(this)};function Yd(a){return(a?a.w&134217728||a.Zd||(a.w?0:t(Jb,a)):t(Jb,a))?Kb(a):Pa(Xc,I,a)}
function Zd(a,b,c,d){this.meta=a;this.first=b;this.Ga=c;this.v=d;this.w=65929452;this.F=8192}f=Zd.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.meta};f.X=function(){return new Zd(this.meta,this.first,this.Ga,this.v)};f.qa=function(){return null==this.Ga?null:D(this.Ga)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Bc(this)};f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Sc(I,this.meta)};
f.ga=function(a,b){return Tc(b,this)};f.ha=function(a,b,c){return Vc(b,c,this)};f.ia=function(){return this.first};f.ra=function(){return null==this.Ga?I:this.Ga};f.R=function(){return this};f.O=function(a,b){return new Zd(b,this.first,this.Ga,this.v)};f.S=function(a,b){return new Zd(null,b,this,this.v)};Zd.prototype[Ha]=function(){return zc(this)};function M(a,b){var c=null==b;return(c?c:b&&(b.w&64||b.zb))?new Zd(null,a,b,null):new Zd(null,a,D(b),null)}
function $d(a,b){if(a.aa===b.aa)return 0;var c=Da(a.ma);if(p(c?b.ma:c))return-1;if(p(a.ma)){if(Da(b.ma))return 1;c=oa(a.ma,b.ma);return 0===c?oa(a.name,b.name):c}return oa(a.name,b.name)}function W(a,b,c,d){this.ma=a;this.name=b;this.aa=c;this.kb=d;this.w=2153775105;this.F=4096}f=W.prototype;f.toString=function(){return[w(":"),w(this.aa)].join("")};f.equiv=function(a){return this.D(null,a)};f.D=function(a,b){return b instanceof W?this.aa===b.aa:!1};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return cd(c,this);case 3:return dd(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return cd(c,this)};a.j=function(a,c,d){return dd(c,this,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return cd(a,this)};f.c=function(a,b){return dd(a,this,b)};
f.P=function(){var a=this.kb;return null!=a?a:this.kb=a=sc(nc(this.name),qc(this.ma))+2654435769|0};f.M=function(a,b){return Nb(b,[w(":"),w(this.aa)].join(""))};function ae(a){return a instanceof W}function X(a,b){return a===b?!0:a instanceof W&&b instanceof W?a.aa===b.aa:!1}var be=function be(){switch(arguments.length){case 1:return be.h(arguments[0]);case 2:return be.c(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};
be.h=function(a){if(a instanceof W)return a;if(a instanceof C){var b;if(a&&(a.F&4096||a.Rc))b=a.ma;else throw Error([w("Doesn't support namespace: "),w(a)].join(""));return new W(b,ce.h?ce.h(a):ce.call(null,a),a.La,null)}return"string"===typeof a?(b=a.split("/"),2===b.length?new W(b[0],b[1],a,null):new W(null,b[0],a,null)):null};be.c=function(a,b){return new W(a,b,[w(p(a)?[w(a),w("/")].join(""):null),w(b)].join(""),null)};be.H=2;
function de(a,b,c,d){this.meta=a;this.rb=b;this.s=c;this.v=d;this.w=32374988;this.F=0}f=de.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};function ee(a){null!=a.rb&&(a.s=a.rb.G?a.rb.G():a.rb.call(null),a.rb=null);return a.s}f.N=function(){return this.meta};f.qa=function(){Gb(this);return null==this.s?null:J(this.s)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Bc(this)};f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Sc(I,this.meta)};
f.ga=function(a,b){return Tc(b,this)};f.ha=function(a,b,c){return Vc(b,c,this)};f.ia=function(){Gb(this);return null==this.s?null:H(this.s)};f.ra=function(){Gb(this);return null!=this.s?xc(this.s):I};f.R=function(){ee(this);if(null==this.s)return null;for(var a=this.s;;)if(a instanceof de)a=ee(a);else return this.s=a,D(this.s)};f.O=function(a,b){return new de(b,this.rb,this.s,this.v)};f.S=function(a,b){return M(b,this)};de.prototype[Ha]=function(){return zc(this)};
function ge(a,b){this.Nb=a;this.end=b;this.w=2;this.F=0}ge.prototype.add=function(a){this.Nb[this.end]=a;return this.end+=1};ge.prototype.U=function(){var a=new he(this.Nb,0,this.end);this.Nb=null;return a};ge.prototype.T=function(){return this.end};function ie(a){return new ge(Array(a),0)}function he(a,b,c){this.l=a;this.off=b;this.end=c;this.w=524306;this.F=0}f=he.prototype;f.T=function(){return this.end-this.off};f.V=function(a,b){return this.l[this.off+b]};
f.ua=function(a,b,c){return 0<=b&&b<this.end-this.off?this.l[this.off+b]:c};f.Zb=function(){if(this.off===this.end)throw Error("-drop-first of empty chunk");return new he(this.l,this.off+1,this.end)};f.ga=function(a,b){return Kc(this.l,b,this.l[this.off],this.off+1)};f.ha=function(a,b,c){return Kc(this.l,b,c,this.off)};function je(a,b,c,d){this.U=a;this.Ia=b;this.meta=c;this.v=d;this.w=31850732;this.F=1536}f=je.prototype;f.toString=function(){return ic(this)};
f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.meta};f.qa=function(){if(1<Wa(this.U))return new je(Yb(this.U),this.Ia,this.meta,null);var a=Gb(this.Ia);return null==a?null:a};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Bc(this)};f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Sc(I,this.meta)};f.ia=function(){return z.c(this.U,0)};f.ra=function(){return 1<Wa(this.U)?new je(Yb(this.U),this.Ia,this.meta,null):null==this.Ia?I:this.Ia};f.R=function(){return this};
f.Pb=function(){return this.U};f.Qb=function(){return null==this.Ia?I:this.Ia};f.O=function(a,b){return new je(this.U,this.Ia,b,this.v)};f.S=function(a,b){return M(b,this)};f.Ob=function(){return null==this.Ia?null:this.Ia};je.prototype[Ha]=function(){return zc(this)};function ke(a,b){return 0===Wa(a)?b:new je(a,b,null,null)}function le(a,b){a.add(b)}function Kd(a){for(var b=[];;)if(D(a))b.push(H(a)),a=J(a);else return b}
function me(a,b){if(Lc(a))return Q(a);for(var c=a,d=b,e=0;;)if(0<d&&D(c))c=J(c),--d,e+=1;else return e}var ne=function ne(b){return null==b?null:null==J(b)?D(H(b)):M(H(b),ne(J(b)))},Y=function Y(){switch(arguments.length){case 0:return Y.G();case 1:return Y.h(arguments[0]);case 2:return Y.c(arguments[0],arguments[1]);default:return Y.B(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};Y.G=function(){return new de(null,function(){return null},null,null)};
Y.h=function(a){return new de(null,function(){return a},null,null)};Y.c=function(a,b){return new de(null,function(){var c=D(a);return c?qd(c)?ke(Zb(c),Y.c(bc(c),b)):M(H(c),Y.c(xc(c),b)):b},null,null)};Y.B=function(a,b,c){return function e(a,b){return new de(null,function(){var c=D(a);return c?qd(c)?ke(Zb(c),e(bc(c),b)):M(H(c),e(xc(c),b)):p(b)?e(H(b),J(b)):null},null,null)}(Y.c(a,b),c)};Y.I=function(a){var b=H(a),c=J(a);a=H(c);c=J(c);return Y.B(b,a,c)};Y.H=2;function oe(a,b){return M(a,b)}
function pe(a){return Vb(a)}var qe=function qe(){switch(arguments.length){case 0:return qe.G();case 1:return qe.h(arguments[0]);case 2:return qe.c(arguments[0],arguments[1]);default:return qe.B(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};qe.G=function(){return Tb(Zc)};qe.h=function(a){return a};qe.c=function(a,b){return Ub(a,b)};qe.B=function(a,b,c){for(;;)if(a=Ub(a,b),p(c))b=H(c),c=J(c);else return a};
qe.I=function(a){var b=H(a),c=J(a);a=H(c);c=J(c);return qe.B(b,a,c)};qe.H=2;
function re(a,b,c){var d=D(c);if(0===b)return a.G?a.G():a.call(null);c=bb(d);var e=cb(d);if(1===b)return a.h?a.h(c):a.h?a.h(c):a.call(null,c);var d=bb(e),g=cb(e);if(2===b)return a.c?a.c(c,d):a.c?a.c(c,d):a.call(null,c,d);var e=bb(g),h=cb(g);if(3===b)return a.j?a.j(c,d,e):a.j?a.j(c,d,e):a.call(null,c,d,e);var g=bb(h),k=cb(h);if(4===b)return a.K?a.K(c,d,e,g):a.K?a.K(c,d,e,g):a.call(null,c,d,e,g);var h=bb(k),l=cb(k);if(5===b)return a.da?a.da(c,d,e,g,h):a.da?a.da(c,d,e,g,h):a.call(null,c,d,e,g,h);var k=
bb(l),n=cb(l);if(6===b)return a.Ba?a.Ba(c,d,e,g,h,k):a.Ba?a.Ba(c,d,e,g,h,k):a.call(null,c,d,e,g,h,k);var l=bb(n),q=cb(n);if(7===b)return a.Xa?a.Xa(c,d,e,g,h,k,l):a.Xa?a.Xa(c,d,e,g,h,k,l):a.call(null,c,d,e,g,h,k,l);var n=bb(q),r=cb(q);if(8===b)return a.Ya?a.Ya(c,d,e,g,h,k,l,n):a.Ya?a.Ya(c,d,e,g,h,k,l,n):a.call(null,c,d,e,g,h,k,l,n);var q=bb(r),v=cb(r);if(9===b)return a.Za?a.Za(c,d,e,g,h,k,l,n,q):a.Za?a.Za(c,d,e,g,h,k,l,n,q):a.call(null,c,d,e,g,h,k,l,n,q);var r=bb(v),x=cb(v);if(10===b)return a.Ma?a.Ma(c,
d,e,g,h,k,l,n,q,r):a.Ma?a.Ma(c,d,e,g,h,k,l,n,q,r):a.call(null,c,d,e,g,h,k,l,n,q,r);var v=bb(x),B=cb(x);if(11===b)return a.Na?a.Na(c,d,e,g,h,k,l,n,q,r,v):a.Na?a.Na(c,d,e,g,h,k,l,n,q,r,v):a.call(null,c,d,e,g,h,k,l,n,q,r,v);var x=bb(B),F=cb(B);if(12===b)return a.Oa?a.Oa(c,d,e,g,h,k,l,n,q,r,v,x):a.Oa?a.Oa(c,d,e,g,h,k,l,n,q,r,v,x):a.call(null,c,d,e,g,h,k,l,n,q,r,v,x);var B=bb(F),G=cb(F);if(13===b)return a.Pa?a.Pa(c,d,e,g,h,k,l,n,q,r,v,x,B):a.Pa?a.Pa(c,d,e,g,h,k,l,n,q,r,v,x,B):a.call(null,c,d,e,g,h,k,l,
n,q,r,v,x,B);var F=bb(G),N=cb(G);if(14===b)return a.Qa?a.Qa(c,d,e,g,h,k,l,n,q,r,v,x,B,F):a.Qa?a.Qa(c,d,e,g,h,k,l,n,q,r,v,x,B,F):a.call(null,c,d,e,g,h,k,l,n,q,r,v,x,B,F);var G=bb(N),P=cb(N);if(15===b)return a.Ra?a.Ra(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G):a.Ra?a.Ra(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G):a.call(null,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G);var N=bb(P),ka=cb(P);if(16===b)return a.Sa?a.Sa(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N):a.Sa?a.Sa(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N):a.call(null,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N);var P=
bb(ka),Na=cb(ka);if(17===b)return a.Ta?a.Ta(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P):a.Ta?a.Ta(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P):a.call(null,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P);var ka=bb(Na),jb=cb(Na);if(18===b)return a.Ua?a.Ua(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka):a.Ua?a.Ua(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka):a.call(null,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka);Na=bb(jb);jb=cb(jb);if(19===b)return a.Va?a.Va(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka,Na):a.Va?a.Va(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka,Na):a.call(null,
c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka,Na);var O=bb(jb);cb(jb);if(20===b)return a.Wa?a.Wa(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka,Na,O):a.Wa?a.Wa(c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka,Na,O):a.call(null,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G,N,P,ka,Na,O);throw Error("Only up to 20 arguments supported on functions");}
function hd(){switch(arguments.length){case 2:return se(arguments[0],arguments[1]);case 3:return te(arguments[0],arguments[1],arguments[2]);case 4:return ue(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return ve(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:return we(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],new E(Array.prototype.slice.call(arguments,5),0))}}
function se(a,b){var c=a.H;if(a.I){var d=me(b,c+1);return d<=c?re(a,d,b):a.I(b)}return a.apply(a,Kd(b))}function te(a,b,c){b=M(b,c);c=a.H;if(a.I){var d=me(b,c+1);return d<=c?re(a,d,b):a.I(b)}return a.apply(a,Kd(b))}function ue(a,b,c,d){b=M(b,M(c,d));c=a.H;return a.I?(d=me(b,c+1),d<=c?re(a,d,b):a.I(b)):a.apply(a,Kd(b))}function ve(a,b,c,d,e){b=M(b,M(c,M(d,e)));c=a.H;return a.I?(d=me(b,c+1),d<=c?re(a,d,b):a.I(b)):a.apply(a,Kd(b))}
function we(a,b,c,d,e,g){b=M(b,M(c,M(d,M(e,ne(g)))));c=a.H;return a.I?(d=me(b,c+1),d<=c?re(a,d,b):a.I(b)):a.apply(a,Kd(b))}function xe(a,b){return!K.c(a,b)}function ye(a){return D(a)?a:null}function ze(a,b){for(;;){if(null==D(b))return!0;var c;c=H(b);c=a.h?a.h(c):a.call(null,c);if(p(c)){c=a;var d=J(b);a=c;b=d}else return!1}}function Ae(a,b){for(;;)if(D(b)){var c;c=H(b);c=a.h?a.h(c):a.call(null,c);if(p(c))return c;c=a;var d=J(b);a=c;b=d}else return null}
function Be(a){return function(){function b(b,c){return Da(a.c?a.c(b,c):a.call(null,b,c))}function c(b){return Da(a.h?a.h(b):a.call(null,b))}function d(){return Da(a.G?a.G():a.call(null))}var e=null,g=function(){function b(a,d,e){var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new E(h,0)}return c.call(this,a,d,g)}function c(b,d,e){return Da(ue(a,b,d,e))}b.H=2;b.I=function(a){var b=H(a);a=J(a);var d=H(a);a=xc(a);return c(b,d,a)};b.B=c;
return b}(),e=function(a,e,l){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,a);case 2:return b.call(this,a,e);default:var n=null;if(2<arguments.length){for(var n=0,q=Array(arguments.length-2);n<q.length;)q[n]=arguments[n+2],++n;n=new E(q,0)}return g.B(a,e,n)}throw Error("Invalid arity: "+arguments.length);};e.H=2;e.I=g.I;e.G=d;e.h=c;e.c=b;e.B=g.B;return e}()}
function Ce(){var a=Dd;return function(){function b(b){if(0<arguments.length)for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;return a}b.H=0;b.I=function(b){D(b);return a};b.B=function(){return a};return b}()}
var De=function De(){switch(arguments.length){case 0:return De.G();case 1:return De.h(arguments[0]);case 2:return De.c(arguments[0],arguments[1]);case 3:return De.j(arguments[0],arguments[1],arguments[2]);default:return De.B(arguments[0],arguments[1],arguments[2],new E(Array.prototype.slice.call(arguments,3),0))}};De.G=function(){return Nd};De.h=function(a){return a};
De.c=function(a,b){return function(){function c(c,d,e){c=b.j?b.j(c,d,e):b.call(null,c,d,e);return a.h?a.h(c):a.call(null,c)}function d(c,d){var e=b.c?b.c(c,d):b.call(null,c,d);return a.h?a.h(e):a.call(null,e)}function e(c){c=b.h?b.h(c):b.call(null,c);return a.h?a.h(c):a.call(null,c)}function g(){var c=b.G?b.G():b.call(null);return a.h?a.h(c):a.call(null,c)}var h=null,k=function(){function c(a,b,e,g){var h=null;if(3<arguments.length){for(var h=0,k=Array(arguments.length-3);h<k.length;)k[h]=arguments[h+
3],++h;h=new E(k,0)}return d.call(this,a,b,e,h)}function d(c,e,g,h){c=ve(b,c,e,g,h);return a.h?a.h(c):a.call(null,c)}c.H=3;c.I=function(a){var b=H(a);a=J(a);var c=H(a);a=J(a);var e=H(a);a=xc(a);return d(b,c,e,a)};c.B=d;return c}(),h=function(a,b,h,r){switch(arguments.length){case 0:return g.call(this);case 1:return e.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,h);default:var v=null;if(3<arguments.length){for(var v=0,x=Array(arguments.length-3);v<x.length;)x[v]=arguments[v+
3],++v;v=new E(x,0)}return k.B(a,b,h,v)}throw Error("Invalid arity: "+arguments.length);};h.H=3;h.I=k.I;h.G=g;h.h=e;h.c=d;h.j=c;h.B=k.B;return h}()};
De.j=function(a,b,c){return function(){function d(d,e,g){d=c.j?c.j(d,e,g):c.call(null,d,e,g);d=b.h?b.h(d):b.call(null,d);return a.h?a.h(d):a.call(null,d)}function e(d,e){var g;g=c.c?c.c(d,e):c.call(null,d,e);g=b.h?b.h(g):b.call(null,g);return a.h?a.h(g):a.call(null,g)}function g(d){d=c.h?c.h(d):c.call(null,d);d=b.h?b.h(d):b.call(null,d);return a.h?a.h(d):a.call(null,d)}function h(){var d;d=c.G?c.G():c.call(null);d=b.h?b.h(d):b.call(null,d);return a.h?a.h(d):a.call(null,d)}var k=null,l=function(){function d(a,
b,c,g){var h=null;if(3<arguments.length){for(var h=0,k=Array(arguments.length-3);h<k.length;)k[h]=arguments[h+3],++h;h=new E(k,0)}return e.call(this,a,b,c,h)}function e(d,g,h,k){d=ve(c,d,g,h,k);d=b.h?b.h(d):b.call(null,d);return a.h?a.h(d):a.call(null,d)}d.H=3;d.I=function(a){var b=H(a);a=J(a);var c=H(a);a=J(a);var d=H(a);a=xc(a);return e(b,c,d,a)};d.B=e;return d}(),k=function(a,b,c,k){switch(arguments.length){case 0:return h.call(this);case 1:return g.call(this,a);case 2:return e.call(this,a,b);
case 3:return d.call(this,a,b,c);default:var x=null;if(3<arguments.length){for(var x=0,B=Array(arguments.length-3);x<B.length;)B[x]=arguments[x+3],++x;x=new E(B,0)}return l.B(a,b,c,x)}throw Error("Invalid arity: "+arguments.length);};k.H=3;k.I=l.I;k.G=h;k.h=g;k.c=e;k.j=d;k.B=l.B;return k}()};
De.B=function(a,b,c,d){return function(a){return function(){function b(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new E(e,0)}return c.call(this,d)}function c(b){b=se(H(a),b);for(var d=J(a);;)if(d)b=H(d).call(null,b),d=J(d);else return b}b.H=0;b.I=function(a){a=D(a);return c(a)};b.B=c;return b}()}(Yd(M(a,M(b,M(c,d)))))};De.I=function(a){var b=H(a),c=J(a);a=H(c);var d=J(c),c=H(d),d=J(d);return De.B(b,a,c,d)};De.H=3;
function Ee(a,b){return function(){function c(c,d,e){return a.K?a.K(b,c,d,e):a.call(null,b,c,d,e)}function d(c,d){return a.j?a.j(b,c,d):a.call(null,b,c,d)}function e(c){return a.c?a.c(b,c):a.call(null,b,c)}function g(){return a.h?a.h(b):a.call(null,b)}var h=null,k=function(){function c(a,b,e,g){var h=null;if(3<arguments.length){for(var h=0,k=Array(arguments.length-3);h<k.length;)k[h]=arguments[h+3],++h;h=new E(k,0)}return d.call(this,a,b,e,h)}function d(c,e,g,h){return we(a,b,c,e,g,Rc([h],0))}c.H=
3;c.I=function(a){var b=H(a);a=J(a);var c=H(a);a=J(a);var e=H(a);a=xc(a);return d(b,c,e,a)};c.B=d;return c}(),h=function(a,b,h,r){switch(arguments.length){case 0:return g.call(this);case 1:return e.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,h);default:var v=null;if(3<arguments.length){for(var v=0,x=Array(arguments.length-3);v<x.length;)x[v]=arguments[v+3],++v;v=new E(x,0)}return k.B(a,b,h,v)}throw Error("Invalid arity: "+arguments.length);};h.H=3;h.I=k.I;h.G=g;h.h=e;
h.c=d;h.j=c;h.B=k.B;return h}()}var Fe=function Fe(){switch(arguments.length){case 1:return Fe.h(arguments[0]);case 2:return Fe.c(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};
Fe.h=function(a){return function(b){return function(){function c(c,d){var e=a.h?a.h(d):a.call(null,d);return null==e?c:b.c?b.c(c,e):b.call(null,c,e)}function d(a){return b.h?b.h(a):b.call(null,a)}function e(){return b.G?b.G():b.call(null)}var g=null,g=function(a,b){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};g.G=e;g.h=d;g.c=c;return g}()}};
Fe.c=function(a,b){return new de(null,function(){var c=D(b);if(c){if(qd(c)){for(var d=Zb(c),e=Q(d),g=ie(e),h=0;;)if(h<e){var k=function(){var b=z.c(d,h);return a.h?a.h(b):a.call(null,b)}();null!=k&&g.add(k);h+=1}else break;return ke(g.U(),Fe.c(a,bc(c)))}e=function(){var b=H(c);return a.h?a.h(b):a.call(null,b)}();return null==e?Fe.c(a,xc(c)):M(e,Fe.c(a,xc(c)))}return null},null,null)};Fe.H=2;function Ge(a,b,c,d){this.state=a;this.meta=b;this.tb=d;this.F=16386;this.w=6455296}f=Ge.prototype;
f.equiv=function(a){return this.D(null,a)};f.D=function(a,b){return this===b};f.lb=function(){return this.state};f.N=function(){return this.meta};f.ec=function(a,b,c){for(var d=D(this.tb),e=null,g=0,h=0;;)if(h<g){a=e.V(null,h);var k=R(a,0);a=R(a,1);var l=b,n=c;a.K?a.K(k,this,l,n):a.call(null,k,this,l,n);h+=1}else if(a=D(d))d=a,qd(d)?(e=Zb(d),d=bc(d),a=e,g=Q(e),e=a):(a=H(d),k=R(a,0),a=R(a,1),e=k,g=b,h=c,a.K?a.K(e,this,g,h):a.call(null,e,this,g,h),d=J(d),e=null,g=0),h=0;else return null};
f.dc=function(a,b,c){this.tb=S.j(this.tb,b,c);return this};f.fc=function(a,b){return this.tb=T.c(this.tb,b)};f.P=function(){return this[ba]||(this[ba]=++ca)};function He(){switch(arguments.length){case 1:return Ie(arguments[0]);default:var a=arguments[0],b=new E(Array.prototype.slice.call(arguments,1),0),b=ud(b)?se(Je,b):b,c=cd(b,ya);cd(b,Ke);return new Ge(a,c,0,null)}}function Ie(a){return new Ge(a,null,0,null)}
function Ne(a,b){if(a instanceof Ge){var c=a.state;a.state=b;null!=a.tb&&Qb(a,c,b);return b}return ec(a,b)}var Oe=function Oe(){switch(arguments.length){case 2:return Oe.c(arguments[0],arguments[1]);case 3:return Oe.j(arguments[0],arguments[1],arguments[2]);case 4:return Oe.K(arguments[0],arguments[1],arguments[2],arguments[3]);default:return Oe.B(arguments[0],arguments[1],arguments[2],arguments[3],new E(Array.prototype.slice.call(arguments,4),0))}};
Oe.c=function(a,b){var c;a instanceof Ge?(c=a.state,c=b.h?b.h(c):b.call(null,c),c=Ne(a,c)):c=fc.c(a,b);return c};Oe.j=function(a,b,c){if(a instanceof Ge){var d=a.state;b=b.c?b.c(d,c):b.call(null,d,c);a=Ne(a,b)}else a=fc.j(a,b,c);return a};Oe.K=function(a,b,c,d){if(a instanceof Ge){var e=a.state;b=b.j?b.j(e,c,d):b.call(null,e,c,d);a=Ne(a,b)}else a=fc.K(a,b,c,d);return a};Oe.B=function(a,b,c,d,e){return a instanceof Ge?Ne(a,ve(b,a.state,c,d,e)):fc.da(a,b,c,d,e)};
Oe.I=function(a){var b=H(a),c=J(a);a=H(c);var d=J(c),c=H(d),e=J(d),d=H(e),e=J(e);return Oe.B(b,a,c,d,e)};Oe.H=4;var Z=function Z(){switch(arguments.length){case 1:return Z.h(arguments[0]);case 2:return Z.c(arguments[0],arguments[1]);case 3:return Z.j(arguments[0],arguments[1],arguments[2]);case 4:return Z.K(arguments[0],arguments[1],arguments[2],arguments[3]);default:return Z.B(arguments[0],arguments[1],arguments[2],arguments[3],new E(Array.prototype.slice.call(arguments,4),0))}};
Z.h=function(a){return function(b){return function(){function c(c,d){var e=a.h?a.h(d):a.call(null,d);return b.c?b.c(c,e):b.call(null,c,e)}function d(a){return b.h?b.h(a):b.call(null,a)}function e(){return b.G?b.G():b.call(null)}var g=null,h=function(){function c(a,b,e){var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new E(h,0)}return d.call(this,a,b,g)}function d(c,e,g){e=te(a,e,g);return b.c?b.c(c,e):b.call(null,c,e)}c.H=2;c.I=function(a){var b=
H(a);a=J(a);var c=H(a);a=xc(a);return d(b,c,a)};c.B=d;return c}(),g=function(a,b,g){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b);default:var q=null;if(2<arguments.length){for(var q=0,r=Array(arguments.length-2);q<r.length;)r[q]=arguments[q+2],++q;q=new E(r,0)}return h.B(a,b,q)}throw Error("Invalid arity: "+arguments.length);};g.H=2;g.I=h.I;g.G=e;g.h=d;g.c=c;g.B=h.B;return g}()}};
Z.c=function(a,b){return new de(null,function(){var c=D(b);if(c){if(qd(c)){for(var d=Zb(c),e=Q(d),g=ie(e),h=0;;)if(h<e)le(g,function(){var b=z.c(d,h);return a.h?a.h(b):a.call(null,b)}()),h+=1;else break;return ke(g.U(),Z.c(a,bc(c)))}return M(function(){var b=H(c);return a.h?a.h(b):a.call(null,b)}(),Z.c(a,xc(c)))}return null},null,null)};
Z.j=function(a,b,c){return new de(null,function(){var d=D(b),e=D(c);if(d&&e){var g=M,h;h=H(d);var k=H(e);h=a.c?a.c(h,k):a.call(null,h,k);d=g(h,Z.j(a,xc(d),xc(e)))}else d=null;return d},null,null)};Z.K=function(a,b,c,d){return new de(null,function(){var e=D(b),g=D(c),h=D(d);if(e&&g&&h){var k=M,l;l=H(e);var n=H(g),q=H(h);l=a.j?a.j(l,n,q):a.call(null,l,n,q);e=k(l,Z.K(a,xc(e),xc(g),xc(h)))}else e=null;return e},null,null)};
Z.B=function(a,b,c,d,e){var g=function k(a){return new de(null,function(){var b=Z.c(D,a);return ze(Nd,b)?M(Z.c(H,b),k(Z.c(xc,b))):null},null,null)};return Z.c(function(){return function(b){return se(a,b)}}(g),g(Xc.B(e,d,Rc([c,b],0))))};Z.I=function(a){var b=H(a),c=J(a);a=H(c);var d=J(c),c=H(d),e=J(d),d=H(e),e=J(e);return Z.B(b,a,c,d,e)};Z.H=4;function Pe(a,b){return new de(null,function(){if(0<a){var c=D(b);return c?M(H(c),Pe(a-1,xc(c))):null}return null},null,null)}
function Qe(a){return new de(null,function(b){return function(){return b(1,a)}}(function(a,c){for(;;){var d=D(c);if(0<a&&d){var e=a-1,d=xc(d);a=e;c=d}else return d}}),null,null)}function Re(a,b){return new de(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var e=D(b),g;if(g=e)g=H(e),g=a.h?a.h(g):a.call(null,g);if(p(g))g=a,e=xc(e),a=g,b=e;else return e}}),null,null)}function Se(a){return new de(null,function(){return M(a,Se(a))},null,null)}
var Te=function Te(){switch(arguments.length){case 2:return Te.c(arguments[0],arguments[1]);default:return Te.B(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};Te.c=function(a,b){return new de(null,function(){var c=D(a),d=D(b);return c&&d?M(H(c),M(H(d),Te.c(xc(c),xc(d)))):null},null,null)};Te.B=function(a,b,c){return new de(null,function(){var d=Z.c(D,Xc.B(c,b,Rc([a],0)));return ze(Nd,d)?Y.c(Z.c(H,d),se(Te,Z.c(xc,d))):null},null,null)};
Te.I=function(a){var b=H(a),c=J(a);a=H(c);c=J(c);return Te.B(b,a,c)};Te.H=2;function Ue(a){return Qe(Te.c(Se("/"),a))}var Ve=function Ve(){switch(arguments.length){case 1:return Ve.h(arguments[0]);case 2:return Ve.c(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};
Ve.h=function(a){return function(b){return function(){function c(c,d){return p(a.h?a.h(d):a.call(null,d))?b.c?b.c(c,d):b.call(null,c,d):c}function d(a){return b.h?b.h(a):b.call(null,a)}function e(){return b.G?b.G():b.call(null)}var g=null,g=function(a,b){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};g.G=e;g.h=d;g.c=c;return g}()}};
Ve.c=function(a,b){return new de(null,function(){var c=D(b);if(c){if(qd(c)){for(var d=Zb(c),e=Q(d),g=ie(e),h=0;;)if(h<e){var k;k=z.c(d,h);k=a.h?a.h(k):a.call(null,k);p(k)&&(k=z.c(d,h),g.add(k));h+=1}else break;return ke(g.U(),Ve.c(a,bc(c)))}d=H(c);c=xc(c);return p(a.h?a.h(d):a.call(null,d))?M(d,Ve.c(a,c)):Ve.c(a,c)}return null},null,null)};Ve.H=2;
var We=function We(){switch(arguments.length){case 1:return We.h(arguments[0]);case 2:return We.c(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};We.h=function(a){return Ve.h(Be(a))};We.c=function(a,b){return Ve.c(Be(a),b)};We.H=2;function Xe(a){return function c(a){return new de(null,function(){var e;p(nd.h?nd.h(a):nd.call(null,a))?(e=Rc([D.h?D.h(a):D.call(null,a)],0),e=se(Y,te(Z,c,e))):e=null;return M(a,e)},null,null)}(a)}
function Ye(a){return Ve.c(function(a){return!nd(a)},xc(Xe(a)))}var Ze=function Ze(){switch(arguments.length){case 2:return Ze.c(arguments[0],arguments[1]);case 3:return Ze.j(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};Ze.c=function(a,b){return null!=a?a&&(a.F&4||a.Ic)?Sc(pe(Pa(Ub,Tb(a),b)),id(a)):Pa(y,a,b):Pa(Xc,I,b)};Ze.j=function(a,b,c){return a&&(a.F&4||a.Ic)?Sc(pe(Od(b,qe,Tb(a),c)),id(a)):Od(b,Xc,a,c)};Ze.H=3;
var $e=function $e(){switch(arguments.length){case 2:return $e.c(arguments[0],arguments[1]);case 3:return $e.j(arguments[0],arguments[1],arguments[2]);case 4:return $e.K(arguments[0],arguments[1],arguments[2],arguments[3]);default:return $e.B(arguments[0],arguments[1],arguments[2],arguments[3],new E(Array.prototype.slice.call(arguments,4),0))}};$e.c=function(a,b){return pe(Pa(function(b,d){return qe.c(b,a.h?a.h(d):a.call(null,d))},Tb(Zc),b))};$e.j=function(a,b,c){return Ze.c(Zc,Z.j(a,b,c))};
$e.K=function(a,b,c,d){return Ze.c(Zc,Z.K(a,b,c,d))};$e.B=function(a,b,c,d,e){return Ze.c(Zc,we(Z,a,b,c,d,Rc([e],0)))};$e.I=function(a){var b=H(a),c=J(a);a=H(c);var d=J(c),c=H(d),e=J(d),d=H(e),e=J(e);return $e.B(b,a,c,d,e)};$e.H=4;function af(a,b){return bf(a,b,null)}function bf(a,b,c){var d=td;for(b=D(b);;)if(b){var e=a;if(e?e.w&256||e.ac||(e.w?0:t(fb,e)):t(fb,e)){a=dd(a,H(b),d);if(d===a)return c;b=J(b)}else return c}else return a}
var cf=function cf(b,c,d){var e=R(c,0);c=Rd(c);return p(c)?S.j(b,e,cf(cd(b,e),c,d)):S.j(b,e,d)},df=function df(){switch(arguments.length){case 3:return df.j(arguments[0],arguments[1],arguments[2]);case 4:return df.K(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return df.da(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);case 6:return df.Ba(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);default:return df.B(arguments[0],arguments[1],arguments[2],
arguments[3],arguments[4],arguments[5],new E(Array.prototype.slice.call(arguments,6),0))}};df.j=function(a,b,c){var d=R(b,0);b=Rd(b);return p(b)?S.j(a,d,df.j(cd(a,d),b,c)):S.j(a,d,function(){var b=cd(a,d);return c.h?c.h(b):c.call(null,b)}())};df.K=function(a,b,c,d){var e=R(b,0);b=Rd(b);return p(b)?S.j(a,e,df.K(cd(a,e),b,c,d)):S.j(a,e,function(){var b=cd(a,e);return c.c?c.c(b,d):c.call(null,b,d)}())};
df.da=function(a,b,c,d,e){var g=R(b,0);b=Rd(b);return p(b)?S.j(a,g,df.da(cd(a,g),b,c,d,e)):S.j(a,g,function(){var b=cd(a,g);return c.j?c.j(b,d,e):c.call(null,b,d,e)}())};df.Ba=function(a,b,c,d,e,g){var h=R(b,0);b=Rd(b);return p(b)?S.j(a,h,df.Ba(cd(a,h),b,c,d,e,g)):S.j(a,h,function(){var b=cd(a,h);return c.K?c.K(b,d,e,g):c.call(null,b,d,e,g)}())};df.B=function(a,b,c,d,e,g,h){var k=R(b,0);b=Rd(b);return p(b)?S.j(a,k,we(df,cd(a,k),b,c,d,Rc([e,g,h],0))):S.j(a,k,we(c,cd(a,k),d,e,g,Rc([h],0)))};
df.I=function(a){var b=H(a),c=J(a);a=H(c);var d=J(c),c=H(d),e=J(d),d=H(e),g=J(e),e=H(g),h=J(g),g=H(h),h=J(h);return df.B(b,a,c,d,e,g,h)};df.H=6;function ef(a,b){this.W=a;this.l=b}function ff(a){return new ef(a,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function gf(a){a=a.A;return 32>a?0:a-1>>>5<<5}function hf(a,b,c){for(;;){if(0===b)return c;var d=ff(a);d.l[0]=c;c=d;b-=5}}
var jf=function jf(b,c,d,e){var g=new ef(d.W,Ia(d.l)),h=b.A-1>>>c&31;5===c?g.l[h]=e:(d=d.l[h],b=null!=d?jf(b,c-5,d,e):hf(null,c-5,e),g.l[h]=b);return g};function kf(a,b){throw Error([w("No item "),w(a),w(" in vector of length "),w(b)].join(""));}function lf(a,b){if(b>=gf(a))return a.na;for(var c=a.root,d=a.shift;;)if(0<d)var e=d-5,c=c.l[b>>>d&31],d=e;else return c.l}function mf(a,b){return 0<=b&&b<a.A?lf(a,b):kf(b,a.A)}
var nf=function nf(b,c,d,e,g){var h=new ef(d.W,Ia(d.l));if(0===c)h.l[e&31]=g;else{var k=e>>>c&31;b=nf(b,c-5,d.l[k],e,g);h.l[k]=b}return h};function of(a,b,c,d,e,g){this.i=a;this.base=b;this.l=c;this.ea=d;this.start=e;this.end=g}of.prototype.Ib=function(){return this.i<this.end};of.prototype.next=function(){32===this.i-this.base&&(this.l=lf(this.ea,this.i),this.base+=32);var a=this.l[this.i&31];this.i+=1;return a};
function U(a,b,c,d,e,g){this.meta=a;this.A=b;this.shift=c;this.root=d;this.na=e;this.v=g;this.w=167668511;this.F=8196}f=U.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){return"number"===typeof b?z.j(this,b,c):c};f.V=function(a,b){return mf(this,b)[b&31]};f.ua=function(a,b,c){return 0<=b&&b<this.A?lf(this,b)[b&31]:c};
f.Tb=function(a,b,c){if(0<=b&&b<this.A)return gf(this)<=b?(a=Ia(this.na),a[b&31]=c,new U(this.meta,this.A,this.shift,this.root,a,null)):new U(this.meta,this.A,this.shift,nf(this,this.shift,this.root,b,c),this.na,null);if(b===this.A)return y(this,c);throw Error([w("Index "),w(b),w(" out of bounds  [0,"),w(this.A),w("]")].join(""));};f.yb=function(){var a=this.A;return new of(0,0,0<Q(this)?lf(this,0):null,this,0,a)};f.N=function(){return this.meta};
f.X=function(){return new U(this.meta,this.A,this.shift,this.root,this.na,this.v)};f.T=function(){return this.A};f.Rb=function(){return z.c(this,0)};f.Sb=function(){return z.c(this,1)};f.Gb=function(){return 0<this.A?new Oc(this,this.A-1,null):null};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Bc(this)};
f.D=function(a,b){if(b instanceof U)if(this.A===Q(b))for(var c=gc(this),d=gc(b);;)if(p(c.Ib())){var e=c.next(),g=d.next();if(!K.c(e,g))return!1}else return!0;else return!1;else return Pc(this,b)};f.mb=function(){var a=this;return new pf(a.A,a.shift,function(){var b=a.root;return qf.h?qf.h(b):qf.call(null,b)}(),function(){var b=a.na;return rf.h?rf.h(b):rf.call(null,b)}())};f.ba=function(){return Sc(Zc,this.meta)};f.ga=function(a,b){return Gc(this,b)};
f.ha=function(a,b,c){a=0;for(var d=c;;)if(a<this.A){var e=lf(this,a);c=e.length;a:for(var g=0;;)if(g<c)var h=e[g],d=b.c?b.c(d,h):b.call(null,d,h),g=g+1;else{e=d;break a}a+=c;d=e}else return d};f.fa=function(a,b,c){if("number"===typeof b)return ub(this,b,c);throw Error("Vector's key for assoc must be a number.");};
f.R=function(){if(0===this.A)return null;if(32>=this.A)return new E(this.na,0);var a;a:{a=this.root;for(var b=this.shift;;)if(0<b)b-=5,a=a.l[0];else{a=a.l;break a}}return sf?sf(this,a,0,0):tf.call(null,this,a,0,0)};f.O=function(a,b){return new U(b,this.A,this.shift,this.root,this.na,this.v)};
f.S=function(a,b){if(32>this.A-gf(this)){for(var c=this.na.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.na[e],e+=1;else break;d[c]=b;return new U(this.meta,this.A+1,this.shift,this.root,d,null)}c=(d=this.A>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=ff(null),d.l[0]=this.root,e=hf(null,this.shift,new ef(null,this.na)),d.l[1]=e):d=jf(this,this.shift,this.root,new ef(null,this.na));return new U(this.meta,this.A+1,c,d,[b],null)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.V(null,c);case 3:return this.ua(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.V(null,c)};a.j=function(a,c,d){return this.ua(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return this.V(null,a)};f.c=function(a,b){return this.ua(null,a,b)};
var V=new ef(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),Zc=new U(null,0,5,V,[],Cc);U.prototype[Ha]=function(){return zc(this)};function uf(a){if(Ca(a))a:{var b=a.length;if(32>b)a=new U(null,b,5,V,a,null);else for(var c=32,d=(new U(null,32,5,V,a.slice(0,32),null)).mb(null);;)if(c<b)var e=c+1,d=qe.c(d,a[c]),c=e;else{a=Vb(d);break a}}else a=Vb(Pa(Ub,Tb(Zc),a));return a}
function vf(a,b,c,d,e,g){this.Aa=a;this.node=b;this.i=c;this.off=d;this.meta=e;this.v=g;this.w=32375020;this.F=1536}f=vf.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.meta};f.qa=function(){if(this.off+1<this.node.length){var a;a=this.Aa;var b=this.node,c=this.i,d=this.off+1;a=sf?sf(a,b,c,d):tf.call(null,a,b,c,d);return null==a?null:a}return cc(this)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Bc(this)};
f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Sc(Zc,this.meta)};f.ga=function(a,b){var c;c=this.Aa;var d=this.i+this.off,e=Q(this.Aa);c=wf?wf(c,d,e):xf.call(null,c,d,e);return Gc(c,b)};f.ha=function(a,b,c){a=this.Aa;var d=this.i+this.off,e=Q(this.Aa);a=wf?wf(a,d,e):xf.call(null,a,d,e);return Hc(a,b,c)};f.ia=function(){return this.node[this.off]};
f.ra=function(){if(this.off+1<this.node.length){var a;a=this.Aa;var b=this.node,c=this.i,d=this.off+1;a=sf?sf(a,b,c,d):tf.call(null,a,b,c,d);return null==a?I:a}return bc(this)};f.R=function(){return this};f.Pb=function(){var a=this.node;return new he(a,this.off,a.length)};f.Qb=function(){var a=this.i+this.node.length;if(a<Wa(this.Aa)){var b=this.Aa,c=lf(this.Aa,a);return sf?sf(b,c,a,0):tf.call(null,b,c,a,0)}return I};
f.O=function(a,b){var c=this.Aa,d=this.node,e=this.i,g=this.off;return yf?yf(c,d,e,g,b):tf.call(null,c,d,e,g,b)};f.S=function(a,b){return M(b,this)};f.Ob=function(){var a=this.i+this.node.length;if(a<Wa(this.Aa)){var b=this.Aa,c=lf(this.Aa,a);return sf?sf(b,c,a,0):tf.call(null,b,c,a,0)}return null};vf.prototype[Ha]=function(){return zc(this)};
function tf(){switch(arguments.length){case 3:var a=arguments[0],b=arguments[1],c=arguments[2];return new vf(a,mf(a,b),b,c,null,null);case 4:return sf(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return yf(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function sf(a,b,c,d){return new vf(a,b,c,d,null,null)}function yf(a,b,c,d,e){return new vf(a,b,c,d,e,null)}
function zf(a,b,c,d,e){this.meta=a;this.ea=b;this.start=c;this.end=d;this.v=e;this.w=167666463;this.F=8192}f=zf.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){return"number"===typeof b?z.j(this,b,c):c};f.V=function(a,b){return 0>b||this.end<=this.start+b?kf(b,this.end-this.start):z.c(this.ea,this.start+b)};f.ua=function(a,b,c){return 0>b||this.end<=this.start+b?c:z.j(this.ea,this.start+b,c)};
f.Tb=function(a,b,c){var d=this.start+b;a=this.meta;c=S.j(this.ea,d,c);b=this.start;var e=this.end,d=d+1,d=e>d?e:d;return Af.da?Af.da(a,c,b,d,null):Af.call(null,a,c,b,d,null)};f.N=function(){return this.meta};f.X=function(){return new zf(this.meta,this.ea,this.start,this.end,this.v)};f.T=function(){return this.end-this.start};f.Gb=function(){return this.start!==this.end?new Oc(this,this.end-this.start-1,null):null};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Bc(this)};
f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Sc(Zc,this.meta)};f.ga=function(a,b){return Gc(this,b)};f.ha=function(a,b,c){return Hc(this,b,c)};f.fa=function(a,b,c){if("number"===typeof b)return ub(this,b,c);throw Error("Subvec's key for assoc must be a number.");};f.R=function(){var a=this;return function(b){return function d(e){return e===a.end?null:M(z.c(a.ea,e),new de(null,function(){return function(){return d(e+1)}}(b),null,null))}}(this)(a.start)};
f.O=function(a,b){var c=this.ea,d=this.start,e=this.end,g=this.v;return Af.da?Af.da(b,c,d,e,g):Af.call(null,b,c,d,e,g)};f.S=function(a,b){var c=this.meta,d=ub(this.ea,this.end,b),e=this.start,g=this.end+1;return Af.da?Af.da(c,d,e,g,null):Af.call(null,c,d,e,g,null)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.V(null,c);case 3:return this.ua(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.V(null,c)};a.j=function(a,c,d){return this.ua(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return this.V(null,a)};f.c=function(a,b){return this.ua(null,a,b)};zf.prototype[Ha]=function(){return zc(this)};
function Af(a,b,c,d,e){for(;;)if(b instanceof zf)c=b.start+c,d=b.start+d,b=b.ea;else{var g=Q(b);if(0>c||0>d||c>g||d>g)throw Error("Index out of bounds");return new zf(a,b,c,d,e)}}function xf(){switch(arguments.length){case 2:var a=arguments[0];return wf(a,arguments[1],Q(a));case 3:return wf(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function wf(a,b,c){return Af(null,a,b,c,null)}
function Bf(a,b){return a===b.W?b:new ef(a,Ia(b.l))}function qf(a){return new ef({},Ia(a.l))}function rf(a){var b=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];sd(a,0,b,0,a.length);return b}var Cf=function Cf(b,c,d,e){d=Bf(b.root.W,d);var g=b.A-1>>>c&31;if(5===c)b=e;else{var h=d.l[g];b=null!=h?Cf(b,c-5,h,e):hf(b.root.W,c-5,e)}d.l[g]=b;return d};
function pf(a,b,c,d){this.A=a;this.shift=b;this.root=c;this.na=d;this.F=88;this.w=275}f=pf.prototype;
f.hb=function(a,b){if(this.root.W){if(32>this.A-gf(this))this.na[this.A&31]=b;else{var c=new ef(this.root.W,this.na),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=b;this.na=d;if(this.A>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=hf(this.root.W,this.shift,c);this.root=new ef(this.root.W,d);this.shift=e}else this.root=Cf(this,this.shift,this.root,c)}this.A+=1;return this}throw Error("conj! after persistent!");};f.nb=function(){if(this.root.W){this.root.W=null;var a=this.A-gf(this),b=Array(a);sd(this.na,0,b,0,a);return new U(null,this.A,this.shift,this.root,b,null)}throw Error("persistent! called twice");};
f.Ab=function(a,b,c){if("number"===typeof b)return Xb(this,b,c);throw Error("TransientVector's key for assoc! must be a number.");};
f.cc=function(a,b,c){var d=this;if(d.root.W){if(0<=b&&b<d.A)return gf(this)<=b?d.na[b&31]=c:(a=function(){return function g(a,k){var l=Bf(d.root.W,k);if(0===a)l.l[b&31]=c;else{var n=b>>>a&31,q=g(a-5,l.l[n]);l.l[n]=q}return l}}(this).call(null,d.shift,d.root),d.root=a),this;if(b===d.A)return Ub(this,c);throw Error([w("Index "),w(b),w(" out of bounds for TransientVector of length"),w(d.A)].join(""));}throw Error("assoc! after persistent!");};
f.T=function(){if(this.root.W)return this.A;throw Error("count after persistent!");};f.V=function(a,b){if(this.root.W)return mf(this,b)[b&31];throw Error("nth after persistent!");};f.ua=function(a,b,c){return 0<=b&&b<this.A?z.c(this,b):c};f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){return"number"===typeof b?z.j(this,b,c):c};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.L(null,c);case 3:return this.J(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.L(null,c)};a.j=function(a,c,d){return this.J(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return this.L(null,a)};f.c=function(a,b){return this.J(null,a,b)};function Df(){this.w=2097152;this.F=0}
Df.prototype.equiv=function(a){return this.D(null,a)};Df.prototype.D=function(){return!1};var Ef=new Df;function Ff(a,b){return vd(od(b)?Q(a)===Q(b)?ze(Nd,Z.c(function(a){return K.c(dd(b,H(a),Ef),Wc(a))},a)):null:null)}function Gf(a){this.s=a}Gf.prototype.next=function(){if(null!=this.s){var a=H(this.s),b=R(a,0),a=R(a,1);this.s=J(this.s);return{value:[b,a],done:!1}}return{value:null,done:!0}};function Hf(a){return new Gf(D(a))}function If(a){this.s=a}
If.prototype.next=function(){if(null!=this.s){var a=H(this.s);this.s=J(this.s);return{value:[a,a],done:!1}}return{value:null,done:!0}};
function Jf(a,b){var c;if(b instanceof W)a:{c=a.length;for(var d=b.aa,e=0;;){if(c<=e){c=-1;break a}var g=a[e];if(g instanceof W&&d===g.aa){c=e;break a}e+=2}}else if(c="string"==typeof b,p(p(c)?c:"number"===typeof b))a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(b===a[d]){c=d;break a}d+=2}else if(b instanceof C)a:for(c=a.length,d=b.La,e=0;;){if(c<=e){c=-1;break a}g=a[e];if(g instanceof C&&d===g.La){c=e;break a}e+=2}else if(null==b)a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(null==a[d]){c=d;
break a}d+=2}else a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(K.c(b,a[d])){c=d;break a}d+=2}return c}function Kf(a,b,c){this.l=a;this.i=b;this.oa=c;this.w=32374990;this.F=0}f=Kf.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.oa};f.qa=function(){return this.i<this.l.length-2?new Kf(this.l,this.i+2,this.oa):null};f.T=function(){return(this.l.length-this.i)/2};f.P=function(){return Bc(this)};
f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Sc(I,this.oa)};f.ga=function(a,b){return Tc(b,this)};f.ha=function(a,b,c){return Vc(b,c,this)};f.ia=function(){return new U(null,2,5,V,[this.l[this.i],this.l[this.i+1]],null)};f.ra=function(){return this.i<this.l.length-2?new Kf(this.l,this.i+2,this.oa):I};f.R=function(){return this};f.O=function(a,b){return new Kf(this.l,this.i,b)};f.S=function(a,b){return M(b,this)};Kf.prototype[Ha]=function(){return zc(this)};
function Lf(a,b,c){this.l=a;this.i=b;this.A=c}Lf.prototype.Ib=function(){return this.i<this.A};Lf.prototype.next=function(){var a=new U(null,2,5,V,[this.l[this.i],this.l[this.i+1]],null);this.i+=2;return a};function va(a,b,c,d){this.meta=a;this.A=b;this.l=c;this.v=d;this.w=16647951;this.F=8196}f=va.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.keys=function(){return zc(Mf.h?Mf.h(this):Mf.call(null,this))};f.entries=function(){return Hf(D(this))};
f.values=function(){return zc(Nf.h?Nf.h(this):Nf.call(null,this))};f.has=function(a){return yd(this,a)};f.get=function(a,b){return this.J(null,a,b)};f.forEach=function(a){for(var b=D(this),c=null,d=0,e=0;;)if(e<d){var g=c.V(null,e),h=R(g,0),g=R(g,1);a.c?a.c(g,h):a.call(null,g,h);e+=1}else if(b=D(b))qd(b)?(c=Zb(b),b=bc(b),h=c,d=Q(c),c=h):(c=H(b),h=R(c,0),c=g=R(c,1),a.c?a.c(c,h):a.call(null,c,h),b=J(b),c=null,d=0),e=0;else return null};f.L=function(a,b){return A.j(this,b,null)};
f.J=function(a,b,c){a=Jf(this.l,b);return-1===a?c:this.l[a+1]};f.yb=function(){return new Lf(this.l,0,2*this.A)};f.N=function(){return this.meta};f.X=function(){return new va(this.meta,this.A,this.l,this.v)};f.T=function(){return this.A};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Dc(this)};
f.D=function(a,b){if(b&&(b.w&1024||b.Oc)){var c=this.l.length;if(this.A===b.T(null))for(var d=0;;)if(d<c){var e=b.J(null,this.l[d],td);if(e!==td)if(K.c(this.l[d+1],e))d+=2;else return!1;else return!1}else return!0;else return!1}else return Ff(this,b)};f.mb=function(){return new Of({},this.l.length,Ia(this.l))};f.ba=function(){return Ab(Dd,this.meta)};f.ga=function(a,b){return Tc(b,this)};f.ha=function(a,b,c){return Vc(b,c,this)};
f.pa=function(a,b){if(0<=Jf(this.l,b)){var c=this.l.length,d=c-2;if(0===d)return Ya(this);for(var d=Array(d),e=0,g=0;;){if(e>=c)return new va(this.meta,this.A-1,d,null);K.c(b,this.l[e])||(d[g]=this.l[e],d[g+1]=this.l[e+1],g+=2);e+=2}}else return this};
f.fa=function(a,b,c){a=Jf(this.l,b);if(-1===a){if(this.A<Cd){a=this.l;for(var d=a.length,e=Array(d+2),g=0;;)if(g<d)e[g]=a[g],g+=1;else break;e[d]=b;e[d+1]=c;return new va(this.meta,this.A+1,e,null)}return Ab(kb(Ze.c(Pf,this),b,c),this.meta)}if(c===this.l[a+1])return this;b=Ia(this.l);b[a+1]=c;return new va(this.meta,this.A,b,null)};f.vb=function(a,b){return-1!==Jf(this.l,b)};f.R=function(){var a=this.l;return 0<=a.length-2?new Kf(a,0,null):null};f.O=function(a,b){return new va(b,this.A,this.l,this.v)};
f.S=function(a,b){if(pd(b))return kb(this,z.c(b,0),z.c(b,1));for(var c=this,d=D(b);;){if(null==d)return c;var e=H(d);if(pd(e))c=kb(c,z.c(e,0),z.c(e,1)),d=J(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.L(null,c);case 3:return this.J(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.L(null,c)};a.j=function(a,c,d){return this.J(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return this.L(null,a)};f.c=function(a,b){return this.J(null,a,b)};var Dd=new va(null,0,[],Ec),Cd=8;
function Qf(a){for(var b=[],c=0;;)if(c<a.length){var d=a[c],e=a[c+1];-1===Jf(b,d)&&(b.push(d),b.push(e));c+=2}else break;return new va(null,b.length/2,b,null)}va.prototype[Ha]=function(){return zc(this)};function Of(a,b,c){this.qb=a;this.sb=b;this.l=c;this.w=258;this.F=56}f=Of.prototype;f.T=function(){if(p(this.qb))return Pd(this.sb);throw Error("count after persistent!");};f.L=function(a,b){return A.j(this,b,null)};
f.J=function(a,b,c){if(p(this.qb))return a=Jf(this.l,b),-1===a?c:this.l[a+1];throw Error("lookup after persistent!");};
f.hb=function(a,b){if(p(this.qb)){if(b?b.w&2048||b.Pc||(b.w?0:t(nb,b)):t(nb,b))return Wb(this,Td.h?Td.h(b):Td.call(null,b),Vd.h?Vd.h(b):Vd.call(null,b));for(var c=D(b),d=this;;){var e=H(c);if(p(e))var g=e,c=J(c),d=Wb(d,function(){var a=g;return Td.h?Td.h(a):Td.call(null,a)}(),function(){var a=g;return Vd.h?Vd.h(a):Vd.call(null,a)}());else return d}}else throw Error("conj! after persistent!");};
f.nb=function(){if(p(this.qb))return this.qb=!1,new va(null,Pd(this.sb),this.l,null);throw Error("persistent! called twice");};f.Ab=function(a,b,c){if(p(this.qb)){a=Jf(this.l,b);if(-1===a){if(this.sb+2<=2*Cd)return this.sb+=2,this.l.push(b),this.l.push(c),this;a=this.sb;var d=this.l;a=Rf.c?Rf.c(a,d):Rf.call(null,a,d);return Wb(a,b,c)}c!==this.l[a+1]&&(this.l[a+1]=c);return this}throw Error("assoc! after persistent!");};
function Rf(a,b){for(var c=Tb(Pf),d=0;;)if(d<a)c=Wb(c,b[d],b[d+1]),d+=2;else return c}function Sf(){this.val=!1}function Tf(a,b){return a===b?!0:X(a,b)?!0:K.c(a,b)}function Uf(a,b,c){a=Ia(a);a[b]=c;return a}function Wf(a,b){var c=Array(a.length-2);sd(a,0,c,0,2*b);sd(a,2*(b+1),c,2*b,c.length-2*b);return c}function Xf(a,b,c,d){a=a.ib(b);a.l[c]=d;return a}function Yf(a,b,c){this.W=a;this.Z=b;this.l=c}f=Yf.prototype;
f.ib=function(a){if(a===this.W)return this;var b=Qd(this.Z),c=Array(0>b?4:2*(b+1));sd(this.l,0,c,0,2*b);return new Yf(a,this.Z,c)};f.Cb=function(){var a=this.l;return Zf?Zf(a):$f.call(null,a)};f.eb=function(a,b,c,d){var e=1<<(b>>>a&31);if(0===(this.Z&e))return d;var g=Qd(this.Z&e-1),e=this.l[2*g],g=this.l[2*g+1];return null==e?g.eb(a+5,b,c,d):Tf(c,e)?g:d};
f.Ea=function(a,b,c,d,e,g){var h=1<<(c>>>b&31),k=Qd(this.Z&h-1);if(0===(this.Z&h)){var l=Qd(this.Z);if(2*l<this.l.length){a=this.ib(a);b=a.l;g.val=!0;a:for(c=2*(l-k),g=2*k+(c-1),l=2*(k+1)+(c-1);;){if(0===c)break a;b[l]=b[g];--l;--c;--g}b[2*k]=d;b[2*k+1]=e;a.Z|=h;return a}if(16<=l){k=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];k[c>>>b&31]=ag.Ea(a,b+5,c,d,e,g);for(e=d=0;;)if(32>d)0!==
(this.Z>>>d&1)&&(k[d]=null!=this.l[e]?ag.Ea(a,b+5,rc(this.l[e]),this.l[e],this.l[e+1],g):this.l[e+1],e+=2),d+=1;else break;return new bg(a,l+1,k)}b=Array(2*(l+4));sd(this.l,0,b,0,2*k);b[2*k]=d;b[2*k+1]=e;sd(this.l,2*k,b,2*(k+1),2*(l-k));g.val=!0;a=this.ib(a);a.l=b;a.Z|=h;return a}l=this.l[2*k];h=this.l[2*k+1];if(null==l)return l=h.Ea(a,b+5,c,d,e,g),l===h?this:Xf(this,a,2*k+1,l);if(Tf(d,l))return e===h?this:Xf(this,a,2*k+1,e);g.val=!0;g=b+5;d=cg?cg(a,g,l,h,c,d,e):dg.call(null,a,g,l,h,c,d,e);e=2*k;
k=2*k+1;a=this.ib(a);a.l[e]=null;a.l[k]=d;return a};
f.Da=function(a,b,c,d,e){var g=1<<(b>>>a&31),h=Qd(this.Z&g-1);if(0===(this.Z&g)){var k=Qd(this.Z);if(16<=k){h=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];h[b>>>a&31]=ag.Da(a+5,b,c,d,e);for(d=c=0;;)if(32>c)0!==(this.Z>>>c&1)&&(h[c]=null!=this.l[d]?ag.Da(a+5,rc(this.l[d]),this.l[d],this.l[d+1],e):this.l[d+1],d+=2),c+=1;else break;return new bg(null,k+1,h)}a=Array(2*(k+1));sd(this.l,
0,a,0,2*h);a[2*h]=c;a[2*h+1]=d;sd(this.l,2*h,a,2*(h+1),2*(k-h));e.val=!0;return new Yf(null,this.Z|g,a)}var l=this.l[2*h],g=this.l[2*h+1];if(null==l)return k=g.Da(a+5,b,c,d,e),k===g?this:new Yf(null,this.Z,Uf(this.l,2*h+1,k));if(Tf(c,l))return d===g?this:new Yf(null,this.Z,Uf(this.l,2*h+1,d));e.val=!0;e=this.Z;k=this.l;a+=5;a=eg?eg(a,l,g,b,c,d):dg.call(null,a,l,g,b,c,d);c=2*h;h=2*h+1;d=Ia(k);d[c]=null;d[h]=a;return new Yf(null,e,d)};
f.Db=function(a,b,c){var d=1<<(b>>>a&31);if(0===(this.Z&d))return this;var e=Qd(this.Z&d-1),g=this.l[2*e],h=this.l[2*e+1];return null==g?(a=h.Db(a+5,b,c),a===h?this:null!=a?new Yf(null,this.Z,Uf(this.l,2*e+1,a)):this.Z===d?null:new Yf(null,this.Z^d,Wf(this.l,e))):Tf(c,g)?new Yf(null,this.Z^d,Wf(this.l,e)):this};var ag=new Yf(null,0,[]);function bg(a,b,c){this.W=a;this.A=b;this.l=c}f=bg.prototype;f.ib=function(a){return a===this.W?this:new bg(a,this.A,Ia(this.l))};
f.Cb=function(){var a=this.l;return fg?fg(a):gg.call(null,a)};f.eb=function(a,b,c,d){var e=this.l[b>>>a&31];return null!=e?e.eb(a+5,b,c,d):d};f.Ea=function(a,b,c,d,e,g){var h=c>>>b&31,k=this.l[h];if(null==k)return a=Xf(this,a,h,ag.Ea(a,b+5,c,d,e,g)),a.A+=1,a;b=k.Ea(a,b+5,c,d,e,g);return b===k?this:Xf(this,a,h,b)};
f.Da=function(a,b,c,d,e){var g=b>>>a&31,h=this.l[g];if(null==h)return new bg(null,this.A+1,Uf(this.l,g,ag.Da(a+5,b,c,d,e)));a=h.Da(a+5,b,c,d,e);return a===h?this:new bg(null,this.A,Uf(this.l,g,a))};
f.Db=function(a,b,c){var d=b>>>a&31,e=this.l[d];if(null!=e){a=e.Db(a+5,b,c);if(a===e)d=this;else if(null==a)if(8>=this.A)a:{e=this.l;a=e.length;b=Array(2*(this.A-1));c=0;for(var g=1,h=0;;)if(c<a)c!==d&&null!=e[c]&&(b[g]=e[c],g+=2,h|=1<<c),c+=1;else{d=new Yf(null,h,b);break a}}else d=new bg(null,this.A-1,Uf(this.l,d,a));else d=new bg(null,this.A,Uf(this.l,d,a));return d}return this};function hg(a,b,c){b*=2;for(var d=0;;)if(d<b){if(Tf(c,a[d]))return d;d+=2}else return-1}
function ig(a,b,c,d){this.W=a;this.$a=b;this.A=c;this.l=d}f=ig.prototype;f.ib=function(a){if(a===this.W)return this;var b=Array(2*(this.A+1));sd(this.l,0,b,0,2*this.A);return new ig(a,this.$a,this.A,b)};f.Cb=function(){var a=this.l;return Zf?Zf(a):$f.call(null,a)};f.eb=function(a,b,c,d){a=hg(this.l,this.A,c);return 0>a?d:Tf(c,this.l[a])?this.l[a+1]:d};
f.Ea=function(a,b,c,d,e,g){if(c===this.$a){b=hg(this.l,this.A,d);if(-1===b){if(this.l.length>2*this.A)return b=2*this.A,c=2*this.A+1,a=this.ib(a),a.l[b]=d,a.l[c]=e,g.val=!0,a.A+=1,a;c=this.l.length;b=Array(c+2);sd(this.l,0,b,0,c);b[c]=d;b[c+1]=e;g.val=!0;d=this.A+1;a===this.W?(this.l=b,this.A=d,a=this):a=new ig(this.W,this.$a,d,b);return a}return this.l[b+1]===e?this:Xf(this,a,b+1,e)}return(new Yf(a,1<<(this.$a>>>b&31),[null,this,null,null])).Ea(a,b,c,d,e,g)};
f.Da=function(a,b,c,d,e){return b===this.$a?(a=hg(this.l,this.A,c),-1===a?(a=2*this.A,b=Array(a+2),sd(this.l,0,b,0,a),b[a]=c,b[a+1]=d,e.val=!0,new ig(null,this.$a,this.A+1,b)):K.c(this.l[a],d)?this:new ig(null,this.$a,this.A,Uf(this.l,a+1,d))):(new Yf(null,1<<(this.$a>>>a&31),[null,this])).Da(a,b,c,d,e)};f.Db=function(a,b,c){a=hg(this.l,this.A,c);return-1===a?this:1===this.A?null:new ig(null,this.$a,this.A-1,Wf(this.l,Pd(a)))};
function dg(){switch(arguments.length){case 6:return eg(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);case 7:return cg(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function eg(a,b,c,d,e,g){var h=rc(b);if(h===d)return new ig(null,h,2,[b,c,e,g]);var k=new Sf;return ag.Da(a,h,b,c,k).Da(a,d,e,g,k)}
function cg(a,b,c,d,e,g,h){var k=rc(c);if(k===e)return new ig(null,k,2,[c,d,g,h]);var l=new Sf;return ag.Ea(a,b,k,c,d,l).Ea(a,b,e,g,h,l)}function jg(a,b,c,d,e){this.meta=a;this.fb=b;this.i=c;this.s=d;this.v=e;this.w=32374860;this.F=0}f=jg.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.meta};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Bc(this)};f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Sc(I,this.meta)};
f.ga=function(a,b){return Tc(b,this)};f.ha=function(a,b,c){return Vc(b,c,this)};f.ia=function(){return null==this.s?new U(null,2,5,V,[this.fb[this.i],this.fb[this.i+1]],null):H(this.s)};f.ra=function(){if(null==this.s){var a=this.fb,b=this.i+2;return kg?kg(a,b,null):$f.call(null,a,b,null)}var a=this.fb,b=this.i,c=J(this.s);return kg?kg(a,b,c):$f.call(null,a,b,c)};f.R=function(){return this};f.O=function(a,b){return new jg(b,this.fb,this.i,this.s,this.v)};f.S=function(a,b){return M(b,this)};
jg.prototype[Ha]=function(){return zc(this)};function $f(){switch(arguments.length){case 1:return Zf(arguments[0]);case 3:return kg(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function Zf(a){return kg(a,0,null)}
function kg(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new jg(null,a,b,null,null);var d=a[b+1];if(p(d)&&(d=d.Cb(),p(d)))return new jg(null,a,b+2,d,null);b+=2}else return null;else return new jg(null,a,b,c,null)}function lg(a,b,c,d,e){this.meta=a;this.fb=b;this.i=c;this.s=d;this.v=e;this.w=32374860;this.F=0}f=lg.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.meta};
f.P=function(){var a=this.v;return null!=a?a:this.v=a=Bc(this)};f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Sc(I,this.meta)};f.ga=function(a,b){return Tc(b,this)};f.ha=function(a,b,c){return Vc(b,c,this)};f.ia=function(){return H(this.s)};f.ra=function(){var a=this.fb,b=this.i,c=J(this.s);return mg?mg(null,a,b,c):gg.call(null,null,a,b,c)};f.R=function(){return this};f.O=function(a,b){return new lg(b,this.fb,this.i,this.s,this.v)};f.S=function(a,b){return M(b,this)};
lg.prototype[Ha]=function(){return zc(this)};function gg(){switch(arguments.length){case 1:return fg(arguments[0]);case 4:return mg(arguments[0],arguments[1],arguments[2],arguments[3]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function fg(a){return mg(null,a,0,null)}function mg(a,b,c,d){if(null==d)for(d=b.length;;)if(c<d){var e=b[c];if(p(e)&&(e=e.Cb(),p(e)))return new lg(a,b,c+1,e,null);c+=1}else return null;else return new lg(a,b,c,d,null)}
function ng(a,b,c,d,e,g){this.meta=a;this.A=b;this.root=c;this.ka=d;this.ya=e;this.v=g;this.w=16123663;this.F=8196}f=ng.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.keys=function(){return zc(Mf.h?Mf.h(this):Mf.call(null,this))};f.entries=function(){return Hf(D(this))};f.values=function(){return zc(Nf.h?Nf.h(this):Nf.call(null,this))};f.has=function(a){return yd(this,a)};f.get=function(a,b){return this.J(null,a,b)};
f.forEach=function(a){for(var b=D(this),c=null,d=0,e=0;;)if(e<d){var g=c.V(null,e),h=R(g,0),g=R(g,1);a.c?a.c(g,h):a.call(null,g,h);e+=1}else if(b=D(b))qd(b)?(c=Zb(b),b=bc(b),h=c,d=Q(c),c=h):(c=H(b),h=R(c,0),c=g=R(c,1),a.c?a.c(c,h):a.call(null,c,h),b=J(b),c=null,d=0),e=0;else return null};f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){return null==b?this.ka?this.ya:c:null==this.root?c:this.root.eb(0,rc(b),b,c)};f.N=function(){return this.meta};
f.X=function(){return new ng(this.meta,this.A,this.root,this.ka,this.ya,this.v)};f.T=function(){return this.A};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Dc(this)};f.D=function(a,b){return Ff(this,b)};f.mb=function(){return new og({},this.root,this.A,this.ka,this.ya)};f.ba=function(){return Ab(Pf,this.meta)};
f.pa=function(a,b){if(null==b)return this.ka?new ng(this.meta,this.A-1,this.root,!1,null,null):this;if(null==this.root)return this;var c=this.root.Db(0,rc(b),b);return c===this.root?this:new ng(this.meta,this.A-1,c,this.ka,this.ya,null)};
f.fa=function(a,b,c){if(null==b)return this.ka&&c===this.ya?this:new ng(this.meta,this.ka?this.A:this.A+1,this.root,!0,c,null);a=new Sf;b=(null==this.root?ag:this.root).Da(0,rc(b),b,c,a);return b===this.root?this:new ng(this.meta,a.val?this.A+1:this.A,b,this.ka,this.ya,null)};f.vb=function(a,b){return null==b?this.ka:null==this.root?!1:this.root.eb(0,rc(b),b,td)!==td};f.R=function(){if(0<this.A){var a=null!=this.root?this.root.Cb():null;return this.ka?M(new U(null,2,5,V,[null,this.ya],null),a):a}return null};
f.O=function(a,b){return new ng(b,this.A,this.root,this.ka,this.ya,this.v)};f.S=function(a,b){if(pd(b))return kb(this,z.c(b,0),z.c(b,1));for(var c=this,d=D(b);;){if(null==d)return c;var e=H(d);if(pd(e))c=kb(c,z.c(e,0),z.c(e,1)),d=J(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.L(null,c);case 3:return this.J(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.L(null,c)};a.j=function(a,c,d){return this.J(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return this.L(null,a)};f.c=function(a,b){return this.J(null,a,b)};var Pf=new ng(null,0,null,!1,null,Ec);
function ed(a,b){for(var c=a.length,d=0,e=Tb(Pf);;)if(d<c)var g=d+1,e=e.Ab(null,a[d],b[d]),d=g;else return Vb(e)}ng.prototype[Ha]=function(){return zc(this)};function og(a,b,c,d,e){this.W=a;this.root=b;this.count=c;this.ka=d;this.ya=e;this.w=258;this.F=56}
function pg(a,b){if(a.W){if(b?b.w&2048||b.Pc||(b.w?0:t(nb,b)):t(nb,b))return qg(a,Td.h?Td.h(b):Td.call(null,b),Vd.h?Vd.h(b):Vd.call(null,b));for(var c=D(b),d=a;;){var e=H(c);if(p(e))var g=e,c=J(c),d=qg(d,function(){var a=g;return Td.h?Td.h(a):Td.call(null,a)}(),function(){var a=g;return Vd.h?Vd.h(a):Vd.call(null,a)}());else return d}}else throw Error("conj! after persistent");}
function qg(a,b,c){if(a.W){if(null==b)a.ya!==c&&(a.ya=c),a.ka||(a.count+=1,a.ka=!0);else{var d=new Sf;b=(null==a.root?ag:a.root).Ea(a.W,0,rc(b),b,c,d);b!==a.root&&(a.root=b);d.val&&(a.count+=1)}return a}throw Error("assoc! after persistent!");}f=og.prototype;f.T=function(){if(this.W)return this.count;throw Error("count after persistent!");};f.L=function(a,b){return null==b?this.ka?this.ya:null:null==this.root?null:this.root.eb(0,rc(b),b)};
f.J=function(a,b,c){return null==b?this.ka?this.ya:c:null==this.root?c:this.root.eb(0,rc(b),b,c)};f.hb=function(a,b){return pg(this,b)};f.nb=function(){var a;if(this.W)this.W=null,a=new ng(null,this.count,this.root,this.ka,this.ya,null);else throw Error("persistent! called twice");return a};f.Ab=function(a,b,c){return qg(this,b,c)};var Je=function Je(){return Je.B(0<arguments.length?new E(Array.prototype.slice.call(arguments,0),0):null)};
Je.B=function(a){for(var b=D(a),c=Tb(Pf);;)if(b){a=J(J(b));var d=H(b),b=Wc(b),c=Wb(c,d,b),b=a}else return Vb(c)};Je.H=0;Je.I=function(a){return Je.B(D(a))};var rg=function rg(){return rg.B(0<arguments.length?new E(Array.prototype.slice.call(arguments,0),0):null)};rg.B=function(a){a=a instanceof E&&0===a.i?a.l:Ka(a);return Qf(a)};rg.H=0;rg.I=function(a){return rg.B(D(a))};function sg(a,b){this.la=a;this.oa=b;this.w=32374988;this.F=0}f=sg.prototype;f.toString=function(){return ic(this)};
f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.oa};f.qa=function(){var a=this.la,a=(a?a.w&128||a.Fb||(a.w?0:t(eb,a)):t(eb,a))?this.la.qa(null):J(this.la);return null==a?null:new sg(a,this.oa)};f.P=function(){return Bc(this)};f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Sc(I,this.oa)};f.ga=function(a,b){return Tc(b,this)};f.ha=function(a,b,c){return Vc(b,c,this)};f.ia=function(){return this.la.ia(null).Rb()};
f.ra=function(){var a=this.la,a=(a?a.w&128||a.Fb||(a.w?0:t(eb,a)):t(eb,a))?this.la.qa(null):J(this.la);return null!=a?new sg(a,this.oa):I};f.R=function(){return this};f.O=function(a,b){return new sg(this.la,b)};f.S=function(a,b){return M(b,this)};sg.prototype[Ha]=function(){return zc(this)};function Mf(a){return(a=D(a))?new sg(a,null):null}function Td(a){return ob(a)}function tg(a,b){this.la=a;this.oa=b;this.w=32374988;this.F=0}f=tg.prototype;f.toString=function(){return ic(this)};
f.equiv=function(a){return this.D(null,a)};f.N=function(){return this.oa};f.qa=function(){var a=this.la,a=(a?a.w&128||a.Fb||(a.w?0:t(eb,a)):t(eb,a))?this.la.qa(null):J(this.la);return null==a?null:new tg(a,this.oa)};f.P=function(){return Bc(this)};f.D=function(a,b){return Pc(this,b)};f.ba=function(){return Sc(I,this.oa)};f.ga=function(a,b){return Tc(b,this)};f.ha=function(a,b,c){return Vc(b,c,this)};f.ia=function(){return this.la.ia(null).Sb()};
f.ra=function(){var a=this.la,a=(a?a.w&128||a.Fb||(a.w?0:t(eb,a)):t(eb,a))?this.la.qa(null):J(this.la);return null!=a?new tg(a,this.oa):I};f.R=function(){return this};f.O=function(a,b){return new tg(this.la,b)};f.S=function(a,b){return M(b,this)};tg.prototype[Ha]=function(){return zc(this)};function Nf(a){return(a=D(a))?new tg(a,null):null}function Vd(a){return pb(a)}var ug=function ug(){return ug.B(0<arguments.length?new E(Array.prototype.slice.call(arguments,0),0):null)};
ug.B=function(a){return p(Ae(Nd,a))?Md(function(a,c){return Xc.c(p(a)?a:Dd,c)},a):null};ug.H=0;ug.I=function(a){return ug.B(D(a))};function Ed(a,b,c){this.meta=a;this.cb=b;this.v=c;this.w=15077647;this.F=8196}f=Ed.prototype;f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.keys=function(){return zc(D(this))};f.entries=function(){var a=D(this);return new If(D(a))};f.values=function(){return zc(D(this))};f.has=function(a){return yd(this,a)};
f.forEach=function(a){for(var b=D(this),c=null,d=0,e=0;;)if(e<d){var g=c.V(null,e),h=R(g,0),g=R(g,1);a.c?a.c(g,h):a.call(null,g,h);e+=1}else if(b=D(b))qd(b)?(c=Zb(b),b=bc(b),h=c,d=Q(c),c=h):(c=H(b),h=R(c,0),c=g=R(c,1),a.c?a.c(c,h):a.call(null,c,h),b=J(b),c=null,d=0),e=0;else return null};f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){return hb(this.cb,b)?b:c};f.N=function(){return this.meta};f.X=function(){return new Ed(this.meta,this.cb,this.v)};f.T=function(){return Wa(this.cb)};
f.P=function(){var a=this.v;return null!=a?a:this.v=a=Dc(this)};f.D=function(a,b){return md(b)&&Q(this)===Q(b)&&ze(function(a){return function(b){return yd(a,b)}}(this),b)};f.mb=function(){return new vg(Tb(this.cb))};f.ba=function(){return Sc(Fd,this.meta)};f.bc=function(a,b){return new Ed(this.meta,mb(this.cb,b),null)};f.R=function(){return Mf(this.cb)};f.O=function(a,b){return new Ed(b,this.cb,this.v)};f.S=function(a,b){return new Ed(this.meta,S.j(this.cb,b,null),null)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.L(null,c);case 3:return this.J(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.L(null,c)};a.j=function(a,c,d){return this.J(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return this.L(null,a)};f.c=function(a,b){return this.J(null,a,b)};var Fd=new Ed(null,Dd,Ec);Ed.prototype[Ha]=function(){return zc(this)};
function vg(a){this.bb=a;this.F=136;this.w=259}f=vg.prototype;f.hb=function(a,b){this.bb=Wb(this.bb,b,null);return this};f.nb=function(){return new Ed(null,Vb(this.bb),null)};f.T=function(){return Q(this.bb)};f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){return A.j(this.bb,b,td)===td?c:b};
f.call=function(){function a(a,b,c){return A.j(this.bb,b,td)===td?c:b}function b(a,b){return A.j(this.bb,b,td)===td?null:b}var c=null,c=function(c,e,g){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,g)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.j=a;return c}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return A.j(this.bb,a,td)===td?null:a};f.c=function(a,b){return A.j(this.bb,a,td)===td?b:a};
function wg(a){a=D(a);if(null==a)return Fd;if(a instanceof E&&0===a.i){a=a.l;a:for(var b=0,c=Tb(Fd);;)if(b<a.length)var d=b+1,c=c.hb(null,a[b]),b=d;else break a;return c.nb(null)}for(d=Tb(Fd);;)if(null!=a)b=J(a),d=d.hb(null,a.ia(null)),a=b;else return Vb(d)}function ce(a){if(a&&(a.F&4096||a.Rc))return a.name;if("string"===typeof a)return a;throw Error([w("Doesn't support name: "),w(a)].join(""));}
function xg(a,b){return new de(null,function(){var c=D(b);if(c){var d;d=H(c);d=a.h?a.h(d):a.call(null,d);c=p(d)?M(H(c),xg(a,xc(c))):null}else c=null;return c},null,null)}function yg(a,b,c){this.i=a;this.end=b;this.step=c}yg.prototype.Ib=function(){return 0<this.step?this.i<this.end:this.i>this.end};yg.prototype.next=function(){var a=this.i;this.i+=this.step;return a};function zg(a,b,c,d,e){this.meta=a;this.start=b;this.end=c;this.step=d;this.v=e;this.w=32375006;this.F=8192}f=zg.prototype;
f.toString=function(){return ic(this)};f.equiv=function(a){return this.D(null,a)};f.V=function(a,b){if(b<Wa(this))return this.start+b*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};f.ua=function(a,b,c){return b<Wa(this)?this.start+b*this.step:this.start>this.end&&0===this.step?this.start:c};f.yb=function(){return new yg(this.start,this.end,this.step)};f.N=function(){return this.meta};
f.X=function(){return new zg(this.meta,this.start,this.end,this.step,this.v)};f.qa=function(){return 0<this.step?this.start+this.step<this.end?new zg(this.meta,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new zg(this.meta,this.start+this.step,this.end,this.step,null):null};f.T=function(){return Da(Gb(this))?0:Math.ceil((this.end-this.start)/this.step)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Bc(this)};f.D=function(a,b){return Pc(this,b)};
f.ba=function(){return Sc(I,this.meta)};f.ga=function(a,b){return Gc(this,b)};f.ha=function(a,b,c){for(a=this.start;;)if(0<this.step?a<this.end:a>this.end){var d=a;c=b.c?b.c(c,d):b.call(null,c,d);a+=this.step}else return c};f.ia=function(){return null==Gb(this)?null:this.start};f.ra=function(){return null!=Gb(this)?new zg(this.meta,this.start+this.step,this.end,this.step,null):I};f.R=function(){return 0<this.step?this.start<this.end?this:null:this.start>this.end?this:null};
f.O=function(a,b){return new zg(b,this.start,this.end,this.step,this.v)};f.S=function(a,b){return M(b,this)};zg.prototype[Ha]=function(){return zc(this)};function Ag(a,b){return new U(null,2,5,V,[xg(a,b),Re(a,b)],null)}
function Bg(a,b){return function(){function c(c,d,e){return new U(null,2,5,V,[a.j?a.j(c,d,e):a.call(null,c,d,e),b.j?b.j(c,d,e):b.call(null,c,d,e)],null)}function d(c,d){return new U(null,2,5,V,[a.c?a.c(c,d):a.call(null,c,d),b.c?b.c(c,d):b.call(null,c,d)],null)}function e(c){return new U(null,2,5,V,[a.h?a.h(c):a.call(null,c),b.h?b.h(c):b.call(null,c)],null)}function g(){return new U(null,2,5,V,[a.G?a.G():a.call(null),b.G?b.G():b.call(null)],null)}var h=null,k=function(){function c(a,b,e,g){var h=null;
if(3<arguments.length){for(var h=0,k=Array(arguments.length-3);h<k.length;)k[h]=arguments[h+3],++h;h=new E(k,0)}return d.call(this,a,b,e,h)}function d(c,e,g,h){return new U(null,2,5,V,[ve(a,c,e,g,h),ve(b,c,e,g,h)],null)}c.H=3;c.I=function(a){var b=H(a);a=J(a);var c=H(a);a=J(a);var e=H(a);a=xc(a);return d(b,c,e,a)};c.B=d;return c}(),h=function(a,b,h,r){switch(arguments.length){case 0:return g.call(this);case 1:return e.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,h);default:var v=
null;if(3<arguments.length){for(var v=0,x=Array(arguments.length-3);v<x.length;)x[v]=arguments[v+3],++v;v=new E(x,0)}return k.B(a,b,h,v)}throw Error("Invalid arity: "+arguments.length);};h.H=3;h.I=k.I;h.G=g;h.h=e;h.c=d;h.j=c;h.B=k.B;return h}()}function Cg(a){a:for(var b=a;;)if(D(b))b=J(b);else break a;return a}function Dg(a,b){if("string"===typeof b){var c=a.exec(b);return null==c?null:1===Q(c)?H(c):uf(c)}throw new TypeError("re-find must match against a string.");}
function Eg(a,b,c,d,e,g,h){var k=ra;ra=null==ra?null:ra-1;try{if(null!=ra&&0>ra)return Nb(a,"#");Nb(a,c);if(0===Aa.h(g))D(h)&&Nb(a,function(){var a=Fg.h(g);return p(a)?a:"..."}());else{if(D(h)){var l=H(h);b.j?b.j(l,a,g):b.call(null,l,a,g)}for(var n=J(h),q=Aa.h(g)-1;;)if(!n||null!=q&&0===q){D(n)&&0===q&&(Nb(a,d),Nb(a,function(){var a=Fg.h(g);return p(a)?a:"..."}()));break}else{Nb(a,d);var r=H(n);c=a;h=g;b.j?b.j(r,c,h):b.call(null,r,c,h);var v=J(n);c=q-1;n=v;q=c}}return Nb(a,e)}finally{ra=k}}
function Gg(a,b){for(var c=D(b),d=null,e=0,g=0;;)if(g<e){var h=d.V(null,g);Nb(a,h);g+=1}else if(c=D(c))d=c,qd(d)?(c=Zb(d),e=bc(d),d=c,h=Q(c),c=e,e=h):(h=H(d),Nb(a,h),c=J(d),d=null,e=0),g=0;else return null}var Hg={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"};function Ig(a){return[w('"'),w(a.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return Hg[a]})),w('"')].join("")}
function Jg(a,b,c){if(null==a)return Nb(b,"nil");if(void 0===a)return Nb(b,"#\x3cundefined\x3e");if(p(function(){var b=cd(c,ya);return p(b)?(b=a?a.w&131072||a.Qc?!0:a.w?!1:t(xb,a):t(xb,a))?id(a):b:b}())){Nb(b,"^");var d=id(a);Kg.j?Kg.j(d,b,c):Kg.call(null,d,b,c);Nb(b," ")}return null==a?Nb(b,"nil"):a.pb?a.Bb(a,b,c):a&&(a.w&2147483648||a.ca)?a.M(null,b,c):Fa(a)===Boolean||"number"===typeof a?Nb(b,""+w(a)):null!=a&&a.constructor===Object?(Nb(b,"#js "),d=Z.c(function(b){return new U(null,2,5,V,[be.h(b),
a[b]],null)},rd(a)),Lg.K?Lg.K(d,Kg,b,c):Lg.call(null,d,Kg,b,c)):Ca(a)?Eg(b,Kg,"#js ["," ","]",c,a):p("string"==typeof a)?p(xa.h(c))?Nb(b,Ig(a)):Nb(b,a):fd(a)?Gg(b,Rc(["#\x3c",""+w(a),"\x3e"],0)):a instanceof Date?(d=function(a,b){for(var c=""+w(a);;)if(Q(c)<b)c=[w("0"),w(c)].join("");else return c},Gg(b,Rc(['#inst "',""+w(a.getUTCFullYear()),"-",d(a.getUTCMonth()+1,2),"-",d(a.getUTCDate(),2),"T",d(a.getUTCHours(),2),":",d(a.getUTCMinutes(),2),":",d(a.getUTCSeconds(),2),".",d(a.getUTCMilliseconds(),
3),"-",'00:00"'],0))):p(a instanceof RegExp)?Gg(b,Rc(['#"',a.source,'"'],0)):(a?a.w&2147483648||a.ca||(a.w?0:t(Ob,a)):t(Ob,a))?Pb(a,b,c):Gg(b,Rc(["#\x3c",""+w(a),"\x3e"],0))}function Kg(a,b,c){var d=Mg.h(c);return p(d)?(c=S.j(c,Ng,Jg),d.j?d.j(a,b,c):d.call(null,a,b,c)):Jg(a,b,c)}
function Og(a){var b=ta();if(kd(a))b="";else{var c=w,d=new ma;a:{var e=new hc(d);Kg(H(a),e,b);a=D(J(a));for(var g=null,h=0,k=0;;)if(k<h){var l=g.V(null,k);Nb(e," ");Kg(l,e,b);k+=1}else if(a=D(a))g=a,qd(g)?(a=Zb(g),h=bc(g),g=a,l=Q(a),a=h,h=l):(l=H(g),Nb(e," "),Kg(l,e,b),a=J(g),g=null,h=0),k=0;else break a}b=""+c(d)}return b}
function Lg(a,b,c,d){return Eg(c,function(a,c,d){var k=ob(a);b.j?b.j(k,c,d):b.call(null,k,c,d);Nb(c," ");a=pb(a);return b.j?b.j(a,c,d):b.call(null,a,c,d)},"{",", ","}",d,D(a))}E.prototype.ca=!0;E.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};de.prototype.ca=!0;de.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};jg.prototype.ca=!0;jg.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};Kf.prototype.ca=!0;
Kf.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};vf.prototype.ca=!0;vf.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};Zd.prototype.ca=!0;Zd.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};Oc.prototype.ca=!0;Oc.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};ng.prototype.ca=!0;ng.prototype.M=function(a,b,c){return Lg(this,Kg,b,c)};lg.prototype.ca=!0;lg.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};
zf.prototype.ca=!0;zf.prototype.M=function(a,b,c){return Eg(b,Kg,"["," ","]",c,this)};Ed.prototype.ca=!0;Ed.prototype.M=function(a,b,c){return Eg(b,Kg,"#{"," ","}",c,this)};je.prototype.ca=!0;je.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};Ge.prototype.ca=!0;Ge.prototype.M=function(a,b,c){Nb(b,"#\x3cAtom: ");Kg(this.state,b,c);return Nb(b,"\x3e")};tg.prototype.ca=!0;tg.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};U.prototype.ca=!0;
U.prototype.M=function(a,b,c){return Eg(b,Kg,"["," ","]",c,this)};Xd.prototype.ca=!0;Xd.prototype.M=function(a,b){return Nb(b,"()")};va.prototype.ca=!0;va.prototype.M=function(a,b,c){return Lg(this,Kg,b,c)};zg.prototype.ca=!0;zg.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};sg.prototype.ca=!0;sg.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};Wd.prototype.ca=!0;Wd.prototype.M=function(a,b,c){return Eg(b,Kg,"("," ",")",c,this)};C.prototype.wb=!0;
C.prototype.xb=function(a,b){return vc(this,b)};W.prototype.wb=!0;W.prototype.xb=function(a,b){return $d(this,b)};zf.prototype.wb=!0;zf.prototype.xb=function(a,b){return Hd(this,b)};U.prototype.wb=!0;U.prototype.xb=function(a,b){return Hd(this,b)};function Pg(a,b,c){Rb(a,b,c)}var Qg=null;function Rg(a,b){this.jb=a;this.value=b;this.w=32768;this.F=1}Rg.prototype.lb=function(){p(this.jb)&&(this.value=this.jb.G?this.jb.G():this.jb.call(null),this.jb=null);return this.value};
var Sg={},Tg=function Tg(b){if(b?b.Lc:b)return b.Lc(b);var c;c=Tg[m(null==b?null:b)];if(!c&&(c=Tg._,!c))throw u("IEncodeJS.-clj-\x3ejs",b);return c.call(null,b)};function Ug(a){return(a?p(p(null)?null:a.Kc)||(a.Y?0:t(Sg,a)):t(Sg,a))?Tg(a):"string"===typeof a||"number"===typeof a||a instanceof W||a instanceof C?Vg.h?Vg.h(a):Vg.call(null,a):Og(Rc([a],0))}
var Vg=function Vg(b){if(null==b)return null;if(b?p(p(null)?null:b.Kc)||(b.Y?0:t(Sg,b)):t(Sg,b))return Tg(b);if(b instanceof W)return ce(b);if(b instanceof C)return""+w(b);if(od(b)){var c={};b=D(b);for(var d=null,e=0,g=0;;)if(g<e){var h=d.V(null,g),k=R(h,0),h=R(h,1);c[Ug(k)]=Vg(h);g+=1}else if(b=D(b))qd(b)?(e=Zb(b),b=bc(b),d=e,e=Q(e)):(e=H(b),d=R(e,0),e=R(e,1),c[Ug(d)]=Vg(e),b=J(b),d=null,e=0),g=0;else break;return c}if(ld(b)){c=[];b=D(Z.c(Vg,b));d=null;for(g=e=0;;)if(g<e)k=d.V(null,g),c.push(k),
g+=1;else if(b=D(b))d=b,qd(d)?(b=Zb(d),g=bc(d),d=b,e=Q(b),b=g):(b=H(d),c.push(b),b=J(d),d=null,e=0),g=0;else break;return c}return b},Wg={},Xg=function Xg(b,c){if(b?b.Jc:b)return b.Jc(b,c);var d;d=Xg[m(null==b?null:b)];if(!d&&(d=Xg._,!d))throw u("IEncodeClojure.-js-\x3eclj",b);return d.call(null,b,c)};
function Yg(a){var b=Rc([Zg,!0],0),c=ud(b)?se(Je,b):b,d=cd(c,Zg);return function(a,c,d,k){return function n(q){return(q?p(p(null)?null:q.Vd)||(q.Y?0:t(Wg,q)):t(Wg,q))?Xg(q,se(rg,b)):ud(q)?Cg(Z.c(n,q)):ld(q)?Ze.c($c(q),Z.c(n,q)):Ca(q)?uf(Z.c(n,q)):Fa(q)===Object?Ze.c(Dd,function(){return function(a,b,c,d){return function G(e){return new de(null,function(a,b,c,d){return function(){for(;;){var a=D(e);if(a){if(qd(a)){var b=Zb(a),c=Q(b),g=ie(c);return function(){for(var a=0;;)if(a<c){var e=z.c(b,a),h=
g,k=V,r;r=e;r=d.h?d.h(r):d.call(null,r);e=new U(null,2,5,k,[r,n(q[e])],null);h.add(e);a+=1}else return!0}()?ke(g.U(),G(bc(a))):ke(g.U(),null)}var h=H(a);return M(new U(null,2,5,V,[function(){var a=h;return d.h?d.h(a):d.call(null,a)}(),n(q[h])],null),G(xc(a)))}return null}}}(a,b,c,d),null,null)}}(a,c,d,k)(rd(q))}()):q}}(b,c,d,p(d)?be:w)(a)}
function $g(){var a=ah;return function(b){return function(){function c(a){var b=null;if(0<arguments.length){for(var b=0,c=Array(arguments.length-0);b<c.length;)c[b]=arguments[b+0],++b;b=new E(c,0)}return d.call(this,b)}function d(c){var d=dd(L.h?L.h(b):L.call(null,b),c,td);d===td&&(d=se(a,c),Oe.K(b,S,c,d));return d}c.H=0;c.I=function(a){a=D(a);return d(a)};c.B=d;return c}()}(Ie?Ie(Dd):He.call(null,Dd))}
function bh(a,b){return pe(Pa(function(b,d){var e=a.h?a.h(d):a.call(null,d),g=Xc.c(dd(b,e,Zc),d);return Wb(b,e,g)},Tb(Dd),b))}function ch(a,b,c){var d=Error();this.message=a;this.data=b;this.Yb=c;this.name=d.name;this.description=d.description;this.number=d.number;this.fileName=d.fileName;this.lineNumber=d.lineNumber;this.columnNumber=d.columnNumber;this.stack=d.stack;return this}ch.prototype.__proto__=Error.prototype;ch.prototype.ca=!0;
ch.prototype.M=function(a,b,c){Nb(b,"#ExceptionInfo{:message ");Kg(this.message,b,c);p(this.data)&&(Nb(b,", :data "),Kg(this.data,b,c));p(this.Yb)&&(Nb(b,", :cause "),Kg(this.Yb,b,c));return Nb(b,"}")};ch.prototype.toString=function(){return ic(this)};function dh(a,b){return new ch(a,b,null)};var eh=new W(null,"y","y",-1757859776),fh=new W(null,"zero","zero",-858964576),gh=new W(null,"old-state","old-state",1039580704),hh=new W(null,"path","path",-188191168),ih=new W(null,"shift","shift",997140064),kh=new W(null,"one","one",935007904),lh=new W(null,"state-map","state-map",-1313872128),mh=new W(null,"new-value","new-value",1087038368),nh=new W(null,"q","q",689001697),oh=new W(null,"schema","schema",-1582001791),ph=new W(null,"num-eight","num-eight",1648171777),qh=new W(null,"ff-semicolon",
"ff-semicolon",1279895297),rh=new W(null,"slash","slash",-1449773022),sh=new W(null,"down","down",1565245570),th=new W(null,"question-mark","question-mark",1946747234),uh=new W(null,"win-key","win-key",528957026),vh=new W(null,"r","r",-471384190),wh=new W(null,"descriptor","descriptor",76122018),xh=new W(null,"space","space",348133475),yh=new W(null,"num-division","num-division",-1651240829),zh=new W(null,"home","home",-74557309),Ah=new W(null,"insert","insert",1286475395),Bh=new W("om.core","not-found",
"om.core/not-found",1869894275),Ch=new W(null,"componentDidUpdate","componentDidUpdate",-1983477981),Dh=new W(null,"num-zero","num-zero",-2066202749),Eh=new W(null,"v","v",21465059),Fh=new W(null,"mac-enter","mac-enter",-1535813532),Gh=new W(null,"fn","fn",-1175266204),Hh=new W(null,"family","family",-1313145692),Ih=new W(null,"f8","f8",-2141475484),Jh=new W(null,"new-state","new-state",-490349212),Kh=new W(null,"instrument","instrument",-960698844),Lh=new W(null,"o","o",-1350007228),ya=new W(null,
"meta","meta",1499536964),Mh=new W("schema.core","error","schema.core/error",1991454308),Nh=new W(null,"react-key","react-key",1337881348),Oh=new W(null,"eight","eight",-1202254044),Ph=new W(null,"f1","f1",1714532389),Qh=new W("om.core","id","om.core/id",299074693),Rh=new W(null,"win-ime","win-ime",1187364997),za=new W(null,"dup","dup",556298533),Sh=new W(null,"win-key-ff-linux","win-key-ff-linux",-37611163),Th=new W(null,"mac-wk-cmd-left","mac-wk-cmd-left",-84384283),Uh=new W(null,"key","key",-1516042587),
Vh=new W(null,"skip-render-root","skip-render-root",-5219643),Wh=new W(null,"f10","f10",627525541),Xh=new W(null,"last-media-key","last-media-key",486556613),Yh=new W(null,"mac-ff-meta","mac-ff-meta",-999198298),Zh=new W(null,"num-six","num-six",-357946906),$h=new W(null,"num-period","num-period",378989254),ai=new W(null,"isOmComponent","isOmComponent",-2070015162),bi=new W(null,"alt","alt",-3214426),ci=new W(null,"first-media-key","first-media-key",861535271),di=new W(null,"scroll-lock","scroll-lock",
281688679),ei=new W(null,"esc","esc",-1671924121),fi=new W(null,"phantom","phantom",1438556935),gi=new W(null,"_","_",1453416199),Ke=new W(null,"validator","validator",-1966190681),hi=new W(null,"kspec","kspec",-1151232248),ii=new W(null,"does-not-satisfy-schema","does-not-satisfy-schema",-1543152824),ji=new W(null,"name","name",1843675177),ki=new W(null,"n","n",562130025),li=new W(null,"adapt","adapt",-1817022327),mi=new W(null,"w","w",354169001),ni=new W(null,"m","m",1632677161),oi=new W(null,"output-schema",
"output-schema",272504137),pi=new W(null,"editor-path","editor-path",1083496905),qi=new W(null,"comma","comma",1699024745),ri=new W(null,"value","value",305978217),si=new W(null,"num-nine","num-nine",-348334806),ti=new W(null,"page-up","page-up",1352555050),ui=new W(null,"proto-sym","proto-sym",-886371734),vi=new W(null,"num-seven","num-seven",-1673554070),wi=new W(null,"numlock","numlock",-1383996470),xi=new W(null,"win-key-right","win-key-right",-1650150165),yi=new W(null,"input-schemas","input-schemas",
-982154805),zi=new W(null,"extra","extra",1612569067),Ai=new W(null,"f5","f5",1587057387),Bi=new W(null,"old-value","old-value",862546795),Ci=new W(null,"caps-lock","caps-lock",406112235),Di=new W(null,"open-square-bracket","open-square-bracket",-1607562196),Ei=new W(null,"dash","dash",23821356),Fi=new W(null,"num-multiply","num-multiply",302427276),Gi=new W("om.core","pass","om.core/pass",-1453289268),Hi=new W(null,"tilde","tilde",-306005780),Ii=new W(null,"type","type",1174270348),Ji=new W(null,
"init-state","init-state",1450863212),Ki=new W(null,"delete","delete",-1768633620),Li=new W(null,"three","three",-1651831795),Mi=new W(null,"state","state",-1988618099),Ni=new W(null,"mac-wk-cmd-right","mac-wk-cmd-right",-1985015411),Ng=new W(null,"fallback-impl","fallback-impl",-1501286995),Oi=new W(null,"val-schema","val-schema",-2014773619),Pi=new W(null,"five","five",1430677197),Qi=new W(null,"pending-state","pending-state",1525896973),Ri=new W("schema.core","missing","schema.core/missing",1420181325),
wa=new W(null,"flush-on-newline","flush-on-newline",-151457939),Si=new W(null,"save","save",1850079149),Ti=new W(null,"componentWillUnmount","componentWillUnmount",1573788814),Ui=new W(null,"componentWillReceiveProps","componentWillReceiveProps",559988974),Vi=new W(null,"close","close",1835149582),Wi=new W(null,"equals","equals",-463033970),Xi=new W(null,"four","four",1338555054),Yi=new W(null,"e","e",1381269198),Zi=new W(null,"ctrl","ctrl",361402094),$i=new W(null,"s","s",1705939918),bj=new W(null,
"l","l",1395893423),cj=new W(null,"ignore","ignore",-1631542033),dj=new W(null,"className","className",-1983287057),ej=new W(null,"up","up",-269712113),fj=new W(null,"production","production",1781416239),gj=new W(null,"k","k",-2146297393),hj=new W(null,"num-center","num-center",967095119),ij=new W(null,"enter","enter",1792452624),jj=new W(null,"shouldComponentUpdate","shouldComponentUpdate",1795750960),xa=new W(null,"readably","readably",1129599760),Fg=new W(null,"more-marker","more-marker",-14717935),
kj=new W(null,"optional?","optional?",1184638129),lj=new W(null,"z","z",-789527183),mj=new W(null,"key-fn","key-fn",-636154479),nj=new W(null,"g","g",1738089905),oj=new W(null,"num-two","num-two",-1446413903),pj=new W(null,"f11","f11",-1417398799),qj=new W(null,"c","c",-1763192079),rj=new W(null,"render","render",-1408033454),sj=new W(null,"single-quote","single-quote",-1053657646),tj=new W(null,"num-plus","num-plus",-770369838),uj=new W(null,"num-five","num-five",-2036785166),vj=new W(null,"j","j",
-1397974765),wj=new W(null,"schemas","schemas",575070579),xj=new W(null,"previous-state","previous-state",1888227923),yj=new W(null,"f3","f3",1954829043),zj=new W(null,"status","status",-1997798413),Aj=new W(null,"h","h",1109658740),Aa=new W(null,"print-length","print-length",1931866356),Bj=new W(null,"componentWillUpdate","componentWillUpdate",657390932),Cj=new W(null,"f2","f2",396168596),Dj=new W(null,"apostrophe","apostrophe",-1476834636),Ej=new W(null,"getInitialState","getInitialState",1541760916),
Fj=new W(null,"nine","nine",-1883832396),Gj=new W(null,"opts","opts",155075701),Hj=new W(null,"num-three","num-three",1043534997),Ij=new W(null,"close-square-bracket","close-square-bracket",1583926421),Jj=new W(null,"two","two",627606869),Kj=new W(null,"context-menu","context-menu",-1002713451),Lj=new W(null,"pred-name","pred-name",-3677451),Mj=new W(null,"semicolon","semicolon",797086549),Nj=new W(null,"f12","f12",853352790),Oj=new W(null,"seven","seven",1278068278),Pj=new W(null,"editor","editor",
-989377770),Qj=new W(null,"b","b",1482224470),Rj=new W("om.core","index","om.core/index",-1724175434),Sj=new W(null,"ff-equals","ff-equals",6193142),Tj=new W(null,"shared","shared",-384145993),Uj=new W(null,"right","right",-452581833),Vj=new W(null,"editor-content","editor-content",-959857833),Wj=new W(null,"raf","raf",-1295410152),Xj=new W(null,"d","d",1972142424),Yj=new W(null,"f","f",-1597136552),Zj=new W(null,"componentDidMount","componentDidMount",955710936),ak=new W(null,"htmlFor","htmlFor",
-1050291720),bk=new W(null,"pause","pause",-2095325672),ck=new W(null,"error","error",-978969032),dk=new W(null,"backspace","backspace",-696007848),ek=new W(null,"num-four","num-four",710728568),fk=new W(null,"f7","f7",356150168),gk=new W(null,"t","t",-1397832519),hk=new W(null,"x","x",2099068185),ik=new W("om.core","invalid","om.core/invalid",1948827993),jk=new W(null,"os","os",795021913),kk=new W(null,"tag","tag",-1290361223),lk=new W(null,"period","period",-352129191),mk=new W(null,"print-screen",
"print-screen",6404025),nk=new W(null,"target","target",253001721),ok=new W(null,"getDisplayName","getDisplayName",1324429466),pk=new W(null,"f9","f9",704633338),qk=new W(null,"page-down","page-down",-392838598),rk=new W(null,"end","end",-268185958),sk=new W(null,"ff-dash","ff-dash",-526209989),uk=new W(null,"tab","tab",-559583621),Mg=new W(null,"alt-impl","alt-impl",670969595),vk=new W(null,"p?","p?",-1172161701),wk=new W(null,"failures","failures",-912916356),xk=new W(null,"f6","f6",2103080604),
yk=new W(null,"proto-pred","proto-pred",1885698716),Zg=new W(null,"keywordize-keys","keywordize-keys",1310784252),zk=new W(null,"f4","f4",990968764),Ak=new W(null,"p","p",151049309),Bk=new W(null,"six","six",-2128505347),Ck=new W(null,"componentWillMount","componentWillMount",-285327619),Dk=new W(null,"i","i",-1386841315),Ek=new W(null,"num-one","num-one",-417870851),Fk=new W("om.core","defer","om.core/defer",-1038866178),Gk=new W(null,"num-minus","num-minus",-979319330),Hk=new W(null,"a","a",-2123407586),
Ik=new W(null,"render-state","render-state",2053902270),Jk=new W(null,"backslash","backslash",1790786526),Kk=new W(null,"tx-listen","tx-listen",119130367),Lk=new W(null,"left","left",-399115937),Mk=new W("cljs.core","not-found","cljs.core/not-found",-1572889185),Nk=new W(null,"u","u",-1156634785);if("undefined"===typeof Ok){var Ok,Pk=new va(null,2,[zj,"",Pj,new va(null,2,[pi,Zc,Vj,""],null)],null);Ok=Ie?Ie(Pk):He.call(null,Pk)};var Qk;a:{var Rk=aa.navigator;if(Rk){var Sk=Rk.userAgent;if(Sk){Qk=Sk;break a}}Qk=""};function Tk(a,b){var c=function(){return React.createClass({getDisplayName:function(){return b},getInitialState:function(){return{value:this.props.value}},onChange:function(a){var b=this.props.onChange;if(null==b)return null;b.h?b.h(a):b.call(null,a);return this.setState({value:a.target.value})},componentWillReceiveProps:function(a){return this.setState({value:a.value})},render:function(){var b={};ja(b,this.props,{value:this.state.value,onChange:this.onChange,children:this.props.children});return a.h?
a.h(b):a.call(null,b)}})}();React.createFactory(c)}Tk(React.DOM.input,"input");Tk(React.DOM.textarea,"textarea");Tk(React.DOM.option,"option");function Uk(a,b){return React.render(a,b)};function Vk(a){var b=/-(\w)/,c=De.c(Wk,Wc);if("string"===typeof b)return a.replace(new RegExp(String(b).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08"),"g"),c);if(b instanceof RegExp)return a.replace(new RegExp(b.source,"g"),c);throw[w("Invalid match arg: "),w(b)].join("");}function Wk(a){return a.toUpperCase()};function Xk(a){return p(function(){var b=5>Q(a);if(b)return b;switch(a.substring(0,5)){case "data-":case "aria-":return!0;default:return!1}}())?a:Vk(a)}function Yk(a){return od(a)?Vg(Ze.c(Dd,Z.c(function(a){var c=R(a,0),d=R(a,1);a=V;a:switch(c instanceof W?c.aa:null){case "class":c=dj;break a;case "for":c=ak;break a}c=be.h(Xk(ce(c)));d=od(d)?Yk.h?Yk.h(d):Yk.call(null,d):d;return new U(null,2,5,a,[c,d],null)},a))):a};function Zk(a,b){var c=Array.prototype.slice.call(arguments),d=c.shift();if("undefined"==typeof d)throw Error("[goog.string.format] Template required");return d.replace(/%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g,function(a,b,d,k,l,n,q,r){if("%"==n)return"%";var v=c.shift();if("undefined"==typeof v)throw Error("[goog.string.format] Not enough arguments");arguments[0]=v;return Zk.ab[n].apply(null,arguments)})}Zk.ab={};
Zk.ab.s=function(a,b,c){return isNaN(c)||""==c||a.length>=c?a:a=-1<b.indexOf("-",0)?a+Array(c-a.length+1).join(" "):Array(c-a.length+1).join(" ")+a};
Zk.ab.f=function(a,b,c,d,e){d=a.toString();isNaN(e)||""==e||(d=parseFloat(a).toFixed(e));var g;g=0>a?"-":0<=b.indexOf("+")?"+":0<=b.indexOf(" ")?" ":"";0<=a&&(d=g+d);if(isNaN(c)||d.length>=c)return d;d=isNaN(e)?Math.abs(a).toString():Math.abs(a).toFixed(e);a=c-d.length-g.length;return d=0<=b.indexOf("-",0)?g+d+Array(a+1).join(" "):g+Array(a+1).join(0<=b.indexOf("0",0)?"0":" ")+d};Zk.ab.d=function(a,b,c,d,e,g,h,k){return Zk.ab.f(parseInt(a,10),b,c,d,0,g,h,k)};Zk.ab.i=Zk.ab.d;Zk.ab.u=Zk.ab.d;function $k(){return al(arguments[0],1<arguments.length?new E(Array.prototype.slice.call(arguments,1),0):null)}function al(a,b){return te(Zk,a,b)}function bl(a){var b=typeof a;return 20>Q(""+w(a))?a:wc([w("a-"),w(b)].join(""))}function cl(a,b,c,d){this.$=a;this.value=b;this.Zc=c;this.$c=d;this.w=2147483648;this.F=0}cl.prototype.M=function(a,b,c){return Pb(dl.h?dl.h(this):dl.call(null,this),b,c)};function el(a,b,c,d){return new cl(a,b,c,d)}
function dl(a){return y(y(I,function(){var b=a.Zc;return L.h?L.h(b):L.call(null,b)}()),function(){var b=a.$c;return p(b)?b:new C(null,"not","not",1044554643,null)}())}el=function(a,b,c,d){return new cl(a,b,c,d)};function fl(a,b){this.name=a;this.error=b;this.w=2147483648;this.F=0}fl.prototype.M=function(a,b,c){return Pb(gl.h?gl.h(this):gl.call(null,this),b,c)};function hl(a,b){return new fl(a,b)}function gl(a){return y(y(y(I,a.name),a.error),new C(null,"named","named",1218138048,null))}
hl=function(a,b){return new fl(a,b)};function il(a,b,c,d){this.error=a;this.C=b;this.o=c;this.v=d;this.w=2229667594;this.F=8192}f=il.prototype;f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "error":return this.error;default:return dd(this.o,b,c)}};
f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.utils.ErrorContainer{",", ","}",c,Y.c(new U(null,1,5,V,[new U(null,2,5,V,[ck,this.error],null)],null),this.o))};f.N=function(){return this.C};f.X=function(){return new il(this.error,this.C,this.o,this.v)};f.T=function(){return 1+Q(this.o)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};
f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};f.pa=function(a,b){return yd(new Ed(null,new va(null,1,[ck,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new il(this.error,this.C,ye(T.c(this.o,b)),null)};f.fa=function(a,b,c){return p(X.c?X.c(ck,b):X.call(null,ck,b))?new il(c,this.C,this.o,null):new il(this.error,this.C,S.j(this.o,b,c),null)};f.R=function(){return D(Y.c(new U(null,1,5,V,[new U(null,2,5,V,[ck,this.error],null)],null),this.o))};
f.O=function(a,b){return new il(this.error,b,this.o,this.v)};f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};function jl(a){return new il(a,null,null,null)}function kl(a){return p(a instanceof il)?a.error:null}function ll(a){return function(b,c){var d=kl(c);if(p(d))return jl(Xc.c(function(){var c=kl(b);return p(c)?c:a.h?a.h(b):a.call(null,b)}(),d));d=kl(b);return p(d)?jl(Xc.c(d,null)):Xc.c(b,c)}}function ml(a,b){a.schema$utils$schema=b}function nl(a){this.q=a}
nl.prototype.Od=function(){return this.q};nl.prototype.Ec=function(a,b){return this.q=b};var ol=new nl(!1);ol.ee=Ee(function pl(b){if(b?b.Od:b)return b.q;var c;c=pl[m(null==b?null:b)];if(!c&&(c=pl._,!c))throw u("PSimpleCell.get_cell",b);return c.call(null,b)},ol);ol.ue=Ee(function ql(b,c){if(b?b.Ec:b)return b.Ec(0,c);var d;d=ql[m(null==b?null:b)];if(!d&&(d=ql._,!d))throw u("PSimpleCell.set_cell",b);return d.call(null,b,c)},ol);var rl,sl={},ah=function ah(b){if(b?b.ta:b)return b.ta(b);var c;c=ah[m(null==b?null:b)];if(!c&&(c=ah._,!c))throw u("Schema.walker",b);return c.call(null,b)},tl=function tl(b){if(b?b.sa:b)return b.sa(b);var c;c=tl[m(null==b?null:b)];if(!c&&(c=tl._,!c))throw u("Schema.explain",b);return c.call(null,b)};function ul(){throw Error([w("Walking is unsupported outside of start-walker; "),w("all composite schemas must eagerly bind subschema-walkers "),w("outside the returned walker.")].join(""));}
function vl(a,b){var c=ul;ul=a;try{return ul.h?ul.h(b):ul.call(null,b)}finally{ul=c}}function wl(a){return De.c(kl,vl($g(),a))}sl["function"]=!0;
ah["function"]=function(a){return function(b){return function(c){var d=null==c||Da(function(){var b=a===c.constructor;return b?b:c instanceof a}())?jl(el(a,c,new Rg(function(){return function(){return y(y(y(I,bl(c)),a),new C(null,"instance?","instance?",1075939923,null))}}(b),null),null)):null;return p(d)?d:b.h?b.h(c):b.call(null,c)}}(function(){var b=a.schema$utils$schema;return p(b)?ul.h?ul.h(b):ul.call(null,b):Nd}())};tl["function"]=function(a){var b=a.schema$utils$schema;return p(b)?tl(b):a};
function xl(a,b,c,d){this.Ca=a;this.C=b;this.o=c;this.v=d;this.w=2229667594;this.F=8192}f=xl.prototype;f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "_":return this.Ca;default:return dd(this.o,b,c)}};f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.AnythingSchema{",", ","}",c,Y.c(new U(null,1,5,V,[new U(null,2,5,V,[gi,this.Ca],null)],null),this.o))};f.N=function(){return this.C};
f.X=function(){return new xl(this.Ca,this.C,this.o,this.v)};f.T=function(){return 1+Q(this.o)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};f.pa=function(a,b){return yd(new Ed(null,new va(null,1,[gi,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new xl(this.Ca,this.C,ye(T.c(this.o,b)),null)};
f.fa=function(a,b,c){return p(X.c?X.c(gi,b):X.call(null,gi,b))?new xl(c,this.C,this.o,null):new xl(this.Ca,this.C,S.j(this.o,b,c),null)};f.R=function(){return D(Y.c(new U(null,1,5,V,[new U(null,2,5,V,[gi,this.Ca],null)],null),this.o))};f.O=function(a,b){return new xl(this.Ca,b,this.o,this.v)};f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};f.wa=!0;f.ta=function(){return Nd};f.sa=function(){return new C(null,"Any","Any",1277492269,null)};var yl=new xl(null,null,null,null);
function zl(a,b,c,d){this.ea=a;this.C=b;this.o=c;this.v=d;this.w=2229667594;this.F=8192}f=zl.prototype;f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "v":return this.ea;default:return dd(this.o,b,c)}};f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.EqSchema{",", ","}",c,Y.c(new U(null,1,5,V,[new U(null,2,5,V,[Eh,this.ea],null)],null),this.o))};f.N=function(){return this.C};
f.X=function(){return new zl(this.ea,this.C,this.o,this.v)};f.T=function(){return 1+Q(this.o)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};f.pa=function(a,b){return yd(new Ed(null,new va(null,1,[Eh,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new zl(this.ea,this.C,ye(T.c(this.o,b)),null)};
f.fa=function(a,b,c){return p(X.c?X.c(Eh,b):X.call(null,Eh,b))?new zl(c,this.C,this.o,null):new zl(this.ea,this.C,S.j(this.o,b,c),null)};f.R=function(){return D(Y.c(new U(null,1,5,V,[new U(null,2,5,V,[Eh,this.ea],null)],null),this.o))};f.O=function(a,b){return new zl(this.ea,b,this.o,this.v)};f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};f.wa=!0;
f.ta=function(){var a=this;return function(b){return function(c){return K.c(a.ea,c)?c:jl(el(b,c,new Rg(function(){return function(){return y(y(y(I,bl(c)),a.ea),new C(null,"\x3d","\x3d",-1501502141,null))}}(b),null),null))}}(this)};f.sa=function(){return y(y(I,this.ea),new C(null,"eq","eq",1021992460,null))};function Al(a,b,c,d,e){this.va=a;this.Ka=b;this.C=c;this.o=d;this.v=e;this.w=2229667594;this.F=8192}f=Al.prototype;f.L=function(a,b){return A.j(this,b,null)};
f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "p?":return this.va;case "pred-name":return this.Ka;default:return dd(this.o,b,c)}};f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.Predicate{",", ","}",c,Y.c(new U(null,2,5,V,[new U(null,2,5,V,[vk,this.va],null),new U(null,2,5,V,[Lj,this.Ka],null)],null),this.o))};f.N=function(){return this.C};f.X=function(){return new Al(this.va,this.Ka,this.C,this.o,this.v)};
f.T=function(){return 2+Q(this.o)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};f.pa=function(a,b){return yd(new Ed(null,new va(null,2,[Lj,null,vk,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new Al(this.va,this.Ka,this.C,ye(T.c(this.o,b)),null)};
f.fa=function(a,b,c){return p(X.c?X.c(vk,b):X.call(null,vk,b))?new Al(c,this.Ka,this.C,this.o,null):p(X.c?X.c(Lj,b):X.call(null,Lj,b))?new Al(this.va,c,this.C,this.o,null):new Al(this.va,this.Ka,this.C,S.j(this.o,b,c),null)};f.R=function(){return D(Y.c(new U(null,2,5,V,[new U(null,2,5,V,[vk,this.va],null),new U(null,2,5,V,[Lj,this.Ka],null)],null),this.o))};f.O=function(a,b){return new Al(this.va,this.Ka,b,this.o,this.v)};f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};
f.wa=!0;f.ta=function(){var a=this;return function(b){return function(c){var d;try{d=p(a.va.h?a.va.h(c):a.va.call(null,c))?null:new C(null,"not","not",1044554643,null)}catch(e){if(e instanceof Object)d=new C(null,"throws?","throws?",789734533,null);else throw e;}return p(d)?jl(el(b,c,new Rg(function(){return function(){return y(y(I,bl(c)),a.Ka)}}(d,d,b),null),d)):c}}(this)};
f.sa=function(){return K.c(this.va,xd)?new C(null,"Int","Int",-2116888740,null):K.c(this.va,ae)?new C(null,"Keyword","Keyword",-850065993,null):K.c(this.va,tc)?new C(null,"Symbol","Symbol",716452869,null):K.c(this.va,Ea)?new C(null,"Str","Str",907970895,null):y(y(I,this.Ka),new C(null,"pred","pred",-727012372,null))};function Bl(a,b){if(!wd(a))throw Error(al("Not a function: %s",Rc([a],0)));return new Al(a,b,null,null,null)}
function Cl(a,b,c,d){this.p=a;this.C=b;this.o=c;this.v=d;this.w=2229667594;this.F=8192}f=Cl.prototype;f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "p":return this.p;default:return dd(this.o,b,c)}};f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.Protocol{",", ","}",c,Y.c(new U(null,1,5,V,[new U(null,2,5,V,[Ak,this.p],null)],null),this.o))};f.N=function(){return this.C};
f.X=function(){return new Cl(this.p,this.C,this.o,this.v)};f.T=function(){return 1+Q(this.o)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};f.pa=function(a,b){return yd(new Ed(null,new va(null,1,[Ak,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new Cl(this.p,this.C,ye(T.c(this.o,b)),null)};
f.fa=function(a,b,c){return p(X.c?X.c(Ak,b):X.call(null,Ak,b))?new Cl(c,this.C,this.o,null):new Cl(this.p,this.C,S.j(this.o,b,c),null)};f.R=function(){return D(Y.c(new U(null,1,5,V,[new U(null,2,5,V,[Ak,this.p],null)],null),this.o))};f.O=function(a,b){return new Cl(this.p,b,this.o,this.v)};f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};f.wa=!0;
f.ta=function(){return function(a){return function(b){return p(yk.h(id(a)).call(null,b))?b:jl(el(a,b,new Rg(function(a){return function(){return y(y(y(I,bl(b)),ui.h(id(a))),new C(null,"satisfies?","satisfies?",-433227199,null))}}(a),null),null))}}(this)};f.sa=function(){return y(y(I,ui.h(id(this))),new C(null,"protocol","protocol",-2001965651,null))};RegExp.prototype.wa=!0;
RegExp.prototype.ta=function(){return function(a){return function(b){return"string"!==typeof b?jl(el(a,b,new Rg(function(){return function(){return y(y(I,bl(b)),new C(null,"string?","string?",-1129175764,null))}}(a),null),null)):Da(Dg(a,b))?jl(el(a,b,new Rg(function(a){return function(){return y(y(y(I,bl(b)),tl(a)),new C(null,"re-find","re-find",1143444147,null))}}(a),null),null)):b}}(this)};RegExp.prototype.sa=function(){return wc([w('#"'),w((""+w(this)).slice(1,-1)),w('"')].join(""))};Bl(Ea,Ea);
var Dl=Boolean;Bl(xd,new C(null,"integer?","integer?",1303791671,null));var El=Bl(ae,new C(null,"keyword?","keyword?",1917797069,null));Bl(tc,new C(null,"symbol?","symbol?",1820680511,null));
"undefined"===typeof rl&&(rl=function(a){this.kd=a;this.w=393216;this.F=0},f=rl.prototype,f.O=function(a,b){return new rl(b)},f.N=function(){return this.kd},f.wa=!0,f.ta=function(){return function(a){return function(b){return b instanceof RegExp?b:jl(el(a,b,new Rg(function(){return function(){return y(y(y(I,bl(b)),new C("js","RegExp","js/RegExp",1778210562,null)),new C(null,"instance?","instance?",1075939923,null))}}(a),null),null))}}(this)},f.sa=function(){return new C(null,"Regex","Regex",205914413,
null)},rl.Hb=function(){return new U(null,1,5,V,[new C(null,"meta48641","meta48641",-742084075,null)],null)},rl.pb=!0,rl.ob="schema.core/t48640",rl.Bb=function(a,b){return Nb(b,"schema.core/t48640")});function Fl(a,b,c,d){this.$=a;this.C=b;this.o=c;this.v=d;this.w=2229667594;this.F=8192}f=Fl.prototype;f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "schema":return this.$;default:return dd(this.o,b,c)}};
f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.Maybe{",", ","}",c,Y.c(new U(null,1,5,V,[new U(null,2,5,V,[oh,this.$],null)],null),this.o))};f.N=function(){return this.C};f.X=function(){return new Fl(this.$,this.C,this.o,this.v)};f.T=function(){return 1+Q(this.o)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};
f.pa=function(a,b){return yd(new Ed(null,new va(null,1,[oh,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new Fl(this.$,this.C,ye(T.c(this.o,b)),null)};f.fa=function(a,b,c){return p(X.c?X.c(oh,b):X.call(null,oh,b))?new Fl(c,this.C,this.o,null):new Fl(this.$,this.C,S.j(this.o,b,c),null)};f.R=function(){return D(Y.c(new U(null,1,5,V,[new U(null,2,5,V,[oh,this.$],null)],null),this.o))};f.O=function(a,b){return new Fl(this.$,b,this.o,this.v)};
f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};f.wa=!0;f.ta=function(){return function(a){return function(b){return null==b?null:a.h?a.h(b):a.call(null,b)}}(ul.h?ul.h(this.$):ul.call(null,this.$),this)};f.sa=function(){return y(y(I,tl(this.$)),new C(null,"maybe","maybe",1326133967,null))};function Gl(a,b,c,d){this.ja=a;this.C=b;this.o=c;this.v=d;this.w=2229667594;this.F=8192}f=Gl.prototype;f.L=function(a,b){return A.j(this,b,null)};
f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "schemas":return this.ja;default:return dd(this.o,b,c)}};f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.Either{",", ","}",c,Y.c(new U(null,1,5,V,[new U(null,2,5,V,[wj,this.ja],null)],null),this.o))};f.N=function(){return this.C};f.X=function(){return new Gl(this.ja,this.C,this.o,this.v)};f.T=function(){return 1+Q(this.o)};
f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};f.pa=function(a,b){return yd(new Ed(null,new va(null,1,[wj,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new Gl(this.ja,this.C,ye(T.c(this.o,b)),null)};f.fa=function(a,b,c){return p(X.c?X.c(wj,b):X.call(null,wj,b))?new Gl(c,this.C,this.o,null):new Gl(this.ja,this.C,S.j(this.o,b,c),null)};
f.R=function(){return D(Y.c(new U(null,1,5,V,[new U(null,2,5,V,[wj,this.ja],null)],null),this.o))};f.O=function(a,b){return new Gl(this.ja,b,this.o,this.v)};f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};f.wa=!0;
f.ta=function(){return function(a,b){return function(c){for(var d=D(a);;){if(Da(d))return jl(el(b,c,new Rg(function(){return function(){return y(y(y(I,new C(null,"schemas","schemas",-2079365190,null)),y(y(y(I,bl(c)),new C(null,"%","%",-950237169,null)),new C(null,"check","check",-1428126865,null))),new C(null,"some","some",-310548046,null))}}(d,a,b),null),null));var e=H(d).call(null,c);if(Da(e instanceof il))return e;d=J(d)}}}($e.c(ul,this.ja),this)};
f.sa=function(){return M(new C(null,"either","either",-2144373018,null),Z.c(tl,this.ja))};function Hl(a){return new Gl(a,null,null,null)}function Il(a,b,c,d){this.ja=a;this.C=b;this.o=c;this.v=d;this.w=2229667594;this.F=8192}f=Il.prototype;f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "schemas":return this.ja;default:return dd(this.o,b,c)}};
f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.Both{",", ","}",c,Y.c(new U(null,1,5,V,[new U(null,2,5,V,[wj,this.ja],null)],null),this.o))};f.N=function(){return this.C};f.X=function(){return new Il(this.ja,this.C,this.o,this.v)};f.T=function(){return 1+Q(this.o)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};
f.pa=function(a,b){return yd(new Ed(null,new va(null,1,[wj,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new Il(this.ja,this.C,ye(T.c(this.o,b)),null)};f.fa=function(a,b,c){return p(X.c?X.c(wj,b):X.call(null,wj,b))?new Il(c,this.C,this.o,null):new Il(this.ja,this.C,S.j(this.o,b,c),null)};f.R=function(){return D(Y.c(new U(null,1,5,V,[new U(null,2,5,V,[wj,this.ja],null)],null),this.o))};f.O=function(a,b){return new Il(this.ja,b,this.o,this.v)};
f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};f.wa=!0;f.ta=function(){return function(a,b){return function(c){return Pa(function(){return function(a,b){return p(a instanceof il)?a:b.h?b.h(a):b.call(null,a)}}(a,b),c,a)}}($e.c(ul,this.ja),this)};f.sa=function(){return M(new C(null,"both","both",1246882687,null),Z.c(tl,this.ja))};function Jl(a){return a instanceof W||!1}function Kl(a,b,c,d){this.k=a;this.C=b;this.o=c;this.v=d;this.w=2229667594;this.F=8192}f=Kl.prototype;
f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "k":return this.k;default:return dd(this.o,b,c)}};f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.OptionalKey{",", ","}",c,Y.c(new U(null,1,5,V,[new U(null,2,5,V,[gj,this.k],null)],null),this.o))};f.N=function(){return this.C};f.X=function(){return new Kl(this.k,this.C,this.o,this.v)};f.T=function(){return 1+Q(this.o)};
f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};f.pa=function(a,b){return yd(new Ed(null,new va(null,1,[gj,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new Kl(this.k,this.C,ye(T.c(this.o,b)),null)};f.fa=function(a,b,c){return p(X.c?X.c(gj,b):X.call(null,gj,b))?new Kl(c,this.C,this.o,null):new Kl(this.k,this.C,S.j(this.o,b,c),null)};
f.R=function(){return D(Y.c(new U(null,1,5,V,[new U(null,2,5,V,[gj,this.k],null)],null),this.o))};f.O=function(a,b){return new Kl(this.k,b,this.o,this.v)};f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};function Ll(a){return new Kl(a,null,null,null)}function Ml(a){return a instanceof Kl}function Nl(a){if(a instanceof W)return a;if(p(Ml(a)))return a.k;throw Error(al("Bad explicit key: %s",Rc([a],0)));}function Ol(a){var b=Jl(a);return p(b)?b:Ml(a)}
function Pl(a){return p(Ol(a))?a instanceof W?a:y(y(I,Nl(a)),p(Jl(a))?new C(null,"required-key","required-key",1624616412,null):p(Ml(a))?new C(null,"optional-key","optional-key",988406145,null):null):tl(a)}function Ql(a,b,c,d,e){this.xa=a;this.Ha=b;this.C=c;this.o=d;this.v=e;this.w=2229667594;this.F=8192}f=Ql.prototype;f.L=function(a,b){return A.j(this,b,null)};
f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "kspec":return this.xa;case "val-schema":return this.Ha;default:return dd(this.o,b,c)}};f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.MapEntry{",", ","}",c,Y.c(new U(null,2,5,V,[new U(null,2,5,V,[hi,this.xa],null),new U(null,2,5,V,[Oi,this.Ha],null)],null),this.o))};f.N=function(){return this.C};f.X=function(){return new Ql(this.xa,this.Ha,this.C,this.o,this.v)};
f.T=function(){return 2+Q(this.o)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};f.pa=function(a,b){return yd(new Ed(null,new va(null,2,[hi,null,Oi,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new Ql(this.xa,this.Ha,this.C,ye(T.c(this.o,b)),null)};
f.fa=function(a,b,c){return p(X.c?X.c(hi,b):X.call(null,hi,b))?new Ql(c,this.Ha,this.C,this.o,null):p(X.c?X.c(Oi,b):X.call(null,Oi,b))?new Ql(this.xa,c,this.C,this.o,null):new Ql(this.xa,this.Ha,this.C,S.j(this.o,b,c),null)};f.R=function(){return D(Y.c(new U(null,2,5,V,[new U(null,2,5,V,[hi,this.xa],null),new U(null,2,5,V,[Oi,this.Ha],null)],null),this.o))};f.O=function(a,b){return new Ql(this.xa,this.Ha,b,this.o,this.v)};f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};
f.wa=!0;
f.ta=function(){var a=ul.h?ul.h(this.Ha):ul.call(null,this.Ha);if(p(Ol(this.xa))){var b=Ml(this.xa),c=Nl(this.xa);return function(a,b,c,h){return function(k){if(Ri===k)return p(a)?null:jl(new U(null,2,5,V,[b,new C(null,"missing-required-key","missing-required-key",709961446,null)],null));if(K.c(2,Q(k))){var l=R(k,0),n=R(k,1),n=c.h?c.h(n):c.call(null,n),q=kl(n);return p(q)?jl(new U(null,2,5,V,[l,q],null)):new U(null,2,5,V,[l,n],null)}return jl(el(h,k,new Rg(function(){return function(){return y(y(y(I,y(y(I,
bl(k)),new C(null,"count","count",-514511684,null))),2),K)}}(a,b,c,h),null),null))}}(b,c,a,this)}return function(a,b,c){return function(h){if(K.c(2,Q(h))){var k=function(){var b=ob(h);return a.h?a.h(b):a.call(null,b)}(),l=kl(k),n=function(){var a=pb(h);return b.h?b.h(a):b.call(null,a)}(),q=kl(n);return p(p(l)?l:q)?jl(new U(null,2,5,V,[p(l)?l:ob(h),p(q)?q:new C(null,"invalid-key","invalid-key",-1461682245,null)],null)):new U(null,2,5,V,[k,n],null)}return jl(el(c,h,new Rg(function(){return function(){return y(y(y(I,
y(y(I,bl(h)),new C(null,"count","count",-514511684,null))),2),K)}}(a,b,c),null),null))}}(ul.h?ul.h(this.xa):ul.call(null,this.xa),a,this)};f.sa=function(){return y(y(y(I,tl(this.Ha)),Pl(this.xa)),new C(null,"map-entry","map-entry",329617471,null))};function Rl(a,b){return new Ql(a,b,null,null,null)}function Sl(a){a=We.c(Ol,Mf(a));if(!(2>Q(a)))throw Error(al("More than one non-optional/required key schemata: %s",Rc([uf(a)],0)));return H(a)}
function Tl(a,b){var c;c=a?a.w&67108864||a.Yd?!0:a.w?!1:t(Ib,a):t(Ib,a);return p(p(c)?Da(b instanceof il):c)?Ze.c(a,b):b}
function Ul(a){var b=Sl(a),c=p(b)?ul.h?ul.h(se(Rl,zd(a,b))):ul.call(null,se(Rl,zd(a,b))):null,d=T.c(a,b),e=Ze.c(Dd,function(){return function(a,b,c){return function q(d){return new de(null,function(){return function(){for(;;){var a=D(d);if(a){if(qd(a)){var b=Zb(a),c=Q(b),e=ie(c);a:for(var g=0;;)if(g<c){var h=z.c(b,g),k=R(h,0),h=R(h,1),k=new U(null,2,5,V,[Nl(k),ul.h?ul.h(Rl(k,h)):ul.call(null,Rl(k,h))],null);e.add(k);g+=1}else{b=!0;break a}return b?ke(e.U(),q(bc(a))):ke(e.U(),null)}b=H(a);e=R(b,0);
b=R(b,1);return M(new U(null,2,5,V,[Nl(e),ul.h?ul.h(Rl(e,b)):ul.call(null,Rl(e,b))],null),q(xc(a)))}return null}}}(a,b,c),null,null)}}(b,c,d)(d)}()),g=ll(Ce());if(!K.c(Q(d),Q(e)))throw Error(al("Schema has multiple variants of the same explicit key: %s",Rc([$e.c(Pl,se(Y,Ve.c(function(){return function(a){return 1<Q(a)}}(b,c,d,e,g),Nf(bh(Nl,Mf(d))))))],0)));return function(b,c,d,e,g){return function(r){return od(r)?Tl(r,function(){for(var a=Fd,x=D(e),B=Dd;;){if(Da(x))return Pa(p(c)?function(a,b,c,
d,e,g,h,k){return function(a,b){var c=e.h?e.h(b):e.call(null,b);return k.c?k.c(a,c):k.call(null,a,c)}}(a,x,B,b,c,d,e,g):function(a,b,c,d,e,g,h,k){return function(a,b){var c=R(b,0);R(b,1);c=jl(new U(null,2,5,V,[c,new C(null,"disallowed-key","disallowed-key",-1877785633,null)],null));return k.c?k.c(a,c):k.call(null,a,c)}}(a,x,B,b,c,d,e,g),B,We.c(function(a){return function(b){var c=R(b,0);R(b,1);return a.h?a.h(c):a.call(null,c)}}(a,x,B,b,c,d,e,g),r));var F=H(x),G=R(F,0),N=R(F,1),a=Xc.c(a,G),x=J(x),
B=F=function(){var a=B,b;b=zd(r,G);b=p(b)?b:Ri;b=N.h?N.h(b):N.call(null,b);return g.c?g.c(a,b):g.call(null,a,b)}()}}()):jl(el(a,r,new Rg(function(){return function(){return y(y(I,bl(r)),new C(null,"map?","map?",-1780568534,null))}}(b,c,d,e,g),null),null))}}(b,c,d,e,g)}
function Vl(a){return Ze.c(Dd,function(){return function c(a){return new de(null,function(){for(;;){var e=D(a);if(e){if(qd(e)){var g=Zb(e),h=Q(g),k=ie(h);a:for(var l=0;;)if(l<h){var n=z.c(g,l),q=R(n,0),n=R(n,1),q=uf(J(tl(Rl(q,n))));k.add(q);l+=1}else{g=!0;break a}return g?ke(k.U(),c(bc(e))):ke(k.U(),null)}g=H(e);k=R(g,0);g=R(g,1);return M(uf(J(tl(Rl(k,g)))),c(xc(e)))}return null}},null,null)}(a)}())}va.prototype.wa=!0;va.prototype.ta=function(){return Ul(this)};va.prototype.sa=function(){return Vl(this)};
ng.prototype.wa=!0;ng.prototype.ta=function(){return Ul(this)};ng.prototype.sa=function(){return Vl(this)};Ed.prototype.wa=!0;
Ed.prototype.ta=function(){if(!K.c(Q(this),1))throw Error($k("Set schema must have exactly one element"));return function(a,b){return function(c){var d=md(c)?null:jl(el(b,c,new Rg(function(){return function(){return y(y(I,bl(c)),new C(null,"set?","set?",1636014792,null))}}(a,b),null),null));if(p(d))return d;var e=Bg(We,Fe).call(null,kl,Z.c(a,c)),d=R(e,0),e=R(e,1);return D(e)?jl(wg(e)):wg(d)}}(ul.h?ul.h(H(this)):ul.call(null,H(this)),this)};
Ed.prototype.sa=function(){return wg(new U(null,1,5,V,[tl(H(this))],null))};function Wl(a,b,c,d,e,g){this.$=a;this.za=b;this.name=c;this.C=d;this.o=e;this.v=g;this.w=2229667594;this.F=8192}f=Wl.prototype;f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "schema":return this.$;case "optional?":return this.za;case "name":return this.name;default:return dd(this.o,b,c)}};
f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.One{",", ","}",c,Y.c(new U(null,3,5,V,[new U(null,2,5,V,[oh,this.$],null),new U(null,2,5,V,[kj,this.za],null),new U(null,2,5,V,[ji,this.name],null)],null),this.o))};f.N=function(){return this.C};f.X=function(){return new Wl(this.$,this.za,this.name,this.C,this.o,this.v)};f.T=function(){return 3+Q(this.o)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};
f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};f.pa=function(a,b){return yd(new Ed(null,new va(null,3,[oh,null,ji,null,kj,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new Wl(this.$,this.za,this.name,this.C,ye(T.c(this.o,b)),null)};
f.fa=function(a,b,c){return p(X.c?X.c(oh,b):X.call(null,oh,b))?new Wl(c,this.za,this.name,this.C,this.o,null):p(X.c?X.c(kj,b):X.call(null,kj,b))?new Wl(this.$,c,this.name,this.C,this.o,null):p(X.c?X.c(ji,b):X.call(null,ji,b))?new Wl(this.$,this.za,c,this.C,this.o,null):new Wl(this.$,this.za,this.name,this.C,S.j(this.o,b,c),null)};f.R=function(){return D(Y.c(new U(null,3,5,V,[new U(null,2,5,V,[oh,this.$],null),new U(null,2,5,V,[kj,this.za],null),new U(null,2,5,V,[ji,this.name],null)],null),this.o))};
f.O=function(a,b){return new Wl(this.$,this.za,this.name,b,this.o,this.v)};f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};function Xl(a,b){return new Wl(a,!1,b,null,null,null)}
function Yl(a){var b=Ag(function(a){return a instanceof Wl&&Da(kj.h(a))},a),c=R(b,0),d=R(b,1),e=Ag(function(){return function(a){var b=a instanceof Wl;return b?kj.h(a):b}}(b,c,d),d),g=R(e,0),h=R(e,1);if(!(1>=Q(h)&&ze(function(){return function(a){return!(a instanceof Wl)}}(b,c,d,e,g,h),h)))throw Error(al("Sequence schema %s does not match [one* optional* rest-schema?]",Rc([a],0)));return new U(null,2,5,V,[Y.c(c,g),H(h)],null)}U.prototype.wa=!0;
U.prototype.ta=function(){var a=this,b=Yl(a),c=R(b,0),d=R(b,1),e=uf(function(){return function(a,b,c,d){return function r(e){return new de(null,function(){return function(){for(;;){var a=D(e);if(a){if(qd(a)){var b=Zb(a),c=Q(b),d=ie(c);a:for(var g=0;;)if(g<c){var h=z.c(b,g),h=new U(null,2,5,V,[h,ul.h?ul.h(h.$):ul.call(null,h.$)],null);d.add(h);g+=1}else{b=!0;break a}return b?ke(d.U(),r(bc(a))):ke(d.U(),null)}d=H(a);return M(new U(null,2,5,V,[d,ul.h?ul.h(d.$):ul.call(null,d.$)],null),r(xc(a)))}return null}}}(a,
b,c,d),null,null)}}(b,c,d,a)(c)}()),g=p(d)?ul.h?ul.h(d):ul.call(null,d):null;return function(a,b,c,d,e,g,v){return function(x){var B=null==x||nd(x)?null:jl(el(v,x,new Rg(function(){return function(){return y(y(I,bl(x)),new C(null,"sequential?","sequential?",1102351463,null))}}(a,b,c,d,e,g,v),null),null));if(p(B))return B;for(var F=d,G=x,N=Zc;;){var P=H(F);if(p(P)){var ka=P,Na=R(ka,0),jb=R(ka,1);if(kd(G)){if(p(Na.za))return N;var O=N,B=jl(el(uf(Z.c(H,F)),null,new Rg(function(a,b,c,d,e,g,h,k,l,n,q,
r,v,x,B,F){return function(){return oe(new C(null,"present?","present?",-1810613791,null),function(){return function(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F){return function tk(N){return new de(null,function(){return function(){for(;;){var a=D(N);if(a){if(qd(a)){var b=Zb(a),c=Q(b),d=ie(c);a:for(var e=0;;)if(e<c){var g=z.c(b,e),g=R(g,0);if(Da(g.za))d.add(g.name),e+=1;else{b=null;break a}}else{b=!0;break a}return b?ke(d.U(),tk(bc(a))):ke(d.U(),null)}d=H(a);d=R(d,0);return Da(d.za)?M(d.name,tk(xc(a))):null}return null}}}(a,
b,c,d,e,g,h,k,l,n,q,r,v,x,B,F),null,null)}}(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F)(a)}())}}(F,G,N,O,ka,Na,jb,P,B,a,b,c,d,e,g,v),null),null));return g.c?g.c(O,B):g.call(null,O,B)}F=J(F);P=xc(G);O=function(){var a=N,b=Na.name,c;c=H(G);c=jb.h?jb.h(c):jb.call(null,c);var d=kl(c),b=p(d)?new il(hl(b,d),null,null,null):c;return g.c?g.c(a,b):g.call(null,a,b)}();G=P;N=O}else return p(c)?Pa(g,N,Z.c(e,G)):D(G)?(O=N,B=jl(el(null,G,new Rg(function(a,b){return function(){return y(y(I,Q(b)),new C(null,"has-extra-elts?",
"has-extra-elts?",-1376562869,null))}}(F,G,N,O,P,B,a,b,c,d,e,g,v),null),null)),g.c?g.c(O,B):g.call(null,O,B)):N}}}(b,c,d,e,g,ll(function(){return function(a){a=Q(a);return uf(Pe(a,Se(null)))}}(b,c,d,e,g,a)),a)};
U.prototype.sa=function(){var a=this,b=Yl(a),c=R(b,0),d=R(b,1);return uf(Y.c(function(){return function(a,b,c,d){return function n(q){return new de(null,function(){return function(){for(;;){var a=D(q);if(a){if(qd(a)){var b=Zb(a),c=Q(b),d=ie(c);a:for(var e=0;;)if(e<c){var g=z.c(b,e),g=y(y(y(I,ji.h(g)),tl(oh.h(g))),p(g.za)?new C(null,"optional","optional",-600484260,null):new C(null,"one","one",-1719427865,null));d.add(g);e+=1}else{b=!0;break a}return b?ke(d.U(),n(bc(a))):ke(d.U(),null)}d=H(a);return M(y(y(y(I,
ji.h(d)),tl(oh.h(d))),p(d.za)?new C(null,"optional","optional",-600484260,null):new C(null,"one","one",-1719427865,null)),n(xc(a)))}return null}}}(a,b,c,d),null,null)}}(b,c,d,a)(c)}(),p(d)?new U(null,1,5,V,[tl(d)],null):null))};function Zl(a){a=Ag(function(a){return a instanceof Wl},a);var b=R(a,0),c=R(a,1);return Y.c(Z.c(function(){return function(a){return tl(a.$)}}(a,b,c),b),D(c)?new U(null,2,5,V,[new C(null,"\x26","\x26",-2144855648,null),$e.c(tl,c)],null):null)}
function $l(a,b,c,d,e){this.Ja=a;this.Fa=b;this.C=c;this.o=d;this.v=e;this.w=2229667594;this.F=8192}f=$l.prototype;f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){switch(b instanceof W?b.aa:null){case "output-schema":return this.Ja;case "input-schemas":return this.Fa;default:return dd(this.o,b,c)}};
f.M=function(a,b,c){return Eg(b,function(){return function(a){return Eg(b,Kg,""," ","",c,a)}}(this),"#schema.core.FnSchema{",", ","}",c,Y.c(new U(null,2,5,V,[new U(null,2,5,V,[oi,this.Ja],null),new U(null,2,5,V,[yi,this.Fa],null)],null),this.o))};f.N=function(){return this.C};f.X=function(){return new $l(this.Ja,this.Fa,this.C,this.o,this.v)};f.T=function(){return 2+Q(this.o)};f.P=function(){var a=this.v;return null!=a?a:this.v=a=Sd(this)};
f.D=function(a,b){var c;c=p(b)?(c=this.constructor===b.constructor)?Ff(this,b):c:b;return p(c)?!0:!1};f.pa=function(a,b){return yd(new Ed(null,new va(null,2,[oi,null,yi,null],null),null),b)?T.c(Sc(Ze.c(Dd,this),this.C),b):new $l(this.Ja,this.Fa,this.C,ye(T.c(this.o,b)),null)};f.fa=function(a,b,c){return p(X.c?X.c(oi,b):X.call(null,oi,b))?new $l(c,this.Fa,this.C,this.o,null):p(X.c?X.c(yi,b):X.call(null,yi,b))?new $l(this.Ja,c,this.C,this.o,null):new $l(this.Ja,this.Fa,this.C,S.j(this.o,b,c),null)};
f.R=function(){return D(Y.c(new U(null,2,5,V,[new U(null,2,5,V,[oi,this.Ja],null),new U(null,2,5,V,[yi,this.Fa],null)],null),this.o))};f.O=function(a,b){return new $l(this.Ja,this.Fa,b,this.o,this.v)};f.S=function(a,b){return pd(b)?kb(this,z.c(b,0),z.c(b,1)):Pa(y,this,b)};f.wa=!0;f.ta=function(){return function(a){return function(b){return wd(b)?b:jl(el(a,b,new Rg(function(){return function(){return y(y(I,bl(b)),new C(null,"ifn?","ifn?",-2106461064,null))}}(a),null),null))}}(this)};
f.sa=function(){var a;if(1<Q(this.Fa)){a=new C(null,"\x3d\x3e*","\x3d\x3e*",1909690043,null);var b=tl(this.Ja),c=Z.c(Zl,this.Fa)}else a=new C(null,"\x3d\x3e","\x3d\x3e",-813269641,null),b=tl(this.Ja),c=Zl(H(this.Fa));return a=M(a,M(b,c))};function am(a){if(D(a)){var b;a:for(b=a;;){var c=J(b);if(null!=c)b=c;else{b=H(b);break a}}a=b instanceof Wl?Q(a):Number.MAX_VALUE}else a=0;return a}
function bm(a,b){if(!D(b))throw Error($k("Function must have at least one input schema"));if(!ze(pd,b))throw Error($k("Each arity must be a vector."));if(!p(se(Ad,Z.c(am,b))))throw Error($k("Arities must be distinct"));return new $l(a,Ld.c(am,b),null,null,null)};var cm=Sc(new Cl(sl,null,null,null),new va(null,2,[ui,new C("s","Schema","s/Schema",-1305723789,null),yk,function(a){return a?p(p(null)?null:a.wa)?!0:a.Y?!1:t(sl,a):t(sl,a)}],null)),dm=new Qf([Hl(Rc([new zl(El,null,null,null),Kl,El],0)),cm]),em=new U(null,2,5,V,[Xl(dm,new C(null,"input","input",-2097503808,null)),Xl(cm,new C(null,"output","output",534662484,null))],null),fm=new Qf([Hl(Rc([Kl,El],0)),cm]),gm=new Qf([El,cm]),hm=new U(null,2,5,V,[Xl(fm,new C(null,"input","input",-2097503808,null)),Xl(gm,
new C(null,"output","output",534662484,null))],null);function im(a){return a instanceof va||a instanceof ng}function jm(a){return p(Ol(a))?new U(null,2,5,V,[Nl(a),Jl(a)],null):nd(a)&&!pd(a)&&K.c(Q(a),2)&&K.c(H(a),new C("schema.core","optional-key","schema.core/optional-key",-170069547,null))?new U(null,2,5,V,[Wc(a),!1],null):null}
ml(jm,bm(new Fl(new U(null,2,5,V,[Xl(El,"k"),Xl(Dl,"optional?")],null),null,null,null),new U(null,1,5,V,[new U(null,1,5,V,[Xl(yl,new C(null,"k","k",-505765866,null))],null)],null)));var km=new Qf([El,Dl]);ml(function(a){return Ze.c(Dd,Fe.c(jm,Mf(a)))},bm(km,new U(null,1,5,V,[new U(null,1,5,V,[Xl(yl,new C(null,"s","s",-948495851,null))],null)],null)));
var lm=new U(null,2,5,V,[Xl(new U(null,1,5,V,[El],null),new C(null,"required","required",-846788763,null)),Xl(new U(null,1,5,V,[El],null),new C(null,"optional","optional",-600484260,null))],null),mm=new U(null,1,5,V,[Xl(new Qf([El,Dl]),new C(null,"s","s",-948495851,null))],null);ml(function(a){return $e.c(Ee($e,Td),Bg(Ve,We).call(null,Vd,a))},bm(lm,new U(null,1,5,V,[mm],null)));
function nm(a,b,c,d){return Ze.c(Dd,Nf(Pa(function(d,g){var h=R(g,0),k=R(g,1),l=a.h?a.h(h):a.call(null,h),n=cd(d,l);if(p(n)){var q=R(n,0),n=R(n,1);return S.j(d,l,new U(null,2,5,V,[b.c?b.c(q,h):b.call(null,q,h),c.c?c.c(n,k):c.call(null,n,k)],null))}return S.j(d,l,new U(null,2,5,V,[h,k],null))},Dd,se(Y,d))))}
var om=new U(null,2,5,V,[Xl(dm,new C(null,"i1","i1",-572470430,null)),Xl(dm,new C(null,"i2","i2",850408895,null))],null),pm=function(a,b){return function d(e,g){return nm(function(){return function(a){return p(Ol(a))?Nl(a):zi}}(a,b),function(){return function(a,b){if(p(Jl(a)))return a;if(p(Jl(b)))return b;if(p(Ml(a))||K.c(a,b))return a;throw Error($k("Only one extra schema allowed"));}}(a,b),function(){return function(a,b){var e=im(a);p(p(e)?im(b):e)?e=d(a,b):K.c(a,b)?e=a:K.c(a,yl)?e=b:K.c(b,yl)?
e=a:(e=Rc([a,b],0),e=new Il(e,null,null,null));return e}}(a,b),Rc([e,g],0))}}(dm,om);ml(pm,bm(dm,new U(null,1,5,V,[om],null)));var qm=new U(null,1,5,V,[El],null),rm=new U(null,1,5,V,[Xl(dm,new C(null,"input-schema","input-schema",1373647181,null))],null);ml(function(a,b){return function(c){return Fe.c(function(){return function(a){return p(Jl(a))?Nl(a):null}}(a,b),Mf(c))}}(qm,rm),bm(qm,new U(null,1,5,V,[rm],null)));
var sm=function sm(b,c){return Da(im(b))?null:Da(im(c))?jl(el(b,c,new Rg(function(){return y(y(I,tl(c)),new C(null,"map?","map?",-1780568534,null))},null),null)):ye(Ze.c(Dd,function(){return function e(b){return new de(null,function(){for(var h=b;;)if(h=D(h)){if(qd(h)){var k=Zb(h),l=Q(k),n=ie(l);return function(){for(var b=0;;)if(b<l){var e=z.c(k,b),g=R(e,0),e=R(e,1);if(p(Ol(g))){var h=Jl(g),q=Nl(g),r=yd(c,q);p(p(h)?h:r)&&(e=r?sm(e,cd(c,q)):new C(null,"missing-required-key","missing-required-key",
709961446,null),p(e)&&n.add(new U(null,2,5,V,[g,e],null)))}b+=1}else return!0}()?ke(n.U(),e(bc(h))):ke(n.U(),null)}var q=H(h),r=R(q,0),q=R(q,1);if(p(Ol(r))){var v=Jl(r),x=Nl(r),B=yd(c,x);if(p(function(){var b=v;return p(b)?b:B}())&&(q=B?sm(q,cd(c,x)):new C(null,"missing-required-key","missing-required-key",709961446,null),p(q)))return M(new U(null,2,5,V,[r,q],null),e(xc(h)))}h=xc(h)}else return null},null,null)}(b)}()))};
function tm(a,b){var c=sm(a,b);if(p(c))throw dh(""+w(c),new va(null,2,[ck,ii,wk,c],null));}var um=new U(null,2,5,V,[Xl(em,new C(null,"arg0","arg0",-1024593414,null)),Xl(new U(null,2,5,V,[Xl(dm,new C(null,"input","input",-2097503808,null)),Xl(gm,new C(null,"output","output",534662484,null))],null),new C(null,"arg1","arg1",-1702536411,null))],null),vm=wl(um),wm=wl(yl);
ml(function(a,b,c,d,e){return function(a,h){var k=new U(null,2,5,V,[a,h],null),l=d.h?d.h(k):d.call(null,k);if(p(l))throw dh(al("Input to %s does not match schema: %s",Rc([new C(null,"compose-schemata","compose-schemata",918607729,null),Og(Rc([l],0))],0)),new va(null,4,[Ii,Mh,oh,c,ri,k,ck,l],null));a:for(R(a,0),R(a,1),R(h,0),R(h,1);;){var l=a,k=R(l,0),l=R(l,1),n=h,q=R(n,0),n=R(n,1),r;b:{r=k;for(var v=Mf(n),x=Dd,v=D(v);;)if(v)var B=H(v),F=dd(r,B,Mk),x=xe(F,Mk)?S.j(x,B,F):x,v=J(v);else{r=Sc(x,id(r));
break b}}tm(r,n);k=new U(null,2,5,V,[pm(te(T,k,Y.c(Mf(n),Z.c(Ll,Mf(n)))),q),l],null);break a}l=e.h?e.h(k):e.call(null,k);if(p(l))throw dh(al("Output of %s does not match schema: %s",Rc([new C(null,"compose-schemata","compose-schemata",918607729,null),Og(Rc([l],0))],0)),new va(null,4,[Ii,Mh,oh,b,ri,k,ck,l],null));return k}}(ol,yl,um,vm,wm),bm(yl,new U(null,1,5,V,[um],null)));function xm(a,b){return yd(a,b)?b:yd(a,Ll(b))?Ll(b):null}
var ym=new U(null,2,5,V,[Xl(dm,new C(null,"s","s",-948495851,null)),Xl(new U(null,1,5,V,[El],null),new C(null,"ks","ks",-754231827,null))],null),zm=function(a,b){return function(c,d){return function(a,b,d){return function l(n){return new de(null,function(a,b,d){return function(){for(;;){var e=D(n);if(e){var g=e;if(qd(g)){var h=Zb(g),G=Q(h),N=ie(G);return function(){for(var l=0;;)if(l<G){var n=z.c(h,l);le(N,Ze.c(Dd,function(){return function(a,b,c,d,e,g,h,l,n,q){return function Xa(r){return new de(null,
function(a,b,c,d,e,g,h,l){return function(){for(var a=r;;)if(a=D(a)){if(qd(a)){var c=Zb(a),d=Q(c),e=ie(d);return function(){for(var a=0;;)if(a<d){var g=z.c(c,a),h=R(g,0),g=R(g,1),n;n=Ol(h);n=p(n)?K.c(b,yd(l,Nl(h))):n;p(n)&&e.add(new U(null,2,5,V,[h,g],null));a+=1}else return!0}()?ke(e.U(),Xa(bc(a))):ke(e.U(),null)}var g=H(a),h=R(g,0),g=R(g,1);if(p(function(){var a=Ol(h);return p(a)?K.c(b,yd(l,Nl(h))):a}()))return M(new U(null,2,5,V,[h,g],null),Xa(xc(a)));a=xc(a)}else return null}}(a,b,c,d,e,g,h,l,
n,q),null,null)}}(l,n,h,G,N,g,e,a,b,d)(c)}()));l+=1}else return!0}()?ke(N.U(),l(bc(g))):ke(N.U(),null)}var P=H(g);return M(Ze.c(Dd,function(){return function(a,b,c,d,e,g){return function Ma(h){return new de(null,function(a,b,c,d){return function(){for(var b=h;;)if(b=D(b)){if(qd(b)){var c=Zb(b),e=Q(c),g=ie(e);return function(){for(var b=0;;)if(b<e){var h=z.c(c,b),l=R(h,0),h=R(h,1),n;n=Ol(l);n=p(n)?K.c(a,yd(d,Nl(l))):n;p(n)&&g.add(new U(null,2,5,V,[l,h],null));b+=1}else return!0}()?ke(g.U(),Ma(bc(b))):
ke(g.U(),null)}var l=H(b),n=R(l,0),l=R(l,1);if(p(function(){var b=Ol(n);return p(b)?K.c(a,yd(d,Nl(n))):b}()))return M(new U(null,2,5,V,[n,l],null),Ma(xc(b)));b=xc(b)}else return null}}(a,b,c,d,e,g),null,null)}}(P,g,e,a,b,d)(c)}()),l(xc(g)))}return null}}}(a,b,d),null,null)}}(wg(d),a,b)(new U(null,2,5,V,[!0,!1],null))}}(yl,ym);ml(zm,bm(yl,new U(null,1,5,V,[ym],null)));
ml(function(a,b){var c=R(a,0),d=R(a,1),e=R(b,0),g=R(b,1),h=R(g,0),g=R(g,1);if(!Da(vd(xm(c,e))))throw Error(al("Duplicate key output (possibly due to a misordered graph) %s for input %s from input %s",Rc([e,tl(h),tl(c)],0)));if(!Da(vd(xm(h,e))))throw Error(al("Node outputs a key %s in its inputs %s",Rc([e,tl(h)],0)));if(!Da(vd(xm(d,e))))throw Error(al("Node outputs a duplicate key %s given inputs %s",Rc([e,tl(c)],0)));var k=zm(h,Mf(d)),h=R(k,0),k=R(k,1);tm(h,d);return new U(null,2,5,V,[pm(k,c),S.j(d,
e,g)],null)},bm(hm,new U(null,1,5,V,[new U(null,2,5,V,[Xl(hm,new C(null,"arg0","arg0",-1024593414,null)),Xl(new U(null,2,5,V,[Xl(El,"key"),Xl(em,"inner-schemas")],null),new C(null,"arg1","arg1",-1702536411,null))],null)],null)));De.c(Yd,Ld);function Am(){return-1!=Qk.indexOf("Edge")};var Bm=-1!=Qk.indexOf("Opera")||-1!=Qk.indexOf("OPR"),Cm=-1!=Qk.indexOf("Edge")||-1!=Qk.indexOf("Trident")||-1!=Qk.indexOf("MSIE"),Dm=-1!=Qk.indexOf("Gecko")&&!(-1!=Qk.toLowerCase().indexOf("webkit")&&!Am())&&!(-1!=Qk.indexOf("Trident")||-1!=Qk.indexOf("MSIE"))&&!Am(),Em=-1!=Qk.toLowerCase().indexOf("webkit")&&!Am();
function Fm(){var a=Qk;if(Dm)return/rv\:([^\);]+)(\)|;)/.exec(a);if(Cm&&Am())return/Edge\/([\d\.]+)/.exec(a);if(Cm)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(Em)return/WebKit\/(\S+)/.exec(a)}function Gm(){var a=aa.document;return a?a.documentMode:void 0}var Hm=function(){if(Bm&&aa.opera){var a=aa.opera.version;return"function"==m(a)?a():a}var a="",b=Fm();b&&(a=b?b[1]:"");return Cm&&!Am()&&(b=Gm(),b>parseFloat(a))?String(b):a}(),Im={};
function Jm(a){var b;if(!(b=Im[a])){b=0;for(var c=da(String(Hm)).split("."),d=da(String(a)).split("."),e=Math.max(c.length,d.length),g=0;0==b&&g<e;g++){var h=c[g]||"",k=d[g]||"",l=RegExp("(\\d*)(\\D*)","g"),n=RegExp("(\\d*)(\\D*)","g");do{var q=l.exec(h)||["","",""],r=n.exec(k)||["","",""];if(0==q[0].length&&0==r[0].length)break;b=fa(0==q[1].length?0:parseInt(q[1],10),0==r[1].length?0:parseInt(r[1],10))||fa(0==q[2].length,0==r[2].length)||fa(q[2],r[2])}while(0==b)}b=Im[a]=0<=b}return b}
var Km=aa.document,Lm=Gm(),Mm=!Km||!Cm||!Lm&&Am()?void 0:Lm||("CSS1Compat"==Km.compatMode?parseInt(Hm,10):5);!Dm&&!Cm||Cm&&Cm&&(Am()||9<=Mm)||Dm&&Jm("1.9.1");Cm&&Jm("9");la("area base br col command embed hr img input keygen link meta param source track wbr".split(" "));function Nm(){}Nm.hc=function(){return Nm.ic?Nm.ic:Nm.ic=new Nm};Nm.prototype.jc=0;var Om=null,Pm=null,Qm=null,Rm=null,Sm=null,Tm={},Um=function Um(b){if(b?b.Lb:b)return b.Lb(b);var c;c=Um[m(null==b?null:b)];if(!c&&(c=Um._,!c))throw u("IDisplayName.display-name",b);return c.call(null,b)},Vm={},Wm=function Wm(b){if(b?b.sd:b)return b.sd(b);var c;c=Wm[m(null==b?null:b)];if(!c&&(c=Wm._,!c))throw u("IInitState.init-state",b);return c.call(null,b)},Xm={},Ym=function Ym(b,c,d){if(b?b.zd:b)return b.zd(b,c,d);var e;e=Ym[m(null==b?null:b)];if(!e&&(e=Ym._,!e))throw u("IShouldUpdate.should-update",
b);return e.call(null,b,c,d)},Zm={},$m=function $m(b){if(b?b.Dd:b)return b.Dd(b);var c;c=$m[m(null==b?null:b)];if(!c&&(c=$m._,!c))throw u("IWillMount.will-mount",b);return c.call(null,b)},an={},bn=function bn(b){if(b?b.lc:b)return b.lc(b);var c;c=bn[m(null==b?null:b)];if(!c&&(c=bn._,!c))throw u("IDidMount.did-mount",b);return c.call(null,b)},cn={},dn=function dn(b){if(b?b.Gd:b)return b.Gd(b);var c;c=dn[m(null==b?null:b)];if(!c&&(c=dn._,!c))throw u("IWillUnmount.will-unmount",b);return c.call(null,
b)},en={},fn=function fn(b,c,d){if(b?b.Id:b)return b.Id(b,c,d);var e;e=fn[m(null==b?null:b)];if(!e&&(e=fn._,!e))throw u("IWillUpdate.will-update",b);return e.call(null,b,c,d)},gn={},hn=function hn(b,c,d){if(b?b.qd:b)return b.qd(b,c,d);var e;e=hn[m(null==b?null:b)];if(!e&&(e=hn._,!e))throw u("IDidUpdate.did-update",b);return e.call(null,b,c,d)},jn={},kn=function kn(b,c){if(b?b.Ed:b)return b.Ed(b,c);var d;d=kn[m(null==b?null:b)];if(!d&&(d=kn._,!d))throw u("IWillReceiveProps.will-receive-props",b);return d.call(null,
b,c)},ln={},mn=function mn(b){if(b?b.Mb:b)return b.Mb(b);var c;c=mn[m(null==b?null:b)];if(!c&&(c=mn._,!c))throw u("IRender.render",b);return c.call(null,b)},nn={},on=function on(b,c,d){if(b?b.xd:b)return b.xd(b,c,d);var e;e=on[m(null==b?null:b)];if(!e&&(e=on._,!e))throw u("IRenderProps.render-props",b);return e.call(null,b,c,d)},pn={},qn=function qn(b,c){if(b?b.yd:b)return b.yd(b,c);var d;d=qn[m(null==b?null:b)];if(!d&&(d=qn._,!d))throw u("IRenderState.render-state",b);return d.call(null,b,c)},rn=
{},sn={},tn=function tn(b,c,d,e,g){if(b?b.wd:b)return b.wd(b,c,d,e,g);var h;h=tn[m(null==b?null:b)];if(!h&&(h=tn._,!h))throw u("IOmSwap.-om-swap!",b);return h.call(null,b,c,d,e,g)},un=function un(){switch(arguments.length){case 1:return un.h(arguments[0]);case 2:return un.c(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};
un.h=function(a){if(a?a.oc:a)return a.oc(a);var b;b=un[m(null==a?null:a)];if(!b&&(b=un._,!b))throw u("IGetState.-get-state",a);return b.call(null,a)};un.c=function(a,b){if(a?a.pc:a)return a.pc(a,b);var c;c=un[m(null==a?null:a)];if(!c&&(c=un._,!c))throw u("IGetState.-get-state",a);return c.call(null,a,b)};un.H=2;
var vn=function vn(){switch(arguments.length){case 1:return vn.h(arguments[0]);case 2:return vn.c(arguments[0],arguments[1]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};vn.h=function(a){if(a?a.mc:a)return a.mc(a);var b;b=vn[m(null==a?null:a)];if(!b&&(b=vn._,!b))throw u("IGetRenderState.-get-render-state",a);return b.call(null,a)};
vn.c=function(a,b){if(a?a.nc:a)return a.nc(a,b);var c;c=vn[m(null==a?null:a)];if(!c&&(c=vn._,!c))throw u("IGetRenderState.-get-render-state",a);return c.call(null,a,b)};vn.H=2;var wn=function wn(){switch(arguments.length){case 3:return wn.j(arguments[0],arguments[1],arguments[2]);case 4:return wn.K(arguments[0],arguments[1],arguments[2],arguments[3]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}};
wn.j=function(a,b,c){if(a?a.zc:a)return a.zc(a,b,c);var d;d=wn[m(null==a?null:a)];if(!d&&(d=wn._,!d))throw u("ISetState.-set-state!",a);return d.call(null,a,b,c)};wn.K=function(a,b,c,d){if(a?a.Ac:a)return a.Ac(a,b,c,d);var e;e=wn[m(null==a?null:a)];if(!e&&(e=wn._,!e))throw u("ISetState.-set-state!",a);return e.call(null,a,b,c,d)};wn.H=4;
var xn=function xn(b){if(b?b.uc:b)return b.uc(b);var c;c=xn[m(null==b?null:b)];if(!c&&(c=xn._,!c))throw u("IRenderQueue.-get-queue",b);return c.call(null,b)},yn=function yn(b,c){if(b?b.vc:b)return b.vc(b,c);var d;d=yn[m(null==b?null:b)];if(!d&&(d=yn._,!d))throw u("IRenderQueue.-queue-render!",b);return d.call(null,b,c)},zn=function zn(b){if(b?b.tc:b)return b.tc(b);var c;c=zn[m(null==b?null:b)];if(!c&&(c=zn._,!c))throw u("IRenderQueue.-empty-queue!",b);return c.call(null,b)},An=function An(b){if(b?
b.Dc:b)return b.value;var c;c=An[m(null==b?null:b)];if(!c&&(c=An._,!c))throw u("IValue.-value",b);return c.call(null,b)};An._=function(a){return a};
var Bn={},Cn=function Cn(b){if(b?b.Jb:b)return b.Jb(b);var c;c=Cn[m(null==b?null:b)];if(!c&&(c=Cn._,!c))throw u("ICursor.-path",b);return c.call(null,b)},Dn=function Dn(b){if(b?b.Kb:b)return b.Kb(b);var c;c=Dn[m(null==b?null:b)];if(!c&&(c=Dn._,!c))throw u("ICursor.-state",b);return c.call(null,b)},En={},Fn=function Fn(){switch(arguments.length){case 2:return Fn.c(arguments[0],arguments[1]);case 3:return Fn.j(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));
}};Fn.c=function(a,b){if(a?a.Ad:a)return a.Ad(a,b);var c;c=Fn[m(null==a?null:a)];if(!c&&(c=Fn._,!c))throw u("IToCursor.-to-cursor",a);return c.call(null,a,b)};Fn.j=function(a,b,c){if(a?a.Bd:a)return a.Bd(a,b,c);var d;d=Fn[m(null==a?null:a)];if(!d&&(d=Fn._,!d))throw u("IToCursor.-to-cursor",a);return d.call(null,a,b,c)};Fn.H=3;var Gn=function Gn(b,c,d,e){if(b?b.nd:b)return b.nd(b,c,d,e);var g;g=Gn[m(null==b?null:b)];if(!g&&(g=Gn._,!g))throw u("ICursorDerive.-derive",b);return g.call(null,b,c,d,e)};
Gn._=function(a,b,c,d){return Hn?Hn(b,c,d):In.call(null,b,c,d)};function Jn(a){return Cn(a)}
var Kn={},Ln=function Ln(b,c,d){if(b?b.qc:b)return b.qc(b,c,d);var e;e=Ln[m(null==b?null:b)];if(!e&&(e=Ln._,!e))throw u("INotify.-listen!",b);return e.call(null,b,c,d)},Mn=function Mn(b,c){if(b?b.sc:b)return b.sc(b,c);var d;d=Mn[m(null==b?null:b)];if(!d&&(d=Mn._,!d))throw u("INotify.-unlisten!",b);return d.call(null,b,c)},Nn=function Nn(b,c,d){if(b?b.rc:b)return b.rc(b,c,d);var e;e=Nn[m(null==b?null:b)];if(!e&&(e=Nn._,!e))throw u("INotify.-notify!",b);return e.call(null,b,c,d)},On=function On(b,c,
d,e){if(b?b.yc:b)return b.yc(b,c,d,e);var g;g=On[m(null==b?null:b)];if(!g&&(g=On._,!g))throw u("IRootProperties.-set-property!",b);return g.call(null,b,c,d,e)},Pn=function Pn(b,c){if(b?b.xc:b)return b.xc(b,c);var d;d=Pn[m(null==b?null:b)];if(!d&&(d=Pn._,!d))throw u("IRootProperties.-remove-properties!",b);return d.call(null,b,c)},Qn=function Qn(b,c,d){if(b?b.wc:b)return b.wc(b,c,d);var e;e=Qn[m(null==b?null:b)];if(!e&&(e=Qn._,!e))throw u("IRootProperties.-get-property",b);return e.call(null,b,c,d)},
Rn=function Rn(b,c){if(b?b.kc:b)return b.kc(b,c);var d;d=Rn[m(null==b?null:b)];if(!d&&(d=Rn._,!d))throw u("IAdapt.-adapt",b);return d.call(null,b,c)};Rn._=function(a,b){return b};var Sn=function Sn(b,c){if(b?b.vd:b)return b.vd(b,c);var d;d=Sn[m(null==b?null:b)];if(!d&&(d=Sn._,!d))throw u("IOmRef.-remove-dep!",b);return d.call(null,b,c)};
function Tn(a,b,c,d,e){var g=L.h?L.h(a):L.call(null,a),h=Ze.c(Jn.h?Jn.h(b):Jn.call(null,b),c);c=(a?p(p(null)?null:a.ie)||(a.Y?0:t(sn,a)):t(sn,a))?tn(a,b,c,d,e):kd(h)?Oe.c(a,d):Oe.K(a,df,h,d);if(K.c(c,Fk))return null;a=new va(null,5,[hh,h,Bi,af(g,h),mh,af(L.h?L.h(a):L.call(null,a),h),gh,g,Jh,L.h?L.h(a):L.call(null,a)],null);return null!=e?(e=S.j(a,kk,e),Un.c?Un.c(b,e):Un.call(null,b,e)):Un.c?Un.c(b,a):Un.call(null,b,a)}function Vn(a){return a?p(p(null)?null:a.Ub)?!0:a.Y?!1:t(Bn,a):t(Bn,a)}
function Wn(a){var b=a.props.children;return wd(b)?a.props.children=b.h?b.h(a):b.call(null,a):b}function Xn(a){return a.props.__om_cursor}function Yn(){var a=Om;return null==a?null:a.props.__om_shared}function Zn(a){a=a.state;var b=a.__om_pending_state;return p(b)?(a.__om_prev_state=a.__om_state,a.__om_state=b,a.__om_pending_state=null,a):null}
function $n(a,b){var c=p(b)?b:a.props,d=c.__om_state;if(p(d)){var e=a.state,g=e.__om_pending_state;e.__om_pending_state=ug.B(Rc([p(g)?g:e.__om_state,d],0));c.__om_state=null}}function ao(a){a=a.state;var b=a.__om_refs;return 0===Q(b)?null:a.__om_refs=Ze.c(Fd,Ve.c(Ba,Z.c(function(){return function(a){var b=An(a),e=Dn(a),g=Jn.h?Jn.h(a):Jn.call(null,a),h=bf(L.h?L.h(e):L.call(null,e),g,Bh);xe(b,Bh)?xe(b,h)&&(b=Hn?Hn(h,e,g):In.call(null,h,e,g),a=Rn(a,b)):a=null;return a}}(a,b),b)))}
var co=ed([Ch,ai,Ti,Ui,jj,rj,Bj,Ej,Zj,ok,Ck],[function(a){var b=Wn(this);if(b?p(p(null)?null:b.pd)||(b.Y?0:t(gn,b)):t(gn,b)){var c=this.state,d=c.__om_prev_state;hn(b,Xn({props:a,isOmComponent:!0}),p(d)?d:c.__om_state)}return this.state.__om_prev_state=null},!0,function(){var a=Wn(this);(a?p(p(null)?null:a.Fd)||(a.Y?0:t(cn,a)):t(cn,a))&&dn(a);if(a=D(this.state.__om_refs))for(var a=D(a),b=null,c=0,d=0;;)if(d<c){var e=b.V(null,d);bo.c?bo.c(this,e):bo.call(null,this,e);d+=1}else if(a=D(a))qd(a)?(c=Zb(a),
a=bc(a),b=c,c=Q(c)):(b=e=H(a),bo.c?bo.c(this,b):bo.call(null,this,b),a=J(a),b=null,c=0),d=0;else return null;else return null},function(a){var b=Wn(this);return(b?p(p(null)?null:b.te)||(b.Y?0:t(jn,b)):t(jn,b))?kn(b,Xn({props:a,isOmComponent:!0})):null},function(a){var b=this,c=b.props,d=b.state,e=Wn(b);$n(b,a);if(e?p(p(null)?null:e.re)||(e.Y?0:t(Xm,e)):t(Xm,e))return Ym(e,Xn({props:a,isOmComponent:!0}),un.h(b));var g=c.__om_cursor,h=a.__om_cursor;return xe(An(g),An(h))?!0:p(function(){var a=Vn(g);
return p(a)?(a=Vn(h),p(a)?xe(Cn(g),Cn(h)):a):a}())?!0:xe(un.h(b),vn.h(b))?!0:p(function(){var a=0!==Q(d.__om_refs);return a?Ae(function(){return function(a){var b=An(a),c;c=Dn(a);c=L.h?L.h(c):L.call(null,c);a=bf(c,Jn.h?Jn.h(a):Jn.call(null,a),Bh);return xe(b,a)}}(a,g,h,c,d,e,b),d.__om_refs):a}())?!0:c.__om_index!==a.__om_index?!0:!1},function(){var a=Wn(this),b=this.props,c=Om,d=Rm,e=Pm,g=Qm,h=Sm;Om=this;Rm=b.__om_app_state;Pm=b.__om_instrument;Qm=b.__om_descriptor;Sm=b.__om_root_key;try{return(a?
p(p(null)?null:a.Wb)||(a.Y?0:t(ln,a)):t(ln,a))?mn(a):(a?p(p(null)?null:a.je)||(a.Y?0:t(nn,a)):t(nn,a))?on(a,b.__om_cursor,un.h(this)):(a?p(p(null)?null:a.le)||(a.Y?0:t(pn,a)):t(pn,a))?qn(a,un.h(this)):a}finally{Sm=h,Qm=g,Pm=e,Rm=d,Om=c}},function(a){var b=Wn(this);(b?p(p(null)?null:b.Hd)||(b.Y?0:t(en,b)):t(en,b))&&fn(b,Xn({props:a,isOmComponent:!0}),un.h(this));Zn(this);return ao(this)},function(){var a=Wn(this),b=this.props,c;c=b.__om_init_state;c=p(c)?c:Dd;var d=Qh.h(c),a={__om_id:p(d)?d:":"+(Nm.hc().jc++).toString(36),
__om_state:ug.B(Rc([(a?p(p(null)?null:a.rd)||(a.Y?0:t(Vm,a)):t(Vm,a))?Wm(a):null,T.c(c,Qh)],0))};b.__om_init_state=null;return a},function(){var a=Wn(this);return(a?p(p(null)?null:a.od)||(a.Y?0:t(an,a)):t(an,a))?bn(a):null},function(){var a=Wn(this);return(a?p(p(null)?null:a.Vb)||(a.Y?0:t(Tm,a)):t(Tm,a))?Um(a):null},function(){$n(this,null);var a=Wn(this);(a?p(p(null)?null:a.Cd)||(a.Y?0:t(Zm,a)):t(Zm,a))&&$m(a);return Zn(this)}]),eo=function(a){a.qe=!0;a.zc=function(){return function(a,c,d){a=this.props.__om_app_state;
this.state.__om_pending_state=c;c=null!=a;return p(c?d:c)?yn(a,this):null}}(a);a.Ac=function(){return function(a,c,d,e){var g=this.props;a=this.state;var h=un.h(this),g=g.__om_app_state;a.__om_pending_state=cf(h,c,d);c=null!=g;return p(c?e:c)?yn(g,this):null}}(a);a.ge=!0;a.mc=function(){return function(){return this.state.__om_state}}(a);a.nc=function(){return function(a,c){return af(vn.h(this),c)}}(a);a.he=!0;a.oc=function(){return function(){var a=this.state,c=a.__om_pending_state;return p(c)?c:
a.__om_state}}(a);a.pc=function(){return function(a,c){return af(un.h(this),c)}}(a);return a}(Vg(co));function fo(a){return a._rootNodeID}function go(a){return a.props.__om_app_state}function ho(a){var b=go(a);a=new U(null,2,5,V,[lh,fo(a)],null);var c=af(L.h?L.h(b):L.call(null,b),a);return p(Qi.h(c))?Oe.K(b,df,a,function(){return function(a){return T.c(S.j(S.j(a,xj,Ik.h(a)),Ik,ug.B(Rc([Ik.h(a),Qi.h(a)],0))),Qi)}}(b,a,c)):null}
S.B(co,Ej,function(){var a=Wn(this),b=this.props,c=function(){var a=b.__om_init_state;return p(a)?a:Dd}(),d=function(){var a=Qh.h(c);return p(a)?a:":"+(Nm.hc().jc++).toString(36)}(),a=ug.B(Rc([T.c(c,Qh),(a?p(p(null)?null:a.rd)||(a.Y?0:t(Vm,a)):t(Vm,a))?Wm(a):null],0)),e=new U(null,3,5,V,[lh,fo(this),Ik],null);b.__om_init_state=null;Oe.K(go(this),cf,e,a);return{__om_id:d}},Rc([Ck,function(){$n(this,null);var a=Wn(this);(a?p(p(null)?null:a.Cd)||(a.Y?0:t(Zm,a)):t(Zm,a))&&$m(a);return ho(this)},Ti,function(){var a=
Wn(this);(a?p(p(null)?null:a.Fd)||(a.Y?0:t(cn,a)):t(cn,a))&&dn(a);Oe.B(go(this),df,new U(null,1,5,V,[lh],null),T,Rc([fo(this)],0));if(a=D(this.state.__om_refs))for(var a=D(a),b=null,c=0,d=0;;)if(d<c){var e=b.V(null,d);bo.c?bo.c(this,e):bo.call(null,this,e);d+=1}else if(a=D(a))qd(a)?(c=Zb(a),a=bc(a),b=c,c=Q(c)):(b=e=H(a),bo.c?bo.c(this,b):bo.call(null,this,b),a=J(a),b=null,c=0),d=0;else return null;else return null},Bj,function(a){var b=Wn(this);(b?p(p(null)?null:b.Hd)||(b.Y?0:t(en,b)):t(en,b))&&fn(b,
Xn({props:a,isOmComponent:!0}),un.h(this));ho(this);return ao(this)},Ch,function(a){var b=Wn(this),c=go(this),d=af(L.h?L.h(c):L.call(null,c),new U(null,2,5,V,[lh,fo(this)],null)),e=new U(null,2,5,V,[lh,fo(this)],null);if(b?p(p(null)?null:b.pd)||(b.Y?0:t(gn,b)):t(gn,b)){a=Xn({props:a,isOmComponent:!0});var g;g=xj.h(d);g=p(g)?g:Ik.h(d);hn(b,a,g)}return p(xj.h(d))?Oe.B(c,df,e,T,Rc([xj],0)):null}],0));function io(a,b,c){this.value=a;this.state=b;this.path=c;this.w=2163640079;this.F=8192}f=io.prototype;
f.L=function(a,b){return A.j(this,b,null)};f.J=function(a,b,c){a=A.j(this.value,b,Bh);return K.c(a,Bh)?c:Gn(this,a,this.state,Xc.c(this.path,b))};f.M=function(a,b,c){return Pb(this.value,b,c)};f.Ub=!0;f.Jb=function(){return this.path};f.Kb=function(){return this.state};f.N=function(){return id(this.value)};f.X=function(){return new io(this.value,this.state,this.path)};f.T=function(){return Wa(this.value)};f.P=function(){return rc(this.value)};
f.D=function(a,b){return p(Vn(b))?K.c(this.value,An(b)):K.c(this.value,b)};f.Dc=function(){return this.value};f.ba=function(){return new io($c(this.value),this.state,this.path)};f.pa=function(a,b){return new io(mb(this.value,b),this.state,this.path)};f.Bc=!0;f.Cc=function(a,b,c,d){return Tn(this.state,this,b,c,d)};f.vb=function(a,b){return hb(this.value,b)};f.fa=function(a,b,c){return new io(kb(this.value,b,c),this.state,this.path)};
f.R=function(){var a=this;return 0<Q(a.value)?Z.c(function(b){return function(c){var d=R(c,0);c=R(c,1);return new U(null,2,5,V,[d,Gn(b,c,a.state,Xc.c(a.path,d))],null)}}(this),a.value):null};f.O=function(a,b){return new io(Sc(this.value,b),this.state,this.path)};f.S=function(a,b){return new io(y(this.value,b),this.state,this.path)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.L(null,c);case 3:return this.J(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.L(null,c)};a.j=function(a,c,d){return this.J(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return this.L(null,a)};f.c=function(a,b){return this.J(null,a,b)};
f.lb=function(){var a=bf,b;b=this.state;b=L.h?L.h(b):L.call(null,b);return a(b,this.path,ik)};function jo(a,b,c){this.value=a;this.state=b;this.path=c;this.w=2180424479;this.F=8192}f=jo.prototype;f.L=function(a,b){return z.j(this,b,null)};f.J=function(a,b,c){return z.j(this,b,c)};f.V=function(a,b){return Gn(this,z.c(this.value,b),this.state,Xc.c(this.path,b))};f.ua=function(a,b,c){return b<Wa(this.value)?Gn(this,z.j(this.value,b,c),this.state,Xc.c(this.path,b)):c};
f.M=function(a,b,c){return Pb(this.value,b,c)};f.Ub=!0;f.Jb=function(){return this.path};f.Kb=function(){return this.state};f.N=function(){return id(this.value)};f.X=function(){return new jo(this.value,this.state,this.path)};f.T=function(){return Wa(this.value)};f.P=function(){return rc(this.value)};f.D=function(a,b){return p(Vn(b))?K.c(this.value,An(b)):K.c(this.value,b)};f.Dc=function(){return this.value};f.ba=function(){return new jo($c(this.value),this.state,this.path)};f.Bc=!0;
f.Cc=function(a,b,c,d){return Tn(this.state,this,b,c,d)};f.vb=function(a,b){return hb(this.value,b)};f.fa=function(a,b,c){return Gn(this,ub(this.value,b,c),this.state,this.path)};f.R=function(){var a=this;return 0<Q(a.value)?Z.j(function(b){return function(c,d){return Gn(b,c,a.state,Xc.c(a.path,d))}}(this),a.value,new zg(null,0,Number.MAX_VALUE,1,null)):null};f.O=function(a,b){return new jo(Sc(this.value,b),this.state,this.path)};f.S=function(a,b){return new jo(y(this.value,b),this.state,this.path)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.L(null,c);case 3:return this.J(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.L(null,c)};a.j=function(a,c,d){return this.J(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ia(b)))};f.h=function(a){return this.L(null,a)};f.c=function(a,b){return this.J(null,a,b)};
f.lb=function(){var a=bf,b;b=this.state;b=L.h?L.h(b):L.call(null,b);return a(b,this.path,ik)};function ko(a,b,c){var d=Ua(a);d.Ud=!0;d.lb=function(){return function(){return bf(L.h?L.h(b):L.call(null,b),c,ik)}}(d);d.Ub=!0;d.Jb=function(){return function(){return c}}(d);d.Kb=function(){return function(){return b}}(d);d.Bc=!0;d.Cc=function(){return function(a,c,d,k){return Tn(b,this,c,d,k)}}(d);d.Mc=!0;d.D=function(){return function(b,c){return p(Vn(c))?K.c(a,An(c)):K.c(a,c)}}(d);return d}
function In(){switch(arguments.length){case 1:return Hn(arguments[0],null,Zc);case 2:return Hn(arguments[0],arguments[1],Zc);case 3:return Hn(arguments[0],arguments[1],arguments[2]);default:throw Error([w("Invalid arity: "),w(arguments.length)].join(""));}}function Hn(a,b,c){return p(Vn(a))?a:(a?p(p(null)?null:a.se)||(a.Y?0:t(En,a)):t(En,a))?Fn.j(a,b,c):Mc(a)?new jo(a,b,c):od(a)?new io(a,b,c):(a?a.F&8192||a.Gc||(a.F?0:t(Ta,a)):t(Ta,a))?ko(a,b,c):a}
function Un(a,b){var c=Dn(a),d;d=L.h?L.h(c):L.call(null,c);d=Hn(d,c,Zc);return Nn(c,b,d)}var lo=Ie?Ie(Dd):He.call(null,Dd);function bo(a,b){var c=a.state,d=c.__om_refs;yd(d,b)&&(c.__om_refs=jd.c(d,b));Sn(b,a);return b}var mo=!1,no=Ie?Ie(Fd):He.call(null,Fd);
function oo(a){mo=!1;for(var b=D(L.h?L.h(no):L.call(null,no)),c=null,d=0,e=0;;)if(e<d){var g=c.V(null,e);g.G?g.G():g.call(null);e+=1}else if(b=D(b))c=b,qd(c)?(b=Zb(c),e=bc(c),c=b,d=Q(b),b=e):(b=H(c),b.G?b.G():b.call(null),b=J(c),c=null,d=0),e=0;else break;null==a?a=null:(b=a.Jd,a=a.Jd=(p(b)?b:0)+1);return a}var po=Ie?Ie(Dd):He.call(null,Dd);
function qo(a,b){if(null==a.om$descriptor){var c;p(b)?c=b:(c=Qm,c=p(c)?c:eo);c=React.createClass(c);c=React.createFactory(c);a.om$descriptor=c}return a.om$descriptor}
function ro(a,b,c){if(null==c){var d=Yn(),e=qo(a,null),d={__om_cursor:b,__om_shared:d,__om_root_key:Sm,__om_app_state:Rm,__om_descriptor:Qm,__om_instrument:Pm,children:function(){return function(c){return a.c?a.c(b,c):a.call(null,b,c)}}(d,e)};return e.h?e.h(d):e.call(null,d)}var g=ud(c)?se(Je,c):c,h=cd(g,Uh),k=cd(g,mj),l=cd(g,Mi),n=cd(g,Ji),q=cd(g,Gj),r=cd(c,Gh),v=null!=r?function(){var a=Rj.h(c);return p(a)?r.c?r.c(b,a):r.call(null,b,a):r.h?r.h(b):r.call(null,b)}():b,x=null!=h?cd(v,h):null!=k?k.h?
k.h(v):k.call(null,v):cd(c,Nh),d=function(){var a=Tj.h(c);return p(a)?a:Yn()}(),e=qo(a,wh.h(c)),B;B=p(x)?x:void 0;d={__om_state:l,__om_instrument:Pm,children:null==q?function(b,c,d,e,g,h,k,l,n){return function(b){return a.c?a.c(n,b):a.call(null,n,b)}}(c,g,h,k,l,n,q,r,v,x,d,e):function(b,c,d,e,g,h,k,l,n){return function(b){return a.j?a.j(n,b,k):a.call(null,n,b,k)}}(c,g,h,k,l,n,q,r,v,x,d,e),__om_init_state:n,key:B,__om_app_state:Rm,__om_cursor:v,__om_index:Rj.h(c),__om_shared:d,__om_descriptor:Qm,__om_root_key:Sm};
return e.h?e.h(d):e.call(null,d)}function so(a,b,c){if(null!=Pm){var d=Pm.j?Pm.j(a,b,c):Pm.call(null,a,b,c);return K.c(d,Gi)?ro(a,b,c):d}return ro(a,b,c)}
function to(a,b,c){if(!(a?p(p(null)?null:a.ud)||(a.Y?0:t(Kn,a)):t(Kn,a))){var d=Ie?Ie(Dd):He.call(null,Dd),e=Ie?Ie(Dd):He.call(null,Dd),g=Ie?Ie(Fd):He.call(null,Fd);a.oe=!0;a.yc=function(a,b){return function(a,c,d,e){return Oe.K(b,cf,new U(null,2,5,V,[c,d],null),e)}}(a,d,e,g);a.pe=function(a,b){return function(a,c,d){return Oe.K(b,T,c,d)}}(a,d,e,g);a.xc=function(a,b){return function(a,c){return Oe.j(b,T,c)}}(a,d,e,g);a.wc=function(a,b){return function(a,c,d){return af(L.h?L.h(b):L.call(null,b),new U(null,
2,5,V,[c,d],null))}}(a,d,e,g);a.ud=!0;a.qc=function(a,b,c){return function(a,b,d){null!=d&&Oe.K(c,S,b,d);return this}}(a,d,e,g);a.sc=function(a,b,c){return function(a,b){Oe.j(c,T,b);return this}}(a,d,e,g);a.rc=function(a,b,c){return function(a,b,d){a=D(L.h?L.h(c):L.call(null,c));for(var e=null,g=0,h=0;;)if(h<g){var k=e.V(null,h);R(k,0);var k=R(k,1),G=b,N=d;k.c?k.c(G,N):k.call(null,G,N);h+=1}else if(a=D(a))qd(a)?(g=Zb(a),a=bc(a),e=g,g=Q(g)):(e=H(a),R(e,0),e=R(e,1),g=b,h=d,e.c?e.c(g,h):e.call(null,
g,h),a=J(a),e=null,g=0),h=0;else break;return this}}(a,d,e,g);a.ke=!0;a.uc=function(a,b,c,d){return function(){return L.h?L.h(d):L.call(null,d)}}(a,d,e,g);a.vc=function(a,b,c,d){return function(a,b){if(yd(L.h?L.h(d):L.call(null,d),b))return null;Oe.j(d,Xc,b);return Oe.c(this,Nd)}}(a,d,e,g);a.tc=function(a,b,c,d){return function(){return Oe.c(d,$c)}}(a,d,e,g)}return Ln(a,b,c)}
var uo=function uo(b,c){if(p(Vn(b))){var d=Ua(b);d.Gc=!0;d.X=function(){return function(){return uo(Ua(b),c)}}(d);d.fe=!0;d.kc=function(){return function(d,g){return uo(Rn(b,g),c)}}(d);d.me=!0;d.ne=function(){return function(){return c}}(d);return d}return b};var vo,wo=new U(null,3,5,V,[Xl(yl,new C(null,"data","data",1407862150,null)),Xl(yl,new C(null,"_","_",-1201019570,null)),Xl(yl,new C(null,"_","_",-1201019570,null))],null),xo=function(a,b){return function d(e,g,h){"undefined"===typeof vo&&(vo=function(a,b,d,e,g,h){this.Kd=a;this.bd=b;this.Pd=d;this.data=e;this.Ca=g;this.gd=h;this.w=393216;this.F=0},vo.prototype.O=function(){return function(a,b){return new vo(this.Kd,this.bd,this.Pd,this.data,this.Ca,b)}}(a,b),vo.prototype.N=function(){return function(){return this.gd}}(a,
b),vo.prototype.Vb=!0,vo.prototype.Lb=function(){return function(){return"status-component"}}(a,b),vo.prototype.Wb=!0,vo.prototype.Mb=function(){return function(){return te(React.DOM.div,{className:"status"},Ye(new U(null,1,5,V,[this.data],null)))}}(a,b),vo.Hb=function(){return function(){return new U(null,6,5,V,[new C(null,"output-schema44549","output-schema44549",-859585119,null),new C(null,"input-schema44550","input-schema44550",-817307801,null),new C(null,"status-component","status-component",
2119421421,null),new C(null,"data","data",1407862150,null),new C(null,"_","_",-1201019570,null),new C(null,"meta44557","meta44557",-875303432,null)],null)}}(a,b),vo.pb=!0,vo.ob="editor.views.status/t44556",vo.Bb=function(){return function(a,b){return Nb(b,"editor.views.status/t44556")}}(a,b));return new vo(a,b,d,e,h,null)}}(yl,wo);ml(xo,bm(yl,new U(null,1,5,V,[wo],null)));Cm&&Jm("9");!Em||Jm("528");Dm&&Jm("1.9b")||Cm&&Jm("8")||Bm&&Jm("9.5")||Em&&Jm("528");Dm&&!Jm("8")||Cm&&Jm("9");var yo;function zo(a){a=JSON.parse(a);return Yg(a)};var Ao=Yg(platform),Bo=p(null!=window["faceboard-env"])?Yg(faceboard_env):Dd,Co=K.c(af(Ao,new U(null,2,5,V,[jk,Hh],null)),"OS X");fj.h(Bo);function Do(a){a=zo(a);a=cf(L.h?L.h(Ok):L.call(null,Ok),new U(null,1,5,V,[Pj],null),a);return Ne.c?Ne.c(Ok,a):Ne.call(null,Ok,a)}var Eo=["editor","exports","drive"],Fo=aa;Eo[0]in Fo||!Fo.execScript||Fo.execScript("var "+Eo[0]);for(var Go;Eo.length&&(Go=Eo.shift());){var Ho;if(Ho=!Eo.length)Ho=void 0!==Do;Ho?Fo[Go]=Do:Fo=Fo[Go]?Fo[Go]:Fo[Go]={}}window.drive=Do;var Io=function(a){return Pa(function(a,c){var d=R(c,0),e=R(c,1);return S.j(a,e,d)},Dd,a)}(ed([eh,fh,ih,kh,nh,ph,qh,rh,sh,th,uh,vh,xh,yh,zh,Ah,Dh,Eh,Fh,Ih,Lh,ya,Oh,Ph,Rh,Sh,Th,Wh,Xh,Yh,Zh,$h,bi,ci,di,ei,fi,ki,mi,ni,qi,si,ti,vi,wi,xi,Ai,Ci,Di,Ei,Fi,Hi,Ki,Li,Ni,Pi,Wi,Xi,Yi,Zi,$i,bj,ej,gj,hj,ij,lj,nj,oj,pj,qj,sj,tj,uj,vj,yj,Aj,Cj,Dj,Fj,Hj,Ij,Jj,Kj,Mj,Nj,Oj,Qj,Sj,Uj,Xj,Yj,bk,dk,ek,fk,gk,hk,lk,mk,pk,qk,rk,sk,uk,xk,zk,Ak,Bk,Dk,Ek,Gk,Hk,Jk,Lk,Nk],[89,48,16,49,81,104,59,191,40,63,224,82,32,111,36,45,96,86,
3,119,79,91,56,112,229,0,91,121,183,224,102,110,18,166,145,27,255,78,87,77,188,105,33,103,144,92,116,20,219,189,106,192,46,51,93,53,187,52,69,17,83,76,38,75,12,13,90,71,98,122,67,222,107,101,74,114,72,113,192,57,99,221,50,93,186,123,55,66,61,39,68,70,19,8,100,118,84,88,190,44,120,34,35,173,9,117,115,80,54,73,97,109,65,220,37,85]));
function Jo(a){return Xc.c(wg(Mf(Ve.c(Vd,new va(null,4,[Zi,vd(a.ctrlKey),ih,vd(a.shiftKey),bi,vd(a.altKey),ya,vd(a.metaKey)],null)))),function(){var b=a.keyCode;return Io.h?Io.h(b):Io.call(null,b)}())};for(var Ko=Array(1),Lo=0;;)if(Lo<Ko.length)Ko[Lo]=null,Lo+=1;else break;(function Mo(b){"undefined"===typeof yo&&(yo=function(b,d,e){this.ad=b;this.jb=d;this.ld=e;this.w=393216;this.F=0},yo.prototype.O=function(b,d){return new yo(this.ad,this.jb,d)},yo.prototype.N=function(){return this.ld},yo.Hb=function(){return new U(null,3,5,V,[new C(null,"fn-handler","fn-handler",648785851,null),new C(null,"f","f",43394975,null),new C(null,"meta50270","meta50270",-130184721,null)],null)},yo.pb=!0,yo.ob="cljs.core.async/t50269",yo.Bb=function(b,d){return Nb(d,"cljs.core.async/t50269")});
return new yo(Mo,b,Dd)})(function(){return null});var Oo,Po,Qo;function Ro(){return p(Oo)?Da(Oo.isClean.call(Oo)):null}function So(a){window.setTimeout(function(){var b=S.j(L.h?L.h(Ok):L.call(null,Ok),zj,a);return Ne.c?Ne.c(Ok,b):Ne.call(null,Ok,b)},0)}
function To(){var a=Po,b=null==Oo?null:Oo.getValue.call(Oo);So("");try{zo(b);var c=window.opener;if(p(c)){var d=c.faceboardApplyJSON;if(p(d)){var e;e=JSON.stringify(Vg(new U(null,2,5,V,[a,b],null)),null,2);d.h?d.h(e):d.call(null,e)}}return Oo.markClean.call(Oo)}catch(g){if(g instanceof Object)return So("The JSON is malformed!"),console.error(g);throw g;}}function Uo(a){if(null!=Oo){var b=Oo.getCursor.call(Oo);Oo.setValue.call(Oo,a);p(b)&&Oo.setCursor.call(Oo,b);Oo.markClean.call(Oo)}}
function Vo(a){return se(w,Ue(Z.c(function(a){return Vg(a)},a)))}function Wo(a){var b=Vo(Po),c=Vo(pi.h(a));a=Vj.h(a);var d;d=null==Oo?null:Oo.getValue.call(Oo);d=p(d)?d:a;var e=Ro();return p(e)?K.c(b,c)&&!K.c(d,a):e}function Xo(a,b){b.preventDefault();return p(a)?!0===confirm("Really overwrite external changes? This is most likely not a good idea.")?To():null:To()}
function Yo(a){a.preventDefault();return p(Ro())?!0===confirm("You have unsaved changes in the editor. Close without saving?")?window.close():null:window.close()}var Zo=new U(null,2,5,V,[new U(null,3,5,V,[new Ed(null,new va(null,2,[ya,null,$i,null],null),null),new Ed(null,new va(null,2,[Zi,null,$i,null],null),null),Si],null),new U(null,3,5,V,[new Ed(null,new va(null,1,[ei,null],null),null),new Ed(null,new va(null,1,[ei,null],null),null),Vi],null)],null);
function $o(a,b){var c=R(b,0),d=R(b,1),e=R(b,2),c=p(Co)?K.c(a,c):Co,d=p(c)?c:Da(Co)&&K.c(a,d);return p(d)?e:null}function ap(a){return wg(We.c(Ba,Pa(function(b,c){return Xc.c(b,$o(a,c))},Zc,Zo)))}
var bp=new U(null,2,5,V,[Xl(yl,new C(null,"data","data",1407862150,null)),Xl(yl,new C(null,"owner","owner",1247919588,null))],null),cp=function(a,b){return function d(e,g){"undefined"===typeof Qo&&(Qo=function(a,b,d,e,g,r){this.Ld=a;this.cd=b;this.Yc=d;this.data=e;this.Xb=g;this.hd=r;this.w=393216;this.F=0},Qo.prototype.O=function(){return function(a,b){return new Qo(this.Ld,this.cd,this.Yc,this.data,this.Xb,b)}}(a,b),Qo.prototype.N=function(){return function(){return this.hd}}(a,b),Qo.prototype.Vb=
!0,Qo.prototype.Lb=function(){return function(){return"editor-component"}}(a,b),Qo.prototype.Wb=!0,Qo.prototype.Mb=function(a,b){return function(){var d=this,e=this,g=d.data,r=Vo(pi.h(g)),v=Vj.h(g),x=Ro(),B=Wo(g),F=Ee(Xo,B),G=function(a,b,d,e,g,h,k,l,n){return function(q){var r=function(){return function(a,b){return a.h?a.h(b):a.call(null,b)}}(a,b,d,e,g,h,k,l,n),v=ap(Jo(q));return p(r(Si,v))?h.h?h.h(q):h.call(null,q):p(r(Vi,v))?Yo(q):null}}(g,r,v,x,B,F,e,a,b);p(x)||(Uo(v),Po=pi.h(g));return te(React.DOM.div,
{className:Yk([w("editor"),w(p(B)?" danger":null),w(p(x)?" unsaved":null)].join(""))},Ye(new U(null,4,5,V,[te(React.DOM.div,{className:"info"},Ye(new U(null,1,5,V,[te(React.DOM.div,{className:"path-row"},Ye(new U(null,2,5,V,["JSON PATH: ",te(React.DOM.span,{className:"path"},Ye(new U(null,1,5,V,[r],null)))],null)))],null))),function(){var a={ref:"host",className:"editor-host",onKeyDown:Yk(G)};return React.DOM.div(a)}(),te(React.DOM.div,{className:"docs"},Ye(new U(null,2,5,V,["docs: ",React.DOM.a({target:"_blank",
href:"https://github.com/darwin/faceboard/wiki/format"},"https://github.com/darwin/faceboard/wiki/format")],null))),te(React.DOM.div,{className:"buttons"},Ye(new U(null,3,5,V,[te(React.DOM.div,{className:"button hint",title:"Save model and update the app.",onClick:Yk(F)},Ye(new U(null,1,5,V,[p(Co)?"save (CMD+S)":"save (CTRL+S)"],null))),p(B)?function(){So("Someone else just modified this data behind your back!");var N={className:"button refresh",title:"This will throw away your changes since last save.",
onClick:Yk(function(a,b,e){return function(){Uo(e);var a=d.Xb,b;b=un.h(a);b=Nd.h?Nd.h(b):Nd.call(null,b);return wn.j(a,b,!0)}}(g,r,v,x,B,F,G,e,a,b))};return React.DOM.div(N,"discard my changes")}():null,function(){var a={className:"button hint",title:"Close editor.",onClick:Yk(Yo)};return React.DOM.div(a,"close (ESC)")}()],null)))],null)))}}(a,b),Qo.prototype.od=!0,Qo.prototype.lc=function(a,b){return function(){var d=this,e=function(){var a;a=d.Xb.refs;a=p(a)?a.host.getDOMNode():null;var b={lineWrapping:!0,
gutters:["CodeMirror-linenumbers","CodeMirror-foldgutter"],foldGutter:!0,matchBrackets:!0,smartIndent:!0,value:bf(d.data,new U(null,2,5,V,[Pj,Vj],null),""),mode:{name:"javascript",json:!0},viewportMargin:Infinity,lint:!0,lineNumbers:!0,styleActiveLine:!0,autoCloseBrackets:!0};return CodeMirror(a,b)}(),g=e.defaultCharWidth.call(e);e.on.call(e,"renderLine",function(a,b,d,e,g,h){return function(k,l,n){var q=function(){return function(a,b){var d=(new RegExp(a,"g")).exec(b);return p(d)?Q(d[0]):0}}(a,b,
d,e,g,h);l=l.text;k=k.getOption.call(k,"tabSize");k=CodeMirror.countColumn.call(CodeMirror,l,null,k)*b;q=q('".*"\\: "',l);q=k+q*b;n.style.textIndent=[w("-"),w(q),w("px")].join("");return n.style.paddingLeft=[w(d+q),w("px")].join("")}}(e,g,4,this,a,b));return Oo=e}}(a,b),Qo.Hb=function(){return function(){return new U(null,6,5,V,[new C(null,"output-schema47076","output-schema47076",1944194325,null),new C(null,"input-schema47077","input-schema47077",-218536696,null),new C(null,"editor-component","editor-component",
1191234199,null),new C(null,"data","data",1407862150,null),new C(null,"owner","owner",1247919588,null),new C(null,"meta47098","meta47098",1643467213,null)],null)}}(a,b),Qo.pb=!0,Qo.ob="editor.views.editor/t47097",Qo.Bb=function(){return function(a,b){return Nb(b,"editor.views.editor/t47097")}}(a,b));return new Qo(a,b,d,e,g,null)}}(yl,bp);ml(cp,bm(yl,new U(null,1,5,V,[bp],null)));var dp,ep=new U(null,3,5,V,[Xl(yl,new C(null,"data","data",1407862150,null)),Xl(yl,new C(null,"_","_",-1201019570,null)),Xl(yl,new C(null,"_","_",-1201019570,null))],null),fp=function(a,b){return function d(e,g,h){"undefined"===typeof dp&&(dp=function(a,b,d,e,g,h){this.Md=a;this.ed=b;this.fd=d;this.data=e;this.Ca=g;this.jd=h;this.w=393216;this.F=0},dp.prototype.O=function(){return function(a,b){return new dp(this.Md,this.ed,this.fd,this.data,this.Ca,b)}}(a,b),dp.prototype.N=function(){return function(){return this.jd}}(a,
b),dp.prototype.Vb=!0,dp.prototype.Lb=function(){return function(){return"main-component"}}(a,b),dp.prototype.Wb=!0,dp.prototype.Mb=function(){return function(){var a;try{a=!1}catch(b){if(b instanceof Object)console.warn("disable the popup blocker"),a=!0;else throw b;}if(Da(a)){a=React.DOM.div;var d=V,e=Pj.h(this.data),e=so(cp,e,null),g;g=zj.h(this.data);g=so(xo,g,null);a=te(a,{className:"editor-main"},Ye(new U(null,2,5,d,[e,g],null)))}else a=te(React.DOM.div,{className:"editor-main"},Ye(new U(null,
1,5,V,[te(React.DOM.div,{className:"warning"},Ye(new U(null,8,5,V,["Please disable popup blocking for this domain.",React.DOM.br(null),""+w(location.host),React.DOM.br(null),React.DOM.br(null),"Then ",React.DOM.a({href:"javascript:window.close()"},"close this popup")," and then open Faceboard Editor again."],null)))],null)));return a}}(a,b),dp.Hb=function(){return function(){return new U(null,6,5,V,[new C(null,"output-schema47134","output-schema47134",-1294250327,null),new C(null,"input-schema47135",
"input-schema47135",-1060825054,null),new C(null,"main-component","main-component",-40016256,null),new C(null,"data","data",1407862150,null),new C(null,"_","_",-1201019570,null),new C(null,"meta47147","meta47147",1962289100,null)],null)}}(a,b),dp.pb=!0,dp.ob="editor.views.main/t47146",dp.Bb=function(){return function(a,b){return Nb(b,"editor.views.main/t47146")}}(a,b));return new dp(a,b,d,e,h,null)}}(yl,ep);ml(fp,bm(yl,new U(null,1,5,V,[ep],null)));qa=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new E(e,0)}return b.call(this,d)}function b(a){return console.log.apply(console,Oa?Ka(a):Ja.call(null,a))}a.H=0;a.I=function(a){a=D(a);return b(a)};a.B=b;return a}();
(function(a,b,c){var d=ud(c)?se(Je,c):c,e=cd(d,nk),g=cd(d,Kk),h=cd(d,hh),k=cd(d,Kh),l=cd(d,wh),n=cd(d,li),q=cd(d,Wj),r=L.h?L.h(po):L.call(null,po);yd(r,e)&&cd(r,e).call(null);null==Qg&&(Qg=Ie?Ie(0):He.call(null,0));r=wc([w("G__"),w(Oe.c(Qg,Fc))].join(""));b=(b?b.F&16384||b.Rd||(b.F?0:t(dc,b)):t(dc,b))?b:Ie?Ie(b):He.call(null,b);var v=to(b,r,g),x=p(n)?n:Nd,B=T.B(d,nk,Rc([Kk,hh,li,Wj],0)),F=Ie?Ie(null):He.call(null,null),G=function(b,c,d,e,g,h,k,l,n,q,r,v,x,B){return function Xa(){Oe.j(no,jd,Xa);var c=
L.h?L.h(d):L.call(null,d),k=function(){var a=uo(null==v?Hn(c,d,Zc):Hn(af(c,v),d,v),b);return e.h?e.h(a):e.call(null,a)}();if(!p(Qn(d,b,Vh))){var l=Uk(function(){var c=Qm,e=Pm,h=Rm,l=Sm;Qm=B;Pm=x;Rm=d;Sm=b;try{return so(a,k,g)}finally{Sm=l,Rm=h,Pm=e,Qm=c}}(),q);null==(L.h?L.h(h):L.call(null,h))&&(Ne.c?Ne.c(h,l):Ne.call(null,h,l))}l=xn(d);zn(d);if(!kd(l))for(var l=D(l),n=null,r=0,F=0;;)if(F<r){var G=n.V(null,F);if(p(G.isMounted())){var P=G.state.__om_next_cursor;p(P)&&(G.props.__om_cursor=P,G.state.__om_next_cursor=
null);p(function(){var a=Wn(G);return(a=!(a?p(p(null)?null:a.md)||(a.Y?0:t(rn,a)):t(rn,a)))?a:G.shouldComponentUpdate(G.props,G.state)}())&&G.forceUpdate()}F+=1}else if(l=D(l)){n=l;if(qd(n))l=Zb(n),F=bc(n),n=l,r=Q(l),l=F;else{var ua=H(n);p(ua.isMounted())&&(l=ua.state.__om_next_cursor,p(l)&&(ua.props.__om_cursor=l,ua.state.__om_next_cursor=null),p(function(){var a=Wn(ua);return(a=!(a?p(p(null)?null:a.md)||(a.Y?0:t(rn,a)):t(rn,a)))?a:ua.shouldComponentUpdate(ua.props,ua.state)}())&&ua.forceUpdate());
l=J(n);n=null;r=0}F=0}else break;l=L.h?L.h(lo):L.call(null,lo);if(!kd(l))for(l=D(l),n=null,F=r=0;;)if(F<r){P=n.V(null,F);R(P,0);for(var La=R(P,1),P=function(){var a=La;return L.h?L.h(a):L.call(null,a)}(),P=D(P),ia=null,Yc=0,Le=0;;)if(Le<Yc){var Ud=ia.V(null,Le);R(Ud,0);Ud=R(Ud,1);p(Ud.shouldComponentUpdate(Ud.props,Ud.state))&&Ud.forceUpdate();Le+=1}else if(P=D(P))qd(P)?(Yc=Zb(P),P=bc(P),ia=Yc,Yc=Q(Yc)):(ia=H(P),R(ia,0),ia=R(ia,1),p(ia.shouldComponentUpdate(ia.props,ia.state))&&ia.forceUpdate(),P=
J(P),ia=null,Yc=0),Le=0;else break;F+=1}else if(l=D(l)){if(qd(l))r=Zb(l),l=bc(l),n=r,r=Q(r);else{n=H(l);R(n,0);for(var No=R(n,1),n=function(){var a=No;return L.h?L.h(a):L.call(null,a)}(),n=D(n),r=null,P=F=0;;)if(P<F)ia=r.V(null,P),R(ia,0),ia=R(ia,1),p(ia.shouldComponentUpdate(ia.props,ia.state))&&ia.forceUpdate(),P+=1;else if(n=D(n))qd(n)?(F=Zb(n),n=bc(n),r=F,F=Q(F)):(r=H(n),R(r,0),r=R(r,1),p(r.shouldComponentUpdate(r.props,r.state))&&r.forceUpdate(),n=J(n),r=null,F=0),P=0;else break;l=J(l);n=null;
r=0}F=0}else break;On(d,b,Vh,!0);return L.h?L.h(h):L.call(null,h)}}(r,b,v,x,B,F,c,d,d,e,g,h,k,l,n,q);Pg(v,r,function(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G){return function(Mb,$b,ac,uc){Da(Qn(c,a,cj))&&ac!==uc&&On(c,a,Vh,!1);On(c,a,cj,!1);yd(L.h?L.h(no):L.call(null,no),h)||Oe.j(no,Xc,h);if(p(mo))return null;mo=!0;return!1===G||"undefined"===typeof requestAnimationFrame?setTimeout(function(a,b,c){return function(){return oo(c)}}(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G),16):fd(G)?G.G?G.G():G.call(null):requestAnimationFrame(function(a,
b,c){return function(){return oo(c)}}(a,b,c,d,e,g,h,k,l,n,q,r,v,x,B,F,G))}}(r,b,v,x,B,F,G,c,d,d,e,g,h,k,l,n,q));Oe.K(po,S,e,function(a,b,c,d,e,g,h,k,l,n,q){return function(){Pn(c,a);Sb(c,a);Mn(c,a);Oe.j(no,jd,h);Oe.j(po,T,q);return React.unmountComponentAtNode(q)}}(r,b,v,x,B,F,G,c,d,d,e,g,h,k,l,n,q));return G()})(fp,Ok,new va(null,1,[nk,document.getElementById("app")],null));var gp=window.opener;if(p(gp)){var hp=gp.faceboardPerformRefresh;p(hp)&&(hp.G?hp.G():hp.call(null))}else console.error("no opener!");
})();

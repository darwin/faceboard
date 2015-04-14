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
var f,aa=this;
function m(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}var ba="closure_uid_"+(1E9*Math.random()>>>0),ca=0;function da(a){return Array.prototype.join.call(arguments,"")}function ea(a,b){return a<b?-1:a>b?1:0};function fa(a,b){for(var c in a)b.call(void 0,a[c],c,a)}var ga="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function ha(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var g=0;g<ga.length;g++)c=ga[g],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};function ia(a,b){null!=a&&this.append.apply(this,arguments)}f=ia.prototype;f.bb="";f.set=function(a){this.bb=""+a};f.append=function(a,b,c){this.bb+=a;if(null!=b)for(var d=1;d<arguments.length;d++)this.bb+=arguments[d];return this};f.clear=function(){this.bb=""};f.toString=function(){return this.bb};function ja(a,b){a.sort(b||na)}function oa(a,b){for(var c=0;c<a.length;c++)a[c]={index:c,value:a[c]};var d=b||na;ja(a,function(a,b){return d(a.value,b.value)||a.index-b.index});for(c=0;c<a.length;c++)a[c]=a[c].value}function na(a,b){return a>b?1:a<b?-1:0};if("undefined"===typeof pa)var pa=function(){throw Error("No *print-fn* fn set for evaluation environment");};var qa=null;if("undefined"===typeof ra)var ra=null;function sa(){return new r(null,5,[ta,!0,ua,!0,va,!1,wa,!1,xa,null],null)}function u(a){return null!=a&&!1!==a}function ya(a){return null==a}function za(a){return a instanceof Array}function Aa(a){return u(a)?!1:!0}function Ba(a){return"string"==typeof a}function v(a,b){return a[m(null==b?null:b)]?!0:a._?!0:!1}
function Da(a){return null==a?null:a.constructor}function w(a,b){var c=Da(b),c=u(u(c)?c.lb:c)?c.kb:m(b);return Error(["No protocol method ",a," defined for type ",c,": ",b].join(""))}function Ea(a){var b=a.kb;return u(b)?b:""+x(a)}var Ga="undefined"!==typeof Symbol&&"function"===m(Symbol)?Symbol.iterator:"@@iterator";function Ha(a){for(var b=a.length,c=Array(b),d=0;;)if(d<b)c[d]=a[d],d+=1;else break;return c}
function Ia(){switch(arguments.length){case 1:return Ja(arguments[0]);case 2:return Ja(arguments[1]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}}function Ka(a){return Ja(a)}function Ja(a){function b(a,b){a.push(b);return a}var c=[];return La?La(b,c,a):Ma.call(null,b,c,a)}
var Na={},Oa={},Pa={},Qa=function Qa(b){if(b?b.T:b)return b.T(b);var c;c=Qa[m(null==b?null:b)];if(!c&&(c=Qa._,!c))throw w("ICloneable.-clone",b);return c.call(null,b)},Ra={},Sa=function Sa(b){if(b?b.N:b)return b.N(b);var c;c=Sa[m(null==b?null:b)];if(!c&&(c=Sa._,!c))throw w("ICounted.-count",b);return c.call(null,b)},Ua=function Ua(b){if(b?b.W:b)return b.W(b);var c;c=Ua[m(null==b?null:b)];if(!c&&(c=Ua._,!c))throw w("IEmptyableCollection.-empty",b);return c.call(null,b)},Va={},y=function y(b,c){if(b?
b.L:b)return b.L(b,c);var d;d=y[m(null==b?null:b)];if(!d&&(d=y._,!d))throw w("ICollection.-conj",b);return d.call(null,b,c)},Wa={},A=function A(){switch(arguments.length){case 2:return A.c(arguments[0],arguments[1]);case 3:return A.h(arguments[0],arguments[1],arguments[2]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};A.c=function(a,b){if(a?a.P:a)return a.P(a,b);var c;c=A[m(null==a?null:a)];if(!c&&(c=A._,!c))throw w("IIndexed.-nth",a);return c.call(null,a,b)};
A.h=function(a,b,c){if(a?a.na:a)return a.na(a,b,c);var d;d=A[m(null==a?null:a)];if(!d&&(d=A._,!d))throw w("IIndexed.-nth",a);return d.call(null,a,b,c)};A.B=3;
var Xa={},Ya=function Ya(b){if(b?b.aa:b)return b.aa(b);var c;c=Ya[m(null==b?null:b)];if(!c&&(c=Ya._,!c))throw w("ISeq.-first",b);return c.call(null,b)},Za=function Za(b){if(b?b.oa:b)return b.oa(b);var c;c=Za[m(null==b?null:b)];if(!c&&(c=Za._,!c))throw w("ISeq.-rest",b);return c.call(null,b)},ab={},bb={},cb=function cb(){switch(arguments.length){case 2:return cb.c(arguments[0],arguments[1]);case 3:return cb.h(arguments[0],arguments[1],arguments[2]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));
}};cb.c=function(a,b){if(a?a.G:a)return a.G(a,b);var c;c=cb[m(null==a?null:a)];if(!c&&(c=cb._,!c))throw w("ILookup.-lookup",a);return c.call(null,a,b)};cb.h=function(a,b,c){if(a?a.C:a)return a.C(a,b,c);var d;d=cb[m(null==a?null:a)];if(!d&&(d=cb._,!d))throw w("ILookup.-lookup",a);return d.call(null,a,b,c)};cb.B=3;
var db={},eb=function eb(b,c){if(b?b.qb:b)return b.qb(b,c);var d;d=eb[m(null==b?null:b)];if(!d&&(d=eb._,!d))throw w("IAssociative.-contains-key?",b);return d.call(null,b,c)},fb=function fb(b,c,d){if(b?b.$:b)return b.$(b,c,d);var e;e=fb[m(null==b?null:b)];if(!e&&(e=fb._,!e))throw w("IAssociative.-assoc",b);return e.call(null,b,c,d)},gb={},hb=function hb(b,c){if(b?b.ka:b)return b.ka(b,c);var d;d=hb[m(null==b?null:b)];if(!d&&(d=hb._,!d))throw w("IMap.-dissoc",b);return d.call(null,b,c)},ib={},jb=function jb(b){if(b?
b.Nb:b)return b.Nb();var c;c=jb[m(null==b?null:b)];if(!c&&(c=jb._,!c))throw w("IMapEntry.-key",b);return c.call(null,b)},kb=function kb(b){if(b?b.Ob:b)return b.Ob();var c;c=kb[m(null==b?null:b)];if(!c&&(c=kb._,!c))throw w("IMapEntry.-val",b);return c.call(null,b)},lb={},mb=function mb(b,c){if(b?b.Xb:b)return b.Xb(0,c);var d;d=mb[m(null==b?null:b)];if(!d&&(d=mb._,!d))throw w("ISet.-disjoin",b);return d.call(null,b,c)},nb={},pb=function pb(b,c,d){if(b?b.Pb:b)return b.Pb(b,c,d);var e;e=pb[m(null==b?
null:b)];if(!e&&(e=pb._,!e))throw w("IVector.-assoc-n",b);return e.call(null,b,c,d)},qb=function qb(b){if(b?b.ib:b)return b.ib(b);var c;c=qb[m(null==b?null:b)];if(!c&&(c=qb._,!c))throw w("IDeref.-deref",b);return c.call(null,b)},rb={},ub=function ub(b){if(b?b.I:b)return b.I(b);var c;c=ub[m(null==b?null:b)];if(!c&&(c=ub._,!c))throw w("IMeta.-meta",b);return c.call(null,b)},vb={},wb=function wb(b,c){if(b?b.J:b)return b.J(b,c);var d;d=wb[m(null==b?null:b)];if(!d&&(d=wb._,!d))throw w("IWithMeta.-with-meta",
b);return d.call(null,b,c)},xb={},Ab=function Ab(){switch(arguments.length){case 2:return Ab.c(arguments[0],arguments[1]);case 3:return Ab.h(arguments[0],arguments[1],arguments[2]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};Ab.c=function(a,b){if(a?a.ca:a)return a.ca(a,b);var c;c=Ab[m(null==a?null:a)];if(!c&&(c=Ab._,!c))throw w("IReduce.-reduce",a);return c.call(null,a,b)};
Ab.h=function(a,b,c){if(a?a.da:a)return a.da(a,b,c);var d;d=Ab[m(null==a?null:a)];if(!d&&(d=Ab._,!d))throw w("IReduce.-reduce",a);return d.call(null,a,b,c)};Ab.B=3;
var Bb=function Bb(b,c){if(b?b.v:b)return b.v(b,c);var d;d=Bb[m(null==b?null:b)];if(!d&&(d=Bb._,!d))throw w("IEquiv.-equiv",b);return d.call(null,b,c)},Cb=function Cb(b){if(b?b.K:b)return b.K(b);var c;c=Cb[m(null==b?null:b)];if(!c&&(c=Cb._,!c))throw w("IHash.-hash",b);return c.call(null,b)},Db={},Fb=function Fb(b){if(b?b.M:b)return b.M(b);var c;c=Fb[m(null==b?null:b)];if(!c&&(c=Fb._,!c))throw w("ISeqable.-seq",b);return c.call(null,b)},Gb={},Hb={},Ib=function Ib(b,c){if(b?b.bc:b)return b.bc(0,c);
var d;d=Ib[m(null==b?null:b)];if(!d&&(d=Ib._,!d))throw w("IWriter.-write",b);return d.call(null,b,c)},Jb={},Lb=function Lb(b,c,d){if(b?b.H:b)return b.H(b,c,d);var e;e=Lb[m(null==b?null:b)];if(!e&&(e=Lb._,!e))throw w("IPrintWithWriter.-pr-writer",b);return e.call(null,b,c,d)},Mb=function Mb(b,c,d){if(b?b.$b:b)return b.$b(0,c,d);var e;e=Mb[m(null==b?null:b)];if(!e&&(e=Mb._,!e))throw w("IWatchable.-notify-watches",b);return e.call(null,b,c,d)},Nb=function Nb(b,c,d){if(b?b.Zb:b)return b.Zb(0,c,d);var e;
e=Nb[m(null==b?null:b)];if(!e&&(e=Nb._,!e))throw w("IWatchable.-add-watch",b);return e.call(null,b,c,d)},Ob=function Ob(b,c){if(b?b.ac:b)return b.ac(0,c);var d;d=Ob[m(null==b?null:b)];if(!d&&(d=Ob._,!d))throw w("IWatchable.-remove-watch",b);return d.call(null,b,c)},Pb=function Pb(b){if(b?b.jb:b)return b.jb(b);var c;c=Pb[m(null==b?null:b)];if(!c&&(c=Pb._,!c))throw w("IEditableCollection.-as-transient",b);return c.call(null,b)},Qb=function Qb(b,c){if(b?b.cb:b)return b.cb(b,c);var d;d=Qb[m(null==b?null:
b)];if(!d&&(d=Qb._,!d))throw w("ITransientCollection.-conj!",b);return d.call(null,b,c)},Rb=function Rb(b){if(b?b.eb:b)return b.eb(b);var c;c=Rb[m(null==b?null:b)];if(!c&&(c=Rb._,!c))throw w("ITransientCollection.-persistent!",b);return c.call(null,b)},Tb=function Tb(b,c,d){if(b?b.vb:b)return b.vb(b,c,d);var e;e=Tb[m(null==b?null:b)];if(!e&&(e=Tb._,!e))throw w("ITransientAssociative.-assoc!",b);return e.call(null,b,c,d)},Ub=function Ub(b,c,d){if(b?b.Yb:b)return b.Yb(0,c,d);var e;e=Ub[m(null==b?null:
b)];if(!e&&(e=Ub._,!e))throw w("ITransientVector.-assoc-n!",b);return e.call(null,b,c,d)},Vb=function Vb(b){if(b?b.Ub:b)return b.Ub();var c;c=Vb[m(null==b?null:b)];if(!c&&(c=Vb._,!c))throw w("IChunk.-drop-first",b);return c.call(null,b)},Wb=function Wb(b){if(b?b.Lb:b)return b.Lb(b);var c;c=Wb[m(null==b?null:b)];if(!c&&(c=Wb._,!c))throw w("IChunkedSeq.-chunked-first",b);return c.call(null,b)},Xb=function Xb(b){if(b?b.Mb:b)return b.Mb(b);var c;c=Xb[m(null==b?null:b)];if(!c&&(c=Xb._,!c))throw w("IChunkedSeq.-chunked-rest",
b);return c.call(null,b)},Yb=function Yb(b){if(b?b.Kb:b)return b.Kb(b);var c;c=Yb[m(null==b?null:b)];if(!c&&(c=Yb._,!c))throw w("IChunkedNext.-chunked-next",b);return c.call(null,b)},Zb={},$b=function $b(b,c){if(b?b.Wc:b)return b.Wc(b,c);var d;d=$b[m(null==b?null:b)];if(!d&&(d=$b._,!d))throw w("IReset.-reset!",b);return d.call(null,b,c)},ac=function ac(){switch(arguments.length){case 2:return ac.c(arguments[0],arguments[1]);case 3:return ac.h(arguments[0],arguments[1],arguments[2]);case 4:return ac.F(arguments[0],
arguments[1],arguments[2],arguments[3]);case 5:return ac.X(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};ac.c=function(a,b){if(a?a.Xc:a)return a.Xc(a,b);var c;c=ac[m(null==a?null:a)];if(!c&&(c=ac._,!c))throw w("ISwap.-swap!",a);return c.call(null,a,b)};ac.h=function(a,b,c){if(a?a.Yc:a)return a.Yc(a,b,c);var d;d=ac[m(null==a?null:a)];if(!d&&(d=ac._,!d))throw w("ISwap.-swap!",a);return d.call(null,a,b,c)};
ac.F=function(a,b,c,d){if(a?a.Zc:a)return a.Zc(a,b,c,d);var e;e=ac[m(null==a?null:a)];if(!e&&(e=ac._,!e))throw w("ISwap.-swap!",a);return e.call(null,a,b,c,d)};ac.X=function(a,b,c,d,e){if(a?a.$c:a)return a.$c(a,b,c,d,e);var g;g=ac[m(null==a?null:a)];if(!g&&(g=ac._,!g))throw w("ISwap.-swap!",a);return g.call(null,a,b,c,d,e)};ac.B=5;var bc=function bc(b){if(b?b.tb:b)return b.tb(b);var c;c=bc[m(null==b?null:b)];if(!c&&(c=bc._,!c))throw w("IIterable.-iterator",b);return c.call(null,b)};
function cc(a){this.Yd=a;this.w=0;this.n=1073741824}cc.prototype.bc=function(a,b){return this.Yd.append(b)};function dc(a){var b=new ia;a.H(null,new cc(b),sa());return""+x(b)}var ec="undefined"!==typeof Math.imul&&0!==(Math.imul.c?Math.imul.c(4294967295,5):Math.imul.call(null,4294967295,5))?function(a,b){return Math.imul.c?Math.imul.c(a,b):Math.imul.call(null,a,b)}:function(a,b){var c=a&65535,d=b&65535;return c*d+((a>>>16&65535)*d+c*(b>>>16&65535)<<16>>>0)|0};
function fc(a){a=ec(a|0,-862048943);return ec(a<<15|a>>>-15,461845907)}function ic(a,b){var c=(a|0)^(b|0);return ec(c<<13|c>>>-13,5)+-430675100|0}function jc(a,b){var c=(a|0)^b,c=ec(c^c>>>16,-2048144789),c=ec(c^c>>>13,-1028477387);return c^c>>>16}function kc(a){var b;a:{b=1;for(var c=0;;)if(b<a.length){var d=b+2,c=ic(c,fc(a.charCodeAt(b-1)|a.charCodeAt(b)<<16));b=d}else{b=c;break a}}b=1===(a.length&1)?b^fc(a.charCodeAt(a.length-1)):b;return jc(b,ec(2,a.length))}var lc={},mc=0;
function nc(a){255<mc&&(lc={},mc=0);var b=lc[a];if("number"!==typeof b){a:if(null!=a)if(b=a.length,0<b)for(var c=0,d=0;;)if(c<b)var e=c+1,d=ec(31,d)+a.charCodeAt(c),c=e;else{b=d;break a}else b=0;else b=0;lc[a]=b;mc+=1}return a=b}
function oc(a){a&&(a.n&4194304||a.ie)?a=a.K(null):"number"===typeof a?a=(Math.floor.e?Math.floor.e(a):Math.floor.call(null,a))%2147483647:!0===a?a=1:!1===a?a=0:"string"===typeof a?(a=nc(a),0!==a&&(a=fc(a),a=ic(0,a),a=jc(a,4))):a=a instanceof Date?a.valueOf():null==a?0:Cb(a);return a}function pc(a,b){return a^b+2654435769+(a<<6)+(a>>2)}function qc(a){return a instanceof C}
function rc(a,b){if(a.Ga===b.Ga)return 0;var c=Aa(a.ha);if(u(c?b.ha:c))return-1;if(u(a.ha)){if(Aa(b.ha))return 1;c=na(a.ha,b.ha);return 0===c?na(a.name,b.name):c}return na(a.name,b.name)}function C(a,b,c,d,e){this.ha=a;this.name=b;this.Ga=c;this.hb=d;this.ja=e;this.n=2154168321;this.w=4096}f=C.prototype;f.H=function(a,b){return Ib(b,this.Ga)};f.K=function(){var a=this.hb;return null!=a?a:this.hb=a=pc(kc(this.name),nc(this.ha))};f.J=function(a,b){return new C(this.ha,this.name,this.Ga,this.hb,b)};
f.I=function(){return this.ja};f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return cb.h(c,this,null);case 3:return cb.h(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return cb.h(c,this,null)};a.h=function(a,c,d){return cb.h(c,this,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};f.e=function(a){return cb.h(a,this,null)};f.c=function(a,b){return cb.h(a,this,b)};
f.v=function(a,b){return b instanceof C?this.Ga===b.Ga:!1};f.toString=function(){return this.Ga};f.equiv=function(a){return this.v(null,a)};function sc(a){return a instanceof C?a:new C(null,a,a,null,null)}function D(a){if(null==a)return null;if(a&&(a.n&8388608||a.ke))return a.M(null);if(za(a)||"string"===typeof a)return 0===a.length?null:new E(a,0);if(v(Db,a))return Fb(a);throw Error([x(a),x(" is not ISeqable")].join(""));}
function G(a){if(null==a)return null;if(a&&(a.n&64||a.ub))return a.aa(null);a=D(a);return null==a?null:Ya(a)}function tc(a){return null!=a?a&&(a.n&64||a.ub)?a.oa(null):(a=D(a))?Za(a):H:H}function I(a){return null==a?null:a&&(a.n&128||a.Cb)?a.ea(null):D(tc(a))}var K=function K(){switch(arguments.length){case 1:return K.e(arguments[0]);case 2:return K.c(arguments[0],arguments[1]);default:return K.t(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};K.e=function(){return!0};
K.c=function(a,b){return null==a?null==b:a===b||Bb(a,b)};K.t=function(a,b,c){for(;;)if(K.c(a,b))if(I(c))a=b,b=G(c),c=I(c);else return K.c(b,G(c));else return!1};K.D=function(a){var b=G(a),c=I(a);a=G(c);c=I(c);return K.t(b,a,c)};K.B=2;function uc(a){this.s=a}uc.prototype.next=function(){if(null!=this.s){var a=G(this.s);this.s=I(this.s);return{done:!1,value:a}}return{done:!0,value:null}};function vc(a){return new uc(D(a))}function wc(a,b){var c=fc(a),c=ic(0,c);return jc(c,b)}
function xc(a){var b=0,c=1;for(a=D(a);;)if(null!=a)b+=1,c=ec(31,c)+oc(G(a))|0,a=I(a);else return wc(c,b)}var yc=wc(1,0);function zc(a){var b=0,c=0;for(a=D(a);;)if(null!=a)b+=1,c=c+oc(G(a))|0,a=I(a);else return wc(c,b)}var Bc=wc(0,0);Ra["null"]=!0;Sa["null"]=function(){return 0};Date.prototype.rb=!0;Date.prototype.sb=function(a,b){return na(this.valueOf(),b.valueOf())};Date.prototype.Pc=!0;Date.prototype.v=function(a,b){return b instanceof Date&&this.valueOf()===b.valueOf()};
Bb.number=function(a,b){return a===b};rb["function"]=!0;ub["function"]=function(){return null};Na["function"]=!0;Cb._=function(a){return a[ba]||(a[ba]=++ca)};function Cc(a){return a+1}function L(a){return qb(a)}function Dc(a,b){var c=Sa(a);if(0===c)return b.A?b.A():b.call(null);for(var d=A.c(a,0),e=1;;)if(e<c)var g=A.c(a,e),d=b.c?b.c(d,g):b.call(null,d,g),e=e+1;else return d}function Ec(a,b,c){var d=Sa(a),e=c;for(c=0;;)if(c<d){var g=A.c(a,c),e=b.c?b.c(e,g):b.call(null,e,g);c+=1}else return e}
function Fc(a,b){var c=a.length;if(0===a.length)return b.A?b.A():b.call(null);for(var d=a[0],e=1;;)if(e<c)var g=a[e],d=b.c?b.c(d,g):b.call(null,d,g),e=e+1;else return d}function Gc(a,b,c){var d=a.length,e=c;for(c=0;;)if(c<d){var g=a[c],e=b.c?b.c(e,g):b.call(null,e,g);c+=1}else return e}function Hc(a,b,c,d){for(var e=a.length;;)if(d<e){var g=a[d];c=b.c?b.c(c,g):b.call(null,c,g);d+=1}else return c}function Ic(a){return a?a.n&2||a.Kc?!0:a.n?!1:v(Ra,a):v(Ra,a)}
function Jc(a){return a?a.n&16||a.Vb?!0:a.n?!1:v(Wa,a):v(Wa,a)}function Kc(a,b){this.j=a;this.i=b}Kc.prototype.Db=function(){return this.i<this.j.length};Kc.prototype.next=function(){var a=this.j[this.i];this.i+=1;return a};function E(a,b){this.j=a;this.i=b;this.n=166199550;this.w=8192}f=E.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.P=function(a,b){var c=b+this.i;return c<this.j.length?this.j[c]:null};
f.na=function(a,b,c){a=b+this.i;return a<this.j.length?this.j[a]:c};f.tb=function(){return new Kc(this.j,this.i)};f.T=function(){return new E(this.j,this.i)};f.ea=function(){return this.i+1<this.j.length?new E(this.j,this.i+1):null};f.N=function(){return this.j.length-this.i};f.K=function(){return xc(this)};f.v=function(a,b){return Lc.c?Lc.c(this,b):Lc.call(null,this,b)};f.W=function(){return H};f.ca=function(a,b){return Hc(this.j,b,this.j[this.i],this.i+1)};
f.da=function(a,b,c){return Hc(this.j,b,c,this.i)};f.aa=function(){return this.j[this.i]};f.oa=function(){return this.i+1<this.j.length?new E(this.j,this.i+1):H};f.M=function(){return this};f.L=function(a,b){return M.c?M.c(b,this):M.call(null,b,this)};E.prototype[Ga]=function(){return vc(this)};function Mc(a,b){return b<a.length?new E(a,b):null}
function N(){switch(arguments.length){case 1:return Mc(arguments[0],0);case 2:return Mc(arguments[0],arguments[1]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}}function Nc(a){return G(I(a))}Bb._=function(a,b){return a===b};var Oc=function Oc(){switch(arguments.length){case 0:return Oc.A();case 1:return Oc.e(arguments[0]);case 2:return Oc.c(arguments[0],arguments[1]);default:return Oc.t(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};
Oc.A=function(){return Pc};Oc.e=function(a){return a};Oc.c=function(a,b){return null!=a?y(a,b):y(H,b)};Oc.t=function(a,b,c){for(;;)if(u(c))a=Oc.c(a,b),b=G(c),c=I(c);else return Oc.c(a,b)};Oc.D=function(a){var b=G(a),c=I(a);a=G(c);c=I(c);return Oc.t(b,a,c)};Oc.B=2;function Qc(a){return null==a?null:Ua(a)}
function R(a){if(null!=a)if(a&&(a.n&2||a.Kc))a=a.N(null);else if(za(a))a=a.length;else if("string"===typeof a)a=a.length;else if(v(Ra,a))a=Sa(a);else a:{a=D(a);for(var b=0;;){if(Ic(a)){a=b+Sa(a);break a}a=I(a);b+=1}}else a=0;return a}function Rc(a,b){for(var c=null;;){if(null==a)return c;if(0===b)return D(a)?G(a):c;if(Jc(a))return A.h(a,b,c);if(D(a)){var d=I(a),e=b-1;a=d;b=e}else return c}}
function Sc(a,b){if("number"!==typeof b)throw Error("index argument to nth must be a number");if(null==a)return a;if(a&&(a.n&16||a.Vb))return a.P(null,b);if(za(a)||"string"===typeof a)return b<a.length?a[b]:null;if(v(Wa,a))return A.c(a,b);if(a?a.n&64||a.ub||(a.n?0:v(Xa,a)):v(Xa,a)){var c;a:{c=a;for(var d=b;;){if(null==c)throw Error("Index out of bounds");if(0===d){if(D(c)){c=G(c);break a}throw Error("Index out of bounds");}if(Jc(c)){c=A.c(c,d);break a}if(D(c))c=I(c),--d;else throw Error("Index out of bounds");
}}return c}throw Error([x("nth not supported on this type "),x(Ea(Da(a)))].join(""));}function S(a,b){if("number"!==typeof b)throw Error("index argument to nth must be a number.");if(null==a)return null;if(a&&(a.n&16||a.Vb))return a.na(null,b,null);if(za(a)||"string"===typeof a)return b<a.length?a[b]:null;if(v(Wa,a))return A.c(a,b);if(a?a.n&64||a.ub||(a.n?0:v(Xa,a)):v(Xa,a))return Rc(a,b);throw Error([x("nth not supported on this type "),x(Ea(Da(a)))].join(""));}
function Tc(a,b){return null==a?null:a&&(a.n&256||a.Wb)?a.G(null,b):za(a)?b<a.length?a[b]:null:"string"===typeof a?b<a.length?a[b]:null:v(bb,a)?cb.c(a,b):null}function Uc(a,b,c){return null!=a?a&&(a.n&256||a.Wb)?a.C(null,b,c):za(a)?b<a.length?a[b]:c:"string"===typeof a?b<a.length?a[b]:c:v(bb,a)?cb.h(a,b,c):c:c}
var T=function T(){switch(arguments.length){case 3:return T.h(arguments[0],arguments[1],arguments[2]);default:return T.t(arguments[0],arguments[1],arguments[2],new E(Array.prototype.slice.call(arguments,3),0))}};T.h=function(a,b,c){return null!=a?fb(a,b,c):Vc([b],[c])};T.t=function(a,b,c,d){for(;;)if(a=T.h(a,b,c),u(d))b=G(d),c=Nc(d),d=I(I(d));else return a};T.D=function(a){var b=G(a),c=I(a);a=G(c);var d=I(c),c=G(d),d=I(d);return T.t(b,a,c,d)};T.B=3;
var U=function U(){switch(arguments.length){case 1:return U.e(arguments[0]);case 2:return U.c(arguments[0],arguments[1]);default:return U.t(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};U.e=function(a){return a};U.c=function(a,b){return null==a?null:hb(a,b)};U.t=function(a,b,c){for(;;){if(null==a)return null;a=U.c(a,b);if(u(c))b=G(c),c=I(c);else return a}};U.D=function(a){var b=G(a),c=I(a);a=G(c);c=I(c);return U.t(b,a,c)};U.B=2;
function Wc(a){var b="function"==m(a);return u(b)?b:a?u(u(null)?null:a.Ic)?!0:a.Q?!1:v(Na,a):v(Na,a)}function Xc(a,b){this.k=a;this.meta=b;this.w=0;this.n=393217}f=Xc.prototype;
f.call=function(){function a(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma,O,P,Ta){a=this.k;return Yc.Bb?Yc.Bb(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma,O,P,Ta):Yc.call(null,a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma,O,P,Ta)}function b(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma,O,P){a=this;return a.k.Ra?a.k.Ra(b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma,O,P):a.k.call(null,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma,O,P)}function c(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma,O){a=this;return a.k.Qa?a.k.Qa(b,c,d,e,g,h,k,l,n,p,q,t,z,B,
F,J,Q,ma,O):a.k.call(null,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma,O)}function d(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma){a=this;return a.k.Pa?a.k.Pa(b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma):a.k.call(null,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q,ma)}function e(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q){a=this;return a.k.Oa?a.k.Oa(b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q):a.k.call(null,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J,Q)}function g(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J){a=this;return a.k.Na?a.k.Na(b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J):
a.k.call(null,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J)}function h(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F){a=this;return a.k.Ma?a.k.Ma(b,c,d,e,g,h,k,l,n,p,q,t,z,B,F):a.k.call(null,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F)}function k(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B){a=this;return a.k.La?a.k.La(b,c,d,e,g,h,k,l,n,p,q,t,z,B):a.k.call(null,b,c,d,e,g,h,k,l,n,p,q,t,z,B)}function l(a,b,c,d,e,g,h,k,l,n,p,q,t,z){a=this;return a.k.Ka?a.k.Ka(b,c,d,e,g,h,k,l,n,p,q,t,z):a.k.call(null,b,c,d,e,g,h,k,l,n,p,q,t,z)}function p(a,b,c,d,e,g,h,k,l,
n,p,q,t){a=this;return a.k.Ja?a.k.Ja(b,c,d,e,g,h,k,l,n,p,q,t):a.k.call(null,b,c,d,e,g,h,k,l,n,p,q,t)}function n(a,b,c,d,e,g,h,k,l,n,p,q){a=this;return a.k.Ia?a.k.Ia(b,c,d,e,g,h,k,l,n,p,q):a.k.call(null,b,c,d,e,g,h,k,l,n,p,q)}function q(a,b,c,d,e,g,h,k,l,n,p){a=this;return a.k.Ha?a.k.Ha(b,c,d,e,g,h,k,l,n,p):a.k.call(null,b,c,d,e,g,h,k,l,n,p)}function t(a,b,c,d,e,g,h,k,l,n){a=this;return a.k.Ua?a.k.Ua(b,c,d,e,g,h,k,l,n):a.k.call(null,b,c,d,e,g,h,k,l,n)}function z(a,b,c,d,e,g,h,k,l){a=this;return a.k.Ta?
a.k.Ta(b,c,d,e,g,h,k,l):a.k.call(null,b,c,d,e,g,h,k,l)}function B(a,b,c,d,e,g,h,k){a=this;return a.k.Sa?a.k.Sa(b,c,d,e,g,h,k):a.k.call(null,b,c,d,e,g,h,k)}function F(a,b,c,d,e,g,h){a=this;return a.k.va?a.k.va(b,c,d,e,g,h):a.k.call(null,b,c,d,e,g,h)}function J(a,b,c,d,e,g){a=this;return a.k.X?a.k.X(b,c,d,e,g):a.k.call(null,b,c,d,e,g)}function Q(a,b,c,d,e){a=this;return a.k.F?a.k.F(b,c,d,e):a.k.call(null,b,c,d,e)}function P(a,b,c,d){a=this;return a.k.h?a.k.h(b,c,d):a.k.call(null,b,c,d)}function ma(a,
b,c){a=this;return a.k.c?a.k.c(b,c):a.k.call(null,b,c)}function Ta(a,b){a=this;return a.k.e?a.k.e(b):a.k.call(null,b)}function tb(a){a=this;return a.k.A?a.k.A():a.k.call(null)}var O=null,O=function(O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb,gc,hc,Ac,Hd,oe,Pe,Zf,sh,tj,$f){switch(arguments.length){case 1:return tb.call(this,O);case 2:return Ta.call(this,O,la);case 3:return ma.call(this,O,la,Ca);case 4:return P.call(this,O,la,Ca,Fa);case 5:return Q.call(this,O,la,Ca,Fa,ka);case 6:return J.call(this,O,la,Ca,
Fa,ka,ob);case 7:return F.call(this,O,la,Ca,Fa,ka,ob,sb);case 8:return B.call(this,O,la,Ca,Fa,ka,ob,sb,zb);case 9:return z.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a);case 10:return t.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb);case 11:return q.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb);case 12:return n.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb);case 13:return p.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb,gc);case 14:return l.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb,gc,hc);case 15:return k.call(this,
O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb,gc,hc,Ac);case 16:return h.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb,gc,hc,Ac,Hd);case 17:return g.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb,gc,hc,Ac,Hd,oe);case 18:return e.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb,gc,hc,Ac,Hd,oe,Pe);case 19:return d.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb,gc,hc,Ac,Hd,oe,Pe,Zf);case 20:return c.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb,gc,hc,Ac,Hd,oe,Pe,Zf,sh);case 21:return b.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,
Kb,Sb,Eb,gc,hc,Ac,Hd,oe,Pe,Zf,sh,tj);case 22:return a.call(this,O,la,Ca,Fa,ka,ob,sb,zb,$a,Kb,Sb,Eb,gc,hc,Ac,Hd,oe,Pe,Zf,sh,tj,$f)}throw Error("Invalid arity: "+arguments.length);};O.e=tb;O.c=Ta;O.h=ma;O.F=P;O.X=Q;O.va=J;O.Sa=F;O.Ta=B;O.Ua=z;O.Ha=t;O.Ia=q;O.Ja=n;O.Ka=p;O.La=l;O.Ma=k;O.Na=h;O.Oa=g;O.Pa=e;O.Qa=d;O.Ra=c;O.Qc=b;O.Bb=a;return O}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};f.A=function(){return this.k.A?this.k.A():this.k.call(null)};
f.e=function(a){return this.k.e?this.k.e(a):this.k.call(null,a)};f.c=function(a,b){return this.k.c?this.k.c(a,b):this.k.call(null,a,b)};f.h=function(a,b,c){return this.k.h?this.k.h(a,b,c):this.k.call(null,a,b,c)};f.F=function(a,b,c,d){return this.k.F?this.k.F(a,b,c,d):this.k.call(null,a,b,c,d)};f.X=function(a,b,c,d,e){return this.k.X?this.k.X(a,b,c,d,e):this.k.call(null,a,b,c,d,e)};f.va=function(a,b,c,d,e,g){return this.k.va?this.k.va(a,b,c,d,e,g):this.k.call(null,a,b,c,d,e,g)};
f.Sa=function(a,b,c,d,e,g,h){return this.k.Sa?this.k.Sa(a,b,c,d,e,g,h):this.k.call(null,a,b,c,d,e,g,h)};f.Ta=function(a,b,c,d,e,g,h,k){return this.k.Ta?this.k.Ta(a,b,c,d,e,g,h,k):this.k.call(null,a,b,c,d,e,g,h,k)};f.Ua=function(a,b,c,d,e,g,h,k,l){return this.k.Ua?this.k.Ua(a,b,c,d,e,g,h,k,l):this.k.call(null,a,b,c,d,e,g,h,k,l)};f.Ha=function(a,b,c,d,e,g,h,k,l,p){return this.k.Ha?this.k.Ha(a,b,c,d,e,g,h,k,l,p):this.k.call(null,a,b,c,d,e,g,h,k,l,p)};
f.Ia=function(a,b,c,d,e,g,h,k,l,p,n){return this.k.Ia?this.k.Ia(a,b,c,d,e,g,h,k,l,p,n):this.k.call(null,a,b,c,d,e,g,h,k,l,p,n)};f.Ja=function(a,b,c,d,e,g,h,k,l,p,n,q){return this.k.Ja?this.k.Ja(a,b,c,d,e,g,h,k,l,p,n,q):this.k.call(null,a,b,c,d,e,g,h,k,l,p,n,q)};f.Ka=function(a,b,c,d,e,g,h,k,l,p,n,q,t){return this.k.Ka?this.k.Ka(a,b,c,d,e,g,h,k,l,p,n,q,t):this.k.call(null,a,b,c,d,e,g,h,k,l,p,n,q,t)};
f.La=function(a,b,c,d,e,g,h,k,l,p,n,q,t,z){return this.k.La?this.k.La(a,b,c,d,e,g,h,k,l,p,n,q,t,z):this.k.call(null,a,b,c,d,e,g,h,k,l,p,n,q,t,z)};f.Ma=function(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B){return this.k.Ma?this.k.Ma(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B):this.k.call(null,a,b,c,d,e,g,h,k,l,p,n,q,t,z,B)};f.Na=function(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F){return this.k.Na?this.k.Na(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F):this.k.call(null,a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F)};
f.Oa=function(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J){return this.k.Oa?this.k.Oa(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J):this.k.call(null,a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J)};f.Pa=function(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q){return this.k.Pa?this.k.Pa(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q):this.k.call(null,a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q)};
f.Qa=function(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P){return this.k.Qa?this.k.Qa(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P):this.k.call(null,a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P)};f.Ra=function(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma){return this.k.Ra?this.k.Ra(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma):this.k.call(null,a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma)};
f.Qc=function(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma,Ta){var tb=this.k;return Yc.Bb?Yc.Bb(tb,a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma,Ta):Yc.call(null,tb,a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma,Ta)};f.Ic=!0;f.J=function(a,b){return new Xc(this.k,b)};f.I=function(){return this.meta};function Zc(a,b){return Wc(a)&&!(a?a.n&262144||a.oe||(a.n?0:v(vb,a)):v(vb,a))?new Xc(a,b):null==a?null:wb(a,b)}function $c(a){var b=null!=a;return(b?a?a.n&131072||a.Tc||(a.n?0:v(rb,a)):v(rb,a):b)?ub(a):null}
var ad=function ad(){switch(arguments.length){case 1:return ad.e(arguments[0]);case 2:return ad.c(arguments[0],arguments[1]);default:return ad.t(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};ad.e=function(a){return a};ad.c=function(a,b){return null==a?null:mb(a,b)};ad.t=function(a,b,c){for(;;){if(null==a)return null;a=ad.c(a,b);if(u(c))b=G(c),c=I(c);else return a}};ad.D=function(a){var b=G(a),c=I(a);a=G(c);c=I(c);return ad.t(b,a,c)};ad.B=2;
function bd(a){return null==a||Aa(D(a))}function cd(a){return null==a?!1:a?a.n&8||a.ee?!0:a.n?!1:v(Va,a):v(Va,a)}function dd(a){return null==a?!1:a?a.n&4096||a.me?!0:a.n?!1:v(lb,a):v(lb,a)}function ed(a){return a?a.n&16777216||a.le?!0:a.n?!1:v(Gb,a):v(Gb,a)}function fd(a){return null==a?!1:a?a.n&1024||a.Rc?!0:a.n?!1:v(gb,a):v(gb,a)}function gd(a){return a?a.n&16384||a.ne?!0:a.n?!1:v(nb,a):v(nb,a)}function hd(a){return a?a.w&512||a.de?!0:!1:!1}
function id(a){var b=[];fa(a,function(a,b){return function(a,c){return b.push(c)}}(a,b));return b}function jd(a,b,c,d,e){for(;0!==e;)c[d]=a[b],d+=1,--e,b+=1}var kd={};function ld(a){return null==a?!1:a?a.n&64||a.ub?!0:a.n?!1:v(Xa,a):v(Xa,a)}function md(a){return u(a)?!0:!1}function nd(a){var b=Wc(a);return b?b:a?a.n&1||a.he?!0:a.n?!1:v(Oa,a):v(Oa,a)}function od(a){return"number"===typeof a&&Aa(isNaN(a))&&Infinity!==a&&parseFloat(a)===parseInt(a,10)}function pd(a,b){return Uc(a,b,kd)===kd?!1:!0}
function qd(a,b){var c;if(c=null!=a)c=a?a.n&512||a.be?!0:a.n?!1:v(db,a):v(db,a);return c&&pd(a,b)?new V(null,2,5,W,[b,Tc(a,b)],null):null}var rd=function rd(){switch(arguments.length){case 1:return rd.e(arguments[0]);case 2:return rd.c(arguments[0],arguments[1]);default:return rd.t(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};rd.e=function(){return!0};rd.c=function(a,b){return!K.c(a,b)};
rd.t=function(a,b,c){if(K.c(a,b))return!1;a:if(a=[a,b],b=a.length,b<=sd)for(var d=0,e=Pb(td);;)if(d<b)var g=d+1,e=Tb(e,a[d],null),d=g;else{a=new ud(null,Rb(e),null);break a}else for(d=0,e=Pb(vd);;)if(d<b)g=d+1,e=Qb(e,a[d]),d=g;else{a=Rb(e);break a}for(b=c;;)if(d=G(b),c=I(b),u(b)){if(pd(a,d))return!1;a=Oc.c(a,d);b=c}else return!0};rd.D=function(a){var b=G(a),c=I(a);a=G(c);c=I(c);return rd.t(b,a,c)};rd.B=2;
function wd(a,b){if(a===b)return 0;if(null==a)return-1;if(null==b)return 1;if(Da(a)===Da(b))return a&&(a.w&2048||a.rb)?a.sb(null,b):na(a,b);throw Error("compare on non-nil objects of different types");}function xd(a,b){var c=R(a),d=R(b);if(c<d)c=-1;else if(c>d)c=1;else a:for(d=0;;){var e=wd(Sc(a,d),Sc(b,d));if(0===e&&d+1<c)d+=1;else{c=e;break a}}return c}
function yd(a){return K.c(a,wd)?wd:function(b,c){var d=a.c?a.c(b,c):a.call(null,b,c);return"number"===typeof d?d:u(d)?-1:u(a.c?a.c(c,b):a.call(null,c,b))?1:0}}function zd(a,b){if(D(b)){var c=Ad.e?Ad.e(b):Ad.call(null,b),d=yd(a);oa(c,d);return D(c)}return H}var Bd=function Bd(){switch(arguments.length){case 2:return Bd.c(arguments[0],arguments[1]);case 3:return Bd.h(arguments[0],arguments[1],arguments[2]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};
Bd.c=function(a,b){return Bd.h(a,wd,b)};Bd.h=function(a,b,c){return zd(function(c,e){return yd(b).call(null,a.e?a.e(c):a.call(null,c),a.e?a.e(e):a.call(null,e))},c)};Bd.B=3;function Cd(a,b){var c=D(b);if(c){var d=G(c),c=I(c);return La?La(a,d,c):Ma.call(null,a,d,c)}return a.A?a.A():a.call(null)}function Dd(a,b,c){for(c=D(c);;)if(c){var d=G(c);b=a.c?a.c(b,d):a.call(null,b,d);c=I(c)}else return b}
function Ma(){switch(arguments.length){case 2:return Ed(arguments[0],arguments[1]);case 3:return La(arguments[0],arguments[1],arguments[2]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}}function Ed(a,b){return b&&(b.n&524288||b.Vc)?b.ca(null,a):za(b)?Fc(b,a):"string"===typeof b?Fc(b,a):v(xb,b)?Ab.c(b,a):Cd(a,b)}function La(a,b,c){return c&&(c.n&524288||c.Vc)?c.da(null,a,b):za(c)?Gc(c,a,b):"string"===typeof c?Gc(c,a,b):v(xb,c)?Ab.h(c,a,b):Dd(a,b,c)}
function Fd(a){return a}function Gd(a,b,c,d){a=a.e?a.e(b):a.call(null,b);c=La(a,c,d);return a.e?a.e(c):a.call(null,c)}function Id(a){a=(a-a%2)/2;return 0<=a?Math.floor.e?Math.floor.e(a):Math.floor.call(null,a):Math.ceil.e?Math.ceil.e(a):Math.ceil.call(null,a)}function Jd(a){a-=a>>1&1431655765;a=(a&858993459)+(a>>2&858993459);return 16843009*(a+(a>>4)&252645135)>>24}function Kd(a){var b=1;for(a=D(a);;)if(a&&0<b)--b,a=I(a);else return a}
var x=function x(){switch(arguments.length){case 0:return x.A();case 1:return x.e(arguments[0]);default:return x.t(arguments[0],new E(Array.prototype.slice.call(arguments,1),0))}};x.A=function(){return""};x.e=function(a){return null==a?"":da(a)};x.t=function(a,b){for(var c=new ia(""+x(a)),d=b;;)if(u(d))c=c.append(""+x(G(d))),d=I(d);else return c.toString()};x.D=function(a){var b=G(a);a=I(a);return x.t(b,a)};x.B=1;
function Lc(a,b){var c;if(ed(b))if(Ic(a)&&Ic(b)&&R(a)!==R(b))c=!1;else a:{c=D(a);for(var d=D(b);;){if(null==c){c=null==d;break a}if(null!=d&&K.c(G(c),G(d)))c=I(c),d=I(d);else{c=!1;break a}}}else c=null;return md(c)}function Ld(a){var b=0;for(a=D(a);;)if(a){var c=G(a),b=(b+(oc(function(){var a=c;return Md.e?Md.e(a):Md.call(null,a)}())^oc(function(){var a=c;return Nd.e?Nd.e(a):Nd.call(null,a)}())))%4503599627370496;a=I(a)}else return b}
function Od(a,b,c,d,e){this.meta=a;this.first=b;this.Aa=c;this.count=d;this.m=e;this.n=65937646;this.w=8192}f=Od.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.I=function(){return this.meta};f.T=function(){return new Od(this.meta,this.first,this.Aa,this.count,this.m)};f.ea=function(){return 1===this.count?null:this.Aa};f.N=function(){return this.count};f.K=function(){var a=this.m;return null!=a?a:this.m=a=xc(this)};f.v=function(a,b){return Lc(this,b)};
f.W=function(){return wb(H,this.meta)};f.ca=function(a,b){return Cd(b,this)};f.da=function(a,b,c){return Dd(b,c,this)};f.aa=function(){return this.first};f.oa=function(){return 1===this.count?H:this.Aa};f.M=function(){return this};f.J=function(a,b){return new Od(b,this.first,this.Aa,this.count,this.m)};f.L=function(a,b){return new Od(this.meta,b,this,this.count+1,null)};Od.prototype[Ga]=function(){return vc(this)};function Pd(a){this.meta=a;this.n=65937614;this.w=8192}f=Pd.prototype;f.toString=function(){return dc(this)};
f.equiv=function(a){return this.v(null,a)};f.I=function(){return this.meta};f.T=function(){return new Pd(this.meta)};f.ea=function(){return null};f.N=function(){return 0};f.K=function(){return yc};f.v=function(a,b){return Lc(this,b)};f.W=function(){return this};f.ca=function(a,b){return Cd(b,this)};f.da=function(a,b,c){return Dd(b,c,this)};f.aa=function(){return null};f.oa=function(){return H};f.M=function(){return null};f.J=function(a,b){return new Pd(b)};
f.L=function(a,b){return new Od(this.meta,b,null,1,null)};var H=new Pd(null);Pd.prototype[Ga]=function(){return vc(this)};function Qd(){a:{var a=0<arguments.length?new E(Array.prototype.slice.call(arguments,0),0):null,b;if(a instanceof E&&0===a.i)b=a.j;else b:for(b=[];;)if(null!=a)b.push(a.aa(null)),a=a.ea(null);else break b;for(var a=b.length,c=H;;)if(0<a)var d=a-1,c=c.L(null,b[a-1]),a=d;else break a}return c}
function Rd(a,b,c,d){this.meta=a;this.first=b;this.Aa=c;this.m=d;this.n=65929452;this.w=8192}f=Rd.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.I=function(){return this.meta};f.T=function(){return new Rd(this.meta,this.first,this.Aa,this.m)};f.ea=function(){return null==this.Aa?null:D(this.Aa)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=xc(this)};f.v=function(a,b){return Lc(this,b)};f.W=function(){return Zc(H,this.meta)};
f.ca=function(a,b){return Cd(b,this)};f.da=function(a,b,c){return Dd(b,c,this)};f.aa=function(){return this.first};f.oa=function(){return null==this.Aa?H:this.Aa};f.M=function(){return this};f.J=function(a,b){return new Rd(b,this.first,this.Aa,this.m)};f.L=function(a,b){return new Rd(null,b,this,this.m)};Rd.prototype[Ga]=function(){return vc(this)};function M(a,b){var c=null==b;return(c?c:b&&(b.n&64||b.ub))?new Rd(null,a,b,null):new Rd(null,a,D(b),null)}
function Sd(a,b){if(a.V===b.V)return 0;var c=Aa(a.ha);if(u(c?b.ha:c))return-1;if(u(a.ha)){if(Aa(b.ha))return 1;c=na(a.ha,b.ha);return 0===c?na(a.name,b.name):c}return na(a.name,b.name)}function X(a,b,c,d){this.ha=a;this.name=b;this.V=c;this.hb=d;this.n=2153775105;this.w=4096}f=X.prototype;f.H=function(a,b){return Ib(b,[x(":"),x(this.V)].join(""))};f.K=function(){var a=this.hb;return null!=a?a:this.hb=a=pc(kc(this.name),nc(this.ha))+2654435769|0};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return Tc(c,this);case 3:return Uc(c,this,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return Tc(c,this)};a.h=function(a,c,d){return Uc(c,this,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};f.e=function(a){return Tc(a,this)};f.c=function(a,b){return Uc(a,this,b)};f.v=function(a,b){return b instanceof X?this.V===b.V:!1};
f.toString=function(){return[x(":"),x(this.V)].join("")};f.equiv=function(a){return this.v(null,a)};function Td(a){return a instanceof X}function Y(a,b){return a===b?!0:a instanceof X&&b instanceof X?a.V===b.V:!1}var Ud=function Ud(){switch(arguments.length){case 1:return Ud.e(arguments[0]);case 2:return Ud.c(arguments[0],arguments[1]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};
Ud.e=function(a){if(a instanceof X)return a;if(a instanceof C){var b;if(a&&(a.w&4096||a.Uc))b=a.ha;else throw Error([x("Doesn't support namespace: "),x(a)].join(""));return new X(b,Vd.e?Vd.e(a):Vd.call(null,a),a.Ga,null)}return"string"===typeof a?(b=a.split("/"),2===b.length?new X(b[0],b[1],a,null):new X(null,b[0],a,null)):null};Ud.c=function(a,b){return new X(a,b,[x(u(a)?[x(a),x("/")].join(""):null),x(b)].join(""),null)};Ud.B=2;
function Wd(a,b,c,d){this.meta=a;this.nb=b;this.s=c;this.m=d;this.w=0;this.n=32374988}f=Wd.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};function Xd(a){null!=a.nb&&(a.s=a.nb.A?a.nb.A():a.nb.call(null),a.nb=null);return a.s}f.I=function(){return this.meta};f.ea=function(){Fb(this);return null==this.s?null:I(this.s)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=xc(this)};f.v=function(a,b){return Lc(this,b)};f.W=function(){return Zc(H,this.meta)};
f.ca=function(a,b){return Cd(b,this)};f.da=function(a,b,c){return Dd(b,c,this)};f.aa=function(){Fb(this);return null==this.s?null:G(this.s)};f.oa=function(){Fb(this);return null!=this.s?tc(this.s):H};f.M=function(){Xd(this);if(null==this.s)return null;for(var a=this.s;;)if(a instanceof Wd)a=Xd(a);else return this.s=a,D(this.s)};f.J=function(a,b){return new Wd(b,this.nb,this.s,this.m)};f.L=function(a,b){return M(b,this)};Wd.prototype[Ga]=function(){return vc(this)};
function Yd(a,b){this.Jb=a;this.end=b;this.w=0;this.n=2}Yd.prototype.N=function(){return this.end};Yd.prototype.add=function(a){this.Jb[this.end]=a;return this.end+=1};Yd.prototype.O=function(){var a=new Zd(this.Jb,0,this.end);this.Jb=null;return a};function $d(a){return new Yd(Array(a),0)}function Zd(a,b,c){this.j=a;this.off=b;this.end=c;this.w=0;this.n=524306}f=Zd.prototype;f.ca=function(a,b){return Hc(this.j,b,this.j[this.off],this.off+1)};f.da=function(a,b,c){return Hc(this.j,b,c,this.off)};
f.Ub=function(){if(this.off===this.end)throw Error("-drop-first of empty chunk");return new Zd(this.j,this.off+1,this.end)};f.P=function(a,b){return this.j[this.off+b]};f.na=function(a,b,c){return 0<=b&&b<this.end-this.off?this.j[this.off+b]:c};f.N=function(){return this.end-this.off};function ae(a,b,c,d){this.O=a;this.Da=b;this.meta=c;this.m=d;this.n=31850732;this.w=1536}f=ae.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.I=function(){return this.meta};
f.ea=function(){if(1<Sa(this.O))return new ae(Vb(this.O),this.Da,this.meta,null);var a=Fb(this.Da);return null==a?null:a};f.K=function(){var a=this.m;return null!=a?a:this.m=a=xc(this)};f.v=function(a,b){return Lc(this,b)};f.W=function(){return Zc(H,this.meta)};f.aa=function(){return A.c(this.O,0)};f.oa=function(){return 1<Sa(this.O)?new ae(Vb(this.O),this.Da,this.meta,null):null==this.Da?H:this.Da};f.M=function(){return this};f.Lb=function(){return this.O};
f.Mb=function(){return null==this.Da?H:this.Da};f.J=function(a,b){return new ae(this.O,this.Da,b,this.m)};f.L=function(a,b){return M(b,this)};f.Kb=function(){return null==this.Da?null:this.Da};ae.prototype[Ga]=function(){return vc(this)};function be(a,b){return 0===Sa(a)?b:new ae(a,b,null,null)}function ce(a,b){a.add(b)}function Ad(a){for(var b=[];;)if(D(a))b.push(G(a)),a=I(a);else return b}function de(a,b){if(Ic(a))return R(a);for(var c=a,d=b,e=0;;)if(0<d&&D(c))c=I(c),--d,e+=1;else return e}
var ee=function ee(b){return null==b?null:null==I(b)?D(G(b)):M(G(b),ee(I(b)))},fe=function fe(){switch(arguments.length){case 0:return fe.A();case 1:return fe.e(arguments[0]);case 2:return fe.c(arguments[0],arguments[1]);default:return fe.t(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};fe.A=function(){return new Wd(null,function(){return null},null,null)};fe.e=function(a){return new Wd(null,function(){return a},null,null)};
fe.c=function(a,b){return new Wd(null,function(){var c=D(a);return c?hd(c)?be(Wb(c),fe.c(Xb(c),b)):M(G(c),fe.c(tc(c),b)):b},null,null)};fe.t=function(a,b,c){return function e(a,b){return new Wd(null,function(){var c=D(a);return c?hd(c)?be(Wb(c),e(Xb(c),b)):M(G(c),e(tc(c),b)):u(b)?e(G(b),I(b)):null},null,null)}(fe.c(a,b),c)};fe.D=function(a){var b=G(a),c=I(a);a=G(c);c=I(c);return fe.t(b,a,c)};fe.B=2;function ge(a,b){return M(a,b)}function he(a){return Rb(a)}
var ie=function ie(){switch(arguments.length){case 0:return ie.A();case 1:return ie.e(arguments[0]);case 2:return ie.c(arguments[0],arguments[1]);default:return ie.t(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};ie.A=function(){return Pb(Pc)};ie.e=function(a){return a};ie.c=function(a,b){return Qb(a,b)};ie.t=function(a,b,c){for(;;)if(a=Qb(a,b),u(c))b=G(c),c=I(c);else return a};ie.D=function(a){var b=G(a),c=I(a);a=G(c);c=I(c);return ie.t(b,a,c)};ie.B=2;
function je(a,b,c){var d=D(c);if(0===b)return a.A?a.A():a.call(null);c=Ya(d);var e=Za(d);if(1===b)return a.e?a.e(c):a.e?a.e(c):a.call(null,c);var d=Ya(e),g=Za(e);if(2===b)return a.c?a.c(c,d):a.c?a.c(c,d):a.call(null,c,d);var e=Ya(g),h=Za(g);if(3===b)return a.h?a.h(c,d,e):a.h?a.h(c,d,e):a.call(null,c,d,e);var g=Ya(h),k=Za(h);if(4===b)return a.F?a.F(c,d,e,g):a.F?a.F(c,d,e,g):a.call(null,c,d,e,g);var h=Ya(k),l=Za(k);if(5===b)return a.X?a.X(c,d,e,g,h):a.X?a.X(c,d,e,g,h):a.call(null,c,d,e,g,h);var k=Ya(l),
p=Za(l);if(6===b)return a.va?a.va(c,d,e,g,h,k):a.va?a.va(c,d,e,g,h,k):a.call(null,c,d,e,g,h,k);var l=Ya(p),n=Za(p);if(7===b)return a.Sa?a.Sa(c,d,e,g,h,k,l):a.Sa?a.Sa(c,d,e,g,h,k,l):a.call(null,c,d,e,g,h,k,l);var p=Ya(n),q=Za(n);if(8===b)return a.Ta?a.Ta(c,d,e,g,h,k,l,p):a.Ta?a.Ta(c,d,e,g,h,k,l,p):a.call(null,c,d,e,g,h,k,l,p);var n=Ya(q),t=Za(q);if(9===b)return a.Ua?a.Ua(c,d,e,g,h,k,l,p,n):a.Ua?a.Ua(c,d,e,g,h,k,l,p,n):a.call(null,c,d,e,g,h,k,l,p,n);var q=Ya(t),z=Za(t);if(10===b)return a.Ha?a.Ha(c,
d,e,g,h,k,l,p,n,q):a.Ha?a.Ha(c,d,e,g,h,k,l,p,n,q):a.call(null,c,d,e,g,h,k,l,p,n,q);var t=Ya(z),B=Za(z);if(11===b)return a.Ia?a.Ia(c,d,e,g,h,k,l,p,n,q,t):a.Ia?a.Ia(c,d,e,g,h,k,l,p,n,q,t):a.call(null,c,d,e,g,h,k,l,p,n,q,t);var z=Ya(B),F=Za(B);if(12===b)return a.Ja?a.Ja(c,d,e,g,h,k,l,p,n,q,t,z):a.Ja?a.Ja(c,d,e,g,h,k,l,p,n,q,t,z):a.call(null,c,d,e,g,h,k,l,p,n,q,t,z);var B=Ya(F),J=Za(F);if(13===b)return a.Ka?a.Ka(c,d,e,g,h,k,l,p,n,q,t,z,B):a.Ka?a.Ka(c,d,e,g,h,k,l,p,n,q,t,z,B):a.call(null,c,d,e,g,h,k,l,
p,n,q,t,z,B);var F=Ya(J),Q=Za(J);if(14===b)return a.La?a.La(c,d,e,g,h,k,l,p,n,q,t,z,B,F):a.La?a.La(c,d,e,g,h,k,l,p,n,q,t,z,B,F):a.call(null,c,d,e,g,h,k,l,p,n,q,t,z,B,F);var J=Ya(Q),P=Za(Q);if(15===b)return a.Ma?a.Ma(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J):a.Ma?a.Ma(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J):a.call(null,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J);var Q=Ya(P),ma=Za(P);if(16===b)return a.Na?a.Na(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q):a.Na?a.Na(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q):a.call(null,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q);var P=
Ya(ma),Ta=Za(ma);if(17===b)return a.Oa?a.Oa(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P):a.Oa?a.Oa(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P):a.call(null,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P);var ma=Ya(Ta),tb=Za(Ta);if(18===b)return a.Pa?a.Pa(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma):a.Pa?a.Pa(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma):a.call(null,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma);Ta=Ya(tb);tb=Za(tb);if(19===b)return a.Qa?a.Qa(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma,Ta):a.Qa?a.Qa(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma,Ta):a.call(null,
c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma,Ta);var O=Ya(tb);Za(tb);if(20===b)return a.Ra?a.Ra(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma,Ta,O):a.Ra?a.Ra(c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma,Ta,O):a.call(null,c,d,e,g,h,k,l,p,n,q,t,z,B,F,J,Q,P,ma,Ta,O);throw Error("Only up to 20 arguments supported on functions");}
function Yc(){switch(arguments.length){case 2:return ke(arguments[0],arguments[1]);case 3:return le(arguments[0],arguments[1],arguments[2]);case 4:return me(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return ne(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:return pe(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],new E(Array.prototype.slice.call(arguments,5),0))}}
function ke(a,b){var c=a.B;if(a.D){var d=de(b,c+1);return d<=c?je(a,d,b):a.D(b)}return a.apply(a,Ad(b))}function le(a,b,c){b=M(b,c);c=a.B;if(a.D){var d=de(b,c+1);return d<=c?je(a,d,b):a.D(b)}return a.apply(a,Ad(b))}function me(a,b,c,d){b=M(b,M(c,d));c=a.B;return a.D?(d=de(b,c+1),d<=c?je(a,d,b):a.D(b)):a.apply(a,Ad(b))}function ne(a,b,c,d,e){b=M(b,M(c,M(d,e)));c=a.B;return a.D?(d=de(b,c+1),d<=c?je(a,d,b):a.D(b)):a.apply(a,Ad(b))}
function pe(a,b,c,d,e,g){b=M(b,M(c,M(d,M(e,ee(g)))));c=a.B;return a.D?(d=de(b,c+1),d<=c?je(a,d,b):a.D(b)):a.apply(a,Ad(b))}function qe(a,b){return!K.c(a,b)}function re(a){return D(a)?a:null}function se(a,b){for(;;){if(null==D(b))return!0;var c;c=G(b);c=a.e?a.e(c):a.call(null,c);if(u(c)){c=a;var d=I(b);a=c;b=d}else return!1}}function te(a,b){for(;;)if(D(b)){var c;c=G(b);c=a.e?a.e(c):a.call(null,c);if(u(c))return c;c=a;var d=I(b);a=c;b=d}else return null}
function ue(a){return function(){function b(b,c){return Aa(a.c?a.c(b,c):a.call(null,b,c))}function c(b){return Aa(a.e?a.e(b):a.call(null,b))}function d(){return Aa(a.A?a.A():a.call(null))}var e=null,g=function(){function b(a,d,e){var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new E(h,0)}return c.call(this,a,d,g)}function c(b,d,e){return Aa(me(a,b,d,e))}b.B=2;b.D=function(a){var b=G(a);a=I(a);var d=G(a);a=tc(a);return c(b,d,a)};b.t=c;
return b}(),e=function(a,e,l){switch(arguments.length){case 0:return d.call(this);case 1:return c.call(this,a);case 2:return b.call(this,a,e);default:var p=null;if(2<arguments.length){for(var p=0,n=Array(arguments.length-2);p<n.length;)n[p]=arguments[p+2],++p;p=new E(n,0)}return g.t(a,e,p)}throw Error("Invalid arity: "+arguments.length);};e.B=2;e.D=g.D;e.A=d;e.e=c;e.c=b;e.t=g.t;return e}()}
function ve(){var a=td;return function(){function b(b){if(0<arguments.length)for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;return a}b.B=0;b.D=function(b){D(b);return a};b.t=function(){return a};return b}()}
function we(a,b){return function(){function c(c,d,e){c=b.h?b.h(c,d,e):b.call(null,c,d,e);return a.e?a.e(c):a.call(null,c)}function d(c,d){var e=b.c?b.c(c,d):b.call(null,c,d);return a.e?a.e(e):a.call(null,e)}function e(c){c=b.e?b.e(c):b.call(null,c);return a.e?a.e(c):a.call(null,c)}function g(){var c=b.A?b.A():b.call(null);return a.e?a.e(c):a.call(null,c)}var h=null,k=function(){function c(a,b,e,g){var h=null;if(3<arguments.length){for(var h=0,k=Array(arguments.length-3);h<k.length;)k[h]=arguments[h+
3],++h;h=new E(k,0)}return d.call(this,a,b,e,h)}function d(c,e,g,h){c=ne(b,c,e,g,h);return a.e?a.e(c):a.call(null,c)}c.B=3;c.D=function(a){var b=G(a);a=I(a);var c=G(a);a=I(a);var e=G(a);a=tc(a);return d(b,c,e,a)};c.t=d;return c}(),h=function(a,b,h,q){switch(arguments.length){case 0:return g.call(this);case 1:return e.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,h);default:var t=null;if(3<arguments.length){for(var t=0,z=Array(arguments.length-3);t<z.length;)z[t]=arguments[t+
3],++t;t=new E(z,0)}return k.t(a,b,h,t)}throw Error("Invalid arity: "+arguments.length);};h.B=3;h.D=k.D;h.A=g;h.e=e;h.c=d;h.h=c;h.t=k.t;return h}()}
function xe(a,b){return function(){function c(c,d,e){return a.F?a.F(b,c,d,e):a.call(null,b,c,d,e)}function d(c,d){return a.h?a.h(b,c,d):a.call(null,b,c,d)}function e(c){return a.c?a.c(b,c):a.call(null,b,c)}function g(){return a.e?a.e(b):a.call(null,b)}var h=null,k=function(){function c(a,b,e,g){var h=null;if(3<arguments.length){for(var h=0,k=Array(arguments.length-3);h<k.length;)k[h]=arguments[h+3],++h;h=new E(k,0)}return d.call(this,a,b,e,h)}function d(c,e,g,h){return pe(a,b,c,e,g,N([h],0))}c.B=
3;c.D=function(a){var b=G(a);a=I(a);var c=G(a);a=I(a);var e=G(a);a=tc(a);return d(b,c,e,a)};c.t=d;return c}(),h=function(a,b,h,q){switch(arguments.length){case 0:return g.call(this);case 1:return e.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,h);default:var t=null;if(3<arguments.length){for(var t=0,z=Array(arguments.length-3);t<z.length;)z[t]=arguments[t+3],++t;t=new E(z,0)}return k.t(a,b,h,t)}throw Error("Invalid arity: "+arguments.length);};h.B=3;h.D=k.D;h.A=g;h.e=e;
h.c=d;h.h=c;h.t=k.t;return h}()}var ye=function ye(){switch(arguments.length){case 1:return ye.e(arguments[0]);case 2:return ye.c(arguments[0],arguments[1]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};
ye.e=function(a){return function(b){return function(){function c(c,d){var e=a.e?a.e(d):a.call(null,d);return null==e?c:b.c?b.c(c,e):b.call(null,c,e)}function d(a){return b.e?b.e(a):b.call(null,a)}function e(){return b.A?b.A():b.call(null)}var g=null,g=function(a,b){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};g.A=e;g.e=d;g.c=c;return g}()}};
ye.c=function(a,b){return new Wd(null,function(){var c=D(b);if(c){if(hd(c)){for(var d=Wb(c),e=R(d),g=$d(e),h=0;;)if(h<e){var k=function(){var b=A.c(d,h);return a.e?a.e(b):a.call(null,b)}();null!=k&&g.add(k);h+=1}else break;return be(g.O(),ye.c(a,Xb(c)))}e=function(){var b=G(c);return a.e?a.e(b):a.call(null,b)}();return null==e?ye.c(a,tc(c)):M(e,ye.c(a,tc(c)))}return null},null,null)};ye.B=2;function ze(a,b,c,d){this.state=a;this.meta=b;this.ae=c;this.pb=d;this.n=6455296;this.w=16386}f=ze.prototype;
f.K=function(){return this[ba]||(this[ba]=++ca)};f.$b=function(a,b,c){for(var d=D(this.pb),e=null,g=0,h=0;;)if(h<g){a=e.P(null,h);var k=S(a,0);a=S(a,1);var l=b,p=c;a.F?a.F(k,this,l,p):a.call(null,k,this,l,p);h+=1}else if(a=D(d))d=a,hd(d)?(e=Wb(d),d=Xb(d),a=e,g=R(e),e=a):(a=G(d),k=S(a,0),a=S(a,1),e=k,g=b,h=c,a.F?a.F(e,this,g,h):a.call(null,e,this,g,h),d=I(d),e=null,g=0),h=0;else return null};f.Zb=function(a,b,c){this.pb=T.h(this.pb,b,c);return this};f.ac=function(a,b){return this.pb=U.c(this.pb,b)};
f.I=function(){return this.meta};f.ib=function(){return this.state};f.v=function(a,b){return this===b};f.equiv=function(a){return this.v(null,a)};function Ae(){switch(arguments.length){case 1:return Be(arguments[0]);default:var a=arguments[0],b=new E(Array.prototype.slice.call(arguments,1),0),c=ld(b)?ke(Ce,b):b,b=Tc(c,De),c=Tc(c,va);return new ze(a,c,b,null)}}function Be(a){return new ze(a,null,null,null)}
function Ee(a,b){if(a instanceof ze){var c=a.ae;if(null!=c&&!u(c.e?c.e(b):c.call(null,b)))throw Error([x("Assert failed: "),x("Validator rejected reference state"),x("\n"),x(function(){var a=Qd(new C(null,"validate","validate",1439230700,null),new C(null,"new-value","new-value",-1567397401,null));return Fe.e?Fe.e(a):Fe.call(null,a)}())].join(""));c=a.state;a.state=b;null!=a.pb&&Mb(a,c,b);return b}return $b(a,b)}
var Ge=function Ge(){switch(arguments.length){case 2:return Ge.c(arguments[0],arguments[1]);case 3:return Ge.h(arguments[0],arguments[1],arguments[2]);case 4:return Ge.F(arguments[0],arguments[1],arguments[2],arguments[3]);default:return Ge.t(arguments[0],arguments[1],arguments[2],arguments[3],new E(Array.prototype.slice.call(arguments,4),0))}};Ge.c=function(a,b){var c;a instanceof ze?(c=a.state,c=b.e?b.e(c):b.call(null,c),c=Ee(a,c)):c=ac.c(a,b);return c};
Ge.h=function(a,b,c){if(a instanceof ze){var d=a.state;b=b.c?b.c(d,c):b.call(null,d,c);a=Ee(a,b)}else a=ac.h(a,b,c);return a};Ge.F=function(a,b,c,d){if(a instanceof ze){var e=a.state;b=b.h?b.h(e,c,d):b.call(null,e,c,d);a=Ee(a,b)}else a=ac.F(a,b,c,d);return a};Ge.t=function(a,b,c,d,e){return a instanceof ze?Ee(a,ne(b,a.state,c,d,e)):ac.X(a,b,c,d,e)};Ge.D=function(a){var b=G(a),c=I(a);a=G(c);var d=I(c),c=G(d),e=I(d),d=G(e),e=I(e);return Ge.t(b,a,c,d,e)};Ge.B=4;
var Z=function Z(){switch(arguments.length){case 1:return Z.e(arguments[0]);case 2:return Z.c(arguments[0],arguments[1]);case 3:return Z.h(arguments[0],arguments[1],arguments[2]);case 4:return Z.F(arguments[0],arguments[1],arguments[2],arguments[3]);default:return Z.t(arguments[0],arguments[1],arguments[2],arguments[3],new E(Array.prototype.slice.call(arguments,4),0))}};
Z.e=function(a){return function(b){return function(){function c(c,d){var e=a.e?a.e(d):a.call(null,d);return b.c?b.c(c,e):b.call(null,c,e)}function d(a){return b.e?b.e(a):b.call(null,a)}function e(){return b.A?b.A():b.call(null)}var g=null,h=function(){function c(a,b,e){var g=null;if(2<arguments.length){for(var g=0,h=Array(arguments.length-2);g<h.length;)h[g]=arguments[g+2],++g;g=new E(h,0)}return d.call(this,a,b,g)}function d(c,e,g){e=le(a,e,g);return b.c?b.c(c,e):b.call(null,c,e)}c.B=2;c.D=function(a){var b=
G(a);a=I(a);var c=G(a);a=tc(a);return d(b,c,a)};c.t=d;return c}(),g=function(a,b,g){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b);default:var n=null;if(2<arguments.length){for(var n=0,q=Array(arguments.length-2);n<q.length;)q[n]=arguments[n+2],++n;n=new E(q,0)}return h.t(a,b,n)}throw Error("Invalid arity: "+arguments.length);};g.B=2;g.D=h.D;g.A=e;g.e=d;g.c=c;g.t=h.t;return g}()}};
Z.c=function(a,b){return new Wd(null,function(){var c=D(b);if(c){if(hd(c)){for(var d=Wb(c),e=R(d),g=$d(e),h=0;;)if(h<e)ce(g,function(){var b=A.c(d,h);return a.e?a.e(b):a.call(null,b)}()),h+=1;else break;return be(g.O(),Z.c(a,Xb(c)))}return M(function(){var b=G(c);return a.e?a.e(b):a.call(null,b)}(),Z.c(a,tc(c)))}return null},null,null)};
Z.h=function(a,b,c){return new Wd(null,function(){var d=D(b),e=D(c);if(d&&e){var g=M,h;h=G(d);var k=G(e);h=a.c?a.c(h,k):a.call(null,h,k);d=g(h,Z.h(a,tc(d),tc(e)))}else d=null;return d},null,null)};Z.F=function(a,b,c,d){return new Wd(null,function(){var e=D(b),g=D(c),h=D(d);if(e&&g&&h){var k=M,l;l=G(e);var p=G(g),n=G(h);l=a.h?a.h(l,p,n):a.call(null,l,p,n);e=k(l,Z.F(a,tc(e),tc(g),tc(h)))}else e=null;return e},null,null)};
Z.t=function(a,b,c,d,e){var g=function k(a){return new Wd(null,function(){var b=Z.c(D,a);return se(Fd,b)?M(Z.c(G,b),k(Z.c(tc,b))):null},null,null)};return Z.c(function(){return function(b){return ke(a,b)}}(g),g(Oc.t(e,d,N([c,b],0))))};Z.D=function(a){var b=G(a),c=I(a);a=G(c);var d=I(c),c=G(d),e=I(d),d=G(e),e=I(e);return Z.t(b,a,c,d,e)};Z.B=4;function He(a,b){return new Wd(null,function(){if(0<a){var c=D(b);return c?M(G(c),He(a-1,tc(c))):null}return null},null,null)}
function Ie(a){return new Wd(null,function(b){return function(){return b(1,a)}}(function(a,c){for(;;){var d=D(c);if(0<a&&d){var e=a-1,d=tc(d);a=e;c=d}else return d}}),null,null)}function Je(a,b){return new Wd(null,function(c){return function(){return c(a,b)}}(function(a,b){for(;;){var e=D(b),g;if(g=e)g=G(e),g=a.e?a.e(g):a.call(null,g);if(u(g))g=a,e=tc(e),a=g,b=e;else return e}}),null,null)}function Ke(a){return new Wd(null,function(){return M(a,Ke(a))},null,null)}
var Le=function Le(){switch(arguments.length){case 2:return Le.c(arguments[0],arguments[1]);default:return Le.t(arguments[0],arguments[1],new E(Array.prototype.slice.call(arguments,2),0))}};Le.c=function(a,b){return new Wd(null,function(){var c=D(a),d=D(b);return c&&d?M(G(c),M(G(d),Le.c(tc(c),tc(d)))):null},null,null)};Le.t=function(a,b,c){return new Wd(null,function(){var d=Z.c(D,Oc.t(c,b,N([a],0)));return se(Fd,d)?fe.c(Z.c(G,d),ke(Le,Z.c(tc,d))):null},null,null)};
Le.D=function(a){var b=G(a),c=I(a);a=G(c);c=I(c);return Le.t(b,a,c)};Le.B=2;function Me(a,b){return Ie(Le.c(Ke(a),b))}var Ne=function Ne(){switch(arguments.length){case 1:return Ne.e(arguments[0]);case 2:return Ne.c(arguments[0],arguments[1]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};
Ne.e=function(a){return function(b){return function(){function c(c,d){return u(a.e?a.e(d):a.call(null,d))?b.c?b.c(c,d):b.call(null,c,d):c}function d(a){return b.e?b.e(a):b.call(null,a)}function e(){return b.A?b.A():b.call(null)}var g=null,g=function(a,b){switch(arguments.length){case 0:return e.call(this);case 1:return d.call(this,a);case 2:return c.call(this,a,b)}throw Error("Invalid arity: "+arguments.length);};g.A=e;g.e=d;g.c=c;return g}()}};
Ne.c=function(a,b){return new Wd(null,function(){var c=D(b);if(c){if(hd(c)){for(var d=Wb(c),e=R(d),g=$d(e),h=0;;)if(h<e){var k;k=A.c(d,h);k=a.e?a.e(k):a.call(null,k);u(k)&&(k=A.c(d,h),g.add(k));h+=1}else break;return be(g.O(),Ne.c(a,Xb(c)))}d=G(c);c=tc(c);return u(a.e?a.e(d):a.call(null,d))?M(d,Ne.c(a,c)):Ne.c(a,c)}return null},null,null)};Ne.B=2;
var Oe=function Oe(){switch(arguments.length){case 1:return Oe.e(arguments[0]);case 2:return Oe.c(arguments[0],arguments[1]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};Oe.e=function(a){return Ne.e(ue(a))};Oe.c=function(a,b){return Ne.c(ue(a),b)};Oe.B=2;function Qe(a){return function c(a){return new Wd(null,function(){var e;u(ed.e?ed.e(a):ed.call(null,a))?(e=N([D.e?D.e(a):D.call(null,a)],0),e=ke(fe,le(Z,c,e))):e=null;return M(a,e)},null,null)}(a)}
function Re(a){return Ne.c(function(a){return!ed(a)},tc(Qe(a)))}var Se=function Se(){switch(arguments.length){case 2:return Se.c(arguments[0],arguments[1]);case 3:return Se.h(arguments[0],arguments[1],arguments[2]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};Se.c=function(a,b){return null!=a?a&&(a.w&4||a.Lc)?Zc(he(La(Qb,Pb(a),b)),$c(a)):La(y,a,b):La(Oc,H,b)};Se.h=function(a,b,c){return a&&(a.w&4||a.Lc)?Zc(he(Gd(b,ie,Pb(a),c)),$c(a)):Gd(b,Oc,a,c)};Se.B=3;
var Te=function Te(){switch(arguments.length){case 2:return Te.c(arguments[0],arguments[1]);case 3:return Te.h(arguments[0],arguments[1],arguments[2]);case 4:return Te.F(arguments[0],arguments[1],arguments[2],arguments[3]);default:return Te.t(arguments[0],arguments[1],arguments[2],arguments[3],new E(Array.prototype.slice.call(arguments,4),0))}};Te.c=function(a,b){return he(La(function(b,d){return ie.c(b,a.e?a.e(d):a.call(null,d))},Pb(Pc),b))};Te.h=function(a,b,c){return Se.c(Pc,Z.h(a,b,c))};
Te.F=function(a,b,c,d){return Se.c(Pc,Z.F(a,b,c,d))};Te.t=function(a,b,c,d,e){return Se.c(Pc,pe(Z,a,b,c,d,N([e],0)))};Te.D=function(a){var b=G(a),c=I(a);a=G(c);var d=I(c),c=G(d),e=I(d),d=G(e),e=I(e);return Te.t(b,a,c,d,e)};Te.B=4;function Ue(a,b){return Ve(a,b,null)}function Ve(a,b,c){var d=kd;for(b=D(b);;)if(b){var e=a;if(e?e.n&256||e.Wb||(e.n?0:v(bb,e)):v(bb,e)){a=Uc(a,G(b),d);if(d===a)return c;b=I(b)}else return c}else return a}
var We=function We(b,c,d){var e=S(c,0);c=Kd(c);return u(c)?T.h(b,e,We(Tc(b,e),c,d)):T.h(b,e,d)},Xe=function Xe(){switch(arguments.length){case 3:return Xe.h(arguments[0],arguments[1],arguments[2]);case 4:return Xe.F(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return Xe.X(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);case 6:return Xe.va(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);default:return Xe.t(arguments[0],arguments[1],arguments[2],
arguments[3],arguments[4],arguments[5],new E(Array.prototype.slice.call(arguments,6),0))}};Xe.h=function(a,b,c){var d=S(b,0);b=Kd(b);return u(b)?T.h(a,d,Xe.h(Tc(a,d),b,c)):T.h(a,d,function(){var b=Tc(a,d);return c.e?c.e(b):c.call(null,b)}())};Xe.F=function(a,b,c,d){var e=S(b,0);b=Kd(b);return u(b)?T.h(a,e,Xe.F(Tc(a,e),b,c,d)):T.h(a,e,function(){var b=Tc(a,e);return c.c?c.c(b,d):c.call(null,b,d)}())};
Xe.X=function(a,b,c,d,e){var g=S(b,0);b=Kd(b);return u(b)?T.h(a,g,Xe.X(Tc(a,g),b,c,d,e)):T.h(a,g,function(){var b=Tc(a,g);return c.h?c.h(b,d,e):c.call(null,b,d,e)}())};Xe.va=function(a,b,c,d,e,g){var h=S(b,0);b=Kd(b);return u(b)?T.h(a,h,Xe.va(Tc(a,h),b,c,d,e,g)):T.h(a,h,function(){var b=Tc(a,h);return c.F?c.F(b,d,e,g):c.call(null,b,d,e,g)}())};Xe.t=function(a,b,c,d,e,g,h){var k=S(b,0);b=Kd(b);return u(b)?T.h(a,k,pe(Xe,Tc(a,k),b,c,d,N([e,g,h],0))):T.h(a,k,pe(c,Tc(a,k),d,e,g,N([h],0)))};
Xe.D=function(a){var b=G(a),c=I(a);a=G(c);var d=I(c),c=G(d),e=I(d),d=G(e),g=I(e),e=G(g),h=I(g),g=G(h),h=I(h);return Xe.t(b,a,c,d,e,g,h)};Xe.B=6;function Ye(a,b){this.R=a;this.j=b}function Ze(a){return new Ye(a,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null])}function $e(a){a=a.o;return 32>a?0:a-1>>>5<<5}function af(a,b,c){for(;;){if(0===b)return c;var d=Ze(a);d.j[0]=c;c=d;b-=5}}
var bf=function bf(b,c,d,e){var g=new Ye(d.R,Ha(d.j)),h=b.o-1>>>c&31;5===c?g.j[h]=e:(d=d.j[h],b=null!=d?bf(b,c-5,d,e):af(null,c-5,e),g.j[h]=b);return g};function cf(a,b){throw Error([x("No item "),x(a),x(" in vector of length "),x(b)].join(""));}function df(a,b){if(b>=$e(a))return a.ia;for(var c=a.root,d=a.shift;;)if(0<d)var e=d-5,c=c.j[b>>>d&31],d=e;else return c.j}function ef(a,b){return 0<=b&&b<a.o?df(a,b):cf(b,a.o)}
var ff=function ff(b,c,d,e,g){var h=new Ye(d.R,Ha(d.j));if(0===c)h.j[e&31]=g;else{var k=e>>>c&31;b=ff(b,c-5,d.j[k],e,g);h.j[k]=b}return h};function gf(a,b,c,d,e,g){this.i=a;this.base=b;this.j=c;this.Z=d;this.start=e;this.end=g}gf.prototype.Db=function(){return this.i<this.end};gf.prototype.next=function(){32===this.i-this.base&&(this.j=df(this.Z,this.i),this.base+=32);var a=this.j[this.i&31];this.i+=1;return a};
function V(a,b,c,d,e,g){this.meta=a;this.o=b;this.shift=c;this.root=d;this.ia=e;this.m=g;this.n=167668511;this.w=8196}f=V.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){return"number"===typeof b?A.h(this,b,c):c};f.P=function(a,b){return ef(this,b)[b&31]};f.na=function(a,b,c){return 0<=b&&b<this.o?df(this,b)[b&31]:c};
f.Pb=function(a,b,c){if(0<=b&&b<this.o)return $e(this)<=b?(a=Ha(this.ia),a[b&31]=c,new V(this.meta,this.o,this.shift,this.root,a,null)):new V(this.meta,this.o,this.shift,ff(this,this.shift,this.root,b,c),this.ia,null);if(b===this.o)return y(this,c);throw Error([x("Index "),x(b),x(" out of bounds  [0,"),x(this.o),x("]")].join(""));};f.tb=function(){var a=this.o;return new gf(0,0,0<R(this)?df(this,0):null,this,0,a)};f.I=function(){return this.meta};
f.T=function(){return new V(this.meta,this.o,this.shift,this.root,this.ia,this.m)};f.N=function(){return this.o};f.Nb=function(){return A.c(this,0)};f.Ob=function(){return A.c(this,1)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=xc(this)};f.v=function(a,b){if(b instanceof V)if(this.o===R(b))for(var c=bc(this),d=bc(b);;)if(u(c.Db())){var e=c.next(),g=d.next();if(!K.c(e,g))return!1}else return!0;else return!1;else return Lc(this,b)};
f.jb=function(){var a=this;return new hf(a.o,a.shift,function(){var b=a.root;return jf.e?jf.e(b):jf.call(null,b)}(),function(){var b=a.ia;return kf.e?kf.e(b):kf.call(null,b)}())};f.W=function(){return Zc(Pc,this.meta)};f.ca=function(a,b){return Dc(this,b)};f.da=function(a,b,c){a=0;for(var d=c;;)if(a<this.o){var e=df(this,a);c=e.length;a:for(var g=0;;)if(g<c)var h=e[g],d=b.c?b.c(d,h):b.call(null,d,h),g=g+1;else{e=d;break a}a+=c;d=e}else return d};
f.$=function(a,b,c){if("number"===typeof b)return pb(this,b,c);throw Error("Vector's key for assoc must be a number.");};f.M=function(){if(0===this.o)return null;if(32>=this.o)return new E(this.ia,0);var a;a:{a=this.root;for(var b=this.shift;;)if(0<b)b-=5,a=a.j[0];else{a=a.j;break a}}return lf?lf(this,a,0,0):mf.call(null,this,a,0,0)};f.J=function(a,b){return new V(b,this.o,this.shift,this.root,this.ia,this.m)};
f.L=function(a,b){if(32>this.o-$e(this)){for(var c=this.ia.length,d=Array(c+1),e=0;;)if(e<c)d[e]=this.ia[e],e+=1;else break;d[c]=b;return new V(this.meta,this.o+1,this.shift,this.root,d,null)}c=(d=this.o>>>5>1<<this.shift)?this.shift+5:this.shift;d?(d=Ze(null),d.j[0]=this.root,e=af(null,this.shift,new Ye(null,this.ia)),d.j[1]=e):d=bf(this,this.shift,this.root,new Ye(null,this.ia));return new V(this.meta,this.o+1,c,d,[b],null)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.P(null,c);case 3:return this.na(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.P(null,c)};a.h=function(a,c,d){return this.na(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};f.e=function(a){return this.P(null,a)};f.c=function(a,b){return this.na(null,a,b)};
var W=new Ye(null,[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]),Pc=new V(null,0,5,W,[],yc);V.prototype[Ga]=function(){return vc(this)};function nf(a){if(za(a))a:{var b=a.length;if(32>b)a=new V(null,b,5,W,a,null);else for(var c=32,d=(new V(null,32,5,W,a.slice(0,32),null)).jb(null);;)if(c<b)var e=c+1,d=ie.c(d,a[c]),c=e;else{a=Rb(d);break a}}else a=Rb(La(Qb,Pb(Pc),a));return a}
function of(a,b,c,d,e,g){this.ua=a;this.node=b;this.i=c;this.off=d;this.meta=e;this.m=g;this.n=32375020;this.w=1536}f=of.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.I=function(){return this.meta};f.ea=function(){if(this.off+1<this.node.length){var a;a=this.ua;var b=this.node,c=this.i,d=this.off+1;a=lf?lf(a,b,c,d):mf.call(null,a,b,c,d);return null==a?null:a}return Yb(this)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=xc(this)};
f.v=function(a,b){return Lc(this,b)};f.W=function(){return Zc(Pc,this.meta)};f.ca=function(a,b){var c;c=this.ua;var d=this.i+this.off,e=R(this.ua);c=pf?pf(c,d,e):qf.call(null,c,d,e);return Dc(c,b)};f.da=function(a,b,c){a=this.ua;var d=this.i+this.off,e=R(this.ua);a=pf?pf(a,d,e):qf.call(null,a,d,e);return Ec(a,b,c)};f.aa=function(){return this.node[this.off]};
f.oa=function(){if(this.off+1<this.node.length){var a;a=this.ua;var b=this.node,c=this.i,d=this.off+1;a=lf?lf(a,b,c,d):mf.call(null,a,b,c,d);return null==a?H:a}return Xb(this)};f.M=function(){return this};f.Lb=function(){var a=this.node;return new Zd(a,this.off,a.length)};f.Mb=function(){var a=this.i+this.node.length;if(a<Sa(this.ua)){var b=this.ua,c=df(this.ua,a);return lf?lf(b,c,a,0):mf.call(null,b,c,a,0)}return H};
f.J=function(a,b){var c=this.ua,d=this.node,e=this.i,g=this.off;return rf?rf(c,d,e,g,b):mf.call(null,c,d,e,g,b)};f.L=function(a,b){return M(b,this)};f.Kb=function(){var a=this.i+this.node.length;if(a<Sa(this.ua)){var b=this.ua,c=df(this.ua,a);return lf?lf(b,c,a,0):mf.call(null,b,c,a,0)}return null};of.prototype[Ga]=function(){return vc(this)};
function mf(){switch(arguments.length){case 3:var a=arguments[0],b=arguments[1],c=arguments[2];return new of(a,ef(a,b),b,c,null,null);case 4:return lf(arguments[0],arguments[1],arguments[2],arguments[3]);case 5:return rf(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}}function lf(a,b,c,d){return new of(a,b,c,d,null,null)}function rf(a,b,c,d,e){return new of(a,b,c,d,e,null)}
function sf(a,b,c,d,e){this.meta=a;this.Z=b;this.start=c;this.end=d;this.m=e;this.n=167666463;this.w=8192}f=sf.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){return"number"===typeof b?A.h(this,b,c):c};f.P=function(a,b){return 0>b||this.end<=this.start+b?cf(b,this.end-this.start):A.c(this.Z,this.start+b)};f.na=function(a,b,c){return 0>b||this.end<=this.start+b?c:A.h(this.Z,this.start+b,c)};
f.Pb=function(a,b,c){var d=this.start+b;a=this.meta;c=T.h(this.Z,d,c);b=this.start;var e=this.end,d=d+1,d=e>d?e:d;return tf.X?tf.X(a,c,b,d,null):tf.call(null,a,c,b,d,null)};f.I=function(){return this.meta};f.T=function(){return new sf(this.meta,this.Z,this.start,this.end,this.m)};f.N=function(){return this.end-this.start};f.K=function(){var a=this.m;return null!=a?a:this.m=a=xc(this)};f.v=function(a,b){return Lc(this,b)};f.W=function(){return Zc(Pc,this.meta)};f.ca=function(a,b){return Dc(this,b)};
f.da=function(a,b,c){return Ec(this,b,c)};f.$=function(a,b,c){if("number"===typeof b)return pb(this,b,c);throw Error("Subvec's key for assoc must be a number.");};f.M=function(){var a=this;return function(b){return function d(e){return e===a.end?null:M(A.c(a.Z,e),new Wd(null,function(){return function(){return d(e+1)}}(b),null,null))}}(this)(a.start)};f.J=function(a,b){var c=this.Z,d=this.start,e=this.end,g=this.m;return tf.X?tf.X(b,c,d,e,g):tf.call(null,b,c,d,e,g)};
f.L=function(a,b){var c=this.meta,d=pb(this.Z,this.end,b),e=this.start,g=this.end+1;return tf.X?tf.X(c,d,e,g,null):tf.call(null,c,d,e,g,null)};f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.P(null,c);case 3:return this.na(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.P(null,c)};a.h=function(a,c,d){return this.na(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};
f.e=function(a){return this.P(null,a)};f.c=function(a,b){return this.na(null,a,b)};sf.prototype[Ga]=function(){return vc(this)};function tf(a,b,c,d,e){for(;;)if(b instanceof sf)c=b.start+c,d=b.start+d,b=b.Z;else{var g=R(b);if(0>c||0>d||c>g||d>g)throw Error("Index out of bounds");return new sf(a,b,c,d,e)}}
function qf(){switch(arguments.length){case 2:var a=arguments[0];return pf(a,arguments[1],R(a));case 3:return pf(arguments[0],arguments[1],arguments[2]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}}function pf(a,b,c){return tf(null,a,b,c,null)}function uf(a,b){return a===b.R?b:new Ye(a,Ha(b.j))}function jf(a){return new Ye({},Ha(a.j))}
function kf(a){var b=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];jd(a,0,b,0,a.length);return b}var vf=function vf(b,c,d,e){d=uf(b.root.R,d);var g=b.o-1>>>c&31;if(5===c)b=e;else{var h=d.j[g];b=null!=h?vf(b,c-5,h,e):af(b.root.R,c-5,e)}d.j[g]=b;return d};function hf(a,b,c,d){this.o=a;this.shift=b;this.root=c;this.ia=d;this.n=275;this.w=88}f=hf.prototype;
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.G(null,c)};a.h=function(a,c,d){return this.C(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};f.e=function(a){return this.G(null,a)};f.c=function(a,b){return this.C(null,a,b)};f.G=function(a,b){return cb.h(this,b,null)};
f.C=function(a,b,c){return"number"===typeof b?A.h(this,b,c):c};f.P=function(a,b){if(this.root.R)return ef(this,b)[b&31];throw Error("nth after persistent!");};f.na=function(a,b,c){return 0<=b&&b<this.o?A.c(this,b):c};f.N=function(){if(this.root.R)return this.o;throw Error("count after persistent!");};
f.Yb=function(a,b,c){var d=this;if(d.root.R){if(0<=b&&b<d.o)return $e(this)<=b?d.ia[b&31]=c:(a=function(){return function g(a,k){var l=uf(d.root.R,k);if(0===a)l.j[b&31]=c;else{var p=b>>>a&31,n=g(a-5,l.j[p]);l.j[p]=n}return l}}(this).call(null,d.shift,d.root),d.root=a),this;if(b===d.o)return Qb(this,c);throw Error([x("Index "),x(b),x(" out of bounds for TransientVector of length"),x(d.o)].join(""));}throw Error("assoc! after persistent!");};
f.vb=function(a,b,c){if("number"===typeof b)return Ub(this,b,c);throw Error("TransientVector's key for assoc! must be a number.");};
f.cb=function(a,b){if(this.root.R){if(32>this.o-$e(this))this.ia[this.o&31]=b;else{var c=new Ye(this.root.R,this.ia),d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];d[0]=b;this.ia=d;if(this.o>>>5>1<<this.shift){var d=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],e=this.shift+
5;d[0]=this.root;d[1]=af(this.root.R,this.shift,c);this.root=new Ye(this.root.R,d);this.shift=e}else this.root=vf(this,this.shift,this.root,c)}this.o+=1;return this}throw Error("conj! after persistent!");};f.eb=function(){if(this.root.R){this.root.R=null;var a=this.o-$e(this),b=Array(a);jd(this.ia,0,b,0,a);return new V(null,this.o,this.shift,this.root,b,null)}throw Error("persistent! called twice");};function wf(){this.w=0;this.n=2097152}wf.prototype.v=function(){return!1};
wf.prototype.equiv=function(a){return this.v(null,a)};var xf=new wf;function yf(a,b){return md(fd(b)?R(a)===R(b)?se(Fd,Z.c(function(a){return K.c(Uc(b,G(a),xf),Nc(a))},a)):null:null)}function zf(a){this.s=a}zf.prototype.next=function(){if(null!=this.s){var a=G(this.s),b=S(a,0),a=S(a,1);this.s=I(this.s);return{done:!1,value:[b,a]}}return{done:!0,value:null}};function Af(a){return new zf(D(a))}function Bf(a){this.s=a}
Bf.prototype.next=function(){if(null!=this.s){var a=G(this.s);this.s=I(this.s);return{done:!1,value:[a,a]}}return{done:!0,value:null}};
function Cf(a,b){var c;if(b instanceof X)a:{c=a.length;for(var d=b.V,e=0;;){if(c<=e){c=-1;break a}var g=a[e];if(g instanceof X&&d===g.V){c=e;break a}e+=2}}else if(c="string"==typeof b,u(u(c)?c:"number"===typeof b))a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(b===a[d]){c=d;break a}d+=2}else if(b instanceof C)a:for(c=a.length,d=b.Ga,e=0;;){if(c<=e){c=-1;break a}g=a[e];if(g instanceof C&&d===g.Ga){c=e;break a}e+=2}else if(null==b)a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(null==a[d]){c=d;break a}d+=
2}else a:for(c=a.length,d=0;;){if(c<=d){c=-1;break a}if(K.c(b,a[d])){c=d;break a}d+=2}return c}function Df(a,b,c){this.j=a;this.i=b;this.ja=c;this.w=0;this.n=32374990}f=Df.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.I=function(){return this.ja};f.ea=function(){return this.i<this.j.length-2?new Df(this.j,this.i+2,this.ja):null};f.N=function(){return(this.j.length-this.i)/2};f.K=function(){return xc(this)};f.v=function(a,b){return Lc(this,b)};
f.W=function(){return Zc(H,this.ja)};f.ca=function(a,b){return Cd(b,this)};f.da=function(a,b,c){return Dd(b,c,this)};f.aa=function(){return new V(null,2,5,W,[this.j[this.i],this.j[this.i+1]],null)};f.oa=function(){return this.i<this.j.length-2?new Df(this.j,this.i+2,this.ja):H};f.M=function(){return this};f.J=function(a,b){return new Df(this.j,this.i,b)};f.L=function(a,b){return M(b,this)};Df.prototype[Ga]=function(){return vc(this)};function Ef(a,b,c){this.j=a;this.i=b;this.o=c}
Ef.prototype.Db=function(){return this.i<this.o};Ef.prototype.next=function(){var a=new V(null,2,5,W,[this.j[this.i],this.j[this.i+1]],null);this.i+=2;return a};function r(a,b,c,d){this.meta=a;this.o=b;this.j=c;this.m=d;this.n=16647951;this.w=8196}f=r.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.keys=function(){return vc(Ff.e?Ff.e(this):Ff.call(null,this))};f.entries=function(){return Af(D(this))};
f.values=function(){return vc(Gf.e?Gf.e(this):Gf.call(null,this))};f.has=function(a){return pd(this,a)};f.get=function(a,b){return this.C(null,a,b)};f.forEach=function(a){for(var b=D(this),c=null,d=0,e=0;;)if(e<d){var g=c.P(null,e),h=S(g,0),g=S(g,1);a.c?a.c(g,h):a.call(null,g,h);e+=1}else if(b=D(b))hd(b)?(c=Wb(b),b=Xb(b),h=c,d=R(c),c=h):(c=G(b),h=S(c,0),c=g=S(c,1),a.c?a.c(c,h):a.call(null,c,h),b=I(b),c=null,d=0),e=0;else return null};f.G=function(a,b){return cb.h(this,b,null)};
f.C=function(a,b,c){a=Cf(this.j,b);return-1===a?c:this.j[a+1]};f.tb=function(){return new Ef(this.j,0,2*this.o)};f.I=function(){return this.meta};f.T=function(){return new r(this.meta,this.o,this.j,this.m)};f.N=function(){return this.o};f.K=function(){var a=this.m;return null!=a?a:this.m=a=zc(this)};
f.v=function(a,b){if(b&&(b.n&1024||b.Rc)){var c=this.j.length;if(this.o===b.N(null))for(var d=0;;)if(d<c){var e=b.C(null,this.j[d],kd);if(e!==kd)if(K.c(this.j[d+1],e))d+=2;else return!1;else return!1}else return!0;else return!1}else return yf(this,b)};f.jb=function(){return new Hf({},this.j.length,Ha(this.j))};f.W=function(){return wb(td,this.meta)};f.ca=function(a,b){return Cd(b,this)};f.da=function(a,b,c){return Dd(b,c,this)};
f.ka=function(a,b){if(0<=Cf(this.j,b)){var c=this.j.length,d=c-2;if(0===d)return Ua(this);for(var d=Array(d),e=0,g=0;;){if(e>=c)return new r(this.meta,this.o-1,d,null);K.c(b,this.j[e])||(d[g]=this.j[e],d[g+1]=this.j[e+1],g+=2);e+=2}}else return this};
f.$=function(a,b,c){a=Cf(this.j,b);if(-1===a){if(this.o<sd){a=this.j;for(var d=a.length,e=Array(d+2),g=0;;)if(g<d)e[g]=a[g],g+=1;else break;e[d]=b;e[d+1]=c;return new r(this.meta,this.o+1,e,null)}return wb(fb(Se.c(If,this),b,c),this.meta)}if(c===this.j[a+1])return this;b=Ha(this.j);b[a+1]=c;return new r(this.meta,this.o,b,null)};f.qb=function(a,b){return-1!==Cf(this.j,b)};f.M=function(){var a=this.j;return 0<=a.length-2?new Df(a,0,null):null};f.J=function(a,b){return new r(b,this.o,this.j,this.m)};
f.L=function(a,b){if(gd(b))return fb(this,A.c(b,0),A.c(b,1));for(var c=this,d=D(b);;){if(null==d)return c;var e=G(d);if(gd(e))c=fb(c,A.c(e,0),A.c(e,1)),d=I(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.G(null,c)};a.h=function(a,c,d){return this.C(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};f.e=function(a){return this.G(null,a)};f.c=function(a,b){return this.C(null,a,b)};var td=new r(null,0,[],Bc),sd=8;
function Jf(a){for(var b=[],c=0;;)if(c<a.length){var d=a[c],e=a[c+1];-1===Cf(b,d)&&(b.push(d),b.push(e));c+=2}else break;return new r(null,b.length/2,b,null)}r.prototype[Ga]=function(){return vc(this)};function Hf(a,b,c){this.mb=a;this.ob=b;this.j=c;this.w=56;this.n=258}f=Hf.prototype;
f.vb=function(a,b,c){if(u(this.mb)){a=Cf(this.j,b);if(-1===a){if(this.ob+2<=2*sd)return this.ob+=2,this.j.push(b),this.j.push(c),this;a=this.ob;var d=this.j;a=Kf.c?Kf.c(a,d):Kf.call(null,a,d);return Tb(a,b,c)}c!==this.j[a+1]&&(this.j[a+1]=c);return this}throw Error("assoc! after persistent!");};
f.cb=function(a,b){if(u(this.mb)){if(b?b.n&2048||b.Sc||(b.n?0:v(ib,b)):v(ib,b))return Tb(this,Md.e?Md.e(b):Md.call(null,b),Nd.e?Nd.e(b):Nd.call(null,b));for(var c=D(b),d=this;;){var e=G(c);if(u(e))var g=e,c=I(c),d=Tb(d,function(){var a=g;return Md.e?Md.e(a):Md.call(null,a)}(),function(){var a=g;return Nd.e?Nd.e(a):Nd.call(null,a)}());else return d}}else throw Error("conj! after persistent!");};
f.eb=function(){if(u(this.mb))return this.mb=!1,new r(null,Id(this.ob),this.j,null);throw Error("persistent! called twice");};f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){if(u(this.mb))return a=Cf(this.j,b),-1===a?c:this.j[a+1];throw Error("lookup after persistent!");};f.N=function(){if(u(this.mb))return Id(this.ob);throw Error("count after persistent!");};function Kf(a,b){for(var c=Pb(If),d=0;;)if(d<a)c=Tb(c,b[d],b[d+1]),d+=2;else return c}function Lf(){this.val=!1}
function Mf(a,b){return a===b?!0:Y(a,b)?!0:K.c(a,b)}function Nf(a,b,c){a=Ha(a);a[b]=c;return a}function Of(a,b){var c=Array(a.length-2);jd(a,0,c,0,2*b);jd(a,2*(b+1),c,2*b,c.length-2*b);return c}function Pf(a,b,c,d){a=a.fb(b);a.j[c]=d;return a}function Qf(a,b,c){this.R=a;this.S=b;this.j=c}f=Qf.prototype;f.fb=function(a){if(a===this.R)return this;var b=Jd(this.S),c=Array(0>b?4:2*(b+1));jd(this.j,0,c,0,2*b);return new Qf(a,this.S,c)};f.xb=function(){var a=this.j;return Rf?Rf(a):Sf.call(null,a)};
f.Za=function(a,b,c,d){var e=1<<(b>>>a&31);if(0===(this.S&e))return d;var g=Jd(this.S&e-1),e=this.j[2*g],g=this.j[2*g+1];return null==e?g.Za(a+5,b,c,d):Mf(c,e)?g:d};
f.ya=function(a,b,c,d,e,g){var h=1<<(c>>>b&31),k=Jd(this.S&h-1);if(0===(this.S&h)){var l=Jd(this.S);if(2*l<this.j.length){a=this.fb(a);b=a.j;g.val=!0;a:for(c=2*(l-k),g=2*k+(c-1),l=2*(k+1)+(c-1);;){if(0===c)break a;b[l]=b[g];--l;--c;--g}b[2*k]=d;b[2*k+1]=e;a.S|=h;return a}if(16<=l){k=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];k[c>>>b&31]=Tf.ya(a,b+5,c,d,e,g);for(e=d=0;;)if(32>d)0!==
(this.S>>>d&1)&&(k[d]=null!=this.j[e]?Tf.ya(a,b+5,oc(this.j[e]),this.j[e],this.j[e+1],g):this.j[e+1],e+=2),d+=1;else break;return new Uf(a,l+1,k)}b=Array(2*(l+4));jd(this.j,0,b,0,2*k);b[2*k]=d;b[2*k+1]=e;jd(this.j,2*k,b,2*(k+1),2*(l-k));g.val=!0;a=this.fb(a);a.j=b;a.S|=h;return a}l=this.j[2*k];h=this.j[2*k+1];if(null==l)return l=h.ya(a,b+5,c,d,e,g),l===h?this:Pf(this,a,2*k+1,l);if(Mf(d,l))return e===h?this:Pf(this,a,2*k+1,e);g.val=!0;g=b+5;d=Vf?Vf(a,g,l,h,c,d,e):Wf.call(null,a,g,l,h,c,d,e);e=2*k;
k=2*k+1;a=this.fb(a);a.j[e]=null;a.j[k]=d;return a};
f.xa=function(a,b,c,d,e){var g=1<<(b>>>a&31),h=Jd(this.S&g-1);if(0===(this.S&g)){var k=Jd(this.S);if(16<=k){h=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];h[b>>>a&31]=Tf.xa(a+5,b,c,d,e);for(d=c=0;;)if(32>c)0!==(this.S>>>c&1)&&(h[c]=null!=this.j[d]?Tf.xa(a+5,oc(this.j[d]),this.j[d],this.j[d+1],e):this.j[d+1],d+=2),c+=1;else break;return new Uf(null,k+1,h)}a=Array(2*(k+1));jd(this.j,
0,a,0,2*h);a[2*h]=c;a[2*h+1]=d;jd(this.j,2*h,a,2*(h+1),2*(k-h));e.val=!0;return new Qf(null,this.S|g,a)}var l=this.j[2*h],g=this.j[2*h+1];if(null==l)return k=g.xa(a+5,b,c,d,e),k===g?this:new Qf(null,this.S,Nf(this.j,2*h+1,k));if(Mf(c,l))return d===g?this:new Qf(null,this.S,Nf(this.j,2*h+1,d));e.val=!0;e=this.S;k=this.j;a+=5;a=Xf?Xf(a,l,g,b,c,d):Wf.call(null,a,l,g,b,c,d);c=2*h;h=2*h+1;d=Ha(k);d[c]=null;d[h]=a;return new Qf(null,e,d)};
f.yb=function(a,b,c){var d=1<<(b>>>a&31);if(0===(this.S&d))return this;var e=Jd(this.S&d-1),g=this.j[2*e],h=this.j[2*e+1];return null==g?(a=h.yb(a+5,b,c),a===h?this:null!=a?new Qf(null,this.S,Nf(this.j,2*e+1,a)):this.S===d?null:new Qf(null,this.S^d,Of(this.j,e))):Mf(c,g)?new Qf(null,this.S^d,Of(this.j,e)):this};var Tf=new Qf(null,0,[]);function Uf(a,b,c){this.R=a;this.o=b;this.j=c}f=Uf.prototype;f.fb=function(a){return a===this.R?this:new Uf(a,this.o,Ha(this.j))};
f.xb=function(){var a=this.j;return Yf?Yf(a):ag.call(null,a)};f.Za=function(a,b,c,d){var e=this.j[b>>>a&31];return null!=e?e.Za(a+5,b,c,d):d};f.ya=function(a,b,c,d,e,g){var h=c>>>b&31,k=this.j[h];if(null==k)return a=Pf(this,a,h,Tf.ya(a,b+5,c,d,e,g)),a.o+=1,a;b=k.ya(a,b+5,c,d,e,g);return b===k?this:Pf(this,a,h,b)};
f.xa=function(a,b,c,d,e){var g=b>>>a&31,h=this.j[g];if(null==h)return new Uf(null,this.o+1,Nf(this.j,g,Tf.xa(a+5,b,c,d,e)));a=h.xa(a+5,b,c,d,e);return a===h?this:new Uf(null,this.o,Nf(this.j,g,a))};
f.yb=function(a,b,c){var d=b>>>a&31,e=this.j[d];if(null!=e){a=e.yb(a+5,b,c);if(a===e)d=this;else if(null==a)if(8>=this.o)a:{e=this.j;a=e.length;b=Array(2*(this.o-1));c=0;for(var g=1,h=0;;)if(c<a)c!==d&&null!=e[c]&&(b[g]=e[c],g+=2,h|=1<<c),c+=1;else{d=new Qf(null,h,b);break a}}else d=new Uf(null,this.o-1,Nf(this.j,d,a));else d=new Uf(null,this.o,Nf(this.j,d,a));return d}return this};function bg(a,b,c){b*=2;for(var d=0;;)if(d<b){if(Mf(c,a[d]))return d;d+=2}else return-1}
function cg(a,b,c,d){this.R=a;this.Va=b;this.o=c;this.j=d}f=cg.prototype;f.fb=function(a){if(a===this.R)return this;var b=Array(2*(this.o+1));jd(this.j,0,b,0,2*this.o);return new cg(a,this.Va,this.o,b)};f.xb=function(){var a=this.j;return Rf?Rf(a):Sf.call(null,a)};f.Za=function(a,b,c,d){a=bg(this.j,this.o,c);return 0>a?d:Mf(c,this.j[a])?this.j[a+1]:d};
f.ya=function(a,b,c,d,e,g){if(c===this.Va){b=bg(this.j,this.o,d);if(-1===b){if(this.j.length>2*this.o)return b=2*this.o,c=2*this.o+1,a=this.fb(a),a.j[b]=d,a.j[c]=e,g.val=!0,a.o+=1,a;c=this.j.length;b=Array(c+2);jd(this.j,0,b,0,c);b[c]=d;b[c+1]=e;g.val=!0;d=this.o+1;a===this.R?(this.j=b,this.o=d,a=this):a=new cg(this.R,this.Va,d,b);return a}return this.j[b+1]===e?this:Pf(this,a,b+1,e)}return(new Qf(a,1<<(this.Va>>>b&31),[null,this,null,null])).ya(a,b,c,d,e,g)};
f.xa=function(a,b,c,d,e){return b===this.Va?(a=bg(this.j,this.o,c),-1===a?(a=2*this.o,b=Array(a+2),jd(this.j,0,b,0,a),b[a]=c,b[a+1]=d,e.val=!0,new cg(null,this.Va,this.o+1,b)):K.c(this.j[a],d)?this:new cg(null,this.Va,this.o,Nf(this.j,a+1,d))):(new Qf(null,1<<(this.Va>>>a&31),[null,this])).xa(a,b,c,d,e)};f.yb=function(a,b,c){a=bg(this.j,this.o,c);return-1===a?this:1===this.o?null:new cg(null,this.Va,this.o-1,Of(this.j,Id(a)))};
function Wf(){switch(arguments.length){case 6:return Xf(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);case 7:return Vf(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}}function Xf(a,b,c,d,e,g){var h=oc(b);if(h===d)return new cg(null,h,2,[b,c,e,g]);var k=new Lf;return Tf.xa(a,h,b,c,k).xa(a,d,e,g,k)}
function Vf(a,b,c,d,e,g,h){var k=oc(c);if(k===e)return new cg(null,k,2,[c,d,g,h]);var l=new Lf;return Tf.ya(a,b,k,c,d,l).ya(a,b,e,g,h,l)}function dg(a,b,c,d,e){this.meta=a;this.ab=b;this.i=c;this.s=d;this.m=e;this.w=0;this.n=32374860}f=dg.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.I=function(){return this.meta};f.K=function(){var a=this.m;return null!=a?a:this.m=a=xc(this)};f.v=function(a,b){return Lc(this,b)};f.W=function(){return Zc(H,this.meta)};
f.ca=function(a,b){return Cd(b,this)};f.da=function(a,b,c){return Dd(b,c,this)};f.aa=function(){return null==this.s?new V(null,2,5,W,[this.ab[this.i],this.ab[this.i+1]],null):G(this.s)};f.oa=function(){if(null==this.s){var a=this.ab,b=this.i+2;return eg?eg(a,b,null):Sf.call(null,a,b,null)}var a=this.ab,b=this.i,c=I(this.s);return eg?eg(a,b,c):Sf.call(null,a,b,c)};f.M=function(){return this};f.J=function(a,b){return new dg(b,this.ab,this.i,this.s,this.m)};f.L=function(a,b){return M(b,this)};
dg.prototype[Ga]=function(){return vc(this)};function Sf(){switch(arguments.length){case 1:return Rf(arguments[0]);case 3:return eg(arguments[0],arguments[1],arguments[2]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}}function Rf(a){return eg(a,0,null)}
function eg(a,b,c){if(null==c)for(c=a.length;;)if(b<c){if(null!=a[b])return new dg(null,a,b,null,null);var d=a[b+1];if(u(d)&&(d=d.xb(),u(d)))return new dg(null,a,b+2,d,null);b+=2}else return null;else return new dg(null,a,b,c,null)}function fg(a,b,c,d,e){this.meta=a;this.ab=b;this.i=c;this.s=d;this.m=e;this.w=0;this.n=32374860}f=fg.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.I=function(){return this.meta};
f.K=function(){var a=this.m;return null!=a?a:this.m=a=xc(this)};f.v=function(a,b){return Lc(this,b)};f.W=function(){return Zc(H,this.meta)};f.ca=function(a,b){return Cd(b,this)};f.da=function(a,b,c){return Dd(b,c,this)};f.aa=function(){return G(this.s)};f.oa=function(){var a=this.ab,b=this.i,c=I(this.s);return gg?gg(null,a,b,c):ag.call(null,null,a,b,c)};f.M=function(){return this};f.J=function(a,b){return new fg(b,this.ab,this.i,this.s,this.m)};f.L=function(a,b){return M(b,this)};
fg.prototype[Ga]=function(){return vc(this)};function ag(){switch(arguments.length){case 1:return Yf(arguments[0]);case 4:return gg(arguments[0],arguments[1],arguments[2],arguments[3]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}}function Yf(a){return gg(null,a,0,null)}function gg(a,b,c,d){if(null==d)for(d=b.length;;)if(c<d){var e=b[c];if(u(e)&&(e=e.xb(),u(e)))return new fg(a,b,c+1,e,null);c+=1}else return null;else return new fg(a,b,c,d,null)}
function hg(a,b,c,d,e,g){this.meta=a;this.o=b;this.root=c;this.fa=d;this.sa=e;this.m=g;this.n=16123663;this.w=8196}f=hg.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.keys=function(){return vc(Ff.e?Ff.e(this):Ff.call(null,this))};f.entries=function(){return Af(D(this))};f.values=function(){return vc(Gf.e?Gf.e(this):Gf.call(null,this))};f.has=function(a){return pd(this,a)};f.get=function(a,b){return this.C(null,a,b)};
f.forEach=function(a){for(var b=D(this),c=null,d=0,e=0;;)if(e<d){var g=c.P(null,e),h=S(g,0),g=S(g,1);a.c?a.c(g,h):a.call(null,g,h);e+=1}else if(b=D(b))hd(b)?(c=Wb(b),b=Xb(b),h=c,d=R(c),c=h):(c=G(b),h=S(c,0),c=g=S(c,1),a.c?a.c(c,h):a.call(null,c,h),b=I(b),c=null,d=0),e=0;else return null};f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){return null==b?this.fa?this.sa:c:null==this.root?c:this.root.Za(0,oc(b),b,c)};f.I=function(){return this.meta};
f.T=function(){return new hg(this.meta,this.o,this.root,this.fa,this.sa,this.m)};f.N=function(){return this.o};f.K=function(){var a=this.m;return null!=a?a:this.m=a=zc(this)};f.v=function(a,b){return yf(this,b)};f.jb=function(){return new ig({},this.root,this.o,this.fa,this.sa)};f.W=function(){return wb(If,this.meta)};
f.ka=function(a,b){if(null==b)return this.fa?new hg(this.meta,this.o-1,this.root,!1,null,null):this;if(null==this.root)return this;var c=this.root.yb(0,oc(b),b);return c===this.root?this:new hg(this.meta,this.o-1,c,this.fa,this.sa,null)};
f.$=function(a,b,c){if(null==b)return this.fa&&c===this.sa?this:new hg(this.meta,this.fa?this.o:this.o+1,this.root,!0,c,null);a=new Lf;b=(null==this.root?Tf:this.root).xa(0,oc(b),b,c,a);return b===this.root?this:new hg(this.meta,a.val?this.o+1:this.o,b,this.fa,this.sa,null)};f.qb=function(a,b){return null==b?this.fa:null==this.root?!1:this.root.Za(0,oc(b),b,kd)!==kd};f.M=function(){if(0<this.o){var a=null!=this.root?this.root.xb():null;return this.fa?M(new V(null,2,5,W,[null,this.sa],null),a):a}return null};
f.J=function(a,b){return new hg(b,this.o,this.root,this.fa,this.sa,this.m)};f.L=function(a,b){if(gd(b))return fb(this,A.c(b,0),A.c(b,1));for(var c=this,d=D(b);;){if(null==d)return c;var e=G(d);if(gd(e))c=fb(c,A.c(e,0),A.c(e,1)),d=I(d);else throw Error("conj on a map takes map entries or seqables of map entries");}};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.G(null,c)};a.h=function(a,c,d){return this.C(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};f.e=function(a){return this.G(null,a)};f.c=function(a,b){return this.C(null,a,b)};var If=new hg(null,0,null,!1,null,Bc);
function Vc(a,b){for(var c=a.length,d=0,e=Pb(If);;)if(d<c)var g=d+1,e=e.vb(null,a[d],b[d]),d=g;else return Rb(e)}hg.prototype[Ga]=function(){return vc(this)};function ig(a,b,c,d,e){this.R=a;this.root=b;this.count=c;this.fa=d;this.sa=e;this.w=56;this.n=258}f=ig.prototype;f.vb=function(a,b,c){return jg(this,b,c)};f.cb=function(a,b){return kg(this,b)};f.eb=function(){var a;if(this.R)this.R=null,a=new hg(null,this.count,this.root,this.fa,this.sa,null);else throw Error("persistent! called twice");return a};
f.G=function(a,b){return null==b?this.fa?this.sa:null:null==this.root?null:this.root.Za(0,oc(b),b)};f.C=function(a,b,c){return null==b?this.fa?this.sa:c:null==this.root?c:this.root.Za(0,oc(b),b,c)};f.N=function(){if(this.R)return this.count;throw Error("count after persistent!");};
function kg(a,b){if(a.R){if(b?b.n&2048||b.Sc||(b.n?0:v(ib,b)):v(ib,b))return jg(a,Md.e?Md.e(b):Md.call(null,b),Nd.e?Nd.e(b):Nd.call(null,b));for(var c=D(b),d=a;;){var e=G(c);if(u(e))var g=e,c=I(c),d=jg(d,function(){var a=g;return Md.e?Md.e(a):Md.call(null,a)}(),function(){var a=g;return Nd.e?Nd.e(a):Nd.call(null,a)}());else return d}}else throw Error("conj! after persistent");}
function jg(a,b,c){if(a.R){if(null==b)a.sa!==c&&(a.sa=c),a.fa||(a.count+=1,a.fa=!0);else{var d=new Lf;b=(null==a.root?Tf:a.root).ya(a.R,0,oc(b),b,c,d);b!==a.root&&(a.root=b);d.val&&(a.count+=1)}return a}throw Error("assoc! after persistent!");}var Ce=function Ce(){return Ce.t(0<arguments.length?new E(Array.prototype.slice.call(arguments,0),0):null)};Ce.t=function(a){for(var b=D(a),c=Pb(If);;)if(b){a=I(I(b));var d=G(b),b=Nc(b),c=Tb(c,d,b),b=a}else return Rb(c)};Ce.B=0;Ce.D=function(a){return Ce.t(D(a))};
var lg=function lg(){return lg.t(0<arguments.length?new E(Array.prototype.slice.call(arguments,0),0):null)};lg.t=function(a){a=a instanceof E?a.j:Ja(a);return Jf(a)};lg.B=0;lg.D=function(a){return lg.t(D(a))};function mg(a,b){this.ga=a;this.ja=b;this.w=0;this.n=32374988}f=mg.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.I=function(){return this.ja};
f.ea=function(){var a=this.ga,a=(a?a.n&128||a.Cb||(a.n?0:v(ab,a)):v(ab,a))?this.ga.ea(null):I(this.ga);return null==a?null:new mg(a,this.ja)};f.K=function(){return xc(this)};f.v=function(a,b){return Lc(this,b)};f.W=function(){return Zc(H,this.ja)};f.ca=function(a,b){return Cd(b,this)};f.da=function(a,b,c){return Dd(b,c,this)};f.aa=function(){return this.ga.aa(null).Nb()};
f.oa=function(){var a=this.ga,a=(a?a.n&128||a.Cb||(a.n?0:v(ab,a)):v(ab,a))?this.ga.ea(null):I(this.ga);return null!=a?new mg(a,this.ja):H};f.M=function(){return this};f.J=function(a,b){return new mg(this.ga,b)};f.L=function(a,b){return M(b,this)};mg.prototype[Ga]=function(){return vc(this)};function Ff(a){return(a=D(a))?new mg(a,null):null}function Md(a){return jb(a)}function ng(a,b){this.ga=a;this.ja=b;this.w=0;this.n=32374988}f=ng.prototype;f.toString=function(){return dc(this)};
f.equiv=function(a){return this.v(null,a)};f.I=function(){return this.ja};f.ea=function(){var a=this.ga,a=(a?a.n&128||a.Cb||(a.n?0:v(ab,a)):v(ab,a))?this.ga.ea(null):I(this.ga);return null==a?null:new ng(a,this.ja)};f.K=function(){return xc(this)};f.v=function(a,b){return Lc(this,b)};f.W=function(){return Zc(H,this.ja)};f.ca=function(a,b){return Cd(b,this)};f.da=function(a,b,c){return Dd(b,c,this)};f.aa=function(){return this.ga.aa(null).Ob()};
f.oa=function(){var a=this.ga,a=(a?a.n&128||a.Cb||(a.n?0:v(ab,a)):v(ab,a))?this.ga.ea(null):I(this.ga);return null!=a?new ng(a,this.ja):H};f.M=function(){return this};f.J=function(a,b){return new ng(this.ga,b)};f.L=function(a,b){return M(b,this)};ng.prototype[Ga]=function(){return vc(this)};function Gf(a){return(a=D(a))?new ng(a,null):null}function Nd(a){return kb(a)}var og=function og(){return og.t(0<arguments.length?new E(Array.prototype.slice.call(arguments,0),0):null)};
og.t=function(a){return u(te(Fd,a))?Ed(function(a,c){return Oc.c(u(a)?a:td,c)},a):null};og.B=0;og.D=function(a){return og.t(D(a))};function ud(a,b,c){this.meta=a;this.Ya=b;this.m=c;this.n=15077647;this.w=8196}f=ud.prototype;f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.keys=function(){return vc(D(this))};f.entries=function(){var a=D(this);return new Bf(D(a))};f.values=function(){return vc(D(this))};f.has=function(a){return pd(this,a)};
f.forEach=function(a){for(var b=D(this),c=null,d=0,e=0;;)if(e<d){var g=c.P(null,e),h=S(g,0),g=S(g,1);a.c?a.c(g,h):a.call(null,g,h);e+=1}else if(b=D(b))hd(b)?(c=Wb(b),b=Xb(b),h=c,d=R(c),c=h):(c=G(b),h=S(c,0),c=g=S(c,1),a.c?a.c(c,h):a.call(null,c,h),b=I(b),c=null,d=0),e=0;else return null};f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){return eb(this.Ya,b)?b:c};f.I=function(){return this.meta};f.T=function(){return new ud(this.meta,this.Ya,this.m)};f.N=function(){return Sa(this.Ya)};
f.K=function(){var a=this.m;return null!=a?a:this.m=a=zc(this)};f.v=function(a,b){return dd(b)&&R(this)===R(b)&&se(function(a){return function(b){return pd(a,b)}}(this),b)};f.jb=function(){return new pg(Pb(this.Ya))};f.W=function(){return Zc(vd,this.meta)};f.Xb=function(a,b){return new ud(this.meta,hb(this.Ya,b),null)};f.M=function(){return Ff(this.Ya)};f.J=function(a,b){return new ud(b,this.Ya,this.m)};f.L=function(a,b){return new ud(this.meta,T.h(this.Ya,b,null),null)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.G(null,c)};a.h=function(a,c,d){return this.C(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};f.e=function(a){return this.G(null,a)};f.c=function(a,b){return this.C(null,a,b)};var vd=new ud(null,td,Bc);ud.prototype[Ga]=function(){return vc(this)};
function pg(a){this.Xa=a;this.n=259;this.w=136}f=pg.prototype;f.call=function(){function a(a,b,c){return cb.h(this.Xa,b,kd)===kd?c:b}function b(a,b){return cb.h(this.Xa,b,kd)===kd?null:b}var c=null,c=function(c,e,g){switch(arguments.length){case 2:return b.call(this,c,e);case 3:return a.call(this,c,e,g)}throw Error("Invalid arity: "+arguments.length);};c.c=b;c.h=a;return c}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};
f.e=function(a){return cb.h(this.Xa,a,kd)===kd?null:a};f.c=function(a,b){return cb.h(this.Xa,a,kd)===kd?b:a};f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){return cb.h(this.Xa,b,kd)===kd?c:b};f.N=function(){return R(this.Xa)};f.cb=function(a,b){this.Xa=Tb(this.Xa,b,null);return this};f.eb=function(){return new ud(null,Rb(this.Xa),null)};
function qg(a){a=D(a);if(null==a)return vd;if(a instanceof E&&0===a.i){a=a.j;a:for(var b=0,c=Pb(vd);;)if(b<a.length)var d=b+1,c=c.cb(null,a[b]),b=d;else break a;return c.eb(null)}for(d=Pb(vd);;)if(null!=a)b=a.ea(null),d=d.cb(null,a.aa(null)),a=b;else return d.eb(null)}function Vd(a){if(a&&(a.w&4096||a.Uc))return a.name;if("string"===typeof a)return a;throw Error([x("Doesn't support name: "),x(a)].join(""));}
function rg(a,b){return new Wd(null,function(){var c=D(b);if(c){var d;d=G(c);d=a.e?a.e(d):a.call(null,d);c=u(d)?M(G(c),rg(a,tc(c))):null}else c=null;return c},null,null)}function sg(a,b,c){this.i=a;this.end=b;this.step=c}sg.prototype.Db=function(){return 0<this.step?this.i<this.end:this.i>this.end};sg.prototype.next=function(){var a=this.i;this.i+=this.step;return a};function tg(a,b,c,d,e){this.meta=a;this.start=b;this.end=c;this.step=d;this.m=e;this.n=32375006;this.w=8192}f=tg.prototype;
f.toString=function(){return dc(this)};f.equiv=function(a){return this.v(null,a)};f.P=function(a,b){if(b<Sa(this))return this.start+b*this.step;if(this.start>this.end&&0===this.step)return this.start;throw Error("Index out of bounds");};f.na=function(a,b,c){return b<Sa(this)?this.start+b*this.step:this.start>this.end&&0===this.step?this.start:c};f.tb=function(){return new sg(this.start,this.end,this.step)};f.I=function(){return this.meta};
f.T=function(){return new tg(this.meta,this.start,this.end,this.step,this.m)};f.ea=function(){return 0<this.step?this.start+this.step<this.end?new tg(this.meta,this.start+this.step,this.end,this.step,null):null:this.start+this.step>this.end?new tg(this.meta,this.start+this.step,this.end,this.step,null):null};f.N=function(){if(Aa(Fb(this)))return 0;var a=(this.end-this.start)/this.step;return Math.ceil.e?Math.ceil.e(a):Math.ceil.call(null,a)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=xc(this)};
f.v=function(a,b){return Lc(this,b)};f.W=function(){return Zc(H,this.meta)};f.ca=function(a,b){return Dc(this,b)};f.da=function(a,b,c){for(a=this.start;;)if(0<this.step?a<this.end:a>this.end){var d=a;c=b.c?b.c(c,d):b.call(null,c,d);a+=this.step}else return c};f.aa=function(){return null==Fb(this)?null:this.start};f.oa=function(){return null!=Fb(this)?new tg(this.meta,this.start+this.step,this.end,this.step,null):H};
f.M=function(){return 0<this.step?this.start<this.end?this:null:this.start>this.end?this:null};f.J=function(a,b){return new tg(b,this.start,this.end,this.step,this.m)};f.L=function(a,b){return M(b,this)};tg.prototype[Ga]=function(){return vc(this)};function ug(a,b){return new V(null,2,5,W,[rg(a,b),Je(a,b)],null)}
function vg(a,b){return function(){function c(c,d,e){return new V(null,2,5,W,[a.h?a.h(c,d,e):a.call(null,c,d,e),b.h?b.h(c,d,e):b.call(null,c,d,e)],null)}function d(c,d){return new V(null,2,5,W,[a.c?a.c(c,d):a.call(null,c,d),b.c?b.c(c,d):b.call(null,c,d)],null)}function e(c){return new V(null,2,5,W,[a.e?a.e(c):a.call(null,c),b.e?b.e(c):b.call(null,c)],null)}function g(){return new V(null,2,5,W,[a.A?a.A():a.call(null),b.A?b.A():b.call(null)],null)}var h=null,k=function(){function c(a,b,e,g){var h=null;
if(3<arguments.length){for(var h=0,k=Array(arguments.length-3);h<k.length;)k[h]=arguments[h+3],++h;h=new E(k,0)}return d.call(this,a,b,e,h)}function d(c,e,g,h){return new V(null,2,5,W,[ne(a,c,e,g,h),ne(b,c,e,g,h)],null)}c.B=3;c.D=function(a){var b=G(a);a=I(a);var c=G(a);a=I(a);var e=G(a);a=tc(a);return d(b,c,e,a)};c.t=d;return c}(),h=function(a,b,h,q){switch(arguments.length){case 0:return g.call(this);case 1:return e.call(this,a);case 2:return d.call(this,a,b);case 3:return c.call(this,a,b,h);default:var t=
null;if(3<arguments.length){for(var t=0,z=Array(arguments.length-3);t<z.length;)z[t]=arguments[t+3],++t;t=new E(z,0)}return k.t(a,b,h,t)}throw Error("Invalid arity: "+arguments.length);};h.B=3;h.D=k.D;h.A=g;h.e=e;h.c=d;h.h=c;h.t=k.t;return h}()}function wg(a){a:for(var b=a;;)if(D(b))b=I(b);else break a;return a}function xg(a,b){if("string"===typeof b){var c=a.exec(b);return null==c?null:1===R(c)?G(c):nf(c)}throw new TypeError("re-find must match against a string.");}
function yg(a,b,c,d,e,g,h){var k=qa;qa=null==qa?null:qa-1;try{if(null!=qa&&0>qa)return Ib(a,"#");Ib(a,c);if(0===xa.e(g))D(h)&&Ib(a,function(){var a=zg.e(g);return u(a)?a:"..."}());else{if(D(h)){var l=G(h);b.h?b.h(l,a,g):b.call(null,l,a,g)}for(var p=I(h),n=xa.e(g)-1;;)if(!p||null!=n&&0===n){D(p)&&0===n&&(Ib(a,d),Ib(a,function(){var a=zg.e(g);return u(a)?a:"..."}()));break}else{Ib(a,d);var q=G(p);c=a;h=g;b.h?b.h(q,c,h):b.call(null,q,c,h);var t=I(p);c=n-1;p=t;n=c}}return Ib(a,e)}finally{qa=k}}
function Ag(a,b){for(var c=D(b),d=null,e=0,g=0;;)if(g<e){var h=d.P(null,g);Ib(a,h);g+=1}else if(c=D(c))d=c,hd(d)?(c=Wb(d),e=Xb(d),d=c,h=R(c),c=e,e=h):(h=G(d),Ib(a,h),c=I(d),d=null,e=0),g=0;else return null}var Bg={'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"};function Cg(a){return[x('"'),x(a.replace(RegExp('[\\\\"\b\f\n\r\t]',"g"),function(a){return Bg[a]})),x('"')].join("")}
function Dg(a,b,c){if(null==a)return Ib(b,"nil");if(void 0===a)return Ib(b,"#\x3cundefined\x3e");if(u(function(){var b=Tc(c,va);return u(b)?(b=a?a.n&131072||a.Tc?!0:a.n?!1:v(rb,a):v(rb,a))?$c(a):b:b}())){Ib(b,"^");var d=$c(a);Eg.h?Eg.h(d,b,c):Eg.call(null,d,b,c);Ib(b," ")}return null==a?Ib(b,"nil"):a.lb?a.wb(a,b,c):a&&(a.n&2147483648||a.Y)?a.H(null,b,c):Da(a)===Boolean||"number"===typeof a?Ib(b,""+x(a)):null!=a&&a.constructor===Object?(Ib(b,"#js "),d=Z.c(function(b){return new V(null,2,5,W,[Ud.e(b),
a[b]],null)},id(a)),Fg.F?Fg.F(d,Eg,b,c):Fg.call(null,d,Eg,b,c)):za(a)?yg(b,Eg,"#js ["," ","]",c,a):u("string"==typeof a)?u(ua.e(c))?Ib(b,Cg(a)):Ib(b,a):Wc(a)?Ag(b,N(["#\x3c",""+x(a),"\x3e"],0)):a instanceof Date?(d=function(a,b){for(var c=""+x(a);;)if(R(c)<b)c=[x("0"),x(c)].join("");else return c},Ag(b,N(['#inst "',""+x(a.getUTCFullYear()),"-",d(a.getUTCMonth()+1,2),"-",d(a.getUTCDate(),2),"T",d(a.getUTCHours(),2),":",d(a.getUTCMinutes(),2),":",d(a.getUTCSeconds(),2),".",d(a.getUTCMilliseconds(),
3),"-",'00:00"'],0))):u(a instanceof RegExp)?Ag(b,N(['#"',a.source,'"'],0)):(a?a.n&2147483648||a.Y||(a.n?0:v(Jb,a)):v(Jb,a))?Lb(a,b,c):Ag(b,N(["#\x3c",""+x(a),"\x3e"],0))}function Eg(a,b,c){var d=Gg.e(c);return u(d)?(c=T.h(c,Hg,Dg),d.h?d.h(a,b,c):d.call(null,a,b,c)):Dg(a,b,c)}function Fe(){return Ig(0<arguments.length?new E(Array.prototype.slice.call(arguments,0),0):null)}
function Ig(a){var b=sa();if(bd(a))b="";else{var c=x,d=new ia;a:{var e=new cc(d);Eg(G(a),e,b);a=D(I(a));for(var g=null,h=0,k=0;;)if(k<h){var l=g.P(null,k);Ib(e," ");Eg(l,e,b);k+=1}else if(a=D(a))g=a,hd(g)?(a=Wb(g),h=Xb(g),g=a,l=R(a),a=h,h=l):(l=G(g),Ib(e," "),Eg(l,e,b),a=I(g),g=null,h=0),k=0;else break a}b=""+c(d)}return b}
function Fg(a,b,c,d){return yg(c,function(a,c,d){var k=jb(a);b.h?b.h(k,c,d):b.call(null,k,c,d);Ib(c," ");a=kb(a);return b.h?b.h(a,c,d):b.call(null,a,c,d)},"{",", ","}",d,D(a))}E.prototype.Y=!0;E.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};Wd.prototype.Y=!0;Wd.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};dg.prototype.Y=!0;dg.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};Df.prototype.Y=!0;
Df.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};of.prototype.Y=!0;of.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};Rd.prototype.Y=!0;Rd.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};hg.prototype.Y=!0;hg.prototype.H=function(a,b,c){return Fg(this,Eg,b,c)};fg.prototype.Y=!0;fg.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};sf.prototype.Y=!0;sf.prototype.H=function(a,b,c){return yg(b,Eg,"["," ","]",c,this)};ud.prototype.Y=!0;
ud.prototype.H=function(a,b,c){return yg(b,Eg,"#{"," ","}",c,this)};ae.prototype.Y=!0;ae.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};ze.prototype.Y=!0;ze.prototype.H=function(a,b,c){Ib(b,"#\x3cAtom: ");Eg(this.state,b,c);return Ib(b,"\x3e")};ng.prototype.Y=!0;ng.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};V.prototype.Y=!0;V.prototype.H=function(a,b,c){return yg(b,Eg,"["," ","]",c,this)};Pd.prototype.Y=!0;Pd.prototype.H=function(a,b){return Ib(b,"()")};
r.prototype.Y=!0;r.prototype.H=function(a,b,c){return Fg(this,Eg,b,c)};tg.prototype.Y=!0;tg.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};mg.prototype.Y=!0;mg.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};Od.prototype.Y=!0;Od.prototype.H=function(a,b,c){return yg(b,Eg,"("," ",")",c,this)};V.prototype.rb=!0;V.prototype.sb=function(a,b){return xd(this,b)};sf.prototype.rb=!0;sf.prototype.sb=function(a,b){return xd(this,b)};X.prototype.rb=!0;
X.prototype.sb=function(a,b){return Sd(this,b)};C.prototype.rb=!0;C.prototype.sb=function(a,b){return rc(this,b)};function Jg(a,b,c){Nb(a,b,c)}var Kg=null;function Lg(a,b){this.gb=a;this.value=b;this.w=1;this.n=32768}Lg.prototype.ib=function(){u(this.gb)&&(this.value=this.gb.A?this.gb.A():this.gb.call(null),this.gb=null);return this.value};var Mg={},Ng=function Ng(b){if(b?b.Oc:b)return b.Oc(b);var c;c=Ng[m(null==b?null:b)];if(!c&&(c=Ng._,!c))throw w("IEncodeJS.-clj-\x3ejs",b);return c.call(null,b)};
function Og(a){return(a?u(u(null)?null:a.Nc)||(a.Q?0:v(Mg,a)):v(Mg,a))?Ng(a):"string"===typeof a||"number"===typeof a||a instanceof X||a instanceof C?Pg.e?Pg.e(a):Pg.call(null,a):Ig(N([a],0))}
var Pg=function Pg(b){if(null==b)return null;if(b?u(u(null)?null:b.Nc)||(b.Q?0:v(Mg,b)):v(Mg,b))return Ng(b);if(b instanceof X)return Vd(b);if(b instanceof C)return""+x(b);if(fd(b)){var c={};b=D(b);for(var d=null,e=0,g=0;;)if(g<e){var h=d.P(null,g),k=S(h,0),h=S(h,1);c[Og(k)]=Pg(h);g+=1}else if(b=D(b))hd(b)?(e=Wb(b),b=Xb(b),d=e,e=R(e)):(e=G(b),d=S(e,0),e=S(e,1),c[Og(d)]=Pg(e),b=I(b),d=null,e=0),g=0;else break;return c}if(cd(b)){c=[];b=D(Z.c(Pg,b));d=null;for(g=e=0;;)if(g<e)k=d.P(null,g),c.push(k),
g+=1;else if(b=D(b))d=b,hd(d)?(b=Wb(d),g=Xb(d),d=b,e=R(b),b=g):(b=G(d),c.push(b),b=I(d),d=null,e=0),g=0;else break;return c}return b},Qg={},Rg=function Rg(b,c){if(b?b.Mc:b)return b.Mc(b,c);var d;d=Rg[m(null==b?null:b)];if(!d&&(d=Rg._,!d))throw w("IEncodeClojure.-js-\x3eclj",b);return d.call(null,b,c)};
function Sg(a){var b=N([Tg,!0],0),c=ld(b)?ke(Ce,b):b,d=Tc(c,Tg);return function(a,c,d,k){return function p(n){return(n?u(u(null)?null:n.ge)||(n.Q?0:v(Qg,n)):v(Qg,n))?Rg(n,ke(lg,b)):ld(n)?wg(Z.c(p,n)):cd(n)?Se.c(Qc(n),Z.c(p,n)):za(n)?nf(Z.c(p,n)):Da(n)===Object?Se.c(td,function(){return function(a,b,c,d){return function J(e){return new Wd(null,function(a,b,c,d){return function(){for(;;){var a=D(e);if(a){if(hd(a)){var b=Wb(a),c=R(b),g=$d(c);return function(){for(var a=0;;)if(a<c){var e=A.c(b,a),h=g,
k=W,q;q=e;q=d.e?d.e(q):d.call(null,q);e=new V(null,2,5,k,[q,p(n[e])],null);h.add(e);a+=1}else return!0}()?be(g.O(),J(Xb(a))):be(g.O(),null)}var h=G(a);return M(new V(null,2,5,W,[function(){var a=h;return d.e?d.e(a):d.call(null,a)}(),p(n[h])],null),J(tc(a)))}return null}}}(a,b,c,d),null,null)}}(a,c,d,k)(id(n))}()):n}}(b,c,d,u(d)?Ud:x)(a)}
function Ug(){var a=Vg;return function(b){return function(){function c(a){var b=null;if(0<arguments.length){for(var b=0,c=Array(arguments.length-0);b<c.length;)c[b]=arguments[b+0],++b;b=new E(c,0)}return d.call(this,b)}function d(c){var d=Uc(L.e?L.e(b):L.call(null,b),c,kd);d===kd&&(d=ke(a,c),Ge.F(b,T,c,d));return d}c.B=0;c.D=function(a){a=D(a);return d(a)};c.t=d;return c}()}(Be?Be(td):Ae.call(null,td))}
function Wg(a,b){return he(La(function(b,d){var e=a.e?a.e(d):a.call(null,d),g=Oc.c(Uc(b,e,Pc),d);return Tb(b,e,g)},Pb(td),b))}function Xg(a,b,c){var d=Error();this.message=a;this.data=b;this.Tb=c;this.name=d.name;this.description=d.description;this.number=d.number;this.fileName=d.fileName;this.lineNumber=d.lineNumber;this.columnNumber=d.columnNumber;this.stack=d.stack;return this}Xg.prototype.__proto__=Error.prototype;Xg.prototype.Y=!0;
Xg.prototype.H=function(a,b,c){Ib(b,"#ExceptionInfo{:message ");Eg(this.message,b,c);u(this.data)&&(Ib(b,", :data "),Eg(this.data,b,c));u(this.Tb)&&(Ib(b,", :cause "),Eg(this.Tb,b,c));return Ib(b,"}")};Xg.prototype.toString=function(){return dc(this)};function Yg(a,b){return new Xg(a,b,null)};var Zg=new X(null,"y","y",-1757859776),$g=new X(null,"zero","zero",-858964576),ah=new X(null,"old-state","old-state",1039580704),bh=new X(null,"path","path",-188191168),ch=new X(null,"shift","shift",997140064),dh=new X(null,"one","one",935007904),eh=new X(null,"state-map","state-map",-1313872128),fh=new X(null,"new-value","new-value",1087038368),gh=new X(null,"q","q",689001697),hh=new X(null,"schema","schema",-1582001791),ih=new X(null,"num-eight","num-eight",1648171777),jh=new X(null,"ff-semicolon",
"ff-semicolon",1279895297),kh=new X(null,"slash","slash",-1449773022),lh=new X(null,"down","down",1565245570),mh=new X(null,"question-mark","question-mark",1946747234),nh=new X(null,"win-key","win-key",528957026),oh=new X(null,"r","r",-471384190),ph=new X(null,"descriptor","descriptor",76122018),qh=new X(null,"space","space",348133475),rh=new X(null,"num-division","num-division",-1651240829),th=new X(null,"home","home",-74557309),uh=new X(null,"insert","insert",1286475395),vh=new X("om.core","not-found",
"om.core/not-found",1869894275),wh=new X(null,"componentDidUpdate","componentDidUpdate",-1983477981),xh=new X(null,"num-zero","num-zero",-2066202749),yh=new X(null,"v","v",21465059),zh=new X(null,"mac-enter","mac-enter",-1535813532),Ah=new X(null,"fn","fn",-1175266204),Bh=new X(null,"family","family",-1313145692),Ch=new X(null,"f8","f8",-2141475484),Dh=new X(null,"new-state","new-state",-490349212),Eh=new X(null,"instrument","instrument",-960698844),Fh=new X(null,"o","o",-1350007228),va=new X(null,
"meta","meta",1499536964),Gh=new X("schema.core","error","schema.core/error",1991454308),Hh=new X(null,"react-key","react-key",1337881348),Ih=new X(null,"eight","eight",-1202254044),Jh=new X(null,"f1","f1",1714532389),Kh=new X("om.core","id","om.core/id",299074693),Lh=new X(null,"win-ime","win-ime",1187364997),wa=new X(null,"dup","dup",556298533),Mh=new X(null,"win-key-ff-linux","win-key-ff-linux",-37611163),Nh=new X(null,"mac-wk-cmd-left","mac-wk-cmd-left",-84384283),Oh=new X(null,"key","key",-1516042587),
Ph=new X(null,"skip-render-root","skip-render-root",-5219643),Qh=new X(null,"f10","f10",627525541),Rh=new X(null,"last-media-key","last-media-key",486556613),Sh=new X(null,"mac-ff-meta","mac-ff-meta",-999198298),Th=new X(null,"num-six","num-six",-357946906),Uh=new X(null,"num-period","num-period",378989254),Vh=new X(null,"isOmComponent","isOmComponent",-2070015162),Wh=new X(null,"alt","alt",-3214426),Xh=new X(null,"first-media-key","first-media-key",861535271),Yh=new X(null,"scroll-lock","scroll-lock",
281688679),Zh=new X(null,"esc","esc",-1671924121),$h=new X(null,"phantom","phantom",1438556935),ai=new X(null,"_","_",1453416199),De=new X(null,"validator","validator",-1966190681),bi=new X(null,"kspec","kspec",-1151232248),ci=new X(null,"does-not-satisfy-schema","does-not-satisfy-schema",-1543152824),di=new X(null,"name","name",1843675177),ei=new X(null,"n","n",562130025),fi=new X(null,"adapt","adapt",-1817022327),gi=new X(null,"w","w",354169001),hi=new X(null,"m","m",1632677161),ii=new X(null,"output-schema",
"output-schema",272504137),ji=new X(null,"editor-path","editor-path",1083496905),ki=new X(null,"comma","comma",1699024745),li=new X(null,"value","value",305978217),mi=new X(null,"num-nine","num-nine",-348334806),ni=new X(null,"page-up","page-up",1352555050),oi=new X(null,"proto-sym","proto-sym",-886371734),pi=new X(null,"num-seven","num-seven",-1673554070),qi=new X(null,"numlock","numlock",-1383996470),ri=new X(null,"win-key-right","win-key-right",-1650150165),si=new X(null,"input-schemas","input-schemas",
-982154805),ti=new X(null,"extra","extra",1612569067),ui=new X(null,"f5","f5",1587057387),vi=new X(null,"old-value","old-value",862546795),wi=new X(null,"caps-lock","caps-lock",406112235),xi=new X(null,"open-square-bracket","open-square-bracket",-1607562196),yi=new X(null,"dash","dash",23821356),zi=new X(null,"num-multiply","num-multiply",302427276),Ai=new X("om.core","pass","om.core/pass",-1453289268),Bi=new X(null,"tilde","tilde",-306005780),Ci=new X(null,"type","type",1174270348),Di=new X(null,
"init-state","init-state",1450863212),Ei=new X(null,"delete","delete",-1768633620),Fi=new X(null,"three","three",-1651831795),Gi=new X(null,"state","state",-1988618099),Hi=new X(null,"mac-wk-cmd-right","mac-wk-cmd-right",-1985015411),Hg=new X(null,"fallback-impl","fallback-impl",-1501286995),Ii=new X(null,"val-schema","val-schema",-2014773619),Ji=new X(null,"five","five",1430677197),Ki=new X(null,"pending-state","pending-state",1525896973),Li=new X("schema.core","missing","schema.core/missing",1420181325),
ta=new X(null,"flush-on-newline","flush-on-newline",-151457939),Mi=new X(null,"save","save",1850079149),Ni=new X(null,"componentWillUnmount","componentWillUnmount",1573788814),Oi=new X(null,"componentWillReceiveProps","componentWillReceiveProps",559988974),Pi=new X(null,"equals","equals",-463033970),Qi=new X(null,"four","four",1338555054),Ri=new X(null,"e","e",1381269198),Si=new X(null,"ctrl","ctrl",361402094),Ti=new X(null,"s","s",1705939918),Ui=new X(null,"l","l",1395893423),Vi=new X(null,"ignore",
"ignore",-1631542033),Wi=new X(null,"className","className",-1983287057),Xi=new X(null,"up","up",-269712113),Yi=new X(null,"production","production",1781416239),Zi=new X(null,"k","k",-2146297393),$i=new X(null,"num-center","num-center",967095119),aj=new X(null,"enter","enter",1792452624),bj=new X(null,"shouldComponentUpdate","shouldComponentUpdate",1795750960),ua=new X(null,"readably","readably",1129599760),zg=new X(null,"more-marker","more-marker",-14717935),cj=new X(null,"optional?","optional?",
1184638129),dj=new X(null,"z","z",-789527183),ej=new X(null,"key-fn","key-fn",-636154479),fj=new X(null,"g","g",1738089905),gj=new X(null,"num-two","num-two",-1446413903),hj=new X(null,"f11","f11",-1417398799),ij=new X(null,"c","c",-1763192079),jj=new X(null,"render","render",-1408033454),kj=new X(null,"single-quote","single-quote",-1053657646),lj=new X(null,"num-plus","num-plus",-770369838),mj=new X(null,"num-five","num-five",-2036785166),nj=new X(null,"j","j",-1397974765),oj=new X(null,"schemas",
"schemas",575070579),pj=new X(null,"previous-state","previous-state",1888227923),qj=new X(null,"f3","f3",1954829043),rj=new X(null,"status","status",-1997798413),sj=new X(null,"h","h",1109658740),xa=new X(null,"print-length","print-length",1931866356),uj=new X(null,"componentWillUpdate","componentWillUpdate",657390932),vj=new X(null,"f2","f2",396168596),wj=new X(null,"apostrophe","apostrophe",-1476834636),xj=new X(null,"getInitialState","getInitialState",1541760916),yj=new X(null,"nine","nine",-1883832396),
zj=new X(null,"opts","opts",155075701),Aj=new X(null,"num-three","num-three",1043534997),Bj=new X(null,"close-square-bracket","close-square-bracket",1583926421),Cj=new X(null,"two","two",627606869),Dj=new X(null,"context-menu","context-menu",-1002713451),Ej=new X(null,"pred-name","pred-name",-3677451),Fj=new X(null,"semicolon","semicolon",797086549),Gj=new X(null,"f12","f12",853352790),Hj=new X(null,"seven","seven",1278068278),Ij=new X(null,"editor","editor",-989377770),Jj=new X(null,"b","b",1482224470),
Kj=new X("om.core","index","om.core/index",-1724175434),Lj=new X(null,"ff-equals","ff-equals",6193142),Mj=new X(null,"shared","shared",-384145993),Nj=new X(null,"right","right",-452581833),Oj=new X(null,"editor-content","editor-content",-959857833),Pj=new X(null,"raf","raf",-1295410152),Qj=new X(null,"d","d",1972142424),Rj=new X(null,"f","f",-1597136552),Sj=new X(null,"componentDidMount","componentDidMount",955710936),Tj=new X(null,"htmlFor","htmlFor",-1050291720),Uj=new X(null,"pause","pause",-2095325672),
Vj=new X(null,"error","error",-978969032),Wj=new X(null,"backspace","backspace",-696007848),Xj=new X(null,"num-four","num-four",710728568),Yj=new X(null,"f7","f7",356150168),Zj=new X(null,"t","t",-1397832519),ak=new X(null,"x","x",2099068185),bk=new X("om.core","invalid","om.core/invalid",1948827993),ck=new X(null,"os","os",795021913),dk=new X(null,"tag","tag",-1290361223),ek=new X(null,"period","period",-352129191),fk=new X(null,"print-screen","print-screen",6404025),gk=new X(null,"target","target",
253001721),hk=new X(null,"getDisplayName","getDisplayName",1324429466),ik=new X(null,"f9","f9",704633338),jk=new X(null,"page-down","page-down",-392838598),kk=new X(null,"end","end",-268185958),lk=new X(null,"ff-dash","ff-dash",-526209989),mk=new X(null,"tab","tab",-559583621),Gg=new X(null,"alt-impl","alt-impl",670969595),nk=new X(null,"p?","p?",-1172161701),ok=new X(null,"failures","failures",-912916356),pk=new X(null,"f6","f6",2103080604),qk=new X(null,"proto-pred","proto-pred",1885698716),Tg=
new X(null,"keywordize-keys","keywordize-keys",1310784252),rk=new X(null,"f4","f4",990968764),sk=new X(null,"p","p",151049309),tk=new X(null,"six","six",-2128505347),uk=new X(null,"componentWillMount","componentWillMount",-285327619),vk=new X(null,"i","i",-1386841315),wk=new X(null,"num-one","num-one",-417870851),xk=new X("om.core","defer","om.core/defer",-1038866178),yk=new X(null,"num-minus","num-minus",-979319330),zk=new X(null,"a","a",-2123407586),Ak=new X(null,"render-state","render-state",2053902270),
Bk=new X(null,"backslash","backslash",1790786526),Ck=new X(null,"tx-listen","tx-listen",119130367),Dk=new X(null,"left","left",-399115937),Ek=new X("cljs.core","not-found","cljs.core/not-found",-1572889185),Fk=new X(null,"u","u",-1156634785);function Gk(a,b){var c=function(){return React.createClass({render:function(){var b={};ha(b,this.props,{children:this.props.children,onChange:this.onChange,value:this.state.value});return a.e?a.e(b):a.call(null,b)},componentWillReceiveProps:function(a){return this.setState({value:a.value})},onChange:function(a){var b=this.props.onChange;if(null==b)return null;b.e?b.e(a):b.call(null,a);return this.setState({value:a.target.value})},getInitialState:function(){return{value:this.props.value}},getDisplayName:function(){return b}})}();
React.createFactory(c)}Gk(React.DOM.input,"input");Gk(React.DOM.textarea,"textarea");Gk(React.DOM.option,"option");function Hk(a,b){return React.render(a,b)};function Ik(a){var b=/-(\w)/,c=we(Jk,Nc);if("string"===typeof b)return a.replace(new RegExp(String(b).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08"),"g"),c);if(b instanceof RegExp)return a.replace(new RegExp(b.source,"g"),c);throw[x("Invalid match arg: "),x(b)].join("");}function Jk(a){return a.toUpperCase()};function Kk(a){return u(function(){var b=5>R(a);if(b)return b;switch(a.substring(0,5)){case "data-":case "aria-":return!0;default:return!1}}())?a:Ik(a)}function Nk(a){return fd(a)?Pg(Se.c(td,Z.c(function(a){var c=S(a,0),d=S(a,1);a=W;a:switch(c instanceof X?c.V:null){case "for":c=Tj;break a;case "class":c=Wi;break a}c=Ud.e(Kk(Vd(c)));d=fd(d)?Nk.e?Nk.e(d):Nk.call(null,d):d;return new V(null,2,5,a,[c,d],null)},a))):a};function Ok(a,b){var c=Array.prototype.slice.call(arguments),d=c.shift();if("undefined"==typeof d)throw Error("[goog.string.format] Template required");return d.replace(/%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g,function(a,b,d,k,l,p,n,q){if("%"==p)return"%";var t=c.shift();if("undefined"==typeof t)throw Error("[goog.string.format] Not enough arguments");arguments[0]=t;return Ok.Wa[p].apply(null,arguments)})}Ok.Wa={};
Ok.Wa.s=function(a,b,c){return isNaN(c)||""==c||a.length>=c?a:a=-1<b.indexOf("-",0)?a+Array(c-a.length+1).join(" "):Array(c-a.length+1).join(" ")+a};
Ok.Wa.f=function(a,b,c,d,e){d=a.toString();isNaN(e)||""==e||(d=a.toFixed(e));var g;g=0>a?"-":0<=b.indexOf("+")?"+":0<=b.indexOf(" ")?" ":"";0<=a&&(d=g+d);if(isNaN(c)||d.length>=c)return d;d=isNaN(e)?Math.abs(a).toString():Math.abs(a).toFixed(e);a=c-d.length-g.length;return d=0<=b.indexOf("-",0)?g+d+Array(a+1).join(" "):g+Array(a+1).join(0<=b.indexOf("0",0)?"0":" ")+d};Ok.Wa.d=function(a,b,c,d,e,g,h,k){return Ok.Wa.f(parseInt(a,10),b,c,d,0,g,h,k)};Ok.Wa.i=Ok.Wa.d;Ok.Wa.u=Ok.Wa.d;function Pk(){return Qk(arguments[0],1<arguments.length?new E(Array.prototype.slice.call(arguments,1),0):null)}function Qk(a,b){return le(Ok,a,b)}function Rk(a){var b=typeof a;return 20>R(""+x(a))?a:sc([x("a-"),x(b)].join(""))}function Sk(a,b,c,d){this.U=a;this.value=b;this.bd=c;this.cd=d;this.w=0;this.n=2147483648}Sk.prototype.H=function(a,b,c){return Lb(Tk.e?Tk.e(this):Tk.call(null,this),b,c)};function Uk(a,b,c,d){return new Sk(a,b,c,d)}
function Tk(a){return y(y(H,function(){var b=a.bd;return L.e?L.e(b):L.call(null,b)}()),function(){var b=a.cd;return u(b)?b:new C(null,"not","not",1044554643,null)}())}Uk=function(a,b,c,d){return new Sk(a,b,c,d)};function Vk(a,b){this.name=a;this.error=b;this.w=0;this.n=2147483648}Vk.prototype.H=function(a,b,c){return Lb(Wk.e?Wk.e(this):Wk.call(null,this),b,c)};function Xk(a,b){return new Vk(a,b)}function Wk(a){return y(y(y(H,a.name),a.error),new C(null,"named","named",1218138048,null))}
Xk=function(a,b){return new Vk(a,b)};function Yk(a,b,c,d){this.error=a;this.r=b;this.l=c;this.m=d;this.n=2229667594;this.w=8192}f=Yk.prototype;f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "error":return this.error;default:return Uc(this.l,b,c)}};
f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.utils.ErrorContainer{",", ","}",c,fe.c(new V(null,1,5,W,[new V(null,2,5,W,[Vj,this.error],null)],null),this.l))};f.I=function(){return this.r};f.T=function(){return new Yk(this.error,this.r,this.l,this.m)};f.N=function(){return 1+R(this.l)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};
f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};f.ka=function(a,b){return pd(new ud(null,new r(null,1,[Vj,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new Yk(this.error,this.r,re(U.c(this.l,b)),null)};f.$=function(a,b,c){return u(Y.c?Y.c(Vj,b):Y.call(null,Vj,b))?new Yk(c,this.r,this.l,null):new Yk(this.error,this.r,T.h(this.l,b,c),null)};f.M=function(){return D(fe.c(new V(null,1,5,W,[new V(null,2,5,W,[Vj,this.error],null)],null),this.l))};
f.J=function(a,b){return new Yk(this.error,b,this.l,this.m)};f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};function Zk(a){if(!u(a))throw Error([x("Assert failed: "),x(Ig(N([new C(null,"x","x",-555367584,null)],0)))].join(""));return new Yk(a,null,null,null)}function $k(a){return u(a instanceof Yk)?a.error:null}
function al(a){return function(b,c){var d=$k(c);if(u(d))return Zk(Oc.c(function(){var c=$k(b);return u(c)?c:a.e?a.e(b):a.call(null,b)}(),d));d=$k(b);return u(d)?Zk(Oc.c(d,null)):Oc.c(b,c)}}function bl(a,b){a.schema$utils$schema=b}function cl(a){this.q=a}cl.prototype.Zd=function(){return this.q};cl.prototype.zc=function(a,b){return this.q=b};var dl=new cl(!1);
dl.Ca=xe(function el(b){if(b?b.Zd:b)return b.q;var c;c=el[m(null==b?null:b)];if(!c&&(c=el._,!c))throw w("PSimpleCell.get_cell",b);return c.call(null,b)},dl);dl.Ce=xe(function fl(b,c){if(b?b.zc:b)return b.zc(0,c);var d;d=fl[m(null==b?null:b)];if(!d&&(d=fl._,!d))throw w("PSimpleCell.set_cell",b);return d.call(null,b,c)},dl);var gl,hl={},Vg=function Vg(b){if(b?b.ma:b)return b.ma(b);var c;c=Vg[m(null==b?null:b)];if(!c&&(c=Vg._,!c))throw w("Schema.walker",b);return c.call(null,b)},il=function il(b){if(b?b.la:b)return b.la(b);var c;c=il[m(null==b?null:b)];if(!c&&(c=il._,!c))throw w("Schema.explain",b);return c.call(null,b)};function jl(){throw Error([x("Walking is unsupported outside of start-walker; "),x("all composite schemas must eagerly bind subschema-walkers "),x("outside the returned walker.")].join(""));}
function kl(a){var b;a:{var c=Ug(),d=jl;jl=c;try{b=jl.e?jl.e(a):jl.call(null,a);break a}finally{jl=d}b=void 0}return we($k,b)}hl["function"]=!0;
Vg["function"]=function(a){return function(b){return function(c){var d=null==c||Aa(function(){var b=a===c.constructor;return b?b:c instanceof a}())?Zk(Uk(a,c,new Lg(function(){return function(){return y(y(y(H,Rk(c)),a),new C(null,"instance?","instance?",1075939923,null))}}(b),null),null)):null;return u(d)?d:b.e?b.e(c):b.call(null,c)}}(function(){var b=a.schema$utils$schema;return u(b)?jl.e?jl.e(b):jl.call(null,b):Fd}())};il["function"]=function(a){var b=a.schema$utils$schema;return u(b)?il(b):a};
function ll(a,b,c,d){this.wa=a;this.r=b;this.l=c;this.m=d;this.n=2229667594;this.w=8192}f=ll.prototype;f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "_":return this.wa;default:return Uc(this.l,b,c)}};f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.AnythingSchema{",", ","}",c,fe.c(new V(null,1,5,W,[new V(null,2,5,W,[ai,this.wa],null)],null),this.l))};f.I=function(){return this.r};
f.T=function(){return new ll(this.wa,this.r,this.l,this.m)};f.N=function(){return 1+R(this.l)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};f.ka=function(a,b){return pd(new ud(null,new r(null,1,[ai,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new ll(this.wa,this.r,re(U.c(this.l,b)),null)};
f.$=function(a,b,c){return u(Y.c?Y.c(ai,b):Y.call(null,ai,b))?new ll(c,this.r,this.l,null):new ll(this.wa,this.r,T.h(this.l,b,c),null)};f.M=function(){return D(fe.c(new V(null,1,5,W,[new V(null,2,5,W,[ai,this.wa],null)],null),this.l))};f.J=function(a,b){return new ll(this.wa,b,this.l,this.m)};f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};f.qa=!0;f.ma=function(){return Fd};f.la=function(){return new C(null,"Any","Any",1277492269,null)};var ml=new ll(null,null,null,null);
function nl(a,b,c,d){this.Z=a;this.r=b;this.l=c;this.m=d;this.n=2229667594;this.w=8192}f=nl.prototype;f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "v":return this.Z;default:return Uc(this.l,b,c)}};f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.EqSchema{",", ","}",c,fe.c(new V(null,1,5,W,[new V(null,2,5,W,[yh,this.Z],null)],null),this.l))};f.I=function(){return this.r};
f.T=function(){return new nl(this.Z,this.r,this.l,this.m)};f.N=function(){return 1+R(this.l)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};f.ka=function(a,b){return pd(new ud(null,new r(null,1,[yh,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new nl(this.Z,this.r,re(U.c(this.l,b)),null)};
f.$=function(a,b,c){return u(Y.c?Y.c(yh,b):Y.call(null,yh,b))?new nl(c,this.r,this.l,null):new nl(this.Z,this.r,T.h(this.l,b,c),null)};f.M=function(){return D(fe.c(new V(null,1,5,W,[new V(null,2,5,W,[yh,this.Z],null)],null),this.l))};f.J=function(a,b){return new nl(this.Z,b,this.l,this.m)};f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};f.qa=!0;
f.ma=function(){var a=this;return function(b){return function(c){return K.c(a.Z,c)?c:Zk(Uk(b,c,new Lg(function(){return function(){return y(y(y(H,Rk(c)),a.Z),new C(null,"\x3d","\x3d",-1501502141,null))}}(b),null),null))}}(this)};f.la=function(){return y(y(H,this.Z),new C(null,"eq","eq",1021992460,null))};function ol(a,b,c,d,e){this.pa=a;this.Fa=b;this.r=c;this.l=d;this.m=e;this.n=2229667594;this.w=8192}f=ol.prototype;f.G=function(a,b){return cb.h(this,b,null)};
f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "pred-name":return this.Fa;case "p?":return this.pa;default:return Uc(this.l,b,c)}};f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.Predicate{",", ","}",c,fe.c(new V(null,2,5,W,[new V(null,2,5,W,[nk,this.pa],null),new V(null,2,5,W,[Ej,this.Fa],null)],null),this.l))};f.I=function(){return this.r};f.T=function(){return new ol(this.pa,this.Fa,this.r,this.l,this.m)};
f.N=function(){return 2+R(this.l)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};f.ka=function(a,b){return pd(new ud(null,new r(null,2,[Ej,null,nk,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new ol(this.pa,this.Fa,this.r,re(U.c(this.l,b)),null)};
f.$=function(a,b,c){return u(Y.c?Y.c(nk,b):Y.call(null,nk,b))?new ol(c,this.Fa,this.r,this.l,null):u(Y.c?Y.c(Ej,b):Y.call(null,Ej,b))?new ol(this.pa,c,this.r,this.l,null):new ol(this.pa,this.Fa,this.r,T.h(this.l,b,c),null)};f.M=function(){return D(fe.c(new V(null,2,5,W,[new V(null,2,5,W,[nk,this.pa],null),new V(null,2,5,W,[Ej,this.Fa],null)],null),this.l))};f.J=function(a,b){return new ol(this.pa,this.Fa,b,this.l,this.m)};f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};
f.qa=!0;f.ma=function(){var a=this;return function(b){return function(c){var d;try{d=u(a.pa.e?a.pa.e(c):a.pa.call(null,c))?null:new C(null,"not","not",1044554643,null)}catch(e){if(e instanceof Object)d=new C(null,"throws?","throws?",789734533,null);else throw e;}return u(d)?Zk(Uk(b,c,new Lg(function(){return function(){return y(y(H,Rk(c)),a.Fa)}}(d,d,b),null),d)):c}}(this)};
f.la=function(){return K.c(this.pa,od)?new C(null,"Int","Int",-2116888740,null):K.c(this.pa,Td)?new C(null,"Keyword","Keyword",-850065993,null):K.c(this.pa,qc)?new C(null,"Symbol","Symbol",716452869,null):K.c(this.pa,Ba)?new C(null,"Str","Str",907970895,null):y(y(H,this.Fa),new C(null,"pred","pred",-727012372,null))};function pl(a,b){if(!nd(a))throw Error(Qk("Not a function: %s",N([a],0)));return new ol(a,b,null,null,null)}
function ql(a,b,c,d){this.p=a;this.r=b;this.l=c;this.m=d;this.n=2229667594;this.w=8192}f=ql.prototype;f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "p":return this.p;default:return Uc(this.l,b,c)}};f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.Protocol{",", ","}",c,fe.c(new V(null,1,5,W,[new V(null,2,5,W,[sk,this.p],null)],null),this.l))};f.I=function(){return this.r};
f.T=function(){return new ql(this.p,this.r,this.l,this.m)};f.N=function(){return 1+R(this.l)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};f.ka=function(a,b){return pd(new ud(null,new r(null,1,[sk,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new ql(this.p,this.r,re(U.c(this.l,b)),null)};
f.$=function(a,b,c){return u(Y.c?Y.c(sk,b):Y.call(null,sk,b))?new ql(c,this.r,this.l,null):new ql(this.p,this.r,T.h(this.l,b,c),null)};f.M=function(){return D(fe.c(new V(null,1,5,W,[new V(null,2,5,W,[sk,this.p],null)],null),this.l))};f.J=function(a,b){return new ql(this.p,b,this.l,this.m)};f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};f.qa=!0;
f.ma=function(){return function(a){return function(b){return u(qk.e($c(a)).call(null,b))?b:Zk(Uk(a,b,new Lg(function(a){return function(){return y(y(y(H,Rk(b)),oi.e($c(a))),new C(null,"satisfies?","satisfies?",-433227199,null))}}(a),null),null))}}(this)};f.la=function(){return y(y(H,oi.e($c(this))),new C(null,"protocol","protocol",-2001965651,null))};RegExp.prototype.qa=!0;
RegExp.prototype.ma=function(){return function(a){return function(b){return"string"!==typeof b?Zk(Uk(a,b,new Lg(function(){return function(){return y(y(H,Rk(b)),new C(null,"string?","string?",-1129175764,null))}}(a),null),null)):Aa(xg(a,b))?Zk(Uk(a,b,new Lg(function(a){return function(){return y(y(y(H,Rk(b)),il(a)),new C(null,"re-find","re-find",1143444147,null))}}(a),null),null)):b}}(this)};RegExp.prototype.la=function(){return sc([x('#"'),x((""+x(this)).slice(1,-1)),x('"')].join(""))};pl(Ba,Ba);
var rl=Boolean;pl(od,new C(null,"integer?","integer?",1303791671,null));var sl=pl(Td,new C(null,"keyword?","keyword?",1917797069,null));pl(qc,new C(null,"symbol?","symbol?",1820680511,null));
"undefined"===typeof gl&&(gl=function(a){this.qd=a;this.w=0;this.n=393216},f=gl.prototype,f.qa=!0,f.ma=function(){return function(a){return function(b){return b instanceof RegExp?b:Zk(Uk(a,b,new Lg(function(){return function(){return y(y(y(H,Rk(b)),new C("js","RegExp","js/RegExp",1778210562,null)),new C(null,"instance?","instance?",1075939923,null))}}(a),null),null))}}(this)},f.la=function(){return new C(null,"Regex","Regex",205914413,null)},f.I=function(){return this.qd},f.J=function(a,b){return new gl(b)},
gl.lb=!0,gl.kb="schema.core/t48721",gl.wb=function(a,b){return Ib(b,"schema.core/t48721")});function tl(a,b,c,d){this.U=a;this.r=b;this.l=c;this.m=d;this.n=2229667594;this.w=8192}f=tl.prototype;f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "schema":return this.U;default:return Uc(this.l,b,c)}};
f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.Maybe{",", ","}",c,fe.c(new V(null,1,5,W,[new V(null,2,5,W,[hh,this.U],null)],null),this.l))};f.I=function(){return this.r};f.T=function(){return new tl(this.U,this.r,this.l,this.m)};f.N=function(){return 1+R(this.l)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};
f.ka=function(a,b){return pd(new ud(null,new r(null,1,[hh,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new tl(this.U,this.r,re(U.c(this.l,b)),null)};f.$=function(a,b,c){return u(Y.c?Y.c(hh,b):Y.call(null,hh,b))?new tl(c,this.r,this.l,null):new tl(this.U,this.r,T.h(this.l,b,c),null)};f.M=function(){return D(fe.c(new V(null,1,5,W,[new V(null,2,5,W,[hh,this.U],null)],null),this.l))};f.J=function(a,b){return new tl(this.U,b,this.l,this.m)};
f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};f.qa=!0;f.ma=function(){return function(a){return function(b){return null==b?null:a.e?a.e(b):a.call(null,b)}}(jl.e?jl.e(this.U):jl.call(null,this.U),this)};f.la=function(){return y(y(H,il(this.U)),new C(null,"maybe","maybe",1326133967,null))};function ul(a,b,c,d){this.ba=a;this.r=b;this.l=c;this.m=d;this.n=2229667594;this.w=8192}f=ul.prototype;f.G=function(a,b){return cb.h(this,b,null)};
f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "schemas":return this.ba;default:return Uc(this.l,b,c)}};f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.Either{",", ","}",c,fe.c(new V(null,1,5,W,[new V(null,2,5,W,[oj,this.ba],null)],null),this.l))};f.I=function(){return this.r};f.T=function(){return new ul(this.ba,this.r,this.l,this.m)};f.N=function(){return 1+R(this.l)};
f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};f.ka=function(a,b){return pd(new ud(null,new r(null,1,[oj,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new ul(this.ba,this.r,re(U.c(this.l,b)),null)};f.$=function(a,b,c){return u(Y.c?Y.c(oj,b):Y.call(null,oj,b))?new ul(c,this.r,this.l,null):new ul(this.ba,this.r,T.h(this.l,b,c),null)};
f.M=function(){return D(fe.c(new V(null,1,5,W,[new V(null,2,5,W,[oj,this.ba],null)],null),this.l))};f.J=function(a,b){return new ul(this.ba,b,this.l,this.m)};f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};f.qa=!0;
f.ma=function(){return function(a,b){return function(c){for(var d=D(a);;){if(Aa(d))return Zk(Uk(b,c,new Lg(function(){return function(){return y(y(y(H,new C(null,"schemas","schemas",-2079365190,null)),y(y(y(H,Rk(c)),new C(null,"%","%",-950237169,null)),new C(null,"check","check",-1428126865,null))),new C(null,"some","some",-310548046,null))}}(d,a,b),null),null));var e=G(d).call(null,c);if(Aa(e instanceof Yk))return e;d=I(d)}}}(Te.c(jl,this.ba),this)};
f.la=function(){return M(new C(null,"either","either",-2144373018,null),Z.c(il,this.ba))};function vl(a){return new ul(a,null,null,null)}function wl(a,b,c,d){this.ba=a;this.r=b;this.l=c;this.m=d;this.n=2229667594;this.w=8192}f=wl.prototype;f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "schemas":return this.ba;default:return Uc(this.l,b,c)}};
f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.Both{",", ","}",c,fe.c(new V(null,1,5,W,[new V(null,2,5,W,[oj,this.ba],null)],null),this.l))};f.I=function(){return this.r};f.T=function(){return new wl(this.ba,this.r,this.l,this.m)};f.N=function(){return 1+R(this.l)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};
f.ka=function(a,b){return pd(new ud(null,new r(null,1,[oj,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new wl(this.ba,this.r,re(U.c(this.l,b)),null)};f.$=function(a,b,c){return u(Y.c?Y.c(oj,b):Y.call(null,oj,b))?new wl(c,this.r,this.l,null):new wl(this.ba,this.r,T.h(this.l,b,c),null)};f.M=function(){return D(fe.c(new V(null,1,5,W,[new V(null,2,5,W,[oj,this.ba],null)],null),this.l))};f.J=function(a,b){return new wl(this.ba,b,this.l,this.m)};
f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};f.qa=!0;f.ma=function(){return function(a,b){return function(c){return La(function(){return function(a,b){return u(a instanceof Yk)?a:b.e?b.e(a):b.call(null,a)}}(a,b),c,a)}}(Te.c(jl,this.ba),this)};f.la=function(){return M(new C(null,"both","both",1246882687,null),Z.c(il,this.ba))};function xl(a){return a instanceof X||!1}function yl(a,b,c,d){this.$a=a;this.r=b;this.l=c;this.m=d;this.n=2229667594;this.w=8192}f=yl.prototype;
f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "k":return this.$a;default:return Uc(this.l,b,c)}};f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.OptionalKey{",", ","}",c,fe.c(new V(null,1,5,W,[new V(null,2,5,W,[Zi,this.$a],null)],null),this.l))};f.I=function(){return this.r};f.T=function(){return new yl(this.$a,this.r,this.l,this.m)};f.N=function(){return 1+R(this.l)};
f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};f.ka=function(a,b){return pd(new ud(null,new r(null,1,[Zi,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new yl(this.$a,this.r,re(U.c(this.l,b)),null)};f.$=function(a,b,c){return u(Y.c?Y.c(Zi,b):Y.call(null,Zi,b))?new yl(c,this.r,this.l,null):new yl(this.$a,this.r,T.h(this.l,b,c),null)};
f.M=function(){return D(fe.c(new V(null,1,5,W,[new V(null,2,5,W,[Zi,this.$a],null)],null),this.l))};f.J=function(a,b){return new yl(this.$a,b,this.l,this.m)};f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};function zl(a){return new yl(a,null,null,null)}function Al(a){return a instanceof yl}function Bl(a){if(a instanceof X)return a;if(u(Al(a)))return a.$a;throw Error(Qk("Bad explicit key: %s",N([a],0)));}function Cl(a){var b=xl(a);return u(b)?b:Al(a)}
function Dl(a){return u(Cl(a))?a instanceof X?a:y(y(H,Bl(a)),u(xl(a))?new C(null,"required-key","required-key",1624616412,null):u(Al(a))?new C(null,"optional-key","optional-key",988406145,null):null):il(a)}function El(a,b,c,d,e){this.ra=a;this.Ba=b;this.r=c;this.l=d;this.m=e;this.n=2229667594;this.w=8192}f=El.prototype;f.G=function(a,b){return cb.h(this,b,null)};
f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "val-schema":return this.Ba;case "kspec":return this.ra;default:return Uc(this.l,b,c)}};f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.MapEntry{",", ","}",c,fe.c(new V(null,2,5,W,[new V(null,2,5,W,[bi,this.ra],null),new V(null,2,5,W,[Ii,this.Ba],null)],null),this.l))};f.I=function(){return this.r};f.T=function(){return new El(this.ra,this.Ba,this.r,this.l,this.m)};
f.N=function(){return 2+R(this.l)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};f.ka=function(a,b){return pd(new ud(null,new r(null,2,[bi,null,Ii,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new El(this.ra,this.Ba,this.r,re(U.c(this.l,b)),null)};
f.$=function(a,b,c){return u(Y.c?Y.c(bi,b):Y.call(null,bi,b))?new El(c,this.Ba,this.r,this.l,null):u(Y.c?Y.c(Ii,b):Y.call(null,Ii,b))?new El(this.ra,c,this.r,this.l,null):new El(this.ra,this.Ba,this.r,T.h(this.l,b,c),null)};f.M=function(){return D(fe.c(new V(null,2,5,W,[new V(null,2,5,W,[bi,this.ra],null),new V(null,2,5,W,[Ii,this.Ba],null)],null),this.l))};f.J=function(a,b){return new El(this.ra,this.Ba,b,this.l,this.m)};f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};
f.qa=!0;
f.ma=function(){var a=jl.e?jl.e(this.Ba):jl.call(null,this.Ba);if(u(Cl(this.ra))){var b=Al(this.ra),c=Bl(this.ra);return function(a,b,c,h){return function(k){if(Li===k)return u(a)?null:Zk(new V(null,2,5,W,[b,new C(null,"missing-required-key","missing-required-key",709961446,null)],null));if(K.c(2,R(k))){var l=S(k,0),p=S(k,1);if(!K.c(l,b))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"\x3d","\x3d",-1501502141,null),new C(null,"xk","xk",741114825,null),new C(null,"k","k",-505765866,null))],
0)))].join(""));var p=c.e?c.e(p):c.call(null,p),n=$k(p);return u(n)?Zk(new V(null,2,5,W,[l,n],null)):new V(null,2,5,W,[l,p],null)}return Zk(Uk(h,k,new Lg(function(){return function(){return y(y(y(H,y(y(H,Rk(k)),new C(null,"count","count",-514511684,null))),2),K)}}(a,b,c,h),null),null))}}(b,c,a,this)}return function(a,b,c){return function(h){if(K.c(2,R(h))){var k=function(){var b=jb(h);return a.e?a.e(b):a.call(null,b)}(),l=$k(k),p=function(){var a=kb(h);return b.e?b.e(a):b.call(null,a)}(),n=$k(p);
return u(u(l)?l:n)?Zk(new V(null,2,5,W,[u(l)?l:jb(h),u(n)?n:new C(null,"invalid-key","invalid-key",-1461682245,null)],null)):new V(null,2,5,W,[k,p],null)}return Zk(Uk(c,h,new Lg(function(){return function(){return y(y(y(H,y(y(H,Rk(h)),new C(null,"count","count",-514511684,null))),2),K)}}(a,b,c),null),null))}}(jl.e?jl.e(this.ra):jl.call(null,this.ra),a,this)};f.la=function(){return y(y(y(H,il(this.Ba)),Dl(this.ra)),new C(null,"map-entry","map-entry",329617471,null))};
function Fl(a,b){return new El(a,b,null,null,null)}function Gl(a){a=Oe.c(Cl,Ff(a));if(!(2>R(a)))throw Error(Qk("More than one non-optional/required key schemata: %s",N([nf(a)],0)));return G(a)}function Hl(a,b){var c;c=a?a.n&67108864||a.je?!0:a.n?!1:v(Hb,a):v(Hb,a);return u(u(c)?Aa(b instanceof Yk):c)?Se.c(a,b):b}
function Il(a){var b=Gl(a),c=u(b)?jl.e?jl.e(ke(Fl,qd(a,b))):jl.call(null,ke(Fl,qd(a,b))):null,d=U.c(a,b),e=Se.c(td,function(){return function(a,b,c){return function n(d){return new Wd(null,function(){return function(){for(;;){var a=D(d);if(a){if(hd(a)){var b=Wb(a),c=R(b),e=$d(c);a:for(var g=0;;)if(g<c){var h=A.c(b,g),k=S(h,0),h=S(h,1),k=new V(null,2,5,W,[Bl(k),jl.e?jl.e(Fl(k,h)):jl.call(null,Fl(k,h))],null);e.add(k);g+=1}else{b=!0;break a}return b?be(e.O(),n(Xb(a))):be(e.O(),null)}b=G(a);e=S(b,0);
b=S(b,1);return M(new V(null,2,5,W,[Bl(e),jl.e?jl.e(Fl(e,b)):jl.call(null,Fl(e,b))],null),n(tc(a)))}return null}}}(a,b,c),null,null)}}(b,c,d)(d)}()),g=al(ve());if(!K.c(R(d),R(e)))throw Error(Qk("Schema has multiple variants of the same explicit key: %s",N([Te.c(Dl,ke(fe,Ne.c(function(){return function(a){return 1<R(a)}}(b,c,d,e,g),Gf(Wg(Bl,Ff(d))))))],0)));return function(b,c,d,e,g){return function(q){return fd(q)?Hl(q,function(){for(var a=vd,z=D(e),B=td;;){if(Aa(z))return La(u(c)?function(a,b,c,
d,e,g,h,k){return function(a,b){var c=e.e?e.e(b):e.call(null,b);return k.c?k.c(a,c):k.call(null,a,c)}}(a,z,B,b,c,d,e,g):function(a,b,c,d,e,g,h,k){return function(a,b){var c=S(b,0);S(b,1);c=Zk(new V(null,2,5,W,[c,new C(null,"disallowed-key","disallowed-key",-1877785633,null)],null));return k.c?k.c(a,c):k.call(null,a,c)}}(a,z,B,b,c,d,e,g),B,Oe.c(function(a){return function(b){var c=S(b,0);S(b,1);return a.e?a.e(c):a.call(null,c)}}(a,z,B,b,c,d,e,g),q));var F=G(z),J=S(F,0),Q=S(F,1),a=Oc.c(a,J),z=I(z),
B=F=function(){var a=B,b;b=qd(q,J);b=u(b)?b:Li;b=Q.e?Q.e(b):Q.call(null,b);return g.c?g.c(a,b):g.call(null,a,b)}()}}()):Zk(Uk(a,q,new Lg(function(){return function(){return y(y(H,Rk(q)),new C(null,"map?","map?",-1780568534,null))}}(b,c,d,e,g),null),null))}}(b,c,d,e,g)}
function Jl(a){return Se.c(td,function(){return function c(a){return new Wd(null,function(){for(;;){var e=D(a);if(e){if(hd(e)){var g=Wb(e),h=R(g),k=$d(h);a:for(var l=0;;)if(l<h){var p=A.c(g,l),n=S(p,0),p=S(p,1),n=nf(I(il(Fl(n,p))));k.add(n);l+=1}else{g=!0;break a}return g?be(k.O(),c(Xb(e))):be(k.O(),null)}g=G(e);k=S(g,0);g=S(g,1);return M(nf(I(il(Fl(k,g)))),c(tc(e)))}return null}},null,null)}(a)}())}hg.prototype.qa=!0;hg.prototype.ma=function(){return Il(this)};hg.prototype.la=function(){return Jl(this)};
r.prototype.qa=!0;r.prototype.ma=function(){return Il(this)};r.prototype.la=function(){return Jl(this)};ud.prototype.qa=!0;
ud.prototype.ma=function(){if(!K.c(R(this),1))throw Error(Pk("Set schema must have exactly one element"));return function(a,b){return function(c){var d=dd(c)?null:Zk(Uk(b,c,new Lg(function(){return function(){return y(y(H,Rk(c)),new C(null,"set?","set?",1636014792,null))}}(a,b),null),null));if(u(d))return d;var e=vg(Oe,ye).call(null,$k,Z.c(a,c)),d=S(e,0),e=S(e,1);return D(e)?Zk(qg(e)):qg(d)}}(jl.e?jl.e(G(this)):jl.call(null,G(this)),this)};
ud.prototype.la=function(){return qg(new V(null,1,5,W,[il(G(this))],null))};function Kl(a,b,c,d,e,g){this.U=a;this.ta=b;this.name=c;this.r=d;this.l=e;this.m=g;this.n=2229667594;this.w=8192}f=Kl.prototype;f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "name":return this.name;case "optional?":return this.ta;case "schema":return this.U;default:return Uc(this.l,b,c)}};
f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.One{",", ","}",c,fe.c(new V(null,3,5,W,[new V(null,2,5,W,[hh,this.U],null),new V(null,2,5,W,[cj,this.ta],null),new V(null,2,5,W,[di,this.name],null)],null),this.l))};f.I=function(){return this.r};f.T=function(){return new Kl(this.U,this.ta,this.name,this.r,this.l,this.m)};f.N=function(){return 3+R(this.l)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};
f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};f.ka=function(a,b){return pd(new ud(null,new r(null,3,[hh,null,di,null,cj,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new Kl(this.U,this.ta,this.name,this.r,re(U.c(this.l,b)),null)};
f.$=function(a,b,c){return u(Y.c?Y.c(hh,b):Y.call(null,hh,b))?new Kl(c,this.ta,this.name,this.r,this.l,null):u(Y.c?Y.c(cj,b):Y.call(null,cj,b))?new Kl(this.U,c,this.name,this.r,this.l,null):u(Y.c?Y.c(di,b):Y.call(null,di,b))?new Kl(this.U,this.ta,c,this.r,this.l,null):new Kl(this.U,this.ta,this.name,this.r,T.h(this.l,b,c),null)};f.M=function(){return D(fe.c(new V(null,3,5,W,[new V(null,2,5,W,[hh,this.U],null),new V(null,2,5,W,[cj,this.ta],null),new V(null,2,5,W,[di,this.name],null)],null),this.l))};
f.J=function(a,b){return new Kl(this.U,this.ta,this.name,b,this.l,this.m)};f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};function Ll(a,b){return new Kl(a,!1,b,null,null,null)}
function Ml(a){var b=ug(function(a){return a instanceof Kl&&Aa(cj.e(a))},a),c=S(b,0),d=S(b,1),e=ug(function(){return function(a){var b=a instanceof Kl;return b?cj.e(a):b}}(b,c,d),d),g=S(e,0),h=S(e,1);if(!(1>=R(h)&&se(function(){return function(a){return!(a instanceof Kl)}}(b,c,d,e,g,h),h)))throw Error(Qk("Sequence schema %s does not match [one* optional* rest-schema?]",N([a],0)));return new V(null,2,5,W,[fe.c(c,g),G(h)],null)}V.prototype.qa=!0;
V.prototype.ma=function(){var a=this,b=Ml(a),c=S(b,0),d=S(b,1),e=nf(function(){return function(a,b,c,d){return function q(e){return new Wd(null,function(){return function(){for(;;){var a=D(e);if(a){if(hd(a)){var b=Wb(a),c=R(b),d=$d(c);a:for(var g=0;;)if(g<c){var h=A.c(b,g),h=new V(null,2,5,W,[h,jl.e?jl.e(h.U):jl.call(null,h.U)],null);d.add(h);g+=1}else{b=!0;break a}return b?be(d.O(),q(Xb(a))):be(d.O(),null)}d=G(a);return M(new V(null,2,5,W,[d,jl.e?jl.e(d.U):jl.call(null,d.U)],null),q(tc(a)))}return null}}}(a,
b,c,d),null,null)}}(b,c,d,a)(c)}()),g=u(d)?jl.e?jl.e(d):jl.call(null,d):null;return function(a,b,c,d,e,g,t){return function(z){var B=null==z||ed(z)?null:Zk(Uk(t,z,new Lg(function(){return function(){return y(y(H,Rk(z)),new C(null,"sequential?","sequential?",1102351463,null))}}(a,b,c,d,e,g,t),null),null));if(u(B))return B;for(var F=d,J=z,Q=Pc;;){var P=G(F);if(u(P)){var ma=P,Ta=S(ma,0),tb=S(ma,1);if(bd(J)){if(u(Ta.ta))return Q;var O=Q,B=Zk(Uk(nf(Z.c(G,F)),null,new Lg(function(a,b,c,d,e,g,h,k,l,p,n,
q,t,z,B,F){return function(){return ge(new C(null,"present?","present?",-1810613791,null),function(){return function(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F){return function Mk(J){return new Wd(null,function(){return function(){for(;;){var a=D(J);if(a){if(hd(a)){var b=Wb(a),c=R(b),d=$d(c);a:for(var e=0;;)if(e<c){var g=A.c(b,e),g=S(g,0);if(Aa(g.ta))d.add(g.name),e+=1;else{b=null;break a}}else{b=!0;break a}return b?be(d.O(),Mk(Xb(a))):be(d.O(),null)}d=G(a);d=S(d,0);return Aa(d.ta)?M(d.name,Mk(tc(a))):null}return null}}}(a,
b,c,d,e,g,h,k,l,p,n,q,t,z,B,F),null,null)}}(a,b,c,d,e,g,h,k,l,p,n,q,t,z,B,F)(a)}())}}(F,J,Q,O,ma,Ta,tb,P,B,a,b,c,d,e,g,t),null),null));return g.c?g.c(O,B):g.call(null,O,B)}F=I(F);P=tc(J);O=function(){var a=Q,b=Ta.name,c=G(J),c=tb.e?tb.e(c):tb.call(null,c),d=$k(c),b=u(d)?Zk(Xk(b,d)):c;return g.c?g.c(a,b):g.call(null,a,b)}();J=P;Q=O}else return u(c)?La(g,Q,Z.c(e,J)):D(J)?(O=Q,B=Zk(Uk(null,J,new Lg(function(a,b){return function(){return y(y(H,R(b)),new C(null,"has-extra-elts?","has-extra-elts?",-1376562869,
null))}}(F,J,Q,O,P,B,a,b,c,d,e,g,t),null),null)),g.c?g.c(O,B):g.call(null,O,B)):Q}}}(b,c,d,e,g,al(function(){return function(a){a=R(a);return nf(He(a,Ke(null)))}}(b,c,d,e,g,a)),a)};
V.prototype.la=function(){var a=this,b=Ml(a),c=S(b,0),d=S(b,1);return nf(fe.c(function(){return function(a,b,c,d){return function p(n){return new Wd(null,function(){return function(){for(;;){var a=D(n);if(a){if(hd(a)){var b=Wb(a),c=R(b),d=$d(c);a:for(var e=0;;)if(e<c){var g=A.c(b,e),g=y(y(y(H,di.e(g)),il(hh.e(g))),u(g.ta)?new C(null,"optional","optional",-600484260,null):new C(null,"one","one",-1719427865,null));d.add(g);e+=1}else{b=!0;break a}return b?be(d.O(),p(Xb(a))):be(d.O(),null)}d=G(a);return M(y(y(y(H,
di.e(d)),il(hh.e(d))),u(d.ta)?new C(null,"optional","optional",-600484260,null):new C(null,"one","one",-1719427865,null)),p(tc(a)))}return null}}}(a,b,c,d),null,null)}}(b,c,d,a)(c)}(),u(d)?new V(null,1,5,W,[il(d)],null):null))};function Nl(a){a=ug(function(a){return a instanceof Kl},a);var b=S(a,0),c=S(a,1);return fe.c(Z.c(function(){return function(a){return il(a.U)}}(a,b,c),b),D(c)?new V(null,2,5,W,[new C(null,"\x26","\x26",-2144855648,null),Te.c(il,c)],null):null)}
function Ol(a,b,c,d,e){this.Ea=a;this.za=b;this.r=c;this.l=d;this.m=e;this.n=2229667594;this.w=8192}f=Ol.prototype;f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){switch(b instanceof X?b.V:null){case "input-schemas":return this.za;case "output-schema":return this.Ea;default:return Uc(this.l,b,c)}};
f.H=function(a,b,c){return yg(b,function(){return function(a){return yg(b,Eg,""," ","",c,a)}}(this),"#schema.core.FnSchema{",", ","}",c,fe.c(new V(null,2,5,W,[new V(null,2,5,W,[ii,this.Ea],null),new V(null,2,5,W,[si,this.za],null)],null),this.l))};f.I=function(){return this.r};f.T=function(){return new Ol(this.Ea,this.za,this.r,this.l,this.m)};f.N=function(){return 2+R(this.l)};f.K=function(){var a=this.m;return null!=a?a:this.m=a=Ld(this)};
f.v=function(a,b){var c;c=u(b)?(c=this.constructor===b.constructor)?yf(this,b):c:b;return u(c)?!0:!1};f.ka=function(a,b){return pd(new ud(null,new r(null,2,[ii,null,si,null],null),null),b)?U.c(Zc(Se.c(td,this),this.r),b):new Ol(this.Ea,this.za,this.r,re(U.c(this.l,b)),null)};f.$=function(a,b,c){return u(Y.c?Y.c(ii,b):Y.call(null,ii,b))?new Ol(c,this.za,this.r,this.l,null):u(Y.c?Y.c(si,b):Y.call(null,si,b))?new Ol(this.Ea,c,this.r,this.l,null):new Ol(this.Ea,this.za,this.r,T.h(this.l,b,c),null)};
f.M=function(){return D(fe.c(new V(null,2,5,W,[new V(null,2,5,W,[ii,this.Ea],null),new V(null,2,5,W,[si,this.za],null)],null),this.l))};f.J=function(a,b){return new Ol(this.Ea,this.za,b,this.l,this.m)};f.L=function(a,b){return gd(b)?fb(this,A.c(b,0),A.c(b,1)):La(y,this,b)};f.qa=!0;f.ma=function(){return function(a){return function(b){return nd(b)?b:Zk(Uk(a,b,new Lg(function(){return function(){return y(y(H,Rk(b)),new C(null,"ifn?","ifn?",-2106461064,null))}}(a),null),null))}}(this)};
f.la=function(){var a;if(1<R(this.za)){a=new C(null,"\x3d\x3e*","\x3d\x3e*",1909690043,null);var b=il(this.Ea),c=Z.c(Nl,this.za)}else a=new C(null,"\x3d\x3e","\x3d\x3e",-813269641,null),b=il(this.Ea),c=Nl(G(this.za));return a=M(a,M(b,c))};function Pl(a){if(D(a)){var b;a:for(b=a;;){var c=I(b);if(null!=c)b=c;else{b=G(b);break a}}a=b instanceof Kl?R(a):Number.MAX_VALUE}else a=0;return a}
function Ql(a,b){if(!D(b))throw Error(Pk("Function must have at least one input schema"));if(!se(gd,b))throw Error(Pk("Each arity must be a vector."));if(!u(ke(rd,Z.c(Pl,b))))throw Error(Pk("Arities must be distinct"));return new Ol(a,Bd.c(Pl,b),null,null,null)};var Rl=Zc(new ql(hl,null,null,null),new r(null,2,[oi,new C("s","Schema","s/Schema",-1305723789,null),qk,function(a){return a?u(u(null)?null:a.qa)?!0:a.Q?!1:v(hl,a):v(hl,a)}],null)),Sl=new Jf([vl(N([new nl(sl,null,null,null),yl,sl],0)),Rl]),Tl=new V(null,2,5,W,[Ll(Sl,new C(null,"input","input",-2097503808,null)),Ll(Rl,new C(null,"output","output",534662484,null))],null),Ul=new Jf([vl(N([yl,sl],0)),Rl]),Vl=new Jf([sl,Rl]),Wl=new V(null,2,5,W,[Ll(Ul,new C(null,"input","input",-2097503808,null)),Ll(Vl,
new C(null,"output","output",534662484,null))],null);function Xl(a){return a instanceof r||a instanceof hg}var Yl;Yl=new tl(new V(null,2,5,W,[Ll(sl,"k"),Ll(rl,"optional?")],null),null,null,null);
var Zl=new V(null,1,5,W,[Ll(ml,new C(null,"k","k",-505765866,null))],null),$l=kl(Zl),am=kl(Yl),bm=function(a,b,c,d,e){return function(g){var h=a.Ca();if(u(h)){var k=new V(null,1,5,W,[g],null),l=d.e?d.e(k):d.call(null,k);if(u(l))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"unwrap-schema-form-key","unwrap-schema-form-key",-300088791,null),Ig(N([l],0))],0)),new r(null,4,[Vj,l,li,k,hh,c,Ci,Gh],null));}a:for(;;){g=u(Cl(g))?new V(null,2,5,W,[Bl(g),xl(g)],null):ed(g)&&!gd(g)&&K.c(R(g),
2)&&K.c(G(g),new C("schema.core","optional-key","schema.core/optional-key",-170069547,null))?new V(null,2,5,W,[Nc(g),!1],null):null;break a}if(u(h)&&(h=e.e?e.e(g):e.call(null,g),u(h)))throw Yg(Qk("Output of %s does not match schema: %s",N([new C(null,"unwrap-schema-form-key","unwrap-schema-form-key",-300088791,null),Ig(N([h],0))],0)),new r(null,4,[Vj,h,li,g,hh,b,Ci,Gh],null));return g}}(dl,Yl,Zl,$l,am);bl(bm,Ql(Yl,new V(null,1,5,W,[Zl],null)));
var cm=new Jf([sl,rl]),dm=new V(null,1,5,W,[Ll(ml,new C(null,"s","s",-948495851,null))],null),em=kl(dm),fm=kl(cm);
bl(function(a,b,c,d,e){return function(g){var h=a.Ca();if(u(h)){var k=new V(null,1,5,W,[g],null),l=d.e?d.e(k):d.call(null,k);if(u(l))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"explicit-schema-key-map","explicit-schema-key-map",1668953963,null),Ig(N([l],0))],0)),new r(null,4,[Vj,l,li,k,hh,c,Ci,Gh],null));}a:for(;;){g=Se.c(td,ye.c(bm,Ff(g)));break a}if(u(h)&&(h=e.e?e.e(g):e.call(null,g),u(h)))throw Yg(Qk("Output of %s does not match schema: %s",N([new C(null,"explicit-schema-key-map",
"explicit-schema-key-map",1668953963,null),Ig(N([h],0))],0)),new r(null,4,[Vj,h,li,g,hh,b,Ci,Gh],null));return g}}(dl,cm,dm,em,fm),Ql(cm,new V(null,1,5,W,[dm],null)));var gm=new V(null,2,5,W,[Ll(new V(null,1,5,W,[sl],null),new C(null,"required","required",-846788763,null)),Ll(new V(null,1,5,W,[sl],null),new C(null,"optional","optional",-600484260,null))],null),hm=new V(null,1,5,W,[Ll(new Jf([sl,rl]),new C(null,"s","s",-948495851,null))],null),im=kl(hm),jm=kl(gm);
bl(function(a,b,c,d,e){return function(g){var h=a.Ca();if(u(h)){var k=new V(null,1,5,W,[g],null),l=d.e?d.e(k):d.call(null,k);if(u(l))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"split-schema-keys","split-schema-keys",933671594,null),Ig(N([l],0))],0)),new r(null,4,[Vj,l,li,k,hh,c,Ci,Gh],null));}a:for(;;){g=Te.c(xe(Te,Md),vg(Ne,Oe).call(null,Nd,g));break a}if(u(h)&&(h=e.e?e.e(g):e.call(null,g),u(h)))throw Yg(Qk("Output of %s does not match schema: %s",N([new C(null,"split-schema-keys",
"split-schema-keys",933671594,null),Ig(N([h],0))],0)),new r(null,4,[Vj,h,li,g,hh,b,Ci,Gh],null));return g}}(dl,gm,hm,im,jm),Ql(gm,new V(null,1,5,W,[hm],null)));function km(a,b,c,d){return Se.c(td,Gf(La(function(d,g){var h=S(g,0),k=S(g,1),l=a.e?a.e(h):a.call(null,h),p=Tc(d,l);if(u(p)){var n=S(p,0),p=S(p,1);return T.h(d,l,new V(null,2,5,W,[b.c?b.c(n,h):b.call(null,n,h),c.c?c.c(p,k):c.call(null,p,k)],null))}return T.h(d,l,new V(null,2,5,W,[h,k],null))},td,ke(fe,d))))}
var lm=new V(null,2,5,W,[Ll(Sl,new C(null,"i1","i1",-572470430,null)),Ll(Sl,new C(null,"i2","i2",850408895,null))],null),mm=kl(lm),nm=kl(Sl),om=function(a,b,c,d,e){return function h(k,l){var p=a.Ca();if(u(p)){var n=new V(null,2,5,W,[k,l],null),q=d.e?d.e(n):d.call(null,n);if(u(q))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"union-input-schemata","union-input-schemata",-1338811970,null),Ig(N([q],0))],0)),new r(null,4,[Vj,q,li,n,hh,c,Ci,Gh],null));}n=function(){for(;;)return km(function(){return function(a){return u(Cl(a))?
Bl(a):ti}}(p,a,b,c,d,e),function(){return function(a,b){if(u(xl(a)))return a;if(u(xl(b)))return b;if(u(Al(a))){if(!K.c(a,b))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"\x3d","\x3d",-1501502141,null),new C(null,"k1","k1",-1701777341,null),new C(null,"k2","k2",-1225133949,null))],0)))].join(""));return a}if(K.c(a,b))return a;throw Error(Pk("Only one extra schema allowed"));}}(p,a,b,c,d,e),function(){return function(a,b){var c=Xl(a);u(u(c)?Xl(b):c)?c=h(a,b):K.c(a,b)?c=a:K.c(a,ml)?c=b:K.c(b,
ml)?c=a:(c=N([a,b],0),c=new wl(c,null,null,null));return c}}(p,a,b,c,d,e),N([k,l],0))}();if(u(p)&&(q=e.e?e.e(n):e.call(null,n),u(q)))throw Yg(Qk("Output of %s does not match schema: %s",N([new C(null,"union-input-schemata","union-input-schemata",-1338811970,null),Ig(N([q],0))],0)),new r(null,4,[Vj,q,li,n,hh,b,Ci,Gh],null));return n}}(dl,Sl,lm,mm,nm);bl(om,Ql(Sl,new V(null,1,5,W,[lm],null)));
var pm=new V(null,1,5,W,[sl],null),qm=new V(null,1,5,W,[Ll(Sl,new C(null,"input-schema","input-schema",1373647181,null))],null),rm=kl(qm),sm=kl(pm);
bl(function(a,b,c,d,e){return function(g){var h=a.Ca();if(u(h)){var k=new V(null,1,5,W,[g],null),l=d.e?d.e(k):d.call(null,k);if(u(l))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"required-toplevel-keys","required-toplevel-keys",1052167617,null),Ig(N([l],0))],0)),new r(null,4,[Vj,l,li,k,hh,c,Ci,Gh],null));}k=function(){for(;;)return ye.c(function(){return function(a){return u(xl(a))?Bl(a):null}}(h,a,b,c,d,e),Ff(g))}();if(u(h)&&(l=e.e?e.e(k):e.call(null,k),u(l)))throw Yg(Qk("Output of %s does not match schema: %s",
N([new C(null,"required-toplevel-keys","required-toplevel-keys",1052167617,null),Ig(N([l],0))],0)),new r(null,4,[Vj,l,li,k,hh,b,Ci,Gh],null));return k}}(dl,pm,qm,rm,sm),Ql(pm,new V(null,1,5,W,[qm],null)));
var tm=function tm(b,c){return Aa(Xl(b))?null:Aa(Xl(c))?Zk(Uk(b,c,new Lg(function(){return y(y(H,il(c)),new C(null,"map?","map?",-1780568534,null))},null),null)):re(Se.c(td,function(){return function e(b){return new Wd(null,function(){for(var h=b;;)if(h=D(h)){if(hd(h)){var k=Wb(h),l=R(k),p=$d(l);return function(){for(var b=0;;)if(b<l){var e=A.c(k,b),g=S(e,0),e=S(e,1);if(u(Cl(g))){var h=xl(g),n=Bl(g),q=pd(c,n);u(u(h)?h:q)&&(e=q?tm(e,Tc(c,n)):new C(null,"missing-required-key","missing-required-key",
709961446,null),u(e)&&p.add(new V(null,2,5,W,[g,e],null)))}b+=1}else return!0}()?be(p.O(),e(Xb(h))):be(p.O(),null)}var n=G(h),q=S(n,0),n=S(n,1);if(u(Cl(q))){var t=xl(q),z=Bl(q),B=pd(c,z);if(u(function(){var b=t;return u(b)?b:B}())&&(n=B?tm(n,Tc(c,z)):new C(null,"missing-required-key","missing-required-key",709961446,null),u(n)))return M(new V(null,2,5,W,[q,n],null),e(tc(h)))}h=tc(h)}else return null},null,null)}(b)}()))};
function um(a,b){var c=tm(a,b);if(u(c))throw Yg(""+x(c),new r(null,2,[Vj,ci,ok,c],null));}var vm=new V(null,2,5,W,[Ll(Tl,new C(null,"arg0","arg0",-1024593414,null)),Ll(new V(null,2,5,W,[Ll(Sl,new C(null,"input","input",-2097503808,null)),Ll(Vl,new C(null,"output","output",534662484,null))],null),new C(null,"arg1","arg1",-1702536411,null))],null),wm=kl(vm),xm=kl(ml);
bl(function(a,b,c,d,e){return function(a,h){var k=new V(null,2,5,W,[a,h],null),l=d.e?d.e(k):d.call(null,k);if(u(l))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"compose-schemata","compose-schemata",918607729,null),Ig(N([l],0))],0)),new r(null,4,[Vj,l,li,k,hh,c,Ci,Gh],null));a:for(S(a,0),S(a,1),S(h,0),S(h,1);;){var l=a,k=S(l,0),l=S(l,1),p=h,n=S(p,0),p=S(p,1),q;b:{q=k;for(var t=Ff(p),z=td,t=D(t);;)if(t)var B=G(t),F=Uc(q,B,Ek),z=qe(F,Ek)?T.h(z,B,F):z,t=I(t);else{q=Zc(z,$c(q));break b}}um(q,
p);k=new V(null,2,5,W,[om(le(U,k,fe.c(Ff(p),Z.c(zl,Ff(p)))),n),l],null);break a}l=e.e?e.e(k):e.call(null,k);if(u(l))throw Yg(Qk("Output of %s does not match schema: %s",N([new C(null,"compose-schemata","compose-schemata",918607729,null),Ig(N([l],0))],0)),new r(null,4,[Vj,l,li,k,hh,b,Ci,Gh],null));return k}}(dl,ml,vm,wm,xm),Ql(ml,new V(null,1,5,W,[vm],null)));function ym(a,b){return pd(a,b)?b:pd(a,zl(b))?zl(b):null}
var zm=new V(null,2,5,W,[Ll(Sl,new C(null,"s","s",-948495851,null)),Ll(new V(null,1,5,W,[sl],null),new C(null,"ks","ks",-754231827,null))],null),Am=kl(zm),Bm=kl(ml),Cm=function(a,b,c,d,e){return function(g,h){var k=a.Ca();if(u(k)){var l=new V(null,2,5,W,[g,h],null),p=d.e?d.e(l):d.call(null,l);if(u(p))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"split-schema","split-schema",1859174771,null),Ig(N([p],0))],0)),new r(null,4,[Vj,p,li,l,hh,c,Ci,Gh],null));}l=function(){for(;;)return function(a,
b,c,d,e,h,k){return function P(l){return new Wd(null,function(a,b,c,d,e,h,k){return function(){for(;;){var p=D(l);if(p){var n=p;if(hd(n)){var q=Wb(n),t=R(q),z=$d(t);return function(){for(var l=0;;)if(l<t){var B=A.c(q,l);ce(z,Se.c(td,function(){return function(a,b,c,d,e,g,h,k,l,p,n,q,t,z){return function Lk(B){return new Wd(null,function(a,b,c,d,e,g,h,k){return function(){for(var a=B;;)if(a=D(a)){if(hd(a)){var c=Wb(a),d=R(c),e=$d(d);return function(){for(var a=0;;)if(a<d){var g=A.c(c,a),h=S(g,0),g=
S(g,1),l;l=Cl(h);l=u(l)?K.c(b,pd(k,Bl(h))):l;u(l)&&e.add(new V(null,2,5,W,[h,g],null));a+=1}else return!0}()?be(e.O(),Lk(Xb(a))):be(e.O(),null)}var g=G(a),h=S(g,0),g=S(g,1);if(u(function(){var a=Cl(h);return u(a)?K.c(b,pd(k,Bl(h))):a}()))return M(new V(null,2,5,W,[h,g],null),Lk(tc(a)));a=tc(a)}else return null}}(a,b,c,d,e,g,h,k,l,p,n,q,t,z),null,null)}}(l,B,q,t,z,n,p,a,b,c,d,e,h,k)(g)}()));l+=1}else return!0}()?be(z.O(),P(Xb(n))):be(z.O(),null)}var B=G(n);return M(Se.c(td,function(){return function(a,
b,c,d,e,g,h,k,l,p){return function $f(n){return new Wd(null,function(a,b,c,d){return function(){for(var b=n;;)if(b=D(b)){if(hd(b)){var c=Wb(b),e=R(c),g=$d(e);return function(){for(var b=0;;)if(b<e){var h=A.c(c,b),k=S(h,0),h=S(h,1),l;l=Cl(k);l=u(l)?K.c(a,pd(d,Bl(k))):l;u(l)&&g.add(new V(null,2,5,W,[k,h],null));b+=1}else return!0}()?be(g.O(),$f(Xb(b))):be(g.O(),null)}var h=G(b),k=S(h,0),h=S(h,1);if(u(function(){var b=Cl(k);return u(b)?K.c(a,pd(d,Bl(k))):b}()))return M(new V(null,2,5,W,[k,h],null),$f(tc(b)));
b=tc(b)}else return null}}(a,b,c,d,e,g,h,k,l,p),null,null)}}(B,n,p,a,b,c,d,e,h,k)(g)}()),P(tc(n)))}return null}}}(a,b,c,d,e,h,k),null,null)}}(qg(h),k,a,b,c,d,e)(new V(null,2,5,W,[!0,!1],null))}();if(u(k)&&(p=e.e?e.e(l):e.call(null,l),u(p)))throw Yg(Qk("Output of %s does not match schema: %s",N([new C(null,"split-schema","split-schema",1859174771,null),Ig(N([p],0))],0)),new r(null,4,[Vj,p,li,l,hh,b,Ci,Gh],null));return l}}(dl,ml,zm,Am,Bm);bl(Cm,Ql(ml,new V(null,1,5,W,[zm],null)));
var Dm=new V(null,2,5,W,[Ll(Wl,new C(null,"arg0","arg0",-1024593414,null)),Ll(new V(null,2,5,W,[Ll(sl,"key"),Ll(Tl,"inner-schemas")],null),new C(null,"arg1","arg1",-1702536411,null))],null),Em=kl(Dm),Fm=kl(Wl);
bl(function(a,b,c,d,e){return function(g,h){var k=a.Ca();if(u(k)){var l=new V(null,2,5,W,[g,h],null),p=d.e?d.e(l):d.call(null,l);if(u(p))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"sequence-schemata","sequence-schemata",-2061205313,null),Ig(N([p],0))],0)),new r(null,4,[Vj,p,li,l,hh,c,Ci,Gh],null));}a:for(S(g,0),S(g,1),S(h,0),l=S(h,1),S(l,0),S(l,1);;){var p=g,l=S(p,0),p=S(p,1),n=h,q=S(n,0),n=S(n,1),t=S(n,0),n=S(n,1);if(!Aa(md(ym(l,q))))throw Error(Qk("Duplicate key output (possibly due to a misordered graph) %s for input %s from input %s",
N([q,il(t),il(l)],0)));if(!Aa(md(ym(t,q))))throw Error(Qk("Node outputs a key %s in its inputs %s",N([q,il(t)],0)));if(!Aa(md(ym(p,q))))throw Error(Qk("Node outputs a duplicate key %s given inputs %s",N([q,il(l)],0)));var z=Cm(t,Ff(p)),t=S(z,0),z=S(z,1);um(t,p);l=new V(null,2,5,W,[om(z,l),T.h(p,q,n)],null);break a}if(u(k)&&(k=e.e?e.e(l):e.call(null,l),u(k)))throw Yg(Qk("Output of %s does not match schema: %s",N([new C(null,"sequence-schemata","sequence-schemata",-2061205313,null),Ig(N([k],0))],0)),
new r(null,4,[Vj,k,li,l,hh,b,Ci,Gh],null));return l}}(dl,Wl,Dm,Em,Fm),Ql(Wl,new V(null,1,5,W,[Dm],null)));var Gm;a:{var Hm=aa.navigator;if(Hm){var Im=Hm.userAgent;if(Im){Gm=Im;break a}}Gm=""};var Jm=-1!=Gm.indexOf("Opera")||-1!=Gm.indexOf("OPR"),Km=-1!=Gm.indexOf("Trident")||-1!=Gm.indexOf("MSIE"),Lm=-1!=Gm.indexOf("Gecko")&&-1==Gm.toLowerCase().indexOf("webkit")&&!(-1!=Gm.indexOf("Trident")||-1!=Gm.indexOf("MSIE")),Mm=-1!=Gm.toLowerCase().indexOf("webkit");function Nm(){var a=aa.document;return a?a.documentMode:void 0}
var Om=function(){var a="",b;if(Jm&&aa.opera)return a=aa.opera.version,"function"==m(a)?a():a;Lm?b=/rv\:([^\);]+)(\)|;)/:Km?b=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:Mm&&(b=/WebKit\/(\S+)/);b&&(a=(a=b.exec(Gm))?a[1]:"");return Km&&(b=Nm(),b>parseFloat(a))?String(b):a}(),Pm={};
function Qm(a){var b;if(!(b=Pm[a])){b=0;for(var c=String(Om).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),d=String(a).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),e=Math.max(c.length,d.length),g=0;0==b&&g<e;g++){var h=c[g]||"",k=d[g]||"",l=RegExp("(\\d*)(\\D*)","g"),p=RegExp("(\\d*)(\\D*)","g");do{var n=l.exec(h)||["","",""],q=p.exec(k)||["","",""];if(0==n[0].length&&0==q[0].length)break;b=ea(0==n[1].length?0:parseInt(n[1],10),0==q[1].length?0:parseInt(q[1],10))||ea(0==n[2].length,0==q[2].length)||
ea(n[2],q[2])}while(0==b)}b=Pm[a]=0<=b}return b}var Rm=aa.document,Sm=Rm&&Km?Nm()||("CSS1Compat"==Rm.compatMode?parseInt(Om,10):5):void 0;!Lm&&!Km||Km&&Km&&9<=Sm||Lm&&Qm("1.9.1");Km&&Qm("9");function Tm(){}Tm.cc=function(){return Tm.dc?Tm.dc:Tm.dc=new Tm};Tm.prototype.ec=0;var Um=null,Vm=null,Wm=null,Xm=null,Ym=null,Zm={},$m=function $m(b){if(b?b.Gb:b)return b.Gb(b);var c;c=$m[m(null==b?null:b)];if(!c&&(c=$m._,!c))throw w("IDisplayName.display-name",b);return c.call(null,b)},an={},bn=function bn(b){if(b?b.zd:b)return b.zd(b);var c;c=bn[m(null==b?null:b)];if(!c&&(c=bn._,!c))throw w("IInitState.init-state",b);return c.call(null,b)},cn={},dn=function dn(b,c,d){if(b?b.Hd:b)return b.Hd(b,c,d);var e;e=dn[m(null==b?null:b)];if(!e&&(e=dn._,!e))throw w("IShouldUpdate.should-update",
b);return e.call(null,b,c,d)},en={},fn=function fn(b){if(b?b.Ld:b)return b.Ld(b);var c;c=fn[m(null==b?null:b)];if(!c&&(c=fn._,!c))throw w("IWillMount.will-mount",b);return c.call(null,b)},gn={},hn=function hn(b){if(b?b.gc:b)return b.gc(b);var c;c=hn[m(null==b?null:b)];if(!c&&(c=hn._,!c))throw w("IDidMount.did-mount",b);return c.call(null,b)},jn={},kn=function kn(b){if(b?b.Od:b)return b.Od(b);var c;c=kn[m(null==b?null:b)];if(!c&&(c=kn._,!c))throw w("IWillUnmount.will-unmount",b);return c.call(null,
b)},ln={},mn=function mn(b,c,d){if(b?b.Qd:b)return b.Qd(b,c,d);var e;e=mn[m(null==b?null:b)];if(!e&&(e=mn._,!e))throw w("IWillUpdate.will-update",b);return e.call(null,b,c,d)},nn={},on=function on(b,c,d){if(b?b.xd:b)return b.xd(b,c,d);var e;e=on[m(null==b?null:b)];if(!e&&(e=on._,!e))throw w("IDidUpdate.did-update",b);return e.call(null,b,c,d)},pn={},qn=function qn(b,c){if(b?b.Md:b)return b.Md(b,c);var d;d=qn[m(null==b?null:b)];if(!d&&(d=qn._,!d))throw w("IWillReceiveProps.will-receive-props",b);return d.call(null,
b,c)},rn={},sn=function sn(b){if(b?b.Ib:b)return b.Ib(b);var c;c=sn[m(null==b?null:b)];if(!c&&(c=sn._,!c))throw w("IRender.render",b);return c.call(null,b)},tn={},un=function un(b,c,d){if(b?b.Ed:b)return b.Ed(b,c,d);var e;e=un[m(null==b?null:b)];if(!e&&(e=un._,!e))throw w("IRenderProps.render-props",b);return e.call(null,b,c,d)},vn={},wn=function wn(b,c){if(b?b.Gd:b)return b.Gd(b,c);var d;d=wn[m(null==b?null:b)];if(!d&&(d=wn._,!d))throw w("IRenderState.render-state",b);return d.call(null,b,c)},xn=
{},yn={},zn=function zn(b,c,d,e,g){if(b?b.Cd:b)return b.Cd(b,c,d,e,g);var h;h=zn[m(null==b?null:b)];if(!h&&(h=zn._,!h))throw w("IOmSwap.-om-swap!",b);return h.call(null,b,c,d,e,g)},An=function An(){switch(arguments.length){case 1:return An.e(arguments[0]);case 2:return An.c(arguments[0],arguments[1]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};
An.e=function(a){if(a?a.jc:a)return a.jc(a);var b;b=An[m(null==a?null:a)];if(!b&&(b=An._,!b))throw w("IGetState.-get-state",a);return b.call(null,a)};An.c=function(a,b){if(a?a.kc:a)return a.kc(a,b);var c;c=An[m(null==a?null:a)];if(!c&&(c=An._,!c))throw w("IGetState.-get-state",a);return c.call(null,a,b)};An.B=2;
var Bn=function Bn(){switch(arguments.length){case 1:return Bn.e(arguments[0]);case 2:return Bn.c(arguments[0],arguments[1]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};Bn.e=function(a){if(a?a.hc:a)return a.hc(a);var b;b=Bn[m(null==a?null:a)];if(!b&&(b=Bn._,!b))throw w("IGetRenderState.-get-render-state",a);return b.call(null,a)};
Bn.c=function(a,b){if(a?a.ic:a)return a.ic(a,b);var c;c=Bn[m(null==a?null:a)];if(!c&&(c=Bn._,!c))throw w("IGetRenderState.-get-render-state",a);return c.call(null,a,b)};Bn.B=2;var Cn=function Cn(){switch(arguments.length){case 3:return Cn.h(arguments[0],arguments[1],arguments[2]);case 4:return Cn.F(arguments[0],arguments[1],arguments[2],arguments[3]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}};
Cn.h=function(a,b,c){if(a?a.uc:a)return a.uc(a,b,c);var d;d=Cn[m(null==a?null:a)];if(!d&&(d=Cn._,!d))throw w("ISetState.-set-state!",a);return d.call(null,a,b,c)};Cn.F=function(a,b,c,d){if(a?a.vc:a)return a.vc(a,b,c,d);var e;e=Cn[m(null==a?null:a)];if(!e&&(e=Cn._,!e))throw w("ISetState.-set-state!",a);return e.call(null,a,b,c,d)};Cn.B=4;
var Dn=function Dn(b){if(b?b.pc:b)return b.pc(b);var c;c=Dn[m(null==b?null:b)];if(!c&&(c=Dn._,!c))throw w("IRenderQueue.-get-queue",b);return c.call(null,b)},En=function En(b,c){if(b?b.qc:b)return b.qc(b,c);var d;d=En[m(null==b?null:b)];if(!d&&(d=En._,!d))throw w("IRenderQueue.-queue-render!",b);return d.call(null,b,c)},Fn=function Fn(b){if(b?b.oc:b)return b.oc(b);var c;c=Fn[m(null==b?null:b)];if(!c&&(c=Fn._,!c))throw w("IRenderQueue.-empty-queue!",b);return c.call(null,b)},Gn=function Gn(b){if(b?
b.yc:b)return b.value;var c;c=Gn[m(null==b?null:b)];if(!c&&(c=Gn._,!c))throw w("IValue.-value",b);return c.call(null,b)};Gn._=function(a){return a};
var Hn={},In=function In(b){if(b?b.Eb:b)return b.Eb(b);var c;c=In[m(null==b?null:b)];if(!c&&(c=In._,!c))throw w("ICursor.-path",b);return c.call(null,b)},Jn=function Jn(b){if(b?b.Fb:b)return b.Fb(b);var c;c=Jn[m(null==b?null:b)];if(!c&&(c=Jn._,!c))throw w("ICursor.-state",b);return c.call(null,b)},Kn={},Ln=function Ln(){switch(arguments.length){case 2:return Ln.c(arguments[0],arguments[1]);case 3:return Ln.h(arguments[0],arguments[1],arguments[2]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));
}};Ln.c=function(a,b){if(a?a.Id:a)return a.Id(a,b);var c;c=Ln[m(null==a?null:a)];if(!c&&(c=Ln._,!c))throw w("IToCursor.-to-cursor",a);return c.call(null,a,b)};Ln.h=function(a,b,c){if(a?a.Jd:a)return a.Jd(a,b,c);var d;d=Ln[m(null==a?null:a)];if(!d&&(d=Ln._,!d))throw w("IToCursor.-to-cursor",a);return d.call(null,a,b,c)};Ln.B=3;var Mn=function Mn(b,c,d,e){if(b?b.ud:b)return b.ud(b,c,d,e);var g;g=Mn[m(null==b?null:b)];if(!g&&(g=Mn._,!g))throw w("ICursorDerive.-derive",b);return g.call(null,b,c,d,e)};
Mn._=function(a,b,c,d){return Nn?Nn(b,c,d):On.call(null,b,c,d)};function Pn(a){return In(a)}
var Qn={},Rn=function Rn(b,c,d){if(b?b.lc:b)return b.lc(b,c,d);var e;e=Rn[m(null==b?null:b)];if(!e&&(e=Rn._,!e))throw w("INotify.-listen!",b);return e.call(null,b,c,d)},Sn=function Sn(b,c){if(b?b.nc:b)return b.nc(b,c);var d;d=Sn[m(null==b?null:b)];if(!d&&(d=Sn._,!d))throw w("INotify.-unlisten!",b);return d.call(null,b,c)},Tn=function Tn(b,c,d){if(b?b.mc:b)return b.mc(b,c,d);var e;e=Tn[m(null==b?null:b)];if(!e&&(e=Tn._,!e))throw w("INotify.-notify!",b);return e.call(null,b,c,d)},Un=function Un(b,c,
d,e){if(b?b.tc:b)return b.tc(b,c,d,e);var g;g=Un[m(null==b?null:b)];if(!g&&(g=Un._,!g))throw w("IRootProperties.-set-property!",b);return g.call(null,b,c,d,e)},Vn=function Vn(b,c){if(b?b.sc:b)return b.sc(b,c);var d;d=Vn[m(null==b?null:b)];if(!d&&(d=Vn._,!d))throw w("IRootProperties.-remove-properties!",b);return d.call(null,b,c)},Wn=function Wn(b,c,d){if(b?b.rc:b)return b.rc(b,c,d);var e;e=Wn[m(null==b?null:b)];if(!e&&(e=Wn._,!e))throw w("IRootProperties.-get-property",b);return e.call(null,b,c,d)},
Xn=function Xn(b,c){if(b?b.fc:b)return b.fc(b,c);var d;d=Xn[m(null==b?null:b)];if(!d&&(d=Xn._,!d))throw w("IAdapt.-adapt",b);return d.call(null,b,c)};Xn._=function(a,b){return b};var Yn=function Yn(b,c){if(b?b.Bd:b)return b.Bd(b,c);var d;d=Yn[m(null==b?null:b)];if(!d&&(d=Yn._,!d))throw w("IOmRef.-remove-dep!",b);return d.call(null,b,c)};
function Zn(a,b,c,d,e){var g=L.e?L.e(a):L.call(null,a),h=Se.c(Pn.e?Pn.e(b):Pn.call(null,b),c);c=(a?u(u(null)?null:a.se)||(a.Q?0:v(yn,a)):v(yn,a))?zn(a,b,c,d,e):bd(h)?Ge.c(a,d):Ge.F(a,Xe,h,d);if(K.c(c,xk))return null;a=new r(null,5,[bh,h,vi,Ue(g,h),fh,Ue(L.e?L.e(a):L.call(null,a),h),ah,g,Dh,L.e?L.e(a):L.call(null,a)],null);return null!=e?(e=T.h(a,dk,e),$n.c?$n.c(b,e):$n.call(null,b,e)):$n.c?$n.c(b,a):$n.call(null,b,a)}function ao(a){return a?u(u(null)?null:a.Qb)?!0:a.Q?!1:v(Hn,a):v(Hn,a)}
function bo(a){return a.isOmComponent}function co(a){var b=a.props.children;return nd(b)?a.props.children=b.e?b.e(a):b.call(null,a):b}function eo(a){if(!u(bo(a)))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"component?","component?",2048315517,null),new C(null,"x","x",-555367584,null))],0)))].join(""));return a.props.__om_cursor}
function fo(a){if(!u(bo(a)))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"component?","component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));return An.e(a)}function go(){var a=Um;return null==a?null:a.props.__om_shared}function ho(a){a=a.state;var b=a.__om_pending_state;return u(b)?(a.__om_prev_state=a.__om_state,a.__om_state=b,a.__om_pending_state=null,a):null}
function io(a,b){var c=u(b)?b:a.props,d=c.__om_state;if(u(d)){var e=a.state,g=e.__om_pending_state;e.__om_pending_state=og.t(N([u(g)?g:e.__om_state,d],0));c.__om_state=null}}function jo(a){a=a.state;var b=a.__om_refs;return 0===R(b)?null:a.__om_refs=Se.c(vd,Ne.c(ya,Z.c(function(){return function(a){var b=Gn(a),e=Jn(a),g=Pn.e?Pn.e(a):Pn.call(null,a),h=Ve(L.e?L.e(e):L.call(null,e),g,vh);qe(b,vh)?qe(b,h)&&(b=Nn?Nn(h,e,g):On.call(null,h,e,g),a=Xn(a,b)):a=null;return a}}(a,b),b)))}
var lo=Vc([wh,Vh,Ni,Oi,bj,jj,uj,xj,Sj,hk,uk],[function(a){var b=co(this);if(b?u(u(null)?null:b.wd)||(b.Q?0:v(nn,b)):v(nn,b)){var c=this.state;a=eo({isOmComponent:!0,props:a});var d=c.__om_prev_state;on(b,a,u(d)?d:c.__om_state)}return this.state.__om_prev_state=null},!0,function(){var a=co(this);(a?u(u(null)?null:a.Nd)||(a.Q?0:v(jn,a)):v(jn,a))&&kn(a);if(a=D(this.state.__om_refs))for(var a=D(a),b=null,c=0,d=0;;)if(d<c){var e=b.P(null,d);ko.c?ko.c(this,e):ko.call(null,this,e);d+=1}else if(a=D(a))hd(a)?
(c=Wb(a),a=Xb(a),b=c,c=R(c)):(b=e=G(a),ko.c?ko.c(this,b):ko.call(null,this,b),a=I(a),b=null,c=0),d=0;else return null;else return null},function(a){var b=co(this);return(b?u(u(null)?null:b.Be)||(b.Q?0:v(pn,b)):v(pn,b))?qn(b,eo({isOmComponent:!0,props:a})):null},function(a){var b=this,c=b.props,d=b.state,e=co(b);io(b,a);if(e?u(u(null)?null:e.ze)||(e.Q?0:v(cn,e)):v(cn,e))return dn(e,eo({isOmComponent:!0,props:a}),An.e(b));var g=c.__om_cursor,h=a.__om_cursor;return qe(Gn(g),Gn(h))?!0:u(function(){var a=
ao(g);return u(a)?(a=ao(h),u(a)?qe(In(g),In(h)):a):a}())?!0:qe(An.e(b),Bn.e(b))?!0:u(function(){var a=0!==R(d.__om_refs);return a?te(function(){return function(a){var b=Gn(a),c;c=Jn(a);c=L.e?L.e(c):L.call(null,c);a=Ve(c,Pn.e?Pn.e(a):Pn.call(null,a),vh);return qe(b,a)}}(a,g,h,c,d,e,b),d.__om_refs):a}())?!0:c.__om_index!==a.__om_index?!0:!1},function(){var a=co(this),b=this.props,c=Um,d=Xm,e=Vm,g=Wm,h=Ym;Um=this;Xm=b.__om_app_state;Vm=b.__om_instrument;Wm=b.__om_descriptor;Ym=b.__om_root_key;try{return(a?
u(u(null)?null:a.Hb)||(a.Q?0:v(rn,a)):v(rn,a))?sn(a):(a?u(u(null)?null:a.Dd)||(a.Q?0:v(tn,a)):v(tn,a))?un(a,b.__om_cursor,fo(this)):(a?u(u(null)?null:a.Fd)||(a.Q?0:v(vn,a)):v(vn,a))?wn(a,fo(this)):a}finally{Ym=h,Wm=g,Vm=e,Xm=d,Um=c}},function(a){var b=co(this);(b?u(u(null)?null:b.Pd)||(b.Q?0:v(ln,b)):v(ln,b))&&mn(b,eo({isOmComponent:!0,props:a}),An.e(this));ho(this);return jo(this)},function(){var a=co(this),b=this.props,c;c=b.__om_init_state;c=u(c)?c:td;var d=Kh.e(c),a={__om_state:og.t(N([(a?u(u(null)?
null:a.yd)||(a.Q?0:v(an,a)):v(an,a))?bn(a):null,U.c(c,Kh)],0)),__om_id:u(d)?d:":"+(Tm.cc().ec++).toString(36)};b.__om_init_state=null;return a},function(){var a=co(this);return(a?u(u(null)?null:a.vd)||(a.Q?0:v(gn,a)):v(gn,a))?hn(a):null},function(){var a=co(this);return(a?u(u(null)?null:a.Rb)||(a.Q?0:v(Zm,a)):v(Zm,a))?$m(a):null},function(){io(this,null);var a=co(this);(a?u(u(null)?null:a.Kd)||(a.Q?0:v(en,a)):v(en,a))&&fn(a);return ho(this)}]),mo=function(a){a.re=!0;a.jc=function(){return function(){var a=
this.state,c=a.__om_pending_state;return u(c)?c:a.__om_state}}(a);a.kc=function(){return function(a,c){return Ue(An.e(this),c)}}(a);a.qe=!0;a.hc=function(){return function(){return this.state.__om_state}}(a);a.ic=function(){return function(a,c){return Ue(Bn.e(this),c)}}(a);a.ye=!0;a.uc=function(){return function(a,c,d){a=this.props.__om_app_state;this.state.__om_pending_state=c;c=null!=a;return u(c?d:c)?En(a,this):null}}(a);a.vc=function(){return function(a,c,d,e){var g=this.props;a=this.state;var h=
An.e(this),g=g.__om_app_state;a.__om_pending_state=We(h,c,d);c=null!=g;return u(c?e:c)?En(g,this):null}}(a);return a}(Pg(lo));function no(a){a=a._rootNodeID;if(!u(a))throw Error([x("Assert failed: "),x(Ig(N([new C(null,"id","id",252129435,null)],0)))].join(""));return a}function oo(a){return a.props.__om_app_state}
function po(a){var b=oo(a);a=new V(null,2,5,W,[eh,no(a)],null);var c=Ue(L.e?L.e(b):L.call(null,b),a);return u(Ki.e(c))?Ge.F(b,Xe,a,function(){return function(a){return U.c(T.h(T.h(a,pj,Ak.e(a)),Ak,og.t(N([Ak.e(a),Ki.e(a)],0))),Ki)}}(b,a,c)):null}
T.t(lo,xj,function(){var a=co(this),b=this.props,c=function(){var a=b.__om_init_state;return u(a)?a:td}(),d=function(){var a=Kh.e(c);return u(a)?a:":"+(Tm.cc().ec++).toString(36)}(),a=og.t(N([U.c(c,Kh),(a?u(u(null)?null:a.yd)||(a.Q?0:v(an,a)):v(an,a))?bn(a):null],0)),e=new V(null,3,5,W,[eh,no(this),Ak],null);b.__om_init_state=null;Ge.F(oo(this),We,e,a);return{__om_id:d}},N([uk,function(){io(this,null);var a=co(this);(a?u(u(null)?null:a.Kd)||(a.Q?0:v(en,a)):v(en,a))&&fn(a);return po(this)},Ni,function(){var a=
co(this);(a?u(u(null)?null:a.Nd)||(a.Q?0:v(jn,a)):v(jn,a))&&kn(a);Ge.t(oo(this),Xe,new V(null,1,5,W,[eh],null),U,N([no(this)],0));if(a=D(this.state.__om_refs))for(var a=D(a),b=null,c=0,d=0;;)if(d<c){var e=b.P(null,d);ko.c?ko.c(this,e):ko.call(null,this,e);d+=1}else if(a=D(a))hd(a)?(c=Wb(a),a=Xb(a),b=c,c=R(c)):(b=e=G(a),ko.c?ko.c(this,b):ko.call(null,this,b),a=I(a),b=null,c=0),d=0;else return null;else return null},uj,function(a){var b=co(this);(b?u(u(null)?null:b.Pd)||(b.Q?0:v(ln,b)):v(ln,b))&&mn(b,
eo({isOmComponent:!0,props:a}),An.e(this));po(this);return jo(this)},wh,function(a){var b=co(this),c=oo(this),d=Ue(L.e?L.e(c):L.call(null,c),new V(null,2,5,W,[eh,no(this)],null)),e=new V(null,2,5,W,[eh,no(this)],null);if(b?u(u(null)?null:b.wd)||(b.Q?0:v(nn,b)):v(nn,b)){a=eo({isOmComponent:!0,props:a});var g;g=pj.e(d);g=u(g)?g:Ak.e(d);on(b,a,g)}return u(pj.e(d))?Ge.t(c,Xe,e,U,N([pj],0)):null}],0));function qo(a,b,c){this.value=a;this.state=b;this.path=c;this.n=2163640079;this.w=8192}f=qo.prototype;
f.G=function(a,b){return cb.h(this,b,null)};f.C=function(a,b,c){a=cb.h(this.value,b,vh);return K.c(a,vh)?c:Mn(this,a,this.state,Oc.c(this.path,b))};f.H=function(a,b,c){return Lb(this.value,b,c)};f.Qb=!0;f.Eb=function(){return this.path};f.Fb=function(){return this.state};f.I=function(){return $c(this.value)};f.T=function(){return new qo(this.value,this.state,this.path)};f.N=function(){return Sa(this.value)};f.K=function(){return oc(this.value)};
f.v=function(a,b){return u(ao(b))?K.c(this.value,Gn(b)):K.c(this.value,b)};f.yc=function(){return this.value};f.W=function(){return new qo(Qc(this.value),this.state,this.path)};f.ka=function(a,b){return new qo(hb(this.value,b),this.state,this.path)};f.wc=!0;f.xc=function(a,b,c,d){return Zn(this.state,this,b,c,d)};f.qb=function(a,b){return eb(this.value,b)};f.$=function(a,b,c){return new qo(fb(this.value,b,c),this.state,this.path)};
f.M=function(){var a=this;return 0<R(a.value)?Z.c(function(b){return function(c){var d=S(c,0);c=S(c,1);return new V(null,2,5,W,[d,Mn(b,c,a.state,Oc.c(a.path,d))],null)}}(this),a.value):null};f.J=function(a,b){return new qo(Zc(this.value,b),this.state,this.path)};f.L=function(a,b){return new qo(y(this.value,b),this.state,this.path)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.G(null,c)};a.h=function(a,c,d){return this.C(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};f.e=function(a){return this.G(null,a)};f.c=function(a,b){return this.C(null,a,b)};
f.ib=function(){var a=Ve,b;b=this.state;b=L.e?L.e(b):L.call(null,b);return a(b,this.path,bk)};function ro(a,b,c){this.value=a;this.state=b;this.path=c;this.n=2180424479;this.w=8192}f=ro.prototype;f.G=function(a,b){return A.h(this,b,null)};f.C=function(a,b,c){return A.h(this,b,c)};f.P=function(a,b){return Mn(this,A.c(this.value,b),this.state,Oc.c(this.path,b))};f.na=function(a,b,c){return b<Sa(this.value)?Mn(this,A.h(this.value,b,c),this.state,Oc.c(this.path,b)):c};
f.H=function(a,b,c){return Lb(this.value,b,c)};f.Qb=!0;f.Eb=function(){return this.path};f.Fb=function(){return this.state};f.I=function(){return $c(this.value)};f.T=function(){return new ro(this.value,this.state,this.path)};f.N=function(){return Sa(this.value)};f.K=function(){return oc(this.value)};f.v=function(a,b){return u(ao(b))?K.c(this.value,Gn(b)):K.c(this.value,b)};f.yc=function(){return this.value};f.W=function(){return new ro(Qc(this.value),this.state,this.path)};f.wc=!0;
f.xc=function(a,b,c,d){return Zn(this.state,this,b,c,d)};f.qb=function(a,b){return eb(this.value,b)};f.$=function(a,b,c){return Mn(this,pb(this.value,b,c),this.state,this.path)};f.M=function(){var a=this;return 0<R(a.value)?Z.h(function(b){return function(c,d){return Mn(b,c,a.state,Oc.c(a.path,d))}}(this),a.value,new tg(null,0,Number.MAX_VALUE,1,null)):null};f.J=function(a,b){return new ro(Zc(this.value,b),this.state,this.path)};f.L=function(a,b){return new ro(y(this.value,b),this.state,this.path)};
f.call=function(){var a=null,a=function(a,c,d){switch(arguments.length){case 2:return this.G(null,c);case 3:return this.C(null,c,d)}throw Error("Invalid arity: "+arguments.length);};a.c=function(a,c){return this.G(null,c)};a.h=function(a,c,d){return this.C(null,c,d)};return a}();f.apply=function(a,b){return this.call.apply(this,[this].concat(Ha(b)))};f.e=function(a){return this.G(null,a)};f.c=function(a,b){return this.C(null,a,b)};
f.ib=function(){var a=Ve,b;b=this.state;b=L.e?L.e(b):L.call(null,b);return a(b,this.path,bk)};function so(a,b,c){var d=Qa(a);d.Pc=!0;d.v=function(){return function(b,c){return u(ao(c))?K.c(a,Gn(c)):K.c(a,c)}}(d);d.wc=!0;d.xc=function(){return function(a,c,d,k){return Zn(b,this,c,d,k)}}(d);d.Qb=!0;d.Eb=function(){return function(){return c}}(d);d.Fb=function(){return function(){return b}}(d);d.fe=!0;d.ib=function(){return function(){return Ve(L.e?L.e(b):L.call(null,b),c,bk)}}(d);return d}
function On(){switch(arguments.length){case 1:return Nn(arguments[0],null,Pc);case 2:return Nn(arguments[0],arguments[1],Pc);case 3:return Nn(arguments[0],arguments[1],arguments[2]);default:throw Error([x("Invalid arity: "),x(arguments.length)].join(""));}}function Nn(a,b,c){return u(ao(a))?a:(a?u(u(null)?null:a.Ae)||(a.Q?0:v(Kn,a)):v(Kn,a))?Ln.h(a,b,c):Jc(a)?new ro(a,b,c):fd(a)?new qo(a,b,c):(a?a.w&8192||a.Jc||(a.w?0:v(Pa,a)):v(Pa,a))?so(a,b,c):a}
function $n(a,b){var c=Jn(a),d;d=L.e?L.e(c):L.call(null,c);d=Nn(d,c,Pc);return Tn(c,b,d)}var to=Be?Be(td):Ae.call(null,td);function ko(a,b){var c=a.state,d=c.__om_refs;pd(d,b)&&(c.__om_refs=ad.c(d,b));Yn(b,a);return b}var uo=!1,vo=Be?Be(vd):Ae.call(null,vd);
function wo(a){uo=!1;for(var b=D(L.e?L.e(vo):L.call(null,vo)),c=null,d=0,e=0;;)if(e<d){var g=c.P(null,e);g.A?g.A():g.call(null);e+=1}else if(b=D(b))c=b,hd(c)?(b=Wb(c),e=Xb(c),c=b,d=R(b),b=e):(b=G(c),b.A?b.A():b.call(null),b=I(c),c=null,d=0),e=0;else break;null==a?a=null:(b=a.Rd,a=a.Rd=(u(b)?b:0)+1);return a}var xo=Be?Be(td):Ae.call(null,td);
function yo(a,b){var c;c=a?u(u(null)?null:a.Hb)?!0:a.Q?!1:v(rn,a):v(rn,a);c||(c=(c=a?u(u(null)?null:a.Dd)?!0:a.Q?!1:v(tn,a):v(tn,a))?c:a?u(u(null)?null:a.Fd)?!0:a.Q?!1:v(vn,a):v(vn,a));if(!c)throw Error([x("Assert failed: "),x([x("Invalid Om component fn, "),x(b.name),x(" does not return valid instance")].join("")),x("\n"),x(Ig(N([Qd(new C(null,"or","or",1876275696,null),Qd(new C(null,"satisfies?","satisfies?",-433227199,null),new C(null,"IRender","IRender",590822196,null),new C(null,"x","x",-555367584,
null)),Qd(new C(null,"satisfies?","satisfies?",-433227199,null),new C(null,"IRenderProps","IRenderProps",2115139472,null),new C(null,"x","x",-555367584,null)),Qd(new C(null,"satisfies?","satisfies?",-433227199,null),new C(null,"IRenderState","IRenderState",-897673898,null),new C(null,"x","x",-555367584,null)))],0)))].join(""));}function zo(a,b){if(null==a.om$descriptor){var c;u(b)?c=b:(c=Wm,c=u(c)?c:mo);c=React.createClass(c);c=React.createFactory(c);a.om$descriptor=c}return a.om$descriptor}
function Ao(a,b,c){if(!nd(a))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"ifn?","ifn?",-2106461064,null),new C(null,"f","f",43394975,null))],0)))].join(""));if(null!=c&&!fd(c))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"or","or",1876275696,null),Qd(new C(null,"nil?","nil?",1612038930,null),new C(null,"m","m",-1021758608,null)),Qd(new C(null,"map?","map?",-1780568534,null),new C(null,"m","m",-1021758608,null)))],0)))].join(""));if(!u(se(new ud(null,new r(null,11,[ph,null,Ah,
null,Eh,null,Hh,null,Oh,null,Di,null,Gi,null,ej,null,zj,null,Kj,null,Mj,null],null),null),Ff(c))))throw Error([x("Assert failed: "),x(me(x,"build options contains invalid keys, only :key, :key-fn :react-key, ",":fn, :init-state, :state, and :opts allowed, given ",Me(", ",Ff(c)))),x("\n"),x(Ig(N([Qd(new C(null,"valid-opts?","valid-opts?",1000038576,null),new C(null,"m","m",-1021758608,null))],0)))].join(""));if(null==c){var d=go(),e=zo(a,null),d={children:function(){return function(c){c=a.c?a.c(b,
c):a.call(null,b,c);yo(c,a);return c}}(d,e),__om_instrument:Vm,__om_descriptor:Wm,__om_app_state:Xm,__om_root_key:Ym,__om_shared:d,__om_cursor:b};return e.e?e.e(d):e.call(null,d)}var g=ld(c)?ke(Ce,c):c,h=Tc(g,zj),k=Tc(g,Di),l=Tc(g,Gi),p=Tc(g,ej),n=Tc(g,Oh),q=Tc(c,Ah),t=null!=q?function(){var a=Kj.e(c);return u(a)?q.c?q.c(b,a):q.call(null,b,a):q.e?q.e(b):q.call(null,b)}():b,z=null!=n?Tc(t,n):null!=p?p.e?p.e(t):p.call(null,t):Tc(c,Hh),d=function(){var a=Mj.e(c);return u(a)?a:go()}(),e=zo(a,ph.e(c)),
B;B=u(z)?z:void 0;d={__om_state:l,__om_instrument:Vm,children:null==h?function(b,c,d,e,g,h,k,l,p){return function(b){b=a.c?a.c(p,b):a.call(null,p,b);yo(b,a);return b}}(c,g,h,k,l,p,n,q,t,z,d,e):function(b,c,d,e,g,h,k,l,p){return function(b){b=a.h?a.h(p,b,d):a.call(null,p,b,d);yo(b,a);return b}}(c,g,h,k,l,p,n,q,t,z,d,e),__om_init_state:k,key:B,__om_app_state:Xm,__om_cursor:t,__om_index:Kj.e(c),__om_shared:d,__om_descriptor:Wm,__om_root_key:Ym};return e.e?e.e(d):e.call(null,d)}
function Bo(a,b,c){if(!nd(a))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"ifn?","ifn?",-2106461064,null),new C(null,"f","f",43394975,null))],0)))].join(""));if(null!=c&&!fd(c))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"or","or",1876275696,null),Qd(new C(null,"nil?","nil?",1612038930,null),new C(null,"m","m",-1021758608,null)),Qd(new C(null,"map?","map?",-1780568534,null),new C(null,"m","m",-1021758608,null)))],0)))].join(""));if(null!=Vm){var d=Vm.h?Vm.h(a,b,c):Vm.call(null,
a,b,c);return K.c(d,Ai)?Ao(a,b,c):d}return Ao(a,b,c)}
function Co(a,b,c){if(!(a?u(u(null)?null:a.Ad)||(a.Q?0:v(Qn,a)):v(Qn,a))){var d=Be?Be(td):Ae.call(null,td),e=Be?Be(td):Ae.call(null,td),g=Be?Be(vd):Ae.call(null,vd);a.te=!0;a.pc=function(a,b,c,d){return function(){return L.e?L.e(d):L.call(null,d)}}(a,d,e,g);a.qc=function(a,b,c,d){return function(a,b){if(pd(L.e?L.e(d):L.call(null,d),b))return null;Ge.h(d,Oc,b);return Ge.c(this,Fd)}}(a,d,e,g);a.oc=function(a,b,c,d){return function(){return Ge.c(d,Qc)}}(a,d,e,g);a.Ad=!0;a.lc=function(a,b,c){return function(a,
b,d){null!=d&&Ge.F(c,T,b,d);return this}}(a,d,e,g);a.nc=function(a,b,c){return function(a,b){Ge.h(c,U,b);return this}}(a,d,e,g);a.mc=function(a,b,c){return function(a,b,d){a=D(L.e?L.e(c):L.call(null,c));for(var e=null,g=0,h=0;;)if(h<g){var k=e.P(null,h);S(k,0);var k=S(k,1),J=b,Q=d;k.c?k.c(J,Q):k.call(null,J,Q);h+=1}else if(a=D(a))hd(a)?(g=Wb(a),a=Xb(a),e=g,g=R(g)):(e=G(a),S(e,0),e=S(e,1),g=b,h=d,e.c?e.c(g,h):e.call(null,g,h),a=I(a),e=null,g=0),h=0;else break;return this}}(a,d,e,g);a.we=!0;a.tc=function(a,
b){return function(a,c,d,e){return Ge.F(b,We,new V(null,2,5,W,[c,d],null),e)}}(a,d,e,g);a.xe=function(a,b){return function(a,c,d){return Ge.F(b,U,c,d)}}(a,d,e,g);a.sc=function(a,b){return function(a,c){return Ge.h(b,U,c)}}(a,d,e,g);a.rc=function(a,b){return function(a,c,d){return Ue(L.e?L.e(b):L.call(null,b),new V(null,2,5,W,[c,d],null))}}(a,d,e,g)}return Rn(a,b,c)}
var Do=function Do(b,c){if(u(ao(b))){var d=Qa(b);d.ue=!0;d.ve=function(){return function(){return c}}(d);d.pe=!0;d.fc=function(){return function(d,g){return Do(Xn(b,g),c)}}(d);d.Jc=!0;d.T=function(){return function(){return Do(Qa(b),c)}}(d);return d}return b};var Eo=function Eo(){return Eo.t(arguments[0],1<arguments.length?new E(Array.prototype.slice.call(arguments,1),0):null)};Eo.t=function(a,b){return console[a].apply(console,Ja(b))};Eo.B=1;Eo.D=function(a){var b=G(a);a=I(a);return Eo.t(b,a)};var Fo,Go=new V(null,3,5,W,[Ll(ml,new C(null,"data","data",1407862150,null)),Ll(ml,new C(null,"_","_",-1201019570,null)),Ll(ml,new C(null,"_","_",-1201019570,null))],null),Ho=kl(Go),Io=kl(ml),Jo=function(a,b,c,d,e){return function h(k,l,p){var n=a.Ca();if(u(n)){var q=new V(null,3,5,W,[k,l,p],null),t=d.e?d.e(q):d.call(null,q);if(u(t))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"status-component","status-component",2119421421,null),Ig(N([t],0))],0)),new r(null,4,[Vj,t,li,q,hh,
c,Ci,Gh],null));}q=function(){for(;;)return"undefined"===typeof Fo&&(Fo=function(a,b,c,d,e,h,k,l,n,p,q,t,Ca){this.Vd=a;this.data=b;this.Bc=c;this.$d=d;this.jd=e;this.wa=h;this.Ab=k;this.Ac=l;this.Cc=n;this.Sd=p;this.zb=q;this.fd=t;this.nd=Ca;this.w=0;this.n=393216},Fo.prototype.Rb=!0,Fo.prototype.Gb=function(){return function(){return"status-component"}}(n,a,b,c,d,e),Fo.prototype.Hb=!0,Fo.prototype.Ib=function(){return function(){return le(React.DOM.div,{className:"status"},Re(new V(null,1,5,W,[this.data],
null)))}}(n,a,b,c,d,e),Fo.prototype.I=function(){return function(){return this.nd}}(n,a,b,c,d,e),Fo.prototype.J=function(){return function(a,b){return new Fo(this.Vd,this.data,this.Bc,this.$d,this.jd,this.wa,this.Ab,this.Ac,this.Cc,this.Sd,this.zb,this.fd,b)}}(n,a,b,c,d,e),Fo.lb=!0,Fo.kb="editor.views.status/t44474",Fo.wb=function(){return function(a,b){return Ib(b,"editor.views.status/t44474")}}(n,a,b,c,d,e)),new Fo(b,k,l,h,c,p,n,k,p,e,a,d,null)}();if(u(n)&&(t=e.e?e.e(q):e.call(null,q),u(t)))throw Yg(Qk("Output of %s does not match schema: %s",
N([new C(null,"status-component","status-component",2119421421,null),Ig(N([t],0))],0)),new r(null,4,[Vj,t,li,q,hh,b,Ci,Gh],null));return q}}(dl,ml,Go,Ho,Io);bl(Jo,Ql(ml,new V(null,1,5,W,[Go],null)));Km&&Qm("9");!Mm||Qm("528");Lm&&Qm("1.9b")||Km&&Qm("8")||Jm&&Qm("9.5")||Mm&&Qm("528");Lm&&!Qm("8")||Km&&Qm("9");var Ko;function Lo(a){a=JSON.parse(a);return Sg(a)};var Mo=Sg(platform),No=u(null!=window["faceboard-env"])?Sg(faceboard_env):td,Po=K.c(Ue(Mo,new V(null,2,5,W,[ck,Bh],null)),"OS X");Yi.e(No);if("undefined"===typeof Qo){var Qo,Ro=new r(null,2,[rj,"",Ij,new r(null,2,[ji,Pc,Oj,""],null)],null);Qo=Be?Be(Ro):Ae.call(null,Ro)};function So(a){a=Lo(a);a=We(L.e?L.e(Qo):L.call(null,Qo),new V(null,1,5,W,[Ij],null),a);return Ee.c?Ee.c(Qo,a):Ee.call(null,Qo,a)}var To=["editor","exports","drive"],Uo=aa;To[0]in Uo||!Uo.execScript||Uo.execScript("var "+To[0]);for(var Vo;To.length&&(Vo=To.shift());){var Wo;if(Wo=!To.length)Wo=void 0!==So;Wo?Uo[Vo]=So:Uo=Uo[Vo]?Uo[Vo]:Uo[Vo]={}}window.drive=So;var Xo=function(a){return La(function(a,c){var d=S(c,0),e=S(c,1);return T.h(a,e,d)},td,a)}(Vc([Zg,$g,ch,dh,gh,ih,jh,kh,lh,mh,nh,oh,qh,rh,th,uh,xh,yh,zh,Ch,Fh,va,Ih,Jh,Lh,Mh,Nh,Qh,Rh,Sh,Th,Uh,Wh,Xh,Yh,Zh,$h,ei,gi,hi,ki,mi,ni,pi,qi,ri,ui,wi,xi,yi,zi,Bi,Ei,Fi,Hi,Ji,Pi,Qi,Ri,Si,Ti,Ui,Xi,Zi,$i,aj,dj,fj,gj,hj,ij,kj,lj,mj,nj,qj,sj,vj,wj,yj,Aj,Bj,Cj,Dj,Fj,Gj,Hj,Jj,Lj,Nj,Qj,Rj,Uj,Wj,Xj,Yj,Zj,ak,ek,fk,ik,jk,kk,lk,mk,pk,rk,sk,tk,vk,wk,yk,zk,Bk,Dk,Fk],[89,48,16,49,81,104,59,191,40,63,224,82,32,111,36,45,96,86,
3,119,79,91,56,112,229,0,91,121,183,224,102,110,18,166,145,27,255,78,87,77,188,105,33,103,144,92,116,20,219,189,106,192,46,51,93,53,187,52,69,17,83,76,38,75,12,13,90,71,98,122,67,222,107,101,74,114,72,113,192,57,99,221,50,93,186,123,55,66,61,39,68,70,19,8,100,118,84,88,190,44,120,34,35,173,9,117,115,80,54,73,97,109,65,220,37,85]));
function Yo(a){return Oc.c(qg(Ff(Ne.c(Nd,new r(null,4,[Si,md(a.ctrlKey),ch,md(a.shiftKey),Wh,md(a.altKey),va,md(a.metaKey)],null)))),function(){var b=a.keyCode;return Xo.e?Xo.e(b):Xo.call(null,b)}())};for(var Zo=Array(1),$o=0;;)if($o<Zo.length)Zo[$o]=null,$o+=1;else break;(function ap(b){"undefined"===typeof Ko&&(Ko=function(b,d,e){this.gb=b;this.ed=d;this.rd=e;this.w=0;this.n=393216},Ko.prototype.I=function(){return this.rd},Ko.prototype.J=function(b,d){return new Ko(this.gb,this.ed,d)},Ko.lb=!0,Ko.kb="cljs.core.async/t50364",Ko.wb=function(b,d){return Ib(d,"cljs.core.async/t50364")});return new Ko(b,ap,td)})(function(){return null});var bp,cp,dp;function ep(){return u(bp)?Aa(bp.isClean.call(bp)):null}function fp(a){window.setTimeout(function(){var b=T.h(L.e?L.e(Qo):L.call(null,Qo),rj,a);return Ee.c?Ee.c(Qo,b):Ee.call(null,Qo,b)},0)}
function gp(){var a=cp,b=null==bp?null:bp.getValue.call(bp);fp("");try{Lo(b);var c=window.opener.faceboardApplyJSON;if(u(c)){var d;d=JSON.stringify(Pg(new V(null,2,5,W,[a,b],null)),null,2);c.e?c.e(d):c.call(null,d)}return bp.markClean.call(bp)}catch(e){if(e instanceof Object)return fp("The JSON is malformed!"),a=N([e],0),ke(Eo,M("error",a));throw e;}}function hp(a){if(null!=bp){var b=bp.getCursor.call(bp);bp.setValue.call(bp,a);u(b)&&bp.setCursor.call(bp,b);bp.markClean.call(bp)}}
function ip(a){return ke(x,Me("/",Z.c(function(a){return Pg(a)},a)))}function jp(a){var b=ip(cp),c=ip(ji.e(a));a=Oj.e(a);var d;d=null==bp?null:bp.getValue.call(bp);d=u(d)?d:a;var e=ep();return u(e)?K.c(b,c)&&!K.c(d,a):e}function kp(a,b){a.preventDefault();return u(b)?!0===confirm("Really overwrite external changes? This is most likely not a good idea.")?gp():null:gp()}
var lp=new V(null,1,5,W,[new V(null,3,5,W,[new ud(null,new r(null,2,[va,null,Ti,null],null),null),new ud(null,new r(null,2,[Si,null,Ti,null],null),null),Mi],null)],null);function mp(a,b){var c=S(b,0),d=S(b,1),e=S(b,2),c=u(Po)?K.c(a,c):Po,d=u(c)?c:Aa(Po)&&K.c(a,d);return u(d)?e:null}function np(a){return La(function(b,c){return Oc.c(b,mp(a,c))},vd,lp)}
var op=new V(null,2,5,W,[Ll(ml,new C(null,"data","data",1407862150,null)),Ll(ml,new C(null,"owner","owner",1247919588,null))],null),pp=kl(op),qp=kl(ml),rp=function(a,b,c,d,e){return function h(k,l){var p=a.Ca();if(u(p)){var n=new V(null,2,5,W,[k,l],null),q=d.e?d.e(n):d.call(null,n);if(u(q))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"editor-component","editor-component",1191234199,null),Ig(N([q],0))],0)),new r(null,4,[Vj,q,li,n,hh,c,Ci,Gh],null));}n=function(){for(;;)return"undefined"===
typeof dp&&(dp=function(a,b,c,d,e,h,k,l,n,p,q,yb){this.kd=a;this.gd=b;this.Sb=c;this.data=d;this.Dc=e;this.Td=h;this.Ec=k;this.Ab=l;this.ad=n;this.Wd=p;this.zb=q;this.od=yb;this.w=0;this.n=393216},dp.prototype.Rb=!0,dp.prototype.Gb=function(){return function(){return"editor-component"}}(p,a,b,c,d,e),dp.prototype.vd=!0,dp.prototype.gc=function(a,b,c,d,e,h){return function(){var k=this,l=function(){var a;a=k.Sb.refs;a=u(a)?a.host.getDOMNode():null;var b={lineWrapping:!0,gutters:["CodeMirror-linenumbers",
"CodeMirror-foldgutter"],foldGutter:!0,matchBrackets:!0,smartIndent:!0,value:Ve(k.data,new V(null,2,5,W,[Ij,Oj],null),""),mode:{json:!0,name:"javascript"},viewportMargin:Infinity,lint:!0,lineNumbers:!0,styleActiveLine:!0,autoCloseBrackets:!0};return CodeMirror(a,b)}(),n=l.defaultCharWidth.call(l);l.on.call(l,"renderLine",function(a,b,c,d,e,h,k,l,n,p){return function(q,t,z){var B=function(){return function(a,b){var c=(new RegExp(a,"g")).exec(b);return u(c)?R(c[0]):0}}(a,b,c,d,e,h,k,l,n,p);t=t.text;
q=q.getOption.call(q,"tabSize");q=CodeMirror.countColumn.call(CodeMirror,t,null,q)*b;B=B('".*"\\: "',t);B=q+B*b;z.style.textIndent=[x("-"),x(B),x("px")].join("");return z.style.paddingLeft=[x(c+B),x("px")].join("")}}(l,n,4,this,a,b,c,d,e,h));return bp=l}}(p,a,b,c,d,e),dp.prototype.Hb=!0,dp.prototype.Ib=function(a,b,c,d,e,h){return function(){var k=this,l=this,n=k.data,p=ip(ji.e(n)),q=Oj.e(n),yb=ep(),la=jp(n);u(yb)||(hp(q),cp=ji.e(n));return le(React.DOM.div,{className:Nk([x("editor"),x(u(la)?" danger":
null),x(u(yb)?" unsaved":null)].join(""))},Re(new V(null,4,5,W,[le(React.DOM.div,{className:"info"},Re(new V(null,1,5,W,[le(React.DOM.div,{className:"path-row"},Re(new V(null,2,5,W,["JSON PATH: ",le(React.DOM.span,{className:"path"},Re(new V(null,1,5,W,[p],null)))],null)))],null))),function(){var k={onKeyDown:Nk(function(a,b,c,d,e){return function(a){return u(Mi.e(np(Yo(a))))?kp(a,e):null}}(n,p,q,yb,la,l,a,b,c,d,e,h)),className:"editor-host",ref:"host"};return React.DOM.div(k)}(),le(React.DOM.div,
{className:"docs"},Re(new V(null,2,5,W,["docs: ",React.DOM.a({href:"https://github.com/darwin/faceboard/wiki/format",target:"_blank"},"https://github.com/darwin/faceboard/wiki/format")],null))),le(React.DOM.div,{className:"buttons"},Re(new V(null,2,5,W,[le(React.DOM.div,{onClick:Nk(function(a,b,c,d,e){return function(a){return kp(a,e)}}(n,p,q,yb,la,l,a,b,c,d,e,h)),title:"Save model and update the app.",className:"button hint"},Re(new V(null,1,5,W,[u(Po)?"save (CMD+S)":"save (CTRL+S)"],null))),u(la)?
function(){fp("Someone else just modified this data behind your back!");var Ca={onClick:Nk(function(a,b,c){return function(){hp(c);var a=k.Sb;if(!u(bo(a)))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"component?","component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));if(!u(bo(a)))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"component?","component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));if(!nd(Fd))throw Error([x("Assert failed: "),
x(Ig(N([Qd(new C(null,"ifn?","ifn?",-2106461064,null),new C(null,"f","f",43394975,null))],0)))].join(""));var b=fo(a),b=Fd.e?Fd.e(b):Fd.call(null,b);if(!u(bo(a)))throw Error([x("Assert failed: "),x(Ig(N([Qd(new C(null,"component?","component?",2048315517,null),new C(null,"owner","owner",1247919588,null))],0)))].join(""));return Cn.h(a,b,!0)}}(n,p,q,yb,la,l,a,b,c,d,e,h)),title:"This will throw away your changes since last save.",className:"button refresh"};return React.DOM.div(Ca,"discard my changes")}():
null],null)))],null)))}}(p,a,b,c,d,e),dp.prototype.I=function(){return function(){return this.od}}(p,a,b,c,d,e),dp.prototype.J=function(){return function(a,b){return new dp(this.kd,this.gd,this.Sb,this.data,this.Dc,this.Td,this.Ec,this.Ab,this.ad,this.Wd,this.zb,b)}}(p,a,b,c,d,e),dp.lb=!0,dp.kb="editor.views.editor/t47044",dp.wb=function(){return function(a,b){return Ib(b,"editor.views.editor/t47044")}}(p,a,b,c,d,e)),new dp(c,d,l,k,k,e,l,p,h,b,a,null)}();if(u(p)&&(q=e.e?e.e(n):e.call(null,n),u(q)))throw Yg(Qk("Output of %s does not match schema: %s",
N([new C(null,"editor-component","editor-component",1191234199,null),Ig(N([q],0))],0)),new r(null,4,[Vj,q,li,n,hh,b,Ci,Gh],null));return n}}(dl,ml,op,pp,qp);bl(rp,Ql(ml,new V(null,1,5,W,[op],null)));var sp,tp=new V(null,3,5,W,[Ll(ml,new C(null,"data","data",1407862150,null)),Ll(ml,new C(null,"_","_",-1201019570,null)),Ll(ml,new C(null,"_","_",-1201019570,null))],null),up=kl(tp),vp=kl(ml),wp=function(a,b,c,d,e){return function h(k,l,p){var n=a.Ca();if(u(n)){var q=new V(null,3,5,W,[k,l,p],null),t=d.e?d.e(q):d.call(null,q);if(u(t))throw Yg(Qk("Input to %s does not match schema: %s",N([new C(null,"main-component","main-component",-40016256,null),Ig(N([t],0))],0)),new r(null,4,[Vj,t,li,q,hh,c,Ci,
Gh],null));}q=function(){for(;;)return"undefined"===typeof sp&&(sp=function(a,b,c,d,e,h,k,l,n,p,q,t,Ca){this.md=a;this.data=b;this.Ud=c;this.Hc=d;this.Fc=e;this.hd=h;this.wa=k;this.ld=l;this.Ab=n;this.Xd=p;this.Gc=q;this.zb=t;this.pd=Ca;this.w=0;this.n=393216},sp.prototype.Rb=!0,sp.prototype.Gb=function(){return function(){return"main-component"}}(n,a,b,c,d,e),sp.prototype.Hb=!0,sp.prototype.Ib=function(){return function(){var a;try{var b=window.opener.faceboardApplyJSON;u(b)&&N(["apply-fn",b],0);
a=!1}catch(c){if(c instanceof Object)a=N(["disable the popup blocker"],0),ke(Eo,M("warn",a)),a=!0;else throw c;}if(Aa(a)){a=React.DOM.div;var b=W,d=Ij.e(this.data),d=Bo(rp,d,null),e;e=rj.e(this.data);e=Bo(Jo,e,null);a=le(a,{className:"editor-main"},Re(new V(null,2,5,b,[d,e],null)))}else a=le(React.DOM.div,{className:"editor-main"},Re(new V(null,1,5,W,[le(React.DOM.div,{className:"warning"},Re(new V(null,8,5,W,["Please disable popup blocking for this domain.",React.DOM.br(null),""+x(location.host),
React.DOM.br(null),React.DOM.br(null),"Then ",React.DOM.a({href:"javascript:window.close()"},"close this popup")," and then open Faceboard Editor again."],null)))],null)));return a}}(n,a,b,c,d,e),sp.prototype.I=function(){return function(){return this.pd}}(n,a,b,c,d,e),sp.prototype.J=function(){return function(a,b){return new sp(this.md,this.data,this.Ud,this.Hc,this.Fc,this.hd,this.wa,this.ld,this.Ab,this.Xd,this.Gc,this.zb,b)}}(n,a,b,c,d,e),sp.lb=!0,sp.kb="editor.views.main/t47102",sp.wb=function(){return function(a,
b){return Ib(b,"editor.views.main/t47102")}}(n,a,b,c,d,e)),new sp(h,k,e,p,k,d,p,c,n,b,l,a,null)}();if(u(n)&&(t=e.e?e.e(q):e.call(null,q),u(t)))throw Yg(Qk("Output of %s does not match schema: %s",N([new C(null,"main-component","main-component",-40016256,null),Ig(N([t],0))],0)),new r(null,4,[Vj,t,li,q,hh,b,Ci,Gh],null));return q}}(dl,ml,tp,up,vp);bl(wp,Ql(ml,new V(null,1,5,W,[tp],null)));pa=function(){function a(a){var d=null;if(0<arguments.length){for(var d=0,e=Array(arguments.length-0);d<e.length;)e[d]=arguments[d+0],++d;d=new E(e,0)}return b.call(this,d)}function b(a){return console.log.apply(console,Ka?Ja(a):Ia.call(null,a))}a.B=0;a.D=function(a){a=D(a);return b(a)};a.t=b;return a}();
(function(a,b,c){var d=ld(c)?ke(Ce,c):c,e=Tc(d,Pj),g=Tc(d,fi),h=Tc(d,ph),k=Tc(d,Eh),l=Tc(d,bh),p=Tc(d,Ck),n=Tc(d,gk);if(!nd(a))throw Error([x("Assert failed: "),x("First argument must be a function"),x("\n"),x(Ig(N([Qd(new C(null,"ifn?","ifn?",-2106461064,null),new C(null,"f","f",43394975,null))],0)))].join(""));if(null==n)throw Error([x("Assert failed: "),x("No target specified to om.core/root"),x("\n"),x(Ig(N([Qd(new C(null,"not","not",1044554643,null),Qd(new C(null,"nil?","nil?",1612038930,null),
new C(null,"target","target",1893533248,null)))],0)))].join(""));var q=L.e?L.e(xo):L.call(null,xo);pd(q,n)&&Tc(q,n).call(null);null==Kg&&(Kg=Be?Be(0):Ae.call(null,0));q=sc([x("G__"),x(Ge.c(Kg,Cc))].join(""));b=(b?b.w&16384||b.ce||(b.w?0:v(Zb,b)):v(Zb,b))?b:Be?Be(b):Ae.call(null,b);var t=Co(b,q,p),z=u(g)?g:Fd,B=U.t(d,gk,N([Ck,bh,fi,Pj],0)),F=Be?Be(null):Ae.call(null,null),J=function(b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J){return function Eb(){Ge.h(vo,ad,Eb);var c=L.e?L.e(d):L.call(null,d),k=function(){var a=
Do(null==B?Nn(c,d,Pc):Nn(Ue(c,B),d,B),b);return e.e?e.e(a):e.call(null,a)}();if(!u(Wn(d,b,Ph))){var l=Hk(function(){var c=Wm,e=Vm,h=Xm,l=Ym;Wm=t;Vm=z;Xm=d;Ym=b;try{return Bo(a,k,g)}finally{Ym=l,Xm=h,Vm=e,Wm=c}}(),J);null==(L.e?L.e(h):L.call(null,h))&&(Ee.c?Ee.c(h,l):Ee.call(null,h,l))}l=Dn(d);Fn(d);if(!bd(l))for(var l=D(l),n=null,p=0,q=0;;)if(q<p){var F=n.P(null,q);if(u(F.isMounted())){var P=F.state.__om_next_cursor;u(P)&&(F.props.__om_cursor=P,F.state.__om_next_cursor=null);u(function(){var a=co(F);
return(a=!(a?u(u(null)?null:a.sd)||(a.Q?0:v(xn,a)):v(xn,a)))?a:F.shouldComponentUpdate(F.props,F.state)}())&&F.forceUpdate()}q+=1}else if(l=D(l)){n=l;if(hd(n))l=Wb(n),q=Xb(n),n=l,p=R(l),l=q;else{var la=G(n);u(la.isMounted())&&(l=la.state.__om_next_cursor,u(l)&&(la.props.__om_cursor=l,la.state.__om_next_cursor=null),u(function(){var a=co(la);return(a=!(a?u(u(null)?null:a.sd)||(a.Q?0:v(xn,a)):v(xn,a)))?a:la.shouldComponentUpdate(la.props,la.state)}())&&la.forceUpdate());l=I(n);n=null;p=0}q=0}else break;
l=L.e?L.e(to):L.call(null,to);if(!bd(l))for(l=D(l),n=null,q=p=0;;)if(q<p){P=n.P(null,q);S(P,0);for(var Ca=S(P,1),P=function(){var a=Ca;return L.e?L.e(a):L.call(null,a)}(),P=D(P),ka=null,Fa=0,$a=0;;)if($a<Fa){var yb=ka.P(null,$a);S(yb,0);yb=S(yb,1);u(yb.shouldComponentUpdate(yb.props,yb.state))&&yb.forceUpdate();$a+=1}else if(P=D(P))hd(P)?(Fa=Wb(P),P=Xb(P),ka=Fa,Fa=R(Fa)):(ka=G(P),S(ka,0),ka=S(ka,1),u(ka.shouldComponentUpdate(ka.props,ka.state))&&ka.forceUpdate(),P=I(P),ka=null,Fa=0),$a=0;else break;
q+=1}else if(l=D(l)){if(hd(l))p=Wb(l),l=Xb(l),n=p,p=R(p);else{n=G(l);S(n,0);for(var Oo=S(n,1),n=function(){var a=Oo;return L.e?L.e(a):L.call(null,a)}(),n=D(n),p=null,P=q=0;;)if(P<q)ka=p.P(null,P),S(ka,0),ka=S(ka,1),u(ka.shouldComponentUpdate(ka.props,ka.state))&&ka.forceUpdate(),P+=1;else if(n=D(n))hd(n)?(q=Wb(n),n=Xb(n),p=q,q=R(q)):(p=G(n),S(p,0),p=S(p,1),u(p.shouldComponentUpdate(p.props,p.state))&&p.forceUpdate(),n=I(n),p=null,q=0),P=0;else break;l=I(l);n=null;p=0}q=0}else break;Un(d,b,Ph,!0);
return L.e?L.e(h):L.call(null,h)}}(q,b,t,z,B,F,c,d,d,e,g,h,k,l,p,n);Jg(t,q,function(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J){return function(Eb,gc,hc,Ac){Aa(Wn(c,a,Vi))&&hc!==Ac&&Un(c,a,Ph,!1);Un(c,a,Vi,!1);pd(L.e?L.e(vo):L.call(null,vo),h)||Ge.h(vo,Oc,h);if(u(uo))return null;uo=!0;return!1===p||"undefined"===typeof requestAnimationFrame?setTimeout(function(a,b,c){return function(){return wo(c)}}(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J),16):Wc(p)?p.A?p.A():p.call(null):requestAnimationFrame(function(a,b,c){return function(){return wo(c)}}(a,
b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J))}}(q,b,t,z,B,F,J,c,d,d,e,g,h,k,l,p,n));Ge.F(xo,T,n,function(a,b,c,d,e,g,h,k,l,n,p,q,t,z,B,F,J){return function(){Vn(c,a);Ob(c,a);Sn(c,a);Ge.h(vo,ad,h);Ge.h(xo,U,J);return React.unmountComponentAtNode(J)}}(q,b,t,z,B,F,J,c,d,d,e,g,h,k,l,p,n));return J()})(wp,Qo,new r(null,1,[gk,document.getElementById("app")],null));var xp=window.opener.faceboardPerformRefresh;u(xp)&&(xp.A?xp.A():xp.call(null));
})();

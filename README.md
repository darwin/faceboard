# Faceboard

Facebook killer. Or not.

## Overview

This ↓↓↓ but in the cloud!<br>
<a href="https://thesacredprofession.files.wordpress.com/2012/08/abby-with-faceboard1.jpg"><img src="https://thesacredprofession.files.wordpress.com/2012/08/abby-with-faceboard1.jpg" style="max-width:900px"></a>

## Setup

First-time Clojurescript developers, add the following to your bash .profile:

    LEIN_FAST_TRAMPOLINE=y
    export LEIN_FAST_TRAMPOLINE
    alias cljsbuild="lein trampoline cljsbuild $@"

To avoid compiling ClojureScript for each build, AOT Clojurescript locally in your project with the following:

    lein trampoline run -m clojure.main
    user=> (compile 'cljs.closure)
    user=> (compile 'cljs.core)

Subsequent builds can use:

    lein cljsbuild auto

Clean project specific out:

     lein clean

For more info, read [Waitin'](http://swannodette.github.io/2014/12/22/waitin/).

## License

[MIT License](http://opensource.org/licenses/MIT)

# Faceboard

Facebook killer. Or not.

## Overview

This ↓↓↓ but in the cloud!<br>
<a href="https://thesacredprofession.files.wordpress.com/2012/08/abby-with-faceboard1.jpg"><img src="https://thesacredprofession.files.wordpress.com/2012/08/abby-with-faceboard1.jpg" style="max-width:900px"></a>

## Local server

To run local web server with development build ([localhost:3000](localhost:3000)):

    lein ring server

## Development

Automatic code rebuilding via figwheel ([localhost:3000](localhost:3000)):

    lein figwheel

### Optional

Automatic code rebuilding in background:

    lein cljsbuild auto

Clean project specific out:

     lein clean

## License

[MIT License](http://opensource.org/licenses/MIT)

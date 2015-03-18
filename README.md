# Faceboard

Facebook killer. Or not.

### [Live demo](http://fb.binaryage.com)

## Overview

<a href="http://fb.binaryage.com"><img src="https://dl.dropboxusercontent.com/u/559047/faceboard-intro.png" style="max-width:900px"></a>

## Development

In terminal run figwheel (automatic code rebuilding), server should start at [localhost:3000](localhost:3000):

    lein figwheel

In a separate terminal session run garden (automatic css regeneration): 

    lein garden auto

## Deployment

#### Heroku

    rake deploy_heroku

#### GitHub Pages

First you have to setup your [gh-pages branch](https://help.github.com/articles/creating-project-pages-manually) and clone it into .build sub-directory. See rakefile's init_build task for inspiration.

    rake deploy_github

## License

[MIT License](http://opensource.org/licenses/MIT)

## Faceboard is an online collaborative board for groups.

### [Live demo](http://fb.binaryage.com)

<a href="http://fb.binaryage.com"><img src="https://dl.dropboxusercontent.com/u/559047/faceboard-intro.png" style="max-width:900px"></a>

## Development

Initial clone. Note: You must have ClojureScript environment properly setup on your machine.

    git clone git@github.com:darwin/faceboard.git
    cd faceboard

In terminal run figwheel (automatic code rebuilding):

    lein figwheel

In a separate terminal session run garden (automatic css regeneration): 

    lein garden auto

Server should start at [localhost:3000](localhost:3000).

## Deployment

#### Heroku

First you have [create heroku app](https://devcenter.heroku.com/articles/creating-apps) under your heroku account.

    rake deploy_heroku

#### GitHub Pages

First you have to setup your [gh-pages branch](https://help.github.com/articles/creating-project-pages-manually) and clone it into .build sub-directory. See rakefile's init_build task for inspiration.

    rake deploy_github

## License

[MIT License](http://opensource.org/licenses/MIT)

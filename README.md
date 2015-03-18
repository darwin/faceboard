## Faceboard is an online collaborative board for groups.

<a href="http://fb.binaryage.com"><img src="https://dl.dropboxusercontent.com/u/559047/faceboard-intro.png" style="max-width:900px"></a>

Faceboard is supposed to act as an online hub for content relevant to a group of people. It can be viewed as a JSON-driven mini-CMS with some specific tools for ad-hoc groups of tech-savvy travelers (e.g. [hackerparadise.org](http://hackerparadise.org) or [thesurfoffice.com](http://thesurfoffice.com)). But you are of course free to invent your own usage scenarios.

### [Read more details on wiki](https://github.com/darwin/faceboard/wiki)

### [Try live demo](http://fb.binaryage.com)

## Development

Initial clone. Note: You must have ClojureScript environment properly setup on your machine.

    git clone git@github.com:darwin/faceboard.git
    cd faceboard

In terminal run figwheel (automatic code rebuilding):

    lein figwheel

In a separate terminal session run garden (automatic css regeneration): 

    lein garden auto

Server should start at [localhost:3000](http://localhost:3000).

## Deployment

#### Heroku

First you have [create heroku app](https://devcenter.heroku.com/articles/creating-apps) under your heroku account.

    rake deploy_heroku

#### GitHub Pages

First you have to setup your [gh-pages branch](https://help.github.com/articles/creating-project-pages-manually) and clone it into .build sub-directory. See rakefile's init_build task for inspiration.

    rake deploy_github

## License

[MIT License](http://opensource.org/licenses/MIT)

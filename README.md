## Faceboard is an online collaborative board for groups.

Now you can easily create a photo board for your class, team or a work group...

<a href="http://faceboard.io"><img src="https://dl.dropboxusercontent.com/u/559047/fb2.png" style="max-width:900px"></a>

More generally a single faceboard is supposed to act as an online hub for content relevant to a group of people.
It can be viewed as a JSON-driven mini-CMS with some specific tools for ad-hoc groups of tech-savvy travelers
(e.g. [hackerparadise.org](http://hackerparadise.org) or [thesurfoffice.com](http://thesurfoffice.com)).
But you are of course free to invent your own usage scenarios.

### [Read more details on wiki](https://github.com/darwin/faceboard/wiki)

### [Try live demo](http://faceboard.io)

## Getting Started

### Install (OSX)
First, install clojurescript dependencies through homebrew.

`brew install lein`

`brew install caskroom/cask/brew-cask`

`brew cask install java`

### Running
Run each of these in a separate process:

`lein figwheel` (Like Guard, but for cljs)

`lein garden auto` (Like LESS/SASS - recompiles assets)

`lein cljsbuild auto dev-editor` (Open Faceboard editor in a separate app)

Then go to http://localhost:8000/#board/sample

### Devtools
Get chrome canary to get debugging info in your console.

You'll also need [`cljs-devtools`](https://github.com/binaryage/cljs-devtools) and do https://github.com/binaryage/cljs-devtools#enable-custom-formatters-in-your-chrome-canary

---

#### License [MIT](https://github.com/darwin/faceboard/blob/master/LICENSE.txt)

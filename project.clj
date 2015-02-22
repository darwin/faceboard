(defproject faceboard "0.1.0-SNAPSHOT"
  :description "FIXME: write this!"
  :url "http://example.com/FIXME"

  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-2850"]
                 [org.clojure/core.async "0.1.346.0-17112a-alpha"]
                 [org.omcljs/om "0.8.8"]
                 [prismatic/om-tools "0.3.10"]
                 [binaryage/devtools "0.1.0"]
                 [spellhouse/phalanges "0.1.4"]
                 [secretary "1.2.1"]
                 [figwheel "0.2.3-SNAPSHOT"]
                 [com.cemerick/pprng "0.0.3"]
                 [org.webjars/codemirror "4.6"]
                 [compojure "1.3.2"]
                 [ring "1.3.2"]
                 [ring/ring-jetty-adapter "1.2.2"]
                 [org.clojure/data.json "0.2.5"]
                 [enlive "1.1.5"]
                 [environ "0.5.0"]]

  :min-lein-version "2.0.0"

  :plugins [[lein-cljsbuild "1.0.5"]
            [lein-figwheel "0.2.3-SNAPSHOT"]
            [lein-ring "0.9.1"]
            [environ/environ.lein "0.2.1"]
            [lein-aggravate "0.1.2-SNAPSHOT"]]

  :hooks [environ.leiningen.hooks
          leiningen.cljsbuild
          leiningen.aggravate]

  :source-paths ["backend" "target/classes" "resources"]

  :clean-targets ^{:protect false} ["resources/public/_generated"]

  :ring {:handler server.core/app}

  :figwheel {:http-server-root "public"                     ;; this will be in resources/
             :server-port      3000
             :css-dirs         ["resources/public/css"]
             :ring-handler     server.core/app}

  :cljsbuild {
              :builds {:dev
                       {:source-paths ["frontend", "frontend-dev"]
                        :compiler     {:optimizations  :none
                                       :output-to      "resources/public/_generated/dev/faceboard.js"
                                       :output-dir     "resources/public/_generated/dev"
                                       :cache-analysis true
                                       :source-map     true}}
                       :production
                       {:source-paths ["frontend", "frontend-rel"]
                        :compiler     {:optimizations :advanced
                                       :pretty-print  false
                                       :output-to     "resources/public/_generated/prod/faceboard.js"
                                       :output-dir    "resources/public/_generated/prod"
                                       :source-map    "resources/public/_generated/prod/faceboard.js.map"
                                       :preamble      ["public/js/platform.js"
                                                       "public/codemirror/codemirror.js"
                                                       "public/codemirror/addon/edit/matchbrackets.js"
                                                       "public/codemirror/addon/edit/closebrackets.js"
                                                       "public/codemirror/addon/selection/active-line.js"
                                                       "public/codemirror/addon/lint/jsonlint.js"
                                                       "public/codemirror/addon/lint/lint.js"
                                                       "public/codemirror/addon/lint/json-lint.js"
                                                       "public/codemirror/javascript.js"
                                                       ]}
                        }}}

  :profiles {:production {:env {:production true}}}

  :aggravate-files [{:input      ["resources/public/css/imports.css" ; must go first
                                  "resources/public/css/app.css"
                                  "resources/public/css/tabs.css"
                                  "resources/public/css/logo.css"
                                  "resources/public/css/menu.css"
                                  "resources/public/css/people.css"
                                  "resources/public/css/places.css"
                                  "resources/public/css/editor.css"
                                  "resources/public/css/flags.css"
                                  "resources/public/codemirror/codemirror.css"
                                  "resources/public/codemirror/addon/lint/lint.css"
                                  ]
                     :output     "resources/public/_generated/faceboard.css"
                     :suffix     "css"
                     :compressor "yui"}]

  :uberjar-name "faceboard-standalone.jar")

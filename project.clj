(defproject faceboard "0.1.0-SNAPSHOT"
  :description "FIXME: write this!"
  :url "http://example.com/FIXME"

  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-3196"]
                 [org.clojure/core.async "0.1.346.0-17112a-alpha"]
                 [org.omcljs/om "0.8.8"]
                 [prismatic/om-tools "0.3.11"]
                 [binaryage/devtools "0.2.0"]
                 [spellhouse/phalanges "0.1.6"]
                 [secretary "1.2.3"]
                 [matchbox "0.0.6" :exclusions [commons-codec]]
                 [cljs-uuid "0.0.4"]
                 [cljs-http "0.1.30"]
                 [cuerdas "0.3.2"]
                 [markdown-clj "0.9.65"]
                 [garden "1.2.5"]
                 [figwheel "0.2.6"]
                 [com.cemerick/pprng "0.0.3"]
                 [org.webjars/codemirror "5.1"]
                 [compojure "1.3.3"]
                 [ring "1.3.2"]
                 [ring/ring-jetty-adapter "1.3.2"]
                 [ring/ring-defaults "0.1.4"]
                 [rm-hull/ring-gzip-middleware "0.1.7"]
                 [org.clojure/data.json "0.2.6"]
                 [enlive "1.1.5"]
                 [environ "1.0.0"]]

  :min-lein-version "2.0.0"

  :plugins [[lein-cljsbuild "1.0.5"]
            [lein-garden "0.2.5"]
            [lein-figwheel "0.2.3-SNAPSHOT"]
            [lein-ring "0.9.1"]
            [environ/environ.lein "0.2.1"]
            [lein-aggravate "0.1.2-SNAPSHOT"]]

  :hooks [environ.leiningen.hooks
          leiningen.cljsbuild
          leiningen.garden
          leiningen.aggravate]

  :source-paths ["backend" "target/classes" "resources" "frontend"]

  :clean-targets ^{:protect false} ["resources/public/_generated"]

  :ring {:handler server.core/app}

  :figwheel {:http-server-root "public"                     ;; this will be in resources/
             :server-port      3000
             :css-dirs         ["resources/public/css"]
             :ring-handler     server.core/app}

  :cljsbuild {
              :builds {:dev-faceboard
                       {:source-paths ["frontend/src", "frontend/src-dev"]
                        :compiler     {:optimizations :none
                                       :output-to     "resources/public/_generated/dev/faceboard/faceboard.js"
                                       :output-dir    "resources/public/_generated/dev/faceboard"
                                       :source-map    true}}

                       :dev-editor
                       {:source-paths ["frontend/src-editor", "frontend/src-dev"]
                        :compiler     {:optimizations :none
                                       :output-to     "resources/public/_generated/dev/editor/editor.js"
                                       :output-dir    "resources/public/_generated/dev/editor"
                                       :source-map    true}}

                       :production-faceboard
                       {:source-paths ["frontend/src", "frontend/src-prod"]
                        :compiler     {:optimizations :advanced
                                       :pretty-print  false
                                       :output-to     "resources/public/_generated/prod/faceboard/faceboard.js"
                                       :output-dir    "resources/public/_generated/prod/faceboard/"
                                       :preamble      ["public/js/platform.js"
                                                       "public/js/delegate.js"
                                                       "public/js/prefixfree.min.js"
                                                       ]}}

                       :production-editor
                       {:source-paths ["frontend/src-editor", "frontend/src-prod"]
                        :compiler     {:optimizations :advanced
                                       :pretty-print  false
                                       :output-to     "resources/public/_generated/prod/editor/editor.js"
                                       :output-dir    "resources/public/_generated/prod/editor/"
                                       :preamble      ["public/js/platform.js"
                                                       "public/js/delegate.js"
                                                       "public/js/prefixfree.min.js"
                                                       "public/codemirror/codemirror.js"
                                                       "public/codemirror/addon/edit/matchbrackets.js"
                                                       "public/codemirror/addon/edit/closebrackets.js"
                                                       "public/codemirror/addon/selection/active-line.js"
                                                       "public/codemirror/addon/lint/jsonlint.js"
                                                       "public/codemirror/addon/lint/lint.js"
                                                       "public/codemirror/addon/lint/json-lint.js"
                                                       "public/codemirror/addon/fold/foldcode.js"
                                                       "public/codemirror/addon/fold/foldgutter.js"
                                                       "public/codemirror/addon/fold/brace-fold.js"
                                                       "public/codemirror/javascript.js"
                                                       ]}}}}

  :profiles {:production {:env {:production true}}}

  :garden {:builds [{:source-paths ["frontend/styles"]
                     :stylesheet   faceboard.garden/garden
                     :compiler     {:output-to     "resources/public/css/garden.css"
                                    :pretty-print? true}}]}

  :aggravate-files [{:input      ["resources/public/css/garden.css" ; must go first
                                  "resources/public/css/font-awesome.css"
                                  "resources/public/css/flags.css"
                                  "resources/public/codemirror/codemirror.css"
                                  "resources/public/codemirror/addon/lint/lint.css"
                                  "resources/public/codemirror/addon/fold/foldgutter.css"]
                     :output     "resources/public/_generated/faceboard.css"
                     :suffix     "css"
                     :compressor "yui"}]

  :uberjar-name "faceboard-standalone.jar")

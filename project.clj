(defproject faceboard "0.1.0-SNAPSHOT"
  :description "FIXME: write this!"
  :url "http://example.com/FIXME"

  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-2850"]
                 [org.clojure/core.async "0.1.346.0-17112a-alpha"]
                 [org.omcljs/om "0.8.8"]
                 [prismatic/om-tools "0.3.10"]
                 [com.binaryage/devtools "0.0-SNAPSHOT"]
                 [org.webjars/codemirror "4.6"]
                 [spellhouse/phalanges "0.1.4"]
                 [figwheel "0.2.3-SNAPSHOT"]
                 [com.cemerick/pprng "0.0.3"]
                 [compojure "1.3.2"]
                 [ring "1.3.2"]]

  :plugins [[lein-cljsbuild "1.0.4"]
            [lein-figwheel "0.2.3-SNAPSHOT"]
            [lein-ring "0.9.1"]
            [environ/environ.lein "0.2.1"]]

  :hooks [environ.leiningen.hooks]

  :source-paths ["backend" "target/classes"]

  :clean-targets ^{:protect false} ["resources/public/_generated"]

  :ring {:handler server.core/app}

  :figwheel {:http-server-root "public" ;; this will be in resources/
             :server-port 3000
             :css-dirs ["resources/public/css"]
             :ring-handler server.core/app}

  :cljsbuild {
    :builds [{:id "faceboard"
              :source-paths ["frontend" "checkouts/cljs-devtools/src"]
              :compiler {
                :output-to "resources/public/_generated/faceboard.js"
                :output-dir "resources/public/_generated"
                :optimizations :none
                :cache-analysis true
                :source-map true}}]}

  :uberjar-name "faceboard-standalone.jar"
  :profiles {:production {:env {:production true}}
             :uberjar {:aot :all}}

  )

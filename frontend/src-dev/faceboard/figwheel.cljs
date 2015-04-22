(ns faceboard.figwheel
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [figwheel.client :as fw]))

; figwheel does not play well with advanced optimizations
; this is our workaround to include it only in dev builds

(defn start []
  (fw/start
    {:on-jsload    (fn [] (. js/window faceboard_reloader))
     :url-rewriter (fn [url] (clojure.string/replace url "resources/public/" ""))}))
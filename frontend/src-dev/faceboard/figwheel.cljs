(ns faceboard.figwheel
  (:require [figwheel.client :as fw]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

; figwheel does not play well with advanced optimizations
; this is our workaround to include it only in dev builds

(defn start []
  (fw/start {:on-jsload (fn [] (. js/window faceboard_reloader))}))
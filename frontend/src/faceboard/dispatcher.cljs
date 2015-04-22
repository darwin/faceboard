(ns faceboard.dispatcher
  (:require [cljs.core.async :refer [<! >!]]
            [faceboard.commands :refer [handle-command]]
            [faceboard.controller :refer [perform! command-chan]])
  (:require-macros [cljs.core.async.macros :refer [go go-loop]]
                   [faceboard.macros.logging :refer [log log-err log-warn log-info]]))

(defn start-handling-commands []
  (go-loop []
    (let [command (<! command-chan)]
      (log "handle command:" command)
      (apply handle-command command))
    (recur)))
(ns faceboard.dispatcher
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [cljs.core.async :as async :refer [<! >!]]
            [faceboard.commands :as commands]
            [faceboard.controller :as controller]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(defn start-processing-commands []
  (go-loop []
    (let [command (<! controller/command-chan)]
      (log "handle command:" command)
      (apply commands/handle-command command))
    (recur)))
(ns faceboard.controller
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [cljs.core.async :as async :refer [<! >!]]
            [faceboard.commands :as commands]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(def command-chan (async/chan))

(defn perform-command! [& command]
  (go (>! command-chan command)))

(defn start-processing-commands []
  (go-loop []
    (let [command (<! command-chan)]
      (log "handle command:" command)
      (apply commands/handle-command command))
    (recur)))
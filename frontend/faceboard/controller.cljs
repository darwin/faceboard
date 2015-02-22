(ns faceboard.controller
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [cljs.core.async :as async :refer [<! >!]]
            [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.commands :as commands]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.state :as state :refer [app-state]]))

(def command-chan (async/chan))

(defn perform-command! [& command]
  (go (>! command-chan command)))

(defn start-processing-commands []
  (go-loop []
    (let [command (<! command-chan)]
      (log "handle command:" command)
      (apply commands/handle-command command))
    (recur)))
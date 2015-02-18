(ns faceboard.controller
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [cljs.core.async :as async :refer [<! >!]]
            [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.commands :as commands]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.state :as state :refer [app-state]]))

(def command-chan (async/chan))

(defn perform-command! [owner command & args]
  (let [commands-chan (om/get-shared owner :command-chan)]
    (go (>! commands-chan (cons command args)))))

(defn start-processing-commands []
  (go-loop []
    (let [[command & args] (<! command-chan)]
      (log "handle command:" command args)
      (apply commands/handle-command command args))
    (recur)))
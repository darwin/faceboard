(ns faceboard.controller
  (:require-macros [cljs.core.async.macros :refer [go]]
                   [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [cljs.core.async :as async :refer [>!]]))

(def command-chan (async/chan))

(defn perform! [& command]
  (go (>! command-chan command)))
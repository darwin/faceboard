(ns faceboard.controller
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [cljs.core.async :as async :refer [>!]]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(def command-chan (async/chan))

(defn perform! [& command]
  (go (>! command-chan command)))
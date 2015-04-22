(ns faceboard.helpers.underscore
  (:require-macros [cljs.core.async.macros :refer [go]]
                   [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [cljs.core.async :refer [put! <! chan timeout close!]]))

; underscore-like debounce
(defn debounce [f wait]
  (let [counter (atom 0)
        chan (atom (chan))]
    (fn [& args]
      (swap! counter inc)
      (let [snapshot @counter]
        (go
          (swap! chan (fn [c] (do (close! c) (timeout wait))))
          (<! @chan)
          (if (= snapshot @counter)
            (apply f args)))))))
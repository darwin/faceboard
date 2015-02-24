(ns faceboard.firebase
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [cljs.core.async :refer [<! chan put!]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.env :as env]
            [matchbox.core :as p]
            [matchbox.async :as pa]))

(def firebase-db-url (str "https://" env/firebase-db ".firebaseio.com/"))

(def control-chan (chan))

(defn estabilish-dummy-connection []
  (go (alts! [control-chan])))

(estabilish-dummy-connection)

(defn cancel-previous-connection []
  (put! control-chan :cancel))

(defn firebase-board-url [board-id]
  (str firebase-db-url "boards/" board-id))

(defn connect-board [board-id handler]
  (cancel-previous-connection)
  (let [board-ref (p/connect (firebase-board-url board-id))
        board-chan (pa/listen-to< board-ref :value)]
    (go-loop []
      (let [[msg chan] (alts! [board-chan control-chan])]
        (when (= chan board-chan)
          (log "firebase:" msg)
          (handler (second msg))
          (recur))
        (log "disconnected board " board-id)))))
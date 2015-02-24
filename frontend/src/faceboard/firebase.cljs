(ns faceboard.firebase
  (:require-macros [cljs.core.async.macros :refer [go go-loop]]
                   [faceboard.macros.model :refer [transform-app-state]])
  (:require [cljs.core.async :refer [<! chan put!]]
            [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.env :as env]
            [faceboard.model :as model]
            [matchbox.core :as p]
            [matchbox.async :as pa]))

(def firebase-db-url (str "https://" env/firebase-db ".firebaseio.com/"))

(defonce control-chan (chan))

(defn estabilish-dummy-connection []
  (go (alts! [control-chan])))

(estabilish-dummy-connection)

(defn cancel-previous-connection []
  (put! control-chan :cancel))

(defn firebase-board-url [board-id]
  (str firebase-db-url "boards/" board-id))

(defn connect-board [board-id]
  (cancel-previous-connection)
  (let [board-ref (p/connect (firebase-board-url board-id))
        board-chan (pa/listen-to< board-ref :value)
        model-watcher (fn [_ _ old new]
                        (let [old-model (:model old)
                              new-model (:model new)]
                          (when (not= old-model new-model)
                            (log "app model changed, writing model to firebase...")
                            (transform-app-state (model/set [:ui :loading?] true))
                            (p/reset! board-ref new-model))))]
    (go-loop []
      (add-watch app-state :model-watcher model-watcher)
      (let [[msg chan] (alts! [board-chan control-chan])]
        (when (= chan board-chan)
          (log "firebase:" msg)
          (let [value (second msg)]
            (remove-watch app-state :model-watcher)
            (transform-app-state
              (model/set [:ui :view] :board)
              (model/set [:ui :loading?] false)
              (model/set [:model] value))
            (add-watch app-state :model-watcher model-watcher))
          (recur))
        (remove-watch app-state :model-watcher)
        (log "disconnected board " board-id)))))
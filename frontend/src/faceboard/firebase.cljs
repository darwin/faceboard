(ns faceboard.firebase
  (:require-macros [cljs.core.async.macros :refer [go go-loop]]
                   [faceboard.macros.model :refer [transform-app-state]])
  (:require [cljs.core.async :refer [<! >! chan put!]]
            [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.env :as env]
            [faceboard.model :as model]
            [faceboard.schema :as schema]
            [matchbox.core :as p]
            [matchbox.async :as pa]))

(def firebase-db-url (str "https://" env/firebase-db ".firebaseio.com/"))

(defonce control-chan (chan))

(defn estabilish-dummy-connection []
  (go (alts! [control-chan])))

(estabilish-dummy-connection)

(defn firebase-board-url [board-id]
  (str firebase-db-url "boards/" board-id))

(defn connect-board-worker [board-id & opts]
  (let [[{:keys [on-connect on-disconnect on-message]}] opts
        board-ref (p/connect (firebase-board-url board-id))
        board-chan (pa/listen-to< board-ref :value)
        model-watcher (fn [_ _ old new]
                        (let [old-model (:model old)
                              new-model (:model new)]
                          (when (not= old-model new-model)
                            (log "app model changed")
                            (log "firebase:" board-id "<<" new-model)
                            (transform-app-state
                              (model/inc [:ui :loading?]))  ; ***
                            (p/reset! board-ref new-model))))]
    (log "firebase: connecting board " board-id)
    (go-loop [request-number 0]
      (add-watch app-state :model-watcher model-watcher)
      (let [[msg chan] (alts! [board-chan control-chan])]
        (when (= chan board-chan)
          (let [[id model] msg]
            (log (str "firebase: #" request-number) id ">>" model)
            (let [upgraded-model (schema/upgrade-schema-if-needed model)]
              (when upgraded-model                          ; warning: upgrade can fail
                (remove-watch app-state :model-watcher)
                (transform-app-state
                  (model/set [:ui :view] :board)
                  (model/dec-clamp-zero [:ui :loading?])    ; not all incoming messages were initiated by ***
                  (model/set [:model] upgraded-model))
                (add-watch app-state :model-watcher model-watcher)
                (when (and (zero? request-number) (fn? on-connect) (on-connect upgraded-model)))
                (when (fn? on-message) (on-message upgraded-model))))
            (recur (inc request-number))))
        (remove-watch app-state :model-watcher)
        (when (fn? on-disconnect) (on-disconnect))
        (log "firebase: disconnected board " board-id)))))

(defn cancel-previous-connection [fn]
  (put! control-chan :cancel fn false))                     ; execute fn after disconnection

(defn connect-board [& params]
  (cancel-previous-connection #(apply connect-board-worker params)))
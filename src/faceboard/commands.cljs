(ns faceboard.commands
  (:require [cljs.core.async :as async :refer [<!]]
            [faceboard.state :as state :refer [app-state]]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]))

(defn- toggle [state & path]
  (update-in state path #(not %)))

(defn- disable [state & path]
  (assoc-in state path false))

(defn- enable [state & path]
  (assoc-in state path true))

(defmulti handle-command (fn [command & _] command))

(defmethod handle-command :default [command & _]
  (log-err (str "Invalid command '" command "'")))

(defmethod handle-command "toggle-edit" [_ & _]
  (reset! app-state (-> @app-state
                      (toggle :ui :editing?)
                      (disable :ui :model-editing?))))

(defmethod handle-command "toggle-model" [_ & _]
  (reset! app-state (-> @app-state
                      (toggle :ui :model-editing?)
                      (disable :ui :editing?))))

(defmethod handle-command "apply-model" [_ json]
  (try
    (let [new-model (utils/json->model json)
          new-state (assoc-in @app-state [:model] new-model)]
      (reset! app-state new-state))
    (catch js/Object err
      (log-err err))))

(defmethod handle-command "change-extended-set" [_ new-set]
  (reset! app-state (assoc-in @app-state [:ui :extended-set] new-set)))

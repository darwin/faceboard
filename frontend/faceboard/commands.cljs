(ns faceboard.commands
  (:require [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.utils :refer [json->model]]))

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
    (let [new-model (json->model json)
          new-state (assoc-in @app-state [:model] new-model)]
      (reset! app-state new-state))
    (catch js/Object err
      (log-err err))))

(defmethod handle-command "change-extended-set" [_ new-set]
  (reset! app-state (assoc-in @app-state [:ui :extended-set] new-set)))

(defmethod handle-command "switch-tab" [_ new-id]
  (reset! app-state (assoc-in @app-state [:ui :selected-tab-id] new-id)))

(defmethod handle-command "switch-view" [_ new-view]
  (reset! app-state (assoc-in @app-state [:ui :view] new-view)))

(defmethod handle-command "switch-board" [_ new-board]
  (reset! app-state (assoc-in @app-state [:ui :view] :board)))

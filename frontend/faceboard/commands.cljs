(ns faceboard.commands
  (:require [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.model :as model]
            [faceboard.utils :refer [json->model]])
  (:require-macros [faceboard.macros.model :refer [transform-app-state]]))

(defmulti handle-command (fn [command & _] command))

(defmethod handle-command :default [command & _]
  (log-err (str "Invalid command '" command "'")))

(defmethod handle-command "toggle-edit" [_ & _]
  (transform-app-state
    (model/toggle [:ui :editing?])
    (model/disable [:ui :model-editing?])))

(defmethod handle-command "toggle-model" [_ & _]
  (transform-app-state
    (model/toggle [:ui :model-editing?])
    (model/disable [:ui :editing?])))

(defmethod handle-command "apply-model" [_ json]
  (try
    (transform-app-state
      (model/set [:model] (json->model json)))
    (catch js/Object err
      (log-err err))))

(defmethod handle-command "change-extended-set" [_ new-set]
  (transform-app-state
    (model/set [:ui :extended-set] new-set)))

(defmethod handle-command "switch-tab" [_ new-id]
  (transform-app-state
    (model/set [:ui :selected-tab-id] new-id)))

(defmethod handle-command "switch-view" [_ new-view]
  (transform-app-state
    (model/set [:ui :view] new-view)))

(defmethod handle-command "switch-board" [_ _]
  (transform-app-state
    (model/set [:ui :view] :board)))

(ns faceboard.commands
  (:require [cljs.core.async :as async :refer [<!]]
            [faceboard.state :as state :refer [app-state]]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]))

(defn- toggle [state & path]
  (update-in state path #(not %)))

(defn- disable [state & path]
  (update-in state path (fn [] false)))

(defn- enable [state & path]
  (update-in state path (fn [] true)))

(defmulti handle-command (fn [command & _] command))

(defmethod handle-command :default [command & _]
  (log-err "Invalid command '" command "'"))

(defmethod handle-command "toggle-edit" [_ & _]
  (reset! app-state (-> @app-state
                      (toggle :ui :editing?)
                      (disable :ui :source-editing?))))

(defmethod handle-command "toggle-source" [_ & _]
  (reset! app-state (-> @app-state
                      (toggle :ui :source-editing?)
                      (disable :ui :editing?))))

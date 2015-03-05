(ns faceboard.commands
  (:require [clojure.set :refer [difference]]
            [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.model :as model]
            [faceboard.router :as router]
            [faceboard.firebase :as db]
            [faceboard.data.initial_board :refer [initial-board]]
            [faceboard.shared.anims :as anims]
            [faceboard.animator :refer [animate invalidate-animations]]
            [faceboard.utils :refer [json->model]])
  (:require-macros [faceboard.macros.model :refer [transform-app-state]]))

(defmulti handle-command (fn [command & _] command))

(defmethod handle-command :default [command & _]
  (log-err (str "Invalid command '" command "'")))

(defmethod handle-command :toggle-edit [_ & _]
  (transform-app-state
    (model/toggle [:ui :editing?])
    (model/disable [:ui :model-editing?])))

(defmethod handle-command :toggle-model [_ & _]
  (transform-app-state
    (model/toggle [:ui :model-editing?])
    (model/disable [:ui :editing?])))

(defmethod handle-command :apply-model [_ json]
  (try                                                      ; json is provided by user, can be broken
    (transform-app-state
      (model/set [:model] (json->model json)))
    (catch js/Object err
      (log-err err))))

(defn kill-anims [path]
  (invalidate-animations path)
  (transform-app-state
    (model/set path nil)))                                  ; potentially resets whole animations subtree

(defmethod handle-command :change-extended-set [_ new-set]
  (let [old-set (model/get [:ui :extended-set])
        expanding-set (difference new-set old-set)
        shrinking-set (difference old-set new-set)]
    (kill-anims [:anims :person :person-expanding])
    (kill-anims [:anims :person :person-shrinking])
    (doseq [item expanding-set]
      (animate (anims/person-expanding item)))
    (doseq [item shrinking-set]
      (animate (anims/person-shrinking item)))
    (transform-app-state
      (model/set [:ui :extended-set] new-set))))

(defmethod handle-command :switch-tab [_ new-id]
  (transform-app-state
    (model/set [:ui :selected-tab-id] new-id)))

(defmethod handle-command :switch-view [_ new-view params]
  (transform-app-state
    (model/set [:ui :view] new-view)
    (model/set [:ui :view-params] params)))

(defmethod handle-command :switch-board [_ board-id]
  (transform-app-state
    (model/set [:ui :view] :loading)
    (model/set [:ui :loading?] true)
    (model/set [:ui :view-params] {:message "Loading faceboard..."}))
  (db/connect-board board-id))

(defmethod handle-command :create-board [_ board-id]
  (transform-app-state
    (model/set [:ui :view] :loading)
    (model/set [:ui :loading?] true)
    (model/set [:ui :view-params] {:message "Creating a new board..."}))
  (let [init-and-navigate (fn [_]
                            (transform-app-state
                              (model/set [:model] initial-board))
                            (router/navigate! (router/board-route {:id board-id})))]
    (db/connect-board board-id {:on-connect init-and-navigate})))

(defmethod handle-command :start-anim [_ anim-path]
  (transform-app-state
    (model/set anim-path 0)))

(defmethod handle-command :stop-anim [_ anim-path]
  (transform-app-state
    (model/set anim-path nil)))

(defmethod handle-command :animate [_ anim-path]
  (transform-app-state
    (model/update anim-path inc)))

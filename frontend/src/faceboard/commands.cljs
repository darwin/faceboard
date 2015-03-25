(ns faceboard.commands
  (:require-macros [faceboard.macros.model :refer [transform-app-state]]
                   [cljs.core.async.macros :refer [go]])
  (:require [clojure.set :refer [difference]]
            [cljs-http.client :as http]
            [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.model :as model]
            [faceboard.router :as router]
            [faceboard.firebase :as db]
            [faceboard.controller :refer [perform!]]
            [faceboard.data.initial_board :refer [initial-board]]
            [faceboard.shared.anims :as anims]
            [faceboard.animator :refer [animate invalidate-animations]]
            [faceboard.helpers.utils :refer [json->model]]))

(defmulti handle-command (fn [command & _] command))

(defmethod handle-command :default [command]
  (log-err (str "Invalid command '" command "'")))

(defmethod handle-command :toggle-model [_ root-path]
  (transform-app-state
    (model/set [:ui :editor-path] root-path)
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

(defn stuck-on-error? []
  (= :error (get-in @app-state [:ui :view])))

(defmethod handle-command :switch-view [_ new-view params]
  (if (stuck-on-error?)
    ; if error do not allow dispatch, the only way out is a full page refresh
    (log-warn "Switch view command cancelled because of previous error(s).")
    (transform-app-state
      (model/set [:ui :view] new-view)
      (model/set [:ui :view-params] params))))

(defmethod handle-command :switch-board [_ board-id]
  (when-not (db/is-board-connected? board-id)
    (do
      (transform-app-state
        (model/set [:ui :view] :loading)
        (model/inc [:ui :loading?])
        (model/set [:ui :view-params] {:message "Loading the board..."}))
      (db/connect-board board-id {:on-connect (fn [model]
                                                (if model
                                                  (transform-app-state
                                                    (model/dec-clamp-zero [:ui :loading?])
                                                    (model/set [:ui :view] :board))
                                                  (perform! :switch-view :error {:message (str "Board " board-id " does not exist.")})))}))))

(defmethod handle-command :create-board [_ board-id]
  (transform-app-state
    (model/set [:ui :view] :loading)
    (model/inc [:ui :loading?])
    (model/set [:ui :view-params] {:message "Creating a new board..."}))
  (let [init-and-navigate (fn [_]
                            (transform-app-state
                              (model/dec-clamp-zero [:ui :loading?])
                              (model/set [:model] initial-board)
                              (model/set [:ui :view] :board))
                            (router/navigate! ((router/route :board-tab) {:id board-id :tab "people"})))]
    (db/connect-board board-id {:on-connect init-and-navigate})))

(defmethod handle-command :start-anim [_ anim-path]
  (transform-app-state
    (model/set anim-path 0)))

(defmethod handle-command :stop-anim [_ anim-path]
  (transform-app-state
    (model/set anim-path nil)))

(defmethod handle-command :animate [_ anim-path]
  (transform-app-state
    (model/inc anim-path)))

(defmethod handle-command :inc-loading-counter []
  (transform-app-state
    (model/inc [:ui :loading?])))

(defmethod handle-command :dec-loading-counter []
  (transform-app-state
    (model/dec-clamp-zero [:ui :loading?])))

(defmethod handle-command :update-tab-cache [_ tab-id content]
  (transform-app-state
    (model/set [:cache :tabs tab-id] {:content content})))

(defmethod handle-command :fetch-content [_ url fn]         ; url must be CORS-enabled
  (transform-app-state
    (model/inc [:ui :loading?]))
  (go (let [opts {:with-credentials? false}                 ; http://stackoverflow.com/a/24443043/84283
            response (<! (http/get url opts))]
        (transform-app-state
          (model/dec-clamp-zero [:ui :loading?]))
        (when fn (fn response)))))

(defmethod handle-command :toggle-filter-expansion [_ filter-name]
  (transform-app-state
    (model/toggle-set [:ui :filters :expanded-set] filter-name)))

(defmethod handle-command :filter-select-country [_ country-code]
  (let [was-selected? (contains? (get-in @app-state [:ui :filters :active :countries]) country-code)]
    (transform-app-state
      (model/set [:ui :filters :active :countries] (if was-selected? #{} #{country-code})))))

(defmethod handle-command :filter-shift-select-country [_ country-code]
  (transform-app-state
    (model/toggle-set [:ui :filters :active :countries] country-code)))

(defmethod handle-command :filter-select-tag [_ tag]
  (let [was-selected? (contains? (get-in @app-state [:ui :filters :active :tags]) tag)]
    (transform-app-state
      (model/set [:ui :filters :active :tags] (if was-selected? #{} #{tag})))))

(defmethod handle-command :filter-shift-select-tag [_ tag]
  (transform-app-state
    (model/toggle-set [:ui :filters :active :tags] tag)))

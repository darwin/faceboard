(ns faceboard.commands
  (:require-macros [faceboard.macros.model :refer [transform-app-state]]
                   [cljs.core.async.macros :refer [go]]
                   [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [clojure.set :refer [difference]]
            [cljs-http.client :as http]
            [cljs.core.async :refer [put! <! chan timeout close!]]
            [goog.window]
            [faceboard.state :refer [app-state]]
            [faceboard.model :as model]
            [faceboard.router :as router]
            [faceboard.firebase :as db]
            [faceboard.editor :as editor]
            [faceboard.controller :refer [perform!]]
            [faceboard.data.initial_board :refer [initial-board]]
            [faceboard.shared.anims :as anims]
            [faceboard.animator :refer [animate invalidate-animations]]
            [faceboard.helpers.utils :refer [json->model provide-unique-human-friendly-id]]
            [faceboard.helpers.people :refer [is-person-filtered? build-filter-predicates]]
            [cuerdas.core :as str]
            [faceboard.helpers.person :as person]))

(defmulti handle-command (fn [command & _] command))

(defmethod handle-command :default [command]
  (log-err (str "Invalid command '" command "'")))

(defmethod handle-command :apply-json [_ path json]
  (try                                                      ; json is provided by user, can be broken
    (transform-app-state
      (model/set path (json->model json)))
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
        (model/set [:ui :view-params] {:message "loading the board..."}))
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
    (model/set [:ui :view-params] {:message "creating a new board..."}))
  (let [init-and-navigate (fn [_]
                            (transform-app-state
                              (model/dec-clamp-zero [:ui :loading?])
                              (model/set [:model] (initial-board))
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

(defmethod handle-command :filter-select-group [_ group]
  (router/switch-person nil)
  (let [was-selected? (contains? (get-in @app-state [:ui :filters :active :groups]) group)]
    (transform-app-state
      (model/set [:ui :filters :active :groups] (if was-selected? #{} #{group})))))

(defmethod handle-command :filter-shift-select-group [_ group]
  (router/switch-person nil)
  (transform-app-state
    (model/toggle-set [:ui :filters :active :groups] group)))

(defmethod handle-command :filter-select-country [_ country-code]
  (router/switch-person nil)
  (let [was-selected? (contains? (get-in @app-state [:ui :filters :active :countries]) country-code)]
    (transform-app-state
      (model/set [:ui :filters :active :countries] (if was-selected? #{} #{country-code})))))

(defmethod handle-command :filter-shift-select-country [_ country-code]
  (router/switch-person nil)
  (transform-app-state
    (model/toggle-set [:ui :filters :active :countries] country-code)))

(defmethod handle-command :filter-select-tag [_ tag]
  (router/switch-person nil)
  (let [was-selected? (contains? (get-in @app-state [:ui :filters :active :tags]) tag)]
    (transform-app-state
      (model/set [:ui :filters :active :tags] (if was-selected? #{} #{tag})))))

(defmethod handle-command :filter-shift-select-tag [_ tag]
  (router/switch-person nil)
  (transform-app-state
    (model/toggle-set [:ui :filters :active :tags] tag)))

(defmethod handle-command :filter-select-social [_ social]
  (router/switch-person nil)
  (let [was-selected? (contains? (get-in @app-state [:ui :filters :active :socials]) social)]
    (transform-app-state
      (model/set [:ui :filters :active :socials] (if was-selected? #{} #{social})))))

(defmethod handle-command :filter-shift-select-social [_ social]
  (router/switch-person nil)
  (transform-app-state
    (model/toggle-set [:ui :filters :active :socials] social)))

(defmethod handle-command :clear-filter [_ which]
  (router/switch-person nil)
  (transform-app-state
    (model/set [:ui :filters :revertible which] (model/get [:ui :filters :active which]))
    (model/set [:ui :filters :active which] #{})))

(defmethod handle-command :revert-filter [_ which]
  (router/switch-person nil)
  (transform-app-state
    (model/set [:ui :filters :active which] (model/get [:ui :filters :revertible which]))
    (model/set [:ui :filters :revertible which] #{})))

(defmethod handle-command :open-editor [_ path external?]
  (when external?
    (editor/open-editor-window))
  (transform-app-state
    (model/set [:ui :show-editor] (if external? false true))
    (model/set [:ui :editor-path] path)))

(defmethod handle-command :refresh-editor []
  (editor/refresh-editor))

(defmethod handle-command :hide-editor [_]
  (transform-app-state
    (model/set [:ui :show-editor] false)))

(defmethod handle-command :update-people-layout [_ tab-id layout]
  (transform-app-state
    (model/set [:transient tab-id :layout] layout)))

(defmethod handle-command :toggle-editing [_]
  (transform-app-state
    (model/toggle [:ui :editing?])
    (model/set [:ui :gizmo :active] nil)))

(defmethod handle-command :toggle-gizmo [_ gizmo-id position]
  (let [prev-gizmo-id (get-in @app-state [:ui :gizmo :active])]
    (if (= prev-gizmo-id gizmo-id)
      (transform-app-state
        (model/set [:ui :gizmo :active] nil)
        (model/set [:ui :gizmo :position] nil))
      (transform-app-state
        (model/set [:ui :gizmo :active] gizmo-id)
        (model/set [:ui :gizmo :position] position)))))

(defmethod handle-command :delete-card [_ path]
  (go
    (transform-app-state
      (model/set [:ui :editing?] false))
    (<! (timeout 1000))
    (router/switch-person nil)
    (<! (timeout 1000))
    (transform-app-state
      (model/dissoc path))))

(defmethod handle-command :clear-card [_ path]
  (transform-app-state
    (model/update path (fn [person] {:id (:id person)}))))

(defn rtrim-digits [s]
  (str/rtrim s "0123456789"))

(defn make-person-clone [person people]
  (let [all-ids (map :id people)
        id-prefix (rtrim-digits (:id person))
        new-id (provide-unique-human-friendly-id id-prefix all-ids)]
    (assoc person :id new-id)))

(defn person-filtered? [person]
  (let [data (:model @app-state)
        active-filters (get-in @app-state [:ui :filters :active])
        filter-predicates (build-filter-predicates active-filters data)]
    (is-person-filtered? filter-predicates person)))

(defn duplicate-layout-item-for-id [layout id new-id]
  (if-let [item (get layout id)]
    (assoc layout new-id item)
    layout))

(defn rename-layout-item-for-id [layout id new-id]
  (if-let [item (get layout id)]
    (do
      (dissoc layout id)
      (assoc layout new-id item))
    layout))

(defmethod handle-command :duplicate-card [_ path]
  (let [person (get-in @app-state path)
        tab-path (take 3 path)
        tab (get-in @app-state tab-path)
        people-path (pop path)
        people (get-in @app-state people-path)
        person-clone (make-person-clone person people)]
    (go
      (transform-app-state
        (model/set [:ui :editing?] false))
      (<! (timeout 1000))
      (router/switch-person nil)
      (<! (timeout 1000))
      (transform-app-state
        (model/update people-path (fn [old-people] (conj old-people person-clone)))
        (model/update [:transient (:id tab) :layout] (fn [old-layout]
                                                       (duplicate-layout-item-for-id old-layout (:id person) (:id person-clone)))))
      ; groups are defined in terms of ids, newly created person can be filtered out
      ; TODO: should we assign clone to the same groups automatically?
      (when-not (person-filtered? person-clone)
        (<! (timeout 1000))
        (router/switch-person (:id person-clone))))))

(defmethod handle-command :reset-slug [_ path]
  (let [person (get-in @app-state path)
        tab-path (take 3 path)
        tab (get-in @app-state tab-path)
        people-path (pop path)
        people (get-in @app-state people-path)
        id (:id person)
        all-ids (remove #(= id %) (map :id people))
        id-prefix (rtrim-digits (str/replace (str/lower (str/trim (person/name person))) #"[^a-zA-Z0-9]" ""))
        new-id (provide-unique-human-friendly-id id-prefix all-ids)]
    (when-not (= id new-id)
      (transform-app-state
        ; TODO: rename also in groups?
        (model/update path (fn [old-person] (assoc old-person :id new-id)))
        (model/update [:transient (:id tab) :layout] (fn [old-layout]
                                                       (rename-layout-item-for-id old-layout id new-id))))
      (router/switch-person new-id))))
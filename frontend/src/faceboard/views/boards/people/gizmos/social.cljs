(ns faceboard.views.boards.people.gizmos.social
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.social :refer [social-info known-services]]
            [faceboard.helpers.gizmos :refer [debounce-commit gizmo-form-key-down]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [cuerdas.core :as str]))

(def list-separator "---")
(def web-link-id "a web link")
(def socials-path [:social])

(defn commit-socials-change [person value]
  (om/update! person socials-path value))

(def debounced-commit-socials-change (debounce-commit commit-socials-change))

(defn append-social [social socials]
  (concat socials [social]))

(defn add-social [owner name socials updater]
  (let [node (om/get-node owner name)
        value (str/trim (str (.-value node)))]
    (when-not (= value list-separator)
      (let [suitable-value (if (= value web-link-id) "" (str value "|"))]
        (updater {:socials (append-social suitable-value socials)})))))

(defn remove-social [index socials updater]
  (updater {:socials (remove nil? (assoc (vec socials) index nil))}))

(defn reassembly [social value]
  (let [info (social-info social)
        {:keys [type]} info]
    (if type
      (str (:type info) "|" value)
      value)))

(defn update-social [index socials updater e]
  (let [value (.. e -target -value)]
    (updater {:socials (update (vec socials) index #(reassembly % value))})))

(defn clear-all-socials [updater]
  (updater {:socials []}))

(defcomponent social-item-component [data _]
  (render [_]
    (let [{:keys [index socials updater]} data
          social (nth socials index)
          info (social-info social)
          {:keys [icon content url type]} info]
      (dom/div {:class "social-row"}
        (dom/i {:class (str "icon fa " icon)})
        (dom/input {:type        "text"
                    :value       content
                    :placeholder (if type "user profile url" "web url")
                    :title       url
                    :on-change   (partial update-social index socials updater)})
        (dom/button {:class    "remove-action"
                     :on-click (partial remove-social index socials updater)}
          "✘")))))

(defn full-list []
  (concat
    [web-link-id list-separator] (sort known-services)))

(defcomponent social-gizmo-component [data owner]
  (init-state [_]
    (let [{:keys [person]} data]
      {:socials (person/socials person)}))
  (did-mount [_]
    (let [focus-node (om/get-node owner "focus")]
      (.focus focus-node)))
  (render-state [_ state]
    (let [{:keys [person]} data
          socials (:socials state)
          updater (fn [state-patch]
                    (om/update-state! owner (fn [old-state]
                                              (let [new-state (merge old-state state-patch)]
                                                (debounced-commit-socials-change person (:socials new-state))
                                                new-state))))
          add-social-handler (partial add-social owner "focus" socials updater)
          clear-all-handler (partial clear-all-socials updater)]
      (dom/form {:class       "social-gizmo"
                 :on-key-down gizmo-form-key-down
                 :on-submit   (fn [e] (.preventDefault e))}
        (dom/div {:class "social-list clearfix no-dismiss"}
          (if (zero? (count socials))
            (dom/div {:class "no-socials-avail"} "Add some links below...")
            (for [index (range (count socials))]
              (om/build social-item-component {:index   index
                                               :socials socials
                                               :updater updater}))))
        (dom/div {:class "controls-row"}
          (dom/label "Add a new link:"
            (dom/select {:ref "focus"}
              (for [id (full-list)]
                (dom/option {:value id} id)))
            (dom/button {:class    "add-tag-action"
                         :on-click add-social-handler}
              "⏎"))
          (dom/button {:class    "clear-all-action fix-float-button"
                       :on-click clear-all-handler}
            "clear all"))))))

(def social-gizmo-descriptor {:id       :social
                              :title    "edit social section"
                              :position :right
                              :content  (partial om/build social-gizmo-component)})
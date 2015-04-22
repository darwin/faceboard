(ns faceboard.views.boards.people.gizmos.name
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.countries :refer [country-names]]
            [faceboard.helpers.gizmos :refer [handler gizmo-form-key-down]]))

(def name-path [:bio :name])
(def nick-path [:bio :nickname])
(def country-path [:bio :country])

(defn commit-name-change [person value]
  (om/update! person name-path value))

(defn handle-nick-change [person value]
  (om/update! person nick-path value))

(defn handle-country-change [person value]
  (om/update! person country-path (if (= value "--") nil value)))

(defn country-list []
  (cons
    ["--" "--- none ---"]
    (sort #(compare (second %) (second %2)) country-names)))

(defcomponent name-gizmo-component [data owner]
  (did-mount [_]
    (let [focus-node (om/get-node owner "focus")]
      (.focus focus-node)
      (.select focus-node)))
  (render [_]
    (let [{:keys [person]} data
          name (get-in person name-path)
          nick (get-in person nick-path)
          country-code (get-in person country-path)]
      (dom/form {:class       "name-country-gizmo"
                 :on-key-down gizmo-form-key-down
                 :on-submit   (fn [e] (.preventDefault e))}
        (dom/div {:class "name-input"}
          (dom/label "Name:"
            (dom/input {:type        "text"
                        :ref         "focus"
                        :value       name
                        :placeholder person/full-name-placeholder
                        :on-change   (handler (partial commit-name-change person))})))
        (dom/div {:class "nick-input"}
          (dom/label "Nickname:"
            (dom/input {:type        "text"
                        :value       nick
                        :placeholder "(optional)"
                        :on-change   (handler (partial handle-nick-change person))})))
        (dom/div {:class "country-select"}
          (dom/label "Country:"
            (dom/select {:value     country-code
                         :on-change (handler (partial handle-country-change person))}
              (for [[code name] (country-list)]
                (dom/option {:value code} name)))))))))

(def name-gizmo-descriptor {:id       :name
                            :title    "edit name and country"
                            :position :left
                            :content  (partial om/build name-gizmo-component)})
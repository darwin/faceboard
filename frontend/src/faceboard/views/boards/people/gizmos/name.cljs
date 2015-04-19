(ns faceboard.views.boards.people.gizmos.name
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.countries :refer [country-names]]
            [faceboard.helpers.gizmos :refer [handler gizmo-form-key-down]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn commit-name-change [person value]
  (om/update! person [:bio :name] value))

(defn handle-nick-change [person value]
  (om/update! person [:bio :nick] value))

(defn handle-country-change [person value]
  (om/update! person [:bio :country] (if (= value "--") nil value)))

(defn country-list []
  (cons
    ["--" "--- none ---"]
    (sort #(compare (second %) (second %2)) country-names)))

(defcomponent name-gizmo-component [data _ _]
  (render [_]
    (let [{:keys [person]} data
          name (get-in person [:bio :name])
          nick (get-in person [:bio :nick])
          country-code (get-in person [:bio :country])]
      (dom/form {:class "name-country-gizmo"
                 :on-key-down gizmo-form-key-down}
        (dom/div {:class "name-input"}
          (dom/label "Name:"
            (dom/input {:type        "text"
                        :value       name
                        :placeholder person/full-name-placeholder
                        :on-change   (handler (partial commit-name-change person))})))
        (dom/div {:class "nick-input"}
          (dom/label "Nick:"
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

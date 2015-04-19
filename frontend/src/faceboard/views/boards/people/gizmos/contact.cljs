(ns faceboard.views.boards.people.gizmos.contact
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.countries :refer [country-names]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn handle-name-change [person e]
  (let [value (.. e -target -value)]
    (om/transact! person [:bio :name] #(do value))))

(defn handle-nick-change [person e]
  (let [value (.. e -target -value)]
    (om/transact! person [:bio :nick] #(do value))))

(defn handle-country-change [person e]
  (let [value (.. e -target -value)]
    (om/transact! person [:bio :country] #(do (if (= value "--") nil value)))))

(defn country-list []
  (cons
    ["--" "--- none ---"]
    (sort #(compare (second %) (second %2)) country-names)))

(defcomponent contact-gizmo-component [data _ _]
  (render [_]
    (let [{:keys [person]} data
          name (get-in person [:bio :name])
          nick (get-in person [:bio :nick])
          country-code (get-in person [:bio :country])]
      (dom/form {:class "contact-gizmo"}
        (dom/div {:class "name-input"}
          (dom/label "Name:"
            (dom/input {:type        "text"
                        :value       name
                        :placeholder person/full-name-placeholder
                        :on-change   (partial handle-name-change person)})))
        (dom/div {:class "nick-input"}
          (dom/label "Nick:"
            (dom/input {:type      "text"
                        :value     nick
                        :placeholder "(optional)"
                        :on-change (partial handle-nick-change person)})))
        (dom/div {:class "country-select"}
          (dom/label "Country:"
            (dom/select {:value     country-code
                         :on-change (partial handle-country-change person)}
              (for [[code name] (country-list)]
                (dom/option {:value code} name)))))))))

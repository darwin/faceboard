(ns faceboard.views.boards.people.gizmos
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn handle-name-change [person e]
  (let [value (.. e -target -value)]
    (om/transact! person [:bio :name] #(do value))))

(defn handle-nick-change [person e]
  (let [value (.. e -target -value)]
    (om/transact! person [:bio :nick] #(do value))))

(defcomponent name-country-gizmo-component [data _ _]
  (render [_]
    (let [{:keys [person]} data
          name (get-in person [:bio :name])
          nick (get-in person [:bio :nick])]
      (dom/div {:class "name-country-gizmo"}
        (dom/div {:class "name-input"}
          (dom/span "Name:")
          (dom/input {:type "text"
                      :value name
                      :placeholder person/full-name-placeholder
                      :on-change (partial handle-name-change person)}))
        (dom/div {:class "nick-input"}
          (dom/span "Nick Name:")
          (dom/input {:type "text"
                      :value nick
                      :on-change (partial handle-nick-change person)}))))))

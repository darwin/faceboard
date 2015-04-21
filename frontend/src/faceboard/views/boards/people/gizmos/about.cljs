(ns faceboard.views.boards.people.gizmos.about
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.gizmos :refer [handler gizmo-form-key-down]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(def about-path [:bio :about])

(defn commit-about-change [person value]
  (om/update! person about-path value))

(defcomponent about-gizmo-component [data owner]
  (did-mount [_]
    (let [focus-node (om/get-node owner "focus")]
      (.focus focus-node)))
  (render [_]
    (let [{:keys [person]} data
          about (get-in person about-path)]
      (dom/form {:class       "about-gizmo"
                 :on-key-down gizmo-form-key-down
                 :on-submit   (fn [e] (.preventDefault e))}
        (dom/div {:class "about-textarea"}
          (dom/label "About:"
            (dom/textarea {:ref         "focus"
                           :value       about
                           :placeholder person/about-placeholder
                           :on-change   (handler (partial commit-about-change person))})))))))

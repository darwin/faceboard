(ns faceboard.views.boards.people.gizmos.photo
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.countries :refer [country-names]]
            [faceboard.helpers.gizmos :refer [handler gizmo-form-key-down]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(def url-path [:bio :photo :url])

(defn commit-url-change [person value]
  (om/update! person url-path value))

(defcomponent photo-gizmo-component [data owner]
  (did-mount [_]
    (let [focus-node (om/get-node owner "focus")]
      (.focus focus-node)
      (.select focus-node)))
  (render [_]
    (let [{:keys [person]} data
          url (get-in person url-path)]
      (dom/form {:class "photo-gizmo"
                 :on-key-down gizmo-form-key-down
                 :on-submit (fn [e] (.preventDefault e))}
        (dom/div {:class "url-input"}
          (dom/label "Photo URL:"
            (dom/input {:type        "text"
                        :ref         "focus"
                        :value       url
                        :placeholder person/photo-url-placeholder
                        :on-change   (handler (partial commit-url-change person))})))))))

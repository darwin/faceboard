(ns faceboard.views.boards.people.gizmos.contact
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.gizmos :refer [handler gizmo-form-key-down]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(def email-path [:bio :email])
(def phone-path [:bio :phone])

(defn commit-email-change [person value]
  (om/update! person email-path value))

(defn handle-phone-change [person value]
  (om/update! person phone-path value))

(defcomponent contact-gizmo-component [data owner]
  (did-mount [_]
    (let [focus-node (om/get-node owner "focus")]
      (.focus focus-node)
      (.select focus-node)))
  (render [_]
    (let [{:keys [person]} data
          email (get-in person email-path)
          phone (get-in person phone-path)]
      (dom/form {:class       "contact-gizmo"
                 :on-key-down gizmo-form-key-down
                 :on-submit   (fn [e] (.preventDefault e))}
        (dom/div {:class "email-input"}
          (dom/label "Email:"
            (dom/input {:type        "text"
                        :ref         "focus"
                        :value       email
                        :placeholder person/email-placeholder
                        :on-change   (handler (partial commit-email-change person))})))
        (dom/div {:class "phone-input"}
          (dom/label "Phone:"
            (dom/input {:type        "text"
                        :value       phone
                        :placeholder "(optional)"
                        :on-change   (handler (partial handle-phone-change person))})))))))

(def contact-gizmo-descriptor {:id       :contact
                               :title    "edit contact section"
                               :position :right
                               :content  (partial om/build contact-gizmo-component)})

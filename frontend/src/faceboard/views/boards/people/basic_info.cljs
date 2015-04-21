(ns faceboard.views.boards.people.basic-info
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.animator :refer [animate anim-phase anim-class]]
            [faceboard.controller :refer [perform!]]
            [faceboard.views.gizmo :refer [gizmo-component]]
            [faceboard.views.boards.people.base :refer [person-card-z-level]]
            [faceboard.views.boards.people.gizmos.name :refer [name-gizmo-component]]
            [faceboard.views.boards.people.gizmos.photo :refer [photo-gizmo-component]]
            [faceboard.views.boards.people.gizmos.about :refer [about-gizmo-component]]
            [faceboard.views.boards.people.gizmos.contact :refer [contact-gizmo-component]]
            [faceboard.views.boards.people.gizmos.tags :refer [tags-gizmo-component]]
            [faceboard.views.boards.people.gizmos.social :refer [social-gizmo-component]]
            [faceboard.views.boards.people.extended-info :refer [extended-info-component]]
            [faceboard.helpers.social :refer [parse-social social-info]]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.utils :refer [non-sanitized-div css-transform]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn has-name? [person]
  (boolean (person/name person)))

(defcomponent basic-info-component [data _ _]
  (render [_]
    (let [{:keys [person people extended? editing? gizmo]} data
          need-name-placeholder? (and editing? (not (has-name? person)))
          name (if need-name-placeholder? person/name-placeholder (person/name person))
          country-code (person/country-code person)
          country-name (person/country-name person)]
      (dom/div {:class (str "person" (when (:hide? data) " hide"))}
        (dom/div {:class "polaroid-frame clearfix"
                  :style (css-transform (str
                                          "rotate(" (person/photo-angle person) "deg)"
                                          "translateX(" (person/photo-displace-x person) "px)"
                                          "translateY(" (person/photo-displace-y person) "px)"
                                          "translateZ(" (person/photo-displace-z person) "px)"))}
          (dom/div {:class "left-part"}
            (dom/div {:class (str "photo-section")}
              (if (and editing? extended?)
                (om/build gizmo-component {:id       :photo
                                           :title    "edit photo"
                                           :position :left
                                           :state    gizmo
                                           :content  (partial om/build photo-gizmo-component {:person person})}))
              (dom/div {:class (str "photo" (when-not (person/photo-has-frame? person) " no-frame"))}
                (dom/img {:src (person/photo-url person)})))
            (dom/div {:class (str "name-section" (if need-name-placeholder? " has-placeholder"))}
              (if (and editing? extended?)
                (om/build gizmo-component {:id       :name
                                           :title    "edit name and country"
                                           :position :left
                                           :state    gizmo
                                           :content  (partial om/build name-gizmo-component {:person person})}))
              (dom/div {:class "name f16"
                        :title (person/full-name person)}
                name
                (if country-code
                  (dom/div {:class (str "flag " country-code)
                            :title country-name})))))
          (when extended?
            (dom/div {:class "right-part"}
              (when (not editing?)
                (dom/div {:class "person-buttons"}
                  (dom/div {:class    "person-edit-button"
                            :title    "edit the card"
                            :on-click (fn [e]
                                        (.stopPropagation e)
                                        (if (.-altKey e)
                                          (perform! :open-editor (om/path person) (.-shiftKey e))
                                          (perform! :toggle-edit)))}
                    (dom/i {:class "fa fa-wrench"}))))
              (om/build extended-info-component {:editing? editing?
                                                 :gizmo    gizmo
                                                 :people   people
                                                 :person   person}))))))))
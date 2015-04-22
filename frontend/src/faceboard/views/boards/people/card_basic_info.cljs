(ns faceboard.views.boards.people.card-basic-info
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.router :refer [embedded?]]
            [faceboard.animator :refer [animate anim-phase anim-class]]
            [faceboard.controller :refer [perform!]]
            [faceboard.views.gizmo :refer [gizmo-component]]
            [faceboard.helpers.people :refer [person-card-z-level]]
            [faceboard.views.boards.people.gizmos.name :refer [name-gizmo-descriptor]]
            [faceboard.views.boards.people.gizmos.photo :refer [photo-gizmo-descriptor]]
            [faceboard.views.boards.people.card-extended-info :refer [card-extended-info-component]]
            [faceboard.views.boards.people.card-controls :refer [card-controls-component]]
            [faceboard.helpers.social :refer [parse-social social-info]]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.utils :refer [swallow css-transform]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn has-name? [person]
  (boolean (person/name person)))

(defn toggle-editing-when-clicked-edit-button [person e]
  (swallow e)
  (if (.-altKey e)
    (perform! :open-editor (om/path person) (.-shiftKey e))
    (perform! :toggle-editing)))

(defcomponent card-basic-info-component [data _ _]
  (render [_]
    (let [{:keys [person people extended? editing? gizmo]} data
          need-name-placeholder? (and editing? (not (has-name? person)))
          name (if need-name-placeholder? person/name-placeholder (person/name person))
          country-code (person/country-code person)
          country-name (person/country-name person)
          polaroid-frame-style (css-transform
                                 (str
                                   "rotate(" (person/photo-angle person) "deg)"
                                   "translateX(" (person/photo-displace-x person) "px)"
                                   "translateY(" (person/photo-displace-y person) "px)"
                                   "translateZ(" (person/photo-displace-z person) "px)"))
          photo-gizmo {:descriptor photo-gizmo-descriptor
                       :state      gizmo
                       :data       {:person person}}
          name-gizmo {:descriptor name-gizmo-descriptor
                      :state      gizmo
                      :data       {:person person}}]
      (dom/div {:class (str "person" (when (:hide? data) " hide"))}
        (dom/div {:class "polaroid-frame clearfix"
                  :style polaroid-frame-style}
          (dom/div {:class "left-part"}
            (dom/div {:class (str "photo-section")}
              (if (and editing? extended?)
                (om/build gizmo-component photo-gizmo))
              (dom/div {:class (str "photo" (when-not (person/photo-has-frame? person) " no-frame"))}
                (dom/img {:src (person/photo-url person)})))
            (dom/div {:class (str "name-section" (if need-name-placeholder? " has-placeholder"))}
              (if (and editing? extended?)
                (om/build gizmo-component name-gizmo))
              (dom/div {:class "name f16"
                        :title (person/full-name person)}
                name
                (if country-code
                  (dom/div {:class (str "flag " country-code)
                            :title country-name})))))
          (when extended?
            (dom/div {:class "right-part"}
              (if editing?
                (om/build card-controls-component {:person   person
                                                   :is-last? (= (count people) 1)})
                (if-not (embedded?)
                  (dom/div {:class "person-buttons"}
                    (dom/div {:class    "person-edit-button"
                              :title    "edit the card"
                              :on-click (partial toggle-editing-when-clicked-edit-button person)}
                      (dom/i {:class "fa fa-wrench"})))))
              (om/build card-extended-info-component {:editing? editing?
                                                      :gizmo    gizmo
                                                      :people   people ; needed for tags gizmo
                                                      :person   person}))))))))
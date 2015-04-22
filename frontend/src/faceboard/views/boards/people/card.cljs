(ns faceboard.views.boards.people.card
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.animator :refer [animate anim-phase anim-class]]
            [faceboard.controller :refer [perform!]]
            [faceboard.shared.anims :as anims]
            [faceboard.router :as router]
            [faceboard.views.gizmo :refer [gizmo-component]]
            [faceboard.helpers.people :refer [person-card-z-level]]
            [faceboard.helpers.gizmos :refer [max-gizmo-width-left max-gizmo-width-right]]
            [faceboard.views.boards.people.gizmos.name :refer [name-gizmo-component]]
            [faceboard.views.boards.people.gizmos.photo :refer [photo-gizmo-component]]
            [faceboard.views.boards.people.gizmos.about :refer [about-gizmo-component]]
            [faceboard.views.boards.people.gizmos.contact :refer [contact-gizmo-component]]
            [faceboard.views.boards.people.gizmos.tags :refer [tags-gizmo-component]]
            [faceboard.views.boards.people.gizmos.social :refer [social-gizmo-component]]
            [faceboard.views.boards.people.card-basic-info :refer [card-basic-info-component]]
            [faceboard.helpers.social :refer [parse-social social-info]]
            [faceboard.helpers.utils :refer [non-sanitized-div css-transform]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn get-current-window-dimensions []
  {:width (.-innerWidth js/window) :height (.-innerHeight js/window)})

(defcomponent card-component [data _]
  (render [_]
    (let [{:keys [person people filtered? editing? gizmo layout]} data
          id (:id person)
          expansion-anim (anims/person-expanding id)
          shrinking-anim (anims/person-shrinking id)
          interactive? (and layout (not filtered?))
          extended? (and
                      (not filtered?)
                      (or (:extended? data) (= (anim-phase shrinking-anim) 0) (= (anim-phase shrinking-anim) 1)))
          window-width (:width (get-current-window-dimensions))
          padding 20
          extended-card-width 480
          cpx (:left layout)
          card-right-edge (+ cpx extended-card-width)
          card-left-edge cpx
          normal-transform #(when layout
                             (let [corr-right (- card-right-edge (- window-width padding))
                                   fixed-cpx-right (if (pos? corr-right) (- cpx corr-right) cpx)
                                   fixed-cpx (if (neg? fixed-cpx-right) padding fixed-cpx-right)]
                               (str
                                 "translateX(" (if extended? fixed-cpx cpx) "px)"
                                 "translateY(" (:top layout) "px)"
                                 "translateZ(" (:z layout) "px)")))
          ; snappy transform is active in editing mode the goal is to keep one card in the center of attention
          ; also moving it left/right to make room for currently opened gizmo
          snappy-transform #(let [left? (and (:active gizmo) (= (:position gizmo) :left))
                                  right? (and (:active gizmo) (= (:position gizmo) :right))
                                  diff-right (- (+ card-right-edge max-gizmo-width-right) (- window-width padding))
                                  diff-left (- card-left-edge max-gizmo-width-left)
                                  posx (cond
                                         right? (if (pos? diff-right) (- cpx diff-right) cpx) ; move card left
                                         left? (if (neg? diff-left) (- cpx diff-left) cpx) ; move card right
                                         :else cpx)]        ; center card horizontally
                             (str
                               "translateX(" (.round js/Math posx) "px)"
                               "translateY(" (:top layout) "px)"
                               "translateZ(" (- person-card-z-level) "px)"))
          zoom-transform #(when layout
                           (css-transform
                             (str
                               "translateZ(" (if extended? person-card-z-level 0) "px)")))
          transform (css-transform (if (and extended? editing?) (snappy-transform) (normal-transform)))]
      (dom/div {:class     (str "person-card"
                             (when layout " has-layout")
                             (anim-class expansion-anim " expanding")
                             (anim-class shrinking-anim " shrinking")
                             (when extended? " extended")
                             (when (:extended? data) " top-z")
                             (if filtered? " filtered" " expandable"))
                :style     transform
                :data-fbid id
                :on-click  (when interactive?
                             (fn [e]
                               (.stopPropagation e)
                               (if-not editing?
                                 (router/switch-person (if-not extended? id nil))
                                 (perform! :toggle-gizmo))))}
        (dom/div {:class (str "person-card-zoom")
                  :style (zoom-transform)}
          (when layout
            (dom/div {:class "person-extended-wrapper"}
              (om/build card-basic-info-component {:hide?     (not extended?)
                                                   :extended? extended?
                                                   :editing?  editing?
                                                   :gizmo     gizmo
                                                   :id        id
                                                   :people    people
                                                   :person    person})))
          (dom/div {:class "person-essentials-wrapper"}
            (om/build card-basic-info-component {:hide?  extended? ; acts as a hidden placeholder when extended
                                                 :id     id
                                                 :person person})))))))
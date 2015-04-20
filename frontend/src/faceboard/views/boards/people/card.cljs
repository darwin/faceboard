(ns faceboard.views.boards.people.card
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.animator :refer [animate anim-phase anim-class]]
            [faceboard.controller :refer [perform!]]
            [faceboard.shared.anims :as anims]
            [faceboard.router :as router]
            [faceboard.views.gizmo :refer [gizmo-component]]
            [faceboard.views.boards.people.base :refer [person-card-z-level]]
            [faceboard.views.boards.people.gizmos.name :refer [name-gizmo-component]]
            [faceboard.views.boards.people.gizmos.photo :refer [photo-gizmo-component]]
            [faceboard.views.boards.people.gizmos.about :refer [about-gizmo-component]]
            [faceboard.views.boards.people.gizmos.contact :refer [contact-gizmo-component]]
            [faceboard.views.boards.people.gizmos.tags :refer [tags-gizmo-component]]
            [faceboard.views.boards.people.gizmos.social :refer [social-gizmo-component]]
            [faceboard.helpers.social :refer [parse-social social-info]]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.utils :refer [non-sanitized-div css-transform]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn has-name? [person]
  (boolean (person/name person)))

(defn has-about? [person]
  (boolean (person/about person)))

(defn has-contact? [person]
  (boolean (or (person/email person) (person/phone person))))

(defn has-tags? [person]
  (not (zero? (count (person/tags person)))))

(defn has-socials? [person]
  (not (zero? (count (person/socials person)))))

(defcomponent social-section-item-component [data _ _]
  (render [_]
    (let [{:keys [type label content icon url]} (social-info data)]
      (dom/div {:class (str "social-item" (if type (str " " type) " link"))}
        (dom/a {:href url}
          (dom/i {:class (str "icon fa " icon)
                  :title (when type (str content " @ " label))})
          (dom/span {:class "content"} (str " " content)))))))

(defcomponent tags-section-item-component [data _ _]
  (render [_]
    (let [tag data]
      (dom/span {:class "tags-item"} tag))))

(defcomponent about-section-component [data _ _]
  (render [_]
    (let [{:keys [person editing? gizmo]} data
          need-placeholder? (not (has-about? person))
          about (if need-placeholder? person/about-placeholder (person/about person))]
      (dom/div {:class (str "extended-info-section about clearfix" (if need-placeholder? " has-placeholder"))}
        (if editing?
          (om/build gizmo-component {:id       :about
                                     :title    "edit about section"
                                     :position :right
                                     :state    gizmo
                                     :content  (partial om/build about-gizmo-component {:person person})}))
        (dom/div {:class "info-title"} "about")
        (dom/div {:class "info-body"}
          (non-sanitized-div about))))))

(defcomponent contact-section-component [data _ _]
  (render [_]
    (let [{:keys [person editing? gizmo]} data
          need-placeholder? (not (has-contact? person))
          phone (if need-placeholder? person/phone-placeholder (person/phone person))
          email (if need-placeholder? person/email-placeholder (person/email person))]
      (dom/div {:class (str "extended-info-section contact clearfix" (if need-placeholder? " has-placeholder"))}
        (if editing?
          (om/build gizmo-component {:id       :contact
                                     :title    "edit contact section"
                                     :position :right
                                     :state    gizmo
                                     :content  (partial om/build contact-gizmo-component {:person person})}))
        (dom/div {:class "info-title"} "contact")
        (dom/div {:class "info-body"}
          (when email
            (dom/div {:class "email"}
              (dom/a {:href (str "mailto:" email)} email)))
          (when phone
            (dom/div {:class "phone"}
              (dom/span {} "phone: ")
              (dom/span {:class "number"} phone))))))))

(defcomponent tags-section-component [data _ _]
  (render [_]
    (let [{:keys [person editing? gizmo]} data
          need-placeholder? (not (has-tags? person))
          tags (if need-placeholder? person/tags-placeholder (person/tags person))]
      (dom/div {:class (str "extended-info-section tags clearfix" (if need-placeholder? " has-placeholder"))}
        (if editing?
          (om/build gizmo-component {:id       :tags
                                     :title    "edit interests section"
                                     :position :right
                                     :state    gizmo
                                     :content  (partial om/build tags-gizmo-component {:person person})}))
        (dom/div {:class "info-title"} "interests")
        (dom/div {:class "info-body"}
          (om/build-all tags-section-item-component tags))))))

(defcomponent social-section-component [data _ _]
  (render [_]
    (let [{:keys [person editing? gizmo]} data
          need-placeholder? (not (has-socials? person))
          socials (if need-placeholder? person/socials-placeholder (person/socials person))]
      (dom/div {:class (str "extended-info-section social clearfix" (if need-placeholder? " has-placeholder"))}
        (if editing?
          (om/build gizmo-component {:id       :social
                                     :title    "edit social section"
                                     :position :right
                                     :state    gizmo
                                     :content  (partial om/build social-gizmo-component {:person person})}))
        (dom/div {:class "info-title"} "social")
        (dom/div {:class "info-body"}
          (om/build-all social-section-item-component socials))))))

(defcomponent person-extended-info-component [data _ _]
  (render [_]
    (let [{:keys [editing? person]} data]
      (dom/div {:class "person-extended-info"}
        (if (or editing? (has-about? person))
          (om/build about-section-component data))
        (if (or editing? (has-contact? person))
          (om/build contact-section-component data))
        (if (or editing? (has-tags? person))
          (om/build tags-section-component data))
        (if (or editing? (has-socials? person))
          (om/build social-section-component data))))))

(defcomponent person-info-component [data _ _]
  (render [_]
    (let [{:keys [person extended? editing? gizmo]} data
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
              (dom/div {:class    "person-edit-button"
                        :title    "edit the card"
                        :on-click (fn [e]
                                    (.stopPropagation e)
                                    (if (.-altKey e)
                                      (perform! :open-editor (om/path person) (.-shiftKey e))
                                      (perform! :toggle-edit)))}
                (dom/i {:class "fa fa-edit"}))
              (om/build person-extended-info-component {:editing? editing?
                                                        :gizmo    gizmo
                                                        :person   person}))))))))

(defn get-current-scroll-position []
  (if-let [contents-node (.item (.getElementsByClassName js/document "tab-contents") 0)]
    {:top (.-scrollTop contents-node) :left (.-scrollLeft contents-node)}
    {:top 0 :left 0}))

(defn get-current-window-dimensions []
  {:width (.-innerWidth js/window) :height (.-innerHeight js/window)})

(defcomponent person-component [data _]
  (render [_]
    (let [{:keys [person filtered? editing? gizmo layout]} data
          id (:id person)
          expansion-anim (anims/person-expanding id)
          shrinking-anim (anims/person-shrinking id)
          interactive? (and layout (not filtered?))
          extended? (and
                      (not filtered?)
                      (or (:extended? data) (= (anim-phase shrinking-anim) 0) (= (anim-phase shrinking-anim) 1)))
          normal-transform #(when layout
                             (str
                               "translateX(" (:left layout) "px)"
                               "translateY(" (:top layout) "px)"
                               "translateZ(" (:z layout) "px)"))
          ; snappy transform is active in editing mode the goal is to keep one card in the center of attention
          ; also moving it left/right to make room for currently opened gizmo
          snappy-transform #(let [card-width 480
                                  scroll-top (:top (get-current-scroll-position))
                                  window-width (:width (get-current-window-dimensions))
                                  left? (and (:active gizmo) (= (:position gizmo) :left))
                                  right? (and (:active gizmo) (= (:position gizmo) :right))
                                  left-padding 20
                                  top-padding 40
                                  posx (cond
                                         right? left-padding     ; move card left
                                         left? (- window-width (+ card-width left-padding)) ; move card to the right
                                         :else (.round js/Math (/ (- window-width card-width) 2)))] ; center card horizontally
                             (str
                               "translateX(" posx "px)"
                               "translateY(" (+ scroll-top top-padding) "px)"
                               "translateZ(" (- person-card-z-level) "px)"))
          zoom-transform (when layout
                           (str
                             "translateZ(" (if extended? person-card-z-level 0) "px)"))]
      (dom/div {:class     (str "person-card"
                             (when layout " has-layout")
                             (anim-class expansion-anim " expanding")
                             (anim-class shrinking-anim " shrinking")
                             (when extended? " extended")
                             (when (:extended? data) " top-z")
                             (if filtered? " filtered" " expandable"))
                :style     (css-transform (if (and extended? editing?) (snappy-transform) (normal-transform)))
                :data-fbid id
                :on-click  (when interactive?
                             (fn [e]
                               (.stopPropagation e)
                               (if-not editing?
                                 (router/switch-person (if-not extended? id nil)))))}
        (dom/div {:class (str "person-card-zoom")
                  :style (css-transform zoom-transform)}
          (when layout
            (dom/div {:class "person-extended-wrapper"}
              (om/build person-info-component {:hide?     (not extended?)
                                               :extended? extended?
                                               :editing?  editing?
                                               :gizmo     gizmo
                                               :id        id
                                               :person    person})))
          (dom/div {:class "person-essentials-wrapper"}
            (om/build person-info-component {:hide?  extended? ; acts as a hidden placeholder when extended
                                             :id     id
                                             :person person})))))))
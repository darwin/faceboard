(ns faceboard.views.boards.people.card
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.animator :refer [animate anim-phase anim-class]]
            [faceboard.controller :refer [perform!]]
            [faceboard.shared.anims :as anims]
            [faceboard.router :as router]
            [faceboard.views.boards.people.base :refer [person-card-z-level]]
            [faceboard.helpers.social :refer [parse-social social-info]]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.utils :refer [non-sanitized-div css-transform]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent social-section-item-component [data _ _]
  (render [_]
    (let [{:keys [type label content icon url]} (social-info data)]
      (dom/div {:class (str "social-item" (if type (str " " type) " link"))}
        (dom/a {:href url}
          (dom/i {:class (str "icon fa " icon)
                  :title (when type (str content " @ " label))})
          (dom/span {:class "content"} (str " " content)))))))

(defcomponent social-section-component [data _ _]
  (render [_]
    (dom/div {:class "extended-info-section social clearfix"}
      (dom/div {:class "info-title"} "social")
      (om/build-all social-section-item-component data))))

(defcomponent tags-section-item-component [data _ _]
  (render [_]
    (let [tag data]
      (dom/span {:class "tags-item"} tag))))

(defcomponent tags-section-component [data _ _]
  (render [_]
    (dom/div {:class "extended-info-section tags clearfix"}
      (dom/div {:class "info-title"} "interests")
      (om/build-all tags-section-item-component data))))

(defcomponent about-section-component [data _ _]
  (render [_]
    (dom/div {:class "extended-info-section about clearfix"}
      (dom/div {:class "info-title"} "about")
      (non-sanitized-div (:about data)))))

(defcomponent contact-section-component [data _ _]
  (render [_]
    (let [{:keys [phone email]} data]
      (dom/div {:class "extended-info-section contact clearfix"}
        (dom/div {:class "info-title"} "contact")
        (when email
          (dom/div {:class "email"}
            (dom/a {:href (str "mailto:" email)} email)))
        (when phone
          (dom/div {:class "phone"}
            (dom/span {} "phone: ")
            (dom/span {:class "number"} phone)))))))

(defcomponent person-extended-info-component [data _ _]
  (render [_]
    (let [{:keys [bio social tags]} data]
      (dom/div {:class "person-extended-info"}
        (when (:about bio)
          (om/build about-section-component bio))
        (when (or (:email bio) (:phone bio))
          (om/build contact-section-component bio))
        (when (and tags (> (count tags) 0))
          (om/build tags-section-component tags))
        (when (and social (> (count social) 0))
          (om/build social-section-component social))))))

(defcomponent person-info-component [data _ _]
  (render [_]
    (let [{:keys [person extended?]} data
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
            (dom/div {:class (str "photo" (when-not (person/photo-has-frame? person) " no-frame"))}
              (dom/img {:src (person/photo-url person)}))
            (dom/div {:class "name f16"
                      :title (person/full-name person)}
              (person/name person)
              (when-not (nil? country-code)
                (dom/div {:class (str "flag " country-code)
                          :title country-name}))))
          (when extended?
            (dom/div {:class "right-part"}
              (dom/div {:class    "person-edit-button"
                        :title    "edit the card"
                        :on-click (fn [e]
                                    (.stopPropagation e)
                                    (perform! :open-editor (om/path person) (.-shiftKey e)))}
                (dom/i {:class "fa fa-cog"}))
              (om/build person-extended-info-component person))))))))

(defcomponent person-component [data _ _]
  (render [_]
    (let [{:keys [person filtered? layout]} data
          id (:id person)
          expansion-anim (anims/person-expanding id)
          shrinking-anim (anims/person-shrinking id)
          interactive? (and layout (not filtered?))
          extended? (and
                      (not filtered?)
                      (or (:extended? data) (= (anim-phase shrinking-anim) 0) (= (anim-phase shrinking-anim) 1)))
          transform (when layout
                      (str
                        "translateX(" (:left layout) "px)"
                        "translateY(" (:top layout) "px)"
                        "translateZ(" (:z layout) "px)"))
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
                :style     (css-transform transform)
                :data-fbid id
                :on-click  (when interactive?
                             (fn [e]
                               (.stopPropagation e)
                               (router/switch-person (if-not extended? id nil))))}
        (dom/div {:class (str "person-card-zoom")
                  :style (css-transform zoom-transform)}
          (when layout
            (dom/div {:class "person-extended-wrapper"}
              (om/build person-info-component {:hide?     (not extended?)
                                               :extended? extended?
                                               :id        id
                                               :person    person})))
          (dom/div {:class "person-essentials-wrapper"}
            (om/build person-info-component {:hide?  extended? ; acts as a hidden placeholder when extended
                                             :id     id
                                             :person person})))))))
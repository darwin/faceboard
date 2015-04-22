(ns faceboard.views.boards.people.card-extended-info
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.animator :refer [animate anim-phase anim-class]]
            [faceboard.controller :refer [perform!]]
            [faceboard.views.gizmo :refer [gizmo-component]]
            [faceboard.helpers.people :refer [person-card-z-level]]
            [faceboard.views.boards.people.gizmos.about :refer [about-gizmo-descriptor]]
            [faceboard.views.boards.people.gizmos.contact :refer [contact-gizmo-descriptor]]
            [faceboard.views.boards.people.gizmos.tags :refer [tags-gizmo-descriptor]]
            [faceboard.views.boards.people.gizmos.social :refer [social-gizmo-descriptor]]
            [faceboard.helpers.social :refer [parse-social social-info]]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.utils :refer [non-sanitized-div]]
            [cuerdas.core :as str]))

(defn has-about? [person]
  (boolean (person/about person)))

(defn has-contact? [person]
  (boolean (or (person/email person) (person/phone person))))

(defn has-tags? [person]
  (not (zero? (count (person/tags person)))))

(defn has-socials? [person]
  (not (zero? (count (person/socials person)))))

(defn sort-social-icons-first [socials]
  (let [has-icon? #(str/contains? % "|")
        priority #(if (has-icon? %) 0 1)]
    (sort #(compare (priority %) (priority %2)) socials)))

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
          about (if need-placeholder? person/about-placeholder (person/about person))
          about-gizmo {:descriptor about-gizmo-descriptor
                       :state      gizmo
                       :data       {:person person}}]
      (dom/div {:class (str "extended-info-section about clearfix" (if need-placeholder? " has-placeholder"))}
        (if editing?
          (om/build gizmo-component about-gizmo))
        (dom/div {:class "info-title"} "about")
        (dom/div {:class "info-body"}
          (non-sanitized-div about))))))

(defcomponent contact-section-component [data _ _]
  (render [_]
    (let [{:keys [person editing? gizmo]} data
          need-placeholder? (not (has-contact? person))
          phone (if need-placeholder? person/phone-placeholder (person/phone person))
          email (if need-placeholder? person/email-placeholder (person/email person))
          contact-gizmo {:descriptor contact-gizmo-descriptor
                         :state      gizmo
                         :data       {:person person}}]
      (dom/div {:class (str "extended-info-section contact clearfix" (if need-placeholder? " has-placeholder"))}
        (if editing?
          (om/build gizmo-component contact-gizmo))
        (dom/div {:class "info-title"} "contact")
        (dom/div {:class "info-body"}
          (if email
            (dom/div {:class "email"}
              (dom/a {:href (str "mailto:" email)} email)))
          (if phone
            (dom/div {:class "phone"}
              (dom/span {} "phone: ")
              (dom/span {:class "number"} phone))))))))

(defcomponent tags-section-component [data _ _]
  (render [_]
    (let [{:keys [person people editing? gizmo]} data
          need-placeholder? (not (has-tags? person))
          tags (if need-placeholder? person/tags-placeholder (person/tags person))
          tags-gizmo {:descriptor tags-gizmo-descriptor
                      :state      gizmo
                      :data       {:person person
                                   :people people}}]
      (dom/div {:class (str "extended-info-section tags clearfix" (if need-placeholder? " has-placeholder"))}
        (if editing?
          (om/build gizmo-component tags-gizmo))
        (dom/div {:class "info-title"} "interests")
        (dom/div {:class "info-body"}
          (om/build-all tags-section-item-component tags))))))

(defcomponent social-section-component [data _ _]
  (render [_]
    (let [{:keys [person editing? gizmo]} data
          need-placeholder? (not (has-socials? person))
          socials (if need-placeholder? person/socials-placeholder (sort-social-icons-first (person/socials person)))
          social-gizmo {:descriptor social-gizmo-descriptor
                        :state      gizmo
                        :data       {:person person}}]
      (dom/div {:class (str "extended-info-section social clearfix" (if need-placeholder? " has-placeholder"))}
        (if editing?
          (om/build gizmo-component social-gizmo))
        (dom/div {:class "info-title"} "social")
        (dom/div {:class "info-body"}
          (om/build-all social-section-item-component socials))))))

(defcomponent card-extended-info-component [data _ _]
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
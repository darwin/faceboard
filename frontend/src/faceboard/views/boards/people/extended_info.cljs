(ns faceboard.views.boards.people.extended-info
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
            [faceboard.helpers.social :refer [parse-social social-info]]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.utils :refer [non-sanitized-div css-transform]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [cuerdas.core :as str]))

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
    (let [{:keys [person people editing? gizmo]} data
          need-placeholder? (not (has-tags? person))
          tags (if need-placeholder? person/tags-placeholder (person/tags person))]
      (dom/div {:class (str "extended-info-section tags clearfix" (if need-placeholder? " has-placeholder"))}
        (if editing?
          (om/build gizmo-component {:id       :tags
                                     :title    "edit interests section"
                                     :position :right
                                     :state    gizmo
                                     :content  (partial om/build tags-gizmo-component {:person person
                                                                                       :people people})}))
        (dom/div {:class "info-title"} "interests")
        (dom/div {:class "info-body"}
          (om/build-all tags-section-item-component tags))))))

(defn has-icon? [social]
  (if (str/contains? social "|") 0 1))

(defn sort-social-icons-first [socials]
  (sort #(compare (has-icon? %) (has-icon? %2)) socials))

(defcomponent social-section-component [data _ _]
  (render [_]
    (let [{:keys [person editing? gizmo]} data
          need-placeholder? (not (has-socials? person))
          socials (if need-placeholder? person/socials-placeholder (sort-social-icons-first (person/socials person)))]
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

(defcomponent extended-info-component [data _ _]
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
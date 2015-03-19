(ns faceboard.views.boards.people
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.animator :refer [animate anim-phase anim-class]]
            [faceboard.controller :refer [perform!]]
            [faceboard.shared.anims :as anims]
            [faceboard.helpers.social :refer [parse-social social-info]]
            [faceboard.helpers.countries :refer [lookup-country-name]]
            [faceboard.helpers.utils :refer [non-sanitized-div]]
            [faceboard.helpers.filters :refer [build-countries-tally build-tags-tally]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [cemerick.pprng]))

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
    (dom/div {:class "extended-info-section social"}
      (dom/div {:class "info-title"} "social")
      (om/build-all social-section-item-component data)
      (dom/div {:class "clear"}))))

(defcomponent tags-section-item-component [data _ _]
  (render [_]
    (let [tag data]
      (dom/span {:class "tags-item"}
        tag))))

(defcomponent tags-section-component [data _ _]
  (render [_]
    (dom/div {:class "extended-info-section tags"}
      (dom/div {:class "info-title"} "interests")
      (om/build-all tags-section-item-component data)
      (dom/div {:class "clear"}))))

(defcomponent about-section-component [data _ _]
  (render [_]
    (dom/div {:class "extended-info-section about"}
      (dom/div {:class "info-title"} "about")
      (non-sanitized-div (:about data))
      (dom/div {:class "clear"}))))

(defcomponent contact-section-component [data _ _]
  (render [_]
    (let [{:keys [phone email]} data]
      (dom/div {:class "extended-info-section contact"}
        (dom/div {:class "info-title"} "contact")
        (when email
          (dom/div {:class "email"}
            (dom/a {:href (str "mailto:" email)} email)))
        (when phone
          (dom/div {:class "phone"}
            (dom/span {} "phone: ")
            (dom/span {:class "number"} phone)))
        (dom/div {:class "clear"})))))

(defcomponent person-extended-info-component [data _ _]
  (render [_]
    (let [{:keys [bio social tags]} data]
      (dom/div {:class "person-extended-info"}
        (when (:about bio)
          (om/build about-section-component bio))
        (when (or (:email bio) (:phone bio))
          (om/build contact-section-component bio))
        (when (and social (> (count social) 0))
          (om/build social-section-component social))
        (when (and tags (> (count tags) 0))
          (om/build tags-section-component tags))))))

(defcomponent person-info-component [data _ _]
  (render [_]
    (let [person (:person data)
          bio (:bio person)
          id (:id data)
          extended? (:extended? data)
          random-generator (cemerick.pprng/rng (hash id))
          angle (- (cemerick.pprng/int random-generator 20) 10)
          country-code (:country bio)
          country-name (lookup-country-name country-code)]
      (dom/div {:class (str "person" (when (:hide? data) " hide"))}
        (dom/div {:class "polaroid-frame"
                  :style {:transform (str "rotate(" angle "deg)")}}
          (dom/div {:class "left-part"}
            (dom/div {:class "photo"}
              (dom/img {:src (or (get-in bio [:photo :url] nil) "/images/unknown.jpg")}))
            (dom/div {:class "name f16"
                      :title (:full-name bio)}
              (:name bio)
              (when-not (nil? country-code)
                (dom/div {:class (str "flag " country-code)
                          :title country-name}))))
          (when extended?
            (dom/div {:class "right-part"}
              (om/build person-extended-info-component person)))
          (dom/div {:class "clear"}))))))

(defcomponent person-component [data _ _]
  (render [_]
    (let [person (:person data)
          index (:index data)
          id (:id person)
          expansion-anim (anims/person-expanding index)
          shrinking-anim (anims/person-shrinking index)
          extended? (or (:extended? data) (= (anim-phase shrinking-anim) 0) (= (anim-phase shrinking-anim) 1))]
      (dom/div {:class    (str "person-box"
                            (anim-class expansion-anim " expanding")
                            (anim-class shrinking-anim " shrinking")
                            (when extended? " extended"))
                :on-click (fn [e]
                            (.stopPropagation e)
                            (perform! :change-extended-set (if-not extended? (set [index]) #{})))}
        (dom/div {:class "person-extended-wrapper"}
          (om/build person-info-component {:hide?     (not extended?)
                                           :extended? extended?
                                           :id        id
                                           :person    person}))
        (dom/div {:class "person-essentials-wrapper"}
          (om/build person-info-component {:hide?  extended? ; acts as a hidden placeholder when extended
                                           :id     id
                                           :person person}))))))

(defcomponent countries-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [country-code report]} data
          country-name (lookup-country-name country-code)
          count (:count report)]
      (dom/div {:class "countries-filter-item f16"}
        (dom/div {:class "countries-filter-item-body"}
          (when-not (nil? country-code)
            (dom/span {:class (str "flag " country-code) :title country-name}))
          (dom/span {:class "country"} country-name)
          (dom/span {:class "count"} (str "(" count "x)")))))))

(defcomponent countries-filter-component [data _ _]
  (render [_]
    (let [people (:content data)
          countries-tally (build-countries-tally people)
          sorted-countries (:countries-by-size countries-tally)]
      (dom/div {:class "countries-filter-wrapper"}
        (when (> (count sorted-countries) 1)
          (dom/div {:class "countries-filter filter-section"}
            (dom/div {:class "filter-section-label"
                      :title "filtering by country"}
              "countries"
              (dom/span {:class "fa fa-filter"}))
            (dom/div {:class "filter-section-body"}
              (for [country-code sorted-countries]
                (let [report (get-in countries-tally [:tally country-code])]
                  (om/build countries-filter-item-component {:country-code country-code
                                                             :report       report}))))))))))

(defcomponent tags-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [tag report]} data
          count (:count report)]
      (dom/div {:class "tags-filter-item f16"}
        (dom/span {:class "tag"
                   :title (str "(" count "x)")} tag)))))

(defcomponent tags-filter-component [data _ _]
  (render [_]
    (let [people (:content data)
          tags-tally (build-tags-tally people)
          sorted-tags (:tags-by-size tags-tally)]
      (dom/div {:class "tags-filter-wrapper"}
        (when (> (count sorted-tags) 0)
          (dom/div {:class "tags-filter filter-section"}
            (dom/div {:class "filter-section-label"
                      :title "filtering by interest"}
              "interests"
              (dom/span {:class "fa fa-filter"}))
            (dom/div {:class "filter-section-body"}
              (for [tag sorted-tags]
                (let [report (get-in tags-tally [:tally tag])]
                  (om/build tags-filter-item-component {:tag    tag
                                                        :report report}))))))))))

(defcomponent filters-component [data _ _]
  (render [_]
    (dom/div {:class "people-filters no-select"}
      (om/build countries-filter-component data)
      (om/build tags-filter-component data))))

(defcomponent people-component [data _ _]
  (render [_]
    (let [{:keys [ui anims]} data
          people (:content data)
          sorted-people (sort #(compare (get-in %1 [:bio :name]) (get-in %2 [:bio :name])) people)
          extended-set (:extended-set ui)]
      (dom/div {:class "clearfix no-select"}
        (om/build filters-component data)
        (dom/div {:class "people-desk clearfix"}
          (for [i (range (count sorted-people))]
            (let [person (nth sorted-people i)
                  data {:person    person
                        :extended? (contains? extended-set i)
                        :anim      (:person anims)
                        :index     i}]
              (om/build person-component data))))))))
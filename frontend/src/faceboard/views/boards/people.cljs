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
            [faceboard.helpers.filters.countries :refer [build-countries-tally countries-filter-predicate]]
            [faceboard.helpers.filters.tags :refer [build-tags-tally tags-filter-predicate]]
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
    (let [{:keys [person id extended?]} data
          bio (:bio person)
          random-generator (cemerick.pprng/rng (hash id))
          angle (or (get-in bio [:photo :angle]) (- (cemerick.pprng/int random-generator 20) 10))
          country-code (:country bio)
          country-name (lookup-country-name country-code)
          photo-rotation (str "rotate(" angle "deg)")]
      (dom/div {:class (str "person" (when (:hide? data) " hide"))}
        (dom/div {:class "polaroid-frame"
                  :style {:transform         photo-rotation
                          :-webkit-transform photo-rotation ; TODO: solve this prefixing hell somehow
                          :-moz-transform    photo-rotation
                          :-ms-transform     photo-rotation}}
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
    (let [{:keys [person filtered?]} data
          id (:id person)
          expansion-anim (anims/person-expanding id)
          shrinking-anim (anims/person-shrinking id)
          extended? (and
                      (not filtered?)
                      (or (:extended? data) (= (anim-phase shrinking-anim) 0) (= (anim-phase shrinking-anim) 1)))]
      (dom/div {:class    (str "person-box"
                            (anim-class expansion-anim " expanding")
                            (anim-class shrinking-anim " shrinking")
                            (when extended? " extended")
                            (if filtered? " filtered" " expandable"))
                :on-click (fn [e]
                            (.stopPropagation e)
                            (perform! :change-extended-set (if-not extended? #{id} #{})))}
        (dom/div {:class "person-extended-wrapper"}
          (om/build person-info-component {:hide?     (not extended?)
                                           :extended? extended?
                                           :id        id
                                           :person    person}))
        (dom/div {:class "person-essentials-wrapper"}
          (om/build person-info-component {:hide?  extended? ; acts as a hidden placeholder when extended
                                           :id     id
                                           :person person}))))))

(defcomponent filter-section-label-component [data _ _]
  (render [_]
    (let [{:keys [expanded? key label title]} data]
      (dom/div {:class    (str "filter-section-label " (name key) "-filter-section-label")
                :title    (or title (str "filtering by " label))
                :on-click #(perform! :toggle-filter-expansion key)}
        (dom/span {:class (str "fa " (if expanded? "fa-arrow-circle-down" "fa-arrow-circle-right"))})
        (dom/span label)
        (dom/span {:class "fa fa-filter"})))))

(defcomponent countries-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [country-code report selected?]} data
          country-name (lookup-country-name country-code)
          count (:count report)]
      (dom/div {:class    (str "countries-filter-item f16" (when selected? " selected"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-country :filter-select-country) country-code)}
        (dom/div {:class "countries-filter-item-body"}
          (when-not (nil? country-code)
            (dom/span {:class (str "flag " country-code) :title country-name}))
          (dom/span {:class "country"} country-name)
          (dom/span {:class "count"} (str "(" count "x)")))))))

(defcomponent tags-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [tag report selected?]} data
          count (:count report)]
      (dom/div {:class    (str "tags-filter-item f16" (when selected? " selected"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-tag :filter-select-tag) tag)}
        (dom/span {:class "tag"
                   :title (str "(" count "x)")} tag)))))

(defcomponent countries-filter-component [data _ _]
  (render [_]
    (let [people (:content data)
          expanded-filters (get-in data [:ui :filters :expanded-set])
          expanded? (contains? expanded-filters :countries)
          selected-countries (get-in data [:ui :filters :active :countries])
          countries-tally (build-countries-tally people)
          sorted-countries (:countries-by-size countries-tally)]
      (dom/div {:class "countries-filter-wrapper"}
        (when (> (count sorted-countries) 1)
          (dom/div {:class "countries-filter filter-section"}
            (om/build filter-section-label-component {:key       :countries
                                                      :expanded? expanded?
                                                      :label     "countries"})
            (dom/div {:class (str "filter-section-body" (when expanded? " expanded"))}
              (for [country-code sorted-countries]
                (let [report (get-in countries-tally [:tally country-code])
                      selected? (contains? selected-countries country-code)]
                  (om/build countries-filter-item-component {:country-code country-code
                                                             :selected?    selected?
                                                             :report       report}))))))))))
(defcomponent tags-filter-component [data _ _]
  (render [_]
    (let [people (:content data)
          expanded? (contains? (get-in data [:ui :filters :expanded-set]) :interests)
          tags-tally (build-tags-tally people)
          selected-tags (get-in data [:ui :filters :active :tags])
          sorted-tags (:tags-by-size tags-tally)]
      (dom/div {:class "tags-filter-wrapper"}
        (when (> (count sorted-tags) 0)
          (dom/div {:class "tags-filter filter-section"}
            (om/build filter-section-label-component {:key       :interests
                                                      :expanded? expanded?
                                                      :label     "interests"})
            (dom/div {:class (str "filter-section-body" (when expanded? " expanded"))}
              (for [tag sorted-tags]
                (let [report (get-in tags-tally [:tally tag])
                      selected? (contains? selected-tags tag)]
                  (om/build tags-filter-item-component {:tag       tag
                                                        :selected? selected?
                                                        :report    report}))))))))))

(defcomponent filters-component [data _ _]
  (render [_]
    (dom/div {:class    "people-filters no-select"
              :on-click #(.stopPropagation %)}
      (om/build countries-filter-component data)
      (om/build tags-filter-component data))))

(defn build-countries-filter-predicate [active-filters]
  (if-let [active-countries (:countries active-filters)]
    (when-not (empty? active-countries)
      (partial countries-filter-predicate active-countries))))

(defn build-tags-filter-predicate [active-filters]
  (if-let [active-tags (:tags active-filters)]
    (when-not (empty? active-tags)
      (partial tags-filter-predicate active-tags))))

(defn build-filter-predicates [active-filters]
  (let [predicates [(build-countries-filter-predicate active-filters)
                    (build-tags-filter-predicate active-filters)]]
    (remove nil? predicates)))

(defcomponent people-component [data _ _]
  (render [_]
    (let [{:keys [ui anims]} data
          people (:content data)
          sorted-people (sort #(compare (get-in %1 [:bio :name]) (get-in %2 [:bio :name])) people)
          extended-set (:extended-set ui)
          active-filters (get-in ui [:filters :active])
          filter-predicates (build-filter-predicates active-filters)
          sorted-people-with-filter-status (map (fn [person] (hash-map :person person :filtered? (not (every? true? (map #(% person) filter-predicates))))) sorted-people)
          sorted-people-ordered-by-filter (sort-by :filtered? sorted-people-with-filter-status)]
      (dom/div {:class "clearfix no-select"}
        (om/build filters-component data)
        (dom/div {:class "people-desk clearfix"}
          (for [item sorted-people-ordered-by-filter]
            (let [person (:person item)
                  data {:person    person
                        :extended? (contains? extended-set (:id person))
                        :filtered? (:filtered? item)
                        :anim      (:person anims)}]
              (om/build person-component data))))))))
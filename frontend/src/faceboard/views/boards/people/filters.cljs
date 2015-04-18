(ns faceboard.views.boards.people.filters
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.views.boards.people.base :refer [is-person-filtered?]]
            [faceboard.helpers.social :refer [parse-social social-info]]
            [faceboard.helpers.countries :refer [lookup-country-name]]
            [faceboard.helpers.utils :refer [non-sanitized-div css-transform]]
            [faceboard.helpers.filters.groups :refer [build-groups-tally groups-filter-predicate]]
            [faceboard.helpers.filters.countries :refer [build-countries-tally countries-filter-predicate]]
            [faceboard.helpers.filters.tags :refer [build-tags-tally tags-filter-predicate]]
            [faceboard.helpers.filters.social :refer [build-socials-tally socials-filter-predicate]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent filter-section-label-component [data _ _]
  (render [_]
    (let [{:keys [expanded? active? key label title]} data]
      (dom/div {:class    (str "filter-section-label " (name key) "-filter-section-label" (when active? " active-filter"))
                :title    (or title (str "filtering by " label))
                :on-click #(perform! :toggle-filter-expansion key)}
        (dom/span {:class (str "fa" (if expanded? " fa-arrow-circle-down" " fa-arrow-circle-right"))})
        (dom/span label)
        (dom/span {:class "fa fa-filter"})
        (when active?
          (dom/span {:class    "filter-clear"
                     :on-click (fn [e]
                                 (.stopPropagation e)
                                 (perform! :clear-filter key))}
            "clear filter"))))))

(defcomponent groups-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [group report selected? empty?]} data
          {:keys [count label title]} report]
      (dom/div {:class    (str "groups-filter-item" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-group :filter-select-group) group)}
        (dom/span {:class "group"
                   :title (str (when title (str title " ")) "(" count "x)")}
          label)))))

(defcomponent countries-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [country-code report selected? empty?]} data
          country-name (lookup-country-name country-code)
          count (:count report)]
      (dom/div {:class    (str "countries-filter-item f16" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-country :filter-select-country) country-code)}
        (dom/span {:class "countries-filter-item-body"
                   :title (str country-name " (" count "x)")}
          (when-not (nil? country-code)
            (dom/span {:class (str "flag " country-code)})))))))

(defcomponent tags-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [tag report selected? empty?]} data
          count (:count report)]
      (dom/div {:class    (str "tags-filter-item" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-tag :filter-select-tag) tag)}
        (dom/span {:class "tag"
                   :title (str "(" count "x)")} tag)))))

(defcomponent socials-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [social report selected? empty?]} data
          count (:count report)
          icon (:icon report)]
      (dom/div {:class    (str "socials-filter-item" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-social :filter-select-social) social)}
        (dom/i {:class (str "icon fa " icon)
                :title (str social " (" count "x)")})))))

(defn build-groups-filter-predicate [active-filters groups]
  (if-let [active-groups (:groups active-filters)]
    (when-not (empty? active-groups)
      (partial groups-filter-predicate groups active-groups))))

(defn build-countries-filter-predicate [active-filters]
  (if-let [active-countries (:countries active-filters)]
    (when-not (empty? active-countries)
      (partial countries-filter-predicate active-countries))))

(defn build-tags-filter-predicate [active-filters]
  (if-let [active-tags (:tags active-filters)]
    (when-not (empty? active-tags)
      (partial tags-filter-predicate active-tags))))

(defn build-socials-filter-predicate [active-filters]
  (if-let [active-socials (:socials active-filters)]
    (when-not (empty? active-socials)
      (partial socials-filter-predicate active-socials))))

(defn build-filter-predicates [active-filters data]
  (let [predicates [(build-groups-filter-predicate active-filters (get-in data [:content :groups]))
                    (build-countries-filter-predicate active-filters)
                    (build-tags-filter-predicate active-filters)
                    (build-socials-filter-predicate active-filters)]]
    (remove nil? predicates)))

(defn filter-people-except [except-filter data]
  (let [people (get-in data [:content :people])
        active-filters (dissoc (get-in data [:ui :filters :active]) except-filter)
        filter-predicates (build-filter-predicates active-filters data)]
    (remove #(is-person-filtered? filter-predicates %) people)))

(defcomponent groups-filter-component [data _ _]
  (render [_]
    (let [people (get-in data [:content :people])
          groups (get-in data [:content :groups])
          expanded? (contains? (get-in data [:ui :filters :expanded-set]) :groups)
          groups-tally (build-groups-tally people groups)
          filter-path [:ui :filters :active :groups]
          selected-groups (get-in data filter-path)
          sorted-groups (:ordered-groups groups-tally)
          prefiltered-people (filter-people-except :groups data)
          people-filtered-out? (fn [group] (every? #(not (groups-filter-predicate groups #{group} %)) prefiltered-people))]
      (dom/div {:class "groups-filter-wrapper"}
        (when (> (count sorted-groups) 0)
          (dom/div {:class "groups-filter filter-section"}
            (om/build filter-section-label-component {:key       :groups
                                                      :active?   (> (count selected-groups) 0)
                                                      :expanded? expanded?
                                                      :label     "groups"})
            (dom/div {:class (str "filter-section-body" (when expanded? " expanded"))}
              (for [group sorted-groups]
                (let [report (get-in groups-tally [:tally group])
                      selected? (contains? selected-groups group)
                      empty? (when-not selected? (people-filtered-out? group))]
                  (om/build groups-filter-item-component {:group     group
                                                          :selected? selected?
                                                          :empty?    empty?
                                                          :report    report}))))))))))
(defcomponent countries-filter-component [data _ _]
  (render [_]
    (let [people (get-in data [:content :people])
          expanded-filters (get-in data [:ui :filters :expanded-set])
          expanded? (contains? expanded-filters :countries)
          filter-path [:ui :filters :active :countries]
          selected-countries (get-in data filter-path)
          countries-tally (build-countries-tally people)
          sorted-countries (:countries-by-size countries-tally)
          prefiltered-people (filter-people-except :countries data)
          people-filtered-out? (fn [country-code] (every? #(not (countries-filter-predicate #{country-code} %)) prefiltered-people))]
      (dom/div {:class "countries-filter-wrapper"}
        (when (> (count sorted-countries) 1)
          (dom/div {:class "countries-filter filter-section"}
            (om/build filter-section-label-component {:key       :countries
                                                      :active?   (> (count selected-countries) 0)
                                                      :expanded? expanded?
                                                      :label     "countries"})
            (dom/div {:class (str "filter-section-body" (when expanded? " expanded"))}
              (for [country-code sorted-countries]
                (let [report (get-in countries-tally [:tally country-code])
                      selected? (contains? selected-countries country-code)
                      empty? (when-not selected? (people-filtered-out? country-code))]
                  (om/build countries-filter-item-component {:country-code country-code
                                                             :selected?    selected?
                                                             :empty?       empty?
                                                             :report       report}))))))))))
(defcomponent tags-filter-component [data _ _]
  (render [_]
    (let [people (get-in data [:content :people])
          expanded? (contains? (get-in data [:ui :filters :expanded-set]) :tags)
          tags-tally (build-tags-tally people)
          filter-path [:ui :filters :active :tags]
          selected-tags (get-in data filter-path)
          sorted-tags (:tags-by-size tags-tally)
          prefiltered-people (filter-people-except :tags data)
          people-filtered-out? (fn [tag] (every? #(not (tags-filter-predicate #{tag} %)) prefiltered-people))]
      (dom/div {:class "tags-filter-wrapper"}
        (when (> (count sorted-tags) 0)
          (dom/div {:class "tags-filter filter-section"}
            (om/build filter-section-label-component {:key       :tags
                                                      :active?   (> (count selected-tags) 0)
                                                      :expanded? expanded?
                                                      :label     "interests"})
            (dom/div {:class (str "filter-section-body" (when expanded? " expanded"))}
              (for [tag sorted-tags]
                (let [report (get-in tags-tally [:tally tag])
                      selected? (contains? selected-tags tag)
                      empty? (when-not selected? (people-filtered-out? tag))]
                  (om/build tags-filter-item-component {:tag       tag
                                                        :selected? selected?
                                                        :empty?    empty?
                                                        :report    report}))))))))))

(defcomponent socials-filter-component [data _ _]
  (render [_]
    (let [people (get-in data [:content :people])
          expanded? (contains? (get-in data [:ui :filters :expanded-set]) :socials)
          socials-tally (build-socials-tally people)
          filter-path [:ui :filters :active :socials]
          selected-socials (get-in data filter-path)
          sorted-socials (:socials-by-size socials-tally)
          prefiltered-people (filter-people-except :socials data)
          people-filtered-out? (fn [social] (every? #(not (socials-filter-predicate #{social} %)) prefiltered-people))]
      (dom/div {:class "socials-filter-wrapper"}
        (when (> (count sorted-socials) 0)
          (dom/div {:class "socials-filter filter-section"}
            (om/build filter-section-label-component {:key       :socials
                                                      :active?   (> (count selected-socials) 0)
                                                      :expanded? expanded?
                                                      :label     "social"})
            (dom/div {:class (str "filter-section-body" (when expanded? " expanded"))}
              (for [social sorted-socials]
                (let [report (get-in socials-tally [:tally social])
                      selected? (contains? selected-socials social)
                      empty? (when-not selected? (people-filtered-out? social))]
                  (om/build socials-filter-item-component {:social    social
                                                           :selected? selected?
                                                           :empty?    empty?
                                                           :report    report}))))))))))

(defcomponent filters-component [data _ _]
  (render [_]
    (dom/div {:class    "people-filters no-select"
              :on-click #(.stopPropagation %)}
      (om/build groups-filter-component data)
      (om/build countries-filter-component data)
      (om/build socials-filter-component data)
      (om/build tags-filter-component data))))
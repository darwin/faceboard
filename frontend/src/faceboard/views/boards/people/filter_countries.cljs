(ns faceboard.views.boards.people.filter-countries
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.people :refer [filter-people-except]]
            [faceboard.helpers.countries :refer [lookup-country-name]]
            [faceboard.views.boards.people.filters-header :refer [filters-header-component]]
            [faceboard.helpers.filters.countries :refer [build-countries-tally countries-filter-predicate]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

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

(defcomponent filter-countries-component [data _ _]
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
            (om/build filters-header-component {:key       :countries
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
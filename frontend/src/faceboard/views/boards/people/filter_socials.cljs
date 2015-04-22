(ns faceboard.views.boards.people.filter-socials
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.people :refer [filter-people-except]]
            [faceboard.views.boards.people.filters-header :refer [filters-header-component]]
            [faceboard.helpers.filters.social :refer [build-socials-tally socials-filter-predicate]]))

(defcomponent socials-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [social report selected? empty?]} data
          count (:count report)
          icon (:icon report)]
      (dom/div {:class    (str "socials-filter-item" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-social :filter-select-social) social)}
        (dom/i {:class (str "icon fa " icon)
                :title (str social " (" count "x)")})))))

(defcomponent filter-socials-component [data _ _]
  (render [_]
    (let [people (get-in data [:content :people])
          expanded? (contains? (:expanded data) :socials)
          socials-tally (build-socials-tally people)
          selected-socials (get-in data [:active :socials])
          sorted-socials (:socials-by-size socials-tally)
          prefiltered-people (filter-people-except :socials data)
          people-filtered-out? (fn [social] (every? #(not (socials-filter-predicate #{social} %)) prefiltered-people))]
      (dom/div {:class "socials-filter-wrapper"}
        (when (> (count sorted-socials) 0)
          (dom/div {:class "socials-filter filter-section"}
            (om/build filters-header-component {:key       :socials
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
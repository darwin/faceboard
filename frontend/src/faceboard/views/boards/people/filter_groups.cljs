(ns faceboard.views.boards.people.filter-groups
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.people :refer [filter-people-except]]
            [faceboard.views.boards.people.filters-header :refer [filters-header-component]]
            [faceboard.helpers.filters.groups :refer [build-groups-tally groups-filter-predicate]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent groups-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [group report selected? empty?]} data
          {:keys [count label title]} report]
      (dom/div {:class    (str "groups-filter-item" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-group :filter-select-group) group)}
        (dom/span {:class "group"
                   :title (str (when title (str title " ")) "(" count "x)")}
          label)))))

(defcomponent filter-groups-component [data _ _]
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
            (om/build filters-header-component {:key       :groups
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
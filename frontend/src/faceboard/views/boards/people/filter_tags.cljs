(ns faceboard.views.boards.people.filter-tags
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.people :refer [filter-people-except]]
            [faceboard.views.boards.people.filters-header :refer [filters-header-component]]
            [faceboard.helpers.filters.tags :refer [build-tags-tally tags-filter-predicate]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent tags-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [tag report selected? empty?]} data
          count (:count report)]
      (dom/div {:class    (str "tags-filter-item" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-tag :filter-select-tag) tag)}
        (dom/span {:class "tag"
                   :title (str "(" count "x)")} tag)))))

(defcomponent filter-tags-component [data _ _]
  (render [_]
    (let [people (get-in data [:content :people])
          expanded? (contains? (:expanded data) :tags)
          tags-tally (build-tags-tally people)
          selected-tags (get-in data [:active :tags])
          sorted-tags (:tags-by-size tags-tally)
          prefiltered-people (filter-people-except :tags data)
          people-filtered-out? (fn [tag] (every? #(not (tags-filter-predicate #{tag} %)) prefiltered-people))]
      (dom/div {:class "tags-filter-wrapper"}
        (when (> (count sorted-tags) 0)
          (dom/div {:class "tags-filter filter-section"}
            (om/build filters-header-component {:key       :tags
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
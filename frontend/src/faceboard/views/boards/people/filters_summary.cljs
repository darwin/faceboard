(ns faceboard.views.boards.people.filters-summary
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.utils :refer [human-str-join swallow]]
            [faceboard.helpers.people :refer [filter-people-except]]
            [faceboard.views.boards.people.filters-header :refer [filters-header-component]]
            [faceboard.helpers.filters.groups :refer [build-groups-tally groups-filter-predicate]]))

(defn build-filter-description [selection name]
  (if-not (empty? selection)
    name))

(defcomponent filters-summary-component [data _ _]
  (render [_]
    (let [{:keys [active revertible]} data
          active-descriptions (remove nil?
                                [(build-filter-description (:groups active) "groups")
                                 (build-filter-description (:countries active) "countries")
                                 (build-filter-description (:socials active) "social")
                                 (build-filter-description (:tags active) "interests")])
          sentence (human-str-join active-descriptions)
          has-filters? (not (empty? sentence))
          has-revertible-filters? (and
                                    (not has-filters?)
                                    (not (every? empty? (vals revertible))))
          has-controls? (or has-filters? has-revertible-filters?)]
      (log revertible)
      (dom/div {:class "filters-summary-wrapper"}
        (dom/span {:class "summary"}
          (if has-filters?
            (str "people filtered by " sentence)
            "no filters are active, current view contains all people"))
        (if has-controls?
          (dom/div {:class "controls"}
            (if has-filters?
              (dom/span {:class    "command"
                         :title    "clear all filters"
                         :on-click (fn [e]
                                     (swallow e)
                                     (perform! :clear-filters))}
                (dom/span {:class "fa fa-filter"})
                "clear all filters"))
            (if has-revertible-filters?
              (dom/span {:class    "command"
                         :title    "revert filters"
                         :on-click (fn [e]
                                     (swallow e)
                                     (perform! :revert-filters))}
                (dom/span {:class "fa fa-filter"})
                "back to previous filters"))))))))
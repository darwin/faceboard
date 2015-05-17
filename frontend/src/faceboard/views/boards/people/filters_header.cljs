(ns faceboard.views.boards.people.filters-header
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]))

(defcomponent filters-header-component [data _ _]
  (render [_]
    (let [{:keys [expanded? active? key label title]} data]
      (dom/div {:class    (str "filter-section-label " (name key) "-filter-section-label" (if active? " active-filter") (if expanded? " expanded"))
                :title    (or title (str "filtering by " label))
                :on-click #(perform! :toggle-filter-expansion key)}
        (dom/span {:class (str "caret fa" (if expanded? " fa-caret-down" " fa-caret-right"))})
        (dom/span label)
        (dom/div {:class "filter-indicator"}
          (when active?
            (dom/span {:class    "filter-clear"
                       :on-click (fn [e]
                                   (.stopPropagation e)
                                   (perform! :clear-filter key))}
              (str "clear " label " filter")))
          (dom/span {:class "fa fa-filter"}))))))
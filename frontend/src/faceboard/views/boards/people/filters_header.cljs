(ns faceboard.views.boards.people.filters-header
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent filters-header-component [data _ _]
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
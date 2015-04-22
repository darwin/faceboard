(ns faceboard.views.boards.people.filters
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.views.boards.people.filter-groups :refer [filter-groups-component]]
            [faceboard.views.boards.people.filter-countries :refer [filter-countries-component]]
            [faceboard.views.boards.people.filter-tags :refer [filter-tags-component]]
            [faceboard.views.boards.people.filter-socials :refer [filter-socials-component]]))

(defcomponent filters-component [data _ _]
  (render [_]

    (dom/div {:class    "people-filters no-select"
              :on-click #(.stopPropagation %)}
      (om/build filter-groups-component data)
      (om/build filter-countries-component data)
      (om/build filter-socials-component data)
      (om/build filter-tags-component data))))
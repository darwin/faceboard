(ns faceboard.places
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]))

(defcomponent places-component [data owner opts]
  (render [_]
    (dom/div {:class "places-board"}
      "PLACES...")))
(ns faceboard.views.places
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [om-tools.dom :as dom]))

(defcomponent places-component [data owner opts]
  (render [_]
    (dom/div {:class "places-board"}
      "PLACES...")))
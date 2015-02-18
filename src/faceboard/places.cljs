(ns faceboard.places
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [om-tools.dom :as dom]))

(defcomponent places-component [data owner opts]
  (render [_]
    (dom/div {:class "places-board"}
      "PLACES...")))
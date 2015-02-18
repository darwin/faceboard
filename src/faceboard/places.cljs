(ns faceboard.places
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]))

(defcomponent places-component [data owner opts]
  (did-mount [_]
    (println "places component did mount"))
  (render [_]
    (println "places component render")
    (dom/div {:class "places-board"}
      "PLACES...")))
       
       

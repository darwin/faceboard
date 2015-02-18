(ns faceboard.people
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]))

(defcomponent people-component [data owner opts]
  (did-mount [_]
    (println "people component did mount"))
  (render [_]
    (println "people component render")
    (dom/div {:class "people-board"}
      "PEOPLE...")))
       
       

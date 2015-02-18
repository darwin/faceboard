(ns faceboard.menu
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]))

(defcomponent menu-button-component [data owner opts]
  (render [_]
    (dom/div {:class "menu-button"}
      (:label data))))

(defcomponent menu-component [data owner opts]
  (render [_]
    (dom/div {:class "menu"}
      (om/build menu-button-component {:label "item1"})
      (om/build menu-button-component {:label "item2"}))))
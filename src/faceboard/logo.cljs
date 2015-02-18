(ns faceboard.logo
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils]))

(defcomponent logo-component [data owner opts]
  (render [_]
    (dom/div {:class "logo"}
      (dom/a {:href "/"} "faceboard"))))
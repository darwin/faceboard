(ns faceboard.logo
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]))

(defcomponent logo-component [data owner opts]
  (render [_]
    (dom/div {:class "logo"}
      (dom/div {:class "faceboard-logo"}
        (dom/a {:href "/"} "faceboard"))
      (if-let [board-name (:board-name data)]
        (dom/div {:class "board-label"}
          "@" (dom/a {:href "/"} board-name))))))
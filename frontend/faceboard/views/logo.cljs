(ns faceboard.views.logo
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(defcomponent logo-component [_ _ _]
  (render [_]
    (dom/div {:class "logo"}
      (dom/div {:class "faceboard-logo"}
        (dom/a {:href "/"} "faceboard")))))
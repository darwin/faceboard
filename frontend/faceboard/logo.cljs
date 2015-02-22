(ns faceboard.logo
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]))

(defcomponent logo-component [data _ _]
  (render [_]
    (dom/div {:class "logo"}
      (dom/div {:class "faceboard-logo"}
        (dom/a {:href "/"} "faceboard")))))
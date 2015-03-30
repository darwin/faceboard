(ns editor.views.status
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent status-component [data _ _]
  (render [_]
    (dom/div {:class "status"} data)))
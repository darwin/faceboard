(ns editor.views.status
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]))

(defcomponent status-component [data _ _]
  (render [_]
    (dom/div {:class "status"} data)))
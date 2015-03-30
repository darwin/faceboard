(ns editor.views.main
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [editor.views.editor :refer [editor-component]]
            [editor.views.status :refer [status-component]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent main-component [data _ _]
  (render [_]
    (dom/div {:class "editor-main"}
      (om/build editor-component (:editor data))
      (om/build status-component (:status data)))))
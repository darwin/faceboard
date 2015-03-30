(ns faceboard.views.editor
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent editor-bridge-component [_ _]
  (render [_]
    (perform! :refresh-editor)
    (dom/div {:class "editor-bridge"})))

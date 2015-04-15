(ns faceboard.views.editor
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [om.core :as om]
            [faceboard.controller :refer [perform!]]
            [faceboard.editor :refer [adopt-iframe]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent editor-bridge-component [_ _]
  (did-update [_ _ _]
    (perform! :refresh-editor))
  (render [_]
    (dom/div {:class "editor-bridge"})))

(defcomponent editor-iframe-component [_ owner]
  (did-mount [_]
    (adopt-iframe (om/get-node owner "iframe")))
  (render [_]
    (dom/div {:class "editor-iframe"}
      (dom/iframe {:ref          "iframe"
                   :frame-border 0
                   :src          "/editor.html"}))))
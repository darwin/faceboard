(ns editor.views.main
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [editor.views.editor :refer [editor-component]]
            [editor.views.status :refer [status-component]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn popup-blocked? []
  (try                                                      ; json is provided by user, can be broken
    (let [opener (.-opener js/window)]
      (if-let [apply-fn (aget opener "faceboardApplyJSON")]
        (log "apply-fn" apply-fn)))
    false
    (catch js/Object err
      (log-warn "disable the popup blocker")
      true)))

(defcomponent main-component [data _ _]
  (render [_]
    (if-not (popup-blocked?)
      (dom/div {:class "editor-main"}
        (om/build editor-component (:editor data))
        (om/build status-component (:status data)))
      (dom/div {:class "editor-main"}
        (dom/div {:class "warning"}
          "Please disable popup blocking for this domain."
          (dom/br)
          (str (.-host js/location))
          (dom/br)
          (dom/br)
          "Then " (dom/a {:href "javascript:window.close()"} "close this popup") " and then open Faceboard Editor again.")))))
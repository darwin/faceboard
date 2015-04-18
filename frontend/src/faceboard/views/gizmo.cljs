(ns faceboard.views.gizmo
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.utils :refer [non-sanitized-div css-transform]]
            [faceboard.controller :refer [perform!]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [om.core :as om]))

(defcomponent gizmo-content-component [data _ _]
  (render [_]
    (let [{:keys [content]} data]
      (dom/div {:class "gizmo-frame"
                :on-click (fn [e]
                            (.stopPropagation e))}
        (dom/div {:class "gizmo-content"}
          (if (fn? content)
            (content)
            (non-sanitized-div content)))))))

(defcomponent gizmo-component [data _ _]
  (render [_]
    (let [{:keys [state id title top left px py icon content]} data
          active? (= (:active state) id)]
      (dom/div {:class "gizmo-point"
                :style {:top  top
                        :left left}}
        (dom/div {:class "mover"                            ; TODO: mover can be implemented via CSS transforms on gizmo-point
                  :style {:top  py
                          :left px}}
          (dom/div {:class "gizmo-wrapper"}
            (if active?
              (dom/div {:class "gizmo-frame-correction"}
                (dom/div {:class "gizmo-frame-placement"}
                  (om/build gizmo-content-component {:content content}))))
            (dom/div {:class "pin-point"}
              (dom/i {:class    (str "fa fa-" (or icon "dot-circle-o"))
                      :title    title
                      :on-click (fn [e]
                                  (.stopPropagation e)
                                  (.preventDefault e)
                                  (perform! :activate-gizmo id))}))))))))
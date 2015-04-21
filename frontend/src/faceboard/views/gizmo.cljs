(ns faceboard.views.gizmo
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.utils :refer [swallow css-transform]]
            [faceboard.controller :refer [perform!]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [om.core :as om]))

(def gizmo-frame-left-shift 44)
(def gizmo-frame-right-shift 16)

(defn toggle-gizmo-when-clicked-pin-point [id position e]
  (swallow e)
  (perform! :toggle-gizmo id position))

(defcomponent gizmo-content-component [data _ _]
  (render [_]
    (let [{:keys [content]} data]
      (dom/div {:class    "gizmo-frame"
                :on-click swallow}
        (dom/div {:class "gizmo-content"} (content))))))

; NOTE: gizmo-component parent has to have :position :relative for gizmo-point to be properly vertically centered
(defcomponent gizmo-component [data _ _]
  (render [_]
    (let [{:keys [descriptor state]} data
          {:keys [id title content position]} descriptor
          active? (= (:active state) id)
          left? (= position :left)
          base-icon "outdent"
          icon (if left? (str base-icon " fa-flip-horizontal") base-icon)
          tx (if active? (if left? -26 18) (if left? -17 9))   ; ad-hoc constants to fit our font size and icons
          ty (if left? 0 0)
          gizmo-point-style (merge
                              (css-transform (str "translateX(" tx "px)" "translateY(" ty "px)"))
                              {:top "50%" :left (if left? "0%" "100%")})
          frame-correction-style {:top   "-2px"
                                  :right (if left? (str gizmo-frame-left-shift "px"))
                                  :left  (if-not left? (str gizmo-frame-right-shift "px"))}]
      (dom/div {:class (str "gizmo-point" (if active? " active"))
                :style gizmo-point-style}
        (dom/div {:class "gizmo-wrapper"}
          (dom/div {:class "pin-point"
                    :on-click (partial toggle-gizmo-when-clicked-pin-point id position)}
            (dom/i {:class    (str "fa fa-" icon)
                    :title    title}))
          (if active?
            (dom/div {:class "gizmo-frame-correction"
                      :style frame-correction-style}
              (dom/div {:class "gizmo-frame-placement"}
                (om/build gizmo-content-component {:content (partial content (:data data))})))))))))
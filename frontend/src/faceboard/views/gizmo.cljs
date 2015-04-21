(ns faceboard.views.gizmo
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.utils :refer [non-sanitized-div css-transform]]
            [faceboard.controller :refer [perform!]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [cuerdas.core :as str]
            [om.core :as om]))

(def gizmo-frame-left-shift 39)
(def gizmo-frame-right-shift 11)

(defn toggle-gizmo-when-clicked-gizmo-background [e]
  (.stopPropagation e)
  (.preventDefault e)
  (let [target (.-target e)
        hit (keyword (.-tagName target))
        class-name (.-className target)]
    (if-not (or
              (hit #{:SELECT :INPUT :TEXTAREA :BUTTON})
              (str/contains? class-name "no-dismiss"))
      (perform! :toggle-gizmo))))

(defn toggle-gizmo-when-clicked-pin-point [id position e]
  (.stopPropagation e)
  (.preventDefault e)
  (perform! :toggle-gizmo id position))

(defcomponent gizmo-content-component [data _ _]
  (render [_]
    (let [{:keys [content]} data]
      (dom/div {:class    "gizmo-frame"
                :on-click toggle-gizmo-when-clicked-gizmo-background}
        (dom/div {:class "gizmo-content"} (content))))))

(defcomponent gizmo-component [data _ _]
  (render [_]
    (let [{:keys [descriptor state]} data
          {:keys [id title content position]} descriptor
          active? (= (:active state) id)
          left? (= position :left)
          base-icon "reply"
          icon (if left? (str base-icon " fa-flip-horizontal") base-icon)
          top "50%"
          left (if left? "0%" "100%")
          px (if active? (if left? -8 4) (if left? -2 0))   ; ad-hoc constants to fit our font size and icons
          py (if left? -2 2)
          gizmo-point-style (merge
                              (css-transform (str "translateX(" px "px)" "translateY(" py "px)"))
                              {:top top :left left})
          frame-correction-style {:top   "0px"
                                  :right (if left? (str gizmo-frame-left-shift "px"))
                                  :left  (if-not left? (str gizmo-frame-right-shift "px"))}]
      (dom/div {:class "gizmo-point"
                :style gizmo-point-style}
        (dom/div {:class "gizmo-wrapper"}
          (if active?
            ; centering gizmo frame vertically to gizmo point is suprisingly hard, we need two divs
            (dom/div {:class "gizmo-frame-correction"
                      :style frame-correction-style}
              (dom/div {:class "gizmo-frame-placement"}
                (om/build gizmo-content-component {:content (partial content (:data data))}))))
          (dom/div {:class (str "pin-point" (if active? " active"))}
            (dom/i {:class    (str "fa fa-" icon)
                    :title    title
                    :on-click (partial toggle-gizmo-when-clicked-pin-point id position)})))))))
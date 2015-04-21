(ns faceboard.views.gizmo
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.utils :refer [non-sanitized-div css-transform]]
            [faceboard.controller :refer [perform!]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [cuerdas.core :as str]
            [om.core :as om]))

(defcomponent gizmo-content-component [data _ _]
  (render [_]
    (let [{:keys [content]} data]
      (dom/div {:class    "gizmo-frame"
                :on-click (fn [e]
                            (.stopPropagation e)
                            (.preventDefault e)
                            (let [target (.-target e)
                                  hit (keyword (.-tagName target))
                                  class-name (.-className target)]
                              (if-not (or (hit #{:SELECT :INPUT :TEXTAREA :BUTTON}) (str/contains? class-name "no-dismiss"))
                                (perform! :toggle-gizmo))))}
        (dom/div {:class "gizmo-content"} (content))))))

(defcomponent gizmo-component [data _ _]
  (render [_]
    (let [{:keys [descriptor state]} data
          {:keys [id title content position]} descriptor
          active? (= (:active state) id)
          left? (= position :left)
          top "50%"
          left (if left? "0%" "100%")
          px (if active? (if left? -8 4) (if left? -2 0))
          py (if left? -2 2)
          base-icon "reply"
          icon (if left? (str base-icon " fa-flip-horizontal") base-icon)]
      (dom/div {:class "gizmo-point"
                :style (merge
                         (css-transform (str "translateX(" px "px)" "translateY(" py "px)"))
                         {:top top :left left})}
        (dom/div {:class "gizmo-wrapper"}
          (if active?
            (dom/div {:class "gizmo-frame-correction"
                      :style {:top   "0px"
                              :right (if left? "31px")
                              :left  (if-not left? "11px")}}
              (dom/div {:class "gizmo-frame-placement"}
                (om/build gizmo-content-component {:content (partial content (:data data))}))))
          (dom/div {:class (str "pin-point" (if active? " active"))}
            (dom/i {:class    (str "fa fa-" icon)
                    :title    title
                    :on-click (fn [e]
                                (.stopPropagation e)
                                (.preventDefault e)
                                (perform! :toggle-gizmo id position))})))))))
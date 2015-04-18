(ns faceboard.css.gizmo
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> gizmo-point
     [:position :absolute
      :opacity "1 !important"
      :z-index 110]
     (>> mover
       [:position :relative]
       (>> pin-point
         [:position :relative
          :top (px -15)
          :left (px -10)
          :color gizmo-signature-color
          :font-size (px 24)]
         (>> &:hover
           [:color gizmo-signature-hovered-color]))))
   (>> gizmo-frame-correction
     [:position :absolute
      :z-index 100
      :top "0px"
      :right "30px"]
     (>> gizmo-frame-placement
       [:position :relative
        :transform "translateY(-50%)"]))
   (>> gizmo-frame
     [:border-radius (px 2)
      :background-color "#f6f6f6"
      :border (str "2px solid " gizmo-signature-color)
      :padding (px 10 12)
      :box-shadow "0px 0px 10px 2px rgba(0,0,0,0.5)"])
   (>> gizmo-content
     [:font-family gizmo-font
      :font-size (px 12)]
     (>> :form
       (>> [> *]
         [:margin-bottom (px 4)]))
     (>> :label
       [:color "#999"
        :font-size (px 10)])
     (>> :input :select
       [:margin-left (px 6)
        :font-family gizmo-font])
     (>> name-country-gizmo
       (>> country-select
         (>> :select
           [:max-width (px 200)]))))])
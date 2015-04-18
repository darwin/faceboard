(ns faceboard.css.gizmo
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> gizmo-point
     [:position :absolute
      :opacity "1 !important"
      :z-index 100]
     (>> mover
       [:position :relative]
       (>> pin-point
         [:position :relative
          :top (px -15)
          :left (px -10)
          :color "blue"
          :font-size (px 24)]
         (>> &:hover
           [:color "red"]))))
   (>> gizmo-frame-correction
     [:position :absolute
      :top "0px"
      :right "40px"]
     (>> gizmo-frame-placement
       [:position :relative
        :transform "translateY(-50%)"]))
   (>> gizmo-frame
     [:border-radius (px 2)
      :background-color "#f6f6f6"
      :border "4px solid blue"
      :padding (px 10 12)
      :box-shadow "0px 0px 10px 2px rgba(0,0,0,0.5)"])])
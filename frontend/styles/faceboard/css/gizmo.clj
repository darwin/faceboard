(ns faceboard.css.gizmo
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> gizmo-point
     [:position :absolute
      :opacity "1 !important"
      :z-index 200
      :cursor :auto])
   (>> pin-point
     [:z-index 100
      :cursor :pointer
      :position :relative
      :top (px -15)
      :left (px -10)
      :color gizmo-point-color
      :font-size (px 24)]
     (>> &.active
       [:color gizmo-point-active-color])
     (>> &:hover
       [:color gizmo-point-hovered-color]))
   (>> gizmo-frame-correction
     [:position :absolute
      :z-index 50]
     (>> gizmo-frame-placement
       [:position :relative
        :transform "translateY(-50%)"]))
   (>> gizmo-frame
     [:cursor :pointer
      :min-width (px 300)
      :border-radius (px 2)
      :background-color "#f6f6f6"
      :border (str "2px solid " gizmo-border-color)
      :padding (px 10 10)
      :box-shadow "0px 0px 10px -1px rgba(0,0,0,0.2)"])
   (>> gizmo-content
     [:font-family gizmo-font
      :font-size (px 12)]
     (>> :form
       (>> [> *]
         [:margin-bottom (px 4)]
         (>> &:last-child
           [:margin-bottom (px 0)])))
     (>> :label
       [:color "#999"
        :font-size (px 10)]
       (>> :span
         [:display :inline-block
          :text-align :right
          :width (px 80)]))
     (>> :input :select :textarea
       [:margin (px 0)
        :margin-left (px 6)
        :width (px 200)
        :font-family gizmo-font])
     (>> photo-gizmo
       (>> url-input
         (>> :input
           [:width (px 300)])))
     (>> about-gizmo
       (>> about-textarea
         (>> :span
           [:display :block
            :text-align :left])
         (>> :textarea
           [:margin (px 0)
            :width (px 400)
            :box-sizing :border-box
            :height "120px"])))
     (>> tags-gizmo
       [:width (px 400)]
       (>> tags-selector
         [:font-family board-font
          :margin-bottom (px 10)]
       (>> tag-item
         [:float :left
          :padding (px 0 3)
          :color "#999"
          :margin-bottom (px 2)
          :margin-right (px 2)
          :border-radius (px 2)
          :border (str "1px solid " filter-item-background-deselected-color)
          :background-color filter-item-background-deselected-color
          :cursor :pointer]
         (>> &.selected
           [:background-color filter-item-background-normal-color
            :border (str "1px solid " filter-item-background-normal-color)
            :color people-desk-background-color])
         (>> &.last
           [:background-color filter-item-background-normal-color
            :border (str "1px dotted " "white")
            :color people-desk-background-color])
         (>> &:hover
           [:background-color filter-item-background-hovered-color
            :border-color :white
            :color people-desk-background-color])))
       (>> add-input
         [:white-space :nowrap]
         (>> :input
           [:width (px 140)]))))])
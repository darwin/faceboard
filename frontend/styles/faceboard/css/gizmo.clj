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
      :top (px -23)
      :left (px -14)
      :color gizmo-point-color
      :font-size (px 24)
      :padding (px 8 4)]
     (>> &.active
       [:color gizmo-point-active-color])
     (>> &:hover
       [:color gizmo-point-hovered-color]))
   ; centering gizmo frame vertically to gizmo point is suprisingly hard, we need two divs
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
      :border (str "3px solid " gizmo-border-color)
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
        :font-size (px 10)
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
         (>> no-tags-avail
           [:color "#999"])
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
           [:width (px 140)])
         (>> clear-all-action
           [:float :right])))
     (>> social-gizmo
       [:width (px 400)]
       (>> social-list
         [:font-family board-font
          :margin-bottom (px 8)
          :padding-bottom (px 6)
          :border-bottom "1px dashed #ddd"]
         (>> no-socials-avail
           [:color "#999"])
         (>> social-item
           (>> icon
             [:width (px 16)
              :height (px 16)
              :font-size (px 19)
              :line-height (px 14)
              :position :relative
              :top (px 3)])
           (>> :input
             [:width (px 350)])))
       (>> add-input
         [:white-space :nowrap]
         (>> :select
           [:width (px 120)])
         (>> clear-all-action
           [:float :right]))))])
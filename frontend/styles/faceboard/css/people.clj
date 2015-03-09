(ns faceboard.css.people
  (:use [faceboard.lib.constants])
  (:use [faceboard.shared.anims])
  (:require [faceboard.lib.helpers :refer [>> mv px ms]]))

(def styles
  [(>> people-board
     [:height "100%"
      :perspective (px 800)]
     (>> person-box
       [:position :relative
        :float :left
        :margin (px 20 20)
        :z-index 0
        :transform-style :preserve-3d
        :transition (str "transform 0.5s " ease-out-back)
        :transform "translateZ(-100px)"]
       ; zoom-in animation
       (>> &.extended
         [:z-index 100
          :transform "translateZ(0px)"])
       ; expanding animation
       (>> &.expanding
         (>> [person right-part]
           [:transition (str "width " (ms person-expanding-sliding-delay) " " ease-in-quit)])
         (>> polaroid-frame
           [:transition (str "transform " (ms person-expanding-rotation-delay) " " ease-out-quit)]))
       (>> &.expanding-phase0
         (>> [person right-part]
           [:width "0px"
            :visibility :hidden]))
       (>> &.expanding-phase1
         (>> [person right-part]
           [:width "300px"]))
       ; shrinking animation
       (>> &.shrinking
         (>> [person right-part]
           [:transition (str "width " (ms person-shrinking-sliding-delay) " " ease-in-quit)])
         (>> polaroid-frame
           [:transition (str "transform " (ms person-shrinking-rotation-delay) " " ease-out-quit)]))
       (>> &.shrinking-phase0
         (>> [person right-part]
           [:width (px 300)]))
       (>> &.shrinking-phase1
         (>> [person right-part]
           [:width (px 0)]))
       (>> &.shrinking-phase2
         (>> [person right-part]
           [:visibility :hidden])))
     (>> polaroid-frame
       [:transform-origin "70px 80px"
        :background-color "#f6f6f6"
        :border "1px solid #eee"
        :padding (px 10 8)
        :padding-bottom (px 4)
        :box-shadow "0px 0px 10px -1px rgba(0,0,0,0.2)"
        :cursor :pointer
        :opacity 0.8
        :white-space :nowrap]
       (>> &:hover
         [:background-color "#fafafa"
          :opacity 1
          :box-shadow "0px 0px 20px -1px rgba(0,0,0,0.2)"])
       (>> photo
         [:margin-bottom (px 6)
          :width (px 126)
          :height (px 120)
          :overflow :hidden
          :border-radius (px 4)
          :border "2px solid #eee"
          :background-color "white"
          :box-shadow "inset 0px 0px 20px 0px rgba(0,0,0,0.2)"]
         (>> :img
           [:max-width (px 126)]))
       (>> flag
         [:margin-left (px 6)
          :height "14px !important"
          :position :relative
          :top (px 1)])
       (>> name
         [:font-size (px 18)
          :text-align :center
          :font-weight :bold
          :white-space :nowrap
          :overflow :hidden]))
     (>> person-extended-wrapper
       [:position :absolute])
     (>> [extended polaroid-frame]
       [:background-color "#fafafa"
        :transform "rotate(0deg) !important"
        :opacity 1
        :box-shadow "0px 0px 20px -1px rgba(0,0,0,0.2)"])
     (>> person
       (>> left-part
         [:display :inline-block
          :vertical-align :top])
       (>> right-part
         [:display :inline-block
          :overflow :hidden
          :visibility :visible]))
     (>> person-extended-info
       [:min-width (px 300)
        :vertical-align :top
        :min-height (px 150)
        :margin-left (px 10)
        :line-height (px 16)
        :font-size (px 12)]
       (>> social-item
         (>> icon
           [:font-size (px 16)
            :position :relative
            :top (px 1)
            :color "#ddd"])
         (>> social-type
           [:color "#999"])
         (>> :a
           [:font-weight :bold
            :color signature-color
            :text-decoration :none])
         )))])
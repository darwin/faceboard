(ns styles.css.people
  (:use [styles.lib.constants])
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> people-board
     {:height      "100%"
      :perspective (px 800)}
     (>> person-box
       {:position        :relative
        :float           :left
        :margin          (px 20 20)
        :z-index         0
        :transform-style :preserve-3d
        :transition      "transform 0.4s"
        :transform       "translateZ(-100px)"}
       (>> &.extended
         {:z-index   100
          :transform "translateZ(-50px)"}))
     (>> polaroid-frame
       {:transform-origin "0% 0%"
        :background-color "#f6f6f6"
        :border           "1px solid #eee"
        :padding          (px 10 8)
        :padding-bottom   (px 4)
        :box-shadow       "0px 0px 10px -1px rgba(0,0,0,0.2)"
        :cursor           :pointer
        :opacity          0.8
        :transition       "opacity .3s ease-in-out"
        :white-space      :nowrap}
       (>> &:hover
         {:background-color "#fafafa"
          :opacity          1
          :box-shadow       "0px 0px 20px -1px rgba(0,0,0,0.2)"})
       (>> photo
         {:margin-bottom    (px 6)
          :width            (px 126)
          :height           (px 120)
          :overflow         :hidden
          :border-radius    (px 4)
          :border           "2px solid #eee"
          :background-color "white"
          :box-shadow       "inset 0px 0px 20px 0px rgba(0,0,0,0.2)"}
         (>> :img
           {:max-width (px 124)}))
       (>> flag
         {:margin-left (px 6)
          :height      "14px !important"
          :position    :relative
          :top         (px 1)})
       (>> name
         {:font-size   (px 18)
          :text-align  :center
          :font-weight :bold
          :white-space :nowrap
          :overflow    :hidden}))
     (>> person-extended-wrapper
       {:position :absolute})
     (>> [extended polaroid-frame]
       {:background-color "#fafafa"
        :opacity          1
        :box-shadow       "0px 0px 20px -1px rgba(0,0,0,0.2)"})
     (>> person
       (>> left-part
         {:display :inline-block})
       (>> right-part
         {:display        :inline-block
          :vertical-align :top
          :border-left    "2px dashed #dedede"
          :padding-left   (px 10)
          :margin-left    (px 10)
          :min-height     (px 150)}))
     (>> person-extended-info
       {:min-width   (px 300)
        :margin-left (px 10)
        :font-size   (px 12)}))])
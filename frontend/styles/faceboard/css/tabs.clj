(ns faceboard.css.tabs
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]
            [garden.color :as color]))

(def styles
  [(>> tab-area
     (>> [> *]
       [:display :inline-block])
     (>> tab
       [:padding (px 0 4)
        :font-weight :bold
        :margin (px 2)
        :margin-left (px 8)
        :margin-bottom (px 0)
        :min-width (px 60)
        :cursor :pointer
        :position :relative
        :border-top-right-radius (px 2)
        :border-top-left-radius (px 2)
        :top (px 1)
        :text-align :center
        :background (color/darken signature-color 10)
        :color "#fff"]
       (>> &.selected
         [:color "#000"
          :background selected-tab-color
          :border-bottom (str "1px solid " selected-tab-color)])))
   (>> tab-contents
     [:position :relative
      :z-index 0
      :height "100%"]
     (>> tab-view
       [:height "100%"]
       (>> [> *]
         [:height "100%"])
       (>> &.dual-mode
         (>> [> *]
           [:width "50%"
            :display :inline-block])
         (>> left-side
           [:float :left])
         (>> right-side
           [:float :right]))))])
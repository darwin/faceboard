(ns faceboard.css.logo
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> top-bar
     (>> small-logo board-label
       [:font-family signature-font
        :font-size (px 16)])
     (>> small-logo
       [:margin-left (px 12)])
     (>> [small-logo *] [board-label *]
       [:line-height (px 22)
        :color "white !important"])
     (>> [small-logo a] [label a]
       [:margin (px 0 10)
        :position :relative
        :top (px 1)
        :text-decoration :none])
     (>> faceboard-logo:hover [board-label label:hover]
       [:text-decoration :underline]))
   (>> big-logo
     [:font-family signature-font
      :font-size (px 48)
      :line-height (px 48)
      :padding (px 0)
      :padding-top (px 10)
      :padding-bottom (px 10)
      :text-align :center
      :background-color signature-color
      :color "white"
      :border-top-left-radius (px 4)
      :border-top-right-radius (px 4)]
     (>> :span
       [:display :inline-block]))])
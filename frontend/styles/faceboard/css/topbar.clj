(ns faceboard.css.topbar
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> top-bar
     [:z-index 10
      :position :fixed
      :top (px 0)
      :left (px 0)
      :right (px 0)
      :height header-height
      :line-height (px 18)
      :background-color signature-color
      :font-size (px 12)]
     (>> [> *]
       [:display :inline-block])
     (>> [logo "a"]
       [:font-family signature-font
        :margin (px 0 20)
        :color "white"
        :position :relative
        :top (px 1)
        :text-decoration :none]))])
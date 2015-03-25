(ns faceboard.css.topbar
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> top-bar
     [:z-index 10
      :position :relative
      :min-height (px 22)
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
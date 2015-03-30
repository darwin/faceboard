(ns faceboard.css.iframe
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> iframe-board
     [:padding (px 0)]
     (>> iframe-parent
       [:position :absolute
        :top (px 0)
        :left (px 0)
        :right (px 0)
        :bottom (px 0)])
     (>> :iframe
       [:position :absolute
        :height "100%"
        :width "100%"
        :border :none]))])
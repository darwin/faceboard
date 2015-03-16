(ns faceboard.css.iframe
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> iframe-board
     [:margin (px 0)]
     (>> :iframe
       [:width "100%"
        :height "100%"
        :border :none
        :frameborder 0]))])
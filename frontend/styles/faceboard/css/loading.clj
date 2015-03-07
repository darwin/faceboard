(ns faceboard.css.loading
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> loading-page
     (>> loading-message
       [:background-color loading-color
        :color "white"
        :text-align :center
        :margin-top (px 2)
        :font-weight :bold
        :font-size (px 32)
        :line-height (px 32)
        :padding-top (px 20)
        :padding-bottom (px 20)
        :border-bottom-left-radius (px 4)
        :border-bottom-right-radius (px 4)]
       (>> message
         [:margin-top (px 10)
          :font-size (px 18)
          :line-height (px 20)])))])
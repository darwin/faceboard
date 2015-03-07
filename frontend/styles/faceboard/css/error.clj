(ns faceboard.css.error
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> error-page
     (>> error-message
       [:background-color error-color
        :color "white"
        :text-align :center
        :margin-top (px 2)
        :font-weight :bold
        :font-size (px 32)
        :line-height (px 32)
        :padding-top (px 20)
        :padding-bottom (px 20)]
       (>> message
         [:margin-top (px 10)
          :font-size (px 18)
          :line-height (px 20)]))
     (>> contact-box
       [:background-color signature-color
        :color "#aaa"
        :text-align :center
        :margin-top (px 2)
        :padding (px 10)
        :border-bottom-left-radius (px 4)
        :border-bottom-right-radius (px 4)
        :padding-bottom (px 20)]
       (>> :a
         [:color "#aaa"])))])
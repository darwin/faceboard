(ns styles.css.welcome
  (:use [styles.lib.constants])
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> welcome
     {:width        (px 600)
      :margin-left  :auto
      :margin-right :auto}
     (>> big-logo
       {:font-family             signature-font
        :font-size               (px 48)
        :line-height             (px 48)
        :padding                 (px 0)
        :text-align              :center
        :background-color        signature-color
        :color                   "white"
        :border-top-left-radius  (px 4)
        :border-top-right-radius (px 4)}
       (>> :span
         {:display  :inline-block
          :position :relative
          :top      (px 4)}))
     (>> teaser
       {:border (str "4px solid " signature-color)}
       (>> :img
         {:width   "100%"
          :display :block}))
     (>> buttons
       {:margin-top (px 30)
        :text-align :center}))])
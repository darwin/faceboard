(ns styles.css.welcome
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> welcome
     {:width (px 600)
      :margin-left :auto
      :margin-right :auto}
     (>> big-logo
       {:font-family "'Exo', sans-serif;"
        :font-size (px 48)
        :line-height (px 48)
        :padding (px 0)
        :text-align :center
        :background-color "#3a5795"
        :color "white"
        :border-top-left-radius (px 4)
        :border-top-right-radius (px 4)}
       (>> :span
         {:display :inline-block
          :position :relative
          :top (px 4)}))
     (>> teaser
       {:border "4px solid #3a5795"}
       (>> :img
         {:width "100%"
          :display :block}))
     (>> buttons
       {:margin-top (px 30)
        :text-align :center}))])
(ns styles.css.tabs
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> tab-area
     (>> [> *]
       {:display "inline-block"})
     (>> tab
       {:padding       (px 0 8)
        :font-weight   "bold"
        :margin        (px 2)
        :margin-left   (px 8)
        :margin-bottom (px 0)
        :min-width     (px 80)
        :cursor        "pointer"
        :position      "relative"
        :top           (px 1)
        :border        "1px solid transparent"
        :text-align    "center"
        :color         "#fff"}
       (>> &.selected
         {:color                   "#000"
          :background              "white"
          :border-top-right-radius (px 2)
          :border-top-left-radius  (px 2)
          :border                  "1px solid #999"
          :border-bottom           "1px solid white"})))
   (>> tab-contents
     {:height "100%"})])
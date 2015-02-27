(ns styles.css.menu
  (:use [styles.lib.constants])
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> menu
     {:color       "#fff"
      :float       :right
      :font-size   (px 12)
      :line-height (px 18)
      :padding     (px 2 0)}
     (>> [> *]
       {:display :inline-block})
     (>> menu-button
       {:margin-right     (px 10)
        :padding          (px 0 10)
        :cursor           :pointer
        :background-color "#26386c"
        :border-radius    (px 2)
        :font-weight      :bold}
       (>> &.active
         {:background-color "yellow"
          :color            "black"})
       ))])
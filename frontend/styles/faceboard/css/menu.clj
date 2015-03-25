(ns faceboard.css.menu
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> menu
     [:color "#fff"
      :float :right
      :font-size (px 12)
      :line-height (px 18)
      :padding (px 2 0)]
     (>> [> *]
       [:display :inline-block])
     (>> edit-button
       [:display :none])
     (>> menu-button
       [:margin-right (px 10)
        :padding (px 0 10)
        :cursor :pointer
        :color menu-button-text-color
        :background-color menu-button-background-color
        :border-radius (px 2)
        :font-weight :bold]
       (>> label
         [:margin-left (px 6)])
       (>> &.active
         [:background-color pressed-menu-button-background-color
          :color pressed-menu-button-text-color])))])
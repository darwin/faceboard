(ns styles.css.page
  (:use [styles.lib.constants])
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> *
     {:margin  (px 0)
      :padding (px 0)})
   (>> :html :body :#app main-box page [page page-content]
     {:height "100%"})
   (>> :body
     {:font-size   (px 14)
      :line-height 1.4
      :font-family base-font})
   (>> :#app
     {:display "block !important"})
   (>> page
     (>> loading-indicator
       {:position   :absolute
        :top        (px 2)
        :left       (px 2)
        :opacity    0
        :transition "opacity .3s ease-in-out"}
       (>> &.visible
         {:opacity 1})
       (:img
         {:width  (px 18)
          :height (px 18)}))
     (>> banner
       {:position         :fixed
        :bottom           (px 0)
        :color            "#888"
        :font-size        (px 10)
        :background-color "#eee"
        :opacity          0.5
        :padding          (px 1 10)}
       (>> :a
         {:color "#888"}
         (>> &:hover
           {:color "blue"}))))
   (>> standard-page
     {:margin (px 40)}
     (>> button
       {:display          "inline-block"
        :cursor           :pointer
        :padding          (px 4 20)
        :min-width        (px 100)
        :width            (px 200)
        :background-color signature-color
        :color            "#ccc"
        :border-radius    (px 2)
        :border           "2px solid #3a4d81"
        :transition       "color .3s ease-in-out"
        :box-shadow       "0px 0px 10px 0px rgba(0,0,0,0.5)"}
       (>> &:hover
         {:color        "#fff"
          :border-color signature-color})))])
(ns faceboard.css.editor
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> editor-main
     (>> warning
       [:background-color "red"
        :font-size (px 18)
        :line-height (px 28)
        :color "white"
        :text-align :center
        :padding (px 20 10)]
       (>> :a
         [:color "#eef"])))
   (>> status
     [:position :fixed
      :font-size (px 12)
      :line-height (px 16)
      :bottom (px 5)
      :left (px 6)
      :color "#fff"
      :border-radius (px 2)
      :padding (px 0 6)
      :background-color "red"])
   (>> editor
     [:font-size (px 10)]
     (>> info
       [:position :fixed
        :top (px 2)
        :left (px 6)
        :right (px 6)
        :font-family editor-font]
       (>> path
         [:padding (px 1 4)
          :background-color "#dfd"]))
     (>> docs
       [:position :fixed
        :top (px 2)
        :right (px 6)
        :color "#999"]
       (>> :a
         [:color "#999"]))
     (>> buttons
       [:position :fixed
        :bottom (px 2)
        :right (px 6)])
     (>> &.unsaved
       (>> CodeMirror
         [:background-color "#eef"]))
     (>> &.danger
       (>> CodeMirror
         [:background-color "#fee"]))
     (>> CodeMirror
       [:height "100%"
        :border "1px solid #aaa"])
     (>> editor-host
       [:position :fixed
        :left (px 6)
        :right (px 6)
        :top (px 18)
        :bottom (px 28)])
     (>> button
       [:z-index 100
        :font-family editor-font
        :display :inline-block
        :min-width (px 80)
        :right (px 20)
        :font-size (px 12)
        :padding (px 2 6)
        :margin-left (px 10)
        :border-radius (px 2)
        :border "1px solid #999"
        :background-color "#ddd"
        :cursor :pointer]))])
(ns faceboard.css.editor
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> editor-iframe
     [:position :fixed
      :opacity 0.95
      :z-index 100
      :top (px 40)
      :bottom (px 20)
      :left (px 40)
      :right (px 40)
      :padding (px 6 6)
      :background-color "#eee"
      :box-shadow "0px 0px 10px 4px rgba(0,0,0,0.2)"
      :border-radius (px 2)]
     (>> :iframe
       [:width "100%"
        :height "100%"]))
   (>> editor-main
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
        :color "#aaa"
        :font-size (px 10)
        :line-height (px 10)
        :border "1px solid #aaa"]
       (>> cm-string
         [:color "#666"])
       (>> cm-property
         [:color :purple])
       (>> CodeMirror-matchingbracket
         [:color :black
          :background-color :yellow
          :font-weight :bold]))
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
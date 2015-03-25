(ns faceboard.css.editor
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> editor
     [:position :relative]
     (>> info
       [:font-size (px 10)
        :margin-left (px 10)]
       (>> path
         [:padding (px 0 4)
          :background-color "#dfd"]))
     (>> &.unsaved
       (>> CodeMirror
         [:background-color "#eef"]))
     (>> &.danger
       (>> CodeMirror
         [:background-color "#fee"]))
     (>> CodeMirror
       [:height :auto])
     (>> editor-host
       [:border-left "1px dashed #eee"
        :height "100%"
        :font-size (px 10)])
     (>> button
       [:z-index 100
        :font-family editor-font
        :position :absolute
        :right (px 20)
        :font-size (px 12)
        :padding (px 2 6)
        :border-radius (px 2)
        :background-color "#ddd"
        :cursor :pointer])
     (>> hint
       [:top (px 4)])
     (>> refresh
       [:top (px 33)])
     (>> save-switch
       [:top (px 56)])
     (>> discard-switch
       [:top (px 79)]))])
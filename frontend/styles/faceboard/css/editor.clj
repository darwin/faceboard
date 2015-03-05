(ns faceboard.css.editor
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> editor
     {:position :relative}
     (>> editor-host
       {:border-left "1px dashed #eee"
        :height      "100%"
        :font-size   (px 10)})
     (>> hint refresh
       {
        :z-index          100
        :font-family      editor-font
        :position         :absolute
        :right            (px 20)
        :font-size        (px 12)
        :padding          (px 2 6)
        :border-radius    (px 2)
        :background-color "#ddd"
        :cursor           :pointer})
     (>> hint
       {:top (px 10)})
     (>> refresh
       {:top (px 33)}))])
(ns styles.css.editor
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> editor
     {:position :relative}
     (>> editor-host
       {:border-left "1px dashed #eee"
        :height      "100%"
        :font-size   (px 10)})
     (>> hint
       {:z-index          100
        :font-family      "monospace"
        :position         :absolute
        :right            (px 20)
        :top              (px 10)
        :background-color "#ddd"
        :font-size        (px 12)
        :padding          (px 2 6)
        :border-radius    (px 2)
        :cursor           :pointer})
     (>> refresh
       {:z-index          100
        :font-family      "monospace"
        :position         :absolute
        :right            (px 20)
        :top              (px 33)
        :background-color "#ddd"
        :font-size        (px 12)
        :padding          (px 2 6)
        :border-radius    (px 2)
        :cursor           :pointer}))])
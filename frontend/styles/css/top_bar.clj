(ns styles.css.top_bar
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> top-bar {:min-height       (px 22)
                :line-height      (px 18)
                :background-color "#3a5795"
                :border-bottom    "1px solid #999"
                :font-size        (px 12)}
     (>> [> *]
       {:display "inline-block"}))])
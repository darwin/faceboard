(ns styles.css.logo
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> top-bar
     (>> logo board-label
       {:font-family "'Exo', sans-serif"
        :font-size   (px 16)})
     (>> logo
       {:margin-left (px 12)})
     (>> [logo > *] [board-label *]
       {:line-height (px 22)
        :color       "white !important"})
     (>> [logo a] [label a]
       {:margin          (px 0 10)
        :position        "relative"
        :top             (px 1)
        :text-decoration "none"})
     (>> faceboard-logo:hover [board-label label:hover]
       {:text-decoration "underline"}))])
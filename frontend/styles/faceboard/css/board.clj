(ns faceboard.css.board
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> board-view
     {:font-family board-font
      :height      "100%"}
     (>> [> *]
       {:height "100%"})
     (>> left-side
       {:width "80%"})
     (>> &.dual-mode
       (>> [> *]
         {:width   "50%"
          :display :inline-block})
       (>> left-side
         {:float :left})
       (>> right-side
         {:float :right})))])
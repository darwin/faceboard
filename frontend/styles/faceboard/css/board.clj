(ns faceboard.css.board
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> board
     [:margin (px 20)
      :font-family board-font
      :height "100%"]
     (>> [> *]
       [:height "100%"]))
   (>> people-board
     [:margin (px 0)])])
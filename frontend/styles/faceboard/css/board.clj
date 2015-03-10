(ns faceboard.css.board
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> board
     [:font-family board-font
      :background-color selected-tab-color
      :height "100%"]
     (>> [> *]
       [:height "100%"]))])
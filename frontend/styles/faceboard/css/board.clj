(ns faceboard.css.board
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> board
     [:padding (px 20)
      :font-family board-font
      :background-color selected-tab-color])])
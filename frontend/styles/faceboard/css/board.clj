(ns faceboard.css.board
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> board
     [:font-family board-font])])
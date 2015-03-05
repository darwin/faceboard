(ns faceboard.css.places
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> places-board
     {:margin (px 20)})])
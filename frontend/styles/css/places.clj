(ns styles.css.places
  (:use [styles.lib.constants])
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> places-board
     {:margin (px 20)})])
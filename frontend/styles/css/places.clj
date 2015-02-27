(ns styles.css.places
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> places-board
     {:margin (px 20)})])
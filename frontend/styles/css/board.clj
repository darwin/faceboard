(ns styles.css.board
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> board-view
     {:font-family "'Kalam', cursive"
      :height      "100%"}
     (>> [> *]
       {:height "100%"})
     (>> left-side
       {:width "80%"})
     (>> &.dual-mode
       (>> [> *]
         {:width   "50%"
          :display "inline-block"})
       (>> left-side
         {:float "left"})
       (>> right-side
         {:float "right"})))])
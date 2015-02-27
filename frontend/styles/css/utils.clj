(ns styles.css.utils
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> clear
     {:clear :both})
   (>> hide
     {:visibility :hidden})
   (>> no-select
     {:-webkit-touch-callout :none
      :-webkit-user-select :none
      :-khtml-user-select :none
      :-moz-user-select :none
      :-ms-user-select :none
      :user-select :none})])
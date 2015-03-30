(ns faceboard.css.utils
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> clear
     [:clear :both])
   (>> clearfix:after
     [:content "\"\""
      :display :table
      :height (px 0)
      :line-height (px 0)
      :clear :both])
   (>> hide
     [:visibility :hidden])
   (>> no-select
     [:-webkit-touch-callout :none
      :-webkit-user-select :none
      :-khtml-user-select :none
      :-moz-user-select :none
      :-ms-user-select :none
      :user-select :none])])
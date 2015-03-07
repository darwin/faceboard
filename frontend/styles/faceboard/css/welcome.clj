(ns faceboard.css.welcome
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> welcome-page
     (>> teaser
       [:border (str "4px solid " signature-color)]
       (>> :img
         [:width "100%"
          :display :block]))
     (>> buttons
       [:margin-top (px 30)
        :text-align :center]))])
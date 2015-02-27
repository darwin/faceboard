(ns styles.garden
  (:require
    [garden.def :refer [defstyles]]
    [garden.stylesheet :refer [at-import]]
    [styles.css.page :as page]
    [styles.css.logo :as logo]
    [styles.css.top_bar :as top_bar]
    [styles.css.tabs :as tabs]
    [styles.css.board :as board]
    [styles.css.menu :as menu]))

(def ad-hoc
  [#_[:body {:background-color "#eee"}]])

(def imports
  [(at-import "http://fonts.googleapis.com/css?family=Exo:800")
   (at-import "http://fonts.googleapis.com/css?family=Kalam:400,700")])

(def all-styles
  [imports
   page/styles
   top_bar/styles
   logo/styles
   menu/styles
   tabs/styles
   board/styles
   ad-hoc])

; fully generated stylesheet => resources/public/css/garden.css
; see project.clj :garden 
(defstyles garden
  (vec (apply concat all-styles)))
(ns faceboard.garden
  (:require
    [garden.def :refer [defstyles]]
    [garden.stylesheet :refer [at-import]]
    [faceboard.css.utils :as utils]
    [faceboard.css.page :as page]
    [faceboard.css.logo :as logo]
    [faceboard.css.topbar :as topbar]
    [faceboard.css.tabs :as tabs]
    [faceboard.css.board :as board]
    [faceboard.css.editor :as editor]
    [faceboard.css.welcome :as welcome]
    [faceboard.css.error :as error]
    [faceboard.css.test :as test]
    [faceboard.css.loading :as loading]
    [faceboard.css.people :as people]
    [faceboard.css.places :as places]
    [faceboard.css.iframe :as iframe]
    [faceboard.css.menu :as menu]))

(def ad-hoc
  [
  #_[:body {:background-color "#eee"}]])

(def imports
  [(at-import "http://fonts.googleapis.com/css?family=Exo:800")
   (at-import "http://fonts.googleapis.com/css?family=Kalam:400,700")])

(def all-styles
  [imports
   utils/styles
   page/styles
   topbar/styles
   logo/styles
   menu/styles
   tabs/styles
   board/styles
   editor/styles
   welcome/styles
   error/styles
   test/styles
   loading/styles
   people/styles
   places/styles
   iframe/styles
   ad-hoc])

; fully generated stylesheet => resources/public/css/garden.css
; see project.clj :garden 
(defstyles garden
  (vec (apply concat all-styles)))
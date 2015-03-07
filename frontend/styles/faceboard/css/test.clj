(ns faceboard.css.test
  (:use [faceboard.lib.constants])
  (:require [faceboard.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> test-page
     (>> :a
       [:display :block]))])
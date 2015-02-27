(ns styles.css.page
  (:require [styles.lib.helpers :refer [>> mv px]]))

(def styles
  [(>> page [page page-content]
     {:height "100%"})])
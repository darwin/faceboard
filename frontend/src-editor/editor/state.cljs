(ns editor.state
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]))

(defonce app-state
  (atom
    {:editor-path []
     :editor-content ""}))
(ns editor.state
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]))

(defonce app-state
  (atom {:status ""
         :editor {:editor-path []
                  :editor-content ""}}))
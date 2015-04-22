(ns editor.state
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]]))

(defonce app-state
  (atom {:status ""
         :editor {:editor-path []
                  :editor-content ""}}))
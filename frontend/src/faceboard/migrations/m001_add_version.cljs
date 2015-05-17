(ns faceboard.migrations.m001-add-version
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]]))

(defn add-version [model]
  (assoc model :version 2))
(ns faceboard.migrations.m001_add_version
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn add-version [model]
  (assoc model :version 2))
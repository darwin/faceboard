(ns faceboard.model
  (:refer-clojure :exclude [set])
  (:require [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.utils :refer [json->model]]))

(defn toggle [state path]
  (update-in state path #(not %)))

(defn disable [state path]
  (assoc-in state path false))

(defn enable [state path]
  (assoc-in state path true))

(defn set [state path value]
  (assoc-in state path value))
(ns faceboard.schema
  (:require [faceboard.controller :refer [perform!]]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(def current-version 2)

(defmulti evolve-one-step (fn [_ version] version))

(defmethod evolve-one-step :default [model version]
  (perform! :switch-view :error {:message (str "Schema version " version " is missing. This is a technical issue.")})
  model)

(defmethod evolve-one-step 1 [model _]
  (assoc model :version 2))                                 ; introduce version

(defn evolve-model-schema [model range]
  (let [new-version (inc (last range))]
    (log (str "Evolving model schema from version " (first range) " to " new-version) model)
    (assoc (reduce evolve-one-step model range) :version new-version)))

(defn- the-app-is-old-msg [model-version]
  (str "This web page is running old code which does not support new data structure yet
 (app schema version is " current-version " and received data version is " model-version ").
 Try to fully reload your browser."))

(defn- present-error [model-version]
  (perform! :switch-view :error {:message (the-app-is-old-msg model-version)})
  nil)

(defn upgrade-schema-if-needed [model]
  (when model
    (let [model-version (get model :version 1)]
      (cond
        (> model-version current-version) (present-error model-version)
        (< model-version current-version) (evolve-model-schema model (range model-version current-version))
        :else model))))
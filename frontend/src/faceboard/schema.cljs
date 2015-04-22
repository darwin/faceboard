(ns faceboard.schema
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [faceboard.controller :refer [perform!]]
            [faceboard.migrations.m001_add_version :refer [add-version]]
            [faceboard.migrations.m002_people_board_content_object :refer [convert-people-content-to-object]]))

(def current-version 3)

(defmulti migrate-model (fn [_ version] version))

(defmethod migrate-model :default [model version]
  (perform! :switch-view :error {:message (str "Schema version " version " is missing. This is a technical issue.")})
  model)

(defmethod migrate-model 1 [model _]
  (add-version model))

(defmethod migrate-model 2 [model _]
  (convert-people-content-to-object model))

(defn convert-model-to-plain-objects [model]
  (js->clj (clj->js model) :keywordize-keys true))          ; TODO: there must be a better way

; I encountered a problem when model given as an input was containing Om cursors
; newly assembled model after migrations applied could contain those Om cursors but with broken paths
; => this led to cryptic failures later
(defn evolve-model-schema [model range]
  (let [new-version (inc (last range))]
    (log-info (str "Evolving model schema from version " (first range) " to " new-version) model)
    (let [new-model (assoc (reduce migrate-model model range) :version new-version)]
      (convert-model-to-plain-objects new-model))))

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
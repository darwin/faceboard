(ns faceboard.helpers.gizmos
  (:require [faceboard.helpers.underscore :refer [debounce]]
            [faceboard.controller :refer [perform!]]
            [phalanges.core :as phalanges]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(def default-gizmo-commit-debounce-time 1000)

(defn debounce-commit [f] (debounce f default-gizmo-commit-debounce-time))

(defn handler
  ([commit-fn] (handler commit-fn default-gizmo-commit-debounce-time))
  ([commit-fn time]
   (let [debounced-commit-fn (debounce commit-fn time)]
     (fn [e]
       (let [value (.. e -target -value)]
         (debounced-commit-fn value)))))
  ([commit-fn time value-atom]
   (let [debounced-commit-fn (debounce commit-fn time)]
     (fn [_]
       (debounced-commit-fn @value-atom)))))

(defn gizmo-form-key-down [e]
  (let [key (phalanges/key-set e)]
    (condp #(contains? %2 %1) key
      :esc (perform! :toggle-gizmo)                         ; close gizmo on ESC
      nil)))
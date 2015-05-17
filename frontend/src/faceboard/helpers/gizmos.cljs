(ns faceboard.helpers.gizmos
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [faceboard.helpers.underscore :refer [debounce]]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.utils :refer [swallow]]
            [phalanges.core :as phalanges]))

(def default-gizmo-commit-debounce-time 1000)
(def max-gizmo-width-left 500)
(def max-gizmo-width-right 500)

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
      :enter (swallow e)                                    ; prevents activating "x" buttons in social gizmo
      nil)))
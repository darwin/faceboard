(ns faceboard.utils
  (:require [om.core :as om]))

(defn- log-method [method & args]
  (.apply (aget js/console method) js/console (into-array args)))

(defn log [& args]
  (apply log-method (cons "log" args)))

(defn log-err [& args]
  (apply log-method (cons "error" args)))

(defn log-warn [& args]
  (apply log-method (cons "warn" args)))

(defn model->json [model]
  (.stringify js/JSON (clj->js model) nil 2))
(ns faceboard.animator
  (:require [cljs.core.async :refer [<! >! timeout]]
            [faceboard.model :as model]
            [faceboard.controller :refer [perform! command-chan]]
            [faceboard.logging :refer [log log-err log-warn log-info]])
  (:require-macros [cljs.core.async.macros :refer [go go-loop]]))

(defonce ^:dynamic *anim-generations* #js {})

(defn- build-prefixes [path]
  (loop [work path
         cur []
         res []]
    (if (empty? work)
      res
      (let [head (first work)
            rest (rest work)
            next (conj cur head)]
        (recur rest next (conj res next))))))

(defn- path->key [path]
  (apply str path))

(defn- get-generation [path]
  (or (aget *anim-generations* (path->key path)) 0))

(defn- set-generation [path value]
  (aset *anim-generations* (path->key path) value))

(defn- collect-generations [paths]
  (map #(get-generation %) paths))

(defn- get-current-phase [path]
  (model/get path))

(defn- generations->token [generations]
  (apply str (interpose "#" generations)))

(defn animate [anim]
  (let [{:keys [path timing]} anim]
    (perform! :start-anim path)
    (go-loop [current-phase 0]
      (let [prefixes (build-prefixes path)                  ; animation can be invalidated using any prefix
            pre-generations (collect-generations prefixes)
            pre-check (generations->token pre-generations)]
        (<! (timeout (nth timing current-phase)))           ; wait for the specified time for current phase
        (let [post-generations (collect-generations prefixes)
              post-check (generations->token post-generations)]
          (when (= pre-check post-check)                    ; still valid?
            (let [next-phase (inc current-phase)]
              (if (< next-phase (count timing))
                (do
                  (perform! :animate path current-phase)
                  (recur next-phase))
                (perform! :stop-anim path)))))))))

; a quick way how to invalidate animations in-flight
(defn invalidate-animations [path]
  (let [current-gen (get-generation path)
        next-gen (inc current-gen)]
    (set-generation path next-gen)))

(defn anim-phase [anim]
  (let [{:keys [path]} anim
        current-phase (get-current-phase path)]
    current-phase))

(defn anim-class [anim prefix]
  (if-let [phase (anim-phase anim)]
    (str prefix prefix "-phase" phase)))



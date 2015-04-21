(ns faceboard.helpers.utils
  (:require [om-tools.dom :as dom]
            [cemerick.pprng :as pprng]
            [cuerdas.core :as str]))

(defn model->json [model]
  (.stringify js/JSON (clj->js model) nil 2))

(defn json->model [json]
  (let [obj (.parse js/JSON json)]
    (js->clj obj :keywordize-keys true)))

(defn non-sanitized-div [content]
  (if content
    (dom/div {:dangerouslySetInnerHTML #js {:__html content}})
    (dom/div)))                                             ; note: nil content would cause firing React's assertion

(defn find-first [f coll]
  (first (filter f coll)))

(defn css-transform [transform]
  {:transform         transform
   :-webkit-transform transform
   :-moz-transform    transform
   :-ms-transform     transform})

(defn first-word [string]
  (let [parts (str/split (str/trim string) #" " 2)]
    (first parts)))

(defn rng
  ([seed min max] (let [random-generator (pprng/rng seed)
                        range (- max min)]
                    (+ min (pprng/int random-generator range))))
  ([seed generation min max] (rng (+ seed generation) min max)))

(defn swallow [e]
  (.stopPropagation e)
  (.preventDefault e))

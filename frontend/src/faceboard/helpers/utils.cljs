(ns faceboard.helpers.utils
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om-tools.dom :as dom]
            [cemerick.pprng :as pprng]
            [cuerdas.core :as str]
            [cljs-uuid.core :as uuid]))

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

; from http://stackoverflow.com/a/18319708/84283
(defn vec-remove
  "remove elem in coll"
  [coll pos]
  (vec (concat (subvec coll 0 pos) (subvec coll (inc pos)))))

; dissoc aware of vectors
(defn dissoc-path [data path]
  (let [key (last path)
        selector (pop path)
        leaf (get-in data selector)]
    (cond
      (map? leaf) (assoc-in data selector (dissoc leaf key))
      (vector? leaf) (assoc-in data selector (vec-remove leaf key))
      :else (do
              (log-err (str "dissoc-path: add support for " leaf))
              data))))

(defn provide-unique-human-friendly-id [prefix existing-ids]
  (let [ids (remove #(not (str/starts-with? % prefix)) existing-ids)
        non-colliding-id? (fn [id] (if (not-any? #(= % id) ids) id))
        suggest-id (fn [num] (str prefix num))
        suggestions (concat [prefix] (map #(suggest-id %) (iterate inc 2)))]
    (some non-colliding-id? suggestions)))

(defn generate-board-id []
  (let [guid (str/ireplace (str (uuid/make-random)) #"-" "")]
    (str/slice guid 0 20)))

(defn human-str-join
  ([words] (human-str-join words ", " " and "))
  ([words separator last-separator]
   (cond
     (empty? words) ""
     (= (count words) 1) (first words)
     :else (let [words-but-last (butlast words)
                 last-word (last words)]
             (apply str (concat (interpose separator words-but-last) [last-separator last-word]))))))
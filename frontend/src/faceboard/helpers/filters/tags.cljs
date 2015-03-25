(ns faceboard.helpers.filters.tags
  (:require [cuerdas.core :as str]
            [clojure.set :refer [subset?]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn- add-person-to-tag-report [report person-id]
  (if-not report
    {:count  1
     :people [person-id]}
    (update (update report :count inc) :people #(conj % person-id))))

(defn- tags-tally-reducer [tally person]
  (let [id (:id person)
        tags (:tags person)
        reducer (fn [tally tag]
                  (update tally tag #(add-person-to-tag-report % id)))]
    (reduce reducer tally tags)))

(defn- sorted-list-of-tags-by-size [tally]
  (reverse (sort #(compare (:count (get tally %1)) (:count (get tally %2))) (reverse (sort (filter #(not (nil? %)) (keys tally)))))))

(defn build-tags-tally [people]
  (let [tally (reduce tags-tally-reducer {} people)]
    {:tally        tally
     :tags-by-size (sorted-list-of-tags-by-size tally)}))

(defn tags-filter-predicate [selected-tags person]
  (let [person-tags (set (:tags person))]
    (subset? selected-tags person-tags)))
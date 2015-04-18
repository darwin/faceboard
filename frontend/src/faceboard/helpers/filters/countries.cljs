(ns faceboard.helpers.filters.countries
  (:require [cuerdas.core :as str]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn- add-person-to-country-report [report person-id]
  (if-not report
    {:count  1
     :people [person-id]}
    (update (update report :count inc) :people #(conj % person-id))))

(defn- countries-tally-reducer [tally person]
  (let [id (:id person)
        country-code (get-in person [:bio :country])]
    (update tally country-code #(add-person-to-country-report % id))))

(defn- sorted-list-of-countries-by-size [tally]
  (let [compare #(compare (:count (get tally %1)) (:count (get tally %2)))]
    (reverse (sort compare (reverse (sort (filter #(not (nil? %)) (keys tally))))))))

(defn build-countries-tally [people]
  (let [tally (reduce countries-tally-reducer {} people)]
    {:tally             tally
     :countries-by-size (sorted-list-of-countries-by-size tally)}))

(defn countries-filter-predicate [selected-countries person]
  (if-let [country-code (get-in person [:bio :country])]
    (contains? selected-countries country-code)))
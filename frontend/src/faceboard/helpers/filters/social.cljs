(ns faceboard.helpers.filters.social
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [cuerdas.core :as str]
            [clojure.set :refer [subset?]]
            [faceboard.helpers.social :refer [social-info]]))

(defn- known-labels [data]
  (let [{:keys [type label icon]} (social-info data)]
    (if type
      [[label icon]]
      [])))

(defn- person->socials [person]
  (mapcat known-labels (:social person)))

(defn- add-person-to-social-report [report person-id icon]
  (if-not report
    {:count  1
     :icon   icon
     :people [person-id]}
    (update (update report :count inc) :people #(conj % person-id))))

(defn- socials-tally-reducer [tally person]
  (let [id (:id person)
        socials (person->socials person)
        reducer (fn [tally [label icon]]
                  (update tally label #(add-person-to-social-report % id icon)))]
    (reduce reducer tally socials)))

(defn- sorted-list-of-socials-by-size [tally]
  (let [comparer #(compare (:count (get tally %1)) (:count (get tally %2)))]
    (reverse (sort comparer (keys tally)))))

(defn build-socials-tally [people]
  (let [tally (reduce socials-tally-reducer {} people)]
    {:tally           tally
     :socials-by-size (sorted-list-of-socials-by-size tally)}))

(defn socials-filter-predicate [selected-socials person]
  (let [person-socials (set (map first (person->socials person)))]
    (subset? selected-socials person-socials)))
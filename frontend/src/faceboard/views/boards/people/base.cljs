(ns faceboard.views.boards.people.base
  (:require [faceboard.helpers.filters.groups :refer [groups-filter-predicate]]
            [faceboard.helpers.filters.countries :refer [countries-filter-predicate]]
            [faceboard.helpers.filters.tags :refer [tags-filter-predicate]]
            [faceboard.helpers.filters.social :refer [socials-filter-predicate]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(def person-card-z-level 100)

(defn is-person-kept? [filter-predicates person]
  (every? true? (map #(% person) filter-predicates)))

(def is-person-filtered? (complement is-person-kept?))

(defn build-groups-filter-predicate [active-filters groups]
  (if-let [active-groups (:groups active-filters)]
    (when-not (empty? active-groups)
      (partial groups-filter-predicate groups active-groups))))

(defn build-countries-filter-predicate [active-filters]
  (if-let [active-countries (:countries active-filters)]
    (when-not (empty? active-countries)
      (partial countries-filter-predicate active-countries))))

(defn build-tags-filter-predicate [active-filters]
  (if-let [active-tags (:tags active-filters)]
    (when-not (empty? active-tags)
      (partial tags-filter-predicate active-tags))))

(defn build-socials-filter-predicate [active-filters]
  (if-let [active-socials (:socials active-filters)]
    (when-not (empty? active-socials)
      (partial socials-filter-predicate active-socials))))

(defn build-filter-predicates [active-filters data]
  (let [predicates [(build-groups-filter-predicate active-filters (get-in data [:content :groups]))
                    (build-countries-filter-predicate active-filters)
                    (build-tags-filter-predicate active-filters)
                    (build-socials-filter-predicate active-filters)]]
    (remove nil? predicates)))

(defn filter-people-except [except-filter data]
  (let [people (get-in data [:content :people])
        active-filters (dissoc (get-in data [:ui :filters :active]) except-filter)
        filter-predicates (build-filter-predicates active-filters data)]
    (remove #(is-person-filtered? filter-predicates %) people)))

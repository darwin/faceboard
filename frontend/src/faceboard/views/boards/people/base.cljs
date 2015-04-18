(ns faceboard.views.boards.people.base
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]))

(def person-card-z-level 100)

(defn is-person-kept? [filter-predicates person]
  (every? true? (map #(% person) filter-predicates)))

(defn is-person-filtered? [filter-predicates person]
  (not (is-person-kept? filter-predicates person)))


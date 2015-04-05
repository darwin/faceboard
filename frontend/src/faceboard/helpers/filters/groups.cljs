(ns faceboard.helpers.filters.groups
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]))

(defn known-person-id? [people id]
  (some #(= (:id %) id) people))

(defn safe-list [people list]
  (filter (partial known-person-id? people) list))

(defn group->report [people group]
  (let [list (safe-list people (:list group))]
    [(:id group) {:people list
                  :count  (count list)
                  :id     (:id group)
                  :label  (:label group)
                  :title  (:title group)}]))

(defn groups->tally [people groups]
  (apply hash-map (mapcat (partial group->report people) groups)))

(defn build-groups-tally [people groups]
  {:tally          (groups->tally people groups)
   :ordered-groups (map :id groups)})

(defn lookup-group-by-id [groups id]
  (some #(when (= (:id %) id) %) groups))

(defn belongs? [groups person group-id]
  (let [group (lookup-group-by-id groups group-id)
        people-ids (set (:list group))]
    (contains? people-ids (:id person))))

(defn groups-filter-predicate [groups selected-groups person]
  (every? true? (map (partial belongs? groups person) selected-groups)))
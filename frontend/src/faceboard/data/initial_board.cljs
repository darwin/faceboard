(ns faceboard.data.initial_board
  (:require [faceboard.schema :as schema]))

; initial board data when user creates a board from scratch

(def example-people
  [{:id  "adam"
    :bio {:name "Adam"}}
   {:id  "eve"
    :bio {:name "Eve"}}])

(def example-places
  [{:id   :place1
    :name "An's"}])

(defn initial-board []
  (schema/upgrade-schema-if-needed
    {:version 2
     :board   {:name "our group"}
     :tabs    [{:id      "people"
                :label   "People"
                :kind    "people"
                :content example-people}
               {:id      "places"
                :label   "Places"
                :kind    "places"
                :content example-places}]}))
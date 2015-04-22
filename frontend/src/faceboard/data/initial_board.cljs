(ns faceboard.data.initial_board
  (:require [faceboard.schema :as schema]))

; initial board data when user creates a board from scratch

(def example-people
  {:people [{:id "person"}]})

(defn initial-board []
  (schema/upgrade-schema-if-needed
    {:version 3
     :board   {:name "my faceboard"}
     :tabs    [{:id      "people"
                :label   "People"
                :kind    "people"
                :content example-people}]}))
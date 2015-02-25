(ns faceboard.data.initial_board)

; initial board data when user creates a board from scratch

(def example-people
  {:person1 {:name      "Adam"}
   :person2 {:name      "Eve"}})

(def example-places {})

(def initial-board
  {:board-name "our group"
   :people     example-people
   :places     example-places})
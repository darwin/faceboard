(ns faceboard.data.initial_board)

; initial board data when user creates a board from scratch

(def example-people
  [{:id   :person1
    :name "Adam"}
   {:id   :person2
    :name "Eve"}])

(def example-places
  [{:id   :place1
    :name "An's"}])

(def initial-board
  {:board {:name "our group"}
   :tabs  [{:id      "people"
            :label   "People"
            :kind    "people"
            :content example-people}
           {:id      "places"
            :label   "Places"
            :kind    "places"
            :content example-places}]})
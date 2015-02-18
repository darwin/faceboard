(ns faceboard.fixtures)

; just some sample data until we get editing working...

(def hackerparadise-people
  [{:name "Tony"
    :full-name "Antonin Hildebrand"
    :nick "darwin"
    :country "cz"
    :tags ["objective-c" "c++" "clojure" "coffeescript" "ruby" "bitcoin" "totalfinder" "binaryage"]}
   {:name "Alexey"
    :tags ["python" "ruby" "coffeescript"]}
   {:name "Casey"
    :tags ["go"]}
   {:name "Nicole"
    :tags ["design"]}])

(def hackerparadise-places
  [{:name "An's"
    :description "Great coffee"}
   {:name "Tam's"
    :description "Best burgers in the town"}])
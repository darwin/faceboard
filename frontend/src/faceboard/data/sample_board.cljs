(ns faceboard.data.sample_board)

; just some sample data until we get editing working...

; country codes: http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2

(def hackerparadise-people
  [{:id     "tony"
    :bio    {:name      "Tony"
             :photo     {:url "https://media.licdn.com/mpr/mpr/shrink_200_200/p/3/000/000/340/25abdea.jpg"}
             :full-name "Antonin Hildebrand"
             :email     "antonin@hildebrand.cz"
             :country   "cz"}
    :tags   ["objective-c"
             "c++"
             "clojure"
             "coffeescript"
             "ruby"
             "bitcoin"
             "totalfinder"
             "binaryage"]
    :social ["facebook|antonin.hildebrand"
             "linkedin|hildebrand"
             "github|darwin"
             "twitter|dr_win"
             "reddit|dr_win"
             "hacker-news|dr_win"
             "flickr|woid"
             "lastfm|woid"
             "web|http://about.me/darwin"
             "binaryage|http://www.binaryage.com"]}
   {:id   "alexey"
    :bio  {:name      "Alexey"
           :full-name "Alexey Komissarouk"
           :photo     {:url "https://dl.dropboxusercontent.com/u/559047/alexey.png"}
           :country   "ua"}
    :tags ["python" "ruby" "coffeescript"]}
   {:id   "casey"
    :bio  {:name  "Casey"
           :photo {:url "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfa1/v/t1.0-1/p320x320/10922481_10203659752437972_2370943592623339289_n.jpg?oh=1ac1307dfc8d82940d72d88180647a99&oe=55596ACD&__gda__=1430872829_0a138cd9d51b45e5a64ecab91eb7c6ed"}}
    :tags ["go"]}
   {:id   "nicole"
    :bio  {:name    "Nicole"
           :photo   {:url "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfa1/v/t1.0-1/p320x320/10881546_10152973877694314_4257642747410385209_n.jpg?oh=b8d2a194c71b1a1717fd95d2ed58c0d9&oe=5588B5AD&__gda__=1435535261_13840be1f86414a6fe6b67ff99c84839"}
           :country "us"}
    :tags ["design"]}])

(def hackerparadise-places
  {:ans  {:name        "An's"
          :description "Great coffee"}
   :tams {:name        "Tam's"
          :description "Best burgers in the town"}})

(def sample-board
  {:board  {:name "hacker paradise"}
   :people hackerparadise-people
   :places hackerparadise-places})
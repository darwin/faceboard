(ns faceboard.state
  (:require [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.fixtures :as fixtures]))

(defonce app-state
  (atom
    {:model {:board-name "hacker paradise"
             :people     fixtures/hackerparadise-people
             :places     fixtures/hackerparadise-places}
     :ui    {:view            :welcome
             :selected-tab-id :people
             :tabs            [{:id :people :label "People"}
                               {:id :places :label "Places"}]
             :editing?        false
             :model-editing?  false
             :extended-set    #{}
             }
     }))
(ns faceboard.state
  (:require [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.fixtures :as fixtures]))

(defonce app-state
  (atom
    {:model {:people fixtures/hackerparadise-people
             :places fixtures/hackerparadise-places}
     :ui    {:selected-tab-id :people
             :tabs            [{:id :people :label "People"}
                               {:id :places :label "Places"}]
             :editing?        false
             :model-editing? false
             }
     }))
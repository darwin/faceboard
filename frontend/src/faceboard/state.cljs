(ns faceboard.state
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.data.sample_board :refer [sample-board]]))

(defonce app-state
  (atom
    {:model {}
     :ui    {:view         :blank
             :view-params  nil
             :editor-path  nil
             :loading?     0
             :extended-set #{}
             :filters      {:expanded-set #{:groups :countries :socials :tags}
                            :active       {:groups    #{}
                                           :countries #{}
                                           :socials   #{}
                                           :tags      #{}}}}
     :anims {}
     :cache {:tabs {}}
     :transient {}}))
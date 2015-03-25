(ns faceboard.state
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.data.sample_board :refer [sample-board]]))

(defonce app-state
  (atom
    {:model {}
     :ui    {:view            :blank
             :view-params     nil
             :editing?        false
             :model-editing?  false
             :loading?        0
             :extended-set    #{}
             :filters {:expanded-set #{}
                       :active {:countries #{}}}}
     :anims {}
     :cache {:tabs {}}}))
(ns faceboard.state
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.data.sample_board :refer [sample-board]]))

(defonce app-state
  (atom
    {:model {}
     :ui    {:view           :blank
             :view-params    nil
             :editing?       false
             :model-editing? false
             :editor-path    nil
             :loading?       0
             :extended-set   #{}
             :filters        {:expanded-set #{:countries}
                              :active       {:countries #{}
                                             :tags      #{}}}}
     :anims {}
     :cache {:tabs {}}}))
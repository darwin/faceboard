(ns faceboard.state
  (:require [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.data.sample_board :refer [sample-board]]))

(defonce app-state
  (atom
    {:model sample-board
     :ui    {:view            :blank
             :view-params     nil
             :selected-tab-id :people
             :editing?        false
             :model-editing?  false
             :loading?        false
             :extended-set    #{}}
     :anims {}}))
(ns faceboard.state
  (:require [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.data.sample_board :refer [sample-board]]))

(defonce app-state
  (atom
    {:model {}
     :ui    {:view            :blank
             :view-params     nil
             :editing?        false
             :model-editing?  false
             :loading?        0
             :extended-set    #{}}
     :anims {}
     :cache {:tabs {}}}))
(ns faceboard.state
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [faceboard.data.sample_board :refer [sample-board]]))

(defonce app-state
  (atom
    {:model     {}
     :ui        {:view         :blank
                 :view-params  nil
                 :show-editor  false
                 :editor-path  nil
                 :editing?     false
                 :gizmo        {:active nil}
                 :loading?     0
                 :extended-set #{}
                 :filters      {:expanded-set #{:groups :countries :socials :tags}
                                :active       {:groups    #{}
                                               :countries #{}
                                               :socials   #{}
                                               :tags      #{}}
                                :revertible   {}}}
     :anims     {}
     :cache     {:tabs {}}
     :transient {}}))
(ns faceboard.app
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [faceboard.env :as env]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.state :refer [app-state]]
            [faceboard.views.main :refer [main-component]]
            [faceboard.dispatcher :as dispatcher]))

(defn- root-app-element []
  (.getElementById js/document "app"))

(defn init! []
  (dispatcher/start-handling-commands))

(defn mount! []
  (om/root main-component app-state {:target (root-app-element)}))

(when env/local?
  (aset js/window "faceboard_reloader" mount!))
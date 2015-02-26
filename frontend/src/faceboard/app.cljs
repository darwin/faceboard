(ns faceboard.app
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.state :refer [app-state]]
            [faceboard.views.main :refer [main-component]]
            [faceboard.dispatcher :as dispatcher]))

(defn- root-app-element []
  (.getElementById js/document "app"))

(defn init! []
  (om/root main-component app-state {:target (root-app-element)})
  (dispatcher/start-handling-commands))
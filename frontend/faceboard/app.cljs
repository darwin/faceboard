(ns faceboard.app
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.state :refer [app-state]]
            [faceboard.views.main :refer [main-component]]
            [faceboard.controller :as controller]))

(defn init! []
  (om/root main-component app-state {:target (.getElementById js/document "app")})
  (controller/start-processing-commands))
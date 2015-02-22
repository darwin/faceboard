(ns faceboard.app
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.state :as state :refer [app-state]]
            [faceboard.controller :as controller]
            [faceboard.info_banner :as info-banner]
            [faceboard.board :as board]
            [faceboard.env :as env]))

(defcomponent app-component [data _ _]
  (render [_]
    (dom/div {:class "app-box"}
      (om/build board/board-component data))))

(defn init! []
  (om/root app-component app-state {:target (.getElementById js/document "app")})
  (controller/start-processing-commands))
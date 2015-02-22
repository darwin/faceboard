(ns faceboard.app
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.state :refer [app-state]]
            [faceboard.board :as board]
            [faceboard.welcome :as welcome]
            [faceboard.invalid :as invalid]
            [faceboard.controller :as controller]))

(defcomponent app-component [data _ _]
  (render [_]
    (dom/div {:class "app-box"}
      (let [view (get-in data [:ui :view] :view-key-not-found)]
        (condp = view                                       ; app-level view switching logic
          :welcome (om/build welcome/welcome-component data)
          :board (om/build board/board-component data)
          :invalid (om/build invalid/invalid-component data)
          (do
            (log-err "request to dispatch an unknown view: " view)
            (om/build invalid/invalid-component data)))))))

(defn init! []
  (om/root app-component app-state {:target (.getElementById js/document "app")})
  (controller/start-processing-commands))
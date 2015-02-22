(ns faceboard.views.main
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.views.board :refer [board-component]]
            [faceboard.views.welcome :refer [welcome-component]]
            [faceboard.views.invalid :refer [invalid-component]]))

(defcomponent main-component [data _ _]
  (render [_]
    (dom/div {:class "main-box"}
      (let [view (get-in data [:ui :view] :view-key-not-found)]
        (condp = view                                       ; app-level view switching logic
          :welcome (om/build welcome-component data)
          :board (om/build board-component data)
          :invalid (om/build invalid-component data)
          (do
            (log-err "request to dispatch an unknown view: " view)
            (om/build invalid-component data)))))))
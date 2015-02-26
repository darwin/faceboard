(ns faceboard.views.main
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.controller :refer [perform!]]
            [faceboard.views.board :refer [board-component]]
            [faceboard.views.welcome :refer [welcome-component]]
            [faceboard.views.loading :refer [loading-component]]
            [faceboard.views.error :refer [error-component]]))

(defcomponent main-component [data _ _]
  (render [_]
    (dom/div {:class "main-box"}
      (let [view (get-in data [:ui :view] :view-key-not-found)]
        (condp = view                                       ; app-level view switching logic
          :blank ""                                         ; blank view is rendered before router dispatches url
          :welcome (om/build welcome-component data)
          :loading (om/build loading-component data)
          :board (om/build board-component data)
          :error (om/build error-component data)
          (do
            (log-err "request to dispatch an unknown view: " view)
            (perform! :switch-view :error {:message "invalid app state"})))))))
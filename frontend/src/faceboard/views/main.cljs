(ns faceboard.views.main
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.controller :refer [perform!]]
            [faceboard.views.board :refer [board-component]]
            [faceboard.views.welcome :refer [welcome-component]]
            [faceboard.views.loading :refer [loading-component]]
            [faceboard.views.test :refer [test-component]]
            [faceboard.views.error :refer [error-component]]))

(defcomponent main-component [data _ _]
  (render [_]
    (dom/div {:class "main-box"}
      (let [view (get-in data [:ui :view] :view-key-not-found)
            view-params (get-in data [:ui :view-params] {})]
        (condp = view                                       ; app-level view switching logic
          :blank ""                                         ; blank view is rendered before router dispatches url
          :test (om/build test-component view-params)
          :welcome (om/build welcome-component view-params)
          :loading (om/build loading-component view-params)
          :error (om/build error-component view-params)
          :board (om/build board-component data)            ; pass full data cursor
          (do
            (log-err "request to dispatch an unknown view: " view)
            (perform! :switch-view :error {:message "Invalid app state."})))))))
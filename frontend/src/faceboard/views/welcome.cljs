(ns faceboard.views.welcome
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.views.logo :as logo]
            [faceboard.helpers.utils :refer [generate-board-id]]
            [faceboard.page :as page]))

(defcomponent welcome-component [_ _ _]
  (render [_]
    (page/page-skeleton
      (dom/div {:class "standard-page slim-layout welcome-page"}
        (om/build logo/big-logo-component {})
        (dom/div {:class "teaser no-select"}
          (dom/img {:src "images/faceboard-teaser.jpg"}))
        (dom/div {:class "buttons"}
          (dom/span {:class    "button"
                     :on-click #(perform! :create-board (generate-board-id))} "Create a new board"))))))
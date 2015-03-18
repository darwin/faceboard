(ns faceboard.views.welcome
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [cljs-uuid.core :as uuid]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.controller :refer [perform!]]
            [faceboard.views.logo :as logo]
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
                     :on-click #(perform! :create-board (str (uuid/make-random)))} "Create a new board"))))))
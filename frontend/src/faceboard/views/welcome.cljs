(ns faceboard.views.welcome
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [cljs-uuid.core :as uuid]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.controller :as controller :refer [perform!]]
            [faceboard.page :as page]))

(defcomponent welcome-component [data _ _]
  (render [_]
    (let [ui (:ui data)]
      (page/page-skeleton
        (dom/div {:class "standard-page welcome"}
          (dom/div {:class "big-logo no-select"}
            (dom/span {} "FACEBOARD"))
          (dom/div {:class "teaser no-select"}
            (dom/img {:src "images/faceboard-teaser.jpg"}))
          (dom/div {:class "buttons"}
            (dom/span {:class "button"
                       :on-click #(perform! "create-board" (str (uuid/make-random)))} "Create a new board")))))))
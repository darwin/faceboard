(ns faceboard.views.welcome
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [cljs-uuid.core :as uuid]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.controller :as controller]
            [faceboard.page :as page]))

(defcomponent welcome-component [data _ _]
  (render [_]
    (let [ui (:ui data)]
      (page/page-skeleton
        (dom/div {:class "standard-page welcome"}
          (dom/div {:class "big-logo"}
            (dom/span {} "FACEBOARD"))
          (dom/div {:class "teaser"}
            (dom/img {:src "images/faceboard-teaser.jpg"}))
          (dom/div {:class "buttons"}
            (dom/span {:class "button"
                       :on-click #(controller/perform-command! "create-board" (str (uuid/make-random)))} "Create a new board")))))))
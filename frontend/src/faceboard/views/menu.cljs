(ns faceboard.views.menu
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :as controller :refer [perform!]]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(defcomponent menu-button-component [data _ _]
  (render [_]
    (dom/div {:class    (str "menu-button" (when (:active? data) " active"))
              :on-click (:handler data)}
      (:label data))))

(defcomponent menu-component [data _ _]
  (render [_]
    (let [buttons [{:label   "edit"
                    :active? (:editing? data)
                    :handler #(perform! "toggle-edit")}
                   {:label   "model"
                    :active? (:model-editing? data)
                    :handler #(perform! "toggle-model")}]]
      (dom/div {:class "menu"}
        (om/build-all menu-button-component buttons)))))

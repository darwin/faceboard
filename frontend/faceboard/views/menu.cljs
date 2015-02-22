(ns faceboard.views.menu
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :as controller]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(defcomponent menu-button-component [data owner opts]
  (render [_]
    (dom/div {:class    (str "menu-button" (when (:active? data) " active"))
              :on-click (:handler data)}
      (:label data))))

(defcomponent menu-component [data owner opts]
  (render [_]
    (let [buttons [{:label   "edit"
                    :active? (:editing? data)
                    :handler #(controller/perform-command! "toggle-edit")}
                   {:label   "model"
                    :active? (:model-editing? data)
                    :handler #(controller/perform-command! "toggle-model")}]]
      (dom/div {:class "menu"}
        (om/build-all menu-button-component buttons)))))

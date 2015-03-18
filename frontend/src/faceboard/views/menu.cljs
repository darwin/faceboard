(ns faceboard.views.menu
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent menu-button-component [data _ _]
  (render [_]
    (dom/div {:class    (str "menu-button" (when (:active? data) " active") (when (:class data) (str " " (:class data))))
              :on-click (:handler data)}
      (:label data))))

(defcomponent menu-component [data _ _]
  (render [_]
    (let [buttons [{:label   "edit"
                    :class   "edit-button"
                    :active? (:editing? data)
                    :handler #(perform! :toggle-edit)}
                   {:label   "model"
                    :class   "model-button"
                    :active? (:model-editing? data)
                    :handler #(perform! :toggle-model)}]]
      (dom/div {:class "menu"}
        (om/build-all menu-button-component buttons)))))

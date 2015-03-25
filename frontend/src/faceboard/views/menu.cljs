(ns faceboard.views.menu
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent menu-button-component [data _ _]
  (render [_]
    (let [{:keys [label title icon active? class handler]} data]
      (dom/div {:class    (str "menu-button" (when active? " active") (when class (str " " class)))
                :title    title
                :on-click handler}
        (when icon
          (dom/i {:class (str "fa fa-" icon)}))
        (when label
          (dom/span {:class "label"} label))))))

(defcomponent menu-component [data _ _]
  (render [_]
    (let [buttons [{:label   "edit"
                    :class   "edit-button"
                    :active? (:editing? data)
                    :handler #(perform! :toggle-edit)}
                   {:icon    "cogs"
                    :title   "edit source data"
                    :class   "model-button"
                    :active? (:model-editing? data)
                    :handler #(perform! :toggle-model)}]]
      (dom/div {:class "menu"}
        (om/build-all menu-button-component buttons)))))

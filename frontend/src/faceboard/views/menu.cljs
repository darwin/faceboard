(ns faceboard.views.menu
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :refer [perform!]]))

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

(defcomponent menu-component [_ _ _]
  (render [_]
    (let [buttons [{:icon    "cogs"
                    :title   "edit source data"
                    :class   "model-button"
                    :active? true
                    :handler #(perform! :open-editor [:model] (.-shiftKey %))}]]
      (dom/div {:class "menu"}
        (om/build-all menu-button-component buttons)))))

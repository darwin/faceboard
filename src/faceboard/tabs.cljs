(ns faceboard.tabs
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils]
            [faceboard.logo :as logo]
            [faceboard.people :as people]
            [faceboard.places :as places]))

(defn tab->component [tab]
  (condp = (:id tab)
    :people people/people-component
    :places places/places-component
    people/people-component))                               ; default

(defn lookup-tab [id tabs]
  (let [result (first (filter #(= id (:id %)) tabs))]
    (when (nil? result)
      (utils/log-warn (str "unknow tab id '" id "' in ") tabs))
    result))

(defn tab-selected? [id tab]
  (= (:id tab) id))

(defcomponent tabs-component [data owner opts]
  (render [_]
    (let [{:keys [selected-tab-id tabs]} data
          selected-tab (lookup-tab selected-tab-id tabs)]
      (dom/div {:class "tabs"}
        (dom/div {:class "tab-bar"}
          (om/build logo/logo-component data {:opts opts})
          (for [tab tabs]
            (dom/div {:class    (str "tab" (when (tab-selected? selected-tab-id tab) " selected"))
                      :on-click #(om/update! data :selected-tab-id (:id tab))}
              (:label tab))))
        (dom/div {:class "tab-content"}
          (om/build (tab->component selected-tab) (:data selected-tab) {:opts opts}))))))
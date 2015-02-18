(ns faceboard.tabs
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.people :as people]
            [faceboard.places :as places]))

(defn tab->component [tab]
  (let [tab-id (:id tab)]
    (condp = (:id tab)
      :people people/people-component
      :places places/places-component
      (throw (str "unknow tab id '" tab-id "'")))))

(defn lookup-tab [id tabs]
  (first (filter #(= id (:id %)) tabs)))

(defcomponent tabs-component [data owner opts]
  (render [_]
    (let [{:keys [selected-tab-id tabs]} data
          selected-tab (lookup-tab selected-tab-id tabs)]
      (dom/div {:class "tabs"}
        (dom/div {:class "tab-bar"}
          (dom/div {:class "logo"}
            (dom/a {:href "/"} "faceboard"))
          (for [tab tabs]
            (dom/div {:class (str "tab" (when (= (:id tab) selected-tab-id) " selected"))
                      :on-click #(om/update! data :selected-tab-id (:id tab))}
              (:label tab))))
        (dom/div {:class "tab-content"}
          (om/build (tab->component selected-tab) (:data selected-tab) {:opts opts}))))))


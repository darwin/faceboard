(ns faceboard.app
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.fixtures :as fixtures]
            [faceboard.people :as people]
            [faceboard.places :as places]))

(defonce app-state
  (atom
    {:selected-tab-id :people
     :tabs [{:id :people :label "People" :data fixtures/hackerparadise-people}
            {:id :places :label "Places" :data fixtures/hackerparadise-places}]}))

(defn tab->component [tab]
  (let [tab-id (:id tab)]
    (condp = (:id tab)
      :people people/people-component
      :places places/places-component
      (throw (str "unknow tab id '" tab-id "'")))))

(defn lookup-tab [id tabs]
  (first (filter #(= id (:id %)) tabs)))

(defcomponent app-component [data owner opts]
  (render [_]
    (let [{:keys [selected-tab-id tabs]} data
          selected-tab (lookup-tab selected-tab-id tabs)]
      (dom/div {:class "tabs"}
        (dom/div {:class "tab-bar"}
          (for [tab tabs]
            (dom/div {:class (str "tab" (when (= (:id tab) selected-tab-id) " selected"))
                      :on-click #(om/update! data :selected-tab-id (:id tab))}
              (:label tab))))
        (dom/div {:class "tab-content"}
          (om/build (tab->component selected-tab) (:data selected-tab) {:opts opts}))))))

(defn init! []
  (om/root app-component app-state {:target (. js/document (getElementById "app"))}))



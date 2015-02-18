(ns faceboard.app
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.fixtures :as fixtures]
            [faceboard.tabs :as tabs]))

(defonce app-state
  (atom
    {:selected-tab-id :people
     :tabs            [{:id :people :label "People" :data fixtures/hackerparadise-people}
                       {:id :places :label "Places" :data fixtures/hackerparadise-places}]}))

(defcomponent app-component [data owner opts]
  (render [_]
    (dom/div {:class "app-box"}
      (om/build tabs/tabs-component data {:opts opts}))))

(defn init! []
  (om/root app-component app-state {:target (. js/document (getElementById "app"))}))
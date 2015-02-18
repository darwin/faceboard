(ns faceboard.app
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.fixtures :as fixtures]
            [faceboard.tabs :as tabs]))

(defonce app-state
  (atom
    {:model {:people fixtures/hackerparadise-people
             :places fixtures/hackerparadise-places}
     :ui    {:selected-tab-id :people
             :tabs            [{:id :people :label "People"}
                               {:id :places :label "Places"}]
             :editing?        false
             :source-editing? false
             }
     }))

(defcomponent app-component [data owner opts]
  (render [_]
    (dom/div {:class "app-box"}
      (om/build tabs/tabs-component data))))

(defn init! []
  (om/root app-component app-state {:target (. js/document (getElementById "app"))}))
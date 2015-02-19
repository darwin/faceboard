(ns faceboard.tabs
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.logo :as logo]
            [faceboard.menu :as menu]
            [faceboard.editor :as editor]
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
      (log-warn (str "unknow tab id '" id "' in ") tabs))
    result))

(defn tab-selected? [id tab]
  (= (:id tab) id))

(defn distile-selected-tab-model [data selected-tab-id]
  {:ui   (:ui data)
   :data (get (:model data) selected-tab-id)})

(defcomponent tabs-component [data owner opts]
  (render [_]
    (let [ui (:ui data)
          model (:model data)
          {:keys [selected-tab-id tabs]} ui
          selected-tab (lookup-tab selected-tab-id tabs)]
      (dom/div {:class "tabs"}
        (dom/div {:class "tab-bar no-select"}
          (om/build logo/logo-component {})
          (for [tab tabs]
            (dom/div {:class    (str "tab" (when (tab-selected? selected-tab-id tab) " selected"))
                      :on-click #(om/update! ui :selected-tab-id (:id tab))}
              (:label tab)))
          (om/build menu/menu-component ui))
        (dom/div {:class (str "tab-content" (when (:model-editing? ui) " dual-mode"))}
          (dom/div {:class "left-side"}
            (om/build (tab->component selected-tab) (distile-selected-tab-model data selected-tab-id)))
          (dom/div {:class "right-side"}
            (when (:model-editing? ui)
              (om/build editor/editor-component (utils/model->json model)))))))))

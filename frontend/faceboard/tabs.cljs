(ns faceboard.tabs
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.page :as page]
            [faceboard.menu :as menu]
            [faceboard.controller :as controller]
            [faceboard.editor :as editor]
            [faceboard.board_label :as board-label]
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

(defn selected-tab-model [data selected-tab-id]
  {:ui   (:ui data)
   :data (get-in data [:model selected-tab-id])})

(defcomponent tabs-component [data _ _]
  (render [_]
    (let [ui (:ui data)
          model (:model data)
          {:keys [selected-tab-id tabs]} ui
          selected-tab (lookup-tab selected-tab-id tabs)]
      (page/page-skeleton
        [(om/build board-label/board-label-component {:board-label (:board-name model)})
         (for [tab tabs]
           (dom/div {:class    (str "tab" (when (tab-selected? selected-tab-id tab) " selected"))
                     :on-click #(controller/perform-command! "switch-tab" (:id tab))}
             (:label tab)))
         (om/build menu/menu-component ui)]
        (dom/div {:class    (str "board-view" (when (:model-editing? ui) " dual-mode"))
                  :on-click #(controller/perform-command! "change-extended-set" #{})}
          (dom/div {:class "left-side"}
            (om/build (tab->component selected-tab) (selected-tab-model data selected-tab-id)))
          (dom/div {:class "right-side"}
            (when (:model-editing? ui)
              (om/build editor/editor-component (utils/model->json model)))))))))
(ns faceboard.views.board
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.controller :as controller]
            [faceboard.utils :refer [model->json]]
            [faceboard.page :as page]
            [faceboard.views.menu :refer [menu-component]]
            [faceboard.views.editor :refer [editor-component]]
            [faceboard.views.people :refer [people-component]]
            [faceboard.views.places :refer [places-component]]))

(defn tab->component [tab]
  (condp = (:id tab)
    :people people-component
    :places places-component
    people-component))                               ; default

(defn lookup-tab [id tabs]
  (let [result (first (filter #(= id (:id %)) tabs))]
    (when (nil? result)
      (log-warn (str "unknow tab id '" id "' in ") tabs))
    result))

(defn tab-selected? [id tab]
  (= (:id tab) id))

(defcomponent board-label-component [data _ _]
  (render [_]
    (dom/div {:class "board-label"}
      (if-let [board-label (:board-label data)]
        (dom/div {:class "label"}
          "/" (dom/a {:href "/"} board-label))))))

(defcomponent board-tabs-component [data _ _]
  (render [_]
    (dom/div {:class "tab-area"}
      (for [tab (:tabs data)
            :let [selected-tab-id (:selected-tab-id data)]]
        (dom/div {:class    (str "tab" (when (tab-selected? selected-tab-id tab) " selected"))
                  :on-click #(controller/perform-command! "switch-tab" (:id tab))}
          (:label tab))))))

(defcomponent board-content-component [data _ _]
  (render [_]
    (let [ui (:ui data)
          model (:model data)
          {:keys [selected-tab-id tabs model-editing?]} ui
          selected-tab (lookup-tab selected-tab-id tabs)]
      (dom/div {:class    (str "board-view" (when model-editing? " dual-mode"))
                :on-click #(controller/perform-command! "change-extended-set" #{})}
        (dom/div {:class "left-side"}
          (om/build (tab->component selected-tab) {:ui   ui
                                                   :data (selected-tab-id model)}))
        (dom/div {:class "right-side"}
          (when model-editing?
            (om/build editor-component (model->json model))))))))

(defcomponent board-component [data _ _]
  (render [_]
    (let [ui (:ui data)
          model (:model data)
          {:keys [selected-tab-id tabs]} ui]
      (page/page-skeleton
        ui
        [(om/build board-label-component {:board-label (:board-name model)})
         (om/build board-tabs-component {:tabs tabs :selected-tab-id selected-tab-id})
         (om/build menu-component ui)]
        (om/build board-content-component data)))))
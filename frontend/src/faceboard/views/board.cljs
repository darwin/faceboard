(ns faceboard.views.board
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.controller :refer [perform!]]
            [faceboard.router :as router]
            [faceboard.page :as page]
            [faceboard.views.logo :refer [logo-component]]
            [faceboard.views.menu :refer [menu-component]]
            [faceboard.views.editor :refer [editor-component]]
            [faceboard.views.people :refer [people-component]]
            [faceboard.views.places :refer [places-component]]))

(defn tab->component [tab]
  (condp = (:id tab)
    :people people-component
    :places places-component
    people-component))                                      ; default

(defn lookup-tab [id tabs]
  (let [result (first (filter #(= id (:id %)) tabs))]
    (when (nil? result)
      (log-warn (str "unknow tab id '" id "' in ") tabs))
    result))

(defn tab-selected? [id tab]
  (= (:id tab) id))

(defcomponent board-label-component [data _ _]
  (render [_]
    (if-let [board-label (:board-label data)]
      (dom/div {:class "board-label"}
        "/"
        (dom/span {:class "label"}
          (dom/a {:href (:board-url data)} board-label))))))

(defcomponent board-tabs-component [data _ _]
  (render [_]
    (dom/div {:class "tab-area"}
      (for [tab (:tabs data)
            :let [selected-tab-id (:selected-tab-id data)]]
        (dom/div {:class    (str "tab" (when (tab-selected? selected-tab-id tab) " selected"))
                  :on-click #(perform! :switch-tab (:id tab))}
          (:label tab))))))

(defcomponent board-content-component [data _ _]
  (render [_]
    (let [ui (:ui data)
          model (:model data)
          {:keys [selected-tab-id tabs model-editing?]} ui
          selected-tab (lookup-tab selected-tab-id tabs)]
      (dom/div {:class    (str "board-view" (when model-editing? " dual-mode"))
                :on-click #(perform! :change-extended-set #{})}
        (dom/div {:class "left-side"}
          (om/build (tab->component selected-tab) {:ui   ui
                                                   :data (selected-tab-id model)}))
        (dom/div {:class "right-side"}
          (when model-editing?
            (om/build editor-component model)))))))

(defcomponent board-component [data _ _]
  (render [_]
    (let [model (:model data)
          ui (:ui data)
          {:keys [selected-tab-id tabs loading?]} ui]
      (page/page-skeleton
        (dom/div {:class (str "loading-indicator" (when loading? " visible"))}
          (dom/img {:src "images/loader.gif"}))
        (dom/div {:class "top-bar no-select"}
          (om/build logo-component {})
          (om/build board-label-component {:board-label (get-in model [:board :name])
                                           :board-url   (router/current-route)})
          (om/build board-tabs-component {:tabs tabs :selected-tab-id selected-tab-id})
          (om/build menu-component ui))
        (dom/div {:class "tab-contents"}
          (om/build board-content-component data))))))
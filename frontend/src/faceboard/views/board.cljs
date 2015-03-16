(ns faceboard.views.board
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.controller :refer [perform!]]
            [faceboard.router :as router]
            [faceboard.page :as page]
            [faceboard.views.logo :refer [small-logo-component]]
            [faceboard.views.menu :refer [menu-component]]
            [faceboard.views.editor :refer [editor-component]]
            [faceboard.views.boards.people :refer [people-component]]
            [faceboard.views.boards.places :refer [places-component]]
            [faceboard.views.boards.iframe :refer [iframe-component]]
            [faceboard.views.boards.webget :refer [webget-component]]
            [faceboard.views.boards.gist :refer [gist-component]]
            [faceboard.views.boards.inkpad :refer [inkpad-component]]
            [faceboard.views.boards.generic :refer [generic-component]]))

(defn- tab->component [tab]
  (condp = (:kind tab)
    "people" people-component
    "places" places-component
    "iframe" iframe-component
    "webget" webget-component
    "gist" gist-component
    "inkpad" inkpad-component
    generic-component))

(defn- lookup-tab [id tabs]
  (let [result (first (filter #(= id (:id %)) tabs))]
    (or result (first tabs))))

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
      (let [{:keys [tabs selected-tab]} data]
        (for [tab tabs]
          (dom/div {:class    (str "tab" (when (= tab selected-tab) " selected"))
                    :on-click #(perform! :switch-tab (:id tab))}
            (:label tab)))))))

(defcomponent board-content-component [data _ _]
  (render [_]
    (let [{:keys [ui anims model selected-tab]} data
          {:keys [model-editing?]} ui]
      (dom/div {:class    (str "tab-view" (when model-editing? " dual-mode"))
                :on-click #(perform! :change-extended-set #{})}
        (dom/div {:class "left-side"}
          (let [kind (or (:kind selected-tab) "generic")
                id (:id selected-tab)]
            (dom/div {:class (str "board " kind "-board " (when id (str "id-" (:id selected-tab))))}
              (om/build (tab->component selected-tab) {:anims   anims
                                                       :ui      ui
                                                       :id      id
                                                       :content (:content selected-tab)
                                                       :cache (get-in data [:cache :tabs id])}))))
        (when model-editing?
          (dom/div {:class "right-side"}
            (om/build editor-component model)))))))

(defcomponent board-component [data _ _]
  (render [_]
    (let [{:keys [model ui anims cache]} data
          {:keys [tabs]} model
          {:keys [selected-tab-id loading?]} ui
          selected-tab (lookup-tab selected-tab-id tabs)]
      (page/page-skeleton
        (dom/div {:class (str "loading-indicator" (when (> loading? 0) " visible"))}
          (dom/i {:class "fa fa-refresh fa-spin"}))
        (dom/div {:class "top-bar no-select"}
          (om/build small-logo-component {})
          (om/build board-label-component {:board-label (get-in model [:board :name] "")
                                           :board-url   (router/current-route)})
          (om/build board-tabs-component {:tabs tabs :selected-tab selected-tab})
          (om/build menu-component ui))
        (dom/div {:class "tab-contents"}
          (om/build board-content-component {:ui           ui
                                             :anims        anims
                                             :model        model
                                             :cache        cache
                                             :selected-tab selected-tab}))))))
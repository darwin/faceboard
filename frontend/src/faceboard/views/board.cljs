(ns faceboard.views.board
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.controller :refer [perform!]]
            [faceboard.router :as router]
            [faceboard.page :as page]
            [faceboard.views.logo :refer [small-logo-component]]
            [faceboard.views.menu :refer [menu-component]]
            [faceboard.views.boards.people :refer [people-component]]
            [faceboard.views.boards.iframe :refer [iframe-component]]
            [faceboard.views.boards.webget :refer [webget-component]]
            [faceboard.views.boards.gist :refer [gist-component]]
            [faceboard.views.boards.inkpad :refer [inkpad-component]]
            [faceboard.views.boards.generic :refer [generic-component]]))

(defn- tab->component [tab]
  (condp = (:kind tab)
    "people" people-component
    "iframe" iframe-component
    "webget" webget-component
    "gist" gist-component
    "inkpad" inkpad-component
    generic-component))

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
        (for [tab tabs
              :let [selected? (= tab selected-tab)
                    {:keys [label id style selected-style]} tab]]
          (dom/div {:class    (str "tab" (when selected? " selected"))
                    :style    (if selected? selected-style style)
                    :on-click #(router/switch-tab id)}
            label))))))

(defcomponent board-content-component [data _ _]
  (render [_]
    (let [{:keys [ui anims selected-tab]} data]
      (dom/div {:class    "tab-view"
                :on-click #(router/switch-person nil)}
        (let [kind (or (:kind selected-tab) "generic")
              id (:id selected-tab)]
          (dom/div {:class (str "board " kind "-board " (when id (str "id-" (:id selected-tab))))}
            (om/build (tab->component selected-tab) {:anims   anims
                                                     :ui      ui
                                                     :id      id
                                                     :content (:content selected-tab)
                                                     :cache   (get-in data [:cache :tabs id])
                                                     :transient (get-in data [:transient id])})))))))

(defcomponent board-component [data _ _]
  (render [_]
    (let [{:keys [model ui anims cache transient]} data
          {:keys [tabs]} model
          {:keys [selected-tab-id loading?]} ui
          selected-tab (router/lookup-tab selected-tab-id tabs)
          is-loading? (> loading? 0)]
      (page/page-skeleton
        (dom/div {:class (str "loading-indicator" (when is-loading? " visible"))
                  :title (when is-loading? "Waiting for network response...")}
          (dom/i {:class "fa fa-refresh fa-spin"}))
        (dom/div {:class "top-bar no-select"}
          (om/build small-logo-component {})
          (om/build board-label-component {:board-label (get-in model [:board :name] "")
                                           :board-url   (router/current-url)})
          (om/build board-tabs-component {:tabs tabs :selected-tab selected-tab})
          (om/build menu-component ui))
        (dom/div {:class "tab-contents"}
          (om/build board-content-component {:ui           ui
                                             :anims        anims
                                             :model        model
                                             :cache        cache
                                             :transient    transient
                                             :selected-tab selected-tab}))))))
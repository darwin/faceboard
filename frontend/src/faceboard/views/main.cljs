(ns faceboard.views.main
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.router :refer [embedded?]]
            [faceboard.controller :refer [perform!]]
            [faceboard.views.board :refer [board-component]]
            [faceboard.views.editor :refer [editor-bridge-component editor-iframe-component]]
            [faceboard.views.welcome :refer [welcome-component]]
            [faceboard.views.loading :refer [loading-component]]
            [faceboard.views.test :refer [test-component]]
            [faceboard.views.error :refer [error-component]]
            [faceboard.env :as env]))

(defn hide-static-site []
  (if-let [container (.getElementById js/document "static")]
    (aset (aget container "style") "display" "none")))

(defcomponent main-component [data _ _]
  (will-update [_ _ _]
    (if env/simple-profile?
      (.time js/console "main render")))
  (did-mount [_]
    (if env/simple-profile?
      (log "faceboard: main component mounted")
      (.time js/console "main render")))
  (did-update [_ _ _]
    (if env/simple-profile?
      (.timeEnd js/console "main render")))
  (render [_]
    (let [iframe-editor-shown (get-in data [:ui :show-editor])]
      (dom/div {:class    (str "main-box" (if (embedded?) " embedded"))
                :on-click #(if iframe-editor-shown (perform! :hide-editor))}
        (if-let [editor-path (get-in data [:ui :editor-path])]
          (om/build editor-bridge-component {:editor-path    editor-path
                                             :editor-content (get-in data editor-path)}))
        (if iframe-editor-shown (om/build editor-iframe-component {}))
        (let [view (get-in data [:ui :view] :view-key-not-found)
              view-params (get-in data [:ui :view-params] {})]
          (if-not (or (= view :blank) (= view :welcome)) (hide-static-site))
          (condp = view                                     ; app-level view switching logic
            :blank ""                                       ; blank view is rendered before router dispatches url
            :welcome (om/build welcome-component view-params)
            :test (om/build test-component view-params)
            :loading (om/build loading-component view-params)
            :error (om/build error-component view-params)
            :board (om/build board-component data)          ; pass full data cursor
            (do
              (log-err "request to dispatch an unknown view: " view)
              (perform! :switch-view :error {:message "Invalid app state."}))))))))
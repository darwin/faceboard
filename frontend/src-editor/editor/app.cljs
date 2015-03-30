(ns editor.app
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [editor.state :refer [app-state]]
            [editor.helpers.utils :refer [json->model]]
            [editor.views.editor :refer [editor-component]]))

(defn- root-app-element []
  (.getElementById js/document "app"))

(defn init! [])

(defn mount! []
  (om/root editor-component app-state {:target (root-app-element)}))

(defn request-refresh! []
  (let [opener (.-opener js/window)]
    (if-let [perform-fn (aget opener "faceboardPerformRefresh")]
      (perform-fn))))
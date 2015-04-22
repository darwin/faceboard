(ns editor.app
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [editor.state :refer [app-state]]
            [editor.helpers.utils :refer [json->model]]
            [editor.views.main :refer [main-component]]))

(defn- root-app-element []
  (.getElementById js/document "app"))

(defn init! [])

(defn mount! []
  (om/root main-component app-state {:target (root-app-element)}))

(defn request-refresh! []
  (let [opener (.-opener js/window)]
    (if opener
      (if-let [perform-fn (aget opener "faceboardPerformRefresh")]
        (perform-fn))
      (log-err "no opener!"))))
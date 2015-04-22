(ns editor.exports
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [editor.state :refer [app-state]]
            [editor.helpers.utils :refer [json->model]]))

(defn ^:export drive [json]
  (let [state (json->model json)
        updated-state (assoc-in @app-state [:editor] state)]
    (reset! app-state updated-state)))

(aset js/window "drive" drive)
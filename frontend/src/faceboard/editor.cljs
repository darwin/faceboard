(ns faceboard.editor
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.state :refer [app-state]]
            [faceboard.helpers.utils :as utils]))

(def ^:dynamic *editor-window*)

(defn open-editor-window []
  (if-let [editor-window (.open js/goog.window "editor.html" #js {"target" "faceboardeditor"
                                                                  "width"  "590"
                                                                  "height" "600"})]
    (do (.focus editor-window)
        (set! *editor-window* editor-window))
    (log-warn "popup blocked?")))

(defn bridge-state [data]
  (when *editor-window*
    (if-let [drive-fn (aget *editor-window* "drive")]
      (drive-fn (utils/model->json data)))))

(defn refresh-editor []
  (let [data @app-state
        editor-path (get-in data [:ui :editor-path])]
    (bridge-state {:editor-path    editor-path
                   :editor-content (utils/model->json (get-in data editor-path))})))
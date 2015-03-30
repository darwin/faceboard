(ns editor.views.editor
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [cljs.core.async :refer [put! <! chan]]
            [clojure.set :refer [subset?]]
            [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [editor.helpers.utils :as utils]
            [editor.state :refer [app-state]]
            [phalanges.core :as phalanges]
            [editor.env :refer [mac?]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(def ^:dynamic *codemirror*)
(def ^:dynamic *path*)

(defn has-unsaved-data? []
  (when *codemirror*
    (not (.call (aget *codemirror* "isClean") *codemirror*))))

(defn set-status [status]
  (reset! app-state (assoc @app-state :status status)))

(defn perform! [path value]
  (set-status "")
  (try                                                      ; json is provided by user, can be broken
    (utils/json->model value)
    (let [opener (.-opener js/window)]
      (if-let [apply-fn (aget opener "faceboardApplyJSON")]
        (apply-fn (utils/model->json [path value]))))
    (catch js/Object err
      (set-status "The JSON is malformed!")
      (log-err err))))

(defn codemirror-value []
  (when-not (nil? *codemirror*)
    (.call (aget *codemirror* "getValue") *codemirror*)))

(defn set-codemirror-value! [value]
  (when-not (nil? *codemirror*)
    (.call (aget *codemirror* "setValue") *codemirror* value)
    (.call (aget *codemirror* "markClean") *codemirror*)))

(defn apply-changes []
  (perform! *path* (codemirror-value))
  (.call (aget *codemirror* "markClean") *codemirror*))

(defn stringify-path [path]
  (apply str (interpose "/" (map #(clj->js %) path))))

(defn is-not-in-sync? []
  (let [editor (:editor @app-state)
        old-path (stringify-path *path*)
        new-path (stringify-path (:editor-path editor))
        old-value (or (codemirror-value) new-value)
        new-value (:editor-content editor)
        unsaved? (has-unsaved-data?)]
    (and unsaved? (= old-path new-path) (not (= old-value new-value)))))

(defn save [e was-not-in-sync?]
  (.preventDefault e)
  (if was-not-in-sync?
    (when (true? (js/confirm "Really overwrite external changes?"))
      (apply-changes))
    (apply-changes)))

(def action-table
  ; [mac-key win-key action]
  [[#{:meta :s} #{:ctrl :s} :save]])

(defn matching-action [keyset [mac-keyset non-mac-keyset action]]
  (when (or (and mac? (= keyset mac-keyset))
          (and (not mac?) (= keyset non-mac-keyset)))
    action))

(defn select-actions [keyset]
  (reduce (fn [res line] (conj res (matching-action keyset line))) #{} action-table))

(defn handle-codemirror-key [event]
  (select-actions (phalanges/key-set event)))

(defcomponent editor-component [data owner]
  (render [_]
    (let [{:keys [editor status]} data
          path (stringify-path (:editor-path editor))
          new-value (:editor-content editor)
          unsaved? (has-unsaved-data?)
          not-in-sync? (is-not-in-sync?)]
      (when-not unsaved?
        (set-codemirror-value! new-value)
        (set! *path* (:editor-path editor)))
      (dom/div {:class (str "editor" (when not-in-sync? " danger") (when unsaved? " unsaved"))}
        (dom/div {:class "info"}
          (dom/div {:class "path-row"}
            "JSON PATH: " (dom/span {:class "path"} path)))
        (dom/div {:ref         "host"
                  :class       "editor-host"
                  :on-key-down (fn [e] (when (:save (handle-codemirror-key e))
                                         (save e not-in-sync?)))})
        (dom/div {:class "docs"}
          "docs: " (dom/a {:target "_blank"
                           :href   "https://github.com/darwin/faceboard/wiki/format"}
                     "https://github.com/darwin/faceboard/wiki/format"))
        (dom/div {:class "status"}
          (if not-in-sync? "The data has been modified by someone else!" status))
        (dom/div {:class "buttons"}
          (dom/div {:class    "button hint"
                    :title    "Save model and update the app."
                    :on-click (fn [e] (save e not-in-sync?))}
            (if mac? "save (CMD+S)" "save (CTRL+S)"))
          (when not-in-sync?
            (dom/div {:class    "button refresh"
                      :title    "You are editing old data. This will throw away your changes since last save."
                      :on-click (fn [_] (set-codemirror-value! new-value) (om/refresh! owner))}
              "discard my changes"))))))
  (did-mount [_]
    (set! *codemirror* (js/CodeMirror (om/get-node owner "host")
                         #js {:mode              #js {:name "javascript" :json true}
                              :value             (get-in data [:editor :editor-content] "")
                              :matchBrackets     true
                              :autoCloseBrackets true
                              :styleActiveLine   true
                              :lint              true
                              :smartIndent       true
                              :lineNumbers       true
                              :lineWrapping      true
                              :viewportMargin:   Infinity}))))
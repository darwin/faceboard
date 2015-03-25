(ns faceboard.views.editor
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [cljs.core.async :refer [put! <! chan]]
            [clojure.set :refer [subset?]]
            [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.utils :refer [model->json]]
            [phalanges.core :as phalanges]
            [faceboard.env :refer [mac?]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.controller :refer [perform!]]))

(def ^:dynamic *codemirror*)
(def ^:dynamic *path*)

(defn- codemirror-value []
  (when-not (nil? *codemirror*)
    (.call (aget *codemirror* "getValue") *codemirror*)))

(defn- set-codemirror-value! [value]
  (when-not (nil? *codemirror*)
    (.call (aget *codemirror* "setValue") *codemirror* value)
    (.call (aget *codemirror* "markClean") *codemirror*)))

(defn- apply-changes [event]
  (.preventDefault event)
  (perform! :apply-json *path* (codemirror-value))
  (.call (aget *codemirror* "markClean") *codemirror*))

(def action-table
  [[#{:meta :s} #{:ctrl :s} apply-changes]                  ; CMD+S on Mac, CTRL+S elsewhere
   ])

(defn dispatch-action [keyset event]
  (doseq [[mac-keyset non-mac-keyset action] action-table]
    (when (or (and mac? (= keyset mac-keyset))
            (and (not mac?) (= keyset non-mac-keyset)))
      (action event))))

(defn handle-codemirror-key [event]
  (dispatch-action (phalanges/key-set event) event))

(defn has-unsaved-data? []
  (when *codemirror*
    (not (.call (aget *codemirror* "isClean") *codemirror*))))

(defcomponent editor-component [data owner]
  (render [_]
    (let [content (:editor-content data)
          path (:editor-path data)
          new-value (model->json content)
          old-value (if (nil? *codemirror*) new-value (codemirror-value))
          not-in-sync? (and (not (= old-value new-value)) (= *path* path))
          unsaved? (has-unsaved-data?)]
      (when (and (not= *path* path) (not (or unsaved? not-in-sync?)))
        (set-codemirror-value! new-value))
      (when-not unsaved?
        (set! *path* path))
      (dom/div {:class    (str "editor" (when not-in-sync? " danger") (when unsaved? " unsaved"))
                :on-click #(.stopPropagation %)}
        (dom/div {:class "info"}
          (dom/div {:class "docs"}
            "Format docs: " (dom/a {:target "_blank" :href "https://github.com/darwin/faceboard/wiki/format"} "https://github.com/darwin/faceboard/wiki/format"))
          (dom/div {:class "path-row"}
            "Editor path: " (dom/span {:class "path"} (apply str (interpose "/" (map #(clj->js %) *path*))))))
        (dom/div {:ref         "host"
                  :class       "editor-host"
                  :on-key-down #(handle-codemirror-key %)})
        (when-not unsaved?
          (dom/div {:class    "button hint"
                    :title    "Save model and update the app."
                    :on-click (fn [e] (if not-in-sync?
                                        (when (js/confirm "Really overwrite external changes?")
                                          (apply-changes e))
                                        (apply-changes e)))}
            (if mac? "CMD+S to save" "CTRL+S to save")))
        (when unsaved?
          (dom/div {:class    "button save-switch"
                    :title    "You have switched underlying path but previous edits were not saved."
                    :on-click (fn [e] (apply-changes e) (om/refresh! owner))}
            "save & switch"))
        (when unsaved?
          (dom/div {:class    "button discard-switch"
                    :title    "You have switched underlying path but previous edits were not saved."
                    :on-click (fn [e] (.call (aget *codemirror* "markClean") *codemirror*) (om/refresh! owner))}
            "discard & switch"))
        (when not-in-sync?
          (dom/div {:class    "button refresh"
                    :title    "The model has been modified by someone else. You are editing old data."
                    :on-click (fn [_] (set-codemirror-value! new-value) (om/refresh! owner))}
            "discard & reload")))))
  (did-mount [_]
    (set! *codemirror* (js/CodeMirror (om/get-node owner "host")
                         #js {:mode              #js {:name "javascript" :json true}
                              :value             (model->json (:editor-content data))
                              :matchBrackets     true
                              :autoCloseBrackets true
                              :styleActiveLine   true
                              :lint              true
                              :smartIndent       true
                              :lineNumbers       true
                              :lineWrapping      true
                              :viewportMargin:   Infinity}))))
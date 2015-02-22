(ns faceboard.views.editor
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [cljs.core.async :refer [put! <! chan]]
            [clojure.set :refer [subset?]]
            [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [phalanges.core :as phalanges]
            [faceboard.env :refer [mac?]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.controller :as controller]))

(def ^:dynamic *codemirror*)

(defn- codemirror-value []
  (.call (aget *codemirror* "getValue") *codemirror*))      ; prevent name mangling under advanced compilation

(defn- apply-model [event]
  (controller/perform-command! "apply-model" (codemirror-value))
  (.preventDefault event))

(def action-table
  [[#{:meta} #{:ctrl} 83 apply-model]                       ; CMD+S on Mac, CTRL+S elsewhere
   ])

(defn select-action [keycode modifiers]
  (loop [table action-table]
    (when-not (empty? table)
      (let [record (first table)]
        (if (and
              (or
                (and mac? (subset? (nth record 0) modifiers))
                (and (not mac?) (subset? (nth record 1) modifiers)))
              (= keycode (nth record 2)))                   ; workaround https://github.com/spellhouse/phalanges/issues/4
          (nth record 3)
          (recur (rest table)))))))

(defn handle-codemirror-key [event]
  (if-let [action (select-action (phalanges/key-code event) (phalanges/modifier-set event))]
    (action event)))

(defcomponent editor-component [code owner]
  (render [_]
    (dom/div {:class "editor" :on-key-down #(handle-codemirror-key %)}
      (dom/div {:class "hint"} (if mac? "CMD+S to save" "CTRL+S to save"))))
  (did-mount [_]
    (set! *codemirror* (js/CodeMirror (om/get-node owner)
                         #js {:mode              #js {:name "javascript" :json true}
                              :value             code
                              :matchBrackets     true
                              :autoCloseBrackets true
                              :styleActiveLine   true
                              :lint              true
                              :smartIndent       true
                              :lineNumbers       true
                              :viewportMargin:   Infinity}))))
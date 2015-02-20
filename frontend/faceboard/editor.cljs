(ns faceboard.editor
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [cljs.core.async :refer [put! <! chan]]
            [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [phalanges.core :as phalanges]
            [faceboard.env :as env :refer [mac?]]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.controller :as controller]))

(def ^:dynamic *codemirror*)

(defn- apply-model [event]
  (controller/perform-command! "apply-model" (.getValue *codemirror*))
  (.preventDefault event))

(def action-table
  [[#{:meta :s} #{:ctrl :s} apply-model]                    ; CMD+S on Mac, CTRL+S elsewhere
   ])

(defn select-action [keyset]
  (loop [table action-table]
    (when-not (empty? table)
      (let [record (first table)]
        (if (or (and mac? (= keyset (nth record 0))) (and (not mac?) (= keyset (nth record 1))))
          (nth record 2)
          (recur (rest table)))))))

(defn handle-codemirror-key [event]
  (if-let [action (select-action (phalanges/key-set event))]
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
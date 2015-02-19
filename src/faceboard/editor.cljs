(ns faceboard.editor
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [cljs.core.async :refer [put! <! chan]]
            [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [phalanges.core :as phalanges]
            [faceboard.controller :as controller]))

(def ^:dynamic *codemirror*)

(defn handle-codemirror-key [event]
  (let [keyset (phalanges/key-set event)]
    (condp = keyset
      #{:meta :s} (do                                       ; CMD+S on Mac
                    (controller/perform-command! "apply-model" (.getValue *codemirror*))
                    (.preventDefault event))
      nil)))

(defcomponent editor-component [code owner]
  (render-state [this _]
    (dom/div {:onKeyDown #(handle-codemirror-key %)}))
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
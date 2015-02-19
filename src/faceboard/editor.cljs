(ns faceboard.editor
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [cljs.core.async :refer [put! <! chan]]
            [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :as controller]))

(def ^:dynamic *codemirror*)

(defn map-hotkey [e]
  (when (and (.-ctrlKey e) (.-shiftKey e))
    (condp = (.-keyCode e)
      88 "eval-code"
      90 "load-buff"
      nil)))

;(defn handle-codemirror-key [])

(defcomponent editor-component [code owner]
  (render-state [this _]
    (dom/div {:onKeyDown (fn [e] (if-let [command (map-hotkey e)]
                                   (controller/perform-command! owner command)))}))
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
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
  (.setTimeout js/window #(reset! app-state (assoc @app-state :status status)) 0)) ; call it outside render loop

(defn perform! [path value]
  (set-status "")
  (try                                                      ; json is provided by user, can be broken
    (utils/json->model value)
    (let [opener (.-opener js/window)]
      (if-let [apply-fn (aget opener "faceboardApplyJSON")]
        (apply-fn (utils/model->json [path value]))))
    (.call (aget *codemirror* "markClean") *codemirror*)
    (catch js/Object err
      (set-status "The JSON is malformed!")
      (log-err err))))

(defn codemirror-value []
  (when-not (nil? *codemirror*)
    (.call (aget *codemirror* "getValue") *codemirror*)))

(defn set-codemirror-value! [value]
  (when-not (nil? *codemirror*)
    (let [cursor (.call (aget *codemirror* "getCursor") *codemirror*)]
      (.call (aget *codemirror* "setValue") *codemirror* value)
      (when cursor
        (.call (aget *codemirror* "setCursor") *codemirror* cursor))
      (.call (aget *codemirror* "markClean") *codemirror*))))

(defn apply-changes []
  (perform! *path* (codemirror-value)))

(defn stringify-path [path]
  (apply str (interpose "/" (map #(clj->js %) path))))

(defn is-not-in-sync? [editor]
  (let [old-path (stringify-path *path*)
        new-path (stringify-path (:editor-path editor))
        old-value (or (codemirror-value) new-value)
        new-value (:editor-content editor)
        unsaved? (has-unsaved-data?)]
    (and unsaved? (= old-path new-path) (not (= old-value new-value)))))

(defn save [e was-not-in-sync?]
  (.preventDefault e)
  (if was-not-in-sync?
    (when (true? (js/confirm "Really overwrite external changes? This is most likely not a good idea."))
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
    (let [editor data
          path (stringify-path (:editor-path editor))
          new-value (:editor-content editor)
          unsaved? (has-unsaved-data?)
          not-in-sync? (is-not-in-sync? editor)]
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
        (dom/div {:class "buttons"}
          (dom/div {:class    "button hint"
                    :title    "Save model and update the app."
                    :on-click (fn [e] (save e not-in-sync?))}
            (if mac? "save (CMD+S)" "save (CTRL+S)"))
          (when not-in-sync?
            (set-status "Someone else just modified this data behind your back!")
            (dom/div {:class    "button refresh"
                      :title    "This will throw away your changes since last save."
                      :on-click (fn [_] (set-codemirror-value! new-value) (om/refresh! owner))}
              "discard my changes"))))))
  (did-mount [_]
    (let [editor (js/CodeMirror (om/get-node owner "host")
                   #js {:mode              #js {:name "javascript" :json true}
                        :value             (get-in data [:editor :editor-content] "")
                        :matchBrackets     true
                        :autoCloseBrackets true
                        :styleActiveLine   true
                        :lint              true
                        :smartIndent       true
                        :lineNumbers       true
                        :lineWrapping      true
                        :foldGutter        true
                        :gutters           #js ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
                        :viewportMargin:   Infinity})
          charWidth (.defaultCharWidth editor)
          basePadding 4]
      (.on editor "renderLine" (fn [cm, line, elt]
                                 ; following code implements fancy indentation for wrapping text of json values
                                 ; see https://codemirror.net/demo/indentwrap.html
                                 (let [re-length (fn [re s]
                                                   (let [re (js/RegExp. re "g")]
                                                     (if-let [m (.exec re s)]
                                                       (count (aget m 0))
                                                       0)))
                                       text (.-text line)
                                       base-off (* (.countColumn js/CodeMirror text nil (.getOption cm "tabSize")) charWidth)
                                       val-open-quote-pos (re-length "\".*\"\\: \"" text)
                                       val-open-quote-offset (+ base-off (* val-open-quote-pos charWidth))]
                                   (aset elt "style" "textIndent" (str "-" val-open-quote-offset "px"))
                                   (aset elt "style" "paddingLeft" (str (+ basePadding val-open-quote-offset) "px")))))
      (set! *codemirror* editor))))
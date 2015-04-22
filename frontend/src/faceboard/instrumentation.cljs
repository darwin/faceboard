(ns faceboard.instrumentation
  (:require [om.core :as om :include-macros true]
            [om.dom :as dom :include-macros true]))

(defn react-id [x]
  (let [id (or (.-_rootNodeID x) (.-_rootNodeID (aget x "_reactInternalInstance")))]
    (assert id)
    id))

(defn label [this]
  (str (react-id this) " [" ((aget this "getDisplayName")) "]"))

(defn wrap-will-update [f]
  (fn [next-props next-state]
    (this-as this
      (let [label (label this)]
        (.log js/console label (aget next-props "__om_cursor"))
        (.time js/console label))
      (.call f this next-props next-state))))

(defn wrap-did-update [f]
  (fn [prev-props prev-state]
    (this-as this
      (.timeEnd js/console (label this))
      (.call f this prev-props prev-state))))

(def instrumentation-methods
  (om/specify-state-methods!
    (-> om/pure-methods
      (update-in [:componentWillUpdate] wrap-will-update)
      (update-in [:componentDidUpdate] wrap-did-update)
      (clj->js))))

(defn patch-om []
  (let [orig-will-update (aget om/pure-descriptor "componentWillUpdate")
        orig-did-update (aget om/pure-descriptor "componentDidUpdate")]
    (aset om/pure-descriptor "componentWillUpdate" (wrap-will-update orig-will-update))
    (aset om/pure-descriptor "componentDidUpdate" (wrap-did-update orig-did-update)))
  om/pure-descriptor)

(ns faceboard.views.boards.iframe
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om-tools.core :refer-macros [defcomponent]]
            [faceboard.controller :refer [perform!]]
            [om.core :as om]
            [om-tools.dom :as dom]))

(defn- iframe-dance [src owner]
  (let [iframe-el (om/get-node owner "iframe")]
    (when iframe-el
      (perform! :inc-loading-counter)
      ; TODO: support IE's attachEvent here
      (aset iframe-el "onload" (fn [] (perform! :dec-loading-counter)))
      ; TODO: support timeout as decribed here http://stackoverflow.com/a/18552771/84283
      ;(aset iframe-el "onerror" (fn [& args] (log-err "iframe failed to load:" args) (perform! :dec-loading-counter)))
      (aset iframe-el "src" src))))

(defcomponent iframe-element-component [src owner]
  (did-update [_ _ _]
    (iframe-dance src owner))
  (did-mount [_]
    (iframe-dance src owner))
  (render [_]
    (dom/iframe {:ref          "iframe"
                 :frame-border 0
                 ;:src         (:url content)
                 ;:onload      #(perform! :dec-loading-counter)  ; this is a bug in react https://github.com/facebook/react/issues/1718
                 })))

(defcomponent iframe-component [data _]
  (render [_]
    (let [{:keys [content]} data]
      (dom/div {:class "iframe-parent"}
        (om/build iframe-element-component (:url content))))))

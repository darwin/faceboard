(ns faceboard.views.boards.inkpad
  (:require-macros [cljs.core.async.macros :refer [go]]
                   [faceboard.macros.utils :refer [...]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [cljs-http.client :as http]
            [om-tools.dom :as dom]
            [cuerdas.core :as str]
            [markdown.core :refer [md->html]]
            [cljs.core.async :refer [<!]]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(def ^:dynamic *cached-content*)

(def inkpad-api-endpoint "https://www.inkpad.io/")

(defn extract-content [html]
  (let [frame (.createElement js/document "div")]
    (set! (.-innerHTML frame) html)
    (let [markdown-body (aget (.querySelectorAll frame ".markdown-body") 0)]
      (when markdown-body
        (.-innerHTML markdown-body)))))

(defn go-get [url update-fn]
  (go (let [opts {:with-credentials? false}                 ; http://stackoverflow.com/a/24443043/84283
            response (<! (http/get url opts))]
        (set! *cached-content* (if (:success response)
                                 (extract-content (:body response))
                                 (str "Unable to load <a href='" url "'>board content</a>")))
        (update-fn *cached-content*))))

(defn read-inkpad [inkpad-id update-fn]
  (let [url (str inkpad-api-endpoint inkpad-id)]
    (go-get url update-fn)))

(defcomponent inkpad-component [data owner _]
  (render [_]
    (dom/div {:ref                     "content"
              :dangerouslySetInnerHTML #js {:__html (:content *cached-content*)}}))
  (did-mount [_]
    (let [{:keys [content]} data]
      (read-inkpad (:inkpad-id content) #(aset (om/get-node owner "content") "innerHTML" %)))))
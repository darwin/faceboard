(ns faceboard.views.boards.gist
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [cljs-http.client :as http]
            [om-tools.dom :as dom]
            [cuerdas.core :as str]
            [markdown.core :refer [md->html]]
            [cljs.core.async :refer [<!]]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(def ^:dynamic *cached-content*)

(def gists-api-endpoint "https://api.github.com/gists/")

(defn transform-content [kind content]
  (condp = (str/lower kind)
    "markdown" (md->html content)
    content))

(defn- build-chunks [files]
  (for [item files]
    (let [[name file] item]
      (when (:truncated file)
        (log-warn name "is truncated!"))                    ; TODO: support truncated content
      (transform-content (:language file) (:content file)))))

(defn extract-content [data]
  (str/join (build-chunks (seq (:files data)))))

(defn go-get [url update-fn]
  (go (let [opts {:with-credentials? false}                 ; http://stackoverflow.com/a/24443043/84283
            response (<! (http/get url opts))]
        (set! *cached-content* (if (:success response)
                                 (extract-content (:body response))
                                 (str "Unable to load <a href='" url "'>board content</a>")))
        (update-fn *cached-content*))))

(defn read-gist [gist-id update-fn]
  (let [url (str gists-api-endpoint gist-id)]
    (go-get url update-fn)))

(defcomponent gist-component [data owner _]
  (render [_]
    (dom/div {:ref                     "content"
              :dangerouslySetInnerHTML #js {:__html (:content *cached-content*)}}))
  (did-mount [_]
    (let [{:keys [content]} data]
      (read-gist (:gist-id content) #(aset (om/get-node owner "content") "innerHTML" %)))))
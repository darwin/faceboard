(ns faceboard.views.boards.webget
  (:require-macros [cljs.core.async.macros :refer [go]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [cljs-http.client :as http]
            [om-tools.dom :as dom]
            [cljs.core.async :refer [<!]]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(def ^:dynamic *cached-content*)

(defn go-get [url update-fn]
  (log "get" url)
  (go (let [response (<! (http/get url))]
        (log "got" response)
        (set! *cached-content* (if (:success response)
                                 (set! *cached-content* (:body response))
                                 (str "Unable to load <a href='" url "'>board content</a>")))
        (update-fn *cached-content*))))

(defcomponent webget-component [data owner _]
  (render [_]
    (dom/div {:ref                     "content"
              :dangerouslySetInnerHTML #js {:__html (:content *cached-content*)}}))
  (did-mount [_]
    (let [{:keys [content]} data]
      (go-get (:url content) #(aset (om/get-node owner "content") "innerHTML" %)))))
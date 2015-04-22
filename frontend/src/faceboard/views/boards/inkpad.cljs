(ns faceboard.views.boards.inkpad
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om-tools.core :refer-macros [defcomponent]]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.utils :refer [non-sanitized-div]]))

(def inkpad-api-endpoint "https://www.inkpad.io/")

(defn extract-content [html]
  (let [frame (.createElement js/document "div")]
    (set! (.-innerHTML frame) html)
    (if-let [markdown-body (aget (.querySelectorAll frame ".markdown-body") 0)]
      (.-innerHTML markdown-body))))

(defn process-response [id url response]
  (perform! :update-tab-cache id (if (:success response)
                                   (extract-content (:body response))
                                   (str "Unable to load <a href='" url "'>inkpad content</a>"))))

(defcomponent inkpad-component [data _ _]
  (render [_]
    (non-sanitized-div (:content (:cache data))))
  (did-mount [_]
    (when (nil? (:cache data))
      (let [{:keys [id content]} data]
        (let [url (str inkpad-api-endpoint (:inkpad-id content))]
          (perform! :fetch-content url #(process-response id url %)))))))
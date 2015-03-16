(ns faceboard.views.boards.webget
  (:require [om-tools.core :refer-macros [defcomponent]]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.utils :refer [non-sanitized-div]]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(defn process-response [id url response]
  (perform! :update-tab-cache id (if (:success response)
                                   (:body response)
                                   (str "Unable to load <a href='" url "'>web content</a>"))))

(defcomponent webget-component [data _ _]
  (render [_]
    (non-sanitized-div (:content (:cache data))))
  (did-mount [_]
    (when (nil? (:cache data))
      (let [{:keys [id content]} data
            url (:url content)]
        (perform! :fetch-content url #(process-response id url %))))))
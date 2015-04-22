(ns faceboard.views.boards.gist
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om-tools.core :refer-macros [defcomponent]]
            [cuerdas.core :as str]
            [markdown.core :refer [md->html]]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.utils :refer [non-sanitized-div]]))

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

(defn process-response [id url response]
  (perform! :update-tab-cache id (if (:success response)
                                   (extract-content (:body response))
                                   (str "Unable to load <a href='" url "'>gist content</a>"))))

(defcomponent gist-component [data _ _]
  (render [_]
    (non-sanitized-div (:content (:cache data))))
  (did-mount [_]
    (when (nil? (:cache data))
      (let [{:keys [id content]} data
            url (str gists-api-endpoint (:gist-id content))]
        (perform! :fetch-content url #(process-response id url %))))))
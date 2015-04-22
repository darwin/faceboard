(ns faceboard.exports
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [faceboard.state :refer [app-state]]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.utils :as utils]))

(defn ^:export perform-refresh []
  (perform! :refresh-editor))

(defn keywordize-vector [vector]
  (map #(if (string? %) (keyword %) %) vector))

(defn ^:export apply-json [payload]
  (let [[path value] (utils/json->model payload)]
    (perform! :apply-json (keywordize-vector path) value)))

(aset js/window "faceboardPerformRefresh" perform-refresh)
(aset js/window "faceboardApplyJSON" apply-json)
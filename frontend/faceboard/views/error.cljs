(ns faceboard.views.error
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.page :as page]
            [faceboard.controller :as controller]))

(defcomponent error-component [data _ _]
  (render [_]
    (let [message (:message data)]
      (page/page-skeleton
        []
        (str "ERROR: " message)))))
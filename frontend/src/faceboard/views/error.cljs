(ns faceboard.views.error
  (:require [om-tools.core :refer-macros [defcomponent]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.page :as page]))

(defcomponent error-component [data _ _]
  (render [_]
    (let [ui (:ui data)
          message (get-in ui [:view-params :message])]
      (page/page-skeleton
        (str "ERROR: " message)))))
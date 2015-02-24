(ns faceboard.views.loading
  (:require [om-tools.core :refer-macros [defcomponent]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.page :as page]))

(defcomponent loading-component [data _ _]
  (render [_]
    (let [ui (:ui data)
          params (:view-params ui)]
      (page/page-skeleton
        ui
        []
        (str (:message params))))))
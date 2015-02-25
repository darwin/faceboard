(ns faceboard.views.welcome
  (:require [om-tools.core :refer-macros [defcomponent]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.page :as page]))

(defcomponent welcome-component [data _ _]
  (render [_]
    (let [ui (:ui data)]
      (page/page-skeleton
        "WELCOME!"))))
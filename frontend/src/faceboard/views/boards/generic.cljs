(ns faceboard.views.boards.generic
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om-tools.core :refer-macros [defcomponent]]
            [faceboard.helpers.utils :refer [non-sanitized-div]]))

(defcomponent generic-component [data _ _]
  (render [_]
    (non-sanitized-div (:content data))))
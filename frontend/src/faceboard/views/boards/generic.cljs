(ns faceboard.views.boards.generic
  (:require [om-tools.core :refer-macros [defcomponent]]
            [faceboard.helpers.utils :refer [non-sanitized-div]]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(defcomponent generic-component [data _ _]
  (render [_]
    (non-sanitized-div (:content data))))
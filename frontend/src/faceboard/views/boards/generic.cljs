(ns faceboard.views.boards.generic
  (:require [om-tools.core :refer-macros [defcomponent]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [om-tools.dom :as dom]))

(defcomponent generic-component [data _ _]
  (render [_]
    (dom/div {:dangerouslySetInnerHTML #js {:__html (:content data)}})))
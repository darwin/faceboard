(ns faceboard.views.boards.iframe
  (:require [om-tools.core :refer-macros [defcomponent]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [om-tools.dom :as dom]))

(defcomponent iframe-component [data _ _]
  (render [_]
    (let [{:keys [content]} data]
      (dom/div {}
        (dom/iframe {:src         (:url content)
                     :frameBorder 0})))))
(ns faceboard.board_label
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]))

(defcomponent board-label-component [data _ _]
  (render [_]
    (dom/div {:class "board-label"}
      (if-let [board-label (:board-label data)]
        (dom/div {:class "label"}
          "@" (dom/a {:href "/"} board-label))))))
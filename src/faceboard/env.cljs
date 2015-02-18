(ns faceboard.env
  (:require [om.core :as om]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [devtools.core :as devtools]
            [figwheel.client :as fw]))

(defn init! []
  (enable-console-print!)
  (devtools/install!)
  (fw/start {}))
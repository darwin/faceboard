(ns faceboard.env
  (:require [om.core :as om]
            [devtools.core :as devtools]
            [figwheel.client :as fw]))

(defn init! []
  (enable-console-print!)
  (devtools/install!)
  (fw/start {}))
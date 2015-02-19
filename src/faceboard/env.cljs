(ns faceboard.env
  (:require [om.core :as om]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [devtools.core :as devtools]
            [figwheel.client :as fw]))

(def platform (js->clj js/platform :keywordize-keys true))

(def mac? (= (get-in platform [:os :family]) "OS X"))

(defn init! []
  (enable-console-print!)
  (devtools/install!)
  (fw/start {}))
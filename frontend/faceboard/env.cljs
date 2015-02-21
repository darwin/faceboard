(ns faceboard.env
  (:require [om.core :as om]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [devtools.core :as devtools]
            [figwheel.client :as fw]))

(defn defined? [v]
  (not (nil? v)))

(def platform (js->clj js/platform :keywordize-keys true))
(def env (js->clj js/faceboard-env :keywordize-keys true))

(def mac? (= (get-in platform [:os :family]) "OS X"))
(def heroku? (defined? (:heroku env)))
(def git-revision (:git-revision env))

(defn init! []
  (enable-console-print!)
  (devtools/install!)
  (log "environment:" env "platform:" platform)
  (when-not heroku? 
    (fw/start {})))
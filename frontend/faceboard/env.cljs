(ns faceboard.env
  (:require [faceboard.logging :refer [log, log-err, log-warn]]
            [devtools.core :as devtools]
            [faceboard.figwheel :as figwheel]))

(defn defined? [v]
  (not (nil? v)))

(def platform (js->clj js/platform :keywordize-keys true))
(def env (js->clj js/faceboard-env :keywordize-keys true))

(def mac? (= (get-in platform [:os :family]) "OS X"))
(def git-revision (:git-revision env))
(def local? (not (defined? (:production env))))

(defn init! []
  (enable-console-print!)
  (devtools/install!)
  (when local?
    (figwheel/start)))
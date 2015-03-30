(ns editor.env
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.devtools :as devtools]))

(defn defined? [v]
  (not (nil? v)))

(def platform (js->clj js/platform :keywordize-keys true))
(def env (if (defined? (aget js/window "faceboard-env")) (js->clj js/faceboard-env :keywordize-keys true) {}))

(def mac? (= (get-in platform [:os :family]) "OS X"))
(def local? (not (defined? (:production env))))

(defn init! []
  (enable-console-print!)
  (when local?
    (devtools/install!)))
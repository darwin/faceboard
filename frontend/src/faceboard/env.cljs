(ns faceboard.env
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.devtools :as devtools]
            [faceboard.figwheel :as figwheel]))

(defn defined? [v]
  (not (nil? v)))

(def platform (js->clj js/platform :keywordize-keys true))
(def env (js->clj js/faceboard-env :keywordize-keys true))

(def mac? (= (get-in platform [:os :family]) "OS X"))
(def git-revision (:git-revision env))
(def local? (not (defined? (:production env))))
(def firebase-db (get env :firebase-db "blinding-heat-4410"))
(def domain (.-host js/location))
(def instrument? false)
(def simple-profile? true)

(defn init! []
  (enable-console-print!)
  (when local?
    (devtools/install!)
    (figwheel/start)))
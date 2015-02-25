(ns faceboard.router
  (:require [secretary.core :as secretary :refer-macros [defroute]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.controller :as controller]
            [goog.events])
  (:import goog.History
           goog.history.EventType))

(def history (History.))

(defn setup! []
  (secretary/set-config! :prefix "#"))

(defn enable-history! [history]
  (goog.events/listen history EventType.NAVIGATE #(secretary/dispatch! (.-token %)))
  (.setEnabled history true))

(defn define-routes! []
  (defroute home-route "/" [] (controller/perform-command! "switch-view" :welcome))
  (defroute local-route "/local" [] (controller/perform-command! "switch-view" :board))
  (defroute board-route "/board/:id" [id] (controller/perform-command! "switch-board" id))
  (defroute "*" [] (controller/perform-command! "switch-view" :error {:message "nothing to be seen here"})))

(defn dispatch! [& args]
  (secretary/dispatch! (apply str args)))

(defn navigate! [& route]
  (set! js/window.location.hash (apply str route)))

(defn init! []
  (setup!)
  (define-routes!)
  (enable-history! history))
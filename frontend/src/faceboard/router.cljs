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

(defn define-routes! []
  (defroute "/" []
    (controller/perform-command! "switch-view" :welcome))

  (defroute "/board/:id" [id]
    (controller/perform-command! "switch-board" id))

  ; catch-all case
  (defroute "*" []
    (controller/perform-command! "switch-view" :error {:message "nothing to be seen here"})))

(defn enable-history! [history]
  (goog.events/listen history EventType.NAVIGATE #(secretary/dispatch! (.-token %)))
  (.setEnabled history true))

(defn init! []
  (setup!)
  (define-routes!)
  (enable-history! history))
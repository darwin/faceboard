(ns faceboard.router
  (:require [secretary.core :as secretary :refer-macros [defroute]]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.controller :as controller]
            [goog.events :as events])
  (:import goog.History
           goog.history.EventType))

(def history (History.))

(defn setup []
  (secretary/set-config! :prefix "#"))

(defn define-routes []
  (defroute "/" []
    (controller/perform-command! "switch-view" :welcome))

  (defroute "/board/:id" [id]
    (controller/perform-command! "switch-board" id))

  ; catch-all case
  (defroute "*" []
    (controller/perform-command! "switch-view" :invalid)))

(defn enable-history [history]
  (goog.events/listen history EventType.NAVIGATE #(secretary/dispatch! (.-token %)))
  (.setEnabled history true))

(defn init! []
  (setup)
  (define-routes)
  (enable-history history))

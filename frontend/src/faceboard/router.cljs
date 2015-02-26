(ns faceboard.router
  (:require [secretary.core :as secretary :refer-macros [defroute]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.controller :as controller]
            [goog.events])
  (:import goog.History
           goog.history.EventType)
  (:require-macros [faceboard.macros.router :refer [defroute-with-info]]))

(defonce history (History.))
(def ^:dynamic *current-route-info*)                        ; see defroute macro

(defn setup! []
  (secretary/set-config! :prefix "#"))

(defn current-route-info [] *current-route-info*)

(defn current-route []
  (let [info (current-route-info)
        route (:route info)
        params (:params info)]
    (when-not (nil? route)
      (route params))))

(defn navigate! [& route]
  (set! js/window.location.hash (apply str route)))

(defn dispatch! [& args]
  (secretary/dispatch! (apply str args)))

(defn enable-history! [history]
  (goog.events/listen history EventType.NAVIGATE #(dispatch! (.-token %)))
  (.setEnabled history true))

(defn define-routes! []
  (defroute-with-info home-route "/" [] (controller/perform-command! "switch-view" :welcome))
  (defroute-with-info local-route "/local" [] (controller/perform-command! "switch-view" :board))
  (defroute-with-info board-route "/board/:id" [id] (controller/perform-command! "switch-board" id))
  (defroute-with-info catch-route "*" [] (controller/perform-command! "switch-view" :error {:message "nothing to be seen here"})))

(defn init! []
  (setup!)
  (define-routes!)
  (enable-history! history))
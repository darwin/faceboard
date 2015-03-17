(ns faceboard.router
  (:require [secretary.core :as secretary :refer-macros [defroute]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.controller :refer [perform!]]
            [faceboard.env :refer [local?]]
            [faceboard.state :refer [app-state]]
            [goog.events])
  (:import goog.History
           goog.history.EventType)
  (:require-macros [faceboard.macros.router :refer [defroute-with-info]]))

(defonce history (History.))

(def ^:dynamic *current-route-info*)                        ; see defroute-with-info macro

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
  (defroute-with-info home-route "/" [] (perform! :switch-view :welcome))
  (defroute-with-info local-route "/sample" [] (perform! :switch-view :board))
  (defroute-with-info board-route "/board/:id" [id] (perform! :switch-board id))
  (defroute-with-info catch-route "*" [] (perform! :switch-view :error {:message "This page does not exist."})))

(defn define-test-routes! []
  (defroute-with-info test-route "/test" [] (perform! :switch-view :test))
  (defroute-with-info test-error-route "/test/error" [] (perform! :switch-view :error {:message "This is a sample error message xxxx this is a sample error message this is a sample error message this is a sample error message."}))
  (defroute-with-info test-loading-route "/test/loading" [] (perform! :switch-view :loading {:message "This is a sample loading message."})))

(defn init! []
  (setup!)
  (when local?
    (define-test-routes!))
  (define-routes!)
  (enable-history! history))
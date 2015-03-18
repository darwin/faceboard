(ns faceboard.router
  (:require [secretary.core :as secretary :refer-macros [defroute]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.controller :refer [perform!]]
            [faceboard.env :refer [local?]]
            [faceboard.firebase :as db]
            [faceboard.whitelabel :refer [whitelabel-board]]
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

(defn update-params! [params]
  (let [info (current-route-info)
        route (:route info)
        params (merge (:params info) params)]
    (when-not (nil? route)
      (navigate! (route params)))))

(defn dispatch! [& args]
  (secretary/dispatch! (apply str args)))

(defn enable-history! [history]
  (goog.events/listen history EventType.NAVIGATE #(dispatch! (.-token %)))
  (.setEnabled history true))

(defn- switch-board-and-tab [id tab]
  (when-not (db/is-board-connected? id)
    (perform! :switch-board id))
  (perform! :switch-tab tab))

(defn define-normal-routes! []
  (defroute-with-info home-route "/" [] (perform! :switch-view :welcome))
  (defroute-with-info board-tab-route "/board/:id/:tab" [id tab] (switch-board-and-tab id tab))
  (defroute-with-info board-route "/board/:id" [id] (navigate! (board-tab-route {:id id :tab "people"})))
  (defroute-with-info catch-route "*" [] (perform! :switch-view :error {:message "This page does not exist."})))

(defn define-whitelabel-routes! [id]
  (log-info (str "Detected white-label site: implicit board-id is '" id "'"))
  (defroute-with-info whitelabel-board-tab-route "/:tab" [tab] (switch-board-and-tab id tab))
  (defroute-with-info whitelabel-board-route "/" [] (navigate! (whitelabel-board-tab-route {:id id :tab "people"})))
  (defroute-with-info whitelabel-catch-route "*" [] (perform! :switch-view :error {:message "This page does not exist."})))

(defn define-routes! []
  (if-let [whitelabel-board-id (whitelabel-board)]
    (define-whitelabel-routes! whitelabel-board-id)
    (define-normal-routes!)))

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
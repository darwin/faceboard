(ns server.core
  (:use compojure.core)
  (:require 
    [compojure.handler :refer [site]]
    [compojure.route :as route]
    [clojure.java.io :as io]
    [ring.adapter.jetty :as jetty]
    [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
    [clojure.data.json :as json]
    [ring.middleware.gzip :refer [wrap-gzip]]
    [net.cgrand.enlive-html :refer [deftemplate, set-attr prepend append html]]
    [environ.core :refer [env]]))

(def client-side-env (select-keys env [:git-revision :heroku :production]))
(def production? (not (nil? (:production env))))

(def inject-env
  (comp
    (prepend (html [:script {:type "text/javascript"} (str "window.faceboard_env = " (json/write-str client-side-env))]))))

(deftemplate index-page (io/resource (if production? "public/index-production.html" "public/index.html")) []
  [:body] inject-env)

(defroutes app-routes
  (GET "/" req (index-page))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app (->
           app-routes
           (wrap-defaults site-defaults)
           wrap-gzip))

(defn -main [& [port]]
  (let [port (Integer. (or port (env :port) 5000))]
    (jetty/run-jetty (var app) {:port port :join? false})))
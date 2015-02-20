(ns server.core
  (:use compojure.core)
  (:require 
    [compojure.handler :as handler :refer [site]]
    [compojure.route :as route]
    [clojure.java.io :as io]
    [ring.util.response :as resp]
    [ring.adapter.jetty :as jetty]
    [clojure.data.json :as json]
    [net.cgrand.enlive-html :refer [deftemplate, set-attr prepend append html]]
    [environ.core :refer [env]]))

(def client-side-env (select-keys env [:git-revision :mode]))

(def inject-env
  (comp
    (prepend (html [:script {:type "text/javascript"} (str "window.faceboard_env = " (json/write-str client-side-env))]))
    (prepend (html [:script {:type "text/javascript"} (str "window.faceboard_env_full = " (json/write-str env))]))
    ))

(deftemplate index-page (io/resource "public/index.html") []
  [:body] inject-env)

(defroutes app
  (GET "/" req (index-page))
  (route/resources "/")
  (route/not-found "Not Found"))

(defn -main [& [port]]
  (let [port (Integer. (or port (env :port) 5000))]
    (jetty/run-jetty (site #'app) {:port port :join? false})))
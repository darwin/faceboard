(ns faceboard.whitelabel
  (:require [faceboard.env :as env]
            [faceboard.helpers.utils :as utils]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(def domain-mappings
  [[#"fb\.local.*" "test-localhost-whitelabel"]             ; just a test local host
   [#".*hackerparadise\.org" "hp"]])                          ; http://faceboard.hackerparadise.org

(defn domain->boad-id [domain]
  (if-let [match (utils/find-first #(re-matches (first %) domain) domain-mappings)]
    (second match)))

(defn whitelabel-board []
  (domain->boad-id env/domain))
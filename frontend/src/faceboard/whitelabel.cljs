(ns faceboard.whitelabel
  (:require-macros [faceboard.macros.model :refer [transform-app-state]]
                   [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [faceboard.env :as env]
            [faceboard.model :as model]
            [faceboard.helpers.utils :as utils]))

(def hackerparadise-board-id "3a8450f9a0cb45d99c1a")
(def test-localhost-board-id "test-localhost-whitelabel")

(def domain-mappings
  [[#"fb\.local.*" test-localhost-board-id]                 ; just a test local host
   [#".*hackerparadise\.org" hackerparadise-board-id]])

(defn domain->boad-id [domain]
  (if-let [match (utils/find-first #(re-matches (first %) domain) domain-mappings)]
    (second match)))

(defn whitelabel-board []
  (domain->boad-id env/domain))

(defn init-hp! []
  (transform-app-state
    (model/set [:ui :filters :active :groups] #{"present"})))

(defn init-test-localhost! []
  (log "test localhost whitelabel init"))

(defn init! []
  (condp = (domain->boad-id env/domain)
    test-localhost-board-id (init-test-localhost!)
    hackerparadise-board-id (init-hp!)
    nil))
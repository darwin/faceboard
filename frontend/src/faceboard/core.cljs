(ns faceboard.core
  (:require [faceboard.app :as app]
            [faceboard.env :as env]
            [faceboard.router :as router]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(env/init!)
(router/init!)
(app/init!)
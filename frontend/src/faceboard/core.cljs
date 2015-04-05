(ns faceboard.core
  (:require [faceboard.env :as env]
            [faceboard.app :as app]
            [faceboard.exports]
            [faceboard.router :as router]
            [faceboard.whitelabel :as whitelabel]
            [faceboard.logging :refer [log log-err log-warn log-info]]))

(env/init!)
(router/init!)
(app/init!)
(whitelabel/init!)
(app/mount!)
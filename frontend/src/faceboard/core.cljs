(ns faceboard.core
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [faceboard.env :as env]
            [faceboard.app :as app]
            [faceboard.exports]
            [faceboard.router :as router]
            [faceboard.whitelabel :as whitelabel]))

(env/init!)
(router/init!)
(app/init!)
(whitelabel/init!)
(app/mount!)
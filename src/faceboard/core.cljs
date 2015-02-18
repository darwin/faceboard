(ns faceboard.core
  (:require [faceboard.app :as app]
            [faceboard.env :as env]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]))

(env/init!)
(app/init!)
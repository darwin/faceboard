(ns editor.core
  (:require [faceboard.logging :refer [log log-err log-warn log-info]]
            [editor.env :as env]
            [editor.exports]
            [editor.app :as app]))

(env/init!)

(app/init!)
(app/mount!)
(app/request-refresh!)
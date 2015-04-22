(ns editor.core
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [editor.env :as env]
            [editor.exports]
            [editor.app :as app]))

(env/init!)

(app/init!)
(app/mount!)
(app/request-refresh!)
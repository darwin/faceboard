(ns faceboard.core
  (:require [faceboard.app :as app]
            [faceboard.env :as env]))

(env/init!)
(app/init!)


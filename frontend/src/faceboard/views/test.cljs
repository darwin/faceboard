(ns faceboard.views.test
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.page :as page]))

(defn- link [url]
  (dom/a {:href url} url))

(defcomponent test-component [_ _ _]
  (render [_]
    (page/page-skeleton
      (dom/div {:class "standard-page test-page"}
        (link "#/test/error")
        (link "#/test/loading")))))
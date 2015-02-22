(ns faceboard.views.welcome
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.page :as page]
            [faceboard.controller :as controller]))

(defcomponent welcome-component [data _ _]
  (render [_]
    (let [ui (:ui data)
          model (:model data)
          {:keys [selected-tab-id tabs]} ui]
      (page/page-skeleton
        []
        "WELCOME!"))))
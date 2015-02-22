(ns faceboard.invalid
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.page :as page]
            [faceboard.menu :as menu]
            [faceboard.controller :as controller]
            [faceboard.editor :as editor]
            [faceboard.people :as people]
            [faceboard.places :as places]))

(defcomponent invalid-component [data _ _]
  (render [_]
    (let [ui (:ui data)
          model (:model data)
          {:keys [selected-tab-id tabs]} ui]
      (page/page-skeleton
        []
        "INVALID!"))))
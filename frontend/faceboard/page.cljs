(ns faceboard.page
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [faceboard.state :as state :refer [app-state]]
            [faceboard.controller :as controller]
            [faceboard.info_banner :as info-banner]
            [faceboard.env :as env]
            [faceboard.logo :as logo]))

(defn page-skeleton [top-bar page-content]
  (dom/div {:class "page"}
    (dom/div {:class "top-bar no-select"}
      (om/build logo/logo-component {})
      top-bar)
    (dom/div {:class "page-content"}
      page-content)
    (om/build info-banner/info-banner-component {:git-revision env/git-revision})))
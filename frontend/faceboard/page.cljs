(ns faceboard.page
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [faceboard.views.info_banner :refer [info-banner-component]]
            [faceboard.views.logo :refer [logo-component]]
            [faceboard.env :as env]))

(defn page-skeleton [top-bar page-content]
  (dom/div {:class "page"}
    (dom/div {:class "top-bar no-select"}
      (om/build logo-component {})
      top-bar)
    (dom/div {:class "page-content"} page-content)
    (om/build info-banner-component {:git-revision env/git-revision})))
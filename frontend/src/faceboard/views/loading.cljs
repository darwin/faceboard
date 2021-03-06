(ns faceboard.views.loading
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.page :as page]
            [faceboard.views.logo :as logo]))

(defcomponent loading-message-component [data _ _]
  (render [_]
    (dom/div {:class "loading-message"}
      (dom/div {:class "label"} (dom/i {:class "fa fa-cog fa-spin"}) (str " " (:message data))))))

(defcomponent loading-component [data _ _]
  (render [_]
    (page/page-skeleton
      (dom/div {:class "standard-page slim-layout loading-page"}
        (om/build logo/big-logo-component {})
        (om/build loading-message-component data)))))
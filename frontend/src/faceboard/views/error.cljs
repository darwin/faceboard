(ns faceboard.views.error
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.page :as page]
            [faceboard.views.logo :as logo]))

(defcomponent error-message-component [data _ _]
  (render [_]
    (dom/div {:class "error-message"}
      (dom/div {:class "label"} (dom/i {:class "fa fa-exclamation-triangle"}) " ERROR")
      (dom/div {:class "message"} (str (:message data))))))

(defcomponent contact-component [data _ _]
  (render [_]
    (dom/div {:class "contact-box"}
      (dom/div {} "Try to " (dom/a {:href "javascript:location.reload()"} "fully refresh the browser") " or")
      (dom/div {} "report the issue at " (dom/a {:href "mailto:support@binaryage.com"} "support@binaryage.com")))))

(defcomponent error-component [data _ _]
  (render [_]
    (page/page-skeleton
      (dom/div {:class "standard-page slim-layout error-page"}
        (om/build logo/big-logo-component {})
        (om/build error-message-component data)
        (om/build contact-component {})))))
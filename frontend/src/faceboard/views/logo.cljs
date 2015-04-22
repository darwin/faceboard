(ns faceboard.views.logo
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]))

(defcomponent small-logo-component [_ _ _]
  (render [_]
    (dom/div {:class "small-logo"}
      (dom/div {:class "faceboard-logo"}
        (dom/a {:href "/" :target "_self"} "faceboard")))))


(defcomponent big-logo-component [_ _ _]
  (render [_]
    (dom/div {:class "big-logo no-select"}
      (dom/span {} "FACEBOARD"))))

(ns faceboard.views.info_banner
  (:require [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.logging :refer [log, log-err, log-warn]]))

(defcomponent info-banner-component [data _ _]
  (render [_]
    (dom/div {:class "info-banner"}
      (let [rev (:git-revision data)]
        (if-not rev
          "local version"
          (let [url (str "https://github.com/darwin/faceboard/tree/" rev)
                label (str "darwin/faceboard @ " (subs rev 0 7))]
            (dom/div {:class "github"}
              "deployed from github: "
              (dom/a {:href url} label))))))))
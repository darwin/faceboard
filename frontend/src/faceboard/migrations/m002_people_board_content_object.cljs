(ns faceboard.migrations.m002-people-board-content-object
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]]))

(defn- convert-people-content-from-array-to-object [content]
  {:people content})

(defn convert-people-content-to-object [model]
  (update-in model [:tabs] (fn [tabs]
                             (map (fn [tab]
                                    (if (= (:kind tab) "people")
                                      (assoc tab :content (convert-people-content-from-array-to-object (:content tab)))
                                      tab))
                               tabs))))


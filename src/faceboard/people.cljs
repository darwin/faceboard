(ns faceboard.people
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [cemerick.pprng :as rng]))

(defcomponent person-component [person owner opts]
  (render [_]
    (let [random-generator (:rng opts)
          angle (- (rng/int random-generator 5) 3)
          flag-code (:country person)]
      (dom/div {:class "person f16"}
        (dom/div {:class "polaroid-frame"
                  :style {:transform (str "rotate(" angle "deg)")}}
          (dom/div {:class "photo"}
            (dom/img {:src (:photo-url person)}))
          (dom/div {:class "name"}
            (:name person)
            (when-not (nil? flag-code)
              (dom/div {:class (str "flag " flag-code)}))
            ))))))

(defcomponent people-component [data owner opts]
  (render [_]
    (let [random-generator (rng/rng 1337)
          opts {:rng random-generator}
          ui (:ui data)
          people (:data data)]
      (dom/div {:class "people-board"}
        (om/build-all person-component people {:opts opts})))))
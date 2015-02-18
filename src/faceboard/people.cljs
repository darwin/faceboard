(ns faceboard.people
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [cemerick.pprng :as rng]))

(defcomponent person-component [person owner opts]
  (render [_]
    (let [random-generator (:rng opts)
          angle (- (rng/int random-generator 5) 3)]
      (dom/div {:class "person"}
        (dom/div {:class "polaroid-frame"
                  :style { :transform (str "rotate(" angle "deg)") }}
          (dom/div {:class "photo"}
            (dom/img {:src (:photo-url person)}))
          (dom/div {:class "name"}
            (:name person)))))))

(defcomponent people-component [data owner opts]
  (render [_]
    (let [random-generator (rng/rng 1337)
          opts {:rng random-generator}]
      (dom/div {:class "people-board"}
        (om/build-all person-component data {:opts opts})))))

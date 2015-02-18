(ns faceboard.people
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]))

(defcomponent person-component [person owner opts]
  (render [_]
    (.log js/console person)
    (dom/div {:class "person"}
      (dom/div {:class "polaroid-frame"}
        (dom/div {:class "photo"}
          (dom/img {:src (:photo-url person)}))
        (dom/div {:class "name"}
          (:name person))))))

(defcomponent people-component [data owner opts]
  (render [_]
    (dom/div {:class "people-board"}
      (om/build-all person-component data))))
       
       

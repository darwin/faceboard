(ns faceboard.views.people
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :as controller]
            [faceboard.utils :as utils :refer [log, log-err, log-warn]]
            [cemerick.pprng :as rng]))

(defcomponent person-extended-info-component [person owner opts]
  (render [_]
    (dom/div {:class "person-extended-info"}
      "TBD: some additional info")))

(defcomponent person-basic-info-component [data owner opts]
  (render [_]
    (let [person (:person data)
          random-generator (rng/rng (hash (:name person)))
          angle (- (rng/int random-generator 5) 3)
          flag-code (:country person)]
      (dom/div {:class (str "person"
                         (when (:hide? data) " hide"))}
        (dom/div {:class "polaroid-frame"
                  :style {:transform (str "rotate(" angle "deg)")}}
          (dom/div {:class "left-part"}
            (dom/div {:class "photo"}
              (dom/img {:src (:photo-url person)}))
            (dom/div {:class "name f16"}
              (:name person)
              (when-not (nil? flag-code)
                (dom/div {:class (str "flag " flag-code)}))))
          (when (:extended? data)
            (dom/div {:class "right-part"}
              (om/build person-extended-info-component person)))
          (dom/div {:class "clear"}))))))

(defcomponent person-component [data owner opts]
  (render [_]
    (let [extended? (:extended? data)
          person (:person data)
          self-index (:self-index data)]
      (dom/div {:class    (str "person-box" (when extended? " extended"))
                :on-click (fn [e]
                            (.stopPropagation e)
                            (controller/perform-command! "change-extended-set" (if-not extended? (set [self-index]) #{})))}
        (when extended?
          (dom/div {:class "person-extended-wrapper"}
            (om/build person-basic-info-component {:extended? true
                                                   :person    person})))
        (dom/div {:class "person-essentials-wrapper"}
          (om/build person-basic-info-component {:hide?  extended?
                                                 :person person}))
        ))))

(defcomponent people-component [data owner opts]
  (render [_]
    (let [people (:data data)
          ui (:ui data)
          extended-set (:extended-set ui)]
      (dom/div {:class "people-board"}
        (for [i (range (count people))]
          (let [data {:person     (nth people i)
                      :extended?  (contains? extended-set i)
                      :self-index i}]
            (om/build person-component data)))))))
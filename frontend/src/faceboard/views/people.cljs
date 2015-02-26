(ns faceboard.views.people
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.controller :as controller :refer [perform!]]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [cemerick.pprng]))

(defcomponent person-extended-info-component [_ _ _]
  (render [_]
    (dom/div {:class "person-extended-info"}
      "TBD: some additional info")))

(defcomponent person-basic-info-component [data _ _]
  (render [_]
    (let [person (:person data)
          random-generator (cemerick.pprng/rng (hash (:name person)))
          angle (- (cemerick.pprng/int random-generator 5) 3)
          flag-code (:country person)]
      (dom/div {:class (str "person"
                         (when (:hide? data) " hide"))}
        (dom/div {:class "polaroid-frame"
                  :style {:transform (str "rotate(" angle "deg)")}}
          (dom/div {:class "left-part"}
            (dom/div {:class "photo"}
              (dom/img {:src (or (:photo-url person) "/images/unknown.jpg")}))
            (dom/div {:class "name f16"}
              (:name person)
              (when-not (nil? flag-code)
                (dom/div {:class (str "flag " flag-code)}))))
          (when (:extended? data)
            (dom/div {:class "right-part"}
              (om/build person-extended-info-component person)))
          (dom/div {:class "clear"}))))))

(defcomponent person-component [data _ _]
  (render [_]
    (let [extended? (:extended? data)
          person (:person data)
          self-index (:self-index data)]
      (dom/div {:class    (str "person-box" (when extended? " extended"))
                :on-click (fn [e]
                            (.stopPropagation e)
                            (perform! :change-extended-set (if-not extended? (set [self-index]) #{})))}
        (when extended?
          (dom/div {:class "person-extended-wrapper"}
            (om/build person-basic-info-component {:extended? true
                                                   :person    person})))
        (dom/div {:class "person-essentials-wrapper"}
          (om/build person-basic-info-component {:hide?  extended?
                                                 :person person}))
        ))))

(defcomponent people-component [data _ _]
  (render [_]
    (let [people (seq (:data data))
          ui (:ui data)
          extended-set (:extended-set ui)]
      (dom/div {:class "people-board"}
        (for [i (range (count people))]
          (let [data {:person     (second (nth people i))
                      :extended?  (contains? extended-set i)
                      :self-index i}]
            (om/build person-component data)))))))
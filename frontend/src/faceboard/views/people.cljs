(ns faceboard.views.people
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.animator :refer [animate anim-phase anim-class]]
            [faceboard.controller :refer [perform!]]
            [faceboard.shared.anims :as anims]
            [faceboard.logging :refer [log, log-err, log-warn]]
            [cemerick.pprng]))

(defcomponent person-extended-info-component [_ _ _]
  (render [_]
    (dom/div {:class "person-extended-info"}
      "TBD: some additional info")))

(defcomponent person-basic-info-component [data _ _]
  (render [_]
    (let [person (:person data)
          extended? (:extended? data)
          random-generator (cemerick.pprng/rng (hash (:name person)))
          angle (- (cemerick.pprng/int random-generator 90) 45)
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
          (when extended?
            (dom/div {:class "right-part"}
              (om/build person-extended-info-component person)))
          (dom/div {:class "clear"}))))))

(defcomponent person-component [data _ _]
  (render [_]
    (let [person (:person data)
          self-index (:self-index data)
          expansion-anim (anims/person-expanding self-index)
          shrinking-anim (anims/person-shrinking self-index)
          extended? (or (:extended? data) (= (anim-phase shrinking-anim) 0))]
      (dom/div {:class    (str "person-box"
                            (anim-class expansion-anim " expanding")
                            (anim-class shrinking-anim " shrinking")
                            (when extended? " extended"))
                :on-click (fn [e]
                            (.stopPropagation e)
                            (perform! :change-extended-set (if-not extended? (set [self-index]) #{})))}
        (dom/div {:class "person-extended-wrapper"}
          (om/build person-basic-info-component {:hide?     (not extended?)
                                                 :extended? extended?
                                                 :person    person}))
        (dom/div {:class "person-essentials-wrapper"}
          (om/build person-basic-info-component {:hide?  extended? ; acts as a hidden placeholder when extended
                                                 :person person}))))))

(defcomponent people-component [data _ _]
  (render [_]
    (let [people (seq (:data data))
          ui (:ui data)
          anims (:anims data)
          extended-set (:extended-set ui)]
      (dom/div {:class "people-board"}
        (for [i (range (count people))]
          (let [data {:person     (second (nth people i))
                      :extended?  (contains? extended-set i)
                      :anim       (:person anims)
                      :self-index i}]
            (om/build person-component data)))))))
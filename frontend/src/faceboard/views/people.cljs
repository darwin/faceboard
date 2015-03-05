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
          id (:id data)
          extended? (:extended? data)
          random-generator (cemerick.pprng/rng (hash id))
          angle (- (cemerick.pprng/int random-generator 20) 10)
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
          index (:index data)
          id (:id data)
          expansion-anim (anims/person-expanding index)
          shrinking-anim (anims/person-shrinking index)
          extended? (or (:extended? data) (= (anim-phase shrinking-anim) 0))]
      (dom/div {:class    (str "person-box"
                            (anim-class expansion-anim " expanding")
                            (anim-class shrinking-anim " shrinking")
                            (when extended? " extended"))
                :on-click (fn [e]
                            (.stopPropagation e)
                            (perform! :change-extended-set (if-not extended? (set [index]) #{})))}
        (dom/div {:class "person-extended-wrapper"}
          (om/build person-basic-info-component {:hide?     (not extended?)
                                                 :extended? extended?
                                                 :id id
                                                 :person    person}))
        (dom/div {:class "person-essentials-wrapper"}
          (om/build person-basic-info-component {:hide?  extended? ; acts as a hidden placeholder when extended
                                                 :id id
                                                 :person person}))))))

(defcomponent people-component [data _ _]
  (render [_]
    (let [people (seq (:data data))
          ui (:ui data)
          anims (:anims data)
          extended-set (:extended-set ui)]
      (dom/div {:class "people-board"}
        (for [i (range (count people))]
          (let [record (nth people i)
                data {:id (first record)
                      :person     (second record)
                      :extended?  (contains? extended-set i)
                      :anim       (:person anims)
                      :index i}]
            (om/build person-component data)))))))
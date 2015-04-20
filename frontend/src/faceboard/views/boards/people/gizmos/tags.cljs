(ns faceboard.views.boards.people.gizmos.tags
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.filters.tags :refer [build-tags-tally]]
            [faceboard.helpers.gizmos :refer [handler gizmo-form-key-down]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [phalanges.core :as phalanges]
            [cuerdas.core :as str]))

(def tags-path [:tags])

(defn commit-tags-change [person value]
  (om/update! person tags-path value))

(defn toggle-tag [tag tags]
  (if (some #(= tag %) tags)
    (remove #(= tag %) tags)
    (concat tags [tag])))

(defn insert-tag [tag tags]
  (if-not (some #(= tag %) tags)
    (concat tags [tag])
    tags))

(defn add-tag [owner name tags committer]
  (let [node (om/get-node owner name)
        value (str/trim (str (.-value node)))]
    (when-not (zero? (count value))
      (swap! tags (partial insert-tag value))
      (committer)
      (aset node "value" ""))))

(defn clear-all-tags [tags committer]
  (reset! tags [])
  (committer))

(defn handle-add-tag-key [adder e]
  (let [key (phalanges/key-set e)]
    (condp #(contains? %2 %1) key
      :enter (adder)
      nil)))

(defcomponent tags-filter-item-component [data owner]
  (render [_]
    (let [{:keys [tag tags report selected? committer add-input-resolver]} data
          count (:count report)
          toggler (partial toggle-tag tag)
          last? (and selected? (= count 1))]
      (dom/div {:class    (str "tag-item" (when selected? " selected") (if last? " last"))
                :on-click #(do
                            (if last?
                              (if-let [focus-node (add-input-resolver)]
                                (aset focus-node "value" tag)))
                            (swap! tags toggler)
                            (committer))}
        (dom/span {:class "tag no-dismiss"
                   :title (if last? "last usage of this tag, click to remove it completely" (str "used " count " times"))} tag)))))

(defcomponent tags-gizmo-component [data owner]
  (did-mount [_]
    (let [focus-node (om/get-node owner "focus")]
      (.focus focus-node)))
  (render [_]
    (let [{:keys [person people]} data
          tags (person/tags person)
          live-tags (atom tags)                             ; contains latest local state, commit may be deferred for a while
          committer (handler (partial commit-tags-change person) 1000 live-tags)
          add-tag-fn (partial add-tag owner "focus" live-tags committer)
          clear-all-fn (partial clear-all-tags live-tags committer)]
      (dom/form {:class       "tags-gizmo"
                 :on-key-down gizmo-form-key-down
                 :on-submit   (fn [e] (.preventDefault e))}
        (dom/div {:class "tags-selector clearfix no-dismiss"}
          (let [tags-tally (build-tags-tally people)
                sorted-tags (sort (:tags-by-size tags-tally))]
            (for [tag sorted-tags]
              (om/build tags-filter-item-component {:tag       tag
                                                    :tags      live-tags
                                                    :committer committer
                                                    :add-input-resolver #(om/get-node owner "focus")
                                                    :selected? (boolean (some #(= tag %) tags))
                                                    :report    (get-in tags-tally [:tally tag])}))))
        (dom/div {:class "add-input"}
          (dom/label "Add interest:"
            (dom/input {:ref         "focus"
                        :type        "text"
                        :placeholder "tag name"
                        :on-key-down (partial handle-add-tag-key add-tag-fn)})
            (dom/button {:class    "add-tag-action"
                         :on-click add-tag-fn}
              "↵")
            (dom/button {:class    "clear-all-action"
                         :on-click clear-all-fn}
              "clear all")))))))
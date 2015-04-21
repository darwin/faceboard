(ns faceboard.views.boards.people.gizmos.tags
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.filters.tags :refer [build-tags-tally]]
            [faceboard.helpers.gizmos :refer [debounce-commit gizmo-form-key-down]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [phalanges.core :as phalanges]
            [cuerdas.core :as str]))

(def tags-path [:tags])

(defn commit-tags-change [person value]
  (om/update! person tags-path value))

(def debounced-commit-tags-change (debounce-commit commit-tags-change))

(defn toggle-tag [tag tags]
  (if (some #(= tag %) tags)
    (remove #(= tag %) tags)
    (concat tags [tag])))

(defn append-tag [tag tags]
  (if-not (some #(= tag %) tags)
    (concat tags [tag])
    tags))

(defn add-tag [owner name tags updater]
  (let [node (om/get-node owner name)
        value (str/trim (str (.-value node)))]
    (when-not (empty? value)
      (updater {:tags (append-tag value tags) :add ""}))))

(defn clear-all-tags [updater]
  (updater {:tags []}))

(defn handle-add-input-keys [adder e]
  (let [key (phalanges/key-set e)]
    (condp #(contains? %2 %1) key
      :enter (adder)
      nil)))

(defcomponent tags-filter-item-component [data _]
  (render [_]
    (let [{:keys [tag tags updater report selected?]} data
          count (or (:count report) 1)
          last? (and selected? (= count 1))]
      (dom/div {:class    (str "tag-item" (when selected? " selected") (if last? " last"))
                :on-click (fn [e]
                            (.preventDefault e)
                            (.stopPropagation e)
                            (let [toggled-tags {:tags (toggle-tag tag tags)}
                                  modified-add-field (if last? {:add tag})]
                              (updater (merge toggled-tags modified-add-field))))}
        (dom/span {:class "tag no-dismiss"
                   :title (if last? "last usage of this tag, click to remove it completely" (str "used " count " times"))} tag)))))

(defcomponent tags-gizmo-component [data owner]
  (init-state [_]
    (let [{:keys [person]} data]
      {:tags (person/tags person)
       :add  ""}))
  (did-mount [_]
    (let [focus-node (om/get-node owner "focus")]
      (.focus focus-node)))
  (render-state [_ state]
    (let [{:keys [person people]} data
          tags (:tags state)
          updater (fn [state-patch]
                    (om/update-state! owner (fn [old-state]
                                              (let [new-state (merge old-state state-patch)]
                                                (debounced-commit-tags-change person (:tags new-state))
                                                new-state))))
          add-tag-handler (partial add-tag owner "focus" tags updater)
          clear-all-handler (partial clear-all-tags updater)]
      (dom/form {:class       "tags-gizmo"
                 :on-key-down gizmo-form-key-down
                 :on-submit   (fn [e] (.preventDefault e))}
        (dom/div {:class "tags-selector clearfix no-dismiss"}
          (let [tags-tally (build-tags-tally people)
                all-tags (distinct (concat (:tags-by-size tags-tally) tags))
                all-tags-sorted (sort all-tags)]
            (if (empty? all-tags-sorted)
              (dom/div {:class "no-tags-avail"} "Add some interests below...")
              (for [tag all-tags-sorted]
                (om/build tags-filter-item-component {:tag       tag
                                                      :tags      tags
                                                      :updater   updater
                                                      :selected? (boolean (some #(= tag %) tags))
                                                      :report    (get-in tags-tally [:tally tag])})))))
        (dom/div {:class "controls-row"}
          (dom/label "Add a new interest:"
            (dom/input {:ref         "focus"
                        :type        "text"
                        :value       (:add state)
                        :placeholder "tag name"
                        :on-change   #()
                        :on-key-down (partial handle-add-input-keys add-tag-handler)})
            (dom/button {:class    "add-tag-action"
                         :on-click add-tag-handler}
              "⏎"))
          (dom/button {:class    "clear-all-action fix-float-button"
                       :on-click clear-all-handler}
            "clear all"))))))

(def tags-gizmo-descriptor {:id       :tags
                            :title    "edit interests section"
                            :position :right
                            :content  (partial om/build tags-gizmo-component)})
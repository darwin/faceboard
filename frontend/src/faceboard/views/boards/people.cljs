(ns faceboard.views.boards.people
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.router :refer [embedded?]]
            [faceboard.controller :refer [perform!]]
            [faceboard.helpers.people :refer [is-person-filtered? person-card-z-level build-filter-predicates]]
            [faceboard.views.boards.people.card :refer [card-component]]
            [faceboard.views.boards.people.filters :refer [filters-component]]
            [faceboard.helpers.underscore :refer [debounce]]
            [faceboard.helpers.utils :refer [swallow]]
            [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [faceboard.helpers.person :as person]
            [faceboard.router :as router]))

(extend-type js/NodeList
  ISeqable
  (-seq [nl] (array-seq nl 0)))

(defn retrieve-card-layout [card]
  (if-let [person-id (.getAttribute card "data-fbid")]
    [person-id {:left (.-offsetLeft card)
                :top  (.-offsetTop card)
                :z    (- person-card-z-level)}]))

(defn retrieve-cards-layout [cards]
  (apply hash-map (mapcat retrieve-card-layout cards)))

(defn recompute-layout [node data]
  (let [cards (.-childNodes node)
        current-layout (get-in @app-state [:transient (:id data) :layout])
        layout (retrieve-cards-layout cards)]
    (when-not (= (pr-str current-layout) (pr-str layout))
      (perform! :update-people-layout (:id data) layout))))

(def debounced-recompute-layout (debounce recompute-layout 200))

(defcomponent people-scaffold-component [data owner _]
  (did-mount [_]
    (let [node (om/get-node owner "desk")
          addResizeListener (aget js/window "addResizeListener")]
      (.call addResizeListener js/window node #(debounced-recompute-layout node data))))
  (did-update [_ _ _]
    (debounced-recompute-layout (om/get-node owner "desk") data))
  (render [_]
    (let [people (get-in data [:content :people])
          people-comparator #(compare (person/name %) (person/name %2))
          sorted-people (sort people-comparator people)
          active-filters (get-in data [:ui :filters :active])
          filter-predicates (build-filter-predicates active-filters data)
          person->item (fn [person] (hash-map :person person :filtered? (is-person-filtered? filter-predicates person)))
          sorted-people-with-filter-status (map person->item sorted-people)
          sorted-people-ordered-by-filter (sort-by :filtered? sorted-people-with-filter-status)
          last-filtered? (atom false)
          separator-adder (fn [item] (if (and (not @last-filtered?) (:filtered? item))
                                       (do (reset! last-filtered? true) [{:separator true} item])
                                       [item]))
          sorted-people-ordered-by-filter-with-separator (mapcat separator-adder sorted-people-ordered-by-filter)]
      (dom/div {:class "people-desk people-scaffold clearfix"
                :ref   "desk"}
        (for [item sorted-people-ordered-by-filter-with-separator]
          (if (:separator item)
            (dom/div {:class "separator clear"})
            (let [person (:person item)
                  id (:id person)
                  data {:person    person
                        :extended? false
                        :filtered? (:filtered? item)
                        :anim      0}]
              (om/build card-component data {:react-key id}))))))))

(defcomponent people-layout-component [data _ _]
  (render [_]
    (let [{:keys [ui anims transient]} data
          {:keys [extended-set editing? filters]} ui
          people (get-in data [:content :people])
          layout (get-in transient [:layout])
          active-filters (:active filters)
          filter-predicates (build-filter-predicates active-filters data)]
      (dom/div {:class "people-desk people-layout clearfix"}
        (if layout
          (for [person people]
            (let [id (:id person)
                  data {:person    person
                        :people    people
                        :layout    (get layout id)
                        :extended? (contains? extended-set id)
                        :filtered? (is-person-filtered? filter-predicates person)
                        :editing?  editing?
                        :gizmo     (:gizmo ui)
                        :anim      (:person anims)}]
              (om/build card-component data {:react-key id}))))))))

(defn toggle-editing-when-clicked-edit-background [data e]
  (swallow e)
  (if (get-in data [:ui :show-editor])
    (perform! :hide-editor)
    (perform! :toggle-editing)))

(defcomponent people-component [data _ _]
  (render [_]
    (let [static-data (apply dissoc data [:transient :anims :cache])
          editing? (:editing? (:ui data))]
      (dom/div {:class    (str "desktop no-select" (if editing? " editing"))
                :on-click #(router/switch-person nil)}
        (if-not (embedded?)
          (om/build filters-component static-data))
        (om/build people-layout-component data)
        (om/build people-scaffold-component static-data)
        (if editing?
          (dom/div {:class    "edit-background"
                    :on-click (partial toggle-editing-when-clicked-edit-background data)}))))))
(ns faceboard.views.boards.people
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.animator :refer [animate anim-phase anim-class]]
            [faceboard.controller :refer [perform!]]
            [faceboard.shared.anims :as anims]
            [faceboard.router :as router]
            [faceboard.helpers.social :refer [parse-social social-info]]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.countries :refer [lookup-country-name]]
            [faceboard.helpers.utils :refer [non-sanitized-div css-transform]]
            [faceboard.helpers.filters.groups :refer [build-groups-tally groups-filter-predicate]]
            [faceboard.helpers.filters.countries :refer [build-countries-tally countries-filter-predicate]]
            [faceboard.helpers.filters.tags :refer [build-tags-tally tags-filter-predicate]]
            [faceboard.helpers.filters.social :refer [build-socials-tally socials-filter-predicate]]
            [faceboard.helpers.underscore :refer [throttle]]
            [faceboard.state :refer [app-state]]
            [faceboard.logging :refer [log log-err log-warn log-info]])
  (:require-macros [faceboard.macros.utils :refer [profile, measure]]))

(defcomponent social-section-item-component [data _ _]
  (render [_]
    (let [{:keys [type label content icon url]} (social-info data)]
      (dom/div {:class (str "social-item" (if type (str " " type) " link"))}
        (dom/a {:href url}
          (dom/i {:class (str "icon fa " icon)
                  :title (when type (str content " @ " label))})
          (dom/span {:class "content"} (str " " content)))))))

(defcomponent social-section-component [data _ _]
  (render [_]
    (dom/div {:class "extended-info-section social clearfix"}
      (dom/div {:class "info-title"} "social")
      (om/build-all social-section-item-component data))))

(defcomponent tags-section-item-component [data _ _]
  (render [_]
    (let [tag data]
      (dom/span {:class "tags-item"} tag))))

(defcomponent tags-section-component [data _ _]
  (render [_]
    (dom/div {:class "extended-info-section tags clearfix"}
      (dom/div {:class "info-title"} "interests")
      (om/build-all tags-section-item-component data))))

(defcomponent about-section-component [data _ _]
  (render [_]
    (dom/div {:class "extended-info-section about clearfix"}
      (dom/div {:class "info-title"} "about")
      (non-sanitized-div (:about data)))))

(defcomponent contact-section-component [data _ _]
  (render [_]
    (let [{:keys [phone email]} data]
      (dom/div {:class "extended-info-section contact clearfix"}
        (dom/div {:class "info-title"} "contact")
        (when email
          (dom/div {:class "email"}
            (dom/a {:href (str "mailto:" email)} email)))
        (when phone
          (dom/div {:class "phone"}
            (dom/span {} "phone: ")
            (dom/span {:class "number"} phone)))))))

(defcomponent person-extended-info-component [data _ _]
  (render [_]
    (let [{:keys [bio social tags]} data]
      (dom/div {:class "person-extended-info"}
        (when (:about bio)
          (om/build about-section-component bio))
        (when (or (:email bio) (:phone bio))
          (om/build contact-section-component bio))
        (when (and tags (> (count tags) 0))
          (om/build tags-section-component tags))
        (when (and social (> (count social) 0))
          (om/build social-section-component social))))))

(defcomponent person-info-component [data _ _]
  (render [_]
    (let [{:keys [person extended?]} data
          country-code (person/country-code person)
          country-name (person/country-name person)]
      (dom/div {:class (str "person" (when (:hide? data) " hide"))}
        (dom/div {:class "polaroid-frame"
                  :style (css-transform (str
                                          "rotate(" (person/photo-angle person) "deg)"
                                          "translateX(" (person/photo-displace-x person) "px)"
                                          "translateY(" (person/photo-displace-y person) "px)"
                                          "translateZ(" (person/photo-displace-z person) "px)"))}
          (dom/div {:class "left-part"}
            (dom/div {:class (str "photo" (when-not (person/photo-has-frame? person) " no-frame"))}
              (dom/img {:src (person/photo-url person)}))
            (dom/div {:class "name f16"
                      :title (person/full-name person)}
              (person/name person)
              (when-not (nil? country-code)
                (dom/div {:class (str "flag " country-code)
                          :title country-name}))))
          (when extended?
            (dom/div {:class "right-part"}
              (dom/div {:class    "person-edit-button"
                        :on-click (fn [e]
                                    (.stopPropagation e)
                                    (perform! :open-editor (om/path person)))}
                (dom/i {:class "fa fa-cog"}))
              (om/build person-extended-info-component person)))
          (dom/div {:class "clear"}))))))

(defcomponent person-component [data _ _]
  (render [_]
    (let [{:keys [person filtered? layout]} data
          id (:id person)
          expansion-anim (anims/person-expanding id)
          shrinking-anim (anims/person-shrinking id)
          interactive? (and layout (not filtered?))
          extended? (and
                      (not filtered?)
                      (or (:extended? data) (= (anim-phase shrinking-anim) 0) (= (anim-phase shrinking-anim) 1)))
          transform (when layout
                      (str
                        "translateX(" (:left layout) "px)"
                        "translateY(" (:top layout) "px)"
                        "translateZ(" (:z layout) "px)"))
          zoom-transform (when layout
                           (str
                             "translateZ(" (if extended? 50 0) "px)"))]
      (dom/div {:class     (str "person-card"
                             (when layout " has-layout")
                             (anim-class expansion-anim " expanding")
                             (anim-class shrinking-anim " shrinking")
                             (when extended? " extended")
                             (when (:extended? data) " top-z")
                             (if filtered? " filtered" " expandable"))
                :style     (css-transform transform)
                :data-fbid id
                :on-click  (when interactive?
                             (fn [e]
                               (.stopPropagation e)
                               (router/switch-person (if-not extended? id nil))))}
        (dom/div {:class (str "person-card-zoom")
                  :style (css-transform zoom-transform)}
          (when layout
            (dom/div {:class "person-extended-wrapper"}
              (om/build person-info-component {:hide?     (not extended?)
                                               :extended? extended?
                                               :id        id
                                               :person    person})))
          (dom/div {:class "person-essentials-wrapper"}
            (om/build person-info-component {:hide?  extended? ; acts as a hidden placeholder when extended
                                             :id     id
                                             :person person})))))))

(defcomponent filter-section-label-component [data _ _]
  (render [_]
    (let [{:keys [expanded? active? key label title]} data]
      (dom/div {:class    (str "filter-section-label " (name key) "-filter-section-label" (when active? " active-filter"))
                :title    (or title (str "filtering by " label))
                :on-click #(perform! :toggle-filter-expansion key)}
        (dom/span {:class (str "fa" (if expanded? " fa-arrow-circle-down" " fa-arrow-circle-right"))})
        (dom/span label)
        (dom/span {:class "fa fa-filter"})
        (when active?
          (dom/span {:class    "filter-clear"
                     :on-click (fn [e]
                                 (.stopPropagation e)
                                 (perform! :clear-filter key))}
            "clear filter"))))))

(defcomponent groups-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [group report selected? empty?]} data
          {:keys [count label title]} report]
      (dom/div {:class    (str "groups-filter-item" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-group :filter-select-group) group)}
        (dom/span {:class "group"
                   :title (str (when title (str title " ")) "(" count "x)")}
          label)))))

(defcomponent countries-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [country-code report selected? empty?]} data
          country-name (lookup-country-name country-code)
          count (:count report)]
      (dom/div {:class    (str "countries-filter-item f16" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-country :filter-select-country) country-code)}
        (dom/span {:class "countries-filter-item-body"
                   :title (str country-name " (" count "x)")}
          (when-not (nil? country-code)
            (dom/span {:class (str "flag " country-code)})))))))

(defcomponent tags-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [tag report selected? empty?]} data
          count (:count report)]
      (dom/div {:class    (str "tags-filter-item" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-tag :filter-select-tag) tag)}
        (dom/span {:class "tag"
                   :title (str "(" count "x)")} tag)))))

(defcomponent socials-filter-item-component [data _ _]
  (render [_]
    (let [{:keys [social report selected? empty?]} data
          count (:count report)
          icon (:icon report)]
      (dom/div {:class    (str "socials-filter-item" (when selected? " selected") (when empty? " empty"))
                :on-click #(perform! (if (.-shiftKey %) :filter-shift-select-social :filter-select-social) social)}
        (dom/i {:class (str "icon fa " icon)
                :title (str social " (" count "x)")})))))

(defn build-groups-filter-predicate [active-filters groups]
  (if-let [active-groups (:groups active-filters)]
    (when-not (empty? active-groups)
      (partial groups-filter-predicate groups active-groups))))

(defn build-countries-filter-predicate [active-filters]
  (if-let [active-countries (:countries active-filters)]
    (when-not (empty? active-countries)
      (partial countries-filter-predicate active-countries))))

(defn build-tags-filter-predicate [active-filters]
  (if-let [active-tags (:tags active-filters)]
    (when-not (empty? active-tags)
      (partial tags-filter-predicate active-tags))))

(defn build-socials-filter-predicate [active-filters]
  (if-let [active-socials (:socials active-filters)]
    (when-not (empty? active-socials)
      (partial socials-filter-predicate active-socials))))

(defn build-filter-predicates [active-filters data]
  (let [predicates [(build-groups-filter-predicate active-filters (get-in data [:content :groups]))
                    (build-countries-filter-predicate active-filters)
                    (build-tags-filter-predicate active-filters)
                    (build-socials-filter-predicate active-filters)]]
    (remove nil? predicates)))

(defn is-person-kept? [filter-predicates person]
  (every? true? (map #(% person) filter-predicates)))

(defn is-person-filtered? [filter-predicates person]
  (not (is-person-kept? filter-predicates person)))

(defn filter-people-except [except-filter data]
  (let [people (get-in data [:content :people])
        active-filters (dissoc (get-in data [:ui :filters :active]) except-filter)
        filter-predicates (build-filter-predicates active-filters data)]
    (remove #(is-person-filtered? filter-predicates %) people)))

(defcomponent groups-filter-component [data _ _]
  (render [_]
    (let [people (get-in data [:content :people])
          groups (get-in data [:content :groups])
          expanded? (contains? (get-in data [:ui :filters :expanded-set]) :groups)
          groups-tally (build-groups-tally people groups)
          filter-path [:ui :filters :active :groups]
          selected-groups (get-in data filter-path)
          sorted-groups (:ordered-groups groups-tally)
          prefiltered-people (filter-people-except :groups data)
          people-filtered-out? (fn [group] (every? #(not (groups-filter-predicate groups #{group} %)) prefiltered-people))]
      (dom/div {:class "groups-filter-wrapper"}
        (when (> (count sorted-groups) 0)
          (dom/div {:class "groups-filter filter-section"}
            (om/build filter-section-label-component {:key       :groups
                                                      :active?   (> (count selected-groups) 0)
                                                      :expanded? expanded?
                                                      :label     "groups"})
            (dom/div {:class (str "filter-section-body" (when expanded? " expanded"))}
              (for [group sorted-groups]
                (let [report (get-in groups-tally [:tally group])
                      selected? (contains? selected-groups group)
                      empty? (when-not selected? (people-filtered-out? group))]
                  (om/build groups-filter-item-component {:group     group
                                                          :selected? selected?
                                                          :empty?    empty?
                                                          :report    report}))))))))))
(defcomponent countries-filter-component [data _ _]
  (render [_]
    (let [people (get-in data [:content :people])
          expanded-filters (get-in data [:ui :filters :expanded-set])
          expanded? (contains? expanded-filters :countries)
          filter-path [:ui :filters :active :countries]
          selected-countries (get-in data filter-path)
          countries-tally (build-countries-tally people)
          sorted-countries (:countries-by-size countries-tally)
          prefiltered-people (filter-people-except :countries data)
          people-filtered-out? (fn [country-code] (every? #(not (countries-filter-predicate #{country-code} %)) prefiltered-people))]
      (dom/div {:class "countries-filter-wrapper"}
        (when (> (count sorted-countries) 1)
          (dom/div {:class "countries-filter filter-section"}
            (om/build filter-section-label-component {:key       :countries
                                                      :active?   (> (count selected-countries) 0)
                                                      :expanded? expanded?
                                                      :label     "countries"})
            (dom/div {:class (str "filter-section-body" (when expanded? " expanded"))}
              (for [country-code sorted-countries]
                (let [report (get-in countries-tally [:tally country-code])
                      selected? (contains? selected-countries country-code)
                      empty? (when-not selected? (people-filtered-out? country-code))]
                  (om/build countries-filter-item-component {:country-code country-code
                                                             :selected?    selected?
                                                             :empty?       empty?
                                                             :report       report}))))))))))
(defcomponent tags-filter-component [data _ _]
  (render [_]
    (let [people (get-in data [:content :people])
          expanded? (contains? (get-in data [:ui :filters :expanded-set]) :tags)
          tags-tally (build-tags-tally people)
          filter-path [:ui :filters :active :tags]
          selected-tags (get-in data filter-path)
          sorted-tags (:tags-by-size tags-tally)
          prefiltered-people (filter-people-except :tags data)
          people-filtered-out? (fn [tag] (every? #(not (tags-filter-predicate #{tag} %)) prefiltered-people))]
      (dom/div {:class "tags-filter-wrapper"}
        (when (> (count sorted-tags) 0)
          (dom/div {:class "tags-filter filter-section"}
            (om/build filter-section-label-component {:key       :tags
                                                      :active?   (> (count selected-tags) 0)
                                                      :expanded? expanded?
                                                      :label     "interests"})
            (dom/div {:class (str "filter-section-body" (when expanded? " expanded"))}
              (for [tag sorted-tags]
                (let [report (get-in tags-tally [:tally tag])
                      selected? (contains? selected-tags tag)
                      empty? (when-not selected? (people-filtered-out? tag))]
                  (om/build tags-filter-item-component {:tag       tag
                                                        :selected? selected?
                                                        :empty?    empty?
                                                        :report    report}))))))))))

(defcomponent socials-filter-component [data _ _]
  (render [_]
    (let [people (get-in data [:content :people])
          expanded? (contains? (get-in data [:ui :filters :expanded-set]) :socials)
          socials-tally (build-socials-tally people)
          filter-path [:ui :filters :active :socials]
          selected-socials (get-in data filter-path)
          sorted-socials (:socials-by-size socials-tally)
          prefiltered-people (filter-people-except :socials data)
          people-filtered-out? (fn [social] (every? #(not (socials-filter-predicate #{social} %)) prefiltered-people))]
      (dom/div {:class "socials-filter-wrapper"}
        (when (> (count sorted-socials) 0)
          (dom/div {:class "socials-filter filter-section"}
            (om/build filter-section-label-component {:key       :socials
                                                      :active?   (> (count selected-socials) 0)
                                                      :expanded? expanded?
                                                      :label     "social"})
            (dom/div {:class (str "filter-section-body" (when expanded? " expanded"))}
              (for [social sorted-socials]
                (let [report (get-in socials-tally [:tally social])
                      selected? (contains? selected-socials social)
                      empty? (when-not selected? (people-filtered-out? social))]
                  (om/build socials-filter-item-component {:social    social
                                                           :selected? selected?
                                                           :empty?    empty?
                                                           :report    report}))))))))))

(defcomponent filters-component [data _ _]
  (render [_]
    (dom/div {:class    "people-filters no-select"
              :on-click #(.stopPropagation %)}
      (om/build groups-filter-component data)
      (om/build countries-filter-component data)
      (om/build socials-filter-component data)
      (om/build tags-filter-component data))))

(extend-type js/NodeList
  ISeqable
  (-seq [nl] (array-seq nl 0)))

(defn lookup-person [people id]
  (first (filter #(= id (:id %)) people)))

(defn retrieve-card-layout [people filter-predicates card]
  (if-let [person-id (.getAttribute card "data-fbid")]
    (let [person (lookup-person people person-id)]
      [person-id
       {:left (.-offsetLeft card)
        :top  (.-offsetTop card)
        :z    (if (is-person-filtered? filter-predicates person) -200 -50)}])))

(defn retrieve-cards-layout [people filter-predicates cards]
  (apply hash-map (mapcat #(retrieve-card-layout people filter-predicates %) cards)))

(defn recompute-layout [node data]
  (let [cards (.-childNodes node)
        active-filters (get-in data [:ui :filters :active])
        filter-predicates (build-filter-predicates active-filters data)
        people (get-in data [:content :people])
        current-layout (get-in @app-state [:transient (:id data) :layout])
        layout (retrieve-cards-layout people filter-predicates cards)]
    (when-not (= (pr-str current-layout) (pr-str layout))
      (perform! :update-people-layout (:id data) layout))))

(def throttled-recompute-layout (throttle recompute-layout 200))

(defcomponent people-scaffold-component [data owner _]
  (did-mount [_]
    (let [node (om/get-node owner "desk")
          addResizeListener (aget js/window "addResizeListener")]
      (.call addResizeListener js/window node #(throttled-recompute-layout node data))))
  (did-update [_ _ _]
    (throttled-recompute-layout (om/get-node owner "desk") data))
  (render [_]
    (let [people (get-in data [:content :people])
          people-comparator #(compare (person/name %) (person/name %2))
          sorted-people (sort people-comparator people)
          active-filters (get-in data [:ui :filters :active])
          filter-predicates (build-filter-predicates active-filters data)
          sorted-people-with-filter-status (map (fn [person]
                                                  (hash-map
                                                    :person person
                                                    :filtered? (not (every? true? (map #(% person) filter-predicates)))))
                                             sorted-people)
          sorted-people-ordered-by-filter (sort-by :filtered? sorted-people-with-filter-status)]
      (dom/div {:class "people-desk people-scaffold clearfix"
                :ref   "desk"}
        (for [item sorted-people-ordered-by-filter]
          (let [person (:person item)
                person-id (:id person)
                data {:person    person
                      :extended? false
                      :filtered? false
                      :anim      0}]
            (om/build person-component data {:react-key person-id})))))))

(defcomponent people-layout-component [data _ _]
  (render [_]
    (let [{:keys [ui anims transient]} data
          extended-set (:extended-set ui)
          people (get-in data [:content :people])
          layout (get-in transient [:layout])
          active-filters (get-in ui [:filters :active])
          filter-predicates (build-filter-predicates active-filters data)]
      (dom/div {:class "people-desk people-layout clearfix"}
        (when layout
          (for [person people]
            (let [person-id (:id person)
                  data {:person    person
                        :layout    (get layout person-id)
                        :extended? (contains? extended-set person-id)
                        :filtered? (is-person-filtered? filter-predicates person)
                        :anim      (:person anims)}]
              (om/build person-component data {:react-key person-id}))))))))

(defcomponent people-component [data _ _]
  (render [_]
    (let [static-data (apply dissoc data [:transient :anims :cache])]
      (dom/div {:class "no-select"}
        (om/build filters-component static-data)
        (om/build people-layout-component data)
        (om/build people-scaffold-component static-data)))))
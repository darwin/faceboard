(ns faceboard.views.boards.people.gizmos.social
  (:require [om.core :as om]
            [om-tools.core :refer-macros [defcomponent]]
            [om-tools.dom :as dom]
            [faceboard.helpers.person :as person]
            [faceboard.helpers.social :refer [social-info known-services]]
            [faceboard.helpers.gizmos :refer [handler gizmo-form-key-down]]
            [faceboard.logging :refer [log log-err log-warn log-info]]
            [phalanges.core :as phalanges]
            [cuerdas.core :as str]))

(def list-separator "---")
(def web-link-id "a web link")
(def socials-path [:social])

(defn commit-socials-change [person value]
  (om/update! person socials-path value))

(defn insert-social [social socials]
  (concat socials [social]))

(defn add-social [owner name socials committer]
  (let [node (om/get-node owner name)
        value (str/trim (str (.-value node)))]
    (when-not (= value list-separator)
      (let [suitable-value (if (= value web-link-id) "" (str value "|"))]
        (swap! socials (partial insert-social suitable-value))
        (committer)))))

(defn remove-social [social socials committer]
  (swap! socials (fn [old-socials] (remove #(= social %) old-socials)))
  (committer))

(defn reassembly [social value]
  (let [info (social-info social)]
    (str (:type info) "|" value)))

(defn update-social [state socials committer e]
  (let [value (.. e -target -value)
        social @state]
    (swap! socials (fn [old-socials] (doall
                                       (map #(if (= social %)
                                              (reset! state (reassembly % value)) ; TODO: find a better solution
                                              %)
                                         old-socials))))
    (committer)))

(defn clear-all-socials [socials committer]
  (reset! socials [])
  (committer))

(defcomponent social-item-component [data _]
  (render [_]
    (let [{:keys [social socials committer]} data
          info (social-info social)
          state (atom social)
          {:keys [icon url]} info]
      (dom/div {:class "social-item"}
        (dom/i {:class (str "icon fa " icon)})
        (dom/input {:type        "text"
                    :value       url
                    :placeholder "user profile url"
                    :on-change   (partial update-social state socials committer)})
        (dom/button {:class    "remove-action"
                     :on-click (partial remove-social social socials committer)}
          "-")))))

(defn full-list []
  (concat
    [web-link-id list-separator] (sort known-services)))

(defcomponent social-gizmo-component [data owner]
  (did-mount [_]
    (let [focus-node (om/get-node owner "focus")]
      (.focus focus-node)))
  (render [_]
    (let [{:keys [person]} data
          socials (person/socials person)
          live-socials (atom socials)                       ; contains latest local state, commit may be deferred for a while
          committer (handler (partial commit-socials-change person) 1000 live-socials)
          add-tag-fn (partial add-social owner "focus" live-socials committer)
          clear-all-fn (partial clear-all-socials live-socials committer)]
      (dom/form {:class       "social-gizmo"
                 :on-key-down gizmo-form-key-down
                 :on-submit   (fn [e] (.preventDefault e))}
        (dom/div {:class "social-list clearfix no-dismiss"}
          (if (zero? (count socials))
            (dom/div {:class "no-socials-avail"} "Add some links below...")
            (for [social socials]
              (om/build social-item-component {:social    social
                                               :socials   live-socials
                                               :committer committer}))))
        (dom/div {:class "add-input"}
          (dom/label "Add link:"
            (dom/select {:ref "focus"}
              (for [id (full-list)]
                (dom/option {:value id} id)))
            (dom/button {:class    "add-tag-action"
                         :on-click add-tag-fn}
              "↵")
            (dom/button {:class    "clear-all-action"
                         :on-click clear-all-fn}
              "clear all")))))))
(ns faceboard.helpers.social
  (:require [clojure.string :as string]))

(defn parse-social [data]
  (let [parts (string/split data #"\|" 2)]
    (cond
      (< (count parts) 1) [nil data]
      (< (count parts) 2) [nil (first parts)]
      :else parts)))

(defn social->url [item]
  (let [id (second item)]
    (condp = (first item)
      "twitter" (str "http://twitter.com/" id)
      id)))

(defn social->icon [item]
  (condp = (first item)
    "twitter" "fa-twitter-square"
    "github" "fa-github-square"
    "facebook" "fa-facebook-square"
    "fa-external-link-square"))

(defn social-info [data]
  (let [item (parse-social data)]
    {:type (first item)
     :content (second item)
     :url  (social->url item)
     :icon (social->icon item)}))
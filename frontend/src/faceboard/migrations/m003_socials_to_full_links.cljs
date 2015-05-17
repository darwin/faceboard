(ns faceboard.migrations.m003-socials-to-full-links
  (:require-macros [faceboard.macros.logging :refer [log log-err log-warn log-info]])
  (:require [cuerdas.core :as str]))

(defn- parse-social [data]
  (let [parts (str/split data #"\|" 2)]
    (cond
      (< (count parts) 1) [nil data]
      (< (count parts) 2) [nil (first parts)]
      :else [(str/lower (first parts)) (str/lower (second parts))])))

(defn build-known-url [type id]
  (condp #(str/starts-with? %2 %1) type                     ; recognized urls from id
    "facebook" (str "https://www.facebook.com/" id)
    "twitter" (str "https://twitter.com/" id)
    "github" (str "https://github.com/" id)
    "linkedin" (str "https://www.linkedin.com/in/" id)
    "flickr" (str "https://www.flickr.com/people/" id)
    "lastfm" (str "http://www.last.fm/user/" id)
    "hacker-news" (str "https://news.ycombinator.com/user?id=" id)
    "reddit" (str "http://www.reddit.com/user/" id)
    "instagram" (str "https://instagram.com/" id)
    nil))

(defn- convert-parts [[type id]]
  (or (build-known-url type id) id))

(defn- convert-social [social]
  (let [parts (parse-social social)]
    (if (first parts)
      (convert-parts parts)
      (second parts))))

(defn- convert-socials [socials]
  (map convert-social socials))

(defn- convert-socials-in-person [person]
  (if-let [socials (:social person)]
    (assoc person :social (convert-socials socials))
    person))

(defn- convert-socials-in-people [people]
  (map convert-socials-in-person people))

(defn- convert-socials-in-content [content]
  (assoc content :people (convert-socials-in-people (:people content))))

(defn- convert-socials-in-tab [tab]
  (if (= (:kind tab) "people")
    (assoc tab :content (convert-socials-in-content (:content tab)))
    tab))

(defn convert-socials-to-links [model]
  (assoc model :tabs (map convert-socials-in-tab (:tabs model))))
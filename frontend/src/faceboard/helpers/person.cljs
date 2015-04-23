(ns faceboard.helpers.person
  (:refer-clojure :exclude [name])
  (:require [faceboard.helpers.utils :refer [rng first-word]]
            [faceboard.helpers.countries :refer [lookup-country-name]]
            [cuerdas.core :as str]))

(def name-placeholder "John")
(def full-name-placeholder "John Doe")
(def about-placeholder "Tell us something about yourself in a few sentences.")
(def phone-placeholder nil)
(def photo-url-placeholder "http://some.server.com/photo.jpg")
(def email-placeholder "you@somewhere.com")
(def tags-placeholder ["movies" "internet" "yoga" "running"])
(def socials-placeholder ["facebook|some-facebook-user-id"
                          "twitter|some-twitter-handle"
                          "skype|some-skype-id"
                          "instagram|some-instagram-user-id"
                          "http://www.yourweb.com"])

(defn sanitize [v]
  (let [sv (str/trim (str v))]
    (if (empty? sv) nil sv)))

(defn name [person]
  (let [nickname (sanitize (get-in person [:bio :nickname]))
        name (sanitize (get-in person [:bio :name]))]
    (str/trim (first-word (or nickname name)))))

(defn full-name [person]
  (or
    (sanitize (get-in person [:bio :full-name]))
    (sanitize (get-in person [:bio :name]))
    (sanitize (get-in person [:bio :nickname]))))

(defn photo-url [person]
  (or (get-in person [:bio :photo :url] nil) "/images/unknown.jpg"))

(defn photo-has-frame? [person]
  (not (get-in person [:bio :photo :no-frame])))

(defn photo-angle [person]
  (or
    (get-in person [:bio :photo :angle])
    (rng (hash (get-in person [:bio :name])) -10 10)))      ; +/- 10deg based on name

(defn photo-displace-x [person]
  (or
    (get-in person [:bio :photo :displace :x])
    (rng (hash (get-in person [:bio :name])) 1 -10 10)))    ; +/- 10px based on name

(defn photo-displace-y [person]
  (or
    (get-in person [:bio :photo :displace :y])
    (rng (hash (get-in person [:bio :name])) 2 -10 10)))    ; +/- 10px based on name

(defn photo-displace-z [person]
  (or (get-in person [:bio :photo :displace :z]) 0))        ; 0px unless requested by data

(defn country-code [person]
  (sanitize (get-in person [:bio :country])))

(defn country-name [person]
  (lookup-country-name (country-code person)))

(defn email [person]
  (sanitize (get-in person [:bio :email])))

(defn phone [person]
  (sanitize (get-in person [:bio :phone])))

(defn about [person]
  (sanitize (get-in person [:bio :about])))

(defn tags [person]
  (let [source (get-in person [:tags] [])
        sanitized-list (map #(sanitize (str/lower %)) source)]
    (distinct (remove nil? sanitized-list))))

(defn socials [person]
  (let [source (get-in person [:social] [])
        sanitized-list (map #(sanitize (str/lower %)) source)]
    (distinct (remove nil? sanitized-list))))

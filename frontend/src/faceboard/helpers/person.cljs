(ns faceboard.helpers.person
  (:refer-clojure :exclude [name])
  (:require [faceboard.helpers.utils :refer [rng first-word]]
            [faceboard.helpers.countries :refer [lookup-country-name]]))

(defn name [person]
  (first-word (str (get-in person [:bio :name]))))

(defn full-name [person]
  (str (or
         (get-in person [:bio :full-name])
         (get-in person [:bio :name]))))

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
  (get-in person [:bio :country]))

(defn country-name [person]
  (lookup-country-name (country-code person)))
(ns faceboard.helpers.person
  (:refer-clojure :exclude [name])
  (:require [cuerdas.core :as str]
            [cemerick.pprng :as pprng]
            [faceboard.helpers.countries :refer [lookup-country-name]]))

(defn- first-word [string]
  (let [parts (str/split (str/trim string) #" " 2)]
    (first parts)))

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
  (let [random-generator (pprng/rng (hash (get-in person [:bio :name])))]
    (or
      (get-in person [:bio :photo :angle])
      (- (pprng/int random-generator 20) 10))))  ; +/- 10deg based on name

(defn country-code [person]
  (get-in person [:bio :country]))

(defn country-name [person]
  (lookup-country-name (country-code person)))
(ns faceboard.lib.helpers
  (:require
    [garden.compiler :refer [CSSRenderer render-css]]
    [garden.def :refer [defstylesheet defstyles defcssfn]]
    [garden.units :as units]))

; garden is nice but this makes it beautiful

(defn symbol-vector? [item]
  (when (vector? item)
    (every? #(or (symbol? %) (string? %)) item)))

(defn produce-class [x]
  (if (keyword? x)
    (name x)
    (let [sx (str x)]
      (if (or (< (count sx) 3) (= (first sx) \&))
        sx
        (str "." sx)))))

(defn produce-class-from-vector [v]
  (apply str (interpose " " (map #(produce-class %) v))))

; see https://github.com/noprompt/garden/issues/72#issuecomment-76331495
; this will break CSS declaration vectors into series of 1-declaration maps while preserving their order
; {:b 1 :a 2} => [{:b 1} {:a 2}]
(defn make-maps [m]
  (map #(apply hash-map %) (partition 2 m)))

; a convenience macro for our CSS declarations to be more DRY
(defmacro >> [& args]
  (let [transformer (fn [item]
                      (cond
                        (keyword? item) [(produce-class item)]
                        (symbol? item) [(produce-class item)]
                        (symbol-vector? item) [(produce-class-from-vector item)]
                        (vector? item) (make-maps item)
                        :else [item]))]
    (vec (mapcat transformer args))))

(deftype MultiCSSValue [args]
  CSSRenderer
  (render-css [this] (apply str (interpose " " (map render-css args)))))

; a workaround to render multiple values in CSS declarations
; (mv (px 0) (px 10)) => "0px 10px"
(defn mv [& args]
  (MultiCSSValue. args))

; (px 1 2 3 4) => (mv (px 1) (px 2) (px 3) (px 4))
(defmacro px [& args]
  (let [items (map #(if (number? %) (list units/px %) %) args)]
    `(mv ~@items)))

(defn ms [v]
  (format "%.3fs" (/ (float v) 1000)))

(ns faceboard.macros.utils)

(defmacro ...
  ([x form] `(when ~x (. ~x ~form)))
  ([x form & more] `(when ~x (... (. ~x ~form) ~@more))))

(defmacro profile [label & body]
  `(let [a# (.profile js/console ~label)
         result# (do ~@body)
         b# (.profileEnd js/console)]
     result#))

(defmacro measure [label & body]
  `(let [a# (.time js/console ~label)
         result# (do ~@body)
         b# (.timeEnd js/console ~label)]
     result#))
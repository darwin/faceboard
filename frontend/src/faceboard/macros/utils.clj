(ns faceboard.macros.utils)

(defmacro ...
  ([x form] `(when ~x (. ~x ~form)))
  ([x form & more] `(when ~x (... (. ~x ~form) ~@more))))